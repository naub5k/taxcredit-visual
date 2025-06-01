import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CompanyDescriptionBlock from '../components/CompanyDescriptionBlock';
import { fetchCompanyAnalysis } from '../services/aiV3Service';
import CompanyAIInfo from '../components/CompanyAIInfo';
import CompanyInsightCard from '../components/CompanyInsightCard';
import TaxCreditAnalysisBlock from '../components/TaxCreditAnalysisBlock';

function CompanyDetailPage() {
  const { bizno } = useParams();
  const [analysisData, setAnalysisData] = useState(null);

  // AI 분석 데이터 로딩
  useEffect(() => {
    if (!bizno || bizno === 'undefined' || bizno.trim() === '') return;

    const loadAnalysisData = async () => {
      try {
        const data = await fetchCompanyAnalysis(bizno);
        console.log("📡 AI 응답:", data);
        setAnalysisData(data);
      } catch (err) {
        console.error('AI 분석 데이터 로딩 실패:', err);
      }
    };

    loadAnalysisData();
  }, [bizno]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 영역 */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">회사 상세 정보</h1>
          <p className="text-sm opacity-80">사업자등록번호: {bizno}</p>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 기업 설명 블럭 */}
        <CompanyDescriptionBlock bizno={bizno} className="mb-6" />

        {/* AI 분석 정보 */}
        <div className="space-y-6">
          {analysisData && (
            <>
              <CompanyAIInfo companyProfile={analysisData?.companyProfile} />
              <CompanyInsightCard companyInsight={analysisData?.companyInsight} />
              <TaxCreditAnalysisBlock taxCreditAnalysis={analysisData?.taxCreditAnalysis} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default CompanyDetailPage; 