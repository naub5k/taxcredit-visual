// Azure Function - 고용증대세액공제 분석
// CORS 헤더 포함 기본 함수

module.exports = function (context, req) {
    context.log("🚀 함수 시작!");
    
    // 하위 IDE 요구사항에 맞춘 확실한 응답
    const responseData = {
        message: "Hello World",
        timestamp: new Date().toISOString(),
        success: true
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