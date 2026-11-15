# E-catalog design integration

The frontline UI follows the supplied E-catelog-Demo ZIP and the Figma overview supplied on 15 November 2026. The Figma URL is https://www.figma.com/design/jgbaB793hlJlXgPd0NUTdu/E-catelog . The ZIP and screenshot were the inspected design references; direct access to the Figma document was unavailable during implementation.

## Screens and behavior

- Staff login: storefront photograph, green welcome heading, orange sign-in button, existing authentication and validation.
- Home: folder illustrations, centered search, five category chips, existing CMS/cache controls and dynamic catalog entries. The project retains its configured entries, including scenes.
- Search and browsing: modal results with category icons, exact selected facets, highlighted matches, nested folder navigation, empty states and active scenes. Homepage search submits into one modal; folder-page search remains live and scoped.
- Reader: room/photo presentation, complete floorplan/PDF fitting, single/double pages, zoom, image enlargement, all-page thumbnail rail, document selector and unit switcher.
- Shopping: existing real product, price, store/eShop link and offer data; product details in the side panel. Unset links remain unavailable.
- Responsive layouts: desktop, landscape/portrait tablet and phone. Mobile text entry uses the device keyboard rather than a simulated keyboard that might interfere with input.

## Boundaries

The UI remains React components on the existing Next.js application. Reference demo scripts, demo catalog records and authentication simulation are not imported into the application. API routes, auth, CMS records, hosted storage providers, migrations and catalog seeds are unchanged. A small local-storage correction creates the user-specific upload directory before saving the first file; isolated CMS/PDF upload tests exposed the missing parent directory. Frontline CSS stays under `.ecat`; CMS retains its own styling. Fullscreen reader content replaces the underlying workspace while open, leaving one visible H1; CMS previews use H2.

## Verification

Use the installed Node tooling directly if the package manager attempts to bootstrap another version. The isolated verification environment uses a separate local demo server and fresh demo data; it does not load the real project's `.env.local` or `.data`.

Run TypeScript, unit tests and Playwright with the project's standard commands. Browser checks cover login, home, facets, directory navigation, empty results, CMS, viewer layout, zoom, thumbnails and shopping panels. The staging production build uses webpack because its shared dependency junction lies outside Turbopack's filesystem root; this does not change the application's build configuration.

Screenshot and saved DOM evidence, source baseline hashes, backups and the promotion manifest are retained in the sibling PriceRite workspace under `work/ecatalog_design_20261115/`. No deployment or Git push is part of this change.
