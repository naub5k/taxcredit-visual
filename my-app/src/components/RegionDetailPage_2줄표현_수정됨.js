import React, { useState, useEffect, useMemo } from 'react';
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
        
        // API URL 결정 로직 - 환경에 따른 분기 처리
        const baseUrl = window.location.hostname.includes("localhost")
          ? "http://localhost:7071"
          : "https://taxcredit-api-func-v2.azurewebsites.net";
        
        console.log('API 기본 URL:', baseUrl);
        
        // 전체 URL 구성
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
        setLoading(false);
      } catch (error) {
        console.error("API 호출 오류:", error);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`);
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
  
  // 시각화 렌더링 컴포넌트
  const renderVisualCell = (value) => {
    // 숫자가 아니거나 0인 경우 기본 텍스트만 표시
    const numValue = Number(value) || 0;
    if (numValue === 0) return '0';
    
    // 최대값 대비 비율 계산 (0~100%)
    const percentage = Math.min(100, Math.max(0, (numValue / maxEmployeeCount) * 100));
    
    return (
      <div style={{ position: "relative", height: "24px", width: "100%" }}>
        <div style={{
          width: `${percentage}%`,
          height: "100%",
          backgroundColor: "#e0e0e0",
          position: "absolute",
          top: 0, left: 0, zIndex: 0,
          borderRadius: "2px"
        }} />
        <div style={{ position: "relative", zIndex: 1, padding: "2px 4px" }}>{numValue}</div>
      </div>
    );
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
          <h2 className="text-lg font-bold mb-3">총 검색결과: {filteredData.length}개</h2>
          
          {filteredData.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>해당 지역에 데이터가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="overflow-x-auto">
  <table className="min-w-full border-collapse">
    <thead>
      <tr className="bg-gray-100">
        <th className="border-b p-2 text-left">사업장명</th>
        <th className="border-b p-2 text-left" colSpan={5}>연도별 인원 수</th>
      </tr>
      <tr className="bg-gray-50 text-sm text-gray-600">
        <th></th>
        <th className="border-b p-2 text-left">2020</th>
        <th className="border-b p-2 text-left">2021</th>
        <th className="border-b p-2 text-left">2022</th>
        <th className="border-b p-2 text-left">2023</th>
        <th className="border-b p-2 text-left">2024</th>
      </tr>
    </thead>
    <tbody>
      {filteredData.map((item, index) => (
        <React.Fragment key={index}>
          <tr className="bg-white">
            <td className="border-b p-2 font-medium" colSpan={6}>{item.사업장명}</td>
          </tr>
          <tr className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
            <td className="border-b p-2"></td>
            <td className="border-b p-2">{renderVisualCell(item['2020'])}</td>
            <td className="border-b p-2">{renderVisualCell(item['2021'])}</td>
            <td className="border-b p-2">{renderVisualCell(item['2022'])}</td>
            <td className="border-b p-2">{renderVisualCell(item['2023'])}</td>
            <td className="border-b p-2">{renderVisualCell(item['2024'])}</td>
          </tr>
        </React.Fragment>
      ))}
    </tbody>
  </table>
</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default RegionDetailPage; 