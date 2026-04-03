# SIGNALS.md
> 품질, 보안, 신뢰성, 프론트엔드 상태를 통합하는 **단일 신호 허브**입니다.
> 에이전트 실패 감지 시 이 파일에 기록 -> gc-jobs가 자동 픽업합니다.
> 세부 기준은 `docs/quality/` 하위 파일을 참조하십시오.

---

## 현재 상태 대시보드

| 영역 | 상태 | 점수 | 마지막 갱신 | 담당 GC 잡 |
|------|------|------|------------|-----------|
| 전체 품질 | 🟡 초기화 | -/100 | - | `gc-jobs/quality-grader.md` |
| 보안 | 🟡 초기화 | -/100 | - | `gc-jobs/constraint-enforcer.md` |
| 신뢰성 | 🟡 초기화 | -/100 | - | `gc-jobs/drift-detector.md` |
| 프론트엔드 | 🟡 초기화 | -/100 | - | `gc-jobs/quality-grader.md` |
| 문서 최신성 | 🟡 초기화 | - | - | `gc-jobs/doc-staleness-check.md` |

> 상태 범례: 🟢 양호(80+) / 🟡 주의(60-79) / 🔴 위험(60 미만)

---

## 린터 연결 테이블

| CONSTRAINTS ID | 린터 파일 | CI 단계 | 현재 위반 수 |
|----------------|-----------|---------|-------------|
| C-001 | `linters/layer-deps.js` | pre-merge | 0 |
| C-002 | `linters/boundary-check.js` | pre-merge | 0 |
| C-003 | `linters/naming-conv.js` | pre-merge | 0 |
| C-004 | `linters/file-size.js` | pre-merge | 0 |
| C-005 | `linters/naming-conv.js` | pre-merge | 0 |
| C-006 | `linters/boundary-check.js` | pre-merge | 0 |
| C-007 | `linters/naming-conv.js` | pre-merge | 0 |

---

## GC 자동 트리거 조건

gc-jobs는 다음 조건에서 자동 실행됩니다:

| 조건 | 트리거되는 잡 |
|------|-------------|
| 에이전트 실패 기록 추가됨 | `constraint-enforcer.md` |
| 전체 품질 점수 < 70 | `quality-grader.md` + `auto-refactor-pr.md` |
| 린터 위반 수 > 5 | `drift-detector.md` |
| 문서 최신성 경고 > 3건 | `doc-staleness-check.md` |
| 보안 점수 < 80 | `constraint-enforcer.md` (즉시) |
| PR 병합 후 24시간 경과 | `drift-detector.md` (정기) |

---

## 최근 실패 로그

<!-- 에이전트는 실패 시 이 섹션에 항목을 추가합니다 -->
<!-- 형식: | 날짜 | 실패 유형 | 누락 요소 | 처리 상태 | -->

| 날짜 | 실패 유형 | 누락된 도구/가드레일/문서 | 처리 상태 |
|------|-----------|--------------------------|-----------|
| (초기화) | - | - | - |

---

## 에스컬레이션 기준

다음 상황에서만 사람에게 에스컬레이션:
- 보안 취약점 (CVSS 7.0 이상) 감지
- 불변 조건 변경이 아키텍처 재설계를 요구하는 경우
- 두 개 이상의 gc-jobs가 충돌하는 수정을 제안하는 경우
- 프로덕션 데이터 영향 가능성이 있는 변경
