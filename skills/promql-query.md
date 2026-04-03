# skills/promql-query.md
> 에이전트가 프로덕션 메트릭을 직접 조회하는 스킬입니다.
> RELIABILITY.md의 SLO 기준과 함께 사용합니다.

---

## 핵심 SLO 모니터링 쿼리

```promql
# 가용성 (목표: 99.9%)
avg_over_time(up{job="myapp"}[1h]) * 100

# p99 응답시간 (목표: < 500ms)
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)
)

# 에러율 (목표: < 0.1%)
sum(rate(http_requests_total{status=~"5.."}[5m]))
/ sum(rate(http_requests_total[5m])) * 100

# 서킷 브레이커 상태
circuit_breaker_state{service="myapp"}
```

## 버그 원인 분석 쿼리

```promql
# 특정 엔드포인트 에러 급증 감지
increase(http_requests_total{status=~"5..", path="/api/target"}[10m])

# DB 커넥션 풀 소진 여부
db_pool_available_connections{db="main"} < 5

# 메모리 급증 (OOM 전조)
rate(process_resident_memory_bytes[5m]) > 10485760  # 10MB/s
```

## 에이전트 자가 진단 활용

PR 배포 후 자동으로 다음을 확인:
```bash
# Prometheus API 직접 쿼리
curl -G http://[prometheus-endpoint]/api/v1/query \
  --data-urlencode 'query=rate(http_requests_total{status=~"5.."}[5m])' \
  | jq '.data.result'
```

배포 후 5분간 에러율이 기존 대비 2배 이상이면 즉시 롤백 PR 오픈.
