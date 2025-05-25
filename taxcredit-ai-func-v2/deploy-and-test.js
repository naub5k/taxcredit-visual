const { exec } = require('child_process');
const axios = require('axios');

// 명령 실행 유틸리티 함수
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`명령어 실행: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`실행 오류: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Azure 함수 테스트
async function testAzureFunction() {
  try {
    console.log('\n==== Azure 함수 테스트 중... ====');
    
    const response = await axios.post('https://taxcredit-ai-func-v2.azurewebsites.net/api/aimodelquery', {
      model: 'gpt',
      input: '세무사무소의 주요 업무는 무엇인가요?'
    });
    
    console.log('응답 상태:', response.status);
    console.log('응답 결과:', response.data);
    console.log('==== 테스트 완료! ====');
    return true;
  } catch (error) {
    console.error('함수 호출 오류:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
    }
    return false;
  }
}

// 메인 함수
async function main() {
  try {
    // 1. 함수 배포
    console.log('==== Azure 함수 배포 중... ====');
    await runCommand('npm run deploy');
    
    // 잠시 대기 (배포 후 함수가 활성화되는데 시간이 필요)
    console.log('배포 완료 후 함수 활성화 대기 중... (30초)');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // 2. 함수 URL 가져오기
    const functionUrl = await runCommand('npm run get-url');
    console.log(`함수 URL: ${functionUrl.trim()}`);
    
    // 3. 함수 테스트
    const testSuccess = await testAzureFunction();
    
    if (testSuccess) {
      console.log('\n✅ 모든 과정이 성공적으로 완료되었습니다!');
    } else {
      console.log('\n❌ 함수 테스트에 실패했습니다. 로그를 확인하세요.');
    }
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

main(); 