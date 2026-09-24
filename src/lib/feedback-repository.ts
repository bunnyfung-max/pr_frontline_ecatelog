import 'server-only';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FeedbackResolvedStatus, FeedbackSubmission, FeedbackStatus } from './feedback';
import { canUpdateFeedbackStatus } from './feedback';
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
      'id,reporter_name,reporter_email,category,description,priority,status,page_context,attachments,created_at',
    )
    .order('created_at', { ascending: false });
  if (error) {
    if (error.code === '42P01')
      throw new HttpError(503, '意見回饋功能尚未完成資料庫設定，請聯絡 IT。');
    throw new HttpError(500, '無法載入回饋列表。');
  }
  return (data || []).map((row) => mapFeedbackRow(row));
}

function mapFeedbackRow(row: {
  id: string;
  reporter_name: string;
  reporter_email: string | null;
  category: FeedbackSubmission['category'];
  description: string;
  priority: FeedbackSubmission['priority'];
  status: string | null;
  page_context: string | null;
  attachments: unknown;
  created_at: string;
}): FeedbackSubmission {
  return {
    id: row.id,
    name: row.reporter_name,
    email: row.reporter_email || '',
    category: row.category,
    description: row.description,
    priority: row.priority,
    pageContext: row.page_context || undefined,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    createdAt: row.created_at,
    status: (row.status as FeedbackStatus) || 'open',
  };
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
    status: submission.status,
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

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackResolvedStatus,
  supabase?: SupabaseClient,
): Promise<FeedbackSubmission> {
  if (!supabase) {
    const rows = await readLocalSubmissions();
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) throw new HttpError(404, '找不到此回饋。');
    const current = rows[index];
    const currentStatus = current.status || 'open';
    if (!canUpdateFeedbackStatus(currentStatus, status))
      throw new HttpError(400, '此回饋狀態無法更改。');
    rows[index] = { ...current, status };
    await writeLocalSubmissions(rows);
    return rows[index];
  }

  const { data: current, error: readError } = await supabase
    .from('feedback_submissions')
    .select(
      'id,reporter_name,reporter_email,category,description,priority,status,page_context,attachments,created_at',
    )
    .eq('id', id)
    .maybeSingle();
  if (readError) throw new HttpError(500, '無法更新回饋狀態。');
  if (!current) throw new HttpError(404, '找不到此回饋。');
  const currentStatus = (current.status as FeedbackStatus) || 'open';
  if (!canUpdateFeedbackStatus(currentStatus, status))
    throw new HttpError(400, '此回饋狀態無法更改。');

  const { data, error } = await supabase
    .from('feedback_submissions')
    .update({ status })
    .eq('id', id)
    .eq('status', 'open')
    .select(
      'id,reporter_name,reporter_email,category,description,priority,status,page_context,attachments,created_at',
    )
    .maybeSingle();
  if (error) throw new HttpError(500, '無法更新回饋狀態。');
  if (!data) throw new HttpError(400, '此回饋狀態無法更改。');
  return mapFeedbackRow(data);
}
