"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type SyntheticEvent,
} from "react";
import {
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Folder as FolderIcon,
  House,
  X,
} from "lucide-react";
import type { Catalog, Content, Folder, Product, Scene } from "@/lib/types";
import { TYPE_LABEL } from "@/lib/types";
import {
  SEARCH_CATEGORY_LABEL,
  parseSearchQuery,
  type SearchCategory,
  type SearchMatchReason,
} from "@/lib/catalog-search";
import {
  byOrder,
  folderLabel,
  folderPublishedContents,
  searchCatalogEnhanced,
  trail,
} from "@/lib/catalog";
import { assetUrl } from "@/lib/client";
import { contentPreviewRef } from "@/lib/content-display";
import { prefetchContent } from "@/lib/content-prefetch";
import { ContentShoppingLinks } from "./shopping-links";
import { estateNamesForFolder } from "@/lib/housing-estate";

export type LibraryRequest =
  | { mode: "directory"; folderId: string }
  | { mode: "scope"; scope: SearchCategory }
  | { mode: "search"; query: string };

const SCOPE_ORDER: SearchCategory[] = [
  "product",
  "brand",
  "colour",
  "style",
  "estate",
];
const SCOPE_ICONS: Record<SearchCategory, string> = {
  product: "product",
  brand: "brandGlyph",
  colour: "color",
  style: "style",
  estate: "estate",
};
const normalized = (value: string) =>
  value.normalize("NFKC").toLocaleLowerCase("zh-HK").trim();

const estateValues = (data: Catalog, content: Content) => estateNamesForFolder(data.folders, content.folderId);

function ScrollStrip({ label, children, directory = false }: { label: string; children: React.ReactNode; directory?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ before: false, after: false });
  const update = () => {
    const node = ref.current;
    if (node) {
      const before = node.scrollLeft > 1;
      const after = node.scrollLeft + node.clientWidth < node.scrollWidth - 1;
      setEdges((previous) => previous.before === before && previous.after === after ? previous : { before, after });
    }
  };
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [children]);
  const scroll = (direction: number) => ref.current?.scrollBy({ left: direction * Math.max(180, ref.current.clientWidth * 0.7), behavior: "smooth" });
  return (
    <div className={directory ? "directory-tabs-wrap" : "scope-options-wrap"}>
      <button type="button" className="scope-scroll-arrow" aria-label={`向左查看${label}`} disabled={!edges.before} onClick={() => scroll(-1)}><ChevronLeft size={18} aria-hidden="true" /></button>
      <nav className={directory ? "library-tabs housing-folder-tabs" : "browse-options"} aria-label={label} ref={ref} onScroll={update}>{children}</nav>
      <button type="button" className="scope-scroll-arrow" aria-label={`向右查看${label}`} disabled={!edges.after} onClick={() => scroll(1)}><ChevronRight size={18} aria-hidden="true" /></button>
    </div>
  );
}

function coverOf(content: Content) {
  const ref = contentPreviewRef(content);
  return ref ? assetUrl(ref) : "";
}

function contentSummary(data: Catalog, content: Content) {
  const place = trail(data.folders, content.folderId)
    .map(folderLabel)
    .filter(Boolean);
  const bits = [place.at(-1) || ""];
  if (content.salesKit) bits.push("空間 · 配置 · 資料");
  else if (content.files.length)
    bits.push(`${content.files.filter(Boolean).length} 項內容`);
  return bits.filter(Boolean).join(" · ");
}

function CaseCards({
  data,
  items,
  onOpen,
  variant = "directory",
  query = "",
  reasons,
}: {
  data: Catalog;
  items: Content[];
  onOpen: (content: Content) => void;
  variant?: "directory" | "scope";
  query?: string;
  reasons?: Map<string, SearchMatchReason[]>;
}) {
  return (
    <div className="case-grid">
      {items.map((content) => {
        const cover = coverOf(content);
        const planOnly =
          !content.salesKit && /平面圖|floor.?plan/i.test(content.name);
        const evidence =
          reasons
            ?.get(content.id)
            ?.filter((reason) => reason.value !== content.name)
            .slice(0, 2) ?? [];
        return (
          <button
            className={`case-card ${variant}-card${planOnly ? " plan-only" : ""}`}
            type="button"
            key={content.id}
            onClick={() => onOpen(content)}
            onMouseEnter={() => prefetchContent(content)}
            onFocus={() => prefetchContent(content)}
          >
            <span className="case-cover">
              {cover ? (
                <img src={cover} alt="" loading="lazy" />
              ) : (
                <span className="paper-grid" />
              )}
              <span className="case-badge">
                {planOnly
                  ? "單位平面圖"
                  : content.salesKit
                    ? "空間 · 配置 · 資料"
                    : TYPE_LABEL[content.type]}
              </span>
            </span>
            <h3 title={content.name}>
              <Highlight text={content.name} query={query} />
            </h3>
            {evidence.length ? (
              <div className="scope-card-details">
                {evidence.map((reason) => (
                  <span
                    className="scope-card-line"
                    key={`${reason.label}-${reason.value}`}
                  >
                    <span>{reason.label}</span>
                    <span>
                      {" "}
                      · <Highlight text={reason.value} query={query} />
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="case-summary">{contentSummary(data, content).split(" · ").map((part, index) => (
                <span className="case-summary-part" key={`${part}-${index}`}>{index > 0 && <span className="case-summary-separator" aria-hidden="true"> · </span>}{part}</span>
              ))}</p>
            )}
            <span className="case-go">
              <span>查看資料</span>
              <ChevronRight size={16} aria-hidden="true" />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
  }, []);
  return {
    ref,
    onCancel: (event: SyntheticEvent) => {
      event.preventDefault();
      onClose();
    },
    onClick: (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        onClose();
    },
  };
}

function CloseButton({
  label,
  onClose,
}: {
  label: string;
  onClose: () => void;
}) {
  return (
    <button
      className="round"
      type="button"
      aria-label={label}
      onClick={onClose}
    >
      <X size={18} />
    </button>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const terms = parseSearchQuery(query)
    .terms.filter(Boolean)
    .sort((a, b) => b.length - a.length);
  if (!terms.length) return <>{text}</>;
  const lower = text.toLocaleLowerCase("zh-HK");
  const pieces: React.ReactNode[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const next = terms
      .map((term) => ({ term, index: lower.indexOf(term, cursor) }))
      .filter((match) => match.index >= 0)
      .sort((a, b) => a.index - b.index || b.term.length - a.term.length)[0];
    if (!next) {
      pieces.push(text.slice(cursor));
      break;
    }
    if (next.index > cursor) pieces.push(text.slice(cursor, next.index));
    pieces.push(
      <mark className="search-hit" key={next.index}>
        {text.slice(next.index, next.index + next.term.length)}
      </mark>,
    );
    cursor = next.index + next.term.length;
  }
  return <>{pieces}</>;
}

function FolderLinks({
  folders,
  onSelect,
  label,
}: {
  folders: Folder[];
  onSelect: (id: string) => void;
  label: string;
}) {
  if (!folders.length) return null;
  return (
    <nav className="library-tabs library-folder-links" aria-label={label}>
      {folders.map((folder) => (
        <button
          key={folder.id}
          type="button"
          onClick={() => onSelect(folder.id)}
        >
          <FolderIcon size={18} aria-hidden="true" />
          <span>{folderLabel(folder)}</span>
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}

function SceneCards({ scenes }: { scenes: Scene[] }) {
  if (!scenes.length) return null;
  return (
    <div className="case-grid scene-grid">
      {scenes.map((scene) => {
        const body = (
          <>
            <span className="case-cover">
              {scene.image ? (
                <img src={assetUrl(scene.image)} alt="" loading="lazy" />
              ) : (
                <span className="paper-grid" />
              )}
            </span>
            <h3>{scene.name}</h3>
            <p>{scene.url ? "開啟 eShop 場景推介" : "連結待設定"}</p>
            {scene.url && (
              <span className="case-go">
                查看推介 <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            )}
          </>
        );
        return scene.url ? (
          <a
            className="case-card directory-card"
            key={scene.id}
            href={scene.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {body}
          </a>
        ) : (
          <div
            className="case-card directory-card unconfigured"
            key={scene.id}
            aria-disabled="true"
          >
            {body}
          </div>
        );
      })}
    </div>
  );
}

export function ShowcaseLibrary({
  data,
  request,
  onClose,
  onNavigate,
  onOpen,
  onScope,
  onSearch,
}: {
  data: Catalog;
  request: LibraryRequest;
  onClose: () => void;
  onNavigate: (folderId: string) => void;
  onOpen: (content: Content) => void;
  onScope: (scope: SearchCategory) => void;
  onSearch?: (query: string) => void;
}) {
  const dialog = useDialog(onClose);
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [scopeQuery, setScopeQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [searchInput, setSearchInput] = useState(request.mode === "search" ? request.query : "");
  useEffect(() => { if (request.mode === "search") setSearchInput(request.query); }, [request]);
  const folder =
    request.mode === "directory"
      ? data.folders.find((item) => item.id === request.folderId)
      : undefined;
  const children = useMemo(
    () =>
      folder
        ? data.folders
            .filter((item) => item.parentId === folder.id)
            .sort(byOrder)
        : [],
    [data.folders, folder],
  );
  const [childId, setChildId] = useState("");
  const activeFolder =
    data.folders.find(
      (item) =>
        item.id === childId &&
        folder &&
        trail(data.folders, item.id).some((parent) => parent.id === folder.id),
    ) || folder;
  const activePath =
    activeFolder && folder
      ? trail(data.folders, activeFolder.id).filter(
          (item, index, path) =>
            index >= path.findIndex((parent) => parent.id === folder.id),
        )
      : [];
  const nestedFolders =
    activeFolder && activeFolder.id !== folder?.id
      ? data.folders
          .filter((item) => item.parentId === activeFolder.id)
          .sort(byOrder)
      : [];
  const directoryResults = useMemo(
    () =>
      activeFolder && directoryQuery.trim()
        ? searchCatalogEnhanced(data, activeFolder.id, directoryQuery)
        : null,
    [data, activeFolder, directoryQuery],
  );
  const directoryItems = directoryResults
    ? directoryResults.contents.map((entry) => entry.item)
    : activeFolder
      ? folderPublishedContents(data, activeFolder.id).sort(byOrder)
      : [];
  const directoryScenes = directoryResults
    ? directoryResults.scenes.map((entry) => entry.item)
    : activeFolder?.id === "scenes"
      ? data.scenes.filter((scene) => scene.active).sort(byOrder)
      : [];
  const directoryFolders = directoryResults
    ? directoryResults.folders
        .map((entry) => entry.item)
        .filter((item) => item.id !== activeFolder?.id)
    : nestedFolders;

  const scope = request.mode === "scope" ? request.scope : "product";
  const scopeLabel = SEARCH_CATEGORY_LABEL[scope];
  const options = useMemo(
    () => (request.mode === "scope" ? browseOptions(data, scope) : []),
    [data, request.mode, scope],
  );
  const visibleOptions = options.filter(
    (option) =>
      option.key === selectedValue || !scopeQuery.trim() ||
      normalized(option.label).includes(normalized(scopeQuery)),
  );
  const selected = options.find((option) => option.key === selectedValue);
  const scopedQuery = [selected?.label, scopeQuery.trim()]
    .filter(Boolean)
    .join(" ");
  const scopeResults = useMemo(
    () =>
      request.mode === "scope" && scope !== "estate" && scopeQuery.trim()
        ? searchCatalogEnhanced(
            data,
            null,
            `${SEARCH_CATEGORY_LABEL[scope]} ${scopeQuery}`,
          )
        : null,
    [data, request.mode, scope, scopeQuery],
  );
  const scopeCandidates = (scopeResults
    ? scopeResults.contents.map((entry) => entry.item)
    : data.contents
        .filter(
          (content) =>
            content.status === "published" &&
            browseValues(data, content, scope).length > 0,
        )
        .sort(byOrder)).filter((content) => scope !== "estate" || (
          estateValues(data, content).length > 0 &&
          parseSearchQuery(`屋苑 ${scopeQuery}`).terms.every((term) =>
            estateValues(data, content).some((name) => normalized(name).includes(normalized(term)))
          )
        ));
  const scopeItems = selected
    ? scopeCandidates.filter((content) => browseValues(data, content, scope).some((value) => normalized(value) === selected.key))
    : scopeCandidates;
  const searchResults = useMemo(
    () =>
      request.mode === "search"
        ? searchCatalogEnhanced(data, null, request.query)
        : null,
    [data, request],
  );
  const searchItems = searchResults?.contents.map((entry) => entry.item) ?? [];
  const searchFolders = searchResults?.folders.map((entry) => entry.item) ?? [];
  const searchScenes = searchResults?.scenes.map((entry) => entry.item) ?? [];
  const searchCount =
    searchItems.length + searchFolders.length + searchScenes.length;
  const evidence = (results: typeof searchResults) =>
    new Map(
      results?.contents.map((entry) => [entry.item.id, entry.reasons]) ?? [],
    );
  const selectFolder = (id: string) => {
    setChildId(id);
    setDirectoryQuery("");
  };
  const navigateFolder = (id: string) => {
    onClose();
    onNavigate(id);
  };

  const openContent = (content: Content) => {
    onClose();
    onOpen(content);
  };

  return (
    <dialog
      id="library-dialog"
      ref={dialog.ref}
      aria-labelledby="library-title"
      data-mode={request.mode}
      data-tone={
        folder
          ? folder.id === "tmf"
            ? "apricot"
            : folder.id === "creator"
              ? "sand"
              : "mint"
          : "mint"
      }
      onCancel={dialog.onCancel}
      onClick={dialog.onClick}
    >
      {request.mode === "directory" && folder && (
        <>
          <div className="sheet-head">
            <div>
              <h2 id="library-title">{folderLabel(folder)}</h2>
              <p className="directory-intro">輕點項目，直接查看相關資料</p>
            </div>
            <CloseButton label="關閉資料目錄" onClose={onClose} />
          </div>
          <div className="directory-toolbar">
            {children.length > 0 && (
              <ScrollStrip directory label={`${folderLabel(folder)}資料夾`}>
                <button
                  type="button"
                  aria-pressed={activeFolder?.id === folder.id}
                  onClick={() => selectFolder(folder.id)}
                >
                  <FolderIcon
                    className="housing-folder-icon"
                    aria-hidden="true"
                  />
                  <span>全部</span>
                </button>
                {children.map((child) => {
                  const Icon = /private|public|私人|公居/.test(
                    `${child.id} ${child.name}`,
                  )
                    ? Building2
                    : House;
                  return (
                    <button
                      key={child.id}
                      type="button"
                      aria-pressed={activePath.some(
                        (item) => item.id === child.id,
                      )}
                      onClick={() => selectFolder(child.id)}
                    >
                      <Icon
                        className="housing-folder-icon"
                        aria-hidden="true"
                      />
                      <span>{folderLabel(child)}</span>
                    </button>
                  );
                })}
              </ScrollStrip>
            )}
            <form
              className="library-filter"
              role="search"
              onSubmit={(event) => event.preventDefault()}
            >
              <img src="/frontline/figma/search.svg" alt="" />
              <input
                type="search"
                aria-label="在資料夾內搜尋"
                placeholder="開始搜索你要的"
                value={directoryQuery}
                onChange={(event) => setDirectoryQuery(event.target.value)}
              />
              <button type="submit">搜尋</button>
            </form>
          </div>
          {activePath.length > 1 && (
            <nav className="library-tabs library-path" aria-label="資料夾路徑">
              {activePath.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  aria-current={
                    item.id === activeFolder?.id ? "page" : undefined
                  }
                  onClick={() => selectFolder(item.id)}
                >
                  {index > 0 && <ChevronRight size={14} aria-hidden="true" />}
                  {folderLabel(item)}
                </button>
              ))}
            </nav>
          )}
          <FolderLinks
            folders={directoryFolders}
            onSelect={selectFolder}
            label={directoryQuery.trim() ? "相符資料夾" : "下層資料夾"}
          />
          {directoryItems.length + directoryScenes.length > 0 ? (
            <>
              <p className="library-count" role="status">
                {directoryItems.length + directoryScenes.length} 項資料
                {directoryQuery.trim()
                  ? "符合搜尋"
                  : activeFolder &&
                      data.folders.some(
                        (item) => item.parentId === activeFolder.id,
                      )
                    ? "（包括下層目錄）"
                    : ""}
              </p>
              <CaseCards
                data={data}
                items={directoryItems}
                onOpen={openContent}
                query={directoryQuery}
                reasons={evidence(directoryResults)}
              />
              <SceneCards scenes={directoryScenes} />
            </>
          ) : (
            <div className="library-empty">
              <h3>
                {directoryQuery.trim() ? "沒有相符資料" : "暫無可預覽內容"}
              </h3>
              <p>
                {directoryQuery.trim()
                  ? "試試屋苑名稱、房型或產品關鍵字。"
                  : `${folderLabel(activeFolder || folder)}尚未提供展示資料。`}
              </p>
            </div>
          )}
        </>
      )}
      {request.mode === "search" && (
        <>
          <div className="sheet-head">
            <div>
              <p className="entry-kicker">搜尋銷售資料</p>
              <h2 id="library-title">
                {request.query.trim()
                  ? `「${request.query.trim()}」的搜尋結果`
                  : "全部的搜尋結果"}
              </h2>
            </div>
            <CloseButton label="關閉搜尋結果" onClose={onClose} />
          </div>
          <form className="global-results-search" role="search" onSubmit={(event) => { event.preventDefault(); const value = searchInput.trim(); if (value) onSearch?.(value); }}>
            <img src="/frontline/figma/search.svg" alt="" />
            <input type="search" aria-label="修改搜尋關鍵字" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="搜尋產品、屋苑或資料" />
            <button type="submit">搜尋</button>
          </form>
          <p className="library-count" role="status">
            {searchCount} 項相符資料
          </p>
          {searchCount > 0 ? (
            <>
              <CaseCards
                data={data}
                items={searchItems}
                onOpen={openContent}
                variant="scope"
                query={request.query}
                reasons={evidence(searchResults)}
              />
              {searchFolders.length > 0 && (
                <>
                  <h3 className="library-count">相關目錄</h3>
                  <FolderLinks
                    folders={searchFolders}
                    onSelect={navigateFolder}
                    label="相關目錄"
                  />
                </>
              )}
              {searchScenes.length > 0 && (
                <>
                  <h3 className="library-count">場景推介</h3>
                  <SceneCards scenes={searchScenes} />
                </>
              )}
            </>
          ) : (
            <div className="library-empty figma-empty search-empty">
              <div className="empty-search-art" aria-hidden="true">
                ?
              </div>
              <h3>沒有找到相符資料</h3>
              <p>試試其他產品、品牌或屋苑名稱</p>
            </div>
          )}
        </>
      )}
      {request.mode === "scope" && (
        <>
          <div className="sheet-head">
            <div>
              <h2 id="library-title">按{scopeLabel}找資料</h2>
              <p className="browse-intro">輕點項目，直接查看相關資料</p>
            </div>
            <CloseButton label="關閉分類瀏覽" onClose={onClose} />
          </div>
          <div className="browse-toolbar">
            <nav className="library-tabs browse-tabs" aria-label="資料分類">
              {SCOPE_ORDER.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={item === scope}
                  onClick={() => {
                    setSelectedValue("");
                    setScopeQuery("");
                    onScope(item);
                  }}
                >
                  <img
                    src={`/frontline/figma/${SCOPE_ICONS[item]}.svg`}
                    alt=""
                  />
                  {SEARCH_CATEGORY_LABEL[item]}
                </button>
              ))}
            </nav>
            <form
              id="scope-search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <img src="/frontline/figma/search.svg" alt="" />
              <input
                type="search"
                aria-label={`搜尋${scopeLabel}`}
                placeholder={`搜尋${scopeLabel}`}
                value={scopeQuery}
                onChange={(event) => setScopeQuery(event.target.value)}
              />
              <button type="submit">搜尋</button>
            </form>
          </div>
          {options.length === 0 && !scopeQuery.trim() ? (
            <div className="library-empty figma-empty">
              <img
                className="empty-art"
                src="/frontline/figma/empty-style.svg"
                alt=""
              />
              <h3>暫未提供{scopeLabel}資料</h3>
              <p>可先選擇其他分類，查看現有的展示資料</p>
            </div>
          ) : (
            <>
              <ScrollStrip label={`選擇${scopeLabel}`}>
                <button
                  type="button"
                  aria-pressed={!selectedValue}
                  onClick={() => setSelectedValue("")}
                >
                  全部{scopeLabel}
                </button>
                {visibleOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={selectedValue === option.key}
                    onClick={() => setSelectedValue(option.key)}
                  >
                    <span>{option.label}</span>
                    <small>{option.count}</small>
                  </button>
                ))}
              </ScrollStrip>
              {(selected || scopeQuery.trim()) && (
                <div className="scope-active-filter" role="status">
                  {selected && <span>已選：<strong>{selected.label}</strong></span>}
                  {selected && <button type="button" onClick={() => setSelectedValue("")}>清除已選</button>}
                  {scopeQuery.trim() && <button type="button" onClick={() => setScopeQuery("")}>清除搜尋</button>}
                </div>
              )}
              <div className="browse-results-head">
                <h3>
                  {options.find((option) => option.key === selectedValue)
                    ?.label || "全部相關資料"}
                </h3>
                <p role="status">{scopeItems.length} 份資料</p>
              </div>
              {scopeItems.length > 0 ? (
                <CaseCards
                  data={data}
                  items={scopeItems}
                  onOpen={openContent}
                  variant="scope"
                  query={scopedQuery}
                  reasons={evidence(scopeResults)}
                />
              ) : (
                <p className="scope-no-results">
                  沒有找到相符的{scopeLabel}資料
                </p>
              )}
            </>
          )}
        </>
      )}
    </dialog>
  );
}

function browseValues(data: Catalog, content: Content, scope: SearchCategory) {
  const products = content.productIds
    .map((id) => data.products.find((item) => item.id === id))
    .filter((item): item is Product => Boolean(item));
  const place = trail(data.folders, content.folderId);
  const tags = content.tags.map((tag) => tag.trim()).filter(Boolean);
  if (scope === "product") {
    return [
      ...products.flatMap((product) => [product.name, product.code]),
      ...content.eshopProducts.flatMap((item) => [item.title, item.sku]),
      ...tags,
    ].filter(Boolean);
  }
  if (scope === "brand") {
    return [
      ...products.map((product) => product.brand),
      ...content.eshopProducts.map((item) => item.brand),
      ...tags.filter((tag) => /品牌/.test(tag)),
    ].filter(Boolean);
  }
  if (scope === "colour")
    return [...products.map((product) => product.colour), ...tags.filter((tag) => /色/.test(tag))].filter(Boolean);
  if (scope === "style")
    return [...products.map((product) => product.style), ...tags.filter((tag) => /簡約|日式|北歐|現代|風格/.test(tag))].filter(Boolean);
  return estateValues(data, content);
}

function browseOptions(data: Catalog, scope: SearchCategory) {
  const found = new Map<
    string,
    { key: string; label: string; count: number }
  >();
  for (const content of data.contents) {
    if (content.status !== "published") continue;
    const values = new Map(
      browseValues(data, content, scope).map((value) => [
        normalized(value),
        value.trim(),
      ]),
    );
    for (const [key, label] of values) {
      if (!key || (scope === "product" && /^\d{4,}$/.test(key))) continue;
      const current = found.get(key) || { key, label, count: 0 };
      current.count += 1;
      found.set(key, current);
    }
  }
  return [...found.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-HK"),
  );
}

export function ShowcaseViewerSheets({
  sheet,
  onClose,
  data,
  content,
  units,
  pages,
  imageSrc,
  imageLabel,
  onOpenContent,
  onSelectPage,
}: {
  sheet: "browse" | "documents" | "furniture" | "zoom" | null;
  onClose: () => void;
  data: Catalog;
  content: Content;
  units: Folder[];
  pages: { name: string; image: string; page: number }[];
  imageSrc: string;
  imageLabel: string;
  onOpenContent: (contentId: string) => void;
  onSelectPage: (page: number) => void;
}) {
  const dialog = useDialog(onClose);
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const zoomCanvas = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (sheet !== "zoom") return;
    const node = zoomCanvas.current;
    if (!node) return;
    const measure = () => setCanvasSize((old) => old.width === node.clientWidth && old.height === node.clientHeight ? old : { width: node.clientWidth, height: node.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [sheet]);
  const fit = imageSize.width && imageSize.height && canvasSize.width && canvasSize.height
    ? Math.min(canvasSize.width / imageSize.width, canvasSize.height / imageSize.height)
    : 0;
  useLayoutEffect(() => {
    const node = zoomCanvas.current;
    if (!node || !fit) return;
    const frame = requestAnimationFrame(() => {
      node.scrollLeft = Math.max(0, (node.scrollWidth - node.clientWidth) / 2);
      node.scrollTop = Math.max(0, (node.scrollHeight - node.clientHeight) / 2);
    });
    return () => cancelAnimationFrame(frame);
  }, [zoom, fit]);
  if (!sheet) return null;
  const needle = query.trim().toLocaleLowerCase("zh-HK");
  const rootId = trail(data.folders, content.folderId)[0]?.id || units[0]?.id;
  const cases = data.contents
    .filter(
      (item) =>
        item.status === "published" &&
        trail(data.folders, item.folderId).some(
          (folder) => folder.id === rootId,
        ),
    )
    .filter(
      (item) =>
        !needle ||
        `${item.name} ${trail(data.folders, item.folderId).map(folderLabel).join(" ")}`
          .toLocaleLowerCase("zh-HK")
          .includes(needle),
    )
    .sort(byOrder);
  const documents = pages.filter(
    (page) => !needle || page.name.toLocaleLowerCase("zh-HK").includes(needle),
  );
  const linked = content.productIds
    .map((id) => data.products.find((item) => item.id === id))
    .filter((item): item is Product => Boolean(item));
  const dialogId =
    sheet === "furniture"
      ? "furniture"
      : sheet === "zoom"
        ? "image-dialog"
        : "browse";
  return (
    <dialog
      id={dialogId}
      data-sheet={sheet}
      aria-labelledby={sheet === 'furniture' ? 'furniture-title' : sheet === 'zoom' ? undefined : 'browse-title'}
      aria-label={sheet === 'zoom' ? '放大檢視圖片' : undefined}
      ref={dialog.ref}
      onCancel={dialog.onCancel}
      onClick={dialog.onClick}
    >
      {sheet === "browse" && (
        <>
          <div className="sheet-head">
            <div>
              <p className="entry-kicker">EXPLORE TOGETHER</p>
              <h2 id="browse-title">今天想看看哪個家？</h2>
            </div>
            <CloseButton label="關閉單位選擇" onClose={onClose} />
          </div>
          <label className="library-filter">
            <img src="/frontline/figma/search.svg" alt="" />
            <input
              type="search"
              aria-label="搜尋單位資料"
              placeholder="搜尋屋苑、目錄或房型名稱"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <p className="library-count">{cases.length} 份房型資料</p>
          {cases.length > 0 ? (
            <CaseCards
              data={data}
              items={cases}
              onOpen={(item) => {
                onClose();
                onOpenContent(item.id);
              }}
            />
          ) : (
            <p className="library-empty">沒有找到相符資料。</p>
          )}
        </>
      )}
      {sheet === "documents" && (
        <>
          <div className="sheet-head">
            <div>
              <p className="entry-kicker">{content.name}</p>
              <h2 id="browse-title">選擇房型文件</h2>
            </div>
            <CloseButton label="關閉文件列表" onClose={onClose} />
          </div>
          <label className="library-filter">
            <img src="/frontline/figma/search.svg" alt="" />
            <input
              type="search"
              aria-label="搜尋文件"
              placeholder="搜尋文件名稱，例如平面圖或效果圖"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="document-list">
            {documents.length > 0 ? (
              documents.map((page) => (
                <button
                  key={`${page.page}-${page.name}`}
                  type="button"
                  onClick={() => {
                    onSelectPage(page.page);
                    onClose();
                  }}
                >
                  {page.image ? (
                    <img src={page.image} alt="" />
                  ) : (
                    <span className="paper-grid" />
                  )}
                  <span>
                    <strong>{page.name}</strong>
                    <small>第 {page.page} 頁</small>
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              ))
            ) : (
              <p className="library-empty">找不到相符文件。</p>
            )}
          </div>
        </>
      )}
      {sheet === "furniture" && (
        <>
          <div className="sheet-head">
            <div>
              <p className="entry-kicker">SHOP THE IDEAS</p>
              <h2 id="furniture-title">把靈感，帶回家。</h2>
              <p className="furniture-context">
                {content.name} · {linked.length + content.eshopProducts.length}{" "}
                件家具
              </p>
            </div>
            <CloseButton label="關閉家具資料" onClose={onClose} />
          </div>
          <div className="furniture-shopping"><ContentShoppingLinks content={content} products={data.products} /></div>
        </>
      )}
      {sheet === "zoom" && (
        <>
          <div className="zoom-head">
            <span>
              {content.name} · {imageLabel}
            </span>
            <div>
              <button
                className="round"
                type="button"
                aria-label="縮小圖片"
                disabled={zoom <= 1}
                onClick={() => setZoom((value) => Math.max(1, value - 0.5))}
              >
                −
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button
                className="round"
                type="button"
                aria-label="放大圖片"
                disabled={zoom >= 4}
                onClick={() => setZoom((value) => Math.min(4, value + 0.5))}
              >
                ＋
              </button>
              <button
                className="round"
                type="button"
                aria-label="關閉放大圖片"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div ref={zoomCanvas} className="housing-zoom-canvas" tabIndex={0} aria-label="圖片，可拖動或捲動查看">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={imageLabel}
                onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
                style={fit ? { width: imageSize.width * fit * zoom, height: imageSize.height * fit * zoom, maxWidth: "none", maxHeight: "none" } : { width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <p>這頁未能放大。</p>
            )}
          </div>
        </>
      )}
    </dialog>
  );
}
