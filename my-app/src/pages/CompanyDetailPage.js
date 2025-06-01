import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CompanyDescriptionBlock from '../components/CompanyDescriptionBlock';
import { fetchCompanyAnalysis } from '../services/aiV3Service';
import CompanyAIInfo from '../components/CompanyAIInfo';
import CompanyInsightCard from '../components/CompanyInsightCard';
import TaxCreditAnalysisBlock from '../components/TaxCreditAnalysisBlock';

function CompanyDetailPage() {
  const { bizno } = useParams();
  const [companyInfo, setCompanyInfo] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 회사 기본 정보 로딩
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (!bizno || bizno === 'undefined' || bizno.trim() === '') return;

      try {
        const baseUrl = window.location.hostname.includes("localhost")
          ? "http://localhost:7071"
          : "https://taxcredit-api-func-v2.azurewebsites.net";
        
        const response = await fetch(`${baseUrl}/api/getSampleList?bizno=${encodeURIComponent(bizno)}`);
        if (!response.ok) throw new Error('회사 정보 로딩 실패');
        
        const data = await response.json();
        const companyData = Array.isArray(data) ? data[0] : (data.data?.[0] || null);
        
        console.log("✅ 회사 데이터 로드 성공:", companyData);
        setCompanyInfo(companyData);
      } catch (err) {
        console.error("❌ 회사 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, [bizno]);

  // AI 분석 데이터 로딩
  useEffect(() => {
    if (!bizno || bizno === 'undefined' || bizno.trim() === '') return;

    const loadAnalysisData = async () => {
      try {
        const response = await fetchCompanyAnalysis(bizno);
        console.log("📡 전체 응답:", response);
        
        if (!response) {
          console.warn("⚠️ AI 응답이 undefined입니다");
          return;
        }

        setAnalysisData(response);
      } catch (err) {
        console.error('❌ AI 분석 데이터 로딩 실패:', err);
      }
    };

    loadAnalysisData();
  }, [bizno]);

  // 사업자등록번호 표준 표기법 변환
  const formatBusinessNumber = (number) => {
    if (!number || number.length !== 10) return number;
    return `${number.slice(0, 3)}-${number.slice(3, 5)}-${number.slice(5)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">회사 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 영역 */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">{companyInfo?.사업장명 || '회사 정보'}</h1>
          <p className="text-sm opacity-80">사업자등록번호: {formatBusinessNumber(bizno)}</p>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 회사 기본 정보 */}
        {companyInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{companyInfo.사업장명}</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-600">사업자등록번호:</span>
                    <span className="ml-2 text-gray-800 font-mono">{formatBusinessNumber(companyInfo.사업자등록번호)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">업종:</span>
                    <span className="ml-2 text-gray-800">{companyInfo.업종명}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">소재지:</span>
                    <span className="ml-2 text-gray-800">{companyInfo.시도} {companyInfo.구군}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">주소:</span>
                    <span className="ml-2 text-gray-800">{companyInfo.사업장주소}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 기업 설명 블럭 */}
        <CompanyDescriptionBlock bizno={bizno} className="mb-6" />

        {/* AI 분석 정보 */}
        <div className="space-y-6">
          {analysisData ? (
            <>
              <CompanyAIInfo companyProfile={analysisData?.companyProfile} />
              <CompanyInsightCard companyInsight={analysisData?.companyInsight} />
              <TaxCreditAnalysisBlock taxCreditAnalysis={analysisData?.taxCreditAnalysis} />
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center text-gray-600">
                <p className="mb-2">🤖 AI 분석 정보를 불러오는 중입니다...</p>
                <p className="text-sm">잠시만 기다려주세요.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CompanyDetailPage; 