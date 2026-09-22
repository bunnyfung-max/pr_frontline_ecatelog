'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Content } from '@/lib/types';
import { remove } from '@/lib/client';

export function useContentDelete(contents: Content[], onSaved: () => void) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Content[] | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const contentIds = useMemo(() => new Set(contents.map((c) => c.id)), [contents]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => contentIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [contentIds]);

  const selectedCount = selectedIds.size;
  const allSelected = contents.length > 0 && contents.every((c) => selectedIds.has(c.id));
  const someSelected = contents.some((c) => selectedIds.has(c.id));

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds(allSelected ? new Set() : new Set(contents.map((c) => c.id)));
  }, [allSelected, contents]);

  const requestDelete = useCallback((items: Content[]) => {
    if (!items.length) return;
    setDeleteError('');
    setPending(items);
  }, []);

  const requestDeleteSelected = useCallback(() => {
    requestDelete(contents.filter((c) => selectedIds.has(c.id)));
  }, [contents, selectedIds, requestDelete]);

  const cancelDelete = useCallback(() => {
    if (!deleting) setPending(null);
  }, [deleting]);

  const confirmDelete = useCallback(async () => {
    if (!pending?.length || deleting) return;
    setDeleting(true);
    setDeleteError('');
    const ids = new Set(pending.map((item) => item.id));
    try {
      for (const item of pending) await remove('content', item.id);
      setPending(null);
      setSelectedIds((prev) => new Set([...prev].filter((id) => !ids.has(id))));
      onSaved();
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  }, [pending, deleting, onSaved]);

  return {
    selectedIds,
    selectedCount,
    allSelected,
    someSelected,
    toggle,
    toggleAll,
    requestDeleteSelected,
    pendingDelete: pending,
    cancelDelete,
    confirmDelete,
    deleting,
    contentDeleteError: deleteError,
  };
}
