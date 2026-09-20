'use client';
import { MessageSquare } from 'lucide-react';

export function FeedbackFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="feedback-fab"
      onClick={onClick}
      aria-label="試用回饋"
      title="試用回饋 / 報告問題"
    >
      <MessageSquare size={22} strokeWidth={2} />
    </button>
  );
}
