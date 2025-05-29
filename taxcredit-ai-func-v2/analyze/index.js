// Azure Function - 고용증대세액공제 분석
// CORS 헤더 포함 기본 함수

module.exports = function (context, req) {
    try {
        context.log("🚀 함수 시작!");
        
        // 안전한 응답 설정
        context.res = {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({
                message: "Hello World",
                timestamp: new Date().toISOString(),
                success: true
            })
        };
        
        context.log("✅ 함수 완료");
        
    } catch (error) {
        context.log.error("❌ 함수 오류:", error);
        
        // 오류 발생 시에도 안전한 응답
        context.res = {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({
                error: "함수 실행 중 오류 발생",
                message: error.message || "알 수 없는 오류",
                timestamp: new Date().toISOString(),
                success: false
            })
        };
    }
}; 