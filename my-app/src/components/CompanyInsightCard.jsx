import React from 'react';

const CompanyInsightCard = ({ companyInsight }) => {
  if (!companyInsight) {
    return <div>회사 인사이트 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="insight-container">
      <h3>회사 인사이트</h3>
      <div className="insight-cards">
        {companyInsight.indicators?.map((indicator, index) => (
          <div key={index} className="insight-card">
            <h4>{indicator.name}</h4>
            <div className="score">{indicator.score}</div>
            <div className="description">{indicator.description}</div>
          </div>
        ))}
      </div>
      
      <div className="strengths-risks">
        <div className="strengths">
          <h4>강점</h4>
          <ul>
            {companyInsight.strengths?.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
        <div className="risks">
          <h4>위험요소</h4>
          <ul>
            {companyInsight.risks?.map((risk, index) => (
              <li key={index}>{risk}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompanyInsightCard; 