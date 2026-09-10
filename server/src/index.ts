import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID || 'dummy_client_id';
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET || 'dummy_client_secret';
const REDIRECT_URI = process.env.REDIRECT_URI || `http://localhost:${PORT}/api/auth/notion/callback`;

/**
 * Health check
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'algo-notion-oauth-bridge' });
});

/**
 * Initiates Notion OAuth 2.0 flow
 * Redirects user to Notion's authorization page
 */
app.get('/api/auth/notion', (_req: Request, res: Response) => {
  const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${NOTION_CLIENT_ID}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}`;
  res.redirect(authUrl);
});

/**
 * OAuth Callback
 * Exchanges authorization code for access_token with Notion
 * Zero storage: token is safely handed over to user extension
 */
app.get('/api/auth/notion/callback', async (req: Request, res: Response) => {
  const { code, error } = req.query;

  if (error || !code) {
    res.status(400).send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h2 style="color: #dc2626;">Notion 연동에 실패했습니다.</h2>
          <p>${error || '인증 코드가 전달되지 않았습니다.'}</p>
        </body>
      </html>
    `);
    return;
  }

  try {
    const credentials = Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64');
    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code.toString(),
        redirect_uri: REDIRECT_URI
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || data.error || 'Token exchange failed');
    }

    const accessToken = data.access_token;
    const workspaceName = data.workspace_name || 'Notion Workspace';

    // Present success page that communicates with extension or allows copying token
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Notion 연결 완료</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; justify-content: center; align-items: center; height: 80vh; background: #f8fafc; }
          .card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); max-width: 480px; text-align: center; }
          h2 { color: #16a34a; margin-bottom: 12px; }
          p { color: #475569; font-size: 14px; line-height: 1.6; }
          .token-box { margin: 16px 0; padding: 12px; background: #f1f5f9; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 12px; }
          button { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>🎉 Notion 연동 성공!</h2>
          <p><strong>${workspaceName}</strong> 워크스페이스가 성공적으로 연결되었습니다.</p>
          <div class="token-box" id="token">${accessToken}</div>
          <button onclick="copyToken()">토큰 복사하기</button>
          <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">
            확장프로그램 팝업 창의 토큰 입력칸에 위 토큰을 저장하여 동기화를 시작하세요.
          </p>
        </div>
        <script>
          function copyToken() {
            const token = document.getElementById('token').innerText;
            navigator.clipboard.writeText(token).then(() => alert('토큰이 복사되었습니다! 확장프로그램 팝업에 입력하세요.'));
          }
        </script>
      </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h2 style="color: #dc2626;">Notion 토큰 발급 중 오류 발생</h2>
          <p>${err.message}</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`[OAuth Companion Server] Running at http://localhost:${PORT}`);
});
