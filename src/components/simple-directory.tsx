'use client';

import { useState } from 'react';
import { ArrowUpRight, ChevronRight, Folder, Search, X } from 'lucide-react';
import type { Catalog } from '@/lib/types';
import { byOrder } from '@/lib/catalog';
import { Empty } from './ui';

export function SimpleDirectory({
  data,
  navigate,
  scenes = false,
}: {
  data: Catalog;
  navigate: (id: string) => void;
  scenes?: boolean;
}) {
  const [query, setQuery] = useState('');
  const entries = scenes
    ? data.scenes.filter((scene) => scene.active).sort(byOrder)
    : data.folders.filter((folder) => !folder.parentId).sort(byOrder);
  const matches = entries.filter((entry) =>
    entry.name
      .normalize('NFKC')
      .toLowerCase()
      .includes(query.trim().normalize('NFKC').toLowerCase()),
  );

  return (
    <section className="simple-directory" aria-label={scenes ? '場景目錄' : '銷售目錄'}>
      {!scenes && <h1>銷售目錄</h1>}
      <div className="directory-search" role="search">
        <Search size={22} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={scenes ? '搜尋場景推介' : '搜尋目錄'}
          aria-label={scenes ? '搜尋場景推介' : '搜尋主入口'}
          autoComplete="off"
        />
        {query && (
          <button className="icon-btn" aria-label="清除搜尋" onClick={() => setQuery('')}>
            <X size={18} />
          </button>
        )}
      </div>
      <p className="directory-scope">{scenes ? '目前範圍：場景推介' : '目前範圍：主目錄'}</p>
      <div className="directory-grid">
        {matches.map((entry) => {
          const contents = (
            <>
              <Folder size={25} strokeWidth={1.5} aria-hidden="true" />
              <span>{entry.name}</span>
              {scenes && 'url' in entry ? (
                <ArrowUpRight size={18} aria-hidden="true" />
              ) : (
                <ChevronRight size={18} aria-hidden="true" />
              )}
            </>
          );
          if (scenes && 'url' in entry) {
            return entry.url ? (
              <a
                className="directory-entry"
                key={entry.id}
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contents}
              </a>
            ) : (
              <div className="directory-entry unconfigured" key={entry.id} aria-disabled="true">
                {contents}
                <small>連結待設定</small>
              </div>
            );
          }
          return (
            <button className="directory-entry" key={entry.id} onClick={() => navigate(entry.id)}>
              {contents}
            </button>
          );
        })}
      </div>
      {matches.length === 0 && <Empty title={scenes ? '找不到此場景' : '找不到此主入口'} />}
    </section>
  );
}
