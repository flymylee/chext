# chext

AI 채팅 추출 북마클릿 모음

**설치 페이지:** https://chext.sahayana.hk/

---

## 파일 구조

```
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

## 로더 북마클릿

### Google AI Mode — 대화 추출기 (풀버전)
```javascript
javascript:(()=>{var s=document.createElement('script');s.src='https://chext.sahayana.hk/google-ai/extractor-full.js?v='+Date.now();document.head.appendChild(s)})()
```

### Google AI Mode — 대화 추출기 (압축)
```javascript
javascript:(()=>{var s=document.createElement('script');s.src='https://chext.sahayana.hk/google-ai/extractor-full-min.js?v='+Date.now();document.head.appendChild(s)})()
```

### Google AI Mode — 대화 추출기 (경량)
```javascript
javascript:(()=>{var s=document.createElement('script');s.src='https://chext.sahayana.hk/google-ai/extractor-short.js?v='+Date.now();document.head.appendChild(s)})()
```

### Google AI Mode — 턴 번호 삽입
```javascript
javascript:(()=>{var s=document.createElement('script');s.src='https://chext.sahayana.hk/google-ai/turn-tag.js?v='+Date.now();document.head.appendChild(s)})()
```

### Google AI Mode — 턴 번호 삽입 (압축)
```javascript
javascript:(()=>{var s=document.createElement('script');s.src='https://chext.sahayana.hk/google-ai/turn-tag-min.js?v='+Date.now();document.head.appendChild(s)})()
```

### Gemini — 턴 번호 삽입
```javascript
javascript:(()=>{var s=document.createElement('script');s.src='https://chext.sahayana.hk/gemini/turn-tag.js?v='+Date.now();document.head.appendChild(s)})()
```

---

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

---

## 출력 형식

```json
[
  { "role": "user",  "parts": [{ "text": "질문" }] },
  { "role": "model", "parts": [{ "text": "**마크다운** 응답" }] }
]
```
