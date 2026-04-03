# CODE_CONVENTIONS.md
> 스택별 코드 컨벤션 마스터 문서입니다.
> 각 스택의 실제 설정 파일 위치는 아래 표를 참조하십시오.
> 에이전트는 코드 작성 전 반드시 해당 스택의 컨벤션 파일을 확인해야 합니다.

---

## 컨벤션 파일 맵

| 스택 | 컨벤션 문서 | 실제 설정 파일 |
|------|------------|--------------|
| JavaScript / React / Vue | `conventions/frontend-js.md` | `.eslintrc.js`, `.prettierrc` |
| Node.js (Backend) | `conventions/backend-nodejs.md` | `.eslintrc.js`, `.prettierrc` |
| Java | `conventions/backend-java.md` | `checkstyle.xml`, `pmd-rules.xml` |
| Python | `conventions/backend-python.md` | `pyproject.toml`, `.flake8` |
| Android (Kotlin/Java) | `conventions/mobile-android.md` | `.editorconfig`, `detekt.yml` |
| iOS (Swift) | `conventions/mobile-ios.md` | `.swiftlint.yml` |

---

## 공통 원칙 (전 스택 적용)

### 1. 자동화 우선
포맷터가 고칠 수 있는 것은 사람이 수동으로 고치지 않는다.
린터 경고 > 포맷터 자동 수정 > PR 블로킹 순으로 처리.

### 2. 에이전트 가독성
- 한 파일에 하나의 책임 (Single Responsibility)
- 함수/메서드 최대 40줄 (복잡한 비즈니스 로직은 30줄)
- 중첩 깊이 최대 3단계

### 3. 커밋 전 자동 검사
모든 스택은 pre-commit hook으로 자동 검사:
```
포맷터 실행 → 린터 실행 → 타입 검사 → 커밋 허용
```

### 4. 인라인 규칙 비활성화 금지
```javascript
// ❌ 금지 - 예외 없음
// eslint-disable-next-line
// @ts-ignore
// CHECKSTYLE:OFF
// noqa
```
불가피한 경우 CONSTRAINTS.md에 예외 항목으로 등록 후 팀 승인 필요.

---

## pre-commit 공통 설정

`.pre-commit-config.yaml` (루트):
```yaml
repos:
  # 공통
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-merge-conflict
      - id: check-added-large-files
        args: ['--maxkb=500']
      - id: detect-private-key
```
각 스택별 추가 설정은 해당 컨벤션 파일 참조.
