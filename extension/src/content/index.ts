import { globalAdapterRegistry } from '../core/adapter';
import '../adapters'; // registers SWEA, Jungol, BOJ

function initContentScript() {
  const currentUrl = window.location.href;
  const adapter = globalAdapterRegistry.getAdapterForUrl(currentUrl);

  if (!adapter) return;

  const isContextValid = () => {
    try {
      return !!(chrome.runtime && chrome.runtime.id);
    } catch {
      return false;
    }
  };

  // 1. Message listener (for manual sync button in popup)
  try {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!isContextValid()) return;

      if (message.type === 'CHECK_LOGIN') {
        const loginStatus = adapter.checkLogin(document);
        sendResponse(loginStatus);
        return true;
      }

      if (message.type === 'EXTRACT_PROBLEM') {
        const problem = adapter.extractProblem(document, currentUrl);
        sendResponse(problem);
        return true;
      }

      if (message.type === 'EXTRACT_SUBMISSION') {
        const submission = adapter.extractSubmission(document, currentUrl);
        sendResponse(submission);
        return true;
      }
    });
  } catch {
    // Ignore context error
  }

  // 2. Auto-sync: STRICTLY trigger ONLY when 'Accepted' status is confirmed!
  observeSubmission(adapter, currentUrl, isContextValid);
}

let autoSyncDispatched = false;

function observeSubmission(adapter: any, currentUrl: string, isContextValid: () => boolean) {
  const checkAndAutoSync = () => {
    if (!isContextValid() || autoSyncDispatched) return;
    try {
      const submission = adapter.extractSubmission(document, currentUrl);
      // ONLY trigger automatic sync if status is strictly 'Accepted'
      if (submission && submission.status === 'Accepted') {
        autoSyncDispatched = true; // prevent repeated firing on same page view
        chrome.runtime.sendMessage({
          type: 'AUTO_SYNC_SUBMISSION',
          data: submission
        }).catch(() => {});
      }
    } catch {
      // Ignored
    }
  };

  // Check 2.5s after load (giving time for 채점 result to render)
  setTimeout(checkAndAutoSync, 2500);

  // Also observe for dynamic result popups/DOM updates when user clicks "제출"
  try {
    const observer = new MutationObserver(() => {
      checkAndAutoSync();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } catch {
    // Ignored
  }
}

// Run content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript);
} else {
  initContentScript();
}
