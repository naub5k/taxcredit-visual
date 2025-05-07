import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PartnerModal from './PartnerModal';

/**
 * 모바일 환경에서 선택된 지역의 상세 정보를 전체 화면으로 표시하는 컴포넌트
 * - 뒤로가기 버튼 제공
 * - 지역 정보 요약 표시
 * - 구/군별 분포를 가로 막대 차트로 표시
 * - 차트 클릭 시 상단 정보 실시간 갱신
 */
const MobileRegionDetail = ({ regionData, onBack, getRegionTitle }) => {
  // 선택된 구/군 상태 관리 (기본값: null)
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  // 상단 요약 정보 영역에 대한 ref
  const topSummaryRef = useRef(null);
  // 파트너 모달 상태
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  
  // 데이터 처리 및 초기 선택 설정을 위한 useEffect
  useEffect(() => {
    if (!regionData) return;
    
    // 구/군 데이터 준비
    const districts = regionData.구군목록 
      ? regionData.구군목록
          .sort((a, b) => b.업체수 - a.업체수)
          .map(district => ({
            name: district.구군,
            업체수: district.업체수,
            비율: parseFloat(((district.업체수 / regionData.업체수) * 100).toFixed(2))
          }))
      : [];
      
    // 초기에 가장 많은 업체를 가진 구/군 선택
    if (districts.length > 0 && !selectedDistrict) {
      setSelectedDistrict(districts[0]);
    }
  }, [regionData, selectedDistrict]);
  
  // 조기 반환 - 데이터가 없는 경우
  if (!regionData) return null;

  // 구/군 데이터 준비 (렌더링용)
  const districtData = regionData.구군목록 
    ? regionData.구군목록
        .sort((a, b) => b.업체수 - a.업체수)
        .map(district => ({
          name: district.구군,
          업체수: district.업체수,
          비율: parseFloat(((district.업체수 / regionData.업체수) * 100).toFixed(2))
        }))
    : [];
   
  // 차트 클릭 이벤트 핸들러
  const handleChartClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedName = data.activePayload[0].payload.name;
      const clickedDistrict = districtData.find(d => d.name === clickedName);
      if (clickedDistrict) {
        setSelectedDistrict(clickedDistrict);
        
        // 모바일 환경에서 상단 요약 정보로 스크롤
        if (window.innerWidth < 768 && topSummaryRef.current) {
          // 부드럽게 스크롤
          setTimeout(() => {
            topSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    }
  };

  // 파트너 모달 띄우기
  const handleShowPartnerModal = () => {
    setShowPartnerModal(true);
  };

  // 파트너 모달 닫기
  const handleClosePartnerModal = () => {
    setShowPartnerModal(false);
  };

  // 차트 높이 계산 함수 (데이터 개수에 따라 동적 조정)
  const calculateChartHeight = (dataLength) => {
    const baseHeight = 400;
    const heightPerItem = 30;
    const calculatedHeight = baseHeight + ((dataLength - 10) * heightPerItem);
    
    return Math.max(baseHeight, calculatedHeight);
  };

  const regionName = regionData.시도 || regionData.name;
  const regionTitle = getRegionTitle(regionName);
  
  // 전국 대비 비율 계산 (총 업체수를 1,000,000으로 가정)
  const nationalRatio = ((regionData.업체수 / 1000000) * 100).toFixed(2);

  return (
    <div className="mobile-region-detail bg-gray-100 min-h-screen">
      {/* 헤더 영역 */}
      <header className="bg-blue-700 text-white p-3 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="mr-3 bg-blue-800 rounded-full p-1 flex items-center justify-center"
              aria-label="뒤로 가기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">지역 상세 정보</h1>
              <p className="text-sm opacity-80">{regionName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-4 px-3">
        {/* 지역 요약 정보 카드 - 4분할 그리드 */}
        <div ref={topSummaryRef} className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-bold mb-3 text-gray-800">{regionTitle}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* 시/도명 */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-medium text-gray-500 text-sm">시/도:</h3>
              <p className="text-lg font-bold text-gray-800">
                {regionName}
              </p>
            </div>
            
            {/* 전체 업체 수 */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="font-medium text-gray-500 text-sm">전체 업체 수:</h3>
              <p className="text-lg font-bold text-blue-700">
                {regionData.업체수.toLocaleString()}개
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
                  className="bg-green-50 p-3 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={handleShowPartnerModal}
                >
                  <h3 className="font-medium text-gray-500 text-sm">해당 구/군 업체 수:</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-green-700">
                      {selectedDistrict.업체수.toLocaleString()}개
                    </p>
                    <span className="text-xs bg-green-700 text-white px-2 py-1 rounded">상세보기</span>
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
                {regionName} 내에서 <span className="font-bold text-green-700">{selectedDistrict.비율.toFixed(1)}%</span>를 
                차지하며, 총 <span className="font-bold text-green-700">{selectedDistrict.업체수.toLocaleString()}</span>개의
                업체가 있습니다.</>
              )}
            </p>
          </div>

          {/* 파트너 서비스 영역 */}
          <div className="bg-purple-50 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-purple-100 transition-colors"
               onClick={handleShowPartnerModal}>
            <div>
              <h3 className="font-medium text-gray-700">상세 정보 조회</h3>
              <p className="text-sm text-gray-600">전체 사업장 목록 확인</p>
            </div>
            <div className="text-purple-700 font-bold">
              파트너 전용 &gt;
            </div>
          </div>
        </div>

        {/* 구/군별 현황 바 차트 */}
        {districtData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="font-medium text-gray-700 mb-3">
              구/군별 업체 수 비교 <span className="text-sm text-gray-500">(클릭하여 상세 정보 확인)</span>
            </h3>
            <div style={{ height: `${calculateChartHeight(districtData.length)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={districtData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  layout="vertical"
                  onClick={handleChartClick}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === '비율' ? `${value}%` : value.toLocaleString(), 
                      name
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="비율" fill="#8b5cf6" name="지역 비율 (%)" barSize={20} />
                  <Bar dataKey="업체수" fill="#64748b" name="업체수" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-3 mt-6">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2025 고용이력부 시스템 | 데이터 출처: 덕율세무회계사무소</p>
        </div>
      </footer>

      {/* 파트너 모달 */}
      <PartnerModal 
        isOpen={showPartnerModal} 
        onClose={handleClosePartnerModal} 
        sido={regionName}
        gugun={selectedDistrict ? selectedDistrict.name : ''}
      />
    </div>
  );
};

export default MobileRegionDetail; 