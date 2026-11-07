'use strict';
/* DevDocs — documentation reader PWA.
   Content: official NestJS docs (rendered at build time from the docs repo).
   Progress is stored locally in the browser (localStorage). */

const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const faNum = (n) => Number(n).toLocaleString('fa-IR');
const faPct = (n) => faNum(Math.round(n)) + '٪';

/* ---------------- icons (vector, SF-style) ---------------- */
const I = {
  home: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 10.8 12 4l7.5 6.8V19a1.6 1.6 0 0 1-1.6 1.6H14v-6h-4v6H6.1A1.6 1.6 0 0 1 4.5 19v-8.2Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>',
  homeFill: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 10.8 12 4l7.5 6.8V19a1.6 1.6 0 0 1-1.6 1.6H14v-6h-4v6H6.1A1.6 1.6 0 0 1 4.5 19v-8.2Z" fill="currentColor"/></svg>',
  books: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.7A1.7 1.7 0 0 0 5 19.7v-15.2Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M5 16.5A2.5 2.5 0 0 1 7.5 14H19v7H7.5A2.5 2.5 0 0 1 5 18.5v-2Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" transform="translate(0 -1)"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4v15.5A.5.5 0 0 0 4.5 20H20" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><rect x="7.5" y="12" width="3" height="5.5" rx="1" fill="currentColor"/><rect x="12" y="8.5" width="3" height="9" rx="1" fill="currentColor"/><rect x="16.5" y="10.5" width="3" height="7" rx="1" fill="currentColor"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.9"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 12.5 9.8 17.8 19.5 6.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 10 16" fill="none" aria-hidden="true"><path d="M1.5 1.5 8 8l-6.5 6.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back: '<svg class="back-ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 4.5 7 12l7.5 7.5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.6" stroke="currentColor" stroke-width="1.9"/><path d="M12 7.4V12l3 2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.4v13.2a.8.8 0 0 0 1.2.7l10-6.6a.8.8 0 0 0 0-1.4l-10-6.6A.8.8 0 0 0 8 5.4Z" fill="currentColor"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="2"/><path d="M15.8 15.8 21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  bookOpen: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 6.2C10.3 4.7 8 4 5.2 4c-.6 0-1 .1-1.2.2v14c.2-.1.6-.2 1.2-.2 2.8 0 5.1.7 6.8 2.2 1.7-1.5 4-2.2 6.8-2.2.6 0 1 .1 1.2.2v-14C19.8 4.1 19.4 4 18.8 4 16 4 13.7 4.7 12 6.2Zm0 0v14" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.9"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  textSize: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 18V7.5A2.5 2.5 0 0 1 6.5 5h.4A2.5 2.5 0 0 1 9.4 7.5V18M4.6 13.5h4.2M14 18l3.4-9.5L20.8 18M15.3 14.8h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6.5h16M9.5 6V4.8A.8.8 0 0 1 10.3 4h3.4a.8.8 0 0 1 .8.8V6M6.5 6.5l.8 12.2a1.8 1.8 0 0 0 1.8 1.7h5.8a1.8 1.8 0 0 0 1.8-1.7l.8-12.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13.5 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5M14 4h6v6M20 4 11 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v10.5M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* ---------------- storage ---------------- */
const SKEY = 'devdocs.settings.v1';
const PKEY = 'devdocs.progress.v1';
const settings = Object.assign({ theme: 'auto', fontSize: 'normal' }, JSON.parse(localStorage.getItem(SKEY) || '{}'));
const progress = Object.assign({ done: {}, last: null }, JSON.parse(localStorage.getItem(PKEY) || '{}'));
const saveSettings = () => localStorage.setItem(SKEY, JSON.stringify(settings));
const saveProgress = () => localStorage.setItem(PKEY, JSON.stringify(progress));
const isDone = (slug) => !!progress.done[slug];

/* ---------------- theme ---------------- */
const mq = matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const dark = settings.theme === 'dark' || (settings.theme === 'auto' && mq.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.themeMode = settings.theme;
  document.documentElement.dataset.fontsize = settings.fontSize;
}
mq.addEventListener?.('change', applyTheme);
applyTheme();

/* ---------------- catalog ---------------- */
let catalog = null;
const bySlug = new Map();
async function loadCatalog() {
  if (catalog) return catalog;
  catalog = await (await fetch('data/catalog.json')).json();
  for (const ch of catalog.chapters) bySlug.set(ch.slug, ch);
  return catalog;
}
const totalMinutes = () => catalog.chapters.reduce((a, c) => a + c.minutes, 0);
const doneCount = () => catalog.chapters.filter((c) => isDone(c.slug)).length;
const overallPct = () => (catalog.chapters.length ? (doneCount() / catalog.chapters.length) * 100 : 0);
const catStats = (cat) => {
  const list = cat.slugs.map((s) => bySlug.get(s)).filter(Boolean);
  return { total: list.length, done: list.filter((c) => isDone(c.slug)).length, list };
};

/* ---------------- shared fragments ---------------- */
const CAT_COLORS = ['#EA2845', '#007AFF', '#AF52DE', '#FF9500', '#34C759', '#30B0C7', '#5856D6', '#FF2D55', '#A2845E', '#00C7BE', '#FF6482', '#64D2FF', '#BF5AF2', '#AC8E68', '#5E5CE6', '#FF9F0A', '#32ADE6', '#A3A380', '#E35D6A'];
function chapterRow(ch) {
  const done = isDone(ch.slug);
  return `<a class="row" href="#/doc/${ch.slug}">
    <span class="status-dot ${done ? 'done' : ''}">${I.check}</span>
    <span class="r-main"><span class="r-title" dir="ltr" style="text-align:start">${esc(ch.title)}</span>
    <span class="r-meta"><span style="display:inline-flex;align-items:center;gap:4px">${I.clock.replace('<svg', '<svg width="13" height="13"')} ${faNum(ch.minutes)} دقیقه</span><span dir="ltr">${esc(ch.category)}</span></span></span>
    ${I.chev}</a>`;
}
function ringSVG(size, r, pct, sw) {
  const c = 2 * Math.PI * r;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="ring-bg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${sw}"/><circle class="ring-fg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(100, pct) / 100)}"/></svg>`;
}
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------------- views ---------------- */
const view = $('#view');

function renderHome() {
  const pct = overallPct();
  const done = doneCount();
  const total = catalog.chapters.length;
  const last = progress.last && bySlug.get(progress.last.slug);
  const lastUndone = last && !isDone(last.slug) ? last : null;
  const firstUndone = catalog.chapters.find((c) => !isDone(c.slug));
  const cont = lastUndone || (done > 0 ? firstUndone : null);
  view.innerHTML = `<div class="wrap">
    <div class="hero">
      <div class="hero-top">
        <img class="hero-icon" src="icons/icon-192.png" alt="DevDocs">
        <div><h1>DevDocs</h1><div class="hero-sub">مستندات برنامه‌نویسی، همیشه همراهت</div></div>
        <span class="hero-brand"><img src="icons/nestjs.svg" alt="NestJS"></span>
      </div>
      <div class="hero-progress">
        ${ringSVG(66, 27, pct, 6.5)}
        <div><div class="hero-pct">${faPct(pct)}</div><div class="hero-stats">از مستندات NestJS خوانده شده — ${faNum(done)} از ${faNum(total)} فصل</div></div>
      </div>
      ${cont ? `<button class="continue-btn" data-go="#/doc/${cont.slug}">${I.play}<span class="cb-txt">${lastUndone ? 'ادامه مطالعه' : 'شروع فصل بعدی'}<span class="cb-sub">${esc(cont.title)}</span></span></button>` : done === total ? `<button class="continue-btn" data-go="#/progress">${I.check}<span class="cb-txt">همه فصل‌ها خوانده شد</span></button>` : `<button class="continue-btn" data-go="#/doc/${catalog.chapters[0].slug}">${I.play}<span class="cb-txt">شروع مطالعه<span class="cb-sub">${esc(catalog.chapters[0].title)}</span></span></button>`}
    </div>

    <div class="section-head"><h2>دوره‌ها</h2><span class="count">1 course</span></div>
    <div class="group">
      <a class="row" href="#/library">
        <span class="cat-badge" style="background:#EA2845"><img src="icons/nestjs.svg" alt="" style="width:20px;height:20px;filter:brightness(0) invert(1)"></span>
        <span class="r-main"><span class="r-title">NestJS</span>
        <span class="r-meta">${faNum(total)} فصل · ${faNum(totalMinutes())} دقیقه مطالعه</span>
        <span class="mini-bar"><i style="width:${pct}%"></i></span></span>
        <span class="r-value">${faPct(pct)}</span>${I.chev}</a>
    </div>

    <div class="section-head"><h2>دسته‌بندی‌ها</h2><span class="count">${faNum(catalog.categories.length)} بخش</span></div>
    <div class="group">
      ${catalog.categories.map((cat, i) => { const s = catStats(cat); const p = s.total ? (s.done / s.total) * 100 : 0; return `<a class="row" href="#/library" data-cat="${esc(cat.title)}">
        <span class="cat-badge" style="background:${CAT_COLORS[i % CAT_COLORS.length]}"><span style="font-weight:700;font-size:15px" dir="ltr">${esc(cat.title[0])}</span></span>
        <span class="r-main"><span class="r-title" dir="ltr" style="text-align:start">${esc(cat.title)}</span>
        <span class="mini-bar"><i style="width:${p}%"></i></span></span>
        <span class="r-value" dir="ltr">${s.done}/${s.total}</span>${I.chev}</a>`; }).join('')}
    </div>
    <p class="foot-note">محتوای این اپ عیناً از ریپوی رسمی مستندات NestJS گرفته شده و چیزی به آن اضافه نشده است. پیشرفت مطالعه فقط روی همین مرورگر ذخیره می‌شود.</p>
  </div>`;
  $$('[data-cat]', view).forEach((a) => a.addEventListener('click', () => { sessionStorage.setItem('devdocs.libcat', a.dataset.cat); }));
}

function renderLibrary() {
  view.innerHTML = `<div class="wrap">
    <h1 class="large-title">کتابخانه</h1>
    <p class="page-sub">مستندات کامل NestJS — ${faNum(catalog.chapters.length)} فصل در ${faNum(catalog.categories.length)} بخش، به همان ترتیب سایت رسمی.</p>
    ${catalog.categories.map((cat) => { const s = catStats(cat); return `
      <div class="section-head" id="cat-${esc(cat.title)}"><h2 dir="ltr" style="text-align:start">${esc(cat.title)}</h2><span class="count">${s.done}/${s.total} خوانده شده</span></div>
      <div class="group">${s.list.map(chapterRow).join('')}</div>`; }).join('')}
  </div>`;
  const target = sessionStorage.getItem('devdocs.libcat');
  if (target) {
    sessionStorage.removeItem('devdocs.libcat');
    requestAnimationFrame(() => { const el = document.getElementById('cat-' + target); if (el) window.scrollTo({ top: el.offsetTop - 76, behavior: 'smooth' }); });
  }
}

function renderProgress() {
  const done = doneCount();
  const total = catalog.chapters.length;
  const readMin = catalog.chapters.filter((c) => isDone(c.slug)).reduce((a, c) => a + c.minutes, 0);
  const recent = Object.entries(progress.done).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([s]) => bySlug.get(s)).filter(Boolean);
  view.innerHTML = `<div class="wrap">
    <h1 class="large-title">پیشرفت</h1>
    <p class="page-sub">ترکر مطالعه مستندات NestJS</p>
    <div class="progress-hero">
      <div class="ring-wrap">${ringSVG(168, 74, overallPct(), 13)}<div class="ring-center"><b>${faPct(overallPct())}</b><span>تکمیل شده</span></div></div>
      <div class="stat-grid">
        <div class="stat-card"><b>${faNum(done)}<span style="font-size:14px;color:var(--label-2)"> / ${faNum(total)}</span></b><span>فصل خوانده‌شده</span></div>
        <div class="stat-card"><b>${faNum(readMin)}</b><span>دقیقه مطالعه (تخمینی)</span></div>
      </div>
    </div>
    <div class="section-head"><h2>پیشرفت هر بخش</h2></div>
    <div class="group">
      ${catalog.categories.map((cat) => { const s = catStats(cat); const p = s.total ? (s.done / s.total) * 100 : 0; return `<div class="cat-progress"><div class="cp-top"><span class="cp-t">${esc(cat.title)}</span><span class="cp-n">${s.done}/${s.total}</span></div><div class="mini-bar"><i style="width:${p}%"></i></div></div>`; }).join('')}
    </div>
    ${recent.length ? `<div class="section-head"><h2>آخرین خوانده‌شده‌ها</h2></div><div class="group">${recent.map(chapterRow).join('')}</div>` : ''}
    ${done === 0 ? `<div class="empty">${I.bookOpen}<h3>هنوز فصلی خوانده نشده</h3><p>آخر هر فصل، دکمه «مطالعه شد» را بزن تا پیشرفتت اینجا ثبت شود.</p></div>` : ''}
  </div>`;
}

let deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; if (currentRoute === 'settings') renderSettings(); });

function seg(name, options, current) {
  return `<span class="seg" data-seg="${name}">${options.map(([v, l]) => `<button type="button" data-v="${v}" class="${v === current ? 'on' : ''}">${l}</button>`).join('')}</span>`;
}
function renderSettings() {
  view.innerHTML = `<div class="wrap">
    <h1 class="large-title">تنظیمات</h1>
    <p class="page-sub">ظاهر و داده‌های مطالعه</p>
    <div class="section-head"><h2>نمایش</h2></div>
    <div class="group">
      <div class="row"><span class="set-label"><span class="set-ic" style="background:#5856D6">${I.sun}</span>تم برنامه</span>
        ${seg('theme', [['auto', 'خودکار'], ['light', 'روشن'], ['dark', 'تیره']], settings.theme)}</div>
      <div class="row"><span class="set-label"><span class="set-ic" style="background:#007AFF">${I.textSize}</span>اندازه متن مستندات</span>
        ${seg('fontSize', [['small', 'کوچک'], ['normal', 'معمولی'], ['large', 'بزرگ']], settings.fontSize)}</div>
    </div>
    <p class="foot-note">در حالت خودکار، تم از تنظیمات سیستم پیروی می‌کند. کنتراست لایه‌ها در تم تیره طوری تنظیم شده که کادرها و بخش‌های مختلف مثل تم روشن به‌وضوح از هم جدا باشند.</p>
    ${deferredInstall ? `<div class="section-head"><h2>نصب</h2></div><button class="install-btn" id="install-btn">${I.download} نصب اپ روی دستگاه</button>` : ''}
    <div class="section-head"><h2>داده‌ها</h2></div>
    <div class="group">
      <button class="row" id="reset-progress"><span class="set-label"><span class="set-ic" style="background:#FF3B30">${I.trash}</span><span class="destructive">بازنشانی پیشرفت مطالعه</span></span></button>
    </div>
    <p class="foot-note">پیشرفت مطالعه و تنظیمات فقط در حافظه همین مرورگر (localStorage) ذخیره می‌شود و هیچ سروری در کار نیست؛ با پاک‌کردن داده‌های مرورگر از بین می‌رود.</p>
    <div class="section-head"><h2>درباره</h2></div>
    <div class="group">
      <a class="row" href="https://github.com/nestjs/docs.nestjs.com" target="_blank" rel="noopener"><span class="set-label"><span class="set-ic" style="background:#EA2845"><img src="icons/nestjs.svg" alt="" style="width:18px;height:18px;filter:brightness(0) invert(1)"></span>منبع مستندات — ریپوی رسمی NestJS</span>${I.ext.replace('<svg', '<svg width="18" height="18" style="color:var(--label-3)"')}</a>
      <div class="row"><span class="set-label">تعداد فصل‌ها</span><span class="r-value">${faNum(catalog.chapters.length)} فصل</span></div>
      <div class="row"><span class="set-label">دوره‌های موجود</span><span class="r-value">NestJS</span></div>
      <a class="row" href="https://github.com/kianodd/devdocs" target="_blank" rel="noopener"><span class="set-label">سورس این اپ</span>${I.ext.replace('<svg', '<svg width="18" height="18" style="color:var(--label-3)"')}</a>
    </div>
  </div>`;
  $$('.seg', view).forEach((sg) => $$('button', sg).forEach((b) => b.addEventListener('click', () => {
    settings[sg.dataset.seg] = b.dataset.v;
    saveSettings(); applyTheme(); renderSettings();
    toast('تنظیمات ذخیره شد');
  })));
  const ib = $('#install-btn');
  if (ib) ib.addEventListener('click', async () => { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; renderSettings(); });
  $('#reset-progress').addEventListener('click', () => {
    if (!confirm('همه تیک‌های مطالعه پاک شود؟ این کار قابل برگشت نیست.')) return;
    progress.done = {}; progress.last = null; saveProgress();
    toast('پیشرفت مطالعه بازنشانی شد'); renderSettings();
  });
}

function renderSearch() {
  view.innerHTML = `<div class="wrap">
    <h1 class="large-title">جستجو</h1>
    <p class="page-sub">در عنوان فصل‌ها و بخش‌های مستندات بگرد</p>
    <div class="search-field">${I.search}<input id="q" type="search" placeholder="مثلاً Guards یا authentication" autocomplete="off"></div>
    <div id="results"></div>
  </div>`;
  const input = $('#q');
  const box = $('#results');
  const run = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { box.innerHTML = `<div class="empty">${I.bookOpen}<h3>دنبال چی می‌گردی؟</h3><p>بخشی از عنوان فصل یا اسم بخش را بنویس.</p></div>`; return; }
    const hits = catalog.chapters.filter((c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.slug.replace(/[-/]/g, ' ').includes(q));
    box.innerHTML = hits.length ? `<div class="group">${hits.map(chapterRow).join('')}</div>` : `<div class="empty">${I.search}<h3>نتیجه‌ای پیدا نشد</h3><p>املای عبارت را چک کن یا کلمه کوتاه‌تری بنویس.</p></div>`;
  };
  input.addEventListener('input', run);
  run();
  setTimeout(() => input.focus(), 60);
}

/* ---------------- document view ---------------- */
const htmlCache = new Map();
let docCleanup = null;

async function renderDoc(slug, frag) {
  const ch = bySlug.get(slug);
  if (!ch) { location.hash = '#/library'; return; }
  const prev = bySlug.get(ch.prev || '');
  const next = bySlug.get(ch.next || '');
  view.innerHTML = `<div class="wrap">
    <div class="toolbar">
      <button class="tool-btn" data-go="#/library" aria-label="بازگشت">${I.back}</button>
      <span class="t-title">${esc(ch.title)}</span>
      <button class="tool-btn done-toggle ${isDone(slug) ? 'on' : ''}" id="tb-done" aria-label="علامت مطالعه">${I.check}</button>
    </div>
    <div class="doc-head"><div class="doc-cat">${esc(ch.category)}</div><h1 class="doc-title">${esc(ch.title)}</h1>
    <div class="doc-meta">${I.clock} ${ch.minutes} min read · NestJS Documentation</div></div>
    <div class="article-card"><article class="article" id="article"><div class="skel" style="height:22px;width:55%;margin-bottom:14px"></div><div class="skel" style="height:15px;width:96%;margin-bottom:9px"></div><div class="skel" style="height:15px;width:92%;margin-bottom:9px"></div><div class="skel" style="height:15px;width:88%;margin-bottom:9px"></div><div class="skel" style="height:120px;width:100%;margin:18px 0"></div><div class="skel" style="height:15px;width:94%;margin-bottom:9px"></div><div class="skel" style="height:15px;width:90%"></div></article></div>
    <div class="done-card">
      <button class="done-ring-btn ${isDone(slug) ? 'done' : ''}" id="done-btn" aria-label="مطالعه شد">${I.check}</button>
      <h3 id="done-title">${isDone(slug) ? 'این فصل خوانده شده' : 'این فصل را خواندی؟'}</h3>
      <p id="done-sub">${isDone(slug) ? 'آفرین! تیک این فصل در ترکرت ثبت شده است.' : 'وقتی فصل تمام شد، روی دایره بالا بزن تا در ترکر مطالعه‌ات ثبت شود.'}</p>
    </div>
    <nav class="pager">
      ${prev ? `<a href="#/doc/${prev.slug}"><span class="pg-k">${I.back.replace('class="back-ic"', '')} فصل قبل</span><span class="pg-t">${esc(prev.title)}</span></a>` : '<span></span>'}
      ${next ? `<a class="next" href="#/doc/${next.slug}"><span class="pg-k">فصل بعد ${I.back.replace('class="back-ic"', 'style="transform:scaleX(-1)"')}</span><span class="pg-t">${esc(next.title)}</span></a>` : '<span></span>'}
    </nav>
  </div>`;

  const setDoneUI = () => {
    const d = isDone(slug);
    $('#done-btn')?.classList.toggle('done', d);
    $('#tb-done')?.classList.toggle('on', d);
    const t = $('#done-title'), s = $('#done-sub');
    if (t) t.textContent = d ? 'این فصل خوانده شده' : 'این فصل را خواندی؟';
    if (s) s.textContent = d ? 'آفرین! تیک این فصل در ترکرت ثبت شده است.' : 'وقتی فصل تمام شد، روی دایره بالا بزن تا در ترکر مطالعه‌ات ثبت شود.';
  };
  const toggle = () => {
    if (isDone(slug)) { delete progress.done[slug]; toast('تیک این فصل برداشته شد'); }
    else { progress.done[slug] = Date.now(); toast('«' + ch.title + '» خوانده شد'); }
    saveProgress(); setDoneUI();
  };
  $('#done-btn').addEventListener('click', toggle);
  $('#tb-done').addEventListener('click', toggle);

  let html = htmlCache.get(slug);
  if (!html) {
    try { html = await (await fetch(ch.file)).text(); htmlCache.set(slug, html); }
    catch { $('#article').innerHTML = '<p>بارگذاری فصل ناموفق بود. اتصال را چک کن و دوباره تلاش کن.</p>'; return; }
  }
  const article = $('#article');
  if (!article) return;
  article.innerHTML = html;

  // code tabs + copy
  article.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-lang-tab]');
    if (tab) {
      const card = tab.closest('.code-card');
      const i = tab.dataset.langTab;
      $$('[data-lang-tab]', card).forEach((b) => b.classList.toggle('on', b === tab));
      $$('[data-pane]', card).forEach((p) => { p.hidden = p.dataset.pane !== i; });
      return;
    }
    const cp = e.target.closest('[data-copy]');
    if (cp) {
      const card = cp.closest('.code-card');
      const pane = $$('[data-pane]', card).find((p) => !p.hidden) || $('[data-pane]', card);
      const text = pane ? pane.innerText.replace(/\n$/, '') : '';
      const ok = () => { cp.classList.add('ok'); cp.innerHTML = I.check.replace('<svg', '<svg width="16" height="16"'); setTimeout(() => { cp.classList.remove('ok'); cp.innerHTML = cp.dataset.orig; }, 1400); };
      cp.dataset.orig = cp.innerHTML;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(ok, ok); else ok();
      return;
    }
    const a = e.target.closest('a[href^="#"]');
    if (a && !a.getAttribute('href').startsWith('#/')) {
      e.preventDefault();
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    }
  });

  // reading progress + position memory
  const bar = $('#read-progress');
  bar.classList.add('show');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const f = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    bar.firstElementChild.style.width = (f * 100).toFixed(1) + '%';
    if (!docCleanup._t || Date.now() - docCleanup._t > 700) {
      docCleanup._t = Date.now();
      progress.last = { slug, frac: f, at: Date.now() };
      saveProgress();
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  docCleanup = () => { removeEventListener('scroll', onScroll); bar.classList.remove('show'); bar.firstElementChild.style.width = '0'; };
  docCleanup._t = 0;

  if (frag) {
    const target = document.getElementById(frag);
    if (target) { window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90 }); return; }
  }
  if (progress.last && progress.last.slug === slug && progress.last.frac > 0.02 && progress.last.frac < 0.98) {
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      window.scrollTo(0, max * progress.last.frac);
    });
  }
}

/* ---------------- chrome (tabs + sidebar) ---------------- */
const TABS = [
  { route: 'home', label: 'خانه', icon: I.home, iconOn: I.homeFill },
  { route: 'library', label: 'کتابخانه', icon: I.books, iconOn: I.books },
  { route: 'progress', label: 'پیشرفت', icon: I.chart, iconOn: I.chart },
  { route: 'settings', label: 'تنظیمات', icon: I.gear, iconOn: I.gear },
];
function buildChrome() {
  $('.tab-capsule').innerHTML = TABS.map((t) => `<button class="tab-btn" data-tab="${t.route}" role="tab">${t.icon}<span>${t.label}</span></button>`).join('');
  $$('.tab-btn').forEach((b) => b.addEventListener('click', () => {
    if (currentRoute === b.dataset.tab) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    location.hash = '#/' + b.dataset.tab;
  }));
  $('#search-btn').addEventListener('click', () => { location.hash = '#/search'; });
  $('#sidebar').innerHTML = `
    <div class="side-brand"><img src="icons/icon-192.png" alt=""><div><b>DevDocs</b><span>مستندات برنامه‌نویسی</span></div></div>
    <nav class="side-nav">
      ${TABS.map((t) => `<button class="side-link" data-tab="${t.route}">${t.icon}${t.label}</button>`).join('')}
      <button class="side-link" data-tab="search">${I.search}جستجو</button>
    </nav>
    <div class="side-prog"><div class="sp-t">پیشرفت مطالعه NestJS</div><div class="sp-v" id="side-pct">۰٪</div><div class="mini-bar" style="max-width:none"><i id="side-bar" style="width:0%"></i></div></div>`;
  $$('#sidebar [data-tab]').forEach((b) => b.addEventListener('click', () => { location.hash = '#/' + b.dataset.tab; }));
}
function markChrome(route) {
  $$('.tab-btn').forEach((b) => {
    const on = b.dataset.tab === route;
    b.classList.toggle('on', on);
    const t = TABS.find((x) => x.route === b.dataset.tab);
    b.firstElementChild.outerHTML = on ? t.iconOn : t.icon;
  });
  $$('#sidebar [data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === route));
  const sp = $('#side-pct'), sb = $('#side-bar');
  if (sp && catalog) { sp.textContent = faPct(overallPct()); sb.style.width = overallPct() + '%'; }
}

/* ---------------- router ---------------- */
let currentRoute = 'home';
async function route() {
  if (docCleanup) { docCleanup(); docCleanup = null; }
  await loadCatalog();
  const raw = location.hash.replace(/^#\/?/, '');
  const [pathPart] = raw.split('@');
  const frag = raw.includes('@') ? raw.split('@')[1] : null;
  const seg = pathPart.split('/').filter(Boolean);
  window.scrollTo(0, 0);
  if (seg[0] === 'doc' && seg[1]) {
    currentRoute = 'library';
    markChrome('library');
    await renderDoc(decodeURIComponent(seg.slice(1).join('/')), frag);
  } else if (seg[0] === 'library') { currentRoute = 'library'; markChrome('library'); renderLibrary(); }
  else if (seg[0] === 'progress') { currentRoute = 'progress'; markChrome('progress'); renderProgress(); }
  else if (seg[0] === 'settings') { currentRoute = 'settings'; markChrome('settings'); renderSettings(); }
  else if (seg[0] === 'search') { currentRoute = 'search'; markChrome(''); renderSearch(); }
  else { currentRoute = 'home'; markChrome('home'); renderHome(); }
  view.focus({ preventScroll: true });
}
document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]');
  if (g) location.hash = g.dataset.go;
});
addEventListener('hashchange', route);

buildChrome();
route();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
