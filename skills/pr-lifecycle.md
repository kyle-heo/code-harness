# skills/pr-lifecycle.md
> 에이전트가 PR을 처음부터 끝까지 자율적으로 처리하는 절차입니다.
> 이 절차를 따르면 사람 개입 없이 PR 오픈 -> 리뷰 -> 병합이 가능합니다.

---

## PR 전체 플로우

```
1. 코드베이스 현재 상태 검증
2. (버그 수정 시) 버그 재현 영상 녹화
3. 수정 구현
4. 테스트 실행 및 린터 통과 확인
5. (UI 변경 시) 수정 후 영상 녹화
6. PR 오픈
7. agent-to-agent 리뷰 요청 및 응답
8. 빌드 실패 감지 및 수정
9. 모든 리뷰어 승인 후 병합
10. 판단 필요 시 사람 에스컬레이션
```

---

## 단계별 상세

### 1. 코드베이스 상태 검증

```bash
# 현재 브랜치 상태
git status && git log --oneline -5

# 전체 린터 통과 확인
node linters/layer-deps.js && node linters/boundary-check.js \
  && node linters/naming-conv.js && node linters/file-size.js
```

### 2. 버그 재현 영상 녹화

`skills/video-capture.md` 참조.
PR 설명에 첨부할 재현 영상 경로 기록.

### 3-4. 구현 및 테스트

- 구현 후 `npx jest` 전체 통과 확인
- UI 변경 시 `skills/chrome-devtools.md`로 DOM 검증

### 6. PR 제목/본문 작성 기준

```
제목 형식: <type>(<scope>): <description>
type: feat | fix | refactor | docs | test | chore
예시: fix(auth): 세션 만료 후 리다이렉트 누락 수정

본문 필수 포함:
- 변경 이유 (왜 필요한가)
- 변경 내용 (무엇을 변경했는가)
- 테스트 결과
- 린터 결과
- (버그) 재현 영상 링크
- (버그) 수정 확인 영상 링크
- QUALITY_SCORE 영향 (있는 경우)
```

### 7. agent-to-agent 리뷰

```bash
# 리뷰 요청 (gh CLI)
gh pr review --request [agent-reviewer]

# 리뷰 코멘트 확인 및 인라인 응답
gh pr view [PR번호] --comments

# 코멘트 반영 후 업데이트 푸시
git add . && git commit -m "review: [코멘트 요약] 반영"
git push
```

### 8. 빌드 실패 대응

```bash
# CI 로그 확인
gh run list --branch [브랜치명]
gh run view [run-id] --log-failed

# 실패 원인 수정 후 재푸시
```

### 9. 병합

모든 리뷰어 승인 + CI 통과 후:
```bash
gh pr merge --squash --delete-branch
```

### 10. 에스컬레이션 기준

다음 상황에서만 사람에게 알림:
- 보안 관련 변경
- 데이터 마이그레이션 포함
- 아키텍처 변경 (ARCHITECTURE.md 수정)
- 48시간 내 리뷰 승인 없음
