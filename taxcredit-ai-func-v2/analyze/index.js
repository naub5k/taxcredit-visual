// Azure Function - 고용증대세액공제 분석
// 배포 버전: v1.0.4 - 간단한 route로 404 오류 해결

module.exports = function (context, req) {
    context.log("🚀 함수 시작! - v1.0.4");
    
    // 파라미터 추출 (query string 방식)
    const bizno = req.query.bizno || req.body?.bizno || "테스트";
    
    // 하위 IDE 요구사항에 맞춘 확실한 응답
    const responseData = {
        message: "Hello World - 404 오류 해결",
        bizno: bizno,
        timestamp: new Date().toISOString(),
        success: true,
        version: "1.0.4"
    };
    
    context.res = {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(responseData)
    };
    
    context.log("✅ 함수 완료 - 응답:", JSON.stringify(responseData));
}; 