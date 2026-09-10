import { NotionService } from '../services/notion';
import { UserSettings } from '../types';

// DOM elements
const sweaStatusEl = document.getElementById('swea-status')?.querySelector('.status-pill');
const jungolStatusEl = document.getElementById('jungol-status')?.querySelector('.status-pill');
const notionUnconnectedEl = document.getElementById('notion-unconnected');
const notionConnectedEl = document.getElementById('notion-connected');
const btnConnectNotion = document.getElementById('btn-connect-notion');
const btnDisconnectNotion = document.getElementById('btn-disconnect-notion');
const inputManualToken = document.getElementById('input-manual-token') as HTMLInputElement;
const btnSaveToken = document.getElementById('btn-save-token');
const selectDatabase = document.getElementById('select-database') as HTMLSelectElement;
const btnRefreshDb = document.getElementById('btn-refresh-db');
const toggleAutoSync = document.getElementById('toggle-auto-sync') as HTMLInputElement;
const btnSyncCurrent = document.getElementById('btn-sync-current');
const lastSyncText = document.getElementById('last-sync-text');

async function initPopup() {
  await loadSettings();
  await checkSiteSessions();
  setupEventListeners();
}

async function loadSettings() {
  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (settings: UserSettings) => {
    if (!settings) return;

    // Notion connection state
    if (settings.notionToken) {
      notionUnconnectedEl?.classList.add('hidden');
      notionConnectedEl?.classList.remove('hidden');
      loadDatabases(settings.notionToken, settings.selectedDatabaseId);
    } else {
      notionUnconnectedEl?.classList.remove('hidden');
      notionConnectedEl?.classList.add('hidden');
    }

    // Auto sync toggle
    if (toggleAutoSync) {
      toggleAutoSync.checked = settings.autoSync ?? true;
    }

    // Last sync status text
    if (lastSyncText) {
      if (settings.lastSyncedAt) {
        const timeStr = new Date(settings.lastSyncedAt).toLocaleTimeString();
        const msg = settings.lastSyncMessage ? ` (${settings.lastSyncMessage})` : '';
        lastSyncText.textContent = `${timeStr}${msg}`;
        lastSyncText.style.color = settings.lastSyncStatus === 'error' ? '#dc2626' : '#16a34a';
      } else {
        lastSyncText.textContent = '동기화 이력 없음';
      }
    }
  });
}

async function loadDatabases(token: string, selectedId?: string) {
  if (!selectDatabase) return;
  selectDatabase.innerHTML = '<option value="">데이터베이스 불러오는 중...</option>';

  try {
    const notion = new NotionService(token);
    const dbs = await notion.listDatabases();

    selectDatabase.innerHTML = '<option value="">데이터베이스를 선택하세요</option>';
    if (dbs.length === 0) {
      selectDatabase.innerHTML = '<option value="">연결된 데이터베이스 없음</option>';
      return;
    }

    dbs.forEach(db => {
      const opt = document.createElement('option');
      opt.value = db.id;
      opt.textContent = db.title;
      if (db.id === selectedId) {
        opt.selected = true;
      }
      selectDatabase.appendChild(opt);
    });
  } catch (err: any) {
    selectDatabase.innerHTML = `<option value="">목록 조회 실패 (${err.message})</option>`;
  }
}

async function checkSiteSessions() {
  // 1. First check if any open tab is logged in (Content script method - most reliable)
  const tabs = await chrome.tabs.query({});
  let sweaFoundInTab = false;
  let jungolFoundInTab = false;

  for (const tab of tabs) {
    if (!tab.id || !tab.url) continue;

    if (tab.url.includes('swexpertacademy.com') && !sweaFoundInTab) {
      try {
        const res = await chrome.tabs.sendMessage(tab.id, { type: 'CHECK_LOGIN' });
        if (res && res.isLoggedIn) {
          sweaFoundInTab = true;
          if (sweaStatusEl) {
            sweaStatusEl.textContent = res.username ? `로그인됨 (${res.username})` : '로그인됨';
            sweaStatusEl.className = 'status-pill logged-in';
          }
        }
      } catch {
        // Tab may not have content script loaded yet
      }
    }

    if (tab.url.includes('jungol.co.kr') && !jungolFoundInTab) {
      try {
        const res = await chrome.tabs.sendMessage(tab.id, { type: 'CHECK_LOGIN' });
        if (res && res.isLoggedIn) {
          jungolFoundInTab = true;
          if (jungolStatusEl) {
            jungolStatusEl.textContent = res.username ? `로그인됨 (${res.username})` : '로그인됨';
            jungolStatusEl.className = 'status-pill logged-in';
          }
        }
      } catch {
        // Tab may not have content script loaded yet
      }
    }
  }

  // 2. Cookie fallback across domains & subdomains
  if (!sweaFoundInTab) {
    chrome.cookies?.getAll({ domain: 'swexpertacademy.com' }, cookies => {
      if (sweaStatusEl) {
        const hasSession = cookies && cookies.length > 0 && cookies.some(c => 
          c.name.toUpperCase().includes('SESSION') || c.name.toUpperCase().includes('LOGIN') || c.name.toUpperCase().includes('SSO')
        );
        if (hasSession || (cookies && cookies.length >= 2)) {
          sweaStatusEl.textContent = '로그인됨 (세션 감지)';
          sweaStatusEl.className = 'status-pill logged-in';
        } else {
          sweaStatusEl.textContent = '미로그인 / 세션 없음';
          sweaStatusEl.className = 'status-pill logged-out';
        }
      }
    });
  }

  if (!jungolFoundInTab) {
    chrome.cookies?.getAll({ domain: 'jungol.co.kr' }, cookies => {
      if (jungolStatusEl) {
        const hasSession = cookies && cookies.length > 0 && cookies.some(c => 
          c.name.toUpperCase().includes('SESS') || c.name.toUpperCase().includes('LOGIN') || c.name.toUpperCase().includes('USER')
        );
        if (hasSession || (cookies && cookies.length >= 2)) {
          jungolStatusEl.textContent = '로그인됨 (세션 감지)';
          jungolStatusEl.className = 'status-pill logged-in';
        } else {
          jungolStatusEl.textContent = '미로그인 / 세션 없음';
          jungolStatusEl.className = 'status-pill logged-out';
        }
      }
    });
  }
}

function setupEventListeners() {
  // Manual token save
  btnSaveToken?.addEventListener('click', () => {
    const token = inputManualToken.value.trim();
    if (!token) {
      alert('토큰을 입력해주세요.');
      return;
    }

    btnSaveToken.textContent = '저장 중...';
    chrome.runtime.sendMessage(
      { type: 'SAVE_SETTINGS', data: { notionToken: token } },
      () => {
        btnSaveToken.textContent = '저장';
        inputManualToken.value = '';
        loadSettings();
      }
    );
  });

  // Connect Notion OAuth button
  btnConnectNotion?.addEventListener('click', () => {
    const instructions = 
      '【Notion 토큰 연동 안내】\n\n' +
      '로컬 OAuth 서버를 띄우지 않고 가장 간편하게 연동하는 방법:\n\n' +
      '1. https://www.notion.so/my-integrations 에 접속합니다.\n' +
      '2. [+ 새 API 통합 만들기]를 클릭하고 이름을 입력합니다.\n' +
      '3. 생성된 [프라이빗 API 통합 시크릿 (secret_...)]을 복사합니다.\n' +
      '4. 노션에서 문제들을 저장할 데이터베이스 페이지 우측 상단 [···] -> [연결(Connect to)]에서 방금 만든 통합을 추가합니다.\n' +
      '5. 팝업 창 하단의 "토큰 직접 입력" 칸에 붙여넣고 [저장]을 누르면 바로 연결됩니다!';
    
    if (confirm(instructions + '\n\nNotion 통합 페이지로 이동하시겠습니까?')) {
      chrome.tabs.create({ url: 'https://www.notion.so/my-integrations' });
    }
  });

  // Disconnect Notion button
  btnDisconnectNotion?.addEventListener('click', () => {
    if (confirm('Notion 연결을 해제하시겠습니까?')) {
      chrome.runtime.sendMessage(
        { type: 'SAVE_SETTINGS', data: { notionToken: '', selectedDatabaseId: '' } },
        () => loadSettings()
      );
    }
  });

  // Database selection change
  selectDatabase?.addEventListener('change', () => {
    const dbId = selectDatabase.value;
    chrome.runtime.sendMessage({
      type: 'SAVE_SETTINGS',
      data: { selectedDatabaseId: dbId }
    });
  });

  // Refresh DB list
  btnRefreshDb?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (settings: UserSettings) => {
      if (settings?.notionToken) {
        loadDatabases(settings.notionToken, settings.selectedDatabaseId);
      }
    });
  });

  // Toggle auto sync
  toggleAutoSync?.addEventListener('change', () => {
    chrome.runtime.sendMessage({
      type: 'SAVE_SETTINGS',
      data: { autoSync: toggleAutoSync.checked }
    });
  });

  // Manual sync current active page
  btnSyncCurrent?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      alert('활성화된 탭을 찾을 수 없습니다.');
      return;
    }

    btnSyncCurrent.textContent = '추출 및 저장 중...';
    (btnSyncCurrent as HTMLButtonElement).disabled = true;

    chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_SUBMISSION' }, (submission) => {
      if (chrome.runtime.lastError || !submission) {
        alert('현재 페이지에서 문제나 제출 정보를 추출할 수 없습니다.\nSWEA 또는 정올 문제 상세 페이지를 열고 시도해주세요.');
        btnSyncCurrent.textContent = '현재 페이지 문제 수동 저장';
        (btnSyncCurrent as HTMLButtonElement).disabled = false;
        return;
      }

      chrome.runtime.sendMessage({ type: 'SYNC_SUBMISSION', data: submission }, (res) => {
        btnSyncCurrent.textContent = '현재 페이지 문제 수동 저장';
        (btnSyncCurrent as HTMLButtonElement).disabled = false;
        if (res?.success) {
          alert('Notion에 성공적으로 저장되었습니다!');
          loadSettings();
        } else {
          alert(`동기화 실패: ${res?.error || '알 수 없는 오류'}`);
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', initPopup);
