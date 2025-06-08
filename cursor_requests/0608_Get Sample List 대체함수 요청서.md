## 🧾 작업요청서: `getSampleList` 대체 함수 구성 요청

### 📌 목적

현재 `RegionDetailPage.js`에서 호출되고 있는 `getSampleList` API는 더 이상 사용되지 않으며, `api-func` 디렉토리에 존재하는 최신 분석 함수 기반 구조로 기능을 통합해야 함.
만약 아직도 `getSampleList` API 를 참조하는 부분은 제거 하고 대체 해야 함. 

### 🎯 요청 내용

* `getSampleList`에서 처리하던 **시도/구군 기준 기업 목록 조회 기능**을 `analyze` 기반의 새 함수로 [시도], [구군] 컬럼을 참조해서,  **이전·재구성**할 것
* 프론트엔드의 호출 대상은 `RegionDetailPage.js`에 명시된 fetch 구조를 그대로 사용할 수 있어야 함
* `api-func` 함수 구조에 맞게 `getSampleList` 기능을 `analyze` 함수 또는 신규 함수로 **흡수 및 대체 구현**할 것
* 신규 함수를 구성한 목적이 mock 형태의 데이타를 이용하는 것이 아니라, 실재 쿼리 select * 을 이용해서 컬럼 데이타를 제대로 활용하기 위함임을 기억 할 것. 

### 🧩 전제 조건

* `GET` 방식 파라미터 유지: `?sido=서울특별시&gugun=강남구`
* 반환 데이터는 기존 `getSampleList`와 호환되도록 할 것 
* 신규 함수를 구성한 목적이 mock 형태의 데이타를 이용하는 것이 아니라, 실재 쿼리 select * 을 이용해서 컬럼 데이타를 제대로 활용하기 위함임을 기억 할 것. 

### 🧭 참고 위치

* 오류 발생 경로: `RegionDetailPage.js`
* 기존 호출 방식:

```javascript
const apiUrl = `${baseUrl}/api/getSampleList?sido=${encodeURIComponent(sido)}&gugun=${encodeURIComponent(gugun)}`;
```

* 404 오류는 위 URL로 호출 시 함수 연결이 되지 않아 발생함

### 📂 관련 파일

* `RegionDetailPage.js`
* `performance.js`
* `dataCache.js`
* `aiService.js` (간접 영향 가능성 있음)
