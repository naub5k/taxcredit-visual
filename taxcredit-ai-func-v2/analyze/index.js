const axios = require('axios');

module.exports = async function (context, req) {
  context.log('사업자등록번호 분석 요청 수신');

  // 버전 정보와 타임스탬프 기록
  context.log(`함수 버전: 1.0.0, 시간: ${new Date().toISOString()}`);

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

  // 필수 파라미터 확인
  if (!bizno) {
    context.log('오류: 사업자등록번호 누락');
    context.res = {
      status: 400,
      headers: headers,
      body: { 
        error: '사업자등록번호가 필요합니다.',
        usage: 'GET /api/analyze/{bizno} 또는 POST /api/analyze with {"bizno": "1234567890"}'
      }
    };
    return;
  }

  // 사업자등록번호 형식 검증 (10자리 숫자)
  if (!/^\d{10}$/.test(bizno)) {
    context.log(`오류: 잘못된 사업자등록번호 형식 - ${bizno}`);
    context.res = {
      status: 400,
      headers: headers,
      body: { 
        error: '사업자등록번호는 10자리 숫자여야 합니다.',
        provided: bizno
      }
    };
    return;
  }

  try {
    // 데이터베이스에서 사업자 정보 조회 (Mock 데이터)
    context.log('사업자 정보 조회 시작');
    
    // TODO: 실제 데이터베이스 연결 구현
    const companyData = await getCompanyData(bizno, context);
    
    if (!companyData) {
      context.log(`사업자등록번호 ${bizno}에 대한 데이터 없음`);
      context.res = {
        status: 404,
        headers: headers,
        body: { 
          error: '해당 사업자등록번호의 데이터를 찾을 수 없습니다.',
          bizno: bizno
        }
      };
      return;
    }

    // AI 분석 수행
    context.log('AI 분석 시작');
    const analysis = await performAIAnalysis(companyData, context);

    // 성공 응답
    context.log(`분석 완료 - 사업자등록번호: ${bizno}`);
    context.res = {
      status: 200,
      headers: headers,
      body: {
        bizno: bizno,
        companyData: companyData,
        analysis: analysis,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };

  } catch (error) {
    context.log.error('분석 중 오류 발생:', error.message);
    
    context.res = {
      status: 500,
      headers: headers,
      body: {
        error: '사업자 분석 중 오류가 발생했습니다.',
        detail: error.message,
        bizno: bizno
      }
    };
  }
};

// 회사 데이터 조회 함수 (Mock)
async function getCompanyData(bizno, context) {
  context.log(`회사 데이터 조회: ${bizno}`);
  
  // Mock 데이터 (실제로는 Azure SQL Database에서 조회)
  const mockData = {
    '1010122809': {
      사업자등록번호: '1010122809',
      사업장명: '한헬스케어',
      업종명: '의료기기 제조업',
      사업장주소: '서울특별시 강남구 테헤란로 123',
      고용인원_2021: 45,
      고용인원_2022: 52,
      고용인원_2023: 58,
      고용인원_2024: 61
    },
    '2528600056': {
      사업자등록번호: '2528600056',
      사업장명: '테크솔루션',
      업종명: 'IT 서비스업',
      사업장주소: '서울특별시 서초구 서초대로 456',
      고용인원_2021: 23,
      고용인원_2022: 28,
      고용인원_2023: 35,
      고용인원_2024: 42
    }
  };

  return mockData[bizno] || null;
}

// AI 분석 수행 함수
async function performAIAnalysis(companyData, context) {
  context.log('AI 분석 수행 중...');
  
  try {
    // 고용 트렌드 분석
    const employmentTrend = analyzeEmploymentTrend(companyData);
    
    // 업종 분석
    const industryAnalysis = analyzeIndustry(companyData);
    
    // 세액공제 추천
    const taxCreditRecommendation = recommendTaxCredit(companyData);

    return {
      employmentTrend,
      industryAnalysis,
      taxCreditRecommendation,
      summary: generateSummary(companyData, employmentTrend)
    };
    
  } catch (error) {
    context.log.error('AI 분석 오류:', error.message);
    throw error;
  }
}

// 고용 트렌드 분석
function analyzeEmploymentTrend(data) {
  const years = [2021, 2022, 2023, 2024];
  const employmentData = years.map(year => data[`고용인원_${year}`] || 0);
  
  const growthRates = [];
  for (let i = 1; i < employmentData.length; i++) {
    const rate = ((employmentData[i] - employmentData[i-1]) / employmentData[i-1] * 100).toFixed(1);
    growthRates.push(parseFloat(rate));
  }
  
  const avgGrowthRate = (growthRates.reduce((a, b) => a + b, 0) / growthRates.length).toFixed(1);
  
  return {
    연도별고용인원: employmentData,
    연도별증가율: growthRates,
    평균증가율: parseFloat(avgGrowthRate),
    트렌드: parseFloat(avgGrowthRate) > 5 ? '급성장' : parseFloat(avgGrowthRate) > 0 ? '성장' : '정체'
  };
}

// 업종 분석
function analyzeIndustry(data) {
  const industry = data.업종명;
  
  // 업종별 특성 분석 (간단한 룰 기반)
  let characteristics = [];
  let riskLevel = '보통';
  
  if (industry.includes('IT') || industry.includes('소프트웨어')) {
    characteristics = ['기술집약적', '고성장 가능성', '인재 확보 중요'];
    riskLevel = '낮음';
  } else if (industry.includes('제조')) {
    characteristics = ['자본집약적', '안정적 성장', '기술 혁신 필요'];
    riskLevel = '보통';
  } else if (industry.includes('의료')) {
    characteristics = ['전문성 요구', '규제 산업', '안정적 수요'];
    riskLevel = '낮음';
  }
  
  return {
    업종: industry,
    특성: characteristics,
    위험도: riskLevel,
    성장전망: '양호'
  };
}

// 세액공제 추천
function recommendTaxCredit(data) {
  const recommendations = [];
  
  // 고용 증가 기반 추천
  const currentYear = 2024;
  const previousYear = 2023;
  const currentEmployees = data[`고용인원_${currentYear}`] || 0;
  const previousEmployees = data[`고용인원_${previousYear}`] || 0;
  
  if (currentEmployees > previousEmployees) {
    recommendations.push({
      제도명: '고용증대세액공제',
      예상공제액: `${(currentEmployees - previousEmployees) * 1000000}원`,
      조건: '정규직 고용 증가',
      우선순위: '높음'
    });
  }
  
  // 업종 기반 추천
  if (data.업종명.includes('IT') || data.업종명.includes('기술')) {
    recommendations.push({
      제도명: 'R&D세액공제',
      예상공제액: '연구개발비의 25%',
      조건: '기술개발 투자',
      우선순위: '높음'
    });
  }
  
  return recommendations;
}

// 요약 생성
function generateSummary(data, trend) {
  return `${data.사업장명}은 ${data.업종명} 분야의 기업으로, 최근 ${trend.트렌드} 추세를 보이고 있습니다. 평균 고용 증가율은 ${trend.평균증가율}%입니다.`;
} 