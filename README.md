# 📊 TaxCredit Visual - 고용이력 시각화 웹앱

> **배포 성공 시점**: 2025-06-16  
> **배포 주소**: [https://polite-desert-03a31df00.azurestaticapps.net](https://polite-desert-03a31df00.azurestaticapps.net)

## 🎯 **프로젝트 개요**

고용이력 현황 데이터(~2025)를 시각화하는 React 웹 애플리케이션입니다. 세액공제 분석 시스템과 연동되어 실시간 데이터를 차트와 그래프로 표현합니다.

## 📌 **배포 정보**

- **배포 방식**: Azure Static Web Apps
- **Git 기준 경로**: `taxcredit-visual/`
- **React 앱 경로**: `my-app/`
- **빌드 결과물**: `my-app/build/`

## ✅ **배포 확인 방법**

배포가 정상적으로 완료되었는지 확인하려면:

1. 배포 사이트 접속: [https://polite-desert-03a31df00.azurestaticapps.net](https://polite-desert-03a31df00.azurestaticapps.net)
2. **좌측 하단**에 **"20250615 visual 적용됨"** 문구 확인
3. 고용이력 데이터 시각화 기능 정상 작동 확인

## 🧩 **프로젝트 구조**

```
taxcredit-visual/
├── .github/workflows/
│   └── azure-static-web-apps-polite-desert-03a31df00.yml  # Azure 배포 워크플로우
└── my-app/                                                 # React 애플리케이션
    ├── public/
    │   └── index.html                                      # 배포 확인 문구 포함
    ├── src/
    ├── build/                                              # 빌드 결과물 (git 포함)
    ├── package.json
    └── .gitignore                                          # /build 주석 처리
```

## 🛠️ **해결된 주요 문제들**

### 1. **GitHub Actions 트리거 문제**
- **문제**: `my-app/.github/workflows/`에 워크플로우 배치 → GitHub Actions 인식 불가
- **해결**: 워크플로우를 루트 `.github/workflows/`로 이동

### 2. **경로 설정 문제**
- **문제**: `output_location: "my-app/build"` → Azure가 잘못된 경로 참조
- **해결**: `output_location: "build"` (app_location 기준 상대 경로)

### 3. **Azure Functions API 빌드 실패**
- **문제**: `api_location: "my-app/api"` → Node.js 플랫폼 인식 불가
- **해결**: `api_location: ""` (API 비활성화)

### 4. **Build 폴더 Git 제외 문제**
- **문제**: `.gitignore`에서 `/build` 제외로 배포 실패
- **해결**: `/build` 주석 처리하여 Git에 포함

## 🔍 **최종 워크플로우 설정**

```yaml
# .github/workflows/azure-static-web-apps-polite-desert-03a31df00.yml
app_location: "my-app"    # React 앱 위치
output_location: "build"  # 빌드 결과물 (my-app 기준 상대 경로)
api_location: ""          # API 비활성화
```

## 🚀 **기능 검증 상태**

- ✅ **React 앱 빌드**: 성공
- ✅ **Azure Static Web Apps 배포**: 성공  
- ✅ **배포 확인 문구**: 좌측 하단에 정상 표시
- ✅ **고용이력 데이터 시각화**: 정상 작동
- ✅ **API 연동**: taxcredit-api-func와 정상 연결

## 📝 **개발 및 배포 명령어**

```bash
# 개발 서버 실행
cd my-app
npm start

# 프로덕션 빌드
cd my-app
npm run build

# 배포 (Git 작업)
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin master
```

---

**Last Updated**: 2025-06-16  
**Status**: ✅ 배포 성공 및 운영 중
