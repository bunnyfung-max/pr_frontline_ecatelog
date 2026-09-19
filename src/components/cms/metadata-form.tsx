'use client';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { ManageKind, Offer, Product, Scene } from '@/lib/types';
import { save } from '@/lib/client';
import { ImageField } from './fields/image-field';

export function MetadataForm({
  kind,
  item,
  demo: _demo,
  back,
  saved,
}: {
  kind: ManageKind;
  item: Product | Offer | Scene;
  demo: boolean;
  back: () => void;
  saved: () => void;
}) {
  const [image, setImage] = useState(item.image);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  return (
    <form
      className="metadata-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        const form = new FormData(e.currentTarget);
        const text = (key: string) => String(form.get(key) || '');
        const common = { id: item.id, name: text('name'), url: text('url'), image };
        const payload =
          kind === 'product'
            ? {
                ...common,
                code: text('code'),
                brand: text('brand'),
                colour: text('colour'),
                style: text('style'),
                keywords: text('keywords'),
                storeUrl: text('storeUrl'),
              }
            : {
                ...common,
                order: Number(text('order')),
                active: form.has('active'),
                ...(kind === 'offer'
                  ? {
                      summary: text('summary'),
                      startDate: text('startDate'),
                      endDate: text('endDate'),
                    }
                  : {}),
              };
        try {
          await save(kind, payload);
          saved();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <button type="button" className="text-btn" onClick={back}>
        <ArrowLeft size={16} />
        返回列表
      </button>
      <label>
        名稱 *
        <input name="name" required maxLength={200} defaultValue={item.name} />
      </label>
      {kind === 'product' && 'code' in item && (
        <>
          <div className="form-grid">
            {[
              ['code', '產品編號'],
              ['brand', '品牌'],
              ['colour', '顏色'],
              ['style', '設計風格'],
            ].map(([key, title]) => (
              <label key={key}>
                {title}
                <input
                  name={key}
                  maxLength={100}
                  defaultValue={item[key as 'code' | 'brand' | 'colour' | 'style']}
                />
              </label>
            ))}
          </div>
          <label>
            關鍵字
            <textarea name="keywords" maxLength={2000} defaultValue={item.keywords} />
          </label>
        </>
      )}
      {kind === 'offer' && 'summary' in item && (
        <>
          <label>
            優惠簡介
            <textarea name="summary" maxLength={1000} defaultValue={item.summary} />
          </label>
          <div className="form-grid">
            <label>
              開始日期（香港時間）
              <input name="startDate" type="date" defaultValue={item.startDate} />
            </label>
            <label>
              結束日期（香港時間）
              <input name="endDate" type="date" defaultValue={item.endDate} />
            </label>
          </div>
        </>
      )}
      <ImageField label="展示圖片" value={image} onChange={setImage} onBusy={setUploading} />
      {kind === 'product' && 'code' in item && (
        <label>
          自在購產品連結
          <input
            name="storeUrl"
            type="url"
            maxLength={2000}
            placeholder="https://"
            defaultValue={item.storeUrl || ''}
          />
        </label>
      )}
      <label>
        {kind === 'product' ? 'eShop 產品連結' : 'eShop URL'}
        <input
          name="url"
          type="url"
          maxLength={2000}
          placeholder="https://"
          defaultValue={item.url}
        />
        <small>
          {kind === 'product'
            ? '只接受 HTTPS；留空不會套用共用網址，未有購物連結時會顯示「購物連結待設定」。'
            : '只接受 HTTPS；留空時，前端會顯示「連結待設定」。'}
        </small>
      </label>
      {'order' in item && (
        <div className="form-grid">
          <label>
            排列次序
            <input name="order" type="number" min={0} max={99999} defaultValue={item.order} />
          </label>
          <label className="check-label">
            <input type="checkbox" name="active" defaultChecked={item.active} />
            啟用 / 顯示
          </label>
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="button-row">
        <button type="button" className="secondary" onClick={back}>
          取消
        </button>
        <button className="primary" disabled={busy || uploading}>
          {busy ? '儲存中…' : uploading ? '圖片上載中…' : '儲存'}
        </button>
      </div>
    </form>
  );
}
