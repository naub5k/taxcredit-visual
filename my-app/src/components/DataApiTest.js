import React, { useState, useEffect } from 'react';

/**
 * 데이터 API 테스트 컴포넌트
 * Static Web Apps 데이터베이스 연결(data-api)과 기존 API 함수를 비교 테스트합니다.
 */
function DataApiTest() {
  // API 선택 상태 (0: InsuCompany, 1: Sample, 2: 기존 함수, 3: 직접 API 테스트)
  const [apiMode, setApiMode] = useState(0);
  // 데이터 및 UI 상태
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeTaken, setTimeTaken] = useState(0);
  const [directUrl, setDirectUrl] = useState('');
  const [rawResponse, setRawResponse] = useState('');

  // API 전환 핸들러
  const toggleApi = () => {
    setApiMode((prev) => (prev + 1) % 4);
  };

  // 현재 호스트 가져오기
  const getBaseUrl = () => {
    return window.location.origin;
  };

  // 초기 로드 시 직접 URL 설정
  useEffect(() => {
    setDirectUrl(`${getBaseUrl()}/data-api/rest/InsuCompany`);
  }, []);

  // 데이터 가져오기 함수
  const fetchData = async () => {
    setLoading(true);
    setError('');
    setData([]);
    setRawResponse('');
    
    // API 엔드포인트 설정
    let endpoint;
    if (apiMode === 0) {
      endpoint = `${getBaseUrl()}/data-api/rest/InsuCompany`; // InsuCompany 엔티티 사용
    } else if (apiMode === 1) {
      endpoint = `${getBaseUrl()}/data-api/rest/Sample`; // Sample 엔티티 사용
    } else if (apiMode === 2) {
      endpoint = `${getBaseUrl()}/api/getSampleList?sido=서울특별시&gugun=강남구`; // 기존 Function API
    } else {
      endpoint = directUrl; // 사용자가 입력한 직접 URL 사용
    }

    console.log(`API 요청: ${endpoint}`);
    const start = Date.now();

    try {
      const response = await fetch(endpoint);
      
      // 응답 원시 텍스트 먼저 보존
      const responseText = await response.text();
      setRawResponse(responseText);
      
      // 상태 코드가 성공이 아니면 오류 표시
      if (!response.ok) {
        throw new Error(`응답 오류: ${response.status} ${response.statusText}`);
      }
      
      try {
        // 텍스트를 JSON으로 파싱 시도
        const result = JSON.parse(responseText);
        const items = (apiMode < 2 || apiMode === 3) ? (result.value || []) : result;
        
        setData(items);
      } catch (jsonError) {
        throw new Error(`JSON 파싱 오류: ${jsonError.message}`);
      }
      
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
      case 3: return '직접 URL 테스트';
      default: return 'Unknown';
    }
  };

  // 현재 API 엔드포인트 경로 반환
  const getApiEndpoint = () => {
    switch(apiMode) {
      case 0: return '/data-api/rest/InsuCompany';
      case 1: return '/data-api/rest/Sample';
      case 2: return '/api/getSampleList?sido=서울특별시&gugun=강남구';
      case 3: return directUrl;
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

      {apiMode === 3 && (
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">직접 URL 입력:</label>
          <div className="flex">
            <input
              type="text"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              className="flex-1 rounded-l border-gray-300 shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/api/endpoint"
            />
            <button
              onClick={fetchData}
              className="bg-blue-500 text-white px-4 py-2 rounded-r border-l-0"
            >
              테스트
            </button>
          </div>
        </div>
      )}

      {/* 상태 표시 */}
      <div className="status">
        {loading && <p className="text-gray-600">⏳ 로딩 중...</p>}
        {timeTaken > 0 && <p className="text-blue-600">⏱ 응답 시간: {timeTaken}ms</p>}
        {error && <p className="text-red-600">❌ 오류: {error}</p>}
      </div>

      {/* 원시 응답 데이터 */}
      {rawResponse && (
        <div className="mt-4">
          <h3 className="font-medium">원시 응답:</h3>
          <pre className="bg-gray-100 p-3 rounded-md overflow-auto max-h-40 text-xs mt-2">
            {rawResponse}
          </pre>
        </div>
      )}

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
                    <td className="px-4 py-2 border">{item.사업장명 || '-'}</td>
                    <td className="px-4 py-2 border">{item.시도 || '-'} {item.구군 || '-'}</td>
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
        
        <div className="mt-2 p-2 bg-yellow-50 rounded-md border border-yellow-200">
          <h5 className="text-yellow-800 font-medium">⚠️ 문제 해결 팁</h5>
          <ul className="list-disc list-inside text-xs mt-1 text-yellow-700">
            <li>400 오류: Azure Portal에서 데이터베이스 연결 설정 확인</li>
            <li>HTML 응답: Function App이 올바르게 배포되었는지 확인</li>
            <li>CORS 오류: Static Web App의 CORS 설정 확인</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DataApiTest; 