"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  Folder as FolderIcon,
  Search,
  X,
} from "lucide-react";
import type { Catalog, Content, Folder, Scene } from "@/lib/types";
import { TYPE_LABEL } from "@/lib/types";
import {
  byOrder,
  filterSearchMatchReasons,
  folderHasBrowseableContent,
  folderLabel,
  folderPublishedContents,
  SEARCH_CATEGORIES,
  SEARCH_CATEGORY_LABEL,
  suggestForCategory,
  trail,
} from "@/lib/catalog";
import {
  composeSearchQuery,
  searchDisplayLabel,
  splitSearchQuery,
  useCatalogSearch,
} from "@/hooks/use-catalog-search";
import { useEnrichedProductLabels } from "@/hooks/use-enriched-product-labels";
import type { SearchCategory } from "@/lib/catalog-search";
import { ContentThumb } from "./content-thumb";
import { prefetchContent } from "@/lib/content-prefetch";
import { ShowcaseLibrary, type LibraryRequest } from "./showcase-sheets";

function folioTone(id: string) {
  if (id === "tmf" || id.startsWith("tmf-")) return "apricot";
  if (id === "creator" || id.startsWith("creator")) return "sand";
  if (id === "pop" || id.startsWith("pop-") || id === "scenes") return "muted";
  return "mint";
}

function FolioArt({ id }: { id: string }) {
  const front =
    id === "housing" ? (
      <span className="folio-page page-front housing-cover">
        <img src="/frontline/demo/living.webp" alt="" />
        <span>
          NEW
          <br />
          HOUSING
        </span>
      </span>
    ) : id === "tmf" ? (
      <span className="folio-page page-front tmf-cover">
        <small>家匠</small>
        <strong>TMF</strong>
        <i className="tmf-arch" />
      </span>
    ) : id === "creator" ? (
      <span className="folio-page page-front creator-cover">
        <small>創造家</small>
        <strong>
          創<span>造</span>
        </strong>
        <i className="creator-orbit" />
      </span>
    ) : id === "pop" ? (
      <span className="folio-page page-front pop-cover">
        <small>DISPLAY MATERIALS</small>
        <strong>POP</strong>
        <i />
      </span>
    ) : (
      <span className="folio-page page-front">
        <span className="paper-grid" />
      </span>
    );
  return (
    <span className="folio-art" aria-hidden="true">
      <span className="folio-shadow" />
      <span className="folio-back" />
      <span className="folio-page page-back">
        {id === "housing" ? (
          <img src="/frontline/demo/bedroom.webp" alt="" />
        ) : (
          <span className="paper-grid" />
        )}
      </span>
      <span className="folio-page page-middle">
        {id === "housing" ? (
          <img src="/frontline/demo/floorplan.webp" alt="" />
        ) : (
          <span className="paper-lines" />
        )}
      </span>
      {front}
      <svg
        className="folio-pocket"
        viewBox="0 0 280 198"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`pocket-${id}`} x1="0" y1="0" x2=".8" y2="1">
            <stop className="pocket-light" offset="0" />
            <stop className="pocket-dark" offset="1" />
          </linearGradient>
        </defs>
        <path
          d="M1 39C1 16 15 3 37 3C82 3 106 16 148 28C181 38 218 40 250 40C268 40 279 53 279 73V167Q279 197 249 197H31Q1 197 1 167Z"
          fill={`url(#pocket-${id})`}
        />
      </svg>
      <span className="pocket-grain" />
    </span>
  );
}

export function FrontlineBrowser({
  data,
  folder,
  query,
  onSearch,
  navigate,
  open,
}: {
  data: Catalog;
  folder?: Folder;
  query: string;
  onSearch: (query: string) => void;
  navigate: (id: string) => void;
  open: (content: Content) => void;
}) {
  const [input, setInput] = useState(() => splitSearchQuery(query).term);
  const [searchText, setSearchText] = useState(query);
  const [activeCategory, setActiveCategory] = useState<SearchCategory | null>(
    () => splitSearchQuery(query).category,
  );
  const [library, setLibrary] = useState<LibraryRequest | null>(() =>
    !folder && query.trim() ? { mode: "search", query } : null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingQueryRef = useRef<string | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchGenerationRef = useRef(0);
  const publishSearch = useCallback((next: string) => {
    pendingQueryRef.current = next === query ? null : next;
    onSearch(next);
  }, [onSearch, query]);
  const home = !folder;
  const folderId = folder?.id ?? null;

  const {
    results,
    vocabulary,
    scope,
    active: searching,
  } = useCatalogSearch(data, folderId, home ? "" : searchText, {
    debounceMs: 0,
  });
  const composedInput = composeSearchQuery(activeCategory, input);
  const pendingSearch = composedInput !== searchText;

  useEffect(() => {
    if (pendingQueryRef.current !== null && query !== pendingQueryRef.current) return;
    pendingQueryRef.current = null;
    const split = splitSearchQuery(query);
    setActiveCategory(split.category);
    setInput(split.term);
    setSearchText(query);
    if (home) setLibrary((current) => query.trim() ? { mode: "search", query } : current?.mode === 'search' ? null : current);
  }, [query, home]);
  useEffect(() => {
    const restoreFromHistory = () => {
      searchGenerationRef.current += 1;
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      pendingQueryRef.current = null;
      const historyQuery = new URLSearchParams(window.location.search).get('q') || '';
      const split = splitSearchQuery(historyQuery);
      setInput(split.term);
      setActiveCategory(split.category);
      setSearchText(historyQuery);
      if (home) setLibrary(historyQuery.trim() ? { mode: 'search', query: historyQuery } : null);
    };
    window.addEventListener('popstate', restoreFromHistory);
    return () => window.removeEventListener('popstate', restoreFromHistory);
  }, [home]);
  useEffect(() => {
    if (home) return;
    const composed = composeSearchQuery(activeCategory, input);
    if (composed === query) {
      setSearchText(composed);
      return;
    }
    const generation = searchGenerationRef.current;
    const timer = setTimeout(() => {
      if (generation !== searchGenerationRef.current) return;
      setSearchText(composed);
      publishSearch(composed);
    }, 280);
    searchTimerRef.current = timer;
    return () => clearTimeout(timer);
  }, [input, activeCategory, publishSearch, query, home]);

  const suggestionCategory =
    activeCategory ?? splitSearchQuery(searchText).category;
  const suggestions = useMemo(() => {
    if (!suggestionCategory) return [];
    const items = suggestForCategory(vocabulary, suggestionCategory, input, 8);
    if (suggestionCategory === "product") {
      return items.filter((term) => !/^\d{4,}$/.test(term.trim()));
    }
    return items;
  }, [suggestionCategory, input, vocabulary]);

  const applySuggestion = (category: SearchCategory, term: string) => {
    setActiveCategory(category);
    setInput(term);
    const composed = composeSearchQuery(category, term);
    setSearchText(composed);
    if (home && composed === query) setLibrary({ mode: "search", query: composed });
    publishSearch(composed);
  };

  const submit = () => {
    const composed = composeSearchQuery(activeCategory, input);
    if (!composed) {
      inputRef.current?.focus();
      return;
    }
    searchGenerationRef.current += 1;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    setSearchText(composed);
    if (home && composed === query) setLibrary({ mode: "search", query: composed });
    publishSearch(composed);
  };

  const resultLabel = searchDisplayLabel(
    activeCategory ?? splitSearchQuery(searchText).category,
    input || splitSearchQuery(searchText).term,
  );

  const folders = data.folders
    .filter((f) => f.parentId === (folder?.id ?? null))
    .sort((a, b) => {
      const aReady = folderHasBrowseableContent(data, a.id);
      const bReady = folderHasBrowseableContent(data, b.id);
      if (aReady !== bReady) return aReady ? -1 : 1;
      return byOrder(a, b);
    });
  const contents = data.contents
    .filter((c) => c.folderId === folder?.id && c.status === "published")
    .sort(byOrder);
  const visibleContents = useMemo(
    () =>
      searching
        ? (results?.contents.map((entry) => entry.item) ?? [])
        : contents,
    [searching, results, contents],
  );
  const productLabelMap = useEnrichedProductLabels(
    data,
    visibleContents,
    searching ? searchText : "",
  );
  const scenes =
    folder?.id === "scenes"
      ? data.scenes.filter((s) => s.active).sort(byOrder)
      : [];
  const total = results
    ? results.contents.length + results.folders.length + results.scenes.length
    : 0;
  const path = (id: string) =>
    trail(data.folders, id).map(folderLabel).join(" / ");

  const directory = (items: Folder[], cards = false) => (
    <div className={`directory-grid${cards ? " folder-card-grid" : ""}`}>
      {items.map((f, index) => {
        const hasContent = folderHasBrowseableContent(data, f.id);
        const childFolders = data.folders.filter(
          (child) => child.parentId === f.id,
        ).length;
        const availableContents =
          folderPublishedContents(data, f.id).length +
          (f.id === "scenes" ? data.scenes.filter((s) => s.active).length : 0);
        const countLabel = hasContent
          ? `${childFolders} 個資料夾 · ${availableContents} 項內容${childFolders ? "（含下層）" : ""}`
          : "暫無內容";
        return (
          <button
            className={`directory-entry${cards ? " folder-tile" : ""}${cards && hasContent ? " folder-tile-ready" : ""}${cards && !hasContent ? " folder-tile-empty" : ""}`}
            data-tone={folioTone(f.id)}
            key={f.id}
            onClick={() => {
              if (home && cards) {
                setLibrary({ mode: "directory", folderId: f.id });
                return;
              }
              navigate(f.id);
            }}
          >
            {cards && (
              <span className="folder-tile-icon" aria-hidden="true">
                <FolderIcon size={22} strokeWidth={1.5} />
              </span>
            )}
            {cards && <FolioArt id={f.id} />}
            <span className={cards ? "directory-copy" : undefined}>
              <strong>
                {folderLabel(f)}
                {cards && f.id === "housing" && f.name === "New Housing" && (
                  <span className="folder-tile-alias">New Housing</span>
                )}
              </strong>
              {!cards && f.id === "housing" && f.name === "New Housing" && (
                <small>New Housing</small>
              )}
              {cards && <small>{countLabel}</small>}
              {searching && <small>{path(f.id)}</small>}
            </span>
            {cards ? (
              <span className="directory-arrow" aria-hidden="true">
                <ChevronRight size={16} />
              </span>
            ) : (
              <ChevronRight size={18} aria-hidden="true" />
            )}
            {cards && (
              <span className="folio-index">
                {String(index + 1).padStart(2, "0")}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const sceneList = (items: Scene[]) => {
    if (!items.length) return null;
    return (
      <div className="directory-grid">
        {items.map((s) =>
          s.url ? (
            <a
              className="directory-entry"
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>
                <strong>{s.name}</strong>
                <small>開啟 eShop 推介</small>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          ) : (
            <div
              className="directory-entry unconfigured"
              key={s.id}
              aria-disabled="true"
            >
              <span>
                <strong>{s.name}</strong>
                <small>連結待設定</small>
              </span>
            </div>
          ),
        )}
      </div>
    );
  };

  const contentList = (
    items: { item: Content; reasons: { label: string; value: string }[] }[],
  ) => {
    if (!items.length) return null;
    return (
      <div className="search-content-list">
        {items.map(({ item: c, reasons }) => {
          const products = productLabelMap.get(c.id) ?? [];
          const visibleReasons = filterSearchMatchReasons(
            reasons,
            products,
          ).filter(
            (reason) =>
              !products.some(
                (product) =>
                  product.includes(reason.value) ||
                  reason.value.includes(product),
              ),
          );
          return (
            <button
              className="search-content-entry"
              key={c.id}
              onMouseEnter={() => prefetchContent(c)}
              onFocus={() => prefetchContent(c)}
              onClick={() => open(c)}
            >
              <div className="search-thumbnail">
                <ContentThumb content={c} />
              </div>
              <div className="search-content-copy">
                <small>
                  {c.salesKit ? "Sales Kit" : TYPE_LABEL[c.type]} ·{" "}
                  {path(c.folderId)}
                </small>
                <h3>{c.name}</h3>
                {products.length > 0 && (
                  <div className="search-content-products">
                    <span className="search-content-products-label">
                      包含產品
                    </span>
                    <ul className="search-content-product-list">
                      {products.slice(0, 2).map((product) => (
                        <li key={product}>{product}</li>
                      ))}
                      {products.length > 2 && (
                        <li>另有 {products.length - 2} 項產品</li>
                      )}
                    </ul>
                  </div>
                )}
                {visibleReasons.length > 0 && (
                  <p className="search-match-reasons">
                    {visibleReasons
                      .map((reason) => `${reason.label}：${reason.value}`)
                      .join(" · ")}
                  </p>
                )}
                <span>開啟展示</span>
              </div>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    );
  };

  const folderResults = results?.folders.map((entry) => entry.item) ?? [];
  const sceneResults = results?.scenes.map((entry) => entry.item) ?? [];
  const showSuggestions =
    !home &&
    suggestions.length > 0 &&
    suggestionCategory &&
    !(searching && !pendingSearch && total > 0);
  return (
    <section
      className={`frontline-browser ${home ? "search-home directory-main" : "search-folder"}`}
      aria-label="銷售資料搜尋及目錄"
    >
      <div
        className={
          home ? "search-hero desk-intro" : "search-hero search-hero-compact"
        }
      >
        {home && (
          <div className="search-intro desk-title">
            <h1>想找甚麼銷售資料？</h1>
            <p className="desk-caption">選一份資料，開始一段家的對話。</p>
          </div>
        )}
        <form
          className={`frontline-search${home ? " directory-search-area" : ""}`}
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="directory-search">
            {home ? (
              <img
                className="search-asset"
                src="/frontline/figma/search.svg"
                alt=""
              />
            ) : (
              <Search size={20} strokeWidth={2} aria-hidden="true" />
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                const value = e.target.value;
                if (!home) pendingQueryRef.current = composeSearchQuery(activeCategory, value);
                setInput(value);
                if (!value.trim() && !activeCategory) {
                  setSearchText("");
                  publishSearch("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.nativeEvent.isComposing)
                  e.preventDefault();
              }}
              type="search"
              enterKeyHint="search"
              placeholder={home ? "開始搜索你要的" : "搜尋此目錄"}
              aria-label={home ? "搜尋全部銷售資料" : "搜尋此目錄"}
              aria-describedby={home ? "search-hint" : "search-scope"}
              autoComplete="off"
            />
            {input && (
              <button
                className="search-clear icon-only"
                type="button"
                aria-label="清除"
                onClick={() => {
                  setInput("");
                  setActiveCategory(null);
                  publishSearch("");
                  inputRef.current?.focus();
                }}
              >
                <X size={18} strokeWidth={2} />
              </button>
            )}
            <button type="submit" className="search-submit">
              搜尋
            </button>
          </div>
          {home && (
            <div
              id="search-hint"
              className="search-chips scope-chips"
              aria-label="搜尋分類"
            >
              {SEARCH_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  data-category={category}
                  className={`search-chip${activeCategory === category ? " search-chip-active" : ""}`}
                  aria-pressed={
                    activeCategory === category ||
                    (library?.mode === "scope" && library.scope === category)
                  }
                  aria-haspopup="dialog"
                  aria-controls="library-dialog"
                  aria-expanded={
                    library?.mode === "scope" && library.scope === category
                  }
                  onClick={() => setLibrary({ mode: "scope", scope: category })}
                >
                  {SEARCH_CATEGORY_LABEL[category]}
                </button>
              ))}
            </div>
          )}
          {showSuggestions && (
            <ul className="search-suggestions" aria-label="建議搜尋詞">
              {suggestions.map((term) => {
                const category = suggestionCategory!;
                return (
                  <li key={`${category}-${term}`}>
                    <button
                      type="button"
                      onClick={() => applySuggestion(category, term)}
                    >
                      {term}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </form>
      </div>
      {!home && (
        <p className="search-scope" id="search-scope">
          只搜尋「{folderLabel(folder)}」及下層目錄 · 共 {scope.contentCount}{" "}
          項可搜內容
        </p>
      )}
      {home && searching && (
        <p className="search-scope search-scope-home">
          搜尋範圍：全部目錄 · 共 {scope.contentCount} 項可搜內容
        </p>
      )}
      {searching ? (
        <section
          className="search-results"
          aria-labelledby="results-heading"
          aria-busy={pendingSearch}
        >
          <div className="results-heading">
            <h2 id="results-heading">搜尋結果</h2>
            <button
              className="search-clear"
              onClick={() => {
                setInput("");
                setActiveCategory(null);
                publishSearch("");
              }}
            >
              返回目錄
            </button>
          </div>
          <p className="result-summary" role="status">
            {pendingSearch
              ? "搜尋中…"
              : `「${resultLabel}」找到 ${total} 項結果`}
          </p>
          {!pendingSearch &&
            (total ? (
              <>
                {results!.contents.length > 0 && contentList(results!.contents)}
                {folderResults.length > 0 && (
                  <>
                    <h3 className="result-group-title">相關目錄</h3>
                    {directory(folderResults)}
                  </>
                )}
                {sceneResults.length > 0 && (
                  <>
                    <h3 className="result-group-title">場景推介</h3>
                    {sceneList(sceneResults)}
                  </>
                )}
              </>
            ) : (
              <div className="search-message">
                <h3>找不到相關內容</h3>
                <p>
                  試試較短的關鍵字，例如「梳化」或「米白色」，或點選上方分類查看建議詞。
                </p>
                {!home && <p>搜尋不會擴大至其他目錄。</p>}
              </div>
            ))}
        </section>
      ) : (
        <section className="browse-directories" aria-label="目錄入口">
          {home ? (
            <div className="browse-heading desk-shelf-label">
              <span>
                瀏覽目錄{" "}
                <small>{String(folders.length).padStart(2, "0")}</small>
              </span>
              <span>輕點文件夾，展開資料</span>
            </div>
          ) : (
            <h2>瀏覽此目錄</h2>
          )}
          {directory(folders, true)}
          {sceneList(scenes)}
          {contentList(contents.map((item) => ({ item, reasons: [] })))}
          {!folders.length && !scenes.length && !contents.length && (
            <div className="search-message">
              <h3>此目錄暫未有內容</h3>
              <p>請返回上一層，選擇其他目錄。</p>
            </div>
          )}
        </section>
      )}
      {home && !searching && (
        <div className="showcase-note desk-baseline" aria-hidden="true">
          <span>PRICERITE · FRONTLINE</span>
          <i />
          <span>一起探索，家的每個可能。</span>
        </div>
      )}
      {library && (
        <ShowcaseLibrary
          data={data}
          request={library}
          onClose={() => {
            setLibrary(null);
            if (home && query) publishSearch("");
          }}
          onNavigate={navigate}
          onOpen={open}
          onScope={(scope) => setLibrary({ mode: "scope", scope })}
          onSearch={(next) => { if (next === query) setLibrary({ mode: "search", query: next }); publishSearch(next); }}
        />
      )}
    </section>
  );
}
