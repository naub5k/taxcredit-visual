// 올바른 경로로 db-utils 모듈 불러오기 (폴더 구조 변경으로 인한 경로 수정)
const executeQuery = require('../utils/db-utils');
const sql = require('mssql');

module.exports = async function (context, req) {
  context.log('getSampleList 함수가 실행되었습니다.', req.method);
  
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
    
    context.log(`파라미터 수신: sido=${sido}, gugun=${gugun}`);
    
    // 쿼리 구성 - 수정된 버전 (파라미터화)
    let query = `SELECT 사업장명, 시도, 구군, [2020], [2021], [2022], [2023], [2024] FROM Insu_sample WHERE 1=1`;
    let params = [];
    
    if (sido) {
      query += ` AND 시도 = @sido`;
      params.push({
        name: 'sido',
        type: sql.NVarChar,
        value: sido
      });
    } else {
      query += ` AND 시도 IN (N'서울특별시', N'경기도')`;
    }
    
    if (gugun) {
      query += ` AND 구군 = @gugun`;
      params.push({
        name: 'gugun',
        type: sql.NVarChar,
        value: gugun
      });
    }
    
    context.log('데이터베이스 쿼리 실행 중:', query);
    
    // 쿼리 실행 (파라미터화된 쿼리 사용)
    const result = await executeQuery(query, params);
    
    context.log(`쿼리 결과: ${result.recordset.length}개 레코드 조회됨`);

    // 성공 응답 - CORS 헤더 포함
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: result.recordset
    };
    
    context.log('응답 전송 완료');
  } catch (err) {
    // 오류 처리 - CORS 헤더 포함
    context.log.error('getSampleList 함수 오류:', err);
    context.res = {
      status: 500,
      headers: corsHeaders,
      body: {
        error: "데이터를 가져오는 중 오류가 발생했습니다.",
        details: err.message,
        timestamp: new Date().toISOString()
      }
    };
  }
};
