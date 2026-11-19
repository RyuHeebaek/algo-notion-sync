// Renders Chrome Web Store graphics with a real browser.
// Serves the repo (dist/ + store-assets/html) over http on 127.0.0.1 so the real
// popup HTML/CSS/JS can be loaded, with the chrome.* API stubbed per frame.
// `npm i -D playwright` in the repo, or point PLAYWRIGHT_MODULE at an existing install.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/workspace/tmp-assets/serve';
const OUT = '/workspace/work/algo-notion-sync/store-assets/screenshots';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.ttf': 'font/ttf', '.otf': 'font/otf', '.json': 'application/json',
};

function serve() {
  const s = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(ROOT, url);
    if (file.endsWith('/')) file = path.join(file, 'index.html');
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(buf);
    });
  });
  return new Promise((ok) => s.listen(8899, '127.0.0.1', () => ok(s)));
}

function stub() {
  // Everything the page needs must be defined inside this function: it is
  // serialized and evaluated in the browser, not in Node.
  const SETTINGS = {
    notionToken: 'secret_mock_token',
    selectedDatabaseId: 'db-swea',
    autoSync: true,
    lastSyncStatus: 'success',
    lastSyncMessage: 'SWEA #1225 저장 완료',
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  };
  window.chrome = {
    runtime: {
      id: 'mock-extension',
      lastError: null,
      getURL: (p) => p,
      sendMessage(msg, cb) {
        let r = { success: true };
        if (msg.type === 'GET_SETTINGS') r = { ...SETTINGS };
        if (msg.type === 'SAVE_SETTINGS') r = { success: true };
        if (msg.type === 'SYNC_SUBMISSION') r = { success: true };
        if (msg.type === 'CHECK_SITE_LOGIN') r = { isLoggedIn: true };
        if (cb) { setTimeout(() => cb(r), 0); return; }
        return Promise.resolve(r);
      },
      onMessage: { addListener() {} },
    },
    tabs: {
      query(q, cb) {
        const r = [{ id: 1, url: 'https://swexpertacademy.com/main/code/problem/problemDetail.do?contestProbId=1225' }];
        if (typeof q === 'function') { q(r); return; }
        if (cb) { cb(r); return; }
        return Promise.resolve(r);
      },
      sendMessage(id, msg, cb) {
        const r = msg && msg.type === 'CHECK_LOGIN'
          ? { site: 'SWEA', isLoggedIn: true, username: 'AlgorithmMaster' }
          : null;
        if (cb) { cb(r); return; }
        return Promise.resolve(r);
      },
      create() {},
    },
    cookies: { getAll(q, cb) { cb([{ name: 'JSESSIONID', value: 'x' }, { name: 'insa', value: 'y' }]); } },
    action: { setBadgeText() {}, setBadgeBackgroundColor() {} },
    notifications: { create() {} },
  };
  const origFetch = window.fetch;
  window.fetch = async (url, opts) => {
    if (String(url).includes('api.notion.com/v1/search')) {
      return new Response(JSON.stringify({
        results: [
          { id: 'db-swea', title: [{ plain_text: 'SWEA 문제 풀이' }] },
          { id: 'db-study', title: [{ plain_text: '알고리즘 스터디' }] },
        ],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return origFetch(url, opts);
  };
}

async function applyFonts(p) {
  for (const f of p.frames()) {
    try {
      await f.evaluate(() => {
        if (document.getElementById('__shotfonts')) return;
        const s = document.createElement('style');
        s.id = '__shotfonts';
        s.textContent = `
          @font-face{font-family:'NotoKR';src:url('/fonts/NotoSansKR-var.ttf') format('truetype');font-weight:100 900;font-display:block}
          @font-face{font-family:'JBMono';src:url('/fonts/JetBrainsMono.ttf') format('truetype');font-weight:100 800;font-display:block}
          html,body{font-family:'NotoKR',sans-serif !important;-webkit-font-smoothing:antialiased}
          code,pre,.mono,textarea,input{font-family:'JBMono','NotoKR',monospace}`;
        document.head.appendChild(s);
      });
    } catch { /* frame gone */ }
  }
  await p.waitForTimeout(120);
}

const env = { ...process.env, LD_LIBRARY_PATH: '/workspace/.tools/libs' };
const browser = await chromium.launch({ env, args: ['--no-sandbox', '--force-color-profile=srgb', '--font-render-hinting=none'] });
const ctx = await browser.newContext({
  deviceScaleFactor: 1, viewport: { width: 1280, height: 800 },
  locale: 'ko-KR', timezoneId: 'Asia/Seoul',
});
await ctx.addInitScript(stub);
const page = await ctx.newPage();

const jobs = process.argv.slice(2);
async function shoot(name, w, h, selector) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(`http://127.0.0.1:8899/${name}.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(450);
  await applyFonts(page);
  await page.waitForTimeout(200);
  const target = selector ? await page.$(selector) : null;
  const file = path.join(OUT, `${name.replace(/^_/, '')}.png`);
  if (target) await target.screenshot({ path: file });
  else await page.screenshot({ path: file });
  console.log('saved', file);
}

const server = await serve();
try {
  await page.goto('http://127.0.0.1:8899/_probe.html', { waitUntil: 'networkidle' }).catch(() => {});
  for (const job of jobs) {
    if (job === 'popup') {
      await page.setViewportSize({ width: 380, height: 760 });
      await page.goto('http://127.0.0.1:8899/dist/extension/src/popup/popup.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await applyFonts(page);
      await page.waitForTimeout(500);
      const box = await page.evaluate(() => {
        const b = document.body;
        return { w: Math.ceil(b.getBoundingClientRect().width), h: Math.ceil(b.scrollHeight) };
      });
      console.log('popup size', box);
      await page.setViewportSize({ width: Math.max(380, box.w + 40), height: box.h + 40 });
      await page.waitForTimeout(300);
      await page.screenshot({ path: '/workspace/tmp-assets/popup_probe.png', clip: { x: 0, y: 0, width: 360, height: box.h } });
      console.log('popup probe saved', box);
    } else if (job.startsWith('shot')) {
      await shoot(job, 1280, 800);
    } else if (job === 'promo') {
      await shoot('promo', 440, 280);
    } else if (job === 'hero') {
      await shoot('hero', 1280, 800);
    }
  }
} finally {
  await browser.close();
  server.close();
}
