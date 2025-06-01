import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompanyDataBars } from '../components/RegionDetailComponents';
import CompanyDescriptionBlock from '../components/CompanyDescriptionBlock';
import performanceTracker from '../utils/performance';
import { fetchCompanyAnalysis } from '../services/aiV3Service';
import CompanyAIInfo from '../components/CompanyAIInfo';
import CompanyInsightCard from '../components/CompanyInsightCard';
import TaxCreditAnalysisBlock from '../components/TaxCreditAnalysisBlock';

function CompanyDetailPage() {
  const { bizno } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);

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
        // AI 데이터 로딩 실패는 전체 페이지 에러로 처리하지 않음
      }
    };

    loadAnalysisData();
  }, [bizno]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 기존 헤더 유지 */}
      // ... existing code ...

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 회사 기본 정보 */}
        // ... existing code ...

        {/* 연도별 고용인원 추이 */}
        // ... existing code ...

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