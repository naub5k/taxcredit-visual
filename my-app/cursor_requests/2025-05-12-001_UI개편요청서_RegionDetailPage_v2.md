---
title: RegionDetailPage 고용추이 시각화 개편 요청서 (v2)
category: cursor_request
date: 2025-05-12
requester: 유비님
---

❗ 본 요청은 `stable-api-filter-v1` 기준 구조를 훼손하지 않으면서,  
API 응답 필드 및 렌더링 구조에 대한 **기능 개편 지시서**입니다.  
커서는 반드시 SQL → API → 클라이언트 UI 흐름 전체를 고려하여 작업하십시오.

---

# 🧭 요청 목적

현재 `RegionDetailPage.js`는 구군을 클릭했을 때  
2023~2024의 두 해 고용인원만 간략히 보여주는 형태입니다.  
하지만 이 방식은 고용 변화의 흐름을 파악하기 어렵고,  
사용자가 증가 추세인지 감소 추세인지 직관적으로 판단할 수 없습니다.

따라서 **2020~2024까지 5년치 고용 데이터를 시각적으로 보여주는 방식**으로 개편합니다.

이 요청은 단순한 UI 변경이 아닌,  
**데이터 인지 구조 자체를 재설계**하는 기능 기반 개편입니다.

---

# ✅ 전체 데이터 흐름 구조 요약

```
[RegionDetailPage.js]
  → /api/getSampleList?sido=...&gugun=... 호출
    → Azure Function [getSampleList/index.js]
      → SQL Server 연결
        → SELECT 사업장명, [2020], [2021], [2022], [2023], [2024] 실행
          → JSON 응답 반환
  → 프론트에서 테이블 형태로 2020~2024 데이터를 시각화
```

---

# ✅ 변경 작업 상세

## 1. 백엔드 (getSampleList/index.js)

- 기존 쿼리에 `2020`, `2021`, `2022` 연도 데이터를 포함시켜야 함
- 응답 JSON 구조:
  ```json
  {
    "사업장명": "...",
    "2020": 2,
    "2021": 3,
    "2022": 5,
    "2023": 6,
    "2024": 7
  }
  ```
- 누락된 연도 필드가 없도록 SQL 결과 보장할 것

## 2. 프론트엔드 (RegionDetailPage.js)

- 기존 렌더링: 2023, 2024만 표기
- 변경 후 렌더링: `사업장명`, `2020`~`2024`까지 총 6열

- 각 연도별 셀은 아래와 같이 시각화:

```jsx
<div style={{ position: "relative" }}>
  <div style={{
    width: `${value / maxValue * 100}%`,
    height: "100%",
    backgroundColor: "#e0e0e0",
    position: "absolute",
    top: 0, left: 0, zIndex: 0
  }} />
  <div style={{ position: "relative", zIndex: 1 }}>{value}</div>
</div>
```

- `maxValue`는 전체 행에서 가장 큰 값으로 계산하여 normalize
- 상한선 없이 절대값만 쓰면 과장될 수 있음 (이전 요청서의 문제점)

---

# 🔒 유지 조건

- `stable-api-filter-v1` 기준 구조를 유지
  - fetch 경로, 라우팅 구조, config.json은 변경 금지
- API 호출 방식은 동일하게 유지하되, 응답 필드 구조만 확장

---

# 📂 수정 대상 파일

- `api/getSampleList/index.js`
- `src/components/RegionDetailPage.js`

---

> 이 요청은 **화면을 실시간으로 보며 진행되는 사용자 중심 피드백 기반 요청서**입니다.  
> 커서는 단순 지시가 아니라 **화면 기반 기능 목적을 이해하고 전체 흐름을 통합 작업**하십시오.
