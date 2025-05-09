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
        
        // 환경에 따른 API URL 구성
        let apiUrl;
        
        if (process.env.NODE_ENV === 'development') {
          // 개발 환경
          apiUrl = `${baseUrl}${apiPath}?sido=${encodeURIComponent(sido)}&gugun=${encodeURIComponent(gugun)}`;
        } else {
          // 프로덕션 환경 - 3가지 방법으로 시도
          
          // 방법 1: Azure Static Web App의 API 프록시 사용 (기본)
          apiUrl = `${apiPath}?sido=${encodeURIComponent(sido)}&gugun=${encodeURIComponent(gugun)}`;
          
          // 방법 2: 직접 Azure Function URL 사용 (API 프록시 실패 시)
          // apiUrl = `${baseUrl}${apiPath}?sido=${encodeURIComponent(sido)}&gugun=${encodeURIComponent(gugun)}`;
          
          // 방법 3: CORS 프록시 사용 (직접 호출도 실패할 경우)
          // const functionUrl = `${baseUrl}${apiPath}?sido=${encodeURIComponent(sido)}&gugun=${encodeURIComponent(gugun)}`;
          // apiUrl = `https://corsproxy.io/?${encodeURIComponent(functionUrl)}`;
        }
        
        console.log('API URL:', apiUrl);

        // 환경에 따른, CORS 모드 분기 처리
        const fetchOptions =
          process.env.NODE_ENV === 'development'
            ? {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                mode: 'cors',
              }
            : {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
              };
        
        // 응답 시도
        let response;
        let responseData;
        
        try {
          // 첫 번째 방법 시도: 기본 URL로 호출
          response = await fetch(apiUrl, fetchOptions);
          
          if (!response.ok) {
            console.error(`기본 API 호출 실패 (${response.status}), 대체 방법 시도 중...`);
            
            // 방법 2: 직접 Azure Function URL 사용
            const directUrl = `${baseUrl}${apiPath}?sido=${encodeURIComponent(sido)}&gugun=${encodeURIComponent(gugun)}`;
            console.log('직접 호출 URL 시도:', directUrl);
            
            const directResponse = await fetch(directUrl, {
              ...fetchOptions,
              mode: 'cors', // 직접 호출 시 CORS 모드 필요
            });
            
            if (directResponse.ok) {
              response = directResponse;
            } else {
              throw new Error(`직접 호출도 실패: ${directResponse.status}`);
            }
          }
          
          // 성공한 응답에서 데이터 추출
          responseData = await response.json();
          
        } catch (fetchError) {
          console.error('모든 API 호출 방법 실패:', fetchError);
          throw fetchError;
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
          <h2 className="text-lg font-bold mb-3">총 검색결과: {data.length}개</h2>
          
          {data.length === 0 ? (
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
                  {data.map((item, index) => (
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