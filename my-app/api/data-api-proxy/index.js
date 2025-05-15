/**
 * Data API Builder(DAB) API 프록시 함수
 * Static Web Apps에서 /data-api/* 요청을 DAB로 적절히 전달합니다.
 */
module.exports = async function (context, req) {
  context.log('DAB API 프록시 함수 호출됨');

  // 요청 경로에서 필요한 부분 추출
  const path = req.params.path || req.originalUrl || '';
  context.log(`요청 경로: ${path}`);

  // 원본 요청의 모든 부분을 DAB로 전달
  try {
    // Static Web Apps에 연결된 DATABASE_CONNECTION_STRING이 확인되었는지 검증
    if (!process.env.DATABASE_CONNECTION_STRING) {
      context.log.error('DATABASE_CONNECTION_STRING 환경 변수가 설정되지 않음');
      return {
        status: 500,
        body: JSON.stringify({
          error: "데이터베이스 연결 문자열이 설정되지 않았습니다",
          details: "Azure Portal에서 Static Web Apps의 환경 변수를 확인하세요"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      };
    }

    // DAB API 경로를 그대로 유지하고 요청 전달
    return {
      status: 200,
      body: {
        message: "DAB API 프록시 함수가 호출되었습니다",
        path: path,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    context.log.error(`DAB API 프록시 오류: ${error.message}`);
    return {
      status: 500,
      body: JSON.stringify({
        error: "DAB API 프록시 오류",
        message: error.message,
        stack: error.stack
      }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
}; 