# 測試用登入帳戶（Dummy Accounts）

僅供 **Vercel Preview / 內部驗收** 使用，勿用於正式門市或放入真實客戶資料。

## 建議測試帳戶

| 用途 | 工作電郵 | 密碼 | `members.role` |
|------|----------|------|----------------|
| 管理員（可進 CMS） | `ecatalog-admin@test.pricerite.hk` | `TestAdmin#2026` | `admin` |
| 前線（只讀已發布） | `ecatalog-frontline@test.pricerite.hk` | `TestFront#2026` | `frontline` |

> 若 Supabase 不接受 `@test.pricerite.hk`，可改用你控制嘅真實測試電郵，密碼照用上面兩組。

## 首次部署後建立帳戶

若 Production 尚未有測試用戶，管理員可用 `CMS_UNLOCK_SECRET` 呼叫：

```sh
curl -X POST 'https://pr-frontline-ecatelog.vercel.app/api/bootstrap-test-users' \
  -H "Authorization: Bearer <CMS_UNLOCK_SECRET>"
```

此 API 會在需要時執行資料庫 migration，並建立／更新上表兩個測試帳戶。

## 在 Supabase 手動建立（替代方案）

### 1. 建立 Auth 用戶

Supabase Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**

- 勾選 **Auto Confirm User**（否則要收確認信）
- 分別建立 admin 與 frontline 兩個用戶

### 2. 加入 `public.members`

每個用戶建立後，複製其 **User UID**，在 **SQL Editor** 執行：

```sql
-- Admin（把 UUID 換成 ecatalog-admin 用戶的 UID）
insert into public.members (id, role)
values ('00000000-0000-4000-8000-000000000001', 'admin')
on conflict (id) do update set role = excluded.role;

-- Frontline（把 UUID 換成 ecatalog-frontline 用戶的 UID）
insert into public.members (id, role)
values ('00000000-0000-4000-8000-000000000002', 'frontline')
on conflict (id) do update set role = excluded.role;
```

### 3. Supabase Auth URL（若登入失敗）

**Authentication** → **URL Configuration**

- **Site URL**：`https://pr-frontline-ecatelog.vercel.app`
- **Redirect URLs** 加入：
  - `https://pr-frontline-ecatelog.vercel.app/**`
  - `https://*.vercel.app/**`（Preview 用）

## 登入後

| 帳戶 | 預期行為 |
|------|----------|
| Admin | 可瀏覽目錄；右上角「內容管理」→ 再輸入**同一個 Supabase 密碼**解鎖 CMS |
| Frontline | 只可瀏覽**已發布**內容；無 CMS 入口 |

## 本機 Demo（唔使上面帳戶）

```sh
pnpm dev:demo
```

- 免 Supabase 登入，自動 admin
- CMS 示例密碼：`Abc123`（見 UI 細字）
