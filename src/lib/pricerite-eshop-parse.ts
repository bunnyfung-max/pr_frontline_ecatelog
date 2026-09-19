export interface EshopProductSnapshot {
  url: string;
  title: string;
  brand: string;
  sku: string;
  description: string;
  image: string;
  basePrice: number | null;
  specialPrice: number | null;
  available: boolean;
}

type ProductNode = {
  slug?: string;
  brandName?: string;
  description?: string;
  meta?: { title?: string };
  prices?: {
    baseprice?: number;
    specialprice?: number;
    discounted?: boolean;
  };
  productTitleContainer?: { title?: string };
};

function skuFromSlug(slug?: string): string {
  if (!slug) return '';
  const match = slug.match(/(\d{4,})/);
  return match?.[1] || slug.replace(/hk$/i, '');
}

function skuFromUrl(url: string): string {
  const segment = new URL(url).pathname.split('/').pop() || '';
  const match = segment.match(/(\d{4,})/);
  return match?.[1] || '';
}

function ogContent(html: string, property: string): string {
  const match = html.match(new RegExp(`property="${property}" content="([^"]+)"`, 'i'));
  return match?.[1] || '';
}

function findProductNode(node: unknown): ProductNode | null {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findProductNode(item);
      if (found) return found;
    }
    return null;
  }
  const obj = node as ProductNode;
  if (
    typeof obj.brandName === 'string' &&
    obj.meta &&
    typeof obj.meta.title === 'string' &&
    obj.prices &&
    typeof obj.prices === 'object'
  )
    return obj;
  for (const value of Object.values(node as Record<string, unknown>)) {
    const found = findProductNode(value);
    if (found) return found;
  }
  return null;
}

function priceValue(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function parsePriceriteProductHtml(html: string, url: string): EshopProductSnapshot {
  const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  let product: ProductNode | null = null;
  if (nextMatch) {
    try {
      product = findProductNode(JSON.parse(nextMatch[1]));
    } catch {
      product = null;
    }
  }

  const title =
    product?.productTitleContainer?.title ||
    product?.meta?.title?.replace(/\s*\|\s*Pricerite.*$/i, '').trim() ||
    ogContent(html, 'og:title').replace(/\s*\|\s*Pricerite.*$/i, '').trim();
  const brand = product?.brandName || '';
  const sku = skuFromSlug(product?.slug) || skuFromUrl(url);
  const description = (product?.description || '').replace(/\s+/g, ' ').trim();
  const image = ogContent(html, 'og:image');
  const basePrice = priceValue(product?.prices?.baseprice);
  const specialPrice = priceValue(product?.prices?.specialprice);
  const available = Boolean(title && (basePrice || specialPrice));

  return {
    url,
    title,
    brand,
    sku,
    description,
    image,
    basePrice,
    specialPrice,
    available,
  };
}
