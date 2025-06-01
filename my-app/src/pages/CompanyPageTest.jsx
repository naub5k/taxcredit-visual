import React, { useState, useEffect } from 'react';
import { fetchCompanyAnalysis } from '../services/aiV3Service';
import CompanyAIInfo from '../components/CompanyAIInfo';
import CompanyInsightCard from '../components/CompanyInsightCard';
import TaxCreditAnalysisBlock from '../components/TaxCreditAnalysisBlock';

const CompanyPageTest = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 테스트용 사업자번호
  const testBizNo = '1234567890';

  useEffect(() => {
    const loadAnalysisData = async () => {
      setLoading(true);
      try {
        const data = await fetchCompanyAnalysis(testBizNo);
        setAnalysisData(data);
      } catch (err) {
        setError('데이터 로딩 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysisData();
  }, []);

  if (loading) {
    return <div>데이터를 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="company-page-test">
      <h2>회사 분석 테스트 페이지</h2>
      <div className="analysis-content">
        <CompanyAIInfo companyProfile={analysisData?.companyProfile} />
        <CompanyInsightCard companyInsight={analysisData?.companyInsight} />
        <TaxCreditAnalysisBlock taxCreditAnalysis={analysisData?.taxCreditAnalysis} />
      </div>
    </div>
  );
};

export default CompanyPageTest; 