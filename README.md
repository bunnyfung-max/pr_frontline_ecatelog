# PriceRite Frontline e-Catalog

門市平板電子目錄 + CMS。Next.js / TypeScript / Supabase Auth、Postgres、Private Storage，準備部署至 Vercel。

## 目前狀態

- 前端及 CMS 已實作；本機示例模式可操作、上載及保存。
- 已備妥 Supabase migration、角色權限、私人素材存取、直接上載及部署指引。
- **尚未接上真實 Supabase / Vercel 帳戶；雲端登入、上載與正式資料須接駁後驗收。**
- 示例屋苑、插畫、產品及優惠均非真實銷售資訊。正式 seed 沒有示例產品／屋苑。
- 公司內部素材、員工資料、密碼、service-role key 一律不可 commit。此 repo 目前是 public；部署前建議由 owner 改為 private。

## 快速本機試用

需要 Node.js 22+（開發測試使用 Node 24）、pnpm 11。

```sh
pnpm install --frozen-lockfile
pnpm dev:demo
```

開啟 http://127.0.0.1:3000 。示例模式僅限 development 且沒有 VERCEL 環境變數時生效，綁定 loopback。不能當作正式內部登入替代品。

示例上載及 metadata 保存在忽略版本控制的 `.data/`，重啟仍保留。沒有自動刪除工具，避免误刪測試者新增內容。E2E 只將自己的 QA entries 下架，檔案保留。

### 主要操作

1. 首頁 → New Housing → 私樓 → 九龍 → 示例屋苑 A → 450–550 呎 / 2–3 人。
2. 首頁直接搜尋所有已發布目錄內容，毋須選擇 folder。例如「米白色 梳化」會搜尋 New Housing 及 POP 等目錄；進入屋苑 A 後搜尋只限該屋苑及下層，「橡木」不會帶出屋苑 B。
3. 開啟 Sale Kit：橫向兩頁、直向一頁，旋轉保留目前頁碼；右側開關購物功能列。
4. 右上「內容管理」→ 逐層进入目錄 → 上載內容。目的地只包括目前及下層目錄。
5. CMS「產品索引」可為每件產品設定自在購及 eShop 連結；每份展示內容 / Sales Kit 的編輯頁亦可設定專屬購物連結及相關產品。「組合優惠」獨立管理 Bundle Offer，不再設定共用自在購網址。
6. New Housing Sales Kit 按「平面圖 → 效果圖 → 產品列表（一）→ 產品列表（二）→ 選填補充圖」上載；之後可加圖片、PDF 及影片並排序。未齊頭四張可存草稿，發布需齊全。前端依此順序展示。

## 已實作功能

| 模組 | 功能 |
|---|---|
| 首頁 | New Housing、POP、TMF、創造家、場景推介五入口 |
| 目錄 | 共用層級、breadcrumb、返回、空狀態，CMS 可新增子目錄 |
| 搜尋 | 首頁搜尋所有目錄，入目錄後由伺服器限制目前目錄＋下層；同一欄搜尋名稱、檔案名、目錄分類、關鍵字、關聯產品名稱／編號／品牌／顏色／風格及啟用的場景；空格分隔多個關鍵字採 AND 配對 |
| 閱讀器 | JPG/PNG/WebP 多頁目錄、PDF canvas、MP4/WebM、HTTPS link-out；橫向雙頁、直向單頁、翻頁、縮放 |
| 購物列 | 預設收起，按本份內容及相關產品顯示各自的自在購 / eShop 連結；另保留 Bundle Offer、香港時區有效日期及啟停 |
| CMS | 上載、封面、圖片頁次、目的地、產品關聯、排序、草稿／發布／下架、檔案替換、橫直向預覽 |
| 存取 | approved frontline / admin 二角色、Supabase Auth、資料及 Storage RLS |

Weekly Summary 不包含，Weekly Eposter 保留。六個場景名称已建立，URL 留空待業務確認；未設定連結不可點擊。不假設 eShop 資料同步。

## Supabase 設定（僅對此項目）

1. 使用公司批准的帳戶／方案建立 Supabase project，選擇符合公司要求的區域、費用及資料保留政策。
2. SQL Editor 依次執行 `supabase/migrations/001_catalog.sql`、`002_seed.sql`。這是新 project 的一次性 migrations，不要對其他現有資料庫直接執行。
3. Authentication 關閉 public signup；由管理員建立 approved users。按內部政策配置密碼、驗證及 rate limit。MVP 是電郵／密碼登入，**不是已接駁公司 SSO**。
4. 將真實 Auth user UUID 加入 `public.members`（只在受權 SQL Editor 操作）：

   ```sql
   insert into public.members (id, role)
   values ('REPLACE-WITH-AUTH-USER-UUID', 'admin');
   -- 前線讀取帳戶使用 'frontline'。沒有 membership 的帳戶無權讀取。
   ```

5. 將 `.env.example` 複製為 `.env.local`，填寫該 project URL 及 **publishable key**，執行 `pnpm dev`。**不需要 service-role key，也不要加入。**
6. 以 admin 登入，確認資料夾及六個場景，加入正式素材及正確 URL；另建 frontline 帳戶進行權限驗收。

業務需求、User Flow 及安全要求見 [docs/IT-REQUIREMENTS.md](docs/IT-REQUIREMENTS.md)。

Storage `catalog` bucket 為 private，每檔上限 50 MB。雲端素材直接上載到 Supabase，不經 Vercel request body；格式白名單及大小在伺服器與 bucket 同時限制。SVG、HTML 不接受上載。少量 repo-native `/demo/*.svg` 僅用於示意。

檔案以新名稱上載，不覆寫舊檔，避免替換失敗造成資料遺失。取消上載／替換後的無引用檔案會保留，須由管理員確認後清理；不含自動 GC。私人素材 signed URL 有效 120 秒，已簽出的 URL 不會因下架即時撤銷。前端有權取閱者仍可能儲存／截圖，這不是 DRM。

## Vercel Preview 部署

1. 先將程式推送至此 GitHub repo。空 repo 尚未有 default branch 時，owner 須初始化首個 branch；不要強制推送現有 branch。
2. Vercel Import Git Repository → 選擇此 repo → Next.js preset；root 是 repo 根目錄。
3. Node.js 24.x，install `pnpm install --frozen-lockfile`，build `pnpm build`。Supabase publishable 環境變數見 `.env.example`。
4. 先設定 Preview environment 的兩個 `NEXT_PUBLIC_SUPABASE_*` 變數。**不要設定 DEMO_MODE=true**；hosted build 不允許本機 demo。
5. 將 Supabase Auth 的 Site URL / approved redirect URLs 設定為項目的實際 URL。不要使用跨項目通配 redirect。
6. 首次 import 可能建立 Vercel production deployment；正式發佈前請先配置 Vercel Deployment Protection，並保留網站登入保護。優先在 feature branch 建立 Preview，確認後才指向正式域名。
7. 按 [docs/IT-REQUIREMENTS.md](docs/IT-REQUIREMENTS.md) 以兩種角色及真實平板驗收後，再批准 Production。

目前沒有建立雲端項目、產生收費、推送 production 或放入正式公司素材。

## 驗證及維護

```sh
pnpm typecheck
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
```

`tests/database.test.ts` 使用本機 WASM Postgres（PGlite），模擬 Supabase 管理的 Auth/Storage schema 以測 migration 及 RLS，**不等於已測試 hosted Supabase**。E2E 使用本機 demo，只有合成測試資料。

`qa/` 是被 gitignore 排除的本機畫面截圖。依賴版本以 lockfile 固定。PDF worker 由 postinstall 從同版 pdfjs-dist 複製，不載入外部 CDN。

## 架構及 MVP 界限

- Browser UI → Next.js `/api/*` → user-scoped Supabase client → RLS。API 使用 Auth `getUser()` 檢查身份；所有 session refresh 發生在可寫 cookies 的 Route Handler，沒有依赖 Server Component 的 session cookie 信任。
- 不持有或使用 service-role key；登入成功仍須檢查 membership。
- CMS POST 要求同 Host 的 Origin，並檢查 admin、輸入格式、上載目的地、產品 ID。內容更新含 `updatedAt` optimistic conflict check。
- 輕量 metadata 使用 `catalog_entries(entity,id,payload)` JSONB，適合早期目錄規模；每批500筆讀取，避免 Supabase default row limit 截斷。超大目錄應再改 server-side pagination / SQL search index；不宣稱支援任意規模。
- 前線可讀所有已發布目錄；搜尋範圍是資訊導覽規則，不是不同分店的保密權限。前端 snapshot 是已發布資料，不含草稿。
- 不含 OCR/PDF全文搜尋、Excel 批量匯入、eShop即時同步、SharePoint自動同步、公司SSO、離線、交易、复杂审批。
- 影片支援上載 MP4/WebM；第三方影片用「外部連結」開啟，不承諾任意網站 embed。
- 初始目錄的「簡易房」保留使用者原詞，正式命名仍待確認。

技術參考：[Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client)、[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)、[Next.js](https://nextjs.org/docs)。
