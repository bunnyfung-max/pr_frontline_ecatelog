# Implementation status — 2026-09-19

## Implemented locally

- Working Next.js application, five main entries, shared folders/search/viewer.
- Functional CMS, file upload to local persisted demo storage, Product Index and commerce settings.
- Supabase user-scoped Auth/DB/Private Storage integration, new-project SQL migrations and blank production seed.
- GitHub Actions verification workflow. Not run remotely until code is pushed.
- Local Chromium screenshots inspected at 1366×1024, 768×1024 and 390×844. Fixed an oversized hero, stacked search label, and upload Origin validation during verification.
- Latest unit/component/database suite: 29 passing tests, including first-level and inner folder cards/counts, search scope, product/kit URL isolation, fixed Sales Kit slots and mixed-media ordering, legacy compatibility, and Postgres JSONB/RLS simulation.
- New Housing upload now uses five reserved image slots (floor plan, rendering, product lists 1/2, optional supplement), followed by reorderable image/PDF/video attachments. Incomplete kits can be drafted; publishing requires the first four slots. Viewer follows the saved order, expands PDF pages in place and isolates videos. Real local upload/save/read lifecycle and IAB preview verified using one archived synthetic QA fixture; existing content unchanged. See `docs/sales-kit-upload.md` for evidence and limitations.
- Search-first design implemented: one keyword input and explicit Search button, no folder selector, five secondary two-column directory cards and readable Traditional Chinese type. Homepage cards now share the inner-directory folder icon, border, radius and live counts; narrow screens use one column. Scene root counts include active scene entries.
- Compact search targets landscape 1280×720 (16:9): 36px homepage heading, 20px input, 56px primary button. Latest requested card style uses 96px cards in three rows, allowing a short natural scroll instead of compressing cards/search. Portrait/mobile responsiveness and viewer rotation remain intact.
- Preview and automated-test default changed to 16:9. Non-mutating layout test updated for accessible cards and natural scrolling; equivalent dimensions checked through the in-app browser. Latest TypeScript/build and 29 unit/component/database tests pass. Root-card visual evidence is in `design-qa.md`.
- Products and individual content/Sales Kits now have their own 自在購/eShop links in their respective CMS editors. Viewer separates kit and linked-product destinations, with no global URL fallback; legacy product eShop URLs are preserved. Removed the shared store-link editor while retaining stored legacy settings and the existing Bundle Offer manager. See `docs/commerce-links.md`. Browser checked both editors and unsaved kit-link preview; test URLs were discarded, not saved or opened. Console warnings/errors were empty.
- All folder-browsing levels including homepage now follow the user's supplied card reference: rounded white cards, pale-gold folder icons, folder names, immediate-child folder/published-content counts and arrows. Two columns on desktop, one on mobile. Search results, CMS and catalogue-content list remain unchanged. Live counts exclude drafts, archived items and deeper descendants.
- Homepage now searches all published catalogue branches and active scenes. Inside a directory the server restricts results to that directory/descendants. Unknown/empty folder IDs fail closed. Keywords are metadata/Product Index matching, not OCR or natural-language AI search.
- Current browser checks via Codex in-app browser: global and scoped search, multiple keywords, Enter submission, no results/drafts, result viewer and retained query, scene search, CMS switch, portrait/landscape viewer and shopping drawer, tablet/mobile layout, no console warnings/errors. Browser test source updated for the new UI; Playwright CLI suite was not rerun this revision. Historical previous revision had 7 passing E2E tests including real PDF and CMS upload lifecycle.
- Approved mock saved in `docs/design/search-home-approved.png`; visual comparison and current QA outcome in `design-qa.md`. Official logo sourced from `https://www.pricerite.com.hk/images/pricerite-mobile-logo.svg?v=2`, with its Chinese wordmark cropped for the compact header; no redrawn logo.
- TypeScript and production build pass. These results do not certify the not-yet-connected cloud services.

## Not done / requires account connection and business inputs

- Repo was empty and public when inspected. GitHub connector reported `push: false`; local Git Credential Manager had no listed GitHub account. Source has not been pushed.
- No Supabase or Vercel project created, no paid services enabled, no real company files uploaded, no Production deployment.
- Hosted auth/storage/Preview acceptance, company-approved account enrolment, live eShop and 自在購 URLs, actual catalogue assets/Product Index, final housing taxonomy.
- iPad Safari / actual store tablet acceptance.

## Source and launch

Local folder: `C:\Users\bunnyfung\ChatGPT\pr_frontline_ecatelog`.
Local branch: `codex/frontline-mvp` (unborn branch until the first commit).
Start preview with `pnpm dev:demo`, then open `http://127.0.0.1:3000` on this computer.

Follow README for new Supabase project setup and a protected Vercel Preview. Do not expose `.data`, `.env.local`, staff information or internal source files through the public repository.
