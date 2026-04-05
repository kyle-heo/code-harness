# skills/harness-debug.md
> HARNESS_DEBUG=true 일 때 에이전트가 따르는 md 참조 로깅 프로토콜입니다.
> 모든 md 파일 읽기 전후에 이 파일의 로그 함수를 호출합니다.

---

## 로그 파일 위치

```
.harness-debug/
├── session-[YYYYMMDD-HHmmss].log   # 세션별 전체 로그
└── latest.log                       # 가장 최근 세션 심볼릭 링크
```

---

## 로그 항목 형식

```
[HH:mm:ss.mmm] [PHASE] [ACTION] path/to/file.md
               └─ reason: 왜 이 파일을 읽었는가 (한 줄)
               └─ triggered_by: 어떤 프롬프트/규칙이 이 참조를 유발했는가
               └─ sections_read: 실제로 읽은 섹션 (전체 / 특정 섹션명)
               └─ outcome: 이 파일에서 얻은 결론 (한 줄)
```

**PHASE 값**: `INIT` | `PLANNING` | `IMPLEMENT` | `LINT` | `TEST` | `REVIEW` | `PR` | `GC` | `ESCALATE`

**ACTION 값**: `READ` | `SKIP` | `WRITE` | `TRIGGER`

---

## 로그 초기화 (세션 시작 시)

```bash
mkdir -p .harness-debug
SESSION_ID=$(date +%Y%m%d-%H%M%S)
LOG_FILE=".harness-debug/session-${SESSION_ID}.log"

cat >> "$LOG_FILE" << EOF
========================================
HARNESS DEBUG SESSION: $SESSION_ID
PROMPT: [사용자 원본 프롬프트 첫 줄]
STARTED: $(date '+%Y-%m-%d %H:%M:%S')
========================================

EOF

ln -sf "session-${SESSION_ID}.log" .harness-debug/latest.log
echo "🔍 [DEBUG] 세션 시작: $LOG_FILE"
```

---

## md 참조 로그 함수 (에이전트가 매 참조마다 호출)

```bash
# 사용법: harness_log_ref [PHASE] [ACTION] [파일경로] [reason] [triggered_by] [sections] [outcome]
harness_log_ref() {
  local PHASE="$1"
  local ACTION="$2"
  local FILE="$3"
  local REASON="$4"
  local TRIGGERED_BY="$5"
  local SECTIONS="${6:-전체}"
  local OUTCOME="${7:-기록 없음}"
  local TIMESTAMP=$(date '+%H:%M:%S.%3N')
  local LOG_FILE=".harness-debug/latest.log"

  [ -f "$LOG_FILE" ] || return

  cat >> "$LOG_FILE" << EOF
[$TIMESTAMP] [$PHASE] [$ACTION] $FILE
  reason:       $REASON
  triggered_by: $TRIGGERED_BY
  sections:     $SECTIONS
  outcome:      $OUTCOME

EOF

  # 터미널 실시간 출력
  echo "🔍 [$PHASE] $ACTION → $FILE"
  echo "     ↳ $REASON"
}
```

---

## 표준 참조 패턴 (에이전트가 이 패턴을 따름)

### INIT 단계 (세션 시작)
```bash
harness_log_ref "INIT" "READ" "CLAUDE.md" \
  "세션 시작 진입점" "Claude Code 자동 로드" "전체" \
  "HARNESS_DEBUG 모드 확인, 세션 초기화"

harness_log_ref "INIT" "READ" "AGENTS.md" \
  "전체 하네스 구조 파악" "CLAUDE.md 세션 시작 순서 1번" "디렉토리 맵" \
  "사용할 스킬 및 파일 경로 파악 완료"

harness_log_ref "INIT" "READ" "SIGNALS.md" \
  "현재 품질 상태 및 최근 실패 확인" "CLAUDE.md 세션 시작 순서 2번" "현재 상태 대시보드" \
  "품질 상태: [상태값], 실패 로그: [건수]건"
```

### PLANNING 단계
```bash
harness_log_ref "PLANNING" "READ" "docs/plans/exec-plans/active/feature-queue.json" \
  "현재 진행할 기능 목록 확인" "auto-feature-runner 루프 시작" "전체" \
  "pending 기능 [N]개 확인, 다음 실행: [FEAT-NNN]"

harness_log_ref "PLANNING" "READ" "docs/specs/[스펙파일].md" \
  "FEAT-NNN 수용 기준 파악" "feature-queue의 spec 필드" "수용 기준 섹션" \
  "AC [N]개 파악 완료"
```

### IMPLEMENT 단계
```bash
harness_log_ref "IMPLEMENT" "READ" "ARCHITECTURE.md" \
  "구현할 파일의 레이어 위치 확인" "CONSTRAINTS.md C-001 준수" "레이어 구조" \
  "[기능]은 Service 레이어에 구현"

harness_log_ref "IMPLEMENT" "READ" "CONSTRAINTS.md" \
  "C-001~C-007 불변 조건 확인" "코드 작성 전 필수 체크" "C-001, C-002" \
  "적용할 불변 조건: C-001(레이어), C-002(경계 파싱)"

harness_log_ref "IMPLEMENT" "READ" "docs/quality/conventions/[스택].md" \
  "스택별 코드 컨벤션 확인" "CODE_CONVENTIONS.md 스택 맵" "ESLint 설정, 네이밍" \
  "네이밍 규칙 및 금지 패턴 파악"
```

### LINT 단계
```bash
harness_log_ref "LINT" "TRIGGER" "linters/layer-deps.js" \
  "C-001 레이어 의존성 검사" "구현 완료 후 자동 실행" "전체" \
  "위반 [N]건"
```

### REVIEW 단계
```bash
harness_log_ref "REVIEW" "READ" "docs/quality/review/checklist.md" \
  "PR 병합 전 Pass 1 실행" "skills/pr-lifecycle.md Step 7" "Pass 1 — CRITICAL" \
  "CRITICAL 이슈: [N]건, AUTO-FIX: [N]건, ASK: [N]건"
```

### GC 단계
```bash
harness_log_ref "GC" "TRIGGER" "gc-jobs/constraint-enforcer.md" \
  "실패 감지로 불변 조건 갱신 트리거" "SIGNALS.md 실패 로그 추가" "전체" \
  "신규 P-NNN 추가 예정"
```

---

## 세션 종료 요약 생성

```bash
harness_debug_summary() {
  local LOG_FILE=".harness-debug/latest.log"
  [ -f "$LOG_FILE" ] || return

  echo ""
  echo "========================================"
  echo "📊 HARNESS DEBUG 세션 요약"
  echo "========================================"

  # 단계별 참조 횟수
  echo ""
  echo "[ 단계별 md 참조 횟수 ]"
  for phase in INIT PLANNING IMPLEMENT LINT TEST REVIEW PR GC ESCALATE; do
    COUNT=$(grep -c "^\[.*\] \[${phase}\]" "$LOG_FILE" 2>/dev/null || echo 0)
    [ "$COUNT" -gt 0 ] && printf "  %-12s %d회\n" "$phase" "$COUNT"
  done

  # 가장 많이 참조된 파일 Top 5
  echo ""
  echo "[ 참조 빈도 Top 5 ]"
  grep -oP '(?<=\] \[READ\] ).*' "$LOG_FILE" 2>/dev/null \
    | sort | uniq -c | sort -rn | head -5 \
    | awk '{printf "  %d회  %s\n", $1, $2}'

  # 전체 참조 경로 (순서대로)
  echo ""
  echo "[ 전체 참조 흐름 ]"
  grep -oP '^\[.*?\] \[.*?\] \[.*?\] .*' "$LOG_FILE" 2>/dev/null \
    | head -30

  echo ""
  echo "📁 전체 로그: $LOG_FILE"
  echo "========================================"

  # 요약을 로그 파일 끝에도 기록
  cat >> "$LOG_FILE" << EOF

========================================
SESSION ENDED: $(date '+%Y-%m-%d %H:%M:%S')
========================================
EOF
}
```

---

## 로그 뷰어 (별도 터미널에서 실시간 확인)

```bash
# 실시간 스트리밍
tail -f .harness-debug/latest.log

# 참조 흐름만 추출
grep -E "^\[.*\] \[.*\] \[.*\]" .harness-debug/latest.log

# 특정 단계만 필터
grep "\[REVIEW\]" .harness-debug/latest.log

# 특정 파일 참조 이력
grep "checklist.md" .harness-debug/latest.log
```
