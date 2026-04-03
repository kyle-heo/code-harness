# TODOS
> gstack TODOS 포맷 기반. exec-plans/와 tech-debt.md를 보완합니다.
> 에이전트는 작업 완료 시 항목을 `## Completed`로 이동시킵니다.

---

## 우선순위 정의

| 등급 | 정의 |
|------|------|
| **P0** | 블로킹: 다음 릴리즈 전 반드시 완료 |
| **P1** | Critical: 이번 사이클에 완료 필요 |
| **P2** | Important: P0/P1 완료 후 처리 |
| **P3** | Nice-to-have: 도입/사용 데이터 후 재검토 |
| **P4** | Someday: 좋은 아이디어, 긴급하지 않음 |

---

## TODO 항목 형식

```markdown
### {제목}

**What:** 작업에 대한 한 줄 설명.

**Why:** 해결하는 구체적인 문제 또는 제공하는 가치.

**Context:** 3개월 후 이 작업을 맡는 사람이 동기, 현재 상태, 시작 위치를 이해할 수 있는 충분한 세부 사항.

**Effort:** S / M / L / XL
**Priority:** P0 / P1 / P2 / P3 / P4
**Depends on:** {선행 조건 또는 "없음"}
```

---

## Infrastructure

### AGENTS.md 자동 갱신 파이프라인 구축

**What:** gc-jobs/drift-detector.md가 AGENTS.md 갱신 이력 섹션을 자동으로 업데이트하는 CI 잡 구현.

**Why:** 현재는 에이전트가 수동으로 갱신해야 하며, 누락될 수 있음.

**Context:** AGENTS.md의 "자동 갱신 이력" 섹션이 gc-jobs에 의해 채워져야 하지만, 실제 CI 트리거가 아직 없음. GitHub Actions 또는 pre-commit hook으로 구현 가능.

**Effort:** M
**Priority:** P2
**Depends on:** 없음

---

### 린터 통합 테스트 작성

**What:** `linters/` 4개 파일에 대한 자동화된 통합 테스트 작성.

**Why:** 린터 코드가 변경될 때 회귀 방지. 현재 린터 자체에 테스트 없음.

**Context:** `linters/layer-deps.js`, `boundary-check.js`, `naming-conv.js`, `file-size.js` 각각에 대해 위반/통과 케이스를 포함한 테스트 픽스처 생성.

**Effort:** M
**Priority:** P2
**Depends on:** 없음

---

## Review

### 스페셜리스트 병렬 실행 메커니즘

**What:** `review/specialists/` 하위 4개 스페셜리스트를 병렬 서브에이전트로 실행하는 스킬 구현.

**Why:** 현재 checklist.md가 직렬 실행을 안내하지만, 병렬 실행 시 리뷰 속도 4배 향상 가능.

**Context:** gstack의 `/review`는 specialist 서브에이전트를 병렬로 실행하여 결과를 집계함. 우리 `skills/pr-lifecycle.md`의 agent-to-agent 리뷰에 동일 패턴 적용.

**Effort:** L
**Priority:** P2
**Depends on:** 없음

---

## Completed

<!-- 완료된 항목: 원본 내용 유지 + Completed 필드 추가 -->
<!-- 형식: **Completed:** vX.Y.Z (YYYY-MM-DD) -->
