# AGENTS.md
> 이 파일은 에이전트의 진입점입니다. 작업 시작 전 반드시 읽으십시오.
> 에이전트 실패 또는 패턴 드리프트 감지 시 gc-jobs/가 이 파일을 자동 갱신합니다.

---

## 이 리포지터리에서 작업하는 방법

1. **먼저 읽을 파일**: `ARCHITECTURE.md` -> `CONSTRAINTS.md` -> `SIGNALS.md`
2. **기능 작업**: `docs/specs/` 하위 관련 스펙 확인 후 `docs/plans/exec-plans/active/` 에서 현재 플랜 확인
3. **코드 작성 전**: `CONSTRAINTS.md`의 레이어 의존성 규칙과 불변 조건 확인
4. **PR 오픈 전**: `docs/quality/QUALITY_SCORE.md` 기준 자가 평가 후 `skills/pr-lifecycle.md` 절차 수행
5. **실패 시**: 즉시 `SIGNALS.md`에 실패 유형 기록 -> gc-jobs가 자동으로 픽업

---

## 디렉토리 맵 (TOC)

| 경로 | 역할 | 우선순위 |
|------|------|----------|
| `ARCHITECTURE.md` | 레이어 구조 및 의존성 방향 규칙 | P0 |
| `CONSTRAINTS.md` | 불변 조건 목록 및 린터 연결 | P0 |
| `SIGNALS.md` | 품질/보안/신뢰성 통합 신호 허브 | P0 |
| `docs/specs/` | 제품 스펙 및 설계 문서 | P1 |
| `docs/plans/` | 실행 계획 및 기술 부채 | P1 |
| `docs/context/` | 외부 참조 문서 및 생성 산출물 | P2 |
| `docs/quality/` | 품질/보안/신뢰성/프론트엔드 기준 | P1 |
| `linters/` | 자동화된 제약 검사 도구 | P0 |
| `skills/` | 에이전트 런타임 스킬 정의 | P1 |
| `gc-jobs/` | 가비지 컬렉션 및 자동 수정 잡 | P0 |
| `docs/ethos/ETHOS.md` | 엔지니어링 철학 및 판단 기준 | P0 |
| `docs/quality/review/` | PR 리뷰 체크리스트 + 스페셜리스트 | P1 |
| `docs/quality/qa/` | QA 이슈 분류 체계 + 리포트 템플릿 | P1 |
| `docs/plans/TODOS.md` | 우선순위 기반 작업 목록 | P1 |
| `skills/investigate.md` | 버그 조사 & 근본 원인 분석 | P1 |

---

## 레이어 의존성 (요약)

```
Types -> Config -> Repo -> Service -> Runtime -> UI
```
횡단 관심사(인증, 텔레메트리, 피처 플래그)는 반드시 `Providers` 인터페이스를 통해서만 진입.
위반 시 `linters/layer-deps.js`가 CI에서 블로킹.

---

## 에이전트 실패 시 프로토콜

```
1. SIGNALS.md > "## 최근 실패 로그" 섹션에 실패 항목 추가
2. 버그/에러인 경우 → skills/investigate.md 4단계 절차 실행 (추측 기반 수정 금지)
3. 누락된 도구/가드레일/문서가 무엇인지 명시
4. Claude Code가 직접 수정 PR 오픈 (skills/pr-lifecycle.md 참조)
5. gc-jobs/constraint-enforcer.md 트리거 조건 충족 시 자동 린터 재생성
```

## 의사결정 원칙 (ETHOS.md 요약)

- **호수를 끓여라**: 시간 추정 시 반드시 "사람 N시간 / AI-assisted M분" 두 가지를 명시
- **만들기 전에 검색하라**: 익숙하지 않은 패턴은 먼저 검색 후 구현
- **사용자 주권**: Claude Code가 방향 변경에 동의해도 → 추천하고 물어보기, 행동 금지

→ 상세 내용: `docs/ethos/ETHOS.md`

---

## 자동 갱신 이력

<!-- gc-jobs/drift-detector.md가 이 섹션을 자동으로 업데이트합니다 -->
| 날짜 | 갱신 내용 | 트리거 |
|------|-----------|--------|
| (초기화) | 최초 생성 | 수동 |
