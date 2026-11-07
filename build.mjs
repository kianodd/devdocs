// DevDocs builder v2 — multi-course.
// Courses:
//   nestjs : official NestJS docs (src-docs/content + src-docs/nav-items.ts)
//   prisma : Prisma ORM 7 docs (src-docs/prisma/v7, fumadocs MDX + meta.json nav)
// Output: data/catalog.json (v2), data/chapters/<course>__<slug>.html,
//         data/search-<course>.json (plain text per chapter for full-text search)
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { Marked } from 'marked';
import hljs from 'highlight.js';

const ROOT = new URL('.', import.meta.url).pathname;
const OUT_CHAPTERS = join(ROOT, 'data', 'chapters');
mkdirSync(OUT_CHAPTERS, { recursive: true });

// minimal Prisma schema language for highlight.js
if (!hljs.getLanguage('prisma')) {
  hljs.registerLanguage('prisma', () => ({
    name: 'Prisma',
    keywords: { keyword: 'model datasource generator enum type view', literal: 'true false' },
    contains: [
      hljs.COMMENT('//', '$'),
      { className: 'string', begin: '"', end: '"' },
      { className: 'number', begin: '\\b\\d+(\\.\\d+)?\\b' },
      { className: 'attr', begin: '@@?[a-zA-Z_][\\w]*' },
      { className: 'type', begin: '\\b[A-Z][\\w]*' },
      { className: 'built_in', begin: '\\b(String|Int|Float|Boolean|DateTime|Json|Bytes|Decimal|BigInt|Unsupported)\\b' },
    ],
  }));
}

const marked = new Marked({ gfm: true, breaks: false });
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ICON_INFO = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 11v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="8" r="1.4" fill="currentColor"/></svg>';
const ICON_WARN = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4 2.8 20h18.4L12 4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.3" fill="currentColor"/></svg>';
const ICON_TIP = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.3 2.2h4.6c.2-.9.6-1.6 1.3-2.2A6 6 0 0 0 12 3Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>';
const ICON_FILE = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h7l4 4v14H7z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3v4h4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const LANG_LABEL = { typescript: 'TypeScript', ts: 'TypeScript', javascript: 'JavaScript', js: 'JavaScript', bash: 'Terminal', shell: 'Terminal', sh: 'Terminal', json: 'JSON', graphql: 'GraphQL', html: 'HTML', xml: 'HTML', sql: 'SQL', yaml: 'YAML', yml: 'YAML', groovy: 'Groovy', http: 'HTTP', prisma: 'Prisma schema', npm: 'Terminal', plaintext: 'Text', text: 'Text', diff: 'Diff', '': 'Code' };
const LANG_HLJS = { typescript: 'typescript', ts: 'typescript', TypeScript: 'typescript', javascript: 'javascript', js: 'javascript', bash: 'bash', shell: 'bash', sh: 'bash', npm: 'bash', json: 'json', graphql: 'graphql', html: 'xml', sql: 'sql', yaml: 'yaml', yml: 'yaml', groovy: 'groovy', http: 'http', prisma: 'prisma', diff: 'diff', plaintext: 'plaintext', text: 'plaintext', '': 'plaintext' };

const slugify = (t) => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

/* Shared renderer. hooks: { resolveInternal(href, chapter) -> new href | null,
   assetSrc(src) -> {href, track} } */
function makeRenderer(hooks) {
  return function render(mdInput, chapter) {
    let md = mdInput;
    md = md.replace(/\{\{\s*'([^']*)'\s*\}\}/g, '$1'); // Angular escapes
    md = md.replace(/<app-[a-z-]+[^>]*>(\s*<\/app-[a-z-]+>)?/g, ''); // Nest banners

    const blocks = [];
    const stash = (html) => { blocks.push(html); return `\n\n@@BLOCK_${blocks.length - 1}@@\n\n`; };

    // --- code fences ---
    md = md.replace(/^```([A-Za-z0-9+-]*)([^\n]*)\n([\s\S]*?)^```/gm, (all, langRaw, meta, code) => {
      const hl = LANG_HLJS[langRaw] || 'plaintext';
      let metaFile = null;
      const tm = (meta || '').match(/title=["']([^"']+)["']/) || (meta || '').match(/^\s*(\S+\.[a-z]+)\s*$/);
      if (tm) metaFile = tm[1];
      const parts = code.split(/^@@switch\s*$/m);
      const panes = parts.map((part, i) => {
        let filename = metaFile;
        const cleaned = part.split('\n').filter((l) => {
          const m = l.match(/^@@filename\((.*)\)\s*$/);
          if (m) { filename = m[1] || filename; return false; }
          return true;
        });
        const rawCode = cleaned.join('\n').replace(/\n+$/, '');
        let highlighted;
        try { highlighted = hljs.highlight(rawCode, { language: hl }).value; } catch { highlighted = esc(rawCode); }
        if (filename && !/\.[a-z]+$/.test(filename)) filename += (parts.length > 1 && i === 1) || langRaw === 'javascript' || langRaw === 'js' ? '.js' : '.ts';
        return { html: highlighted, filename, langLabel: i === 1 && parts.length > 1 ? 'JavaScript' : (LANG_LABEL[langRaw] || 'Code') };
      });
      const fname = panes.map((p) => p.filename).find(Boolean);
      const tabs = panes.length > 1
        ? `<span class="code-tabs" role="tablist">${panes.map((p, i) => `<button type="button" role="tab" data-lang-tab="${i}" class="${i === 0 ? 'on' : ''}">${p.langLabel}</button>`).join('')}</span>` : '';
      const head = `<figcaption class="code-head"><span class="code-file">${ICON_FILE}<span>${esc(fname || panes[0].langLabel)}</span></span><span class="code-head-r">${tabs}<button type="button" class="copy-btn" data-copy aria-label="Copy code"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.8"/></svg></button></span></figcaption>`;
      const body = panes.map((p, i) => `<div class="code-pane" data-pane="${i}"${i > 0 ? ' hidden' : ''}><pre><code class="hljs language-${hl}">${p.html}</code></pre></div>`).join('');
      return stash(`<figure class="code-card">${head}${body}</figure>`);
    });

    // --- Nest blockquote callouts: > info **Hint** / > warning **Warning** ---
    {
      const lines = md.split('\n');
      const out = [];
      for (let i = 0; i < lines.length; i++) {
        if (/^>\s*(info|warning)\s+\*\*/.test(lines[i])) {
          const group = [];
          while (i < lines.length && /^>/.test(lines[i])) { group.push(lines[i].replace(/^>\s?/, '')); i++; }
          i--;
          const m = group[0].match(/^(info|warning)\s+\*\*(.+?)\*\*\s*(.*)$/);
          const type = m[1] === 'warning' ? 'warning' : 'info';
          const innerMd = [m[3], ...group.slice(1)].join('\n').trim();
          const innerHtml = innerMd ? marked.parse(innerMd) : '';
          out.push(stash(`<aside class="callout callout-${type}"><span class="callout-ic">${type === 'warning' ? ICON_WARN : ICON_INFO}</span><div class="callout-body"><p class="callout-title">${esc(m[2])}</p>${innerHtml}</div></aside>`));
        } else out.push(lines[i]);
      }
      md = out.join('\n');
    }

    // --- Prisma ::: admonitions ---
    md = md.replace(/^:::(info|note|tip|warning|danger|warn)[ \t]*([^\n]*)\n([\s\S]*?)^:::[ \t]*$/gm, (all, type, title, inner) => {
      const kind = type === 'tip' ? 'tip' : (type === 'warning' || type === 'danger' || type === 'warn') ? 'warning' : 'info';
      const label = title.trim() || (kind === 'tip' ? 'Tip' : kind === 'warning' ? 'Warning' : type === 'note' ? 'Note' : 'Info');
      const icon = kind === 'tip' ? ICON_TIP : kind === 'warning' ? ICON_WARN : ICON_INFO;
      const innerHtml = marked.parse(inner.trim());
      return stash(`<aside class="callout callout-${kind}"><span class="callout-ic">${icon}</span><div class="callout-body"><p class="callout-title">${esc(label)}</p>${innerHtml}</div></aside>`);
    });

    let html = marked.parse(md);
    html = html.replace(/<p>@@BLOCK_(\d+)@@<\/p>/g, (m, n) => blocks[+n]);
    html = html.replace(/@@BLOCK_(\d+)@@/g, (m, n) => blocks[+n]);
    // heading ids
    html = html.replace(/<(h[2345])>([\s\S]*?)<\/\1>/g, (m, tag, inner) => `<${tag} id="${slugify(inner)}">${inner}</${tag}>`);
    // tables
    html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
    // images
    html = html.replace(/src="([^"]+)"/g, (m, src) => {
      const r = hooks.assetSrc(src);
      return r ? `src="${r}" loading="lazy"` : m;
    });
    // links
    html = html.replace(/href="([^"]+)"/g, (m, href) => {
      const r = hooks.resolveInternal(href, chapter);
      return r !== null && r !== undefined ? `href="${r}"` : m;
    });
    html = html.replace(/<a href="(https?:\/\/[^"]+)"/g, (m, u) => `<a target="_blank" rel="noopener" href="${u}"`);
    return html;
  };
}

function plainText(md) {
  return md
    .replace(/^```[\s\S]*?^```/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*`_~|:-]{1,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ============================ NESTJS ============================ */
function buildNest() {
  const CONTENT = join(ROOT, 'src-docs', 'content');
  const ASSETS_SRC = '/tmp/docs-nest-test/src/assets';
  let navText = readFileSync(join(ROOT, 'src-docs', 'nav-items.ts'), 'utf8');
  navText = navText.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  const NAV_ITEMS = new Function('return ' + navText.slice(navText.indexOf('= [') + 2, navText.lastIndexOf('];') + 1))();

  function walk(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = join(dir, e.name);
      return e.isDirectory() ? walk(p) : (e.name.endsWith('.md') ? [p] : []);
    });
  }
  const files = walk(CONTENT).map((p) => {
    const rel = relative(CONTENT, p).replace(/\\/g, '/');
    const raw = readFileSync(p, 'utf8');
    const tm = raw.match(/^#{1,3}\s+(.+)$/m);
    return { slug: rel.replace(/\.md$/, ''), raw, title: tm ? tm[1].replace(/\*\*/g, '').trim() : rel };
  });
  const bySlug = new Map(files.map((f) => [f.slug, f]));
  const byTitle = new Map();
  for (const f of files) { const k = f.title.toLowerCase(); if (!byTitle.has(k)) byTitle.set(k, []); byTitle.get(k).push(f); }
  const ALIASES = { '/': 'introduction', '/providers': 'components', '/middleware': 'middlewares', '/fundamentals/custom-providers': 'fundamentals/dependency-injection', '/fundamentals/async-providers': 'fundamentals/async-components', '/fundamentals/injection-scopes': 'fundamentals/provider-scopes', '/fundamentals/module-ref': 'fundamentals/module-reference', '/fundamentals/testing': 'fundamentals/unit-testing', '/data/mongodb': 'data/mongo', '/security/encryption-and-hashing': 'security/encryption-hashing', '/http/session': 'http/sessions', '/graphql/resolvers': 'graphql/resolvers-map', '/graphql/generating-sdl': 'graphql/schema-generator', '/graphql/other-features': 'graphql/guards-interceptors', '/cli/monorepo': 'cli/workspaces', '/devtools/ci-cd-integration': 'devtools/ci-cd', '/faq/common-errors': 'faq/errors', '/discover/companies': 'discover/who-uses', '/standalone-applications': 'application-context', '/migration-guide': 'migration' };
  const pathToSlug = new Map();
  const chapters = [];
  const used = new Set();
  const resolve = (path, title) => {
    if (ALIASES[path]) return bySlug.get(ALIASES[path]);
    const guess = path.replace(/^\//, '');
    if (bySlug.has(guess)) return bySlug.get(guess);
    const cands = byTitle.get((title || '').toLowerCase()) || [];
    return cands.find((c) => c.slug.startsWith(guess.split('/')[0] + '/')) || cands[0] || null;
  };
  for (const item of NAV_ITEMS) {
    if (item.children) {
      for (const child of item.children) {
        if (!child.path) continue;
        const f = resolve(child.path, child.title);
        if (!f) { console.warn('NEST UNMATCHED:', child.path); continue; }
        chapters.push({ file: f, title: child.title, section: item.title });
        used.add(f.slug); pathToSlug.set(child.path, f.slug);
      }
    } else if (item.path) {
      const f = resolve(item.path, item.title);
      if (!f) { console.warn('NEST UNMATCHED single:', item.path); continue; }
      chapters.push({ file: f, title: item.title, section: 'Overview' });
      used.add(f.slug); pathToSlug.set(item.path, f.slug);
    }
  }
  for (const f of files) if (!used.has(f.slug)) chapters.push({ file: f, title: f.title, section: 'Overview' });

  const usedAssets = new Set();
  const render = makeRenderer({
    assetSrc: (src) => {
      const m = src.match(/^(?:https:\/\/docs\.nestjs\.com)?\/assets\/(.+)$/);
      if (m) { usedAssets.add(m[1]); return 'assets/docs/' + m[1]; }
      return null;
    },
    resolveInternal: (href) => {
      const m = href.match(/^(?:https:\/\/docs\.nestjs\.com)?(\/[a-z0-9\-]+(?:\/[a-z0-9\-]+)*)(?:#([a-z0-9\-]+))?$/);
      if (m) {
        const slug = pathToSlug.get(m[1]);
        if (slug) return `#/doc/nestjs/${slug}${m[2] ? '@' + m[2] : ''}`;
        return `https://docs.nestjs.com${m[1]}${m[2] ? '#' + m[2] : ''}`;
      }
      return null;
    },
  });

  const out = chapters.map((ch) => {
    let md = ch.file.raw.replace(/^#{1,3}\s+.+$/m, ''); // title lives in app header
    const html = render(md, ch);
    const fileName = 'nestjs__' + ch.file.slug.replace(/\//g, '__') + '.html';
    writeFileSync(join(OUT_CHAPTERS, fileName), html);
    const words = plainText(ch.file.raw).split(/\s+/).filter(Boolean).length;
    return { slug: ch.file.slug, title: ch.title, section: ch.section, group: null, file: 'data/chapters/' + fileName, minutes: Math.max(1, Math.round(words / 200)), _text: plainText(ch.file.raw) };
  });
  for (const p of usedAssets) {
    const src = join(ASSETS_SRC, p);
    const dst = join(ROOT, 'assets', 'docs', p);
    if (existsSync(src)) { mkdirSync(dirname(dst), { recursive: true }); copyFileSync(src, dst); }
  }
  return out;
}

/* ============================ PRISMA ============================ */
function buildPrisma() {
  const BASE = join(ROOT, 'src-docs', 'prisma', 'v7');
  const IMG_SRC = join(ROOT, 'src-docs', 'prisma-public', 'img');
  const readMeta = (dir) => {
    const p = join(BASE, dir, 'meta.json');
    return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
  };
  const front = (raw) => {
    const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
    if (!m) return { fm: {}, body: raw };
    const fm = {};
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^(\w+):\s*(.*)$/);
      if (kv) fm[kv[1]] = kv[2].replace(/^['"]|['"]$/g, '');
    }
    return { fm, body: raw.slice(m[0].length) };
  };
  const fileInfo = new Map(); // slug -> {raw, title, url}
  function walkFiles(dir) {
    return readdirSync(join(BASE, dir || '.'), { withFileTypes: true }).flatMap((e) => {
      const rel = (dir ? dir + '/' : '') + e.name;
      if (e.isDirectory()) return walkFiles(rel);
      return e.name.endsWith('.mdx') ? [rel] : [];
    });
  }
  for (const rel of walkFiles('')) {
    const raw = readFileSync(join(BASE, rel), 'utf8');
    const { fm, body } = front(raw);
    let slug = rel.replace(/\.mdx$/, '');
    if (slug.endsWith('/index')) slug = slug.slice(0, -6);
    if (slug === 'index') slug = 'index';
    const h = body.match(/^#\s+(.+)$/m);
    fileInfo.set(slug, { raw: body, title: fm.title || (h ? h[1].trim() : slug), url: fm.url || null, rel });
  }
  const urlToSlug = new Map();
  for (const [slug, info] of fileInfo) {
    urlToSlug.set('/orm/v7/' + (slug === 'index' ? '' : slug), slug);
    if (info.url) urlToSlug.set(info.url.replace(/\/$/, ''), slug);
  }

  // navigation from meta.json tree
  const chapters = [];
  const visited = new Set();
  const addChapter = (slug, section, group) => {
    if (!fileInfo.has(slug) || visited.has(slug)) return;
    visited.add(slug);
    const info = fileInfo.get(slug);
    chapters.push({ slug, title: info.title, section, group: group || null, raw: info.raw });
  };
  function walkMeta(dir, section, group, depth) {
    const meta = readMeta(dir);
    const folderTitle = meta && meta.title && depth > 0 ? meta.title : null;
    let curSection = section, curGroup = group || folderTitle;
    const pages = meta ? meta.pages : null;
    const entries = pages || readdirSync(join(BASE, dir || '.'), { withFileTypes: true })
      .filter((e) => !e.name.startsWith('meta')).map((e) => e.name.replace(/\.mdx$/, ''));
    for (const entry of entries) {
      if (typeof entry !== 'string') continue;
      const sep = entry.match(/^---(.+)---$/);
      if (sep) {
        if (depth === 0) { curSection = sep[1].trim(); curGroup = null; }
        else curGroup = sep[1].trim();
        continue;
      }
      if (/^\[.*\]\(.*\)$/.test(entry)) continue; // external link in nav
      if (entry === '...') { // fumadocs: all remaining items in this folder
        for (const e of readdirSync(join(BASE, dir || '.'), { withFileTypes: true })) {
          if (e.name.startsWith('meta')) continue;
          if (e.isDirectory()) walkMeta(join(dir, e.name), curSection, curGroup, depth + 1);
          else if (e.name.endsWith('.mdx')) {
            let s = (dir ? dir + '/' : '') + e.name.replace(/\.mdx$/, '');
            if (s.endsWith('/index')) s = s.slice(0, -6);
            addChapter(s === '' ? 'index' : s, curSection, depth > 0 ? curGroup : null);
          }
        }
        continue;
      }
      if (entry.startsWith('...')) { walkMeta(join(dir, entry.slice(3)), curSection, curGroup, depth + 1); continue; }
      const childDir = join(dir, entry);
      const isDir = existsSync(join(BASE, childDir)) && !existsSync(join(BASE, childDir + '.mdx'));
      if (isDir) {
        const idxSlug = (childDir + '/index').replace(/\/index$/, '');
        if (fileInfo.has(childDir) && entry !== 'index') addChapter(childDir, curSection, curGroup);
        walkMeta(childDir, curSection, curGroup, depth + 1);
      } else {
        const slug = (dir ? dir + '/' : '') + entry;
        const real = slug.endsWith('/index') ? slug.slice(0, -6) : slug;
        addChapter(real === '' ? 'index' : real, curSection, depth > 0 ? curGroup : null);
      }
    }
  }
  walkMeta('', 'Introduction', null, 0);
  // completeness: anything not reached by nav is appended under its top folder
  for (const slug of fileInfo.keys()) {
    if (visited.has(slug)) continue;
    const top = slug.split('/')[0];
    const names = { 'core-concepts': 'Core Concepts', 'prisma-schema': 'Prisma Schema', 'prisma-client': 'Prisma Client', 'prisma-migrate': 'Prisma Migrate', reference: 'Reference', more: 'More' };
    addChapter(slug, names[top] || 'More', null);
    console.log('PRISMA extra (not in nav):', slug);
  }

  const usedAssets = new Set();
  const render = makeRenderer({
    assetSrc: (src) => {
      const m = src.match(/^\/img\/(.+)$/);
      if (m) { usedAssets.add(m[1]); return 'assets/prisma/' + m[1]; }
      return null;
    },
    resolveInternal: (href, chapter) => {
      if (href.startsWith('#')) return null;
      const [pathPart, frag] = href.split('#');
      if (/^https?:\/\//.test(pathPart)) return null;
      let p = pathPart;
      if (p.startsWith('/orm/v7')) {
        const slug = urlToSlug.get(p.replace(/\/$/, '')) || urlToSlug.get(p);
        if (slug) return `#/doc/prisma/${slug}${frag ? '@' + frag : ''}`;
        return 'https://www.prisma.io/docs' + p;
      }
      if (p.startsWith('/')) return 'https://www.prisma.io/docs' + p;
      // relative link
      const baseDir = chapter.slug.includes('/') ? chapter.slug.split('/').slice(0, -1).join('/') : '';
      const norm = [];
      for (const seg of (baseDir + '/' + p).split('/')) {
        if (seg === '..') norm.pop(); else if (seg && seg !== '.') norm.push(seg);
      }
      const rel = norm.join('/');
      if (fileInfo.has(rel)) return `#/doc/prisma/${rel}${frag ? '@' + frag : ''}`;
      return null;
    },
  });

  const out = chapters.map((ch) => {
    let md = ch.raw;
    md = md.replace(/^\s*import\s.+$/gm, ''); // MDX imports
    md = md.replace(/^\s*export\s.+$/gm, '');
    md = md.replace(/<Youtube[^>]*?(?:id|videoId)=["']([\w-]+)["'][^>]*\/?>(?:<\/Youtube>)?/g, '\n\n[Watch on YouTube](https://www.youtube.com/watch?v=$1)\n\n');
    md = md.replace(/<\/?(Accordions|Cards|Steps|Step|Tabs|Tab)[^>]*>/g, '');
    md = md.replace(/<Accordion[^>]*title=["']([^"']+)["'][^>]*>/g, '\n\n**$1**\n\n');
    md = md.replace(/<Card[^>]*title=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Card>/g, '\n\n- [$1]($2) — $3\n\n');
    md = md.replace(/^#\s+.+$/m, ''); // H1 duplicates frontmatter title
    const html = render(md, ch);
    const fileName = 'prisma__' + ch.slug.replace(/\//g, '__') + '.html';
    writeFileSync(join(OUT_CHAPTERS, fileName), html);
    const words = plainText(ch.raw).split(/\s+/).filter(Boolean).length;
    return { slug: ch.slug, title: ch.title, section: ch.section, group: ch.group, file: 'data/chapters/' + fileName, minutes: Math.max(1, Math.round(words / 200)), _text: plainText(ch.raw) };
  });
  for (const p of usedAssets) {
    const src = join(IMG_SRC, p);
    const dst = join(ROOT, 'assets', 'prisma', p);
    if (existsSync(src)) { mkdirSync(dirname(dst), { recursive: true }); copyFileSync(src, dst); }
    else console.warn('PRISMA MISSING IMG:', p);
  }
  return out;
}

/* ============================ ASSEMBLE ============================ */
rmSync(OUT_CHAPTERS, { recursive: true, force: true });
mkdirSync(OUT_CHAPTERS, { recursive: true });
rmSync(join(ROOT, 'assets', 'docs'), { recursive: true, force: true });
rmSync(join(ROOT, 'assets', 'prisma'), { recursive: true, force: true });

const courseDefs = [
  { id: 'nestjs', title: 'NestJS', hue: '#5E5CE6', build: buildNest },
  { id: 'prisma', title: 'Prisma ORM', hue: '#0A7EA4', build: buildPrisma },
];
const catalog = { version: 2, courses: [] };
for (const def of courseDefs) {
  const chapters = def.build();
  chapters.forEach((c, i) => { c.prev = i > 0 ? chapters[i - 1].slug : null; c.next = i < chapters.length - 1 ? chapters[i + 1].slug : null; });
  const sections = [];
  const seen = new Map();
  for (const c of chapters) {
    if (!seen.has(c.section)) { seen.set(c.section, []); sections.push({ title: c.section, slugs: seen.get(c.section) }); }
    seen.get(c.section).push(c.slug);
  }
  const search = {};
  for (const c of chapters) { search[c.slug] = c._text.slice(0, 30000); delete c._text; }
  writeFileSync(join(ROOT, 'data', `search-${def.id}.json`), JSON.stringify(search));
  catalog.courses.push({ id: def.id, title: def.title, hue: def.hue, sections, chapters });
  console.log(`${def.id}: ${chapters.length} chapters, ${sections.length} sections`);
}
writeFileSync(join(ROOT, 'data', 'catalog.json'), JSON.stringify(catalog, null, 1));
console.log('catalog v2 written');
