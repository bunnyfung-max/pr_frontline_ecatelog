import type { Catalog, Folder } from './types';
import { DEMO_SALES_KIT_COVER, DEMO_SALES_KIT_PATHS, demoSalesKitFields } from './demo-assets';
import { sharepointHousingContents } from './sharepoint-housing-folders';
const folder = (
  id: string,
  parentId: string | null,
  name: string,
  order = 0,
  subtitle = '',
): Folder => ({ id, parentId, name, order, subtitle });
export function initialCatalog(demo = false): Catalog {
  const folders = [
    folder('housing', null, 'New Housing', 0, '由一張平面圖，開始理想的家'),
    folder('pop', null, 'POP 展示', 1, '門市推廣與最新 E-poster'),
    folder('tmf', null, 'TMF', 2, '組合傢俬及專屬推廣'),
    folder('creator', null, '創造家', 3, '空間設計與家居靈感'),
    folder('scenes', null, '場景推介', 4, '配合不同生活需要的選擇'),
    folder('private', 'housing', '私人屋苑', 0),
    folder('public', 'housing', '公居屋', 1),
    folder('simple', 'housing', '簡約公屋', 2),
    ...['TMF Offer', 'Video', 'Weekly Eposter', 'Weekly Eposter_ST153'].map((name, i) =>
      folder(`pop-${i}`, 'pop', name, i),
    ),
    folder('tmf-centre', 'tmf', 'POP Centre'),
    ...[2024, 2025, 2026].map((year) => folder(`tmf-${year}`, 'tmf-centre', `${year}`, -year)),
    folder('creator-video', 'creator', '門市影片', 0),
    folder('creator-centre', 'creator', 'POP Center', 1),
    folder('creator-floorplan', 'creator-centre', 'Floorplan', 0),
    folder('creator-promotion', 'creator-centre', 'Promotion', 1),
    folder('creator-2026', 'creator-promotion', '2026'),
  ];
  const data: Catalog = {
    folders,
    contents: sharepointHousingContents(),
    products: [],
    offers: [],
    settings: { id: 'store', label: '前往自在購', url: '' },
    scenes: [
      '公居屋專家推介',
      '私樓傢俬套裝',
      '租客1天入伙套餐',
      '入伙必備家品',
      '銀優生活',
      '返學必備推介',
    ].map((name, i) => ({
      id: `scene-${i}`,
      name,
      order: i,
      image: DEMO_SALES_KIT_PATHS[i % DEMO_SALES_KIT_PATHS.length],
      url: '',
      active: true,
    })),
  };
  if (!demo) return data;
  data.folders.push(
    folder('estate-a', 'private', '示例屋苑 A', 9000, '示例資料 · 非真實屋苑'),
    folder('unit-a', 'estate-a', '450–550 呎 / 2–3 人'),
    folder('estate-b', 'private', '示例屋苑 B', 9001),
    folder('unit-b', 'estate-b', '650 呎 / 4 人'),
  );
  data.products = [
    {
      id: 'sofa',
      name: '示例雙人梳化',
      code: 'DEMO-001',
      brand: '示例品牌',
      colour: '米白色',
      style: '北歐簡約',
      keywords: '梳化 客廳 sofa',
      image: DEMO_SALES_KIT_PATHS[1],
      url: '',
    },
    {
      id: 'desk',
      name: '示例橡木書枱',
      code: 'DEMO-002',
      brand: '示例品牌',
      colour: '原木色',
      style: '日式',
      keywords: '書房 desk',
      image: DEMO_SALES_KIT_PATHS[4],
      url: '',
    },
  ];
  data.contents.push(
    {
      id: 'kit-a',
      folderId: 'unit-a',
      name: '小空間，大可能',
      type: 'image',
      ...demoSalesKitFields('sample-sale-kit'),
      keywords: '平面圖 家居配置 套裝',
      tags: ['雙人梳化', 'DEMO-001', '示例品牌', '米白色', '北歐簡約', 'SOFA', '客廳'],
      eshopProducts: [
        {
          url:
            'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/wardrobe/rivo-263521?isSearchPMCode=true&store_id=701',
          title: 'RIVO 雙趟門三櫃桶衣櫃1200W x 600D x 2160Hmm - 奶油白配橡木紋',
          brand: 'RIVO',
          sku: '263521',
          description: '20年結構保證 E0板材',
          image:
            'https://images.cdn.australia-southeast1.gcp.commercetools.com/dec46c83-28ab-44b8-9deb-086e1e319449/263521_hero_image-Ipd7qkrK.png',
          fetchedAt: '2026-09-20T00:00:00Z',
        },
        {
          url:
            'https://www.pricerite.com.hk/hk/zh-hk/products/furniture/bed-frame/rivo-263547?isSearchPMCode=true&store_id=701',
          title: 'RIVO 兩櫃桶布藝屏雙人床1380W x 1950D  x 1000Hmm - 奶油白配橡木紋',
          brand: 'RIVO',
          sku: '263547',
          description: '20年結構保證 雙人床',
          image:
            'https://images.cdn.australia-southeast1.gcp.commercetools.com/dec46c83-28ab-44b8-9deb-086e1e319449/263547_hero_image-ciA-EU0r.png',
          fetchedAt: '2026-09-20T00:00:00Z',
        },
      ],
      productIds: [],
      status: 'published',
      order: 0,
      updatedAt: '2026-09-18T00:00:00Z',
    },
    {
      id: 'kit-b',
      folderId: 'unit-b',
      name: '靈活工作角落',
      type: 'image',
      ...demoSalesKitFields('sample-desk'),
      keywords: '書房',
      tags: ['示例橡木書枱', 'DEMO-002', '橡木', '書房', '日式', '原木色'],
      eshopProducts: [],
      productIds: [],
      status: 'published',
      order: 0,
      updatedAt: '2026-09-18T00:00:00Z',
    },
    {
      id: 'poster-demo',
      folderId: 'pop-2',
      name: '讓日常，多一點舒適',
      type: 'image',
      ...demoSalesKitFields('weekly-eposter-demo'),
      keywords: '梳化 推廣',
      tags: ['梳化', '米白色', '推廣'],
      eshopProducts: [],
      productIds: [],
      status: 'published',
      order: 0,
      updatedAt: '2026-09-18T00:00:00Z',
    },
    {
      id: 'draft-demo',
      folderId: 'unit-a',
      name: '未發布示例草稿',
      type: 'image',
      ...demoSalesKitFields('draft'),
      keywords: '草稿',
      tags: ['草稿'],
      eshopProducts: [],
      productIds: [],
      status: 'draft',
      order: 1,
      updatedAt: '2026-09-18T00:00:00Z',
    },
  );
  data.offers = [
    {
      id: 'bundle-demo',
      name: '客廳舒適組合（示例）',
      summary: '梳化與茶几的配搭靈感。正式優惠及連結待提供。',
      image: DEMO_SALES_KIT_COVER,
      url: '',
      order: 0,
      active: true,
      startDate: '',
      endDate: '',
    },
  ];
  return data;
}
