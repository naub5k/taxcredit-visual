export async function fetchCompanyAnalysis(bizno) {
  try {
    const response = await fetch(`https://taxcredit-ai-func-v3.azurewebsites.net/api/analyze?bizno=${bizno}`);
    if (!response.ok) {
      throw new Error('API 호출 실패');
    }
    const json = await response.json();
    return json.analysisData;
  } catch (error) {
    console.error('회사 분석 데이터 조회 실패:', error);
    return {
      companyProfile: null,
      companyInsight: null,
      taxCreditAnalysis: null
    };
  }
} 