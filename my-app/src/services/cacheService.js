/**
 * 🗄️ 클라이언트 사이드 캐싱 서비스
 * - 요청서 요구사항: sido-gugun-pageSize-page 키 기반 캐시
 * - 정적 데이터, 페이지 결과, 집계 정보 캐싱
 * - TTL(Time To Live) 기반 캐시 만료 처리
 */

import { API_CONFIG } from '../config/apiConfig';

class CacheService {
  constructor() {
    this.cache = new Map();
    this.storage = window.localStorage;
    this.sessionStorage = window.sessionStorage;
    
    // 캐시 통계
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      clears: 0
    };
    
    console.log('🗄️ CacheService 초기화 완료');
  }
  
  /**
   * 캐시 키 생성 (API_CONFIG 설정 사용)
   */
  generateRegionPageKey(sido, gugun, page, pageSize, search = '') {
    return API_CONFIG.CACHE_CONFIG.getRegionPageKey(sido, gugun, page, pageSize, search);
  }
  
  generateAggregatesKey(sido, gugun, search = '') {
    return API_CONFIG.CACHE_CONFIG.getAggregatesKey(sido, gugun, search);
  }
  
  /**
   * 캐시 아이템 구조
   */
  createCacheItem(data, ttl = -1) {
    const now = Date.now();
    return {
      data,
      timestamp: now,
      expires: ttl > 0 ? now + ttl : -1, // -1은 무제한
      hits: 0
    };
  }
  
  /**
   * 캐시 만료 확인
   */
  isExpired(item) {
    if (!item || !item.timestamp) return true;
    if (item.expires === -1) return false; // 무제한
    return Date.now() > item.expires;
  }
  
  /**
   * 메모리 캐시 GET
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // 히트 수 증가
    item.hits++;
    this.stats.hits++;
    
    console.log(`🎯 캐시 HIT: ${key} (${item.hits}회 사용)`);
    return item.data;
  }
  
  /**
   * 메모리 캐시 SET
   */
  set(key, data, ttl = -1) {
    const item = this.createCacheItem(data, ttl);
    this.cache.set(key, item);
    this.stats.sets++;
    
    console.log(`💾 캐시 SET: ${key} (TTL: ${ttl > 0 ? `${ttl/1000}초` : '무제한'})`);
    
    // 메모리 사용량 제한 (1000개 초과시 오래된 것부터 삭제)
    if (this.cache.size > 1000) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      console.log(`🗑️ 캐시 용량 초과로 삭제: ${oldestKey}`);
    }
  }
  
  /**
   * localStorage 캐시 GET (정적 데이터용)
   */
  getPersistent(key) {
    try {
      const item = this.storage.getItem(`cache_${key}`);
      if (!item) {
        this.stats.misses++;
        return null;
      }
      
      const parsed = JSON.parse(item);
      if (this.isExpired(parsed)) {
        this.storage.removeItem(`cache_${key}`);
        this.stats.misses++;
        return null;
      }
      
      this.stats.hits++;
      console.log(`💿 localStorage HIT: ${key}`);
      return parsed.data;
      
    } catch (error) {
      console.warn(`⚠️ localStorage 읽기 실패: ${key}`, error);
      this.stats.misses++;
      return null;
    }
  }
  
  /**
   * localStorage 캐시 SET (정적 데이터용)
   */
  setPersistent(key, data, ttl = -1) {
    try {
      const item = this.createCacheItem(data, ttl);
      this.storage.setItem(`cache_${key}`, JSON.stringify(item));
      this.stats.sets++;
      
      console.log(`💿 localStorage SET: ${key}`);
    } catch (error) {
      console.warn(`⚠️ localStorage 저장 실패: ${key}`, error);
    }
  }
  
  /**
   * 지역별 페이지 캐시 (메모리 캐시 사용)
   */
  getRegionPage(sido, gugun, page, pageSize, search = '') {
    const key = this.generateRegionPageKey(sido, gugun, page, pageSize, search);
    return this.get(key);
  }
  
  setRegionPage(sido, gugun, page, pageSize, data, search = '') {
    const key = this.generateRegionPageKey(sido, gugun, page, pageSize, search);
    const ttl = API_CONFIG.CACHE_CONFIG.REGION_PAGE_TTL;
    this.set(key, data, ttl);
  }
  
  /**
   * 집계 정보 캐시 (메모리 캐시 사용)
   */
  getAggregates(sido, gugun, search = '') {
    const key = this.generateAggregatesKey(sido, gugun, search);
    return this.get(key);
  }
  
  setAggregates(sido, gugun, data, search = '') {
    const key = this.generateAggregatesKey(sido, gugun, search);
    const ttl = API_CONFIG.CACHE_CONFIG.AGGREGATES_TTL;
    this.set(key, data, ttl);
  }
  
  /**
   * 정적 지역 데이터 캐시 (localStorage 사용)
   */
  getStaticRegionData() {
    return this.getPersistent('static_region_data');
  }
  
  setStaticRegionData(data) {
    this.setPersistent('static_region_data', data, API_CONFIG.CACHE_CONFIG.STATIC_REGION_TTL);
  }
  
  /**
   * 특정 지역의 모든 캐시 삭제
   */
  clearRegionCache(sido, gugun = null) {
    let cleared = 0;
    
    // 메모리 캐시에서 해당 지역 관련 키들 찾아서 삭제
    for (const key of this.cache.keys()) {
      if (key.includes(`-${sido}-`) && (!gugun || key.includes(`-${gugun}-`))) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    this.stats.clears += cleared;
    console.log(`🧹 지역 캐시 삭제: ${sido}${gugun ? ` > ${gugun}` : ''} (${cleared}개)`);
  }
  
  /**
   * 전체 캐시 삭제
   */
  clearAll() {
    const memoryCount = this.cache.size;
    this.cache.clear();
    
    // localStorage의 캐시 항목들도 삭제
    const keys = Object.keys(this.storage);
    let persistentCount = 0;
    
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        this.storage.removeItem(key);
        persistentCount++;
      }
    });
    
    this.stats.clears += memoryCount + persistentCount;
    console.log(`🧹 전체 캐시 삭제: 메모리 ${memoryCount}개, localStorage ${persistentCount}개`);
  }
  
  /**
   * 만료된 캐시 정리
   */
  cleanup() {
    let cleanedMemory = 0;
    let cleanedPersistent = 0;
    
    // 메모리 캐시 정리
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
        cleanedMemory++;
      }
    }
    
    // localStorage 정리
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        try {
          const item = JSON.parse(this.storage.getItem(key));
          if (this.isExpired(item)) {
            this.storage.removeItem(key);
            cleanedPersistent++;
          }
        } catch (error) {
          // 파싱 실패한 잘못된 캐시도 삭제
          this.storage.removeItem(key);
          cleanedPersistent++;
        }
      }
    });
    
    if (cleanedMemory > 0 || cleanedPersistent > 0) {
      console.log(`🧹 만료된 캐시 정리: 메모리 ${cleanedMemory}개, localStorage ${cleanedPersistent}개`);
    }
  }
  
  /**
   * 캐시 통계 조회
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      memorySize: this.cache.size,
      memoryUsage: `${Math.round(JSON.stringify([...this.cache.entries()]).length / 1024)}KB (추정)`
    };
  }
  
  /**
   * 디버그 정보 출력
   */
  debug() {
    console.group('🗄️ CacheService 디버그 정보');
    console.log('통계:', this.getStats());
    console.log('메모리 캐시 키 목록:', [...this.cache.keys()]);
    
    // localStorage 캐시 키 목록
    const persistentKeys = Object.keys(this.storage).filter(key => key.startsWith('cache_'));
    console.log('localStorage 캐시 키 목록:', persistentKeys);
    
    console.groupEnd();
  }
  
  /**
   * 🆕 totalCount 문제 해결을 위한 특별 캐시 클리어
   * - 2025-07-01: "12개" 문제 해결을 위해 지역 관련 캐시 전체 삭제
   */
  clearTotalCountIssueCache() {
    let cleared = 0;
    
    // 메모리 캐시에서 지역 관련 모든 캐시 삭제
    for (const key of this.cache.keys()) {
      if (key.includes('region-') || key.includes('aggregates-')) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    // localStorage에서도 지역 관련 캐시 삭제
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      if (key.startsWith('cache_') && (key.includes('region') || key.includes('aggregates'))) {
        this.storage.removeItem(key);
        cleared++;
      }
    });
    
    // sessionStorage도 클리어
    const sessionKeys = Object.keys(this.sessionStorage);
    sessionKeys.forEach(key => {
      if (key.includes('region') || key.includes('aggregates') || key.includes('totalCount')) {
        this.sessionStorage.removeItem(key);
        cleared++;
      }
    });
    
    this.stats.clears += cleared;
    console.log(`🧹 totalCount 문제 해결을 위한 특별 캐시 클리어 완료: ${cleared}개 삭제`);
    
    return cleared;
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const cacheService = new CacheService();

// 정기적으로 만료된 캐시 정리 (5분마다)
setInterval(() => {
  cacheService.cleanup();
}, 5 * 60 * 1000);

export default cacheService; 