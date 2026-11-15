import type { SearchCategory } from './catalog-search';

export type LibraryRequest =
  | { mode: 'directory'; folderId: string }
  | { mode: 'scope'; scope: SearchCategory }
  | { mode: 'search'; query: string };

export type LibraryViewState = {
  request: LibraryRequest;
  childId: string;
  directoryQuery: string;
  scopeQuery: string;
  selectedValue: string;
  searchInput: string;
};

type SavedState = { version: 1; contentId: string; folder: string; query: string; view: LibraryViewState };
const KEY = 'frontline-library-return-v1';
const categories = ['product', 'brand', 'colour', 'style', 'estate'];

function read(storage: Storage): SavedState | null {
  try {
    const value = JSON.parse(storage.getItem(KEY) || 'null');
    const view = value?.view;
    const request = view?.request;
    if (value?.version !== 1 || ![value.contentId, value.folder, value.query, view?.childId,
      view?.directoryQuery, view?.scopeQuery, view?.selectedValue, view?.searchInput].every((v) => typeof v === 'string')) return null;
    if (!request || !(
      (request.mode === 'directory' && typeof request.folderId === 'string') ||
      (request.mode === 'scope' && categories.includes(request.scope)) ||
      (request.mode === 'search' && typeof request.query === 'string')
    )) return null;
    return value as SavedState;
  } catch { return null; }
}

export function saveLibraryReturn(storage: Storage, search: string, contentId: string, view: LibraryViewState) {
  try {
    const params = new URLSearchParams(search);
    const state: SavedState = { version: 1, contentId, folder: params.get('folder') || '', query: params.get('q') || '', view };
    storage.setItem(KEY, JSON.stringify(state));
  } catch { /* Browsing still works if storage is unavailable. */ }
}

export function loadLibraryReturn(storage: Storage, search: string): LibraryViewState | null {
  const state = read(storage);
  const params = new URLSearchParams(search);
  return state && state.contentId === params.get('content') && state.folder === (params.get('folder') || '') && state.query === (params.get('q') || '') ? state.view : null;
}

export function switchLibraryReturn(storage: Storage, search: string, nextContentId: string) {
  const state = read(storage);
  const params = new URLSearchParams(search);
  if (!state || state.contentId !== params.get('content') || state.folder !== (params.get('folder') || '') || state.query !== (params.get('q') || '')) return;
  try { storage.setItem(KEY, JSON.stringify({ ...state, contentId: nextContentId })); } catch { /* Storage is optional. */ }
}

export function clearLibraryReturn(storage: Storage) {
  try { storage.removeItem(KEY); } catch { /* Storage is optional. */ }
}
