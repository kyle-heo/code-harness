# gc-jobs/constraint-enforcer.md
> 에이전트 실패 신호를 받아 CONSTRAINTS.md와 린터를 자동 갱신하는 잡입니다.
> 트리거: SIGNALS.md 실패 로그 추가 / 보안 점수 < 80

---

## 목적

에이전트가 동일 실수를 반복하지 않도록 실패 원인을 구조화하고
불변 조건 및 린터에 영구 인코딩합니다.

Mitchell Hashimoto 원칙: "에이전트가 실수를 할 때마다, 그 실수를 다시는 반복하지 않도록
엔지니어링 해결책을 구축한다."

---

## 실행 지시사항 (Codex에게)

### 1단계: 실패 신호 분석

`SIGNALS.md`의 최근 실패 로그를 읽고 다음을 파악:
- 실패 유형 분류 (레이어 위반 / 경계 검증 누락 / 패턴 드리프트 / 기타)
- 근본 원인 (누락된 도구/가드레일/문서)
- 이미 CONSTRAINTS.md에 존재하는 규칙인지 여부

### 2단계: 불변 조건 갱신

**기존 규칙 위반인 경우**: 린터 강화 (페널티 상향 또는 블로킹으로 격상)

**신규 패턴 위반인 경우**: `CONSTRAINTS.md`에 새 항목 추가:
```markdown
## C-[다음번호]: [규칙명]
- **규칙**: [구체적인 규칙 설명]
- **린터**: `linters/[파일명].js`
- **위반 시**: [경고/블로킹]
- **갱신 이력**: [날짜] - [실패 ID]로 인해 추가
```

### 3단계: 린터 생성/갱신

신규 불변 조건은 반드시 대응하는 린터를 Codex가 직접 작성:

```javascript
// linters/[새파일].js 템플릿
module.exports = {
  name: 'C-[번호]: [규칙명]',
  check: (filePath, content) => {
    const violations = [];
    // 위반 패턴 감지 로직
    return violations; // { line, message, severity: 'error'|'warn' }[]
  }
};
```

### 4단계: SIGNALS.md 연결 테이블 갱신

새 C-번호와 린터 파일을 `SIGNALS.md`의 린터 연결 테이블에 추가.

### 5단계: PR 오픈

변경 사항을 하나의 PR로 묶어 오픈:
- 제목: `fix(constraints): [실패 ID] 재발 방지 불변 조건 추가`
- 본문: 실패 원인, 추가된 불변 조건, 린터 설명 포함
- agent-to-agent 리뷰 요청

---

## 실행 주기

- 즉시: SIGNALS.md 실패 로그 추가 시
- 즉시: 보안 점수 < 80 감지 시
