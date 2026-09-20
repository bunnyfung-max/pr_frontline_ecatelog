-- Experience demo: keep two published kits with eShop products; remove empty housing kits.
begin;

delete from public.catalog_entries
where entity = 'content'
  and id not in ('public-type-a', 'public-type-b1');

insert into public.catalog_entries (entity, id, payload) values ('content', 'public-type-a', '{"id":"public-type-a","folderId":"public","name":"Type A – 1至2人單位（客廳體驗）","type":"image","salesKit":true,"files":["/demo/sales-kit-floorplan.svg","/demo/living.svg","/demo/sales-kit-render-2.svg","/demo/sales-kit-product-1.svg","/demo/sales-kit-product-2.svg"],"fileName":"public-type-a","cover":"/demo/living.svg","keywords":"Type A 客廳 梳化 收納 平面圖 效果圖 產品","tags":["客廳","梳化","收納"],"eshopProducts":[{"url":"https://www.pricerite.com.hk/hk/zh-hk/products/furniture/sofa/fergal-975663?isSearchPMCode=true&store_id=701","title":"FERGAL 梳化","brand":"FERGAL","sku":"975663","description":"","image":"","fetchedAt":"2026-09-20T00:00:00Z"},{"url":"https://www.pricerite.com.hk/hk/zh-hk/products/furniture/sofa/cheers-972783?isSearchPMCode=true&store_id=701","title":"CHEERS 梳化","brand":"CHEERS","sku":"972783","description":"","image":"","fetchedAt":"2026-09-20T00:00:00Z"},{"url":"https://www.pricerite.com.hk/hk/zh-hk/products/furniture/storage-cabinet/essenzo-979473?isSearchPMCode=true&store_id=701","title":"ESSENZO 收納櫃","brand":"ESSENZO","sku":"979473","description":"","image":"","fetchedAt":"2026-09-20T00:00:00Z"}],"productIds":[],"status":"published","order":0,"updatedAt":"2026-09-20T00:00:00Z"}'::jsonb)
  on conflict (entity, id) do update set payload = excluded.payload;

insert into public.catalog_entries (entity, id, payload) values ('content', 'public-type-b1', '{"id":"public-type-b1","folderId":"public","name":"Type B1 – 2至3人單位（書房體驗）","type":"image","salesKit":true,"files":["/demo/sales-kit-floorplan.svg","/demo/plan.svg","/demo/details.svg","/demo/sales-kit-product-1.svg","/demo/sales-kit-product-2.svg"],"fileName":"public-type-b1","cover":"/demo/plan.svg","keywords":"Type B1 書房 書枱 收納 平面圖 效果圖 產品","tags":["書房","書枱","收納"],"eshopProducts":[{"url":"https://www.pricerite.com.hk/hk/zh-hk/products/furniture/study-desk/261518?isSearchPMCode=true&store_id=701","title":"書枱","brand":"Pricerite","sku":"261518","description":"","image":"","fetchedAt":"2026-09-20T00:00:00Z"},{"url":"https://www.pricerite.com.hk/hk/zh-hk/products/furniture/storage-cabinet/essenzo-979472?isSearchPMCode=true&store_id=701","title":"ESSENZO 收納櫃","brand":"ESSENZO","sku":"979472","description":"","image":"","fetchedAt":"2026-09-20T00:00:00Z"}],"productIds":[],"status":"published","order":1,"updatedAt":"2026-09-20T00:00:00Z"}'::jsonb)
  on conflict (entity, id) do update set payload = excluded.payload;

commit;
