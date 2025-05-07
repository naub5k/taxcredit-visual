---
title: "React - Azure Functions 연동 및 CORS 디버깅 최종 정리"
date: 2025-05-07
summary: "로컬 개발환경과 Azure 배포환경에서 발생한 504 오류 및 CORS 이슈를 해결한 전체 과정과 원인 분석 정리."
---

## ✅ 개요

React 앱과 Azure Function 간 통신에서 발생한 `504 Gateway Timeout` 오류와 CORS 정책 오류를 중심으로, 문제 발생 원인과 해결 과정을 정리한다. 이 문서는 이후 같은 문제 재발 방지를 위한 내부 기준 자료로 활용된다.

---

## 🧭 문제 발생 배경 및 초기 상태

- **프로젝트 구조**: `my-app/` 하위에 React 앱과 Azure Function(app/api/getSampleList)이 공존
- **로컬 실행**:
  - React 앱: `npm start` (localhost:3000)
  - Azure Function: `func start` (localhost:7071)
  - `/api` 프록시 연결 (setupProxy.js) → 로컬에서는 정상 작동

- **문제 현상**:
  - 로컬에서 정상 작동하던 API가 배포 후 **504 Gateway Timeout** 또는 **CORS 오류** 발생


## 🚫 주요 원인

1. **Function 디렉토리 구조 부적합**
   - `api/getSampleList/` 형태는 Azure Functions가 인식 불가 → `my-app/getSampleList/`로 이동 필요

2. **배포 환경에서의 CORS 차단**
   - 프록시가 없는 상태에서 `fetch('/api/..')` 요청 시, 브라우저 보안 정책(CORS)에 의해 차단

3. **실제 문제 은폐 요소**
   - 로컬에서는 setupProxy.js로 인해 CORS가 발생하지 않음 → 초기 분석에서는 CORS가 원인으로 드러나지 않음


## 🔍 해결 과정 정리 (전체 흐름)

### 1. 디렉토리 구조 정리
- `api/getSampleList` → `my-app/getSampleList`
- `api/utils` → `my-app/utils`
- 루트에 `host.json`, `local.settings.json` 통합 정리

### 2. Function 코드 개선
- `getSampleList/index.js`에 CORS 응답 헤더 추가:
  ```js
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  ```
- OPTIONS 요청 핸들링 로직 추가

### 3. React 코드 수정
- 기존 상대경로 `/api/getSampleList?...` → 절대경로 `http://localhost:7071/api/getSampleList?...` 전환
- fetch 옵션에 `{ mode: 'cors' }` 추가

### 4. 실행 방식 전환
- `setupProxy.js` 경로 무력화
- React와 Function을 독립 실행 & 테스트 → 배포 환경을 그대로 모사

### 5. Git 커밋 및 GitHub Actions 배포
- 구조/코드/설정 변경 후 `master` 브랜치로 푸시
- GitHub Actions 자동 실행 → React 앱과 Function 배포 완료


## ✅ 최종 결과

- 배포된 웹앱에서 API 호출 성공적으로 이루어짐
- CORS 오류 해결됨, 더 이상 프록시 필요하지 않음
- React 앱의 fetch 요청이 Function App에 직접 도달하며 응답 수신 정상화


## 🎓 교훈 및 개선점

### 🧠 GPT 측 인식 오류 원인
- 프록시가 CORS 오류를 가림 → 브라우저 콘솔 확인 유도 부족
- 504 오류 중심의 원인 분석이 DB 타임아웃 쪽에 초점 → 구조 및 정책 검증 우선순위 미흡

### 📌 개선 방향
1. 오류 발생 시 브라우저 콘솔 및 네트워크 탭 확인 유도 루틴 강화
2. 배포 전후 환경차이에 따른 API 호출 방식 분리 테스트 권장
3. Function 구조 감지 실패 → 디렉토리 구조 기준 점검 자동화 루틴 추가
4. `func start` 위치 오류, `FUNCTIONS_WORKER_RUNTIME` 누락 등 설정 체크리스트 문서화


## 📦 참고 파일

- `my-app/getSampleList/index.js`
- `my-app/src/components/RegionDetailPage.js`
- `my-app/utils/db-utils.js`
- `my-app/setupProxy.js`
- `my-app/local.settings.json`
- `.github/workflows/azure-static-web-apps-*.yml`

---

> 이 문서는 GPT 내부 기준에 따라 향후 동일 이슈 재발 방지 및 대응 로직 개선을 위한 표준 문서로 보존됨.
