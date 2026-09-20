import type { EshopProductLink } from './types';

const FETCHED_AT = '2026-09-20T00:00:00Z';

function product(
  url: string,
  title: string,
  brand: string,
  sku: string,
): EshopProductLink {
  return { url, title, brand, sku, description: '', image: '', fetchedAt: FETCHED_AT };
}

/** 體驗測試用 eShop 產品（開啟內容時會即時取價）。 */
export const EXPERIENCE_LIVING_PRODUCTS: EshopProductLink[] = [
  product(
    'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/sofa/fergal-975663?isSearchPMCode=true&store_id=701',
    'FERGAL 梳化',
    'FERGAL',
    '975663',
  ),
  product(
    'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/sofa/cheers-972783?isSearchPMCode=true&store_id=701',
    'CHEERS 梳化',
    'CHEERS',
    '972783',
  ),
  product(
    'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/storage-cabinet/essenzo-979473?isSearchPMCode=true&store_id=701',
    'ESSENZO 收納櫃',
    'ESSENZO',
    '979473',
  ),
];

export const EXPERIENCE_STUDY_PRODUCTS: EshopProductLink[] = [
  product(
    'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/study-desk/261518?isSearchPMCode=true&store_id=701',
    '書枱',
    'Pricerite',
    '261518',
  ),
  product(
    'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/storage-cabinet/essenzo-979472?isSearchPMCode=true&store_id=701',
    'ESSENZO 收納櫃',
    'ESSENZO',
    '979472',
  ),
];
