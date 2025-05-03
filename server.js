/**
 * Azure App Service 시작점
 * 이 파일은 Azure App Service에서 Node.js 웹앱의 시작점으로 사용됩니다.
 */

const path = require('path');
const fs = require('fs');

// 환경 정보 출력
console.log(`Starting Azure App Service server...`);
console.log(`Node version: ${process.version}`);
console.log(`Current directory: ${process.cwd()}`);
console.log(`Files in current directory:`);

try {
  const files = fs.readdirSync('.');
  files.forEach(file => console.log(` - ${file}`));
  
  console.log(`\nFiles in build directory:`);
  if (fs.existsSync('./build')) {
    const buildFiles = fs.readdirSync('./build');
    buildFiles.forEach(file => console.log(` - ${file}`));
  } else {
    console.log('build directory does not exist');
  }
} catch (err) {
  console.error('Error listing directory contents:', err);
}

// serve.js 파일이 존재하는지 확인
const servePath = path.join(__dirname, 'build', 'serve.js');
if (fs.existsSync(servePath)) {
  console.log(`Found serve.js at ${servePath}`);
  
  try {
    // serve.js 실행
    console.log('Executing serve.js...');
    require(servePath);
  } catch (err) {
    console.error('Error executing serve.js:', err);
    
    // 오류 발생 시 간단한 Express 서버 실행
    console.log('Starting fallback Express server...');
    const express = require('express');
    const app = express();
    const port = process.env.PORT || 8080;
    
    app.get('/', (req, res) => {
      res.send('Fallback server running. Main application failed to start.');
    });
    
    app.listen(port, () => {
      console.log(`Fallback server running on port ${port}`);
    });
  }
} else {
  console.error(`serve.js not found at ${servePath}`);
  console.log('Creating simple Express server...');
  
  // Express 서버 생성
  const express = require('express');
  const app = express();
  const port = process.env.PORT || 8080;
  
  // 정적 파일 제공 (build 디렉토리가 있는 경우)
  if (fs.existsSync('./build')) {
    app.use(express.static('./build'));
    
    // SPA 라우팅
    app.get('*', (req, res) => {
      const indexPath = path.join(__dirname, 'build', 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('index.html not found');
      }
    });
  } else {
    app.get('*', (req, res) => {
      res.status(500).send('Build directory not found');
    });
  }
  
  app.listen(port, () => {
    console.log(`Simple Express server running on port ${port}`);
  });
} 