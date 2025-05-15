import React, { useState, useEffect } from 'react';
import { fetchSamples, fetchSamplesGraphQL } from '../utils/dataApiService';

/**
 * Static Web Apps 데이터베이스 연결 샘플 컴포넌트
 */
const DataApiSample = () => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useGraphQL, setUseGraphQL] = useState(false);
  const [sido, setSido] = useState('서울특별시');
  const [gugun, setGugun] = useState('');

  // 데이터 로드 함수
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchFunction = useGraphQL ? fetchSamplesGraphQL : fetchSamples;
      const data = await fetchFunction(sido || null, gugun || null);
      setSamples(data);
    } catch (err) {
      console.error('데이터 로드 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, [useGraphQL]); // GraphQL/REST 전환 시에만 다시 로드

  // 필터 적용 핸들러
  const handleApplyFilter = () => {
    loadData();
  };

  // API 유형 전환 핸들러
  const toggleApiType = () => {
    setUseGraphQL(prev => !prev);
  };

  return (
    <div className="data-api-sample">
      <h2>데이터베이스 연결 샘플</h2>
      <p>현재 API 타입: {useGraphQL ? 'GraphQL' : 'REST'}</p>
      
      <div className="controls">
        <button onClick={toggleApiType}>
          {useGraphQL ? 'REST로 전환' : 'GraphQL로 전환'}
        </button>
        
        <div className="filters">
          <div className="filter-group">
            <label>시도:</label>
            <input 
              type="text" 
              value={sido} 
              onChange={(e) => setSido(e.target.value)}
              placeholder="예: 서울특별시"
            />
          </div>
          
          <div className="filter-group">
            <label>구군:</label>
            <input 
              type="text" 
              value={gugun} 
              onChange={(e) => setGugun(e.target.value)}
              placeholder="예: 강남구"
            />
          </div>
          
          <button onClick={handleApplyFilter}>필터 적용</button>
        </div>
      </div>
      
      {loading && <p>데이터를 불러오는 중...</p>}
      {error && <p className="error">오류 발생: {error}</p>}
      
      {!loading && !error && (
        <div className="results">
          <h3>조회 결과 ({samples.length})</h3>
          
          {samples.length === 0 ? (
            <p>검색 결과가 없습니다.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>사업장명</th>
                  <th>시도</th>
                  <th>구군</th>
                  <th>2020</th>
                  <th>2021</th>
                  <th>2022</th>
                  <th>2023</th>
                  <th>2024</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((item, index) => (
                  <tr key={index}>
                    <td>{item.사업장명}</td>
                    <td>{item.시도}</td>
                    <td>{item.구군}</td>
                    <td>{item['2020']}</td>
                    <td>{item['2021']}</td>
                    <td>{item['2022']}</td>
                    <td>{item['2023']}</td>
                    <td>{item['2024']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      <div className="api-info">
        <h4>API 사용 방법</h4>
        <p>
          이 컴포넌트는 Azure Static Web Apps 데이터베이스 연결을 활용하여 
          데이터베이스에서 직접 데이터를 불러옵니다. REST API와 GraphQL 
          두 가지 방식을 모두 지원합니다.
        </p>
      </div>
    </div>
  );
};

export default DataApiSample; 