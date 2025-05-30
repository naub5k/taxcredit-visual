import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function PartnerPage() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [searchResultCount, setSearchResultCount] = useState(0);
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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      console.log('파트너 검색 실행:', { searchTerm, filters });
      
      // API URL 결정
      const baseUrl = window.location.hostname.includes("localhost")
        ? "http://localhost:7071"
        : "https://taxcredit-api-func-v2.azurewebsites.net";
      
      // 검색 API 호출 (사업장명 또는 사업자등록번호)
      const apiUrl = `${baseUrl}/api/getSampleList?search=${encodeURIComponent(searchTerm.trim())}&page=1&pageSize=20`;
      
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
      console.log('검색 결과:', responseData);
      
      // 검색 결과 설정
      const resultData = responseData.data || [];
      setData(resultData);
      setSearchResultCount(resultData.length);
      
    } catch (error) {
      console.error('검색 오류:', error);
      alert('검색 중 오류가 발생했습니다: ' + error.message);
      setData([]);
      setSearchResultCount(0);
    } finally {
      setLoading(false);
    }
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
              <p className="text-sm opacity-90">사업장 검색 및 분석 도구</p>
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
            </p>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">검색 결과</h3>
              {searchResultCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  총 <span className="font-semibold text-purple-600">{searchResultCount.toLocaleString()}</span>개의 사업장이 검색되었습니다.
                </p>
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
            </div>
          ) : data.length > 0 ? (
            <div className="space-y-4">
              {data.map((item, index) => (
                <div key={index} className="border border-purple-200 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 
                        className="font-semibold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors"
                        onClick={() => navigate(`/company/${item.사업자등록번호}`)}
                      >
                        {item.사업장명}
                      </h4>
                      <div className="text-sm text-gray-500 mt-1 space-y-1">
                        <div>사업자등록번호: <span className="font-mono">{formatBusinessNumber(item.사업자등록번호)}</span></div>
                        <div>업종: {item.업종명}</div>
                        <div>주소: {item.사업장주소}</div>
                        <div>최근 고용인원: <span className="font-semibold text-purple-600">{item['2024'] || 0}명</span></div>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/company/${item.사업자등록번호}`)}
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
          <h3 className="text-xl font-bold mb-4">파트너 전용 기능</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">고급 분석</h4>
              <p className="text-sm opacity-90">상세한 고용 트렌드 분석</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">데이터 내보내기</h4>
              <p className="text-sm opacity-90">Excel, CSV 형태로 다운로드</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h10a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">맞춤 리포트</h4>
              <p className="text-sm opacity-90">개별 기업 상세 분석 리포트</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PartnerPage; 