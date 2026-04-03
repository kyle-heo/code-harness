# code-harness

> AI 에이전트(Claude Code / Codex)가 소프트웨어를 자율적으로 개발할 수 있도록 설계된 엔지니어링 하네스입니다.
> OpenAI Harness Engineering 방법론과 Garry Tan의 gstack을 기반으로, 실제 통신사 엔터프라이즈 환경에 맞게 구성했습니다.

---

## 개요

하네스(Harness)는 에이전트가 작업할 수 있는 **환경, 제약, 피드백 루프**의 집합입니다.

> "에이전트가 실수를 할 때마다, 그 실수를 다시는 반복하지 않도록 엔지니어링 해결책을 구축한다." — Mitchell Hashimoto

이 하네스를 사용하면 사람 엔지니어는 **코드 작성이 아닌 환경 설계와 의도 명시**에 집중하고, 에이전트가 구현·테스트·리뷰·PR까지 자율 처리합니다.

### OpenAI Harness Engineering 대비 차별점

| 항목 | OpenAI Harness | code-harness |
|------|---------------|--------------|
| 레이어 아키텍처 | 도메인별 레이어 | Types→Config→Repo→Service→Runtime→UI |
| 실패 피드백 루프 | AGENTS.md 수동 갱신 | SIGNALS.md → gc-jobs 자동 트리거 |
| 품질 신호 | 분리된 파일들 | SIGNALS.md 단일 허브 통합 |
| 코드 컨벤션 | 별도 정의 없음 | 6개 스택 ESLint/Checkstyle/SwiftLint 완비 |
| 기능 자동화 | 없음 | feature-queue.json + auto-feature-runner |
| gstack 연동 | 없음 | `/review`, `/qa`, `/ship` 슬래시 커맨드 연동 |

---

## 구조

```
.
├── CLAUDE.md                          # Claude Code CLI 세션 진입점
├── AGENTS.md                          # 에이전트 작업 가이드 (TOC)
├── ARCHITECTURE.md                    # 레이어 구조 및 의존성 규칙
├── CONSTRAINTS.md                     # 불변 조건 목록 (C-001~C-007)
├── SIGNALS.md                         # 품질 신호 허브 (단일 대시보드)
│
├── linters/                           # 실제 동작하는 JS 린터
│   ├── layer-deps.js                  # C-001: 레이어 의존성 방향 검사
│   ├── boundary-check.js              # C-002/C-006: 경계 검증 + 타입 단언 금지
│   ├── naming-conv.js                 # C-003/C-005/C-007: 네이밍·로깅·공유유틸
│   └── file-size.js                   # C-004: 레이어별 파일 크기 제한
│
├── skills/                            # 에이전트 런타임 스킬
│   ├── auto-feature-runner.md         # 기능 리스트 순차 자동 실행
│   ├── pr-lifecycle.md                # PR 전체 라이프사이클
│   ├── investigate.md                 # 버그 근본 원인 분석 (4단계)
│   ├── chrome-devtools.md             # UI 검증 (Chrome DevTools Protocol)
│   ├── logql-query.md                 # 프로덕션 로그 조회
│   ├── promql-query.md                # 메트릭/SLO 모니터링
│   └── video-capture.md              # 버그 재현 영상 녹화
│
├── gc-jobs/                           # 가비지 컬렉션 자동화
│   ├── drift-detector.md              # 패턴 드리프트 감지
│   ├── constraint-enforcer.md         # 실패 → 불변 조건 자동 갱신
│   ├── quality-grader.md              # 품질 점수 자동 산정
│   ├── doc-staleness-check.md         # 문서 최신성 검사
│   └── auto-refactor-pr.md           # 자동 리팩터링 PR 생성
│
└── docs/
    ├── ethos/ETHOS.md                 # 엔지니어링 철학
    ├── specs/                         # 기능 스펙 파일
    │   ├── FEATURE-SPEC-TEMPLATE.md   # 스펙 작성 템플릿
    │   └── core-beliefs.md            # 제품 핵심 철학
    ├── plans/
    │   ├── exec-plans/active/
    │   │   └── feature-queue.json     # 기능 큐 (자동화 실행 목록)
    │   ├── TODOS.md                   # 우선순위 작업 목록 (P0~P4)
    │   └── tech-debt.md              # 기술 부채 트래커
    └── quality/
        ├── CODE_CONVENTIONS.md        # 스택별 컨벤션 마스터 인덱스
        ├── QUALITY_SCORE.md           # 품질 평가 기준
        ├── SECURITY.md                # 보안 기준
        ├── RELIABILITY.md             # 신뢰성 SLO 기준
        ├── FRONTEND.md                # UI 검증 프로토콜
        ├── conventions/               # 스택별 린터/포맷터 설정
        │   ├── frontend-js.md         # JS/React/Vue (Airbnb + Google)
        │   ├── backend-nodejs.md      # Node.js 백엔드
        │   ├── backend-java.md        # Java (Google + Netflix Checkstyle)
        │   ├── backend-python.md      # Python (Ruff + Black + mypy)
        │   ├── mobile-android.md      # Android (Detekt + ktlint)
        │   └── mobile-ios.md          # iOS (SwiftLint + SwiftFormat)
        ├── review/
        │   ├── checklist.md           # PR 리뷰 체크리스트 (2-Pass)
        │   └── specialists/           # 보안·성능·테스팅·레드팀
        └── qa/
            ├── issue-taxonomy.md      # QA 이슈 분류 체계
            └── report-template.md     # QA 리포트 템플릿
```

---

## 빠른 시작

### 필수 도구 설치

```bash
# Claude Code CLI
npm install -g @anthropic-ai/claude-code

# gstack (슬래시 커맨드 활성화)
curl -fsSL https://gstack.dev/install | bash

# 린터 의존성
npm install -g glob
```

### 기존 프로젝트에 적용

```bash
# 1. 하네스 파일 복사
cd [프로젝트 루트]
git clone https://github.com/kyle-heo/code-harness .harness-tmp
cp -r .harness-tmp/* .
rm -rf .harness-tmp

# 2. ARCHITECTURE.md 수정 (실제 디렉토리 매핑)
#    → 유일하게 사람이 직접 해야 하는 부분

# 3. 린터 현황 스캔
node linters/layer-deps.js src/
node linters/boundary-check.js src/
node linters/naming-conv.js src/
node linters/file-size.js src/

# 4. Claude Code 실행
claude
```

### 새 프로젝트에 적용

```bash
git clone https://github.com/kyle-heo/code-harness myproject
cd myproject
git remote remove origin
git remote add origin [새 repo URL]
claude
```

---

## 핵심 개념

### 레이어 아키텍처

모든 코드는 다음 방향으로만 의존합니다:

```
Types → Config → Repo → Service → Runtime → UI
```

역방향 import는 `linters/layer-deps.js`가 CI에서 자동 차단합니다.
횡단 관심사(인증, 텔레메트리, 피처 플래그)는 반드시 `providers/` 경유.

### 불변 조건 (Invariants)

`CONSTRAINTS.md`에 정의된 7개 규칙은 린터로 기계적으로 강제됩니다:

| ID | 규칙 | 린터 | 위반 시 |
|----|------|------|---------|
| C-001 | 레이어 의존성 방향 | layer-deps.js | CI 블로킹 |
| C-002 | 경계 데이터 즉시 파싱 | boundary-check.js | CI 블로킹 |
| C-003 | 구조화 로깅 (console.log 금지) | naming-conv.js | 3회 누적 시 블로킹 |
| C-004 | 레이어별 파일 크기 제한 | file-size.js | 200% 초과 시 블로킹 |
| C-005 | 공유 유틸리티 우선 사용 | naming-conv.js | CI 경고 |
| C-006 | 타입 단언(as) 금지 | boundary-check.js | CI 블로킹 |
| C-007 | 스키마/타입 네이밍 컨벤션 | naming-conv.js | CI 경고 |

### SIGNALS.md — 단일 품질 허브

품질, 보안, 신뢰성 상태를 하나의 파일에서 관리합니다:

```
에이전트 실패 감지
  → SIGNALS.md 실패 로그 기록
  → gc-jobs/constraint-enforcer.md 자동 트리거
  → CONSTRAINTS.md 새 불변 조건 추가
  → 린터 자동 재생성 PR 오픈
  → AGENTS.md 갱신 이력 기록
```

### GC (Garbage Collection)

5개 백그라운드 잡이 코드베이스 품질을 자동 유지합니다:

| 잡 | 트리거 | 역할 |
|----|--------|------|
| drift-detector | 매일 02:00 / 린터 위반 >5 | 패턴 드리프트 감지 |
| constraint-enforcer | 실패 로그 추가 시 즉시 | 불변 조건 자동 갱신 |
| quality-grader | PR 병합 시 / 점수 <70 | 품질 점수 자동 산정 |
| doc-staleness-check | 매일 03:00 | 문서 최신성 검사 |
| auto-refactor-pr | 품질 점수 <80 | 상위 3개 파일 자동 리팩터링 |

---

## 기능 자동화 실행

가장 강력한 기능입니다. 기능 목록을 정의하면 에이전트가 순차적으로 자동 구현합니다.

### 1. feature-queue.json 작성

```json
{
  "project": "내 프로젝트",
  "stop_on_failure": true,
  "features": [
    {
      "id": "FEAT-001",
      "title": "사용자 로그인",
      "spec": "docs/specs/auth-login.md",
      "status": "pending",
      "priority": "P0",
      "depends_on": [],
      "estimated_human": "2일",
      "estimated_ai": "30분"
    },
    {
      "id": "FEAT-002",
      "title": "회원가입",
      "spec": "docs/specs/auth-signup.md",
      "status": "pending",
      "priority": "P0",
      "depends_on": ["FEAT-001"],
      "estimated_human": "1일",
      "estimated_ai": "20분"
    }
  ]
}
```

### 2. 스펙 파일 작성 (`docs/specs/FEATURE-SPEC-TEMPLATE.md` 참조)

수용 기준(AC)이 구체적일수록 에이전트가 정확하게 구현합니다.

```markdown
## 수용 기준
- [ ] AC-001: 이메일/비밀번호로 로그인 성공 시 JWT 발급
- [ ] AC-002: 잘못된 비밀번호 3회 시 계정 잠금
- [ ] AC-003: 만료된 토큰으로 요청 시 401 반환
```

### 3. Claude Code에서 실행

```bash
claude
```

```
feature-queue.json을 읽고 skills/auto-feature-runner.md 절차에 따라
pending 기능을 순서대로 자동 실행해줘.
```

### 자동 실행 루프

```
feature-queue.json 읽기
  ↓ pending + 의존성 충족 기능 선택
  ↓ 스펙 파일 읽기 → 수용 기준 파악
  ↓ 구현 (CONSTRAINTS.md 준수)
  ↓ 린터 4종 검사
  ↓ 테스트 실행
  ↓ PR 리뷰 체크리스트 Pass 1
  ↓ PR 오픈
  ↓ status → "done"
  ↓ 다음 기능으로 반복
    (실패 시 SIGNALS.md 기록 + 중단)
```

---

## gstack 연동 (Claude Code CLI)

gstack을 설치하면 다음 슬래시 커맨드가 활성화됩니다:

| 커맨드 | 역할 | 하네스 연동 |
|--------|------|------------|
| `/review` | PR 병합 전 코드 리뷰 | `docs/quality/review/checklist.md` |
| `/qa` | 브라우저 기반 QA | `skills/chrome-devtools.md` |
| `/ship` | 테스트 + 리뷰 + PR 자동화 | `skills/pr-lifecycle.md` |
| `/investigate` | 버그 근본 원인 분석 | `skills/investigate.md` |
| `/careful` | 위험 명령 전 가드레일 | — |

---

## 코드 컨벤션

6개 스택에 대한 완전한 린터/포맷터 설정을 제공합니다:

| 스택 | 기반 | 주요 도구 |
|------|------|-----------|
| JavaScript/React/Vue | Airbnb + Google | ESLint + Prettier + Husky |
| Node.js 백엔드 | Airbnb Base | ESLint + security 플러그인 |
| Java | Google + Netflix | Checkstyle + PMD + SpotBugs |
| Python | Google + PEP8 | Ruff + Black + mypy + bandit |
| Android | Google + Kotlin | ktlint + Detekt + Android Lint |
| iOS | Google Swift | SwiftLint + SwiftFormat |

각 설정 파일은 `docs/quality/conventions/` 하위에서 바로 복사해서 사용할 수 있습니다.

---

## PR 리뷰 체계

PR 병합 전 2-Pass 리뷰를 수행합니다 (`docs/quality/review/checklist.md`):

**Pass 1 — CRITICAL** (필수): SQL 안전, 경쟁 조건, LLM 신뢰 경계, 인젝션, Enum 완전성

**Pass 2 — INFORMATIONAL**: 비동기/동기 혼용, 타입 강제 변환, 프론트엔드 성능, CI/CD

스페셜리스트 서브에이전트 (`docs/quality/review/specialists/`): 보안 / 성능 / 테스팅·유지보수 / 레드팀

---

## 엔지니어링 철학 (`docs/ethos/ETHOS.md`)

**1. 호수를 끓여라** — 완전한 구현이 단축보다 몇 분 더 걸릴 때 항상 완전한 것을 선택. AI-assisted로 한계 비용이 0에 가까워졌습니다.

**2. 만들기 전에 검색하라** — 익숙하지 않은 패턴은 검색 → 이해 → 구현 순서.

**3. 사용자 주권** — 에이전트가 방향 변경에 동의해도 추천만 하고 행동은 금지. 사람이 최종 결정.

### AI-assisted 압축비 (시간 추정 필수)

| 작업 | 사람 팀 | AI-assisted |
|------|---------|------------|
| 보일러플레이트 | 2일 | 15분 |
| 테스트 작성 | 1일 | 15분 |
| 기능 구현 | 1주 | 30분 |
| 버그 수정 | 4시간 | 15분 |

---

## 참조

- [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/)
- [gstack by Garry Tan](https://github.com/garrytan/gstack)
- [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)

---

## 라이선스

MIT
