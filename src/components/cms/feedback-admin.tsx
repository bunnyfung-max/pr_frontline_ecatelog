'use client';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api, feedbackAssetUrl } from '@/lib/client';
import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_PRIORITY_LABELS,
  type FeedbackCategory,
  type FeedbackPriority,
  type FeedbackSubmission,
} from '@/lib/feedback';

function formatWhen(value: string) {
  try {
    return new Intl.DateTimeFormat('zh-HK', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Hong_Kong',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function FeedbackAdmin() {
  const [items, setItems] = useState<FeedbackSubmission[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);

  const load = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await api<{ items: FeedbackSubmission[] }>('/api/feedback');
      setItems(result.items);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="feedback-admin">
      <div className="page-heading">
        <div>
          <span className="eyebrow">TRIAL FEEDBACK</span>
          <h1>試用回饋</h1>
          <p>查看 stakeholder 提交的問題與優化建議。</p>
        </div>
        <button className="secondary" type="button" onClick={() => void load()} disabled={busy}>
          <RefreshCw size={16} />
          重新載入
        </button>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {busy ? (
        <p className="loading-inline">正在載入回饋…</p>
      ) : items.length === 0 ? (
        <div className="empty">
          <h3>暫時沒有回饋</h3>
          <p>前線或試用者提交後會顯示在此。</p>
        </div>
      ) : (
        <div className="feedback-table-wrap">
          <table className="feedback-table">
            <thead>
              <tr>
                <th>時間</th>
                <th>名稱</th>
                <th>電郵</th>
                <th>類別</th>
                <th>重要性</th>
                <th>描述</th>
                <th>附件</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{formatWhen(item.createdAt)}</td>
                  <td>{item.name}</td>
                  <td>{item.email || '—'}</td>
                  <td>{FEEDBACK_CATEGORY_LABELS[item.category as FeedbackCategory]}</td>
                  <td>{FEEDBACK_PRIORITY_LABELS[item.priority as FeedbackPriority]}</td>
                  <td className="feedback-table-desc">{item.description}</td>
                  <td>
                    {item.attachments.length ? (
                      <div className="feedback-table-attachments">
                        {item.attachments.map((ref) => (
                          <a
                            key={ref}
                            href={feedbackAssetUrl(ref)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img src={feedbackAssetUrl(ref)} alt="" loading="lazy" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
