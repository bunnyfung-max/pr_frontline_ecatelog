import type { Catalog, Content } from './types';

// Exact legacy labels only. A substring may be a room, estate, colour or style.
const LEGACY_PRODUCT_TAGS = new Set([
  '梳化', '沙發', '沙发', 'sofa', '書枱', '書桌', '电脑桌', '電腦桌',
  '衣櫃', '衣柜', '電視櫃', '电视柜', '餐枱', '餐桌', '茶几', '床',
  '床架', '床褥', '床墊', '床垫', '書櫃', '书柜', '鞋櫃', '鞋柜',
  '收納櫃', '收纳柜', '收納', '收纳', '餐椅', '椅子', '櫃', '柜',
  '雙人梳化', '示例橡木書枱',
]);
const key = (value: string) => value.normalize('NFKC').trim().toLocaleLowerCase();

/** Additive classification: old labels remain untouched and generally searchable. */
export function productTagsForContent(data: Catalog, content: Content): string[] {
  const linkedProducts = data.products.filter((p) => (content.productIds ?? []).includes(p.id));
  const linkedNames = new Set([
    ...linkedProducts.flatMap((p) => [p.name, p.code]),
    ...(content.eshopProducts ?? []).flatMap((p) => [p.title, p.sku]),
  ].filter(Boolean).map(key));
  const result = new Map<string, string>();
  for (const tag of content.productTags ?? []) {
    if (tag.trim()) result.set(key(tag), tag.trim());
  }
  for (const tag of content.tags ?? []) {
    const normalized = key(tag);
    if (normalized && (LEGACY_PRODUCT_TAGS.has(normalized) || linkedNames.has(normalized))) {
      result.set(normalized, tag.trim());
    }
  }
  return [...result.values()];
}

export function productBrowseValues(data: Catalog, content: Content): string[] {
  const linked = data.products.filter((p) => (content.productIds ?? []).includes(p.id));
  return [
    ...linked.flatMap((p) => [p.name, p.code]),
    ...(content.eshopProducts ?? []).flatMap((p) => [p.title, p.sku]),
    ...productTagsForContent(data, content),
  ].filter(Boolean);
}
