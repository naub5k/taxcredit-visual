import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CompanyDataBars } from './RegionDetailComponents';
import PartnerModal from './PartnerModal';
import performanceTracker from '../utils/performance';
import dataCache from '../utils/dataCache';

function RegionDetailPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [aggregates, setAggregates] = useState({});
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  
  // 사업자등록번호 표준 표기법 변환 함수
  const formatBusinessNumber = (bizno) => {
    if (!bizno || bizno.length !== 10) return bizno;
    return `${bizno.slice(0, 3)}-${bizno.slice(3, 5)}-${bizno.slice(5)}`;
  };
  
  // URL에서 쿼리 파라미터 가져오기 (영문 키만 사용)
  const queryParams = new URLSearchParams(location.search);
  const sido = queryParams.get('sido');
  const gugun = queryParams.get('gugun');
  
  // 디버깅용 로그 추가
  useEffect(() => {
    console.log('현재 URL:', location.search);
    console.log('sido:', sido, 'gugun:', gugun);
  }, [location.search, sido, gugun]);
  
  // 현재 사용 중인 API 서버 URL 출력 (디버깅용)
  useEffect(() => {
    const hostname = window.location.hostname;
    console.log('현재 호스트:', hostname);
    console.log('환경:', process.env.NODE_ENV);
    const isProd = process.env.NODE_ENV === 'production';
    console.log('빌드 모드:', isProd ? '프로덕션' : '개발');
  }, []);
  
  // 실제 API 호출 함수 (캐싱 없이)
  const fetchFromAPI = useCallback(async (page = 1, pageSize = 10) => {
    // API URL 결정 로직 - 환경에 따른 분기 처리
    const baseUrl = window.location.hostname.includes("localhost")
      ? "http://localhost:7071"
      : "https://taxcredit-api-func-v2.azurewebsites.net";
    
    // 새로운 API 호출 (페이지네이션 및 집계값 포함)
    const apiUrl = `${baseUrl}/api/getSampleList?sido=${encodeURIComponent(sido)}&gugun=${encodeURIComponent(gugun)}&page=${page}&pageSize=${pageSize}`;
    
    // 성능 측정과 함께 API 호출
    return await performanceTracker.measureAPI(
      `getSampleList-${sido}-${gugun}-page${page}`,
      async () => {
        const response = await fetch(apiUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        // 응답 상태 확인
        if (!response.ok) {
          throw new Error(`API 오류: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      }
    );
  }, [sido, gugun]);

  // 데이터 로딩 함수 (캐싱 지원)
  const fetchData = useCallback(async (page = 1, pageSize = 10) => {
    try {
      console.log(`데이터 로딩 시작: sido=${sido}, gugun=${gugun}, page=${page}`);
      
      // 1. 캐시에서 먼저 확인
      const cachedData = await dataCache.get(sido, gugun, page, pageSize);
      if (cachedData) {
        console.log('📬 캐시에서 데이터 로드됨');
        
        // 캐시된 데이터에 fromCache 정보 추가
        if (cachedData.meta) {
          cachedData.meta.fromCache = true;
        }
        
        return cachedData;
      }
      
      // 2. 캐시에 없으면 API 호출
      console.log('📡 API에서 데이터 로드 중...');
      const responseData = await fetchFromAPI(page, pageSize);
      
      // 3. 응답 데이터에 캐시 정보 추가
      if (responseData && responseData.meta) {
        responseData.meta.fromCache = false;
      }
      
      // 4. 응답 데이터를 캐시에 저장
      if (responseData && !responseData.error) {
        await dataCache.set(sido, gugun, page, pageSize, responseData);
        
        // 5. 선제적 캐싱 (다음 페이지들 미리 로드)
        if (page === 1) {
          dataCache.preloadNextPages(sido, gugun, page, pageSize, fetchFromAPI);
        }
      }
      
      return responseData;
      
    } catch (error) {
      console.error("데이터 로딩 오류:", error);
      throw error;
    }
  }, [sido, gugun, fetchFromAPI]);

  useEffect(() => {
    if (!sido) {
      setError("시도 정보가 없습니다. 이전 페이지로 돌아가 지역을 선택해주세요.");
      setLoading(false);
      return;
    }

    // 데이터 로딩 및 상태 업데이트 함수를 useEffect 내부로 이동
    const loadAndSetData = async (page = 1, pageSize = 10) => {
      try {
        setLoading(true);
        const responseData = await fetchData(page, pageSize);
        
        console.log('=== API 응답 데이터 분석 ===');
        
        // 응답 구조 검증
        if (!responseData) {
          throw new Error('No response data');
        }
        
        console.log('응답 구조:', Object.keys(responseData));
        
        // API-FUNC 응답 구조 처리: 전체 데이터를 받아서 클라이언트 페이징
        let fullDataArray = [];
        
        if (Array.isArray(responseData)) {
          // 응답이 직접 배열인 경우 (전체 데이터)
          fullDataArray = responseData;
          console.log(`📊 전체 배열 응답: ${fullDataArray.length}건`);
        } else if (responseData.data && Array.isArray(responseData.data)) {
          // data 속성에 배열이 있는 경우
          fullDataArray = responseData.data;
          console.log(`📊 구조화된 응답: ${fullDataArray.length}건`);
        } else {
          console.warn('⚠️ 예상하지 못한 응답 구조:', responseData);
          fullDataArray = [];
        }
        
        // 클라이언트 페이징 처리
        const totalCount = fullDataArray.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = fullDataArray.slice(startIndex, endIndex);
        
        console.log(`🔄 클라이언트 페이징: ${startIndex}-${endIndex} (총 ${totalCount}건 중 ${pageData.length}건 표시)`);
        
        // 데이터 샘플 확인 (첫 번째 항목만)
        if (pageData.length > 0) {
          console.log('현재 페이지 첫 번째 데이터:', pageData[0]);
        }
        
        // 오류 응답 확인
        if (responseData.error) {
          console.warn('⚠️ API 오류 응답:', responseData.error);
          throw new Error(responseData.error.message || 'API 오류 발생');
        }
        
        // 현재 페이지 데이터만 상태 업데이트
        setData(pageData);
        
        // 성능 최적화: 현재 페이지 데이터만으로 집계 계산
        const currentPageEmployeeCounts = pageData.map(item => {
          return Math.max(
            item['2020'] || 0,
            item['2021'] || 0,
            item['2022'] || 0,
            item['2023'] || 0,
            item['2024'] || 0
          );
        }).filter(count => count > 0);
        
        // 전체 데이터 기준 집계 계산 (한 번만)
        const allEmployeeCounts = fullDataArray.map(item => {
          return Math.max(
            item['2020'] || 0,
            item['2021'] || 0,
            item['2022'] || 0,
            item['2023'] || 0,
            item['2024'] || 0
          );
        }).filter(count => count > 0);
        
        const maxEmployeeCount = allEmployeeCounts.length > 0 
          ? Math.max(...allEmployeeCounts) 
          : 0;
        const avgEmployeeCount = allEmployeeCounts.length > 0 
          ? Math.round(allEmployeeCounts.reduce((sum, count) => sum + count, 0) / allEmployeeCounts.length) 
          : 0;
        const minEmployeeCount = allEmployeeCounts.length > 0 
          ? Math.min(...allEmployeeCounts) 
          : 0;
        
        // aggregates 상태 업데이트 (전체 데이터 기준)
        const aggregatesData = {
          maxEmployeeCount,
          minEmployeeCount,
          avgEmployeeCount,
          totalCount
        };
        
        console.log('🎯 계산된 aggregates 데이터 (전체 기준):', aggregatesData);
        
        setAggregates(aggregatesData);
        
        // 페이지네이션 설정 (클라이언트 계산)
        const totalPages = Math.ceil(totalCount / pageSize);
        setPagination({
          page: page,
          pageSize: pageSize,
          totalCount: totalCount,
          totalPages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        });
        
        setPerformanceMetrics({
          serverCalculated: false,
          requestedAt: new Date().toISOString(),
          fromCache: responseData.meta?.fromCache || false,
          duration: responseData.meta?.performance?.duration || 0,
          clientPaginated: true // 클라이언트 페이징 표시
        });
        
        // 필터링 검증 (현재 페이지 데이터만)
        if (sido && gugun && pageData.length > 0) {
          const matchingItems = pageData.filter(item => item.구군 === gugun);
          console.log(`- 구군(${gugun}) 일치 항목: ${matchingItems.length}/${pageData.length}건`);
        }
        
      } catch (error) {
        console.error("데이터 로딩 오류:", error);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadAndSetData(currentPage);
  }, [sido, gugun, currentPage, fetchData]);

  const handleBack = () => {
    // 강제로 홈페이지로 이동
    navigate('/', { replace: true });
  };
  
  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      // 스크롤을 맨 위로 이동
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // 클라이언트측 필터링 (이제 서버에서 이미 필터링됨)
  const filteredData = useMemo(() => {
    return data || [];
  }, [data]);
  
  // 최대값 계산 함수 (이제 서버에서 계산된 값 사용)
  const maxEmployeeCount = useMemo(() => {
    return aggregates.maxEmployeeCount || 0;
  }, [aggregates]);

  // 파트너 모달 닫기
  const handleClosePartnerModal = () => {
    setShowPartnerModal(false);
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
      <div className="flex justify-center items-center space-x-2 mt-8 mb-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!pagination.hasPrev}
          className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          이전
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
              className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              {pagination.totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!pagination.hasNext}
          className="px-3 py-2 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
        >
          다음
        </button>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">데이터를 불러오는 중...</p>
            {currentPage > 1 && (
              <p className="text-sm text-gray-500 mt-2">페이지 {currentPage} 로딩 중</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-red-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-1">오류 발생</h2>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={handleBack}
            className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={handleBack}
              className="p-2 mr-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">{sido} {gugun}</h1>
              <p className="text-sm opacity-80">상세 사업장 정보</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {!loading && !error && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  전체 기업수: <span className="text-blue-600 font-bold">{(aggregates.totalCount || 0).toLocaleString()}</span>개
                  <span className="hidden lg:inline text-gray-400 text-xs ml-2">(디버그: {JSON.stringify(aggregates)})</span>
                </h2>
                <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-4">
                  <span>페이지 {currentPage} / {pagination.totalPages || 1}</span>
                  <span className="hidden md:inline">최대 고용인원: {aggregates.maxEmployeeCount || 0}명</span>
                  <span className="hidden md:inline">평균 고용인원: {aggregates.avgEmployeeCount || 0}명</span>
                  {performanceMetrics.serverCalculated && (
                    <span className="hidden lg:inline text-green-600">서버 최적화 적용됨</span>
                  )}
                  {performanceMetrics.fromCache && (
                    <span className="hidden lg:inline text-blue-600">캐시에서 로드됨</span>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  to={`/partner?sido=${encodeURIComponent(sido)}&gugun=${encodeURIComponent(gugun)}`}
                  className="text-purple-700 font-semibold hover:underline flex items-center"
                >
                  파트너 전용 <span className="ml-1">&gt;</span>
                </Link>
              </div>
            </div>

            {/* 업체별 상세 결과 표시 */}
            {filteredData.length > 0 ? (
              <>
                <div className="space-y-6">
                  {filteredData.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="p-4 border-b">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 
                              className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => navigate(`/company/${item.사업자등록번호}`)}
                            >
                              {item.사업장명}
                            </h3>
                            <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-2">
                              {item.업종명 && <span>{item.업종명}</span>}
                              {item.사업자등록번호 && (
                                <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">
                                  {formatBusinessNumber(item.사업자등록번호)}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/company/${item.사업자등록번호}`)}
                            className="ml-4 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            상세보기
                          </button>
                        </div>
                      </div>
                      
                      {/* 연도별 그래프 */}
                      <div className="bg-gray-50">
                        <div className="p-3 border-b">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-700">연도별 고용인원 추이</h4>
                            <div className="text-xs text-gray-500">(단위: 명)</div>
                          </div>
                          <CompanyDataBars item={item} maxEmployeeCount={maxEmployeeCount} />
                        </div>
                        
                        <div className="px-4 py-3 grid grid-cols-1 gap-3 text-sm text-gray-700">
                          <div>
                            <span className="font-medium text-gray-500">주소:</span> {item.사업장주소}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 페이지네이션 */}
                <PaginationComponent />
              </>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">검색 결과가 없습니다</h3>
                <p className="text-gray-500">
                  {sido} {gugun} 지역에 해당하는 사업장 데이터를 찾을 수 없습니다.
                </p>
              </div>
            )}
          </>
        )}
      </main>
      
      {/* 파트너 모달 */}
      <PartnerModal
        isOpen={showPartnerModal}
        onClose={handleClosePartnerModal}
        sido={sido}
        gugun={gugun}
      />
    </div>
  );
}

export default RegionDetailPage; 