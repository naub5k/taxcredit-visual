유비님, 요청서 `20250617_05` 내용까지 포함해 완전하게 확인했습니다.
기존 분석 흐름을 유지한 상태에서 **Cursor가 참고해야 할 새 요청서**를 아래와 같이 생성했습니다.

---

### ✅ **\[요청서\_20250617\_06] analyzeCompanyData 페이징 성능 최적화 및 캐시 확인 요청**

---

### 📌 문제 재현 및 분석 요약

1. **페이지 단위 요청에도 불구하고 전체 스캔 유사 응답 지연 발생**

   * `page=1`, `pageSize=10` 요청에서도 **최대 173초 소요**
   * 성능 로그:

     ```
     요청 처리 완료: 172633ms (페이징 전용)
     ```

2. **초기 응답 완료 후, `page=2`, `page=3` 요청이 비정상적으로 선제 요청됨**

   * `RegionDetailPage.js`와 `dataCache.js`에서 `p1-s10` 캐시 완료 직후 `p2`, `p3` 선제 요청 발생
   * 원인: **불완전한 첫 응답 후, 프론트에서 다수 페이지를 동시에 요청**하여 병목 유발 가능성

3. **쿼리 응답 수와 관계없이 정적 캐싱 히트 후에도 다시 동일 요청 수행됨**

   * `p2`, `p3` 응답 완료 후에도 동일 요청 반복 로그 확인됨
   * 응답 데이터:

     ```json
     "pagination": {
       "page": 1,
       "pageSize": 10,
       "totalCount": 32910,
       "totalPages": 3291,
       "hasNext": true,
       "hasPrev": false
     }
     ```

---

### 🎯 요청 항목

#### 1. `analyzeCompanyData` 함수의 성능 최적화 조건 확정

* 다음 조건일 경우, **극한 최적화 로직으로 분기 처리** 요청:

  ```js
  page === 1 && pageSize <= 50
  ```

* 최적화 쿼리 예시:

  ```sql
  SELECT TOP 10 사업자등록번호, 사업장명, 시도, 구군, 업종명, [2024] 
  FROM insu_clean WITH (NOLOCK)
  WHERE 시도=@sido AND 구군=@gugun
  ORDER BY 사업자등록번호
  OPTION (FAST 10)
  ```

#### 2. `aggregates` 필드 기본값 제공 유지

* `includeAggregates=false`일 때에도 아래 구조 반드시 포함:

  ```js
  aggregates: {
    maxEmployeeCount: 0,
    minEmployeeCount: 0,
    avgEmployeeCount: 0,
    aggregatesCalculated: false
  }
  ```

#### 3. 성능 로그 구조 확장 (이미 일부 적용됨)

* 다음 항목 포함 여부 점검 및 유지:

  ```json
  {
    "performance": {
      "recordsPerSecond": 4,
      "avgRecordProcessTime": "233.3ms",
      "queryType": "극한최적화(TOP)",
      "note": "성능 개선 적용됨 - 부산서구 173초 문제 해결"
    }
  }
  ```

#### 4. 캐시 및 선제 요청 흐름 점검을 위한 로그 추가

* `p2`, `p3` 페이지 요청 시 **이미 캐시된 경우 중복 요청이 일어나는지** 확인 필요
* React `RegionDetailPage.js` 및 `dataCache.js` 내부 캐시 로직 중 `set`과 `get` 호출 순서 확인 요청

---

### 🧪 테스트 경로

* URL: `http://localhost:7071/api/analyzeCompanyData?sido=부산광역시&gugun=서구&page=1&pageSize=10`
* 응답 시간, 응답 구조, 캐시 작동 여부, 성능 로그 기록 등 확인

---

### 👥 담당자

* 요청자: 유비님
* 확인자: Cursor

---

작성 완료되었습니다. 