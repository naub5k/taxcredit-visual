---
title: "자습서: Azure CLI를 사용하여 Azure Container Apps에 배포 - Data API builder"
created: 2025-05-16T03:41
tags: []
link: https://learn.microsoft.com/ko-kr/azure/data-api-builder/tutorial-deploy-container-app-cli
byline: seesharprun
site: "@MicrosoftLearn"
date:
updated:
type:
excerpt: 이 자습서에서는 Azure CLI를 사용하여 Azure Container Apps에 Azure SQL 위한 API 솔루션을
  배포하는 데 필요한 단계를 안내합니다.
twitter: https://twitter.com/@MicrosoftLearn
onion:
source:
---

---

#### 다음을 통해 공유

---

데이터 API 작성기를 애플리케이션 스택의 일부로 Azure Container Apps와 같은 Azure 서비스에 신속하게 배포할 수 있습니다. 이 자습서에서는 Azure CLI를 사용하여 Azure에 데이터 API 작성기를 배포할 때 일반적인 작업을 자동화합니다. 먼저 데이터 API 작성기를 사용하여 컨테이너 이미지를 빌드하고 Azure Container Registry 저장합니다. 그런 다음 백업 Azure SQL 데이터베이스를 사용하여 Azure Container Apps에 컨테이너 이미지를 배포합니다. 전체 자습서는 관리 ID를 사용하여 각 구성 요소에 인증합니다.

이 자습서에서는 다음을 수행합니다.

- 역할 기반 액세스 제어 권한을 사용하여 관리 ID Create
- 샘플 AdventureWorksLT 데이터 세트를 사용하여 Azure SQL 배포
- Azure Container Registry 컨테이너 이미지 스테이징
- 데이터 API 작성기 컨테이너 이미지를 사용하여 Azure Container App 배포

Azure 구독이 아직 없는 경우 시작하기 전에 [체험 계정](https://azure.microsoft.com/free/?WT.mc_id=A261C142F)을 만듭니다.

## 사전 요구 사항

- Azure 구독

- Azure Cloud Shell
    - Azure Cloud Shell 브라우저를 통해 사용할 수 있는 대화형 셸 환경입니다. 이 셸 및 미리 설치된 명령을 사용하여 로컬 환경에 아무 것도 설치하지 않고도 이 문서의 코드를 실행합니다. Azure Cloud Shell을 시작하려면 다음을 수행합니다.
        - 이 문서의 코드 또는 명령 블록에서 **사용해 보기를** 선택합니다. **사용해 보기를** 선택하면 코드 또는 명령이 자동으로 Cloud Shell 복사되지 않습니다.
        - 로 [https://shell.azure.com](https://shell.azure.com/)이동하거나 **Cloud Shell 시작을** 선택합니다.
        - **Azure Portal** 메뉴 모음에서 Cloud Shell 선택합니다([https://portal.azure.com](https://portal.azure.com/)).

## 컨테이너 앱 Create

먼저 시스템 할당 관리 ID를 사용하여 Azure Container Apps instance 만듭니다. 이 ID는 결국 역할 기반 액세스 제어 권한을 부여하여 Azure SQL 액세스하고 Azure Container Registry.

1. 이 자습서의 뒷부분에서 여러 리소스 이름에 사용할 범용 `SUFFIX` 변수를 Create.
    
    ```
    let SUFFIX=$RANDOM*$RANDOM
    ```
    
2. 이 자습서에서 `LOCATION` 사용하도록 선택한 Azure 지역을 사용하여 변수를 Create.
    
    ```
    LOCATION="<azure-region>"
    ```
    
    참고
    
    예를 들어 **미국 서부** 지역에 배포하려는 경우 이 스크립트를 사용합니다.
    
    ```
    LOCATION="westus"
    ```
    
    현재 구독에 대해 지원되는 지역 목록은 를 사용합니다. [`az account list-locations`](https://learn.microsoft.com/ko-kr/cli/azure/account#az-account-list-locations)
    
    ```
    az account list-locations --query "[].{Name:displayName,Slug:name}" --output table
    ```
    
    자세한 내용은 [Azure 지역](https://learn.microsoft.com/ko-kr/azure/reliability/)을 참조하세요.
    
3. 리소스 그룹 이름을 사용하여 라는 `RESOURCE_GROUP_NAME` 변수를 Create. 이 자습서에서는 를 사용하는 것이 좋습니다 `msdocs-dab-*`. 이 자습서에서는 이 값을 여러 번 사용합니다.
    
    ```
    RESOURCE_GROUP_NAME="msdocs-dab$SUFFIX"    
    ```
    
4. 를 사용하여 [`az group create`](https://learn.microsoft.com/ko-kr/cli/azure/group#az-group-create)새 리소스 그룹을 Create.
    
    ```
    az group create \
      --name $RESOURCE_GROUP_NAME \
      --location $LOCATION \
      --tag "source=msdocs-dab-tutorial"
    ```
    
5. azure Container Apps instance 대해 고유하게 생성된 이름으로 명명 `API_CONTAINER_NAME``CONTAINER_ENV_NAME` 된 변수를 Create. 자습서 전체에서 이러한 변수를 사용합니다.
    
    ```
    API_CONTAINER_NAME="api$SUFFIX"
    CONTAINER_ENV_NAME="env$SUFFIX"
    ```
    
6. 를 사용하여 [`az containerapp env create`](https://learn.microsoft.com/ko-kr/cli/azure/containerapp/env#az-containerapp-env-create) 새 Azure Container Apps 환경을 만듭니다.
    
    ```
    az containerapp env create \ 
      --resource-group $RESOURCE_GROUP_NAME \
      --name $CONTAINER_ENV_NAME \
      --logs-destination none \
      --location $LOCATION
    ```
    
7. 를 사용하여 `mcr.microsoft.com/azure-databases/data-api-builder` 새 컨테이너 앱 Create DAB 컨테이너 이미지 및 [`az containerapp create`](https://learn.microsoft.com/ko-kr/cli/azure/containerapp#az-containerapp-create) 명령. 이 컨테이너 앱은 성공적으로 실행되지만 데이터베이스에 연결되지 않았습니다.
    
    ```
    az containerapp create \ 
      --resource-group $RESOURCE_GROUP_NAME \
      --environment $CONTAINER_ENV_NAME \
      --name $API_CONTAINER_NAME \
      --image "mcr.microsoft.com/azure-databases/data-api-builder" \
      --ingress "external" \
      --target-port "5000" \
      --system-assigned
    ```
    
8. 를 사용하여 [`az identity show`](https://learn.microsoft.com/ko-kr/cli/azure/identity#az-identity-show) 관리 ID의 **보안 주체** 식별자를 가져와 라는 변수`MANAGED_IDENTITY_PRINCIPAL_ID`에 값을 저장합니다.
    
    ```
    MANAGED_IDENTITY_PRINCIPAL_ID=$( \
      az containerapp show \ 
        --resource-group $RESOURCE_GROUP_NAME \
        --name $API_CONTAINER_NAME \
        --query "identity.principalId" \
        --output "tsv" \
    )
    ```
    
    팁
    
    이 명령의 출력을 항상 검사 수 있습니다.
    
    ```
    echo $MANAGED_IDENTITY_PRINCIPAL_ID
    ```
    

## 권한 할당

이제 시스템 할당 관리 ID 권한을 할당하여 Azure SQL 데이터를 읽고 Azure Container Registry. 또한 Azure Container Registry 쓸 ID 권한을 할당합니다.

1. 라는 변수 `RESOURCE_GROUP_ID` 를 Create 리소스 그룹의 식별자를 저장합니다. 를 사용하여 [`az group show`](https://learn.microsoft.com/ko-kr/cli/azure/group#az-group-show)식별자를 가져옵니다. 이 자습서에서는 이 변수를 여러 번 사용합니다.
    
    ```
    RESOURCE_GROUP_ID=$( \
      az group show \
        --name $RESOURCE_GROUP_NAME \
        --query "id" \
        --output "tsv" \
    )
    ```
    
    팁
    
    이 명령의 출력을 항상 검사 수 있습니다.
    
    ```
    echo $RESOURCE_GROUP_ID
    ```
    
2. 컨테이너를 Azure Container Registry 푸시할 수 있도록 를 사용하여 [`az role assignment create`](https://learn.microsoft.com/ko-kr/cli/azure/role/assignment#az-role-assignment-create) 계정에 [**AcrPush**](https://learn.microsoft.com/ko-kr/azure/role-based-access-control/built-in-roles/containers#acrpush) 역할을 할당합니다.
    
    ```
    CURRENT_USER_PRINCIPAL_ID=$( \
      az ad signed-in-user show \
        --query "id" \
        --output "tsv" \
    )
    
    # AcrPush
    az role assignment create \
      --assignee $CURRENT_USER_PRINCIPAL_ID \
      --role "8311e382-0749-4cb8-b61a-304f252e45ec" \
      --scope $RESOURCE_GROUP_ID
    ```
    
3. 를 다시 사용하여 [`az role assignment create`](https://learn.microsoft.com/ko-kr/cli/azure/role/assignment#az-role-assignment-create) 관리 ID에 [**AcrPull**](https://learn.microsoft.com/ko-kr/azure/role-based-access-control/built-in-roles/containers#acrpull) 역할을 할당합니다. 이 할당을 사용하면 관리 ID가 Azure Container Registry 컨테이너 이미지를 끌어올 수 있습니다. 관리 ID는 결국 Azure Container Apps instance 할당됩니다.
    
    ```
    # AcrPull    
    az role assignment create \
      --assignee $MANAGED_IDENTITY_PRINCIPAL_ID \
      --role "7f951dda-4ed3-4680-a7ca-43fe172d538d" \
      --scope $RESOURCE_GROUP_ID
    ```
    

## 데이터베이스 배포

다음으로, Azure SQL 서비스에 새 서버 및 데이터베이스를 배포합니다. 데이터베이스는 **AdventureWorksLT** 샘플 데이터 세트를 사용합니다.

1. Azure SQL 서버 instance 대해 고유하게 생성된 이름을 가진 라는 `SQL_SERVER_NAME` 변수를 Create. 이 변수는 이 섹션의 뒷부분에서 사용합니다.
    
    ```
    SQL_SERVER_NAME="srvr$SUFFIX"
    ```
    
2. 를 사용하여 [`az sql server create`](https://learn.microsoft.com/ko-kr/cli/azure/sql/server#az-sql-server-create)새 Azure SQL **서버** 리소스를 Create. 관리 ID를 이 서버의 관리자로 구성합니다.
    
    ```
    az sql server create \
      --resource-group $RESOURCE_GROUP_NAME \
      --name $SQL_SERVER_NAME \
      --location $LOCATION \
      --enable-ad-only-auth \
      --external-admin-principal-type "User" \
      --external-admin-name $API_CONTAINER_NAME \
      --external-admin-sid $MANAGED_IDENTITY_PRINCIPAL_ID
    ```
    
3. 를 사용하여 [`az sql server firewall-rule create`](https://learn.microsoft.com/ko-kr/cli/azure/sql/server/firewall-rule#az-sql-server-firewall-rule-create) Azure 서비스에서 액세스를 허용하는 방화벽 규칙을 만듭니다.
    
    ```
    az sql server firewall-rule create \
      --resource-group $RESOURCE_GROUP_NAME \
      --server $SQL_SERVER_NAME \
      --name "AllowAzure" \
      --start-ip-address "0.0.0.0" \
      --end-ip-address "0.0.0.0"
    ```
    
4. 를 사용하여 [`az sql db create`](https://learn.microsoft.com/ko-kr/cli/azure/sql/db#az-sql-db-create) 라는 Azure SQL 서버 내에 **데이터베이스**를 만듭니다`adventureworks`. 샘플 데이터를 사용하도록 데이터베이스를 구성합니다 `AdventureWorksLT` .
    
    ```
    az sql db create \
      --resource-group $RESOURCE_GROUP_NAME \
      --server $SQL_SERVER_NAME \
      --name "adventureworks" \
      --sample-name "AdventureWorksLT"
    ```
    
5. Azure SQL 서버 instance 데이터베이스에 대한 `adventureworks` 연결 문자열 사용하여 라는 `SQL_CONNECTION_STRING` 변수를 Create. 를 사용하여 [`az sql server show`](https://learn.microsoft.com/ko-kr/cli/azure/sql/server#az-sql-server-show)서버의 **정규화된 도메인 이름으로** 연결 문자열 구성합니다. 이 변수는 이 자습서의 뒷부분에서 사용합니다.
    
    ```
    SQL_SERVER_ENDPOINT=$( \
      az sql server show \
        --resource-group $RESOURCE_GROUP_NAME \
        --name $SQL_SERVER_NAME \
        --query "fullyQualifiedDomainName" \
        --output "tsv" \
    )
    
    SQL_CONNECTION_STRING="Server=$SQL_SERVER_ENDPOINT;Database=adventureworks;Encrypt=true;Authentication=Active Directory Default;"
    ```
    
    팁
    
    이 명령의 출력을 항상 검사 수 있습니다.
    
    ```
    echo $SQL_CONNECTION_STRING
    ```
    

## 컨테이너 이미지 만들기

다음으로 Dockerfile을 사용하여 컨테이너 이미지를 빌드합니다. 그런 다음, 새로 만든 Azure Container Registry instance 해당 컨테이너 이미지를 배포합니다.

1. Azure Container Registry instance 고유하게 생성된 이름을 가진 라는 `CONTAINER_REGISTRY_NAME` 변수를 Create. 이 변수는 이 섹션의 뒷부분에서 사용합니다.
    
    ```
    CONTAINER_REGISTRY_NAME="reg$SUFFIX"
    ```
    
2. 를 사용하여 [`az acr create`](https://learn.microsoft.com/ko-kr/cli/azure/acr#az-acr-create)새 Azure Container Registry instance Create.
    
    ```
    az acr create \
      --resource-group $RESOURCE_GROUP_NAME \
      --name $CONTAINER_REGISTRY_NAME \
      --sku "Standard" \
      --location $LOCATION \
      --admin-enabled false
    ```
    
3. 라는 `Dockerfile`다단계 Dockerfile을 Create. 파일에서 다음 단계를 구현합니다.
    
    - `mcr.microsoft.com/dotnet/sdk` 컨테이너 이미지를 빌드 단계의 기반으로 사용
        
    - [DAB CLI](https://learn.microsoft.com/ko-kr/azure/data-api-builder/how-to-install-cli)를 설치합니다.
        
    - 환경 변수를 연결 문자열 사용하여 SQL 데이터베이스 연결(`mssql`)에 `DATABASE_CONNECTION_STRING` 대한 구성 파일을 Create.
        
    - 테이블에 매핑된 라는 `Product` 엔터티를 `SalesLT.Product` Create.
        
    - 구성 파일을 최종 `mcr.microsoft.com/azure-databases/data-api-builder` 컨테이너 이미지에 복사합니다.
        
    
    ```
    FROM mcr.microsoft.com/dotnet/sdk:6.0-cbl-mariner2.0 AS build
    
    WORKDIR /config
    
    RUN dotnet new tool-manifest
    
    RUN dotnet tool install Microsoft.DataApiBuilder
    
    RUN dotnet tool run dab -- init --database-type "mssql" --connection-string "@env('DATABASE_CONNECTION_STRING')"
    
    RUN dotnet tool run dab -- add Product --source "SalesLT.Product" --permissions "anonymous:read"
    
    FROM mcr.microsoft.com/azure-databases/data-api-builder
    
    COPY --from=build /config /App
    ```
    
4. 을 사용하여 [`az acr build`](https://learn.microsoft.com/ko-kr/cli/azure/acr#az-acr-build)Dockerfile을 Azure Container Registry 작업으로 빌드합니다.
    
    ```
    az acr build \
      --registry $CONTAINER_REGISTRY_NAME \
      --image adventureworkslt-dab:latest \
      --image adventureworkslt-dab:{{.Run.ID}} \
      --file Dockerfile \
      .
    ```
    
5. 를 사용하여 [`az acr show`](https://learn.microsoft.com/ko-kr/cli/azure/acr#az-acr-show) 컨테이너 레지스트리의 엔드포인트를 가져와 라는 `CONTAINER_REGISTRY_LOGIN_SERVER`변수에 저장합니다.
    
    ```
    CONTAINER_REGISTRY_LOGIN_SERVER=$( \
      az acr show \
        --resource-group $RESOURCE_GROUP_NAME \
        --name $CONTAINER_REGISTRY_NAME \
        --query "loginServer" \
        --output "tsv" \
    )
    ```
    
    팁
    
    이 명령의 출력을 항상 검사 수 있습니다.
    
    ```
    echo $CONTAINER_REGISTRY_LOGIN_SERVER
    ```
    

## 컨테이너 이미지 배포

마지막으로 새 사용자 지정 컨테이너 이미지 및 자격 증명으로 Azure Container App을 업데이트합니다. 실행 중인 애플리케이션을 테스트하여 데이터베이스에 대한 연결의 유효성을 검사합니다.

1. 를 사용하여 [`az containerapp registry set`](https://learn.microsoft.com/ko-kr/cli/azure/containerapp/registry#az-containerapp-registry-set)컨테이너 레지스트리를 사용하도록 컨테이너 앱을 구성합니다.
    
    ```
    az containerapp registry set \
      --resource-group $RESOURCE_GROUP_NAME \
      --name $API_CONTAINER_NAME \
      --server $CONTAINER_REGISTRY_LOGIN_SERVER \
      --identity "system"
    ```
    
2. 를 사용하여 [`az containerapp secret set`](https://learn.microsoft.com/ko-kr/cli/azure/containerapp/secret#az-containerapp-secret-set) Azure SQL 연결 문자열 라는 비밀을 만듭니다`conn-string`.
    
    ```
    az containerapp secret set \
      --resource-group $RESOURCE_GROUP_NAME \
      --name $API_CONTAINER_NAME \
      --secrets conn-string="$SQL_CONNECTION_STRING"
    ```
    
    중요
    
    이 연결 문자열 사용자 이름 또는 암호를 포함하지 않습니다. 연결 문자열 관리 ID를 사용하여 Azure SQL 데이터베이스에 액세스합니다. 이렇게 하면 호스트에서 연결 문자열 비밀로 안전하게 사용할 수 있습니다.
    
3. 를 사용하여 [`az containerapp update`](https://learn.microsoft.com/ko-kr/cli/azure/containerapp#az-containerapp-update)새 사용자 지정 컨테이너 이미지로 컨테이너 앱을 업데이트합니다. `DATABASE_CONNECTION_STRING` 이전에 만든 `conn-string` 비밀에서 읽을 환경 변수를 설정합니다.
    
    ```
    az containerapp update \
      --resource-group $RESOURCE_GROUP_NAME \
      --name $API_CONTAINER_NAME \
      --image "$CONTAINER_REGISTRY_LOGIN_SERVER/adventureworkslt-dab:latest" \
      --set-env-vars DATABASE_CONNECTION_STRING=secretref:conn-string
    ```
    
4. 를 사용하여 [`az containerapp show`](https://learn.microsoft.com/ko-kr/cli/azure/containerapp#az-containerapp-show)실행 중인 컨테이너 앱에서 최신 수정 버전의 정규화된 도메인 이름을 검색합니다. 해당 값을 라는 `APPLICATION_URL`변수에 저장합니다.
    
    ```
    APPLICATION_URL=$( \
      az containerapp show \
        --resource-group $RESOURCE_GROUP_NAME \
        --name $API_CONTAINER_NAME \
        --query "properties.latestRevisionFqdn" \
        --output "tsv" \
    )
    ```
    
    팁
    
    이 명령의 출력을 항상 검사 수 있습니다.
    
    ```
    echo $APPLICATION_URL
    ```
    
5. URL로 이동하여 REST API를 테스트합니다 `Product` .
    
    ```
    echo "https://$APPLICATION_URL/api/Product"
    ```
    
    경고
    
    배포에는 최대 1분이 걸릴 수 있습니다. 성공적인 응답이 표시되지 않으면 브라우저를 기다렸다가 새로 고칩니다.
    

## 리소스 정리

샘플 애플리케이션 또는 리소스가 더 이상 필요하지 않은 경우 해당 배포 및 모든 리소스를 제거합니다.

```
az group delete \
  --name $RESOURCE_GROUP_NAME
```

## 다음 단계