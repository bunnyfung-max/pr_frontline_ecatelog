'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  ChevronRight,
  Folder as FolderIcon,
  Search,
  X,
} from 'lucide-react';
import type { Catalog, Content, Folder, Scene } from '@/lib/types';
import { TYPE_LABEL } from '@/lib/types';
import {
  byOrder,
  filterSearchMatchReasons,
  folderHasBrowseableContent,
  folderLabel,
  SEARCH_CATEGORIES,
  SEARCH_CATEGORY_LABEL,
  suggestForCategory,
  trail,
} from '@/lib/catalog';
import {
  composeSearchQuery,
  searchDisplayLabel,
  splitSearchQuery,
  useCatalogSearch,
} from '@/hooks/use-catalog-search';
import { useEnrichedProductLabels } from '@/hooks/use-enriched-product-labels';
import type { SearchCategory } from '@/lib/catalog-search';
import { ContentThumb } from './content-thumb';
import { prefetchContent } from '@/lib/content-prefetch';

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
  const [input, setInput] = useState(query);
  const [searchText, setSearchText] = useState(query);
  const [activeCategory, setActiveCategory] = useState<SearchCategory | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const home = !folder;
  const folderId = folder?.id ?? null;

  const {
    results,
    vocabulary,
    scope,
    active: searching,
  } = useCatalogSearch(data, folderId, searchText, { debounceMs: 0 });
  const composedInput = composeSearchQuery(activeCategory, input);
  const pendingSearch = composedInput !== searchText;

  useEffect(() => {
    const split = splitSearchQuery(query);
    setActiveCategory(split.category);
    setInput(split.term);
    setSearchText(query);
  }, [query]);
  useEffect(() => {
    const composed = composeSearchQuery(activeCategory, input);
    if (composed === query) {
      setSearchText(composed);
      return;
    }
    const timer = setTimeout(() => {
      setSearchText(composed);
      onSearch(composed);
    }, 280);
    return () => clearTimeout(timer);
  }, [input, activeCategory, onSearch, query]);

  const suggestionCategory = activeCategory ?? splitSearchQuery(searchText).category;
  const suggestions = useMemo(() => {
    if (!suggestionCategory) return [];
    const items = suggestForCategory(vocabulary, suggestionCategory, input, 8);
    if (suggestionCategory === 'product') {
      return items.filter((term) => !/^\d{4,}$/.test(term.trim()));
    }
    return items;
  }, [suggestionCategory, input, vocabulary]);

  const applySuggestion = (category: SearchCategory, term: string) => {
    setActiveCategory(category);
    setInput(term);
    const composed = composeSearchQuery(category, term);
    setSearchText(composed);
    onSearch(composed);
  };

  const submit = () => {
    const composed = composeSearchQuery(activeCategory, input);
    if (!composed) {
      inputRef.current?.focus();
      return;
    }
    setSearchText(composed);
    onSearch(composed);
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
    .filter((c) => c.folderId === folder?.id && c.status === 'published')
    .sort(byOrder);
  const visibleContents = useMemo(
    () => (searching ? results?.contents.map((entry) => entry.item) ?? [] : contents),
    [searching, results, contents],
  );
  const productLabelMap = useEnrichedProductLabels(
    data,
    visibleContents,
    searching ? searchText : '',
  );
  const scenes = folder?.id === 'scenes' ? data.scenes.filter((s) => s.active).sort(byOrder) : [];
  const total = results
    ? results.contents.length + results.folders.length + results.scenes.length
    : 0;
  const path = (id: string) => trail(data.folders, id).map(folderLabel).join(' / ');

  const directory = (items: Folder[], cards = false) => (
    <div className={`directory-grid${cards ? ' folder-card-grid' : ''}`}>
      {items.map((f) => {
        const hasContent = folderHasBrowseableContent(data, f.id);
        const childFolders = data.folders.filter((child) => child.parentId === f.id).length;
        const directContents =
          data.contents.filter((c) => c.folderId === f.id && c.status === 'published').length +
          (f.id === 'scenes' ? data.scenes.filter((s) => s.active).length : 0);
        return (
          <button
            className={`directory-entry${cards ? ' folder-tile' : ''}${cards && hasContent ? ' folder-tile-ready' : ''}${cards && !hasContent ? ' folder-tile-empty' : ''}`}
            key={f.id}
            onClick={() => navigate(f.id)}
          >
            {cards && (
              <span className="folder-tile-icon" aria-hidden="true">
                <FolderIcon size={22} strokeWidth={1.5} />
              </span>
            )}
            <span>
              <strong>
                {folderLabel(f)}
                {cards && f.id === 'housing' && f.name === 'New Housing' && (
                  <span className="folder-tile-alias">New Housing</span>
                )}
              </strong>
              {!cards && f.id === 'housing' && f.name === 'New Housing' && <small>New Housing</small>}
              {cards && (
                <small>
                  {hasContent
                    ? `${childFolders} 個資料夾 · ${directContents} 項內容`
                    : '暫無內容'}
                </small>
              )}
              {searching && <small>{path(f.id)}</small>}
            </span>
            <ChevronRight size={18} aria-hidden="true" />
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
            <div className="directory-entry unconfigured" key={s.id} aria-disabled="true">
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

  const contentList = (items: { item: Content; reasons: { label: string; value: string }[] }[]) => {
    if (!items.length) return null;
    return (
      <div className="search-content-list">
        {items.map(({ item: c, reasons }) => {
          const products = productLabelMap.get(c.id) ?? [];
          const visibleReasons = filterSearchMatchReasons(reasons, products);
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
                {c.salesKit ? 'Sales Kit' : TYPE_LABEL[c.type]} · {path(c.folderId)}
              </small>
              <h3>{c.name}</h3>
              {products.length > 0 && (
                <div className="search-content-products">
                  <span className="search-content-products-label">包含產品</span>
                  <ul className="search-content-product-list">
                    {products.map((product) => (
                      <li key={product}>{product}</li>
                    ))}
                  </ul>
                </div>
              )}
              {visibleReasons.length > 0 && (
                <p className="search-match-reasons">
                  {visibleReasons.map((reason) => `${reason.label}：${reason.value}`).join(' · ')}
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
    suggestions.length > 0 &&
    suggestionCategory &&
    !(searching && !pendingSearch && total > 0);
  return (
    <section
      className={`frontline-browser ${home ? 'search-home' : 'search-folder'}`}
      aria-label="銷售資料搜尋及目錄"
    >
      <div className={home ? 'search-hero' : 'search-hero search-hero-compact'}>
        {home && (
          <div className="search-intro">
            <h1>想找甚麼銷售資料？</h1>
          </div>
        )}
        <form
          className="frontline-search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="directory-search">
            <Search size={20} strokeWidth={2} aria-hidden="true" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                const value = e.target.value;
                setInput(value);
                if (!value.trim() && !activeCategory) {
                  setSearchText('');
                  onSearch('');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.nativeEvent.isComposing) e.preventDefault();
              }}
              type="search"
              enterKeyHint="search"
              placeholder={home ? '搜尋產品、品牌、屋苑…' : '搜尋此目錄'}
              aria-label={home ? '搜尋全部銷售資料' : '搜尋此目錄'}
              aria-describedby={home ? 'search-hint' : 'search-scope'}
              autoComplete="off"
            />
            {input && (
              <button
                className="search-clear icon-only"
                type="button"
                aria-label="清除"
                onClick={() => {
                  setInput('');
                  setActiveCategory(null);
                  onSearch('');
                  inputRef.current?.focus();
                }}
              >
                <X size={18} strokeWidth={2} />
              </button>
            )}
            <button type="submit" className="search-submit" aria-label="搜尋">
              <ArrowUp size={18} strokeWidth={2.2} />
            </button>
          </div>
          {home && (
            <div id="search-hint" className="search-chips" aria-label="搜尋分類">
              {SEARCH_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`search-chip${activeCategory === category || splitSearchQuery(searchText).category === category ? ' search-chip-active' : ''}`}
                  onClick={() => {
                    setActiveCategory(category);
                    setInput('');
                    if (searching) {
                      setSearchText('');
                      onSearch('');
                    }
                    inputRef.current?.focus();
                  }}
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
                    <button type="button" onClick={() => applySuggestion(category, term)}>
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
          只搜尋「{folderLabel(folder)}」及下層目錄 · 共 {scope.contentCount} 項可搜內容
        </p>
      )}
      {home && searching && (
        <p className="search-scope search-scope-home">
          搜尋範圍：全部目錄 · 共 {scope.contentCount} 項可搜內容
        </p>
      )}
      {searching ? (
        <section className="search-results" aria-labelledby="results-heading" aria-busy={pendingSearch}>
          <div className="results-heading">
            <h2 id="results-heading">搜尋結果</h2>
            <button
              className="search-clear"
              onClick={() => {
                setInput('');
                setActiveCategory(null);
                onSearch('');
              }}
            >
              返回目錄
            </button>
          </div>
          <p className="result-summary" role="status">
            {pendingSearch
              ? '搜尋中…'
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
                <p>試試較短的關鍵字，例如「梳化」或「米白色」，或點選上方分類查看建議詞。</p>
                {!home && <p>搜尋不會擴大至其他目錄。</p>}
              </div>
            ))}
        </section>
      ) : (
        <section className="browse-directories" aria-label="目錄入口">
          <h2>{home ? '或直接瀏覽目錄' : '瀏覽此目錄'}</h2>
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
    </section>
  );
}
