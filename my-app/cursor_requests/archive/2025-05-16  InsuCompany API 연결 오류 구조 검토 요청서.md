---

## title: InsuSample API 연결 오류 구조 검토 요청서  
date: 2025-05-16  
requester: 유비님  
recipient: Cursor Agent  
category: 구조검토

## 📌 요청 개요

현재 `taxcredit_mobileapp` 프로젝트 내 `/api-test` 테스트 페이지에서 Data API Builder(DAB)를 통해 호출하는 `InsuSample` API가 400 오류를 반환하고 있습니다.

그러나 동일한 Azure Function App 내의 `getSampleList` 함수는 **정상적으로 작동 중이며**, 실제 앱에서도 성공적으로 사용되고 있습니다.

이로 인해 **잘 동작 중인 함수가 `/api-test` UI에서는 작동하지 않는 구조적 비정상 상태**가 발생했습니다.

---

## ❗ 요청 목적

> "같은 Azure에 배포된 함수가 실제 앱에서는 정상 작동하는데, `/api-test`에서만 실패한다는 것은 테스트 구조 자체에 설정 누락이나 매핑 오류가 있다는 뜻"

이 현상은 토론이나 해석의 문제가 아니라 **구조 검토와 설정 오류 수정이 필요한 영역**입니다.

---

## 🔍 오류 현상 요약

- 호출 경로: `/data-api/rest/InsuSample?$filter=시도 eq '서울특별시'`
    
- HTTP 상태코드: **400 Bad Request**
    
- 응답 메시지 내 ActivityId 존재하나 Application Insights에서는 추적 불가
    
- 예상 원인:
    
    - DAB 설정에서 `InsuSample` 엔티티 내 `시도` 컬럼이 누락
        
    - 또는 연결된 SQL 뷰/테이블에 실제 컬럼이 존재하지 않음
        
    - 혹은 매핑 오류 또는 컬럼명이 한글이라 SQL에 맞지 않게 매핑됨
        

---

## 🛠️ 요청 항목

1. `staticwebapp.database.config.json` 내 `InsuSample` 엔티티 확인
    
    - `columns` 또는 `mappings` 내부에 `시도` 컬럼이 정의되어 있는지 점검
        
2. `source.object`에 정의된 실제 SQL 테이블 또는 뷰 내부에도 `시도` 컬럼이 존재하는지 확인
    
3. 필요 시 컬럼 매핑 수정 또는 필터 컬럼명을 영어로 대체할 수 있는지 판단
    
4. `/data-api/rest/InsuSample`에 `$filter=시도 eq '서울특별시'` 호출이 **정상적으로 200 응답 반환**되도록 구조 수정
    

---

## 🧩 참고 정보

- 동일 앱에서 `/api/getSampleList` 함수는 정상 동작함 → Function App 자체 문제는 아님
    
- 문제는 **Data API Builder 설정 또는 SQL 소스 구조와의 매핑 관계 문제로 국한**됨
    

---

이 문서를 기반으로 구조 검토 및 설정 수정을 진행해 주세요.