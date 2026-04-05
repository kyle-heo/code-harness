# code-harness

> Claude Code를 기반으로 소프트웨어를 자율적으로 개발할 수 있도록 설계된 엔지니어링 하네스입니다.
> OpenAI Harness Engineering 방법론과 Garry Tan의 gstack을 참고하되,
> Claude Code의 고유 기능(서브에이전트, Hooks, Skills, Memory)을 최대한 활용하도록 설계했습니다.

---

## Claude Code가 Codex보다 뛰어난 이유

이 하네스는 Claude Code 전용으로 최적화되어 있습니다.

| 능력 | Claude Code | Codex |
|------|------------|-------|
| **서브에이전트 병렬 실행** | Task()로 동적 오케스트레이션 | 정적 병렬화만 |
| **Hooks 자동화** | PreToolUse/PostToolUse로 린터 자동 실행 | 수동 실행 |
| **메모리 지속성** | MEMORY.md로 세션 간 지식 누적 | 세션 초기화마다 리셋 |
| **Skills 온디맨드 로딩** | 필요할 때만 SKILL.md 로드 | 항상 전체 컨텍스트 |
| **백그라운드 에이전트** | Ctrl+B로 비동기 실행 | 동기 실행만 |
| **컨텍스트 효율** | 서브에이전트로 오염 방지 | 단일 컨텍스트 누적 |
| **MCP 통합** | 네이티브 지원 | 제한적 |

---

## 구조

```
.
├── CLAUDE.md                          # Claude Code 세션 진입점 (자동 로드)
├── AGENTS.md                          # 에이전트 작업 가이드 (TOC)
├── ARCHITECTURE.md                    # 레이어 구조 및 의존성 규칙
├── CONSTRAINTS.md                     # 불변 조건 목록 (C-001~C-007)
├── SIGNALS.md                         # 품질 신호 허브 (단일 대시보드)
│
├── .claude/                           # Claude Code 전용 설정
│   ├── settings.json                  # Hooks 설정 (린터 자동 실행)
│   └── agents/                        # 서브에이전트 정의
│       ├── reviewer.md                # PR 리뷰 서브에이전트
│       ├── qa-agent.md                # QA 서브에이전트
│       ├── gc-agent.md                # GC 서브에이전트
│       └── security-agent.md          # 보안 스페셜리스트
│
├── linters/                           # 실제 동작하는 JS 린터
│   ├── layer-deps.js                  # C-001: 레이어 의존성 방향 검사
│   ├── boundary-check.js              # C-002/C-006: 경계 검증 + 타입 단언 금지
│   ├── naming-conv.js                 # C-003/C-005/C-007: 네이밍·로깅·공유유틸
│   └── file-size.js                   # C-004: 레이어별 파일 크기 제한
│
├── skills/                            # Claude Code Skills (온디맨드 로딩)
│   ├── auto-feature-runner.md         # 기능 리스트 순차 자동 실행
│   ├── pr-lifecycle.md                # PR 전체 라이프사이클
│   ├── investigate.md                 # 버그 근본 원인 분석 (4단계)
│   ├── harness-debug.md               # md 참조 로그 디버깅
│   ├── chrome-devtools.md             # UI 검증 (Chrome DevTools Protocol)
│   ├── logql-query.md                 # 프로덕션 로그 조회
│   ├── promql-query.md                # 메트릭/SLO 모니터링
│   └── video-capture.md              # 버그 재현 영상 녹화
│
├── gc-jobs/                           # GC 자동화 (gc-agent가 실행)
│   ├── drift-detector.md
│   ├── constraint-enforcer.md
│   ├── quality-grader.md
│   ├── doc-staleness-check.md
│   └── auto-refactor-pr.md
│
└── docs/
    ├── ethos/ETHOS.md                 # 엔지니어링 철학
    ├── specs/                         # 기능 스펙 파일
    │   ├── FEATURE-SPEC-TEMPLATE.md
    │   └── core-beliefs.md
    ├── plans/
    │   ├── exec-plans/active/
    │   │   └── feature-queue.json     # 기능 큐 (자동화 실행 목록)
    │   ├── TODOS.md
    │   └── tech-debt.md
    └── quality/
        ├── CODE_CONVENTIONS.md
        ├── QUALITY_SCORE.md
        ├── SECURITY.md
        ├── RELIABILITY.md
        ├── FRONTEND.md
        ├── conventions/               # 6개 스택 린터 설정
        │   ├── frontend-js.md
        │   ├── backend-nodejs.md
        │   ├── backend-java.md
        │   ├── backend-python.md
        │   ├── mobile-android.md
        │   └── mobile-ios.md
        ├── review/
        │   ├── checklist.md           # PR 리뷰 체크리스트 (2-Pass)
        │   └── specialists/
        └── qa/
            ├── issue-taxonomy.md
            └── report-template.md
```

---

## 빠른 시작

### 설치

```bash
# Claude Code 설치
npm install -g @anthropic-ai/claude-code

# 하네스 적용 (기존 프로젝트)
cd [프로젝트 루트]
git clone https://github.com/kyle-heo/code-harness .harness-tmp
cp -r .harness-tmp/* .
rm -rf .harness-tmp

# ARCHITECTURE.md에 실제 디렉토리 매핑 (사람이 직접)
# 린터 현황 스캔
node linters/layer-deps.js src/
node linters/boundary-check.js src/

# Claude Code 실행
claude
```

---

## Claude Code 특화 기능

### 1. Hooks — 린터 자동 실행

파일 저장 시 린터가 자동 실행됩니다. `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node linters/layer-deps.js $TOOL_INPUT_PATH && node linters/boundary-check.js $TOOL_INPUT_PATH",
            "statusMessage": "레이어 의존성 및 경계 검증 중..."
          }
        ]
      }
    ]
  }
}
```

코드를 작성하는 즉시 C-001, C-002 위반이 감지되어 Claude Code가 즉시 수정합니다.

### 2. 서브에이전트 — 병렬 리뷰

PR 리뷰 시 4개 스페셜리스트가 동시에 실행됩니다:

```
/review 실행
  ├── security-agent  → 보안 취약점 분석
  ├── perf-agent      → 성능 이슈 분석
  ├── test-agent      → 테스트 커버리지 분석
  └── maintain-agent  → 유지보수성 분석
       ↓
  결과 통합 → PR 코멘트 자동 작성
```

### 3. Skills — 온디맨드 로딩

`skills/` 폴더의 파일들은 Claude Code가 작업 컨텍스트에 따라 자동으로 로드합니다:
- 버그 리포트 받으면 → `investigate.md` 자동 로드
- PR 오픈 요청 → `pr-lifecycle.md` 자동 로드
- 기능 구현 요청 → `auto-feature-runner.md` 자동 로드

### 4. Memory — 세션 간 지식 누적

서브에이전트가 발견한 코드베이스 지식이 `MEMORY.md`에 누적됩니다:

```markdown
# MEMORY.md (서브에이전트가 자동 관리)
## 발견된 패턴
- UserService는 항상 UserSchema.parse()로 경계 검증 (2026-04-04)
- auth 관련 코드는 providers/auth.ts 경유 필수 확인 (2026-04-04)
```

### 5. 백그라운드 에이전트 — 비동기 GC

GC 잡은 백그라운드에서 실행되어 메인 작업을 방해하지 않습니다:

```bash
# GC를 백그라운드로 실행 (Ctrl+B)
claude "gc-jobs/drift-detector.md를 실행해서 드리프트를 감지하고 수정 PR을 올려줘"
# → Ctrl+B로 백그라운드 전환
# 메인 세션에서 다른 작업 계속
```

### 6. 디버그 모드 — md 참조 추적

`CLAUDE.md`에서 `HARNESS_DEBUG=true`로 설정하면 어떤 md 파일이 어떤 순서로 참조되는지 실시간 추적합니다:

```bash
# 실시간 로그 확인
tail -f .harness-debug/latest.log

# 참조 흐름만 추출
grep -E "^\[" .harness-debug/latest.log
```

---

## 기능 자동화 실행

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
    }
  ]
}
```

### 2. 스펙 파일 작성 (수용 기준 필수)

```markdown
## 수용 기준
- [ ] AC-001: 이메일/비밀번호로 로그인 성공 시 JWT 발급
- [ ] AC-002: 잘못된 비밀번호 3회 시 계정 잠금
- [ ] AC-003: 만료된 토큰 요청 시 401 반환
```

### 3. Claude Code에서 실행

```bash
claude
```

```
feature-queue.json을 읽고 skills/auto-feature-runner.md에 따라
pending 기능을 순서대로 자동 실행해줘.
보안/성능 리뷰는 서브에이전트를 병렬로 실행해서 속도를 높여줘.
```

### 자동 실행 루프

```
feature-queue.json 읽기
  ↓ pending + 의존성 충족 기능 선택
  ↓ 스펙 파일 읽기 → 수용 기준 파악
  ↓ 구현 (Hook이 파일 저장마다 린터 자동 실행)
  ↓ 테스트 실행
  ↓ 서브에이전트 병렬 리뷰 (보안/성능/테스팅/유지보수)
  ↓ PR 오픈
  ↓ status → "done"
  ↓ 다음 기능 (실패 시 SIGNALS.md 기록 + 중단)
```

---

## 불변 조건

`CONSTRAINTS.md`에 정의된 7개 규칙은 **Hooks로 자동 강제**됩니다:

| ID | 규칙 | 자동화 방식 | 위반 시 |
|----|------|------------|---------|
| C-001 | 레이어 의존성 방향 | PostToolUse Hook | CI 블로킹 |
| C-002 | 경계 데이터 즉시 파싱 | PostToolUse Hook | CI 블로킹 |
| C-003 | 구조화 로깅 | PostToolUse Hook | 3회 누적 시 블로킹 |
| C-004 | 레이어별 파일 크기 | PostToolUse Hook | 200% 초과 시 블로킹 |
| C-005 | 공유 유틸리티 우선 | PostToolUse Hook | CI 경고 |
| C-006 | 타입 단언(as) 금지 | PostToolUse Hook | CI 블로킹 |
| C-007 | 스키마/타입 네이밍 | PostToolUse Hook | CI 경고 |

---

## GC 자동화

5개 백그라운드 잡이 코드베이스 품질을 자동 유지합니다:

| 잡 | 트리거 | 역할 |
|----|--------|------|
| drift-detector | 매일 02:00 / 린터 위반 >5 | 패턴 드리프트 감지 |
| constraint-enforcer | SIGNALS.md 실패 로그 추가 시 | 불변 조건 자동 갱신 |
| quality-grader | PR 병합 시 / 점수 <70 | 품질 점수 자동 산정 |
| doc-staleness-check | 매일 03:00 | 문서 최신성 검사 |
| auto-refactor-pr | 품질 점수 <80 | 상위 3개 파일 자동 리팩터링 |

---

## 코드 컨벤션

6개 스택에 대한 완전한 린터/포맷터 설정:

| 스택 | 기반 | 주요 도구 |
|------|------|-----------|
| JavaScript/React/Vue | Airbnb + Google | ESLint + Prettier + Husky |
| Node.js 백엔드 | Airbnb Base | ESLint + security 플러그인 |
| Java | Google + Netflix | Checkstyle + PMD + SpotBugs |
| Python | Google + PEP8 | Ruff + Black + mypy + bandit |
| Android | Google + Kotlin | ktlint + Detekt + Android Lint |
| iOS | Google Swift | SwiftLint + SwiftFormat |

---

## 엔지니어링 철학 (`docs/ethos/ETHOS.md`)

**1. 호수를 끓여라** — AI-assisted로 한계 비용이 0에 가까워졌습니다. 완전한 구현을 선택하십시오.

**2. 만들기 전에 검색하라** — 검색 → 이해 → 구현 순서.

**3. 사용자 주권** — Claude Code가 방향 변경에 동의해도 추천만 하고 행동은 사람이 결정.

### AI-assisted 압축비

| 작업 | 사람 팀 | Claude Code |
|------|---------|------------|
| 보일러플레이트 | 2일 | 15분 |
| 테스트 작성 | 1일 | 15분 |
| 기능 구현 | 1주 | 30분 |
| 버그 수정 | 4시간 | 15분 |

---

## 참조

- [Claude Code 공식 문서](https://code.claude.com/docs)
- [Claude Code 서브에이전트](https://code.claude.com/docs/en/sub-agents)
- [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/) (영감의 출발점)
- [gstack by Garry Tan](https://github.com/garrytan/gstack)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)

---

## 라이선스

MIT
