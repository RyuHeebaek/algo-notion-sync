# Privacy Policy — Algo Notion Sync

**Last Updated:** 2026-11-19
**Applies to:** Algo Notion Sync (Chrome extension, Manifest V3), version 1.0.1 and later
**Developer contact:** https://github.com/RyuHeebaek/algo-notion-sync/issues

---

## 한국어 요약

- **비밀번호는 절대 수집하지 않습니다.** SWEA·정올·백준에 이미 로그인된 브라우저 세션을 그대로 사용합니다.
- 문제 정보와 제출 코드는 **사용자 PC에서** 추출되어 **사용자의 Notion API로만** 전송됩니다. 개발자 서버는 존재하지 않으며 어떤 데이터도 보관하지 않습니다.
- Notion 통합 토큰과 설정은 **브라우저 확장 저장소(chrome.storage.sync)** 에만 저장됩니다.
- 광고·분석·추적 도구를 사용하지 않으며, 데이터를 판매하거나 제3자에게 제공하지 않습니다.

---

## 1. Single Purpose

Algo Notion Sync ("the Extension") has one purpose: to copy a user's algorithm problem
solving record — problem metadata and submission code that the user can already see on the
problem platform — into a Notion database that the user owns. The Extension does nothing else
and has no secondary function.

## 2. No Credential Collection

The Extension **never** requests, reads, fills, stores, or transmits the user's password or
login credentials for SWEA (`swexpertacademy.com`), JUNGOL (`jungol.co.kr`), or Baekjoon
(`acmicpc.net`). It works only inside the browser session that the user has already
authenticated themselves.

## 3. Data the Extension Handles

When the user is on a supported problem or submission page, the Extension reads the page the
user is already looking at:

| Data | Source | Why |
| --- | --- | --- |
| Problem title, problem number, difficulty level, algorithm tags | The problem page DOM | To fill Notion properties |
| Submission result (Accepted / Wrong Answer / …), language, submission time | The submission / result page DOM | To fill Notion properties |
| Submitted source code | The submission page DOM (when the site displays it) | To append a code block to the Notion page |
| Problem URL | The current tab URL | As a bookmark inside the Notion page |
| Display name shown on the site | The site's own header DOM | Only to show "logged in as …" in the popup. Not stored, not transmitted. |

By default a sync runs automatically **only** when the submission result on the page is
`Accepted`. The user can turn automatic sync off and use the manual "save current page"
button instead.

In addition, the popup reads **whether** the user's session cookie exists for
`swexpertacademy.com` and `jungol.co.kr` so it can display a login indicator. The cookie
values themselves are not read, not stored, and not transmitted.

## 4. Where Data Goes

- **Destination:** the official Notion API (`https://api.notion.com/v1`) only, using the
  integration token that the user supplied. The Extension talks to no other host.
- **No developer server:** this project ships no backend that receives, logs, or stores user
  data. There is no analytics, no telemetry, no advertising, and no crash reporting.
- **No sale or sharing:** data is never sold, rented, or disclosed to third parties other than
  the user's own Notion workspace.

## 5. Local Storage

The Extension stores its settings with `chrome.storage.sync`, which belongs to the user's own
Chrome profile and, if Chrome sync is enabled, is synchronized by Chrome across that user's
signed-in devices:

- the Notion integration token the user entered,
- the selected Notion database ID,
- the automatic sync on/off preference,
- the last sync status, message, and time.

The token is kept as the user entered it. The Extension does not add its own encryption layer
to it, so on a shared computer the user should use "연결 해제" (disconnect) when finished,
which immediately clears the token and the database ID. Uninstalling the Extension removes all
stored settings.

## 6. Permissions and Why They Are Needed

| Permission | Reason |
| --- | --- |
| `storage` | Save the Notion token, the chosen database, and the auto-sync preference locally. |
| `cookies` | Check only whether a session cookie exists on SWEA / JUNGOL, to show login status in the popup. Cookie values are never read, stored, or transmitted. |
| `notifications` | Tell the user whether a save to Notion succeeded or failed. |
| `activeTab` | Read the page the user is on when they press "현재 페이지 문제 수동 저장" (manual save). |

Host permissions, exactly as declared in `manifest.json`:

| Host pattern | Reason |
| --- | --- |
| `*://swexpertacademy.com/*`, `*://*.swexpertacademy.com/*` | Read problem and submission data on SWEA. |
| `*://jungol.co.kr/*`, `*://*.jungol.co.kr/*` | Read problem and submission data on JUNGOL. |
| `*://acmicpc.net/*`, `*://*.acmicpc.net/*` | Read problem and submission data on Baekjoon. |
| `https://api.notion.com/*` | Create and update pages in the user's Notion database. |

No other host is requested. In particular the Extension does not request access to
`localhost`, to the user's general browsing history, or to any site outside the three problem
platforms above.

## 7. Limited Use

The Extension's use of information obtained through Chrome extension permissions is limited to
providing its single purpose described in Section 1. The use of information received from
Google APIs will adhere to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq),
including the Limited Use requirements. Data is not used for advertising, is not sold, and is
not transferred to third parties except as needed to provide the user-facing feature described
above (writing to the user's own Notion workspace).

## 8. Children

The Extension is a developer tool for algorithm practice and is not directed to children under
13. It does not knowingly collect any personal information from anyone.

## 9. Changes

If this policy changes, the "Last Updated" date above changes with it and the new version is
published at the same URL.

## 10. Contact

Questions or deletion requests: open an issue at
https://github.com/RyuHeebaek/algo-notion-sync/issues
