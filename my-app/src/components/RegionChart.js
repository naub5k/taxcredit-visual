import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { normalizedRegionRatio, regionGroups, employmentRegionData } from '../data/employmentRegionData';

/**
 * 지역별 업체 수 시각화 차트 컴포넌트
 * - 상단: 수도권(서울특별시, 경기도) 막대그래프 표시
 * - 하단: 선택된 지역의 구/군별 막대그래프 표시
 * - 모바일 환경에 최적화된 반응형 그래프
 */
const RegionChart = ({ onRegionSelect, capitalAreaRef, otherRegionsRef }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCapitalRegion, setSelectedCapitalRegion] = useState(null);
  const [selectedOtherRegion, setSelectedOtherRegion] = useState(null);
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
    let regionData = null;
    
    if (selectedCapitalRegion) {
      regionData = employmentRegionData.find(r => r.시도 === selectedCapitalRegion);
    } else if (selectedOtherRegion) {
      regionData = employmentRegionData.find(r => r.시도 === selectedOtherRegion);
    }
    
    if (regionData && regionData.구군목록) {
      // 업체 수 기준 내림차순 정렬하고 모든 항목 표시
      const sortedDistricts = [...regionData.구군목록]
        .sort((a, b) => b.업체수 - a.업체수)
        .map(district => ({
          name: district.구군,
          업체수: district.업체수,
          비율: parseFloat(((district.업체수 / regionData.업체수) * 100).toFixed(2))
        }));
      
      setDistrictData(sortedDistricts);
    } else {
      setDistrictData([]);
    }
  }, [selectedCapitalRegion, selectedOtherRegion]);

  // 수도권 바 클릭 핸들러
  const handleCapitalBarClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedRegion = data.activePayload[0].payload.name;
      setSelectedCapitalRegion(clickedRegion);
      setSelectedOtherRegion(null); // 다른 지역 선택 해제
      
      // 상위 컴포넌트에 선택된 지역 정보 전달
      const selectedRegionData = employmentRegionData.find(region => region.시도 === clickedRegion);
      if (selectedRegionData && onRegionSelect) {
        onRegionSelect(selectedRegionData);
      }
    }
  };

  // 비수도권 지역 클릭 핸들러
  const handleOtherRegionClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedRegion = data.activePayload[0].payload.name;
      setSelectedOtherRegion(clickedRegion);
      setSelectedCapitalRegion(null); // 수도권 지역 선택 해제
      
      // 상위 컴포넌트에 선택된 지역 정보 전달
      const selectedRegionData = employmentRegionData.find(region => region.시도 === clickedRegion);
      if (selectedRegionData && onRegionSelect) {
        onRegionSelect(selectedRegionData);
      }
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

  // 지역명에 따른 타이틀 생성 함수
  const getRegionTitle = (regionName) => {
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

  // 차트 높이 계산 함수 (데이터 개수에 따라 동적 조정)
  const calculateChartHeight = (dataLength) => {
    const baseHeight = 400;
    const heightPerItem = 30;
    const calculatedHeight = baseHeight + ((dataLength - 10) * heightPerItem);
    
    return Math.max(baseHeight, calculatedHeight);
  };

  return (
    <div className="region-chart">
      {/* 수도권 업체 비중 표시 차트 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4" ref={capitalAreaRef}>
        <h2 className="text-xl font-bold mb-2 text-gray-800">서울/경기 수도권</h2>
        <p className="text-sm text-gray-600 mb-3">
          * 서울/경기 수도권 주요 지역 고용 비율 (클릭하여 상세 정보 조회)
        </p>
        
        <div className={`${isMobile ? 'h-56' : 'h-64'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={capitalAreaData}
              margin={isMobile 
                ? { top: 5, right: 10, left: 5, bottom: 10 } 
                : { top: 5, right: 20, left: 10, bottom: 10 }
              }
              onClick={handleCapitalBarClick}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number"
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                type="category"
                dataKey="name" 
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip 
                formatter={(value, name) => [name === '비율' ? `${value}%` : value.toLocaleString(), name]}
              />
              <Legend />
              <Bar dataKey="비율" fill="#3b82f6" name="비율 (%)" cursor="pointer" barSize={30} />
              <Bar dataKey="업체수" fill="#10b981" name="업체수" cursor="pointer" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 기타지역 시도별 비율 차트 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4" ref={otherRegionsRef}>
        <h2 className="text-xl font-bold mb-2 text-gray-800">기타 15개 시도</h2>
        <p className="text-sm text-gray-600 mb-2">
          * 서울특별시와 경기도를 제외한 전국 15개 지역의 업체 분포 비율 (클릭하여 상세 정보 조회)
        </p>
        
        <div style={{ height: `${calculateChartHeight(otherRegionsData.length)}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={otherRegionsData}
              margin={isMobile 
                ? { top: 5, right: 10, left: 5, bottom: 10 } 
                : { top: 5, right: 20, left: 20, bottom: 10 }
              }
              layout="vertical"
              onClick={handleOtherRegionClick}
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
                width={100}
              />
              <Tooltip 
                formatter={(value, name) => [name === '비율' ? `${value}%` : value.toLocaleString(), name]}
              />
              <Legend wrapperStyle={isMobile ? { fontSize: '10px' } : {}} />
              <Bar dataKey="비율" fill="#f59e0b" name="지역 비율 (%)" barSize={20} cursor="pointer" />
              <Bar dataKey="업체수" fill="#6b7280" name="업체수" barSize={20} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 선택된 수도권 지역의 구/군 현황 (선택 시에만 표시) - 이 부분은 필요 없어지고 상위 컴포넌트에서 처리 */}
      {false && selectedCapitalRegion && districtData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-bold mb-2 text-gray-800">
            {getRegionTitle(selectedCapitalRegion)}
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            * 업체수 기준 정렬 ({selectedCapitalRegion} 내 비율)
          </p>
          
          <div style={{ height: `${calculateChartHeight(districtData.length)}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={districtData}
                margin={isMobile 
                  ? { top: 5, right: 10, left: 5, bottom: 10 } 
                  : { top: 5, right: 20, left: 20, bottom: 10 }
                }
                layout="vertical"
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
                  formatter={(value, name) => [name === '비율' ? `${value}%` : value.toLocaleString(), name]}
                />
                <Legend wrapperStyle={isMobile ? { fontSize: '10px' } : {}} />
                <Bar dataKey="비율" fill="#8b5cf6" name="지역 비율 (%)" barSize={20} />
                <Bar dataKey="업체수" fill="#64748b" name="업체수" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionChart; 