#!/bin/bash
# Static website startup script for Azure App Service (Linux)

# 디렉토리 확인
echo "Current directory: $(pwd)"
echo "Files in wwwroot:"
ls -la

# Node.js 버전 확인
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

# Nginx 설정 적용 (Nginx를 사용하는 경우)
if [ -f "default.conf" ]; then
  echo "Applying Nginx configuration..."
  cp default.conf /etc/nginx/sites-available/default
  service nginx reload
fi

# Express 서버 설정 (대안)
if [ ! -f "serve.js" ]; then
  echo "Creating simple Express server for static files..."
  cat > serve.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// 정적 파일 제공
app.use(express.static(__dirname));

// SPA 라우팅을 위해 모든 요청을 index.html로 리디렉션
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
EOF

  # 필요한 경우 Express 설치
  npm install express --no-save
  
  # Express 서버 시작
  node serve.js &
fi

echo "Startup script completed." 