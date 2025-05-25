const axios = require('axios');

module.exports = async function (context, req) {
  context.log('AI 모델 질의 요청 수신');

  const body = req.body || {};
  const model = body.model || 'gpt';
  const input = body.input || '';

  if (!input) {
    context.res = {
      status: 400,
      body: { error: '입력값(input)이 필요합니다.' }
    };
    return;
  }

  if (model === 'gpt') {
    try {
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
      context.res = {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: { result: message || '결과 없음' }
      };
    } catch (err) {
      context.log.error('GPT 호출 오류:', err.message);
      context.log.error('응답 본문:', JSON.stringify(err.response?.data || '응답 없음'));

      context.res = {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: {
          error: '모델 호출 실패',
          detail: err.message,
          openaiResponse: err.response?.data || '응답 없음'
        }
      };
    }
    return;
  }

  if (model === 'search') {
    const serpKey = process.env.SERPAPI_KEY;
    if (!serpKey) {
      context.res = {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: { error: 'SERPAPI 키가 설정되지 않았습니다.' }
      };
      return;
    }

    try {
      const searchRes = await axios.get('https://serpapi.com/search.json', {
        params: {
          q: input,
          hl: 'ko',
          gl: 'kr',
          api_key: serpKey
        }
      });

      const localResults = searchRes.data.local_results || [];
      if (localResults.length === 0) {
        context.res = {
          status: 404,
          body: { error: '검색 결과가 없습니다.' }
        };
        return;
      }

      const summaryInput = localResults.slice(0, 2).map((r, idx) => {
        return `사업장 ${idx + 1}: ${r.title}, 주소: ${r.address}, 전화: ${r.phone || '없음'}, 평점: ${r.rating || '없음'}, 리뷰: ${r.reviews || '없음'}, 사이트: ${r.website || '없음'}`;
      }).join('\n');

      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '당신은 사업장 검색 요약 도우미입니다.' },
            { role: 'user', content: `다음 사업장 정보를 사용자에게 보기 좋게 정리해줘:\n\n${summaryInput}` }
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
      context.res = {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: { result: message || '요약 결과 없음' }
      };
    } catch (err) {
      context.log.error('검색 또는 요약 중 오류:', err.message);
      context.log.error('응답 본문:', JSON.stringify(err.response?.data || '응답 없음'));

      context.res = {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: {
          error: '검색 기반 요약 실패',
          detail: err.message,
          openaiResponse: err.response?.data || '응답 없음'
        }
      };
    }
    return;
  }

  context.res = {
    status: 400,
    body: { error: `지원하지 않는 모델: ${model}` }
  };
};
