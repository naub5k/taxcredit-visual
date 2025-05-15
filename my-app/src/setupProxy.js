/**
 * React 개발 서버 프록시 설정
 * /api 경로의 요청을 Azure Functions로 전달합니다.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Azure Functions API 프록시 설정
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://taxcredit-api-func-v2.azurewebsites.net',
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        console.log('API 프록시 요청:', req.method, req.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('API 프록시 응답:', proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error('API 프록시 오류:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ 
          error: 'API 연결 오류',
          message: err.message,
          details: '요청한 API에 접근할 수 없습니다.'
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
