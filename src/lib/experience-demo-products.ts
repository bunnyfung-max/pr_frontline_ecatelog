import type { EshopProductLink } from './types';

const FETCHED_AT = '2026-09-20T00:00:00Z';

function product(
  url: string,
  title: string,
  brand: string,
  sku: string,
  description = '',
): EshopProductLink {
  return { url, title, brand, sku, description, image: '', fetchedAt: FETCHED_AT };
}

/** 體驗測試用 eShop 產品（開啟內容時會即時取價）。 */
export const EXPERIENCE_LIVING_PRODUCTS: EshopProductLink[] = [
  product(
    'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/sofa/fergal-975663?isSearchPMCode=true&store_id=701',
    'FERGAL MENA T330 三座位功能性儲物真皮梳化 1905W x 813D x 1003Hmm',
    'FERGAL',
    '975663',
  ),
  product(
    'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/sofa/cheers-972783?isSearchPMCode=true&store_id=701',
    'CHEERS芝華仕EILEEN 11281 三座位功能性連貴妃單彈鉸科技布梳化(坐下計左貴妃)(極靠牆)2540W x 920/1549D x 940Hmm',
    'CHEERS',
    '972783',
  ),
  product(
    'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/storage-cabinet/essenzo-979473?isSearchPMCode=true&store_id=701',
    'ESSENZO YUMI CD650101 四層空格高身儲物櫃連檯600W x 450D x 2000Hmm - 橡木色配白色',
    'ESSENZO',
    '979473',
  ),
];

export const EXPERIENCE_STUDY_PRODUCTS: EshopProductLink[] = [
  product(
    'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/study-desk/261518?isSearchPMCode=true&store_id=701',
    'LIFTY雙板分區單桿手動升降檯 700wx400Dx680-1080Hmm',
    'LIFTY',
    '261518',
  ),
  product(
    'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/storage-cabinet/essenzo-979472?isSearchPMCode=true&store_id=701',
    'ESSENZO YUMI BC060201 四門空格高身儲物櫃600W x 400D x 2000Hmm - 橡木色配白色',
    'ESSENZO',
    '979472',
  ),
];
