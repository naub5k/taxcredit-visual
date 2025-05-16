// 올바른 경로로 db-utils 모듈 불러오기 (폴더 구조 변경으로 인한 경로 수정)
const executeQuery = require('../utils/db-utils');
const sql = require('mssql');

module.exports = async function (context, req) {
  const startTime = new Date();
  context.log('getSampleList 함수 시작:', startTime.toISOString());
  
  // CORS 헤더 정의 (개선된 버전)
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    'Cache-Control': 'no-cache, no-store'
  };
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    context.log('OPTIONS 요청 처리');
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: {}
    };
    return;
  }

  try {
    // 요청 파라미터 추출 및 로깅
    const sido = req.query.sido || null;
    const gugun = req.query.gugun || null;
    
    context.log(`요청 파라미터 - sido: ${sido}, gugun: ${gugun}`);
    // 작업요청서에 명시된 형식대로 파라미터 로깅 추가
    context.log('요청 파라미터', { sido, gugun });
    
    // 쿼리 구성 - 수정된 버전 (파라미터화)
    let query = `SELECT 사업장명, 시도, 구군, [2020], [2021], [2022], [2023], [2024] FROM Insu_sample WHERE 1=1`;
    let params = [];
    
    if (sido) {
      query += ` AND 시도 = @sido`;
      params.push({
        name: 'sido',
        type: 'nvarchar',
        value: sido
      });
    } else {
      query += ` AND 시도 IN (N'서울특별시', N'경기도')`;
    }
    
    if (gugun) {
      query += ` AND 구군 = @gugun`;
      params.push({
        name: 'gugun',
        type: 'nvarchar',
        value: gugun
      });
    }
    
    context.log('데이터베이스 쿼리:', query);
    
    const queryStartTime = new Date();
    // 쿼리 실행 (파라미터화된 쿼리 사용) - context 객체 전달
    const result = await executeQuery(query, params, context);
    const queryEndTime = new Date();
    const queryDuration = queryEndTime - queryStartTime;
    
    context.log(`쿼리 결과: ${result.recordset.length}개 레코드 조회됨`);
    context.log('DB 쿼리 시간(ms):', queryDuration);

    // 성공 응답 - CORS 헤더 포함
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: result.recordset
    };
    
    const endTime = new Date();
    context.log(`getSampleList 함수 종료: 총 ${endTime - startTime}ms 소요`);
  } catch (err) {
    // 오류 로깅 강화
    context.log.error('getSampleList 오류 발생:');
    console.error("콘솔 오류 (index.js):", err.message, err.stack);
    context.log.error(`요청 파라미터 - sido: ${req.query.sido || 'null'}, gugun: ${req.query.gugun || 'null'}`);
    context.log.error(`오류 유형: ${err.name}`);
    context.log.error(`오류 메시지: ${err.message}`);
    context.log.error(`오류 스택: ${err.stack}`);
    
    // 개선된 오류 응답 구조 - 요청서에 맞게 수정
    context.res = {
      status: 500,
      headers: corsHeaders,
      body: {
        message: "DB 연결 또는 실행 오류",
        detail: err.message,
        parameters: {
          sido: req.query.sido || null,
          gugun: req.query.gugun || null
        },
        timestamp: new Date().toISOString()
      }
    };
    
    const endTime = new Date();
    context.log.error(`getSampleList 함수 오류 종료: 총 ${endTime - startTime}ms 소요`);
  }
};
