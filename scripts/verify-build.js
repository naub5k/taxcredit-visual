/**
 * 빌드 검증 스크립트
 * - 빌드 폴더 존재 확인
 * - 필수 파일 존재 확인
 * - staticwebapp.config.json 파일 존재 확인
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '../build');
const REQUIRED_FILES = [
  'index.html',
  'static',
  'favicon.ico',
  'manifest.json',
  'health.html',
  'health'
];

function verifyBuild() {
  console.log('🔍 빌드 폴더 검증 시작...');
  
  // 빌드 폴더 존재 확인
  if (!fs.existsSync(BUILD_DIR)) {
    console.error('❌ 빌드 폴더가 존재하지 않습니다!');
    process.exit(1);
  }
  
  // 필수 파일 존재 확인
  const missingFiles = [];
  
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(BUILD_DIR, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error(`❌ 다음 필수 파일이 누락되었습니다: ${missingFiles.join(', ')}`);
    process.exit(1);
  }
  
  // staticwebapp.config.json 확인
  const configFile = path.join(BUILD_DIR, 'staticwebapp.config.json');
  const rootConfigFile = path.join(__dirname, '../staticwebapp.config.json');
  
  if (!fs.existsSync(configFile)) {
    console.warn('⚠️ build/staticwebapp.config.json 파일이 없습니다. 루트에서 복사합니다.');
    
    if (fs.existsSync(rootConfigFile)) {
      try {
        const configContent = fs.readFileSync(rootConfigFile);
        fs.writeFileSync(configFile, configContent);
        console.log('✅ staticwebapp.config.json 파일을 빌드 폴더에 복사했습니다.');
      } catch (error) {
        console.error(`❌ staticwebapp.config.json 파일 복사 중 오류: ${error.message}`);
        process.exit(1);
      }
    } else {
      console.error('❌ 루트에 staticwebapp.config.json 파일이 없습니다!');
      process.exit(1);
    }
  }
  
  // web.config 파일 확인 (Azure 배포에 필요)
  const webConfigFile = path.join(BUILD_DIR, 'web.config');
  if (!fs.existsSync(webConfigFile)) {
    console.warn('⚠️ build/web.config 파일이 없습니다. 자동 생성합니다.');
    
    const webConfigContent = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
  </system.webServer>
</configuration>`;
    
    try {
      fs.writeFileSync(webConfigFile, webConfigContent);
      console.log('✅ web.config 파일을 빌드 폴더에 생성했습니다.');
    } catch (error) {
      console.error(`❌ web.config 파일 생성 중 오류: ${error.message}`);
      process.exit(1);
    }
  }
  
  console.log('✅ 빌드 검증 완료! 모든 필수 파일이 존재합니다.');
}

// 스크립트 실행
verifyBuild(); 