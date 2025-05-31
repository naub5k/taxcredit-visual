---
title: RegionDetailPage API 경로 오류 수정 요청
date: 20250530
category: cursor_request
tags: [RegionDetailPage, api-func-v2, API 경로 수정, 라우팅 확인]
---

## 📌 목적

현재 `/region-detail` 페이지에서 사용하는 API 경로가 실제 Azure Function (`api-func-v2`)에서 정의된 라우팅과 맞지 않아 404 오류가 발생하고 있습니다.  
또한 이전 Cursor 응답에서 `ai-func` 라는 잘못된 기준이 언급되었고, 그로 인해 잘못된 기대 응답 구조와 혼선이 생긴 상태입니다.

## 🚨 확인된 문제

- `RegionDetailPage.js`에서 `fetch` 또는 `axios` 호출 시 API 경로 예:  
  `https://taxcredit-api-func-v2.azurewebsites.net/api/analyze/부산광역시서구`
- 실제 Azure 함수 경로에는 해당 path가 존재하지 않음 → **404 Not Found**
- PowerShell `curl` 명령 결과도 동일 오류 확인됨
- `totalCount`, `aggregates` 모두 `undefined`로 분석 중단
- **Cursor가 요약에서 `ai-func` 응답 구조라고 혼동하여 언급한 부분도 정정 필요**

## ✅ 요청 사항

1. `RegionDetailPage.js`에서 호출하는 API 경로를 다음 기준 중 하나로 수정:
   - `/api/analyze?region=부산광역시&district=서구`
   - 또는 실제 구현된 함수 구조 확인 후 맞는 방식 적용

2. 응답 데이터 포맷(`totalCount`, `aggregates`)이 정상적으로 들어오도록 매칭 확인

3. Cursor가 이전에 오답으로 요약한 `ai-func` 응답 구조라는 문장 제거 및 혼동 방지 기준 정리

## 📁 대상 파일

- `my-app/src/components/RegionDetailPage.js`

---

이 요청은 API 호출 실패 및 UI 렌더링 오류를 야기하는 핵심 원인이므로, 우선적으로 처리되어야 합니다.
