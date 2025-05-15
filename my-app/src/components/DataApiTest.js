import React, { useState, useEffect } from 'react';

/**
 * API 테스트 컴포넌트
 * Azure Function API 호출을 테스트합니다.
 * (DAB 기능은 제거됨)
 */
function DataApiTest() {
  // 데이터 및 UI 상태
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeTaken, setTimeTaken] = useState(0);
  const [directUrl, setDirectUrl] = useState('');
  const [rawResponse, setRawResponse] = useState('');
  const [filterValue, setFilterValue] = useState('서울특별시');
  const [requestInfo, setRequestInfo] = useState({});

  // 현재 호스트 가져오기
  const getBaseUrl = () => {
    return window.location.origin;
  };

  // 개발 환경인지 확인
  const isDevelopment = () => {
    return process.env.NODE_ENV === 'development';
  };

  // 모의 데이터 생성 (개발 환경에서만 사용)
  const getMockData = (filter) => {
    console.log('개발 환경에서 모의 데이터 사용 중...');
    
    // 기본 샘플 데이터
    const sampleData = [
      { 
        사업장명: '삼성전자', 
        시도: '서울특별시', 
        구군: '강남구', 
        '2020': 120, 
        '2021': 150, 
        '2022': 180, 
        '2023': 200, 
        '2024': 220 
      },
      { 
        사업장명: 'LG전자', 
        시도: '서울특별시', 
        구군: '영등포구', 
        '2020': 80, 
        '2021': 90, 
        '2022': 110, 
        '2023': 130, 
        '2024': 150 
      },
      { 
        사업장명: '현대자동차', 
        시도: '서울특별시', 
        구군: '서초구', 
        '2020': 200, 
        '2021': 220, 
        '2022': 240, 
        '2023': 260, 
        '2024': 280 
      },
      { 
        사업장명: '카카오', 
        시도: '경기도', 
        구군: '성남시', 
        '2020': 70, 
        '2021': 100, 
        '2022': 130, 
        '2023': 160, 
        '2024': 200 
      },
      { 
        사업장명: '네이버', 
        시도: '경기도', 
        구군: '성남시', 
        '2020': 150, 
        '2021': 180, 
        '2022': 210, 
        '2023': 240, 
        '2024': 270 
      }
    ];
    
    // 필터가 있으면 필터링
    if (filter) {
      return sampleData.filter(item => item.시도 === filter);
    }
    
    return sampleData;
  };

  // 초기 로드 시 API URL 설정
  useEffect(() => {
    setDirectUrl(`${getBaseUrl()}/api/getSampleList`);
  }, []);

  // 데이터 가져오기 함수
  const fetchData = async () => {
    setLoading(true);
    setError('');
    setData([]);
    setRawResponse('');
    setRequestInfo({});
    
    // Azure Functions API 엔드포인트 설정
    let endpoint;
    
    // 직접 URL 입력 시
    if (directUrl && directUrl.trim() !== '') {
      endpoint = directUrl;
      
      // 필터 파라미터가 없으면 자동 추가
      if (!endpoint.includes('sido=') && filterValue) {
        const separator = endpoint.includes('?') ? '&' : '?';
        endpoint = `${endpoint}${separator}sido=${encodeURIComponent(filterValue)}&gugun=강남구`;
      }
    } else {
      // 기본 Function API 사용
      endpoint = `${getBaseUrl()}/api/getSampleList?sido=${encodeURIComponent(filterValue)}&gugun=강남구`;
    }

    // 디버깅 정보 기록
    const reqInfo = {
      url: endpoint,
      timestamp: new Date().toISOString(),
      apiMode: 'Azure Functions API',
      explanation: "Azure Functions API 호출"
    };
    setRequestInfo(reqInfo);
    
    console.log(`API 요청: ${endpoint}`);
    console.log(`Azure Functions API 호출 중...`);
    
    const start = Date.now();

    try {
      // 개발 환경에서 모의 데이터 사용 (옵션)
      if (isDevelopment()) {
        console.log('개발 환경에서 모의 데이터 사용...');
        
        // 모의 응답 생성
        const mockData = getMockData(filterValue);
        
        // 모의 데이터 기록 및 표시
        setRawResponse(JSON.stringify(mockData, null, 2));
        setData(mockData);
        setTimeTaken(Date.now() - start);
        
        // 요청 정보 업데이트
        setRequestInfo(prev => ({
          ...prev,
          status: 200,
          statusText: 'OK (개발 모의 데이터)',
          headers: {
            'content-type': 'application/json',
            'x-mock-data': 'true'
          }
        }));
        
        // 개발 환경에서 모의 데이터를 사용하는 경우 여기서 함수 종료
        // 실제 API 호출을 하려면 아래 주석을 해제
        // return;
      }
      
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
      
      console.log(`API 요청 전송: ${endpoint}`);
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
        // 오류 메시지 추출 시도
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
      if (contentType && contentType.includes('text/html')) {
        console.warn('HTML 응답 감지: 예상된 JSON 응답 대신 HTML이 반환되었습니다.');
        console.log('응답 내용 확인:', responseText.substring(0, 200));
        
        // 개발 환경에서는 모의 데이터로 진행 (옵션)
        if (isDevelopment()) {
          console.warn('개발 환경 감지: HTML 응답 대신 모의 데이터를 사용합니다.');
          
          // 모의 응답 생성
          const mockData = getMockData(filterValue);
          
          // 모의 데이터 기록 및 표시
          setRawResponse(JSON.stringify(mockData, null, 2) + "\n\n// 주의: 개발 환경에서 HTML 응답 대신 모의 데이터를 사용 중입니다.");
          setData(mockData);
          setTimeTaken(Date.now() - start);
          
          // 요청 정보에 HTML 응답 감지 정보 포함
          setRequestInfo(prev => ({
            ...prev,
            mockData: true,
            htmlResponseDetected: true,
            originalResponse: "HTML_RESPONSE",
            status: 200,
            statusText: 'OK (개발 모의 데이터 - HTML 응답 대체)'
          }));
          
          return; // 모의 데이터로 처리 완료
        }
        
        // 프로덕션 환경에서는 오류 처리
        throw new Error('HTML 응답을 받았습니다. 이는 일반적으로 라우팅 문제 또는 인증 오류를 나타냅니다.');
      }
      
      try {
        // 텍스트를 JSON으로 파싱 시도
        const result = JSON.parse(responseText);
        
        // 빈 응답 체크
        if (!result) {
          throw new Error('빈 응답을 받았습니다.');
        }
        
        // 응답 구조 처리
        const items = Array.isArray(result) ? result : 
                      (result.value ? result.value : []);
        
        // 빈 배열 체크
        if (items.length === 0) {
          console.log('결과가 없습니다. 응답:', result);
          // 빈 결과는 오류가 아니므로 throw 하지 않음
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
  const getApiEndpoint = () => {
    return `${getBaseUrl()}/api/getSampleList?sido=${filterValue}&gugun=강남구`;
  };

  return (
    <div className="p-4 space-y-4 border rounded shadow-sm">
      <h2 className="text-lg font-bold">🔍 API 테스트</h2>
      
      <div className="flex space-x-2">
        <button 
          onClick={fetchData} 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
          disabled={loading}
        >
          {loading ? '로딩 중...' : '데이터 가져오기'}
        </button>
      </div>

      {/* 필터 설정 */}
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
          API 엔드포인트: <span className="font-mono">{getApiEndpoint()}</span><br />
          호스트: <span className="font-mono">{getBaseUrl()}</span><br />
          Azure Function API를 사용하여 데이터를 가져옵니다.
        </p>
        
        <div className="mt-2 p-2 bg-yellow-50 rounded-md border border-yellow-200">
          <h5 className="text-yellow-800 font-medium">⚠️ 문제 해결 팁</h5>
          <ul className="list-disc list-inside text-xs mt-1 text-yellow-700">
            <li><strong>404 오류</strong>: 엔드포인트 URL이 올바른지 확인하세요</li>
            <li><strong>HTML 응답</strong>: Function App CORS 설정과 라우팅 확인 필요</li>
            <li><strong>빈 결과</strong>: 필터링 조건 확인, 유효한 값을 입력했는지 확인하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DataApiTest; 