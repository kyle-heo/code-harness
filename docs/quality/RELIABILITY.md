# RELIABILITY.md
> 신뢰성 기준 및 장애 대응 패턴입니다.

---

## 신뢰성 목표 (SLO)

| 지표 | 목표 | 측정 도구 |
|------|------|-----------|
| 가용성 | 99.9% | PromQL: `up` 메트릭 |
| p99 응답시간 | < 500ms | PromQL: `http_request_duration_seconds` |
| 에러율 | < 0.1% | PromQL: `http_requests_total{status=~"5.."}` |
| 복구 시간 (MTTR) | < 30분 | 장애 로그 기반 |

## 필수 패턴

### 재시도 (Retry)
```typescript
// 모든 외부 호출은 지수 백오프 재시도 필수
const result = await retry(
  () => externalService.call(),
  { attempts: 3, backoff: 'exponential', maxDelay: 5000 }
);
```

### 타임아웃
```typescript
// 외부 호출 최대 타임아웃
const TIMEOUTS = {
  db: 3000,       // 데이터베이스
  external: 5000, // 외부 API
  internal: 2000, // 내부 서비스
} as const;
```

### 서킷 브레이커
- 5초 내 에러율 50% 초과 시 서킷 오픈
- 30초 후 half-open 상태로 전환
- `providers/connectors.ts`에서 중앙 관리

## 관측 가능성 요구사항

에이전트가 직접 접근 가능한 관측 도구:
- **로그**: LogQL (`skills/logql-query.md` 참조)
- **메트릭**: PromQL (`skills/promql-query.md` 참조)
- **UI 검증**: Chrome DevTools (`skills/chrome-devtools.md` 참조)

모든 Service 레이어 함수는 다음을 자동 기록:
```typescript
// providers/telemetry.ts가 자동 계측
{ traceId, spanId, duration, error?, userId?, action }
```
