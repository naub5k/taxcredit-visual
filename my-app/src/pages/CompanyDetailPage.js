import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_CONFIG, buildApiUrl } from '../config/apiConfig';

function CompanyDetailPage() {
  const { bizno } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    if (!bizno) {
      setError('사업자등록번호가 없습니다.');
      setLoading(false);
      return;
    }

    fetchCompanyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bizno]);

  const fetchCompanyData = async () => {
    try {
      console.log('🔍 CompanyDetailPage - 기업 데이터 조회 시작:', bizno);
      
      // API 호출 - analyze 엔드포인트 사용
      const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.ANALYZE, { bizno });
      console.log('🔍 API 호출 URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ API 응답 받음:', result);

      if (result.success && result.data) {
        setCompanyData(result.data);
      } else {
        throw new Error(result.error || '기업 데이터를 찾을 수 없습니다.');
      }

    } catch (err) {
      console.error('❌ 기업 데이터 조회 오류:', err);
      setError(err.message || '기업 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  const handleAnalyzeRedirect = () => {
    // analyze 앱으로 리다이렉트
    const analyzeUrl = `https://delightful-tree-001bf4c00.6.azurestaticapps.net/company/${bizno}`;
    window.open(analyzeUrl, '_blank');
  };

  const formatBusinessNumber = (bizno) => {
    if (!bizno || bizno.length !== 10) return bizno;
    return `${bizno.slice(0, 3)}-${bizno.slice(3, 5)}-${bizno.slice(5)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">기업 정보를 불러오는 중...</p>
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
          <div className="flex gap-2">
            <button 
              onClick={handleBack}
              className="flex-1 bg-gray-600 text-white py-2.5 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors"
            >
              돌아가기
            </button>
            <button 
              onClick={() => fetchCompanyData()}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              다시 시도
            </button>
          </div>
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
              <h1 className="text-xl font-bold">기업 상세 정보</h1>
              <p className="text-sm opacity-80">{companyData?.사업장명 || '상세 정보'}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {companyData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* 기업 기본 정보 */}
            <div className="border-b pb-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{companyData.사업장명}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">사업자등록번호</h3>
                  <p className="text-lg font-bold text-blue-700 font-mono">
                    {formatBusinessNumber(companyData.사업자등록번호)}
                  </p>
                </div>
                
                {companyData.업종명 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">업종</h3>
                    <p className="text-lg font-bold text-green-700">{companyData.업종명}</p>
                  </div>
                )}
                
                {companyData.시도 && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">지역</h3>
                    <p className="text-lg font-bold text-purple-700">
                      {companyData.시도} {companyData.구군}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 연도별 고용인원 정보 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">연도별 고용인원</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map(year => (
                  <div key={year} className="bg-gray-50 p-3 rounded text-center">
                    <div className="text-sm font-medium text-gray-600">{year}</div>
                    <div className="text-lg font-bold text-gray-800">
                      {companyData[year.toString()] || companyData[`[${year}]`] || 0}명
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 파트너 전용 분석 버튼 */}
            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">세액공제 분석 서비스</h3>
              <p className="text-sm text-purple-600 mb-4">
                파트너 전용 세액공제 분석을 위해 전문 분석 도구로 이동합니다.
              </p>
              <button 
                onClick={handleAnalyzeRedirect}
                className="bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors flex items-center justify-center mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                세액공제 분석 시작
              </button>
            </div>

            {/* 디버그 정보 (개발용) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">디버그 정보</h4>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(companyData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default CompanyDetailPage; 