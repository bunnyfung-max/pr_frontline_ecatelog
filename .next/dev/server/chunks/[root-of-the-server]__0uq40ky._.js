module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/src/app/api/save/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/catalog.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertSameOrigin"])(request);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireSession"])(true);
        const body = await request.json();
        if (body.action === 'delete') {
            const entity = body.entity;
            const id = String(body.id || '');
            if (!Object.hasOwn(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["schemas"], entity)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, '不支援的資料類型。');
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readCatalog"])();
            if (entity === 'folder') {
                const folder = data.folders.find((f)=>f.id === id);
                if (!folder) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](404, '找不到此資料夾。');
                const blockers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["folderDeleteBlockers"])(data, id);
                if (blockers.length) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, `無法刪除：${blockers.join('、')}。請先清空後再試。`);
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteEntry"])(entity, id);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["json"])({
                ok: true
            });
        }
        const { entity, payload, originFolder, expectedVersion } = body;
        if (!Object.hasOwn(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["schemas"], entity)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, '不支援的資料類型。');
        const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["schemas"][entity].safeParse(payload);
        if (!parsed.success) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, parsed.error.issues.map((i)=>i.message).join('；'));
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readCatalog"])();
        const value = parsed.data;
        if (entity === 'content' && 'folderId' in value) {
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["descendants"])(data.folders, originFolder).has(value.folderId)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, '只可上載至目前或下層資料夾。');
            const current = data.contents.find((c)=>c.id === value.id);
            if (current && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["descendants"])(data.folders, originFolder).has(current.folderId)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, '請先進入內容所屬的目錄。');
            if (value.productIds.some((id)=>!data.products.some((p)=>p.id === id))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, '相關產品不存在。');
            if (value.type === 'image' && !value.salesKit && (current?.salesKit || !current && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trail"])(data.folders, value.folderId).some((f)=>f.id === 'housing'))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, '請使用 Sales Kit 標準上載格式。');
            value.updatedAt = new Date().toISOString();
        }
        if (entity === 'folder' && 'parentId' in value) {
            const existing = data.folders.find((f)=>f.id === value.id);
            if (value.parentId) {
                if (!data.folders.some((f)=>f.id === value.parentId)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, '上層資料夾不存在。');
                if (value.parentId === value.id) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, '資料夾不能成為自己的上層。');
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["descendants"])(data.folders, value.id).has(value.parentId)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, '資料夾層級無效。');
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$catalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trail"])(data.folders, value.parentId).length >= 12) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, '資料夾層級過深。');
            } else {
                if (existing && existing.parentId) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, '不可將子目錄改為主目錄。');
                if (data.folders.some((f)=>!f.parentId && f.name === value.name && f.id !== value.id)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, '主目錄名稱已存在。');
            }
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveEntry"])(entity, value, expectedVersion);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["json"])({
            ok: true,
            value
        });
    } catch (e) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["failure"])(e);
    }
}
}),
"[project]/src/lib/catalog.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "activeOffer",
    ()=>activeOffer,
    "byOrder",
    ()=>byOrder,
    "contentAssets",
    ()=>contentAssets,
    "descendants",
    ()=>descendants,
    "folderDeleteBlockers",
    ()=>folderDeleteBlockers,
    "folderLabel",
    ()=>folderLabel,
    "publicCatalog",
    ()=>publicCatalog,
    "rootFolders",
    ()=>rootFolders,
    "searchCatalog",
    ()=>searchCatalog,
    "trail",
    ()=>trail,
    "visiblePages",
    ()=>visiblePages
]);
const folderLabel = (folder)=>folder.id === 'housing' && folder.name === 'New Housing' ? '新屋入伙' : folder.name;
function descendants(folders, id) {
    const found = new Set();
    if (!folders.some((f)=>f.id === id)) return found;
    const queue = [
        id
    ];
    while(queue.length){
        const current = queue.shift();
        if (found.has(current)) continue;
        found.add(current);
        queue.push(...folders.filter((f)=>f.parentId === current).map((f)=>f.id));
    }
    return found;
}
function trail(folders, id) {
    const path = [];
    const seen = new Set();
    let folder = folders.find((f)=>f.id === id);
    while(folder && !seen.has(folder.id)){
        seen.add(folder.id);
        path.unshift(folder);
        folder = folders.find((f)=>f.id === folder.parentId);
    }
    return path;
}
const byOrder = (a, b)=>a.order - b.order || (a.name || '').localeCompare(b.name || '', 'zh-HK');
const rootFolders = (data)=>data.folders.filter((f)=>!f.parentId).sort(byOrder);
function folderDeleteBlockers(data, id) {
    const folder = data.folders.find((f)=>f.id === id);
    if (!folder) return [
        '找不到此資料夾。'
    ];
    const blockers = [];
    if (data.folders.some((f)=>f.parentId === id)) blockers.push('仍有子資料夾');
    if (data.contents.some((c)=>c.folderId === id)) blockers.push('仍有展示內容');
    if (folder.id === 'scenes' && data.scenes.length > 0) blockers.push('仍有場景推介');
    return blockers;
}
function searchCatalog(data, folderId, query, includeDrafts = false) {
    // Only an explicitly absent folder means home/global search. Invalid IDs fail closed.
    const scope = folderId === null ? new Set(data.folders.map((f)=>f.id)) : descendants(data.folders, folderId);
    const terms = query.trim().normalize('NFKC').toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const match = (parts)=>{
        const text = parts.join(' ').normalize('NFKC').toLocaleLowerCase();
        return terms.every((term)=>text.includes(term));
    };
    const contents = data.contents.filter((c)=>{
        if (!scope.has(c.folderId) || !includeDrafts && c.status !== 'published') return false;
        const attributes = data.products.filter((p)=>c.productIds.includes(p.id)).flatMap((p)=>[
                p.name,
                p.code,
                p.brand,
                p.colour,
                p.style,
                p.keywords
            ]);
        // Only this content's folder path and linked products contribute to a match.
        return match([
            c.name,
            c.fileName,
            c.keywords,
            ...trail(data.folders, c.folderId).flatMap((f)=>[
                    f.name,
                    folderLabel(f)
                ]),
            ...attributes
        ]);
    }).sort(byOrder);
    const folders = data.folders.filter((f)=>f.id !== folderId && scope.has(f.id) && match([
            f.name,
            f.subtitle,
            ...trail(data.folders, f.id).flatMap((p)=>[
                    p.name,
                    folderLabel(p)
                ])
        ])).sort(byOrder);
    const scenes = scope.has('scenes') ? data.scenes.filter((s)=>(includeDrafts || s.active) && match([
            s.name,
            '場景推介'
        ])).sort(byOrder) : [];
    return {
        contents,
        folders,
        scenes
    };
}
function activeOffer(offer, now = new Date()) {
    const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Hong_Kong',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(now);
    return offer.active && (!offer.startDate || offer.startDate <= today) && (!offer.endDate || offer.endDate >= today);
}
function publicCatalog(data) {
    const contents = data.contents.filter((c)=>c.status === 'published');
    const linked = new Set(contents.flatMap((c)=>c.productIds));
    return {
        ...data,
        contents,
        products: data.products.filter((p)=>linked.has(p.id)),
        scenes: data.scenes.filter((s)=>s.active),
        offers: data.offers.filter((o)=>activeOffer(o))
    };
}
function visiblePages(current, total, landscape) {
    const page = Math.max(1, Math.min(current, total));
    return landscape && page < total ? [
        page,
        page + 1
    ] : [
        page
    ];
}
function contentAssets(c) {
    return [
        ...c.files,
        c.cover
    ].filter(Boolean);
}
}),
"[project]/src/lib/sales-kit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IMAGE_MIMES",
    ()=>IMAGE_MIMES,
    "KIT_MIMES",
    ()=>KIT_MIMES,
    "KIT_REQUIRED",
    ()=>KIT_REQUIRED,
    "KIT_RESERVED",
    ()=>KIT_RESERVED,
    "KIT_SLOTS",
    ()=>KIT_SLOTS,
    "MAX_KIT_FILES",
    ()=>MAX_KIT_FILES,
    "fileKind",
    ()=>fileKind,
    "kitComplete",
    ()=>kitComplete,
    "kitFiles",
    ()=>kitFiles,
    "moveKitExtra",
    ()=>moveKitExtra,
    "previousReaderPage",
    ()=>previousReaderPage,
    "readerAssets",
    ()=>readerAssets,
    "readerLeaves",
    ()=>readerLeaves,
    "readerSpread",
    ()=>readerSpread,
    "setKitSlot",
    ()=>setKitSlot
]);
const KIT_SLOTS = [
    '平面圖 Floor Plan',
    '效果圖',
    '產品列表（一）',
    '產品列表（二）',
    '補充圖片'
];
const KIT_RESERVED = KIT_SLOTS.length;
const KIT_REQUIRED = 1;
const MAX_KIT_FILES = 40;
const IMAGE_MIMES = [
    'image/jpeg',
    'image/png',
    'image/webp'
];
const KIT_MIMES = [
    ...IMAGE_MIMES,
    'application/pdf',
    'video/mp4',
    'video/webm'
];
function kitFiles(files) {
    return [
        ...Array.from({
            length: KIT_RESERVED
        }, (_, i)=>files[i] || ''),
        ...files.slice(KIT_RESERVED)
    ];
}
function setKitSlot(files, index, ref) {
    if (index < 0 || index >= KIT_RESERVED) throw new Error('Invalid kit slot');
    const result = kitFiles(files);
    result[index] = ref;
    return result;
}
function moveKitExtra(files, index, direction) {
    const target = index + direction;
    if (index < KIT_RESERVED || target < KIT_RESERVED || index >= files.length || target >= files.length) return files;
    const result = [
        ...files
    ];
    [result[index], result[target]] = [
        result[target],
        result[index]
    ];
    return result;
}
function kitComplete(files) {
    return Array.from({
        length: KIT_REQUIRED
    }, (_, i)=>!!files[i]).every(Boolean);
}
function fileKind(ref) {
    if (/\.pdf$/i.test(ref)) return 'pdf';
    if (/\.(mp4|webm)$/i.test(ref)) return 'video';
    return 'image';
}
function readerAssets(content) {
    return content.files.flatMap((ref, i)=>!ref ? [] : [
            {
                ref,
                kind: content.salesKit ? fileKind(ref) : content.type,
                label: content.salesKit ? KIT_SLOTS[i] || `額外檔案 ${i - KIT_RESERVED + 1}` : `第 ${i + 1} 份`
            }
        ]);
}
function readerLeaves(assets, pdfCounts) {
    return assets.flatMap((asset)=>asset.kind !== 'pdf' ? [
            asset
        ] : pdfCounts[asset.ref] ? Array.from({
            length: pdfCounts[asset.ref]
        }, (_, i)=>({
                ...asset,
                pdfPage: i + 1
            })) : [
            {
                ...asset,
                failed: true
            }
        ]);
}
const pairable = (page)=>page && !page.failed && (page.kind === 'image' || page.kind === 'pdf');
function readerSpread(leaves, current, landscape) {
    if (!leaves.length) return [];
    const page = Math.max(1, Math.min(current, leaves.length));
    return landscape && pairable(leaves[page - 1]) && pairable(leaves[page]) ? [
        page,
        page + 1
    ] : [
        page
    ];
}
function previousReaderPage(leaves, current, landscape) {
    // Walk the same spreads as Next; this also keeps videos on their own page.
    let start = 1;
    while(start < current){
        const next = readerSpread(leaves, start, landscape).at(-1) + 1;
        if (next >= current) return start;
        start = next;
    }
    return 1;
}
}),
"[project]/src/lib/seed.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialCatalog",
    ()=>initialCatalog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sharepoint$2d$housing$2d$folders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sharepoint-housing-folders.ts [app-route] (ecmascript)");
;
const folder = (id, parentId, name, order = 0, subtitle = '')=>({
        id,
        parentId,
        name,
        order,
        subtitle
    });
function initialCatalog(demo = false) {
    const folders = [
        folder('housing', null, 'New Housing', 0, '由一張平面圖，開始理想的家'),
        folder('pop', null, 'POP 展示', 1, '門市推廣與最新 E-poster'),
        folder('tmf', null, 'TMF', 2, '組合傢俬及專屬推廣'),
        folder('creator', null, '創造家', 3, '空間設計與家居靈感'),
        folder('scenes', null, '場景推介', 4, '配合不同生活需要的選擇'),
        folder('private', 'housing', '私人屋苑', 0),
        folder('public', 'housing', '公居屋', 1),
        folder('simple', 'housing', '簡約公屋', 2),
        ...[
            'TMF Offer',
            'Video',
            'Weekly Eposter',
            'Weekly Eposter_ST153'
        ].map((name, i)=>folder(`pop-${i}`, 'pop', name, i)),
        folder('tmf-centre', 'tmf', 'POP Centre'),
        ...[
            2024,
            2025,
            2026
        ].map((year)=>folder(`tmf-${year}`, 'tmf-centre', `${year}`, -year)),
        folder('creator-video', 'creator', '門市影片', 0),
        folder('creator-centre', 'creator', 'POP Center', 1),
        folder('creator-floorplan', 'creator-centre', 'Floorplan', 0),
        folder('creator-promotion', 'creator-centre', 'Promotion', 1),
        folder('creator-2026', 'creator-promotion', '2026')
    ];
    const data = {
        folders,
        contents: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sharepoint$2d$housing$2d$folders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sharepointHousingContents"])(),
        products: [],
        offers: [],
        settings: {
            id: 'store',
            label: '前往自在購',
            url: ''
        },
        scenes: [
            '公居屋專家推介',
            '私樓傢俬套裝',
            '租客1天入伙套餐',
            '入伙必備家品',
            '銀優生活',
            '返學必備推介'
        ].map((name, i)=>({
                id: `scene-${i}`,
                name,
                order: i,
                image: '',
                url: '',
                active: true
            }))
    };
    if (!demo) return data;
    data.folders.push(folder('estate-a', 'private', '示例屋苑 A', 9000, '示例資料 · 非真實屋苑'), folder('unit-a', 'estate-a', '450–550 呎 / 2–3 人'), folder('estate-b', 'private', '示例屋苑 B', 9001), folder('unit-b', 'estate-b', '650 呎 / 4 人'));
    data.products = [
        {
            id: 'sofa',
            name: '示例雙人梳化',
            code: 'DEMO-001',
            brand: '示例品牌',
            colour: '米白色',
            style: '北歐簡約',
            keywords: '梳化 客廳 sofa',
            image: '/demo/living.svg',
            url: ''
        },
        {
            id: 'desk',
            name: '示例橡木書枱',
            code: 'DEMO-002',
            brand: '示例品牌',
            colour: '原木色',
            style: '日式',
            keywords: '書房 desk',
            image: '/demo/plan.svg',
            url: ''
        }
    ];
    data.contents.push({
        id: 'kit-a',
        folderId: 'unit-a',
        name: '小空間，大可能',
        type: 'image',
        files: [
            '/demo/plan.svg',
            '/demo/living.svg',
            '/demo/details.svg'
        ],
        fileName: 'sample-sale-kit',
        cover: '/demo/living.svg',
        keywords: '平面圖 家居配置 套裝',
        productIds: [
            'sofa'
        ],
        status: 'published',
        order: 0,
        updatedAt: '2026-09-18T00:00:00Z'
    }, {
        id: 'kit-b',
        folderId: 'unit-b',
        name: '靈活工作角落',
        type: 'image',
        files: [
            '/demo/details.svg'
        ],
        fileName: 'sample-desk',
        cover: '/demo/details.svg',
        keywords: '書房',
        productIds: [
            'desk'
        ],
        status: 'published',
        order: 0,
        updatedAt: '2026-09-18T00:00:00Z'
    }, {
        id: 'poster-demo',
        folderId: 'pop-2',
        name: '讓日常，多一點舒適',
        type: 'image',
        files: [
            '/demo/living.svg'
        ],
        fileName: 'weekly-eposter-demo',
        cover: '/demo/living.svg',
        keywords: '梳化 推廣',
        productIds: [
            'sofa'
        ],
        status: 'published',
        order: 0,
        updatedAt: '2026-09-18T00:00:00Z'
    }, {
        id: 'draft-demo',
        folderId: 'unit-a',
        name: '未發布示例草稿',
        type: 'image',
        files: [
            '/demo/plan.svg'
        ],
        fileName: 'draft',
        cover: '',
        keywords: '草稿',
        productIds: [],
        status: 'draft',
        order: 1,
        updatedAt: '2026-09-18T00:00:00Z'
    });
    data.offers = [
        {
            id: 'bundle-demo',
            name: '客廳舒適組合（示例）',
            summary: '梳化與茶几的配搭靈感。正式優惠及連結待提供。',
            image: '/demo/living.svg',
            url: '',
            order: 0,
            active: true,
            startDate: '',
            endDate: ''
        }
    ];
    return data;
}
}),
"[project]/src/lib/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HttpError",
    ()=>HttpError,
    "assertSameOrigin",
    ()=>assertSameOrigin,
    "configured",
    ()=>configured,
    "dataDirectory",
    ()=>dataDirectory,
    "deleteEntry",
    ()=>deleteEntry,
    "demoEnabled",
    ()=>demoEnabled,
    "failure",
    ()=>failure,
    "json",
    ()=>json,
    "readCatalog",
    ()=>readCatalog,
    "requireSession",
    ()=>requireSession,
    "saveEntry",
    ()=>saveEntry,
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$12$2e$7_$40$supabase$2b$supabase$2d$js$40$2$2e$116$2e$0$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.12.7_@supabase+supabase-js@2.116.0/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$5_$40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$node$40$26$2e$6$2e$1_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.3.5_@playwright+test@1.63.0_@types+node@26.6.1_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/seed.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const demoEnabled = ()=>("TURBOPACK compile-time value", "development") === 'development' && process.env.DEMO_MODE === 'true' && !process.env.VERCEL;
const configured = ()=>Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const dataDirectory = ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), '.data');
class HttpError extends Error {
    status;
    constructor(status, message){
        super(message), this.status = status;
    }
}
async function supabase() {
    if (!configured()) throw new HttpError(503, '尚未設定 Supabase，請參閱部署指南。');
    const jar = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$3$2e$5_$40$playwright$2b$test$40$1$2e$63$2e$0_$40$types$2b$node$40$26$2e$6$2e$1_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$12$2e$7_$40$supabase$2b$supabase$2d$js$40$2$2e$116$2e$0$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
        cookies: {
            getAll: ()=>jar.getAll(),
            setAll: (values)=>{
                values.forEach(({ name, value, options })=>jar.set(name, value, options));
            }
        }
    });
}
async function requireSession(admin = false) {
    if (demoEnabled()) return {
        role: 'admin',
        email: '本機示例模式',
        demo: true
    };
    const sb = await supabase();
    const { data: { user }, error } = await sb.auth.getUser();
    if (error || !user) throw new HttpError(401, '請先登入員工帳戶。');
    const { data: member } = await sb.from('members').select('role').eq('id', user.id).single();
    if (!member || admin && member.role !== 'admin') throw new HttpError(403, '此帳戶沒有操作權限，請聯絡管理員。');
    return {
        role: member.role,
        email: user.email || '',
        demo: false
    };
}
const collection = {
    folder: 'folders',
    content: 'contents',
    product: 'products',
    scene: 'scenes',
    offer: 'offers',
    settings: 'settings'
};
let localQueue = Promise.resolve();
async function writeLocal(data) {
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdir"])(dataDirectory(), {
        recursive: true
    });
    const temp = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dataDirectory(), `catalog-${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()}.tmp`);
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["writeFile"])(temp, JSON.stringify(data, null, 2), 'utf8');
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rename"])(temp, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dataDirectory(), 'catalog.json'));
}
async function readLocal() {
    try {
        return JSON.parse(await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dataDirectory(), 'catalog.json'), 'utf8'));
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$seed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initialCatalog"])(true);
    }
}
async function readCatalog() {
    if (demoEnabled()) return readLocal();
    const sb = await supabase();
    const data = {
        folders: [],
        contents: [],
        products: [],
        scenes: [],
        offers: [],
        settings: {
            id: 'store',
            label: '前往自在購',
            url: ''
        }
    };
    for(let from = 0;; from += 500){
        const { data: rows, error } = await sb.from('catalog_entries').select('entity,payload').order('id').range(from, from + 499);
        if (error) throw new HttpError(503, '資料庫尚未就緒，請確認 migration 及存取權限。');
        for (const row of rows){
            const key = collection[row.entity];
            if (key === 'settings') data.settings = row.payload;
            else if (key) data[key].push(row.payload);
        }
        if (rows.length < 500) break;
    }
    return data;
}
async function deleteEntry(entity, id) {
    if (entity === 'settings') throw new HttpError(400, '不可刪除此設定。');
    if (demoEnabled()) {
        const action = localQueue.then(async ()=>{
            const data = await readLocal();
            const key = collection[entity];
            const list = data[key];
            const index = list.findIndex((row)=>row.id === id);
            if (index < 0) throw new HttpError(404, '找不到項目。');
            list.splice(index, 1);
            await writeLocal(data);
        });
        localQueue = action.catch(()=>undefined);
        await action;
        return;
    }
    const sb = await supabase();
    const { error } = await sb.from('catalog_entries').delete().eq('entity', entity).eq('id', id);
    if (error) throw new HttpError(500, '刪除失敗，請稍後重試。');
}
async function saveEntry(entity, payload, expectedVersion) {
    if (demoEnabled()) {
        const action = localQueue.then(async ()=>{
            const data = await readLocal();
            const key = collection[entity];
            if (key === 'settings') data.settings = payload;
            else {
                const list = data[key];
                const index = list.findIndex((row)=>row.id === payload.id);
                if (entity === 'content' && index >= 0 && list[index].updatedAt !== expectedVersion) throw new HttpError(409, '內容已被更新，請重新載入後再修改。');
                if (index >= 0) list[index] = payload;
                else list.push(payload);
            }
            await writeLocal(data);
        });
        localQueue = action.catch(()=>undefined);
        await action;
        return;
    }
    const sb = await supabase();
    const row = {
        id: payload.id,
        entity,
        payload
    };
    if (entity === 'content' && expectedVersion) {
        const { data, error } = await sb.from('catalog_entries').update(row).eq('id', payload.id).eq('entity', entity).eq('payload->>updatedAt', expectedVersion).select('id');
        if (error) throw new HttpError(500, '儲存失敗，請稍後重試。');
        if (!data?.length) throw new HttpError(409, '內容已被更新，請重新載入後再修改。');
    } else {
        const query = entity === 'content' ? sb.from('catalog_entries').insert(row) : sb.from('catalog_entries').upsert(row, {
            onConflict: 'entity,id'
        });
        const { error } = await query;
        if (error) throw new HttpError(500, '儲存失敗，請稍後重試。');
    }
}
function assertSameOrigin(request) {
    const origin = request.headers.get('origin');
    // Next may normalize request.url to localhost internally. The browser's Host
    // remains the actual request destination (including Preview domains and ports).
    let originUrl;
    try {
        originUrl = new URL(origin || '');
    } catch  {
        throw new HttpError(403, '不接受跨網站請求。');
    }
    if (![
        'http:',
        'https:'
    ].includes(originUrl.protocol) || originUrl.host !== request.headers.get('host')) throw new HttpError(403, '不接受跨網站請求。');
}
function failure(error) {
    const status = error instanceof HttpError ? error.status : 500;
    return Response.json({
        error: error instanceof HttpError ? error.message : '操作未完成，請稍後重試。'
    }, {
        status,
        headers: {
            'Cache-Control': 'private, no-store'
        }
    });
}
function json(data) {
    return Response.json(data, {
        headers: {
            'Cache-Control': 'private, no-store'
        }
    });
}
}),
"[project]/src/lib/sharepoint-housing-folders.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sharepointHousingContents",
    ()=>sharepointHousingContents
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sales$2d$kit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sales-kit.ts [app-route] (ecmascript)");
;
const DEMO_SALES_KIT = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sales$2d$kit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kitFiles"])([
    '/demo/sales-kit-floorplan.svg',
    '/demo/sales-kit-render-1.svg',
    '/demo/sales-kit-render-2.svg',
    '/demo/sales-kit-product-1.svg',
    '/demo/sales-kit-product-2.svg'
]);
const SEED_UPDATED_AT = '2026-09-18T00:00:00Z';
const publicLeaves = [
    {
        id: 'public-all',
        name: 'all'
    },
    {
        id: 'public-type-a',
        name: 'Type A – 1至2人單位'
    },
    {
        id: 'public-type-b1',
        name: 'Type B1 – 2至3人單位'
    },
    {
        id: 'public-type-b2',
        name: 'Type B2 – 2至3人單位'
    },
    {
        id: 'public-type-c1',
        name: 'Type C1 – 3至4人單位'
    },
    {
        id: 'public-type-c2',
        name: 'Type C2 – 3至4人單位'
    },
    {
        id: 'public-type-d1a',
        name: 'Type D1A – 4至5人單位'
    },
    {
        id: 'public-type-d1b',
        name: 'Type D1B – 4至5人單位'
    },
    {
        id: 'public-type-d2a',
        name: 'Type D2A – 4至5人單位'
    },
    {
        id: 'public-type-d2b',
        name: 'Type D2B – 4至5人單位'
    }
];
const privateLeaves = [
    {
        id: 'private-nova-land-2br',
        name: 'NOVA LAND兩房'
    },
    {
        id: 'private-sierra-sea-2a-1br',
        name: 'SIERRA SEA 2A期 (1房)'
    },
    {
        id: 'private-yoho-hub',
        name: 'YoHo Hub'
    },
    {
        id: 'private-ming-city-3-4br',
        name: '名城3期四房'
    },
    {
        id: 'private-kai-tak-harbour-2',
        name: '啟德海灣2期'
    },
    {
        id: 'private-kingswood-442',
        name: '嘉湖山莊(442呎)'
    },
    {
        id: 'private-kingswood-540',
        name: '嘉湖山莊(540呎)'
    },
    {
        id: 'private-tai-po-shang-yan',
        name: '大埔上然'
    },
    {
        id: 'private-tai-woo-garden',
        name: '太湖花園'
    },
    {
        id: 'private-tuen-mun-plaza',
        name: '屯門時代廣場'
    },
    {
        id: 'private-napa-1-floorplan',
        name: '嵐山1期單位平面圖'
    },
    {
        id: 'private-discovery-park',
        name: '愉景新城'
    },
    {
        id: 'private-metropolis',
        name: '新都城'
    },
    {
        id: 'private-sunrise-city',
        name: '日出康城'
    },
    {
        id: 'private-sunrise-city-12c',
        name: '日出康城12期C'
    },
    {
        id: 'private-rise-park',
        name: '昇柏山'
    },
    {
        id: 'private-caribbean-coast',
        name: '映灣園'
    },
    {
        id: 'private-the-pavilia-farm',
        name: '柏傲莊'
    },
    {
        id: 'private-sha-tin-city',
        name: '沙田第一城'
    },
    {
        id: 'private-sha-tin-city-327',
        name: '沙田第一城 327呎'
    },
    {
        id: 'private-hung-shui-bridge',
        name: '洪水橋滙都'
    },
    {
        id: 'private-ocean-pride',
        name: '海之戀'
    },
    {
        id: 'private-south-horizons',
        name: '海怡半島'
    },
    {
        id: 'private-south-horizons-4',
        name: '海怡半島4期'
    },
    {
        id: 'private-hoi-fai-garden',
        name: '海濱花園'
    },
    {
        id: 'private-amoy-gardens',
        name: '淘大花園'
    },
    {
        id: 'private-island-south',
        name: '港島南岸'
    },
    {
        id: 'private-gateway-prime',
        name: '港灣豪庭'
    },
    {
        id: 'private-marina-warm-floorplan',
        name: '溱柏單位平面圖'
    },
    {
        id: 'private-world-city-floorplan',
        name: '環宇海灣單位平面圖'
    },
    {
        id: 'private-green-park-floorplan',
        name: '綠悠雅苑單位平面圖'
    },
    {
        id: 'private-mei-foo',
        name: '美孚新邨'
    },
    {
        id: 'private-greenwood',
        name: '翠麗花園'
    },
    {
        id: 'private-tsuen-wan-centre',
        name: '荃灣中心'
    },
    {
        id: 'private-laguna-city-3br',
        name: '麗港城三房'
    },
    {
        id: 'private-whampoa-garden',
        name: '黃埔花園'
    }
];
const simpleLeaves = [
    {
        id: 'simple-1-2',
        name: '簡約公屋 1至2人單位'
    },
    {
        id: 'simple-3-4',
        name: '簡約公屋 3至4人單位'
    },
    {
        id: 'simple-4-5',
        name: '簡約公屋 4至5人單位'
    }
];
function housingContents(folderId, leaves) {
    return leaves.map((leaf, order)=>({
            id: leaf.id,
            folderId,
            name: leaf.name,
            type: 'image',
            salesKit: true,
            files: DEMO_SALES_KIT,
            fileName: 'sales-kit-demo',
            cover: '/demo/sales-kit-render-1.svg',
            keywords: `${leaf.name} 平面圖 效果圖 產品`,
            productIds: [],
            status: 'published',
            order,
            updatedAt: SEED_UPDATED_AT
        }));
}
function sharepointHousingContents() {
    return [
        ...housingContents('public', publicLeaves),
        ...housingContents('private', privateLeaves),
        ...housingContents('simple', simpleLeaves)
    ];
}
}),
"[project]/src/lib/validation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assetRef",
    ()=>assetRef,
    "httpsUrl",
    ()=>httpsUrl,
    "idSchema",
    ()=>idSchema,
    "mimeExtension",
    ()=>mimeExtension,
    "schemas",
    ()=>schemas,
    "uploadSchema",
    ()=>uploadSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sales$2d$kit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sales-kit.ts [app-route] (ecmascript)");
;
;
const idSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const httpsUrl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(2000).refine((v)=>{
    if (!v) return true;
    try {
        return new URL(v).protocol === 'https:';
    } catch  {
        return false;
    }
}, '請輸入完整的 HTTPS 連結');
const assetRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(2000).refine((v)=>!v || /^asset:[a-zA-Z0-9_/-]+\.(jpg|jpeg|png|webp|pdf|mp4|webm)$/.test(v) || /^\/demo\/(?:plan|living|details|housing-floorplan|sales-kit-(?:floorplan|render-[12]|product-[12]))\.svg$/.test(v), '不支援的檔案位置');
const name = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1, '請輸入名稱').max(200);
const image = assetRef;
const schemas = {
    content: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: idSchema,
        folderId: idSchema,
        name,
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            'image',
            'pdf',
            'video',
            'link'
        ]),
        files: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(2000)).min(1).max(40),
        salesKit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
        fileName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(1000),
        cover: image,
        keywords: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(2000),
        productIds: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(idSchema).max(200),
        storeUrl: httpsUrl.default(''),
        eshopUrl: httpsUrl.default(''),
        status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            'draft',
            'published',
            'archived'
        ]),
        order: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).max(99999),
        updatedAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    }).superRefine((c, ctx)=>{
        if (c.salesKit && (c.type !== 'image' || c.files.length < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sales$2d$kit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KIT_RESERVED"])) ctx.addIssue({
            code: 'custom',
            message: 'Sales Kit 必須保留五個圖片位置。'
        });
        c.files.forEach((file, i)=>{
            if (c.salesKit && !file && i < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sales$2d$kit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KIT_RESERVED"]) {
                if (c.status === 'published' && i < __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sales$2d$kit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KIT_REQUIRED"]) ctx.addIssue({
                    code: 'custom',
                    message: `發布前請補齊第 ${i + 1} 張圖片。`,
                    path: [
                        'files',
                        i
                    ]
                });
                return;
            }
            const valid = c.type === 'link' ? httpsUrl.safeParse(file).success && !!file : assetRef.safeParse(file).success && !!file;
            if (!valid) ctx.addIssue({
                code: 'custom',
                message: '請提供有效檔案或 HTTPS 連結',
                path: [
                    'files',
                    i
                ]
            });
            if (file.startsWith('asset:')) {
                const ext = file.split('.').pop();
                const allowed = c.salesKit && i >= __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sales$2d$kit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KIT_RESERVED"] ? [
                    'png',
                    'jpg',
                    'jpeg',
                    'webp',
                    'pdf',
                    'mp4',
                    'webm'
                ] : c.type === 'image' ? [
                    'png',
                    'jpg',
                    'jpeg',
                    'webp'
                ] : c.type === 'pdf' ? [
                    'pdf'
                ] : c.type === 'video' ? [
                    'mp4',
                    'webm'
                ] : [];
                if (!allowed.includes(ext)) ctx.addIssue({
                    code: 'custom',
                    message: '檔案格式與內容類型不符',
                    path: [
                        'files',
                        i
                    ]
                });
            }
        });
        if (c.type !== 'image' && c.files.length !== 1) ctx.addIssue({
            code: 'custom',
            message: 'PDF、影片及連結每項只接受一個檔案或 URL'
        });
    }),
    product: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: idSchema,
        name,
        code: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100),
        brand: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100),
        colour: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100),
        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100),
        keywords: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(2000),
        image,
        url: httpsUrl,
        storeUrl: httpsUrl.default('')
    }),
    scene: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: idSchema,
        name,
        image,
        url: httpsUrl,
        order: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).max(99999),
        active: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean()
    }),
    offer: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: idSchema,
        name,
        summary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(1000),
        image,
        url: httpsUrl,
        order: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).max(99999),
        active: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
        startDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^$|^\d{4}-\d{2}-\d{2}$/),
        endDate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^$|^\d{4}-\d{2}-\d{2}$/)
    }).refine((o)=>!o.startDate || !o.endDate || o.startDate <= o.endDate, '結束日期不可早於開始日期'),
    settings: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('store'),
        label: name,
        url: httpsUrl
    }),
    folder: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: idSchema,
        parentId: idSchema.nullable(),
        name,
        subtitle: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(500),
        order: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).max(99999)
    })
};
const uploadSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(255),
    size: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().max(50 * 1024 * 1024),
    mime: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$6$2e$5$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
        'video/mp4',
        'video/webm'
    ])
});
const mimeExtension = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'video/mp4': 'mp4',
    'video/webm': 'webm'
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0uq40ky._.js.map