# GitHub Releases를 통한 어디서나 배포 & 사용 가이드

이 문서는 Chrome Web Store에 등록하지 않고도, GitHub Releases를 활용해 **어느 컴퓨터에서나 1분 만에 확장프로그램을 설치하여 사용하는 방법**을 안내합니다.

---

## 1단계: GitHub에 내 저장소(Repository) 만들기

1. [GitHub](https://github.com)에 로그인합니다.
2. 우측 상단 **[+]** 아이콘 -> **[New repository]** 클릭
3. 저장소 이름(Repository name)에 `algo-notion-sync` 입력
4. 공개 설정(Public 또는 Private 원하는 것 선택) 후 **[Create repository]** 클릭

---

## 2단계: 프로젝트 코드 GitHub에 푸시 (처음 1회)

로컬 터미널을 열고 프로젝트 경로로 이동하여 Git 설정을 진행합니다:

```bash
cd /Users/ryuheebaek/.gemini/antigravity/scratch/algo-notion-sync

# git 초기화
git init
git add .
git commit -m "feat: initial release of Algo Notion Sync Manifest V3"

# GitHub 저장소 연결 (본인 github 계정/저장소 주소 입력)
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/algo-notion-sync.git
git push -u origin main
```

---

## 3단계: GitHub Release 등록 & 압축 파일 첨부

1. GitHub 웹사이트의 생성된 `algo-notion-sync` 저장소 페이지로 들어갑니다.
2. 우측 사이드바의 **[Releases]** 섹션에서 **[Create a new release]**를 클릭합니다.
3. 입력 항목:
   - **Choose a tag**: `v1.0.0` 입력 후 *Create new tag* 선택
   - **Release title**: `v1.0.0 - Algo Notion Sync Initial Release`
   - **Attach binaries by dropping them here or selecting them**:
     - 아래 경로에 이미 준비된 ZIP 파일을 드래그 앤 드롭으로 업로드합니다:
     - 📁 **파일 위치**:
       `/Users/ryuheebaek/.gemini/antigravity/scratch/algo-notion-sync/algo-notion-sync-release-v1.0.0.zip`
4. 하단의 **[Publish release]** 초록색 버튼을 클릭합니다.

---

## 4단계: 다른 컴퓨터(학교, 회사, 집) 어디서나 1분 설치법!

이제 새로운 컴퓨터에서 개발 환경(Node.js, Git 등)을 설치할 필요가 전혀 없습니다:

1. **다운로드**:
   - 다른 컴퓨터 브라우저에서 내 GitHub 저장소의 Releases 페이지(`https://github.com/<계정명>/algo-notion-sync/releases`)로 접속
   - `algo-notion-sync-release-v1.0.0.zip` 파일을 다운로드하고 원하는 폴더에 **압축 해제**합니다.
2. **Chrome 확장 프로그램 등록**:
   - Chrome 주소창에 `chrome://extensions` 입력
   - 우측 상단 **[개발자 모드]** 토글 스위치 켜기 (ON)
   - 좌측 상단 **[압축해제된 확장 프로그램을 로드합니다]** 클릭
   - 방금 압축 해제한 폴더를 선택합니다.
3. **사용 시작**:
   - 브라우저 상단 툴바의 퍼즐 조각(확장 프로그램) 아이콘에서 **Algo Notion Sync**를 핀 고정합니다.
   - 팝업을 열어 Notion 토큰 입력 및 저장할 DB를 선택하면 즉시 동작합니다!
