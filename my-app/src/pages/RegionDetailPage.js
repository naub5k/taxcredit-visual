import React, { useEffect, useState } from 'react';
import { fetchCompanyAnalysis } from '../services/aiV3Service';
import CompanyAIInfo from '../components/CompanyAIInfo';
import CompanyInsightCard from '../components/CompanyInsightCard';
import TaxCreditAnalysisBlock from '../components/TaxCreditAnalysisBlock';

const RegionDetailPage = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadAnalysisData = async () => {
      if (!companyInfo?.bizno) return;
      
      setLoading(true);
      try {
        const data = await fetchCompanyAnalysis(companyInfo.bizno);
        setAnalysisData(data);
      } catch (err) {
        console.error('AI 분석 데이터 로딩 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysisData();
  }, [companyInfo?.bizno]);

  return (
    <div className="region-detail-page">
      <div className="analysis-section">
        <CompanyAIInfo companyProfile={analysisData?.companyProfile} />
        <CompanyInsightCard companyInsight={analysisData?.companyInsight} />
        <TaxCreditAnalysisBlock taxCreditAnalysis={analysisData?.taxCreditAnalysis} />
      </div>
    </div>
  );
};

export default RegionDetailPage; 