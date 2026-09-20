import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { experienceDemoContents, EXPERIENCE_DEMO_CONTENT_IDS } from './experience-demo-contents';
import { HttpError } from './http-error';
import { supabaseUrl } from './server';

function adminClient() {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new HttpError(503, '尚未設定 Supabase service role。');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function applyExperienceDemo() {
  const admin = adminClient();
  const keep = new Set<string>(EXPERIENCE_DEMO_CONTENT_IDS);

  const { data: existing, error: listError } = await admin
    .from('catalog_entries')
    .select('id')
    .eq('entity', 'content');
  if (listError) throw new HttpError(500, '無法讀取現有內容。');

  const removeIds = (existing ?? [])
    .map((row) => row.id as string)
    .filter((id) => !keep.has(id));

  if (removeIds.length) {
    const { error: deleteError } = await admin
      .from('catalog_entries')
      .delete()
      .eq('entity', 'content')
      .in('id', removeIds);
    if (deleteError) throw new HttpError(500, '無法移除舊內容。');
  }

  for (const payload of experienceDemoContents()) {
    const { error: upsertError } = await admin.from('catalog_entries').upsert(
      { entity: 'content', id: payload.id, payload },
      { onConflict: 'entity,id' },
    );
    if (upsertError) throw new HttpError(500, `無法更新 ${payload.id}。`);
  }

  return {
    kept: [...keep],
    removed: removeIds.length,
  };
}
