const axios = require('axios');

// 기본 포트는 7071이지만 변경 가능하도록 설정
const PORT = process.env.FUNCTIONS_PORT || 7071;
const HOST = process.env.FUNCTIONS_HOST || 'localhost';

async function testFunction(model, input) {
  try {
    const url = `http://${HOST}:${PORT}/api/aimodelquery`;
    console.log(`테스트 실행: 모델=${model}, 입력="${input}", URL=${url}`);
    
    const response = await axios.post(url, {
      model,
      input
    });
    
    console.log('응답 상태:', response.status);
    console.log('응답 결과:', response.data);
  } catch (error) {
    console.error('오류 발생:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
    }
  }
}

// 테스트 실행
async function runTests() {
  // GPT 모델 테스트
  await testFunction('gpt', '세무사무소의 주요 업무는 무엇인가요?');
  
  // Gemini 모델 테스트 (API 키가 설정된 경우)
  await testFunction('gemini', '세무사무소의 주요 업무는 무엇인가요?');
  
  // 검색 모델 테스트 (SerpAPI 키가 설정된 경우)
  await testFunction('search', '서울시 강남구 세무사무소');
}

// Azure 배포된 함수 테스트
async function testDeployedFunction() {
  try {
    console.log('Azure 배포 함수 테스트 중...');
    const url = 'https://taxcredit-ai-func-v2.azurewebsites.net/api/aimodelquery';
    
    const response = await axios.post(url, {
      model: 'gpt',
      input: '세무사무소의 주요 업무는 무엇인가요?'
    });
    
    console.log('Azure 응답 상태:', response.status);
    console.log('Azure 응답 결과:', response.data);
  } catch (error) {
    console.error('Azure 함수 호출 오류:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
    }
  }
}

// 명령행 인수에 따라 로컬 또는 배포 테스트 선택
const args = process.argv.slice(2);
if (args.includes('--azure') || args.includes('-a')) {
  testDeployedFunction();
} else {
  console.log(`로컬 함수 테스트 (${HOST}:${PORT})...`);
  runTests();
} 