# chext

웹 DOM 추출·조작 및 AI 대화 내보내기 북마클릿 툴킷.

**설치 페이지:** https://chext.sahayana.hk/  
**소스:** https://github.com/flymylee/chext

---

## Chext DOM Executor

CSS 선택자 또는 화면 터치(Pick)로 DOM 요소를 지정해 콘텐츠를 추출하거나 일부 DOM 조작을 실행합니다.

| 빌드 | 실행 방식 | 설치 | 사용 범위 |
| --- | --- | --- | --- |
| **Native v1.1.0 (Single)** | 단일 북마클릿 | [코드](loader/native/bookmarklet.txt) | 원본 Live DOM |
| **Native v1.1.0 (Split)** | Core → Extension 순차 실행 | [Core](loader/split/01-core.txt) · [Extension](loader/split/02-extension.txt) | Single과 동일한 기능; 북마클릿 각각 5,000바이트 이하 |
| **Loader 3.1 (Bridge)** | 별도 페이지로 DOM 스냅샷 전달 | [Bridge 코드](loader/bridge/bookmarklet.txt) | 스냅샷 DOM; 원본 변경 불가 |

주요 기능: `innerText`, `innerHTML`, `outerHTML`, Markdown 변환, `length`, `remove`, `append`(Text/HTML), `Pick`, `Minimize/Restore/Terminate`.

- **Native Single / Split은 같은 코드와 기능**을 패키징만 다르게 제공합니다.
- **Bridge는 Loader 3 계열의 후속 버전**입니다. Live DOM이나 원본 페이지의 세션·이벤트·동적 로딩을 그대로 가져올 수 없으며, `remove/append`는 스냅샷에만 적용됩니다.
- `remove/append`는 페이지를 직접 변경합니다. `Terminate`는 Chext UI·이벤트를 정리하지만 페이지 변경을 되돌리지는 않습니다.
- `Split`은 Core 다음 Extension 순서로 실행합니다. Native 단일본은 일부 모바일 북마크 URL 길이 제한을 넘을 수 있습니다.
- **Loader 2 방식**(호스팅된 Native JS 동적 로딩)은 별도 실험 구상이며 현재 제공하는 실행 빌드에 포함되지 않습니다. 대상 사이트 CSP의 영향을 받습니다.

[Loader 구조·빌드·검증 자세히 보기](loader/README.md)

---

## 파일 구조

```text
loader/
  src/                 Native/Split 공통 소스
  native/              Full Single 북마클릿
  split/               5KB 미만의 두 북마클릿
  bridge/              Loader 3.1 및 Bridge UI
  scripts/             빌드 및 검증 스크립트
  tests/               테스트

docs/
  index.html           북마클릿 설치 페이지
  loader/              GitHub Pages 정적 배포 결과물 (생성)

google-ai/
  extractor-full.js      대화 추출기 풀버전 (주석 포함, 각주 포함)
  extractor-full-min.js  대화 추출기 압축 (각주 제거)
  extractor-short.js     대화 추출기 경량 (3.5KB, Safari용)
  turn-tag.js            턴 번호 삽입 (주석 포함)
  turn-tag-min.js        턴 번호 삽입 압축 (2.1KB)

gemini/
  turn-tag.js            Gemini 턴 번호 삽입

node/
  extractor.js           Node.js 추출기 (jsdom)
```

---

## 기존 Google AI Mode / Gemini 북마클릿

아래 기존 도구들은 변경하지 않았습니다. 설치 페이지에서 코드를 복사할 수 있습니다.

| 대상 | 기능 | 파일 |
| --- | --- | --- |
| Google AI Mode | 대화 추출 (전체/압축/경량) | [`google-ai/`](google-ai/) |
| Google AI Mode | 턴 번호 삽입 | [`turn-tag.js`](google-ai/turn-tag.js) · [`turn-tag-min.js`](google-ai/turn-tag-min.js) |
| Gemini | 턴 번호 삽입 | [`turn-tag.js`](gemini/turn-tag.js) |

기존 외부 `.js` 주입 북마클릿은 대상 사이트의 CSP에 의해 차단될 수 있습니다.

### 기존 로더 북마클릿 직접 설치 코드

기존 README의 외부 스크립트 로더 코드도 보존합니다. (대상 사이트의 CSP에 의해 차단될 수 있음)

**Google AI Mode — 대화 추출기 (풀버전)**

```javascript
javascript:(()=>{var s=document.createElement('script');s.src='https://chext.sahayana.hk/google-ai/extractor-full.js?v='+Date.now();document.head.appendChild(s)})()
```

**Google AI Mode — 대화 추출기 (압축)**

```javascript
javascript:(()=>{var s=document.createElement('script');s.src='https://chext.sahayana.hk/google-ai/extractor-full-min.js?v='+Date.now();document.head.appendChild(s)})()
```

**Google AI Mode — 대화 추출기 (경량)**

```javascript
javascript:(()=>{var s=document.createElement('script');s.src='https://chext.sahayana.hk/google-ai/extractor-short.js?v='+Date.now();document.head.appendChild(s)})()
```

**Google AI Mode — 턴 번호 삽입**

```javascript
javascript:(()=>{var s=document.createElement('script');s.src='https://chext.sahayana.hk/google-ai/turn-tag.js?v='+Date.now();document.head.appendChild(s)})()
```

**Google AI Mode — 턴 번호 삽입 (압축)**

```javascript
javascript:(()=>{var s=document.createElement('script');s.src='https://chext.sahayana.hk/google-ai/turn-tag-min.js?v='+Date.now();document.head.appendChild(s)})()
```

**Gemini — 턴 번호 삽입**

```javascript
javascript:(()=>{var s=document.createElement('script');s.src='https://chext.sahayana.hk/gemini/turn-tag.js?v='+Date.now();document.head.appendChild(s)})()
```


## Node.js 추출기

```bash
npm install jsdom
node node/extractor.js input.html             # JSON → stdout
node node/extractor.js input.html output.json # JSON 파일 저장
node node/extractor.js input.html --md        # 마크다운
```

```javascript
const { extractChat, extractMarkdown } = require('./node/extractor');
const html = fs.readFileSync('chat.html', 'utf-8');
const chat = extractChat(html);
```

## 출력 형식 (기존 대화 추출기)

```json
[
  {"role":"user", "parts":[{"text":"질문"}]},
  {"role":"model", "parts":[{"text":"**마크다운** 응답"}]}
]
```

## 빌드 및 배포

```bash
python3 loader/scripts/build.py
python3 loader/scripts/check_repo.py
```

`build.py`는 실행 파일을 재생성하고 `docs/loader/`로 복사합니다. 이 URL 구조는 GitHub Pages의 **`main /docs` 게시 설정을 전제**합니다. 실제 Pages 설정은 배포 전에 확인해야 합니다. `docs/loader/`의 생성 파일은 직접 수정하지 마세요.
