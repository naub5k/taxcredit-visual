import React from 'react';

const CompanyAIInfo = ({ companyProfile }) => {
  if (!companyProfile) {
    return <div>회사 프로필 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="company-profile-container">
      <h3>회사 프로필</h3>
      <div className="profile-content">
        {Object.entries(companyProfile).map(([key, value]) => (
          <div key={key} className="profile-item">
            <span className="label">{key}:</span>
            <span className="value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyAIInfo; 