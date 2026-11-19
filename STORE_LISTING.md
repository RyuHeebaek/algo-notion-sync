# Chrome Web Store 등록 정보 — Algo Notion Sync v1.0.1

> 이 파일의 문구를 그대로 Chrome Web Store 개발자 대시보드에 붙여넣으면 됩니다.
> 글자 수 제한: 이름 75자 / 한 줄 설명 132자 / 상세 설명 16,000자.

---

## 1. 기본 항목

| 항목 | 값 |
| --- | --- |
| 확장프로그램 이름 | `Algo Notion Sync` |
| 버전 | `1.0.1` |
| 카테고리 | 생산성 (Productivity) |
| 기본 언어 | 한국어 (ko) |
| 지원 언어 | 한국어, English |
| 공개 범위 | 공개 (Public) |
| 개인정보 처리방침 URL | `https://ryuheebaek.github.io/algo-notion-sync/privacy.html` (Pages 활성화 후) |
| 홈페이지 URL (선택) | `https://github.com/RyuHeebaek/algo-notion-sync` |
| 지원 URL (선택) | `https://github.com/RyuHeebaek/algo-notion-sync/issues` |

> **개인정보 처리방침 URL — 현재 상태 (2026-11-19)**
>
> 저장소는 공개 상태이고 `docs/privacy.html`(한국어 본문 + English Summary)이 `master`에 들어가 있습니다.
> 다만 GitHub Pages는 아직 **켜져 있지 않습니다.** GitHub 앱 권한으로는 Pages 설정 API가 403
> (`Resource not accessible by integration`)으로 막혀 있어, 아래 둘 중 하나가 필요합니다.
>
> **방법 A — GitHub Pages (권장, 클릭 1회)**
> 저장소 `Settings → Pages → Build and deployment`에서 Source를 `Deploy from a branch`,
> Branch를 `master`, 폴더를 `/docs`로 저장하면 1~2분 뒤
> `https://ryuheebaek.github.io/algo-notion-sync/privacy.html` 이 열립니다.
>
> **방법 B — Notion 공개 페이지 (바로 사용 가능)**
> Notion에서 새 페이지 → `docs/privacy-notion.md` 내용 붙여넣기(또는 Import → Markdown)
> → `공유 → 웹에 게시` → 그 주소를 대시보드에 입력. raw/blob 링크는 심사에서 인정되지 않습니다.

---

## 2. 한 줄 설명 (132자 이내)

**한국어 (59자)**
```
SWEA·정올·백준에서 정답을 받으면 문제 정보와 제출 코드를 내 Notion 데이터베이스에 자동으로 저장합니다.
```

**English (115자)**
```
Save accepted SWEA, JUNGOL and Baekjoon solutions — problem details and submitted code — to your own Notion database.
```

---

## 3. 상세 설명 (16,000자 이내)

### 한국어 (기본)

```
정답을 받은 순간, 풀이 기록이 Notion에 쌓입니다.

Algo Notion Sync는 SWEA(SW Expert Academy) · 정올(JUNGOL) · 백준(Baekjoon)에서 문제를 풀고 정답(Accepted)을 받으면,
문제 정보와 제출한 코드를 사용자 본인의 Notion 데이터베이스에 자동으로 정리해 주는 확장프로그램입니다.
따로 복사해서 붙여넣을 필요 없이, 제출 한 번이면 기록이 남습니다.

■ 이렇게 동작합니다
1. 평소처럼 문제를 풀고 코드를 제출합니다.
2. 채점 결과가 '정답(Accepted)'으로 확인되면, 확장프로그램이 현재 페이지에서 문제 정보와 제출 코드를 읽습니다.
3. 사용자가 지정한 Notion 데이터베이스에 페이지를 만들고, 언어에 맞는 코드 블록으로 코드를 붙여 넣습니다.
4. 저장 결과는 알림과 배지(✓ / !)로 바로 알려 줍니다.

■ 저장되는 내용
· 문제 제목, 문제 번호, 난이도, 알고리즘 태그
· 제출 결과(성공/실패), 언어, 제출 시각
· 제출한 소스 코드 (코드 블록)
· 문제 링크 (북마크)

Notion 데이터베이스의 컬럼 이름이 '문제명·문제번호·사이트·난이도·알고리즘·상태·제출일·언어·문제 링크' 중
무엇이든, 이름과 속성 타입을 보고 알맞은 곳에 채워 넣습니다. 원하는 컬럼만 만들어 두어도 동작합니다.
같은 문제를 다시 제출하면 새 페이지를 만들지 않고 기존 페이지를 갱신합니다.

■ 안전하게 동작합니다
· 비밀번호를 요구하지도, 저장하지도 않습니다. 브라우저에 이미 로그인된 세션만 사용합니다.
· 데이터는 사용자의 Notion API(api.notion.com)로만 전송됩니다. 개발자가 운영하는 서버는 없으며,
  어떤 데이터도 개발자에게 전송되거나 보관되지 않습니다.
· 광고, 분석, 추적 도구를 사용하지 않습니다.
· Notion 통합 토큰과 설정은 브라우저 확장 저장소(chrome.storage.sync)에만 저장되며,
  팝업의 '연결 해제'로 즉시 지울 수 있습니다.

■ 준비물
· Notion 계정과, 페이지를 저장할 데이터베이스 1개
· Notion API 통합 토큰(Internal Integration Secret, secret_...)
  → notion.so/my-integrations 에서 만들고, 데이터베이스 화면의 '연결'에서 해당 통합을 추가하면 됩니다.
  → 토큰은 팝업의 '토큰 직접 입력' 칸에 붙여넣으면 됩니다.

■ 이런 분께 좋습니다
· SSAFY, SW 역량테스트, 정올, 백준을 꾸준히 푸는 취업 준비생
· 푼 문제를 블로그나 노션에 정리하다 복사·붙여넣기에 지친 분
· 사이트·난이도·알고리즘 태그로 내 풀이를 다시 찾아보고 싶은 분

■ 알려 두실 점
· 자동 저장은 페이지에 표시된 채점 결과가 '정답'일 때만 실행됩니다.
· 결과가 표시되지 않는 화면(문제 설명만 보이는 페이지 등)에서는 아무것도 저장하지 않습니다.
· 정답을 받은 직후 결과 창이 늦게 뜨는 경우, 확장프로그램이 최대 몇 초 기다렸다가 확인합니다.
· 사이트 구조가 크게 바뀌면 일부 항목이 인식되지 않을 수 있습니다. 그때는 팝업의
  '현재 페이지 문제 수동 저장' 버튼을 사용하거나 이슈로 알려 주세요.
```

### English

```
Your accepted solutions, saved to Notion as you solve.

Algo Notion Sync is a Chrome extension that keeps a personal Notion database of the algorithm problems you solve on
SWEA (SW Expert Academy), JUNGOL and Baekjoon. When a submission is judged Accepted, it reads the problem details and
the submitted source code from the page you are already on and writes them into your own Notion database — no copy and
paste.

How it works
1. Solve a problem and submit your code as usual.
2. When the judging result on the page is Accepted, the extension reads the problem metadata and your submitted code.
3. It creates a page in the Notion database you selected, with the code in a language-appropriate code block.
4. Success or failure is shown with a notification and the toolbar badge.

What gets saved
· Problem title, number, difficulty level and algorithm tags
· Result, language and submission time
· The submitted source code, as a code block
· A bookmark to the problem

The extension matches your database columns by name and property type (title, number, select, multi-select, date, url,
rich text), so you only need the columns you actually want. Submitting the same problem again updates the existing page
instead of creating a duplicate.

Privacy
· It never asks for or stores your SWEA / JUNGOL / Baekjoon password. It works inside the session you are already
  signed in to.
· Data is sent only to your own Notion workspace through the official Notion API (api.notion.com). There is no
  developer server, no analytics, no advertising and no tracking.
· The Notion integration token and settings stay in your browser's extension storage (chrome.storage.sync) and can be
  cleared at any time with "disconnect".
· See the privacy policy: https://ryuheebaek.github.io/algo-notion-sync/privacy.html

Requirements
· A Notion account and one database
· A Notion internal integration token, created at notion.so/my-integrations and connected to that database

Notes
· Automatic saving runs only when the result shown on the page is Accepted.
· Nothing is saved on pages that do not show a judging result.
· If a site changes its layout significantly, some fields may not be detected; use the manual "save this page" button
  in the popup or open an issue.
```

---

## 4. 단일 목적 문장 (Single Purpose)

> **한국어** — 이 확장프로그램의 유일한 목적은 사용자가 이미 보고 있는 SWEA·정올·백준 문제 페이지에서 문제 정보와
> 제출 코드를 읽어, 사용자가 소유한 Notion 데이터베이스에 기록하는 것입니다.
>
> **English** — The single purpose of this extension is to copy the algorithm problem details and submitted source
> code that the user is already viewing on SWEA, JUNGOL or Baekjoon into a Notion database the user owns.

---

## 5. 권한 사유 (Permission Justifications)

심사 화면의 각 권한 입력란에 아래 문구를 그대로 사용하면 됩니다.

| 권한 | 사유 (한국어) | Justification (English) |
| --- | --- | --- |
| `storage` | 사용자가 입력한 Notion 통합 토큰, 선택한 데이터베이스 ID, 자동 저장 설정, 마지막 동기화 상태를 브라우저에 저장하기 위해 필요합니다. 외부로 전송되지 않습니다. | Stores the user's Notion integration token, the selected database ID, the auto-sync preference and the last sync status locally. Nothing is sent to us. |
| `cookies` | SWEA(`swexpertacademy.com`)와 정올(`jungol.co.kr`)에 세션 쿠키가 있는지만 확인하여 팝업에 로그인 상태를 표시합니다. 쿠키 값은 읽지도, 저장하지도, 전송하지도 않습니다. | Used only to detect whether a session cookie exists on SWEA/JUNGOL so the popup can show a login indicator. Cookie values are never read, stored, or transmitted. |
| `notifications` | Notion 저장 성공·실패를 사용자에게 알리기 위해 사용합니다. | Shows a desktop notification when a save to Notion succeeds or fails. |
| `activeTab` | 사용자가 팝업에서 '현재 페이지 문제 수동 저장'을 눌렀을 때, 그 탭의 문제 정보를 읽기 위해 사용합니다. | Reads the current tab's problem data when the user presses the manual "save this page" button in the popup. |
| Host — `*://swexpertacademy.com/*`, `*://*.swexpertacademy.com/*` | SWEA 문제 페이지와 제출 결과 페이지에서 문제 정보와 제출 코드를 읽습니다. | Reads problem and submission data on SWEA problem and result pages. |
| Host — `*://jungol.co.kr/*`, `*://*.jungol.co.kr/*` | 정올 문제 페이지와 제출 결과 페이지에서 문제 정보와 제출 코드를 읽습니다. | Reads problem and submission data on JUNGOL pages. |
| Host — `*://acmicpc.net/*`, `*://*.acmicpc.net/*` | 백준 문제 페이지와 채점 현황 페이지에서 문제 정보와 제출 결과를 읽습니다. | Reads problem and judging data on Baekjoon pages. |
| Host — `https://api.notion.com/*` | 사용자가 지정한 Notion 데이터베이스에 페이지를 만들고 갱신합니다. | Creates and updates pages in the Notion database the user selected. |

**원격 코드 사용 여부:** 사용하지 않습니다(모든 코드는 패키지에 포함).

---

## 6. 데이터 사용 (Data Usage) 체크리스트

대시보드의 "데이터 사용" 섹션에서 아래와 같이 선택합니다.

- [x] **개인 식별 정보** — 수집하지 않음 (Notion 통합 토큰은 사용자 브라우저에만 저장, 개발자에게 전송 없음)
- [x] **건강 정보** — 수집하지 않음
- [x] **금융 및 결제 정보** — 수집하지 않음
- [x] **인증 정보(비밀번호 등)** — 수집하지 않음
- [x] **개인 커뮤니케이션** — 수집하지 않음
- [x] **위치 정보** — 수집하지 않음
- [x] **웹 기록(방문 기록)** — 수집하지 않음
- [x] **사용자 활동** — 수집하지 않음 (방문한 문제 페이지 정보만 사용자 본인의 Notion으로 전송)
- [x] **웹사이트 콘텐츠** — 수집함(문제 설명·제출 코드를 읽음) — **단, 개발자 서버로 전송하지 않고 사용자 본인의 Notion으로만 전송**

그리고 아래 세 문항에 모두 해당(체크)합니다.

- [x] 판매·대여하지 않습니다 — I do not sell or transfer user data to third parties, apart from the approved use cases.
- [x] 제3자 광고에 사용하지 않습니다 — I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- [x] 신용도 판단에 사용하지 않습니다 — I do not use or transfer user data to determine creditworthiness or for lending purposes.

---

## 7. 제출 파일

| 파일 | 규격 | 용도 |
| --- | --- | --- |
| `algo-notion-sync-webstore-v1.0.1.zip` | zip (루트에 `manifest.json`) | 패키지 업로드 |
| `store-assets/icons/icon128.png` | 128×128 PNG | 스토어 아이콘 |
| `store-assets/screenshots/shot1.png` | 1280×800 PNG | 스크린샷 1 — 팝업(Notion 연동·설정) |
| `store-assets/screenshots/shot2.png` | 1280×800 PNG | 스크린샷 2 — 정답 제출 후 자동 동기화 알림 |
| `store-assets/screenshots/shot3.png` | 1280×800 PNG | 스크린샷 3 — Notion 데이터베이스에 쌓인 기록 |
| `store-assets/screenshots/promo.png` | 440×280 PNG | 소형 프로모션 타일 |

스크린샷 캡션(선택):

1. 팝업에서 사이트 로그인 상태와 Notion 데이터베이스를 고릅니다.
2. 정답(Accepted)을 받으면 문제 정보와 코드가 자동으로 저장됩니다.
3. Notion에는 문제·난이도·알고리즘·코드까지 정리된 기록이 쌓입니다.
