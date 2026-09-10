import { NotionService } from '../services/notion';
import { SubmissionMeta, UserSettings } from '../types';

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  autoSync: true,
  lastSyncStatus: 'idle'
};

// In-memory debounce cache to prevent duplicate rapid syncs
const recentSyncTimestamps = new Map<string, number>();

async function getSettings(): Promise<UserSettings> {
  const result = await chrome.storage.sync.get('settings');
  return { ...DEFAULT_SETTINGS, ...(result.settings || {}) };
}

async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.sync.set({ settings: { ...current, ...settings } });
}

// Handle messages from content scripts and popup UI
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SETTINGS') {
    getSettings().then(sendResponse);
    return true;
  }

  if (message.type === 'SAVE_SETTINGS') {
    saveSettings(message.data).then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'SYNC_SUBMISSION' || message.type === 'AUTO_SYNC_SUBMISSION') {
    handleSync(message.data, message.type === 'AUTO_SYNC_SUBMISSION')
      .then(res => sendResponse(res))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === 'CHECK_SITE_LOGIN') {
    checkActiveTabLogin().then(sendResponse);
    return true;
  }
});

async function handleSync(submission: SubmissionMeta, isAuto: boolean): Promise<{ success: boolean; error?: string }> {
  const settings = await getSettings();

  if (isAuto && !settings.autoSync) {
    return { success: false, error: 'Auto sync is disabled' };
  }

  if (!settings.notionToken) {
    await updateSyncStatus('error', 'Notion이 연동되어 있지 않습니다.');
    return { success: false, error: 'Notion is not connected' };
  }

  if (!settings.selectedDatabaseId) {
    await updateSyncStatus('error', '저장할 Notion 데이터베이스가 선택되지 않았습니다.');
    return { success: false, error: 'No database selected' };
  }

  // Prevent duplicate sync within 10 seconds for the same problem
  const syncKey = `${submission.site}-${submission.problemId}`;
  const now = Date.now();
  const lastSyncTime = recentSyncTimestamps.get(syncKey);
  if (lastSyncTime && now - lastSyncTime < 10000) {
    console.log(`Duplicate sync ignored for ${syncKey}`);
    return { success: true };
  }
  recentSyncTimestamps.set(syncKey, now);

  try {
    const notion = new NotionService(settings.notionToken);
    await notion.syncSubmission(settings.selectedDatabaseId, submission);

    await updateSyncStatus('success', `${submission.site} #${submission.problemId} 저장 완료`);
    showNotification('동기화 성공', `${submission.site} [${submission.problemId}] ${submission.title} 문제가 Notion에 저장되었습니다.`);
    return { success: true };
  } catch (error: any) {
    const msg = error.message || 'Unknown sync error';
    await updateSyncStatus('error', msg);
    showNotification('동기화 실패', msg);
    return { success: false, error: msg };
  }
}

async function updateSyncStatus(status: 'success' | 'error' | 'idle', message?: string) {
  await saveSettings({
    lastSyncStatus: status,
    lastSyncMessage: message,
    lastSyncedAt: new Date().toISOString()
  });

  // Update extension badge
  if (status === 'success') {
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000);
  } else if (status === 'error') {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  }
}

function showNotification(title: string, message: string) {
  if (chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title,
      message
    });
  }
}

async function checkActiveTabLogin(): Promise<any> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab || !activeTab.id || !activeTab.url) return null;

  try {
    const response = await chrome.tabs.sendMessage(activeTab.id, { type: 'CHECK_LOGIN' });
    return response;
  } catch {
    return null;
  }
}
