# ARCHITECTURE.md
> 이 파일의 규칙은 `linters/layer-deps.js`로 기계적으로 강제됩니다.
> 규칙 변경 시 반드시 린터도 함께 수정하십시오 (Claude Code가 수행).

---

## 레이어 구조

각 비즈니스 도메인(예: UserAuth, Billing, Notification)은 다음 고정 레이어로 구성됩니다.

```
┌─────────────────────────────────────────┐
│                   UI                    │  화면 렌더링, 사용자 이벤트
├─────────────────────────────────────────┤
│                Runtime                  │  상태 관리, 이벤트 버스
├─────────────────────────────────────────┤
│                Service                  │  비즈니스 로직
├─────────────────────────────────────────┤
│                  Repo                   │  데이터 접근, 쿼리
├─────────────────────────────────────────┤
│                 Config                  │  환경 설정, 상수
├─────────────────────────────────────────┤
│                 Types                   │  타입 정의, 스키마
└─────────────────────────────────────────┘
         ↑ 의존성은 위 방향만 허용
```

## 의존성 규칙

- 코드는 **동일 레이어 또는 하위 레이어**만 import 가능
- 예: `Service`는 `Repo`, `Config`, `Types` import 가능 / `UI`, `Runtime` import 불가
- **역방향 의존성은 린터 에러** (CI 블로킹)

## 횡단 관심사 (Cross-cutting Concerns)

다음 관심사는 **반드시 `Providers` 인터페이스만** 사용:

| 관심사 | 허용 진입점 |
|--------|------------|
| 인증/인가 | `providers/auth.ts` |
| 텔레메트리/로깅 | `providers/telemetry.ts` |
| 피처 플래그 | `providers/featureFlags.ts` |
| 외부 커넥터 | `providers/connectors.ts` |

직접 라이브러리 import 금지. 예시:
```typescript
// ✅ 올바른 방법
import { logger } from '@/providers/telemetry';

// ❌ 금지
import pino from 'pino';
```

## 도메인 간 통신

- 도메인 간 직접 import 금지
- 반드시 **이벤트 버스** 또는 **공유 Types** 레이어를 통해 통신
- 공유 유틸리티는 `packages/shared/` 에 위치

## 파일 크기 제한

| 레이어 | 최대 라인 수 |
|--------|-------------|
| Types | 200줄 |
| Config | 150줄 |
| Repo | 300줄 |
| Service | 400줄 |
| Runtime | 300줄 |
| UI | 250줄 |

초과 시 `linters/file-size.js`가 경고. 200% 초과 시 CI 블로킹.

## 경계 데이터 파싱 원칙

모든 외부 데이터(API 응답, DB 조회, 사용자 입력)는 **경계에서 즉시 파싱**:
```typescript
// Repo 레이어 진입 시점에서 스키마 검증
const result = UserSchema.parse(rawDbRow);
```
추측 기반 형태 구성 금지. 타입 단언(`as`) 사용 금지.
