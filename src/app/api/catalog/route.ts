import { requireSession, readCatalog, failure, json } from '@/lib/server';
import { publicCatalog, searchCatalog } from '@/lib/catalog';
export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams;
    const admin = query.get('cms') === '1';
    await requireSession(admin);
    const raw = await readCatalog();
    const data = admin ? raw : publicCatalog(raw);
    if (query.has('q'))
      return json(searchCatalog(data, query.get('folder'), query.get('q') || '', admin));
    return json(data);
  } catch (e) {
    return failure(e);
  }
}
