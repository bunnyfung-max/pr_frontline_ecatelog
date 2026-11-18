import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FrontlineBrowser } from "../src/components/frontline-browser";
import { initialCatalog } from "../src/lib/seed";
import type { Catalog } from "../src/lib/types";

function render(data: Catalog, folderId?: string, query = "") {
  return renderToStaticMarkup(
    createElement(FrontlineBrowser, {
      data,
      folder: data.folders.find((f) => f.id === folderId),
      query,
      onSearch: () => {},
      navigate: () => {},
      open: () => {},
    }),
  );
}

test("category deep links preserve the search term and expose the active filter state", () => {
  const html = render(initialCatalog(true), undefined, "品牌 RIVO");
  assert.match(html, /aria-pressed="true"[^>]*>(?:(?!<\/button>)[\s\S])*品牌<\/button>/);
  assert.match(html, /aria-label="搜尋全部銷售資料"[^>]*value="RIVO"/);
  // The editable results-dialog field retains the category prefix so its
  // scope remains explicit when the search is revised.
  assert.match(html, /aria-label="修改搜尋關鍵字"[^>]*value="品牌 RIVO"/);
});

test("homepage uses the same five folder cards, retains search and names, and counts active scenes", () => {
  const html = render(initialCatalog(true));
  assert.equal(
    (
      html.match(
        /class="directory-entry folder-tile folder-tile-(?:ready|empty)"/g,
      ) || []
    ).length,
    5,
  );
  assert.equal(
    (html.match(/class="folder-tile-icon" aria-hidden="true"/g) || []).length,
    5,
  );
  assert.ok(html.includes("搜尋全部銷售資料"));
  assert.ok(
    html.includes('<span class="folder-tile-alias">New Housing</span>'),
  );
  assert.ok(
    html.includes(
      "<strong>場景推介</strong><small>0 個資料夾 · 6 項內容</small>",
    ),
  );
  for (const name of ["POP 展示", "TMF", "創造家"])
    assert.ok(html.includes(`<strong>${name}</strong>`));
});

test("root counts include published descendants and active scene entries only", () => {
  const data = initialCatalog(true);
  const c = data.contents[0];
  data.contents.push({ ...c, id: "root-published", folderId: "pop" });
  data.contents.push({
    ...c,
    id: "root-draft",
    folderId: "pop",
    status: "draft",
  });
  data.contents.push({
    ...c,
    id: "root-archived",
    folderId: "pop",
    status: "archived",
  });
  data.scenes[0].active = false;
  const html = render(data);
  assert.ok(
    html.includes(
      "<strong>POP 展示</strong><small>4 個資料夾 · 2 項內容（含下層）</small>",
    ),
  );
  assert.ok(
    html.includes(
      "<strong>場景推介</strong><small>0 個資料夾 · 5 項內容</small>",
    ),
  );
});

test("folder browsing highlights folders with content and mutes empty ones", () => {
  const data = initialCatalog(true);
  const html = render(data, "housing");
  assert.equal((html.match(/folder-tile-ready/g) || []).length, 2);
  assert.equal((html.match(/folder-tile-empty/g) || []).length, 1);
  assert.ok(
    html.includes(
      "<strong>私人屋苑</strong><small>2 個資料夾 · 2 項內容（含下層）</small>",
    ),
  );
  assert.ok(
    html.includes(
      "<strong>公居屋</strong><small>0 個資料夾 · 2 項內容</small>",
    ),
  );
  assert.ok(html.includes("<strong>簡約公屋</strong><small>暫無內容</small>"));
  assert.equal(
    (html.match(/class="folder-tile-icon" aria-hidden="true"/g) || []).length,
    3,
  );
});

test("empty folders use muted styling and copy", () => {
  const data = initialCatalog(true);
  data.contents = [];
  const html = render(data, "housing");
  assert.equal((html.match(/folder-tile-empty/g) || []).length, 3);
  assert.ok(html.includes("<strong>私人屋苑</strong><small>暫無內容</small>"));
  assert.ok(html.includes("<strong>公居屋</strong><small>暫無內容</small>"));
});

test("folder content counts include published descendants but exclude drafts and archived items", () => {
  const data = initialCatalog(true);
  const template = data.contents.find((item) => item.id === "kit-a")!;
  data.contents.push(
    {
      ...template,
      id: "published",
      folderId: "private",
      status: "published",
      name: "Published",
    },
    {
      ...template,
      id: "draft",
      folderId: "private",
      status: "draft",
      name: "Draft",
    },
    {
      ...template,
      id: "archived",
      folderId: "private",
      status: "archived",
      name: "Archived",
    },
    {
      ...template,
      id: "descendant",
      folderId: "unit-a",
      status: "published",
      name: "Descendant",
    },
  );
  assert.ok(
    render(data, "housing").includes(
      "<strong>私人屋苑</strong><small>2 個資料夾 · 4 項內容（含下層）</small>",
    ),
  );
});
