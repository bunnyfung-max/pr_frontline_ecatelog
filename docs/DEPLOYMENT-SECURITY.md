# 部署安全 Checklist

正式上線或對外 Preview 前，請逐項確認。此清單針對本 repo 的 Next.js + Supabase 架構，不取代公司整體安全政策。

## 1. 程式庫與存取

- [ ] GitHub repository 改為 **private**（README 已提醒：public repo 不適合放內部部署指引與結構）。
- [ ] 只有需要部署／維護的人員有 write 權限。
- [ ] **永不** commit：`.env.local`、service-role key、員工密碼、正式素材、客戶資料。
- [ ] 使用 `.env.example` 作為模板；正式值只放在 Vercel / Supabase 控制台。

## 2. Vercel

- [ ] **不要**在 Preview / Production 設定 `DEMO_MODE=true`（hosted build 不應進入本機示例模式）。
- [ ] 設定 `CMS_UNLOCK_SECRET`（`openssl rand -base64 32`），Preview 與 Production 各自使用強隨機值。
- [ ] 設定 `NEXT_PUBLIC_SUPABASE_URL` 與 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`（僅 publishable key，**不是** service-role）。
- [ ] 啟用 **Vercel Deployment Protection**（至少 Preview；Production 視內部政策）。
- [ ] 正式域名指向 Production 前，先在 feature branch Preview 完成驗收（見 `docs/ACCEPTANCE.md`）。

## 3. Supabase Auth 與成員

- [ ] 關閉 public signup；由管理員建立帳戶。
- [ ] 執行 migrations：`001_catalog.sql`、`002_seed.sql`（新 project 一次性）、`003_admin_delete.sql`。
- [ ] 每個可登入用戶在 `public.members` 有對應 row（`admin` 或 `frontline`）；無 membership 無法讀目錄。
- [ ] Supabase Auth **Site URL** 與 **Redirect URLs** 只允許本項目實際域名，不用跨項目通配。
- [ ] 按公司政策設定密碼強度、MFA（如適用）、rate limit。

## 4. CMS 第二道門

- [ ] Admin 進入「內容管理」須通過 CMS 密碼／重新驗證（`cms_unlock` cookie，8 小時、帳戶綁定）。
- [ ] 離開 CMS 或鎖定後，**草稿／下架素材**不可經 `/api/asset` 讀取（即使 session 仍是 admin）。
- [ ] 上載、保存、刪除等寫入 API 一律 `requireCmsAccess()`。
- [ ] 正式環境必設 `CMS_UNLOCK_SECRET`；勿依賴 development demo 的預設 secret。

## 5. Storage 與上載

- [ ] `catalog` bucket 保持 **private**；前端經 `/api/asset` 簽名轉址，不公開 bucket URL。
- [ ] 上載經伺服器 multipart + **magic byte** 驗證（`src/lib/upload-validation.ts`），不只信任瀏覽器 MIME。
- [ ] 白名單：JPG、PNG、WebP、PDF、MP4、WebM；單檔 ≤ 50 MB（API 與 bucket 一致）。
- [ ] 不接受 SVG、HTML 等可執行內容上載。
- [ ] 定期由管理員清理無引用舊檔（系統不自動 GC）。

## 6. HTTP 與 SEO

- [ ] Production 已啟用 CSP、HSTS（見 `next.config.ts`）。
- [ ] `robots.ts` 與 layout meta 阻擋搜尋引擎索引（內部目錄不應被 Google 收錄）。
- [ ] 仍假設有權閱讀者可能截圖／下載；此系統不是 DRM。

## 7. 前線與共用裝置

- [ ] Frontline 帳戶只能讀**已發布**內容；搜尋結果同樣受發布狀態限制。
- [ ] 目錄頁「下載緩存」會把已發布素材寫入裝置 IndexedDB；共用平板離開後考慮清除瀏覽資料或專用帳戶。
- [ ] Signed URL 有效 120 秒；已簽出連結不會因下架即時失效。

## 8. 驗收

- [ ] `pnpm typecheck`、`pnpm test`、`pnpm build` 通過。
- [ ] 以 **admin**（CMS 解鎖前／後）及 **frontline** 各驗收一輪。
- [ ] 嘗試未解鎖 admin 直接開草稿素材 URL → 應 404。
- [ ] 嘗試上載改擴展名的惡意檔 → 應被拒絕。

## 環境變數速查

| 變數 | Demo 本機 | Preview / Production |
|------|-----------|----------------------|
| `DEMO_MODE` | `true`（僅 development） | **勿設定** |
| `CMS_UNLOCK_SECRET` | 可省略（demo 用 dev 預設） | **必填** |
| `NEXT_PUBLIC_SUPABASE_*` | 可省略（用 demo） | **必填** |
| `DEMO_CMS_PASSWORD` | 可選 | **勿設定** |

詳見根目錄 `.env.example`。
