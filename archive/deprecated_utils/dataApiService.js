/**
 * [deprecated] Static Web Apps 데이터베이스 연결을 위한 API 서비스
 * 
 * ⚠️ 주의: 이 파일은 현재 프로젝트에서 사용되지 않습니다.
 * 실제 앱은 v2 함수 API(/api/getSampleList)를 사용하고 있으며,
 * 이 파일은 향후 참조용으로만 보관됩니다.
 * 
 * ℹ️ 참조: docs/API_STRUCTURE.md 문서에서 API 구조 확인 가능
 */

// 개발 환경에서는 localhost:4280, 프로덕션 환경에서는 현재 호스트 사용
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:4280/data-api'
  : '/data-api';

/**
 * 지역 샘플 데이터 가져오기
 * @param {string} sido - 시도 필터 (선택적)
 * @param {string} gugun - 구군 필터 (선택적)
 * @returns {Promise<Array>} - 샘플 데이터 배열
 */
export const fetchSamples = async (sido = null, gugun = null) => {
  try {
    let url = `${BASE_URL}/rest/Sample`;
    
    // 필터 적용을 위한 쿼리 파라미터 구성
    const queryParams = [];
    if (sido) {
      // 특수문자 인코딩
      queryParams.push(`$filter=시도 eq '${encodeURIComponent(sido)}'`);
      
      if (gugun) {
        // 두 조건 AND 연산
        queryParams.push(`and 구군 eq '${encodeURIComponent(gugun)}'`);
      }
    }
    
    // 쿼리 파라미터 추가
    if (queryParams.length > 0) {
      url = `${url}?${queryParams.join('')}`;
    }
    
    console.log('API 요청 URL:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    
    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('데이터 가져오기 오류:', error);
    throw error;
  }
};

/**
 * GraphQL을 통한 샘플 데이터 가져오기 (대체 방법)
 * @param {string} sido - 시도 필터 (선택적)
 * @param {string} gugun - 구군 필터 (선택적)
 * @returns {Promise<Array>} - 샘플 데이터 배열
 */
export const fetchSamplesGraphQL = async (sido = null, gugun = null) => {
  try {
    const url = `${BASE_URL}/graphql`;
    
    // GraphQL 쿼리 구성
    let filterCondition = '';
    if (sido) {
      filterCondition = `filter: {시도: {eq: "${sido}"`;
      if (gugun) {
        filterCondition += `, 구군: {eq: "${gugun}"}`;
      }
      filterCondition += `}}`;
    }
    
    const query = `
      query GetSamples {
        samples(${filterCondition}) {
          items {
            사업장명
            시도
            구군
            2020
            2021
            2022
            2023
            2024
          }
        }
      }
    `;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      throw new Error(`GraphQL 요청 실패: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data?.samples?.items || [];
  } catch (error) {
    console.error('GraphQL 데이터 가져오기 오류:', error);
    throw error;
  }
}; 