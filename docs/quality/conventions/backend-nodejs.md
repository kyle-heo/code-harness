# Backend Node.js 컨벤션
> 기반: Airbnb Base + Google Style Guide (서버 사이드 특화)
> 참조: https://github.com/airbnb/javascript, https://github.com/goldbergyoni/nodebestpractices

---

## 설치 명령

```bash
npm install -D \
  eslint \
  prettier \
  eslint-config-airbnb-base \
  eslint-config-airbnb-typescript \
  eslint-config-prettier \
  eslint-plugin-prettier \
  eslint-plugin-import \
  eslint-plugin-security \
  eslint-plugin-node \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  husky \
  lint-staged
```

---

## ESLint 설정 (`.eslintrc.js`)

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:security/recommended',   // Netflix: 보안 취약점 정적 분석
    'plugin:node/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'import', 'security'],
  rules: {
    // ── TypeScript 엄격 설정 ──
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
    }],
    '@typescript-eslint/explicit-function-return-type': 'error', // 서버는 엄격하게
    '@typescript-eslint/no-unused-vars': ['error', {
      vars: 'all',
      args: 'after-used',
    }],

    // ── Node.js 특화 ──
    'node/no-missing-import': 'off',    // TypeScript resolver가 처리
    'node/no-unsupported-features/es-syntax': 'off',
    'no-console': 'error',              // C-003: providers/telemetry 사용 강제
    'no-process-exit': 'error',         // 프로세스 강제 종료 금지
    'no-sync': 'warn',                  // 동기 파일 IO 경고

    // ── 보안 (Netflix DGS 패턴 참고) ──
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-possible-timing-attacks': 'error',
    'no-eval': 'error',
    'no-new-func': 'error',

    // ── Import 정렬 ──
    'import/order': ['error', {
      groups: [
        'builtin', 'external', 'internal',
        ['parent', 'sibling'], 'index', 'type',
      ],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' },
    }],
    'import/no-cycle': 'error',         // 순환 의존성 방지 (C-001 연동)
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: ['**/*.test.*', '**/*.spec.*'],
    }],

    // ── 코드 품질 ──
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'max-lines-per-function': ['warn', {
      max: 40, skipBlankLines: true, skipComments: true,
    }],
    'complexity': ['error', 10],
    'max-depth': ['error', 3],
    'max-params': ['warn', 4],          // 파라미터 4개 초과 시 객체로 묶기
  },
  overrides: [
    {
      files: ['**/*.test.*', '**/*.spec.*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'max-lines-per-function': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
      },
    },
  ],
};
```

---

## Prettier 설정 (`.prettierrc`)

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## `tsconfig.json` 권장 설정

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## Husky + lint-staged

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write 'src/**/*.{ts,json}'",
    "type-check": "tsc --noEmit"
  },
  "lint-staged": {
    "*.ts": [
      "prettier --write",
      "eslint --fix",
      "eslint"
    ]
  }
}
```

---

## 네이밍 컨벤션 (Node.js/서버)

| 항목 | 규칙 | 예시 |
|------|------|------|
| 파일 | kebab-case | `user-service.ts` |
| 클래스 | PascalCase | `UserService` |
| 함수/변수 | camelCase | `getUserById` |
| 상수 | UPPER_SNAKE_CASE | `MAX_CONNECTIONS` |
| 인터페이스 | PascalCase (I 접두사 X) | `UserRepository` |
| 타입 | PascalCase | `UserDto`, `CreateUserRequest` |
| 환경변수 | UPPER_SNAKE_CASE | `DATABASE_URL` |

---

## 코드 패턴 가이드

```typescript
// ✅ 레이어별 올바른 패턴

// [Types 레이어] Zod 스키마 (접미사 Schema 필수 - C-007)
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});
type CreateUserRequest = z.infer<typeof CreateUserSchema>;

// [Repo 레이어] 경계 파싱 필수 (C-002)
const findById = async (id: string): Promise<User> => {
  const raw = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return UserSchema.parse(raw.rows[0]);   // 경계에서 즉시 파싱
};

// [Service 레이어] 비즈니스 로직
const createUser = async (
  req: CreateUserRequest,
): Promise<User> => {
  const validated = CreateUserSchema.parse(req);  // 재검증
  return userRepo.create(validated);
};

// ✅ 에러 처리 (프로미스 체인 아닌 async/await)
const handleRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await createUser(req.body as unknown);
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ errors: err.errors });
      return;
    }
    throw err;  // 예상치 못한 에러는 상위로 전파
  }
};
```
