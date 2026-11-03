const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const digest = value => crypto.createHash('sha256').update(value).digest();
  const password = process.env.PREVIEW_PASSWORD;
  if (!password) return res.status(503).send('Preview temporarily unavailable.');
  const sign = value => crypto.createHmac('sha256', password).update('aftercall-review:' + value).digest('hex');
  const cookie = (req.headers.cookie || '').split(';').map(value => value.trim()).find(value => value.startsWith('review_access='));
  const token = cookie ? cookie.slice(14) : '';
  const [expiry, signature = ''] = token.split('.');
  const authorized = /^\d+$/.test(expiry || '') && Number(expiry) > Date.now() && crypto.timingSafeEqual(digest(signature), digest(sign(expiry)));
  let invalid = false;
  if (req.method === 'POST' && new URL(req.url, 'https://preview.local').pathname === '/unlock') {
    let body = req.body;
    if (body === undefined) {
      const chunks = [];
      let length = 0;
      for await (const chunk of req) {
        length += chunk.length;
        if (length > 4096) return res.status(413).end();
        chunks.push(Buffer.from(chunk));
      }
      body = Buffer.concat(chunks).toString();
    }
    const supplied = typeof body === 'object' && !Buffer.isBuffer(body) ? body.password : new URLSearchParams(String(body)).get('password');
    if (typeof supplied === 'string' && crypto.timingSafeEqual(digest(supplied), digest(password))) {
      const until = String(Date.now() + 8 * 60 * 60 * 1000);
      res.setHeader('Set-Cookie', `review_access=${until}.${sign(until)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`);
      res.setHeader('Location', '/');
      return res.status(303).end();
    }
    invalid = true;
  }
  if (!authorized || invalid) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(invalid ? 401 : 200).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AfterCall · Private preview</title><style>*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at top,#142A61,#05091C 70%);color:#fff;font:16px/1.5 Inter,system-ui,sans-serif}main{width:100%;max-width:440px;padding:40px;border:1px solid #ffffff25;border-radius:28px;background:#0A1738}small{color:#b6c2ff;letter-spacing:.12em}h1{font-size:32px;line-height:1.15;letter-spacing:-.03em}p{color:#c6cdeb}label{display:block;margin-bottom:8px}input,button{width:100%;font:inherit;border-radius:12px;padding:14px 16px}input{border:1px solid #ffffff55;background:#05091C;color:white}button{margin-top:18px;border:0;border-radius:99px;background:linear-gradient(96deg,#6E8BFF,#8B5CF6);color:#05091C;font-weight:700;cursor:pointer}input:focus-visible,button:focus-visible{outline:3px solid #b6c2ff;outline-offset:3px}.error{color:#fca5a5}</style></head><body><main><small>AFTERCALL</small><h1>A first look.<br>Just for you.</h1><p>Enter the password to review the Ambassador Program.</p><form method="post" action="/unlock"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus>${invalid ? '<p class="error" role="alert">Incorrect password. Please try again.</p>' : ''}<button type="submit">View preview →</button></form></main></body></html>`);
  }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'https://preview.local').pathname); } catch { return res.status(400).end(); }
  const root = path.join(process.cwd(), 'content');
  const relative = ['/', '/ambassador-program', '/ambassador-program.html'].includes(pathname) ? 'ambassador-program.html' : pathname.replace(/^\/+/, '');
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.status(404).send('Not included in this review preview.');
  const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  let body = fs.readFileSync(file);
  if (path.extname(file) === '.html') {
    body = body.toString().replace(/<script[^>]+src="\/(?:cookie-consent|meta-pixel|aftercall-analytics)\.js"[^>]*><\/script>/g, '');
    body = body.replace('<head>', '<head><meta name="robots" content="noindex,nofollow">');
  }
  return res.status(200).send(body);
};
