// 올바른 경로로 db-utils 모듈 불러오기 (폴더 구조 변경으로 인한 경로 수정)
const executeQuery = require('../utils/db-utils');

module.exports = async function (context, req) {
  context.log('============= getSampleList 함수 실행 시작 =============');
  
  // 요청 정보 로깅
  context.log('Request URL:', req.url);
  context.log('Request Method:', req.method);
  context.log('Request Query:', JSON.stringify(req.query));
  context.log('Request Headers:', JSON.stringify(req.headers));
  
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
    context.log('OPTIONS 요청 처리 완료');
    context.res.status = 200;
    context.res.body = {};
    return;
  }

  try {
    // 요청 파라미터 추출
    const sido = req.query.sido || null;
    const gugun = req.query.gugun || null;
    
    // 파라미터 로깅 - 추가 요청 형식대로 명확한 로그 추가
    context.log('[PARAM CHECK] sido값:', sido, '/ 타입:', typeof sido, '/ 길이:', sido ? sido.length : 0);
    context.log('[PARAM CHECK] gugun값:', gugun, '/ 타입:', typeof gugun, '/ 길이:', gugun ? gugun.length : 0);
    
    // URL 디코딩된 파라미터도 확인
    try {
      if (sido) context.log('[PARAM CHECK] sido 디코딩:', decodeURIComponent(sido));
      if (gugun) context.log('[PARAM CHECK] gugun 디코딩:', decodeURIComponent(gugun));
    } catch (e) {
      context.log('[PARAM CHECK] 디코딩 오류:', e.message);
    }
    
    // 특수 문자 검사
    if (sido) context.log('[PARAM CHECK] sido 특수문자 포함:', /[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\w\s]/.test(sido));
    if (gugun) context.log('[PARAM CHECK] gugun 특수문자 포함:', /[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\w\s]/.test(gugun));
    
    // 파라미터 검증
    if (sido === null) {
      context.log('[PARAM CHECK] 경고: sido 파라미터가 누락되었습니다');
    }
    
    // 쿼리 구성
    let query;
    let whereClause = '';
    let queryParams = {};
    
    if (sido && gugun) {
      whereClause = `시도 = N'${sido}' AND 구군 = N'${gugun}'`;
      queryParams = { sido, gugun };
    } else if (sido) {
      whereClause = `시도 = N'${sido}'`;
      queryParams = { sido };
    } else {
      whereClause = `시도 IN (N'서울특별시', N'경기도')`;
      queryParams = {};
    }
    
    query = `SELECT 사업장명, 시도, 구군, [2023], [2024] FROM Insu_sample WHERE ${whereClause}`;
    
    // 쿼리 로깅 - 명확한 형식으로 추가
    context.log('[QUERY EXECUTION] 쿼리 파라미터:', JSON.stringify(queryParams));
    context.log('[QUERY EXECUTION] 실행 SQL:', query);
    
    // 쿼리 실행
    const result = await executeQuery(query);

    // 결과 로깅
    const recordCount = result.recordset?.length || 0;
    context.log('[QUERY RESULT] 레코드 수:', recordCount);
    
    // 결과 샘플링 (첫 번째 레코드만)
    if (result.recordset && result.recordset.length > 0) {
      context.log('[QUERY RESULT] 첫 번째 레코드:', JSON.stringify(result.recordset[0]));
      context.log('[QUERY RESULT] 마지막 레코드:', JSON.stringify(result.recordset[result.recordset.length - 1]));
    } else {
      context.log('[QUERY RESULT] 결과 없음: 빈 레코드셋 반환됨');
    }

    // 응답 반환 (기존 헤더는 유지)
    context.res.status = 200;
    context.res.body = result.recordset;
    context.log('============= getSampleList 함수 실행 완료 =============');
  } catch (err) {
    // 오류 로깅 강화
    context.log.error('============= getSampleList 함수 오류 발생 =============');
    context.log.error('[ERROR] 오류 메시지:', err.message);
    context.log.error('[ERROR] 오류 스택:', err.stack);
    
    if (err.code) {
      context.log.error('[ERROR] 오류 코드:', err.code);
    }
    
    if (err.originalError) {
      context.log.error('[ERROR] 원본 오류:', JSON.stringify(err.originalError));
    }
    
    // 클라이언트에게 전송할 오류 응답
    context.res.status = 500;
    context.res.body = {
      error: "데이터를 가져오는 중 오류가 발생했습니다.",
      message: err.message,
      code: err.code || 'UNKNOWN_ERROR'
    };
    context.log.error('============= getSampleList 함수 실행 실패 =============');
  }
};
