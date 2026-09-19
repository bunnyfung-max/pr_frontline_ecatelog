import type { Metadata } from 'next';
import './globals.css';
import './frontline-search.css';
export const metadata: Metadata = {
  title: '實惠 Frontline · 門市銷售工具',
  description: 'PriceRite 內部前線電子目錄',
  robots: { index: false, follow: false },
};
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-HK">
      <body>{children}</body>
    </html>
  );
}
