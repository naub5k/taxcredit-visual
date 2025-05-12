import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 지역 요약 정보 컴포넌트
 * - 시도 이름, 업체 수 등 기본 정보 표시
 * - 선택된 구/군 정보 표시 (있는 경우)
 */
export const RegionSummaryBox = ({ regionData, selectedDistrict, onShowPartnerModal }) => {
  if (!regionData) return null;

  const regionName = regionData.시도 || regionData.name;
  // 전국 대비 비율 계산 (총 업체수를 1,000,000으로 가정)
  const nationalRatio = ((regionData.업체수 / 1000000) * 100).toFixed(2);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-xl font-bold mb-3 text-gray-800">{regionName} 전체 구 현황</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* 시/도명 */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="font-medium text-gray-500 text-sm">시/도:</h3>
          <p className="text-lg font-bold text-gray-800">{regionName}</p>
        </div>
        
        {/* 전체 업체 수 */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h3 className="font-medium text-gray-500 text-sm">전체 업체 수:</h3>
          <p className="text-lg font-bold text-blue-700">
            {regionData.업체수?.toLocaleString()}개
          </p>
        </div>
        
        {/* 선택된 구/군 (있을 경우) */}
        {selectedDistrict && (
          <>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-medium text-gray-500 text-sm">선택된 구/군:</h3>
              <p className="text-lg font-bold text-gray-800">
                {selectedDistrict.name}
              </p>
            </div>
            
            <div 
              className={`bg-green-50 p-3 rounded-lg ${onShowPartnerModal ? "cursor-pointer hover:bg-green-100 transition-colors" : ""}`}
              onClick={onShowPartnerModal}
            >
              <h3 className="font-medium text-gray-500 text-sm">해당 구/군 업체 수:</h3>
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-green-700">
                  {selectedDistrict.업체수?.toLocaleString()}개
                </p>
                {onShowPartnerModal && (
                  <span className="text-xs bg-green-700 text-white px-2 py-1 rounded">상세보기</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* 추가 정보 섹션 */}
      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <h3 className="font-medium text-gray-700 mb-2">지역 개요</h3>
        <p className="text-sm text-gray-600">
          <span className="font-bold text-blue-800">{regionName}</span>은(는) 전국 대비 
          <span className="font-bold text-blue-800"> {nationalRatio}%</span>의 
          업체가 분포하고 있습니다.
          {selectedDistrict && (
            <> <span className="font-bold text-green-700">{selectedDistrict.name}</span> 지역은 
            {regionName} 내에서 <span className="font-bold text-green-700">{selectedDistrict.비율?.toFixed(1)}%</span>를 
            차지하며, 총 <span className="font-bold text-green-700">{selectedDistrict.업체수?.toLocaleString()}</span>개의
            업체가 있습니다.</>
          )}
        </p>
      </div>
    </div>
  );
};

/**
 * 파트너 서비스 링크 컴포넌트
 * - 파트너 전용 페이지로 이동하는 링크 제공
 * - 모든 해상도에서 표시됨
 */
export const PartnerServiceLink = ({ sido, gugun, onShowPartnerModal }) => {
  if (onShowPartnerModal) {
    return (
      <div 
        className="bg-purple-50 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-purple-100 transition-colors mb-4" 
        onClick={onShowPartnerModal}
      >
        <div>
          <h3 className="font-medium text-gray-700">상세 정보 조회</h3>
          <p className="text-sm text-gray-600">전체 사업장 목록 확인</p>
        </div>
        <div className="text-purple-700 font-bold">
          파트너 전용 &gt;
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`/partner?sido=${sido}&gugun=${gugun}`}
      className="block bg-purple-50 rounded-lg p-3 flex justify-between items-center hover:bg-purple-100 transition-colors mb-4"
    >
      <div>
        <h3 className="font-medium text-gray-700">상세 정보 조회</h3>
        <p className="text-sm text-gray-600">전체 사업장 목록 확인</p>
      </div>
      <div className="text-purple-700 font-bold">
        파트너 전용 &gt;
      </div>
    </Link>
  );
};

/**
 * 세로 막대 그래프 컴포넌트 - 회사 데이터 시각화
 */
export const CompanyDataBars = ({ item, maxEmployeeCount }) => {
  if (!item) return null;
  
  const years = ['2020', '2021', '2022', '2023', '2024'];
  const barContainerHeight = 50; // 세로 막대 컨테이너의 최대 높이 (px)

  return (
    <div className="flex justify-between items-end pt-3 pb-2 px-2 h-20">
      {years.map(year => {
        const value = Number(item[year]) || 0;
        // maxEmployeeCount가 0일 경우 barHeightPercentage가 NaN/Infinity가 될 수 있으므로, 0으로 처리
        const barHeightPercentage = maxEmployeeCount > 0 ? (value / maxEmployeeCount) * 100 : 0;
        // 음수 높이가 되지 않도록 Math.max 사용
        const barPixelHeight = Math.max(0, (barHeightPercentage / 100) * barContainerHeight);

        return (
          <div key={year} className="flex flex-col items-center w-[18%] text-center">
            <span className="text-xs text-gray-700 font-medium mb-0.5 h-4 flex items-center justify-center">{value}</span>
            <div
              style={{ height: `${Math.max(barPixelHeight, value > 0 ? 4 : 0)}px` }} // 값이 있을 때 최소 높이 4px, 없으면 0px
              className={`w-3/5 rounded-sm ${value > 0 ? 'bg-blue-500' : 'bg-gray-300'} transition-all duration-300 ease-in-out`}
              title={`${year}: ${value}`}
            >
            </div>
            <span className="text-[10px] text-gray-500 mt-0.5">{year}</span>
          </div>
        );
      })}
    </div>
  );
}; 