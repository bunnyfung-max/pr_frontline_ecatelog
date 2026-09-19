'use client';
import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, FileText, Film, UploadCloud, X } from 'lucide-react';
import type { Content } from '@/lib/types';
import { upload } from '@/lib/client';
import { MAX_UPLOAD_BYTES } from '@/lib/upload-policy';
import {
  IMAGE_MIMES,
  KIT_MIMES,
  KIT_PREVIEW_LABELS,
  KIT_RESERVED,
  KIT_SLOTS,
  MAX_KIT_FILES,
  fileKind,
  kitFiles,
  moveKitExtra,
  setKitSlot,
} from '@/lib/sales-kit';
import { Thumb } from './ui';

function KitSlotThumb({ index, src }: { index: number; src: string }) {
  const label = KIT_PREVIEW_LABELS[index] ?? `圖 ${index + 1}`;
  if (!src || src.startsWith('/demo/sales-kit-')) {
    return (
      <div className="kit-slot-preview" aria-label={`${label}預覽`}>
        <span>{label}</span>
      </div>
    );
  }
  return <Thumb src={src} alt={`${label}預覽`} fallbackLabel={label} />;
}

export function SalesKitUpload({
  value,
  setValue,
  demo,
  onBusy,
  onError,
  legacy,
}: {
  value: Content;
  setValue: React.Dispatch<React.SetStateAction<Content>>;
  demo: boolean;
  onBusy: (busy: boolean) => void;
  onError: (message: string) => void;
  legacy: boolean;
}) {
  const locked = useRef(false);
  const [progress, setProgress] = useState('');
  const files = kitFiles(value.files);
  async function select(selected: File[], slot?: number) {
    if (!selected.length || locked.current) return;
    locked.current = true;
    onBusy(true);
    onError('');
    try {
      const allowed = slot === undefined ? KIT_MIMES : IMAGE_MIMES;
      if (selected.some((file) => !(allowed as readonly string[]).includes(file.type)))
        throw new Error(
          slot === undefined
            ? '只支援 JPG、PNG、WebP、PDF、MP4 或 WebM。'
            : '此位置只接受 JPG、PNG 或 WebP 圖片。',
        );
      if (selected.some((file) => file.size === 0 || file.size > MAX_UPLOAD_BYTES))
        throw new Error('每個檔案須大於 0 bytes，並且不超過 50 MB。');
      if (slot !== undefined && selected.length !== 1)
        throw new Error('每個圖片位置只接受一張圖片。');
      if (slot === undefined && files.length + selected.length > MAX_KIT_FILES)
        throw new Error('每份 Sales Kit 最多 5 個圖片位置及 35 份額外檔案。');
      for (const [i, file] of selected.entries()) {
        setProgress(`正在上載 ${i + 1} / ${selected.length}：${file.name}`);
        const ref = await upload(file);
        // Retain successful uploads even if a subsequent file fails.
        setValue((old) => ({
          ...old,
          files:
            slot === undefined ? [...kitFiles(old.files), ref] : setKitSlot(old.files, slot, ref),
          fileName: [old.fileName, file.name].filter(Boolean).join(', ').slice(0, 1000),
          name: old.name || file.name.replace(/\.[^.]+$/, ''),
        }));
      }
    } catch (error) {
      onError((error as Error).message);
    } finally {
      locked.current = false;
      onBusy(false);
      setProgress('');
    }
  }
  return (
    <section className="kit-upload" aria-label="Sales Kit 檔案及展示次序">
      <div className="kit-upload-heading">
        <h3>Sales Kit 展示次序</h3>
        <p>平面圖發布時必填；效果圖及產品列表位置選填。前端依下列次序展示。</p>
      </div>
      {legacy && (
        <p className="notice">
          原有圖片暫按舊次序放入下列位置，請核對用途並補齊平面圖。儲存前不會改動原有內容。
        </p>
      )}
      <ol className="kit-slots">
        {KIT_SLOTS.map((label, i) => (
          <li key={label} className={`kit-slot ${files[i] ? 'has-file' : ''}`}>
            <span className="kit-number">{i + 1}</span>
            <div className="kit-thumb">
              <KitSlotThumb index={i} src={files[i]} />
            </div>
            <div className="kit-slot-body">
              <strong>{label}</strong>
              <small>
                {i === 0
                  ? '發布時必填 · 固定位置'
                  : i < KIT_RESERVED - 1
                    ? '選填 · 固定位置'
                    : '選填 · 無固定用途'}
              </small>
              <div className="kit-slot-actions">
                <label className="kit-file-button">
                  {files[i] ? '替換圖片' : '選擇圖片'}
                  <input
                    type="file"
                    accept={IMAGE_MIMES.join(',')}
                    aria-label={`上載第 ${i + 1} 張：${label}`}
                    onChange={(event) => {
                      void select(Array.from(event.target.files || []), i);
                      event.target.value = '';
                    }}
                  />
                </label>
                {files[i] && (
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`移除第 ${i + 1} 張：${label}`}
                    onClick={() =>
                      setValue((old) => ({ ...old, files: setKitSlot(old.files, i, '') }))
                    }
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="kit-upload-heading">
        <h3>其他檔案（選填）</h3>
        <p>排在以上圖片之後。PDF 逐頁展示，影片獨立展示；空白位置不會出現在前端。</p>
      </div>
      <div className="upload-list kit-extras">
        {files.slice(KIT_RESERVED).map((file, i) => {
          const index = i + KIT_RESERVED;
          const kind = fileKind(file);
          return (
            <div key={`${index}-${file}`}>
              <span>
                {kind === 'image' ? (
                  <Thumb src={file} />
                ) : kind === 'pdf' ? (
                  <FileText size={28} />
                ) : (
                  <Film size={28} />
                )}
                額外 {i + 1} · {kind === 'image' ? '圖片' : kind === 'pdf' ? 'PDF' : '影片'}
              </span>
              <div>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`額外檔案 ${i + 1} 上移`}
                  disabled={!i}
                  onClick={() =>
                    setValue((old) => ({ ...old, files: moveKitExtra(old.files, index, -1) }))
                  }
                >
                  <ArrowUp size={17} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`額外檔案 ${i + 1} 下移`}
                  disabled={index === files.length - 1}
                  onClick={() =>
                    setValue((old) => ({ ...old, files: moveKitExtra(old.files, index, 1) }))
                  }
                >
                  <ArrowDown size={17} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`移除額外檔案 ${i + 1}`}
                  onClick={() =>
                    setValue((old) => ({ ...old, files: old.files.filter((_, n) => n !== index) }))
                  }
                >
                  <X size={17} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <label className="upload-zone kit-extra-upload">
        <UploadCloud size={25} />
        <strong>加入其他檔案</strong>
        <span>
          圖片 / PDF / MP4 / WebM · 可多選
          <br />
          每份上限 50 MB · 最多 35 份額外檔案
        </span>
        <input
          type="file"
          aria-label="加入 Sales Kit 額外檔案"
          multiple
          accept={KIT_MIMES.join(',')}
          onChange={(event) => {
            void select(Array.from(event.target.files || []));
            event.target.value = '';
          }}
        />
      </label>
      {progress && <p role="status">{progress}</p>}
    </section>
  );
}
