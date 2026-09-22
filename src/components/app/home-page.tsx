'use client';
import { useState } from 'react';
import { Search, Plus, Folder } from 'lucide-react';
import type { Catalog } from '@/lib/types';
import { rootFolders, folderDeleteBlockers } from '@/lib/catalog';
import { useFolderDelete } from '@/hooks/use-folder-delete';
import { Empty } from '../ui';
import { SimpleDirectory } from '../simple-directory';
import { CmsFolderCard } from '../cms-folder-card';
import { FolderDeleteConfirm } from './folder-delete-confirm';
import { RootFolderForm } from './root-folder-form';
import { rootIcons, rootIntro } from './constants';

export function HomePage({
  data,
  cms,
  navigate,
  saved,
}: {
  data: Catalog;
  cms: boolean;
  navigate: (id: string, admin?: boolean) => void;
  saved: () => void;
}) {
  const [q, setQ] = useState('');
  const [newRoot, setNewRoot] = useState(false);
  const {
    deleteError,
    requestDelete,
    pendingDelete,
    cancelDelete,
    confirmDelete,
    deleting,
  } = useFolderDelete(data, saved);
  const roots = rootFolders(data);
  if (!cms) return <SimpleDirectory data={data} navigate={navigate} />;
  const filtered = roots.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));
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
          const Icon = rootIcons[i % rootIcons.length] || Folder;
          const desc = rootIntro[i % rootIntro.length];
          const blockers = folderDeleteBlockers(data, f.id);
          return (
            <CmsFolderCard
              key={f.id}
              name={f.name}
              description={f.subtitle || desc}
              index={i}
              icon={Icon}
              tone={i}
              onOpen={() => navigate(f.id, true)}
              onDelete={() => requestDelete(f, true)}
              deleteTitle={
                blockers.length
                  ? `刪除 ${f.name}（含子目錄及內容）`
                  : `刪除 ${f.name}`
              }
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
      {pendingDelete && (
        <FolderDeleteConfirm
          name={pendingDelete.folder.name}
          root={pendingDelete.root}
          warnings={pendingDelete.warnings}
          deleting={deleting}
          error={deleteError}
          onConfirm={() => void confirmDelete()}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
}
