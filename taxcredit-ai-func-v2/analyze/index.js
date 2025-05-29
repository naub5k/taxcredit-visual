// Azure Function - 고용증대세액공제 분석
// CORS 헤더 포함 기본 함수

module.exports = function (context, req) {
    context.log("🚀 함수 시작!");
    
    context.res = {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        body: {
            message: "Hello World",
            timestamp: new Date().toISOString()
        }
    };
    
    context.log("✅ 함수 완료");
}; 