const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 8080;

// 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 정적 파일 제공
app.use(express.static(__dirname));

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// SPA 라우팅을 위해 모든 요청을 index.html로 리디렉션
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  
  // 파일 시스템 확인 로그
  console.log('Current directory content:');
  fs.readdir(__dirname, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    files.forEach(file => {
      console.log(` - ${file}`);
    });
  });
}); 