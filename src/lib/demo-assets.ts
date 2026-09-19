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
