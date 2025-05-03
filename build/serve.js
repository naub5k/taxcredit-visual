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
  // 명시적인 오류 처리 추가
  try {
    const indexPath = path.resolve(__dirname, 'index.html');
    // 파일 존재 확인
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error(`index.html not found at ${indexPath}`);
      res.status(500).send('index.html not found');
    }
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).send('Something broke!');
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: NODE_ENV=${process.env.NODE_ENV}`);
  console.log(`Working directory: ${process.cwd()}`);
  
  // 파일 시스템 확인 로그
  console.log('Current directory content:');
  try {
    const files = fs.readdirSync(__dirname);
    files.forEach(file => {
      const stats = fs.statSync(path.join(__dirname, file));
      console.log(` - ${file} (${stats.isDirectory() ? 'directory' : 'file'}, ${stats.size} bytes)`);
    });
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}); 