# First-level directory cards — design QA

Date: 2026-09-19 (Asia/Hong_Kong)

final result: passed

## Source, scope and state

- Source visual truth: `docs/design/root-cards-reference.png`, 1225 × 280px, supplied by the user.
- Apply the same existing folder-card style to the five homepage root entrances. Preserve search, names, navigation, internal cards, CMS and viewer behavior.
- Implementation: `http://127.0.0.1:3000/`, local demo, empty query. Reference contains three housing-category cards; destination contains five root names/counts. This requested content difference is intentional.
- Reuse installed Lucide Folder/Chevron icons, CJK fonts and existing card component; no new image assets required.

## Evidence and normalization

- Full homepage: `qa/root-cards-desktop.png`, 1265 × 779px full-page capture; CSS viewport 1280 × 720, DPR 1. The scrollbar accounts for capture width. Grid starts at x=108.5, y=438.78; width 1048px; cards 517 × 96px.
- Combined reference/implementation: `qa/root-cards-comparison.png`, opened and inspected. Reproduce with `scripts/compare-root-cards.ps1`.
- Source region x=26, y=19, 1153 × 227px normalized to 1048 × 207px. Source 55px icon tiles versus existing 50 CSS pixels are consistent with approximately 110% capture scaling; original zoom metadata is unavailable. Implementation crop x=108, y=438, 1048 × 317px includes all five root cards at native density; fractional-edge rounding is within one pixel.
- This component comparison is the focused review; all type/icons/borders are legible. Full homepage was separately opened for composition/search hierarchy review.
- Mobile: `qa/root-cards-mobile.png`. Override 390 × 844 physical pixels; settled DOM reported CSS viewport 355 × 767, DPR 1.1, document width 341 with scrollbar deduction. Five single-column cards, about 309 × 96 CSS pixels, no horizontal overflow; even cards retain borders and 14px padding. Desktop 16:9 override restored.

## Findings / comparison history

- No actionable P0/P1/P2 differences in the valid combined comparison.
- An optional inner-page screenshot caught loading content and was excluded. Initial three-panel board replaced by the valid source/homepage two-panel comparison; this corrected evidence, not UI design.
- Intentional: New Housing English alias sits beside the Chinese title, keeping counts on the second line.
- Intentional: five 96px cards need three rows. At 720px height the homepage naturally scrolls about 59px instead of shrinking the search controls/cards or clipping content. Regression test now requires above-fold search and accessible, uncropped cards.

## Required fidelity surfaces

- Fonts/typography: existing Noto Sans TC/Microsoft JhengHei stack, 18px bold titles, 14px counts, readable wrapping and no truncation. Reference matches after normalization.
- Spacing/layout: two columns, 14px gap, 96px min-height, 14px padding, 12px radius, 50px icon tile. Narrow screens use one column; identical component/style across browsing levels.
- Colors/tokens: white cards/page, light grey-green border, pale-gold icon background, muted gold folder outline and grey-green arrow; existing hover/focus retained.
- Images/assets: sharp, installed Lucide icons; no placeholders, new raster art or custom SVG approximations.
- Copy/content: all five entrances preserved. Counts reflect immediate subfolders/direct published content; scene root includes active scene entries. Drafts, archived items, deeper descendants and inactive scenes excluded.

## Implementation checklist / remaining gaps

- [x] Source, rendered full page and combined component comparison opened.
- [x] Home → New Housing navigation and scoped-search hint verified.
- [x] Home `米白色 梳化` search returned two expected published results; Clear restored cards.
- [x] Mobile single-column cards, borders, padding and no horizontal overflow checked.
- [x] Browser warnings/errors empty.
- [x] 29 unit/component/Postgres tests, TypeScript and production build passed.
- [x] E2E source updated; CLI suite not run this turn.
- [ ] Actual store tablet/iPad Safari and hosted-service acceptance remain separate.

No P3 follow-up needed. No publishing or content-data mutation. Previous inner-card QA retained in `docs/design/folder-cards-prior-qa.md`.
