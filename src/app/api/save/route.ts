import {
  readCatalog,
  saveEntry,
  deleteEntry,
  assertSameOrigin,
  failure,
  json,
  readJsonBody,
  HttpError,
} from '@/lib/server';
import { requireCmsAccess } from '@/lib/cms-access';
import { schemas } from '@/lib/validation';
import { descendants, trail, folderDeleteBlockers, folderDeletionPlan } from '@/lib/catalog';
import type { Catalog, Entity } from '@/lib/types';
import { catalogItemExists, catalogItemName, incomingItemName } from '@/lib/user-activity';
import { recordUserActivity } from '@/lib/user-activity-repository';

async function recordChange(
  email: string,
  data: Catalog,
  entity: Entity,
  id: string,
  action: 'create' | 'update' | 'delete',
  targetName?: string,
) {
  try {
    await recordUserActivity({
      email,
      action,
      entity,
      targetId: id,
      targetName: targetName || catalogItemName(data, entity, id),
    });
  } catch {
    // Catalog saves stay successful when the activity table is not ready yet.
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await requireCmsAccess();
    const body = await readJsonBody<{
      action?: string;
      entity?: Entity;
      id?: string;
      payload?: unknown;
      originFolder?: string;
      expectedVersion?: string;
      cascade?: boolean;
    }>(request);

    if (body.action === 'delete') {
      const entity = body.entity as Entity;
      const id = String(body.id || '');
      if (!Object.hasOwn(schemas, entity)) throw new HttpError(400, '不支援的資料類型。');
      const data = await readCatalog();
      if (entity === 'folder') {
        const folder = data.folders.find((f) => f.id === id);
        if (!folder) throw new HttpError(404, '找不到此資料夾。');
        const blockers = folderDeleteBlockers(data, id);
        if (blockers.length && !body.cascade)
          throw new HttpError(400, `無法刪除：${blockers.join('、')}。請先清空後再試。`);
        if (body.cascade) {
          const plan = folderDeletionPlan(data, id);
          for (const contentId of plan.contentIds) {
            const targetName = catalogItemName(data, 'content', contentId);
            await deleteEntry('content', contentId);
            await recordChange(session.email, data, 'content', contentId, 'delete', targetName);
          }
          for (const sceneId of plan.sceneIds) {
            const targetName = catalogItemName(data, 'scene', sceneId);
            await deleteEntry('scene', sceneId);
            await recordChange(session.email, data, 'scene', sceneId, 'delete', targetName);
          }
          for (const folderId of plan.folderIds) {
            const targetName = catalogItemName(data, 'folder', folderId);
            await deleteEntry('folder', folderId);
            await recordChange(session.email, data, 'folder', folderId, 'delete', targetName);
          }
          return json({ ok: true });
        }
      }
      const targetName = catalogItemName(data, entity, id);
      await deleteEntry(entity, id);
      await recordChange(session.email, data, entity, id, 'delete', targetName);
      return json({ ok: true });
    }

    const { entity, payload, originFolder, expectedVersion } = body;
    if (!entity || !Object.hasOwn(schemas, entity)) throw new HttpError(400, '不支援的資料類型。');
    const parsed = schemas[entity].safeParse(payload);
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues.map((i) => i.message).join('；'));
    const data = await readCatalog();
    const value = parsed.data;
    if (entity === 'content' && 'folderId' in value) {
      if (!originFolder || !descendants(data.folders, originFolder).has(value.folderId))
        throw new HttpError(400, '只可上載至目前或下層資料夾。');
      const current = data.contents.find((c) => c.id === value.id);
      if (current && originFolder && !descendants(data.folders, originFolder).has(current.folderId))
        throw new HttpError(400, '請先進入內容所屬的目錄。');
      if (value.productIds.some((id) => !data.products.some((p) => p.id === id)))
        throw new HttpError(400, '相關產品不存在。');
      if (
        value.type === 'image' &&
        !value.salesKit &&
        (current?.salesKit ||
          (!current && trail(data.folders, value.folderId).some((f) => f.id === 'housing')))
      )
        throw new HttpError(400, '請使用 Sales Kit 標準上載格式。');
      value.updatedAt = new Date().toISOString();
    }
    if (entity === 'folder' && 'parentId' in value) {
      const existing = data.folders.find((f) => f.id === value.id);
      if (value.parentId) {
        if (!data.folders.some((f) => f.id === value.parentId))
          throw new HttpError(400, '上層資料夾不存在。');
        if (value.parentId === value.id) throw new HttpError(400, '資料夾不能成為自己的上層。');
        if (descendants(data.folders, value.id).has(value.parentId))
          throw new HttpError(400, '資料夾層級無效。');
        if (trail(data.folders, value.parentId).length >= 12)
          throw new HttpError(400, '資料夾層級過深。');
      } else {
        if (existing && existing.parentId) throw new HttpError(400, '不可將子目錄改為主目錄。');
        if (
          data.folders.some(
            (f) => !f.parentId && f.name === value.name && f.id !== value.id,
          )
        )
          throw new HttpError(400, '主目錄名稱已存在。');
      }
    }
    const existed = catalogItemExists(data, entity, value.id);
    await saveEntry(entity, value, expectedVersion);
    await recordChange(
      session.email,
      data,
      entity,
      value.id,
      existed ? 'update' : 'create',
      incomingItemName(entity, value),
    );
    return json({ ok: true, value });
  } catch (e) {
    return failure(e);
  }
}
