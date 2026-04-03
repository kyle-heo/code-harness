# skills/video-capture.md
> 버그 재현 및 수정 확인 영상을 녹화하는 스킬입니다.
> PR에 증거로 첨부하여 사람 리뷰 시간을 최소화합니다.

---

## 녹화 절차

```bash
# Chrome DevTools Protocol 기반 녹화
# (headless Chrome에서 실행)

# 1. 녹화 시작 (Page.startScreencast)
# 2. 버그 재현 인터랙션 수행
# 3. 녹화 종료 (Page.stopScreencast)
# 4. 프레임을 mp4로 변환

ffmpeg -framerate 10 -i frame_%04d.png \
  -c:v libx264 -pix_fmt yuv420p \
  output.mp4
```

## 파일 명명 규칙

```
[PR번호]-before-[타임스탬프].mp4   # 버그 재현
[PR번호]-after-[타임스탬프].mp4    # 수정 확인
```

## PR 첨부 방법

```bash
# GitHub PR에 영상 업로드
gh pr comment [PR번호] --body "
## 재현 영상
<영상 첨부>

## 수정 확인 영상
<영상 첨부>
"
```

## 녹화 기준

- 재현 영상: 버그 발생 직전부터 에러 확인까지
- 수정 확인 영상: 동일 시나리오에서 정상 동작 확인
- 최대 길이: 2분 (초과 시 핵심 구간만 편집)
