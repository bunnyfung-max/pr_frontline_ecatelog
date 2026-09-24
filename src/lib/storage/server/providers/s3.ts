import 'server-only';
import { randomUUID } from 'node:crypto';
import { HttpError } from '@/lib/http-error';
import { mimeExtension } from '@/lib/validation';
import { toAssetRef, objectKeyFromRef } from '../../refs';
import { s3Config, s3Configured, storageBucket } from '../config';
import type { StorageServerProvider } from '../provider';

function s3ObjectKey(userKey: string) {
  const prefix = storageBucket();
  return prefix ? `${prefix}/${userKey}` : userKey;
}

function missingS3Config() {
  throw new HttpError(
    503,
    'S3 尚未設定。請設定 STORAGE_PROVIDER=s3、STORAGE_S3_BUCKET、AWS_REGION、AWS_ACCESS_KEY_ID、AWS_SECRET_ACCESS_KEY。',
  );
}

/**
 * S3 provider skeleton. Add `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
 * when switching STORAGE_PROVIDER to s3.
 */
export const s3StorageProvider: StorageServerProvider = {
  name: 's3',
  async prepareUpload(userId, input) {
    if (!s3Configured()) missingS3Config();
    const userKey = `${userId}/${randomUUID()}.${mimeExtension[input.mime]}`;
    const objectKey = s3ObjectKey(userKey);
    const { bucket } = s3Config();
    // Placeholder: replace with createPresignedUrl(PutObjectCommand) from AWS SDK.
    throw new HttpError(
      503,
      `S3 provider 已選用（bucket: ${bucket}, key: ${objectKey}），請安裝 AWS SDK 並完成 presigned upload 實作。`,
    );
  },
  async confirmUpload(ref) {
    if (!s3Configured()) missingS3Config();
    objectKeyFromRef(ref);
    return ref;
  },
  async getReadUrl(objectKey) {
    if (!s3Configured()) missingS3Config();
    throw new HttpError(503, `S3 read URL 尚未實作：${objectKey}`);
  },
};
