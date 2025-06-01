import React from 'react';

const CompanyInsightCard = ({ companyInsight }) => {
  if (!companyInsight) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-600">
          <p className="mb-2">📊 AI 인사이트 정보를 불러오는 중입니다...</p>
          <p className="text-sm">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  // AI 점수에 따른 색상 결정
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 리스크 레벨에 따른 색상 결정
  const getRiskColor = (riskLevel) => {
    if (riskLevel === '매우 낮음') return 'bg-green-100 text-green-800';
    if (riskLevel === '낮음') return 'bg-blue-100 text-blue-800';
    if (riskLevel === '중간') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">📊</span>
        AI 인사이트 분석
      </h3>

      <div className="space-y-4">
        
        {/* AI 스코어 */}
        {companyInsight.aiScore !== undefined && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <span className="mr-2">🎯</span>
              AI 종합 점수
            </h4>
            <div className="flex items-center justify-between">
              <div className={`text-4xl font-bold ${getScoreColor(companyInsight.aiScore)}`}>
                {companyInsight.aiScore}/100
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">평가 등급</div>
                <div className={`text-lg font-semibold ${getScoreColor(companyInsight.aiScore)}`}>
                  {companyInsight.aiScore >= 90 ? 'A+' : 
                   companyInsight.aiScore >= 80 ? 'A' : 
                   companyInsight.aiScore >= 70 ? 'B+' : 
                   companyInsight.aiScore >= 60 ? 'B' : 'C'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 성장 잠재력 */}
        {companyInsight.growthPotential && (
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
              <span className="mr-2">🚀</span>
              성장 잠재력
            </h4>
            <p className="text-lg font-medium text-gray-700">{companyInsight.growthPotential}</p>
          </div>
        )}

        {/* 리스크 레벨 */}
        {companyInsight.riskLevel && (
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <span className="mr-2">⚠️</span>
              리스크 평가
            </h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(companyInsight.riskLevel)}`}>
              {companyInsight.riskLevel}
            </span>
          </div>
        )}

        {/* 업계 포지션 */}
        {companyInsight.industryPosition && (
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
              <span className="mr-2">🏭</span>
              업계 포지션
            </h4>
            <p className="text-gray-700">{companyInsight.industryPosition}</p>
          </div>
        )}

        {/* 업력 정보 */}
        {companyInsight.businessAge && (
          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <h4 className="font-semibold text-indigo-800 mb-2 flex items-center">
              <span className="mr-2">📅</span>
              사업 경력
            </h4>
            <p className="text-gray-700">{companyInsight.businessAge}</p>
          </div>
        )}

        {/* 산업 유형 */}
        {companyInsight.industryType && (
          <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
            <h4 className="font-semibold text-teal-800 mb-2 flex items-center">
              <span className="mr-2">🔧</span>
              산업 분야
            </h4>
            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
              {companyInsight.industryType}
            </span>
          </div>
        )}

        {/* 기존 구조 지원 (하위 호환성) */}
        {!companyInsight.aiScore && !companyInsight.growthPotential && !companyInsight.riskLevel && (
          <div className="space-y-4">
            
            {/* 기존 지표 카드들 */}
            {companyInsight.indicators && companyInsight.indicators.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyInsight.indicators.map((indicator, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">{indicator.name}</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-2">{indicator.score}</div>
                    <div className="text-sm text-gray-700">{indicator.description}</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* 기존 강점/위험요소 */}
            {(companyInsight.strengths || companyInsight.risks) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 강점 */}
                {companyInsight.strengths && companyInsight.strengths.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <span className="mr-2">💪</span>
                      강점
                    </h4>
                    <ul className="space-y-2">
                      {companyInsight.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-700 flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* 위험요소 */}
                {companyInsight.risks && companyInsight.risks.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                      <span className="mr-2">⚠️</span>
                      위험요소
                    </h4>
                    <ul className="space-y-2">
                      {companyInsight.risks.map((risk, index) => (
                        <li key={index} className="text-gray-700 flex items-start">
                          <span className="text-red-600 mr-2">•</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 일반 키-값 표시 */}
            {!companyInsight.indicators && !companyInsight.strengths && !companyInsight.risks && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">💡 기본 인사이트 정보</h4>
                <div className="space-y-2">
                  {Object.entries(companyInsight).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-medium text-gray-600">{key}:</span>
                      <span className="text-gray-800">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInsightCard; 