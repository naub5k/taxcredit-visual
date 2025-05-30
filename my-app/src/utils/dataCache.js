// IndexedDB 기반 데이터 캐싱 시스템

class DataCache {
  constructor() {
    this.dbName = 'TaxCreditAppCache';
    this.dbVersion = 1;
    this.storeName = 'regionData';
    this.db = null;
    this.isEnabled = true;
    this.maxCacheAge = 30 * 60 * 1000; // 30분
  }

  // IndexedDB 초기화
  async init() {
    if (!this.isEnabled || !window.indexedDB) {
      console.warn('IndexedDB not available, caching disabled');
      this.isEnabled = false;
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB 초기화 실패:', request.error);
        this.isEnabled = false;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('📦 IndexedDB 캐시 시스템 초기화 완료');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 기존 스토어가 있으면 삭제
        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName);
        }

        // 새 스토어 생성
        const store = db.createObjectStore(this.storeName, { keyPath: 'cacheKey' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('sido', 'sido', { unique: false });
        store.createIndex('gugun', 'gugun', { unique: false });
        
        console.log('📦 IndexedDB 스토어 생성 완료');
      };
    });
  }

  // 캐시 키 생성
  generateCacheKey(sido, gugun, page = 1, pageSize = 50) {
    // 안전한 파라미터 검증
    const safeSido = sido && typeof sido === 'string' ? sido : 'unknown';
    const safeGugun = gugun && typeof gugun === 'string' ? gugun : 'unknown';
    const safePage = page && typeof page === 'number' ? page : 1;
    const safePageSize = pageSize && typeof pageSize === 'number' ? pageSize : 50;
    
    const cacheKey = `${safeSido}-${safeGugun}-p${safePage}-s${safePageSize}`;
    
    // 디버깅용 로그 (문제 상황 파악)
    if (sido !== safeSido || gugun !== safeGugun || page !== safePage || pageSize !== safePageSize) {
      console.warn('⚠️ 캐시 키 생성 시 잘못된 파라미터 감지:', {
        원본: { sido, gugun, page, pageSize },
        보정: { safeSido, safeGugun, safePage, safePageSize },
        생성된키: cacheKey
      });
    }
    
    return cacheKey;
  }

  // 데이터 캐시에 저장
  async set(sido, gugun, page, pageSize, data) {
    if (!this.isEnabled || !this.db) return false;

    try {
      const cacheKey = this.generateCacheKey(sido, gugun, page, pageSize);
      const cacheData = {
        cacheKey,
        sido,
        gugun,
        page,
        pageSize,
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.maxCacheAge
      };

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.put(cacheData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // 안전한 로그 (데이터 크기만 표시)
      const dataSize = Array.isArray(data) ? data.length : typeof data === 'object' ? 'object' : typeof data;
      console.log(`💾 캐시 저장: ${cacheKey} (데이터: ${dataSize})`);
      return true;
    } catch (error) {
      console.error('캐시 저장 실패:', error);
      return false;
    }
  }

  // 캐시에서 데이터 조회
  async get(sido, gugun, page = 1, pageSize = 50) {
    if (!this.isEnabled || !this.db) return null;

    try {
      const cacheKey = this.generateCacheKey(sido, gugun, page, pageSize);
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const cacheData = await new Promise((resolve, reject) => {
        const request = store.get(cacheKey);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!cacheData) {
        console.log(`📭 캐시 미스: ${cacheKey}`);
        return null;
      }

      // 만료 확인
      if (Date.now() > cacheData.expiresAt) {
        console.log(`⏰ 캐시 만료: ${cacheKey}`);
        await this.delete(cacheKey);
        return null;
      }

      console.log(`📬 캐시 히트: ${cacheKey}`);
      return cacheData.data;
    } catch (error) {
      console.error('캐시 조회 실패:', error);
      return null;
    }
  }

  // 특정 캐시 삭제
  async delete(cacheKey) {
    if (!this.isEnabled || !this.db) return false;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      await new Promise((resolve, reject) => {
        const request = store.delete(cacheKey);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`🗑️ 캐시 삭제: ${cacheKey}`);
      return true;
    } catch (error) {
      console.error('캐시 삭제 실패:', error);
      return false;
    }
  }

  // 지역별 캐시 삭제
  async clearRegionCache(sido, gugun) {
    if (!this.isEnabled || !this.db) return false;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('sido');

      const request = index.openCursor(IDBKeyRange.only(sido));
      let deletedCount = 0;

      await new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const data = cursor.value;
            if (!gugun || data.gugun === gugun) {
              cursor.delete();
              deletedCount++;
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });

      console.log(`🗑️ 지역 캐시 삭제: ${sido} ${gugun || ''} (${deletedCount}건)`);
      return true;
    } catch (error) {
      console.error('지역 캐시 삭제 실패:', error);
      return false;
    }
  }

  // 만료된 캐시 정리
  async cleanExpiredCache() {
    if (!this.isEnabled || !this.db) return false;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');

      const now = Date.now();
      let deletedCount = 0;

      const request = index.openCursor();
      await new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const data = cursor.value;
            if (now > data.expiresAt) {
              cursor.delete();
              deletedCount++;
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });

      if (deletedCount > 0) {
        console.log(`🧹 만료된 캐시 정리: ${deletedCount}건`);
      }
      return true;
    } catch (error) {
      console.error('캐시 정리 실패:', error);
      return false;
    }
  }

  // 전체 캐시 삭제
  async clearAll() {
    if (!this.isEnabled || !this.db) return false;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log('🗑️ 전체 캐시 삭제 완료');
      return true;
    } catch (error) {
      console.error('전체 캐시 삭제 실패:', error);
      return false;
    }
  }

  // 캐시 통계 조회
  async getStats() {
    if (!this.isEnabled || !this.db) return null;

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const count = await new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const now = Date.now();
      let validCount = 0;
      let totalSize = 0;

      const request = store.openCursor();
      await new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const data = cursor.value;
            if (now <= data.expiresAt) {
              validCount++;
            }
            totalSize += JSON.stringify(data).length;
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });

      return {
        totalEntries: count,
        validEntries: validCount,
        expiredEntries: count - validCount,
        estimatedSize: Math.round(totalSize / 1024) // KB
      };
    } catch (error) {
      console.error('캐시 통계 조회 실패:', error);
      return null;
    }
  }

  // 선제적 캐싱 (다음 페이지 미리 로드)
  async preloadNextPages(sido, gugun, currentPage, pageSize, fetchFunction) {
    if (!this.isEnabled) return;

    const pagesToPreload = [currentPage + 1, currentPage + 2];
    
    for (const page of pagesToPreload) {
      // 이미 캐시에 있는지 확인
      const cached = await this.get(sido, gugun, page, pageSize);
      if (cached) continue;

      // 백그라운드에서 로드
      setTimeout(async () => {
        try {
          console.log(`🔄 선제적 캐싱: 페이지 ${page}`);
          const data = await fetchFunction(page, pageSize);
          await this.set(sido, gugun, page, pageSize, data);
        } catch (error) {
          console.warn(`선제적 캐싱 실패 (페이지 ${page}):`, error);
        }
      }, 1000 * (page - currentPage)); // 1초씩 지연
    }
  }
}

// 전역 인스턴스 생성
const dataCache = new DataCache();

// 초기화
dataCache.init().catch(console.error);

// 주기적 캐시 정리 (5분마다)
setInterval(() => {
  dataCache.cleanExpiredCache();
}, 5 * 60 * 1000);

// 개발자 도구에서 사용할 수 있도록 전역 객체에 추가
if (typeof window !== 'undefined') {
  window.dataCache = dataCache;
}

export default dataCache; 