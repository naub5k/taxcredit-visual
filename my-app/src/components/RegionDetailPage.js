import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CompanyDataBars } from './RegionDetailComponents';
import PartnerModal from './PartnerModal';

function RegionDetailPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`API 호출 시작: sido=${sido}, gugun=${gugun}`);
        
        // ⚠️ 중요: v2 API 호출 구성 - UI 작동에 결정적인 부분
        // API URL 결정 로직 - 환경에 따른 분기 처리
        const baseUrl = window.location.hostname.includes("localhost")
          ? "http://localhost:7071"
          : "https://taxcredit-api-func-v2.azurewebsites.net";
        
        console.log('API 기본 URL:', baseUrl);
        
        // ⚠️ 중요: 여기서 v2 함수 API(getSampleList)를 호출함
        // 이 API 호출이 UI 데이터 표시에 직접적 영향을 미침
        const apiUrl = `${baseUrl}/api/getSampleList?sido=${encodeURIComponent(sido)}&gugun=${encodeURIComponent(gugun)}`;
        console.log('최종 API URL:', apiUrl);
        
        // 간소화된 fetch 옵션
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
        
        // 응답 데이터 처리
        const responseData = await response.json();
        console.log(`데이터 ${responseData.length}건 수신됨`);
        
        // 필터링 검증은 유지
        if (sido && gugun && responseData.length > 0) {
          const matchingItems = responseData.filter(item => item.구군 === gugun);
          console.log(`- 구군(${gugun}) 일치 항목: ${matchingItems.length}건`);
        }
        
        setData(responseData);
      } catch (error) {
        console.error("API 호출 오류:", error);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (sido) {
      fetchData();
    } else {
      setError("시도 정보가 없습니다. 이전 페이지로 돌아가 지역을 선택해주세요.");
      setLoading(false);
    }
  }, [sido, gugun]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  // 클라이언트측 필터링
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return gugun ? data.filter(item => item.구군 === gugun) : data;
  }, [data, gugun]);
  
  // 최대값 계산 함수
  const maxEmployeeCount = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return 0;
    
    return Math.max(
      ...filteredData.flatMap(item => [
        Number(item['2020']) || 0,
        Number(item['2021']) || 0,
        Number(item['2022']) || 0,
        Number(item['2023']) || 0,
        Number(item['2024']) || 0
      ])
    );
  }, [filteredData]);

  // 파트너 모달 닫기
  const handleClosePartnerModal = () => {
    setShowPartnerModal(false);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">데이터를 불러오는 중...</p>
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
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                총 검색결과: <span className="text-blue-600 font-bold">{filteredData.length}</span>개
              </h2>
              <div className="flex items-center">
                <Link
                  to={`/partner?sido=${sido}&gugun=${gugun}`}
                  className="text-purple-700 font-semibold hover:underline flex items-center"
                >
                  파트너 전용 <span className="ml-1">&gt;</span>
                </Link>
              </div>
            </div>

            {/* 업체별 상세 결과 표시 */}
            {filteredData.length > 0 ? (
              <div className="space-y-6">
                {filteredData.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-bold text-gray-800">{item.사업장명}</h3>
                      <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-2">
                        {item.업종명 && <span>{item.업종명}</span>}
                        {item.사업자등록번호 && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded">
                            {item.사업자등록번호}
                          </span>
                        )}
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
                      
                      <div className="px-4 py-3 grid grid-cols-2 gap-3 text-sm text-gray-700">
                        <div>
                          <span className="font-medium text-gray-500">주소:</span> {item.주소}
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">대표자:</span> {item.대표자명 || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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