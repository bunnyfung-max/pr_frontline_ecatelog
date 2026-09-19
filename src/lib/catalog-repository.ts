import 'server-only';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Catalog, Entity } from './types';
import { initialCatalog } from './seed';
import { HttpError } from './http-error';

const collection: Record<Entity, keyof Catalog> = {
  folder: 'folders',
  content: 'contents',
  product: 'products',
  scene: 'scenes',
  offer: 'offers',
  settings: 'settings',
};

export interface CatalogRepository {
  read(): Promise<Catalog>;
  save(entity: Entity, payload: { id: string }, expectedVersion?: string): Promise<void>;
  delete(entity: Entity, id: string): Promise<void>;
}

export function dataDirectory() {
  return path.join(process.cwd(), '.data');
}

async function writeLocal(data: Catalog) {
  await mkdir(dataDirectory(), { recursive: true });
  const temp = path.join(dataDirectory(), `catalog-${randomUUID()}.tmp`);
  await writeFile(temp, JSON.stringify(data, null, 2), 'utf8');
  await rename(temp, path.join(dataDirectory(), 'catalog.json'));
}

async function readLocal(): Promise<Catalog> {
  try {
    return JSON.parse(await readFile(path.join(dataDirectory(), 'catalog.json'), 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return initialCatalog(true);
  }
}

export function createLocalCatalogRepository(): CatalogRepository {
  let queue: Promise<unknown> = Promise.resolve();
  const run = <T>(action: () => Promise<T>) => {
    const next = queue.then(action);
    queue = next.catch(() => undefined);
    return next;
  };
  return {
    read: readLocal,
    async delete(entity, id) {
      if (entity === 'settings') throw new HttpError(400, '不可刪除此設定。');
      await run(async () => {
        const data = await readLocal();
        const key = collection[entity];
        const list = data[key] as { id: string }[];
        const index = list.findIndex((row) => row.id === id);
        if (index < 0) throw new HttpError(404, '找不到項目。');
        list.splice(index, 1);
        await writeLocal(data);
      });
    },
    async save(entity, payload, expectedVersion) {
      await run(async () => {
        const data = await readLocal();
        const key = collection[entity];
        if (key === 'settings') data.settings = payload as Catalog['settings'];
        else {
          const list = data[key] as { id: string; updatedAt?: string }[];
          const index = list.findIndex((row) => row.id === payload.id);
          if (entity === 'content' && index >= 0 && list[index].updatedAt !== expectedVersion)
            throw new HttpError(409, '內容已被更新，請重新載入後再修改。');
          if (index >= 0) list[index] = payload;
          else list.push(payload);
        }
        await writeLocal(data);
      });
    },
  };
}

export function createSupabaseCatalogRepository(sb: SupabaseClient): CatalogRepository {
  return {
    async read() {
      const data: Catalog = {
        folders: [],
        contents: [],
        products: [],
        scenes: [],
        offers: [],
        settings: { id: 'store', label: '前往自在購', url: '' },
      };
      for (let from = 0; ; from += 500) {
        const { data: rows, error } = await sb
          .from('catalog_entries')
          .select('entity,payload')
          .order('id')
          .range(from, from + 499);
        if (error) throw new HttpError(503, '資料庫尚未就緒，請確認 migration 及存取權限。');
        for (const row of rows) {
          const key = collection[row.entity as Entity];
          if (key === 'settings') data.settings = row.payload;
          else if (key) (data[key] as unknown[]).push(row.payload);
        }
        if (rows.length < 500) break;
      }
      return data;
    },
    async delete(entity, id) {
      if (entity === 'settings') throw new HttpError(400, '不可刪除此設定。');
      const { error } = await sb.from('catalog_entries').delete().eq('entity', entity).eq('id', id);
      if (error) throw new HttpError(500, '刪除失敗，請稍後重試。');
    },
    async save(entity, payload, expectedVersion) {
      const row = { id: payload.id, entity, payload };
      if (entity === 'content' && expectedVersion) {
        const { data, error } = await sb
          .from('catalog_entries')
          .update(row)
          .eq('id', payload.id)
          .eq('entity', entity)
          .eq('payload->>updatedAt', expectedVersion)
          .select('id');
        if (error) throw new HttpError(500, '儲存失敗，請稍後重試。');
        if (!data?.length) throw new HttpError(409, '內容已被更新，請重新載入後再修改。');
      } else {
        const query =
          entity === 'content'
            ? sb.from('catalog_entries').insert(row)
            : sb.from('catalog_entries').upsert(row, { onConflict: 'entity,id' });
        const { error } = await query;
        if (error) throw new HttpError(500, '儲存失敗，請稍後重試。');
      }
    },
  };
}

let localRepository: CatalogRepository | null = null;

export function getCatalogRepository(demo: boolean, sb?: SupabaseClient): CatalogRepository {
  if (demo) {
    if (!localRepository) localRepository = createLocalCatalogRepository();
    return localRepository;
  }
  if (!sb) throw new HttpError(503, '尚未設定 Supabase，請參閱部署指南。');
  return createSupabaseCatalogRepository(sb);
}
