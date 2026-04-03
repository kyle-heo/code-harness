# skills/chrome-devtools.md
> Chrome DevTools Protocol을 사용해 에이전트가 UI를 직접 검증하는 스킬입니다.

---

## 사전 조건

- git worktree로 격리된 인스턴스에서 앱 실행 중이어야 함
- Chrome/Chromium이 remote debugging 모드로 실행 중이어야 함

```bash
# worktree별 앱 기동 (포트는 worktree 번호로 구분)
git worktree add /tmp/wt-[번호] [브랜치명]
cd /tmp/wt-[번호] && PORT=300[번호] npm run dev &

# Chrome remote debugging 모드로 실행
chromium --remote-debugging-port=922[번호] --headless
```

---

## 주요 작업

### DOM 스냅샷 캡처

```javascript
// CDP 연결
const CDP = require('chrome-remote-interface');
const client = await CDP({ port: 9222 });
const { DOM, Page } = client;

// 스냅샷
await Page.navigate({ url: 'http://localhost:3001/target-page' });
await Page.loadEventFired();
const { root } = await DOM.getDocument();
const snapshot = await DOM.getOuterHTML({ nodeId: root.nodeId });
```

### 스크린샷 캡처

```javascript
const { data } = await Page.captureScreenshot({ format: 'png' });
require('fs').writeFileSync('screenshot.png', Buffer.from(data, 'base64'));
```

### 인터랙션 테스트

```javascript
const { Input } = client;

// 클릭
await Input.dispatchMouseEvent({
  type: 'mousePressed', x: 100, y: 200, button: 'left', clickCount: 1
});

// 텍스트 입력
await Input.dispatchKeyEvent({ type: 'char', text: 'hello' });
```

### 콘솔 에러 감지

```javascript
const { Runtime } = client;
const errors = [];
Runtime.exceptionThrown(({ exceptionDetails }) => {
  errors.push(exceptionDetails.text);
});
// PR 조건: errors.length === 0
```

---

## 변경 전후 비교 체크리스트

- [ ] 변경 전 스크린샷 저장
- [ ] 변경 후 스크린샷 저장
- [ ] 콘솔 에러 0건 확인
- [ ] 주요 인터랙션 정상 동작 확인
- [ ] 모바일 뷰포트(375px) 확인
