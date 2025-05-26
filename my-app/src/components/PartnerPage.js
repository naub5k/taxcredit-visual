import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function PartnerPage() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    sido: '',
    gugun: '',
    industry: '',
    employeeRange: ''
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  
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
    setLoading(true);
    try {
      // 여기에 파트너 전용 API 호출 로직 추가
      console.log('파트너 검색 실행:', { searchTerm, filters });
      
      // 임시 데이터 (실제로는 API 호출)
      setTimeout(() => {
        setData([
          { id: 1, name: '파트너 전용 데이터 1', type: 'premium' },
          { id: 2, name: '파트너 전용 데이터 2', type: 'premium' }
        ]);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('검색 오류:', error);
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
              <p className="text-sm opacity-90">고급 검색 및 분석 도구</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">고급 검색</h2>
          
          {/* 검색바 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              통합 검색
            </label>
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="회사명, 사업자등록번호, 업종 등을 검색하세요..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
              >
                {loading ? '검색중...' : '검색'}
              </button>
            </div>
          </div>

          {/* 필터 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시도</label>
              <select
                value={filters.sido}
                onChange={(e) => setFilters(prev => ({ ...prev, sido: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">전체</option>
                <option value="서울특별시">서울특별시</option>
                <option value="경기도">경기도</option>
                <option value="인천광역시">인천광역시</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">구군</label>
              <select
                value={filters.gugun}
                onChange={(e) => setFilters(prev => ({ ...prev, gugun: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">전체</option>
                <option value="강남구">강남구</option>
                <option value="강서구">강서구</option>
                <option value="마포구">마포구</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">업종</label>
              <select
                value={filters.industry}
                onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">전체</option>
                <option value="제조업">제조업</option>
                <option value="서비스업">서비스업</option>
                <option value="IT">정보통신업</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">고용인원</label>
              <select
                value={filters.employeeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, employeeRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">전체</option>
                <option value="1-10">1-10명</option>
                <option value="11-50">11-50명</option>
                <option value="51-100">51-100명</option>
                <option value="100+">100명 이상</option>
              </select>
            </div>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">검색 결과</h3>
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
              {data.map((item) => (
                <div key={item.id} className="border border-purple-200 rounded-lg p-4 hover:bg-purple-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <span className="text-sm text-purple-600 font-medium">{item.type}</span>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
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