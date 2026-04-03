# PR 리뷰 체크리스트
> gstack review/checklist.md 기반으로 우리 스택(Java/Python/Node.js/React/Vue)에 맞게 재구성했습니다.
> skills/pr-lifecycle.md의 Step 7 (agent-to-agent 리뷰)에서 이 체크리스트를 사용합니다.

---

## 사용 방법

**2-Pass 리뷰:**
- **Pass 1 (CRITICAL)**: SQL·데이터 안전, 경쟁 조건, LLM 출력 신뢰 경계, 인젝션, enum 완전성 먼저 검사
- **Pass 2 (INFORMATIONAL)**: 나머지 카테고리 검사
- **스페셜리스트 (병렬 서브에이전트)**: `specialists/` 하위 파일 참조

**출력 형식:**

```
PR 리뷰: N건 (CRITICAL X, INFORMATIONAL Y)

**AUTO-FIX 적용:**
- [파일:라인] 문제 → 적용된 수정

**확인 필요:**
- [파일:라인] 문제 설명
  권장 수정: 수정 방법
```

이슈 없으면: `PR 리뷰: 이슈 없음.`
간결하게 작성. 서론·요약·"전반적으로 좋습니다" 금지.

---

## Pass 1 — CRITICAL

### SQL & 데이터 안전
- 문자열 보간 SQL 금지 (Java: `PreparedStatement` 필수 / Python: 파라미터화 쿼리 / Node: prepared statements)
- TOCTOU 경쟁: check-then-set 패턴은 atomic `WHERE` + update로 대체
- ORM 유효성 검사 우회 직접 DB 쓰기 (JPA: `nativeQuery` / SQLAlchemy: `execute()` / Prisma: raw query)
- N+1 쿼리: 루프 내 lazy-load (JPA: `@EntityGraph` / SQLAlchemy: `joinedload()` / Prisma: `include`)

### 경쟁 조건 & 동시성
- 유니크 제약 없는 find-or-create (concurrent insert 시 중복 생성)
- 상태 전환이 atomic WHERE 없이 구현됨 (concurrent update 시 상태 건너뜀/이중 적용)
- 사용자 제어 데이터의 안전하지 않은 HTML 렌더링 (React: `dangerouslySetInnerHTML` / Vue: `v-html`)

### LLM 출력 신뢰 경계
- LLM 생성 값(이메일, URL, 이름)을 DB 저장 또는 전송 전 형식 검증 없이 사용
- 구조화된 tool 출력(배열, 객체)을 타입/형태 검사 없이 DB에 씀
- LLM 생성 URL을 허용 목록 없이 fetch (SSRF 위험)
- LLM 출력을 벡터 DB에 sanitization 없이 저장 (stored prompt injection)

### 인젝션
- **Java**: `Runtime.exec()` / `ProcessBuilder`에 사용자 입력 직접 포함
- **Python**: `subprocess`에 `shell=True` + f-string 보간 / `eval()` / `exec()`
- **Node.js**: `child_process.exec()`에 템플릿 리터럴 사용
- **모든 스택**: 사용자 제어 경로의 경로 순회 (`../../etc/passwd`)

### Enum & 값 완전성
새 enum 값, 상태 문자열, 타입 상수 추가 시:
- 모든 소비자(switch/if-else, 필터, 표시 로직) 추적 및 직접 읽기
- 허용 목록/필터 배열 확인 (형제 값 grep 후 새 값 포함 여부 검증)
- 기존 `switch`/`if-else` 체인에서 새 값이 잘못된 default로 빠지는지 확인

---

## Pass 2 — INFORMATIONAL

### 비동기/동기 혼용 (Python/Node.js)
- `async def` 엔드포인트 내 동기 `requests.get()`, `open()` — 이벤트 루프 블로킹
- `async def` 내 `time.sleep()` → `asyncio.sleep()` 사용
- Node.js: `async` 함수 내 동기 파일 I/O → `fs.promises` 사용

### 컬럼/필드명 안전
- ORM 쿼리의 컬럼명을 실제 DB 스키마와 대조 (틀린 컬럼명은 빈 결과 또는 삼켜진 에러)
- 실제로 select된 컬럼명으로 `.get()` 호출 확인

### LLM 프롬프트 이슈
- 0-indexed 목록 사용 (LLM은 일관되게 1-indexed 반환)
- 실제 연결된 tool과 프롬프트에 나열된 tool/기능 불일치
- 여러 위치에 명시된 단어/토큰 제한이 분기될 수 있음

### 완성도 갭 (호수 vs 바다)
- 완전 구현이 CC 기준 30분 미만인 단축 구현 (부분 enum 처리, 불완전 에러 경로)
- 사람 팀 시간 추정만 있고 AI-assisted 시간 추정 없음
- 쉽게 추가 가능한 엣지 케이스/음성 경로 테스트 누락

### 타입 강제 변환 경계
- Java→JSON→JS 경계에서 타입이 변경될 수 있는 값 (숫자 vs 문자열)
- 해시/digest 입력이 직렬화 전 `.toString()` 또는 동등한 처리 없음

### 프론트엔드 (React/Vue)
- partial의 인라인 `<style>` 블록 (매 렌더마다 재파싱)
- 뷰 내 O(n*m) 조회 (루프 안에서 `Array.find` 대신 `Map` 사용)
- DB `WHERE` 절로 이동 가능한 클라이언트 사이드 필터링

### CI/CD & 배포
- `.github/workflows/` 변경: 빌드 도구 버전, artifact 이름/경로, 시크릿 사용 형식(`${{ secrets.X }}`) 확인
- 신규 artifact 타입: publish/release 워크플로우 존재 여부 및 대상 플랫폼 확인
- 버전 태그 형식 일관성: `v1.2.3` vs `1.2.3` — VERSION 파일, git 태그, publish 스크립트 간 통일

---

## Fix-First 기준

| AUTO-FIX (에이전트가 자동 수정) | ASK (사람 판단 필요) |
|-------------------------------|---------------------|
| 죽은 코드 / 미사용 변수 | 보안 (auth, XSS, injection) |
| N+1 쿼리 (eager loading 누락) | 경쟁 조건 |
| 코드와 모순되는 stale 주석 | 설계 결정 |
| 매직 넘버 → 명명된 상수 | 대형 수정 (>20 라인) |
| LLM 출력 검증 누락 | Enum 완전성 |
| 버전/경로 불일치 | 기능 제거 |
| 할당 후 미사용 변수 | 사용자 가시 동작 변경 |

**원칙**: 시니어 엔지니어가 논의 없이 적용할 수정 → AUTO-FIX. 합리적인 엔지니어가 의견이 갈릴 수 있는 수정 → ASK.

CRITICAL 발견은 ASK 기본 (더 위험함). INFORMATIONAL 발견은 AUTO-FIX 기본 (더 기계적임).

---

## 억제 (플래그 금지)

- 가독성에 도움되는 무해한 중복
- 임계값/상수에 "왜 이 값을 선택했는지 주석 추가" 제안 (임계값은 튜닝 중 자주 변경, 주석이 썩음)
- "어설션이 더 엄격할 수 있다" (어설션이 동작을 이미 커버하는 경우)
- 리뷰 중인 diff에서 이미 처리된 모든 항목
