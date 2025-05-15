/**
 * React 개발 서버 프록시 설정
 * /data-api 경로가 제대로 처리되도록 함
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // data-api 프록시 설정
  app.use(
    '/data-api',
    createProxyMiddleware({
      // 이 부분은 개발 환경에 맞게 설정해야 합니다
      // Azure Static Web Apps에서는 내부적으로 처리됨
      target: 'http://localhost:7071',
      changeOrigin: true,
      pathRewrite: {
        '^/data-api': '/api/data-api-proxy',  // Function API 엔드포인트로 리디렉션
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('프록시 요청:', req.method, req.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('프록시 응답:', proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error('프록시 오류:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ 
          error: '데이터 API 프록시 오류',
          message: err.message,
          details: '개발 환경에서는 Azure Functions 로컬 에뮬레이터가 필요합니다.'
        }));
      }
    })
  );

  // 개발 중에 API 요청을 확인하기 위한 로깅 미들웨어
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
};
