'use strict';
/* DevDocs v2 — multi-course documentation reader PWA.
   Courses are built at build time (data/catalog.json). Progress, downloads,
   settings live locally in the browser. */

const APP_VERSION = '2.3.0';
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- icons (vector, SF-style) ---------------- */
const I = {
  home: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 10.8 12 4l7.5 6.8V19a1.6 1.6 0 0 1-1.6 1.6H14v-6h-4v6H6.1A1.6 1.6 0 0 1 4.5 19v-8.2Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>',
  homeFill: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 10.8 12 4l7.5 6.8V19a1.6 1.6 0 0 1-1.6 1.6H14v-6h-4v6H6.1A1.6 1.6 0 0 1 4.5 19v-8.2Z" fill="currentColor"/></svg>',
  books: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.7A1.7 1.7 0 0 0 5 19.7v-15.2Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M5 16.5A2.5 2.5 0 0 1 7.5 14H19v7H7.5A2.5 2.5 0 0 1 5 18.5v-2Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" transform="translate(0 -1)"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4v15.5A.5.5 0 0 0 4.5 20H20" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><rect x="7.5" y="12" width="3" height="5.5" rx="1" fill="currentColor"/><rect x="12" y="8.5" width="3" height="9" rx="1" fill="currentColor"/><rect x="16.5" y="10.5" width="3" height="7" rx="1" fill="currentColor"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><g fill="currentColor"><rect x="11" y="1.6" width="2" height="3.8" rx="1"/><rect x="11" y="1.6" width="2" height="3.8" rx="1" transform="rotate(45 12 12)"/><rect x="11" y="1.6" width="2" height="3.8" rx="1" transform="rotate(90 12 12)"/><rect x="11" y="1.6" width="2" height="3.8" rx="1" transform="rotate(135 12 12)"/><rect x="11" y="1.6" width="2" height="3.8" rx="1" transform="rotate(180 12 12)"/><rect x="11" y="1.6" width="2" height="3.8" rx="1" transform="rotate(225 12 12)"/><rect x="11" y="1.6" width="2" height="3.8" rx="1" transform="rotate(270 12 12)"/><rect x="11" y="1.6" width="2" height="3.8" rx="1" transform="rotate(315 12 12)"/><path fill-rule="evenodd" d="M12 5.6a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8Zm0 3.3a3.1 3.1 0 1 1 0 6.2 3.1 3.1 0 0 1 0-6.2Z"/></g></svg',
  check: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 12.5 9.8 17.8 19.5 6.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chev: '<svg viewBox="0 0 10 16" fill="none" aria-hidden="true"><path d="M1.5 1.5 8 8l-6.5 6.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back: '<svg class="flip" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 4.5 7 12l7.5 7.5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.6" stroke="currentColor" stroke-width="1.9"/><path d="M12 7.4V12l3 2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.4v13.2a.8.8 0 0 0 1.2.7l10-6.6a.8.8 0 0 0 0-1.4l-10-6.6A.8.8 0 0 0 8 5.4Z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.4" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.4" fill="currentColor"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.4" fill="currentColor"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="2"/><path d="M15.8 15.8 21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v10.5M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dlDone: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v9M8 9.8 12 13.8l4-4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 17.5v1.6A1.9 1.9 0 0 0 6.4 21h11.2a1.9 1.9 0 0 0 1.9-1.9v-1.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="m8.2 4.6.1-.1" stroke="currentColor" stroke-width="1.9"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.6" stroke="currentColor" stroke-width="1.8"/><path d="M3.4 12h17.2M12 3.4c2.5 2.4 3.8 5.3 3.8 8.6s-1.3 6.2-3.8 8.6c-2.5-2.4-3.8-5.3-3.8-8.6S9.5 5.8 12 3.4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  speaker: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9.5v5h3.4L12 18.6V5.4L7.4 9.5H4Z" fill="currentColor"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.4 7.4 0 0 1 0 10.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 3.5V8h-4.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="7.5" stroke="currentColor" stroke-width="1.9"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6.5h16M9.5 6V4.8A.8.8 0 0 1 10.3 4h3.4a.8.8 0 0 1 .8.8V6M6.5 6.5l.8 12.2a1.8 1.8 0 0 0 1.8 1.7h5.8a1.8 1.8 0 0 0 1.8-1.7l.8-12.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15V4.5M7.5 8.5 12 4l4.5 4.5M4.5 16.5v1.6A1.9 1.9 0 0 0 6.4 20h11.2a1.9 1.9 0 0 0 1.9-1.9v-1.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5v11M8 6.5 12 2.8l4 3.7M5 12.5v6A1.5 1.5 0 0 0 6.5 20h11A1.5 1.5 0 0 0 19 18.5v-6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.5 6h11M8.5 12h11M8.5 18h11" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="4.3" cy="6" r="1.5" fill="currentColor"/><circle cx="4.3" cy="12" r="1.5" fill="currentColor"/><circle cx="4.3" cy="18" r="1.5" fill="currentColor"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 6.2C10.3 4.7 8 4 5.2 4c-.6 0-1 .1-1.2.2v14c.2-.1.6-.2 1.2-.2 2.8 0 5.1.7 6.8 2.2 1.7-1.5 4-2.2 6.8-2.2.6 0 1 .1 1.2.2v-14C19.8 4.1 19.4 4 18.8 4 16 4 13.7 4.7 12 6.2Zm0 0v14" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
};

/* ---------------- i18n ---------------- */
const STR = {
  fa: {
    home: 'خانه', library: 'کتابخانه', progress: 'پیشرفت', settings: 'تنظیمات', search: 'جستجو',
    tagline: 'مستندات برنامه‌نویسی، آفلاین و همیشه همراه',
    courses: 'دوره‌ها', continueReading: 'ادامه مطالعه', chapters: 'فصل', sections: 'بخش', min: 'دقیقه',
    of: 'از', doneOf: 'خوانده شده', overall: 'پیشرفت کلی', perSection: 'پیشرفت بخش‌ها',
    downloadAll: 'دانلود همه فصل‌ها', removeDownloads: 'حذف دانلودها', downloadedN: 'دانلودشده',
    appearance: 'ظاهر', theme: 'تم', auto: 'خودکار', light: 'روشن', dark: 'تیره',
    uiLang: 'زبان رابط کاربری', reading: 'مطالعه', fontSize: 'اندازه فونت متن',
    fsNames: ['خیلی ریز', 'ریز', 'متوسط', 'درشت', 'خیلی درشت'],
    density: 'فاصله‌بندی متن', compact: 'فشرده', comfortable: 'معمولی', spacious: 'باز',
    offline: 'مطالعه آفلاین', downloadedChapters: 'فصل‌های دانلودشده', storageUsed: 'حجم مصرفی تقریبی',
    deleteAllDownloads: 'حذف همه دانلودها', appSec: 'برنامه', version: 'نسخه',
    checkUpdate: 'بررسی به‌روزرسانی', installApp: 'نصب برنامه', dataSec: 'داده‌ها',
    resetProgress: 'بازنشانی پیشرفت مطالعه',
    resetConfirmT: 'پیشرفت مطالعه پاک شود؟', resetConfirmB: 'همه تیک‌های «مطالعه شد» و سابقه ادامه مطالعه حذف می‌شود. دانلودها باقی می‌مانند.',
    deleteDlT: 'دانلودها حذف شوند؟', deleteDlB: 'فصل‌های دانلودشده از حافظه مرورگر پاک می‌شوند و برای مطالعه دوباره باید دانلود شوند.',
    cancel: 'انصراف', delete: 'حذف', reset: 'بازنشانی',
    markRead: 'مطالعه شد', markUnread: 'خوانده‌نشده حساب کن', listen: 'شنیدن', translateBtn: 'ترجمه',
    showOriginal: 'متن اصلی', translating: 'در حال ترجمه…', prevChapter: 'فصل قبل', nextChapter: 'فصل بعد',
    searchPh: 'جستجو در عنوان و متن فصل‌ها…', titleHits: 'در عنوان فصل‌ها', contentHits: 'در متن فصل‌ها',
    searching: 'در حال جستجو…', noResults: 'نتیجه‌ای پیدا نشد.', results: 'نتیجه',
    updateTitle: 'نسخه جدید آماده است', updateNow: 'به‌روزرسانی', later: 'بعداً',
    updateNotesT: 'در این نسخه:', upToDate: 'برنامه به‌روز است.', updateReady: 'نسخه جدید آماده نصب است.',
    copied: 'کپی شد', dlStarted: 'دانلود شروع شد…', dlDoneToast: 'دانلود کامل شد', dlRemoved: 'دانلود حذف شد',
    dlError: 'دانلود ناموفق بود؛ اتصال را بررسی کن', translateError: 'ترجمه ناموفق بود؛ اتصال اینترنت لازم است.',
    translateDone: 'ترجمه شد', ttsNoText: 'متن قابل خواندنی در این فصل نیست.',
    lastRead: 'آخرین مطالعه', backToLibrary: 'کتابخانه', section: 'بخش',
    nothingYet: 'هنوز چیزی نخوانده‌ای.', startNow: 'از اولین فصل شروع کن.',
    listeningNow: 'در حال خواندن فصل', estTime: 'زمان مطالعه',
    downloads: 'دانلودها', uiFontSize: 'اندازه فونت رابط کاربری', uiFsNames: ['ریز', 'معمولی', 'درشت'],
    changelog: 'لیست تغییرات', swReset: 'حذف سرویس‌ورکر و بارگذاری مجدد',
    focusMode: 'تمرکز', autoCache: 'کش خودکار فصل‌های خوانده‌شده', verifyDl: 'بررسی سلامت دانلودها',
    verifyOk: 'همه دانلودها سالم‌اند', verifyBad: 'فایل ناقص پیدا شد', repair: 'تعمیر دانلودها',
    repairing: 'در حال تعمیر…', repaired: 'تعمیر کامل شد', checkingDl: 'در حال بررسی دانلودها…',
    dlQueue: 'در حال دانلود', dlOf: 'از', courseComplete: 'دوره کامل شد', verifyNote: 'فصل‌ها و تصاویرشان در حافظه آفلاین بررسی می‌شوند.',
    swResetNote: 'اگر برنامه گیر کرد یا نسخه قدیم ماند، این دکمه سرویس‌ورکر و کش پوسته را پاک می‌کند و برنامه را از سرور تازه می‌گیرد. پیشرفت مطالعه و دانلودها پاک نمی‌شوند.',
    exportZip: 'خروجی ZIP از دانلودها', importZip: 'وارد کردن ZIP دانلودها',
    select: 'انتخاب', cancelSel: 'لغو انتخاب', deleteSelected: 'حذف انتخاب‌شده‌ها',
    noDownloads: 'هنوز چیزی دانلود نکرده‌ای. از کتابخانه، فصل‌ها را برای مطالعه آفلاین دانلود کن.',
    totalSize: 'حجم کل', items: 'مورد', exported: 'خروجی ZIP ساخته و دانلود شد',
    imported: 'دانلودها وارد شدند', importError: 'این فایل ZIP معتبر نیست یا خراب است.',
    recent: 'اخیرها', allCourses: 'دوره‌ها',
  },
  en: {
    home: 'Home', library: 'Library', progress: 'Progress', settings: 'Settings', search: 'Search',
    tagline: 'Programming documentation, offline and always with you',
    courses: 'Courses', continueReading: 'Continue reading', chapters: 'chapters', sections: 'sections', min: 'min',
    of: 'of', doneOf: 'read', overall: 'Overall progress', perSection: 'Section progress',
    downloadAll: 'Download all chapters', removeDownloads: 'Remove downloads', downloadedN: 'downloaded',
    appearance: 'Appearance', theme: 'Theme', auto: 'Automatic', light: 'Light', dark: 'Dark',
    uiLang: 'Interface language', reading: 'Reading', fontSize: 'Text size',
    fsNames: ['Extra small', 'Small', 'Medium', 'Large', 'Extra large'],
    density: 'Text spacing', compact: 'Compact', comfortable: 'Comfortable', spacious: 'Spacious',
    offline: 'Offline reading', downloadedChapters: 'Downloaded chapters', storageUsed: 'Approx. storage used',
    deleteAllDownloads: 'Delete all downloads', appSec: 'App', version: 'Version',
    checkUpdate: 'Check for updates', installApp: 'Install app', dataSec: 'Data',
    resetProgress: 'Reset study progress',
    resetConfirmT: 'Reset study progress?', resetConfirmB: 'All “read” checkmarks and your continue-reading history will be removed. Downloads stay.',
    deleteDlT: 'Delete downloads?', deleteDlB: 'Downloaded chapters will be removed from browser storage and must be downloaded again to read offline.',
    cancel: 'Cancel', delete: 'Delete', reset: 'Reset',
    markRead: 'Mark as read', markUnread: 'Mark as unread', listen: 'Listen', translateBtn: 'Translate',
    showOriginal: 'Original', translating: 'Translating…', prevChapter: 'Previous', nextChapter: 'Next',
    searchPh: 'Search titles and chapter text…', titleHits: 'In chapter titles', contentHits: 'In chapter text',
    searching: 'Searching…', noResults: 'No results found.', results: 'results',
    updateTitle: 'A new version is ready', updateNow: 'Update', later: 'Later',
    updateNotesT: "What's new:", upToDate: 'The app is up to date.', updateReady: 'A new version is ready to install.',
    copied: 'Copied', dlStarted: 'Downloading…', dlDoneToast: 'Download complete', dlRemoved: 'Download removed',
    dlError: 'Download failed; check your connection', translateError: 'Translation failed; an internet connection is required.',
    translateDone: 'Translated', ttsNoText: 'Nothing readable in this chapter.',
    lastRead: 'Last read', backToLibrary: 'Library', section: 'Section',
    nothingYet: "You haven't read anything yet.", startNow: 'Start with the first chapter.',
    listeningNow: 'Reading chapter', estTime: 'Reading time',
    downloads: 'Downloads', uiFontSize: 'Interface font size', uiFsNames: ['Small', 'Default', 'Large'],
    changelog: 'Changelog', swReset: 'Remove service worker & reload',
    focusMode: 'Focus', autoCache: 'Auto-cache chapters I read', verifyDl: 'Verify downloads',
    verifyOk: 'All downloads are intact', verifyBad: 'incomplete file(s) found', repair: 'Repair downloads',
    repairing: 'Repairing…', repaired: 'Repair complete', checkingDl: 'Verifying downloads…',
    dlQueue: 'Downloading', dlOf: 'of', courseComplete: 'Course complete', verifyNote: 'Chapters and their images are checked in offline storage.',
    swResetNote: 'If the app is stuck on an old version, this removes the service worker and shell cache and refetches the app. Study progress and downloads are kept.',
    exportZip: 'Export downloads as ZIP', importZip: 'Import downloads ZIP',
    select: 'Select', cancelSel: 'Cancel selection', deleteSelected: 'Delete selected',
    noDownloads: 'Nothing downloaded yet. Download chapters from the Library for offline reading.',
    totalSize: 'Total size', items: 'items', exported: 'ZIP exported and downloaded',
    imported: 'Downloads imported', importError: 'This ZIP file is invalid or corrupted.',
    recent: 'Recent', allCourses: 'Courses',
  },
};
const T = (k) => (STR[settings.lang] && STR[settings.lang][k]) || STR.fa[k] || k;
const num = (n) => settings.lang === 'en' ? String(Number(n)) : Number(n).toLocaleString('fa-IR');
const pctStr = (n) => settings.lang === 'en' ? Math.round(n) + '%' : num(Math.round(n)) + '٪';

/* ---------------- storage (with v1 migration) ---------------- */
const SKEY2 = 'devdocs.settings.v2';
const PKEY2 = 'devdocs.progress.v2';
const DKEY = 'devdocs.downloads.v1';
function loadJSON(k, fb) { try { return Object.assign({}, fb, JSON.parse(localStorage.getItem(k) || '{}')); } catch { return Object.assign({}, fb); } }
let settings = loadJSON(SKEY2, null);
if (!settings || settings.theme === undefined) {
  const v1 = loadJSON('devdocs.settings.v1', { theme: 'auto', fontSize: 'normal' });
  settings = { theme: v1.theme || 'auto', fontSize: { small: 1, normal: 2, large: 3 }[v1.fontSize] ?? 2, density: 'comfortable', lang: 'fa', uiSize: 1 };
  localStorage.setItem(SKEY2, JSON.stringify(settings));
}
let progress = loadJSON(PKEY2, null);
if (!progress || !progress.done) {
  const v1 = loadJSON('devdocs.progress.v1', { done: {}, last: null });
  progress = { done: {}, last: null };
  for (const [slug, ts] of Object.entries(v1.done || {})) progress.done['nestjs:' + slug] = ts;
  if (v1.last && v1.last.slug) progress.last = { key: 'nestjs:' + v1.last.slug, frac: v1.last.frac || 0, at: v1.last.at || 0 };
  localStorage.setItem(PKEY2, JSON.stringify(progress));
}
if (settings.uiSize === undefined) { settings.uiSize = 1; localStorage.setItem(SKEY2, JSON.stringify(settings)); }
if (settings.autoCache === undefined) { settings.autoCache = false; localStorage.setItem(SKEY2, JSON.stringify(settings)); }
let downloads = loadJSON(DKEY, { keys: {} });
// normalize: values are {at, size}; older entries were plain timestamps
for (const k of Object.keys(downloads.keys)) {
  const v = downloads.keys[k];
  if (typeof v === 'number') downloads.keys[k] = { at: v, size: 0 };
}
const dlInfo = (key) => downloads.keys[key] || null;
const dlSize = (key) => (downloads.keys[key] && downloads.keys[key].size) || 0;
const fmtSize = (b) => !b ? '—' : b < 1048576 ? num(Math.max(1, Math.round(b / 1024))) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
const saveSettings = () => localStorage.setItem(SKEY2, JSON.stringify(settings));
const saveProgress = () => localStorage.setItem(PKEY2, JSON.stringify(progress));
const saveDownloads = () => localStorage.setItem(DKEY, JSON.stringify(downloads));
const isDone = (key) => !!progress.done[key];
const isDownloaded = (key) => !!downloads.keys[key];

/* ---------------- catalog ---------------- */
let CAT = null;
const courseById = new Map();
const chapByKey = new Map(); // "courseId:slug" -> {course, ch}
function indexCatalog() {
  for (const c of CAT.courses) {
    courseById.set(c.id, c);
    for (const ch of c.chapters) chapByKey.set(c.id + ':' + ch.slug, { course: c, ch });
  }
}
const keyOf = (courseId, slug) => courseId + ':' + slug;
function courseStats(course) {
  let done = 0, mins = 0, doneMins = 0;
  for (const ch of course.chapters) { mins += ch.minutes; if (isDone(keyOf(course.id, ch.slug))) { done++; doneMins += ch.minutes; } }
  return { done, total: course.chapters.length, mins, doneMins, pct: course.chapters.length ? (done / course.chapters.length) * 100 : 0 };
}
function sectionChapters(course, section) {
  const set = new Set(section.slugs);
  return course.chapters.filter((ch) => set.has(ch.slug));
}
function sectionStats(course, section) {
  const chs = sectionChapters(course, section);
  const done = chs.filter((ch) => isDone(keyOf(course.id, ch.slug))).length;
  return { done, total: chs.length, chs, pct: chs.length ? (done / chs.length) * 100 : 0 };
}
const courseIcon = (course, big) => course.icon
  ? `<span class="course-ico${big ? ' big' : ''}"><img src="${course.icon}" alt=""></span>`
  : `<span class="mono" style="background:${course.hue}">${esc(initials(course.title))}</span>`;
const initials = (title) => title.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

/* ---------------- theme & language ---------------- */
const mq = matchMedia('(prefers-color-scheme: dark)');
function applySettings() {
  const el = document.documentElement;
  const dark = settings.theme === 'dark' || (settings.theme === 'auto' && mq.matches);
  el.dataset.theme = dark ? 'dark' : 'light';
  el.dataset.themeMode = settings.theme;
  el.dataset.fontsize = String(settings.fontSize);
  el.dataset.density = settings.density;
  el.dataset.uisize = String(settings.uiSize == null ? 1 : settings.uiSize);
  el.lang = settings.lang;
  el.dir = settings.lang === 'en' ? 'ltr' : 'rtl';
}
mq.addEventListener?.('change', applySettings);

/* ---------------- toast & sheets ---------------- */
let toastTimer = null;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}
function openSheet(html) {
  const root = $('#sheet-root');
  root.innerHTML = `<div class="sheet-veil"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div></div>`;
  $('.sheet-veil', root).addEventListener('click', (e) => { if (e.target.classList.contains('sheet-veil')) closeSheet(); });
}
function closeSheet() { $('#sheet-root').innerHTML = ''; }
function confirmSheet({ title, body, confirmLabel, danger, onConfirm }) {
  openSheet(`<h3>${esc(title)}</h3><p class="sheet-sub">${esc(body)}</p>
    <div class="sheet-btns">
      <button type="button" class="btn-primary" id="sh-confirm" ${danger ? 'style="background:var(--red)"' : ''}>${esc(confirmLabel)}</button>
      <button type="button" class="btn-ghost" id="sh-cancel">${esc(T('cancel'))}</button>
    </div>`);
  $('#sh-cancel').onclick = closeSheet;
  $('#sh-confirm').onclick = () => { closeSheet(); onConfirm(); };
}

/* ---------------- chrome: tab bar / sidebar ---------------- */
const TABS = [
  { id: 'home', route: '#/', icon: 'home', iconOn: 'homeFill' },
  { id: 'library', route: '#/library', icon: 'books' },
  { id: 'progress', route: '#/progress', icon: 'chart' },
  { id: 'downloads', route: '#/downloads', icon: 'download' },
  { id: 'settings', route: '#/settings', icon: 'gear' },
];
let activeTab = 'home';
function renderChrome() {
  $('.tab-capsule').innerHTML = TABS.map((t) =>
    `<button type="button" role="tab" data-tab="${t.id}" class="${activeTab === t.id ? 'on' : ''}" aria-selected="${activeTab === t.id}">${activeTab === t.id && t.iconOn ? I[t.iconOn] : I[t.icon]}<span>${T(t.id)}</span></button>`).join('');
  $$('.tab-capsule [data-tab]').forEach((b) => b.onclick = () => { location.hash = TABS.find((t) => t.id === b.dataset.tab).route; });
  $('#search-btn').onclick = () => { location.hash = '#/search'; };
  $('#sidebar').innerHTML = `<div class="brand"><img src="icons/icon-192.png" alt=""><b>DevDocs</b></div>` +
    TABS.map((t) => `<button type="button" class="nav ${activeTab === t.id ? 'on' : ''}" data-tab="${t.id}">${I[t.icon]}<span>${T(t.id)}</span></button>`).join('') +
    `<button type="button" class="nav ${activeTab === 'search' ? 'on' : ''}" data-tab="search">${I.search}<span>${T('search')}</span></button>`;
  $$('#sidebar [data-tab]').forEach((b) => b.onclick = () => { location.hash = b.dataset.tab === 'search' ? '#/search' : TABS.find((t) => t.id === b.dataset.tab).route; });
}

/* ---------------- large-title header ---------------- */
let ltState = null; // {bar, wrap, h}
function headerHTML({ title, sub, back, latin }) {
  return `<header class="topbar">
    <div class="topbar-row">
      ${back ? `<button type="button" class="icon-btn" data-back aria-label="Back">${I.back}</button>` : '<span class="spacer"></span>'}
      <div class="topbar-title ${latin ? 'lat' : ''}">${esc(title)}</div>
      <span class="spacer"></span>
    </div>
    <div class="topbar-rule"></div>
  </header>
  <div class="lt-wrap"><h1 class="large-title ${latin ? 'lat' : ''}">${esc(title)}</h1>${sub ? `<p class="large-sub">${esc(sub)}</p>` : ''}</div>`;
}
let ltObserver = null;
function setupLargeTitle(backRoute) {
  const bar = $('.topbar');
  const backBtn = bar && $('[data-back]', bar);
  if (backBtn) backBtn.onclick = () => { location.hash = backRoute; };
  if (ltObserver) { ltObserver.disconnect(); ltObserver = null; }
  if (!bar) return;
  const wrap = $('.lt-wrap');
  if (!wrap) { bar.classList.add('collapsed'); return; }
  bar.classList.remove('collapsed');
  ltObserver = new IntersectionObserver((es) => {
    for (const e of es) bar.classList.toggle('collapsed', !e.isIntersecting);
  }, { rootMargin: '-54px 0px 0px 0px', threshold: 0 });
  ltObserver.observe(wrap);
}
function onScrollLT() {}

/* ---------------- shared view pieces ---------------- */
const ringSVG = (pct, size, width) => {
  const r = (size - width) / 2, c = 2 * Math.PI * r;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${width}"/><circle class="val" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${width}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(100, pct) / 100)}"/></svg>`;
};
function courseRow(course) {
  const st = courseStats(course);
  return `<a class="row course-row" href="#/course/${course.id}">
    ${courseIcon(course)}
    <span class="grow"><span class="ttl lat">${esc(course.title)}</span>
    <span class="sub">${num(course.sections.length)} ${T('sections')} · ${num(st.total)} ${T('chapters')} · ${num(st.mins)} ${T('min')}</span>
    <span class="bar"><i style="width:${st.pct}%;background:${course.hue}"></i></span></span>
    <span class="pct">${pctStr(st.pct)}</span><span class="chev">${I.chev}</span></a>`;
}
function dlBtnHTML(courseId, slug) {
  const on = isDownloaded(keyOf(courseId, slug));
  return `<button type="button" class="dl-btn ${on ? 'on' : ''}" data-dl="${esc(courseId)}:${esc(slug)}" aria-label="Download">${on ? I.check : I.download}</button>`;
}
async function refreshDlButtons() {
  $$('[data-dl]').forEach((b) => {
    const on = isDownloaded(b.dataset.dl);
    b.classList.toggle('on', on); b.innerHTML = on ? I.check : I.download;
  });
}

/* ---------------- views ---------------- */
const view = () => $('#view');
let docCleanup = null;

function vHome() {
  activeTab = 'home';
  let h = headerHTML({ title: 'DevDocs', sub: T('tagline'), latin: true });
  const last = progress.last && chapByKey.get(progress.last.key);
  if (last) {
    const { course, ch } = last;
    h += `<div class="section-label">${T('continueReading')}</div>
    <a class="continue-card" href="#/doc/${course.id}/${esc(ch.slug)}" style="border-inline-start:3px solid ${course.hue}">
      ${courseIcon(course)}
      <span class="grow"><span class="ttl lat">${esc(ch.title)}</span>
      <span class="sub lat">${esc(course.title)} · ${esc(ch.section)}</span>
      <span class="bar"><i style="width:${Math.round((progress.last.frac || 0) * 100)}%"></i></span></span>
      <span class="chev">${I.chev}</span></a>`;
  }
  const tot = CAT.courses.reduce((a, c) => { const s = courseStats(c); a.done += s.done; a.total += s.total; return a; }, { done: 0, total: 0 });
  const pct = tot.total ? (tot.done / tot.total) * 100 : 0;
  h += `<div class="section-label">${T('overall')}</div>
  <div class="group"><div class="row"><span class="ring-wrap">${ringSVG(pct, 46, 5)}</span>
    <span class="grow"><span class="ttl">${pctStr(pct)}</span>
    <span class="sub">${num(tot.done)} ${T('of')} ${num(tot.total)} ${T('chapters')} ${T('doneOf')}</span></span>
    <a class="chip" href="#/progress">${T('progress')}</a></div></div>`;
  h += `<div class="section-label">${T('courses')}</div><div class="group">${CAT.courses.map(courseRow).join('')}</div>`;
  const dlKeys = Object.keys(downloads.keys);
  if (dlKeys.length) {
    const totSize = dlKeys.reduce((a, k) => a + dlSize(k), 0);
    h += `<div class="section-label">${T('downloads')}</div>
    <div class="group"><a class="row" href="#/downloads">
      <span class="dl-summary-ic">${I.dlDone}</span>
      <span class="grow"><span class="ttl">${num(dlKeys.length)} ${T('chapters')}</span>
      <span class="sub">${T('totalSize')}: ${fmtSize(totSize)}</span></span>
      <span class="chev">${I.chev}</span></a></div>`;
  }
  view().innerHTML = h;
  setupLargeTitle();
}

function vLibrary() {
  activeTab = 'library';
  view().innerHTML = headerHTML({ title: T('library') }) +
    `<div class="group" style="margin-top:10px">${CAT.courses.map(courseRow).join('')}</div>`;
  setupLargeTitle();
}

function vCourse(courseId) {
  const course = courseById.get(courseId);
  if (!course) { location.hash = '#/library'; return; }
  activeTab = 'library';
  const st = courseStats(course);
  const dlCount = course.chapters.filter((ch) => isDownloaded(keyOf(course.id, ch.slug))).length;
  view().innerHTML = headerHTML({ title: course.title, sub: `${num(course.sections.length)} ${T('sections')} · ${num(st.total)} ${T('chapters')} · ${num(st.mins)} ${T('min')}`, back: true, latin: true }) + `
  <div class="group" style="margin-top:12px"><div class="row">
    <span class="ring-wrap">${ringSVG(st.pct, 46, 5)}</span>
    <span class="grow"><span class="ttl">${pctStr(st.pct)}</span>
    <span class="sub">${num(st.done)} ${T('of')} ${num(st.total)} ${T('chapters')} ${T('doneOf')}</span></span>
  </div>
  <div class="row">
    <span class="grow"><span class="ttl">${dlCount === st.total ? T('downloadedN') + ' ✓' : T('downloadAll')}</span>
    <span class="sub" data-dl-count="course:${course.id}">${num(dlCount)} ${T('of')} ${num(st.total)} ${T('chapters')}</span></span>
    ${dlCount ? `<button type="button" class="dl-btn" data-dl-remove-course="${course.id}" aria-label="Remove">${I.trash}</button>` : ''}
    <button type="button" class="dl-btn" data-dl-course="${course.id}" aria-label="Download">${I.download}</button>
  </div></div>
  <div class="section-label">${T('sections')}</div>
  <div class="group">${course.sections.map((sec, i) => {
    const ss = sectionStats(course, sec);
    const sdl = ss.chs.filter((ch) => isDownloaded(keyOf(course.id, ch.slug))).length;
    return `<a class="row" href="#/course/${course.id}/s/${i}">
      <span class="grow"><span class="ttl lat">${esc(sec.title)}</span>
      <span class="sub">${num(ss.done)}/${num(ss.total)} ${T('chapters')}${sdl ? ` · ${num(sdl)} ${T('downloadedN')}` : ''}</span>
      <span class="bar"><i style="width:${ss.pct}%"></i></span></span>
      <span class="pct">${pctStr(ss.pct)}</span><span class="chev">${I.chev}</span></a>`;
  }).join('')}</div>`;
  setupLargeTitle('#/library');
  $(`[data-dl-course="${course.id}"]`).onclick = (e) => downloadScope(course.chapters.map((ch) => keyOf(course.id, ch.slug)), e.currentTarget);
  const rm = $(`[data-dl-remove-course="${course.id}"]`);
  if (rm) rm.onclick = () => confirmSheet({ title: T('deleteDlT'), body: T('deleteDlB'), confirmLabel: T('delete'), danger: true, onConfirm: async () => { await removeDownloads(course.chapters.map((ch) => keyOf(course.id, ch.slug))); vCourse(courseId); } });
}

function vSection(courseId, idx) {
  const course = courseById.get(courseId);
  if (!course || !course.sections[idx]) { location.hash = '#/library'; return; }
  activeTab = 'library';
  const sec = course.sections[idx];
  const ss = sectionStats(course, sec);
  const groups = [];
  for (const ch of ss.chs) {
    const g = ch.group || '';
    if (!groups.length || groups[groups.length - 1].name !== g) groups.push({ name: g, items: [] });
    groups[groups.length - 1].items.push(ch);
  }
  const dlCount = ss.chs.filter((ch) => isDownloaded(keyOf(course.id, ch.slug))).length;
  let n = 0;
  view().innerHTML = headerHTML({ title: sec.title, sub: `${course.title} · ${num(ss.total)} ${T('chapters')}`, back: true, latin: true }) + `
  <div class="group" style="margin-top:12px"><div class="row">
    <span class="grow"><span class="ttl">${T('downloadAll')}</span>
    <span class="sub" data-dl-count="section:${course.id}:${idx}">${num(dlCount)} ${T('of')} ${num(ss.total)} ${T('chapters')} ${T('downloadedN')}</span></span>
    ${dlCount ? `<button type="button" class="dl-btn" data-dl-remove-sec aria-label="Remove">${I.trash}</button>` : ''}
    <button type="button" class="dl-btn" data-dl-sec aria-label="Download">${I.download}</button>
  </div></div>` +
  groups.map((g) => `${g.name ? `<div class="group-head"><span class="grow lat">${esc(g.name)}</span></div>` : '<div style="height:14px"></div>'}
    <div class="group">${g.items.map((ch) => { n++; const key = keyOf(course.id, ch.slug); return `<a class="row" href="#/doc/${course.id}/${esc(ch.slug)}">
      <span class="num-badge">${num(n)}</span>
      <span class="grow"><span class="ttl lat">${esc(ch.title)}</span>
      <span class="sub">${num(ch.minutes)} ${T('min')}</span></span>
      ${dlBtnHTML(course.id, ch.slug)}
      <span class="check-dot ${isDone(key) ? 'on' : ''}">${I.check}</span></a>`; }).join('')}</div>`).join('');
  setupLargeTitle('#/course/' + course.id);
  $('[data-dl-sec]').onclick = (e) => downloadScope(ss.chs.map((ch) => keyOf(course.id, ch.slug)), e.currentTarget);
  const rm = $('[data-dl-remove-sec]');
  if (rm) rm.onclick = () => confirmSheet({ title: T('deleteDlT'), body: T('deleteDlB'), confirmLabel: T('delete'), danger: true, onConfirm: async () => { await removeDownloads(ss.chs.map((ch) => keyOf(course.id, ch.slug))); vSection(courseId, idx); } });
  bindDlButtons();
}

function vProgress() {
  activeTab = 'progress';
  const tot = CAT.courses.reduce((a, c) => { const s = courseStats(c); a.done += s.done; a.total += s.total; a.mins += s.doneMins; return a; }, { done: 0, total: 0, mins: 0 });
  const pct = tot.total ? (tot.done / tot.total) * 100 : 0;
  view().innerHTML = headerHTML({ title: T('progress') }) + `
  <div class="group" style="margin-top:12px"><div class="row">
    <span class="ring-wrap">${ringSVG(pct, 58, 6)}</span>
    <span class="grow"><span class="ttl" style="font-size:19px">${pctStr(pct)}</span>
    <span class="sub">${num(tot.done)} ${T('of')} ${num(tot.total)} ${T('chapters')} · ${num(tot.mins)} ${T('min')} ${T('estTime')}</span></span>
  </div></div>` +
  CAT.courses.map((course) => {
    const st = courseStats(course);
    return `<div class="section-label lat">${esc(course.title)}</div>
    <div class="group"><div class="row">
      ${courseIcon(course)}
      <span class="grow"><span class="ttl">${pctStr(st.pct)}</span><span class="bar"><i style="width:${st.pct}%"></i></span>
      <span class="sub">${num(st.done)} ${T('of')} ${num(st.total)} ${T('chapters')}</span></span>
    </div>${course.sections.map((sec) => { const ss = sectionStats(course, sec); return `<div class="row" style="min-height:44px">
      <span class="grow"><span class="ttl lat" style="font-size:14.5px">${esc(sec.title)}</span>
      <span class="bar" style="margin-top:5px"><i style="width:${ss.pct}%"></i></span></span>
      <span class="pct">${num(ss.done)}/${num(ss.total)}</span></div>`; }).join('')}</div>`;
  }).join('');
  setupLargeTitle();
}

function segHTML(name, options, current, cls) {
  return `<span class="seg${cls ? ' ' + cls : ''}" data-seg="${name}">${options.map((o) => `<button type="button" data-val="${esc(o.v)}" class="${String(o.v) === String(current) ? 'on' : ''}">${esc(o.l)}</button>`).join('')}</span>`;
}
function vSettings() {
  activeTab = 'settings';
  const dlCount = Object.keys(downloads.keys).length;
  view().innerHTML = headerHTML({ title: T('settings') }) + `
  <div class="section-label">${T('appearance')}</div>
  <div class="group">
    <div class="set-row"><span class="lbl">${T('theme')}</span>${segHTML('theme', [{ v: 'auto', l: T('auto') }, { v: 'light', l: T('light') }, { v: 'dark', l: T('dark') }], settings.theme)}</div>
    <div class="set-row"><span class="lbl">${T('uiLang')}</span>${segHTML('lang', [{ v: 'fa', l: 'فارسی' }, { v: 'en', l: 'English' }], settings.lang)}</div>
    <div class="set-row"><span class="lbl">${T('uiFontSize')}</span>${segHTML('uiSize', T('uiFsNames').map((l, i) => ({ v: i, l })), settings.uiSize == null ? 1 : settings.uiSize)}</div>
  </div>
  <div class="section-label">${T('reading')}</div>
  <div class="group">
    <div class="set-row" style="flex-direction:column;align-items:stretch;gap:9px"><span class="lbl">${T('fontSize')}</span>${segHTML('fontSize', T('fsNames').map((l, i) => ({ v: i, l })), settings.fontSize, 'wrap')}</div>
    <div class="set-row"><span class="lbl">${T('density')}</span>${segHTML('density', [{ v: 'compact', l: T('compact') }, { v: 'comfortable', l: T('comfortable') }, { v: 'spacious', l: T('spacious') }], settings.density)}</div>
  </div>
  <div class="section-label">${T('offline')}</div>
  <div class="group">
    <div class="set-row"><span class="lbl">${T('downloadedChapters')}</span><span class="pct" id="dl-count" data-dl-count="all">${num(dlCount)}</span></div>
    <div class="set-row"><span class="lbl">${T('storageUsed')}</span><span class="pct" id="storage-est">…</span></div>
    <div class="set-row"><span class="lbl">${T('autoCache')}</span>${segHTML('autoCache', [{ v: '1', l: settings.lang === 'en' ? 'On' : 'روشن' }, { v: '0', l: settings.lang === 'en' ? 'Off' : 'خاموش' }], settings.autoCache ? '1' : '0')}</div>
    <button type="button" class="row btn-danger" id="del-downloads" style="justify-content:center">${T('deleteAllDownloads')}</button>
  </div>
  <div class="section-label">${T('appSec')}</div>
  <div class="group">
    <div class="set-row"><span class="lbl">${T('version')}</span><span class="pct lat">${APP_VERSION}</span></div>
    <button type="button" class="row" id="check-update"><span class="grow"><span class="ttl">${T('checkUpdate')}</span></span><span class="chev">${I.chev}</span></button>
    <a class="row" href="#/changelog"><span class="grow"><span class="ttl">${T('changelog')}</span></span><span class="chev">${I.chev}</span></a>
    <button type="button" class="row" id="sw-reset"><span class="grow"><span class="ttl">${T('swReset')}</span></span><span class="chev">${I.chev}</span></button>
    ${deferredInstall ? `<button type="button" class="row" id="install-app"><span class="grow"><span class="ttl">${T('installApp')}</span></span><span class="chev">${I.chev}</span></button>` : ''}
  </div>
  <p class="set-note" style="margin-top:2px">${T('swResetNote')}</p>
  <div class="section-label">${T('dataSec')}</div>
  <div class="group">
    <button type="button" class="row btn-danger" id="reset-progress" style="justify-content:center">${T('resetProgress')}</button>
  </div>
  <div style="height:18px"></div>`;
  setupLargeTitle();
  $$('.seg').forEach((seg) => $$('button', seg).forEach((b) => b.onclick = () => {
    const name = seg.dataset.seg, val = b.dataset.val;
    if (name === 'theme') settings.theme = val;
    else if (name === 'lang') { settings.lang = val; saveSettings(); applySettings(); renderChrome(); vSettings(); window.scrollTo(0, 0); return; }
    else if (name === 'fontSize') settings.fontSize = Number(val);
    else if (name === 'uiSize') settings.uiSize = Number(val);
    else if (name === 'density') settings.density = val;
    else if (name === 'autoCache') settings.autoCache = val === '1';
    saveSettings(); applySettings();
    $$('button', seg).forEach((x) => x.classList.toggle('on', x === b));
  }));
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then((e) => { const el = $('#storage-est'); if (el) el.textContent = e.usage ? (e.usage / 1048576).toFixed(1) + ' MB' : '—'; }).catch(() => {});
  }
  $('#del-downloads').onclick = () => confirmSheet({ title: T('deleteDlT'), body: T('deleteDlB'), confirmLabel: T('delete'), danger: true, onConfirm: async () => { await removeDownloads(Object.keys(downloads.keys)); vSettings(); } });
  $('#reset-progress').onclick = () => confirmSheet({ title: T('resetConfirmT'), body: T('resetConfirmB'), confirmLabel: T('reset'), danger: true, onConfirm: () => { progress = { done: {}, last: null }; saveProgress(); toast('✓'); vSettings(); } });
  $('#check-update').onclick = (e) => checkForUpdate(true, e.currentTarget);
  $('#sw-reset').onclick = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== OFFLINE_CACHE).map((n) => caches.delete(n)));
    } catch {}
    location.reload();
  };
  const inst = $('#install-app');
  if (inst) inst.onclick = async () => { if (deferredInstall) { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; vSettings(); } };
}

/* ---------------- offline downloads ---------------- */
const OFFLINE_CACHE = 'devdocs-offline-v1';
async function downloadChapter(key) {
  const entry = chapByKey.get(key);
  if (!entry) throw new Error('no chapter');
  const cache = await caches.open(OFFLINE_CACHE);
  const url = new URL(entry.ch.file, location.href).href;
  const res = await fetch(entry.ch.file);
  if (!res.ok) throw new Error('fetch failed');
  const text = await res.text();
  let size = new Blob([text]).size;
  await cache.put(url, new Response(text, { headers: { 'Content-Type': 'text/html' } }));
  const imgs = [...text.matchAll(/src="((?:assets|fonts)\/[^"]+)"/g)].map((m) => m[1]);
  await Promise.all([...new Set(imgs)].map(async (src) => {
    try {
      const r = await fetch(src); if (!r.ok) return;
      const b = await r.blob(); size += b.size;
      await cache.put(new URL(src, location.href).href, new Response(b, { headers: { 'Content-Type': r.headers.get('Content-Type') || 'application/octet-stream' } }));
    } catch {}
  }));
  return size;
}
function updateDlChrome() {
  $$('[data-dl-count]').forEach((el) => {
    const [kind, a, b] = el.dataset.dlCount.split(':');
    if (kind === 'all') el.textContent = num(Object.keys(downloads.keys).length);
    else if (kind === 'course') {
      const c = courseById.get(a);
      if (c) el.textContent = `${num(c.chapters.filter((ch) => isDownloaded(keyOf(c.id, ch.slug))).length)} ${T('of')} ${num(c.chapters.length)} ${T('chapters')}`;
    } else if (kind === 'section') {
      const c = courseById.get(a);
      if (c && c.sections[+b]) {
        const ss = sectionStats(c, c.sections[+b]);
        el.textContent = `${num(ss.chs.filter((ch) => isDownloaded(keyOf(c.id, ch.slug))).length)} ${T('of')} ${num(ss.total)} ${T('chapters')} ${T('downloadedN')}`;
      }
    }
  });
  refreshDlButtons();
}
/* Background download queue: bulk downloads keep running while the user
   navigates, with a floating progress pill and pause/resume. */
let dlQueue = null; // { todo, idx, done, failed, paused, running, btns:Set }
async function ensureSearchIndexCached(courseId) {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const url = new URL('data/search-' + courseId + '.json', location.href).href;
    if (await cache.match(url)) return;
    const r = await fetch('data/search-' + courseId + '.json');
    if (r.ok) await cache.put(url, r);
  } catch {}
}
function queuePill() {
  let pill = $('#dl-queue');
  if (!dlQueue) { if (pill) pill.remove(); return; }
  if (!pill) {
    pill = document.createElement('div');
    pill.id = 'dl-queue';
    pill.innerHTML = `<span class="q-ic">${I.download}</span><span class="q-txt"></span><span class="q-bar"><i></i></span><button type="button" class="q-btn" aria-label="pause"></button>`;
    document.body.appendChild(pill);
    pill.querySelector('.q-btn').onclick = () => { dlQueue.paused = !dlQueue.paused; queuePill(); };
  }
  const q = dlQueue;
  pill.querySelector('.q-txt').textContent = `${T('dlQueue')}: ${num(q.done)} ${T('dlOf')} ${num(q.total)}`;
  pill.querySelector('.q-bar i').style.width = (q.total ? Math.round((q.done / q.total) * 100) : 0) + '%';
  pill.querySelector('.q-btn').innerHTML = q.paused ? I.play : I.pause;
  pill.classList.toggle('paused', q.paused);
}
async function downloadScope(keys, btn) {
  const fresh = keys.filter((k) => !isDownloaded(k) && !(dlQueue && dlQueue.todo.includes(k)));
  if (!fresh.length && !dlQueue) { toast(T('dlDoneToast')); return; }
  if (!dlQueue) dlQueue = { todo: [], idx: 0, done: 0, failed: 0, total: 0, paused: false, running: false, btns: new Set(), courses: new Set() };
  const q = dlQueue;
  for (const k of fresh) { q.todo.push(k); q.total++; q.courses.add(k.split(':')[0]); }
  if (btn) { q.btns.add(btn); btn.classList.add('busy'); }
  queuePill();
  if (q.running) return;
  q.running = true;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function worker() {
    while (q.idx < q.todo.length) {
      while (q.paused) await sleep(350);
      const k = q.todo[q.idx++];
      try { const size = await downloadChapter(k); downloads.keys[k] = { at: Date.now(), size }; saveDownloads(); q.done++; }
      catch { q.failed++; q.done++; }
      updateDlChrome(); queuePill();
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  const failed = q.failed, courses = [...q.courses];
  q.btns.forEach((b) => b.classList.remove('busy'));
  dlQueue = null; queuePill();
  courses.forEach((c) => ensureSearchIndexCached(c));
  toast(failed ? T('dlError') : T('dlDoneToast'));
  const y = window.scrollY; router(); window.scrollTo(0, y);
}
async function removeDownloads(keys) {
  const cacheNames = await caches.keys();
  for (const k of keys) {
    const entry = chapByKey.get(k);
    if (entry) {
      const url = new URL(entry.ch.file, location.href).href;
      let imgs = [];
      try {
        const oc = await caches.open(OFFLINE_CACHE);
        const res = await oc.match(url);
        if (res) { const t = await res.text(); imgs = [...t.matchAll(/src="((?:assets)\/[^"]+)"/g)].map((m) => new URL(m[1], location.href).href); }
      } catch {}
      for (const name of cacheNames) {
        try { const c = await caches.open(name); await c.delete(url); for (const iu of imgs) await c.delete(iu); } catch {}
      }
    }
    delete downloads.keys[k];
  }
  if (!Object.keys(downloads.keys).length) { try { await caches.delete(OFFLINE_CACHE); } catch {} }
  saveDownloads();
  toast(T('dlRemoved'));
}
function bindDlButtons() {
  $$('[data-dl]').forEach((b) => b.onclick = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const key = b.dataset.dl;
    if (isDownloaded(key)) { await removeDownloads([key]); }
    else {
      b.classList.add('busy');
      try { const size = await downloadChapter(key); downloads.keys[key] = { at: Date.now(), size }; saveDownloads(); ensureSearchIndexCached(key.split(':')[0]); toast(T('dlDoneToast')); }
      catch { toast(T('dlError')); }
      b.classList.remove('busy');
    }
    refreshDlButtons();
    const y = window.scrollY; router(); window.scrollTo(0, y);
  });
}

/* ---------------- full-text search ---------------- */
let searchIndex = null;
async function loadSearchIndex() {
  if (searchIndex) return searchIndex;
  searchIndex = {};
  await Promise.all(CAT.courses.map(async (c) => {
    try { searchIndex[c.id] = await (await fetch('data/search-' + c.id + '.json')).json(); }
    catch { searchIndex[c.id] = {}; }
  }));
  return searchIndex;
}
function highlight(text, tokens) {
  let out = esc(text);
  for (const tok of tokens) {
    if (!tok) continue;
    const idx = out.toLowerCase().indexOf(tok.toLowerCase());
    if (idx >= 0) out = out.slice(0, idx) + '<mark>' + out.slice(idx, idx + tok.length) + '</mark>' + out.slice(idx + tok.length);
  }
  return out;
}
function vSearch() {
  activeTab = 'search';
  const last = progress.last && chapByKey.get(progress.last.key);
  const stories = [];
  for (const c of CAT.courses) stories.push({ img: c.icon, label: c.title, hue: c.hue, href: '#/course/' + c.id });
  if (last) stories.push({ label: last.ch.title, sub: T('lastRead'), initials: initials(last.ch.title), hue: last.course.hue, href: `#/doc/${last.course.id}/${esc(last.ch.slug)}` });
  view().innerHTML = headerHTML({ title: T('search'), back: true }) + `
  <div class="search-box">${I.search}<input id="search-input" type="search" placeholder="${esc(T('searchPh'))}" autocomplete="off"></div>
  <div class="section-label">${T('allCourses')}</div>
  <div class="story-row">${stories.map((st) => `
    <a class="story" href="${st.href}">
      <span class="story-ring"><span class="story-ava" style="background:${st.img ? '#fff' : st.hue}">${st.img ? `<img src="${st.img}" alt="">` : esc(st.initials || initials(st.label))}</span></span>
      <span class="story-lbl lat">${esc(st.label)}</span>
    </a>`).join('')}</div>
  <div id="search-results" style="margin-top:6px"></div>`;
  setupLargeTitle('#/');
  const input = $('#search-input');
  input.focus();
  let timer = null, seq = 0;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => doSearch(input.value.trim(), ++seq), 240);
  });
  const tgRow = ({ course, ch }, titleHtml, snippetHtml) => `
    <a class="tg-row" href="#/doc/${course.id}/${esc(ch.slug)}">
      <span class="tg-ava" style="background:${course.hue}">${course.icon ? `<img src="${course.icon}" alt="">` : esc(initials(course.title))}</span>
      <span class="grow"><span class="ttl lat">${titleHtml}</span>
      ${snippetHtml ? `<span class="tg-snippet">${snippetHtml}</span>` : ''}
      <span class="sub lat">${esc(course.title)} · ${esc(ch.section)} · ${num(ch.minutes)} ${T('min')}</span></span>
      <span class="chev">${I.chev}</span></a>`;
  async function doSearch(q, mySeq) {
    const box = $('#search-results');
    if (!box) return;
    if (q.length < 2) { box.innerHTML = ''; return; }
    box.innerHTML = `<div class="empty">${T('searching')}</div>`;
    const idx = await loadSearchIndex();
    if (mySeq !== seq || !$('#search-results')) return;
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    const titleHits = [], contentHits = [];
    for (const course of CAT.courses) {
      for (const ch of course.chapters) {
        const lt = ch.title.toLowerCase();
        if (tokens.every((t) => lt.includes(t))) titleHits.push({ course, ch });
      }
      const texts = idx[course.id] || {};
      for (const ch of course.chapters) {
        if (titleHits.some((h) => h.ch === ch)) continue;
        const text = texts[ch.slug] || '';
        const ltext = text.toLowerCase();
        if (!tokens.every((t) => ltext.includes(t))) continue;
        const pos = ltext.indexOf(tokens[0]);
        const start = Math.max(0, pos - 70);
        const snippet = (start ? '…' : '') + text.slice(start, pos + tokens[0].length + 90) + '…';
        contentHits.push({ course, ch, snippet });
        if (contentHits.length >= 40) break;
      }
    }
    if (!titleHits.length && !contentHits.length) { box.innerHTML = `<div class="empty">${T('noResults')}</div>`; return; }
    box.innerHTML =
      (titleHits.length ? `<div class="section-label">${T('titleHits')} · ${num(titleHits.length)}</div><div class="tg-list">${titleHits.map((h) => tgRow(h, highlight(h.ch.title, tokens), '')).join('')}</div>` : '') +
      (contentHits.length ? `<div class="section-label">${T('contentHits')} · ${num(contentHits.length)}</div><div class="tg-list">${contentHits.map((h) => tgRow(h, esc(h.ch.title), highlight(h.snippet, tokens))).join('')}</div>` : '');
  }
}

/* ---------------- ZIP (store + deflate-read) ---------------- */
const CRC_TABLE = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
function crc32(buf) { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function makeZipBlob(files) {
  const enc = new TextEncoder();
  const chunks = [], central = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name);
    const data = f.data instanceof Uint8Array ? f.data : new Uint8Array(f.data);
    const crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(6, 0x0800, true);
    local.setUint16(8, 0, true); local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true); local.setUint32(22, data.length, true); local.setUint16(26, name.length, true);
    chunks.push(new Uint8Array(local.buffer), name, data);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true);
    cen.setUint16(10, 0, true); cen.setUint32(16, crc, true);
    cen.setUint32(20, data.length, true); cen.setUint32(24, data.length, true); cen.setUint16(28, name.length, true);
    cen.setUint32(42, offset, true);
    central.push(new Uint8Array(cen.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const cenSize = central.reduce((a, c) => a + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cenSize, true); end.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
}
async function unzipToMap(buf) {
  const u8 = new Uint8Array(buf);
  const dv = new DataView(buf);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
  if (eocd < 0) throw new Error('eocd');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const out = new Map();
  const dec = new TextDecoder();
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const lhofs = dv.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nameLen));
    const lnameLen = dv.getUint16(lhofs + 26, true);
    const lextraLen = dv.getUint16(lhofs + 28, true);
    const start = lhofs + 30 + lnameLen + lextraLen;
    const comp = u8.subarray(start, start + csize);
    if (method === 0) out.set(name, new Uint8Array(comp));
    else if (method === 8 && 'DecompressionStream' in window) {
      const stream = new Blob([comp]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      out.set(name, new Uint8Array(await new Response(stream).arrayBuffer()));
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

/* ---------------- downloads manager ---------------- */
let dlSelectMode = false;
const dlSelected = new Set();
function vDownloads() {
  activeTab = 'downloads';
  const keys = Object.keys(downloads.keys).filter((k) => chapByKey.has(k));
  const totSize = keys.reduce((a, k) => a + dlSize(k), 0);
  const byCourse = CAT.courses.map((c) => ({ course: c, items: keys.filter((k) => k.startsWith(c.id + ':')).map((k) => ({ key: k, ch: chapByKey.get(k).ch })) })).filter((g) => g.items.length);
  view().innerHTML = headerHTML({ title: T('downloads'), sub: `${num(keys.length)} ${T('chapters')} · ${fmtSize(totSize)}` }) + `
  <div class="group" style="margin-top:12px">
    <button type="button" class="row" id="dl-export"><span class="row-ic">${I.share}</span><span class="grow"><span class="ttl">${T('exportZip')}</span></span><span class="chev">${I.chev}</span></button>
    <button type="button" class="row" id="dl-import"><span class="row-ic">${I.upload}</span><span class="grow"><span class="ttl">${T('importZip')}</span></span><span class="chev">${I.chev}</span></button>
    <button type="button" class="row" id="dl-select"><span class="row-ic">${I.list}</span><span class="grow"><span class="ttl">${dlSelectMode ? T('cancelSel') : T('select')}</span></span><span class="chev">${I.chev}</span></button>
    ${keys.length ? `<button type="button" class="row" id="dl-verify"><span class="row-ic">${I.refresh}</span><span class="grow"><span class="ttl">${T('verifyDl')}</span></span><span class="chev">${I.chev}</span></button>` : ''}
    ${keys.length ? `<button type="button" class="row btn-danger" id="dl-delete-all" style="justify-content:center">${T('deleteAllDownloads')}</button>` : ''}
  </div>
  <input type="file" id="dl-file" accept=".zip,application/zip" hidden>
  ${dlSelectMode && dlSelected.size ? `<button type="button" class="btn-primary" id="dl-delete-sel" style="margin-top:14px;background:var(--red)">${I.trash}<span>${T('deleteSelected')} · ${num(dlSelected.size)}</span></button>` : ''}
  ${!keys.length ? `<div class="empty">${T('noDownloads')}</div>` : byCourse.map(({ course, items }) => `
    <div class="section-label" style="display:flex;align-items:center;gap:8px">${courseIcon(course)}<span class="lat">${esc(course.title)}</span></div>
    <div class="group">${items.map(({ key, ch }) => `
      <div class="row dl-row" data-key="${esc(key)}">
        ${dlSelectMode ? `<span class="sel-dot ${dlSelected.has(key) ? 'on' : ''}">${I.check}</span>` : ''}
        <span class="grow"><span class="ttl lat">${esc(ch.title)}</span>
        <span class="sub lat">${esc(ch.section)} · ${fmtSize(dlSize(key))}</span></span>
        ${dlSelectMode ? '' : `<a class="dl-btn" href="#/doc/${course.id}/${esc(ch.slug)}" aria-label="Open">${I.chev}</a>
        <button type="button" class="dl-btn danger" data-del-one="${esc(key)}" aria-label="Delete">${I.trash}</button>`}
      </div>`).join('')}</div>`).join('')}`;
  setupLargeTitle();
  $('#dl-export').onclick = exportDownloadsZip;
  const vBtn = $('#dl-verify');
  if (vBtn) vBtn.onclick = async () => {
    vBtn.classList.add('busy');
    const broken = await verifyDownloads();
    vBtn.classList.remove('busy');
    if (!broken.length) { toast('✓ ' + T('verifyOk')); return; }
    openSheet(`<h3>${T('verifyDl')}</h3><p class="sheet-sub">${num(broken.length)} ${T('verifyBad')}</p><p class="sheet-sub">${T('verifyNote')}</p>
    <div class="sheet-btns"><button type="button" class="btn-primary" id="dl-repair">${T('repair')}</button>
    <button type="button" class="btn-ghost" id="dl-repair-x">${T('cancel')}</button></div>`);
    $('#dl-repair-x').onclick = closeSheet;
    $('#dl-repair').onclick = async (e) => {
      const b = e.currentTarget; b.classList.add('busy'); b.textContent = T('repairing');
      for (const k of broken) {
        try { const size = await downloadChapter(k); downloads.keys[k] = { at: Date.now(), size }; } catch {}
      }
      saveDownloads();
      closeSheet(); toast('✓ ' + T('repaired')); vDownloads();
    };
  };
  const fileInput = $('#dl-file');
  $('#dl-import').onclick = () => fileInput.click();
  fileInput.onchange = async () => { if (fileInput.files[0]) { try { await importDownloadsZip(fileInput.files[0]); } catch { toast(T('importError')); } vDownloads(); } };
  $('#dl-select').onclick = () => { dlSelectMode = !dlSelectMode; dlSelected.clear(); vDownloads(); };
  const delAll = $('#dl-delete-all');
  if (delAll) delAll.onclick = () => confirmSheet({ title: T('deleteDlT'), body: T('deleteDlB'), confirmLabel: T('delete'), danger: true, onConfirm: async () => { await removeDownloads(Object.keys(downloads.keys)); dlSelectMode = false; vDownloads(); } });
  const delSel = $('#dl-delete-sel');
  if (delSel) delSel.onclick = () => confirmSheet({ title: T('deleteDlT'), body: T('deleteDlB'), confirmLabel: T('delete'), danger: true, onConfirm: async () => { await removeDownloads([...dlSelected]); dlSelected.clear(); dlSelectMode = false; vDownloads(); } });
  $$('[data-del-one]').forEach((b) => b.onclick = async () => { await removeDownloads([b.dataset.delOne]); vDownloads(); });
  if (dlSelectMode) $$('.dl-row').forEach((r) => r.onclick = () => {
    const k = r.dataset.key;
    dlSelected.has(k) ? dlSelected.delete(k) : dlSelected.add(k);
    vDownloads();
  });
  // backfill unknown sizes from the offline cache, then refresh quietly
  const missing = keys.filter((k) => !dlSize(k));
  if (missing.length) (async () => {
    try {
      const cache = await caches.open(OFFLINE_CACHE);
      let changed = false;
      for (const k of missing) {
        const e = chapByKey.get(k); if (!e) continue;
        const res = await cache.match(new URL(e.ch.file, location.href).href);
        if (res) { const b = await res.blob(); downloads.keys[k].size = b.size; changed = true; }
      }
      if (changed) { saveDownloads(); if (location.hash === '#/downloads' && !dlSelectMode) vDownloads(); }
    } catch {}
  })();
}
async function verifyDownloads() {
  const keys = Object.keys(downloads.keys).filter((k) => chapByKey.has(k));
  const cache = await caches.open(OFFLINE_CACHE);
  const broken = [];
  for (const k of keys) {
    const e = chapByKey.get(k);
    const res = await cache.match(new URL(e.ch.file, location.href).href);
    if (!res) { broken.push(k); continue; }
    const text = await res.text();
    const imgs = [...new Set([...text.matchAll(/src="((?:assets)\/[^"]+)"/g)].map((m) => m[1]))];
    let bad = false;
    for (const src of imgs) { if (!(await cache.match(new URL(src, location.href).href))) { bad = true; break; } }
    if (bad) broken.push(k);
  }
  return broken;
}
async function exportDownloadsZip() {
  const keys = Object.keys(downloads.keys).filter((k) => chapByKey.has(k));
  if (!keys.length) { toast(T('noDownloads')); return; }
  const cache = await caches.open(OFFLINE_CACHE);
  const files = [], items = [];
  for (const key of keys) {
    const e = chapByKey.get(key);
    const res = await cache.match(new URL(e.ch.file, location.href).href);
    if (!res) continue;
    const text = await res.text();
    const zipPath = 'chapters/' + e.ch.file.split('/').pop();
    files.push({ name: zipPath, data: new TextEncoder().encode(text) });
    const imgs = [...new Set([...text.matchAll(/src="((?:assets)\/[^"]+)"/g)].map((m) => m[1]))];
    const imgList = [];
    for (const src of imgs) {
      const ir = await cache.match(new URL(src, location.href).href);
      if (ir) { files.push({ name: src, data: new Uint8Array(await ir.arrayBuffer()) }); imgList.push(src); }
    }
    items.push({ key, file: zipPath, images: imgList });
  }
  files.push({ name: 'manifest.json', data: new TextEncoder().encode(JSON.stringify({ app: 'devdocs', kind: 'downloads', version: 1, items })) });
  const blob = makeZipBlob(files);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'devdocs-downloads.zip';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(T('exported'));
}
async function importDownloadsZip(file) {
  const entries = await unzipToMap(await file.arrayBuffer());
  const man = entries.get('manifest.json');
  if (!man) throw new Error('manifest');
  const items = JSON.parse(new TextDecoder().decode(man)).items || [];
  const cache = await caches.open(OFFLINE_CACHE);
  let n = 0;
  for (const it of items) {
    const e = chapByKey.get(it.key);
    const data = entries.get(it.file);
    if (!e || !data) continue;
    await cache.put(new URL(e.ch.file, location.href).href, new Response(data.slice().buffer, { headers: { 'Content-Type': 'text/html' } }));
    let size = data.byteLength;
    for (const src of it.images || []) {
      const d = entries.get(src);
      if (d) { await cache.put(new URL(src, location.href).href, new Response(d.slice().buffer)); size += d.byteLength; }
    }
    downloads.keys[it.key] = { at: Date.now(), size };
    n++;
  }
  saveDownloads();
  toast(`${T('imported')} · ${num(n)}`);
}

/* ---------------- changelog ---------------- */
const CHANGELOG = [
  { v: '2.3.0', fa: ['دوره Prisma ORM 7 کامل شد: ۱۷ صفحه «شروع» و کوییک‌استارت همه دیتابیس‌ها اضافه شد', 'دوره جدید Prisma ORM 8 با ۵۸ فصل اضافه شد', 'لینک‌های داخل متن که به صفحات همین داک اشاره می‌کنند حالا داخل خود اپ باز می‌شوند (بین نسخه‌های ۷ و ۸ هم کار می‌کند)'], en: ['Prisma ORM 7 is now complete: 17 getting-started and per-database quickstart pages added', 'New course: Prisma ORM 8 with 58 chapters', 'In-text links to pages of the same docs now open inside the app (works across the 7 and 8 courses too)'] },
  { v: '2.2.0', fa: ['حالت تمرکز در صفحه مطلب: پاراگراف‌های اطراف کم‌نور می‌شوند', 'بررسی سلامت دانلودها و تعمیر فایل‌های ناقص از صفحه دانلودها', 'کش خودکار فصل‌های خوانده‌شده (از تنظیمات، بخش آفلاین)', 'صف دانلود در پس‌زمینه با نوار پیشرفت و دکمه مکث/ادامه', 'دانلودها همراه تصاویر فصل کامل می‌شوند و ایندکس جستجوی هر دوره هم آفلاین ذخیره می‌شود تا جستجو بدون اینترنت کار کند', 'جشن کانفتی وقتی یک دوره کامل تمام می‌شود'], en: ['Focus mode in chapters: surrounding paragraphs dim', 'Verify downloads and repair incomplete files from the Downloads page', 'Auto-cache chapters you read (Settings → Offline)', 'Background download queue with a progress pill and pause/resume', 'Downloads include chapter images, and each course search index is stored offline too', 'Confetti celebration when you finish a whole course'] },
  { v: '2.1.0', fa: ['دوره کامل TypeORM اضافه شد (۷۵ فصل)', 'صفحه «دانلودها» با حذف تکی، انتخابی و کلی + خروجی و ورودی ZIP', 'جستجو به سبک تلگرام: دوره‌ها دایره‌ای بالا، نتایج متنی پایین', 'آیکون واقعی هر دوره (NestJS، Prisma، TypeORM) نمایش داده می‌شود', 'خواندن صوتی (TTS) حذف شد', 'اندازه فونت رابط کاربری اضافه شد', 'صفحه «لیست تغییرات» در تنظیمات', 'دکمه حذف سرویس‌ورکر و بارگذاری مجدد در تنظیمات', 'بررسی به‌روزرسانی: وقتی برنامه به‌روز است دیگر مودال نمی‌آید', 'کدهای ترمینال رنگی شدند و تگ‌های اضافی در داک Prisma اصلاح شد', 'رفع مشکل کم‌نشدن حجم بعد از حذف دانلودها و سریع‌شدن شمارنده دانلود', 'ترنزیشن عنوان بزرگ نرم‌تر شد؛ توست تیره اصلاح شد؛ منوی بالای مطلب ثابت شد'], en: ['Complete TypeORM course added (75 chapters)', 'Downloads page with single, selective and delete-all, plus ZIP export/import', 'Telegram-style search: course stories on top, text results below', 'Real course logos (NestJS, Prisma, TypeORM)', 'Text-to-speech removed', 'Interface font size setting added', 'Changelog page in Settings', 'Remove-service-worker & reload button in Settings', 'Update check no longer shows the modal when up to date', 'Colored terminal code blocks; stray tags in Prisma docs fixed', 'Storage now actually frees up after deleting downloads; faster download counters', 'Smoother large-title transition; dark toast fixed; doc toolbar pinned'] },
  { v: '2.0.3', fa: ['به‌روزرسانی‌ها فوری اعمال می‌شوند: پوسته اپ در هر بار اجرا از شبکه تازه می‌شود'], en: ['Updates apply instantly: the app shell refreshes from the network on every load'] },
  { v: '2.0.2', fa: ['اعمال مطمئن‌تر به‌روزرسانی با دکمه آپدیت (رفرش پوسته)', 'رفع چند اشکال نمایشی نسخه قبل'], en: ['More reliable in-app updates (shell refresh)', 'Display fixes from the previous release'] },
  { v: '2.0.1', fa: ['گروه‌بندی فصل‌ها داخل بخش‌ها نمایش داده می‌شود (Queries، Deployment و…)', 'عنوان فصل هنگام اسکرول در نوار بالا می‌ماند و نوار ابزار زیر آن قرار می‌گیرد'], en: ['Chapter groups are shown inside sections (Queries, Deployment, …)', 'The chapter title stays visible in the top bar while scrolling, with the toolbar below it'] },
  { v: '2.0.0', fa: ['تبدیل به خواننده مستندات چنددوره‌ای: NestJS کامل + Prisma ORM 7 کامل (۳۱۸ فصل)', 'جستجوی متن کامل، کتابخانه درختی، دانلود آفلاین انتخابی', 'رابط دوزبانه فارسی/English، فونت Manrope، مودال به‌روزرسانی داخل اپ', 'ترجمه فارسی متن‌ها و خواندن صوتی انگلیسی'], en: ['Multi-course reader: full NestJS + full Prisma ORM 7 (318 chapters)', 'Full-text search, tree library, selective offline downloads', 'Bilingual FA/EN interface, Manrope font, in-app update modal', 'Persian translation of texts and English text-to-speech'] },
  { v: '1.0.0', fa: ['انتشار اول: مستندات کامل NestJS (۱۷۰ فصل) با ردیاب پیشرفت مطالعه و حالت آفلاین'], en: ['First release: complete NestJS documentation (170 chapters) with study progress tracking and offline mode'] },
];
function vChangelog() {
  activeTab = 'settings';
  view().innerHTML = headerHTML({ title: T('changelog'), back: true }) +
    CHANGELOG.map((rel) => `
    <div class="section-label" style="margin-top:18px"><span class="ver-badge lat">v${rel.v}</span>${rel.v === APP_VERSION ? ` <span class="chip">${settings.lang === 'en' ? 'Current' : 'نسخه کنونی'}</span>` : ''}</div>
    <div class="group"><ul class="changelog-list">${(settings.lang === 'en' ? rel.en : rel.fa).map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>`).join('') +
    '<div style="height:16px"></div>';
  setupLargeTitle('#/settings');
}

/* ---------------- app updates ---------------- */
let swReg = null, deferredInstall = null, updatePromptShown = false;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; });
async function fetchVersion() {
  const r = await fetch('version.json', { cache: 'no-store' });
  if (!r.ok) throw new Error('version');
  return r.json();
}
async function checkForUpdate(manual) {
  let remote = null;
  try { remote = await fetchVersion(); } catch { remote = null; }
  if (remote && remote.version !== APP_VERSION) { promptUpdate(remote.notes); return true; }
  if (swReg) { try { await swReg.update(); } catch {} }
  // A waiting worker with no newer version.json is not an app update; the
  // worker refreshes silently in the background instead of prompting.
  if (manual) toast(T('upToDate'));
  else if (!remote && swReg && swReg.waiting && navigator.serviceWorker.controller) promptUpdate(null);
  return false;
}
function promptUpdate(notes) {
  if (updatePromptShown) return;
  updatePromptShown = true;
  const list = (notes && (notes[settings.lang] || notes.en)) || [];
  openSheet(`<div class="upd-ic" style="text-align:center;color:var(--accent)"><span style="display:inline-flex;width:34px;height:34px">${I.refresh}</span></div>
    <h3 style="text-align:center">${esc(T('updateTitle'))}</h3>
    ${list.length ? `<p class="sheet-sub" style="margin-bottom:4px">${esc(T('updateNotesT'))}</p><ul class="notes">${list.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    <div class="sheet-btns">
      <button type="button" class="btn-primary" id="upd-now">${esc(T('updateNow'))}</button>
      <button type="button" class="btn-ghost" id="upd-later">${esc(T('later'))}</button>
    </div><div class="ver">v${APP_VERSION}</div>`);
  $('#upd-later').onclick = () => { closeSheet(); updatePromptShown = false; };
  $('#upd-now').onclick = async () => {
    closeSheet();
    if (swReg) { try { await swReg.update(); } catch {} }
    if (swReg && swReg.waiting) { swReg.waiting.postMessage({ type: 'SKIP_WAITING' }); setTimeout(() => location.reload(), 2500); return; }
    // No waiting worker yet (the worker script itself is still HTTP-cached):
    // ask the active worker to refetch the shell from the network, then reload.
    const ctrl = navigator.serviceWorker && navigator.serviceWorker.controller;
    if (ctrl) {
      let done = false;
      const onMsg = (e) => { if (e.data && e.data.type === 'SHELL_UPDATED' && !done) { done = true; navigator.serviceWorker.removeEventListener('message', onMsg); location.reload(); } };
      navigator.serviceWorker.addEventListener('message', onMsg);
      ctrl.postMessage({ type: 'UPDATE_SHELL' });
      setTimeout(() => { if (!done) { done = true; location.reload(); } }, 6000);
    } else location.reload();
  };
}
async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    swReg = await navigator.serviceWorker.register('sw.js');
    if (swReg.waiting && navigator.serviceWorker.controller) checkForUpdate(false);
    swReg.addEventListener('updatefound', () => {
      const nw = swReg.installing;
      if (nw) nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) checkForUpdate(false); });
    });
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
  } catch {}
}

/* ---------------- doc view ---------------- */
let docScrollFn = null;
function confetti() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas');
  c.className = 'confetti-canvas';
  document.body.appendChild(c);
  const x = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const ps = Array.from({ length: 90 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * 200, w: 5 + Math.random() * 6, h: 8 + Math.random() * 8, vy: 2 + Math.random() * 3, vx: -1 + Math.random() * 2, r: Math.random() * 3, col: ['#0A84FF', '#34C759', '#FF9F0A', '#BF5AF2', '#FF453A'][Math.floor(Math.random() * 5)] }));
  let frames = 0;
  (function tick() {
    x.clearRect(0, 0, c.width, c.height);
    for (const p of ps) { p.x += p.vx; p.y += p.vy; p.r += 0.05; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.col; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore(); }
    if (++frames < 130) requestAnimationFrame(tick); else c.remove();
  })();
}
function setDone(key, on) {
  const entry = chapByKey.get(key);
  const before = entry ? courseStats(entry.course).pct : 0;
  if (on) progress.done[key] = Date.now(); else delete progress.done[key];
  saveProgress();
  if (on && entry && before < 100 && courseStats(entry.course).pct >= 100) {
    setTimeout(() => { confetti(); toast('🎉 ' + T('courseComplete') + ' — ' + entry.course.title); }, 300);
  }
}

function vDoc(courseId, slugFrag) {
  let slug = slugFrag, frag = null;
  const at = slugFrag.lastIndexOf('@');
  if (at > 0 && !slugFrag.slice(at + 1).includes('/')) { slug = slugFrag.slice(0, at); frag = slugFrag.slice(at + 1); }
  const entry = chapByKey.get(keyOf(courseId, slug));
  if (!entry) { location.hash = '#/library'; return; }
  const { course, ch } = entry;
  const key = keyOf(courseId, slug);
  activeTab = 'library';
  const secIdx = course.sections.findIndex((s) => s.slugs.includes(slug));
  const backRoute = secIdx >= 0 ? `#/course/${courseId}/s/${secIdx}` : `#/course/${courseId}`;
  const prev = ch.prev ? chapByKey.get(keyOf(courseId, ch.prev)) : null;
  const next = ch.next ? chapByKey.get(keyOf(courseId, ch.next)) : null;

  view().innerHTML = `
  <header class="topbar">
    <div class="topbar-row">
      <button type="button" class="icon-btn" data-back aria-label="Back">${I.back}</button>
      <div class="topbar-title lat">${esc(ch.title)}</div>
      <span class="spacer"></span>
    </div>
    <div class="topbar-rule"></div>
  </header>
  <div class="lt-wrap"><h1 class="large-title lat" style="font-size:27px;line-height:1.28">${esc(ch.title)}</h1>
  <p class="large-sub"><span class="lat">${esc(course.title)}</span> · <span class="lat">${esc(ch.section)}</span> · ${num(ch.minutes)} ${T('min')}</p></div>
  <div class="doc-tools" role="toolbar">
    <button type="button" id="tool-mark">${I.check}<span>${T('markRead')}</span></button>
    <button type="button" id="tool-tr">${I.globe}<span>${T('translateBtn')}</span></button>
    <button type="button" id="tool-dl">${I.download}<span>${T('downloadAll').split(' ')[0] === 'دانلود' ? 'آفلاین' : 'Offline'}</span></button>
    <button type="button" id="tool-focus">${I.target}<span>${T('focusMode')}</span></button>
  </div>
  <div class="article" id="article" dir="ltr" lang="en"><div class="empty">…</div></div>
  <div class="mark-zone">
    <button type="button" class="btn-primary" id="mark-btn"></button>
    <div class="hint">${settings.lang === 'en' ? 'Mark this chapter once you have finished reading it.' : 'اگر این فصل را کامل خواندی، تیک بزن تا در پیشرفتت حساب شود.'}</div>
  </div>
  <nav class="doc-nav">
    ${prev ? `<a href="#/doc/${courseId}/${esc(prev.ch.slug)}"><span class="dir-lbl">${T('prevChapter')}</span><span class="t">${esc(prev.ch.title)}</span></a>` : '<a class="off"><span class="dir-lbl"></span></a>'}
    ${next ? `<a class="next" href="#/doc/${courseId}/${esc(next.ch.slug)}"><span class="dir-lbl" style="justify-content:flex-end">${T('nextChapter')}</span><span class="t">${esc(next.ch.title)}</span></a>` : '<a class="off"><span class="dir-lbl"></span></a>'}
  </nav>`;
  setupLargeTitle(backRoute);

  const article = $('#article');
  const markBtn = $('#mark-btn'), toolMark = $('#tool-mark'), toolDl = $('#tool-dl');
  function syncMark() {
    const on = isDone(key);
    markBtn.classList.toggle('done', on);
    markBtn.innerHTML = on ? `${I.check}<span>${T('markRead')} ✓</span>` : `${I.check}<span>${T('markRead')}</span>`;
    toolMark.classList.toggle('on', on);
  }
  function syncDl() {
    const on = isDownloaded(key);
    toolDl.classList.toggle('on', on);
    toolDl.innerHTML = (on ? I.check : I.download) + `<span>${settings.lang === 'en' ? 'Offline' : 'آفلاین'}</span>`;
  }
  syncMark(); syncDl();
  const toggleMark = () => { setDone(key, !isDone(key)); syncMark(); };
  markBtn.onclick = toggleMark; toolMark.onclick = toggleMark;
  toolDl.onclick = async () => {
    if (isDownloaded(key)) { await removeDownloads([key]); syncDl(); }
    else {
      toolDl.classList.add('busy');
      try { const size = await downloadChapter(key); downloads.keys[key] = { at: Date.now(), size }; saveDownloads(); ensureSearchIndexCached(courseId); toast(T('dlDoneToast')); }
      catch { toast(T('dlError')); }
      toolDl.classList.remove('busy'); syncDl();
    }
  };

  /* ---- reading position + progress bar ---- */
  const rp = $('#read-progress'); rp.style.opacity = '1';
  let saveTick = 0;
  docScrollFn = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - innerHeight;
    const frac = max > 0 ? Math.min(1, scrollY / max) : 0;
    $('span', rp).style.width = (frac * 100).toFixed(1) + '%';
    const now = Date.now();
    if (now - saveTick > 350) { saveTick = now; progress.last = { key, frac: Math.round(frac * 1000) / 1000, at: now }; saveProgress(); }
  };

  /* ---- translate (Google Translate, free endpoint, text only) ---- */
  const translate = { active: false, busy: false, originals: new Map(), applied: null };
  function trCollect() {
    const els = $$('#article p, #article li, #article h2, #article h3, #article h4, #article h5, #article h6, #article td, #article th, #article .callout-title')
      .filter((el) => !el.closest('.code-card'));
    return els.filter((el) => !els.some((o) => o !== el && o.contains(el)));
  }
  function trPrepare(el) {
    const tokens = [];
    let plain = '';
    const walk = (node) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) plain += n.textContent;
        else if (n.nodeType === 1) {
          if (n.tagName === 'BR') plain += ' ';
          else { tokens.push(n.outerHTML); plain += ` ⟦${tokens.length - 1}⟧ `; }
        }
      });
    };
    walk(el);
    return { plain: plain.replace(/\s+/g, ' ').trim(), tokens };
  }
  async function gtx(text) {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fa&dt=t&q=' + encodeURIComponent(text);
    const r = await fetch(url);
    if (!r.ok) throw new Error('gtx');
    const j = await r.json();
    return j[0].map((s) => s[0]).join('');
  }
  async function translateRun() {
    if (translate.busy) return;
    const btn = $('#tool-tr');
    translate.busy = true; btn.classList.add('busy');
    btn.innerHTML = `<span class="spin" style="display:inline-flex;width:18px;height:18px">${I.refresh}</span><span>${T('translating')}</span>`;
    try {
      const items = [];
      for (const el of trCollect()) {
        const { plain, tokens } = trPrepare(el);
        const latinWords = (plain.replace(/⟦\d+⟧/g, '').match(/[A-Za-z]{2,}/g) || []).length;
        if (latinWords >= 2) items.push({ el, plain, tokens });
      }
      const applied = [];
      const batches = [];
      let cur = [], curLen = 0;
      for (const it of items) {
        if (curLen + it.plain.length > 1300 && cur.length) { batches.push(cur); cur = []; curLen = 0; }
        cur.push(it); curLen += it.plain.length + 5;
      }
      if (cur.length) batches.push(cur);
      for (const batch of batches) {
        const joined = batch.map((b) => b.plain).join('\n@@@\n');
        let parts = null;
        try { const out = await gtx(joined); parts = out.split(/@@@/); if (parts.length !== batch.length) parts = null; } catch { parts = null; }
        if (!parts) { parts = []; for (const b of batch) parts.push(await gtx(b.plain)); }
        batch.forEach((b, i) => {
          let fa = esc((parts[i] || '').trim());
          fa = fa.replace(/⟦\s*(\d+)\s*⟧/g, (m, n) => b.tokens[+n] || '');
          applied.push({ el: b.el, html: fa });
        });
      }
      translate.originals.clear();
      for (const a of applied) { translate.originals.set(a.el, a.el.innerHTML); a.el.innerHTML = a.html; a.el.classList.add('fa-text'); a.el.setAttribute('dir', 'rtl'); }
      translate.applied = applied;
      translate.active = true;
      article.classList.add('fa');
      btn.innerHTML = I.globe + `<span>${T('showOriginal')}</span>`;
      btn.classList.add('on');
      toast(T('translateDone'));
    } catch { toast(T('translateError')); btn.innerHTML = I.globe + `<span>${T('translateBtn')}</span>`; }
    translate.busy = false; btn.classList.remove('busy');
  }
  function translateRestore() {
    for (const [el, html] of translate.originals) { el.innerHTML = html; el.classList.remove('fa-text'); el.removeAttribute('dir'); }
    translate.originals.clear(); translate.applied = null; translate.active = false;
    article.classList.remove('fa');
    const btn = $('#tool-tr');
    btn.classList.remove('on'); btn.innerHTML = I.globe + `<span>${T('translateBtn')}</span>`;
  }
  $('#tool-tr').onclick = () => { if (translate.active) translateRestore(); else translateRun(); };

  /* ---- focus mode: dim everything outside the centre band ---- */
  let focusIO = null;
  const toolFocus = $('#tool-focus');
  function setFocus(on) {
    article.classList.toggle('focus-on', on);
    toolFocus.classList.toggle('on', on);
    if (focusIO) { focusIO.disconnect(); focusIO = null; }
    if (on) {
      focusIO = new IntersectionObserver((es) => { for (const e of es) e.target.classList.toggle('dim', !e.isIntersecting); }, { rootMargin: '-38% 0px -38% 0px' });
      $$('#article p, #article li, #article h2, #article h3, #article h4, #article blockquote').forEach((el) => focusIO.observe(el));
    } else {
      $$('#article .dim').forEach((el) => el.classList.remove('dim'));
    }
  }
  toolFocus.onclick = () => setFocus(!article.classList.contains('focus-on'));

  /* ---- load chapter ---- */
  docCleanup = () => { docScrollFn = null; rp.style.opacity = '0'; if (focusIO) { focusIO.disconnect(); focusIO = null; } };
  fetch(ch.file).then((r) => { if (!r.ok) throw new Error('load'); return r.text(); }).then((html) => {
    article.innerHTML = html;
    if (settings.autoCache && !isDownloaded(key)) {
      downloadChapter(key).then((size) => { downloads.keys[key] = { at: Date.now(), size }; saveDownloads(); syncDl(); updateDlChrome(); ensureSearchIndexCached(courseId); }).catch(() => {});
    }
    requestAnimationFrame(() => {
      if (frag) { const t = document.getElementById(frag); if (t) { t.scrollIntoView(); return; } }
      const last = progress.last;
      if (last && last.key === key && last.frac > 0.02) {
        const max = document.documentElement.scrollHeight - innerHeight;
        window.scrollTo(0, max * last.frac);
      }
      docScrollFn && docScrollFn();
    });
  }).catch(() => { article.innerHTML = `<div class="empty">${T('dlError')}</div>`; });

  /* ---- article interactions: copy, lang tabs, in-page anchors ---- */
  article.addEventListener('click', (e) => {
    const copy = e.target.closest('[data-copy]');
    if (copy) {
      const card = copy.closest('.code-card');
      const pane = $('.code-pane:not([hidden]) code', card);
      if (pane) navigator.clipboard && navigator.clipboard.writeText(pane.textContent).then(() => toast(T('copied')));
      return;
    }
    const tab = e.target.closest('[data-lang-tab]');
    if (tab) {
      const card = tab.closest('.code-card');
      const i = tab.dataset.langTab;
      $$('[data-lang-tab]', card).forEach((t) => t.classList.toggle('on', t === tab));
      $$('.code-pane', card).forEach((p) => { p.hidden = p.dataset.pane !== i; });
      return;
    }
    const a = e.target.closest('a[href^="#"]');
    if (a && !a.getAttribute('href').startsWith('#/')) {
      const id = a.getAttribute('href').slice(1);
      const t = id && document.getElementById(decodeURIComponent(id));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
  });
}

/* ---------------- router ---------------- */
function router() {
  if (docCleanup) { docCleanup(); docCleanup = null; }
  const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
  const isDoc = parts[0] === 'doc';
  if (parts[0] === 'doc' && parts[1]) vDoc(parts[1], parts.slice(2).join('/'));
  else if (parts[0] === 'course' && parts[2] === 's') vSection(parts[1], Number(parts[3] || 0));
  else if (parts[0] === 'course') vCourse(parts[1]);
  else if (parts[0] === 'library') vLibrary();
  else if (parts[0] === 'progress') vProgress();
  else if (parts[0] === 'settings') vSettings();
  else if (parts[0] === 'downloads') vDownloads();
  else if (parts[0] === 'changelog') vChangelog();
  else if (parts[0] === 'search') vSearch();
  else vHome();
  renderChrome();
  if (!isDoc) { window.scrollTo(0, 0); onScrollLT(); }
}
let scrollRaf = false;
window.addEventListener('scroll', () => {
  if (scrollRaf) return; scrollRaf = true;
  requestAnimationFrame(() => { scrollRaf = false; onScrollLT(); if (docScrollFn) docScrollFn(); });
}, { passive: true });
window.addEventListener('hashchange', router);

/* ---------------- init ---------------- */
(async function init() {
  applySettings();
  renderChrome();
  try {
    const r = await fetch('data/catalog.json');
    if (!r.ok) throw new Error('catalog');
    CAT = await r.json();
  } catch { view().innerHTML = `<div class="empty">${T('dlError')}</div>`; return; }
  indexCatalog();
  router();
  registerSW();
  setTimeout(() => checkForUpdate(false), 5000);
  setInterval(() => { if (!document.hidden) checkForUpdate(false); }, 30 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkForUpdate(false); });
})();
