// db-utils.js - 데이터베이스 연결 및 쿼리 실행 유틸리티

const sql = require('mssql');

// 연결 설정
const config = {
  server: process.env.DB_SERVER || 'taxcredit-sql-server.database.windows.net',
  database: process.env.DB_NAME || 'taxcredit_db',
  user: process.env.DB_USER || 'taxcreditdbadmin',
  password: process.env.DB_PASSWORD || 'Tax@Credit2025',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: true, // Azure SQL 필요 옵션
    trustServerCertificate: false, // Azure SQL은 false로 유지
    connectTimeout: 30000, // 타임아웃 30초로 설정
    requestTimeout: 30000 // 쿼리 실행 타임아웃 30초로 설정
  }
};

/**
 * SQL 쿼리 실행 함수
 * @param {string} query - 실행할 SQL 쿼리
 * @returns {Promise<Object>} 쿼리 결과
 */
const executeQuery = async (query) => {
  console.log('[DB-UTILS] 데이터베이스 연결 시도... 설정:', JSON.stringify({
    server: config.server,
    database: config.database,
    user: config.user,
    port: config.port
  }));

  try {
    // 새 연결 생성
    const pool = await sql.connect(config);
    console.log('[DB-UTILS] 데이터베이스 연결 성공');
    
    // 쿼리 실행
    console.log('[DB-UTILS] 쿼리 실행:', query);
    const result = await pool.request().query(query);
    
    console.log('[DB-UTILS] 쿼리 결과 레코드 수:', result.recordset?.length || 0);
    if (!result.recordset || result.recordset.length === 0) {
      console.log('[DB-UTILS] 경고: 쿼리 결과가 비어 있습니다');
    }
    
    return result;
  } catch (err) {
    console.error('[DB-UTILS] 데이터베이스 오류:', err);
    throw new Error(`데이터베이스 오류: ${err.message}`);
  }
};

module.exports = executeQuery; 