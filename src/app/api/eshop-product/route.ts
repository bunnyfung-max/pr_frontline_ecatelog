import { failure, HttpError, json, requireSession } from '@/lib/server';
import { requireCmsAccess } from '@/lib/cms-access';
import { fetchPriceriteProduct, formatHkd } from '@/lib/pricerite-eshop';
import { isPriceriteProductUrl, normalizePriceriteProductUrl } from '@/lib/pricerite-eshop-url';

export async function GET(request: Request) {
  try {
    await requireSession();
    const query = new URL(request.url).searchParams;
    const rawUrls = [...query.getAll('url'), ...(query.get('urls')?.split(',') ?? [])]
      .map((value) => value.trim())
      .filter(Boolean);
    if (!rawUrls.length) throw new HttpError(400, '請提供產品連結。');
    if (rawUrls.length > 20) throw new HttpError(400, '每次最多查詢 20 個產品連結。');
    for (const value of rawUrls) {
      if (!isPriceriteProductUrl(value))
        throw new HttpError(400, '只接受 Pricerite eShop 產品 HTTPS 連結。');
    }

    const snapshots = await Promise.all(
      rawUrls.map(async (value) => {
        const snapshot = await fetchPriceriteProduct(value);
        const price = snapshot.specialPrice ?? snapshot.basePrice;
        return {
          ...snapshot,
          price,
          priceLabel: formatHkd(price),
          basePriceLabel: formatHkd(snapshot.basePrice),
          specialPriceLabel: formatHkd(snapshot.specialPrice),
        };
      }),
    );

    return json({ products: snapshots });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireCmsAccess();
    const body = (await request.json()) as { url?: string };
    if (!body.url?.trim()) throw new HttpError(400, '請提供產品連結。');
    const url = normalizePriceriteProductUrl(body.url.trim());
    const snapshot = await fetchPriceriteProduct(url);
    if (!snapshot.available || !snapshot.title)
      throw new HttpError(404, '找不到此產品，可能已下架或連結不正確。');
    return json({
      url: snapshot.url,
      title: snapshot.title,
      brand: snapshot.brand,
      sku: snapshot.sku,
      description: snapshot.description,
      image: snapshot.image,
      fetchedAt: new Date().toISOString(),
      price: snapshot.specialPrice ?? snapshot.basePrice,
      priceLabel: formatHkd(snapshot.specialPrice ?? snapshot.basePrice),
    });
  } catch (error) {
    return failure(error);
  }
}
