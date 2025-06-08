import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buildApiUrl, API_CONFIG } from '../config/apiConfig';

function PartnerPage() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [aggregates, setAggregates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [includeAggregates, setIncludeAggregates] = useState(false);
  const [filters, setFilters] = useState({
    sido: '',
    gugun: '',
    industry: '',
    employeeRange: ''
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // 사업자등록번호 표준 표기법 변환 함수
  const formatBusinessNumber = (bizno) => {
    if (!bizno || bizno.length !== 10) return bizno;
    return `${bizno.slice(0, 3)}-${bizno.slice(3, 5)}-${bizno.slice(5)}`;
  };
  
  // URL에서 초기 파라미터 가져오기
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sido = queryParams.get('sido');
    const gugun = queryParams.get('gugun');
    
    if (sido || gugun) {
      setFilters(prev => ({
        ...prev,
        sido: sido || '',
        gugun: gugun || ''
      }));
    }
  }, [location.search]);

  const handleBack = () => {
    navigate('/', { replace: true });
  };

  // 페이지 단위 검색 함수
  const searchData = async (searchQuery, targetPage = 1, withAggregates = includeAggregates) => {
    try {
      setLoading(true);
      const pageSize = 20;
      
      console.log('🔍 파트너 페이지 단위 검색 실행 (성능 최적화):', { 
        searchQuery, 
        targetPage, 
        pageSize,
        includeAggregates: withAggregates,
        filters 
      });
      
      // API URL 생성 (성능 최적화 파라미터 포함)
      const apiUrl = `${buildApiUrl(API_CONFIG.ENDPOINTS.ANALYZE_COMPANY_DATA)}?search=${encodeURIComponent(searchQuery.trim())}&page=${targetPage}&pageSize=${pageSize}&includeAggregates=${withAggregates}`;
      
      console.log('📡 API 호출:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ 성능 최적화된 검색 결과:', responseData);
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'API 호출이 실패했습니다.');
      }
      
      const { data: companies, pagination, aggregates, performance: perfData } = responseData;
      
      console.log(`✅ 페이지 ${targetPage} 검색 결과 (최적화):`, {
        데이터건수: companies.length,
        페이징정보: pagination,
        집계정보: aggregates,
        성능정보: perfData
      });
      
      // 검색 결과 데이터 설정
      setData(companies);
      setPagination(pagination);
      setAggregates(aggregates);
      setCurrentPage(targetPage);
      
    } catch (error) {
      console.error('❌ 검색 오류:', error);
      alert('검색 중 오류가 발생했습니다: ' + error.message);
      setData([]);
      setPagination({});
      setAggregates({});
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    await searchData(searchTerm, 1); // 항상 1페이지부터 시작
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && searchTerm.trim()) {
      console.log(`🔄 파트너 페이지 변경: ${currentPage} → ${newPage}`);
      searchData(searchTerm, newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 페이지네이션 컴포넌트
  const PaginationComponent = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex justify-center items-center space-x-2 mt-6 mb-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!pagination.hasPrev}
          className="px-3 py-2 rounded-md bg-purple-200 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-300"
        >
          이전
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 rounded-md bg-purple-200 text-purple-700 hover:bg-purple-300"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 rounded-md ${
              page === currentPage
                ? 'bg-purple-600 text-white'
                : 'bg-purple-200 text-purple-700 hover:bg-purple-300'
            }`}
          >
            {page}
          </button>
        ))}
        
        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              className="px-3 py-2 rounded-md bg-purple-200 text-purple-700 hover:bg-purple-300"
            >
              {pagination.totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!pagination.hasNext}
          className="px-3 py-2 rounded-md bg-purple-200 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-300"
        >
          다음
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* 헤더 */}
      <header className="bg-purple-700 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={handleBack}
              className="p-2 mr-3 rounded-full hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">파트너 전용 페이지</h1>
              <p className="text-sm opacity-90">사업장 검색 및 분석 도구 (페이지 단위 개선)</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-600 px-3 py-1 rounded-full text-xs font-medium">PREMIUM</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 검색 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">검색 (사업장명 or 사업자등록번호)</h2>
          
          {/* 검색바 */}
          <div>
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="사업장명 또는 사업자등록번호를 검색하세요..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-3 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors font-semibold"
              >
                {loading ? '검색중...' : '검색'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              • 사업장명: 부분 검색 가능 (예: "노무법인", "춘추")
              <br />
              • 사업자등록번호: 하이픈 없이 10자리 입력 (예: "1148638828" → 114-86-38828로 표시)
              <br />
              • 🚀 <span className="text-purple-600 font-semibold">페이지 단위 로딩</span>으로 빠른 검색 결과 제공
            </p>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">검색 결과</h3>
              {aggregates.totalCount > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  <p>총 <span className="font-semibold text-purple-600">{aggregates.totalCount.toLocaleString()}</span>개의 사업장이 검색되었습니다.</p>
                  <p>페이지 {currentPage} / {pagination.totalPages || 1} (페이지당 {pagination.pageSize || 20}건씩 표시)</p>
                  {!aggregates.aggregatesCalculated && (
                    <button
                      onClick={() => {
                        if (searchTerm.trim()) {
                          setIncludeAggregates(true);
                          searchData(searchTerm, currentPage, true);
                        }
                      }}
                      className="text-purple-600 hover:text-purple-800 underline text-sm mt-1"
                    >
                      📊 집계 정보 보기 (최대/평균 고용인원)
                    </button>
                  )}
                  {aggregates.aggregatesCalculated && (
                    <p className="text-purple-700">최대 고용인원: {aggregates.maxEmployeeCount}명 | 평균: {aggregates.avgEmployeeCount}명</p>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500">
              파트너 전용 고급 데이터
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600 mb-4"></div>
              <p className="text-lg text-gray-600">데이터를 검색하는 중...</p>
              {currentPage > 1 && (
                <p className="text-sm text-gray-500 mt-2">페이지 {currentPage} 로딩 중</p>
              )}
            </div>
          ) : data.length > 0 ? (
            <>
              <div className="space-y-4">
                {data.map((item, index) => (
                  <div key={index} className="border border-purple-200 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 
                          className="font-semibold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors"
                          onClick={() => {
                            console.log(`🔗 파트너 검색 결과 클릭: ${item.사업장명}, bizno: ${item.사업자등록번호}`);
                            if (item.사업자등록번호) {
                              navigate(`/company/${item.사업자등록번호}`);
                            } else {
                              console.error('❌ 사업자등록번호를 찾을 수 없습니다:', item);
                              alert('사업자등록번호를 찾을 수 없습니다.');
                            }
                          }}
                        >
                          {item.사업장명}
                        </h4>
                        <div className="text-sm text-gray-500 mt-1 space-y-1">
                          <div>사업자등록번호: <span className="font-mono">{item.사업자등록번호 ? formatBusinessNumber(item.사업자등록번호) : '정보 없음'}</span></div>
                          <div>업종: {item.업종명}</div>
                          <div>주소: {item.사업장주소}</div>
                          <div>최근 고용인원: <span className="font-semibold text-purple-600">{item['2024'] || 0}명</span></div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          console.log(`🔗 파트너 상세보기 클릭: ${item.사업장명}, bizno: ${item.사업자등록번호}`);
                          if (item.사업자등록번호) {
                            navigate(`/company/${item.사업자등록번호}`);
                          } else {
                            console.error('❌ 사업자등록번호를 찾을 수 없습니다:', item);
                            alert('사업자등록번호를 찾을 수 없습니다.');
                          }
                        }}
                        className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        상세보기
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              <PaginationComponent />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">검색을 시작하세요</h3>
              <p className="text-gray-500">
                위의 검색 조건을 설정하고 검색 버튼을 클릭하세요.
              </p>
            </div>
          )}
        </div>

        {/* 파트너 전용 기능 안내 */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">파트너 전용 기능 (페이지 단위 최적화)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">⚡ 빠른 검색</h4>
              <p className="text-sm opacity-90">페이지 단위 로딩으로 빠른 응답</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">📊 실시간 집계</h4>
              <p className="text-sm opacity-90">서버에서 계산된 정확한 통계</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h10a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">🔍 정밀 검색</h4>
              <p className="text-sm opacity-90">사업장명/사업자등록번호 통합 검색</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PartnerPage; 