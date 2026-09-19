export type Status = 'draft' | 'published' | 'archived';
export type ContentType = 'image' | 'pdf' | 'video' | 'link';
export interface Folder {
  id: string;
  parentId: string | null;
  name: string;
  subtitle: string;
  order: number;
}
export interface Product {
  id: string;
  name: string;
  code: string;
  brand: string;
  colour: string;
  style: string;
  keywords: string;
  image: string;
  /** eShop product URL; keep the existing field for saved-catalogue compatibility. */
  url: string;
  storeUrl?: string;
}
export interface Content {
  id: string;
  folderId: string;
  name: string;
  type: ContentType;
  files: string[];
  /** First five positions are reserved images; positions 1–4 have fixed roles. */
  salesKit?: boolean;
  fileName: string;
  cover: string;
  keywords: string;
  productIds: string[];
  storeUrl?: string;
  eshopUrl?: string;
  status: Status;
  order: number;
  updatedAt: string;
}
export interface Scene {
  id: string;
  name: string;
  image: string;
  url: string;
  order: number;
  active: boolean;
}
export interface Offer {
  id: string;
  name: string;
  summary: string;
  image: string;
  url: string;
  order: number;
  active: boolean;
  startDate: string;
  endDate: string;
}
export interface Settings {
  /** Legacy shared link, retained in storage but no longer used by the viewer. */
  id: 'store';
  label: string;
  url: string;
}
export interface Catalog {
  folders: Folder[];
  contents: Content[];
  products: Product[];
  scenes: Scene[];
  offers: Offer[];
  settings: Settings;
}
export type Entity = 'content' | 'product' | 'scene' | 'offer' | 'settings' | 'folder';
export interface Session {
  role: 'admin' | 'frontline';
  email: string;
  demo: boolean;
}
export const ROOTS = ['housing', 'pop', 'tmf', 'creator', 'scenes'] as const;
export const TYPE_LABEL: Record<ContentType, string> = {
  image: '圖片',
  pdf: 'PDF',
  video: '影片',
  link: '連結',
};
export const STATUS_LABEL: Record<Status, string> = {
  draft: '草稿',
  published: '已發布',
  archived: '已下架',
};
