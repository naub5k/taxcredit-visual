// 올바른 경로로 db-utils 모듈 불러오기 (폴더 구조 변경으로 인한 경로 수정)
const executeQuery = require('../utils/db-utils');

module.exports = async function (context, req) {
  context.log('getSampleList 함수가 실행되었습니다.');
  
  // CORS 헤더 설정
  context.res = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  };
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    context.res.body = {};
    return;
  }

  try {
    // 요청 파라미터 추출
    const sido = req.query.sido || null;
    const gugun = req.query.gugun || null;
    
    // 쿼리 구성
    let query;
    if (sido && gugun) {
      query = `SELECT 사업장명, 시도, 구군, [2023], [2024] FROM Insu_sample WHERE 시도 = N'${sido}' AND 구군 = N'${gugun}'`;
    } else if (sido) {
      query = `SELECT 사업장명, 시도, 구군, [2023], [2024] FROM Insu_sample WHERE 시도 = N'${sido}'`;
    } else {
      query = `SELECT 사업장명, 시도, 구군, [2023], [2024] FROM Insu_sample WHERE 시도 IN (N'서울특별시', N'경기도')`;
    }
    
    context.log('데이터베이스 쿼리 실행 중:', query);
    
    // 쿼리 실행
    const result = await executeQuery(query);

    // 응답 반환 (기존 헤더는 유지)
    context.res.status = 200;
    context.res.body = result.recordset;
  } catch (err) {
    // 오류 처리
    context.log.error('getSampleList 함수 오류:', err);
    context.res.status = 500;
    context.res.body = {
      error: "데이터를 가져오는 중 오류가 발생했습니다.",
      details: err.message
    };
  }
};
