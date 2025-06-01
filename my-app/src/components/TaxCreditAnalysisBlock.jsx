import React from 'react';

const TaxCreditAnalysisBlock = ({ taxCreditAnalysis }) => {
  if (!taxCreditAnalysis) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-600">
          <p className="mb-2">💰 세액공제 분석 정보를 불러오는 중입니다...</p>
          <p className="text-sm">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  // 금액 포맷팅 함수
  const formatAmount = (amount) => {
    if (!amount) return '0';
    return amount.toLocaleString('ko-KR');
  };

  // 우선순위에 따른 색상 결정
  const getPriorityColor = (priority) => {
    if (priority?.includes('A급')) return 'bg-green-100 text-green-800 border-green-500';
    if (priority?.includes('B급')) return 'bg-blue-100 text-blue-800 border-blue-500';
    if (priority?.includes('C급')) return 'bg-yellow-100 text-yellow-800 border-yellow-500';
    return 'bg-gray-100 text-gray-800 border-gray-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">💰</span>
        AI 세액공제 분석
      </h3>

      <div className="space-y-6">
        
        {/* 자격 여부 */}
        {taxCreditAnalysis.eligibility !== undefined && (
          <div className={`p-4 rounded-lg border-l-4 ${taxCreditAnalysis.eligibility ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
            <h4 className={`font-semibold mb-2 flex items-center ${taxCreditAnalysis.eligibility ? 'text-green-800' : 'text-red-800'}`}>
              <span className="mr-2">{taxCreditAnalysis.eligibility ? '✅' : '❌'}</span>
              세액공제 자격
            </h4>
            <p className={`text-lg font-medium ${taxCreditAnalysis.eligibility ? 'text-green-700' : 'text-red-700'}`}>
              {taxCreditAnalysis.eligibility ? '세액공제 신청 자격이 있습니다' : '현재 세액공제 신청 자격이 없습니다'}
            </p>
          </div>
        )}

        {/* 예상 세액공제 */}
        {taxCreditAnalysis.estimatedCredit && (
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <span className="mr-2">💎</span>
              예상 세액공제 금액
            </h4>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-blue-600">
                {formatAmount(taxCreditAnalysis.estimatedCredit)}원
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">연간 예상</div>
                <div className="text-sm text-blue-600 font-medium">AI 기반 예측</div>
              </div>
            </div>
          </div>
        )}

        {/* 우선순위 */}
        {taxCreditAnalysis.priority && (
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
              <span className="mr-2">⭐</span>
              영업 우선순위
            </h4>
            <span className={`px-4 py-2 rounded-lg border font-medium ${getPriorityColor(taxCreditAnalysis.priority)}`}>
              {taxCreditAnalysis.priority}
            </span>
          </div>
        )}

        {/* AI 추천사항 */}
        {taxCreditAnalysis.recommendations && Array.isArray(taxCreditAnalysis.recommendations) && taxCreditAnalysis.recommendations.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              AI 추천사항
            </h4>
            <div className="space-y-3">
              {taxCreditAnalysis.recommendations.map((recommendation, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-yellow-200 flex items-start">
                  <span className="text-yellow-600 mr-3 mt-1">•</span>
                  <span className="text-gray-700 flex-1">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 세액공제 상세 정보 */}
        {taxCreditAnalysis.eligibility && taxCreditAnalysis.estimatedCredit && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">📊</span>
              세액공제 상세 분석
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 고용증대세액공제 */}
              <div className="bg-white p-3 rounded border-l-4 border-indigo-500">
                <div className="font-medium text-indigo-800 mb-1">고용증대세액공제</div>
                <div className="text-sm text-gray-600">신규 채용 시 인당 세액공제</div>
                <div className="text-lg font-semibold text-indigo-600 mt-1">
                  최대 {Math.floor(taxCreditAnalysis.estimatedCredit * 0.6).toLocaleString()}원
                </div>
              </div>

              {/* 사회보험료세액공제 */}
              <div className="bg-white p-3 rounded border-l-4 border-teal-500">
                <div className="font-medium text-teal-800 mb-1">사회보험료세액공제</div>
                <div className="text-sm text-gray-600">4대보험 신규가입자 기준</div>
                <div className="text-lg font-semibold text-teal-600 mt-1">
                  최대 {Math.floor(taxCreditAnalysis.estimatedCredit * 0.4).toLocaleString()}원
                </div>
              </div>

              {/* 신청 조건 */}
              <div className="bg-white p-3 rounded border-l-4 border-green-500 md:col-span-2">
                <div className="font-medium text-green-800 mb-1">신청 조건</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 상시근로자 증가 시 신청 가능</li>
                  <li>• 정규직 채용 우대</li>
                  <li>• 세무서 신고 시 동시 신청</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 기존 구조 지원 (하위 호환성) */}
        {!taxCreditAnalysis.eligibility && !taxCreditAnalysis.estimatedCredit && !taxCreditAnalysis.priority && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">💡 기본 분석 형식</h4>
            
            {/* 기존 테이블 구조 지원 */}
            {taxCreditAnalysis.items && (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">항목</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">금액</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">상태</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">설명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxCreditAnalysis.items.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-2 text-gray-700">{item.name}</td>
                        <td className="px-4 py-2 text-gray-700">{item.amount?.toLocaleString()}원</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            item.status?.toLowerCase() === 'eligible' ? 'bg-green-100 text-green-800' :
                            item.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-700">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 기존 요약 지원 */}
            {taxCreditAnalysis.summary && (
              <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <h5 className="font-medium text-blue-800 mb-2">분석 요약</h5>
                <p className="text-gray-700">{taxCreditAnalysis.summary}</p>
              </div>
            )}

            {/* 일반 키-값 표시 */}
            {!taxCreditAnalysis.items && !taxCreditAnalysis.summary && (
              <div className="space-y-2">
                {Object.entries(taxCreditAnalysis).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-600">{key}:</span>
                    <span className="text-gray-800">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxCreditAnalysisBlock; 