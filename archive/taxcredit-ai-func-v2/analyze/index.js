// Azure Function - 고용증대세액공제 분석
// 배포 버전: v1.0.5 - route 제거 및 파라미터 검증 강화

module.exports = function (context, req) {
    context.log("🚀 함수 시작! - v1.0.5");
    
    // CORS 헤더 설정
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json; charset=utf-8"
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
    
    // 파라미터 추출 및 검증
    const bizno = req.query?.bizno || req.body?.bizno;
    
    context.log(`요청된 파라미터 - bizno: ${bizno}`);
    
    // bizno 유효성 검사
    if (!bizno) {
        context.log("❌ bizno 파라미터 누락");
        context.res = {
            status: 400,
            headers: headers,
            body: JSON.stringify({
                error: "bizno 파라미터가 필요합니다",
                message: "사업자등록번호를 query parameter로 전달해주세요",
                usage: "GET /api/analyze?bizno=1234567890",
                timestamp: new Date().toISOString(),
                success: false,
                version: "1.0.5"
            })
        };
        return;
    }
    
    // 성공 응답
    const responseData = {
        message: "Hello World - 404 오류 해결 완료",
        bizno: bizno,
        timestamp: new Date().toISOString(),
        success: true,
        version: "1.0.5",
        route: "기본 함수명 사용"
    };
    
    context.res = {
        status: 200,
        headers: headers,
        body: JSON.stringify(responseData)
    };
    
    context.log("✅ 함수 완료 - 응답:", JSON.stringify(responseData));
}; 