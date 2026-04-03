# 보안 스페셜리스트 리뷰 체크리스트
> gstack review/specialists/security.md 기반, Java/Python/Node.js 스택 반영
> 트리거: auth 관련 변경 OR 백엔드 diff > 100 라인
> 출력: JSON (1 finding per line) 또는 `NO FINDINGS`

```json
{"severity":"CRITICAL|INFORMATIONAL","confidence":0-10,"path":"file","line":0,
 "category":"security","summary":"...","fix":"...","specialist":"security"}
```

---

## 카테고리

### 신뢰 경계의 입력 검증
- 컨트롤러/핸들러 레벨에서 검증 없이 사용자 입력 수락
- DB 쿼리나 파일 경로에 직접 사용된 쿼리 파라미터
- 타입 검사 또는 스키마 검증 없는 요청 본문 필드
- 타입/크기/콘텐츠 검증 없는 파일 업로드
- 서명 검증 없이 처리되는 웹훅 페이로드

### 인증 & 인가 우회
- 인증 미들웨어 없는 엔드포인트 (라우트 정의 확인)
- "거부" 대신 "허용"을 기본으로 하는 인가 검사
- 역할 에스컬레이션 경로 (사용자가 자신의 역할/권한 수정 가능)
- 직접 객체 참조 취약점 (ID 변경으로 타 사용자 데이터 접근)
- 만료 확인 없는 토큰/API 키 검증

### 인젝션 벡터 (SQL 외)
- 사용자 제어 인수가 포함된 subprocess 커맨드 인젝션
- 사용자 입력이 포함된 템플릿 인젝션 (Jinja2, Thymeleaf, Handlebars)
- 사용자 제어 URL을 통한 SSRF (fetch, redirect, 웹훅 대상)
- 사용자 제어 파일 경로를 통한 경로 순회 (`../../etc/passwd`)
- HTTP 헤더에 사용자 제어 값을 통한 헤더 인젝션

### 암호화 오용
- 보안 민감 작업에 약한 해싱 알고리즘 (MD5, SHA-1)
- 토큰이나 시크릿에 예측 가능한 난수 (`Math.random()`, `random.random()`)
- 시크릿, 토큰, digest에 비-상수-시간 비교 (`==` 사용)
- 하드코딩된 암호화 키 또는 IV
- 비밀번호 해싱에 솔트 누락

### 시크릿 노출
- 소스 코드의 API 키, 토큰, 비밀번호 (주석 포함)
- 애플리케이션 로그 또는 에러 메시지에 기록된 시크릿
- URL의 자격증명 (쿼리 파라미터 또는 URL 내 기본 인증)
- 사용자에게 반환되는 에러 응답의 민감 데이터
- 암호화가 예상되는 곳에 평문 저장된 PII

### XSS 이스케이프 구멍
- React: `dangerouslySetInnerHTML` + 사용자 컨텐츠
- Vue: `v-html` + 사용자 컨텐츠
- 비sanitized 데이터로의 `innerHTML` 할당

### 역직렬화
- 신뢰할 수 없는 데이터 역직렬화 (Python: `pickle`, Java: `ObjectInputStream`, YAML.load)
- 스키마 검증 없이 사용자 입력 또는 외부 API의 직렬화된 객체 수락

### Java 특화
- Spring Security 설정에서 `permitAll()` 남용
- `@PreAuthorize` 없는 public 엔드포인트
- XML 외부 엔티티(XXE) 처리 (DTD 비활성화 확인)
- Java 역직렬화 가젯 체인 위험

### Python 특화
- Flask/FastAPI에서 `DEBUG=True` 프로덕션 노출
- `subprocess`에 `shell=True` + 사용자 입력
- `eval()` / `exec()` on LLM 생성 코드
