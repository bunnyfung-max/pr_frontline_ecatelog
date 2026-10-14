import type { Catalog, Entity } from './types';

export const ACTIVITY_ACTIONS = ['create', 'update', 'delete'] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export type UserActivity = {
  id: string;
  email: string;
  action: ActivityAction;
  entity: Entity;
  targetId: string;
  targetName: string;
  createdAt: string;
};

const lists = {
  folder: 'folders',
  content: 'contents',
  product: 'products',
  scene: 'scenes',
  offer: 'offers',
} as const;

export function catalogItemExists(data: Catalog, entity: Entity, id: string) {
  if (entity === 'settings') return data.settings.id === id;
  return data[lists[entity]].some((item) => item.id === id);
}

export function catalogItemName(data: Catalog, entity: Entity, id: string) {
  if (entity === 'settings') return (data.settings.label || '設定').slice(0, 200);
  const row = data[lists[entity]].find((item) => item.id === id);
  return (row?.name || id).slice(0, 200);
}

export function incomingItemName(
  entity: Entity,
  value: { id: string; name?: string; label?: string },
) {
  if (entity === 'settings') return (value.label || '設定').slice(0, 200);
  return (value.name || value.id).slice(0, 200);
}
