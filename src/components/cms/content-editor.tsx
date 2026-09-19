'use client';
import { useState } from 'react';
import {
  UploadCloud,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  Save,
  Check,
} from 'lucide-react';
import type { Catalog, Content, ContentType, Status } from '@/lib/types';
import { TYPE_LABEL } from '@/lib/types';
import { descendants, trail } from '@/lib/catalog';
import { save, upload } from '@/lib/client';
import {
  MAX_CONTENT_PAGES,
  acceptForContentType,
  mimesForContentType,
} from '@/lib/upload-policy';
import { Modal, Thumb } from '../ui';
import { Viewer } from '../viewer';
import { SalesKitUpload } from '../sales-kit-upload';
import { kitFiles, kitComplete } from '@/lib/sales-kit';
import { makeId } from './utils';
import { TagField } from './fields/tag-field';
import { EshopProductField } from './fields/eshop-product-field';
import { ImageField } from './fields/image-field';

export function ContentEditor({
  data,
  folderId,
  content,
  demo,
  close,
  saved,
}: {
  data: Catalog;
  folderId: string;
  content?: Content;
  demo: boolean;
  close: () => void;
  saved: () => void;
}) {
  const housing = trail(data.folders, folderId).some((folder) => folder.id === 'housing');
  const [value, setValue] = useState<Content>(() => {
    const initial: Content = {
      ...(content || {
        id: makeId(),
        folderId,
        name: '',
        type: 'image',
        files: [],
        fileName: '',
        cover: '',
        keywords: '',
        tags: [],
        eshopProducts: [],
        productIds: [],
        storeUrl: '',
        eshopUrl: '',
        status: 'draft',
        order: 0,
        updatedAt: '',
      }),
      tags: content?.tags ?? [],
      eshopProducts: content?.eshopProducts ?? [],
      productIds: content?.productIds ?? [],
    };
    return housing && initial.type === 'image'
      ? { ...initial, salesKit: true, files: kitFiles(initial.files) }
      : initial;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<'landscape' | 'portrait' | null>(null);
  const destinations = descendants(data.folders, folderId);
  const update = <K extends keyof Content>(key: K, v: Content[K]) =>
    setValue((old) => ({ ...old, [key]: v }));
  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setError('');
    setUploading(true);
    try {
      const selected = Array.from(files);
      if (value.type !== 'image' && selected.length > 1)
        throw new Error('此類型只可上載一個檔案。');
      if (value.type === 'image' && value.files.length + selected.length > MAX_CONTENT_PAGES)
        throw new Error(`每份圖片目錄最多 ${MAX_CONTENT_PAGES} 頁。`);
      const allowed = mimesForContentType(value.type);
      if (selected.some((f) => !allowed.includes(f.type)))
        throw new Error('所選檔案與內容類型不符。');
      const uploaded: string[] = [];
      for (const file of selected) uploaded.push(await upload(file));
      setValue((old) => ({
        ...old,
        files: old.type === 'image' ? [...old.files, ...uploaded] : uploaded,
        fileName: [old.fileName, ...selected.map((f) => f.name)]
          .filter(Boolean)
          .join(', ')
          .slice(0, 1000),
        name: old.name || selected[0].name.replace(/\.[^.]+$/, ''),
      }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  const attemptPreview = (orientation: 'portrait' | 'landscape') => {
    if (!value.files.some(Boolean)) {
      setError('請先上載檔案或填寫 URL。');
      return;
    }
    setPreview(orientation);
  };
  return (
    <Modal
      title={content ? '編輯展示內容' : '上載展示內容'}
      close={() => {
        if (!busy && !uploading) close();
      }}
      wide
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          const action = (e.nativeEvent as SubmitEvent).submitter?.getAttribute('value');
          try {
            await save(
              'content',
              { ...value, status: action || value.status },
              folderId,
              content?.updatedAt,
            );
            saved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={busy || uploading} className="editor-fields">
          <div className="editor-columns">
            <section>
              <span className="step-label">01 / 選擇位置及素材</span>
              <div className="path-box">
                <small>目前所在目錄</small>
                {trail(data.folders, folderId)
                  .map((f) => f.name)
                  .join(' / ')}
              </div>
              <label>
                上載目的地 *
                <select value={value.folderId} onChange={(e) => update('folderId', e.target.value)}>
                  {data.folders
                    .filter((f) => destinations.has(f.id))
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {trail(data.folders, f.id)
                          .map((p) => p.name)
                          .join(' / ')}
                      </option>
                    ))}
                </select>
                <small>只可選擇目前目錄或其下層資料夾。</small>
              </label>
              <label>
                顯示名稱 *
                <input
                  required
                  maxLength={200}
                  value={value.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="例如：兩房單位家居配搭"
                />
              </label>
              <label>
                內容類型
                <select
                  value={value.type}
                  onChange={(e) => {
                    if (
                      value.files.some(Boolean) &&
                      !confirm('切換類型會清除本次表格內的檔案選擇，繼續嗎？')
                    )
                      return;
                    setValue((v) => ({
                      ...v,
                      type: e.target.value as ContentType,
                      salesKit: housing && e.target.value === 'image',
                      files: housing && e.target.value === 'image' ? kitFiles([]) : [],
                      fileName: '',
                    }));
                  }}
                >
                  {Object.entries(TYPE_LABEL).map(([id, name]) => (
                    <option key={id} value={id}>
                      {housing && id === 'image' ? 'Sales Kit（標準圖片 + 其他檔案）' : name}
                    </option>
                  ))}
                </select>
              </label>
              {value.salesKit ? (
                <SalesKitUpload
                  value={value}
                  setValue={setValue}
                  demo={demo}
                  onBusy={setUploading}
                  onError={setError}
                  legacy={!!content && !content.salesKit && content.type === 'image'}
                />
              ) : value.type === 'link' ? (
                <label>
                  目的地 URL *
                  <input
                    type="url"
                    required
                    placeholder="https://"
                    value={value.files[0] || ''}
                    onChange={(e) => update('files', [e.target.value])}
                  />
                </label>
              ) : (
                <>
                  <label className="upload-zone">
                    <UploadCloud size={32} />
                    <strong>
                      {uploading
                        ? '上載中，請稍候…'
                        : value.files.length && value.type !== 'image'
                          ? '選擇檔案以替換'
                          : '選擇檔案上載'}
                    </strong>
                    <span>
                      {value.type === 'image'
                        ? 'JPG / PNG / WebP · 可多選及調整頁次'
                        : value.type === 'pdf'
                          ? 'PDF · 自動逐頁展示'
                          : 'MP4 / WebM · 瀏覽器播放'}
                      <br />
                      每個檔案上限 50 MB
                    </span>
                    <input
                      type="file"
                      aria-label="上載素材"
                      multiple={value.type === 'image'}
                      accept={acceptForContentType(value.type)}
                      onChange={(e) => {
                        void addFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <div className="upload-list">
                    {value.files.map((file, i) => (
                      <div key={`${file}-${i}`}>
                        <span>
                          第 {i + 1} {value.type === 'image' ? '頁' : '份'}
                          {value.type === 'image' && <Thumb src={file} />}
                        </span>
                        <div>
                          {value.type === 'image' && (
                            <>
                              <button
                                type="button"
                                className="icon-btn"
                                disabled={!i}
                                aria-label={`第 ${i + 1} 頁上移`}
                                onClick={() => {
                                  const a = [...value.files];
                                  [a[i], a[i - 1]] = [a[i - 1], a[i]];
                                  update('files', a);
                                }}
                              >
                                <ArrowUp size={15} />
                              </button>
                              <button
                                type="button"
                                className="icon-btn"
                                disabled={i === value.files.length - 1}
                                aria-label={`第 ${i + 1} 頁下移`}
                                onClick={() => {
                                  const a = [...value.files];
                                  [a[i], a[i + 1]] = [a[i + 1], a[i]];
                                  update('files', a);
                                }}
                              >
                                <ArrowDown size={15} />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label={`移除第 ${i + 1} 份檔案選擇`}
                            onClick={() =>
                              update(
                                'files',
                                value.files.filter((_, n) => n !== i),
                              )
                            }
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <ImageField
                label="縮圖 / 封面"
                value={value.cover}
                onChange={(ref) => update('cover', ref)}
                onBusy={setUploading}
              />
            </section>
            <section>
              <span className="step-label">02 / 搜尋及發布設定</span>
              <div className="notice">
                房屋類別、地區、屋苑及呎數／人數由所選目錄帶出，毋須重複填寫。
              </div>
              <label>
                關鍵字
                <textarea
                  value={value.keywords}
                  onChange={(e) => update('keywords', e.target.value)}
                  rows={3}
                  placeholder="例如：兩房、收納、小空間"
                  maxLength={2000}
                />
              </label>
              <TagField tags={value.tags ?? []} onChange={(tags) => update('tags', tags)} />
              <EshopProductField
                products={value.eshopProducts ?? []}
                onChange={(eshopProducts) => update('eshopProducts', eshopProducts)}
                onError={setError}
              />
              <div className="purchase-fields" role="group" aria-label="本份內容的購物連結">
                <h3>本份內容 / Sales Kit 專屬購物連結</h3>
                <p className="muted">選填。只用於本份內容；標籤不會自動帶出購物連結。</p>
                <label>
                  自在購連結（本份內容）
                  <input
                    type="url"
                    maxLength={2000}
                    placeholder="https://"
                    value={value.storeUrl || ''}
                    onChange={(e) => update('storeUrl', e.target.value)}
                  />
                </label>
                <label>
                  eShop 連結（本份內容）
                  <input
                    type="url"
                    maxLength={2000}
                    placeholder="https://"
                    value={value.eshopUrl || ''}
                    onChange={(e) => update('eshopUrl', e.target.value)}
                  />
                </label>
                <small className="muted">只接受 HTTPS；不會自動套用其他產品或共用網址。</small>
              </div>
              <div className="form-grid">
                <label>
                  排列次序
                  <input
                    type="number"
                    min={0}
                    max={99999}
                    value={value.order}
                    onChange={(e) => update('order', Number(e.target.value))}
                  />
                </label>
                <label>
                  狀態
                  <select
                    value={value.status}
                    onChange={(e) => update('status', e.target.value as Status)}
                  >
                    <option value="draft">草稿</option>
                    <option value="published">已發布</option>
                    <option value="archived">已下架</option>
                  </select>
                </label>
              </div>
              <div className="preview-box">
                <Eye size={23} />
                <h3>發布前，看看展示效果</h3>
                <p>預覽不會發布內容。</p>
                <div className="button-row">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => attemptPreview('landscape')}
                  >
                    橫向雙頁
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => attemptPreview('portrait')}
                  >
                    直向單頁
                  </button>
                </div>
              </div>
            </section>
          </div>
        </fieldset>
        {error && (
          <p className="error form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="subtle" disabled={busy || uploading} onClick={close}>
            取消
          </button>
          <span className="muted">
            {uploading ? '素材上載中…' : '草稿及下架內容不會出現在前端'}
          </span>
          <button
            className="secondary"
            value={value.status === 'archived' ? 'archived' : 'draft'}
            disabled={busy || uploading}
          >
            <Save size={16} />
            {value.status === 'archived' ? '儲存並下架' : '儲存草稿'}
          </button>
          <button
            className="primary"
            value="published"
            disabled={
              busy ||
              uploading ||
              !value.files.some(Boolean) ||
              (value.salesKit && !kitComplete(value.files))
            }
          >
            <Check size={17} />
            {busy ? '儲存中…' : '發布內容'}
          </button>
        </div>
      </form>
      {preview && (
        <Viewer
          content={value}
          data={data}
          previewOrientation={preview}
          close={() => setPreview(null)}
        />
      )}
    </Modal>
  );
}
