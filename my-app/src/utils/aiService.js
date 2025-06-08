/**
 * AI 모델 호출을 위한 유틸리티 함수
 */

// Azure Functions 엔드포인트 - 통합된 API 사용
const AI_FUNCTION_ENDPOINT = 'https://taxcredit-api-func.azurewebsites.net/api/analyze';

/**
 * AI 모델에 질의하는 함수
 * 
 * @param {string} model - 사용할 모델 ("gpt", "gemini", "search" 중 하나)
 * @param {string} input - 질의 내용
 * @returns {Promise<{result: string, notice?: string}>} 모델 응답
 */
export async function queryAiModel(model, input) {
  try {
    const response = await fetch(AI_FUNCTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, input }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI 모델 호출 중 오류:', error);
    throw error;
  }
}

/**
 * GPT 모델에 질의하는 함수
 * 
 * @param {string} input - 질의 내용
 * @returns {Promise<string>} GPT 응답 텍스트
 */
export async function askGpt(input) {
  const { result } = await queryAiModel('gpt', input);
  return result;
}

/**
 * Gemini 모델에 질의하는 함수 (현재는 GPT로 대체 실행됨)
 * 
 * 참고: 현재 Gemini API 문제로 GPT 모델로 대체 실행됩니다.
 * 
 * @param {string} input - 질의 내용
 * @returns {Promise<string>} Gemini(또는 GPT 대체) 응답 텍스트
 */
export async function askGemini(input) {
  const response = await queryAiModel('gemini', input);
  // notice가 있으면 콘솔에 표시
  if (response.notice) {
    console.info('AI 모델 정보:', response.notice);
  }
  return response.result;
}

/**
 * 검색 기반 정보 요약 함수
 * 
 * @param {string} searchQuery - 검색 질의 (예: "서울시 강남구 세무사무소")
 * @returns {Promise<string>} 요약된 정보
 */
export async function searchAndSummarize(searchQuery) {
  const { result } = await queryAiModel('search', searchQuery);
  return result;
}

/**
 * 사업장 분석 도우미 함수
 * 
 * @param {string} businessInfo - 사업장 정보
 * @returns {Promise<string>} 분석 결과
 */
export async function analyzeBusinessInfo(businessInfo) {
  return askGpt(`다음 사업장 정보를 분석해 주세요:\n\n${businessInfo}`);
}

export default {
  queryAiModel,
  askGpt,
  askGemini,
  searchAndSummarize,
  analyzeBusinessInfo
}; 