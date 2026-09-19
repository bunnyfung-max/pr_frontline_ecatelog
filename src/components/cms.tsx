'use client';
import { useState } from 'react';
import {
  UploadCloud,
  X,
  ArrowUp,
  ArrowDown,
  Plus,
  Eye,
  Save,
  Check,
  Image as ImageIcon,
  ArrowLeft,
} from 'lucide-react';
import type { Catalog, Content, ContentType, Product, Offer, Scene, Status } from '@/lib/types';
import { TYPE_LABEL } from '@/lib/types';
import { descendants, trail, byOrder } from '@/lib/catalog';
import { save, upload } from '@/lib/client';
import { Modal, Thumb, Empty } from './ui';
import { Viewer } from './viewer';
import { SalesKitUpload } from './sales-kit-upload';
import { kitFiles, kitComplete } from '@/lib/sales-kit';
const makeId = () => crypto.randomUUID();
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
    const initial: Content = content || {
      id: makeId(),
      folderId,
      name: '',
      type: 'image',
      files: [],
      fileName: '',
      cover: '',
      keywords: '',
      productIds: [],
      storeUrl: '',
      eshopUrl: '',
      status: 'draft',
      order: 0,
      updatedAt: '',
    };
    return housing && initial.type === 'image'
      ? { ...initial, salesKit: true, files: kitFiles(initial.files) }
      : initial;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<'landscape' | 'portrait' | null>(null);
  const [productQuery, setProductQuery] = useState('');
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
      if (value.type === 'image' && value.files.length + selected.length > 40)
        throw new Error('每份圖片目錄最多 40 頁。');
      const allowed =
        value.type === 'image'
          ? ['image/jpeg', 'image/png', 'image/webp']
          : value.type === 'pdf'
            ? ['application/pdf']
            : ['video/mp4', 'video/webm'];
      if (selected.some((f) => !allowed.includes(f.type)))
        throw new Error('所選檔案與內容類型不符。');
      const uploaded: string[] = [];
      for (const file of selected) uploaded.push(await upload(file, demo));
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
                      accept={
                        value.type === 'image'
                          ? 'image/jpeg,image/png,image/webp'
                          : value.type === 'pdf'
                            ? 'application/pdf'
                            : 'video/mp4,video/webm'
                      }
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
                demo={demo}
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
              <label>
                相關產品
                <input
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="搜尋產品索引"
                />
              </label>
              <div className="product-picker">
                {data.products
                  .filter((p) =>
                    `${p.name} ${p.code}`.toLowerCase().includes(productQuery.toLowerCase()),
                  )
                  .map((p) => (
                    <label key={p.id}>
                      <input
                        type="checkbox"
                        checked={value.productIds.includes(p.id)}
                        onChange={(e) =>
                          update(
                            'productIds',
                            e.target.checked
                              ? [...value.productIds, p.id]
                              : value.productIds.filter((id) => id !== p.id),
                          )
                        }
                      />
                      <span>
                        {p.name}
                        <small>
                          {[p.code, p.brand, p.colour, p.style].filter(Boolean).join(' · ')}
                        </small>
                      </span>
                    </label>
                  ))}
                {!data.products.length && <p className="muted">請先在「產品索引」新增產品。</p>}
              </div>
              <small className="muted">搜尋會比對已關聯產品的名稱、品牌、顏色及風格。</small>
              <div className="purchase-fields" role="group" aria-label="本份內容的購物連結">
                <h3>本份內容 / Sales Kit 專屬購物連結</h3>
                <p className="muted">選填。只用於本份內容；相關產品會使用各自的購物連結。</p>
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
function ImageField({
  label,
  value,
  onChange,
  demo,
  onBusy,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  demo: boolean;
  onBusy?: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="image-field">
      <span className="field-label">{label}</span>
      <div>
        {value && (
          <div className="mini-image">
            <Thumb src={value} />
          </div>
        )}
        <label className="secondary">
          <ImageIcon size={16} />
          {busy ? '上載中…' : value ? '替換圖片' : '選擇圖片'}
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label={label}
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError('');
              setBusy(true);
              onBusy?.(true);
              try {
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
                  throw new Error('請選擇 JPG、PNG 或 WebP。');
                onChange(await upload(file, demo));
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
                onBusy?.(false);
              }
            }}
          />
        </label>
        {value && (
          <button type="button" className="text-btn" onClick={() => onChange('')}>
            移除
          </button>
        )}
      </div>
      {error && (
        <small className="error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
export function ManagePanel({
  kind,
  data,
  demo,
  close,
  saved,
}: {
  kind: string;
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
function MetadataForm({
  kind,
  item,
  demo,
  back,
  saved,
}: {
  kind: string;
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
          await save(kind as 'product' | 'scene' | 'offer', payload);
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
      <ImageField
        label="展示圖片"
        value={image}
        onChange={setImage}
        demo={demo}
        onBusy={setUploading}
      />
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
