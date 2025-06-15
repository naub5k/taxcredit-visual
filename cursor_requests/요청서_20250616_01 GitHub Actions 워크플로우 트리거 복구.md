# ✅ 요청서\_20250616\_01: GitHub Actions 워크플로우 트리거 복구

## 🧩 목적

현재 `my-app/.github/workflows/` 경로에 위치한 Azure Static Web Apps 워크플로우가 **GitHub Actions에서 인식되지 않아 트리거되지 않음**. GitHub는 **루트 기준 `.github/workflows/` 디렉토리만 유효**하므로 이를 원래 위치로 복원함.

---

## 📂 작업 대상 디렉토리

```
프로젝트 루트: D:/Projects/taxcredit-visual
잘못된 경로: my-app/.github/workflows/azure-static-web-apps-deploy.yml
올바른 경로: .github/workflows/azure-static-web-apps-polite-desert-03a31df00.yml
```

---

## 🛠 작업 내역

### 1. 기존 워크플로우 파일 이동

```bash
mv my-app/.github/workflows/azure-static-web-apps-deploy.yml .github/workflows/azure-static-web-apps-polite-desert-03a31df00.yml
```

### 2. Git 반영

```bash
cd D:/Projects/taxcredit-visual

git add .
git commit -m "fix: 워크플로우 루트로 이동하여 자동 배포 트리거 복구"
git push origin master
```

---

## ✅ 기대 효과

* GitHub Actions 트리거 정상 작동
* Static Web App 자동 배포 정상화
* `output_location: my-app/build` 설정 오류 해결 확인 가능

---

## 📝 기타

* 이후 워크플로우 파일은 항상 **루트의 `.github/workflows/`** 하위에 위치해야 함.
* `my-app/` 하위에서의 워크플로우 운영은 GitHub에서 **지원하지 않음**
