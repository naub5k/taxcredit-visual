import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_CONFIG, buildApiUrl } from '../config/apiConfig';
import CompanyInfo from '../components/shared/CompanyInfo';
import GrowthChart from '../components/shared/GrowthChart';

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
    // 회원 전용 기능 알림 표시
    const confirmResult = window.confirm(
      '회원 전용 기능입니다.\n\n세액공제 분석 도구로 이동하시겠습니까?'
    );
    
    if (confirmResult) {
      // analyze 앱으로 리다이렉트 (경로 파라미터 + 자동 분석 실행 및 확장 파라미터 포함)
      const analyzeUrl = `https://delightful-tree-001bf4c00.6.azurestaticapps.net/dashboard/${bizno}?autoAnalyze=true&expandAll=true`;
      window.open(analyzeUrl, '_blank');
    }
  };

  // 지역 정보 표시 함수 (공통 컴포넌트용)
  const getRegionDisplay = (companyData) => {
    if (!companyData) return { regionType: '', sido: '', gugun: '' };
    
    // 수도권 여부 판단 (서울, 경기, 인천)
    const sido = companyData.시도 || '';
    const isCapitalRegion = ['서울특별시', '경기도', '인천광역시'].some(region => sido.includes(region));
    const regionType = isCapitalRegion ? '수도권' : '수도권외';
    
    return {
      regionType,
      sido: companyData.시도 || '',
      gugun: companyData.구군 || ''
    };
  };

  // 차트 데이터 생성 함수 (TaxCreditDashboard 스타일)
  const generateChartData = () => {
    if (!companyData) return [];

    const chartYears = [];
    const years = ['2020', '2021', '2022', '2023', '2024', '2025']; // 2020년부터 시작
    
    for (let i = 0; i < years.length; i++) {
      const year = years[i];
      const employees = companyData[year] || companyData[`[${year}]`] || 0;
      const prevEmployees = i === 0 ? employees : (companyData[years[i-1]] || companyData[`[${years[i-1]}]`] || 0);
      const change = i === 0 ? 0 : employees - prevEmployees;
      
      chartYears.push({
        year: year,
        employees: employees,
        change: change
      });
    }
    
    return chartYears;
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

  const chartData = generateChartData();
  const regionInfo = getRegionDisplay(companyData);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
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

      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6">
        {companyData && (
          <>
            {/* 회사 정보 - 공통 컴포넌트 사용 */}
            <CompanyInfo 
              companyInfo={{
                bizno: companyData.사업자등록번호,
                companyName: companyData.사업장명,
                region: regionInfo.regionType,
                industry: companyData.업종명 || '정보 없음',
                sido: regionInfo.sido,
                gugun: regionInfo.gugun
              }}
              accessLevel="partner" // visual에서는 기본적으로 partner 레벨
              showFullDetails={true}
            />

            {/* 인원증감 현황 - 공통 컴포넌트 사용 */}
            <GrowthChart 
              chartData={chartData}
              accessLevel="partner" // visual에서는 기본적으로 partner 레벨
              showChart={true}
            />

            {/* 세액공제 분석 시작 버튼 - 개선된 연결 기능 */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">세액공제 분석 서비스</h3>
              <p className="text-sm text-purple-600 mb-4">
                파트너 전용 세액공제 분석을 위해 전문 분석 도구로 이동합니다.
              </p>
              <button 
                onClick={handleAnalyzeRedirect}
                className="bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors flex items-center justify-center mx-auto font-semibold"
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
          </>
        )}
      </main>

      {/* 푸터 - 강화된 버전 */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white py-6 mt-8 border-t-4 border-blue-500">
        <div className="container mx-auto text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <h3 className="text-lg font-bold text-white">Visual 프로젝트</h3>
          </div>
          <p className="text-sm text-gray-300">© 2025 세액공제 분석 시스템 | 고용증대 및 사회보험료 세액공제</p>
          
          {/* 중요 공지사항 - 강조된 박스 */}
          <div className="bg-blue-600 bg-opacity-90 border-2 border-blue-400 rounded-lg p-4 mx-auto max-w-2xl">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="text-2xl">💡</div>
              <h4 className="text-sm font-bold text-white">Visual 프로젝트 안내</h4>
              <div className="text-2xl">💡</div>
            </div>
            <p className="text-white text-sm">
              이곳에서 기업 정보를 확인하고 <strong className="text-yellow-300">세액공제 분석</strong>으로 이동하세요!
            </p>
            <div className="mt-2 pt-2 border-t border-blue-400">
              <p className="text-xs text-blue-100">
                🚀 <strong>2025-06-29 Visual 최신 배포</strong> | 💎 <strong>Partner 기능 제공중</strong>
              </p>
            </div>
          </div>
          
          <p className="text-xs opacity-60 mt-1">🔴 LIVE · 2025-06-29 Visual 프로젝트</p>
        </div>
      </footer>
    </div>
  );
}

export default CompanyDetailPage; 