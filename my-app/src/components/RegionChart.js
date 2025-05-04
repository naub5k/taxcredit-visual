import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { normalizedRegionRatio, regionGroups } from '../data/employmentRegionData';

/**
 * 지역별 업체 수 시각화 차트 컴포넌트
 * - 기타지역 시도별 비율을 막대그래프로 표시
 * - 서울특별시, 경기도는 별도 그룹으로 표시하지 않음
 * - 모바일 환경에 최적화된 반응형 그래프
 */
const RegionChart = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  // 모바일 환경 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // 데이터 변환 - 시각화에 적합한 형태로
  const chartData = normalizedRegionRatio.map(region => ({
    name: region.시도,
    비율: region.비율,
    업체수: region.업체수
  }));

  // 모바일에서는 데이터를 일부 필터링하여 주요 지역만 표시 (가독성 향상)
  const displayData = isMobile
    ? chartData.filter(item => item.비율 > 2) // 비율이 2% 이상인 주요 지역만 표시 (더 많은 지역 표시)
    : chartData;

  return (
    <div className="region-chart bg-white rounded-lg shadow-md p-4 mb-6">
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
      
      <div className="mt-4">
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