/**
 * Azure 함수 상세 테스트 스크립트
 * 오류 정보를 자세히 표시합니다.
 */

const axios = require('axios');

// 함수 URL
const FUNCTION_URL = 'https://taxcredit-ai-func-v2.azurewebsites.net/api/aimodelquery';

// 테스트 요청 옵션
const testRequests = [
  {
    name: 'GPT 모델 테스트',
    data: { model: 'gpt', input: '세무사무소의 주요 업무는 무엇인가요?' }
  },
  {
    name: 'Gemini 모델 테스트',
    data: { model: 'gemini', input: '개인사업자가 알아야 할 세금 종류를 설명해주세요.' }
  },
  {
    name: 'Search 모델 테스트',
    data: { model: 'search', input: '서울시 강남구 세무사무소' }
  }
];

// 함수 호출 테스트
async function testFunction(requestConfig) {
  console.log(`\n===== ${requestConfig.name} =====`);
  console.log(`요청 데이터: ${JSON.stringify(requestConfig.data)}`);
  
  try {
    console.log('요청 전송 중...');
    const startTime = Date.now();
    
    const response = await axios.post(FUNCTION_URL, requestConfig.data, {
      // 타임아웃 증가 (30초)
      timeout: 30000,
      // 응답 본문 전체 가져오기
      validateStatus: () => true,
      // 오류 헤더 확인
      headers: {
        'Content-Type': 'application/json',
        'x-debug': 'true'
      }
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`상태 코드: ${response.status} (${duration.toFixed(2)}초 소요)`);
    console.log(`응답 헤더: ${JSON.stringify(response.headers)}`);
    
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ 성공!');
      console.log('응답 데이터:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ 오류 발생');
      console.log('응답 본문:', JSON.stringify(response.data, null, 2));
    }
    
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error('❌ 네트워크 오류 발생:');
    
    if (error.response) {
      // 서버가 응답했지만 2xx 범위가 아닌 상태 코드
      console.error(`상태 코드: ${error.response.status}`);
      console.error('응답 헤더:', JSON.stringify(error.response.headers));
      console.error('응답 본문:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없음
      console.error('응답이 없습니다. 서버에 연결할 수 없거나 타임아웃이 발생했습니다.');
    } else {
      // 요청 설정 중 오류 발생
      console.error('오류 메시지:', error.message);
    }
    
    if (error.code) {
      console.error('오류 코드:', error.code);
    }
    
    return false;
  }
}

// 모든 테스트 실행
async function runTests() {
  console.log('==================================');
  console.log('   Azure 함수 상세 테스트 시작');
  console.log('==================================');
  
  let successCount = 0;
  
  for (const request of testRequests) {
    const success = await testFunction(request);
    if (success) successCount++;
  }
  
  console.log('\n==================================');
  console.log(`테스트 결과: ${successCount}/${testRequests.length} 성공`);
  console.log('==================================');
  
  if (successCount === 0) {
    console.log('\n💡 문제 해결 방법:');
    console.log('1. Azure Portal의 "모니터링" > "로그 스트림"에서 자세한 오류 메시지를 확인하세요.');
    console.log('2. 함수 앱을 재시작하세요.');
    console.log('3. 환경 변수(API 키)가 올바르게 설정되었는지 확인하세요.');
    console.log('4. 최신 코드가 배포되었는지 확인하세요.');
  }
}

// 실행
runTests().catch(error => {
  console.error('예기치 않은 오류 발생:', error);
}); 