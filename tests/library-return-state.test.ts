import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLibraryReturn, saveLibraryReturn, switchLibraryReturn, clearLibraryReturn, type LibraryViewState } from '../src/lib/library-return-state';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const view: LibraryViewState = {
  request: { mode: 'directory', folderId: 'housing' }, childId: 'public', directoryQuery: '梳化',
  scopeQuery: '', selectedValue: '', searchInput: '',
};

test('reload restores directory, filter and search only for the same content and source', () => {
  const storage = new MemoryStorage();
  saveLibraryReturn(storage, '?folder=housing&q=梳化', 'first', view);
  assert.deepEqual(loadLibraryReturn(storage, '?folder=housing&q=梳化&content=first'), view);
  assert.equal(loadLibraryReturn(storage, '?folder=housing&q=梳化&content=other'), null);
  assert.equal(loadLibraryReturn(storage, '?folder=other&q=梳化&content=first'), null);
  assert.equal(loadLibraryReturn(storage, '?folder=housing&q=床&content=first'), null);
  assert.equal(loadLibraryReturn(storage, '?folder=housing&q=梳化'), null);
});

test('switching content retains the original view and ignores unrelated links', () => {
  const storage = new MemoryStorage();
  const scopeView: LibraryViewState = { ...view, request: { mode: 'scope', scope: 'brand' }, selectedValue: '品牌', scopeQuery: '椅' };
  saveLibraryReturn(storage, '', 'first', scopeView);
  switchLibraryReturn(storage, '?content=unrelated', 'wrong');
  assert.equal(loadLibraryReturn(storage, '?content=wrong'), null);
  switchLibraryReturn(storage, '?content=first', 'second');
  assert.deepEqual(loadLibraryReturn(storage, '?content=second'), scopeView);
  assert.equal(loadLibraryReturn(storage, '?content=first'), null);
  clearLibraryReturn(storage);
  assert.equal(loadLibraryReturn(storage, '?content=second'), null);
});

test('invalid data or unavailable storage safely falls back', () => {
  const storage = new MemoryStorage();
  storage.setItem('frontline-library-return-v1', '{broken');
  assert.equal(loadLibraryReturn(storage, '?content=first'), null);
  storage.setItem('frontline-library-return-v1', JSON.stringify({ version: 1, contentId: 'first', folder: '', query: '', view: { request: { mode: 'scope', scope: 'bogus' } } }));
  assert.equal(loadLibraryReturn(storage, '?content=first'), null);
  const blocked = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } } as unknown as Storage;
  assert.equal(loadLibraryReturn(blocked, '?content=first'), null);
  assert.doesNotThrow(() => saveLibraryReturn(blocked, '', 'first', view));
  assert.doesNotThrow(() => clearLibraryReturn(blocked));
});
