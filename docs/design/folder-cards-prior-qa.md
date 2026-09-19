# Frontline folder-card design QA

Date: 2026-09-19 (Asia/Hong_Kong)

final result: passed

## Source and scope

- Source visual truth: `docs/design/folder-cards-reference.png` (658 × 252 pixels), copied from the user-supplied image.
- Change only the inner-directory "瀏覽此目錄" folder entries. Keep the existing homepage, search, content list and CMS unchanged.
- Reuse the project's existing Lucide Folder/Chevron icons and folder-card palette; no new raster art or approximate icon drawing is needed.
- Route/state: http://127.0.0.1:3000/?folder=housing ; empty search; local demo; three housing-type folders.

## Visual comparison evidence

- Full default page: `qa/folder-cards-landscape.png`, 1280 × 720 viewport/capture, devicePixelRatio 1.
- Matched-width page: `qa/folder-cards-matched-page.png`, CSS viewport/capture 702 × 900, devicePixelRatio 1. Grid is 630 × 206 CSS pixels at x=36, y=485.39.
- Implementation crop: `qa/folder-cards-matched-grid.png`, 630 × 207 pixels including fractional-edge rounding.
- Source crop: x=20, y=15, width=630, height=206. Both component views are native 1:1 pixels; no stretching or density resampling.
- Combined source/implementation comparison: `qa/folder-cards-comparison.png`, inspected at full size. Reproduction script: `scripts/compare-folder-cards.ps1`.
- This same-width component comparison is also the focused review: folder icons, typography, counts, chevrons and card borders are legible at 1:1. A second smaller crop is unnecessary.
- Mobile evidence: `qa/folder-cards-mobile.png`, verified 390 × 844 CSS viewport; three single-column cards and no horizontal overflow.

## Findings / comparison history

- No actionable P0/P1/P2 mismatch in the first valid combined comparison.
- A clipped browser capture was invalid, so it was discarded from comparison and replaced with a full-page-area capture cropped to measured DOM bounds. This was capture correction, not a visual-design pass.
- During implementation, excluded cards from the pre-existing mobile even-row list rule. Final mobile evidence verifies all cards retain their 1px left border and 14px left padding.
- Intentional adaptations: keep the currently approved white page background rather than restoring the old cream page; use slightly larger/darker readable text for the frontline audience. Wider screens use fluid card widths without increasing card height.

## Required fidelity surfaces

- **Fonts/typography:** Existing CJK font stack retained. Card title is 18px bold, supporting count 14px with 1.5 line height. Slightly larger and darker than the cropped reference, intentionally preserving legibility. Long names wrap instead of truncating.
- **Spacing/layout:** Two columns, 14px gap, 96px minimum card height, 14px card padding, 12px corner radius. Icon tile is 50 × 50px. Mobile uses one column. At 1280 × 720 the last housing card ends at y=691.39, so all three are visible together.
- **Colors/tokens:** White cards, subtle grey-green borders, pale gold icon tile, muted gold folder outline and grey-green chevron. Count text is darker than the reference for readability. Hover and visible keyboard focus retained.
- **Images/assets:** Reuse the same established Lucide outline Folder icon (26px, stroke 1.3) used in the older application style, plus ChevronRight. No custom SVG, placeholders or generated assets.
- **Copy/content:** Names and counts match current data. Counts mean immediate subfolders and directly contained published items, not all descendants. Draft/archived contents are excluded. Counts are not hardcoded to the supplied image.

## Checks performed

- Browser navigation: housing → private → Kowloon; actual child folders and updated counts appear.
- Returning home retains exactly five list-style entrances with no folder icons/counts.
- Mobile: 390px document width equals viewport; each card is 350 × 96px, all three left borders 1px and left padding 14px.
- Default 16:9 page visually inspected. Existing search area retained.
- TypeScript and production build passed.
- All 14 unit/component/database tests passed, including three new rendering tests for home preservation, live folder counts and exclusion of draft/archived/deeper items.
- CLI E2E suite not run; updated its affected navigation selectors to account for newly displayed counts.
- Browser warning/error log checked at handoff.

## Limits / checklist

- [x] User reference and browser rendering compared together.
- [x] Scope limited to internal folder-browsing cards.
- [x] Desktop/mobile layout, actual navigation and live counts checked.
- [x] TypeScript, production build and 14 tests passed.
- [ ] Actual store-device/iPad Safari and hosted-service acceptance remain separate.
- Local demo only; no account, repository publishing or deployment changes.
