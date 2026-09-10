# Privacy Policy for Algo Notion Sync

**Last Updated:** 2026-09-10

## 1. Overview
**Algo Notion Sync** ("the Extension") is designed with a strong commitment to user privacy and security. The sole purpose of the extension is to allow users to archive their solved algorithm problems from SWEA (swexpertacademy.com) and JUNGOL (jungol.co.kr) directly into their personal Notion workspace.

## 2. No Password Collection or Storage
The Extension **never** requests, reads, collects, transmits, or stores user passwords or login credentials for SWEA or JUNGOL. It operates strictly within the user's active, pre-authenticated browser session.

## 3. Data Collection and Usage
- **Problem & Submission Data**: When a user accesses a supported problem or submission page, the extension extracts:
  - Problem title, problem number, algorithm tags, difficulty level, submission result, language, problem URL, and source code.
- **Destination**: This data is transmitted directly from the user's browser to the official Notion API (`https://api.notion.com/v1`) using the user's authorized token.
- **Third-Party Storage**: We do **not** maintain any database or server that stores the user's algorithm code, problem history, or Notion database contents.

## 4. Permissions Justification
- `storage`: Required to save user preferences locally (such as selected Notion database ID, auto-save preference, and encrypted/stored Notion access token).
- `cookies`: Used solely to detect whether the user is currently logged into SWEA (`JSESSIONID`) and JUNGOL (`PHPSESSID`) to provide session status indicators in the popup UI. Cookie values are never transmitted to external servers.
- `notifications`: Used to provide feedback when a problem is successfully saved to Notion or if a sync error occurs.
- `activeTab`: Used to capture the active tab's problem details when the user clicks "현재 페이지 문제 수동 저장" (Manual sync).
- `Host Permissions` (`*://swexpertacademy.com/*`, `*://*.jungol.co.kr/*`, `https://api.notion.com/*`): Strictly limited to the supported algorithm platforms and the Notion API endpoint.

## 5. Contact
For any questions or privacy inquiries, please open an issue on the project GitHub repository.
