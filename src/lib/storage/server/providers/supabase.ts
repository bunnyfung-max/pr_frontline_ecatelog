import 'server-only';
import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/http-error';
import { mimeExtension } from '@/lib/validation';
import { toAssetRef, objectKeyFromRef } from '../../refs';
import { storageBucket } from '../config';
import type { StorageServerProvider } from '../provider';

async function getReadUrl(sb: SupabaseClient, objectKey: string, ttlSec: number) {
  const { data, error } = await sb.storage.from(storageBucket()).createSignedUrl(objectKey, ttlSec);
  if (error || !data?.signedUrl) throw new HttpError(404, '檔案不存在或無法讀取。');
  return data.signedUrl;
}

async function confirmExists(sb: SupabaseClient, objectKey: string) {
  const folder = objectKey.includes('/') ? objectKey.slice(0, objectKey.lastIndexOf('/')) : '';
  const name = objectKey.includes('/') ? objectKey.slice(objectKey.lastIndexOf('/') + 1) : objectKey;
  const { data, error } = await sb.storage.from(storageBucket()).list(folder, {
    limit: 1,
    search: name,
  });
  if (error) throw new HttpError(500, '無法確認檔案狀態。');
  if (!data?.some((item) => item.name === name)) throw new HttpError(404, '找不到已上載的檔案。');
}

export function createSupabaseStorageProvider(getClient: () => Promise<SupabaseClient>): StorageServerProvider {
  return {
    name: 'supabase',
    async prepareUpload(userId, input) {
      const objectKey = `${userId}/${randomUUID()}.${mimeExtension[input.mime]}`;
      return {
        ref: toAssetRef(objectKey),
        objectKey,
        provider: 'supabase',
        upload: {
          kind: 'supabase',
          bucket: storageBucket(),
          objectKey,
          contentType: input.mime,
        },
      };
    },
    async confirmUpload(ref) {
      const sb = await getClient();
      await confirmExists(sb, objectKeyFromRef(ref));
      return ref;
    },
    async getReadUrl(objectKey, ttlSec, sb) {
      return getReadUrl(sb || await getClient(), objectKey, ttlSec);
    },
  };
}
