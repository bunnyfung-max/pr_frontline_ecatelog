import 'server-only';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { dataDirectory } from '@/lib/catalog-repository';
import { HttpError } from '@/lib/http-error';
import { mimeExtension } from '@/lib/validation';
import { mimeFromExtension } from '@/lib/upload-policy';
import { validateUploadBytes } from '@/lib/upload-validation';
import { objectKeyFromRef, toAssetRef } from '../../refs';
import type { StorageServerProvider } from '../provider';
import type { UploadPrepareInput } from '../../types';

const uploadsDir = () => path.join(dataDirectory(), 'uploads');

export const localStorageProvider: StorageServerProvider = {
  name: 'local',
  async prepareUpload(userId, input) {
    const objectKey = `${userId}/${randomUUID()}.${mimeExtension[input.mime]}`;
    return {
      ref: toAssetRef(objectKey),
      objectKey,
      provider: 'local',
      upload: { kind: 'local', uploadUrl: '/api/upload' },
    };
  },
  async confirmUpload(ref) {
    const objectKey = objectKeyFromRef(ref);
    try {
      const bytes = await readFile(path.join(uploadsDir(), objectKey));
      const mime = mimeFromExtension(objectKey.split('.').pop() || '');
      if (!mime || !validateUploadBytes(bytes, mime)) throw new Error('missing');
    } catch {
      throw new HttpError(404, '找不到已上載的檔案。');
    }
    return ref;
  },
  async getReadUrl(objectKey) {
    await readFile(path.join(uploadsDir(), objectKey));
    throw new HttpError(500, '本機檔案請經由 /api/asset 讀取。');
  },
  async saveLocalFile(objectKey, bytes, mime) {
    if (!validateUploadBytes(bytes, mime)) throw new HttpError(400, '檔案內容與所選格式不符，請重新選擇檔案。');
    await mkdir(uploadsDir(), { recursive: true });
    await writeFile(path.join(uploadsDir(), objectKey), bytes);
    return toAssetRef(objectKey);
  },
};

export async function readLocalAssetBytes(objectKey: string) {
  return readFile(path.join(uploadsDir(), objectKey));
}
