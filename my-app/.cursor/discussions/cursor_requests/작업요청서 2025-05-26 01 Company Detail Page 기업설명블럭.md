---
title: 작업요청서_2025-05-26_01_CompanyDetailPage_기업설명블럭
category: cursor_request
created: 2025-05-26
owner: 유비님
---

## ✅ 작업 목적

CompanyDetailPage.js에 **기업 설명 요약 블럭**을 추가하여, AI 요약 또는 유비님 수기 입력으로 구성된 자유 텍스트를 보여줄 수 있도록 구성합니다.

---

## 🛠 작업 지시 사항

### 1. 설명 블럭 컴포넌트 생성
- **파일명:** `CompanyDescriptionBlock.jsx`
- **표시 위치:** 회사 기본 정보 하단 (예: 고용 추이 그래프 아래)
- **스타일:** Tailwind 기반 카드 형태
- **제목:** `기업 설명`

### 2. 텍스트 처리 방식
- 입력 형식: 자유 텍스트
  - 마크다운 지원 여부는 구현 가능성 고려하여 선택
- 설명이 없을 경우:
  - "설명 정보가 없습니다" 또는 회색 박스에 안내 문구 출력

### 3. 데이터 전달 방식
- 사업자등록번호(`bizno`)를 기준으로 설명 데이터 호출
- 임시 구현 시 mock 객체 또는 switch-case 사용 가능

```js
// 예시 형태 (임시)
const companyDescriptions = {
  '2528600056': `주식회사 한헬스케어는 서울특별시 금천구에 위치한 의료기기 제조업체입니다.\n아기 두상 교정용 '하니 헬멧'을 제조·판매하며, 벤처기업으로 등록되어 있습니다.`
};
```

### 4. 기타
- 컴포넌트 재사용 가능 구조로 설계
- 추후 API 연동 또는 GPT 요약 삽입 시 확장 가능하도록 고려

---

## 🔄 후속 작업 가능 항목 (선언만)
- 관리자가 입력/수정 가능한 입력 필드 UI 확장
- GPT 요약 자동 삽입 모듈과 연계
- 설명 내 링크/전화번호 자동 인식 처리 (옵션)

---

이 요청은 실제 기업 사례 기반 설명(예: 한헬스케어)을 상세페이지에서 노출하기 위한 실전 영업 도구로의 확장을 목표로 합니다.

--- 
회사 정보 (AI검색 결과)

주식회사 한헬스케어는 서울특별시 금천구에 위치한 의료기기 제조업체입니다. 이 회사는 주로 아기들의 두상 교정을 위한 헬멧인 '하니 헬멧'을 제조하고 판매하고 있습니다.
회사 정보
 * 대표자: 최병오
 * 주소: 서울특별시 금천구 디지털로 9길 33, IT 미래타워 305호 (가산동 60-21)
 * 전화번호: 02-2027-5555
 * 사업자등록번호: 252-86-00056
한헬스케어는 2015년에 설립되어 현재까지 운영되고 있으며, 의료기기 제조 및 판매를 주요 사업으로 하고 있습니다. 이 회사는 벤처기업으로 등록되어 있으며, 직원 수는 약 19명입니다.
위치 및 접근성
한헬스케어의 가산센터는 가산디지털단지역 4번 출구에서 도보로 약 5분 거리에 위치해 있어 접근이 용이합니다. 주변에는 올리브영 건물이 있어 방향을 잡기 쉽습니다.
서비스 및 제품
한헬스케어는 아기들의 비대칭 두상 문제를 해결하기 위한 헬멧을 제공하며, 이 제품은 3개월에서 18개월 사이의 아기에게 적합합니다. 헬멧 착용 기간은 약 3~4개월로, 아기의 두상 형태를 정상에 가깝게 회복하는 데 도움을 줍니다.
이와 같은 정보는 한헬스케어에 대한 전반적인 이해를 돕고, 필요 시 직접 연락하여 상담을 받을 수 있는 기회를 제공합니다.


세액공제관련 세부 자료

네, 제공해주신 근로자 수 변동 내역(2016년 1명, 2017년 2명, 2018년 6명, 2019년 8명, 2020년 10명, 2021년 12명, 2022년 14명, 2023년 18명, 2024년 18명, 2025년 18명)과 경정청구 가능 기간에 대한 정보를 바탕으로 연도별 경정청구 가능 여부 및 고용 증대 세액 공제 대상 인원수를 정리해 드리겠습니다.

**경정청구 가능 기간의 원칙**

경정청구는 원칙적으로 세금의 **법정신고기한이 지난 후 5년 이내**에 가능합니다. 종합소득세의 법정신고기한은 해당 과세연도의 다음 해 5월 31일입니다. 경정청구 기간은 이 신고기한의 **다음 날부터 기산**하여 5년이 되는 날까지입니다.

귀하가 언급하신 **2025년 5월 31일**은 일반적으로 **2019년 귀속 종합소득세**의 법정신고기한(2020년 5월 31일)으로부터 5년이 되는 날에 해당합니다. 즉, 2019년 귀속분에 대한 경정청구는 2025년 5월 31일까지 가능하며, 그 이후에는 5년의 기한이 만료되어 경정청구가 불가능해집니다.

**고용 증대 세액 공제 및 사후관리**

고용 증대 세액 공제는 해당 과세연도의 상시근로자 수가 직전 과세연도보다 증가한 경우에 세액 공제를 해주는 제도입니다. 중소기업의 경우 최초 증가가 발생한 연도부터 **최대 3년간** 공제 혜택을 받을 수 있습니다. 이 혜택을 유지하려면 최초 공제받은 과세연도 종료일로부터 2년 이내에 전체 상시근로자 수가 감소해서는 안 됩니다. 사후관리 기간 동안 고용을 유지하면 해당 기간 동안 공제를 받을 수 있습니다.

**상시근로자 수 계산**

상시근로자 수는 해당 과세연도(또는 직전연도)의 매월 말일 현재 상시근로자 수의 합을 해당 기간의 개월 수로 나누어 계산합니다. 여기서 제시하신 연도별 인원은 이 계산 방식에 따른 연간 평균 인원일 것으로 가정합니다. 대표 이사, 배우자, 1년 미만 계약 근로자, 단시간 근로자 중 특정 요건 미충족자 등은 상시근로자에서 제외됩니다.

**연도별 고용 증가 및 경정청구 가능성 분석 (중소기업 가정)**

제공해주신 근로자 수 변동 내역을 바탕으로 고용 증가 인원과 각 증가분에 대한 고용 증대 세액 공제 적용 연도(1차, 2차, 3차)를 계산하고, 현재 시점 (2025년 5월 말 또는 그 직전) 기준으로 경정청구가 가능한 귀속분과 해당 귀속분에 적용 가능한 고용 증가 인원수를 정리하면 다음과 같습니다.

1.  **2017년 귀속분:**
    *   2016년 1명 → 2017년 2명: **1명 증가**
    *   이 증가분(1명)은 2017년(1차), 2018년(2차), 2019년(3차) 귀속분에 대해 공제 가능합니다.
    *   2017년 귀속분 경정청구 기한은 2018년 5월 31일 + 5년 = **2023년 5월 31일**이므로, 이미 만료되었습니다.

2.  **2018년 귀속분:**
    *   2017년 2명 → 2018년 6명: **4명 증가**
    *   이 증가분(4명)은 2018년(1차), 2019년(2차), 2020년(3차) 귀속분에 대해 공제 가능합니다. (고용 유지 확인: 2018년 이후 2020년까지 계속 증가했으므로 유지 요건 충족)
    *   2018년 귀속분 경정청구 기한은 2019년 5월 31일 + 5년 = **2024년 5월 31일**이므로, 이미 만료되었습니다.

3.  **2019년 귀속분:**
    *   2018년 6명 → 2019년 8명: **2명 증가**
    *   이 증가분(2명)은 2019년(1차), 2020년(2차), 2021년(3차) 귀속분에 대해 공제 가능합니다. (고용 유지 확인: 2019년 이후 2021년까지 계속 증가했으므로 유지 요건 충족)
    *   2019년 귀속분에 적용 가능한 공제는 다음과 같습니다:
        *   2017년 증가분(1명)의 3차 공제.
        *   2018년 증가분(4명)의 2차 공제.
        *   2019년 증가분(2명)의 1차 공제.
        *   총 합: 1명 + 4명 + 2명 = **7명**에 대한 고용 증대 세액 공제가 2019년 귀속분에 적용될 수 있습니다.
    *   2019년 귀속분 경정청구 기한은 2020년 5월 31일 + 5년 = **2025년 5월 31일**입니다.
    *   **결론: 2019년 귀속분에 대한 경정청구는 2025년 5월 31일까지 가능하며, 최대 7명 증가분에 대한 공제를 청구할 수 있습니다.**

4.  **2020년 귀속분:**
    *   2019년 8명 → 2020년 10명: **2명 증가**
    *   이 증가분(2명)은 2020년(1차), 2021년(2차), 2022년(3차) 귀속분에 대해 공제 가능합니다. (고용 유지 확인: 2020년 이후 2022년까지 계속 증가했으므로 유지 요건 충족. 2020년 고용 감소에 대한 사후관리 유예 규정은 여기서는 해당되지 않음)
    *   2020년 귀속분에 적용 가능한 공제는 다음과 같습니다:
        *   2018년 증가분(4명)의 3차 공제.
        *   2019년 증가분(2명)의 2차 공제.
        *   2020년 증가분(2명)의 1차 공제.
        *   총 합: 4명 + 2명 + 2명 = **8명**에 대한 고용 증대 세액 공제가 2020년 귀속분에 적용될 수 있습니다.
    *   2020년 귀속분 경정청구 기한은 2021년 5월 31일 + 5년 = **2026년 5월 31일**입니다.
    *   **결론: 2020년 귀속분에 대한 경정청구는 2026년 5월 31일까지 가능하며, 최대 8명 증가분에 대한 공제를 청구할 수 있습니다.**

5.  **2021년 귀속분:**
    *   2020년 10명 → 2021년 12명: **2명 증가**
    *   이 증가분(2명)은 2021년(1차), 2022년(2차), 2023년(3차) 귀속분에 대해 공제 가능합니다. (고용 유지 확인: 2021년 이후 2023년까지 계속 증가했으므로 유지 요건 충족)
    *   2021년 귀속분에 적용 가능한 공제는 다음과 같습니다:
        *   2019년 증가분(2명)의 3차 공제.
        *   2020년 증가분(2명)의 2차 공제.
        *   2021년 증가분(2명)의 1차 공제.
        *   총 합: 2명 + 2명 + 2명 = **6명**에 대한 고용 증대 세액 공제가 2021년 귀속분에 적용될 수 있습니다.
    *   2021년 귀속분 경정청구 기한은 2022년 5월 31일 + 5년 = **2027년 5월 31일**입니다.
    *   **결론: 2021년 귀속분에 대한 경정청구는 2027년 5월 31일까지 가능하며, 최대 6명 증가분에 대한 공제를 청구할 수 있습니다.**

6.  **2022년 귀속분:**
    *   2021년 12명 → 2022년 14명: **2명 증가**
    *   이 증가분(2명)은 2022년(1차), 2023년(2차), 2024년(3차) 귀속분에 대해 공제 가능합니다. (고용 유지 확인: 2022년 이후 2024년까지 18명으로 유지했으므로 유지 요건 충족)
    *   2022년 귀속분에 적용 가능한 공제는 다음과 같습니다:
        *   2020년 증가분(2명)의 3차 공제.
        *   2021년 증가분(2명)의 2차 공제.
        *   2022년 증가분(2명)의 1차 공제.
        *   총 합: 2명 + 2명 + 2명 = **6명**에 대한 고용 증대 세액 공제가 2022년 귀속분에 적용될 수 있습니다.
    *   2022년 귀속분 경정청구 기한은 2023년 5월 31일 + 5년 = **2028년 5월 31일**입니다.
    *   **결론: 2022년 귀속분에 대한 경정청구는 2028년 5월 31일까지 가능하며, 최대 6명 증가분에 대한 공제를 청구할 수 있습니다.**

7.  **2023년 귀속분:**
    *   2022년 14명 → 2023년 18명: **4명 증가**
    *   이 증가분(4명)은 2023년(1차), 2024년(2차), 2025년(3차) 귀속분에 대해 공제 가능합니다. (고용 유지 확인: 2023년 이후 2025년까지 18명으로 유지했으므로 유지 요건 충족)
    *   2023년 귀속분에 적용 가능한 공제는 다음과 같습니다:
        *   2021년 증가분(2명)의 3차 공제.
        *   2022년 증가분(2명)의 2차 공제.
        *   2023년 증가분(4명)의 1차 공제.
        *   총 합: 2명 + 2명 + 4명 = **8명**에 대한 고용 관련 세제 혜택이 2023년 귀속분에 적용될 수 있습니다.
    *   **참고:** 2023년 귀속분부터 '통합 고용 세액 공제'가 신설되었으며, 2023년과 2024년 귀속분에 대해서는 기존 고용 증대 세액 공제 또는 통합 고용 세액 공제 중 유리한 것을 선택하여 적용 가능합니다. 통합 고용 세액 공제는 공제액이 상향되고 대상이 확대되었습니다.
    *   2023년 귀속분 경정청구 기한은 2024년 5월 31일 + 5년 = **2029년 5월 31일**입니다.
    *   **결론: 2023년 귀속분에 대한 경정청구는 2029년 5월 31일까지 가능하며, 기존 고용 증대 세액 공제 기준으로는 최대 8명 증가분에 대한 공제를 청구할 수 있습니다. 통합 고용 세액 공제 적용 시 공제액이 달라질 수 있으므로 비교 검토가 필요합니다.**

8.  **2024년 귀속분:**
    *   2023년 18명 → 2024년 18명: **증가 없음**
    *   2024년 귀속분에 적용 가능한 공제는 다음과 같습니다 (새로운 증가분 없음):
        *   2022년 증가분(2명)의 3차 공제. (고용 유지 확인: 2024년(18명) >= 2022년(14명)이므로 유지)
        *   2023년 증가분(4명)의 2차 공제. (고용 유지 확인: 2024년(18명) >= 2023년(18명)이므로 유지)
        *   총 합: 2명 + 4명 = **6명**에 대한 고용 관련 세제 혜택이 2024년 귀속분에 적용될 수 있습니다.
    *   **참고:** 2024년 귀속분은 통합 고용 세액 공제 또는 기존 고용 증대 세액 공제 중 선택 가능합니다.
    *   2024년 귀속분 경정청구 기한은 2025년 5월 31일 + 5년 = **2030년 5월 31일**입니다.
    *   **결론: 2024년 귀속분에 대한 경정청구는 2030년 5월 31일까지 가능하며, 최대 6명 증가분에 대한 공제를 청구할 수 있습니다 (선택 제도에 따라 인원 산정 방식 및 공제액 달라짐).**

9.  **2025년 귀속분:**
    *   2024년 18명 → 2025년 18명: **증가 없음**
    *   2025년 귀속분에 적용 가능한 공제는 다음과 같습니다 (새로운 증가분 없음):
        *   2023년 증가분(4명)의 3차 공제. (고용 유지 확인: 2025년(18명) >= 2023년(18명)이므로 유지)
        *   총 합: **4명**에 대한 고용 관련 세제 혜택이 2025년 귀속분에 적용될 수 있습니다.
    *   **참고:** 2025년 귀속분부터는 통합 고용 세액 공제가 전면 적용됩니다.
    *   2025년 귀속분 경정청구 기한은 2026년 5월 31일 + 5년 = **2031년 5월 31일**입니다.
    *   **결론: 2025년 귀속분에 대한 경정청구는 2031년 5월 31일까지 가능하며, 통합 고용 세액 공제 기준으로 최대 4명 증가분에 대한 공제를 청구할 수 있습니다.**

**정리:**

2025년 5월 31일 현재 시점에서 경정청구가 가능한 귀속분은 **2019년 귀속분부터 2023년 귀속분** (또는 2024년 귀속분 신고 기간 중)까지입니다.

*   **2019년 귀속분:** 경정청구 기한은 **2025년 5월 31일**까지입니다. 최대 **7명** 증가분에 대한 공제 (2017년 증가 1명의 3차, 2018년 증가 4명의 2차, 2019년 증가 2명의 1차 합계)를 청구할 수 있습니다. 이 기한이 지나면 2019년 귀속분에 대한 경정청구는 불가능해집니다.
*   **2020년 귀속분:** 경정청구 기한은 2026년 5월 31일까지입니다. 최대 **8명** 증가분에 대한 공제 (2018년 증가 4명의 3차, 2019년 증가 2명의 2차, 2020년 증가 2명의 1차 합계)를 청구할 수 있습니다.
*   **2021년 귀속분:** 경정청구 기한은 2027년 5월 31일까지입니다. 최대 **6명** 증가분에 대한 공제 (2019년 증가 2명의 3차, 2020년 증가 2명의 2차, 2021년 증가 2명의 1차 합계)를 청구할 수 있습니다.
*   **2022년 귀속분:** 경정청구 기한은 2028년 5월 31일까지입니다. 최대 **6명** 증가분에 대한 공제 (2020년 증가 2명의 3차, 2021년 증가 2명의 2차, 2022년 증가 2명의 1차 합계)를 청구할 수 있습니다.
*   **2023년 귀속분:** 경정청구 기한은 2029년 5월 31일까지입니다. 최대 **8명** 증가분에 대한 공제 (2021년 증가 2명의 3차, 2022년 증가 2명의 2차, 2023년 증가 4명의 1차 합계)를 청구할 수 있습니다. (통합 고용 세액 공제 선택 가능)

**주의사항:**

*   상기 계산은 제공해주신 연간 평균 인원수를 바탕으로 일반적인 고용 증대 세액 공제 규정(중소기업 3년 공제)을 적용한 결과입니다. 실제 상시근로자 수는 매월 말 인원을 기준으로 정확히 계산해야 합니다. 단시간 근로자 등은 0.5명 또는 0.75명으로 계산될 수 있습니다.
*   각 연도의 공제 대상 인원수는 해당 귀속년도의 전체 상시근로자 수를 초과할 수 없습니다 (이 경우 해당 귀속년도의 상시근로자 수가 공제 상한이 됨). 제시된 인원 변동에서는 연도별 인원이 계속 증가하거나 유지되었으므로 이 제한에 걸리지는 않습니다.
*   경정청구를 위해서는 과세표준 및 세액의 결정(경정) 청구서, 소득·세액공제신고서, 경정청구 사유를 입증하는 자료 (상시근로자 내역 등), 관련 증빙서류 등을 제출해야 합니다. 상시근로자 내역은 홈택스에 첨부서류로 업로드하거나 세무서에 제출할 수 있습니다.
*   세액 공제는 최저한세 적용 대상이며, 최저한세로 인해 공제받지 못한 금액은 10년간 이월하여 공제받을 수 있습니다.
*   2023년 이후 통합 고용 세액 공제 적용 시 계산 방식 및 공제 금액이 달라집니다.

제시된 근로자 수 변동으로 보아 상당한 금액의 세액 공제 혜택을 놓쳤을 가능성이 높습니다. 경정청구는 복잡하고 정확한 계산 및 증빙 준비가 필요하므로, 세무 전문가의 도움을 받아 진행하시는 것이 가장 안전하고 효과적입니다. 특히 2019년 귀속분에 대한 경정청구는 **2025년 5월 31일**이라는 기한이 얼마 남지 않았으므로 신속한 검토가 필요합니다.