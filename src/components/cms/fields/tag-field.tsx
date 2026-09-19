'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { normalizeTag } from '../utils';

export function TagField({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');
  const add = (raw: string) => {
    const tag = normalizeTag(raw);
    if (!tag || tag.length > 50 || tags.includes(tag) || tags.length >= 30) return;
    onChange([...tags, tag]);
    setInput('');
  };
  return (
    <label>
      標籤
      <div className="tag-field">
        {tags.length > 0 && (
          <div className="tag-list">
            {tags.map((tag) => (
              <span className="tag-chip" key={tag}>
                {tag}
                <button
                  type="button"
                  className="tag-chip-remove"
                  aria-label={`移除標籤 ${tag}`}
                  onClick={() => onChange(tags.filter((item) => item !== tag))}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(input);
            }
          }}
          placeholder="輸入標籤後按 Enter 新增"
          maxLength={50}
        />
      </div>
      <small>可任意新增，用於分類、搜尋及展示。每個標籤最多 50 字，最多 30 個。</small>
    </label>
  );
}
