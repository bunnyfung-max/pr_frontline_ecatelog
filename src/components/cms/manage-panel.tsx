'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Catalog, ManageKind, Offer, Product, Scene } from '@/lib/types';
import { byOrder } from '@/lib/catalog';
import { Modal, Thumb, Empty } from '../ui';
import { makeId } from './utils';
import { MetadataForm } from './metadata-form';

export function ManagePanel({
  kind,
  data,
  demo,
  close,
  saved,
}: {
  kind: ManageKind;
  data: Catalog;
  demo: boolean;
  close: () => void;
  saved: () => void;
}) {
  const [editing, setEditing] = useState<Product | Offer | Scene | null>(null);
  const title =
    kind === 'product' ? '產品索引' : kind === 'scene' ? '場景推介管理' : '組合優惠管理';
  const list =
    kind === 'product'
      ? data.products
      : kind === 'scene'
        ? data.scenes.sort(byOrder)
        : data.offers.sort(byOrder);
  const create = () =>
    setEditing(
      kind === 'product'
        ? {
            id: makeId(),
            name: '',
            code: '',
            brand: '',
            colour: '',
            style: '',
            keywords: '',
            image: '',
            url: '',
            storeUrl: '',
          }
        : kind === 'scene'
          ? { id: makeId(), name: '', image: '', url: '', order: list.length, active: false }
          : {
              id: makeId(),
              name: '',
              summary: '',
              image: '',
              url: '',
              order: list.length,
              active: false,
              startDate: '',
              endDate: '',
            },
    );
  return (
    <Modal title={title} close={close} wide>
      <div className="form-body">
        {editing ? (
          <MetadataForm
            kind={kind}
            item={editing}
            demo={demo}
            back={() => setEditing(null)}
            saved={saved}
          />
        ) : (
          <>
            <div className="section-heading">
              <p>
                {kind === 'product'
                  ? '管理產品屬性，以及每件產品專屬的自在購和 eShop 連結。'
                  : kind === 'offer'
                    ? '管理 Bundle Offer。產品及 Sales Kit 的購物連結請到各自的編輯頁設定。'
                    : '管理展示卡片、連結及顯示次序。'}
              </p>
              <div className="button-row">
                <button className="primary" onClick={create}>
                  <Plus size={17} />
                  新增{kind === 'product' ? '產品' : kind === 'scene' ? '場景' : '優惠'}
                </button>
              </div>
            </div>
            <div className="manage-list">
              {list.map((item) => (
                <button key={item.id} onClick={() => setEditing(item)}>
                  <div className="mini-image">
                    <Thumb src={item.image} />
                  </div>
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      {'code' in item
                        ? [item.code, item.brand, item.colour, item.style]
                            .filter(Boolean)
                            .join(' · ')
                        : `${item.active ? '已啟用' : '已停用'} · 次序 ${item.order}`}
                    </small>
                  </span>
                  <span className="text-link">編輯</span>
                </button>
              ))}
            </div>
            {!list.length && <Empty title="暫未有資料">按「新增」建立第一筆資料。</Empty>}
          </>
        )}
      </div>
    </Modal>
  );
}
