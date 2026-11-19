# Algo Notion Sync (SWEA & JUNGOL)

> Chrome Web Store 배포 규격(Manifest V3)을 준수하여 만든 알고리즘 문제 풀이 Notion 동기화 확장프로그램입니다.

SWEA(SW Expert Academy) · 정올(JUNGOL) · 백준(Baekjoon)에서 문제를 풀고 정답(Accepted)을 받으면, 사용자의 활성 브라우저 세션을 활용하여 문제 정보 및 제출 코드를 사용자 개인의 Notion 데이터베이스에 자동으로 동기화합니다.

---

## 🌟 주요 특징 및 아키텍처

1. **무자격증명(Zero-Credential) 보안 원칙**:
   - 확장프로그램이나 백엔드 서버는 사용자의 사이트 비밀번호를 요구하거나 저장하지 않습니다.
   - 평소 브라우저에서 로그인한 기존 쿠키/세션을 읽어 문제 및 제출 상태를 파악합니다.
2. **확장 가능한 어댑터 패턴 (Adapter Pattern)**:
   - `core/adapter.ts`: 사이트별 어댑터 공통 인터페이스
   - `adapters/swea.ts`: SWEA 문제 정보, 통과 여부, 코드 추출
   - `adapters/jungol.ts`: 정올 문제 정보, 정답 여부, 코드 추출
   - `adapters/boj.ts`: 백준(BOJ) 등 타 플랫폼 추가 확장 가능한 구조
3. **Notion Internal Integration 토큰 연결**:
   - 팝업에서 `secret_...` 토큰을 붙여넣으면 바로 연결 (서버 불필요)
   - `server/`의 동반 OAuth 서버는 Public OAuth를 직접 운영하려는 경우를 위한 선택 사항이며,
     현재 확장프로그램은 이 서버 없이 동작합니다
4. **저장 필드**:
   - `문제명` (Title), `문제번호` (Text), `사이트` (Select: SWEA, JUNGOL), `난이도` (Select), `알고리즘` (Multi-select), `상태` (Select), `제출일` (Date), `언어` (Select), `문제 링크` (URL), 본문 내 `제출 코드` (Code Block)
5. **최소 권한 Manifest V3**:
   - `storage`, `cookies`, `notifications`, `activeTab`
   - 타겟 도메인(`swexpertacademy.com`, `jungol.co.kr`, `acmicpc.net`)과 `api.notion.com`으로만 호스트 권한 제한
   - `localhost` 등 사용하지 않는 호스트 권한은 두지 않음

---

## 📁 프로젝트 디렉토리 구조

```
algo-notion-sync/
├── extension/
│   ├── manifest.json              # Chrome Manifest V3 설정
│   ├── public/icons/              # 확장프로그램 아이콘 (16, 32, 48, 128)
│   └── src/
│       ├── adapters/              # SWEA, JUNGOL, BOJ 사이트별 추출기
│       ├── background/            # 백그라운드 Service Worker (동기화, 배지)
│       ├── content/               # 사이트 DOM 감지 및 결과 리스너
│       ├── core/                  # 어댑터 인터페이스 및 레지스트리
│       ├── popup/                 # 팝업 UI (HTML, CSS, TS)
│       ├── services/              # Notion API 연동 로직
│       └── types/                 # 공통 데이터 타입 정의
├── server/                        # Notion OAuth 최소 동반 서버
│   ├── src/index.ts               # OAuth 코드 교환 엔드포인트
│   ├── .env.example
│   └── tsconfig.json
├── tests/                         # 단위 테스트 및 Fixture
│   ├── fixtures/                  # SWEA, JUNGOL 실제 DOM 샘플 HTML
│   └── adapters.test.ts           # 어댑터 파싱 단위 테스트
├── dist/                          # 확장프로그램 빌드 산출물 (Chrome Load Unpacked용)
├── docs/                          # GitHub Pages (index.html, privacy.html)
├── store-assets/                  # 스토어 제출 에셋 (아이콘, 스크린샷, 프로모 타일, 제작 스크립트)
├── PRIVACY.md                     # 개인정보 처리방침
├── STORE_LISTING.md               # 스토어 등록 문구·권한 사유·데이터 사용 체크
├── STORE_CHECKLIST.md             # Chrome Web Store 배포 전 체크리스트
├── package.json
└── vite.config.ts
```

---

## 🚀 설치 및 개발 실행 방법

### 1. 패키지 설치
```bash
npm install
```

### 2. 확장프로그램 빌드
```bash
npm run build:extension
```
빌드가 완료되면 `dist/` 폴더에 Manifest V3 확장프로그램이 생성됩니다.

### 3. Chrome 브라우저에 등록 ("압축해제된 확장 프로그램을 로드합니다")
1. Chrome 브라우저에서 `chrome://extensions` 접속
2. 우측 상단의 **개발자 모드(Developer mode)** 스위치 ON
3. 좌측 상단의 **압축해제된 확장 프로그램을 로드합니다(Load unpacked)** 클릭
4. 이 프로젝트의 `dist/` 폴더를 선택

### 4. Notion OAuth 서버 실행 (선택 사항)
> **Tip**: 확장프로그램 팝업에서 Notion Internal Integration Secret(`secret_...`)을 직접 입력하는 경우 별도 서버 실행 없이도 동작합니다. Public OAuth 연동을 테스트하려면 동반 서버를 띄웁니다.

```bash
# 환경변수 설정
cp server/.env.example server/.env
# server/.env 파일에 NOTION_CLIENT_ID와 NOTION_CLIENT_SECRET을 입력

# 서버 실행
npm run dev:server
```
서버가 `http://localhost:3000`에서 대기합니다.

---

## 🧪 테스트 실행

SWEA · 정올 문제/제출 HTML Fixture와 백준 상태 표에 대한 파싱 테스트를 실행합니다.

```bash
npm test
```

---

## 📋 Notion 데이터베이스 설정 가이드

Notion에서 생성할 데이터베이스 컬럼(속성) 이름은 다음과 같습니다:
- **문제명**: 제목 (Title) - 필수
- **문제번호**: 텍스트 (Text)
- **사이트**: 선택 (Select) - `SWEA`, `JUNGOL`, `BOJ`
- **난이도**: 선택 (Select)
- **알고리즘**: 다중 선택 (Multi-select)
- **상태**: 선택 (Select) - `Accepted`, `Wrong Answer` 등
- **제출일**: 날짜 (Date)
- **언어**: 선택 (Select)
- **문제 링크**: URL

---

## 🛒 Chrome Web Store 제출 패키지 (v1.0.1)

| 항목 | 경로 |
| --- | --- |
| 제출용 zip | `algo-notion-sync-webstore-v1.0.1.zip` |
| 등록 문구 · 권한 사유 · 데이터 사용 체크 | `STORE_LISTING.md` |
| 제출 전 점검 목록 | `STORE_CHECKLIST.md` |
| 개인정보 처리방침 (웹) | `docs/privacy.html` → https://ryuheebaek.github.io/algo-notion-sync/privacy.html |
| 스크린샷 3장 (1280×800) | `store-assets/screenshots/shot1~3.png` |
| 소형 프로모션 타일 (440×280) | `store-assets/screenshots/promo.png` |
| 아이콘 | `extension/public/icons/icon{16,32,48,128}.png` |

스토어 그래픽은 `store-assets/html/`의 HTML 템플릿을 실제 브라우저로 렌더링해 만들었습니다
(팝업 화면은 실제 `dist/extension/src/popup/popup.html`을 그대로 띄워 캡처).
`store-assets/scripts/gen_icon.py`는 아이콘 생성 스크립트입니다.
