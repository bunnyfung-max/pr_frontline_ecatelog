'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Home,
  Settings2,
  LogOut,
  ArrowRight,
  Search,
  Building2,
  PanelsTopLeft,
  Armchair,
  PencilRuler,
  Sparkles,
  ChevronRight,
  Folder,
  Upload,
  Monitor,
  CheckCircle2,
  LockKeyhole,
  RefreshCw,
  Plus,
} from 'lucide-react';
import type { Catalog, Content, Session, Folder as FolderType } from '@/lib/types';
import { TYPE_LABEL, STATUS_LABEL } from '@/lib/types';
import {
  byOrder,
  trail,
  folderLabel,
  rootFolders,
  folderDeleteBlockers,
  folderPublishedContents,
} from '@/lib/catalog';
import { FolderCacheButton } from './folder-cache-button';
import { api, save, remove } from '@/lib/client';
import { Thumb, Empty, Breadcrumb, External, Modal } from './ui';
import { Viewer } from './viewer';
import { ContentEditor, ManagePanel } from './cms';
import { SimpleDirectory } from './simple-directory';
import { FrontlineBrowser } from './frontline-browser';
import { CmsAccessGate } from './cms-access-gate';
import { CmsFolderCard } from './cms-folder-card';
const icons = [Building2, PanelsTopLeft, Armchair, PencilRuler, Sparkles];
const intro = [
  '由平面圖到產品配搭，一起找到家的可能。',
  '把門市推廣清晰呈現，讓優惠一目了然。',
  '專屬 TMF 展示內容，一站輕鬆取閱。',
  '用空間規劃，啟發每一個家的靈感。',
  '不同人生階段，都有合適的家居選擇。',
];
export function CatalogApp() {
  const router = useRouter();
  const params = useSearchParams();
  const folderId = params.get('folder') || '';
  const cmsMode = params.get('cms') === '1';
  const contentId = params.get('content');
  const searchQuery = params.get('q') || '';
  const [session, setSession] = useState<Session | null>(null);
  const [cmsUnlocked, setCmsUnlocked] = useState(false);
  const [setup, setSetup] = useState(false);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<Catalog | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [edit, setEdit] = useState<Content | 'new' | null>(null);
  const [manage, setManage] = useState('');
  const [newFolder, setNewFolder] = useState(false);
  const [toast, setToast] = useState('');
  const cms = cmsMode && cmsUnlocked;
  const lockCms = useCallback(async () => {
    try {
      await api('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lock-cms' }),
      });
    } catch {
      /* ignore */
    }
    setCmsUnlocked(false);
  }, []);
  useEffect(() => {
    api<{ setup?: boolean; session?: Session; cmsUnlocked?: boolean }>('/api/session')
      .then((r) => {
        setSetup(!!r.setup);
        setSession(r.session || null);
        setCmsUnlocked(!!r.cmsUnlocked);
      })
      .catch((e) => {
        if (!e.message.includes('請先登入')) setError(e.message);
      })
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setData(null);
    setError('');
    api<Catalog>(`/api/catalog${cmsMode && cmsUnlocked ? '?cms=1' : ''}`)
      .then((r) => {
        if (!cancelled) setData(r);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [session, cmsMode, cmsUnlocked, refreshKey]);
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
  if (!session) return <Login onLogin={setSession} initialError={error} />;
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
              const Icon = icons[i % icons.length] || Folder;
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
          kind={manage}
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
function Login({ onLogin, initialError }: { onLogin: (s: Session) => void; initialError: string }) {
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);
  return (
    <main className="login-shell">
      <div className="login-art">
        <span className="brand">
          <img className="brand-logo" src="/pricerite-logo.svg" alt="Pricerite 實惠" />
          <span>Frontline</span>
        </span>
        <h1>
          每個理想的家，
          <br />
          由一次好對話開始。
        </h1>
        <img src="/demo/sales-kit-render-1.svg" alt="家居空間插畫" />
      </div>
      <form
        className="login-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          setBusy(true);
          const form = new FormData(e.currentTarget);
          try {
            const r = await api<{ session: Session }>('/api/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
            });
            onLogin(r.session);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <span className="eyebrow">WELCOME TO FRONTLINE</span>
        <h2>登入門市銷售工具</h2>
        <p>使用獲授權的員工帳戶，取閱銷售資料。</p>
        <label>
          工作電郵
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            placeholder="name@company.com"
          />
        </label>
        <label>
          密碼
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {busy ? '登入中…' : '登入'}
          <ArrowRight size={18} />
        </button>
        <small>內部專用 · 如需帳戶，請聯絡系統管理員。</small>
      </form>
    </main>
  );
}
function HomePage({
  data,
  cms,
  navigate,
  saved,
}: {
  data: Catalog;
  cms: boolean;
  navigate: (id: string) => void;
  saved: () => void;
}) {
  const [q, setQ] = useState('');
  const [newRoot, setNewRoot] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const roots = rootFolders(data);
  if (!cms) return <SimpleDirectory data={data} navigate={navigate} />;
  const filtered = roots.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));
  const deleteFolder = async (folder: FolderType, root = false) => {
    const blockers = folderDeleteBlockers(data, folder.id);
    if (blockers.length) {
      setDeleteError(`無法刪除「${folder.name}」：${blockers.join('、')}。`);
      return;
    }
    if (
      !window.confirm(
        `確認刪除${root ? '主目錄' : '資料夾'}「${folder.name}」？\n此操作不可復原，請先確保目錄內已清空。`,
      )
    )
      return;
    setDeleteError('');
    try {
      await remove('folder', folder.id);
      saved();
    } catch (e) {
      setDeleteError((e as Error).message);
    }
  };
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>選擇管理目錄</h2>
          <p>{roots.length} 個主目錄入口，一站取閱。</p>
        </div>
        <div className="section-heading-actions">
          <label className="home-search">
            <Search size={17} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜尋主入口"
              aria-label="搜尋主入口"
            />
          </label>
          <button className="secondary" type="button" onClick={() => setNewRoot(true)}>
            <Plus size={16} />
            新增主目錄
          </button>
        </div>
      </div>
      {deleteError && (
        <p className="error" role="alert">
          {deleteError}
        </p>
      )}
      <div className="tool-grid tool-grid-managed">
        {filtered.map((f, i) => {
          const Icon = icons[i % icons.length] || Folder;
          const desc = intro[i % intro.length];
          const blockers = folderDeleteBlockers(data, f.id);
          return (
            <CmsFolderCard
              key={f.id}
              name={f.name}
              description={f.subtitle || desc}
              index={i}
              icon={Icon}
              tone={i}
              onOpen={() => navigate(f.id)}
              onDelete={() => void deleteFolder(f, true)}
              deleteBlocked={blockers.length > 0}
              deleteTitle={blockers.length ? '請先清空子目錄及內容' : `刪除 ${f.name}`}
            />
          );
        })}
      </div>
      {q && !roots.some((f) => f.name.toLowerCase().includes(q.toLowerCase())) && (
        <Empty title="找不到此主入口" />
      )}
      {newRoot && (
        <RootFolderForm
          order={roots.reduce((max, f) => Math.max(max, f.order), -1) + 1}
          close={() => setNewRoot(false)}
          saved={saved}
        />
      )}
    </>
  );
}
function RootFolderForm({
  order,
  close,
  saved,
}: {
  order: number;
  close: () => void;
  saved: () => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="新增主目錄" close={close}>
      <form
        className="form-body"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const f = new FormData(e.currentTarget);
          try {
            await save('folder', {
              id: crypto.randomUUID(),
              parentId: null,
              name: f.get('name'),
              subtitle: f.get('subtitle') || '',
              order: Number(f.get('order')),
            });
            saved();
            close();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          主目錄名稱
          <input name="name" required maxLength={200} placeholder="例如：VIP 專區" />
        </label>
        <label>
          簡短說明
          <input name="subtitle" maxLength={500} placeholder="顯示於主目錄卡片下方" />
        </label>
        <label>
          排列次序
          <input name="order" type="number" min={0} max={99999} defaultValue={order} />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          建立主目錄
        </button>
      </form>
    </Modal>
  );
}
function FolderBrowser({
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
  const [deleteError, setDeleteError] = useState('');
  const deleteFolder = async (target: FolderType) => {
    const blockers = folderDeleteBlockers(data, target.id);
    if (blockers.length) {
      setDeleteError(`無法刪除「${target.name}」：${blockers.join('、')}。`);
      return;
    }
    if (
      !window.confirm(
        `確認刪除資料夾「${target.name}」？\n此操作不可復原，請先確保目錄內已清空。`,
      )
    )
      return;
    setDeleteError('');
    try {
      await remove('folder', target.id);
      saved();
    } catch (e) {
      setDeleteError((e as Error).message);
    }
  };
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
function FolderForm({
  parentId,
  close,
  saved,
}: {
  parentId: string;
  close: () => void;
  saved: () => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="新增子資料夾" close={close}>
      <form
        className="form-body"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const f = new FormData(e.currentTarget);
          try {
            await save('folder', {
              id: crypto.randomUUID(),
              parentId,
              name: f.get('name'),
              subtitle: '',
              order: Number(f.get('order')),
            });
            saved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          資料夾名稱
          <input name="name" required maxLength={200} />
        </label>
        <label>
          排列次序
          <input name="order" type="number" min={0} max={99999} defaultValue={0} />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          建立資料夾
        </button>
      </form>
    </Modal>
  );
}
