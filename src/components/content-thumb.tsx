'use client';

import { FileText, Film, Image as ImageIcon, Link2 } from 'lucide-react';
import type { Content } from '@/lib/types';
import { contentPreviewKind, contentPreviewRef } from '@/lib/content-display';
import { FILE_KIND_LABEL } from '@/lib/sales-kit';
import { Thumb } from './ui';

export function ContentThumb({
  content,
  className = '',
}: {
  content: Content;
  className?: string;
}) {
  const preview = contentPreviewRef(content);
  if (preview) {
    return <Thumb src={preview} alt={content.name} className={className} />;
  }
  const kind = contentPreviewKind(content);
  if (!kind) {
    return <Thumb src="" fallbackLabel={content.name} className={className} />;
  }
  const Icon = kind === 'pdf' ? FileText : kind === 'video' ? Film : kind === 'link' ? Link2 : ImageIcon;
  return (
    <div className={`placeholder content-thumb-placeholder ${className}`}>
      <Icon size={30} strokeWidth={1.4} />
      <span>{FILE_KIND_LABEL[kind]}</span>
    </div>
  );
}
