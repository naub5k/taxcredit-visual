// 올바른 경로로 db-utils 모듈 불러오기 (폴더 구조 변경으로 인한 경로 수정)
const executeQuery = require('../utils/db-utils');

module.exports = async function (context, req) {
  context.log('=== getSampleList 함수 실행 시작 ===');
  
  // CORS 헤더 설정
  context.res = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
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
    // 요청 파라미터 추출 및 로깅
    const sido = req.query.sido || null;
    const gugun = req.query.gugun || null;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const offset = (page - 1) * pageSize;
    
    context.log(`=== 파라미터 확인 ===`);
    context.log(`sido: ${sido}`);
    context.log(`gugun: ${gugun}`);
    context.log(`page: ${page}`);
    context.log(`pageSize: ${pageSize}`);
    context.log(`offset: ${offset}`);
    
    // SQL 인젝션 방지를 위한 입력값 검증
    if (sido && !/^[가-힣a-zA-Z\s]+$/.test(sido)) {
      throw new Error('Invalid sido parameter');
    }
    if (gugun && !/^[가-힣a-zA-Z\s]+$/.test(gugun)) {
      throw new Error('Invalid gugun parameter');
    }
    
    // 집계값 계산 쿼리 (SQL Server 호환)
    let aggregateQuery;
    if (sido && gugun) {
      aggregateQuery = `
        SELECT 
          MAX(ISNULL([2024], 0)) as maxEmployeeCount,
          COUNT(*) as totalCount
        FROM Insu_sample 
        WHERE 시도 = N'${sido}' AND 구군 = N'${gugun}'`;
    } else if (sido) {
      aggregateQuery = `
        SELECT 
          MAX(ISNULL([2024], 0)) as maxEmployeeCount,
          COUNT(*) as totalCount
        FROM Insu_sample 
        WHERE 시도 = N'${sido}'`;
    } else {
      aggregateQuery = `
        SELECT 
          MAX(ISNULL([2024], 0)) as maxEmployeeCount,
          COUNT(*) as totalCount
        FROM Insu_sample 
        WHERE 시도 IN (N'서울특별시', N'경기도')`;
    }
    
    // 데이터 조회 쿼리 (페이지네이션 적용 - 중요!)
    let dataQuery;
    if (sido && gugun) {
      dataQuery = `
        SELECT 사업장명, 시도, 구군, 업종명, 사업자등록번호, 주소, 대표자명, [2020], [2021], [2022], [2023], [2024]
        FROM Insu_sample 
        WHERE 시도 = N'${sido}' AND 구군 = N'${gugun}'
        ORDER BY 사업장명
        OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
    } else if (sido) {
      dataQuery = `
        SELECT 사업장명, 시도, 구군, 업종명, 사업자등록번호, 주소, 대표자명, [2020], [2021], [2022], [2023], [2024]
        FROM Insu_sample 
        WHERE 시도 = N'${sido}'
        ORDER BY 사업장명
        OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
    } else {
      dataQuery = `
        SELECT 사업장명, 시도, 구군, 업종명, 사업자등록번호, 주소, 대표자명, [2020], [2021], [2022], [2023], [2024]
        FROM Insu_sample 
        WHERE 시도 IN (N'서울특별시', N'경기도')
        ORDER BY 사업장명
        OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
    }
    
    context.log('=== 쿼리 실행 시작 ===');
    context.log('집계값 쿼리:', aggregateQuery.substring(0, 200) + '...');
    context.log('데이터 쿼리:', dataQuery.substring(0, 200) + '...');
    
    // 성능 측정 시작
    const startTime = Date.now();
    
    // 병렬로 두 쿼리 실행
    const [aggregateResult, dataResult] = await Promise.all([
      executeQuery(aggregateQuery),
      executeQuery(dataQuery)
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    context.log(`=== 쿼리 실행 완료 ===`);
    context.log(`집계 결과: ${aggregateResult.recordset.length}건`);
    context.log(`데이터 결과: ${dataResult.recordset.length}건`);
    context.log(`실행 시간: ${duration}ms`);

    // 집계 데이터 안전하게 추출
    const aggregateData = aggregateResult.recordset[0] || {};
    const totalCount = aggregateData.totalCount || 0;
    const maxEmployeeCount = aggregateData.maxEmployeeCount || 0;
    
    // 응답 데이터 구성 (모든 필드 보장)
    const responseData = {
      data: dataResult.recordset || [],
      pagination: {
        page: page,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNext: page * pageSize < totalCount,
        hasPrev: page > 1
      },
      aggregates: {
        maxEmployeeCount: maxEmployeeCount,
        minEmployeeCount: 0,
        avgEmployeeCount: 0,
        totalCount: totalCount
      },
      meta: {
        requestedAt: new Date().toISOString(),
        filters: { sido, gugun, page, pageSize },
        performance: {
          serverCalculated: true,
          duration: duration,
          note: "페이지네이션 및 집계값 서버 계산 적용됨"
        }
      }
    };

    context.log(`=== 응답 데이터 구성 완료 ===`);
    context.log(`반환 데이터 건수: ${responseData.data.length}`);
    context.log(`총 건수: ${responseData.aggregates.totalCount}`);
    context.log(`페이지 정보: ${responseData.pagination.page}/${responseData.pagination.totalPages}`);
    context.log(`성능: ${responseData.meta.performance.duration}ms`);

    // 응답 반환
    context.res.status = 200;
    context.res.body = responseData;
    
  } catch (err) {
    // 오류 처리
    context.log.error('=== getSampleList 함수 오류 ===', err);
    
    // 오류 시에도 기본 구조 반환
    const errorResponse = {
      data: [],
      pagination: {
        page: 1,
        pageSize: 50,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      },
      aggregates: {
        maxEmployeeCount: 0,
        minEmployeeCount: 0,
        avgEmployeeCount: 0,
        totalCount: 0
      },
      meta: {
        requestedAt: new Date().toISOString(),
        filters: {},
        performance: {
          serverCalculated: false,
          duration: 0,
          note: "오류 발생으로 기본값 반환"
        }
      },
      error: {
        message: "데이터를 가져오는 중 오류가 발생했습니다.",
        details: err.message,
        timestamp: new Date().toISOString()
      }
    };
    
    context.res.status = 500;
    context.res.body = errorResponse;
  }
};
