'use client';
import { useState, useCallback } from 'react';
import type { Catalog, Folder } from '@/lib/types';
import { folderDeleteBlockers } from '@/lib/catalog';
import { remove } from '@/lib/client';

export function useFolderDelete(catalog: Catalog, onSaved: () => void) {
  const [deleteError, setDeleteError] = useState('');
  const deleteFolder = useCallback(
    async (folder: Folder, root = false) => {
      const blockers = folderDeleteBlockers(catalog, folder.id);
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
        onSaved();
      } catch (e) {
        setDeleteError((e as Error).message);
      }
    },
    [catalog, onSaved],
  );
  return { deleteError, setDeleteError, deleteFolder };
}
