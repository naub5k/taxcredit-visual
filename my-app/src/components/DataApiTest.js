import React, { useState } from 'react';

/**
 * 데이터 API 테스트 컴포넌트
 * Static Web Apps 데이터베이스 연결(data-api)과 기존 API 함수를 비교 테스트합니다.
 */
function DataApiTest() {
  // API 선택 상태 (0: InsuCompany, 1: Sample, 2: 기존 함수)
  const [apiMode, setApiMode] = useState(0);
  // 데이터 및 UI 상태
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeTaken, setTimeTaken] = useState(0);

  // API 전환 핸들러
  const toggleApi = () => {
    setApiMode((prev) => (prev + 1) % 3);
  };

  // 현재 호스트 가져오기
  const getBaseUrl = () => {
    return window.location.origin;
  };

  // 데이터 가져오기 함수
  const fetchData = async () => {
    setLoading(true);
    setError('');
    setData([]);
    
    // API 엔드포인트 설정
    let endpoint;
    if (apiMode === 0) {
      endpoint = `${getBaseUrl()}/data-api/rest/InsuCompany`; // InsuCompany 엔티티 사용
    } else if (apiMode === 1) {
      endpoint = `${getBaseUrl()}/data-api/rest/Sample`; // Sample 엔티티 사용
    } else {
      endpoint = `${getBaseUrl()}/api/getSampleList?sido=서울특별시&gugun=강남구`; // 기존 Function API
    }

    console.log(`API 요청: ${endpoint}`);
    const start = Date.now();

    try {
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`응답 오류: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      // data-api 응답은 'value' 속성에 배열로 옴
      const items = apiMode < 2 ? (result.value || []) : result;
      
      setData(items);
      setTimeTaken(Date.now() - start);
    } catch (err) {
      console.error('API 요청 오류:', err);
      setError(err.message || '데이터를 가져오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 현재 API 모드명 반환
  const getApiModeName = () => {
    switch(apiMode) {
      case 0: return 'Data API (InsuCompany)';
      case 1: return 'Data API (Sample)';
      case 2: return 'Function API';
      default: return 'Unknown';
    }
  };

  // 현재 API 엔드포인트 경로 반환
  const getApiEndpoint = () => {
    switch(apiMode) {
      case 0: return '/data-api/rest/InsuCompany';
      case 1: return '/data-api/rest/Sample';
      case 2: return '/api/getSampleList?sido=서울특별시&gugun=강남구';
      default: return '';
    }
  };

  return (
    <div className="p-4 space-y-4 border rounded shadow-sm">
      <h2 className="text-lg font-bold">🔍 Data API 테스트</h2>
      
      <div className="flex space-x-2">
        <button 
          onClick={toggleApi} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
        >
          API 전환 (현재: {getApiModeName()})
        </button>
        <button 
          onClick={fetchData} 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
          disabled={loading}
        >
          {loading ? '로딩 중...' : '데이터 가져오기'}
        </button>
      </div>

      {/* 상태 표시 */}
      <div className="status">
        {loading && <p className="text-gray-600">⏳ 로딩 중...</p>}
        {timeTaken > 0 && <p className="text-blue-600">⏱ 응답 시간: {timeTaken}ms</p>}
        {error && <p className="text-red-600">❌ 오류: {error}</p>}
      </div>

      {/* 데이터 결과 표시 */}
      {data && Array.isArray(data) && data.length > 0 && (
        <div className="results">
          <h3 className="font-medium">검색 결과 ({data.length}개)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 mt-2">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">번호</th>
                  <th className="px-4 py-2 border">사업장명</th>
                  <th className="px-4 py-2 border">지역</th>
                  <th className="px-4 py-2 border">2024</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-2 border text-center">{idx + 1}</td>
                    <td className="px-4 py-2 border">{item.사업장명}</td>
                    <td className="px-4 py-2 border">{item.시도} {item.구군}</td>
                    <td className="px-4 py-2 border text-right">{item['2024'] || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length > 10 && (
            <p className="text-sm text-gray-500 mt-2">* 전체 {data.length}개 중 10개만 표시됩니다.</p>
          )}
        </div>
      )}

      {/* API 정보 */}
      <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
        <h4 className="font-medium">API 정보</h4>
        <p>
          현재 API: <span className="font-mono">{getApiEndpoint()}</span><br />
          호스트: <span className="font-mono">{getBaseUrl()}</span><br />
          이 컴포넌트는 Azure Static Web Apps 데이터베이스 연결과 기존 API Function을 비교 테스트합니다.
        </p>
      </div>
    </div>
  );
}

export default DataApiTest; 