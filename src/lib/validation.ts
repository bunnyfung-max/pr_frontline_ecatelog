import { z } from 'zod';
import { isPriceriteProductUrl } from './pricerite-eshop-url';
import { KIT_RESERVED, KIT_REQUIRED } from './sales-kit';
export const idSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
export const httpsUrl = z
  .string()
  .max(2000)
  .refine((v) => {
    if (!v) return true;
    try {
      return new URL(v).protocol === 'https:';
    } catch {
      return false;
    }
  }, '請輸入完整的 HTTPS 連結');
export const assetRef = z
  .string()
  .max(2000)
  .refine(
    (v) =>
      !v ||
      /^asset:[a-zA-Z0-9_/-]+\.(jpg|jpeg|png|webp|pdf|mp4|webm)$/.test(v) ||
      /^\/demo\/(?:plan|living|details|housing-floorplan|sales-kit-(?:floorplan|render-[12]|product-[12]))\.svg$/.test(
        v,
      ),
    '不支援的檔案位置',
  );
const name = z.string().trim().min(1, '請輸入名稱').max(200);
const image = assetRef;
const eshopProductLink = z.object({
  url: httpsUrl.refine(isPriceriteProductUrl, '只接受 Pricerite eShop 產品 HTTPS 連結'),
  title: z.string().max(300),
  brand: z.string().max(100),
  sku: z.string().max(100),
  description: z.string().max(4000),
  image: httpsUrl.or(z.literal('')),
  fetchedAt: z.string(),
});
export const schemas = {
  content: z
    .object({
      id: idSchema,
      folderId: idSchema,
      name,
      type: z.enum(['image', 'pdf', 'video', 'link']),
      files: z.array(z.string().max(2000)).min(1).max(40),
      salesKit: z.boolean().optional(),
      fileName: z.string().max(1000),
      cover: image,
      keywords: z.string().max(2000),
      tags: z
        .array(z.string().trim().min(1, '標籤不可為空白').max(50))
        .max(30)
        .default([]),
      eshopProducts: z.array(eshopProductLink).max(30).default([]),
      productIds: z.array(idSchema).max(200),
      storeUrl: httpsUrl.default(''),
      eshopUrl: httpsUrl.default(''),
      status: z.enum(['draft', 'published', 'archived']),
      order: z.number().int().min(0).max(99999),
      updatedAt: z.string(),
    })
    .superRefine((c, ctx) => {
      if (c.salesKit && (c.type !== 'image' || c.files.length < KIT_RESERVED))
        ctx.addIssue({ code: 'custom', message: 'Sales Kit 必須保留五個圖片位置。' });
      c.files.forEach((file, i) => {
        if (c.salesKit && !file && i < KIT_RESERVED) {
          if (c.status === 'published' && i < KIT_REQUIRED)
            ctx.addIssue({
              code: 'custom',
              message: `發布前請補齊第 ${i + 1} 張圖片。`,
              path: ['files', i],
            });
          return;
        }
        const valid =
          c.type === 'link'
            ? httpsUrl.safeParse(file).success && !!file
            : assetRef.safeParse(file).success && !!file;
        if (!valid)
          ctx.addIssue({
            code: 'custom',
            message: '請提供有效檔案或 HTTPS 連結',
            path: ['files', i],
          });
        if (file.startsWith('asset:')) {
          const ext = file.split('.').pop()!;
          const allowed =
            c.salesKit && i >= KIT_RESERVED
              ? ['png', 'jpg', 'jpeg', 'webp', 'pdf', 'mp4', 'webm']
              : c.type === 'image'
                ? ['png', 'jpg', 'jpeg', 'webp']
                : c.type === 'pdf'
                  ? ['pdf']
                  : c.type === 'video'
                    ? ['mp4', 'webm']
                    : [];
          if (!allowed.includes(ext))
            ctx.addIssue({ code: 'custom', message: '檔案格式與內容類型不符', path: ['files', i] });
        }
      });
      if (c.type !== 'image' && c.files.length !== 1)
        ctx.addIssue({ code: 'custom', message: 'PDF、影片及連結每項只接受一個檔案或 URL' });
    }),
  product: z.object({
    id: idSchema,
    name,
    code: z.string().max(100),
    brand: z.string().max(100),
    colour: z.string().max(100),
    style: z.string().max(100),
    keywords: z.string().max(2000),
    image,
    url: httpsUrl,
    storeUrl: httpsUrl.default(''),
  }),
  scene: z.object({
    id: idSchema,
    name,
    image,
    url: httpsUrl,
    order: z.number().int().min(0).max(99999),
    active: z.boolean(),
  }),
  offer: z
    .object({
      id: idSchema,
      name,
      summary: z.string().max(1000),
      image,
      url: httpsUrl,
      order: z.number().int().min(0).max(99999),
      active: z.boolean(),
      startDate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/),
    })
    .refine(
      (o) => !o.startDate || !o.endDate || o.startDate <= o.endDate,
      '結束日期不可早於開始日期',
    ),
  settings: z.object({ id: z.literal('store'), label: name, url: httpsUrl }),
  folder: z.object({
    id: idSchema,
    parentId: idSchema.nullable(),
    name,
    subtitle: z.string().max(500),
    order: z.number().int().min(0).max(99999),
  }),
};
export const uploadSchema = z.object({
  name: z.string().min(1).max(255),
  size: z
    .number()
    .int()
    .positive()
    .max(50 * 1024 * 1024),
  mime: z.enum([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'video/mp4',
    'video/webm',
  ]),
});
export const mimeExtension: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};
