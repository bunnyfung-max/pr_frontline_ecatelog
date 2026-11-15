import type { ReactNode } from 'react';

/** Decorative illustration shared by the catalogue's empty and no-match states. */
export function EmptyState({
  kind,
  title,
  detail,
  className = '',
  children,
}: {
  kind: 'search' | 'empty';
  title: ReactNode;
  detail?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`frontline-empty-state ${className}`.trim()}>
      <img
        className="empty-art"
        src={kind === 'search' ? '/frontline/figma/empty-search.png' : '/frontline/figma/empty-style.svg'}
        alt=""
      />
      <h3>{title}</h3>
      {detail && <p>{detail}</p>}
      {children}
    </div>
  );
}
