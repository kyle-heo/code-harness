# gc-jobs/doc-staleness-check.md
> 리포지터리 내 문서가 코드베이스와 일치하는지 주기적으로 검사합니다.
> 에이전트 관점에서 "컨텍스트 내에 없는 것은 존재하지 않는 것"이므로
> 오래된 문서는 잘못된 컨텍스트를 주입하는 것과 같습니다.

---

## 검사 대상 및 기준

| 문서 | 연결된 코드/상태 | 실패 기준 |
|------|----------------|-----------|
| `ARCHITECTURE.md` | 실제 디렉토리 구조 | 레이어 불일치 |
| `CONSTRAINTS.md` | `linters/*.js` | C-번호 누락 또는 린터 없는 항목 |
| `SIGNALS.md` | 린터 실제 위반 수 | 24시간 이상 미갱신 |
| `docs/plans/exec-plans/active/*.md` | PR 상태 | 완료된 플랜이 active에 잔류 |
| `docs/specs/*.md` | 구현 코드 | 스펙에 없는 기능이 구현됨 |

---

## 실행 지시사항 (Claude Code에게)

### 1단계: 문서-코드 불일치 감지

```bash
# ARCHITECTURE.md의 레이어 정의와 실제 디렉토리 구조 비교
# (코드베이스 탐색 후 불일치 목록 작성)

# CONSTRAINTS.md C-번호 목록과 linters/ 파일 목록 교차 검증
ls linters/ | grep -v README

# exec-plans/active/ 내 플랜의 관련 PR 상태 확인 (gh CLI 사용)
gh pr list --state merged --json title,mergedAt
```

### 2단계: 경고 항목 분류

경고 심각도:
- **HIGH**: CONSTRAINTS.md ↔ 린터 불일치 (즉시 수정)
- **MEDIUM**: 완료된 플랜이 active에 잔류 (48시간 내 이동)
- **LOW**: 스펙과 구현 마이너 불일치 (다음 스프린트 내 정렬)

### 3단계: 자동 수정 가능 항목 처리

자동으로 처리 가능한 항목:
- 완료된 exec-plan을 `active/` -> `completed/`로 이동
- SIGNALS.md 문서 최신성 점수 갱신
- 스테일한 generated/ 파일 재생성 트리거

### 4단계: 수동 수정 필요 항목 PR 생성

HIGH 심각도 불일치가 있는 경우:
- 수정 PR 오픈 (제목: `docs: 문서 최신성 정렬 - [날짜]`)
- SIGNALS.md 경고 건수 갱신

---

## 실행 주기

- 매일 오전 3시 (KST) 정기 실행
- SIGNALS.md 문서 최신성 경고 > 3건 시 즉시 실행
