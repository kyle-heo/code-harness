# skills/logql-query.md
> 에이전트가 프로덕션 로그를 직접 조회하는 스킬입니다.
> Grafana Loki 또는 호환 시스템을 대상으로 합니다.

---

## 기본 쿼리 패턴

```logql
# 에러 로그 조회 (최근 1시간)
{app="[서비스명]"} |= "error" | json | level="error"

# 특정 사용자 관련 로그
{app="[서비스명]"} | json | userId="[userId]"

# 응답시간 > 1초인 요청
{app="[서비스명]"} | json | duration > 1000

# 특정 트레이스 전체 흐름
{app=~".*"} | json | traceId="[traceId]"
```

## 버그 재현 시 로그 수집 절차

```bash
# 1. 버그 발생 시간대 로그 수집
curl -G http://[loki-endpoint]/loki/api/v1/query_range \
  --data-urlencode 'query={app="myapp"} |= "error"' \
  --data-urlencode 'start=[시작시간-unix]' \
  --data-urlencode 'end=[종료시간-unix]'

# 2. 관련 traceId 추출 후 전체 흐름 조회
# 3. 결과를 PR 설명에 포함
```

## 에이전트 자가 진단 체크리스트

버그 수정 전 반드시 확인:
- [ ] 에러 발생 시간대 특정
- [ ] 에러 메시지 전문 확인
- [ ] stacktrace 확인
- [ ] 관련 userId/requestId 확인
- [ ] 동일 에러 발생 빈도 확인 (일회성 vs 반복)
