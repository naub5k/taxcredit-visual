import React, { useState, useEffect } from 'react';
import RegionSelector from './components/RegionSelector';
import RegionChart from './components/RegionChart';
import './App.css';

function App() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <div className="App bg-gray-100 min-h-screen">
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">고용이력부</h1>
          <p className="text-sm opacity-80">시도/구군별 업체 수 현황 조회</p>
          {isMobile && (
            <p className="text-xs mt-1 bg-blue-600 px-2 py-1 inline-block rounded">모바일 최적화 보기</p>
          )}
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        {/* 항상 세로 배치로 변경 (모바일/데스크톱 모두 동일하게) */}
        <div className="flex flex-col space-y-6">
          {/* 지역 선택기 */}
          <div className="w-full">
            <RegionSelector onRegionChange={handleRegionChange} />
          </div>
          
          {/* 지역 차트 */}
          <div className="w-full">
            <RegionChart />
          </div>
        </div>

        {/* 선택된 지역 상세 정보 */}
        {selectedRegion && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {selectedRegion.시도} {selectedRegion.구군} 상세 정보
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">업체 수</h3>
                <p className="text-xl md:text-2xl font-bold text-blue-700">
                  {selectedRegion.업체수.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">시도 내 비율</h3>
                <p className="text-xl md:text-2xl font-bold text-green-700">
                  {((selectedRegion.업체수 / selectedRegion.시도업체수) * 100).toFixed(2)}%
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">전국 대비 순위</h3>
                <p className="text-xl md:text-2xl font-bold text-purple-700">
                  조회 중...
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2025 고용이력부 시스템 | 데이터 출처: CleanDB.dbo.Insu_Clean</p>
        </div>
      </footer>
    </div>
  );
}

export default App;