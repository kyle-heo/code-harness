# FRONTEND.md
> 프론트엔드 품질 기준 및 UI 검증 프로토콜입니다.

---

## UI 검증 프로토콜

에이전트는 Chrome DevTools Protocol을 통해 직접 UI를 검증합니다.
자세한 사용법은 `skills/chrome-devtools.md`를 참조하십시오.

### 검증 체크리스트 (UI 변경 PR 필수)

1. git worktree로 격리된 인스턴스에서 앱 기동
2. Chrome DevTools로 DOM 스냅샷 캡처
3. 변경 전후 스크린샷 비교
4. 인터랙션 테스트 (클릭, 입력, 네비게이션)
5. 콘솔 에러 0건 확인

### 버그 재현 표준 절차

```
1. 버그 재현 전 영상 녹화 시작 (skills/video-capture.md)
2. 버그 재현
3. 영상 녹화 종료 -> PR에 첨부
4. 수정 구현
5. 수정 후 영상 녹화 -> PR에 첨부
```

## 컴포넌트 기준

| 항목 | 기준 |
|------|------|
| 컴포넌트 최대 크기 | 250줄 (C-004 준수) |
| Props 타입 정의 | 필수 (인라인 타입 금지) |
| 접근성 | WCAG 2.1 AA 준수 |
| 반응형 | 모바일 퍼스트 (320px 기준) |

## 디자인 시스템 참조

`docs/context/references/design-system-reference-llms.txt` 참조.
디자인 토큰, 컴포넌트 스펙, 색상 시스템 등 포함.
