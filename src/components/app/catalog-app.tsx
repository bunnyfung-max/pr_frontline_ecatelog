'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Home,
  Settings2,
  LogOut,
  Building2,
  PanelsTopLeft,
  Armchair,
  PencilRuler,
  Sparkles,
  Folder,
  Upload,
  Monitor,
  CheckCircle2,
  LockKeyhole,
  RefreshCw,
} from 'lucide-react';
import type { Content, ManageKind, Folder as FolderType } from '@/lib/types';
import { byOrder, trail, folderLabel, rootFolders, folderPublishedContents } from '@/lib/catalog';
import { api } from '@/lib/client';
import { useCatalogSession } from '@/hooks/use-catalog-session';
import { useCatalogData } from '@/hooks/use-catalog-data';
import { FolderCacheButton } from '../folder-cache-button';
import { Thumb, Empty, Breadcrumb, External, Modal } from '../ui';
import { Viewer } from '../viewer';
import { ContentEditor, ManagePanel } from '../cms';
import { SimpleDirectory } from '../simple-directory';
import { FrontlineBrowser } from '../frontline-browser';
import { CmsAccessGate } from '../cms-access-gate';
import { rootIcons } from './constants';
import { Login } from './login';
import { HomePage } from './home-page';
import { FolderBrowser } from './folder-browser';
import { FolderForm } from './folder-form';

export function CatalogApp() {
  const router = useRouter();
  const params = useSearchParams();
  const folderId = params.get('folder') || '';
  const cmsMode = params.get('cms') === '1';
  const contentId = params.get('content');
  const searchQuery = params.get('q') || '';
  const {
    session,
    setSession,
    cmsUnlocked,
    setCmsUnlocked,
    setup,
    ready,
    error: sessionError,
    lockCms,
  } = useCatalogSession();
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, setData, error: catalogError } = useCatalogData(
    session,
    cmsMode,
    cmsUnlocked,
    refreshKey,
  );
  const [edit, setEdit] = useState<Content | 'new' | null>(null);
  const [manage, setManage] = useState<ManageKind | ''>('');
  const [newFolder, setNewFolder] = useState(false);
  const [toast, setToast] = useState('');
  const cms = cmsMode && cmsUnlocked;
  const error = catalogError || sessionError;
  useEffect(() => {
    if (!cmsMode && cmsUnlocked) void lockCms();
  }, [cmsMode, cmsUnlocked, lockCms]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const navigate = useCallback(
    (id: string, admin = cmsMode, content?: string) => {
      const p = new URLSearchParams();
      if (id) p.set('folder', id);
      if (admin) p.set('cms', '1');
      if (content) p.set('content', content);
      if (content && id === folderId && searchQuery) p.set('q', searchQuery);
      router.push(`/?${p.toString()}`, { scroll: true });
    },
    [router, cmsMode, folderId, searchQuery],
  );
  const search = (query: string) => {
    const p = new URLSearchParams(params.toString());
    p.delete('content');
    if (query) p.set('q', query);
    else p.delete('q');
    router.push(`/?${p.toString()}`, { scroll: false });
  };
  const closeContent = () => {
    const p = new URLSearchParams(params.toString());
    p.delete('content');
    router.push(`/?${p.toString()}`, { scroll: false });
  };
  const saved = () => {
    setEdit(null);
    setManage('');
    setNewFolder(false);
    setRefreshKey((k) => k + 1);
    setToast('已儲存，內容已更新。');
  };
  if (!ready)
    return (
      <main className="loading">
        <div className="brand">
          <img className="brand-logo" src="/pricerite-logo.svg" alt="Pricerite 實惠" />
          <span>Frontline</span>
        </div>
        <p>正在準備你的銷售工具…</p>
      </main>
    );
  if (setup)
    return (
      <main className="login-shell">
        <div className="login-card">
          <LockKeyhole size={36} />
          <h1>準備連接門市內容</h1>
          <p>程式已就緒，尚未連接 Supabase。請按 README 設定資料庫、私人檔案儲存及員工帳戶。</p>
          <div className="notice">未完成設定前，不會公開任何公司素材。</div>
        </div>
      </main>
    );
  if (!session) return <Login onLogin={setSession} initialError={sessionError} />;
  const folder = data?.folders.find((f) => f.id === folderId);
  const current = data?.contents.find((c) => c.id === contentId);
  return (
    <div className={`app-shell ${cms ? 'cms-shell' : 'frontline'}`}>
      <header className="topbar">
        <button className="brand" onClick={() => navigate('', false)}>
          <img className="brand-logo" src="/pricerite-logo.svg" alt="Pricerite 實惠" />
          <span>
            {cms ? 'Frontline' : '前線銷售'}
            {cms && <i>門市銷售工具</i>}
          </span>
        </button>
        <div className="top-actions">
          {session.demo && !cms && (
            <span className="demo-label" title="所有屋苑、產品及優惠均為示例，非正式銷售資料">
              示例模式
            </span>
          )}
          {cms && (
            <span className="internal">
              <span />
              內部專用
            </span>
          )}
          {session.role === 'admin' && (
            <button
              className={`subtle ${cms ? 'selected' : ''}`}
              onClick={() => navigate(folderId, !cms)}
            >
              {cms && <Monitor size={17} />}
              <span>{cms ? '返回展示' : '內容管理'}</span>
            </button>
          )}
          {!session.demo && (
            <button
              className="icon-btn"
              aria-label="登出"
              onClick={async () => {
                await api('/api/session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'logout' }),
                });
                setSession(null);
                setData(null);
              }}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>
      {session.demo && cms && (
        <div className="demo-strip">
          本機示例模式 <span>· 所有屋苑、產品及優惠均為示例，非正式銷售資料</span>
        </div>
      )}
      <div className="workspace">
        {cms && (
          <aside className="sidebar">
            <p className="overline">{cms ? 'CONTENT WORKSPACE' : 'SELLING TOOLKIT'}</p>
            <button
              className={!folderId ? 'nav-item active' : 'nav-item'}
              onClick={() => navigate('')}
            >
              <Home size={19} />
              {cms ? '管理總覽' : '工具首頁'}
            </button>
            <div className="nav-divider" />
            {(data ? rootFolders(data) : []).map((f, i) => {
              const Icon = rootIcons[i % rootIcons.length] || Folder;
              const active = folderId && data && trail(data.folders, folderId)[0]?.id === f.id;
              return (
                <button
                  key={f.id}
                  className={`nav-item ${active ? 'active' : ''}`}
                  onClick={() => navigate(f.id)}
                >
                  <Icon size={19} />
                  {f.name}
                </button>
              );
            })}
          </aside>
        )}
        <main className="main">
          {cmsMode && !cmsUnlocked && session.role === 'admin' ? (
            <CmsAccessGate
              demo={session.demo}
              onUnlock={() => setCmsUnlocked(true)}
              onCancel={() => navigate(folderId, false)}
            />
          ) : error ? (
            <div className="empty">
              <h2>未能載入內容</h2>
              <p role="alert">{error}</p>
              <button className="primary" onClick={() => setRefreshKey((k) => k + 1)}>
                <RefreshCw size={16} />
                重新載入
              </button>
            </div>
          ) : !data ? (
            <div className="loading">正在載入目錄…</div>
          ) : (
            <>
              {(folderId || cms) && (
                <Breadcrumb folders={data.folders} id={folderId} navigate={navigate} />
              )}
              {!cms && (!folderId || folder) ? (
                <>
                  {folder && (
                    <div className="frontline-folder-heading">
                      <h1>{folderLabel(folder)}</h1>
                      <div className="frontline-folder-actions">
                        <FolderCacheButton contents={folderPublishedContents(data, folder.id)} />
                        <button
                          className="search-clear"
                          onClick={() => navigate(folder.parentId || '')}
                        >
                          返回上一層
                        </button>
                      </div>
                    </div>
                  )}
                  <FrontlineBrowser
                    key={folderId}
                    data={data}
                    folder={folder}
                    query={searchQuery}
                    onSearch={search}
                    navigate={navigate}
                    open={(c) => navigate(folderId, false, c.id)}
                  />
                </>
              ) : !folderId ? (
                <HomePage data={data} cms={cms} navigate={navigate} saved={saved} />
              ) : !folder ? (
                <Empty title="找不到這個資料夾">
                  <button onClick={() => navigate('')} className="text-btn">
                    返回首頁
                  </button>
                </Empty>
              ) : (
                <>
                  <div className="page-heading">
                    <div>
                      {cms && (
                        <span className="eyebrow">
                          {cms
                            ? 'CONTENT MANAGEMENT'
                            : trail(data.folders, folderId)[0]?.name === 'New Housing'
                              ? 'NEW HOUSING SALE KIT'
                              : 'FRONTLINE COLLECTION'}
                        </span>
                      )}
                      <h1>{folder.name}</h1>
                      {cms && (
                        <p>
                          {folder.subtitle ||
                            (cms
                              ? '逐層整理內容，讓前線快速找到所需。'
                              : '選擇資料夾或內容，開始向客人展示。')}
                        </p>
                      )}
                    </div>
                    {cms && (
                      <div className="button-row">
                        {folderId === 'scenes' ? (
                          <button className="primary" onClick={() => setManage('scene')}>
                            <Settings2 size={17} />
                            管理場景
                          </button>
                        ) : (
                          <>
                            <button className="secondary" onClick={() => setNewFolder(true)}>
                              <Folder size={17} />
                              新增資料夾
                            </button>
                            <button className="primary" onClick={() => setEdit('new')}>
                              <Upload size={17} />
                              上載內容
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {folderId === 'scenes' && !cms ? (
                    <SimpleDirectory data={data} navigate={navigate} scenes />
                  ) : folderId === 'scenes' ? (
                    <div className="scene-grid">
                      {data.scenes
                        .sort(byOrder)
                        .filter((s) => cms || s.active)
                        .map((s, i) => (
                          <article className={`scene-card tone-${i % 3}`} key={s.id}>
                            <div className="scene-illustration">
                              {s.image ? (
                                <Thumb src={s.image} />
                              ) : (
                                <>
                                  {i % 2 ? <Armchair /> : <Building2 />}
                                  <span>0{i + 1}</span>
                                </>
                              )}
                            </div>
                            <div>
                              <small>生活場景 / 0{i + 1}</small>
                              <h2>{s.name}</h2>
                              <External url={s.url} className="text-link">
                                查看 eShop 推介
                              </External>
                              {cms && !s.active && <span className="status draft">已隱藏</span>}
                            </div>
                          </article>
                        ))}
                    </div>
                  ) : (
                    <FolderBrowser
                      key={`${folderId}-${cms}`}
                      data={data}
                      folder={folder}
                      cms={cms}
                      navigate={navigate}
                      edit={setEdit}
                      saved={saved}
                    />
                  )}
                </>
              )}
            </>
          )}
          {cms && (
            <footer>
              PRICERITE FRONTLINE
            </footer>
          )}
        </main>
      </div>
      {data &&
        contentId &&
        (current ? (
          <Viewer content={current} data={data} close={closeContent} />
        ) : (
          <Modal title="內容未能開啟" close={closeContent}>
            <Empty title="內容不存在、已下架或未發布" />
          </Modal>
        ))}
      {data && edit && (
        <ContentEditor
          data={data}
          folderId={folderId}
          content={edit === 'new' ? undefined : edit}
          demo={session.demo}
          close={() => setEdit(null)}
          saved={saved}
        />
      )}
      {data && manage && (
        <ManagePanel
          kind={manage as ManageKind}
          data={data}
          demo={session.demo}
          close={() => setManage('')}
          saved={saved}
        />
      )}
      {newFolder && (
        <FolderForm parentId={folderId} close={() => setNewFolder(false)} saved={saved} />
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
