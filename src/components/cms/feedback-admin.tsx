'use client';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api, feedbackAssetUrl, updateFeedbackStatus } from '@/lib/client';
import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_PRIORITY_LABELS,
  FEEDBACK_STATUS_LABELS,
  type FeedbackCategory,
  type FeedbackPriority,
  type FeedbackResolvedStatus,
  type FeedbackStatus,
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

function FeedbackStatusCell({
  item,
  updating,
  onUpdate,
}: {
  item: FeedbackSubmission;
  updating: boolean;
  onUpdate: (id: string, status: FeedbackResolvedStatus) => Promise<void>;
}) {
  const status = item.status || 'open';
  if (status !== 'open') {
    return (
      <span className={`feedback-status feedback-status-${status}`}>
        {FEEDBACK_STATUS_LABELS[status]}
      </span>
    );
  }
  return (
    <select
      className="feedback-status-select"
      value="open"
      disabled={updating}
      aria-label={`更新 ${item.name} 的狀態`}
      onChange={(e) => {
        const next = e.target.value as FeedbackStatus;
        if (next === 'solved' || next === 'future_plan') void onUpdate(item.id, next);
      }}
    >
      <option value="open">{FEEDBACK_STATUS_LABELS.open}</option>
      <option value="solved">{FEEDBACK_STATUS_LABELS.solved}</option>
      <option value="future_plan">{FEEDBACK_STATUS_LABELS.future_plan}</option>
    </select>
  );
}

export function FeedbackAdmin() {
  const [items, setItems] = useState<FeedbackSubmission[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

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

  const changeStatus = async (id: string, status: FeedbackResolvedStatus) => {
    setUpdatingId(id);
    setError('');
    try {
      const result = await updateFeedbackStatus(id, status);
      setItems((current) =>
        current.map((item) => (item.id === id ? result.item : item)),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdatingId('');
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
                <th>狀態</th>
                <th>描述</th>
                <th>附件</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const status = item.status || 'open';
                const rowClass =
                  status === 'solved'
                    ? 'feedback-table-row-solved'
                    : status === 'future_plan'
                      ? 'feedback-table-row-future'
                      : undefined;
                return (
                <tr key={item.id} className={rowClass}>
                  <td>{formatWhen(item.createdAt)}</td>
                  <td>{item.name}</td>
                  <td>{item.email || '—'}</td>
                  <td>{FEEDBACK_CATEGORY_LABELS[item.category as FeedbackCategory]}</td>
                  <td>{FEEDBACK_PRIORITY_LABELS[item.priority as FeedbackPriority]}</td>
                  <td>
                    <FeedbackStatusCell
                      item={item}
                      updating={updatingId === item.id}
                      onUpdate={changeStatus}
                    />
                  </td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
