const ASSET_PREFIX = 'asset:';

/** Provider-neutral object key, e.g. `{userId}/{uuid}.mp4`. */
export function objectKeyFromRef(ref: string): string {
  if (!ref.startsWith(ASSET_PREFIX)) throw new Error('不支援的檔案位置');
  return ref.slice(ASSET_PREFIX.length);
}

export function toAssetRef(objectKey: string): string {
  return `${ASSET_PREFIX}${objectKey}`;
}

export function isAssetRef(ref: string): boolean {
  return ref.startsWith(ASSET_PREFIX);
}
