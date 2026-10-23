// Vercel Routing Middleware: password gate for the unlisted Ambassador Program
// preview page. Only the paths in `matcher` are affected; the rest of the site
// is untouched. Remove this file (or the matcher entries) when the page goes public.

export const config = {
  matcher: ['/ambassador-program', '/ambassador-program.html'],
};

// SHA-256 of the preview password (the plaintext is not stored in the repo).
const PASSWORD_HASH = 'a46e842fb0c2a527c20580ddb9be8a8932b4a599c5c14971c8a145325cf64b5a';
const COOKIE = 'ac_amb_preview';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Cookie token is derived from the hash, so it can't be guessed from the cookie name alone.
async function token() {
  return sha256(PASSWORD_HASH + ':ambassador-program:v1');
}

function readCookie(req, name) {
  const raw = req.headers.get('cookie') || '';
  const hit = raw.split(/;\s*/).find((c) => c.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

const pass = () => new Response(null, { headers: { 'x-middleware-next': '1' } });

export default async function middleware(req) {
  const url = new URL(req.url);
  const expected = await token();

  if (readCookie(req, COOKIE) === expected) return pass();

  let error = false;
  if (req.method === 'POST') {
    const form = await req.formData().catch(() => null);
    const pw = form ? String(form.get('password') || '') : '';
    if ((await sha256(pw)) === PASSWORD_HASH) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: url.pathname,
          'Set-Cookie': `${COOKIE}=${expected}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
          'Cache-Control': 'no-store',
        },
      });
    }
    error = true;
  }

  return new Response(gate(error), {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}

function gate(error) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>AfterCall · Private preview</title>
<link rel="icon" href="/favicon.ico?v=2">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{min-height:100svh;display:grid;place-items:center;padding:24px;background:#05091C;color:rgba(255,255,255,.72);font-family:Inter,-apple-system,system-ui,sans-serif;overflow:hidden}
.a{position:fixed;inset:0;pointer-events:none}.a i{position:absolute;border-radius:50%;filter:blur(90px);opacity:.55}
.a i:nth-child(1){width:560px;height:560px;background:#3B4BFF;top:-160px;left:-140px}
.a i:nth-child(2){width:500px;height:500px;background:#8B5CF6;bottom:-160px;right:-140px}
.card{position:relative;width:100%;max-width:400px;padding:40px 32px;border-radius:28px;text-align:center;background:linear-gradient(160deg,rgba(255,255,255,.10),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);box-shadow:0 30px 80px -30px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.12)}
img{width:52px;height:52px;border-radius:14px;margin:0 auto 18px;display:block}
h1{color:#fff;font-size:24px;font-weight:800;letter-spacing:-.03em;margin-bottom:6px}
p{font-size:14.5px;line-height:1.5;margin-bottom:24px}
input{width:100%;height:52px;padding:0 16px;border-radius:14px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#fff;font:inherit;font-size:16px;outline:0}
input:focus{border-color:#8B5CF6;box-shadow:0 0 0 4px rgba(139,92,246,.25)}
button{width:100%;height:52px;margin-top:12px;border:0;border-radius:999px;background:linear-gradient(96deg,#6E8BFF,#8B5CF6);color:#fff;font:inherit;font-weight:600;font-size:16px;cursor:pointer;box-shadow:0 10px 30px -10px rgba(139,92,246,.7)}
.e{color:#fca5a5;font-size:13.5px;margin:12px 0 0}
</style></head><body><div class="a"><i></i><i></i></div>
<form class="card" method="post">
<img src="/images/home/logo.png" alt="AfterCall">
<h1>Private preview</h1>
<p>Ambassador Program · Enter the password to continue.</p>
<input type="password" name="password" placeholder="Password" autocomplete="current-password" autofocus required aria-label="Password">
<button type="submit">View page</button>
${error ? '<p class="e">That password didn’t work. Try again.</p>' : ''}
</form></body></html>`;
}
