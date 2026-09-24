import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PrepareUploadResult, UploadPrepareInput } from '../types';

export type StorageServerProvider = {
  name: 'local' | 'supabase' | 's3';
  prepareUpload(userId: string, input: UploadPrepareInput): Promise<PrepareUploadResult>;
  confirmUpload(ref: string): Promise<string>;
  getReadUrl(objectKey: string, ttlSec: number, sb?: SupabaseClient): Promise<string>;
  saveLocalFile?(objectKey: string, bytes: Uint8Array, mime: UploadPrepareInput['mime']): Promise<string>;
};
