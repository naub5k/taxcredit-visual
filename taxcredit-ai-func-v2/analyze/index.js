// Azure Function - 고용증대세액공제 분석
// 배포 버전: v1.0.3 - 읽기 전용 모드 해결 후 재배포

module.exports = function (context, req) {
    context.log("🚀 함수 시작! - v1.0.3");
    
    // 하위 IDE 요구사항에 맞춘 확실한 응답
    const responseData = {
        message: "Hello World",
        timestamp: new Date().toISOString(),
        success: true,
        version: "1.0.3"
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