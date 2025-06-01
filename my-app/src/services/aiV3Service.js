export async function fetchCompanyAnalysis(bizno) {
  try {
    console.log("📤 AI 분석 요청:", bizno);
    
    const response = await fetch(`https://taxcredit-api-func-v2.azurewebsites.net/api/analyze?bizno=${bizno}`);
    
    console.log("📡 응답 상태:", response.status, response.statusText);
    console.log("📡 응답 헤더:", response.headers.get('content-type'));
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
    }

    // 응답 텍스트를 먼저 확인
    const text = await response.text();
    console.log("📡 원본 응답:", text);

    if (!text || text.trim() === '') {
      console.warn("⚠️ 빈 응답 받음");
      return null;
    }

    // JSON 파싱 시도
    let json;
    try {
      json = JSON.parse(text);
      console.log("📡 파싱된 JSON:", json);
    } catch (parseError) {
      console.error("❌ JSON 파싱 실패:", parseError);
      console.error("❌ 응답 내용:", text);
      return null;
    }

    // 응답 구조 확인 (AIBasicFormatter 응답 형식)
    if (json && json.success && json.analysisData) {
      console.log("✅ 실 API 응답 성공:", json.analysisData);
      return json.analysisData;
    } else if (json && json.error) {
      console.error("❌ API 오류:", json.error);
      return null;
    } else {
      console.warn("⚠️ 예상되지 않은 응답 구조:", json);
      return json; // 직접 반환해보기
    }

  } catch (error) {
    console.error('❌ 실 AI 분석 API 호출 실패:', error);
    return null;
  }
} 