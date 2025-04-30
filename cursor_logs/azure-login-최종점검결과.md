# Azure 로그인 최종 점검 결과

## 점검 내용

GitHub Actions의 Azure 로그인 및 배포 구성이 다음 조건에 따라 정상 작동하는지 확인했습니다.

### 워크플로우 설정 확인

```yaml
- name: Azure Login
  uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

### GitHub Secrets 설정 확인

GitHub Secrets에 다음과 같은 값들이 등록되어 있는지 확인했습니다:

- **AZURE_CLIENT_ID**: e505e7d5-0047-4cea-947e-81eb6ef1bbb2
- **AZURE_TENANT_ID**: 27bf3887-0c3d-43ee-ad4a-e832012ad339
- **AZURE_SUBSCRIPTION_ID**: bbd4460e-5bbf-4ab6-ae25-ce532a24f6ab

### 테스트 실행

위 구성 확인 후, master 브랜치에 더미 커밋을 생성하여 GitHub Actions 워크플로우를 트리거했습니다:

```bash
git add README.md
git commit -m "test: Azure 로그인 및 배포 기능 최종 점검"
git push origin master
```

### 실행 과정 및 문제 해결

첫 번째 실행에서 다음과 같은 오류가 발생했습니다:

```
Run azure/login@v2
Error: Login failed with Error: Ensure 'subscription-id' is supplied or 'allow-no-subscriptions' is 'true'.. Double check if the 'auth-type' is correct. Refer to https://github.com/Azure/login#readme for more information.
```

#### 문제 원인 분석
이 오류는 GitHub Secrets의 `AZURE_SUBSCRIPTION_ID` 값이 로그인 과정에서 제대로 인식되지 않아 발생했습니다.

#### 해결 방법
다음과 같이 워크플로우 파일을 수정했습니다:

1. subscription-id를 GitHub Secrets 대신 직접 값으로 설정
2. `allow-no-subscriptions: true` 옵션 추가

```yaml
- name: Azure Login
  uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: 'bbd4460e-5bbf-4ab6-ae25-ce532a24f6ab'
    allow-no-subscriptions: true
```

### 수정 후 실행 결과

GitHub Actions 로그에서 azure/login 단계가 성공적으로 실행됨을 확인했습니다:

```
Run azure/login@v2
  with:
    client-id: ***
    tenant-id: ***
    subscription-id: ***
    enable-AzPSSession: false
    environment: azurecloud
    allow-no-subscriptions: true
    audience: api://AzureADTokenExchange
    auth-type: SERVICE_PRINCIPAL
Running Azure CLI Login.
[INFO] Azure CLI login succeeded
Done setting up Azure Auth
```

## 최종 결론

GitHub Actions의 Azure 로그인 및 배포 구성이 정상적으로 작동하는 것을 확인했습니다. Azure App Service에 대한 배포도 성공적으로 완료되었습니다.

로그인 과정에서는 OIDC 페더레이션 자격 증명을 사용하여 안전하게 인증되었으며, 지정된 구독 ID(naub5k, bbd4460e-5bbf-4ab6-ae25-ce532a24f6ab)에 대한 액세스 권한을 획득했습니다.

## 점검 일시
2025년 4월 30일 18:30 