const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async function (context, req) {
  context.log('AI 모델 질의 요청 수신');

  // 버전 정보와 타임스탬프 기록
  context.log(`함수 버전: 1.0.1, 시간: ${new Date().toISOString()}`);

  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // OPTIONS 요청 처리 (CORS 프리플라이트)
  if (req.method === 'OPTIONS') {
    context.log('CORS 프리플라이트 요청 처리');
    context.res = {
      status: 200,
      headers: headers,
      body: ''
    };
    return;
  }

  const body = req.body || {};
  const model = body.model || 'gpt';
  const input = body.input || '';

  // 요청 데이터 로깅
  context.log(`요청 모델: ${model}, 입력: ${input.substring(0, 50)}${input.length > 50 ? '...' : ''}`);

  // 필수 입력 확인
  if (!input) {
    context.log('오류: 입력값 누락');
    context.res = {
      status: 400,
      headers: headers,
      body: { error: '입력값(input)이 필요합니다.' }
    };
    return;
  }

  // 환경 변수 확인 및 로깅
  const envVars = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '설정됨' : '누락',
    SERPAPI_KEY: process.env.SERPAPI_KEY ? '설정됨' : '누락',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '설정됨' : '누락'
  };
  context.log('환경 변수 상태:', JSON.stringify(envVars));

  if (model === 'gpt') {
    try {
      // API 키 확인
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
      }

      context.log('OpenAI API 호출 시작');
      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '당신은 사업자 업종 분석 도우미입니다.' },
            { role: 'user', content: input }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const message = result.data.choices?.[0]?.message?.content;
      context.log(`GPT 응답 성공. 길이: ${message?.length || 0}`);
      context.res = {
        status: 200,
        headers: headers,
        body: { result: message || '결과 없음' }
      };
    } catch (err) {
      context.log.error('GPT 호출 오류:', err.message);
      
      let errorDetail = err.message;
      let responseData = '응답 없음';
      
      if (err.response) {
        context.log.error('상태 코드:', err.response.status);
        context.log.error('응답 헤더:', JSON.stringify(err.response.headers));
        responseData = JSON.stringify(err.response.data || '{}');
        context.log.error('응답 본문:', responseData);
        
        if (err.response.status === 401) {
          errorDetail = 'OpenAI API 키가 유효하지 않습니다. API 키를 확인하세요.';
        } else if (err.response.status === 429) {
          errorDetail = 'OpenAI API 호출 제한을 초과했습니다. 나중에 다시 시도하세요.';
        }
      } else if (err.request) {
        context.log.error('요청은 전송되었으나 응답이 없습니다.');
        errorDetail = 'OpenAI 서버에 연결할 수 없습니다. 인터넷 연결을 확인하세요.';
      }

      context.res = {
        status: 500,
        headers: headers,
        body: {
          error: 'GPT 모델 호출 실패',
          detail: errorDetail,
          openaiResponse: responseData
        }
      };
    }
    return;
  }

  if (model === 'gemini') {
    // Gemini 대신 GPT로 대체 실행
    context.log('Gemini 모델 대신 GPT로 대체 실행');
    
    try {
      // API 키 확인
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
      }

      context.log('OpenAI API 호출 시작 (Gemini 대체)');
      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '당신은 사업자 업종 분석 도우미입니다.' },
            { role: 'user', content: input }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const message = result.data.choices?.[0]?.message?.content;
      context.log(`GPT 응답 성공 (Gemini 대체). 길이: ${message?.length || 0}`);
      context.res = {
        status: 200,
        headers: headers,
        body: { 
          result: message || '결과 없음',
          notice: 'Gemini API에 문제가 있어 GPT 모델로 대체 실행되었습니다.' 
        }
      };
    } catch (err) {
      context.log.error('GPT 호출 오류 (Gemini 대체):', err.message);
      
      let errorDetail = err.message;
      let responseData = '응답 없음';
      
      if (err.response) {
        context.log.error('상태 코드:', err.response.status);
        responseData = JSON.stringify(err.response.data || '{}');
        context.log.error('응답 본문:', responseData);
      }

      context.res = {
        status: 500,
        headers: headers,
        body: {
          error: 'Gemini 모델 대체 실행 실패',
          detail: errorDetail,
          message: err.message
        }
      };
    }
    return;
  }

  if (model === 'search') {
    const serpKey = process.env.SERPAPI_KEY;
    if (!serpKey) {
      context.log.error('SerpAPI 키 누락');
      context.res = {
        status: 500,
        headers: headers,
        body: { error: 'SERPAPI 키가 설정되지 않았습니다.' }
      };
      return;
    }

    try {
      context.log('SerpAPI 검색 시작');
      const searchRes = await axios.get('https://serpapi.com/search.json', {
        params: {
          q: input,
          hl: 'ko',
          gl: 'kr',
          api_key: serpKey,
          engine: 'google'  // 명시적으로 검색 엔진 지정
        }
      });

      context.log('SerpAPI 응답 수신');
      
      // 응답 구조 확인
      const responseKeys = Object.keys(searchRes.data);
      context.log(`SerpAPI 응답 구조: ${JSON.stringify(responseKeys)}`);
      
      // 검색 결과가 없는 경우
      if (!searchRes.data.organic_results || searchRes.data.organic_results.length === 0) {
        context.log.warn('검색 결과 없음');
        context.res = {
          status: 200,
          headers: headers,
          body: { result: `"${input}"에 대한 검색 결과가 없습니다.` }
        };
        return;
      }
      
      // 검색 결과 요약
      const organicResults = searchRes.data.organic_results.slice(0, 3);
      const summaryInput = organicResults.map((r, idx) => {
        return `검색결과 ${idx + 1}: 제목: ${r.title || '제목 없음'}, 설명: ${r.snippet || '설명 없음'}, 링크: ${r.link || '링크 없음'}`;
      }).join('\n\n');
      
      context.log('검색 결과 확인:', summaryInput);
      context.log('OpenAI 요약 호출 시작');
      
      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '당신은 검색 결과를 요약하는 도우미입니다.' },
            { role: 'user', content: `다음 "${input}"에 대한 검색 결과를 사용자에게 보기 좋게 정리해서 알려주세요:\n\n${summaryInput}` }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const message = result.data.choices?.[0]?.message?.content;
      context.log(`요약 성공. 길이: ${message?.length || 0}`);
      context.res = {
        status: 200,
        headers: headers,
        body: { result: message || '요약 결과 없음' }
      };
    } catch (err) {
      context.log.error('검색 또는 요약 중 오류:', err.message);
      
      let errorDetail = err.message;
      let responseData = '응답 없음';
      
      if (err.response) {
        context.log.error('상태 코드:', err.response.status);
        responseData = JSON.stringify(err.response.data || '{}');
        context.log.error('응답 본문:', responseData);
        
        if (err.message.includes('SerpApi')) {
          errorDetail = 'SerpAPI 키가 유효하지 않거나 할당량을 초과했습니다.';
        }
      }

      context.res = {
        status: 500,
        headers: headers,
        body: {
          error: '검색 기반 요약 실패',
          detail: errorDetail,
          response: responseData
        }
      };
    }
    return;
  }

  context.res = {
    status: 400,
    headers: headers,
    body: { error: `지원하지 않는 모델: ${model}` }
  };
};
