# CLAUDE.md
> Claude Code가 세션 시작 시 자동으로 읽는 파일입니다.
> SKILL.md 500줄 제한 준수 — 상세 내용은 skills/ 하위 파일에 위임합니다.

---

## 하네스 설정

```
HARNESS_DEBUG=false          # true: md 참조 로그 활성화 (.harness-debug/latest.log)
HARNESS_DEBUG_VERBOSE=false  # true: 각 파일 읽기 결론도 함께 로깅
```

---

## 세션 시작 시 필수 순서

```
0. [DEBUG] HARNESS_DEBUG 확인 → true면 skills/harness-debug.md 로드
1. AGENTS.md 읽기       → 전체 구조 파악
2. SIGNALS.md 읽기      → 현재 품질 상태 및 최근 실패 확인
3. docs/plans/exec-plans/active/ 읽기 → 진행 중인 플랜 확인
4. MEMORY.md 확인       → 이전 세션에서 누적된 코드베이스 지식
5. 작업 시작
```

---

## Claude Code 특화 기능 활용

### Hooks (자동 실행 — 설정 완료)

`.claude/settings.json`에 이미 설정됨:
- **PostToolUse(Edit/Write)**: 파일 저장 시 린터 4종 자동 실행 (C-001~C-007)
- **PreToolUse(Bash)**: 위험 명령(rm -rf, DROP TABLE 등) 자동 차단

별도 린터 실행 불필요. 코드 작성 즉시 위반이 감지됩니다.

### 서브에이전트 (.claude/agents/)

| 에이전트 | 자동 활성화 조건 | 역할 |
|----------|----------------|------|
| `reviewer` | "review", "PR 리뷰", "코드 검토" | 병렬 코드 리뷰 |
| `qa-agent` | "QA", "버그 찾아", "테스트" | 브라우저 QA |
| `gc-agent` | "gc", "드리프트", "품질 정리" | 백그라운드 GC |

병렬 실행이 필요하면 Task()를 직접 사용:
```
Task(보안 분석), Task(성능 분석), Task(테스팅 분석) 를 동시에 실행해줘
```

### Skills (온디맨드 자동 로딩)

작업 컨텍스트에 맞는 스킬이 자동으로 로드됩니다:
- 버그 리포트 → `skills/investigate.md`
- PR 오픈 → `skills/pr-lifecycle.md`
- 기능 구현 → `skills/auto-feature-runner.md`
- md 디버깅 → `skills/harness-debug.md`

### Memory (세션 간 지식 누적)

발견한 코드베이스 지식을 MEMORY.md에 기록해 다음 세션에서 활용합니다:
```
코드패스, 패턴, 라이브러리 위치, 아키텍처 결정 사항을 발견하면
MEMORY.md에 간결하게 기록하십시오.
```

### 백그라운드 실행

GC, 장시간 작업은 Ctrl+B로 백그라운드 전환하여 메인 세션을 유지합니다.

---

## 디버그 모드 (HARNESS_DEBUG=true)

활성화 시 모든 md 참조를 `.harness-debug/latest.log`에 기록합니다.

**로그 형식:**
```
[HH:mm:ss] [PHASE] [ACTION] path/to/file.md
  reason:       왜 이 파일을 읽었는가
  triggered_by: 어떤 규칙이 유발했는가
  sections:     읽은 섹션
  outcome:      얻은 결론 한 줄
```

**실시간 터미널 출력:**
```
🔍 [INIT] READ → AGENTS.md
     ↳ 세션 시작 - 전체 하네스 구조 파악
```

**세션 종료 시 요약:** 단계별 참조 횟수, Top 5 파일, 전체 흐름 타임라인

**로그 조회:**
```bash
tail -f .harness-debug/latest.log
grep "\[REVIEW\]" .harness-debug/latest.log
```

상세: `skills/harness-debug.md`

---

## 핵심 규칙

- **코드 작성**: Hook이 자동 린터 실행 — 별도 실행 불필요
- **버그 발생**: `skills/investigate.md` 4단계 (추측 기반 수정 금지)
- **PR 오픈**: `reviewer` 에이전트 실행 또는 `skills/pr-lifecycle.md`
- **실패 시**: `SIGNALS.md` 실패 로그 즉시 기록
- **시간 추정**: "사람 N시간 / Claude Code M분" 두 가지 명시

---

## 레이어 의존성

```
Types → Config → Repo → Service → Runtime → UI
```

역방향 import = Hook이 즉시 감지 + 블로킹. 횡단 관심사는 `providers/` 경유 필수.

---

## 자동화 실행 모드

```
feature-queue.json 읽기 → skills/auto-feature-runner.md 절차 실행
Hook이 저장마다 린터 자동 실행 → 서브에이전트 병렬 리뷰 → PR 오픈 → 반복
```

---

## 의사결정 원칙 (`docs/ethos/ETHOS.md`)

1. **완성도**: 완전한 구현이 단축보다 몇 분 더 걸릴 때 → 항상 완전한 것
2. **검색 우선**: 익숙하지 않은 패턴 → 먼저 검색 후 구현
3. **사용자 주권**: 방향 변경에 동의해도 → 추천만, 행동은 사람이 결정
