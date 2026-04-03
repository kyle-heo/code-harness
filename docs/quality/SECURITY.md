# SECURITY.md
> 보안 기준 및 필수 패턴입니다. 위반 시 `SIGNALS.md`에 즉시 기록됩니다.

---

## 보안 체크리스트 (PR 병합 전 필수)

- [ ] 사용자 입력은 경계에서 즉시 검증 (C-002 준수)
- [ ] 비밀값은 환경변수 또는 시크릿 매니저를 통해서만 접근
- [ ] SQL/NoSQL 쿼리는 파라미터화된 쿼리만 사용
- [ ] 인증/인가는 `providers/auth.ts`만 사용 (C-001 준수)
- [ ] 민감 데이터는 로그에 출력하지 않음

## 금지 패턴

```typescript
// ❌ 하드코딩된 시크릿
const apiKey = "sk-1234567890";

// ❌ 직접 SQL 문자열 조합
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ❌ 민감 데이터 로깅
logger.info({ password: user.password });
```

## 필수 패턴

```typescript
// ✅ 환경변수 또는 시크릿 매니저
const apiKey = config.get('EXTERNAL_API_KEY');

// ✅ 파라미터화 쿼리
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// ✅ 민감 필드 마스킹
logger.info({ userId: user.id, action: 'login' }); // password 제외
```

## 보안 점수 기준

| 항목 | 가중치 |
|------|--------|
| 하드코딩 시크릿 없음 | 40% |
| SQL 인젝션 방어 | 25% |
| 인증 우회 없음 | 20% |
| 민감 데이터 노출 없음 | 15% |

보안 점수 < 80 시 `SIGNALS.md` 즉시 트리거 + 사람 에스컬레이션.
