# 작업요청서: Clean_sub_Tool 압축 생성

## 🧾 요청일자
2025-05-05

## 🎯 작업 목적
GitHub 저장소에는 포함되지 않는 프로젝트 실행 외 작업 자료들을 하나의 패키지로 압축하여 보관합니다.  
이 패키지는 프로젝트 재현, GPT-Cursor 세션 복원, 작업 흐름 분석 등에 활용됩니다.

---

## 📁 압축 대상 (상대경로: `my-app/`)
- `cursor_requests/`
- `cursor_results/`
- `.cursor/`
- `scripts/`
- `archives/`
- `temp/`
- `DEPLOYMENT.md`
- `staticwebapp.config.json`

---

## ❌ 압축 제외 대상
- `node_modules/`
- `build/`
- `.git/`
- `package-lock.json`

---

## 📦 출력 파일명
`Clean_sub_Tool_2025-05-05.zip`

## 📂 저장 경로
`my-app/archives/` 또는 `my-app/project_packages/`

---

## 🛠️ 실행 방식 제안
Cursor는 위 디렉토리 구조와 파일을 기준으로 압축을 수행해주시고,  
기존 zip 파일이 존재한다면 덮어쓰지 않고 `_v2` 등의 버전 구분을 부탁드립니다.
