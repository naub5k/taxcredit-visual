// 성능 측정 유틸리티

class PerformanceTracker {
  constructor() {
    this.metrics = {};
    this.isEnabled = process.env.NODE_ENV === 'development' || window.location.search.includes('debug=true');
  }

  // 측정 시작
  start(label) {
    if (!this.isEnabled) return;
    
    this.metrics[label] = {
      startTime: performance.now(),
      startMemory: this.getMemoryUsage()
    };
    
    console.time(`⏱️ ${label}`);
  }

  // 측정 종료
  end(label) {
    if (!this.isEnabled || !this.metrics[label]) return;
    
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    const duration = Math.round(endTime - this.metrics[label].startTime);
    
    console.timeEnd(`⏱️ ${label}`);
    
    const result = {
      label,
      duration,
      startTime: this.metrics[label].startTime,
      endTime,
      memoryUsed: endMemory - this.metrics[label].startMemory,
      timestamp: new Date().toISOString()
    };
    
    this.logMetric(result);
    delete this.metrics[label];
    
    return result;
  }

  // 메모리 사용량 측정
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) // MB
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }

  // 렌더링 성능 측정
  measureRender(componentName, renderFunction) {
    if (!this.isEnabled) return renderFunction();
    
    this.start(`Render: ${componentName}`);
    const result = renderFunction();
    
    // 다음 프레임에서 측정 종료 (렌더링 완료 후)
    requestAnimationFrame(() => {
      this.end(`Render: ${componentName}`);
    });
    
    return result;
  }

  // API 호출 성능 측정
  async measureAPI(apiName, apiCall) {
    if (!this.isEnabled) return await apiCall();
    
    this.start(`API: ${apiName}`);
    
    try {
      const result = await apiCall();
      const metrics = this.end(`API: ${apiName}`);
      
      // 안전한 응답 크기 측정
      const responseSize = this.estimateObjectSize(result);
      const duration = metrics?.duration || 0;
      
      console.log(`📊 API ${apiName}: ${duration}ms, ~${responseSize}KB`);
      
      // 응답 구조 검증 및 보완
      if (result && typeof result === 'object') {
        // meta.performance.duration이 없으면 측정된 값으로 보완
        if (!result.meta) {
          result.meta = {};
        }
        if (!result.meta.performance) {
          result.meta.performance = {};
        }
        if (typeof result.meta.performance.duration === 'undefined') {
          result.meta.performance.duration = duration;
        }
      }
      
      return result;
    } catch (error) {
      this.end(`API: ${apiName}`);
      throw error;
    }
  }

  // 객체 크기 추정
  estimateObjectSize(obj) {
    const jsonString = JSON.stringify(obj);
    const sizeInBytes = new Blob([jsonString]).size;
    return Math.round(sizeInBytes / 1024); // KB
  }

  // 메트릭 로깅
  logMetric(metric) {
    const logData = {
      ...metric,
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    console.log(`📈 Performance Metric:`, logData);
    
    // 로컬 스토리지에 저장 (개발용)
    if (this.isEnabled) {
      const existingMetrics = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
      existingMetrics.push(logData);
      
      // 최대 100개 항목만 유지
      if (existingMetrics.length > 100) {
        existingMetrics.splice(0, existingMetrics.length - 100);
      }
      
      localStorage.setItem('performanceMetrics', JSON.stringify(existingMetrics));
    }
  }

  // 저장된 메트릭 조회
  getStoredMetrics() {
    return JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
  }

  // 메트릭 초기화
  clearMetrics() {
    localStorage.removeItem('performanceMetrics');
    console.log('🗑️ Performance metrics cleared');
  }

  // 성능 리포트 생성
  generateReport() {
    const metrics = this.getStoredMetrics();
    
    if (metrics.length === 0) {
      console.log('📊 No performance metrics available');
      return;
    }
    
    const apiMetrics = metrics.filter(m => m.label.startsWith('API:'));
    const renderMetrics = metrics.filter(m => m.label.startsWith('Render:'));
    
    console.group('📊 Performance Report');
    
    if (apiMetrics.length > 0) {
      const avgApiTime = apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length;
      console.log(`🌐 API Calls: ${apiMetrics.length}, Avg: ${Math.round(avgApiTime)}ms`);
    }
    
    if (renderMetrics.length > 0) {
      const avgRenderTime = renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length;
      console.log(`🎨 Renders: ${renderMetrics.length}, Avg: ${Math.round(avgRenderTime)}ms`);
    }
    
    const currentMemory = this.getMemoryUsage();
    console.log(`💾 Current Memory: ${currentMemory.used}MB / ${currentMemory.total}MB`);
    
    console.groupEnd();
  }
}

// 전역 인스턴스 생성
const performanceTracker = new PerformanceTracker();

// 개발자 도구에서 사용할 수 있도록 전역 객체에 추가
if (typeof window !== 'undefined') {
  window.performanceTracker = performanceTracker;
}

export default performanceTracker; 