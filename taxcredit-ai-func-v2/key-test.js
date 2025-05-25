/**
 * API 키 유효성 테스트 도구
 * 각 API 키가 유효한지 테스트합니다.
 */

const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// local.settings.json 파일에서 API 키 직접 로드
let localSettings = {};
try {
  const settingsPath = path.join(__dirname, 'local.settings.json');
  if (fs.existsSync(settingsPath)) {
    const settingsContent = fs.readFileSync(settingsPath, 'utf8');
    localSettings = JSON.parse(settingsContent);
    console.log('local.settings.json 파일을 성공적으로 로드했습니다.');
  } else {
    console.log('local.settings.json 파일을 찾을 수 없습니다.');
  }
} catch (error) {
  console.error('local.settings.json 파일 로드 중 오류:', error.message);
}

// 환경 변수에서 API 키 가져오기
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || localSettings.Values?.OPENAI_API_KEY;
const SERPAPI_KEY = process.env.SERPAPI_KEY || localSettings.Values?.SERPAPI_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || localSettings.Values?.GEMINI_API_KEY;

// OpenAI API 키 테스트
async function testOpenAI() {
  console.log('\n=== OpenAI API 키 테스트 ===');
  
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY가 설정되지 않았습니다.');
    return false;
  }
  
  console.log(`🔑 키 확인: ${OPENAI_API_KEY.substring(0, 5)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4)}`);
  
  try {
    console.log('OpenAI API 요청 중...');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '안녕하세요.' },
          { role: 'user', content: '간단한 테스트입니다.' }
        ],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ OpenAI API 키가 유효합니다.');
    console.log(`응답: ${response.data.choices[0].message.content}`);
    return true;
  } catch (error) {
    console.error('❌ OpenAI API 키 테스트 실패:');
    if (error.response) {
      console.error(`상태 코드: ${error.response.status}`);
      console.error(`오류 메시지: ${JSON.stringify(error.response.data)}`);
      
      if (error.response.status === 401) {
        console.error('💡 API 키가 유효하지 않습니다. 키를 확인하고 다시 시도하세요.');
      } else if (error.response.status === 429) {
        console.error('💡 API 호출 제한을 초과했습니다. 잠시 후 다시 시도하세요.');
      }
    } else {
      console.error(`오류: ${error.message}`);
    }
    return false;
  }
}

// Gemini API 키 테스트
async function testGemini() {
  console.log('\n=== Gemini API 키 테스트 ===');
  
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다.');
    return false;
  }
  
  console.log(`🔑 키 확인: ${GEMINI_API_KEY.substring(0, 5)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`);
  
  try {
    console.log('Gemini API 요청 중...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "간단한 테스트입니다." }] }],
    });
    
    const response = result.response;
    console.log('✅ Gemini API 키가 유효합니다.');
    console.log(`응답: ${response.text().substring(0, 50)}...`);
    return true;
  } catch (error) {
    console.error('❌ Gemini API 키 테스트 실패:');
    console.error(`오류: ${error.message}`);
    
    if (error.message.includes('API key not valid')) {
      console.error('💡 API 키가 유효하지 않습니다. 키를 확인하고 다시 시도하세요.');
    }
    return false;
  }
}

// SerpAPI 키 테스트
async function testSerpAPI() {
  console.log('\n=== SerpAPI 키 테스트 ===');
  
  if (!SERPAPI_KEY) {
    console.error('❌ SERPAPI_KEY가 설정되지 않았습니다.');
    return false;
  }
  
  console.log(`🔑 키 확인: ${SERPAPI_KEY.substring(0, 5)}...${SERPAPI_KEY.substring(SERPAPI_KEY.length - 4)}`);
  
  try {
    console.log('SerpAPI 요청 중...');
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        q: '테스트',
        api_key: SERPAPI_KEY
      }
    });
    
    console.log('✅ SerpAPI 키가 유효합니다.');
    return true;
  } catch (error) {
    console.error('❌ SerpAPI 키 테스트 실패:');
    
    if (error.response) {
      console.error(`상태 코드: ${error.response.status}`);
      console.error(`오류 메시지: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`오류: ${error.message}`);
    }
    return false;
  }
}

// 모든 API 키 테스트 실행
async function testAllKeys() {
  console.log('=================================');
  console.log('       API 키 유효성 테스트');
  console.log('=================================');
  
  // 현재 사용 가능한 환경 변수 정보 출력
  console.log('\n현재 로드된 설정:');
  if (Object.keys(localSettings).length > 0) {
    console.log(`local.settings.json: ${JSON.stringify({
      OpenAI: localSettings.Values?.OPENAI_API_KEY ? '설정됨' : '없음',
      Gemini: localSettings.Values?.GEMINI_API_KEY ? '설정됨' : '없음',
      SerpAPI: localSettings.Values?.SERPAPI_KEY ? '설정됨' : '없음'
    })}`);
  } else {
    console.log('local.settings.json: 로드되지 않음');
  }
  
  console.log(`환경 변수: ${JSON.stringify({
    OpenAI: process.env.OPENAI_API_KEY ? '설정됨' : '없음',
    Gemini: process.env.GEMINI_API_KEY ? '설정됨' : '없음',
    SerpAPI: process.env.SERPAPI_KEY ? '설정됨' : '없음'
  })}`);
  
  const openaiResult = await testOpenAI();
  const geminiResult = await testGemini();
  const serpApiResult = await testSerpAPI();
  
  console.log('\n=== 테스트 결과 요약 ===');
  console.log(`OpenAI API: ${openaiResult ? '✅ 유효' : '❌ 문제 있음'}`);
  console.log(`Gemini API: ${geminiResult ? '✅ 유효' : '❌ 문제 있음'}`);
  console.log(`SerpAPI: ${serpApiResult ? '✅ 유효' : '❌ 문제 있음'}`);
  
  if (!openaiResult || !geminiResult || !serpApiResult) {
    console.log('\n💡 문제 해결 방법:');
    console.log('1. local.settings.json 파일에 API 키를 올바르게 설정했는지 확인하세요.');
    console.log('   - 파일 구조는 다음과 같아야 합니다:');
    console.log('     {');
    console.log('       "IsEncrypted": false,');
    console.log('       "Values": {');
    console.log('         "OPENAI_API_KEY": "your-openai-key",');
    console.log('         "GEMINI_API_KEY": "your-gemini-key",');
    console.log('         "SERPAPI_KEY": "your-serpapi-key"');
    console.log('       }');
    console.log('     }');
    console.log('2. 직접 환경 변수를 설정한 후 테스트하세요:');
    console.log('   - Windows: set OPENAI_API_KEY=your-key');
    console.log('   - PowerShell: $env:OPENAI_API_KEY="your-key"');
    console.log('3. Azure Portal에서 설정된 키를 확인하세요.');
  }
}

// 실행
testAllKeys().catch(error => {
  console.error('테스트 중 오류 발생:', error);
}); 