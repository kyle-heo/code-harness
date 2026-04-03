# 성능 스페셜리스트 리뷰 체크리스트
> gstack review/specialists/performance.md 기반, 우리 스택 반영
> 트리거: 백엔드 OR 프론트엔드 diff 있을 때

---

## N+1 쿼리
- 루프 내 ORM 연관 관계 순회 — eager loading 없음
  - JPA: `@EntityGraph`, `JOIN FETCH`
  - SQLAlchemy: `joinedload()`, `selectinload()`
  - Prisma: `include`
  - Node.js Sequelize: `include`
- 반복 블록 내 DB 쿼리 (배치로 묶을 수 있음)
- GraphQL 리졸버가 필드별 쿼리 (DataLoader 사용 여부 확인)

## DB 인덱스 누락
- 인덱스 없는 컬럼의 새 WHERE 절 (마이그레이션 파일 또는 스키마 확인)
- 인덱스 없는 컬럼의 새 ORDER BY
- 복합 쿼리 (WHERE a AND b)에 복합 인덱스 없음
- 인덱스 없이 추가된 외래 키 컬럼

## 알고리즘 복잡도
- O(n²) 이상 패턴: 컬렉션 중첩 루프, `map` 내 `Array.find`/`filter`
- 해시/맵/셋 조회로 대체 가능한 반복 선형 검색
- 루프 내 문자열 연결 (Java: `StringBuilder` / Python: `''.join()` 사용)
- 한 번으로 충분한데 여러 번 정렬/필터링

## 번들 크기 영향 (프론트엔드)
- 알려진 무거운 새 프로덕션 의존성 (moment.js, lodash full, jQuery)
- 딥 import 대신 barrel import (`import from 'library'`)
- 최적화 없이 커밋된 대형 정적 assets (이미지, 폰트)
- 라우트 레벨 청크의 code splitting 누락

## 렌더링 성능 (React/Vue)
- fetch 폭포수: 병렬 가능한 순차적 API 호출 (`Promise.all`)
- 불안정한 참조로 인한 불필요한 리렌더링 (렌더 내 새 객체/배열)
- 비용이 큰 연산에 `React.memo`, `useMemo`, `useCallback` 누락
- 루프 내 DOM 속성 읽기→쓰기로 인한 레이아웃 스래싱
- 화면 아래 이미지에 `loading="lazy"` 누락

## 페이지네이션 누락
- 제한 없는 결과를 반환하는 list 엔드포인트 (LIMIT, 페이지네이션 파라미터 없음)
- 데이터 볼륨에 따라 증가하는 LIMIT 없는 DB 쿼리
- ID 대신 전체 중첩 객체를 embed하는 API 응답

## 비동기 컨텍스트에서의 블로킹
- async 함수 내 동기 I/O (파일 읽기, subprocess, HTTP 요청)
  - Python: `asyncio.to_thread()`, `aiofiles`, `httpx.AsyncClient` 사용
  - Node.js: `fs.promises`, `axios` async 사용
- Python: async 핸들러 내 `time.sleep()` → `asyncio.sleep()`
- CPU 집약적 연산이 메인 스레드 블로킹 (worker 오프로드 필요)
