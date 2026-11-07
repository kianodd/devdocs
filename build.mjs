// DevDocs builder: converts the official NestJS docs repo markdown
// (src-docs/content, copied verbatim from github.com/nestjs/docs.nestjs.com)
// into pre-rendered HTML chapter fragments + a catalog, preserving the
// official reading order from src-docs/nav-items.ts.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { Marked } from 'marked';
import hljs from 'highlight.js';

const ROOT = new URL('.', import.meta.url).pathname;
const CONTENT = join(ROOT, 'src-docs', 'content');
const DOCS_REPO_ASSETS = '/tmp/docs-nest-test/src/assets'; // upstream clone assets
const OUT_CHAPTERS = join(ROOT, 'data', 'chapters');
const OUT_ASSETS = join(ROOT, 'assets', 'docs');
mkdirSync(OUT_CHAPTERS, { recursive: true });
mkdirSync(OUT_ASSETS, { recursive: true });

// ---------- load official navigation ----------
let navText = readFileSync(join(ROOT, 'src-docs', 'nav-items.ts'), 'utf8');
navText = navText.split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
const arrStart = navText.indexOf('= [') + 2;
const arrEnd = navText.lastIndexOf('];');
const NAV_ITEMS = new Function('return ' + navText.slice(arrStart, arrEnd + 1))();

// ---------- collect markdown files ----------
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : (e.name.endsWith('.md') ? [p] : []);
  });
}
const files = walk(CONTENT).map(p => {
  const rel = relative(CONTENT, p).replace(/\\/g, '/'); // e.g. fundamentals/dynamic-modules.md
  const slug = rel.replace(/\.md$/, '');
  const raw = readFileSync(p, 'utf8');
  const titleMatch = raw.match(/^#{1,3}\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace(/\*\*/g, '').trim() : slug;
  return { rel, slug, raw, title };
});
const bySlug = new Map(files.map(f => [f.slug, f]));
const byTitle = new Map();
for (const f of files) {
  const key = f.title.toLowerCase();
  if (!byTitle.has(key)) byTitle.set(key, []);
  byTitle.get(key).push(f);
}

// ---------- path -> file resolution ----------
const ALIASES = {
  '/': 'introduction',
  '/providers': 'components',
  '/middleware': 'middlewares',
  '/fundamentals/custom-providers': 'fundamentals/dependency-injection',
  '/fundamentals/async-providers': 'fundamentals/async-components',
  '/fundamentals/injection-scopes': 'fundamentals/provider-scopes',
  '/fundamentals/module-ref': 'fundamentals/module-reference',
  '/fundamentals/testing': 'fundamentals/unit-testing',
  '/data/mongodb': 'data/mongo',
  '/security/encryption-and-hashing': 'security/encryption-hashing',
  '/http/session': 'http/sessions',
  '/graphql/resolvers': 'graphql/resolvers-map',
  '/graphql/generating-sdl': 'graphql/schema-generator',
  '/graphql/other-features': 'graphql/guards-interceptors',
  '/cli/monorepo': 'cli/workspaces',
  '/devtools/ci-cd-integration': 'devtools/ci-cd',
  '/faq/common-errors': 'faq/errors',
  '/discover/companies': 'discover/who-uses',
  '/standalone-applications': 'application-context',
  '/migration-guide': 'migration',
};
function resolvePath(path, title, categoryTitle) {
  if (ALIASES[path]) return bySlug.get(ALIASES[path]);
  const guess = path.replace(/^\//, '');
  if (bySlug.has(guess)) return bySlug.get(guess);
  // title match, prefer same top folder as the path
  const cands = byTitle.get((title || '').toLowerCase()) || [];
  if (cands.length) {
    const top = guess.split('/')[0];
    return cands.find(c => c.slug.startsWith(top + '/')) || cands[0];
  }
  return null;
}

// Flatten NAV into ordered chapters grouped by category
const chapters = []; // {file, title, category, path}
const usedSlugs = new Set();
const pathToSlug = new Map();
for (const item of NAV_ITEMS) {
  if (item.children) {
    for (const child of item.children) {
      if (!child.path) continue;
      const f = resolvePath(child.path, child.title, item.title);
      if (!f) { console.warn('UNMATCHED NAV:', child.path, child.title); continue; }
      chapters.push({ file: f, title: child.title, category: item.title, path: child.path });
      usedSlugs.add(f.slug);
      pathToSlug.set(child.path, f.slug);
    }
  } else if (item.path) {
    const f = resolvePath(item.path, item.title, item.title);
    if (!f) { console.warn('UNMATCHED NAV single:', item.path, item.title); continue; }
    chapters.push({ file: f, title: item.title, category: 'Overview', path: item.path });
    usedSlugs.add(f.slug);
    pathToSlug.set(item.path, f.slug);
  }
}
// Any file not in NAV still ships (complete import), grouped by its folder
const folderCategory = s => s.includes('/') ? s.split('/')[0].replace(/(^.|-)(\w)/g, (m, a, b) => (a === '-' ? ' ' : a.toUpperCase()) + b).replace(/^\w/, c => c.toUpperCase()) : 'Overview';
for (const f of files) {
  if (usedSlugs.has(f.slug)) continue;
  chapters.push({ file: f, title: f.title, category: f.slug === 'enterprise' ? 'Overview' : folderCategory(f.slug), path: null, extra: true });
  console.log('EXTRA (not in NAV):', f.slug);
}

// ---------- markdown rendering ----------
const marked = new Marked({ gfm: true, breaks: false });
const ICON_INFO = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 11v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="8" r="1.4" fill="currentColor"/></svg>';
const ICON_WARN = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4 2.8 20h18.4L12 4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.3" fill="currentColor"/></svg>';
const ICON_FILE = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h7l4 4v14H7z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3v4h4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const LANG_LABEL = { typescript: 'TypeScript', ts: 'TypeScript', javascript: 'JavaScript', js: 'JavaScript', bash: 'Terminal', shell: 'Terminal', json: 'JSON', graphql: 'GraphQL', html: 'HTML', xml: 'HTML', sql: 'SQL', yaml: 'YAML', groovy: 'Groovy', http: 'HTTP', plaintext: 'Text', text: 'Text', '': 'Code' };
const LANG_HLJS = { typescript: 'typescript', ts: 'typescript', TypeScript: 'typescript', javascript: 'javascript', js: 'javascript', bash: 'bash', shell: 'bash', json: 'json', graphql: 'graphql', html: 'xml', sql: 'sql', yaml: 'yaml', groovy: 'groovy', http: 'http', plaintext: 'plaintext', text: 'plaintext', '': 'plaintext' };

const usedAssets = new Set();
function renderChapter(ch) {
  let md = ch.file.raw;
  // Angular escapes {{ '{' }} -> {
  md = md.replace(/\{\{\s*'([^']*)'\s*\}\}/g, '$1');
  // Drop custom banner components
  md = md.replace(/<app-[a-z-]+[^>]*>(\s*<\/app-[a-z-]+>)?/g, '');
  // Drop the first heading (title lives in the app header)
  md = md.replace(/^#{1,3}\s+.+$/m, '');

  const blocks = []; // placeholder store {kind, html}
  const stash = html => { blocks.push(html); return `\n\n@@BLOCK_${blocks.length - 1}@@\n\n`; };

  // --- code fences (with @@filename / @@switch TS-JS tabs) ---
  md = md.replace(/^```([A-Za-z0-9+-]*)\n([\s\S]*?)^```/gm, (all, langRaw, code) => {
    const lang = LANG_HLJS[langRaw] ? langRaw : (langRaw || '');
    const hl = LANG_HLJS[langRaw] || 'plaintext';
    const parts = code.split(/^@@switch\s*$/m);
    const panes = parts.map((part, i) => {
      let filename = null;
      const lines = part.split('\n');
      const cleaned = lines.filter(l => {
        const m = l.match(/^@@filename\((.*)\)\s*$/);
        if (m) { filename = m[1] || filename; return false; }
        return true;
      });
      const rawCode = cleaned.join('\n').replace(/\n+$/, '');
      let highlighted;
      try { highlighted = hljs.highlight(rawCode, { language: hl }).value; }
      catch { highlighted = esc(rawCode); }
      if (filename && !/\.(ts|js|json|html|yml|yaml)$/.test(filename)) {
        filename += (parts.length > 1 && i === 1) || langRaw === 'javascript' ? '.js' : '.ts';
      }
      return { html: highlighted, filename, langLabel: i === 1 && parts.length > 1 ? 'JavaScript' : (LANG_LABEL[langRaw] || 'Code') };
    });
    const fname = panes.map(p => p.filename).find(Boolean);
    const tabs = panes.length > 1
      ? `<span class="code-tabs" role="tablist">${panes.map((p, i) => `<button type="button" role="tab" data-lang-tab="${i}" class="${i === 0 ? 'on' : ''}">${p.langLabel}</button>`).join('')}</span>` : '';
    const head = `<figcaption class="code-head"><span class="code-file">${ICON_FILE}<span>${esc(fname || panes[0].langLabel)}</span></span><span class="code-head-r">${tabs}<button type="button" class="copy-btn" data-copy aria-label="Copy code"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.8"/></svg></button></span></figcaption>`;
    const body = panes.map((p, i) => `<div class="code-pane" data-pane="${i}"${i > 0 ? ' hidden' : ''}><pre><code class="hljs language-${hl}">${p.html}</code></pre></div>`).join('');
    return stash(`<figure class="code-card">${head}${body}</figure>`);
  });

  // --- callouts: > info **Hint** ... / > warning **Warning** ... ---
  const lines = md.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^>\s*(info|warning)\s+\*\*/.test(lines[i])) {
      const group = [];
      while (i < lines.length && /^>/.test(lines[i])) { group.push(lines[i].replace(/^>\s?/, '')); i++; }
      i--;
      const first = group[0];
      const m = first.match(/^(info|warning)\s+\*\*(.+?)\*\*\s*(.*)$/);
      const type = m[1] === 'warning' ? 'warning' : 'info';
      const title = m[2];
      const innerMd = [m[3], ...group.slice(1)].join('\n').trim();
      const innerHtml = innerMd ? marked.parse(innerMd) : '';
      out.push(stash(`<aside class="callout callout-${type}"><span class="callout-ic">${type === 'warning' ? ICON_WARN : ICON_INFO}</span><div class="callout-body"><p class="callout-title">${esc(title)}</p>${innerHtml}</div></aside>`));
    } else out.push(lines[i]);
  }
  md = out.join('\n');

  let html = marked.parse(md);
  // restore stashed blocks
  html = html.replace(/<p>@@BLOCK_(\d+)@@<\/p>/g, (m, n) => blocks[+n]);
  html = html.replace(/@@BLOCK_(\d+)@@/g, (m, n) => blocks[+n]);

  // heading ids for in-page anchors
  const slugify = t => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  html = html.replace(/<(h[234])>([\s\S]*?)<\/\1>/g, (m, tag, inner) => `<${tag} id="${slugify(inner)}">${inner}</${tag}>`);
  // tables get a scroll wrapper
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
  // images: /assets/... -> local copy
  html = html.replace(/src="\/assets\/([^"]+)"/g, (m, p) => { usedAssets.add(p); return `src="assets/docs/${p}" loading="lazy"`; });
  html = html.replace(/src="https:\/\/docs\.nestjs\.com\/assets\/([^"]+)"/g, (m, p) => { usedAssets.add(p); return `src="assets/docs/${p}" loading="lazy"`; });
  // internal doc links -> in-app routes
  html = html.replace(/href="(?:https:\/\/docs\.nestjs\.com)?(\/[a-z0-9\-]+(?:\/[a-z0-9\-]+)*)(?:#([a-z0-9\-]+))?"/g, (m, path, frag) => {
    const slug = pathToSlug.get(path);
    if (slug) return `href="#/doc/${slug}${frag ? '@' + frag : ''}"`;
    return `href="https://docs.nestjs.com${path}${frag ? '#' + frag : ''}" target="_blank" rel="noopener"`;
  });
  // external links open in a new tab
  html = html.replace(/<a href="https?:\/\/(?!docs\.nestjs\.com)/g, '<a target="_blank" rel="noopener" href="https://');
  // fix the double-prefix the previous line can create for already-absolute hrefs
  html = html.replace(/href="https:\/\/https:\/\//g, 'href="https://');
  return html;
}

// ---------- build ----------
rmSync(OUT_CHAPTERS, { recursive: true, force: true });
mkdirSync(OUT_CHAPTERS, { recursive: true });
const catalog = { generatedFrom: 'https://github.com/nestjs/docs.nestjs.com', categories: [], chapters: [] };
const catMap = new Map();
chapters.forEach((ch, idx) => {
  const html = renderChapter(ch);
  const fileName = ch.file.slug.replace(/\//g, '__') + '.html';
  writeFileSync(join(OUT_CHAPTERS, fileName), html);
  const text = ch.file.raw.replace(/[#>*`\-|\[\]()]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const entry = {
    slug: ch.file.slug, title: ch.title, category: ch.category,
    file: 'data/chapters/' + fileName,
    minutes: Math.max(1, Math.round(words / 200)),
    prev: idx > 0 ? chapters[idx - 1].file.slug : null,
    next: idx < chapters.length - 1 ? chapters[idx + 1].file.slug : null,
  };
  catalog.chapters.push(entry);
  if (!catMap.has(ch.category)) { catMap.set(ch.category, []); catalog.categories.push({ title: ch.category, slugs: catMap.get(ch.category) }); }
  catMap.get(ch.category).push(ch.file.slug);
});
writeFileSync(join(ROOT, 'data', 'catalog.json'), JSON.stringify(catalog, null, 1));

// copy referenced illustration assets from the upstream clone
let copied = 0;
for (const p of usedAssets) {
  const src = join(DOCS_REPO_ASSETS, p);
  const dst = join(OUT_ASSETS, p);
  if (existsSync(src)) { mkdirSync(dirname(dst), { recursive: true }); copyFileSync(src, dst); copied++; }
  else console.warn('MISSING ASSET:', p);
}
console.log(`chapters: ${catalog.chapters.length}, categories: ${catalog.categories.length}, assets copied: ${copied}/${usedAssets.size}`);
