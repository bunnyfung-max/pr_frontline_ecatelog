import 'server-only';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FeedbackSubmission } from './feedback';
import { dataDirectory } from './catalog-repository';
import { HttpError } from './http-error';

const submissionsFile = () => path.join(dataDirectory(), 'feedback-submissions.json');

async function readLocalSubmissions(): Promise<FeedbackSubmission[]> {
  try {
    return JSON.parse(await readFile(submissionsFile(), 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return [];
  }
}

async function writeLocalSubmissions(rows: FeedbackSubmission[]) {
  await mkdir(dataDirectory(), { recursive: true });
  const temp = path.join(dataDirectory(), `feedback-${randomUUID()}.tmp`);
  await writeFile(temp, JSON.stringify(rows, null, 2), 'utf8');
  await rename(temp, submissionsFile());
}

export async function listFeedbackSubmissions(
  supabase?: SupabaseClient,
): Promise<FeedbackSubmission[]> {
  if (!supabase) return readLocalSubmissions();
  const { data, error } = await supabase
    .from('feedback_submissions')
    .select(
      'id,reporter_name,reporter_email,category,description,priority,page_context,attachments,created_at',
    )
    .order('created_at', { ascending: false });
  if (error) {
    if (error.code === '42P01')
      throw new HttpError(503, '意見回饋功能尚未完成資料庫設定，請聯絡 IT。');
    throw new HttpError(500, '無法載入回饋列表。');
  }
  return (data || []).map((row) => ({
    id: row.id,
    name: row.reporter_name,
    email: row.reporter_email || '',
    category: row.category,
    description: row.description,
    priority: row.priority,
    pageContext: row.page_context || undefined,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    createdAt: row.created_at,
  }));
}

export async function saveFeedbackSubmission(
  submission: FeedbackSubmission,
  supabase?: SupabaseClient,
  userId?: string,
) {
  if (!supabase) {
    const rows = await readLocalSubmissions();
    rows.unshift(submission);
    await writeLocalSubmissions(rows);
    return;
  }
  if (!userId) throw new HttpError(401, '請先登入員工帳戶。');
  const { error } = await supabase.from('feedback_submissions').insert({
    id: submission.id,
    user_id: userId,
    reporter_name: submission.name,
    reporter_email: submission.email,
    category: submission.category,
    description: submission.description,
    priority: submission.priority,
    page_context: submission.pageContext || null,
    attachments: submission.attachments,
    created_at: submission.createdAt,
  });
  if (error) {
    if (error.code === '42P01')
      throw new HttpError(503, '意見回饋功能尚未完成資料庫設定，請聯絡 IT。');
    throw new HttpError(500, '提交失敗，請稍後重試。');
  }
}
