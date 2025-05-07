const sql = require('mssql');

module.exports = async function executeQuery(query) {
  try {
    // 개별 속성으로 연결 설정 구성
    const config = {
      server: process.env.DB_SERVER || 'naub5k.database.windows.net',
      user: process.env.DB_USER || 'naub5k',
      password: process.env.DB_PASS || 'dunkin3106UB!',
      database: process.env.DB_NAME || 'CleanDB',
      options: {
        encrypt: true
      }
    };
    
    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
    await sql.close();
    return result;
  } catch (err) {
    console.error('Database error:', err.message);
    await sql.close();
    throw err;
  }
}; 