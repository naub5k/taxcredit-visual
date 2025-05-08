// 빌드 후 처리 스크립트 - 크로스 플랫폼 호환
const fs = require('fs');
const path = require('path');

// 경로 설정
const rootDir = path.resolve(__dirname, '..');
const configSource = path.join(rootDir, 'staticwebapp.config.json');
const buildDir = path.join(rootDir, 'build');
const configDest = path.join(buildDir, 'staticwebapp.config.json');

// 로깅 함수
function log(message) {
  console.log(`[빌드 후 처리] ${message}`);
}

// 메인 함수
async function main() {
  try {
    // 빌드 디렉토리 확인
    if (!fs.existsSync(buildDir)) {
      throw new Error(`빌드 디렉토리가 존재하지 않습니다: ${buildDir}`);
    }

    // 설정 파일 확인
    if (!fs.existsSync(configSource)) {
      throw new Error(`설정 파일이 존재하지 않습니다: ${configSource}`);
    }

    // 설정 파일 복사
    fs.copyFileSync(configSource, configDest);
    log(`설정 파일 복사 완료: ${configDest}`);

    return 0; // 성공
  } catch (error) {
    log(`오류 발생: ${error.message}`);
    return 1; // 실패
  }
}

// 스크립트 실행
main()
  .then(exitCode => {
    if (exitCode !== 0) {
      process.exit(exitCode);
    }
  })
  .catch(error => {
    log(`예상치 못한 오류: ${error.message}`);
    process.exit(1);
  }); 