'use client';
import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { api, uploadFeedbackImage } from '@/lib/client';
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_PRIORITIES,
  FEEDBACK_PRIORITY_LABELS,
  MAX_FEEDBACK_ATTACHMENTS,
  type FeedbackCategory,
  type FeedbackPriority,
} from '@/lib/feedback';
import { Modal } from '../ui';

type PendingAttachment = {
  id: string;
  preview: string;
  ref?: string;
  uploading?: boolean;
  error?: string;
};

export function FeedbackForm({
  close,
  saved,
  pageContext,
}: {
  close: () => void;
  saved: () => void;
  pageContext?: string;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      attachments.forEach((item) => {
        if (item.preview.startsWith('blob:')) URL.revokeObjectURL(item.preview);
      });
    },
    [attachments],
  );

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (!list.length) {
      setError('請選擇或貼上圖片。');
      return;
    }
    const remaining = MAX_FEEDBACK_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      setError(`最多 ${MAX_FEEDBACK_ATTACHMENTS} 張附件。`);
      return;
    }
    setError('');
    for (const file of list.slice(0, remaining)) {
      const id = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      setAttachments((prev) => [...prev, { id, preview, uploading: true }]);
      try {
        const ref = await uploadFeedbackImage(file);
        setAttachments((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ref, uploading: false } : item)),
        );
      } catch (e) {
        setAttachments((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, uploading: false, error: (e as Error).message }
              : item,
          ),
        );
      }
    }
  };

  const onPaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length) {
      event.preventDefault();
      void addFiles(files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.preview.startsWith('blob:')) URL.revokeObjectURL(target.preview);
      return prev.filter((item) => item.id !== id);
    });
  };

  return (
    <Modal title="試用回饋 / 報告問題" close={close} wide>
      <form
        className="form-body feedback-form"
        onPaste={onPaste}
        onSubmit={async (e) => {
          e.preventDefault();
          if (attachments.some((item) => item.uploading)) {
            setError('請等待圖片上載完成。');
            return;
          }
          if (attachments.some((item) => item.error)) {
            setError('請移除上載失敗的圖片後再提交。');
            return;
          }
          setBusy(true);
          setError('');
          const form = new FormData(e.currentTarget);
          try {
            await api('/api/feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: form.get('name'),
                category: form.get('category'),
                description: form.get('description'),
                priority: form.get('priority'),
                pageContext,
                attachments: attachments.map((item) => item.ref).filter(Boolean),
              }),
            });
            saved();
            close();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="feedback-intro">
          歡迎分享試用體驗、回饋建議或報告問題。可上載圖片，或在下方區域直接貼上螢幕截圖。
        </p>
        <label>
          名稱
          <input name="name" required maxLength={200} placeholder="你的名字" />
        </label>
        <label>
          類別
          <select name="category" required defaultValue="bug">
            {FEEDBACK_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {FEEDBACK_CATEGORY_LABELS[value as FeedbackCategory]}
              </option>
            ))}
          </select>
        </label>
        <label>
          重要性
          <select name="priority" required defaultValue="medium">
            {FEEDBACK_PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {FEEDBACK_PRIORITY_LABELS[value as FeedbackPriority]}
              </option>
            ))}
          </select>
        </label>
        <label>
          簡單描述
          <textarea
            name="description"
            required
            maxLength={4000}
            rows={5}
            placeholder="請描述問題或優化建議…"
          />
        </label>
        <div className="feedback-attachments-block">
          <div className="feedback-attachments-head">
            <span>附件（選填）</span>
            <button
              type="button"
              className="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={attachments.length >= MAX_FEEDBACK_ATTACHMENTS}
            >
              <ImagePlus size={16} />
              加入圖片
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files?.length) void addFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <div
            ref={dropRef}
            className="feedback-paste-zone"
            tabIndex={0}
            onPaste={onPaste}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.length) void addFiles(e.dataTransfer.files);
            }}
          >
            在此貼上螢幕截圖（Ctrl/Cmd + V），或拖放圖片到此
          </div>
          {attachments.length > 0 && (
            <ul className="feedback-attachments">
              {attachments.map((item) => (
                <li key={item.id} className="feedback-attachment">
                  <img src={item.preview} alt="" />
                  {item.uploading && <span className="feedback-attachment-status">上載中…</span>}
                  {item.error && <span className="feedback-attachment-error">{item.error}</span>}
                  <button
                    type="button"
                    className="icon-btn feedback-attachment-remove"
                    aria-label="移除附件"
                    onClick={() => removeAttachment(item.id)}
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {busy ? '提交中…' : '提交回饋'}
        </button>
      </form>
    </Modal>
  );
}
