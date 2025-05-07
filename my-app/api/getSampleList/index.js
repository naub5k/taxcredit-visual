const sql = require('mssql');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try {
        // SQL Server 연결 설정
        const config = {
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            server: process.env.DB_SERVER,
            database: process.env.DB_NAME,
            options: {
                encrypt: true, // Azure SQL 필수 설정
                trustServerCertificate: false
            }
        };

        // SQL Server에 연결
        await sql.connect(config);
        
        // URL 쿼리 파라미터에서 시도와 구군 가져오기 (영문 파라미터명만 사용)
        const sido = req.query.sido || null;
        const gugun = req.query.gugun || null;
        
        let result;
        
        // 매개변수화된 쿼리 작성
        if (sido && gugun) {
            // 시도와 구군 모두 지정된 경우
            const request = new sql.Request();
            request.input('sido', sql.NVarChar, sido);
            request.input('gugun', sql.NVarChar, gugun);
            
            result = await request.query(`
                SELECT 사업장명, 시도, 구군, [2023], [2024]
                FROM Insu_sample
                WHERE 시도 = @sido AND 구군 = @gugun
            `);
        } 
        else if (sido) {
            // 시도만 지정된 경우
            const request = new sql.Request();
            request.input('sido', sql.NVarChar, sido);
            
            result = await request.query(`
                SELECT 사업장명, 시도, 구군, [2023], [2024]
                FROM Insu_sample
                WHERE 시도 = @sido
            `);
        }
        else {
            // 기본 쿼리 - 서울특별시와 경기도만 조회
            result = await sql.query(`
                SELECT 사업장명, 시도, 구군, [2023], [2024]
                FROM Insu_sample
                WHERE 시도 IN (N'서울특별시', N'경기도')
            `);
        }

        // 응답 전송
        context.res = {
            status: 200,
            body: result.recordset,
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (err) {
        context.log.error('SQL 연결 오류:', err);
        context.res = {
            status: 500,
            body: {
                error: '데이터를 가져오는 중 오류가 발생했습니다.',
                details: err.message
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } finally {
        // 연결 종료
        sql.close();
    }
}; 