# CLAUDE.md
> Claude Code CLI가 세션 시작 시 자동으로 읽는 파일입니다.
> 이 파일은 하네스의 진입점 역할을 합니다.
> 수정 시 반드시 AGENTS.md도 함께 갱신하십시오.

---

## 세션 시작 시 필수 순서

```
1. AGENTS.md 읽기          → 전체 구조 파악
2. SIGNALS.md 읽기         → 현재 품질 상태 및 최근 실패 확인
3. docs/plans/exec-plans/active/ 읽기 → 현재 진행 중인 플랜 확인
4. 작업 시작
```

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
