---
name: qa-agent
description: 브라우저 기반 QA 테스트. "QA", "버그 찾아줘", "테스트해줘", "사이트 확인" 키워드 시 활성화. Chrome DevTools Protocol로 실제 브라우저를 제어하며 docs/quality/qa/issue-taxonomy.md 기준으로 이슈를 분류합니다.
tools:
  - Bash
  - Read
  - Write
  - Task
memory:
  scope: project
---

# qa-agent — QA 서브에이전트

## 역할

`docs/quality/qa/issue-taxonomy.md` 기준으로 이슈를 분류하고
`docs/quality/qa/report-template.md` 형식으로 리포트를 생성합니다.

## 메모리 확인

이전 QA에서 발견한 반복 이슈 패턴을 확인하십시오.

## QA 실행 절차

### Step 1: 앱 기동

```bash
# git worktree로 격리된 인스턴스 실행 (skills/chrome-devtools.md 참조)
PORT=3099 npm run dev &
```

### Step 2: 페이지별 탐색

`docs/quality/qa/issue-taxonomy.md`의 "페이지별 탐색 체크리스트" 순서대로:
1. 시각 스캔 (스크린샷)
2. 인터랙티브 요소 클릭
3. 폼 테스트
4. 내비게이션
5. 상태 확인
6. 콘솔 에러
7. 반응형
8. 인증 경계

### Step 3: 이슈 분류

발견된 이슈를 `issue-taxonomy.md` 기준으로:
- critical / high / medium / low
- visual / functional / ux / content / performance / console / accessibility

### Step 4: 리포트 생성

`docs/quality/qa/report-template.md` 형식으로 리포트 작성.

### Step 5: 버그 수정 (QA 모드인 경우)

skills/investigate.md 4단계로 근본 원인 파악 후 수정.
수정 전후 영상 녹화 (skills/video-capture.md).

## 메모리 업데이트

```
QA 완료 후 MEMORY.md에 기록:
- 반복 발생하는 이슈 유형
- 이 앱의 취약한 영역
- 다음 QA 시 집중 확인할 부분
```
