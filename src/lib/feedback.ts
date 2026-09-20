import { z } from 'zod';

export const FEEDBACK_CATEGORIES = ['bug', 'optimization'] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_PRIORITIES = ['urgent', 'high', 'medium', 'low'] as const;
export type FeedbackPriority = (typeof FEEDBACK_PRIORITIES)[number];

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: '我發現問題',
  optimization: '我想優化',
};

export const FEEDBACK_PRIORITY_LABELS: Record<FeedbackPriority, string> = {
  urgent: '🔴 緊急',
  high: '🟠 優先',
  medium: '🟡 中等',
  low: '🟢 低',
};

export const MAX_FEEDBACK_ATTACHMENTS = 5;
export const MAX_FEEDBACK_IMAGE_BYTES = 5 * 1024 * 1024;

export const feedbackRefSchema = z
  .string()
  .max(300)
  .refine((v) => /^feedback:[a-zA-Z0-9_/-]+\.(jpg|jpeg|png|webp)$/.test(v), '不支援的附件');

export const feedbackSubmitSchema = z.object({
  name: z.string().trim().min(1, '請輸入名稱').max(200),
  category: z.enum(FEEDBACK_CATEGORIES),
  description: z.string().trim().min(1, '請輸入描述').max(4000),
  priority: z.enum(FEEDBACK_PRIORITIES),
  pageContext: z.string().max(2000).optional(),
  attachments: z.array(feedbackRefSchema).max(MAX_FEEDBACK_ATTACHMENTS),
});

export type FeedbackSubmission = z.infer<typeof feedbackSubmitSchema> & {
  id: string;
  email: string;
  createdAt: string;
};
