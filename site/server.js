// Zero-dependency server: static files + small JSON API for articles and uploads.
// Run:  ADMIN_PASSWORD=yourpassword node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.join(ROOT, 'data');
const ARTICLES = path.join(DATA, 'articles');
const UPLOADS = path.join(DATA, 'uploads');
[ARTICLES, UPLOADS].forEach((d) => fs.mkdirSync(d, { recursive: true }));

const sessions = new Set();
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};
const IMG_EXT = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif', 'image/avif': '.avif' };
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const send = (res, code, body, type = 'application/json') => {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};
const isAuthed = (req) => sessions.has(req.headers['x-admin-token'] || '');
const readBody = (req, limit = 30 * 1024 * 1024) =>
  new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
const readArticle = (slug) => {
  try { return JSON.parse(fs.readFileSync(path.join(ARTICLES, slug + '.json'), 'utf8')); } catch { return null; }
};
const summary = (a) => ({
  slug: a.slug, title: a.title, subtitle: a.subtitle, author: a.author, category: a.category,
  published: !!a.published, publishedAt: a.publishedAt || null, updatedAt: a.updatedAt || null,
  hero: (a.blocks && a.blocks.hero) || '',
});

function serveStatic(res, baseDir, rel) {
  const file = path.normalize(path.join(baseDir, rel));
  if (!file.startsWith(baseDir)) return send(res, 403, 'Forbidden', 'text/plain');
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Not found', 'text/plain');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': baseDir === UPLOADS ? 'public, max-age=31536000, immutable' : 'no-cache' });
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = decodeURIComponent(url.pathname);

  try {
    // ---------- API ----------
    if (p === '/api/login' && req.method === 'POST') {
      const { password } = JSON.parse((await readBody(req, 10_000)) || '{}');
      if (password !== ADMIN_PASSWORD) return send(res, 401, { error: 'Wrong password' });
      const token = crypto.randomBytes(24).toString('hex');
      sessions.add(token);
      return send(res, 200, { token });
    }

    if (p === '/api/auth-check' && req.method === 'GET') {
      return isAuthed(req) ? send(res, 200, { ok: true }) : send(res, 401, { error: 'Not logged in' });
    }

    if (p === '/api/articles' && req.method === 'GET') {
      const all = url.searchParams.get('all') === '1' && isAuthed(req);
      const list = fs.readdirSync(ARTICLES).filter((f) => f.endsWith('.json'))
        .map((f) => readArticle(f.slice(0, -5))).filter(Boolean)
        .filter((a) => all || a.published).map(summary)
        .sort((a, b) => new Date(b.publishedAt || b.updatedAt || 0) - new Date(a.publishedAt || a.updatedAt || 0));
      return send(res, 200, list);
    }

    const m = p.match(/^\/api\/articles\/([^/]+)$/);
    if (m) {
      const slug = m[1];
      if (!SLUG_RE.test(slug)) return send(res, 400, { error: 'Invalid slug (use lowercase letters, numbers, dashes)' });
      if (req.method === 'GET') {
        const a = readArticle(slug);
        if (!a || (!a.published && !isAuthed(req))) return send(res, 404, { error: 'Not found' });
        return send(res, 200, a);
      }
      if (!isAuthed(req)) return send(res, 401, { error: 'Not logged in' });
      if (req.method === 'PUT') {
        const body = JSON.parse(await readBody(req, 5 * 1024 * 1024));
        const prev = readArticle(slug) || {};
        const a = {
          slug,
          title: String(body.title || ''), subtitle: String(body.subtitle || ''),
          author: String(body.author || ''), category: String(body.category || ''),
          tags: String(body.tags || ''),
          blocks: body.blocks && typeof body.blocks === 'object' ? body.blocks : {},
          published: !!body.published,
          publishedAt: body.published ? (prev.publishedAt || new Date().toISOString()) : prev.publishedAt || null,
          updatedAt: new Date().toISOString(),
        };
        fs.writeFileSync(path.join(ARTICLES, slug + '.json'), JSON.stringify(a, null, 2));
        return send(res, 200, a);
      }
      if (req.method === 'DELETE') {
        try { fs.unlinkSync(path.join(ARTICLES, slug + '.json')); } catch {}
        return send(res, 200, { ok: true });
      }
    }

    if (p === '/api/upload' && req.method === 'POST') {
      if (!isAuthed(req)) return send(res, 401, { error: 'Not logged in' });
      const { dataUrl } = JSON.parse(await readBody(req));
      const mm = /^data:(image\/[a-z+.-]+);base64,(.+)$/s.exec(dataUrl || '');
      if (!mm || !IMG_EXT[mm[1]]) return send(res, 400, { error: 'Unsupported image type' });
      const name = crypto.randomBytes(10).toString('hex') + IMG_EXT[mm[1]];
      fs.writeFileSync(path.join(UPLOADS, name), Buffer.from(mm[2], 'base64'));
      return send(res, 200, { url: '/uploads/' + name });
    }

    // ---------- pages ----------
    if (p.startsWith('/uploads/')) return serveStatic(res, UPLOADS, p.slice(9));
    if (/^\/p\/[^/]+\/?$/.test(p)) return serveStatic(res, PUBLIC, 'article.html');
    if (p === '/admin' || p === '/admin/') return serveStatic(res, PUBLIC, 'admin/index.html');
    return serveStatic(res, PUBLIC, p === '/' ? 'index.html' : p.slice(1));
  } catch (e) {
    return send(res, 500, { error: e.message || 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Site:  http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin   (password: ${ADMIN_PASSWORD === 'changeme' ? 'changeme  <- set ADMIN_PASSWORD!' : '[from ADMIN_PASSWORD]'})`);
});
