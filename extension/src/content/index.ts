import { globalAdapterRegistry } from '../core/adapter';
import '../adapters'; // registers SWEA, Jungol, BOJ

function initContentScript() {
  const currentUrl = window.location.href;
  const adapter = globalAdapterRegistry.getAdapterForUrl(currentUrl);

  if (!adapter) return;

  // 1. Check login status and report to runtime if requested
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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

  // 2. Detect if user just submitted and received an Accepted result
  observeSubmission(adapter, currentUrl);
}

function observeSubmission(adapter: any, currentUrl: string) {
  // Check periodically or on mutation if this is a submission result page
  const checkAndAutoSync = () => {
    const submission = adapter.extractSubmission(document, currentUrl);
    if (submission && submission.status === 'Accepted') {
      // Send message to background to trigger auto-sync if enabled
      chrome.runtime.sendMessage({
        type: 'AUTO_SYNC_SUBMISSION',
        data: submission
      });
    }
  };

  // Initial check after load
  setTimeout(checkAndAutoSync, 1500);

  // Observer for dynamic SPA / AJAX updates on result tables
  const observer = new MutationObserver(() => {
    checkAndAutoSync();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Run content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript);
} else {
  initContentScript();
}
