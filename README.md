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

## 物件儲存（Catalog 素材）

CMS 上載的圖片、PDF、影片走 **Storage Provider 抽象層**（`src/lib/storage/`）。Catalog 只儲存 **provider 中性的 ref**，格式為：

```text
asset:{userId}/{uuid}.{ext}
```

例如 `asset:9f3c…/a1b2….mp4`。日後換 Supabase → S3，**不必改 catalog 內容或前端 Viewer**；只改環境變數及 provider 實作。

### 上載流程（現時）

```text
瀏覽器
  ① POST /api/storage/prepare   （JSON：檔名、大小、MIME；須 CMS 已解鎖 + admin）
  ② 直傳物件儲存               （檔案內容不經 Vercel request body）
  ③ POST /api/storage/complete （確認物件已存在）
  → 得到 asset: ref，再存入 catalog
```

讀取時：`/api/asset?ref=asset:…` 驗證 catalog 權限後，簽發 **120 秒** signed URL（Supabase）或回傳本機檔案（demo）。

相關程式：

| 路徑 | 用途 |
|---|---|
| `src/lib/storage/server/providers/supabase.ts` | 現時預設（Supabase Storage） |
| `src/lib/storage/server/providers/s3.ts` | 日後 S3（骨架已備，待接 AWS SDK） |
| `src/lib/storage/server/providers/local.ts` | 本機 demo（`.data/uploads/`） |
| `src/lib/storage/client/upload.ts` | 瀏覽器上載編排 |
| `src/app/api/storage/prepare` / `complete` | 上載準備與確認 |

### 接駁 Supabase Storage（現時預設）

1. 執行 `supabase/migrations/001_catalog.sql` 後，會建立 **private** bucket `catalog`，單檔上限 **50 MB**，允許 MIME：`image/jpeg`、`image/png`、`image/webp`、`application/pdf`、`video/mp4`、`video/webm`。
2. Storage RLS：只有 **catalog admin** 可上載，且 object key 首段必須是 `auth.uid()`（即 `{userId}/…`）。前線帳戶只能讀取已發布內容引用的素材。
3. 環境變數（Vercel / `.env.local`）：

   ```env
   STORAGE_PROVIDER=supabase
   STORAGE_BUCKET=catalog
   NEXT_PUBLIC_SUPABASE_URL=…
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=…
   ```

4. **不要**把上載改回 `/api/upload` 代理模式；該 route 僅供本機 demo，hosted 環境會拒絕（避免 Vercel ~4.5 MB body 限制導致影片失敗）。
5. 部署後驗收：以 admin 登入 CMS → 解鎖 → Sales Kit「其他檔案」上載一個 **MP4**（建議先試 < 50 MB）。若失敗，在 DevTools → Network 檢查 `prepare`、Supabase Storage 請求及錯誤訊息。

### 日後接駁 Amazon S3

切換步驟（catalog 素材；**試用回饋附件仍用 Supabase `feedback` bucket，不在此範圍**）：

1. 建立 **private** S3 bucket（建議與應用同區域，例如 `ap-southeast-1`）。
2. 建立 IAM 使用者或 role，至少具備目標 bucket 的 `s3:PutObject`、`s3:GetObject`（及日後 multipart 所需的 `s3:AbortMultipartUpload` 等）。
3. 設定環境變數：

   ```env
   STORAGE_PROVIDER=s3
   STORAGE_BUCKET=catalog          # S3 object key 前缀，例如 catalog/{userId}/{uuid}.mp4
   STORAGE_S3_BUCKET=your-bucket
   AWS_REGION=ap-southeast-1
   AWS_ACCESS_KEY_ID=…
   AWS_SECRET_ACCESS_KEY=…
   ```

4. 完成 `src/lib/storage/server/providers/s3.ts`：安裝 `@aws-sdk/client-s3`、`@aws-sdk/s3-request-presigner`，在 `prepareUpload` 簽發 presigned PUT URL，在 `getReadUrl` 簽發 presigned GET URL。`src/lib/storage/client/upload.ts` 已支援 `kind: 's3'` 的直傳。
5. **既有 `asset:` ref 可继续使用**；新上載走 S3。若要搬遷舊檔，可寫一次性腳本 copy object 並保留相同 key 結構，無需改 catalog JSON。
6. 若影片將超過 **50 MB** 或 **幾 GB**，須另做：**提高上限設定**、S3 **multipart upload**、Viewer **串流播放**（不要走 IndexedDB 全量 cache）。現時 MVP 仍為每檔 50 MB。

### 特別注意（現時限制）

| 項目 | 說明 |
|---|---|
| 單檔大小 | **50 MB**（客戶端、`uploadSchema`、Supabase bucket 三處一致） |
| 允許格式 | JPG、PNG、WebP、PDF、MP4、WebM；**不接受 SVG、HTML** |
| iPhone 影片 | `.mov` / `video/quicktime` 會在前端視作 **MP4** 上載（仍須為有效 MP4 內容） |
| 上載權限 | 須 **admin** + CMS 解鎖；前線帳戶不能上載 catalog 素材 |
| 不經 Vercel body | 大檔必須直傳 Supabase/S3；否則會在 serverless 層失敗 |
| 本機 demo | `DEMO_MODE=true` 時自動用 **local** provider，檔案在 `.data/uploads/` |
| 孤兒檔案 | 上載後若未存入 catalog、或替換後舊 ref 無引用，**不會自動刪除**；需管理員定期清理 storage |
| 讀取連結 | Signed URL **120 秒**；已簽出連結不會因下架即時失效；**不是 DRM** |
| 回饋附件 | 試用回饋截圖走 `/api/feedback/upload` → Supabase **`feedback`** bucket（5 MB 圖片），與 catalog 儲存分開 |
| S3 狀態 | `STORAGE_PROVIDER=s3` 已可選，但 **presigned 實作未完成**；生產環境請保持 `supabase` |

### 常見上載失敗原因

- **影片太大**：超過 50 MB → 壓縮或分段，或日後接 S3 multipart 並提高上限。
- **格式不符**：瀏覽器報 `video/quicktime` 但內容不是 MP4 → 用工具轉成 MP4。
- **未解鎖 CMS**：只登入但未輸入 CMS 密碼 → 上載 API 會 403。
- **非 admin 帳戶**：Storage RLS 拒絕 insert。
- **誤用舊上載路徑**：hosted 環境呼叫 `/api/upload` → 410；應走 `prepare` → 直傳 → `complete`。

## Vercel Preview 部署

1. 先將程式推送至此 GitHub repo。空 repo 尚未有 default branch 時，owner 須初始化首個 branch；不要強制推送現有 branch。
2. Vercel Import Git Repository → 選擇此 repo → Next.js preset；root 是 repo 根目錄。
3. Node.js 24.x，install `pnpm install --frozen-lockfile`，build `pnpm build`。環境變數見 `.env.example`（至少 `NEXT_PUBLIC_SUPABASE_*`、`CMS_UNLOCK_SECRET`、`STORAGE_PROVIDER=supabase`、`STORAGE_BUCKET=catalog`）。
4. 先設定 Preview environment 的 Supabase 及 Storage 變數。**不要設定 DEMO_MODE=true**；hosted build 不允許本機 demo。
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
