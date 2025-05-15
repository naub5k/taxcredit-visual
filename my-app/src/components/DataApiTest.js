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
  const [filterValue, setFilterValue] = useState('서울특별시');
  const [requestInfo, setRequestInfo] = useState({});

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
    setRequestInfo({});
    
    // API 엔드포인트 설정
    let endpoint;
    if (apiMode === 0) {
      // 인코딩 적용 - InsuCompany 정확한 OData 필터링
      const filterColumn = '시도';
      const filterOp = 'eq';
      // 필터 값에 작은따옴표를 올바르게 포함시키기 (작은따옴표는 OData에서 문자열 리터럴에 필요)
      const filterExpr = `${filterColumn} ${filterOp} '${filterValue.replace(/'/g, "''")}'`;
      const encodedFilter = encodeURIComponent(filterExpr);
      endpoint = `${getBaseUrl()}/data-api/rest/InsuCompany?$filter=${encodedFilter}`;
    } else if (apiMode === 1) {
      // Sample 엔티티 + 탑 5개만 조회
      endpoint = `${getBaseUrl()}/data-api/rest/Sample?$top=5`;
    } else if (apiMode === 2) {
      // 기존 Function API - 인코딩 적용
      endpoint = `${getBaseUrl()}/api/getSampleList?sido=${encodeURIComponent(filterValue)}&gugun=강남구`;
    } else {
      endpoint = directUrl; // 사용자가 입력한 직접 URL 사용
    }

    // 디버깅 정보 기록
    const reqInfo = {
      url: endpoint,
      timestamp: new Date().toISOString(),
      apiMode: getApiModeName()
    };
    setRequestInfo(reqInfo);
    
    console.log(`API 요청: ${endpoint}`);
    const start = Date.now();

    try {
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        },
        cache: 'no-store',
        credentials: 'omit'
      };
      
      const response = await fetch(endpoint, fetchOptions);
      
      // 응답 헤더 기록
      const headerObj = {};
      response.headers.forEach((value, key) => {
        headerObj[key] = value;
      });
      
      // 요청 정보 업데이트
      setRequestInfo(prev => ({
        ...prev,
        status: response.status,
        statusText: response.statusText,
        headers: headerObj
      }));
      
      // 응답 원시 텍스트 먼저 보존
      const responseText = await response.text();
      setRawResponse(responseText);
      
      // Content-Type 확인
      const contentType = response.headers.get('content-type') || '';
      
      // 상태 코드가 성공이 아니면 오류 표시
      if (!response.ok) {
        // DAB API 응답 형식 확인 (JSON 오류 메시지 포함 여부)
        let errorDetail = '';
        try {
          if (contentType.includes('application/json')) {
            const errorJson = JSON.parse(responseText);
            if (errorJson.error) {
              errorDetail = `: ${errorJson.error.message || errorJson.error.code || JSON.stringify(errorJson.error)}`;
            }
          }
        } catch (e) {
          // 파싱 실패 시 원시 응답 사용
          if (responseText.length < 100) {
            errorDetail = `: ${responseText}`;
          }
        }
        throw new Error(`응답 오류 (${response.status} ${response.statusText})${errorDetail}`);
      }
      
      // HTML 응답 감지
      if (contentType.includes('text/html')) {
        throw new Error('HTML 응답을 받았습니다. 이는 일반적으로 라우팅 문제 또는 인증 오류를 나타냅니다.');
      }
      
      try {
        // 텍스트를 JSON으로 파싱 시도
        const result = JSON.parse(responseText);
        
        // 빈 응답 체크
        if (!result) {
          throw new Error('빈 응답을 받았습니다.');
        }
        
        // apiMode에 따라 데이터 구조 처리
        let items;
        if (apiMode < 2) {
          // Data API 응답 형식 (value 프로퍼티 안에 배열)
          items = result.value || [];
          
          // 빈 배열 체크
          if (items.length === 0) {
            console.log('결과가 없습니다. 응답:', result);
            // 빈 결과는 오류가 아니므로 throw 하지 않음
          }
        } else if (apiMode === 2) {
          // Function API 응답 형식 (직접 배열)
          items = Array.isArray(result) ? result : [];
        } else {
          // 직접 URL 테스트 - 구조 추정
          items = result.value || (Array.isArray(result) ? result : []);
        }
        
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
    const base = getBaseUrl();
    switch(apiMode) {
      case 0: return `${base}/data-api/rest/InsuCompany?$filter=시도 eq '${filterValue}'`;
      case 1: return `${base}/data-api/rest/Sample?$top=5`;
      case 2: return `${base}/api/getSampleList?sido=${filterValue}&gugun=강남구`;
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

      {/* 필터 설정 */}
      {(apiMode === 0 || apiMode === 2) && (
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">시도 필터:</label>
          <div className="flex">
            <input
              type="text"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="flex-1 rounded-l border-gray-300 shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="서울특별시"
            />
            <button
              onClick={fetchData}
              className="bg-blue-500 text-white px-4 py-2 rounded-r border-l-0"
            >
              적용
            </button>
          </div>
        </div>
      )}

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

      {/* 요청 정보 */}
      {Object.keys(requestInfo).length > 0 && (
        <div className="mt-4">
          <details>
            <summary className="font-medium cursor-pointer">요청 정보</summary>
            <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-32 text-xs mt-2">
              <pre>{JSON.stringify(requestInfo, null, 2)}</pre>
            </div>
          </details>
        </div>
      )}

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
            <li><strong>400 오류</strong>: OData 구문 확인 - <code>$filter=컬럼명 eq '값'</code> 형식의 URL 인코딩, 특히 작은따옴표 주의</li>
            <li><strong>데이터베이스 오류</strong>: Azure Portal에서 데이터베이스 연결 설정을 확인하세요</li>
            <li><strong>HTML 응답</strong>: Function App CORS 설정과 라우팅 확인 필요</li>
            <li><strong>매핑 오류</strong>: 연도 필드는 <code>[연도]</code> 형식으로 대괄호를 포함해야 하며 <code>source.columns</code>도 확인</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DataApiTest; 