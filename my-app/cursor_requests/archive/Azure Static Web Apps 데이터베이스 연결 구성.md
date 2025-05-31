---
title: Azure Static Web Apps 데이터베이스 연결 구성
created: 2025-05-15T15:49
tags: []
link: https://learn.microsoft.com/ko-kr/azure/static-web-apps/database-configuration#configuration
byline: v1212
site: "@MicrosoftLearn"
date:
updated:
type:
excerpt: 데이터베이스에 연결하도록 정적 웹앱을 구성합니다.
twitter: https://twitter.com/@MicrosoftLearn
onion:
source:
---

---

#### 다음을 통해 공유

---

Azure Static Web Apps 데이터베이스 연결은 다양한 Azure 데이터베이스에서 작동합니다.

데이터베이스를 정적 웹앱에 연결할 때 Azure 리소스에서 네트워크 액세스를 허용하여 Static Web Apps 작업자의 네트워크 액세스를 허용하도록 데이터베이스의 방화벽을 구성해야 합니다. 특정 Static Web Apps IP 주소 허용은 지원되지 않습니다.

관리 ID 인증 유형을 사용하는 경우 데이터베이스에 액세스하도록 정적 웹앱의 관리 ID 프로필을 구성해야 합니다.

데이터베이스에 대한 방화벽 및 관리 ID 구성에 대한 자세한 내용은 이 표를 사용합니다.

|이름|Type|방화벽|관리 ID|
|---|---|---|---|
|[Azure Cosmos DB](https://learn.microsoft.com/ko-kr/azure/cosmos-db/distributed-nosql)|Standard|[방화벽 구성](https://learn.microsoft.com/ko-kr/azure/cosmos-db/how-to-configure-firewall#configure-ip-policy)|[관리 ID 구성](https://learn.microsoft.com/ko-kr/azure/cosmos-db/managed-identity-based-authentication)|
|[Azure SQL](https://learn.microsoft.com/ko-kr/azure/azure-sql/azure-sql-iaas-vs-paas-what-is-overview?view=azuresql&preserve-view=true)|Standard|[방화벽 구성](https://learn.microsoft.com/ko-kr/azure/azure-sql/database/firewall-configure?view=azuresql&preserve-view=true#connections-from-inside-azure)|[관리 ID 구성](https://learn.microsoft.com/ko-kr/azure/azure-sql/database/authentication-azure-ad-user-assigned-managed-identity?view=azuresql&preserve-view=true)|
|[Azure Database for MySQL](https://learn.microsoft.com/ko-kr/azure/mysql/single-server/overview#azure-database-for-mysql---flexible-server)|Flex|[방화벽 구성](https://learn.microsoft.com/ko-kr/azure/mysql/flexible-server/concepts-networking-public#allow-all-azure-ip-addresses)|지원되지 않음|
|[Azure Database for PostgreSQL](https://learn.microsoft.com/ko-kr/azure/postgresql/flexible-server/)|Flex|[방화벽 구성](https://learn.microsoft.com/ko-kr/azure/postgresql/flexible-server/concepts-networking#allowing-all-azure-ip-addresses)|지원되지 않음|
|[Azure Database for PostgreSQL(단일 서버)](https://learn.microsoft.com/ko-kr/azure/postgresql/single-server/overview-single-server)|단일|[방화벽 구성](https://learn.microsoft.com/ko-kr/azure/postgresql/single-server/concepts-firewall-rules#connecting-from-azure)|[관리 ID 구성](https://techcommunity.microsoft.com/t5/azure-database-for-postgresql/connect-from-function-app-with-managed-identity-to-azure/ba-p/1517032)|

## 구성

`staticwebapp.database.config.json` 파일에서 데이터베이스 연결의 런타임 동작을 정의합니다. 데이터베이스를 정적 웹앱에 연결하기 전에 리포지토리 내에서 이 파일을 만들어야 합니다. 규칙에 따라 이 파일은 리포지토리의 루트에 있는 _swa-db-connections_ 폴더에 있지만 원하는 경우 [재배치](https://learn.microsoft.com/ko-kr/azure/static-web-apps/database-configuration#custom-configuration-folder)할 수 있습니다.

구성 파일의 목적은 다음과 같습니다.

- 엔드포인트의 `/data-api` 경로를 데이터베이스 테이블 또는 엔터티에 매핑
- REST 또는 GraphQL 엔드포인트 노출(또는 둘 다)
- 엔터티 보안 규칙 정의
- 개발 구성 설정 제어

GraphQL Azure Cosmos DB를 사용하는 경우 [`gql`스키마 파일](https://learn.microsoft.com/ko-kr/azure/data-api-builder/get-started/get-started-azure-cosmos-db#add-book-schema-file)도 제공해야 합니다.

참고 항목

Static Web Apps 데이터베이스 연결에는 구성 파일이 포함된 폴더가 필요합니다. 이 폴더에는 모든 데이터베이스 형식에 대한 _staticwebapp.database.config.json_ 구성 파일이 포함되어야 합니다. NoSQL 데이터베이스용 Cosmos DB의 경우 _staticwebapp.database.schema.gql_ 스키마 파일도 필요합니다.

규칙에 따라 이 폴더의 이름은 _swa-db-connections_이며 리포지토리의 루트에 배치됩니다. 이 규칙은 [custom-configuration-folder](https://learn.microsoft.com/ko-kr/azure/static-web-apps/database-configuration#custom-configuration-folder)를 사용하여 재정의할 수 있습니다.

## 샘플 구성 파일

다음 샘플 구성 파일에서는 Azure SQL 데이터베이스에 연결하고 REST 및 GraphQL 엔드포인트를 모두 노출하는 방법을 보여 줍니다. 구성 파일 및 지원되는 기능에 대한 자세한 내용은 [Data API Builder 설명서](https://learn.microsoft.com/ko-kr/azure/data-api-builder/configuration-file)를 참조하세요.

```
{
  "$schema": "https://github.com/Azure/data-api-builder/releases/latest/download/dab.draft.schema.json",
  "data-source": {
    "database-type": "mssql",
    "options": {
      "set-session-context": false 
    },
    "connection-string": "@env('DATABASE_CONNECTION_STRING')"
  },
  "runtime": {
    "rest": {
      "enabled": true,
      "path": "/rest"
    },
    "graphql": {
      "allow-introspection": true,
      "enabled": true,
      "path": "/graphql"
    },
    "host": {
      "mode": "production",
      "cors": {
        "origins": ["http://localhost:4280"],
        "allow-credentials": false
      },
      "authentication": {
        "provider": "StaticWebApps"
      }
    }
  },
  "entities": {
    "Person": {
      "source": "dbo.MyTestPersonTable",
      "permissions": [
        {
          "actions": ["create", "read", "update", "delete"],
          "role": "anonymous"
        }
      ]
    }
  }
}
```

|속성|설명|
|---|---|
|`$schema`|구성 파일을 해석하는 Azure Static Web Apps에 사용하는 [데이터베이스 API 작성기](https://learn.microsoft.com/ko-kr/azure/data-api-builder/)의 버전입니다.|
|`data-source`|대상 데이터베이스와 관련된 구성 설정입니다. `database-type` 속성은 `mssql`, `postgresql`, `cosmosdb_nosql` 또는 `mysql`를 허용합니다.<br><br>데이터베이스가 Static Web Apps 리소스에 연결되면 배포 시 연결 문자열을 덮어씁니다. 로컬 개발 중에 구성 파일에 정의된 연결 문자열은 데이터베이스에 연결하는 데 사용됩니다.|
|`runtime`|노출된 엔드포인트를 정의하는 섹션입니다. `rest` 및 `graphql` 속성은 해당 API 프로토콜에 액세스하는 데 사용되는 URL 조각을 제어합니다. `host` 구성 섹션에서는 개발 환경과 관련된 설정을 정의합니다. `origins` 배열에 localhost 주소 및 포트가 포함되어 있는지 확인합니다. host.mode는 데이터베이스가 Static Web Apps 리소스에 연결되면 `production`(으)로 덮어씁니다.|
|`entities`|URL 경로를 데이터베이스 엔터티 및 테이블에 매핑하는 섹션입니다. 경로를 보호하는 데 사용되는 동일한 [역할 기반 인증 규칙](https://learn.microsoft.com/ko-kr/azure/static-web-apps/configuration#authentication)도 데이터베이스 엔터티를 보호하며 각 엔터티에 대한 권한을 정의하는 데 사용할 수 있습니다. 엔터티 개체는 엔터티 간의 관계도 지정합니다.|

### 구성 파일 생성

[Static Web Apps CLI](https://github.com/Azure/static-web-apps-cli)를 사용하면 구성 파일 스텁을 생성할 수 있습니다.

Important

Static Web Apps CLI[에서](https://www.npmjs.com/package/@azure/static-web-apps-cli) 배포 보안을 강화하기 위해 2025년 1월 15일까지 Static Web Apps CLI의 최신 버전(2.0.2)으로 업그레이드해야 하는 호환성이 손상되는 변경이 도입되었습니다.

`swa db init --database-type <YOUR_DATABASE_TYPE>`을(를) 사용하여 구성 파일을 생성합니다. 기본적으로 CLI는 _swa-db-connections_라는 폴더에 새 _staticwebapp.database.config.json_을 만듭니다.

지원되는 데이터 유형은 다음과 같습니다.

- `mssql`
- `postgresql`
- `cosmosdb_nosql`
- `mysql`

### 사용자 지정 구성 폴더

_staticwebapp.database.config.json_ 파일의 기본 폴더 이름은 _swa-db-connections_입니다. 다른 폴더를 사용하려면 워크플로 파일을 업데이트하여 정적 웹앱 런타임에 구성 파일을 찾을 위치를 알려야 합니다. `data_api_location` 속성을 사용하면 구성 폴더의 위치를 정의할 수 있습니다.

참고 항목

_staticwebapp.database.config.json_ 파일을 포함하는 폴더는 정적 웹앱 리포지토리의 루트에 있어야 합니다.

다음 코드에서는 데이터베이스 구성 파일에 _db-config_ 라는 폴더를 사용하는 방법을 보여줍니다.

```
app_location: "/src"
api_location: "api"
output_location: "/dist"
data_api_location: "db-config" # Folder holding the staticwebapp.database.config.json file
```

## 데이터베이스 연결 구성

데이터베이스 연결이 작동하려면 Azure Static Web Apps에 데이터베이스에 대한 네트워크 액세스 권한이 있어야 합니다. 또한 로컬 개발에 Azure 데이터베이스를 사용하려면 자체 IP 주소의 요청을 허용하도록 데이터베이스를 구성해야 합니다. 다음은 모든 데이터베이스에 적용되는 일반적인 단계입니다. 데이터베이스 유형에 대한 특정 단계는 위의 링크를 참조하세요.

- [Azure portal](https://portal.azure.com/)에서 해당 데이터베이스로 이동합니다.
- 네트워킹 탭으로 이동합니다.
- 방화벽 규칙 섹션에서 **클라이언트 IPv4 주소 추가**를 선택합니다. 이 단계를 수행하면 로컬 개발에 이 데이터베이스를 사용할 수 있습니다.
- **Azure 서비스 및 리소스에서 이 서버에 액세스할 수 있도록 허용** 확인란을 선택합니다. 이 단계에서는 배포된 Static Web Apps 리소스가 데이터베이스에 액세스할 수 있도록 합니다.
- **저장**을 선택합니다.

## 데이터베이스 연결

데이터베이스를 정적 웹앱에 연결하면 Azure에 게시할 때 웹 사이트와 데이터베이스 간에 프로덕션 연결이 설정됩니다.

1. Azure Portal의 Static Web App을 엽니다.
    
2. _설정_ 섹션에서 **데이터베이스 연결**을 선택합니다.
    
3. _프로덕션_ 섹션에서 **기존 데이터베이스 연결** 링크를 선택합니다.
    
4. _기존 데이터베이스 연결_ 창에서 다음 값을 입력합니다.
    
    |속성|값|
    |---|---|
    |데이터베이스 유형|드롭다운 목록에서 데이터베이스 유형을 선택합니다.|
    |구독|드롭다운 목록에서 Azure 구독을 선택합니다.|
    |리소스 이름|원하는 데이터베이스가 있는 데이터베이스 서버 이름을 선택합니다.|
    |데이터베이스 이름|정적 웹앱에 연결할 데이터베이스의 이름을 선택합니다.|
    |인증 유형|데이터베이스에 연결하는 데 필요한 연결 유형을 선택합니다.|
    

## 관련 콘텐츠

다음 데이터베이스 중 하나를 사용하여 정적 웹앱에 데이터베이스를 추가합니다.

- [Azure Cosmos DB](https://learn.microsoft.com/ko-kr/azure/static-web-apps/database-azure-cosmos-db)
- [Azure SQL](https://learn.microsoft.com/ko-kr/azure/static-web-apps/database-azure-sql)
- [MySQL](https://learn.microsoft.com/ko-kr/azure/static-web-apps/database-mysql)
- [PostgreSQL](https://learn.microsoft.com/ko-kr/azure/static-web-apps/database-postgresql)

또한 Azure Static Web Apps에서 [데이터 API 작성기](https://learn.microsoft.com/ko-kr/azure/data-api-builder/how-to-deploy-static-web-app)를 사용하는 방법에 대해 알아볼 수 있습니다.