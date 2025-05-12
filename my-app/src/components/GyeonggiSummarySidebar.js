import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 경기도 전체 요약 정보를 PC 우측에 표시하는 사이드바 컴포넌트
 * - 총 업체 수, 시/군 분포, 파트너 링크 등 포함
 * - PC 화면(min-width: 768px 이상)에서만 표시
 */
const GyeonggiSummarySidebar = ({ regionData, topCities }) => {
  if (!regionData) return null;

  return (
    <div className="hidden md:block bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-3 text-gray-800">{regionData.시도} 전체 현황</h2>
      
      {/* 총 업체 수 */}
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h3 className="font-medium text-gray-600 text-sm mb-1">총 업체 수</h3>
        <p className="text-2xl font-bold text-blue-700">
          {regionData.업체수?.toLocaleString()}개
        </p>
      </div>
      
      {/* 구/군별 현황 */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-700 mb-2 pb-2 border-b">구/군별 현황</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {topCities && topCities.map((city, index) => (
            <div 
              key={city.구군}
              className={`flex justify-between items-center p-2 rounded-md ${index < 3 ? 'bg-gray-50' : ''}`}
            >
              <Link 
                to={`/region?sido=${regionData.시도}&gugun=${city.구군}`} 
                className="font-medium text-gray-800 hover:text-blue-600"
              >
                {city.구군}
              </Link>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700">{city.업체수.toLocaleString()}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({((city.업체수 / regionData.업체수) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 파트너 전용 링크 */}
      <Link
        to={`/partner?sido=${regionData.시도}`}
        className="block bg-purple-50 rounded-lg p-3 flex justify-between items-center hover:bg-purple-100 transition-colors"
      >
        <div>
          <h3 className="font-medium text-gray-700">상세 정보 조회</h3>
          <p className="text-sm text-gray-600">전체 사업장 목록 확인</p>
        </div>
        <div className="text-purple-700 font-bold">
          파트너 전용 &gt;
        </div>
      </Link>
    </div>
  );
};

export default GyeonggiSummarySidebar; 