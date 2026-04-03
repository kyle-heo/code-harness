# gc-jobs/quality-grader.md
> 코드베이스 품질 점수를 자동으로 산정하고 SIGNALS.md를 갱신하는 잡입니다.
> 트리거: PR 병합 시 / 전체 품질 점수 < 70

---

## 실행 지시사항 (Codex에게)

### 1단계: 메트릭 수집

```bash
# 테스트 커버리지
npx jest --coverage --coverageReporters=json-summary

# 린터 위반 전수 조사
node linters/layer-deps.js --count
node linters/boundary-check.js --count
node linters/naming-conv.js --count
node linters/file-size.js --count

# 중복 구현 감지
npx jscpd src/ --min-lines 10 --reporters json
```

### 2단계: 점수 계산

`docs/quality/QUALITY_SCORE.md`의 가중치 공식 적용:

```
테스트 커버리지 점수   = min(브랜치커버리지 / 0.8 × 100, 100)
린터 클린 점수        = max(100 - (위반수 × 5), 0)
레이어 준수 점수      = max(100 - (C-001위반 × 20), 0)
공유유틸 점수         = max(100 - (중복건수 × 10), 0)
문서 최신성 점수      = doc-staleness-check 결과

품질 점수 = 커버리지×0.3 + 린터×0.25 + 레이어×0.2 + 공유유틸×0.15 + 문서×0.1
```

### 3단계: SIGNALS.md 갱신

계산된 점수와 상태(🟢/🟡/🔴)를 `SIGNALS.md` 대시보드에 업데이트.

### 4단계: 조치 판단

| 점수 | 조치 |
|------|------|
| 90+ | SIGNALS.md 갱신만 수행 |
| 70-89 | `auto-refactor-pr.md` 트리거 (대상 범위: 점수 하락 기여 상위 3개 파일) |
| 70 미만 | `auto-refactor-pr.md` + 사람 에스컬레이션 |

---

## 실행 주기

- PR 병합 시 자동 실행
- 전체 품질 점수 < 70 감지 시 즉시 재실행
