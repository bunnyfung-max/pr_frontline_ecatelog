'use client';
import { useEffect, useState } from 'react';
import { Search, Folder, ChevronRight, ArrowRight } from 'lucide-react';
import type { Catalog, Content, Folder as FolderType } from '@/lib/types';
import { TYPE_LABEL, STATUS_LABEL } from '@/lib/types';
import { byOrder, trail, folderDeleteBlockers } from '@/lib/catalog';
import { api } from '@/lib/client';
import { useFolderDelete } from '@/hooks/use-folder-delete';
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
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ contents: Content[]; folders: FolderType[] } | null>(
    null,
  );
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);
  const { deleteError, deleteFolder } = useFolderDelete(data, saved);
  useEffect(() => {
    setResults(null);
    setSearchError('');
    if (!q.trim()) {
      setSearching(false);
      return;
    }
    setSearching(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      api<{ contents: Content[]; folders: FolderType[] }>(
        `/api/catalog?folder=${encodeURIComponent(folder.id)}&q=${encodeURIComponent(q)}${cms ? '&cms=1' : ''}`,
        { signal: controller.signal },
      )
        .then(setResults)
        .catch((e) => {
          if (e.name !== 'AbortError') setSearchError(e.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, folder.id, cms]);
  const folders = q.trim()
    ? results?.folders || []
    : data.folders.filter((f) => f.parentId === folder.id).sort(byOrder);
  const contents = q.trim()
    ? results?.contents || []
    : data.contents
        .filter((c) => c.folderId === folder.id && (cms || c.status === 'published'))
        .sort(byOrder);
  return (
    <>
      <div className="search-bar">
        <Search size={21} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋產品名稱、品牌、顏色或設計風格"
          aria-label="搜尋此目錄"
        />
        {q && (
          <button className="text-btn" onClick={() => setQ('')}>
            清除
          </button>
        )}
        {cms && <span className="scope-tag">{folder.name} 及下層</span>}
      </div>
      <p className="scope-note">
        搜尋範圍：
        {trail(data.folders, folder.id)
          .map((f) => f.name)
          .join(' / ')}
        　<span>不包含上層或其他目錄</span>
      </p>
      {searchError && (
        <p className="error" role="alert">
          {searchError}
        </p>
      )}
      {deleteError && (
        <p className="error" role="alert">
          {deleteError}
        </p>
      )}
      {searching ? (
        <div className="loading">搜尋中…</div>
      ) : (
        <>
          {folders.length > 0 && (
            <>
              <div className="list-title">
                <h2>{q ? '相關資料夾' : '資料夾'}</h2>
                <span>{folders.length} 個</span>
              </div>
              <div className={`folder-grid ${cms ? 'folder-grid-managed' : ''}`}>
                {folders.map((f, i) => {
                  const meta = q
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
                <h2>{q ? '搜尋結果' : '展示內容'}</h2>
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
                      {contents.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <strong>{c.name}</strong>
                            <small>
                              {trail(data.folders, c.folderId)
                                .map((f) => f.name)
                                .join(' / ')}
                            </small>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="content-grid">
                  {contents.map((c) => (
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
                        <span>
                          開啟展示
                          <ArrowRight size={16} />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {!folders.length && !contents.length && (
            <Empty title={q ? '此目錄內找不到相關內容' : undefined}>
              {q
                ? '試試其他產品名稱、品牌、顏色或風格。搜尋不會擴大至其他目錄。'
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
