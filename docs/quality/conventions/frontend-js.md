# Frontend JavaScript / React / Vue 컨벤션
> 기반: Airbnb JavaScript Style Guide + Google JS Style Guide
> 참조: https://github.com/airbnb/javascript, https://google.github.io/styleguide/jsguide.html

---

## 설치 명령

### React (TypeScript)
```bash
npm install -D \
  eslint \
  prettier \
  eslint-config-airbnb \
  eslint-config-airbnb-typescript \
  eslint-config-prettier \
  eslint-plugin-prettier \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y \
  eslint-plugin-import \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  husky \
  lint-staged
```

### Vue (TypeScript)
```bash
npm install -D \
  eslint \
  prettier \
  eslint-config-airbnb-base \
  eslint-config-prettier \
  eslint-plugin-vue \
  @vue/eslint-config-typescript \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  husky \
  lint-staged
```

---

## ESLint 설정 (`.eslintrc.js`)

### React + TypeScript
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    jest: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    project: './tsconfig.json',
  },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:jsx-a11y/recommended',
    'prettier',               // prettier는 항상 마지막
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  rules: {
    // ── TypeScript ──
    '@typescript-eslint/no-explicit-any': 'error',          // Google: 명시적 타입 필수
    '@typescript-eslint/no-unused-vars': ['error', {
      vars: 'all',
      args: 'after-used',
      ignoreRestSiblings: true,
    }],
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
    }],
    '@typescript-eslint/no-floating-promises': 'error',     // Netflix: 비동기 안전성
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
    }],

    // ── React ──
    'react/react-in-jsx-scope': 'off',          // React 17+ JSX Transform
    'react/jsx-uses-react': 'off',
    'react/prop-types': 'off',                  // TypeScript가 대체
    'react/require-default-props': 'off',
    'react-hooks/rules-of-hooks': 'error',      // Airbnb: hooks 규칙 엄격 적용
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-props-no-spreading': ['warn', {  // Airbnb: spread 최소화
      html: 'enforce',
      custom: 'ignore',
    }],
    'react/function-component-definition': ['error', {
      namedComponents: 'arrow-function',         // 함수형 컴포넌트 arrow function 통일
    }],

    // ── Import 정렬 (Google Style) ──
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling'],
        'index',
        'type',
      ],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
    }],
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: ['**/*.test.*', '**/*.spec.*', '**/*.stories.*'],
    }],

    // ── 코드 품질 ──
    'no-console': ['error', { allow: ['warn', 'error'] }],  // C-003 연동
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'max-lines-per-function': ['warn', { max: 40, skipBlankLines: true, skipComments: true }],
    'complexity': ['warn', 10],                 // Google: 복잡도 제한
    'max-depth': ['error', 3],                  // 중첩 3단계 제한

    // ── 접근성 ──
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
  },
  overrides: [
    // 테스트 파일 완화
    {
      files: ['**/*.test.*', '**/*.spec.*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'max-lines-per-function': 'off',
      },
    },
  ],
};
```

### Vue + TypeScript
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'plugin:vue/vue3-recommended',
    'airbnb-base',
    '@vue/eslint-config-typescript/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/multi-word-component-names': 'error',
    'vue/no-unused-vars': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'max-depth': ['error', 3],
  },
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
  "jsxSingleQuote": false,
  "quoteProps": "as-needed",
  "trailingComma": "all",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## `.eslintignore`

```
node_modules/
dist/
build/
coverage/
*.min.js
public/
.next/
.nuxt/
```

---

## Husky + lint-staged 설정

`package.json`:
```json
{
  "scripts": {
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx,.vue",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx,.vue --fix",
    "format": "prettier --write 'src/**/*.{js,jsx,ts,tsx,vue,json,css,scss}'",
    "type-check": "tsc --noEmit"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue}": [
      "prettier --write",
      "eslint --fix",
      "eslint"
    ],
    "*.{json,css,scss,md}": ["prettier --write"]
  }
}
```

```bash
# Husky 초기화 (최초 1회)
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

---

## 네이밍 컨벤션

| 항목 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `UserProfile.tsx` |
| 일반 파일 | camelCase | `userService.ts` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 타입/인터페이스 | PascalCase | `UserDto`, `ApiResponse` |
| CSS 클래스 | kebab-case | `user-profile-card` |
| 훅 | use 접두사 | `useUserProfile` |
| 이벤트 핸들러 | handle 접두사 | `handleSubmit` |

---

## 코드 패턴 가이드

```typescript
// ✅ 올바른 컴포넌트 정의 (arrow function)
const UserCard: React.FC<UserCardProps> = ({ user, onDelete }) => {
  const handleDelete = useCallback(() => {
    onDelete(user.id);
  }, [user.id, onDelete]);

  return <div>{user.name}</div>;
};

// ❌ 잘못된 패턴
function UserCard(props: any) { ... }   // any 금지, props 구조분해 필수

// ✅ import 타입 분리 (TypeScript 5+)
import type { User } from '@/types/user';
import { fetchUser } from '@/api/user';

// ✅ 비동기 에러 처리
const loadUser = async (id: string): Promise<User> => {
  const result = await fetchUser(id);  // floating promise 방지
  return UserSchema.parse(result);     // C-002: 경계 파싱
};
```
