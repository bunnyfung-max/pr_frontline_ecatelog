import { experienceDemoContents } from './experience-demo-contents';
import type { Content } from './types';

/** 體驗測試：只保留兩份已連結 eShop 產品的公居屋 Sales Kit。 */
export function sharepointHousingContents(): Content[] {
  return experienceDemoContents();
}
