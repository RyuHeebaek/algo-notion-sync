# Chrome Web Store 배포 전 체크리스트 (Manifest V3)

Chrome Web Store 개발자 대시보드(Chrome Developer Dashboard)에 심사를 요청하기 전 아래 항목을 점검하세요.

---

## 1. 매니페스트 및 권한 (Permissions) 최소화
- [x] **Manifest V3 준수**: `background.service_worker` 및 선언적 액션 사용.
- [x] **단일 목적 원칙 (Single Purpose Policy)**: 알고리즘 문제 풀이 정보의 Notion 아카이빙 목적에 국한.
- [x] **권한 사유서 (Permission Justifications)**:
  - `storage`: 사용자의 Notion 토큰 및 DB 설정 저장
  - `cookies`: SWEA/정올 로그인 상태 감지 (서버 전송 없음)
  - `activeTab`: 팝업 창에서 사용자가 '수동 저장' 버튼 클릭 시 문제 추출
  - `notifications`: 동기화 완료 및 실패 알림
  - `Host Permissions`: SWEA, 정올, 백준, Notion API로 한정

---

## 2. 디자인 및 그래픽 에셋
- [ ] **아이콘 에셋**:
  - `extension/public/icons/icon16.png` (16x16)
  - `extension/public/icons/icon48.png` (48x48)
  - `extension/public/icons/icon128.png` (128x128)
  - *(현재 플레이스홀더 아이콘이 적용되어 있으므로 정식 서비스 로고 디자인으로 교체 권장)*
- [ ] **스토어 프로모션 이미지**:
  - 소형 프로모션 타일: 440 x 280 px
  - 대형 프로모션 타일 (선택): 920 x 680 px
  - 마퀴 프로모션 타일 (선택): 1400 x 560 px
- [ ] **스크린샷**:
  - 최소 1개 이상 (권장 3~5개, 1280 x 800 또는 640 x 400)
  - 1) 팝업 UI (SWEA/정올 로그인 상태 및 Notion DB 선택 화면)
  - 2) SWEA 통과 화면 자동 동기화 예시
  - 3) Notion 데이터베이스에 저장된 문제 표 및 소스코드 뷰

---

## 3. 개인정보 처리방침 (Privacy Policy)
- [x] `PRIVACY.md` 작성 완료 (비밀번호 미수집, 쿠키는 로컬 상태 확인용으로만 활용).
- [ ] 웹에 공개된 URL 필요: GitHub Pages 또는 Notion 공개 페이지에 `PRIVACY.md` 내용을 게시한 후 해당 링크를 CWS 대시보드의 **개인정보 처리방침 URL**에 입력.

---

## 4. 업로드용 ZIP 패키징
배포용 zip 파일은 `dist/` 폴더 안의 내용물을 압축하여 생성합니다:

```bash
# dist 폴더로 이동하여 zip 파일 생성
cd dist
zip -r ../algo-notion-sync-v1.0.0.zip ./*
```

---

## 5. CWS 심사 팁
- 심사 메모(Justification for permissions)란에 다음 문구를 기재하면 심사 지연을 방지할 수 있습니다:
  > "This extension uses content scripts and activeTab strictly to extract problem metadata (title, algorithm tags, submission code) on SWEA and JUNGOL pages. The cookies permission is only used locally to check if the session cookie is present for login status display. No credentials or passwords are ever stored or transmitted to any third-party server."
