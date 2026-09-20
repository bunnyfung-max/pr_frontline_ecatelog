import { kitFiles } from './sales-kit';

export const DEMO_SALES_KIT_PATHS = [
  '/demo/sales-kit-floorplan.svg',
  '/demo/sales-kit-render-1.svg',
  '/demo/sales-kit-render-2.svg',
  '/demo/sales-kit-product-1.svg',
  '/demo/sales-kit-product-2.svg',
] as const;

export const DEMO_SALES_KIT = kitFiles([...DEMO_SALES_KIT_PATHS]);

export const DEMO_SALES_KIT_COVER = DEMO_SALES_KIT_PATHS[1];

export function demoSalesKitFields(fileName = 'sales-kit-demo') {
  return {
    salesKit: true as const,
    files: DEMO_SALES_KIT,
    fileName,
    cover: DEMO_SALES_KIT_COVER,
  };
}

/** 客廳體驗 Sales Kit：平面圖 + 客廳效果圖示範。 */
export function experienceLivingKitFields(fileName: string) {
  const files = kitFiles([
    '/demo/sales-kit-floorplan.svg',
    '/demo/living.svg',
    '/demo/sales-kit-render-2.svg',
    '/demo/sales-kit-product-1.svg',
    '/demo/sales-kit-product-2.svg',
  ]);
  return {
    salesKit: true as const,
    files,
    fileName,
    cover: '/demo/living.svg',
  };
}

/** 書房體驗 Sales Kit：平面圖 + 書房配置示範。 */
export function experienceStudyKitFields(fileName: string) {
  const files = kitFiles([
    '/demo/sales-kit-floorplan.svg',
    '/demo/plan.svg',
    '/demo/details.svg',
    '/demo/sales-kit-product-1.svg',
    '/demo/sales-kit-product-2.svg',
  ]);
  return {
    salesKit: true as const,
    files,
    fileName,
    cover: '/demo/plan.svg',
  };
}
