import 'server-only';
import { allowedAssetRefs, catalogAssetRefs } from './catalog';
import { readCatalog } from './server';
import { isCmsUnlocked } from './cms-access';
import type { Session } from './types';

const TTL_MS = 30_000;

type AccessSnapshot = {
  allowed: Set<string>;
  all: Set<string>;
  expires: number;
};

let publicSnapshot: AccessSnapshot | null = null;
let cmsSnapshot: AccessSnapshot | null = null;

async function buildSnapshot(cmsUnlocked: boolean): Promise<AccessSnapshot> {
  const raw = await readCatalog();
  return {
    allowed: new Set(allowedAssetRefs(raw, cmsUnlocked)),
    all: new Set(catalogAssetRefs(raw)),
    expires: Date.now() + TTL_MS,
  };
}

export async function getAssetAccess(session: Session, cmsUnlocked: boolean) {
  const snapshot = cmsUnlocked ? cmsSnapshot : publicSnapshot;
  if (snapshot && snapshot.expires > Date.now()) return snapshot;
  const next = await buildSnapshot(cmsUnlocked);
  if (cmsUnlocked) cmsSnapshot = next;
  else publicSnapshot = next;
  return next;
}

export function clearAssetAccessCache() {
  publicSnapshot = null;
  cmsSnapshot = null;
}

export async function resolveAssetAccess(session: Session) {
  const cmsUnlocked =
    session.role === 'admin' ? await isCmsUnlocked(session) : false;
  return { cmsUnlocked, access: await getAssetAccess(session, cmsUnlocked) };
}
