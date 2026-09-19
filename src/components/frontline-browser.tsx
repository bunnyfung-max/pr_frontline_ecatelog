'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronRight, Folder as FolderIcon, Search } from 'lucide-react';
import type { Catalog, Content, Folder, Scene } from '@/lib/types';
import { TYPE_LABEL } from '@/lib/types';
import { byOrder, folderLabel, trail, type SearchResults } from '@/lib/catalog';
import { api } from '@/lib/client';
import { Thumb } from './ui';

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
  const [result, setResult] = useState<SearchResults | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const home = !folder;
  useEffect(() => setInput(query), [query]);
  useEffect(() => {
    setResult(null);
    setError('');
    if (!query.trim()) {
      setBusy(false);
      return;
    }
    const controller = new AbortController();
    setBusy(true);
    const params = new URLSearchParams({ q: query });
    if (folder) params.set('folder', folder.id);
    api<SearchResults>(`/api/catalog?${params}`, { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) setResult(value);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [query, folder?.id, retry]);
  const searching = !!query.trim();
  const folders = data.folders.filter((f) => f.parentId === (folder?.id ?? null)).sort(byOrder);
  const contents = data.contents
    .filter((c) => c.folderId === folder?.id && c.status === 'published')
    .sort(byOrder);
  const scenes = folder?.id === 'scenes' ? data.scenes.filter((s) => s.active).sort(byOrder) : [];
  const total = result ? result.contents.length + result.folders.length + result.scenes.length : 0;
  const path = (id: string) => trail(data.folders, id).map(folderLabel).join(' / ');
  const directory = (items: Folder[], cards = false) => (
    <div className={`directory-grid${cards ? ' folder-card-grid' : ''}`}>
      {items.map((f) => (
        <button
          className={`directory-entry${cards ? ' folder-tile' : ''}`}
          key={f.id}
          onClick={() => navigate(f.id)}
        >
          {cards && (
            <span className="folder-tile-icon" aria-hidden="true">
              <FolderIcon size={26} strokeWidth={1.3} />
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
                {data.folders.filter((child) => child.parentId === f.id).length} 個資料夾 ·{' '}
                {data.contents.filter((c) => c.folderId === f.id && c.status === 'published')
                  .length +
                  (f.id === 'scenes' ? data.scenes.filter((s) => s.active).length : 0)}{' '}
                項內容
              </small>
            )}
            {searching && <small>{path(f.id)}</small>}
          </span>
          <ChevronRight size={28} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
  const sceneList = (items: Scene[]) => (
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
            <ArrowUpRight size={28} aria-hidden="true" />
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
  const contentList = (items: Content[]) => (
    <div className="search-content-list">
      {items.map((c) => (
        <button className="search-content-entry" key={c.id} onClick={() => open(c)}>
          <div className="search-thumbnail">
            <Thumb src={c.cover || (c.type === 'image' ? c.files[0] : '')} />
          </div>
          <div className="search-content-copy">
            <small>
              {c.salesKit ? 'Sales Kit' : TYPE_LABEL[c.type]} · {path(c.folderId)}
            </small>
            <h3>{c.name}</h3>
            <span>開啟展示</span>
          </div>
          <ChevronRight size={28} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
  return (
    <section
      className={`frontline-browser ${home ? 'search-home' : 'search-folder'}`}
      aria-label="銷售資料搜尋及目錄"
    >
      {home && (
        <div className="search-intro">
          <h1>想找甚麼銷售資料？</h1>
          <p>輸入關鍵字，即可搜尋銷售資料。</p>
        </div>
      )}
      <form
        className="frontline-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          // Some IMEs use Enter to choose a character; don't search before composition ends.
          if (!input.trim()) {
            inputRef.current?.focus();
            return;
          }
          if (input.trim() === query) setRetry((n) => n + 1);
          else onSearch(input.trim());
        }}
      >
        <label className="directory-search">
          <Search size={40} strokeWidth={2} aria-hidden="true" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.nativeEvent.isComposing) e.preventDefault();
            }}
            type="search"
            enterKeyHint="search"
            placeholder="輸入任何關鍵字"
            aria-label={home ? '搜尋全部銷售資料' : '搜尋此目錄'}
            aria-describedby={home ? 'search-hint' : 'search-scope'}
            autoComplete="off"
          />
          {input && (
            <button
              className="search-clear"
              type="button"
              onClick={() => {
                setInput('');
                onSearch('');
                inputRef.current?.focus();
              }}
            >
              清除
            </button>
          )}
        </label>
        <p id="search-hint" className="search-hint">
          例如：產品、品牌、顏色、風格、屋苑
        </p>
        <button type="submit" className="search-submit">
          搜尋
        </button>
      </form>
      {!home && (
        <p className="search-scope" id="search-scope">
          只搜尋「{folderLabel(folder)}」及下層目錄
        </p>
      )}
      {searching ? (
        <section className="search-results" aria-labelledby="results-heading" aria-busy={busy}>
          <div className="results-heading">
            <h2 id="results-heading">搜尋結果</h2>
            <button
              className="search-clear"
              onClick={() => {
                setInput('');
                onSearch('');
              }}
            >
              返回目錄
            </button>
          </div>
          <p className="result-summary" role="status">
            {busy
              ? '搜尋中…'
              : error
                ? '未能完成搜尋'
                : result
                  ? `「${query}」找到 ${total} 項結果`
                  : '準備搜尋…'}
          </p>
          {error && (
            <div className="search-message">
              <p role="alert">{error}</p>
              <button className="secondary" onClick={() => setRetry((n) => n + 1)}>
                重新搜尋
              </button>
            </div>
          )}
          {!busy &&
            !error &&
            result &&
            (total ? (
              <>
                {result.contents.length > 0 && contentList(result.contents)}
                {result.folders.length > 0 && (
                  <>
                    <h3 className="result-group-title">相關目錄</h3>
                    {directory(result.folders)}
                  </>
                )}
                {result.scenes.length > 0 && (
                  <>
                    <h3 className="result-group-title">場景推介</h3>
                    {sceneList(result.scenes)}
                  </>
                )}
              </>
            ) : (
              <div className="search-message">
                <h3>找不到相關內容</h3>
                <p>試試較短的關鍵字，例如「梳化」或「米白色」。</p>
                {!home && <p>搜尋不會擴大至其他目錄。</p>}
              </div>
            ))}
        </section>
      ) : (
        <section className="browse-directories" aria-label="目錄入口">
          <h2>{home ? '或直接瀏覽目錄' : '瀏覽此目錄'}</h2>
          {directory(folders, true)}
          {sceneList(scenes)}
          {contentList(contents)}
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
