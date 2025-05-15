---
title: RegionDetailPage UI 변경 요청서
category: cursor_request
date: 2025-05-11
requester: 유비님
---

❗ 본 요청은 `stable-api-filter-v1` 기준 구조를 절대 변경하지 않아야 합니다.  
구조 요소: staticwebapp.config.json, fetch URL, JSON 응답 필터 등

# 🧭 요청 목적

현재 `RegionDetailPage.js`에 표시되는 테이블에서  
`시도`, `구군` 열을 제거하고, `2020`~`2024`까지의 연도 데이터를 추가하여  
**연도별 인원 증가 추세를 직관적으로 시각화**하고자 함.

---

# ✅ 변경 작업 상세

## 1. 테이블 구조 변경

- 기존 컬럼: 사업장명, 2023, 2024, 시도, 구군
- 변경 컬럼: 사업장명, 2020, 2021, 2022, 2023, 2024

## 2. 시각적 표현 방식

- 각 연도 셀(`td`)에 숫자와 함께 **배경 세로 막대 시각화 효과** 추가 (막대가 연하게, 그 위에 볼드체 숫자)
- 구성 방식:
  ```jsx
  <div style={{ position: "relative" }}>
    <div style={{
      width: `${{value * 20}}%`,
      height: "100%",
      backgroundColor: "#e0e0e0",
      position: "absolute",
      top: 0, left: 0, zIndex: 0
    }} />
    <div style={{ position: "relative", zIndex: 1 }}>{value}</div>
  </div>
  ```
- `value * 20%`를 기준으로 숫자 크기만큼 가로 막대 생성
- 상한선은 두지 않고, 절대값 기반 시각화

---

# 🔒 기준 유지 사항

- `stable-api-filter-v1` 브랜치 기준 구조 변경 금지
- 데이터는 이미 연도별 증가 조건으로 필터링되어 있음
- API 호출 구조 및 필터 로직은 그대로 유지

---

# 📂 수정 대상 파일

- `src/pages/RegionDetailPage.js`

---

이 요청은 `npm start`로 로컬에서 시각적으로 확인 가능한 상태에서 작업해야 하며,  
변경 후 렌더링 결과가 브라우저에서 직관적으로 표현되어야 합니다.
