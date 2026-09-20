import type { Catalog, Content, EshopProductLink, Folder, Product, Scene } from './types';

const folderLabel = (folder: Folder) =>
  folder.id === 'housing' && folder.name === 'New Housing' ? '新屋入伙' : folder.name;

function descendants(folders: Folder[], id: string): Set<string> {
  const found = new Set<string>();
  if (!folders.some((folder) => folder.id === id)) return found;
  const queue = [id];
  while (queue.length) {
    const current = queue.shift()!;
    if (found.has(current)) continue;
    found.add(current);
    queue.push(...folders.filter((folder) => folder.parentId === current).map((folder) => folder.id));
  }
  return found;
}

function trail(folders: Folder[], id: string): Folder[] {
  const path: Folder[] = [];
  const seen = new Set<string>();
  let folder = folders.find((item) => item.id === id);
  while (folder && !seen.has(folder.id)) {
    seen.add(folder.id);
    path.unshift(folder);
    folder = folders.find((item) => item.id === folder!.parentId);
  }
  return path;
}

const byOrder = <T extends { order: number; name?: string }>(a: T, b: T) =>
  a.order - b.order || (a.name || '').localeCompare(b.name || '', 'zh-HK');

export type SearchCategory = 'product' | 'brand' | 'colour' | 'style' | 'estate';

export const SEARCH_CATEGORIES: SearchCategory[] = [
  'product',
  'brand',
  'colour',
  'style',
  'estate',
];

export const SEARCH_CATEGORY_LABEL: Record<SearchCategory, string> = {
  product: '產品',
  brand: '品牌',
  colour: '顏色',
  style: '風格',
  estate: '屋苑',
};

const CATEGORY_ALIASES: Record<SearchCategory, string[]> = {
  product: ['產品', 'product'],
  brand: ['品牌', 'brand'],
  colour: ['顏色', '颜色', 'colour', 'color'],
  style: ['風格', 'style'],
  estate: ['屋苑', '屋苑名', 'estate'],
};

/** Query-time synonyms only — matching still requires catalog / eShop text to exist. */
const SYNONYMS: Record<string, string[]> = {
  梳化: ['sofa', '沙發'],
  沙發: ['梳化', 'sofa'],
  sofa: ['梳化', '沙發'],
  米白: ['米白色', '奶油白'],
  米白色: ['米白', '奶油白'],
  公屋: ['公居屋'],
  公居屋: ['公屋'],
  書桌: ['書枱'],
  書枱: ['書桌'],
};

export interface SearchFacets {
  spaces: string[];
  brands: string[];
  hasEshop: boolean;
}

export interface ParsedSearchQuery {
  category: SearchCategory | null;
  terms: string[];
  raw: string;
}

export interface SearchMatchReason {
  label: string;
  value: string;
}

export interface Scored<T> {
  item: T;
  score: number;
  reasons: SearchMatchReason[];
}

export interface SearchVocabulary {
  products: string[];
  brands: string[];
  colours: string[];
  styles: string[];
  estates: string[];
  spaces: string[];
}

export interface EnhancedSearchResults {
  contents: Scored<Content>[];
  folders: Scored<Folder>[];
  scenes: Scored<Scene>[];
  vocabulary: SearchVocabulary;
  availableFacets: Pick<SearchVocabulary, 'spaces' | 'brands'>;
}

export interface SearchOptions {
  includeDrafts?: boolean;
  facets?: SearchFacets;
}

export const EMPTY_SEARCH_FACETS: SearchFacets = {
  spaces: [],
  brands: [],
  hasEshop: false,
};

export function hasActiveFacets(facets: SearchFacets) {
  return facets.spaces.length > 0 || facets.brands.length > 0 || facets.hasEshop;
}

function normalize(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().trim();
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'zh-HK'),
  );
}

function expandTerm(term: string) {
  const base = normalize(term);
  const variants = SYNONYMS[base] ?? [];
  return uniqueSorted([base, ...variants.map(normalize)]);
}

export function parseSearchQuery(raw: string): ParsedSearchQuery {
  const trimmed = raw.trim();
  if (!trimmed) return { category: null, terms: [], raw: trimmed };

  for (const category of SEARCH_CATEGORIES) {
    for (const alias of CATEGORY_ALIASES[category]) {
      const prefix = `${alias} `;
      const colon = `${alias}:`;
      if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
        const rest = trimmed.slice(prefix.length).trim();
        return {
          category,
          terms: rest ? rest.split(/\s+/).map(normalize).filter(Boolean) : [],
          raw: trimmed,
        };
      }
      if (trimmed.toLowerCase().startsWith(colon.toLowerCase())) {
        const rest = trimmed.slice(colon.length).trim();
        return {
          category,
          terms: rest ? rest.split(/\s+/).map(normalize).filter(Boolean) : [],
          raw: trimmed,
        };
      }
      if (normalize(trimmed) === normalize(alias)) {
        return { category, terms: [], raw: trimmed };
      }
    }
  }

  return {
    category: null,
    terms: trimmed.split(/\s+/).map(normalize).filter(Boolean),
    raw: trimmed,
  };
}

function scopeFolderIds(data: Catalog, folderId: string | null) {
  if (folderId === null) return new Set(data.folders.map((f) => f.id));
  return descendants(data.folders, folderId);
}

function contentProducts(data: Catalog, content: Content) {
  return data.products.filter((product) => content.productIds.includes(product.id));
}

export function buildSearchVocabulary(
  data: Catalog,
  folderId: string | null,
  includeDrafts = false,
): SearchVocabulary {
  const scope = scopeFolderIds(data, folderId);
  const contents = data.contents.filter(
    (content) =>
      scope.has(content.folderId) && (includeDrafts || content.status === 'published'),
  );

  const products: string[] = [];
  const brands: string[] = [];
  const colours: string[] = [];
  const styles: string[] = [];
  const estates: string[] = [];
  const spaces: string[] = [];

  for (const content of contents) {
    products.push(content.name);
    spaces.push(...(content.tags ?? []));
    for (const link of content.eshopProducts ?? []) {
      if (link.title) products.push(link.title);
      if (link.brand) brands.push(link.brand);
      if (link.sku) products.push(link.sku);
      if (link.description) products.push(link.description);
    }
    for (const product of contentProducts(data, content)) {
      products.push(product.name, product.code);
      brands.push(product.brand);
      colours.push(product.colour);
      styles.push(product.style);
      if (product.keywords) products.push(product.keywords);
    }
    const path = trail(data.folders, content.folderId);
    for (const folder of path) {
      estates.push(folderLabel(folder), folder.name);
      if (folder.subtitle) estates.push(folder.subtitle);
    }
  }

  for (const folder of data.folders.filter((f) => scope.has(f.id))) {
    estates.push(folderLabel(folder), folder.name);
    if (folder.subtitle) estates.push(folder.subtitle);
  }

  return {
    products: uniqueSorted(products),
    brands: uniqueSorted(brands),
    colours: uniqueSorted(colours),
    styles: uniqueSorted(styles),
    estates: uniqueSorted(estates),
    spaces: uniqueSorted(spaces),
  };
}

export function vocabularyForCategory(
  vocabulary: SearchVocabulary,
  category: SearchCategory,
): string[] {
  switch (category) {
    case 'product':
      return vocabulary.products;
    case 'brand':
      return vocabulary.brands;
    case 'colour':
      return vocabulary.colours;
    case 'style':
      return vocabulary.styles;
    case 'estate':
      return vocabulary.estates;
    default:
      return [];
  }
}

type FieldHit = {
  label: string;
  value: string;
  weight: number;
  category: SearchCategory | 'general';
};

function contentFields(data: Catalog, content: Content): FieldHit[] {
  const fields: FieldHit[] = [
    { label: '名稱', value: content.name, weight: 100, category: 'product' },
    { label: '檔案', value: content.fileName, weight: 20, category: 'general' },
    { label: '關鍵字', value: content.keywords, weight: 40, category: 'general' },
  ];
  for (const tag of content.tags ?? []) {
    fields.push({ label: '標籤', value: tag, weight: 80, category: 'product' });
    fields.push({ label: '標籤', value: tag, weight: 60, category: 'general' });
  }
  for (const link of content.eshopProducts ?? []) {
    fields.push({ label: 'eShop 產品', value: link.title, weight: 90, category: 'product' });
    fields.push({ label: '品牌', value: link.brand, weight: 85, category: 'brand' });
    fields.push({ label: 'SKU', value: link.sku, weight: 70, category: 'product' });
    fields.push({ label: 'eShop 描述', value: link.description, weight: 35, category: 'product' });
  }
  for (const product of contentProducts(data, content)) {
    fields.push({ label: '產品', value: product.name, weight: 90, category: 'product' });
    fields.push({ label: '品牌', value: product.brand, weight: 85, category: 'brand' });
    fields.push({ label: '顏色', value: product.colour, weight: 75, category: 'colour' });
    fields.push({ label: '風格', value: product.style, weight: 75, category: 'style' });
    fields.push({ label: '型號', value: product.code, weight: 65, category: 'product' });
    fields.push({ label: '關鍵字', value: product.keywords, weight: 40, category: 'general' });
  }
  for (const folder of trail(data.folders, content.folderId)) {
    fields.push({ label: '屋苑', value: folderLabel(folder), weight: 55, category: 'estate' });
    fields.push({ label: '目錄', value: folder.name, weight: 45, category: 'estate' });
    if (folder.subtitle) {
      fields.push({ label: '屋苑', value: folder.subtitle, weight: 45, category: 'estate' });
    }
  }
  return fields.filter((field) => field.value?.trim());
}

function eshopLinkFields(link: EshopProductLink): FieldHit[] {
  const fields: FieldHit[] = [
    { label: 'eShop 產品', value: link.title, weight: 90, category: 'product' },
    { label: '品牌', value: link.brand, weight: 85, category: 'brand' },
    { label: 'SKU', value: link.sku, weight: 70, category: 'product' },
    { label: 'eShop 描述', value: link.description, weight: 35, category: 'product' },
  ];
  return fields.filter((field) => field.value?.trim());
}

function legacyProductFields(product: Product): FieldHit[] {
  const fields: FieldHit[] = [
    { label: '產品', value: product.name, weight: 90, category: 'product' },
    { label: '品牌', value: product.brand, weight: 85, category: 'brand' },
    { label: '顏色', value: product.colour, weight: 75, category: 'colour' },
    { label: '風格', value: product.style, weight: 75, category: 'style' },
    { label: '型號', value: product.code, weight: 65, category: 'product' },
    { label: '關鍵字', value: product.keywords, weight: 40, category: 'general' },
  ];
  return fields.filter((field) => field.value?.trim());
}

export function eshopLinkMatchesQuery(link: EshopProductLink, parsed: ParsedSearchQuery): boolean {
  return scoreFields(eshopLinkFields(link), parsed) !== null;
}

export function legacyProductMatchesQuery(product: Product, parsed: ParsedSearchQuery): boolean {
  return scoreFields(legacyProductFields(product), parsed) !== null;
}

function folderFields(data: Catalog, folder: Folder): FieldHit[] {
  const fields: FieldHit[] = [
    { label: '目錄', value: folder.name, weight: 80, category: 'estate' },
    { label: '目錄', value: folderLabel(folder), weight: 75, category: 'estate' },
  ];
  if (folder.subtitle) {
    fields.push({ label: '副標題', value: folder.subtitle, weight: 60, category: 'estate' });
  }
  for (const parent of trail(data.folders, folder.id)) {
    fields.push({ label: '路徑', value: folderLabel(parent), weight: 40, category: 'estate' });
    fields.push({ label: '路徑', value: parent.name, weight: 35, category: 'estate' });
  }
  return fields.filter((field) => field.value?.trim());
}

function fieldMatchesTerm(field: FieldHit, term: string, category: SearchCategory | null) {
  if (category && field.category !== category && field.category !== 'general') return false;
  const haystack = normalize(field.value);
  return expandTerm(term).some((variant) => haystack.includes(variant));
}

function scoreFields(
  fields: FieldHit[],
  parsed: ParsedSearchQuery,
): { score: number; reasons: SearchMatchReason[] } | null {
  if (parsed.category && !parsed.terms.length) return null;

  const terms = parsed.terms;
  if (!terms.length) return null;

  let score = 0;
  const reasons: SearchMatchReason[] = [];

  for (const term of terms) {
    let termMatched = false;
    for (const field of fields) {
      if (!fieldMatchesTerm(field, term, parsed.category)) continue;
      termMatched = true;
      score += field.weight;
      if (!reasons.some((reason) => reason.label === field.label && reason.value === field.value)) {
        reasons.push({ label: field.label, value: field.value });
      }
    }
    if (!termMatched) return null;
  }

  return { score, reasons: reasons.slice(0, 4) };
}

function passesFacets(data: Catalog, content: Content, facets: SearchFacets) {
  if (facets.hasEshop && !(content.eshopProducts?.length)) return false;
  if (facets.spaces.length && !facets.spaces.some((space) => content.tags?.includes(space))) {
    return false;
  }
  if (facets.brands.length) {
    const brands = [
      ...(content.eshopProducts ?? []).map((link) => link.brand),
      ...contentProducts(data, content).map((product) => product.brand),
    ].filter(Boolean);
    if (!facets.brands.some((brand) => brands.includes(brand))) return false;
  }
  return true;
}

export function searchScopeSummary(
  data: Catalog,
  folderId: string | null,
  includeDrafts = false,
) {
  const scope = scopeFolderIds(data, folderId);
  const contents = data.contents.filter(
    (content) =>
      scope.has(content.folderId) && (includeDrafts || content.status === 'published'),
  );
  const folder = folderId ? data.folders.find((item) => item.id === folderId) : null;
  return {
    contentCount: contents.length,
    folderName: folder ? folderLabel(folder) : null,
    isHome: folderId === null,
  };
}

export function searchCatalogEnhanced(
  data: Catalog,
  folderId: string | null,
  query: string,
  options: SearchOptions = {},
): EnhancedSearchResults {
  const includeDrafts = options.includeDrafts ?? false;
  const facets = options.facets ?? { spaces: [], brands: [], hasEshop: false };
  const parsed = parseSearchQuery(query);
  const scope = scopeFolderIds(data, folderId);
  const vocabulary = buildSearchVocabulary(data, folderId, includeDrafts);
  const facetOnly = !parsed.terms.length && !parsed.category && hasActiveFacets(facets);

  const contents: Scored<Content>[] = [];
  for (const content of data.contents) {
    if (!scope.has(content.folderId) || (!includeDrafts && content.status !== 'published')) continue;
    if (!passesFacets(data, content, facets)) continue;
    if (facetOnly) {
      contents.push({ item: content, score: 0, reasons: [] });
      continue;
    }
    const scored = scoreFields(contentFields(data, content), parsed);
    if (!scored) continue;
    contents.push({ item: content, score: scored.score, reasons: scored.reasons });
  }
  contents.sort((a, b) =>
    facetOnly ? byOrder(a.item, b.item) : b.score - a.score || byOrder(a.item, b.item),
  );

  const folders: Scored<Folder>[] = [];
  if (!facetOnly) {
    for (const folder of data.folders) {
      if (folder.id === folderId || !scope.has(folder.id)) continue;
      const scored = scoreFields(folderFields(data, folder), parsed);
      if (!scored) continue;
      folders.push({ item: folder, score: scored.score, reasons: scored.reasons });
    }
    folders.sort((a, b) => b.score - a.score || byOrder(a.item, b.item));
  }

  const scenes: Scored<Scene>[] = [];
  if (!facetOnly && scope.has('scenes')) {
    for (const scene of data.scenes) {
      if (!includeDrafts && !scene.active) continue;
      const scored = scoreFields(
        [{ label: '場景', value: scene.name, weight: 80, category: 'product' }],
        parsed,
      );
      if (!scored) continue;
      scenes.push({ item: scene, score: scored.score, reasons: scored.reasons });
    }
    scenes.sort((a, b) => b.score - a.score || byOrder(a.item, b.item));
  }

  const availableFacets = {
    spaces: vocabulary.spaces,
    brands: vocabulary.brands,
  };

  return { contents, folders, scenes, vocabulary, availableFacets };
}

export function suggestForCategory(
  vocabulary: SearchVocabulary,
  category: SearchCategory,
  input = '',
  limit = 8,
) {
  const pool = vocabularyForCategory(vocabulary, category);
  const term = normalize(input);
  const matches = pool.filter((value) => !term || normalize(value).includes(term));
  return matches.slice(0, limit);
}
