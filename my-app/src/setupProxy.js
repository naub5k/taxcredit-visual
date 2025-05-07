const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('프록시 설정 로드됨');
  
  const apiProxy = createProxyMiddleware({
    target: 'http://localhost:7071',
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
    timeout: 60000,           // 1분으로 증가
    proxyTimeout: 60000,      // 1분으로 증가
    onProxyReq: (proxyReq, req, res) => {
      console.log(`프록시 요청: ${req.method} ${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`프록시 응답: ${proxyRes.statusCode} ${req.url}`);
    },
    onError: (err, req, res) => {
      console.error(`프록시 오류: ${err.message}`);
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({
        error: '프록시 연결 실패',
        message: err.message
      }));
    }
  });
  
  app.use('/api', apiProxy);
  console.log('프록시 설정 완료: /api -> http://localhost:7071/api');
};
