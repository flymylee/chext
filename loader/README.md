# Chext DOM Executor

**Native v1.1.0** (Single/Split) · **Loader 3.1** (Bridge)

## 실행 아키텍처

- **Native**: 원본 Live DOM에서 직접 실행하는 자체 포함형 북마클릿. `native/`의 Single과 `split/`의 두 조각은 **동일 기능**입니다. Split은 브라우저 북마크 URL 길이에 맞추기 위한 패키징일 뿐 별도 제품이 아닙니다.
- **Bridge (Loader 3.1)**: 원본 페이지의 DOM 스냅샷을 별도 페이지로 전달하는 Loader 3 계열. 스냅샷에서 추출·탐색·수정할 수 있지만 원본 Live DOM의 이벤트·세션·동적 로딩은 공유하지 않습니다. COOP/팝업 정책이 opener 통신을 차단하면 HTML 수동 가져오기를 사용할 수 있습니다.
- **Loader 2**: 서버에 호스팅한 Native 통합 JS를 가져와 실행하는 구상입니다. 현재 빌드에는 포함되지 않으며, 페이지 CSP에 따라 실행이 차단될 수 있습니다.

## 파일 구조

```text
loader/
  src/core.js                Core / UI / lifecycle
  src/extension.js           Execute actions / Markdown converter
  native/full.js             Native JS 본문 (북마클릿 prefix 제외)
  native/bookmarklet.txt     Full Single (javascript: 포함)
  split/01-core.txt          Split ① (먼저 실행)
  split/02-extension.txt     Split ② (다음 실행)
  bridge/index.html          Loader 3.1 UI
  bridge/app.js              Snapshot loading / bridge runtime
  bridge/bridge-source.js    Bridge 북마클릿 소스
  bridge/bookmarklet.txt     Bridge 북마클릿
  scripts/build.py           빌드 및 docs/loader/ 배포 복사
  scripts/check_repo.py      생성물·HTML 경로·북마클릿 검사
  tests/                     동작 회귀 테스트
```

북마클릿에는 로컬 테스트용 `*_local.txt`도 제공하며, 공개 호스트를 `local.sahayana.hk:8443`으로 치환합니다. JS 소스 중 공개 호스트가 없는 경우 `_local.txt`가 원본과 같습니다.

## Execute 모드

| 모드 | 처리 |
| --- | --- |
| `innerText`, `innerHTML`, `outerHTML` | Selector가 선택한 각 DOM의 텍스트/HTML을 결과 textarea에 표시 |
| `Markdown` | 제목, 링크, 목록, 코드 블록, 표 등 HTML 의미 구조를 가능한 한 보존해 Markdown 표시 |
| `length` | Selector별 매칭 수와 중복을 제외한 고유 DOM 수 보고 |
| `remove` | Resolve 후 확인 화면을 거쳐 요소 제거 |
| `append` | Resolve → Text/HTML 선택 → 내용 작성 → Preview → Confirm 후 추가 |

`Minimize`는 화면을 버블로 축소하고 입력·결과를 유지합니다. `Restore`는 본래 UI를 복원하며, `Terminate`는 **Chext 전용 UI·이벤트·타이머**를 정리합니다. 이미 사용자가 실행한 원본 웹페이지 DOM 변경을 되돌리지는 않습니다.

`append`의 HTML은 제한된 위험 요소를 제거하는 방식으로 처리하지만, 범용 HTML 보안 검증기를 대체하지 않습니다. 특히 Trusted Types 정책이 설정된 사이트에서는 HTML 파싱이 차단될 수 있습니다. 중요한 사이트에서는 먼저 복제/테스트 페이지에서 확인하세요.

## 설치

1. [설치 페이지](https://chext.sahayana.hk/)에서 북마클릿을 복사해 북마크 URL에 붙여넣습니다.
2. Native Single은 한 번 실행하면 됩니다. Split은 **① Core, ② Extension** 순서로 실행합니다.
3. Bridge는 원본 페이지에서 북마클릿을 실행해 별도 페이지를 엽니다. 스냅샷 로딩이 막히면 수동 HTML 가져오기를 사용합니다.

## 빌드·배포

저장소 루트에서:

```bash
python3 loader/scripts/build.py
python3 loader/scripts/check_repo.py
python3 loader/tests/test_native.py
python3 loader/tests/test_picker.py
python3 loader/tests/test_bridge_inert.py
```

- canonical 소스: `loader/src/core.js`, `loader/src/extension.js`, `loader/bridge/bridge-source.js`
- `build.py`는 소스 JS 구문 검사를 하고 `native`, `split`, `bridge`의 북마클릿을 생성합니다. Split 2개는 각각 `javascript:` 포함 **5,000바이트 이하**, 모든 `.txt` 북마클릿은 마지막 바이트 `;`이며 후행 개행이 없습니다.
- 동일한 런타임 파일을 `docs/loader/`에 게시용으로 복사합니다. 이 구조는 **GitHub Pages 게시 소스가 `/docs`일 때** URL `/loader/...`로 노출됩니다. 실제 Pages 설정은 배포 전에 별도로 확인하세요.
- `docs/index.html`은 사용자를 위한 설치 페이지, `README.md`는 프로젝트 개요, 이 파일은 상세 개발 문서입니다.
- `docs/loader/`는 생성물이므로 직접 수정하지 마세요.

## 호환성 및 테스트 범위

- Native Single은 사용자 모바일 브라우저에서 기본 동작을 확인했습니다. Split/Bridge의 실서비스 사이트 전반 검증은 별도입니다.
- 브라우저 보안 기능(CSP, Trusted Types, COOP, 팝업 차단, 클립보드 권한)에 따라 동작이 제한될 수 있습니다.
- Loader 3.1은 **원본 웹사이트에 remove/append를 수행하지 않습니다.**
