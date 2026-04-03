# Backend Python 컨벤션
> 기반: Google Python Style Guide + PEP 8 + Black + Ruff
> 참조:
>   https://google.github.io/styleguide/pyguide.html
>   https://peps.python.org/pep-0008/

---

## 도구 스택

| 도구 | 역할 |
|------|------|
| **Black** | 자동 포맷터 (opinionated) |
| **Ruff** | 린터 + import 정렬 (flake8 + isort 대체, 100x 빠름) |
| **mypy** | 정적 타입 검사 |
| **bandit** | 보안 취약점 분석 |

> Ruff는 flake8 + isort + pyupgrade를 단일 도구로 대체합니다.
> 2024년 기준 Airbnb, Netflix 내부 Python 팀도 Ruff로 이전 중입니다.

---

## `pyproject.toml` (전체 설정 통합)

```toml
[tool.black]
line-length = 100
target-version = ["py311"]
include = '\.pyi?$'
extend-exclude = '''
/(
  \.git | \.hg | \.mypy_cache | \.tox | \.venv
  | _build | buck-out | build | dist | migrations
)/
'''

# ── Ruff (flake8 + isort 대체) ──
[tool.ruff]
target-version = "py311"
line-length = 100
select = [
  "E",    # pycodestyle errors
  "W",    # pycodestyle warnings
  "F",    # pyflakes
  "I",    # isort
  "B",    # flake8-bugbear (Netflix 패턴 - 버그 유발 패턴 감지)
  "C4",   # flake8-comprehensions
  "UP",   # pyupgrade (최신 Python 문법 강제)
  "S",    # flake8-bandit (보안)
  "SIM",  # flake8-simplify
  "TCH",  # flake8-type-checking (타입 import 최적화)
  "RUF",  # Ruff 자체 규칙
  "N",    # pep8-naming
  "ANN",  # flake8-annotations (타입 어노테이션 강제)
]
ignore = [
  "E501",     # line-too-long (black이 처리)
  "S101",     # assert 사용 (테스트에서 필요)
  "ANN101",   # self 타입 어노테이션 불필요
  "ANN102",   # cls 타입 어노테이션 불필요
]
per-file-ignores = { "tests/**/*.py" = ["S", "ANN"] }

[tool.ruff.isort]
known-first-party = ["app", "src"]    # 프로젝트 패키지명으로 변경
force-single-line = false
lines-after-imports = 2
combine-as-imports = true

[tool.ruff.flake8-bugbear]
extend-immutable-calls = ["fastapi.Depends", "fastapi.Query"]

# ── mypy (엄격 모드) ──
[tool.mypy]
python_version = "3.11"
strict = true                         # Google: 타입 안전성 최우선
disallow_untyped_defs = true
disallow_any_generics = true
disallow_untyped_calls = true
warn_return_any = true
warn_unused_ignores = true
no_implicit_optional = true
check_untyped_defs = true
ignore_missing_imports = false
plugins = ["pydantic.mypy"]           # Pydantic 타입 추론

# ── bandit (보안) ──
[tool.bandit]
exclude_dirs = ["tests", ".venv"]
skips = ["B101"]                      # assert 허용 (테스트)
```

---

## `.flake8` (Ruff 미사용 환경 대체용)

```ini
[flake8]
max-line-length = 100
extend-ignore = E203, W503, E501
exclude =
    .git,
    __pycache__,
    .venv,
    build,
    dist,
    migrations
per-file-ignores =
    tests/*.py: S101, ANN
max-complexity = 10
```

---

## pre-commit 설정

`.pre-commit-config.yaml` 추가:
```yaml
  - repo: https://github.com/psf/black
    rev: 24.4.2
    hooks:
      - id: black
        language_version: python3.11

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.7
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.10.0
    hooks:
      - id: mypy
        additional_dependencies: [pydantic, types-requests]

  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.8
    hooks:
      - id: bandit
        args: ["-c", "pyproject.toml"]
```

---

## 네이밍 컨벤션 (Google Python Style)

| 항목 | 규칙 | 예시 |
|------|------|------|
| 모듈/패키지 | snake_case | `user_service.py` |
| 클래스 | PascalCase | `UserService` |
| 함수/메서드 | snake_case | `get_user_by_id` |
| 변수 | snake_case | `user_id` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 보호 멤버 | _snake_case | `_validate_email` |
| 비공개 멤버 | __snake_case | `__hash_password` |
| 타입 변수 | PascalCase | `T`, `UserT` |

---

## 코드 패턴 가이드

```python
# ✅ 레이어 구조 준수 (C-001 연동)
# Router (UI) → Service → Repository → Model (Types)

# [Types/Schema] Pydantic 모델 (경계 파싱 - C-002)
from pydantic import BaseModel, EmailStr, field_validator


class CreateUserRequest(BaseModel):
    email: EmailStr
    name: str
    age: int

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v) < 1 or len(v) > 100:
            raise ValueError("이름은 1-100자여야 합니다")
        return v.strip()


# [Repository] 경계에서 즉시 파싱 (C-002)
async def find_by_id(user_id: str) -> User:
    raw = await db.fetch_one("SELECT * FROM users WHERE id = $1", user_id)
    if raw is None:
        raise UserNotFoundError(user_id)
    return User.model_validate(dict(raw))   # 경계 파싱


# [Service] 비즈니스 로직
async def create_user(request: CreateUserRequest) -> User:
    if await user_repo.exists_by_email(request.email):
        raise DuplicateEmailError(request.email)
    return await user_repo.create(request)


# ❌ 금지 패턴
def get_user(id):                           # 타입 어노테이션 없음
    query = f"SELECT * FROM users WHERE id = {id}"  # SQL 인젝션
    result = db.execute(query)
    return result                           # 경계 파싱 없음


# ✅ 로깅 (C-003: print 금지, 구조화 로깅)
import structlog

logger = structlog.get_logger()

async def create_user(request: CreateUserRequest) -> User:
    logger.info("user.create.start", email=request.email)
    user = await user_repo.create(request)
    logger.info("user.create.done", user_id=user.id)
    return user
```

---

## 타입 어노테이션 가이드 (Google Python Style)

```python
# ✅ 모든 함수에 타입 어노테이션 필수
from typing import Optional, Union
from collections.abc import Sequence


def process_users(
    users: Sequence[User],
    status: Optional[str] = None,
) -> list[UserResponse]:
    ...


# Python 3.10+ 유니온 타입
def find_user(id: str) -> User | None: ...

# ✅ TypeAlias 활용
from typing import TypeAlias
UserId: TypeAlias = str
UserMap: TypeAlias = dict[UserId, User]
```
