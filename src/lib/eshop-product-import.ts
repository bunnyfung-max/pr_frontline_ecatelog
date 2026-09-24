import {
  isPriceriteProductUrl,
  normalizePriceriteProductUrl,
} from './pricerite-eshop-url';

const EMBEDDED_URL_RE = /https:\/\/www\.pricerite\.com\.hk\/[^\s<>"']+/gi;

function cleanToken(value: string) {
  return value.replace(/^["'(\[]+|["')\]]+$/g, '').trim();
}

function tryAddUrl(found: Set<string>, candidate: string) {
  const cleaned = cleanToken(candidate);
  if (!cleaned || !isPriceriteProductUrl(cleaned)) return;
  try {
    found.add(normalizePriceriteProductUrl(cleaned));
  } catch {
    /* Ignore invalid URLs in mixed import text. */
  }
}

/** Extract unique Pricerite product URLs from pasted text, CSV, or Excel copy. */
export function extractPriceriteProductUrls(text: string): string[] {
  const found = new Set<string>();
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  for (const line of normalized.split('\n')) {
    for (const token of line.split(/[\t,;]+/)) {
      tryAddUrl(found, token);
    }
  }

  for (const match of normalized.matchAll(EMBEDDED_URL_RE)) {
    tryAddUrl(found, match[0].replace(/[),.;]+$/g, ''));
  }

  return [...found];
}

export async function readEshopImportFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    throw new Error('請將 Excel 另存為 CSV，或直接從 Excel 複製連結欄貼上。');
  }
  return await file.text();
}
