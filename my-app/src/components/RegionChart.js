import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { normalizedRegionRatio, regionGroups, employmentRegionData } from '../data/employmentRegionData';

/**
 * 지역별 업체 수 시각화 차트 컴포넌트
 * - 상단: 수도권(서울특별시, 경기도) 막대그래프 표시
 * - 하단: 선택된 지역의 구/군별 막대그래프 표시
 * - 모바일 환경에 최적화된 반응형 그래프
 */
const RegionChart = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCapitalRegion, setSelectedCapitalRegion] = useState(null);
  const [districtData, setDistrictData] = useState([]);
  
  // 모바일 환경 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // 수도권 데이터 준비 (서울, 경기)
  const capitalAreaData = employmentRegionData
    .filter(region => regionGroups.수도권.includes(region.시도))
    .map(region => ({
      name: region.시도,
      업체수: region.업체수,
      비율: parseFloat(((region.업체수 / getTotalCompanies()) * 100).toFixed(2))
    }));

  // 전체 업체 수 계산 함수
  function getTotalCompanies() {
    return employmentRegionData.reduce((sum, region) => sum + region.업체수, 0);
  }

  // 선택된 지역의 구/군 데이터 로드
  useEffect(() => {
    if (selectedCapitalRegion) {
      const regionData = employmentRegionData.find(r => r.시도 === selectedCapitalRegion);
      if (regionData && regionData.구군목록) {
        // 업체 수 기준 내림차순 정렬하고 상위 10개만 표시 (가독성을 위해)
        const sortedDistricts = [...regionData.구군목록]
          .sort((a, b) => b.업체수 - a.업체수)
          .slice(0, 10)
          .map(district => ({
            name: district.구군,
            업체수: district.업체수,
            비율: parseFloat(((district.업체수 / regionData.업체수) * 100).toFixed(2))
          }));
        
        setDistrictData(sortedDistricts);
      }
    } else {
      setDistrictData([]);
    }
  }, [selectedCapitalRegion]);

  // 수도권 바 클릭 핸들러
  const handleCapitalBarClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedRegion = data.activePayload[0].payload.name;
      setSelectedCapitalRegion(clickedRegion);
    }
  };

  // 비수도권 데이터 필터링 (차트에 표시할 데이터)
  const otherRegionsData = normalizedRegionRatio
    .filter(region => !regionGroups.수도권.includes(region.시도))
    .map(region => ({
      name: region.시도,
      비율: region.비율,
      업체수: region.업체수
    }));
    
  // 모바일에서는 데이터를 일부 필터링하여 주요 지역만 표시 (가독성 향상)
  const displayData = isMobile
    ? otherRegionsData.filter(item => item.비율 > 2) // 비율이 2% 이상인 주요 지역만 표시
    : otherRegionsData;

  return (
    <div className="region-chart">
      {/* 수도권 업체 비중 표시 차트 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">수도권</h2>
        <p className="text-sm text-gray-600 mb-3">
          * 수도권 주요 지역 고용 비율 (클릭하여 구/군별 현황 조회)
        </p>
        
        <div className={`${isMobile ? 'h-48' : 'h-56'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={capitalAreaData}
              margin={isMobile 
                ? { top: 5, right: 10, left: 5, bottom: 10 } 
                : { top: 5, right: 20, left: 10, bottom: 10 }
              }
              onClick={handleCapitalBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                tickFormatter={(value) => `${value}%`}
                label={{ value: '비율 (%)', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => value.toLocaleString()}
                label={{ value: '업체수', angle: 90, position: 'insideRight', fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value, name) => [name === '비율' ? `${value}%` : value.toLocaleString(), name]}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="비율" fill="#3b82f6" name="비율 (%)" cursor="pointer" />
              <Bar yAxisId="right" dataKey="업체수" fill="#10b981" name="업체수" cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {selectedCapitalRegion && (
          <p className="text-sm bg-blue-50 p-2 rounded mt-2">
            현재 <span className="font-medium">{selectedCapitalRegion}</span>를 선택하셨습니다. 
            아래에서 상세 구/군별 현황을 확인할 수 있습니다.
          </p>
        )}
      </div>
      
      {/* 선택된 수도권 지역의 구/군 현황 */}
      {selectedCapitalRegion && districtData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-bold mb-2 text-gray-800">
            {selectedCapitalRegion} 구/군별 현황
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            * 업체수 기준 상위 10개 구/군 표시 ({selectedCapitalRegion} 내 비율)
          </p>
          
          <div className={`${isMobile ? 'h-72' : 'h-80'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={districtData}
                margin={isMobile 
                  ? { top: 5, right: 10, left: 5, bottom: 70 } 
                  : { top: 5, right: 20, left: 10, bottom: 70 }
                }
                layout={isMobile ? "vertical" : "horizontal"} // 모바일에서는 수평 바 차트로 변경
              >
                <CartesianGrid strokeDasharray="3 3" />
                {isMobile ? (
                  // 모바일: 수평 바 차트
                  <>
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
                  </>
                ) : (
                  // 데스크톱: 수직 바 차트
                  <>
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      label={{ value: '비율 (%)', angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 12 }}
                    />
                  </>
                )}
                <Tooltip 
                  formatter={(value, name) => [name === '비율' ? `${value}%` : value.toLocaleString(), name]}
                />
                <Legend wrapperStyle={isMobile ? { fontSize: '10px' } : {}} />
                <Bar dataKey="비율" fill="#8b5cf6" name="지역 비율 (%)" />
                <Bar dataKey="업체수" fill="#64748b" name="업체수" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 기타지역 시도별 비율 차트 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">기타지역 시도별 비율</h2>
        <p className="text-sm text-gray-600 mb-2">
          * 서울특별시와 경기도를 제외한 전국 15개 지역의 업체 분포 비율 (합계: 100%)
        </p>
        
        {isMobile && (
          <p className="text-xs bg-yellow-100 p-2 rounded mb-3">
            모바일 환경에서는 주요 지역({displayData.length}개)만 표시됩니다.
          </p>
        )}
        
        <div className={`${isMobile ? 'h-72' : 'h-80'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              margin={isMobile 
                ? { top: 5, right: 10, left: 5, bottom: 70 } 
                : { top: 5, right: 20, left: 10, bottom: 70 }
              }
              layout={isMobile ? "vertical" : "horizontal"} // 모바일에서는 수평 바 차트로 변경
            >
              <CartesianGrid strokeDasharray="3 3" />
              {isMobile ? (
                // 모바일: 수평 바 차트 (XAxis와 YAxis가 바뀜)
                <>
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
                </>
              ) : (
                // 데스크톱: 수직 바 차트
                <>
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    label={{ value: '비율 (%)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12 }}
                  />
                </>
              )}
              <Tooltip 
                formatter={(value, name) => [`${value}%`, '비율']}
                labelFormatter={(label) => `${label}`}
              />
              <Legend wrapperStyle={isMobile ? { fontSize: '10px' } : {}} />
              <Bar dataKey="비율" fill="#3b82f6" name="지역 비율 (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 지역 그룹 정보 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">지역 그룹 정보</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-gray-700">수도권</h4>
            <p className="text-sm text-gray-600">
              {regionGroups.수도권.join(', ')}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-gray-700">기타지역</h4>
            <p className="text-sm text-gray-600">
              전체 {regionGroups.기타지역.length}개 지역
              {isMobile && ` (주요 ${displayData.length}개 표시)`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionChart; 