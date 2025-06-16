// 🌐 Visual 프로젝트 API 엔드포인트 설정
// taxcredit-analyze 프로젝트의 API_CONFIG 구조를 기반으로 생성

export const API_CONFIG = {
  BASE_URL: 'https://taxcredit-api-func.azurewebsites.net/api',  // ✅ 실제 배포된 API
  ENDPOINTS: {
    ANALYZE_COMPANY_DATA: '/analyzeCompanyData',      // 페이징 전용 (지역별 업체 조회)
    ANALYZE_COMPANY_AGGREGATES: '/analyzeCompanyAggregates', // 집계 정보 전용 
    ANALYZE: '/analyze',                              // 개별 기업 분석용 (analyze 연동)
    HEALTH_CHECK: '/healthcheck',
    PING: '/ping'
  },
  
  // API 응답 시간 기준
  PERFORMANCE_TARGETS: {
    API_RESPONSE_TIME: 500,     // 500ms 이내
    REALTIME_CALCULATION: 100, // 실시간 재계산 100ms 이내
    DB_QUERY_TIME: 50          // DB 쿼리 50ms 이내
  },
  
  // 🔧 캐싱 설정 (요청서 요구사항)
  CACHE_CONFIG: {
    // 지역별 페이지 결과 캐시 (sido-gugun-pageSize-page 키)
    REGION_PAGE_TTL: 1000 * 60 * 60, // 1시간
    
    // 집계 정보 캐시
    AGGREGATES_TTL: 1000 * 60 * 30, // 30분
    
    // 정적 지역 데이터 캐시 (영구)
    STATIC_REGION_TTL: -1, // 무제한 (employmentRegionData.js)
    
    // 캐시 키 생성 함수들
    getRegionPageKey: (sido, gugun, page, pageSize, search = '') => {
      const searchPart = search ? `-search-${search}` : '';
      return `region-page-${sido}-${gugun || 'all'}-${page}-${pageSize}${searchPart}`;
    },
    
    getAggregatesKey: (sido, gugun, search = '') => {
      const searchPart = search ? `-search-${search}` : '';
      return `aggregates-${sido}-${gugun || 'all'}${searchPart}`;
    }
  }
};

// 개발/프로덕션 환경 감지
export const getApiBaseUrl = () => {
  if (window.location.hostname.includes("localhost")) {
    return "http://localhost:7071/api";
  }
  return API_CONFIG.BASE_URL;
};

// 🔧 API URL 빌드 헬퍼 함수
export const buildApiUrl = (endpoint, params = {}) => {
  const baseUrl = getApiBaseUrl() + endpoint;
  
  // 파라미터가 없으면 기본 URL 반환
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  
  // URLSearchParams를 사용하여 안전하게 쿼리 스트링 생성
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// 🔧 페이징 파라미터 검증 함수
export const validatePaginationParams = (page, pageSize) => {
  const errors = [];
  
  if (!page || page < 1) {
    errors.push('page는 1 이상이어야 합니다.');
  }
  
  if (!pageSize || pageSize < 1) {
    errors.push('pageSize는 1 이상이어야 합니다.');
  }
  
  if (pageSize > 1000) {
    errors.push('pageSize는 1000 이하여야 합니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🔧 지역 필터 검증 함수
export const validateRegionParams = (sido, gugun = null) => {
  const errors = [];
  
  if (!sido || sido.trim() === '') {
    errors.push('시도는 필수 파라미터입니다.');
  }
  
  // 구군은 선택적이므로 검증하지 않음
  
  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length > 0 ? '전국 전체 조회는 허용되지 않습니다. 특정 시도를 선택해주세요.' : null
  };
};

const apiConfigModule = {
  API_CONFIG,
  getApiBaseUrl,
  buildApiUrl,
  validatePaginationParams,
  validateRegionParams
};

export default apiConfigModule; 