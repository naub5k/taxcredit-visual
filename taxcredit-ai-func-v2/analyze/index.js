// Azure Function - 고용증대세액공제 분석
// 최소한의 안전한 코드로 작성

module.exports = function (context, req) {
    context.log("🟢 함수 로딩됨");
    
    context.res = {
        status: 200,
        body: "Hello World"
    };
    
    context.log("✅ 완료");
}; 