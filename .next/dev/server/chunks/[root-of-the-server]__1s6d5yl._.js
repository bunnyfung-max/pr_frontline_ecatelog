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
"[project]/src/app/api/session/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/server.ts [app-route] (ecmascript)");
;
async function GET() {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["configured"])() && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["demoEnabled"])()) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["json"])({
        setup: true
    });
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["json"])({
            session: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireSession"])()
        });
    } catch (e) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["failure"])(e);
    }
}
async function POST(request) {
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["assertSameOrigin"])(request);
        const { email, password, action } = await request.json();
        const sb = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"])();
        if (action === 'logout') {
            await sb.auth.signOut();
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["json"])({
                ok: true
            });
        }
        if (typeof email !== 'string' || typeof password !== 'string' || email.length > 320 || password.length > 500) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](400, '請輸入有效的登入資料。');
        const { error } = await sb.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](401, '登入失敗，請檢查電郵及密碼，或稍後再試。');
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireSession"])();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["json"])({
            session
        });
    } catch (e) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["failure"])(e);
    }
}
}),
"[project]/src/lib/seed.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initialCatalog",
    ()=>initialCatalog
]);
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
        contents: [],
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
    data.contents = [
        {
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
        },
        {
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
        },
        {
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
        },
        {
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
        }
    ];
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
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1s6d5yl._.js.map