import {
  requireSession,
  readCatalog,
  saveEntry,
  assertSameOrigin,
  failure,
  json,
  HttpError,
} from '@/lib/server';
import { schemas } from '@/lib/validation';
import { descendants, trail } from '@/lib/catalog';
import { ROOTS, type Entity } from '@/lib/types';
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireSession(true);
    const { entity, payload, originFolder, expectedVersion } = await request.json();
    if (!Object.hasOwn(schemas, entity)) throw new HttpError(400, '不支援的資料類型。');
    const parsed = schemas[entity as Entity].safeParse(payload);
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues.map((i) => i.message).join('；'));
    const data = await readCatalog();
    const value = parsed.data;
    if (entity === 'content' && 'folderId' in value) {
      if (!descendants(data.folders, originFolder).has(value.folderId))
        throw new HttpError(400, '只可上載至目前或下層資料夾。');
      const current = data.contents.find((c) => c.id === value.id);
      if (current && !descendants(data.folders, originFolder).has(current.folderId))
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
      if (
        (ROOTS as readonly string[]).includes(value.id) ||
        !value.parentId ||
        !data.folders.some((f) => f.id === value.parentId)
      )
        throw new HttpError(400, '五個主目錄不可更改，只可新增或編輯子目錄。');
      if (
        descendants(data.folders, value.id).has(value.parentId) ||
        trail(data.folders, value.parentId).length >= 12
      )
        throw new HttpError(400, '資料夾層級無效或過深。');
    }
    await saveEntry(entity, value, expectedVersion);
    return json({ ok: true, value });
  } catch (e) {
    return failure(e);
  }
}
