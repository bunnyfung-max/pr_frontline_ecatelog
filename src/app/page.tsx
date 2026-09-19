import { Suspense } from 'react';
import { CatalogApp } from '@/components/app';
export default function Page() {
  return (
    <Suspense fallback={<main className="loading">正在準備門市銷售工具…</main>}>
      <CatalogApp />
    </Suspense>
  );
}
