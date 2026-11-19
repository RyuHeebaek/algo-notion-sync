# Chrome Web Store 배포 체크리스트 (Manifest V3)

Chrome Web Store 개발자 대시보드에 심사를 요청하기 전 확인하는 목록입니다.
**현재 상태: v1.0.1 제출 패키지 준비 완료** (2026-11-19)

---

## 1. 매니페스트 및 권한 (Permissions)

- [x] **Manifest V3 준수** — `background.service_worker` + 선언적 `action`.
- [x] **단일 목적 원칙** — 알고리즘 풀이 정보의 Notion 아카이빙에 한정 (`STORE_LISTING.md` 4항).
- [x] **불필요한 권한 제거** — 사용하지 않던 `http://localhost:3000/*` 호스트 권한 삭제.
- [x] **권한 사유서** — `STORE_LISTING.md` 5항에 한국어/영어 문구 준비 완료.
  - `storage` — Notion 토큰·DB 설정 저장
  - `cookies` — SWEA/정올 세션 쿠키 **존재 여부**만 확인 (값 미열람·미전송)
  - `activeTab` — 팝업의 '수동 저장' 시 현재 탭 읽기
  - `notifications` — 저장 성공/실패 알림
  - 호스트 권한 — SWEA, 정올, 백준, Notion API로 한정
- [x] **원격 코드 미사용** — 모든 코드가 패키지에 포함됨.

---

## 2. 디자인 및 그래픽 에셋

- [x] **아이콘** — 정식 디자인으로 교체 완료 (그라데이션 타일 + `</>` 마크)
  - `extension/public/icons/icon16.png` (16×16)
  - `extension/public/icons/icon32.png` (32×32) ← 추가
  - `extension/public/icons/icon48.png` (48×48)
  - `extension/public/icons/icon128.png` (128×128, 96×96 아트워크 + 사방 16px 투명 여백)
  - 매니페스트 `icons` / `action.default_icon` 모두 16·32·48·128 등록
- [x] **스크린샷 3장** (1280×800) — `store-assets/screenshots/`
  - `shot1.png` 팝업(세션 상태·Notion 연동·데이터베이스 선택)
  - `shot2.png` 정답 제출 후 자동 동기화 알림(코드 포함)
  - `shot3.png` Notion 데이터베이스에 쌓인 풀이 기록
- [x] **소형 프로모션 타일** (440×280) — `store-assets/screenshots/promo.png`
- [ ] (선택) 대형 타일 920×680 / 마퀴 1400×560 — 필요 시 `store-assets/html/` 템플릿으로 생성

---

## 3. 개인정보 처리방침

- [x] `PRIVACY.md` 최신화 — 실제 매니페스트/코드와 일치 (2026-11-19)
  - 호스트 권한 7개 패턴 그대로 기재 (`acmicpc.net` 포함, `localhost` 제외)
  - `storage`/`cookies`/`notifications`/`activeTab` 사유 코드와 일치
  - 저장 항목(`chrome.storage.sync`: 토큰·DB ID·자동 저장·최근 상태) 및 삭제 방법 명시
- [x] 공개 URL용 페이지 `docs/privacy.html` 준비 (한국어 본문 + English Summary)
- [x] Notion 붙여넣기용 평문 `docs/privacy-notion.md` 준비
- [ ] **공개 URL 만들기 — 둘 중 하나**
  - A) GitHub Pages: 저장소 Settings → Pages → Source `Deploy from a branch` → `master` / `/docs`
    → `https://ryuheebaek.github.io/algo-notion-sync/privacy.html`
    (2026-11-19 기준 GitHub 앱 권한으로는 Pages API가 403이라 자동 활성화 불가 → 저장소 화면에서 직접 켜기)
  - B) Notion: 새 페이지에 `docs/privacy-notion.md` 붙여넣고 `공유 → 웹에 게시` → 그 주소 사용
- [ ] 대시보드 **개인정보 처리방침 URL** 칸에 위 주소 입력

---

## 4. 업로드용 ZIP 패키징

`dist/` 폴더 **안의 내용물**을 압축하고, `manifest.json`이 zip 루트에 오도록 만듭니다.

```bash
npm run build:extension
cd dist && zip -r ../algo-notion-sync-webstore-v1.0.1.zip .
```

- [x] `algo-notion-sync-webstore-v1.0.1.zip` 생성
- [x] 검증: zip 루트 `manifest.json`, `background`, `content_scripts`, `action.default_popup`,
      `icons` 16/32/48/128 경로가 모두 실제 파일과 일치
- [x] 검증: `popup.html`의 상대 경로(`../../../src/popup/popup.js`, `../../../assets/*`)가 실제 파일과 일치
- [x] 검증: `localhost:3000` 문자열이 패키지에서 완전히 제거됨

---

## 5. CWS 심사 팁

심사 메모(Reviewer notes)란에는 아래 문구를 그대로 붙여넣으면 심사 지연을 줄일 수 있습니다.

> "This extension uses content scripts and activeTab strictly to extract problem metadata (title, algorithm tags,
> submission result, source code) on SWEA, JUNGOL and Baekjoon pages the user is already viewing. The cookies
> permission is only used locally to check whether a session cookie is present, for a login indicator in the popup.
> No credentials or passwords are ever stored or transmitted to any third-party server. The only network destination
> is the user's own Notion workspace via https://api.notion.com. There is no developer backend."

---

## 6. 제출 후 남는 수동 단계

1. 개발자 계정 등록비($5) 결제 및 개발자 정보 확인
2. 새 항목 만들기 → zip 업로드
3. `STORE_LISTING.md`의 이름/한 줄 설명/상세 설명/카테고리/언어 입력
4. 권한 사유 5개 + 호스트 권한 4개 입력
5. 데이터 사용 체크(6항) 후 Limited Use 3문항 체크
6. 스크린샷 3장 + 프로모 타일 업로드
7. 개인정보 처리방침 URL 입력 (Pages 활성화 후)
8. 비공개(테스트) 공개 범위로 먼저 검토 요청 → 승인 후 공개 전환
