import { failure, HttpError, json, readJsonBody } from '@/lib/server';
import { requireCmsAccess } from '@/lib/cms-access';
import { MAX_BULK_ESHOP_IMPORT } from '@/lib/eshop-product-limits';
import { loadEshopProductSnapshot, toEshopProductLink } from '@/lib/eshop-product-snapshot';
import { isPriceriteProductUrl, normalizePriceriteProductUrl } from '@/lib/pricerite-eshop-url';

const IMPORT_CONCURRENCY = 4;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index], index);
      }
    }),
  );
  return results;
}

export async function POST(request: Request) {
  try {
    await requireCmsAccess();
    const body = await readJsonBody<{ urls?: string[] }>(request);
    const rawUrls = body.urls?.map((value) => value.trim()).filter(Boolean) ?? [];
    if (!rawUrls.length) throw new HttpError(400, '請提供產品連結。');
    if (rawUrls.length > MAX_BULK_ESHOP_IMPORT) {
      throw new HttpError(400, `每次最多批量加入 ${MAX_BULK_ESHOP_IMPORT} 個連結。`);
    }

    const results = await mapWithConcurrency(rawUrls, IMPORT_CONCURRENCY, async (raw) => {
      if (!isPriceriteProductUrl(raw)) {
        return { ok: false as const, url: raw, message: '只接受 Pricerite eShop 產品 HTTPS 連結。' };
      }
      let url = raw;
      try {
        url = normalizePriceriteProductUrl(raw);
      } catch {
        return { ok: false as const, url: raw, message: '只接受 Pricerite eShop 產品 HTTPS 連結。' };
      }
      const snapshot = await loadEshopProductSnapshot(url, true);
      if (!snapshot.available || !snapshot.title) {
        return {
          ok: false as const,
          url,
          message: '找不到此產品，可能已下架或連結不正確。',
        };
      }
      return { ok: true as const, product: toEshopProductLink(snapshot) };
    });

    const products = results.filter((item) => item.ok).map((item) => item.product!);
    const errors = results
      .filter((item) => !item.ok)
      .map((item) => ({ url: item.url!, message: item.message! }));

    return json({ products, errors });
  } catch (error) {
    return failure(error);
  }
}
