# 前線 e-Catalog 驗收

本機測試使用虛構資料；雲端項目及正式資料尚未提供，不應將本機結果視為上線批准。

| ID | 驗收情境 | 自動覆蓋 / 待辦 |
|---|---|---|
| A01 | 五個獨立入口 | unit + browser |
| A02 | 私樓/公居屋/簡易房 → 地區 → 屋苑 → 呎數/人數 | seeded 示例完整路径；正式屋苑待 CMS 建立 |
| A03 | POP 04、TMF 07、創造家 08；無 Weekly Summary | 初始目錄 unit；正式來源素材待業務提供 |
| A04 | 六個場景及正確 eShop 連結 | 六類 browser；真實 URL 待業務確認及設定 |
| A05 | 首頁搜尋全部；入目錄後只搜當層／下層，不返回其他屋苑／上層 | unit + browser + API |
| A06 | 同一格輸入名稱、編號、品牌、顏色、風格、目錄／屋苑或關鍵字；空格可組合多字詞 | unit + browser；正式 Product Index 待提供；不含 OCR/PDF 全文 |
| A07 | 橫向兩頁、直向單頁、保留位置、奇數末頁 | unit + Chromium viewport rotation；真實 iPad/Safari 待驗 |
| A08 | 購物列開關不重置頁碼；產品及 Sales Kit 各用自己的自在購 / eShop 連結，不套用共用網址 | browser preview + component/schema/Postgres tests；正式 URL 待驗 |
| A09 | CMS 本層／下層目的地及真實上載 | browser 本機持久化；Supabase hosted 上載待驗 |
| A10 | 草稿／下架不出現在前端 | unit + browser + Postgres RLS |
| A11 | 空資料夾、無結果、找不到檔案 | UI states + scoped search browser |
| A12 | Sales Kit 五個圖片位置，頭四張固定用途且發布必填，第五張選填，額外圖片/PDF/影片依保存次序展示 | unit + real local upload/save/read API + browser 預覽、排序、PDF及影片載入；hosted / 實際平板待驗 |

## 雲端上線前必測

- 先使用公司批准的 Supabase / Vercel 帳戶，確認私有檔案、region、費用、備份及管理人。
- 未登入：目錄、搜尋、資產 API 不可取閱；未批准 Auth user 不可取閱。
- frontline：可閱已發布內容及相關資產；CMS API/Storage 上載被拒。
- admin：上載接近50MB檔案，草稿→發布→下架；驗證跨裝置同步及 metadata 持久性。
- 將一個只存在草稿的 storage key 給 frontline，確認無法取得；同檔若已發布亦有引用則有權讀取。
- 登入 expiry/refresh、登出、錯誤密碼、Supabase unavailable、upload cancelled、stale edit conflict。
- 真實 PDF（大頁數及橫版）、影片、大圖、平板旋轉及 iPad Safari 的播放／縮放／全螢幕限制。
- 六個場景、每件產品及每份 Sales Kit 的自在購 / eShop、每個優惠卡片均須驗證正確 URL；價格／期限由內容團隊維護。
- 確認「簡易房」正式命名、目錄來源及業務完整性；沒有自動搬移現有 SharePoint 素材。

## 安全及運維限制

最多50MB/檔，不提供上載惡意軟件掃描；上載權限只發給可信管理員。需要防毒要求時，在正式導入素材前由 IT 安排掃描及檔案審核。此 MVP 不是 DRM；signed URLs 可在2分鐘內使用。

現有本機 demo 測試資料和 `.env.local` 不推送至 GitHub。公開 repo 只包含程式、合成插畫及通用目錄名。
