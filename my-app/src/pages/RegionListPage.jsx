import React, { useState, useEffect } from 'react';
import regionApiService from '../services/regionApiService';

/**
 * 🗺️ 지역별 업체 목록 페이지
 * - 요청서 요구사항 완전 적용
 * - 정적 데이터 우선 사용, API 호출 최소화
 * - 페이징 필수, 집계 분리, 캐싱 전략 적용
 */
const RegionListPage = () => {
  // 🔧 상태 관리
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedGugun, setSelectedGugun] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  
  // 📋 데이터 상태
  const [sidoList, setSidoList] = useState([]);
  const [gugunList, setGugunList] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [aggregates, setAggregates] = useState(null);
  
  // 🔄 로딩 상태
  const [loading, setLoading] = useState(false);
  const [aggregatesLoading, setAggregatesLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 📊 캐시 통계
  const [cacheStats, setCacheStats] = useState(null);

  // 🏁 초기 데이터 로드
  useEffect(() => {
    loadStaticData();
    updateCacheStats();
  }, []);

  // 시도 변경 시 구군 목록 업데이트
  useEffect(() => {
    if (selectedSido) {
      const guguns = regionApiService.getGugunList(selectedSido);
      setGugunList(guguns);
      setSelectedGugun(''); // 구군 초기화
      setCurrentPage(1); // 페이지 초기화
    } else {
      setGugunList([]);
      setSelectedGugun('');
    }
  }, [selectedSido]);

  // 필터 조건 변경 시 데이터 로드
  useEffect(() => {
    if (selectedSido) {
      loadCompanyData();
      loadAggregates();
    }
  }, [selectedSido, selectedGugun, currentPage, pageSize, searchTerm]);

  /**
   * 📋 정적 데이터 로드 (시도 목록)
   */
  const loadStaticData = () => {
    try {
      const sidos = regionApiService.getSidoList();
      setSidoList(sidos);
      console.log('✅ 정적 데이터 로드 완료:', sidos.length, '개 시도');
    } catch (error) {
      console.error('❌ 정적 데이터 로드 실패:', error);
      setError('정적 데이터를 불러올 수 없습니다.');
    }
  };

  /**
   * 🏢 업체 목록 로드 (페이징 적용)
   */
  const loadCompanyData = async () => {
    if (!selectedSido) return;
    
    setLoading(true);
    setError(null);
    
    // 🕐 로딩 타임아웃 (40초)
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
      setError('요청 시간이 초과되었습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.');
    }, 40000);
    
    try {
      const result = await regionApiService.getCompanyList({
        sido: selectedSido,
        gugun: selectedGugun,
        page: currentPage,
        pageSize: pageSize,
        search: searchTerm
      });
      
      clearTimeout(loadingTimeout);
      
      setCompanyList(result.data || []);
      setPagination(result.pagination);
      
      console.log(`✅ 업체 목록 로드 완료: ${result.data.length}건`);
      updateCacheStats();
      
    } catch (error) {
      clearTimeout(loadingTimeout);
      console.error('❌ 업체 목록 로드 실패:', error);
      
      // 😤 사용자 친화적 오류 메시지
      let userMessage = error.message;
      if (error.message.includes('시간 초과')) {
        userMessage = '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('Circuit Breaker')) {
        userMessage = '서버가 일시적으로 불안정합니다. 5분 후 다시 시도해주세요.';
      } else if (error.message.includes('Failed to fetch')) {
        userMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
      } else if (error.message.includes('API 호출 실패')) {
        userMessage = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      
      setError(userMessage);
      setCompanyList([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📊 집계 정보 로드 (별도 API)
   */
  const loadAggregates = async () => {
    if (!selectedSido) return;
    
    setAggregatesLoading(true);
    
    // 🕐 집계 로딩 타임아웃 (30초)
    const aggregatesTimeout = setTimeout(() => {
      setAggregatesLoading(false);
      console.warn('⚠️ 집계 정보 로딩 타임아웃');
    }, 30000);
    
    try {
      const result = await regionApiService.getAggregates({
        sido: selectedSido,
        gugun: selectedGugun,
        search: searchTerm
      });
      
      clearTimeout(aggregatesTimeout);
      
      setAggregates(result.aggregates);
      console.log('✅ 집계 정보 로드 완료');
      updateCacheStats();
      
    } catch (error) {
      clearTimeout(aggregatesTimeout);
      console.error('❌ 집계 정보 로드 실패:', error);
      
      // 🔄 집계 정보는 실패해도 치명적이지 않으므로 기본값 설정
      setAggregates({
        totalCount: 0,
        maxEmployeeCount: 0,
        avgEmployeeCount: 0,
        aggregatesCalculated: false,
        error: true,
        errorMessage: '집계 정보를 불러올 수 없습니다.'
      });
    } finally {
      setAggregatesLoading(false);
    }
  };

  /**
   * 📊 캐시 통계 업데이트
   */
  const updateCacheStats = () => {
    const stats = regionApiService.getCacheStats();
    setCacheStats(stats);
  };

  /**
   * 🔄 검색 실행
   */
  const handleSearch = () => {
    setCurrentPage(1); // 검색 시 첫 페이지로
    // searchTerm 상태가 변경되면 useEffect에서 자동으로 로드됨
  };

  /**
   * 📄 페이지 변경
   */
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  /**
   * 🧹 캐시 클리어
   */
  const handleClearCache = () => {
    regionApiService.clearCache(selectedSido, selectedGugun);
    updateCacheStats();
    alert('캐시가 삭제되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 📋 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🏢 지역별 업체 목록 (최적화 버전)
          </h1>
          <p className="text-gray-600">
            요청서 요구사항 적용: 페이징 필수, 집계 분리, 캐싱 전략, 정적 데이터 활용
          </p>
        </div>

        {/* 🔧 필터 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* 시도 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시도 선택 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSido}
                onChange={(e) => setSelectedSido(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">시도를 선택하세요</option>
                {sidoList.map((sido) => (
                  <option key={sido.시도} value={sido.시도}>
                    {sido.시도} ({sido.업체수.toLocaleString()}개)
                  </option>
                ))}
              </select>
            </div>

            {/* 구군 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                구군 선택
              </label>
              <select
                value={selectedGugun}
                onChange={(e) => setSelectedGugun(e.target.value)}
                disabled={!selectedSido}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">전체 구군</option>
                {gugunList.map((gugun) => (
                  <option key={gugun.구군} value={gugun.구군}>
                    {gugun.구군} ({gugun.업체수.toLocaleString()}개)
                  </option>
                ))}
              </select>
            </div>

            {/* 페이지 크기 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                페이지 크기 <span className="text-red-500">*</span>
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25개</option>
                <option value={50}>50개</option>
                <option value={100}>100개</option>
                <option value={200}>200개</option>
              </select>
            </div>

            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검색 (사업자번호/업체명)
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="검색어 입력..."
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                >
                  🔍
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 집계 정보 섹션 */}
        {aggregates && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">📊 집계 정보</h2>
              {aggregatesLoading && (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                  로딩 중...
                </div>
              )}
            </div>
            
            {aggregates.error ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                ⚠️ {aggregates.errorMessage}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600">전체 업체 수</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {aggregates.totalCount.toLocaleString()}개
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600">최대 고용인원</div>
                  <div className="text-2xl font-bold text-green-800">
                    {aggregates.maxEmployeeCount.toLocaleString()}명
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600">평균 고용인원</div>
                  <div className="text-2xl font-bold text-yellow-800">
                    {aggregates.avgEmployeeCount.toLocaleString()}명
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600">집계 계산 여부</div>
                  <div className="text-lg font-bold text-purple-800">
                    {aggregates.aggregatesCalculated ? '✅ 완료' : '⚠️ 생략'}
                  </div>
                  {aggregates.note && (
                    <div className="text-xs text-purple-600 mt-1">
                      {aggregates.note}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🗄️ 캐시 통계 */}
        {cacheStats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">🗄️ 캐시 통계</h2>
              <button
                onClick={handleClearCache}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                캐시 삭제
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>히트율: <strong>{cacheStats.hitRate}</strong></div>
              <div>히트: <strong>{cacheStats.hits}</strong></div>
              <div>미스: <strong>{cacheStats.misses}</strong></div>
              <div>메모리 크기: <strong>{cacheStats.memorySize}</strong></div>
            </div>
          </div>
        )}

        {/* ⚠️ 오류 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {/* 📄 페이징 정보 */}
        {pagination && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-gray-700">
                총 <strong>{pagination.totalCount.toLocaleString()}</strong>개 업체 
                (페이지 {pagination.page} / {pagination.totalPages})
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  이전
                </button>
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  {pagination.page}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🏢 업체 목록 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              🏢 업체 목록 {loading && '(로딩 중...)'}
            </h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
              <p className="text-gray-600">데이터를 불러오는 중...</p>
            </div>
          ) : companyList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      사업자등록번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      사업장명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      지역
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      업종명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      2024년 고용인원
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {companyList.map((company, index) => (
                    <tr key={company.사업자등록번호 || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {company.사업자등록번호}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {company.사업장명}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.시도} {company.구군}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {company.업종명}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(company['2024'] || company['[2024]'] || 0).toLocaleString()}명
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedSido ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">조건에 맞는 업체가 없습니다.</p>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">시도를 선택하여 업체 목록을 조회하세요.</p>
            </div>
          )}
        </div>

        {/* 🔧 디버그 정보 (개발용) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-800 text-white rounded-lg p-6 mt-6">
            <h3 className="text-lg font-bold mb-4">🔧 디버그 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>필터 상태:</strong>
                <pre className="mt-2 text-xs">{JSON.stringify({
                  selectedSido,
                  selectedGugun,
                  searchTerm,
                  currentPage,
                  pageSize
                }, null, 2)}</pre>
              </div>
              <div>
                <strong>API 응답:</strong>
                <pre className="mt-2 text-xs">{JSON.stringify({
                  pagination,
                  aggregates: aggregates ? '로드됨' : '미로드',
                  companyCount: companyList.length
                }, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionListPage; 