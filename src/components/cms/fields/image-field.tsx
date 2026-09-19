'use client';
import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { upload } from '@/lib/client';
import { IMAGE_MIMES, isImageMime } from '@/lib/upload-policy';
import { Thumb } from '../../ui';

export function ImageField({
  label,
  value,
  onChange,
  onBusy,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  onBusy?: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="image-field">
      <span className="field-label">{label}</span>
      <div>
        {value && (
          <div className="mini-image">
            <Thumb src={value} />
          </div>
        )}
        <label className="secondary">
          <ImageIcon size={16} />
          {busy ? '上載中…' : value ? '替換圖片' : '選擇圖片'}
          <input
            className="sr-only"
            type="file"
            accept={IMAGE_MIMES.join(',')}
            aria-label={label}
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError('');
              setBusy(true);
              onBusy?.(true);
              try {
                if (!isImageMime(file.type)) throw new Error('請選擇 JPG、PNG 或 WebP。');
                onChange(await upload(file));
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
                onBusy?.(false);
              }
            }}
          />
        </label>
        {value && (
          <button type="button" className="text-btn" onClick={() => onChange('')}>
            移除
          </button>
        )}
      </div>
      {error && (
        <small className="error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
