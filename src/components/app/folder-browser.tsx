'use client';
import { useMemo, useState } from 'react';
import { Search, Folder, ChevronRight, ArrowRight } from 'lucide-react';
import type { Catalog, Content, Folder as FolderType } from '@/lib/types';
import { TYPE_LABEL, STATUS_LABEL } from '@/lib/types';
import {
  byOrder,
  filterSearchMatchReasons,
  trail,
  folderDeleteBlockers,
  SEARCH_CATEGORIES,
  SEARCH_CATEGORY_LABEL,
  suggestForCategory,
} from '@/lib/catalog';
import {
  composeSearchQuery,
  splitSearchQuery,
  useCatalogSearch,
} from '@/hooks/use-catalog-search';
import type { SearchCategory } from '@/lib/catalog-search';
import { useFolderDelete } from '@/hooks/use-folder-delete';
import { useEnrichedProductLabels } from '@/hooks/use-enriched-product-labels';
import { Thumb, Empty } from '../ui';
import { CmsFolderCard } from '../cms-folder-card';

export function FolderBrowser({
  data,
  folder,
  cms,
  navigate,
  edit,
  saved,
}: {
  data: Catalog;
  folder: FolderType;
  cms: boolean;
  navigate: (id: string, admin?: boolean, content?: string) => void;
  edit: (c: Content) => void;
  saved: () => void;
}) {
  const [input, setInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory | null>(null);
  const composedQuery = composeSearchQuery(activeCategory, input);
  const { deleteError, deleteFolder } = useFolderDelete(data, saved);
  const {
    results,
    vocabulary,
    scope,
    pending,
    active: searching,
  } = useCatalogSearch(data, folder.id, composedQuery, { includeDrafts: cms, debounceMs: 220 });

  const suggestionCategory = activeCategory ?? splitSearchQuery(composedQuery).category;
  const suggestions = useMemo(() => {
    if (!suggestionCategory) return [];
    const items = suggestForCategory(vocabulary, suggestionCategory, input, 6);
    if (suggestionCategory === 'product') {
      return items.filter((term) => !/^\d{4,}$/.test(term.trim()));
    }
    return items;
  }, [suggestionCategory, input, vocabulary]);

  const folders = composedQuery
    ? results?.folders.map((entry) => entry.item) || []
    : data.folders.filter((f) => f.parentId === folder.id).sort(byOrder);
  const contents = composedQuery
    ? results?.contents.map((entry) => entry.item) || []
    : data.contents
        .filter((c) => c.folderId === folder.id && (cms || c.status === 'published'))
        .sort(byOrder);
  const contentReasons = new Map(
    results?.contents.map((entry) => [entry.item.id, entry.reasons]) ?? [],
  );
  const productLabelMap = useEnrichedProductLabels(data, contents);
  const total = searching ? folders.length + contents.length : 0;
  const showSuggestions =
    suggestions.length > 0 &&
    suggestionCategory &&
    !(searching && !pending && total > 0);
  return (
    <>
      <div className="search-bar">
        <Search size={21} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="搜尋產品名稱、品牌、顏色或設計風格"
          aria-label="搜尋此目錄"
        />
        {(input || activeCategory) && (
          <button
            className="text-btn"
            onClick={() => {
              setInput('');
              setActiveCategory(null);
            }}
          >
            清除
          </button>
        )}
        {cms && <span className="scope-tag">{folder.name} 及下層</span>}
      </div>
      <div className="search-chips cms-search-chips" aria-label="搜尋分類">
        {SEARCH_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={`search-chip${activeCategory === category || splitSearchQuery(composedQuery).category === category ? ' search-chip-active' : ''}`}
            onClick={() => {
              setActiveCategory(category);
              setInput('');
            }}
          >
            {SEARCH_CATEGORY_LABEL[category]}
          </button>
        ))}
      </div>
      {showSuggestions && (
        <ul className="search-suggestions cms-search-suggestions" aria-label="建議搜尋詞">
          {suggestions.map((term) => {
            const category = suggestionCategory!;
            return (
              <li key={`${category}-${term}`}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setInput(term);
                  }}
                >
                  {term}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="scope-note">
        搜尋範圍：
        {trail(data.folders, folder.id)
          .map((f) => f.name)
          .join(' / ')}
        　<span>共 {scope.contentCount} 項可搜內容 · 不包含上層或其他目錄</span>
      </p>
      {deleteError && (
        <p className="error" role="alert">
          {deleteError}
        </p>
      )}
      {pending ? (
        <div className="loading">搜尋中…</div>
      ) : (
        <>
          {folders.length > 0 && (
            <>
              <div className="list-title">
                <h2>{searching ? '相關資料夾' : '資料夾'}</h2>
                <span>{folders.length} 個</span>
              </div>
              <div className={`folder-grid ${cms ? 'folder-grid-managed' : ''}`}>
                {folders.map((f, i) => {
                  const meta = searching
                    ? trail(data.folders, f.id)
                        .slice(0, -1)
                        .map((p) => p.name)
                        .join(' / ')
                    : `${data.folders.filter((x) => x.parentId === f.id).length} 個資料夾 · ${data.contents.filter((c) => c.folderId === f.id && (cms || c.status === 'published')).length} 項內容`;
                  if (cms) {
                    const blockers = folderDeleteBlockers(data, f.id);
                    return (
                      <CmsFolderCard
                        key={f.id}
                        name={f.name}
                        meta={meta}
                        tone={i}
                        onOpen={() => navigate(f.id)}
                        onDelete={() => void deleteFolder(f)}
                        deleteBlocked={blockers.length > 0}
                        deleteTitle={blockers.length ? '請先清空子目錄及內容' : `刪除 ${f.name}`}
                      />
                    );
                  }
                  return (
                    <button className="folder-card" key={f.id} onClick={() => navigate(f.id)}>
                      <div className="folder-icon">
                        <Folder size={25} strokeWidth={1.3} />
                      </div>
                      <div>
                        <strong>{f.name}</strong>
                        <small>{meta}</small>
                      </div>
                      <ChevronRight size={17} />
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {contents.length > 0 && (
            <>
              <div className="list-title">
                <h2>{searching ? '搜尋結果' : '展示內容'}</h2>
                <span>{contents.length} 項</span>
              </div>
              {cms ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>內容名稱</th>
                        <th>類型</th>
                        <th>狀態</th>
                        <th>次序</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contents.map((c) => {
                        const products = productLabelMap.get(c.id) ?? [];
                        const visibleReasons = filterSearchMatchReasons(
                          contentReasons.get(c.id) ?? [],
                          products,
                        );
                        return (
                        <tr key={c.id}>
                          <td>
                            <strong>{c.name}</strong>
                            <small>
                              {trail(data.folders, c.folderId)
                                .map((f) => f.name)
                                .join(' / ')}
                            </small>
                            {products.length > 0 && (
                              <small className="search-content-products">
                                包含產品：{products.join(' · ')}
                              </small>
                            )}
                            {visibleReasons.length ? (
                              <small className="search-match-reasons">
                                {visibleReasons
                                  .map((reason) => `${reason.label}：${reason.value}`)
                                  .join(' · ')}
                              </small>
                            ) : null}
                          </td>
                          <td>{c.salesKit ? 'Sales Kit' : TYPE_LABEL[c.type]}</td>
                          <td>
                            <span className={`status ${c.status}`}>{STATUS_LABEL[c.status]}</span>
                          </td>
                          <td>{c.order}</td>
                          <td>
                            <button className="text-btn" onClick={() => edit(c)}>
                              編輯
                            </button>
                            <button
                              className="text-btn"
                              onClick={() => navigate(folder.id, true, c.id)}
                            >
                              預覽
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="content-grid">
                  {contents.map((c) => {
                    const products = productLabelMap.get(c.id) ?? [];
                    const visibleReasons = filterSearchMatchReasons(
                      contentReasons.get(c.id) ?? [],
                      products,
                    );
                    return (
                    <button
                      key={c.id}
                      className="content-card"
                      onClick={() => navigate(folder.id, cms, c.id)}
                    >
                      <div className="content-image">
                        <Thumb src={c.cover || (c.type === 'image' ? c.files[0] : '')} />
                        <span className="type-badge">
                          {c.salesKit ? 'Sales Kit' : TYPE_LABEL[c.type]}
                        </span>
                      </div>
                      <div className="content-info">
                        <h3>{c.name}</h3>
                        <small>
                          {trail(data.folders, c.folderId)
                            .slice(-2)
                            .map((f) => f.name)
                            .join(' / ')}
                        </small>
                        {products.length > 0 && (
                          <small className="search-content-products">
                            包含產品：{products.join(' · ')}
                          </small>
                        )}
                        {visibleReasons.length ? (
                          <small className="search-match-reasons">
                            {visibleReasons
                              .map((reason) => `${reason.label}：${reason.value}`)
                              .join(' · ')}
                          </small>
                        ) : null}
                        <span>
                          開啟展示
                          <ArrowRight size={16} />
                        </span>
                      </div>
                    </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
          {!folders.length && !contents.length && (
            <Empty title={searching ? '此目錄內找不到相關內容' : undefined}>
              {searching
                ? '試試其他產品名稱、品牌、顏色或風格，或點選上方分類查看建議詞。搜尋不會擴大至其他目錄。'
                : cms
                  ? '可按「上載內容」新增圖片、PDF、影片或連結。'
                  : undefined}
            </Empty>
          )}
        </>
      )}
    </>
  );
}
