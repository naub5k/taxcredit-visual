// mcp-run.js (간결화된 버전)
const fs = require("fs");
const path = require("path");

// 컨텍스트 로드 함수
function loadContext() {
  try {
    const contextPath = path.join(__dirname, "../contexts/default_context.md");
    return fs.existsSync(contextPath) ? fs.readFileSync(contextPath, "utf-8") : "";
  } catch (err) {
    console.error("Context loading error:", err.message);
    return "";
  }
}

// 워크플로우 타입 감지
function detectWorkflowType(input) {
  try {
    return JSON.parse(input).workflowType || "default";
  } catch {
    return "default";
  }
}

// 입력 처리
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => input += chunk);

process.stdin.on("end", () => {
  try {
    const context = loadContext();
    const workflowType = detectWorkflowType(input);
    
    process.stdout.write(JSON.stringify({
      result: `✅ MCP 응답 [${workflowType}]\n${context}\n입력: ${input.trim() || "[없음]"}`
    }));
  } catch (err) {
    process.stdout.write(JSON.stringify({ error: `오류: ${err.message}` }));
  }
});

// 프로세스 종료 처리
process.on("exit", () => {
  process.stdout.write(JSON.stringify({ result: "�� MCP 종료" }));
});
