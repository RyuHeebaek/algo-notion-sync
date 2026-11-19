# 개인정보 처리방침 — Algo Notion Sync

최종 수정일: 2026-11-19 · 적용 버전: 1.0.1 이상 · Chrome 확장프로그램(Manifest V3)

> 이 문서는 Notion 페이지에 그대로 붙여넣어 공개 URL로 쓸 수 있는 평문 버전입니다.
> Notion에서 새 페이지를 만들고 `Import → Markdown` 으로 이 파일을 가져오거나, 아래 내용을 복사해 붙여넣은 뒤
> **공유 → 웹에 게시(Share to web)** 를 켜고 그 주소를 Chrome Web Store 대시보드의 개인정보 처리방침 URL에 넣으세요.

---

## 한눈에 보기

- 비밀번호를 수집하지 않습니다. 이미 로그인된 브라우저 세션만 사용합니다.
- 문제 정보·제출 코드는 사용자 PC에서 추출되어 **사용자 본인의 Notion API로만** 전송됩니다.
- 개발자 서버가 없으며, 어떤 데이터도 개발자에게 전송되거나 보관되지 않습니다.
- 광고·분석·추적 도구를 쓰지 않고, 데이터를 판매하지 않습니다.

## 1. 단일 목적

Algo Notion Sync(이하 "확장프로그램")의 목적은 하나입니다. 사용자가 이미 보고 있는 알고리즘 문제 페이지에서 문제 정보와 제출 코드를 읽어, 사용자가 소유한 Notion 데이터베이스에 기록하는 것입니다. 그 외의 기능은 없습니다.

## 2. 비밀번호·로그인 정보

확장프로그램은 SWEA(swexpertacademy.com), 정올(jungol.co.kr), 백준(acmicpc.net)의 비밀번호나 로그인 정보를 요구·열람·저장·전송하지 않습니다. 사용자가 브라우저에서 이미 로그인해 둔 세션 안에서만 동작합니다.

## 3. 처리하는 데이터

| 데이터 | 수집 위치 | 용도 |
| --- | --- | --- |
| 문제 제목, 문제 번호, 난이도, 알고리즘 태그 | 문제 페이지 화면(DOM) | Notion 속성 채우기 |
| 채점 결과(정답/오답 등), 언어, 제출 시각 | 제출·결과 페이지 화면 | Notion 속성 채우기 |
| 제출 소스 코드 | 제출 페이지 화면(사이트가 보여줄 때) | Notion 페이지 본문에 코드 블록 추가 |
| 문제 URL | 현재 탭 주소 | Notion 페이지 북마크 |
| 사이트에 표시된 사용자 닉네임 | 사이트 상단 화면 | 팝업의 "로그인됨" 표시용. 저장·전송하지 않음 |

자동 저장은 페이지의 채점 결과가 정답(Accepted)일 때만 실행되며, 사용자가 자동 저장을 끄고 "현재 페이지 문제 수동 저장" 버튼으로 직접 저장할 수도 있습니다.

또한 팝업에서 로그인 여부를 표시하기 위해 swexpertacademy.com / jungol.co.kr의 세션 쿠키가 존재하는지만 확인합니다. 쿠키 값을 읽거나 저장하거나 전송하지 않습니다.

## 4. 데이터가 가는 곳

- 전송 대상: 사용자가 입력한 통합 토큰으로 호출하는 Notion 공식 API(https://api.notion.com/v1) 뿐입니다. 다른 서버로는 전송하지 않습니다.
- 개발자 서버 없음: 이 프로젝트는 사용자 데이터를 받거나 기록하는 백엔드를 운영하지 않습니다. 분석·원격 측정·광고·오류 수집 도구도 없습니다.
- 판매·제공 없음: 데이터를 판매·대여하거나 제3자에게 제공하지 않습니다.

## 5. 로컬 저장

설정은 chrome.storage.sync에 저장됩니다. 이는 사용자 Chrome 프로필의 저장소이며, Chrome 동기화가 켜져 있으면 사용자가 로그인한 기기 사이에 Chrome이 동기화합니다.

- 저장 항목: Notion 통합 토큰, 선택한 데이터베이스 ID, 자동 저장 설정, 마지막 동기화 상태·시각
- 암호화: 토큰은 입력한 그대로 저장되며 확장프로그램이 별도 암호화를 추가하지 않습니다
- 삭제: 팝업의 "연결 해제"로 즉시 삭제되며, 확장프로그램을 제거하면 저장된 설정이 모두 삭제됩니다

공용 PC 안내: 여러 사람이 쓰는 컴퓨터에서는 사용 후 "연결 해제"를 눌러 토큰을 지우는 것을 권장합니다.

## 6. 권한과 사용 이유

| 권한 | 이유 |
| --- | --- |
| storage | Notion 토큰, 선택한 데이터베이스, 자동 저장 설정을 로컬에 저장 |
| cookies | SWEA·정올의 세션 쿠키 존재 여부만 확인해 팝업에 로그인 상태 표시 (값은 읽지 않음) |
| notifications | Notion 저장 성공·실패 알림 |
| activeTab | "현재 페이지 문제 수동 저장"을 눌렀을 때 그 탭의 문제 정보 읽기 |

호스트 권한은 manifest.json에 선언된 아래 패턴이 전부입니다.

| 호스트 패턴 | 이유 |
| --- | --- |
| `*://swexpertacademy.com/*`, `*://*.swexpertacademy.com/*` | SWEA 문제·제출 정보 읽기 |
| `*://jungol.co.kr/*`, `*://*.jungol.co.kr/*` | 정올 문제·제출 정보 읽기 |
| `*://acmicpc.net/*`, `*://*.acmicpc.net/*` | 백준 문제·제출 정보 읽기 |
| `https://api.notion.com/*` | 사용자 Notion 데이터베이스에 페이지 생성·수정 |

그 외의 호스트는 요청하지 않습니다. localhost, 브라우저 방문 기록, 위 세 사이트 이외의 페이지에는 접근하지 않습니다.

## 7. 제한적 사용(Limited Use)

확장프로그램은 위 1항의 단일 목적을 수행하기 위해서만 데이터를 사용합니다. Google API를 통해 받은 정보의 사용은 Chrome Web Store 사용자 데이터 정책과 제한적 사용(Limited Use) 요구사항을 따릅니다. 데이터는 광고에 사용되지 않고, 판매되지 않으며, 위 기능 제공에 필요한 경우(사용자 본인의 Notion 워크스페이스에 기록하는 경우)를 제외하고 제3자에게 이전되지 않습니다.

## 8. 아동

이 확장프로그램은 알고리즘 학습용 개발 도구로, 만 13세 미만 아동을 대상으로 하지 않으며 아동의 개인정보를 알면서 수집하지 않습니다.

## 9. 방침 변경

방침이 바뀌면 위의 "최종 수정일"을 갱신하고 같은 URL에 새 버전을 게시합니다.

## 10. 문의

문의 및 삭제 요청: https://github.com/RyuHeebaek/algo-notion-sync/issues

---

## English Summary

**Algo Notion Sync** (Chrome, Manifest V3) has a single purpose: to copy the algorithm problem metadata and submission code that the user is already viewing on SWEA, JUNGOL, or Baekjoon into a Notion database the user owns.

- It never collects, reads, or stores passwords or login credentials.
- Extracted data is sent only to https://api.notion.com/v1. There is no developer server, no analytics, no advertising, and no data sale.
- The Notion integration token, database ID, and preferences are kept in chrome.storage.sync (the user's own Chrome profile). The token is stored as entered, without additional encryption; "disconnect" clears it immediately.
- Permissions used: storage, cookies (presence of a session cookie only), notifications, activeTab. Host permissions are limited to swexpertacademy.com, jungol.co.kr, acmicpc.net (each with subdomains) and api.notion.com.
- Use of information follows the Chrome Web Store User Data Policy, including the Limited Use requirements.

Last Updated: 2026-11-19 · Contact: https://github.com/RyuHeebaek/algo-notion-sync/issues
