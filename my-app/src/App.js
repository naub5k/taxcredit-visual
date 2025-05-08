import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegionSelector from './components/RegionSelector';
import RegionChart from './components/RegionChart';
import MobileRegionDetail from './components/MobileRegionDetail';
import RegionDetailPage from './components/RegionDetailPage';
import './App.css';
import { regionGroups } from './data/employmentRegionData';

// 메인 앱 컴포넌트
function AppContent() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedChartData, setSelectedChartData] = useState(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const capitalAreaRef = useRef(null);
  const otherRegionsRef = useRef(null);

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

  // 지역명에 따른 타이틀 생성 함수
  const getRegionTitle = (regionName) => {
    if (!regionName) return '';
    
    if (regionName.endsWith('시')) {
      return `${regionName} 전체 구 현황`;
    } else if (regionName.endsWith('도')) {
      return `${regionName} 전체 시/군 현황`;
    } else if (regionName === '서울특별시') {
      return `${regionName} 28개 구 현황`;
    } else {
      return `${regionName} 구/군별 현황`;
    }
  };

  if (isMobile && showMobileDetail && selectedChartData) {
    return (
      <MobileRegionDetail 
        regionData={selectedChartData} 
        onBack={handleMobileBack}
        getRegionTitle={getRegionTitle}
      />
    );
  }

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
          
          {/* 우측: 선택된 지역 상세 정보 (있는 경우만 표시) - 모바일에서는 표시하지 않음 */}
          {!isMobile && selectedChartData && (
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                <h2 className="text-xl font-bold mb-3 text-gray-800">
                  {getRegionTitle(selectedChartData.시도 || selectedChartData.name)}
                </h2>
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <h3 className="font-medium text-gray-700">총 업체 수</h3>
                  <p className="text-xl font-bold text-blue-700">
                    {selectedChartData.업체수.toLocaleString()}개
                  </p>
                </div>
                {selectedChartData.구군목록 && (
                  <div className="mt-2">
                    <h3 className="font-medium text-gray-700 mb-2">구/군별 현황</h3>
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                      {selectedChartData.구군목록.map((item, index) => (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.구군}</span>
                            <span className="font-medium">{item.업체수.toLocaleString()}개</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(item.업체수 / selectedChartData.업체수) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              <div className="bg-purple-50 p-3 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
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
      </Routes>
    </Router>
  );
}

export default App;