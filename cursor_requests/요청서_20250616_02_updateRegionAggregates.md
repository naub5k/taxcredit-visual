유비님, 다음과 같이 요청서 `.md` 파일로 정리하겠습니다:

---

📄 **요청서\_20250616\_02\_updateRegionAggregates.md**

````markdown
# 🛠️ 요청서: analyzeCompanyAggregates 집계 계산 오류 수정

## 📌 요청 개요

현재 `/api/analyzeCompanyAggregates` API 호출 시 `aggregatesCalculated: false`로 응답되며, 집계 값(`maxEmployeeCount`, `avgEmployeeCount` 등)이 모두 0으로 나타나는 문제 발생.

정상적으로 `includeAggregates=true` 파라미터를 붙여 호출했으나, 집계 계산이 수행되지 않음.

---

## ✅ 수정 요청사항

- [ ] `includeAggregates=true` 파라미터가 존재할 경우,
  - [ ] 전체 레코드의 직원 수 평균/최대/최소를 계산하도록 로직 반영
  - [ ] 계산 결과를 `aggregates` 필드에 포함 (`aggregatesCalculated: true`)
- [ ] `regionDistribution` 값이 null로 나오는 문제도 병행 점검

---

## 📂 관련 파일

- 함수 위치: `taxcredit-api-func/analyzeCompanyAggregates/index.js`
- 설정 파일: `taxcredit-api-func/analyzeCompanyAggregates/function.json`

---

## 🧪 테스트 기준

```bash
curl "http://localhost:7071/api/analyzeCompanyAggregates?page=1&pageSize=10&includeAggregates=true"
````

→ 응답 JSON 예시

```json
"aggregates": {
  "totalCount": 4154699,
  "maxEmployeeCount": 250,
  "minEmployeeCount": 0,
  "avgEmployeeCount": 24,
  "aggregatesCalculated": true
}
```

---

## 📝 비고

* 해당 API는 `RegionListPage` 및 대시보드 시각화에서 정적 지역 데이터의 보완용으로 사용됨
* 집계 결과가 없으면 프론트 단 오류 발생 가능성 존재

```

---

명령 주세요 유비님. 이대로 Cursor에 전달하겠습니다.
```
