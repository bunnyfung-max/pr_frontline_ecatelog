import 'server-only';
import { allowedAssetRefs, catalogAssetRefs } from './catalog';
import { readCatalog } from './server';
import { isCmsUnlocked } from './cms-access';
import type { Session } from './types';

export async function getAssetAccess(_session: Session, cmsUnlocked: boolean) {
  // Access depends on the current catalog, which can change in another worker
  // or outside this process. A process-local TTL can deny newly published
  // assets and continue allowing unpublished ones until it expires.
  const raw = await readCatalog();
  return {
    allowed: new Set(allowedAssetRefs(raw, cmsUnlocked)),
    all: new Set(catalogAssetRefs(raw)),
  };
}

export async function resolveAssetAccess(session: Session) {
  const cmsUnlocked =
    session.role === 'admin' ? await isCmsUnlocked(session) : false;
  return { cmsUnlocked, access: await getAssetAccess(session, cmsUnlocked) };
}
