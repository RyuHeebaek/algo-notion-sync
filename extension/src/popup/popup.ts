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
  // Check SWEA session via cookie check or active tab query
  chrome.cookies?.get({ url: 'https://swexpertacademy.com', name: 'JSESSIONID' }, cookie => {
    if (sweaStatusEl) {
      if (cookie) {
        sweaStatusEl.textContent = '로그인됨 (세션 감지)';
        sweaStatusEl.className = 'status-pill logged-in';
      } else {
        sweaStatusEl.textContent = '미로그인 / 세션 없음';
        sweaStatusEl.className = 'status-pill logged-out';
      }
    }
  });

  // Check Jungol session via cookie check
  chrome.cookies?.get({ url: 'http://www.jungol.co.kr', name: 'PHPSESSID' }, cookie => {
    if (jungolStatusEl) {
      if (cookie) {
        jungolStatusEl.textContent = '로그인됨 (세션 감지)';
        jungolStatusEl.className = 'status-pill logged-in';
      } else {
        jungolStatusEl.textContent = '미로그인 / 세션 없음';
        jungolStatusEl.className = 'status-pill logged-out';
      }
    }
  });
}

function setupEventListeners() {
  // Manual token save
  btnSaveToken?.addEventListener('click', () => {
    const token = inputManualToken.value.trim();
    if (!token) return;

    chrome.runtime.sendMessage(
      { type: 'SAVE_SETTINGS', data: { notionToken: token } },
      () => loadSettings()
    );
  });

  // Connect Notion OAuth button
  btnConnectNotion?.addEventListener('click', () => {
    // Opens companion server OAuth endpoint or custom auth window
    const oauthUrl = 'http://localhost:3000/api/auth/notion';
    chrome.tabs.create({ url: oauthUrl });
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
        alert('현재 페이지에서 문제나 제출 정보를 추출할 수 없습니다. SWEA 또는 정올 문제 페이지인지 확인해주세요.');
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
