import React from 'react';

// 회사 설명 데이터 (임시 mock 데이터)
const companyDescriptions = {
  '2528600056': `주식회사 한헬스케어는 서울특별시 금천구에 위치한 의료기기 제조업체입니다.

아기들의 두상 교정을 위한 헬멧인 '하니 헬멧'을 제조하고 판매하고 있습니다.

**회사 정보**
• 대표자: 최병오
• 전화번호: 02-2027-5555
• 설립년도: 2015년
• 직원 수: 약 19명
• 기업 유형: 벤처기업

**위치 및 접근성**
가산디지털단지역 4번 출구에서 도보로 약 5분 거리에 위치해 있어 접근이 용이합니다. 주변에는 올리브영 건물이 있어 방향을 잡기 쉽습니다.

**서비스 및 제품**
3개월에서 18개월 사이의 아기에게 적합한 비대칭 두상 문제 해결용 헬멧을 제공합니다. 헬멧 착용 기간은 약 3~4개월로, 아기의 두상 형태를 정상에 가깝게 회복하는 데 도움을 줍니다.

**세액공제 관련 정보**
2016년부터 2025년까지 지속적인 고용 증가를 보이고 있으며, 고용증대 세액공제 대상으로 상당한 절세 효과를 기대할 수 있습니다. 특히 2019년 귀속분의 경정청구 기한이 2025년 5월 31일까지이므로 신속한 검토가 필요합니다.`,

  '1148638828': `(노무법인)춘추는 서울특별시 강남구에 위치한 법무관련 서비스업체입니다.

전문적인 노무 상담 및 법률 서비스를 제공하는 노무법인으로, 기업의 인사노무 관리를 전문적으로 지원하고 있습니다.

**전문 분야**
• 노무 상담 및 컨설팅
• 인사관리 시스템 구축
• 노동법 관련 법률 서비스
• 급여 및 4대보험 업무

**특징**
소규모 전문 법인으로 맞춤형 서비스를 제공하며, 고객사의 규모와 업종에 따른 차별화된 노무 솔루션을 제공합니다.`,

  '2148845259': `(노무법인)파란은 서울특별시 강남구에 위치한 법무관련 서비스업체입니다.

기업의 노무관리 전반에 대한 전문적인 서비스를 제공하는 노무법인입니다.

**주요 서비스**
• 노동법 컨설팅
• 인사제도 설계
• 노무관리 아웃소싱
• 법정교육 및 연수

**고용 현황**
2020년 5명에서 2024년 2명으로 규모가 축소되었으나, 전문성을 바탕으로 한 고품질 서비스를 유지하고 있습니다.`
};

function CompanyDescriptionBlock({ bizno, className = "" }) {
  // 사업자등록번호를 기준으로 설명 데이터 조회
  const getCompanyDescription = (businessNumber) => {
    return companyDescriptions[businessNumber] || null;
  };

  // 텍스트를 단락별로 분리하여 렌더링
  const renderDescription = (description) => {
    if (!description) return null;

    // 줄바꿈을 기준으로 단락 분리
    const paragraphs = description.split('\n\n').filter(p => p.trim());

    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      
      // **텍스트** 형태의 볼드 처리
      if (trimmedParagraph.startsWith('**') && trimmedParagraph.includes('**')) {
        const parts = trimmedParagraph.split('**');
        return (
          <div key={index} className="mb-4">
            {parts.map((part, partIndex) => {
              if (partIndex % 2 === 1) {
                // 홀수 인덱스는 볼드 텍스트
                return <h4 key={partIndex} className="font-bold text-gray-800 mb-2">{part}</h4>;
              } else if (part.trim()) {
                // 짝수 인덱스는 일반 텍스트 (빈 문자열 제외)
                return <p key={partIndex} className="text-gray-700 leading-relaxed">{part}</p>;
              }
              return null;
            })}
          </div>
        );
      }
      
      // • 로 시작하는 리스트 항목 처리
      if (trimmedParagraph.includes('•')) {
        const lines = trimmedParagraph.split('\n');
        return (
          <div key={index} className="mb-4">
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('•')) {
                return (
                  <div key={lineIndex} className="flex items-start mb-1">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span className="text-gray-700">{trimmedLine.substring(1).trim()}</span>
                  </div>
                );
              } else if (trimmedLine) {
                return <p key={lineIndex} className="text-gray-700 leading-relaxed mb-2">{trimmedLine}</p>;
              }
              return null;
            })}
          </div>
        );
      }
      
      // 일반 단락
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-4">
          {trimmedParagraph}
        </p>
      );
    });
  };

  const description = getCompanyDescription(bizno);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        기업 설명
      </h3>
      
      {description ? (
        <div className="prose prose-sm max-w-none">
          {renderDescription(description)}
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 mb-2">설명 정보가 없습니다</p>
          <p className="text-sm text-gray-400">
            해당 기업에 대한 상세 설명이 준비되지 않았습니다.
          </p>
        </div>
      )}
      
      {/* 향후 확장 가능 영역 표시 */}
      {description && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>정보 출처: AI 검색 결과 및 공개 자료</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyDescriptionBlock; 