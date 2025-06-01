import React from 'react';

const TaxCreditAnalysisBlock = ({ taxCreditAnalysis }) => {
  if (!taxCreditAnalysis) {
    return <div>세액공제 분석 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="tax-credit-container">
      <h3>세액공제 분석</h3>
      <div className="analysis-table">
        <table>
          <thead>
            <tr>
              <th>항목</th>
              <th>금액</th>
              <th>상태</th>
              <th>설명</th>
            </tr>
          </thead>
          <tbody>
            {taxCreditAnalysis.items?.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.amount?.toLocaleString()}원</td>
                <td>
                  <span className={`status ${item.status?.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {taxCreditAnalysis.summary && (
        <div className="analysis-summary">
          <h4>분석 요약</h4>
          <p>{taxCreditAnalysis.summary}</p>
        </div>
      )}
    </div>
  );
};

export default TaxCreditAnalysisBlock; 