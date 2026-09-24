import type { UploadMime } from '../upload-policy';

export type StorageProviderName = 'local' | 'supabase' | 's3';

export type UploadPrepareInput = {
  name: string;
  size: number;
  mime: UploadMime;
};

export type SupabaseUploadTarget = {
  kind: 'supabase';
  bucket: string;
  objectKey: string;
  contentType: UploadMime;
};

export type S3UploadTarget = {
  kind: 's3';
  url: string;
  headers: Record<string, string>;
};

export type LocalUploadTarget = {
  kind: 'local';
  uploadUrl: '/api/upload';
};

export type UploadTarget = SupabaseUploadTarget | S3UploadTarget | LocalUploadTarget;

export type PrepareUploadResult = {
  ref: string;
  objectKey: string;
  provider: StorageProviderName;
  upload: UploadTarget;
};
