// 성능 측정 및 추적 유틸리티

class PerformanceTracker {
  constructor() {
    this.measurements = new Map();
    this.isEnabled = true;
  }

  // API 호출 성능 측정
  async measureAPI(name, apiFunction) {
    if (!this.isEnabled) {
      return await apiFunction();
    }

    const startTime = performance.now();
    const startLabel = `API-${name}-start`;
    const endLabel = `API-${name}-end`;

    try {
      performance.mark(startLabel);
      console.log(`⏱️ API 성능 측정 시작: ${name}`);

      const result = await apiFunction();

      performance.mark(endLabel);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // 측정 결과 저장
      this.measurements.set(name, {
        duration,
        timestamp: Date.now(),
        success: true
      });

      // 성능 로그
      if (duration > 1000) {
        console.warn(`⚠️ API 응답 지연: ${name} (${Math.round(duration)}ms)`);
      } else {
        console.log(`✅ API 응답 완료: ${name} (${Math.round(duration)}ms)`);
      }

      // Performance API measure 생성
      try {
        performance.measure(`API-${name}`, startLabel, endLabel);
      } catch (e) {
        console.warn('Performance measure 생성 실패:', e);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // 실패 측정 결과 저장
      this.measurements.set(name, {
        duration,
        timestamp: Date.now(),
        success: false,
        error: error.message
      });

      console.error(`❌ API 오류: ${name} (${Math.round(duration)}ms)`, error);
      throw error;
    }
  }

  // 렌더링 성능 측정
  measureRender(componentName, renderFunction) {
    if (!this.isEnabled) {
      return renderFunction();
    }

    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 16) { // 60fps 기준 16ms
      console.warn(`⚠️ 렌더링 지연: ${componentName} (${Math.round(duration)}ms)`);
    }

    return result;
  }

  // 측정 결과 조회
  getMeasurement(name) {
    return this.measurements.get(name);
  }

  // 모든 측정 결과 조회
  getAllMeasurements() {
    return Object.fromEntries(this.measurements);
  }

  // 성능 통계 생성
  getStats() {
    const measurements = Array.from(this.measurements.values());
    if (measurements.length === 0) return null;

    const durations = measurements.map(m => m.duration);
    const successCount = measurements.filter(m => m.success).length;

    return {
      totalMeasurements: measurements.length,
      successRate: (successCount / measurements.length) * 100,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      lastMeasurement: measurements[measurements.length - 1]?.timestamp
    };
  }

  // 측정 데이터 정리
  clearMeasurements() {
    this.measurements.clear();
    console.log('🧹 성능 측정 데이터 정리 완료');
  }

  // 성능 측정 활성화/비활성화
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`⚙️ 성능 측정 ${enabled ? '활성화' : '비활성화'}`);
  }

  // 성능 보고서 생성
  generateReport() {
    const stats = this.getStats();
    if (!stats) {
      console.log('📊 성능 측정 데이터가 없습니다.');
      return;
    }

    console.log('📊 성능 측정 보고서:');
    console.log(`   총 측정 횟수: ${stats.totalMeasurements}회`);
    console.log(`   성공률: ${stats.successRate.toFixed(1)}%`);
    console.log(`   평균 응답시간: ${Math.round(stats.averageDuration)}ms`);
    console.log(`   최소 응답시간: ${Math.round(stats.minDuration)}ms`);
    console.log(`   최대 응답시간: ${Math.round(stats.maxDuration)}ms`);

    return stats;
  }
}

// 전역 인스턴스 생성
const performanceTracker = new PerformanceTracker();

// 개발자 도구에서 사용할 수 있도록 전역 객체에 추가
if (typeof window !== 'undefined') {
  window.performanceTracker = performanceTracker;
}

export default performanceTracker; 