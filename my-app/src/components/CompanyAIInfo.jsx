import React from 'react';

const CompanyAIInfo = ({ companyProfile }) => {
  if (!companyProfile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-600">
          <p className="mb-2">🏢 회사 기본 정보를 불러오는 중입니다...</p>
          <p className="text-sm">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">🏢</span>
        AI 분석 - 회사 프로필
      </h3>
      
      <div className="space-y-4">
        {/* 회사 기본 정보 (V2 API 구조) */}
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h4 className="font-semibold text-blue-800 mb-3">📋 기본 정보</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {companyProfile.name && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">회사명:</span>
                <span className="text-gray-800">{companyProfile.name}</span>
              </div>
            )}
            {companyProfile.industry && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">업종:</span>
                <span className="text-gray-800">{companyProfile.industry}</span>
              </div>
            )}
            {companyProfile.location && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">소재지:</span>
                <span className="text-gray-800">{companyProfile.location}</span>
              </div>
            )}
            {companyProfile.establishedYear && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">설립년도:</span>
                <span className="text-gray-800">{companyProfile.establishedYear}년</span>
              </div>
            )}
          </div>
          {companyProfile.address && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="font-medium text-gray-600">주소:</span>
              <span className="ml-2 text-gray-800">{companyProfile.address}</span>
            </div>
          )}
        </div>

        {/* 업종 분류 정보 */}
        {companyProfile.category && (
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800 mb-2">🏭 업종 분류</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {companyProfile.category.main && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">대분류:</span>
                  <span className="text-gray-800">{companyProfile.category.main}</span>
                </div>
              )}
              {companyProfile.category.sub && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">중분류:</span>
                  <span className="text-gray-800">{companyProfile.category.sub}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 기업 현황 정보 */}
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
          <h4 className="font-semibold text-purple-800 mb-3">📊 기업 현황</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {companyProfile.establishedDate && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">설립일:</span>
                <span className="text-gray-800">{new Date(companyProfile.establishedDate).toLocaleDateString('ko-KR')}</span>
              </div>
            )}
            {companyProfile.industryCode && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">업종코드:</span>
                <span className="text-gray-800 font-mono">{companyProfile.industryCode}</span>
              </div>
            )}
            {companyProfile.classification && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">분류:</span>
                <span className="text-gray-800">{companyProfile.classification}</span>
              </div>
            )}
            {companyProfile.exclusionStatus && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">제외여부:</span>
                <span className={`px-2 py-1 rounded text-sm ${companyProfile.exclusionStatus === 'Y' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {companyProfile.exclusionStatus === 'Y' ? '제외 대상' : '정상'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 기존 구조 지원 (하위 호환성) */}
        {!companyProfile.name && !companyProfile.industry && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-3">💡 기본 정보 형식으로 표시</p>
            {Object.entries(companyProfile).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">{key}:</span>
                <span className="text-gray-800">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyAIInfo; 