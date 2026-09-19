import type { Content } from './types';
import { demoSalesKitFields } from './demo-assets';

type HousingLeaf = { id: string; name: string };

const SEED_UPDATED_AT = '2026-09-18T00:00:00Z';

const publicLeaves: HousingLeaf[] = [
  { id: 'public-all', name: 'all' },
  { id: 'public-type-a', name: 'Type A – 1至2人單位' },
  { id: 'public-type-b1', name: 'Type B1 – 2至3人單位' },
  { id: 'public-type-b2', name: 'Type B2 – 2至3人單位' },
  { id: 'public-type-c1', name: 'Type C1 – 3至4人單位' },
  { id: 'public-type-c2', name: 'Type C2 – 3至4人單位' },
  { id: 'public-type-d1a', name: 'Type D1A – 4至5人單位' },
  { id: 'public-type-d1b', name: 'Type D1B – 4至5人單位' },
  { id: 'public-type-d2a', name: 'Type D2A – 4至5人單位' },
  { id: 'public-type-d2b', name: 'Type D2B – 4至5人單位' },
];

const privateLeaves: HousingLeaf[] = [
  { id: 'private-nova-land-2br', name: 'NOVA LAND兩房' },
  { id: 'private-sierra-sea-2a-1br', name: 'SIERRA SEA 2A期 (1房)' },
  { id: 'private-yoho-hub', name: 'YoHo Hub' },
  { id: 'private-ming-city-3-4br', name: '名城3期四房' },
  { id: 'private-kai-tak-harbour-2', name: '啟德海灣2期' },
  { id: 'private-kingswood-442', name: '嘉湖山莊(442呎)' },
  { id: 'private-kingswood-540', name: '嘉湖山莊(540呎)' },
  { id: 'private-tai-po-shang-yan', name: '大埔上然' },
  { id: 'private-tai-woo-garden', name: '太湖花園' },
  { id: 'private-tuen-mun-plaza', name: '屯門時代廣場' },
  { id: 'private-napa-1-floorplan', name: '嵐山1期單位平面圖' },
  { id: 'private-discovery-park', name: '愉景新城' },
  { id: 'private-metropolis', name: '新都城' },
  { id: 'private-sunrise-city', name: '日出康城' },
  { id: 'private-sunrise-city-12c', name: '日出康城12期C' },
  { id: 'private-rise-park', name: '昇柏山' },
  { id: 'private-caribbean-coast', name: '映灣園' },
  { id: 'private-the-pavilia-farm', name: '柏傲莊' },
  { id: 'private-sha-tin-city', name: '沙田第一城' },
  { id: 'private-sha-tin-city-327', name: '沙田第一城 327呎' },
  { id: 'private-hung-shui-bridge', name: '洪水橋滙都' },
  { id: 'private-ocean-pride', name: '海之戀' },
  { id: 'private-south-horizons', name: '海怡半島' },
  { id: 'private-south-horizons-4', name: '海怡半島4期' },
  { id: 'private-hoi-fai-garden', name: '海濱花園' },
  { id: 'private-amoy-gardens', name: '淘大花園' },
  { id: 'private-island-south', name: '港島南岸' },
  { id: 'private-gateway-prime', name: '港灣豪庭' },
  { id: 'private-marina-warm-floorplan', name: '溱柏單位平面圖' },
  { id: 'private-world-city-floorplan', name: '環宇海灣單位平面圖' },
  { id: 'private-green-park-floorplan', name: '綠悠雅苑單位平面圖' },
  { id: 'private-mei-foo', name: '美孚新邨' },
  { id: 'private-greenwood', name: '翠麗花園' },
  { id: 'private-tsuen-wan-centre', name: '荃灣中心' },
  { id: 'private-laguna-city-3br', name: '麗港城三房' },
  { id: 'private-whampoa-garden', name: '黃埔花園' },
];

const simpleLeaves: HousingLeaf[] = [
  { id: 'simple-1-2', name: '簡約公屋 1至2人單位' },
  { id: 'simple-3-4', name: '簡約公屋 3至4人單位' },
  { id: 'simple-4-5', name: '簡約公屋 4至5人單位' },
];

function housingContents(folderId: string, leaves: HousingLeaf[]): Content[] {
  return leaves.map((leaf, order) => ({
    id: leaf.id,
    folderId,
    name: leaf.name,
    type: 'image',
    ...demoSalesKitFields(leaf.id),
    keywords: `${leaf.name} 平面圖 效果圖 產品`,
    tags: [],
    eshopProducts: [],
    productIds: [],
    status: 'published',
    order,
    updatedAt: SEED_UPDATED_AT,
  }));
}

/** SharePoint Display Version files under 公居屋 / 私人屋苑 / 簡約公屋. */
export function sharepointHousingContents(): Content[] {
  return [
    ...housingContents('public', publicLeaves),
    ...housingContents('private', privateLeaves),
    ...housingContents('simple', simpleLeaves),
  ];
}
