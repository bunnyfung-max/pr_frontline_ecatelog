import 'server-only';
import type { StorageProviderName } from '../types';

export function storageProviderName(): StorageProviderName {
  const configured = process.env.STORAGE_PROVIDER?.trim().toLowerCase();
  if (configured === 's3' || configured === 'supabase' || configured === 'local') {
    return configured;
  }
  return 'supabase';
}

/** Shared object namespace. Supabase uses this as bucket id; S3 uses it as key prefix. */
export function storageBucket(): string {
  return process.env.STORAGE_BUCKET?.trim() || 'catalog';
}

export function s3Config() {
  return {
    bucket: process.env.STORAGE_S3_BUCKET?.trim() || '',
    region: process.env.AWS_REGION?.trim() || process.env.STORAGE_S3_REGION?.trim() || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim() || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim() || '',
  };
}

export function s3Configured(): boolean {
  const { bucket, region, accessKeyId, secretAccessKey } = s3Config();
  return Boolean(bucket && region && accessKeyId && secretAccessKey);
}
