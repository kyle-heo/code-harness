# CLAUDE.md
> Claude Code CLI가 세션 시작 시 자동으로 읽는 파일입니다.
> 이 파일은 하네스의 진입점 역할을 합니다.
> 수정 시 반드시 AGENTS.md도 함께 갱신하십시오.

---

## 하네스 설정

```
HARNESS_DEBUG=false          # true로 변경하면 md 참조 로그 활성화
HARNESS_DEBUG_VERBOSE=false  # true면 각 파일에서 얻은 결론도 함께 로깅
```

> HARNESS_DEBUG=true 로 바꾸는 방법:
> 이 파일의 위 값을 true로 수정한 뒤 Claude Code 세션을 재시작하십시오.
> 로그 위치: .harness-debug/latest.log

---

## 세션 시작 시 필수 순서

```
0. [DEBUG] HARNESS_DEBUG 값 확인 → true면 디버그 세션 초기화 (skills/harness-debug.md)
1. AGENTS.md 읽기          → 전체 구조 파악
2. SIGNALS.md 읽기         → 현재 품질 상태 및 최근 실패 확인
3. docs/plans/exec-plans/active/ 읽기 → 현재 진행 중인 플랜 확인
4. 작업 시작
```

---

## 디버그 모드 동작 (HARNESS_DEBUG=true)

HARNESS_DEBUG가 true이면 **모든 md 파일 참조 시** 다음을 수행합니다:

### 1. 세션 초기화 (최초 1회)

```bash
mkdir -p .harness-debug
SESSION_ID=$(date +%Y%m%d-%H%M%S)
LOG_FILE=".harness-debug/session-${SESSION_ID}.log"
ln -sf "session-${SESSION_ID}.log" .harness-debug/latest.log

echo "========================================"   >> "$LOG_FILE"
echo "HARNESS DEBUG SESSION: $SESSION_ID"        >> "$LOG_FILE"
echo "PROMPT: [사용자 원본 프롬프트 첫 줄]"       >> "$LOG_FILE"
echo "STARTED: $(date '+%Y-%m-%d %H:%M:%S')"    >> "$LOG_FILE"
echo "========================================"   >> "$LOG_FILE"
echo ""                                          >> "$LOG_FILE"
echo "🔍 [DEBUG ON] 로그 파일: $LOG_FILE"
```

### 2. md 파일 참조마다 로그 기록

md 파일을 읽기 직전과 직후에 다음 형식으로 `.harness-debug/latest.log`에 기록합니다:

```
[HH:mm:ss.mmm] [PHASE] [ACTION] path/to/file.md
  reason:       왜 이 파일을 읽었는가
  triggered_by: 어떤 규칙/프롬프트가 이 참조를 유발했는가
  sections:     읽은 섹션 (전체 또는 특정 섹션명)
  outcome:      이 파일에서 얻은 결론 한 줄
```

PHASE: INIT | PLANNING | IMPLEMENT | LINT | TEST | REVIEW | PR | GC | ESCALATE
ACTION: READ | SKIP | WRITE | TRIGGER

예시:
```
[09:14:23.412] [INIT] [READ] AGENTS.md
  reason:       세션 시작 - 전체 하네스 구조 파악
  triggered_by: CLAUDE.md 세션 시작 순서 1번
  sections:     디렉토리 맵, 에이전트 실패 프로토콜
  outcome:      스킬 경로 및 우선순위 파악 완료

[09:14:25.108] [IMPLEMENT] [READ] CONSTRAINTS.md
  reason:       Service 레이어 코드 작성 전 불변 조건 확인
  triggered_by: 코드 작성 전 규칙 (C-001~C-007)
  sections:     C-001, C-002
  outcome:      레이어 의존성 방향 준수, Zod 경계 파싱 적용 예정

[09:14:31.774] [REVIEW] [READ] docs/quality/review/checklist.md
  reason:       PR 오픈 전 Pass 1 CRITICAL 체크
  triggered_by: skills/pr-lifecycle.md Step 7
  sections:     Pass 1 — CRITICAL
  outcome:      SQL 안전 통과, 경쟁 조건 1건 발견 → ASK
```

### 3. 실시간 터미널 출력

```
🔍 [INIT] READ → AGENTS.md
     ↳ 세션 시작 - 전체 하네스 구조 파악
🔍 [IMPLEMENT] READ → CONSTRAINTS.md
     ↳ Service 레이어 코드 작성 전 불변 조건 확인
🔍 [REVIEW] READ → docs/quality/review/checklist.md
     ↳ PR 오픈 전 Pass 1 CRITICAL 체크
```

### 4. 세션 종료 시 자동 요약

세션이 끝나면 다음 요약을 출력하고 로그 파일에도 기록합니다:

```
========================================
📊 HARNESS DEBUG 세션 요약
========================================

[ 단계별 md 참조 횟수 ]
  INIT          3회
  PLANNING      2회
  IMPLEMENT     7회
  LINT          4회
  REVIEW        2회
  PR            1회

[ 참조 빈도 Top 5 ]
  3회  CONSTRAINTS.md
  2회  ARCHITECTURE.md
  2회  docs/quality/review/checklist.md
  1회  SIGNALS.md
  1회  skills/pr-lifecycle.md

[ 전체 참조 흐름 ]
  09:14:23 [INIT]      READ  CLAUDE.md
  09:14:24 [INIT]      READ  AGENTS.md
  09:14:25 [INIT]      READ  SIGNALS.md
  09:14:27 [PLANNING]  READ  feature-queue.json
  ...

📁 전체 로그: .harness-debug/session-20260404-091423.log
========================================
```

### 5. 로그 조회 명령어

```bash
# 실시간 스트리밍 (별도 터미널)
tail -f .harness-debug/latest.log

# 참조 흐름만 추출 (타임스탬프 + 단계 + 파일)
grep -E "^\[" .harness-debug/latest.log

# 특정 단계 필터
grep "\[REVIEW\]" .harness-debug/latest.log

# 특정 파일 참조 이력
grep "checklist.md" .harness-debug/latest.log

# 단계별 참조 횟수 집계
grep -oP '(?<=\] \[)\w+(?=\] \[)' .harness-debug/latest.log | sort | uniq -c | sort -rn
```

상세 로그 스킬: `skills/harness-debug.md`

---

## 핵심 규칙 (절대 위반 금지)

- **코드 작성 전**: `CONSTRAINTS.md` C-001~C-007 확인
- **버그 발생 시**: `skills/investigate.md` 4단계 절차 (추측 기반 수정 금지)
- **PR 오픈 전**: `docs/quality/review/checklist.md` Pass 1 실행
- **실패 시**: `SIGNALS.md` 실패 로그 즉시 기록
- **시간 추정 시**: "사람 N시간 / AI-assisted M분" 두 가지 반드시 명시

---

## 레이어 의존성 (한눈에)

```
Types → Config → Repo → Service → Runtime → UI
```

역방향 import = CI 블로킹. 횡단 관심사는 `providers/` 경유 필수.

---

## 스킬 빠른 참조

| 상황 | 사용할 스킬 |
|------|------------|
| 버그 조사 | `skills/investigate.md` |
| PR 오픈 | `skills/pr-lifecycle.md` |
| UI 검증 | `skills/chrome-devtools.md` |
| 로그 조회 | `skills/logql-query.md` |
| 메트릭 조회 | `skills/promql-query.md` |
| 영상 녹화 | `skills/video-capture.md` |
| md 참조 디버깅 | `skills/harness-debug.md` |

## gstack 슬래시 커맨드 (Claude Code CLI)

| 커맨드 | 역할 |
|--------|------|
| `/review` | PR 병합 전 코드 리뷰 (checklist.md 연동) |
| `/qa` | 브라우저 기반 QA (chrome-devtools.md 연동) |
| `/ship` | 테스트 + 리뷰 + PR 자동화 |
| `/investigate` | 버그 근본 원인 분석 |
| `/careful` | 위험 명령 전 가드레일 |

---

## 자동화 실행 모드

기능 리스트 순차 자동 실행 시:
```
docs/plans/exec-plans/active/feature-queue.json 읽기
→ status: "pending" 첫 번째 항목 선택
→ 해당 스펙 파일 읽기 (docs/specs/)
→ 구현 → 테스트 → PR → 다음 항목으로
```
상세 절차: `skills/auto-feature-runner.md`

---

## 의사결정 원칙

1. **완성도**: 완전한 구현이 단축보다 몇 분 더 걸릴 때 → 항상 완전한 것 선택
2. **검색 우선**: 익숙하지 않은 패턴 → 먼저 검색 후 구현
3. **사용자 주권**: 방향 변경 동의해도 → 추천하고 물어보기, 절대 임의 실행 금지

→ 상세: `docs/ethos/ETHOS.md`
