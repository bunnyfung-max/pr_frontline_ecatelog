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
import { descendants, trail, folderDeleteBlockers } from '@/lib/catalog';
import type { Entity } from '@/lib/types';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireCmsAccess();
    const body = await readJsonBody<{
      action?: string;
      entity?: Entity;
      id?: string;
      payload?: unknown;
      originFolder?: string;
      expectedVersion?: string;
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
        if (blockers.length)
          throw new HttpError(400, `無法刪除：${blockers.join('、')}。請先清空後再試。`);
      }
      await deleteEntry(entity, id);
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
    await saveEntry(entity, value, expectedVersion);
    return json({ ok: true, value });
  } catch (e) {
    return failure(e);
  }
}
