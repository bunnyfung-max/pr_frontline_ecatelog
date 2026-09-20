import type { Content } from './types';
import { experienceLivingKitFields, experienceStudyKitFields } from './demo-assets';
import { EXPERIENCE_LIVING_PRODUCTS, EXPERIENCE_STUDY_PRODUCTS } from './experience-demo-products';

const UPDATED_AT = '2026-09-20T00:00:00Z';

export const EXPERIENCE_DEMO_CONTENT_IDS = ['public-type-a', 'public-type-b1'] as const;

export function experienceDemoContents(): Content[] {
  return [
    {
      id: 'public-type-a',
      folderId: 'public',
      name: 'Type A – 1至2人單位（客廳體驗）',
      type: 'image',
      ...experienceLivingKitFields('public-type-a'),
      keywords: 'Type A 客廳 梳化 收納 平面圖 效果圖 產品',
      tags: ['客廳', '梳化', '收納'],
      eshopProducts: EXPERIENCE_LIVING_PRODUCTS,
      productIds: [],
      status: 'published',
      order: 0,
      updatedAt: UPDATED_AT,
    },
    {
      id: 'public-type-b1',
      folderId: 'public',
      name: 'Type B1 – 2至3人單位（書房體驗）',
      type: 'image',
      ...experienceStudyKitFields('public-type-b1'),
      keywords: 'Type B1 書房 書枱 收納 平面圖 效果圖 產品',
      tags: ['書房', '書枱', '收納'],
      eshopProducts: EXPERIENCE_STUDY_PRODUCTS,
      productIds: [],
      status: 'published',
      order: 1,
      updatedAt: UPDATED_AT,
    },
  ];
}
