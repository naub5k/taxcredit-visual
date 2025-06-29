# 🛠️ 요청서: analyzeCompanyData API CORS 오류 및 구군 단위 호출 실패 수정

## 📌 요청 개요

현재 프론트엔드 개발환경(`http://localhost:3000`)에서 `analyzeCompanyData` API 호출 시 CORS 정책에 의해 차단되고 있습니다.
Azure 포털에서 CORS 허용 원본으로 localhost:3000은 등록된 상태이며, `*`도 제거한 최신 상태입니다. 그럼에도 불구하고 CORS 오류가 발생하고 fetch 실패가 반복되고 있습니다.

또한 `gugun` 파라미터를 포함한 요청 시에도 서버 응답 실패 및 무한 로딩 현상이 발생하고 있으며, 이는 CORS 차단과 함수 내부 처리 로직 오류 가능성이 모두 존재합니다.

---

## ✅ 수정 요청사항

### 🔧 Functions API 서버 (`taxcredit-api-func`)

* [ ] **`host.json` 내 CORS 관련 설정 확인**

  * `extension` 또는 `http.cors` 항목 존재 시 제거 또는 Azure Portal 설정과 충돌되지 않도록 확인

* [ ] **API 응답 시 CORS 헤더 수동 삽입 여부 점검**

  * `context.res.headers['Access-Control-Allow-Origin'] = '*'` 또는 허용된 도메인 반영

* [ ] **Azure Portal에서의 CORS 설정 적용이 서버에 반영되도록 함수 앱 재시작**

  * 변경 이후 `함수 앱 > 다시 시작` 반드시 실행

### 🔧 구군 단위 호출 실패 관련

* [ ] `analyzeCompanyData` 함수에서 `gugun` 파라미터 존재 시 WHERE 조건이 누락되거나 잘못 적용되어 SQL 오류 발생 가능성 점검

  * 예: `WHERE sido = @sido AND gugun = @gugun` 조건이 값이 누락되거나 인코딩 오류로 실패하는 경우 확인

* [ ] `req.query.gugun`이 인코딩된 문자열로 들어올 경우 decodeURIComponent 적용 여부 확인

---

## 🧪 재현 테스트 로그 요약

```
📡 페이지 단위 데이터 요청: page=1, pageSize=10, includeAggregates=false
요청 URL: /api/analyzeCompanyData?sido=서울특별시&gugun=강남구...
→ CORS 오류: No 'Access-Control-Allow-Origin' header
→ fetch 실패 → TypeError: Failed to fetch
→ RegionDetailPage 무한 로딩 진입
```

---

## ✅ 기대 효과

* 🛡️ 개발 환경에서 API 호출 가능
* 🧭 구군 단위 필터링 정상 동작
* 🚫 무한 로딩 방지 및 사용자 응답 개선

---

## 🔁 후속 고려 사항

* `res.setHeader` 또는 `context.res.headers` 방식 명확히 통일
* `local.settings.json`에 CORS 설정은 영향 없음 → Azure Portal + 코드에서만 적용됨

---

유비님이 테스트한 결과를 기준으로 작성되었습니다. 빠른 수정 및 배포 후 API 정상 작동 여부 재확인 바랍니다.
