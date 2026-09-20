import type { Catalog, Content, EshopProductLink, Product } from './types';
import {
  eshopLinkMatchesQuery,
  legacyProductMatchesQuery,
  parseSearchQuery,
} from './catalog-search';

const CATEGORY_FROM_URL: Record<string, string> = {
  sofa: '梳化',
  wardrobe: '衣櫃',
  'study-desk': '書枱',
  'storage-cabinet': '收納櫃',
  'bed-frame': '床架',
  'dining-table': '餐枱',
  mattress: '床褥',
  chair: '椅子',
};

function categoryFromEshopUrl(url: string) {
  const match = url.match(/\/products\/furniture\/([^/]+)\//i);
  return CATEGORY_FROM_URL[match?.[1] ?? ''] ?? '';
}

function cleanProductTitle(title: string) {
  const withoutSite = title.split('|')[0].trim();
  const parts = withoutSite.split(/\s[-–—]\s/);
  let main = parts[0].trim();
  const variant = parts[1]?.trim();

  const stripDimensions = (value: string) =>
    value
      .replace(/\d+W\s*x\s*[\d./]+D(?:\s*x\s*[\d-]+Hmm)?/gi, '')
      .replace(/\d+wx\d+D(?:x[\d-]+Hmm)?/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*-\s*$/, '')
      .trim();

  main = stripDimensions(main);
  const cleanedVariant = variant ? stripDimensions(variant) : '';

  if (cleanedVariant) return `${main} · ${cleanedVariant}`;
  return main;
}

function isGenericBrand(brand: string) {
  return !brand || /^pricerite$/i.test(brand);
}

export function formatEshopProductLabel(link: EshopProductLink): string {
  const title = link.title?.trim() || '';
  const brand = link.brand?.trim() || '';
  const category = categoryFromEshopUrl(link.url);

  if (title) {
    const cleaned = cleanProductTitle(title);
    const normalizedTitle = title.toLocaleLowerCase('zh-HK');
    const normalizedBrand = brand.toLocaleLowerCase('zh-HK');

    if (
      title.length <= 6 &&
      category &&
      !normalizedTitle.includes(category.toLocaleLowerCase('zh-HK'))
    ) {
      return brand && !isGenericBrand(brand) ? `${brand} ${category}` : category;
    }

    if (
      !isGenericBrand(brand) &&
      !normalizedTitle.includes(normalizedBrand) &&
      category &&
      !normalizedTitle.includes(category.toLocaleLowerCase('zh-HK'))
    ) {
      return `${brand} ${cleaned}`;
    }

    return cleaned;
  }

  if (brand && category) return `${brand} ${category}`;
  if (category) return category;
  return brand;
}

export function formatLegacyProductLabel(product: Product): string {
  const name = product.name?.trim() || '';
  const colour = product.colour?.trim() || '';
  const style = product.style?.trim() || '';
  const brand = product.brand?.trim() || '';

  const parts = [name || undefined];
  if (colour) parts.push(colour);
  else if (style) parts.push(style);
  else if (brand && !isGenericBrand(brand) && name && !name.includes(brand)) parts.push(brand);

  return parts.filter(Boolean).join(' · ');
}

function linkedProductLabels(
  data: Catalog,
  content: Content,
  resolveLink: (link: EshopProductLink) => EshopProductLink = (link) => link,
  query = '',
) {
  const parsed = parseSearchQuery(query);
  const filter = !!query.trim() && parsed.terms.length > 0;
  const labels: string[] = [];

  for (const link of content.eshopProducts ?? []) {
    const resolved = resolveLink(link);
    if (filter && !eshopLinkMatchesQuery(resolved, parsed)) continue;
    labels.push(formatEshopProductLabel(resolved));
  }
  for (const product of data.products.filter((item) => content.productIds.includes(item.id))) {
    if (filter && !legacyProductMatchesQuery(product, parsed)) continue;
    labels.push(formatLegacyProductLabel(product));
  }
  return [...new Set(labels.map((label) => label.trim()).filter(Boolean))];
}

export function contentLinkedProductLabels(data: Catalog, content: Content): string[] {
  return linkedProductLabels(data, content);
}

export function contentLinkedProductLabelsForQuery(
  data: Catalog,
  content: Content,
  query: string,
  resolveLink?: (link: EshopProductLink) => EshopProductLink,
): string[] {
  return linkedProductLabels(data, content, resolveLink, query);
}

export function filterSearchMatchReasons(
  reasons: { label: string; value: string }[],
  productLabels: string[],
) {
  if (!productLabels.length) return reasons;
  return reasons.filter((reason) => {
    if (reason.label === '品牌') return false;
    if (reason.label === 'eShop 產品' && productLabels.some((label) => label.includes(reason.value))) {
      return false;
    }
    return true;
  });
}
