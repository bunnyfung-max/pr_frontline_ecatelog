import type { Content, Folder } from './types';
import { descendants, trail } from './catalog';
import { housingKitPublishError } from './sales-kit';

/** Existing content is only checked when a folder crosses into New Housing. */
export function incompletePublishedKitsMovingToHousing(
  folders: Folder[],
  contents: Content[],
  folderId: string,
  nextParentId: string | null,
): Content[] {
  if (!nextParentId || trail(folders, folderId).some((f) => f.id === 'housing')) return [];
  if (!trail(folders, nextParentId).some((f) => f.id === 'housing')) return [];
  const movingFolders = descendants(folders, folderId);
  return contents.filter(
    (content) => movingFolders.has(content.folderId) && !!housingKitPublishError(content, true),
  );
}
