'use client';
import { useState, useCallback } from 'react';
import type { Catalog, Folder } from '@/lib/types';
import { folderDeleteBlockers } from '@/lib/catalog';
import { remove } from '@/lib/client';

function folderDeleteConfirmMessage(folder: Folder, root: boolean, warnings: string[]) {
  const label = root ? '主目錄' : '資料夾';
  const lines = [`確認刪除${label}「${folder.name}」？`];
  if (warnings.length) {
    lines.push('', `此操作會同時刪除：${warnings.join('、')}。`);
  }
  lines.push('', '此操作不可復原。');
  return lines.join('\n');
}

export function useFolderDelete(catalog: Catalog, onSaved: () => void) {
  const [deleteError, setDeleteError] = useState('');
  const deleteFolder = useCallback(
    async (folder: Folder, root = false) => {
      const warnings = folderDeleteBlockers(catalog, folder.id);
      if (warnings.includes('找不到此資料夾。')) {
        setDeleteError(`無法刪除「${folder.name}」：找不到此資料夾。`);
        return;
      }
      const cascade = warnings.length > 0;
      if (!window.confirm(folderDeleteConfirmMessage(folder, root, warnings))) return;
      setDeleteError('');
      try {
        await remove('folder', folder.id, { cascade });
        onSaved();
      } catch (e) {
        setDeleteError((e as Error).message);
      }
    },
    [catalog, onSaved],
  );
  return { deleteError, setDeleteError, deleteFolder };
}
