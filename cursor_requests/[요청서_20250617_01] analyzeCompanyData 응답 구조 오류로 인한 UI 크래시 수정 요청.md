**\[요청서\_20250617\_01] analyzeCompanyData 응답 구조 오류로 인한 UI 크래시 수정 요청**

---

### 📌 문제 요약

현재 `analyzeCompanyData` API 호출 결과에 `aggregates` 필드가 누락되어, React 프론트엔드에서 다음과 같은 오류가 발생함:

```log
Cannot read properties of undefined (reading 'maxEmployeeCount')
```

* 원인: `includeAggregates=false`인 경우 API 응답에 `aggregates` 자체가 아예 빠짐
* 결과: 프론트는 해당 필드를 기반으로 렌더링 로직(`RegionDetailPage`)이 구성되어 있어 런타임 오류 발생

---

### 🧪 재현 조건

* 조건: `/api/analyzeCompanyData?sido=부산광역시&gugun=서구&page=1&pageSize=10&includeAggregates=false`
* 환경: `localhost:3000`, React 개발 서버 + `func start --port 7071`
* 결과:

  * func: 정상 처리 (레코드 10건 반환, DB 응답까지 최대 125초 지연)
  * 프론트: 캐시 저장 직후 `aggregatesCalculated` 접근 오류로 크래시

---

### ✅ API 응답 예시 (문제 상황)

```json
{
  "data": [...10건...],
  "pagination": {...},
  "aggregates": undefined // ❌ 아예 없음
}
```

### ✅ 프론트 예상 구조 (안정 동작 조건)

```json
{
  "data": [...],
  "pagination": {...},
  "aggregates": {
    "maxEmployeeCount": 0,
    "minEmployeeCount": 0,
    "avgEmployeeCount": 0,
    "aggregatesCalculated": false
  }
}
```

---

### 🛠 요청 사항

`includeAggregates=false`인 경우에도 아래 구조를 유지해 주세요:

```js
aggregates: {
  maxEmployeeCount: 0,
  minEmployeeCount: 0,
  avgEmployeeCount: 0,
  aggregatesCalculated: false
}
```

* 의미 있는 데이터는 없어도 무방함 (`0` 또는 `false`)
* 단, **객체 자체는 반드시 포함되어야 함**
* 이유: 프론트 렌더링 안정성 보장

---

### 🧾 참고

* func 로그 상 정상 실행 및 DB 응답 완료
* 현재 프론트는 `aggregates?.maxEmployeeCount` 형태가 아닌 \`\`\*\* 직접 접근 방식\*\*을 사용 중이라 방어 로직이 없음

---

### 📎 후속 필요 작업 (선택사항)

* 프론트에서도 추후 null-check (`aggregates?.maxEmployeeCount ?? 0`) 처리 권장됨
* 하지만 지금은 API 구조 보완이 선행되어야 함

---

### 👥 담당자

* 요청자: 유비님
* 확인자: Cursor

---

### 🕹 작업 경로

* `taxcredit-api-func/analyzeCompanyData/index.js`
* 조건부 응답 구성부 (`includeAggregates`에 따라 다르게 response 작성되는 위치)

---

이 요청서에 따라 API 응답 구조를 보완해 주세요. 감사합니다!
