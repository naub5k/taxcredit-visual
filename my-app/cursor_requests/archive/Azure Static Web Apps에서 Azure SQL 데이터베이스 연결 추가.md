---
title: "자습서: Azure Static Web Apps에서 Azure SQL 데이터베이스 연결 추가"
created: 2025-05-15T15:56
tags: []
link: https://learn.microsoft.com/ko-kr/azure/static-web-apps/database-azure-sql?tabs=bash&pivots=static-web-apps-rest
byline: v1212
site: "@MicrosoftLearn"
date:
updated:
type:
excerpt: Azure Static Web Apps의 웹 애플리케이션에 Azure SQL 데이터베이스 연결을 추가하는 방법 알아보기
twitter: https://twitter.com/@MicrosoftLearn
onion:
source:
---

이 자습서에서는 Azure SQL 데이터베이스를 정적 웹앱에 연결하는 방법을 알아봅니다. 구성된 후에는 백 엔드 코드를 작성하지 않고도 데이터를 조작하기 위해 기본 제공 `/data-api` 엔드포인트에 REST 또는 GraphQL 요청을 수행할 수 있습니다.

간단히 설명하기 위해 이 자습서에서는 로컬 개발 목적으로 Azure 데이터베이스를 사용하는 방법을 보여 주지만, 로컬 개발 요구 사항에 따라 로컬 데이터베이스 서버를 사용할 수도 있습니다.

![개발자 도구 콘솔 창에서 Azure SQL의 결과를 보여 주는 웹 브라우저입니다.](https://learn.microsoft.com/ko-kr/azure/static-web-apps/media/database-add/static-web-apps-database-connections-list.png)

이 자습서에서는 다음을 알아봅니다.

- 정적 웹앱에 Azure SQL 데이터베이스 연결
- 데이터의 만들기, 읽기, 업데이트 및 삭제

## 필수 조건

이 자습서를 완료하려면 기존 Azure SQL 데이터베이스 및 정적 웹앱이 있어야 합니다.

|리소스|설명|
|---|---|
|[Azure SQL Database](https://learn.microsoft.com/ko-kr/azure/azure-sql/database/single-database-create-quickstart)|아직 없는 경우 [단일 데이터베이스 만들기](https://learn.microsoft.com/ko-kr/azure/azure-sql/database/single-database-create-quickstart) 가이드의 단계를 수행합니다.|
|[기존 정적 웹앱](https://learn.microsoft.com/ko-kr/azure/static-web-apps/getting-started)|아직 없는 경우 [시작](https://learn.microsoft.com/ko-kr/azure/static-web-apps/getting-started) 가이드의 단계를 수행합니다.|

먼저 Azure Static Web Apps 데이터베이스 연결 기능을 사용하도록 데이터베이스를 구성합니다.

## 데이터베이스 연결 구성

데이터베이스 연결이 작동하려면 Azure Static Web Apps에 데이터베이스에 대한 네트워크 액세스 권한이 있어야 합니다. 또한 로컬 개발에 Azure 데이터베이스를 사용하려면 자체 IP 주소의 요청을 허용하도록 데이터베이스를 구성해야 합니다.

1. [Azure Portal](https://portal.azure.com/)에서 Azure SQL Server로 이동합니다.
    
2. _보안_ 섹션에서 **네트워킹**을 선택합니다.
    
3. _공용 액세스_ 탭의 _공용 네트워크 액세스_ 옆에 있는 **선택한 네트워크**를 선택합니다.
    
4. _방화벽 규칙_ 섹션에서 **클라이언트 IPv4 주소 추가** 단추를 선택합니다. 이 단계를 수행하면 로컬 개발에 이 데이터베이스를 사용할 수 있습니다.
    
5. _예외_ 섹션에서 **Azure 서비스 및 리소스가 이 서버에 액세스할 수 있도록 허용** 확인란을 선택합니다. 이 단계에서는 배포된 Static Web Apps 리소스가 데이터베이스에 액세스할 수 있도록 합니다.
    
6. **저장**을 선택합니다.
    

## 로컬 개발을 위한 데이터베이스 연결 문자열 가져오기

로컬 개발에 Azure 데이터베이스를 사용하려면 데이터베이스의 연결 문자열을 검색해야 합니다. 개발 목적으로 로컬 데이터베이스를 사용하려는 경우 이 단계를 건너뛸 수 있습니다.

1. [Azure Portal](https://portal.azure.com/)에서 Azure SQL Server로 이동합니다.
    
2. _설정_ 섹션에서 **SQL 데이터베이스**를 선택합니다.
    
3. 이 자습서에 대해 만든 SQL 데이터베이스를 선택합니다.
    
4. _설정_ 섹션에서 **연결 문자열**을 선택합니다.
    
5. _ADO.NET(SQL 인증)_ 상자에서 연결 문자열을 복사하고 텍스트 편집기에서 따로 설정합니다.
    

연결 문자열의 `{your_password}` 자리 표시자를 암호로 바꿔야 합니다.

## 샘플 데이터 만들기

샘플 테이블을 만들고 자습서와 일치하도록 샘플 데이터로 시드합니다.

1. 왼쪽 탐색 창에서 **쿼리 편집기**를 선택합니다.
    
2. Entra ID 계정 또는 서버의 사용자 이름 및 암호를 사용하여 서버에 로그인합니다.
    
3. 다음 스크립트를 실행하여 `MyTestPersonTable`이라는 새 테이블을 만듭니다.
    
    ```
    CREATE TABLE [dbo].[MyTestPersonTable] (
        [Id] INT IDENTITY (1, 1) NOT NULL,
        [Name] VARCHAR (25) NULL,
        PRIMARY KEY (Id)
    );
    ```
    
4. 다음 스크립트를 실행하여 _MyTestPersonTable_ 테이블에 데이터를 추가합니다.
    
    ```
    INSERT INTO [dbo].[MyTestPersonTable] (Name)
    VALUES ('Sunny');
    
    INSERT INTO [dbo].[MyTestPersonTable] (Name)
    VALUES ('Dheeraj');
    ```
    

## 정적 웹앱 구성

이 자습서의 나머지 부분에서는 데이터베이스 연결을 로컬로 사용하도록 정적 웹앱의 소스 코드를 편집하는 데 중점을 둡니다.

Important

다음 단계에서는 [시작 가이드](https://learn.microsoft.com/ko-kr/azure/static-web-apps/getting-started)에서 만든 정적 웹앱으로 작업하고 있다고 가정합니다. 다른 프로젝트를 사용하는 경우 분기 이름과 일치하도록 다음 git 명령을 조정해야 합니다.

1. `main` 분기로 전환합니다.
    
2. `git pull`을 사용하여 로컬 버전을 GitHub의 버전과 동기화합니다.
    

### 데이터베이스 구성 파일 만들기

다음으로, 정적 웹앱이 데이터베이스와 인터페이스하는 데 사용하는 구성 파일을 만듭니다.

1. 터미널을 열고 연결 문자열을 저장할 새 변수를 만듭니다. 특정 구문은 사용 중인 셸 유형에 따라 달라질 수 있습니다.
    
    - [Bash](https://learn.microsoft.com/ko-kr/azure/static-web-apps/database-azure-sql?tabs=bash&pivots=static-web-apps-rest#tabpanel_3_bash)
    - [PowerShell](https://learn.microsoft.com/ko-kr/azure/static-web-apps/database-azure-sql?tabs=bash&pivots=static-web-apps-rest#tabpanel_3_powershell)
    
    ```
    export DATABASE_CONNECTION_STRING='<YOUR_CONNECTION_STRING>'
    ```
    
    `<YOUR_CONNECTION_STRING>`을 텍스트 편집기에서 따로 설정한 연결 문자열 값으로 바꿔야 합니다.
    
2. npm을 사용하여 Static Web Apps CLI를 설치하거나 업데이트합니다. 상황에 가장 적합한 명령을 선택합니다.
    
    설치하려면 `npm install`을 사용합니다.
    
    업데이트하려면 `npm update`를 사용합니다.
    
3. `swa db init` 명령을 사용하여 데이터베이스 구성 파일을 생성합니다.
    
    `init` 명령은 _swa-db-connections_ 폴더에 _staticwebapp.database.config.json_ 파일을 생성합니다.
    
4. 이 샘플을 생성한 _staticwebapp.database.config.json_ 파일에 붙여넣습니다.
    

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
          "actions": ["*"],
          "role": "anonymous"
        }
      ]
    }
  }
}
```

다음 단계로 이동하기 전에 구성 파일의 다양한 측면을 설명하는 다음 표를 검토합니다. 항목 수준 보안에 대한 관계와 정책과 같은 기능 및 구성 파일에 대한 전체 설명서는 [데이터 API 작성기 설명서](https://learn.microsoft.com/ko-kr/azure/data-api-builder/configuration-file)를 참조하세요.

|기능|설명|
|---|---|
|**데이터베이스 연결**|개발 시 런타임은 구성 파일의 연결 문자열 값에서 연결 문자열을 읽습니다. 구성 파일에서 직접 연결 문자열을 지정할 수 있지만 연결 문자열을 로컬 환경 변수에 저장하는 것이 가장 좋습니다. `@env('DATABASE_CONNECTION_STRING')` 표기법을 통해 구성 파일에서 환경 변수 값을 참조할 수 있습니다. 데이터베이스를 연결할 때 수집된 정보로 배포된 사이트의 Static Web Apps에서 연결 문자열 값을 덮어씁니다.|
|**API 엔드포인트**|이 구성 파일에 구성된 대로 REST 엔드포인트는 `/data-api/rest`를 통해 사용할 수 있지만 GraphQL 엔드포인트는 `/data-api/graphql`을 통해 사용할 수 있습니다. REST 및 GraphQL 경로를 구성할 수 있지만 `/data-api` 접두사는 구성할 수 없습니다.|
|**API 보안**|`runtime.host.cors` 설정을 사용하면 API에 요청할 수 있는 허용된 원본을 정의할 수 있습니다. 이 경우 구성은 개발 환경을 반영하고 _http://localhost:4280_ 위치를 허용 목록에 추가합니다.|
|**엔터티 모델**|REST API의 경로를 통해 노출되는 엔터티를 정의하거나 GraphQL 스키마의 유형으로 엔터티를 정의합니다. 이 경우 _Person_이라는 이름은 엔드포인트에 노출되는 이름이고 `entities.<NAME>.source`는 데이터베이스 스키마 및 테이블 매핑입니다. API 엔드포인트 이름이 테이블 이름과 동일할 필요는 없습니다.|
|**엔터티 보안**|`entity.<NAME>.permissions` 배열에 나열된 권한 규칙은 엔터티에 대한 권한 부여 설정을 제어합니다. [역할을 사용하여 경로를 보호](https://learn.microsoft.com/ko-kr/azure/static-web-apps/configuration#securing-routes-with-roles)하는 것과 동일한 방식으로 역할을 사용하여 엔터티를 보호할 수 있습니다.|

참고 항목

구성 파일의 `connection-string`, `host.mode`, `graphql.allow-introspection` 속성은 사이트를 배포할 때 덮어씁니다. 데이터베이스를 Static Web Apps 리소스에 연결할 때 수집된 인증 세부 정보로 연결 문자열을 덮어씁니다. `host.mode` 속성은 `production`으로 설정되고, `graphql.allow-introspection`은 `false`로 설정됩니다. 이러한 재정의는 개발 및 프로덕션 워크로드에서 구성 파일의 일관성을 제공하는 동시에 데이터베이스 연결을 사용하도록 설정된 Static Web Apps 리소스가 안전하고 프로덕션 준비가 되도록 보장합니다.

이제 데이터베이스에 연결하도록 구성된 정적 웹앱을 사용하여 연결을 확인할 수 있습니다.

### 홈페이지 업데이트

_index.html_ 파일에서 `body` 태그 사이의 마크업을 다음 HTML로 바꿉니다.

```
<h1>Static Web Apps Database Connections</h1>
<blockquote>
    Open the console in the browser developer tools to see the API responses.
</blockquote>
<div>
    <button id="list" onclick="list()">List</button>
    <button id="get" onclick="get()">Get</button>
    <button id="update" onclick="update()">Update</button>
    <button id="create" onclick="create()">Create</button>
    <button id="delete" onclick="del()">Delete</button>
</div>
<script>
    // add JavaScript here
</script>
```

## 로컬로 애플리케이션 시작

이제 웹 사이트를 실행하고 데이터베이스의 데이터를 직접 조작할 수 있습니다.

1. 데이터베이스 구성을 사용하여 정적 웹앱을 시작합니다.
    
    ```
    swa start --data-api-location swa-db-connections
    ```
    

이제 CLI가 시작되었으므로 _staticwebapp.database.config.json_ 파일에 정의된 대로 엔드포인트를 통해 데이터베이스에 액세스할 수 있습니다.

`http://localhost:4280/data-api/rest/<ENTITY_NAME>` 엔드포인트는 데이터베이스의 데이터를 조작하기 위한 `GET`, `PUT`, `POST` 및 `DELETE` 요청을 수락합니다.

`http://localhost:4280/data-api/graphql` 엔드포인트는 GraphQL 쿼리 및 변형을 허용합니다.

## 데이터 조작

다음 프레임워크에 구애받지 않는 명령은 데이터베이스에서 전체 CRUD 작업을 수행하는 방법을 보여 줍니다.

각 함수의 출력이 브라우저의 콘솔 창에 표시됩니다.

CMD/CTRL + SHIFT + I를 눌러 개발자 도구를 열고 **콘솔** 탭을 선택합니다.

### 모든 항목 나열

_index.html_의 `script` 태그 사이에 다음 코드를 추가합니다.

```
async function list() {
  const endpoint = '/data-api/rest/Person';
  const response = await fetch(endpoint);
  const data = await response.json();
  console.table(data.value);
}
```

이 예에서는 다음이 적용됩니다.

- `fetch` API에 대한 기본 요청은 동사 `GET`을 사용합니다.
- 응답 페이로드의 데이터는 `value` 속성에 있습니다.

```
async function list() {

  const query = `
      {
        people {
          items {
            Id
            Name
          }
        }
      }`;

  const endpoint = "/data-api/graphql";
  const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query })
  });
  const result = await response.json();
  console.table(result.data.people.items);
}
```

이 예에서는 다음이 적용됩니다.

- GraphQL 쿼리는 데이터베이스에서 `Id` 및 `Name` 필드를 선택합니다.
- 서버에 전달된 요청에는 `query` 속성에 쿼리 정의가 있는 페이로드가 필요합니다.
- 응답 페이로드의 데이터는 `data.people.items` 속성에 있습니다.

페이지를 새로 고치고 **목록** 단추를 선택합니다.

이제 브라우저의 콘솔 창에 데이터베이스의 레코드가 모두 나열된 테이블이 표시됩니다.

|ID|속성|
|---|---|
|1|맑음|
|2|Dheeraj|

브라우저에 어떻게 표시되는지 보여주는 스크린샷은 다음과 같습니다.

![개발자 도구 콘솔 창에서 데이터베이스 선택 결과를 보여 주는 웹 브라우저입니다.](https://learn.microsoft.com/ko-kr/azure/static-web-apps/media/database-add/static-web-apps-database-connections-list.png)

### ID로 가져오기

_index.html_의 `script` 태그 사이에 다음 코드를 추가합니다.

```
async function get() {
  const id = 1;
  const endpoint = `/data-api/rest/Person/Id`;
  const response = await fetch(`${endpoint}/${id}`);
  const result = await response.json();
  console.table(result.value);
}
```

이 예에서는 다음이 적용됩니다.

- 엔드포인트에 `/person/Id`이(가) 접미사로 붙습니다.
- ID 값은 엔드포인트 위치의 끝에 추가됩니다.
- 응답 페이로드의 데이터는 `value` 속성에 있습니다.

```
async function get() {

  const id = 1;

  const gql = `
    query getById($id: Int!) {
      person_by_pk(Id: $id) {
        Id
        Name
      }
    }`;

  const query = {
    query: gql,
    variables: {
      id: id,
    },
  };

  const endpoint = "/data-api/graphql";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  const result = await response.json();
  console.table(result.data.person_by_pk);
}
```

이 예에서는 다음이 적용됩니다.

- GraphQL 쿼리는 데이터베이스에서 `Id` 및 `Name` 필드를 선택합니다.
- 서버에 전달된 요청에는 `query` 속성에 쿼리 정의가 있는 페이로드가 필요합니다.
- 응답 페이로드의 데이터는 `data.person_by_pk` 속성에 있습니다.

페이지를 새로 고치고 **가져오기** 단추를 선택합니다.

이제 브라우저의 콘솔 창에 데이터베이스에서 요청한 단일 레코드가 나열된 테이블이 표시됩니다.

|ID|속성|
|---|---|
|1|맑음|

### 엽데이트

_index.html_의 `script` 태그 사이에 다음 코드를 추가합니다.

Static Web Apps는 `PUT` 및 `PATCH` 동사를 모두 지원합니다. `PUT` 요청은 전체 레코드를 업데이트하는 반면 `PATCH` 요청은 부분 업데이트를 수행합니다.

```
async function update() {

  const id = 1;
  const data = {
    Name: "Molly"
  };

  const endpoint = '/data-api/rest/Person/Id';
  const response = await fetch(`${endpoint}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const result = await response.json();
  console.table(result.value);
}

```

이 예에서는 다음이 적용됩니다.

- 엔드포인트에 `/person/Id/`이(가) 접미사로 붙습니다.
- ID 값은 엔드포인트 위치의 끝에 추가됩니다.
- REST 동사는 `PUT`으로 데이터베이스 레코드를 업데이트하는 것입니다.
- 응답 페이로드의 데이터는 `value` 속성에 있습니다.

```
async function update() {

  const id = 1;
  const data = {
    Name: "Molly"
  };

  const gql = `
    mutation update($id: Int!, $item: UpdatePersonInput!) {
      updatePerson(Id: $id, item: $item) {
        Id
        Name
      }
    }`;

  const query = {
    query: gql,
    variables: {
      id: id,
      item: data
    } 
  };

  const endpoint = "/data-api/graphql";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query)
  });

  const result = await res.json();
  console.table(result.data.updatePerson);
}
```

이 예에서는 다음이 적용됩니다.

- GraphQL 쿼리는 데이터베이스에서 `Id` 및 `Name` 필드를 선택합니다.
- `query` 개체는 `query` 속성에 GraphQL 쿼리를 포함합니다.
- GraphQL 함수에 대한 인수 값은 `query.variables` 속성을 통해 전달됩니다.
- 서버에 전달된 요청에는 `query` 속성에 쿼리 정의가 있는 페이로드가 필요합니다.
- 응답 페이로드의 데이터는 `data.updatePerson` 속성에 있습니다.

페이지를 새로 고치고 **업데이트** 단추를 선택합니다.

이제 브라우저의 콘솔 창에 업데이트된 데이터를 보여주는 테이블이 표시됩니다.

|ID|속성|
|---|---|
|1|Molly|

### 만들기

_index.html_의 `script` 태그 사이에 다음 코드를 추가합니다.

```
async function create() {

  const data = {
    Name: "Pedro"
  };

  const endpoint = `/data-api/rest/Person/`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const result = await response.json();
  console.table(result.value);
}
```

이 예에서는 다음이 적용됩니다.

- 엔드포인트에 `/person/`이(가) 접미사로 붙습니다.
- REST 동사는 `POST`로 데이터베이스 레코드를 추가하는 것입니다.
- 응답 페이로드의 데이터는 `value` 속성에 있습니다.

```
async function create() {

  const data = {
    Name: "Pedro"
  };

  const gql = `
    mutation create($item: CreatePersonInput!) {
      createPerson(item: $item) {
        Id
        Name
      }
    }`;

  const query = {
    query: gql,
    variables: {
      item: data
    } 
  };

  const endpoint = "/data-api/graphql";
  const result = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query)
  });

  const response = await result.json();
  console.table(response.data.createPerson);
}
```

이 예에서는 다음이 적용됩니다.

- GraphQL 쿼리는 데이터베이스에서 `Id` 및 `Name` 필드를 선택합니다.
- `query` 개체는 `query` 속성에 GraphQL 쿼리를 포함합니다.
- GraphQL 함수에 대한 인수 값은 `query.variables` 속성을 통해 전달됩니다.
- 서버에 전달된 요청에는 `query` 속성에 쿼리 정의가 있는 페이로드가 필요합니다.
- 응답 페이로드의 데이터는 `data.updatePerson` 속성에 있습니다.

페이지를 새로 고치고 **만들기** 단추를 선택합니다.

이제 브라우저의 콘솔 창에 데이터베이스의 새 레코드를 보여주는 테이블이 표시됩니다.

|ID|이름|
|---|---|
|3|Pedro|

### 삭제

_index.html_의 `script` 태그 사이에 다음 코드를 추가합니다.

```
async function del() {
  const id = 3;
  const endpoint = '/data-api/rest/Person/Id';
  const response = await fetch(`${endpoint}/${id}`, {
    method: "DELETE"
  });
  if(response.ok) {
    console.log(`Record deleted: ${ id }`)
  } else {
    console.log(response);
  }
}
```

이 예에서는 다음이 적용됩니다.

- 엔드포인트에 `/person/Id/`이(가) 접미사로 붙습니다.
- ID 값은 엔드포인트 위치의 끝에 추가됩니다.
- REST 동사는 `DELETE`로 데이터베이스 레코드를 제거하는 것입니다.
- 삭제에 성공하면 응답 페이로드 `ok` 속성은 `true`입니다.

```
async function del() {

  const id = 3;

  const gql = `
    mutation del($id: Int!) {
      deletePerson(Id: $id) {
        Id
      }
    }`;

  const query = {
    query: gql,
    variables: {
      id: id
    }
  };

  const endpoint = "/data-api/graphql";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query)
  });

  const result = await response.json();
  console.log(`Record deleted: ${ result.data.deletePerson.Id }`);
}
```

이 예에서는 다음이 적용됩니다.

- GraphQL 쿼리는 데이터베이스에서 `Id` 필드를 선택합니다.
- `query` 개체는 `query` 속성에 GraphQL 쿼리를 포함합니다.
- GraphQL 함수에 대한 인수 값은 `query.variables` 속성을 통해 전달됩니다.
- 서버에 전달된 요청에는 `query` 속성에 쿼리 정의가 있는 페이로드가 필요합니다.
- 응답 페이로드의 데이터는 `data.deletePerson` 속성에 있습니다.

페이지를 새로 고치고 **삭제** 단추를 선택합니다.

이제 브라우저의 콘솔 창에 삭제 요청의 응답을 보여주는 테이블이 표시됩니다.

_삭제된 레코드: 3_

로컬에서 사이트 작업을 완료했으므로 이제 Azure에 배포할 수 있습니다.

## 사이트 배포

이 사이트를 프로덕션에 배포하려면 구성 파일을 커밋하고 변경 내용을 서버에 푸시하기만 하면 됩니다.

1. 추적할 파일 변경 내용을 추가합니다.
    
    ```
    git add .
    ```
    
2. 구성 변경 내용을 커밋합니다.
    
    ```
    git commit -am "Add database configuration"
    ```
    
3. 서버에 변경 내용을 푸시합니다.
    
    ```
    git push origin main
    ```
    

## 데이터베이스를 정적 웹앱에 연결

다음 단계를 사용하여 사이트의 Static Web Apps 인스턴스와 데이터베이스 간에 연결을 만듭니다.

1. Azure Portal의 Static Web App을 엽니다.
    
2. _설정_ 섹션에서 **데이터베이스 연결**을 선택합니다.
    
3. _프로덕션_ 섹션에서 **기존 데이터베이스 연결** 링크를 선택합니다.
    
4. _기존 데이터베이스 연결_ 창에서 다음 값을 입력합니다.
    
    |속성|값|
    |---|---|
    |데이터베이스 유형|드롭다운 목록에서 데이터베이스 유형을 선택합니다.|
    |구독|드롭다운 목록에서 Azure 구독을 선택합니다.|
    |리소스 그룹|데이터베이스에 대한 리소스 그룹을 선택하거나 만듭니다.|
    |리소스 이름|원하는 데이터베이스가 있는 데이터베이스 서버 이름을 선택합니다.|
    |데이터베이스 이름|정적 웹앱에 연결할 데이터베이스의 이름을 선택합니다.|
    |인증 유형|**연결 문자열**을 선택하고 Azure SQL 사용자 이름과 암호를 입력합니다.|
    
5. **확인**을 선택합니다.
    

## 데이터베이스가 Static Web Apps 리소스에 연결되어 있는지 확인

데이터베이스를 정적 웹앱에 연결하고 사이트 빌드가 완료되면 다음 단계를 사용하여 데이터베이스 연결을 확인합니다.

1. Azure Portal의 Static Web App을 엽니다.
    
2. _Essentials_ 섹션에서 Static Web Apps 리소스의 **URL**을 선택하여 정적 웹앱으로 이동합니다.
    
3. **목록** 단추를 선택하여 모든 항목을 나열합니다.
    
    출력은 이 스크린샷에 표시된 것과 유사해야 합니다.
    
    ![개발자 도구 콘솔 창에 데이터베이스의 레코드를 나열한 결과를 보여 주는 웹 브라우저입니다.](https://learn.microsoft.com/ko-kr/azure/static-web-apps/media/database-add/static-web-apps-database-connections-list.png)
    

## 리소스 정리

이 자습서에서 만든 리소스를 제거하려면 데이터베이스 연결을 해제하고 샘플 데이터를 제거해야 합니다.

1. **데이터베이스 연결 해제**: Azure Portal에서 정적 웹앱을 엽니다. _설정_ 섹션에서 **데이터베이스 연결**을 선택합니다. 연결된 데이터베이스 옆에 있는 **세부 정보 보기**를 선택합니다. _데이터베이스 연결 세부 정보_ 창에서 **연결 해제** 단추를 선택합니다.
    
2. **샘플 데이터 제거**: 데이터베이스에서 `MyTestPersonTable`라는 테이블을 삭제합니다.
    

## 다음 단계