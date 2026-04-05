# skills/auto-feature-runner.md
> 기능 리스트를 순차적으로 자동 실행하는 스킬입니다.
> CLAUDE.md의 "자동화 실행 모드"에서 참조합니다.
> 이 스킬이 작동하려면 feature-queue.json과 각 스펙 파일이 준비되어야 합니다.

---

## 전제 조건

시작 전 다음이 준비되어 있어야 합니다:
1. `docs/plans/exec-plans/active/feature-queue.json` — 기능 큐
2. `docs/specs/` — 각 기능별 스펙 파일
3. `ARCHITECTURE.md` — 실제 프로젝트 레이어 반영 완료
4. 린터 3종 실행 가능 상태 (`node linters/*.js` 동작)
5. 테스트 실행 가능 상태 (`npm test` 또는 `./gradlew test`)

---

## feature-queue.json 형식

```json
{
  "project": "프로젝트명",
  "version": "1.0.0",
  "auto_merge": false,
  "stop_on_failure": true,
  "features": [
    {
      "id": "FEAT-001",
      "title": "사용자 인증 - 로그인",
      "spec": "docs/specs/auth-login.md",
      "status": "pending",
      "priority": "P0",
      "depends_on": [],
      "estimated_human": "2일",
      "estimated_ai": "30분"
    },
    {
      "id": "FEAT-002",
      "title": "사용자 인증 - 회원가입",
      "spec": "docs/specs/auth-signup.md",
      "status": "pending",
      "priority": "P0",
      "depends_on": ["FEAT-001"],
      "estimated_human": "1일",
      "estimated_ai": "20분"
    },
    {
      "id": "FEAT-003",
      "title": "대시보드 메인 화면",
      "spec": "docs/specs/dashboard-main.md",
      "status": "pending",
      "priority": "P1",
      "depends_on": ["FEAT-001"],
      "estimated_human": "3일",
      "estimated_ai": "45분"
    }
  ]
}
```

**status 값**: `pending` → `in-progress` → `done` | `failed` | `skipped`

---

## 자동 실행 루프 (Claude Code에게)

### 루프 시작 전 체크

```bash
# 1. 큐 파일 읽기
cat docs/plans/exec-plans/active/feature-queue.json

# 2. 현재 SIGNALS.md 상태 확인
cat SIGNALS.md | grep "현재 상태 대시보드" -A 10

# 3. 린터 전체 통과 여부 확인
node linters/layer-deps.js src/ --count
node linters/boundary-check.js src/ --count
node linters/naming-conv.js src/ --count
```

린터 CRITICAL 위반이 있으면 **루프 시작 전 먼저 수정**.

---

### 단일 기능 실행 절차 (각 FEAT-NNN마다 반복)

#### Step 1: 기능 선택
```
feature-queue.json에서:
- status = "pending"
- depends_on 의 모든 항목이 status = "done"
인 첫 번째 항목 선택
```

#### Step 2: 상태 업데이트
```json
"status": "in-progress"
```
feature-queue.json 즉시 저장.

#### Step 3: 스펙 읽기
```bash
cat [spec 파일 경로]
```
수용 기준(AC)을 모두 파악한 후 구현 시작.

#### Step 4: 구현
- `CONSTRAINTS.md` C-001~C-007 준수
- `ARCHITECTURE.md` 레이어 규칙 준수
- 레이어별 파일 크기 제한 준수 (C-004)
- 테스트 코드 구현과 동시에 작성 (분리 PR 금지)

#### Step 5: 린터 검증
```bash
node linters/layer-deps.js src/
node linters/boundary-check.js src/
node linters/naming-conv.js src/
node linters/file-size.js src/
```
위반 있으면 즉시 수정. 위반 0건 확인 후 다음 단계.

#### Step 6: 테스트 실행
```bash
# 프로젝트에 맞게 조정
npm test                    # Node.js
./gradlew test              # Java
pytest                      # Python
```
실패 시 `skills/investigate.md` 절차로 근본 원인 파악 후 수정.

#### Step 7: 서브에이전트 병렬 리뷰
```bash
# docs/quality/review/checklist.md Pass 1 실행
# SQL 안전 / 경쟁 조건 / LLM 신뢰 경계 / 인젝션 / Enum 완전성
```

#### Step 8: PR 오픈
`skills/pr-lifecycle.md` 절차 실행:
```bash
gh pr create \
  --title "feat([FEAT-NNN]): [기능 제목]" \
  --body "## 변경 내용
[구체적 변경]

## 수용 기준 충족
- [x] AC-001: ...
- [x] AC-002: ...

## 테스트 결과
- 린터: 위반 0건
- 테스트: 전체 통과

## 시간 추정
- 사람: [estimated_human]
- AI-assisted: [실제 소요 시간]"
```

#### Step 9: 상태 업데이트 및 다음 기능으로

**성공 시:**
```json
"status": "done",
"completed_at": "YYYY-MM-DD HH:MM",
"pr_url": "https://github.com/.../pull/N",
"actual_ai_time": "실제 소요 시간"
```

**실패 시:**
```json
"status": "failed",
"failed_at": "YYYY-MM-DD HH:MM",
"failure_reason": "실패 원인 요약"
```
→ SIGNALS.md 실패 로그 기록
→ `stop_on_failure: true`이면 루프 중단 후 사람에게 에스컬레이션
→ `stop_on_failure: false`이면 다음 기능으로 진행

---

## 에스컬레이션 기준

다음 상황에서만 사람에게 알림:
- 스펙이 모호하거나 구현 판단 불가
- 테스트 실패 원인을 investigate 4단계로도 파악 불가
- 보안 관련 변경 (SECURITY.md 기준)
- PR 리뷰에서 ASK 분류 항목 발견
- 두 기능 이상 연속 실패

---

## 루프 완료 후 처리

모든 `pending` 기능이 소진되면:

```bash
# 1. 완료 요약 생성
echo "## 자동화 실행 완료 요약" >> SIGNALS.md
echo "완료: $(jq '[.features[] | select(.status=="done")] | length' feature-queue.json)개" >> SIGNALS.md
echo "실패: $(jq '[.features[] | select(.status=="failed")] | length' feature-queue.json)개" >> SIGNALS.md

# 2. 품질 점수 갱신
# gc-jobs/quality-grader.md 트리거

# 3. feature-queue.json을 completed/로 이동
mv docs/plans/exec-plans/active/feature-queue.json \
   docs/plans/exec-plans/completed/feature-queue-$(date +%Y%m%d).json
```
