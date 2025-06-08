// 🌐 Visual 프로젝트 API 엔드포인트 설정
// taxcredit-analyze 프로젝트의 API_CONFIG 구조를 기반으로 생성

export const API_CONFIG = {
  BASE_URL: 'https://taxcredit-api-func.azurewebsites.net/api',  // ✅ 실제 배포된 API
  ENDPOINTS: {
    ANALYZE_COMPANY_DATA: '/analyzeCompanyData',  // Visual 프로젝트에서 사용하는 지역별 업체 조회
    ANALYZE: '/analyze',                          // 개별 기업 분석용 (analyze 연동)
    HEALTH_CHECK: '/healthcheck',
    PING: '/ping'
  },
  
  // API 응답 시간 기준
  PERFORMANCE_TARGETS: {
    API_RESPONSE_TIME: 500,     // 500ms 이내
    REALTIME_CALCULATION: 100, // 실시간 재계산 100ms 이내
    DB_QUERY_TIME: 50          // DB 쿼리 50ms 이내
  }
};

// 개발/프로덕션 환경 감지
export const getApiBaseUrl = () => {
  if (window.location.hostname.includes("localhost")) {
    return "http://localhost:7071/api";
  }
  return API_CONFIG.BASE_URL;
};

// API 엔드포인트 빌드 헬퍼 함수
export const buildApiUrl = (endpoint, params = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}${endpoint}`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
};

export default {
  API_CONFIG,
  getApiBaseUrl,
  buildApiUrl
}; 