# gc-jobs/drift-detector.md
> 패턴 드리프트를 감지하고 AGENTS.md를 자동 갱신하는 백그라운드 잡입니다.
> 트리거: PR 병합 후 24시간 경과 / SIGNALS.md 린터 위반 수 > 5

---

## 목적

Claude Code는 리포지터리에 이미 존재하는 패턴(최적 상태가 아닌 패턴 포함)을 복제합니다.
이 잡은 드리프트를 매일 감지하여 나쁜 패턴이 코드베이스에 퍼지기 전에 차단합니다.

---

## 실행 지시사항 (Claude Code에게)

다음 단계를 순서대로 수행하십시오:

### 1단계: 드리프트 감지

```bash
# 불변 조건 위반 전체 스캔
node linters/layer-deps.js --report
node linters/boundary-check.js --report
node linters/naming-conv.js --report
node linters/file-size.js --report
```

### 2단계: 패턴 분석

스캔 결과를 바탕으로 다음을 파악:
- 반복 발생하는 위반 패턴 (동일 유형이 3건 이상이면 "드리프트"로 분류)
- 새로 도입된 안티패턴
- `CONSTRAINTS.md`에 없는 신규 위반 유형

### 3단계: SIGNALS.md 갱신

`SIGNALS.md`의 현재 상태 대시보드와 린터 연결 테이블을 최신 수치로 갱신.

### 4단계: AGENTS.md 갱신

`AGENTS.md`의 갱신 이력 섹션에 다음 형식으로 추가:
```
| YYYY-MM-DD | drift-detector 실행: [발견된 드리프트 요약] | 자동(drift-detector) |
```

### 5단계: 리팩터링 PR 생성 (필요 시)

드리프트 심각도가 높으면 `gc-jobs/auto-refactor-pr.md` 실행.

---

## 실행 주기

- 정기: 매일 오전 2시 (KST)
- 즉시: SIGNALS.md에 에이전트 실패 기록 추가 시
- 즉시: 린터 위반 수 > 5 감지 시
