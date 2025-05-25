import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegionSelector from './components/RegionSelector';
import RegionChart from './components/RegionChart';
import MobileRegionDetail from './components/MobileRegionDetail';
import RegionDetailPage from './components/RegionDetailPage';
import CompanyDetailPage from './components/CompanyDetailPage';
import { RegionSummaryBox, PartnerServiceLink } from './components/RegionDetailComponents';
import PartnerModal from './components/PartnerModal';
import DataApiTest from './components/DataApiTest';
import './App.css';
import { regionGroups, employmentRegionData } from './data/employmentRegionData';

// 메인 앱 컴포넌트
function AppContent() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedChartData, setSelectedChartData] = useState(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const capitalAreaRef = useRef(null);
  const otherRegionsRef = useRef(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null); // 선택된 구/군 정보
  const [showPartnerModal, setShowPartnerModal] = useState(false); // 파트너 모달 상태

  // 최초 로딩 시 기본 데이터 설정 (서울특별시)
  useEffect(() => {
    // 초기에는 서울특별시 데이터를 기본으로 설정
    const seoulData = employmentRegionData.find(region => region.시도 === '서울특별시');
    if (seoulData && !selectedChartData) {
      setSelectedChartData(seoulData);
    }
  }, [selectedChartData]);

  // 지역 데이터 변경 시 선택된 구/군 업데이트
  useEffect(() => {
    if (selectedChartData && selectedChartData.구군목록 && selectedChartData.구군목록.length > 0) {
      // 구/군 데이터 처리
      const districts = selectedChartData.구군목록
        .sort((a, b) => b.업체수 - a.업체수)
        .map(district => ({
          name: district.구군,
          업체수: district.업체수,
          비율: parseFloat(((district.업체수 / selectedChartData.업체수) * 100).toFixed(2))
        }));
        
      if (districts.length > 0) {
        setSelectedDistrict(districts[0]); // 첫 번째 구/군을 기본 선택
      }
    } else {
      setSelectedDistrict(null);
    }
  }, [selectedChartData]);

  // 반응형 디자인을 위한 화면 크기 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 초기 확인
    checkIsMobile();
    
    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', checkIsMobile);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleRegionChange = (regionData) => {
    setSelectedRegion(regionData);
  };

  const handleChartSelection = (data) => {
    setSelectedChartData(data);
    if (isMobile) {
      setShowMobileDetail(true);
    }
  };

  const handleMobileBack = () => {
    setShowMobileDetail(false);
  };

  const scrollToCapitalArea = () => {
    if (capitalAreaRef.current) {
      capitalAreaRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToOtherRegions = () => {
    if (otherRegionsRef.current) {
      otherRegionsRef.current.scrollIntoView({ behavior: 'smooth' });
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

  // 차트 클릭 이벤트 핸들러 - 구/군 선택
  const handleDistrictClick = (district) => {
    setSelectedDistrict(district);
  };

  // 지역명에 따른 타이틀 생성 함수
  const getRegionTitle = (regionName) => {
    if (!regionName) return '';
    
    if (regionName.endsWith('시')) {
      return `${regionName} 전체 구 현황`;
    } else if (regionName.endsWith('도')) {
      return `${regionName} 전체 시/군 현황`;
    } else if (regionName === '서울특별시') {
      return `${regionName} 전체 구 현황`;
    } else {
      return `${regionName} 구/군별 현황`;
    }
  };

  // 모바일에서 상세 화면 표시 시
  if (isMobile && showMobileDetail && selectedChartData) {
    return (
      <MobileRegionDetail 
        regionData={selectedChartData} 
        onBack={handleMobileBack}
        getRegionTitle={getRegionTitle}
      />
    );
  }

  // 구/군 데이터 처리 (렌더링용)
  const districtData = selectedChartData && selectedChartData.구군목록 
    ? selectedChartData.구군목록
        .sort((a, b) => b.업체수 - a.업체수)
        .map(district => ({
          name: district.구군,
          업체수: district.업체수,
          비율: parseFloat(((district.업체수 / selectedChartData.업체수) * 100).toFixed(2))
        }))
    : [];

  return (
    <div className="App bg-gray-100 min-h-screen">
      <header className="bg-blue-700 text-white p-3 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">고용이력부</h1>
          <p className="text-sm opacity-80 mt-0.5">시도/구군별 업체 현황 조회</p>
        </div>
      </header>

      {/* 지역 그룹 정보 - 버튼형 박스 UI */}
      <div className="container mx-auto py-3 px-3">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={scrollToCapitalArea}
              className="bg-blue-50 hover:bg-blue-100 transition-colors p-3 rounded flex flex-col items-center justify-center border border-blue-200"
            >
              <p className="text-sm text-gray-600 mt-1">
                {regionGroups.수도권.join(', ')}
              </p>
            </button>
            <button 
              onClick={scrollToOtherRegions}
              className="bg-amber-50 hover:bg-amber-100 transition-colors p-3 rounded flex flex-col items-center justify-center border border-amber-200"
            >
              <p className="text-sm text-gray-600 mt-1">
                전체 {regionGroups.기타지역.length}개 지역
              </p>
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto py-3 px-3">
        {/* 2단 레이아웃 - 모바일에서는 세로, 데스크탑에서는 가로 */}
        <div className={`${isMobile ? 'flex flex-col space-y-4' : 'grid grid-cols-3 gap-4'}`}>
          {/* 좌측: 차트 컴포넌트 */}
          <div className={`${isMobile ? 'w-full' : 'col-span-2'}`}>
            <RegionChart 
              onRegionSelect={handleChartSelection} 
              capitalAreaRef={capitalAreaRef}
              otherRegionsRef={otherRegionsRef}
            />
          </div>
          
          {/* 우측: 지역 상세 정보 - 모바일의 두 번째 화면과 동일한 구조 (PC/태블릿에서만 표시) */}
          {!isMobile && selectedChartData && (
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow-md">
                {/* 지역 상세 정보 헤더 */}
                <div className="bg-blue-700 text-white p-4 rounded-t-lg flex items-center">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">지역 상세 정보</h2>
                    <p className="text-sm opacity-80">{selectedChartData.시도}</p>
                  </div>
                </div>
                
                {/* 지역 상세 컨텐츠 - 모바일과 동일한 컴포넌트 사용 */}
                <div className="p-4">
                  {/* RegionSummaryBox 컴포넌트 재사용 */}
                  <RegionSummaryBox
                    regionData={selectedChartData}
                    selectedDistrict={selectedDistrict}
                    onShowPartnerModal={handleShowPartnerModal}
                  />

                  {/* PartnerServiceLink 컴포넌트 재사용 */}
                  <PartnerServiceLink
                    sido={selectedChartData.시도}
                    gugun={selectedDistrict ? selectedDistrict.name : ''}
                    onShowPartnerModal={handleShowPartnerModal}
                  />
                  
                  {/* 구/군별 업체 수 비교 목록 */}
                  {districtData.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                      <h3 className="font-medium text-gray-700 mb-3">
                        구/군별 업체 수 비교 <span className="text-sm text-gray-500">(클릭하여 상세 정보 확인)</span>
                      </h3>
                      <div className="max-h-80 overflow-y-auto">
                        {districtData.map((district, index) => {
                          const isSelected = selectedDistrict && selectedDistrict.name === district.name;
                          
                          return (
                            <div 
                              key={index}
                              className={`mb-2 p-2 rounded-md cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                              onClick={() => handleDistrictClick(district)}
                            >
                              <div className="flex justify-between items-center text-sm mb-1">
                                <span className={isSelected ? 'font-bold text-blue-700' : ''}>{district.name}</span>
                                <span className={isSelected ? 'font-bold text-blue-700' : ''}>
                                  {district.업체수.toLocaleString()} ({district.비율}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`${isSelected ? 'bg-blue-700' : 'bg-blue-500'} h-2 rounded-full`} 
                                  style={{ width: `${district.비율}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 선택된 지역 상세 정보 - 모바일에서는 표시하지 않음 */}
        {!isMobile && selectedRegion && (
          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-3 text-gray-800">
              {selectedRegion.시도} {selectedRegion.구군} 상세 정보
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h3 className="font-medium text-gray-700">업체 수</h3>
                <p className="text-xl md:text-2xl font-bold text-blue-700">
                  {selectedRegion.업체수.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <h3 className="font-medium text-gray-700">시도 내 비율</h3>
                <p className="text-xl md:text-2xl font-bold text-green-700">
                  {((selectedRegion.업체수 / selectedRegion.시도업체수) * 100).toFixed(2)}%
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                  onClick={handleShowPartnerModal}>
                <h3 className="font-medium text-gray-700">상세 정보 조회</h3>
                <div className="flex justify-between items-center">
                  <p className="text-purple-700 font-bold">파트너 전용</p>
                  <span className="text-xs bg-purple-700 text-white px-2 py-1 rounded">준비중</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 지역 선택기 (최하단으로 이동) */}
        <div className="w-full mt-4">
          <RegionSelector onRegionChange={handleRegionChange} />
        </div>
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
        sido={selectedChartData?.시도 || ''}
        gugun={selectedDistrict?.name || ''}
      />
    </div>
  );
}

// 앱의 라우팅 설정
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/region" element={<RegionDetailPage />} />
        <Route path="/region-detail" element={<RegionDetailPage />} />
        <Route path="/company/:bizno" element={<CompanyDetailPage />} />
        <Route path="/api-test" element={<DataApiTest />} />
      </Routes>
    </Router>
  );
}

export default App;