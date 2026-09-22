'use client';
import { useState, useCallback } from 'react';
import type { Catalog, Folder } from '@/lib/types';
import { folderDeleteBlockers } from '@/lib/catalog';
import { remove } from '@/lib/client';

type PendingDelete = {
  folder: Folder;
  root: boolean;
  warnings: string[];
  cascade: boolean;
};

export function useFolderDelete(catalog: Catalog, onSaved: () => void) {
  const [deleteError, setDeleteError] = useState('');
  const [pending, setPending] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);

  const requestDelete = useCallback(
    (folder: Folder, root = false) => {
      const warnings = folderDeleteBlockers(catalog, folder.id);
      if (warnings.includes('找不到此資料夾。')) {
        setDeleteError(`無法刪除「${folder.name}」：找不到此資料夾。`);
        return;
      }
      setDeleteError('');
      setPending({ folder, root, warnings, cascade: warnings.length > 0 });
    },
    [catalog],
  );

  const cancelDelete = useCallback(() => {
    if (!deleting) setPending(null);
  }, [deleting]);

  const confirmDelete = useCallback(async () => {
    if (!pending || deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await remove('folder', pending.folder.id, { cascade: pending.cascade });
      setPending(null);
      onSaved();
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  }, [pending, deleting, onSaved]);

  return {
    deleteError,
    setDeleteError,
    requestDelete,
    pendingDelete: pending,
    cancelDelete,
    confirmDelete,
    deleting,
  };
}
