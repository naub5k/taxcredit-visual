### 📄 Insu_* 테이블 공통 스키마 정의

해당 스키마는 `Insu_clean`, `Insu_sample`, `Insu_clean_raw` 테이블 모두에 적용되는 공통 구조입니다.

---

| 컬럼명         | 타입           | Null 허용 여부 |
|----------------|----------------|----------------|
| ID             | int            | ❌ Unchecked   |
| 사업자등록번호 | varchar(20)    | ❌ Unchecked   |
| 사업장명       | nvarchar(100)  | ❌ Unchecked   |
| 우편번호       | varchar(10)    | ❌ Unchecked   |
| 사업장주소     | nvarchar(200)  | ✅ Checked     |
| 업종코드       | varchar(20)    | ❌ Unchecked   |
| 업종명         | nvarchar(100)  | ✅ Checked     |
| 성립일자       | date           | ❌ Unchecked   |
| [2016] ~ [2025]| int            | ✅ Checked     |
| 중복횟수       | int            | ✅ Checked     |
| 분류           | nvarchar(20)   | ✅ Checked     |
| 시도           | nvarchar(20)   | ✅ Checked     |
| 구군           | nvarchar(100)  | ✅ Checked     |
| 제외여부       | nvarchar(10)   | ✅ Checked     |

---

- 세 테이블은 컬럼 구조가 완전히 동일하며,
- 현재 `대표자명`, `주소` 컬럼은 **존재하지 않음** (→ 사용 시 오류 발생)
- 쿼리 작성 시 **존재하는 컬럼만 참조**해야 함

해당 문서는 `.cursor/discussions/schema_reference`로 보관 추천드립니다.
