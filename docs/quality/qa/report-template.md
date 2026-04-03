# QA 리포트: {APP_NAME}

| 필드 | 값 |
|------|----|
| **날짜** | {DATE} |
| **URL** | {URL} |
| **브랜치** | {BRANCH} |
| **커밋** | {COMMIT_SHA} ({COMMIT_DATE}) |
| **PR** | {PR_NUMBER} ({PR_URL}) 또는 "—" |
| **티어** | Quick(critical/high만) / Standard(+medium) / Exhaustive(+cosmetic) |
| **범위** | {SCOPE 또는 "전체 앱"} |
| **소요 시간** | {DURATION} |
| **방문 페이지 수** | {COUNT} |
| **스크린샷 수** | {COUNT} |

---

## 건강 점수: {SCORE}/100

| 카테고리 | 점수 |
|----------|------|
| 콘솔 | {0-100} |
| 링크 | {0-100} |
| 시각 | {0-100} |
| 기능 | {0-100} |
| UX | {0-100} |
| 성능 | {0-100} |
| 접근성 | {0-100} |

---

## 수정 우선 3가지

1. **{ISSUE-NNN}: {제목}** — {한 줄 설명}
2. **{ISSUE-NNN}: {제목}** — {한 줄 설명}
3. **{ISSUE-NNN}: {제목}** — {한 줄 설명}

---

## 요약

| 심각도 | 수 |
|--------|-----|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| **합계** | **0** |

---

## 이슈 목록

### ISSUE-001: {짧은 제목}

| 필드 | 값 |
|------|----|
| **심각도** | critical / high / medium / low |
| **카테고리** | visual / functional / ux / content / performance / console / accessibility |
| **URL** | {페이지 URL} |

**설명:** {무엇이 잘못됨, 예상 vs 실제}

**재현 단계:**

1. {URL}로 이동
2. {동작}
3. **관찰:** {무엇이 잘못되는가}

---

## 적용된 수정 (해당 시)

| 이슈 | 수정 상태 | 커밋 | 변경 파일 |
|------|-----------|------|-----------|
| ISSUE-NNN | verified / best-effort / reverted / deferred | {SHA} | {파일} |

### 전/후 증거

#### ISSUE-NNN: {제목}
**수정 전:** {스크린샷 또는 설명}
**수정 후:** {스크린샷 또는 설명}

---

## 선적 준비 여부

| 지표 | 값 |
|------|----|
| 건강 점수 | {이전} → {이후} ({변화}) |
| 발견된 이슈 | N |
| 적용된 수정 | N (verified: X, best-effort: Y, deferred: Z) |
| 지연된 이슈 | N |

**PR 요약:** "QA에서 N개 이슈 발견, M개 수정, 건강 점수 X → Y."
