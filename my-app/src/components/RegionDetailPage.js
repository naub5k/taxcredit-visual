import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function RegionDetailPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL에서 쿼리 파라미터 가져오기 (영문 키만 사용)
  const queryParams = new URLSearchParams(location.search);
  const sido = queryParams.get('sido');
  const gugun = queryParams.get('gugun');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`API 호출 시작: sido=${sido}, gugun=${gugun}`);
        console.log('현재 환경:', process.env.NODE_ENV);

        // 환경에 따른 API URL 구성
        const baseUrl =
          process.env.NODE_ENV === "development"
            ? `http://${window.location.hostname}:7071`
            : "https://taxcredit-api-func-v2.azurewebsites.net";
            
        const apiPath = "/api/getSampleList";
        
        // API URL 구성 - 직접 호출 방식으로 변경
        const apiUrl = `${baseUrl}${apiPath}?sido=${encodeURIComponent(sido)}&gugun=${encodeURIComponent(gugun)}`;
        
        console.log('API URL:', apiUrl);

        // 모든 환경에서 일관된 fetch 옵션 사용
        const fetchOptions = {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        };
        
        console.log('Fetch 옵션:', JSON.stringify(fetchOptions));
        
        // API 호출 및 응답 처리
        const response = await fetch(apiUrl, fetchOptions);
        
        if (!response.ok) {
          throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
        }
        
        // 디버깅: 응답 타입 확인
        const contentType = response.headers.get('content-type');
        console.log('응답 Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('응답이 JSON 형식이 아닙니다:', contentType);
          
          // 응답 텍스트 확인 (디버깅용)
          const textResponse = await response.text();
          console.error('비정상 응답:', textResponse.substring(0, 100) + '...');
          throw new Error('API가 JSON이 아닌 다른 형식으로 응답했습니다.');
        }
        
        // JSON 응답 파싱
        const responseData = await response.json();
        console.log(`API 응답 데이터: ${responseData.length}건 수신됨`);
        
        // 데이터 확인 및 필터링 검증
        if (sido && gugun && responseData.length > 0) {
          console.log('응답 데이터 구군 필터 확인:');
          const matchingItems = responseData.filter(item => item.구군 === gugun);
          const nonMatchingItems = responseData.filter(item => item.구군 !== gugun);
          
          console.log(`- 구군(${gugun}) 일치 항목: ${matchingItems.length}건`);
          if (nonMatchingItems.length > 0) {
            console.warn(`- 구군(${gugun}) 불일치 항목: ${nonMatchingItems.length}건`);
            console.warn('- 첫 번째 불일치 항목:', nonMatchingItems[0]);
          }
        }
        
        setData(responseData);
        setLoading(false);
      } catch (error) {
        console.error("데이터를 불러오는 중 오류 발생:", error);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [sido, gugun]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-600">데이터를 불러오는 중...</p>
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
            <h2 className="text-xl font-bold mb-2">오류 발생</h2>
            <p>{error}</p>
          </div>
          <button 
            onClick={handleBack}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  // 추가: 클라이언트측 필터링으로 보호 구현 (백엔드 필터링이 실패하는 경우에 대비)
  const filteredData = gugun 
    ? data.filter(item => item.구군 === gugun) 
    : data;
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center">
            <button 
              onClick={handleBack}
              className="mr-3 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">{sido} {gugun}</h1>
              <p className="text-sm opacity-80">상세 사업장 정보</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-4 px-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-bold mb-3">총 검색결과: {filteredData.length}개</h2>
          
          {filteredData.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>해당 지역에 데이터가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-b p-2 text-left">사업장명</th>
                    <th className="border-b p-2 text-left">2023</th>
                    <th className="border-b p-2 text-left">2024</th>
                    <th className="border-b p-2 text-left">시도</th>
                    <th className="border-b p-2 text-left">구군</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border-b p-2">{item.사업장명}</td>
                      <td className="border-b p-2">{item['2023']}</td>
                      <td className="border-b p-2">{item['2024']}</td>
                      <td className="border-b p-2">{item.시도}</td>
                      <td className="border-b p-2">{item.구군}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default RegionDetailPage; 