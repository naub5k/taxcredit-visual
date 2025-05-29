// Azure Function - 고용증대세액공제 분석
// CORS 헤더 포함 기본 함수

module.exports = async function (context, req) {
    context.log("🟢 함수 로딩됨");
    
    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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

    // 사업자등록번호 추출
    const bizno = req.params.bizno || req.query.bizno || req.body?.bizno;
    context.log(`요청된 사업자등록번호: ${bizno}`);

    // 기본 응답
    context.res = {
        status: 200,
        headers: headers,
        body: {
            message: "Hello World - Azure Function 정상 작동",
            bizno: bizno,
            timestamp: new Date().toISOString(),
            version: "1.0.1"
        }
    };
    
    context.log("✅ 완료");
}; 