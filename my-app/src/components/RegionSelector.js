import React, { useState, useEffect, useRef } from 'react';
import { employmentRegionData } from '../data/employmentRegionData';

/**
 * 시도/구군 선택 컴포넌트
 * - 드롭다운 방식으로 시도 선택 시 해당 구군 목록을 로드
 * - 선택된 지역의 업체 수를 표시
 * - 초기 로딩 시 기본 데이터를 렌더링
 * - 모바일 최적화 UI 적용
 */
const RegionSelector = ({ onRegionChange }) => {
  // 상태 관리
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districtList, setDistrictList] = useState([]);
  const [selectedCompanyCount, setSelectedCompanyCount] = useState(0);
  const [stateCompanyCount, setStateCompanyCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // 이전 상태를 추적하기 위한 useRef 추가
  const prevStateRef = useRef({ 
    selectedDistrict: null,
    selectedState: null,
    selectedCompanyCount: 0,
    stateCompanyCount: 0
  });

  // 모바일 환경 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // 시도 선택 시 구군 목록 업데이트
  useEffect(() => {
    if (selectedState) {
      const stateData = employmentRegionData.find(item => item.시도 === selectedState);
      if (stateData) {
        // 구군 목록 업데이트 (업체수 기준 내림차순 정렬)
        setDistrictList(stateData.구군목록.sort((a, b) => b.업체수 - a.업체수));
        // 시도 전체 업체수 설정
        setStateCompanyCount(stateData.업체수);
        // 선택된 구군 초기화
        setSelectedDistrict('');
        setSelectedCompanyCount(0);
      }
    } else {
      setDistrictList([]);
      setStateCompanyCount(0);
      setSelectedDistrict('');
      setSelectedCompanyCount(0);
    }
  }, [selectedState]);

  // 구군 선택 시 업체 수 업데이트
  useEffect(() => {
    if (selectedDistrict && districtList.length > 0) {
      const districtData = districtList.find(item => item.구군 === selectedDistrict);
      if (districtData) {
        setSelectedCompanyCount(districtData.업체수);
        
        // 상위 컴포넌트에 선택된 지역 정보 전달 (있는 경우)
        if (onRegionChange) {
          // 이전 값과 현재 값을 비교하여 변경이 있을 때만 호출
          const prevState = prevStateRef.current;
          const isChanged = 
            prevState.selectedState !== selectedState ||
            prevState.selectedDistrict !== selectedDistrict ||
            prevState.selectedCompanyCount !== districtData.업체수 ||
            prevState.stateCompanyCount !== stateCompanyCount;
            
          if (isChanged) {
            onRegionChange({
              시도: selectedState,
              구군: selectedDistrict,
              업체수: districtData.업체수,
              시도업체수: stateCompanyCount
            });
            
            // 현재 상태를 이전 상태로 저장
            prevStateRef.current = {
              selectedState,
              selectedDistrict,
              selectedCompanyCount: districtData.업체수,
              stateCompanyCount
            };
          }
        }
      }
    } else {
      setSelectedCompanyCount(0);
    }
  }, [selectedDistrict, districtList, stateCompanyCount, selectedState, onRegionChange]);

  // 시도 선택 핸들러
  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
  };

  // 구군 선택 핸들러
  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
  };

  // 시도 업체 비율 계산 (선택된 구군 / 시도 전체)
  const calculateRatio = () => {
    if (selectedCompanyCount > 0 && stateCompanyCount > 0) {
      return ((selectedCompanyCount / stateCompanyCount) * 100).toFixed(2);
    }
    return 0;
  };

  return (
    <div className="region-selector bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-3 text-gray-800">지역별 상세 조회</h2>
      
      {/* 시도/구군 선택 영역 */}
      <div className={`${isMobile ? 'flex flex-col space-y-2' : 'grid grid-cols-2 gap-4'}`}>
        {/* 시도 선택 */}
        <div className="mb-3">
          <label htmlFor="state-select" className="block text-gray-700 font-medium mb-1 text-sm">
            시/도 선택
          </label>
          <select
            id="state-select"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={selectedState}
            onChange={handleStateChange}
          >
            <option value="">선택하세요</option>
            {employmentRegionData.map(state => (
              <option key={state.시도} value={state.시도}>
                {state.시도} ({state.업체수.toLocaleString()}개)
              </option>
            ))}
          </select>
        </div>

        {/* 구군 선택 (시도 선택 시에만 표시) */}
        {selectedState && (
          <div className="mb-3">
            <label htmlFor="district-select" className="block text-gray-700 font-medium mb-1 text-sm">
              구/군 선택
            </label>
            <select
              id="district-select"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={selectedDistrict}
              onChange={handleDistrictChange}
            >
              <option value="">전체</option>
              {districtList.map(district => (
                <option key={district.구군} value={district.구군}>
                  {district.구군} ({district.업체수.toLocaleString()}개)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 선택된 지역 정보 표시 */}
      {selectedState && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">선택된 지역 정보</h3>
          <div className={`${isMobile ? 'grid grid-cols-2 gap-3 text-sm' : 'grid grid-cols-2 gap-4'}`}>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-gray-600 text-sm">시/도:</p>
              <p className="font-medium text-lg">{selectedState}</p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-gray-600 text-sm">전체 업체 수:</p>
              <p className="font-medium text-lg text-blue-600">{stateCompanyCount.toLocaleString()}개</p>
            </div>
            {selectedDistrict && (
              <>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-gray-600 text-sm">선택된 구/군:</p>
                  <p className="font-medium text-lg">{selectedDistrict}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-gray-600 text-sm">해당 구/군 업체 수:</p>
                  <p className="font-medium text-lg text-green-600">{selectedCompanyCount.toLocaleString()}개</p>
                </div>
                <div className={`${isMobile ? "col-span-2" : "col-span-2"} bg-white p-3 rounded-md shadow-sm`}>
                  <p className="text-gray-600 text-sm">시/도 내 비율:</p>
                  <p className="font-medium text-lg text-purple-600">{calculateRatio()}%</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 비주얼 인디케이터 */}
      {selectedDistrict && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${calculateRatio()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>0%</span>
            <span>{selectedDistrict}의 {selectedState} 내 비율: {calculateRatio()}%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionSelector;