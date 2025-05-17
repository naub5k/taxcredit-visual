/**
 * API 테스트 스크립트
 * 
 * 사용법:
 * 1. 노드 환경 실행: `node scripts/api-test.js`
 * 2. 특정 지역 테스트: `node scripts/api-test.js 서울특별시 강남구`
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 테스트할 API 엔드포인트 설정
const API_ENDPOINTS = {
  prod: 'https://taxcredit-api-func-v2.azurewebsites.net/api/getSampleList',
  local: 'http://localhost:7071/api/getSampleList'
};

// 스냅샷 저장 디렉토리 설정
const SNAPSHOT_DIR = path.join(__dirname, '../api-test-responses');

// 현재 날짜 형식 가져오기 (YYYYMMDD)
const getFormattedDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

// 디렉토리가 없으면 생성
if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  console.log(`📁 스냅샷 디렉토리 생성됨: ${SNAPSHOT_DIR}`);
}

/**
 * API 요청 함수
 * @param {string} url - 요청할 URL
 * @returns {Promise<Object>} - 응답 데이터
 */
function fetchData(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    console.log(`🔍 API 요청 중: ${url}`);
    
    const request = client.get(url, (response) => {
      let data = '';
      
      // 응답 헤더 표시
      console.log(`📋 응답 상태: ${response.statusCode} ${response.statusMessage}`);
      console.log(`📋 컨텐츠 타입: ${response.headers['content-type']}`);
      
      // 청크 데이터 수집
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      // 응답 완료
      response.on('end', () => {
        try {
          if (response.statusCode >= 400) {
            reject(new Error(`API 요청 실패: ${response.statusCode} ${response.statusMessage}`));
            return;
          }
          
          // 결과가 JSON인지 확인
          const result = data.trim().startsWith('{') || data.trim().startsWith('[') 
            ? JSON.parse(data) 
            : { raw: data };
          
          resolve(result);
        } catch (error) {
          reject(new Error(`응답 파싱 오류: ${error.message}`));
        }
      });
    });
    
    // 요청 오류 처리
    request.on('error', (error) => {
      reject(new Error(`요청 중 오류 발생: ${error.message}`));
    });
    
    // 타임아웃 설정 (10초)
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('요청 타임아웃: 10초 초과'));
    });
  });
}

/**
 * 응답 스냅샷 저장 함수
 * @param {Object} data - 저장할 데이터
 * @param {string} endpointName - 엔드포인트 이름 (prod/local)
 * @param {string} sido - 시도 필터
 * @param {string} gugun - 구군 필터
 */
function saveSnapshot(data, endpointName, sido, gugun) {
  const date = getFormattedDate();
  const filePrefix = sido && gugun 
    ? `${date}_${endpointName}_${sido}_${gugun}` 
    : sido 
      ? `${date}_${endpointName}_${sido}` 
      : `${date}_${endpointName}`;
      
  const filename = `${filePrefix}.json`;
  const filePath = path.join(SNAPSHOT_DIR, filename);
  
  // 데이터에 메타데이터 추가
  const snapshotData = {
    metadata: {
      date: new Date().toISOString(),
      endpoint: endpointName,
      filter: { sido, gugun },
      recordCount: Array.isArray(data) ? data.length : 'unknown'
    },
    data
  };
  
  // 파일에 저장
  fs.writeFileSync(filePath, JSON.stringify(snapshotData, null, 2));
  console.log(`💾 스냅샷 저장됨: ${filePath}`);
  
  // 체크섬 파일 생성 (간단한 레코드 카운트)
  const checksumData = {
    timestamp: new Date().toISOString(),
    recordCount: Array.isArray(data) ? data.length : 'unknown',
    dataStructure: Array.isArray(data) && data.length > 0 
      ? Object.keys(data[0]).sort() 
      : []
  };
  
  const checksumPath = filePath.replace('.json', '.checksum.json');
  fs.writeFileSync(checksumPath, JSON.stringify(checksumData, null, 2));
}

/**
 * API 테스트 실행 함수
 * @param {string} sido - 시도 필터
 * @param {string} gugun - 구군 필터
 */
async function runApiTest(sido = '서울특별시', gugun = '강남구') {
  console.log('🚀 API 테스트 시작');
  console.log(`🔍 필터: sido=${sido}, gugun=${gugun}`);
  
  // 필터링된 URL 생성
  const createFilteredUrl = (baseUrl) => {
    const url = new URL(baseUrl);
    if (sido) url.searchParams.append('sido', sido);
    if (gugun) url.searchParams.append('gugun', gugun);
    return url.toString();
  };
  
  // 프로덕션 API 테스트
  try {
    const prodUrl = createFilteredUrl(API_ENDPOINTS.prod);
    console.log('\n🌎 프로덕션 API 테스트:');
    const prodData = await fetchData(prodUrl);
    
    // 데이터 요약 출력
    console.log(`✅ 성공! ${Array.isArray(prodData) ? prodData.length : 0}개 레코드 수신됨`);
    if (Array.isArray(prodData) && prodData.length > 0) {
      console.log('📊 첫 번째 레코드 샘플:');
      console.log(JSON.stringify(prodData[0], null, 2).substring(0, 500) + '...');
    }
    
    // 스냅샷 저장
    saveSnapshot(prodData, 'prod', sido, gugun);
  } catch (error) {
    console.error(`❌ 프로덕션 API 오류: ${error.message}`);
  }
  
  // 로컬 API 테스트 (프로세스를 계속하기 위해 오류를 잡습니다)
  try {
    console.log('\n🏠 로컬 API 테스트:');
    const localUrl = createFilteredUrl(API_ENDPOINTS.local);
    const localData = await fetchData(localUrl);
    
    // 데이터 요약 출력
    console.log(`✅ 성공! ${Array.isArray(localData) ? localData.length : 0}개 레코드 수신됨`);
    if (Array.isArray(localData) && localData.length > 0) {
      console.log('📊 첫 번째 레코드 샘플:');
      console.log(JSON.stringify(localData[0], null, 2).substring(0, 500) + '...');
    }
    
    // 스냅샷 저장
    saveSnapshot(localData, 'local', sido, gugun);
  } catch (error) {
    console.error(`❌ 로컬 API 오류: ${error.message}`);
    console.log('💡 힌트: 로컬 API가 필요하면 다음 명령을 실행하세요:');
    console.log('   cd taxcredit_mobileapp/api-func && func start');
  }
  
  console.log('\n✅ API 테스트 완료');
}

// 명령행 인수 가져오기
const args = process.argv.slice(2);
const [sido, gugun] = args;

// 테스트 실행
runApiTest(sido, gugun).catch(err => {
  console.error('🚫 테스트 실행 중 오류 발생:', err);
  process.exit(1);
}); 