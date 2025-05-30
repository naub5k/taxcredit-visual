import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompanyDataBars } from './RegionDetailComponents';
import CompanyDescriptionBlock from './CompanyDescriptionBlock';
import performanceTracker from '../utils/performance';

function CompanyDetailPage() {
  const { bizno } = useParams(); // 사업자등록번호
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const [error, setError] = useState(null);

  // 사업자등록번호 표준 표기법 변환 함수
  const formatBusinessNumber = (bizno) => {
    if (!bizno || bizno.length !== 10) return bizno;
    return `${bizno.slice(0, 3)}-${bizno.slice(3, 5)}-${bizno.slice(5)}`;
  };

  // API 호출 함수
  const fetchCompanyDetail = async (businessNumber) => {
    try {
      // 사업자등록번호 유효성 검사
      if (!businessNumber || businessNumber === 'undefined' || businessNumber.trim() === '') {
        throw new Error('유효하지 않은 사업자등록번호입니다.');
      }
      
      // API URL 결정 로직
      const baseUrl = window.location.hostname.includes("localhost")
        ? "http://localhost:7071"
        : "https://taxcredit-api-func-v2.azurewebsites.net";
      
      const apiUrl = `${baseUrl}/api/getSampleList?bizno=${encodeURIComponent(businessNumber)}`;
      
      console.log(`🔍 회사 상세 정보 조회: ${businessNumber}`);
      
      return await performanceTracker.measureAPI(
        `getCompanyDetail-${businessNumber}`,
        async () => {
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
          
          const data = await response.json();
          
          // API 응답이 배열일 경우 첫 번째 항목 반환
          if (Array.isArray(data) && data.length > 0) {
            return data[0];
          } else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            return data.data[0];
          } else {
            throw new Error('회사 정보를 찾을 수 없습니다.');
          }
        }
      );
    } catch (error) {
      console.error("회사 상세 정보 로딩 오류:", error);
      throw error;
    }
  };

  // 데이터 로딩
  useEffect(() => {
    // 사업자등록번호 유효성 검사
    if (!bizno || bizno === 'undefined' || bizno.trim() === '') {
      setError("유효하지 않은 사업자등록번호입니다.");
      setLoading(false);
      return;
    }
    
    console.log(`📋 CompanyDetailPage 로딩 시작: bizno=${bizno}`);
    
    setLoading(true);
    fetchCompanyDetail(bizno)
      .then(data => {
        console.log('✅ 회사 데이터 로드 성공:', data);
        setCompanyData(data);
        setError(null);
      })
      .catch(err => {
        console.error('❌ 회사 데이터 로드 실패:', err);
        setError(err.message);
        setCompanyData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bizno]);

  const handleBack = () => {
    navigate(-1);
  };

  // 연도별 고용인원 데이터 계산
  const getEmploymentData = () => {
    if (!companyData) return [];
    
    const years = ['2020', '2021', '2022', '2023', '2024'];
    return years.map(year => ({
      year,
      count: companyData[year] || 0
    }));
  };

  // 최대 고용인원 계산
  const getMaxEmployeeCount = () => {
    if (!companyData) return 0;
    
    const years = ['2020', '2021', '2022', '2023', '2024'];
    return Math.max(...years.map(year => companyData[year] || 0));
  };

  // 평균 고용인원 계산
  const getAverageEmployeeCount = () => {
    if (!companyData) return 0;
    
    const years = ['2020', '2021', '2022', '2023', '2024'];
    const total = years.reduce((sum, year) => sum + (companyData[year] || 0), 0);
    return Math.round(total / years.length);
  };

  // 고용 트렌드 분석
  const getEmploymentTrend = () => {
    if (!companyData) return { trend: 'stable', description: '데이터 없음' };
    
    const recent = companyData['2024'] || 0;
    const previous = companyData['2023'] || 0;
    
    if (recent > previous) {
      return { trend: 'increasing', description: '증가 추세' };
    } else if (recent < previous) {
      return { trend: 'decreasing', description: '감소 추세' };
    } else {
      return { trend: 'stable', description: '안정적' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">회사 정보를 불러오는 중...</p>
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

  if (!companyData) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-bold mb-2">회사 정보를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">사업자등록번호: <span className="font-mono">{formatBusinessNumber(bizno)}</span></p>
          <button 
            onClick={handleBack}
            className="bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const employmentData = getEmploymentData();
  const maxEmployeeCount = getMaxEmployeeCount();
  const averageEmployeeCount = getAverageEmployeeCount();
  const trend = getEmploymentTrend();

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
              <h1 className="text-xl font-bold">{companyData.사업장명}</h1>
              <p className="text-sm opacity-80">회사 상세 정보</p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 회사 기본 정보 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{companyData.사업장명}</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">사업자등록번호:</span>
                  <span className="ml-2 text-gray-800 font-mono">{formatBusinessNumber(companyData.사업자등록번호)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">업종:</span>
                  <span className="ml-2 text-gray-800">{companyData.업종명}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">소재지:</span>
                  <span className="ml-2 text-gray-800">{companyData.시도} {companyData.구군}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">주소:</span>
                  <span className="ml-2 text-gray-800">{companyData.사업장주소}</span>
                </div>
              </div>
            </div>
            
            {/* 고용 현황 요약 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">고용 현황 요약</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600">최근 고용인원</h4>
                  <p className="text-2xl font-bold text-blue-600">{companyData['2024'] || 0}명</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600">최대 고용인원</h4>
                  <p className="text-2xl font-bold text-green-600">{maxEmployeeCount}명</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600">평균 고용인원</h4>
                  <p className="text-2xl font-bold text-purple-600">{averageEmployeeCount}명</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600">고용 트렌드</h4>
                  <p className={`text-lg font-bold ${
                    trend.trend === 'increasing' ? 'text-green-600' : 
                    trend.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trend.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 연도별 고용인원 추이 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">연도별 고용인원 추이</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <CompanyDataBars item={companyData} maxEmployeeCount={maxEmployeeCount} />
          </div>
          
          {/* 연도별 상세 데이터 */}
          <div className="mt-6 grid grid-cols-5 gap-4">
            {employmentData.map(({ year, count }) => (
              <div key={year} className="text-center">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600">{year}년</h4>
                  <p className="text-xl font-bold text-gray-800">{count}명</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 기업 설명 블럭 */}
        <CompanyDescriptionBlock bizno={bizno} className="mb-6" />

        {/* 추가 정보 (향후 AI 분석 결과가 들어갈 영역) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">분석 정보</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-center">
              🤖 AI 기반 회사 분석 정보는 향후 업데이트 예정입니다.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <p>• 업계 내 위치 분석</p>
              <p>• 고용 안정성 평가</p>
              <p>• 성장 가능성 예측</p>
              <p>• 유사 업체 비교</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CompanyDetailPage; 