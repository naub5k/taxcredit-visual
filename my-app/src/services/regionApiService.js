/**
 * 🌐 지역별 API 서비스 (캐싱 적용)
 * - 요청서 요구사항: 페이징 필수, 집계 분리, 캐싱 전략 적용
 * - 정적 지역 데이터 우선 사용, API 호출 최소화
 */

import { 
  API_CONFIG, 
  buildApiUrl, 
  validatePaginationParams, 
  validateRegionParams 
} from '../config/apiConfig';

import cacheService from './cacheService';
import { 
  regionTotalData, 
  employmentRegionData, 
  getTotalCountBySido, 
  getTotalCountByGugun,
  getRegionDataByKey 
} from '../data/employmentRegionData';

class RegionApiService {
  constructor() {
    console.log('🌐 RegionApiService 초기화 완료');
    
    // 🔧 설정
    this.config = {
      timeout: 30000, // 30초 timeout
      maxRetries: 3,
      retryDelay: 1000, // 1초 대기
      circuitBreakerThreshold: 5, // 5회 연속 실패 시 Circuit Breaker 작동
      circuitBreakerResetTime: 300000 // 5분 후 재시도
    };
    
    // 🚦 Circuit Breaker 상태
    this.circuitBreaker = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: null
    };
    
    // 정적 지역 데이터를 캐시에 저장
    cacheService.setStaticRegionData({
      regionTotalData,
      employmentRegionData,
      lastUpdated: '2025-06-16',
      totalCount: regionTotalData.reduce((sum, region) => sum + region.업체수, 0)
    });
  }
  
  /**
   * 🌐 Timeout이 적용된 fetch 요청
   */
  async fetchWithTimeout(url, options = {}, timeout = this.config.timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`요청 시간 초과 (${timeout / 1000}초)`);
      }
      throw error;
    }
  }
  
  /**
   * 🔄 재시도 로직이 포함된 API 호출
   */
  async callApiWithRetry(url, options = {}, retries = this.config.maxRetries) {
    // 🚦 Circuit Breaker 확인
    if (this.circuitBreaker.isOpen) {
      const now = Date.now();
      if (now - this.circuitBreaker.lastFailureTime < this.config.circuitBreakerResetTime) {
        throw new Error('서버 연결 불안정으로 잠시 후 다시 시도해주세요.');
      } else {
        // Circuit Breaker 리셋
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failureCount = 0;
        console.log('🔄 Circuit Breaker 리셋됨');
      }
    }
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🌐 API 호출 시도 ${attempt}/${retries}: ${url}`);
        
        const response = await this.fetchWithTimeout(url, options);
        
        // 성공 시 Circuit Breaker 카운터 리셋
        this.circuitBreaker.failureCount = 0;
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'API 응답 오류');
        }
        
        console.log(`✅ API 호출 성공 (시도 ${attempt}/${retries})`);
        return result;
        
      } catch (error) {
        console.warn(`⚠️ API 호출 실패 (시도 ${attempt}/${retries}):`, error.message);
        
        // Circuit Breaker 카운터 증가
        this.circuitBreaker.failureCount++;
        
        // Circuit Breaker 작동
        if (this.circuitBreaker.failureCount >= this.config.circuitBreakerThreshold) {
          this.circuitBreaker.isOpen = true;
          this.circuitBreaker.lastFailureTime = Date.now();
          console.error('🚨 Circuit Breaker 작동: 연속 실패 횟수 초과');
        }
        
        // 마지막 시도가 아니면 재시도
        if (attempt < retries) {
          console.log(`🔄 ${this.config.retryDelay / 1000}초 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
          continue;
        }
        
        // 모든 재시도 실패
        throw new Error(`API 호출 실패 (${retries}회 시도): ${error.message}`);
      }
    }
  }
  
  /**
   * 🏢 지역별 업체 목록 조회 (페이징 필수)
   */
  async getCompanyList(params) {
    const { sido, gugun, page, pageSize, search = '' } = params;
    
    // 🛡️ 파라미터 검증
    const paginationValidation = validatePaginationParams(page, pageSize);
    if (!paginationValidation.isValid) {
      throw new Error(`페이징 파라미터 오류: ${paginationValidation.errors.join(', ')}`);
    }
    
    const regionValidation = validateRegionParams(sido, gugun);
    if (!regionValidation.isValid) {
      throw new Error(`지역 파라미터 오류: ${regionValidation.errors.join(', ')}`);
    }
    
    // 🎯 캐시 확인 (1단계)
    const cachedData = cacheService.getRegionPage(sido, gugun, page, pageSize, search);
    if (cachedData) {
      console.log(`🎯 페이지 캐시 HIT: ${sido} > ${gugun || 'all'} (${page}/${pageSize})`);
      return cachedData;
    }
    
    // 🌐 API 호출 (Retry & Timeout 적용)
    console.log(`🌐 API 호출: 지역별 업체 목록 (${sido} > ${gugun || 'all'}, ${page}/${pageSize})`);
    
    try {
      const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.ANALYZE_COMPANY_DATA, {
        sido,
        gugun,
        page,
        pageSize,
        search
      });
      
      const result = await this.callApiWithRetry(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      // 🔧 totalCount 보정 (정적 데이터 사용)
      const staticTotalCount = search ? null : this.getStaticTotalCount(sido, gugun);
      if (staticTotalCount !== null && result.pagination) {
        result.pagination.totalCount = staticTotalCount;
        result.pagination.totalPages = Math.ceil(staticTotalCount / pageSize);
        result.pagination.hasNext = page < result.pagination.totalPages;
      }
      
      // 💾 캐시 저장
      cacheService.setRegionPage(sido, gugun, page, pageSize, result, search);
      
      console.log(`✅ 업체 목록 조회 완료: ${result.data.length}건`);
      return result;
      
    } catch (error) {
      console.error('❌ 업체 목록 API 호출 실패:', error);
      throw error;
    }
  }
  
  /**
   * 📊 집계 정보 조회 (별도 엔드포인트)
   */
  async getAggregates(params) {
    const { sido, gugun, search = '' } = params;
    
    // 🛡️ 지역 파라미터 검증
    const regionValidation = validateRegionParams(sido, gugun);
    if (!regionValidation.isValid) {
      throw new Error(`지역 파라미터 오류: ${regionValidation.errors.join(', ')}`);
    }
    
    // 🎯 캐시 확인
    const cachedAggregates = cacheService.getAggregates(sido, gugun, search);
    if (cachedAggregates) {
      console.log(`🎯 집계 캐시 HIT: ${sido} > ${gugun || 'all'}`);
      return cachedAggregates;
    }
    
    // 🌐 API 호출 (Retry & Timeout 적용)
    console.log(`🌐 API 호출: 집계 정보 (${sido} > ${gugun || 'all'})`);
    
    try {
      const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.ANALYZE_COMPANY_AGGREGATES, {
        sido,
        gugun,
        search,
        includeAggregates: true // 집계 계산 강제 요청
      });
      
      const result = await this.callApiWithRetry(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      // 💾 캐시 저장
      cacheService.setAggregates(sido, gugun, result, search);
      
      console.log(`✅ 집계 정보 조회 완료`);
      return result;
      
    } catch (error) {
      console.error('❌ 집계 정보 API 호출 실패:', error);
      throw error;
    }
  }
  
  /**
   * 📋 정적 지역 데이터 조회 (캐시 우선)
   */
  getStaticRegionData() {
    // 캐시에서 정적 데이터 조회
    let staticData = cacheService.getStaticRegionData();
    
    if (!staticData) {
      // 캐시 미스 시 employmentRegionData.js에서 직접 로드
      staticData = {
        regionTotalData,
        employmentRegionData,
        lastUpdated: '2025-06-16',
        totalCount: regionTotalData.reduce((sum, region) => sum + region.업체수, 0)
      };
      
      cacheService.setStaticRegionData(staticData);
      console.log('💾 정적 지역 데이터 캐시 저장');
    }
    
    return staticData;
  }
  
  /**
   * 🔢 정적 데이터 기반 총 개수 조회
   */
  getStaticTotalCount(sido, gugun = null) {
    try {
      if (gugun) {
        return getTotalCountByGugun(sido, gugun);
      } else {
        return getTotalCountBySido(sido);
      }
    } catch (error) {
      console.warn('⚠️ 정적 데이터 총 개수 조회 실패:', error);
      return null;
    }
  }
  
  /**
   * 🗺️ 지역 정보 조회
   */
  getRegionInfo(sido, gugun = null) {
    try {
      return getRegionDataByKey(sido, gugun);
    } catch (error) {
      console.warn('⚠️ 지역 정보 조회 실패:', error);
      return null;
    }
  }
  
  /**
   * 📋 시도 목록 조회
   */
  getSidoList() {
    const staticData = this.getStaticRegionData();
    return staticData.regionTotalData.map(region => ({
      시도: region.시도,
      업체수: region.업체수
    }));
  }
  
  /**
   * 📋 구군 목록 조회
   */
  getGugunList(sido) {
    const staticData = this.getStaticRegionData();
    const regionData = staticData.employmentRegionData.find(region => region.시도 === sido);
    
    if (!regionData) {
      console.warn(`⚠️ 시도를 찾을 수 없음: ${sido}`);
      return [];
    }
    
    return regionData.구군목록.map(gugun => ({
      구군: gugun.구군,
      업체수: gugun.업체수
    }));
  }
  
  /**
   * 🧹 캐시 관리
   */
  clearCache(sido = null, gugun = null) {
    if (sido) {
      cacheService.clearRegionCache(sido, gugun);
    } else {
      cacheService.clearAll();
    }
  }
  
  /**
   * 📊 캐시 통계 조회
   */
  getCacheStats() {
    return cacheService.getStats();
  }
  
  /**
   * 🔧 API 상태 확인
   */
  async healthCheck() {
    try {
      const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH_CHECK);
      const response = await fetch(apiUrl, { method: 'GET' });
      
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const regionApiService = new RegionApiService();

export default regionApiService; 