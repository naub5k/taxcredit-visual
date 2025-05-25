const axios = require('axios');

// Azure 함수 URL
const FUNCTION_URL = 'https://taxcredit-ai-func-v2.azurewebsites.net/api/aimodelquery';

// 각 모델 테스트 함수
async function testModel(model, input) {
  console.log(`\n=== ${model.toUpperCase()} 모델 테스트 ===`);
  console.log(`질문: "${input}"`);
  
  try {
    console.log('응답을 기다리는 중...');
    const startTime = Date.now();
    
    const response = await axios.post(FUNCTION_URL, { model, input });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // 초 단위로 변환
    
    console.log(`✅ 성공! (${duration.toFixed(2)}초 소요)`);
    console.log('응답:');
    console.log(response.data.result);
    
    return true;
  } catch (error) {
    console.error('❌ 오류 발생:');
    if (error.response) {
      console.error(`상태 코드: ${error.response.status}`);
      console.error('응답 데이터:', error.response.data);
    } else {
      console.error(error.message);
    }
    
    return false;
  }
}

// 메인 함수
async function main() {
  console.log('===================================');
  console.log('    세무 크레딧 AI 함수 간단 테스트');
  console.log('===================================');
  
  // 1. GPT 모델 테스트
  await testModel('gpt', '세무사무소의 주요 업무는 무엇인가요?');
  
  // 2. Gemini 모델 테스트
  await testModel('gemini', '개인사업자가 알아야 할 세금 종류를 설명해주세요.');
  
  // 3. Search 모델 테스트
  await testModel('search', '서울시 강남구 세무사무소');
  
  console.log('\n테스트 완료!');
}

// 실행
main(); 