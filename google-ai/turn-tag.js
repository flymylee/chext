// Google Search AI Mode — 턴 번호 삽입
javascript:!function(){

    // ── 1. 기존 태그 및 버튼 제거 (재실행 시 중복 방지) ─────────────
    document.querySelectorAll('.ai-turn-tag').forEach(el => el.remove());
    const prevBtn = document.getElementById('ai-turn-clear-btn');
    if (prevBtn) prevBtn.remove();

    // ── 2. 발화 요소 수집 ────────────────────────────────────────────
    // 각 .tonYlb 블록에서 [사용자 컨테이너, 모델 컨테이너] 순서로 수집
    const utterances = [];   // { el, forUser }

    document.querySelectorAll('.tonYlb').forEach(block => {
        const userContainer  = block.querySelector('.sUKAcb');   // 사용자 메시지 감싸는 div
        const modelContainer = block.querySelector('.CKgc1d');   // 모델 응답 루트

        // 사용자 발화가 먼저, 모델 발화가 뒤 (DOM 순서와 동일)
        if (userContainer)  utterances.push({ el: userContainer,  forUser: true  });
        if (modelContainer) utterances.push({ el: modelContainer, forUser: false });
    });

    if (!utterances.length) return alert('대화를 찾지 못했습니다.');

    // ── 3. 턴 태그 생성 ──────────────────────────────────────────────
    function makeTag(n, forUser) {
        const tag = document.createElement('span');
        tag.className   = 'ai-turn-tag';
        tag.textContent = `T${n}`;

        // aria-hidden: 추출기의 nd() 함수가 즉시 return '' 처리
        tag.setAttribute('aria-hidden', 'true');

        const hue = forUser ? '#1a73e8' : '#188038';   // 파랑(사용자) / 초록(모델)
        const bg  = forUser ? '#e8f0fe' : '#e6f4ea';

        tag.style.cssText = [
            `color:${hue}`,
            `background:${bg}`,
            `border:1px solid ${hue}`,
            'border-radius:10px',
            'padding:1px 7px',
            'font-size:11px',
            'font-weight:700',
            'font-family:monospace',
            'line-height:1.6',
            'vertical-align:middle',
            'display:inline-block',
            'margin-right:8px',
            'margin-bottom:4px',
            'user-select:none',
            'pointer-events:none',
        ].join(';');

        return tag;
    }

    // ── 4. 삽입 ──────────────────────────────────────────────────────
    utterances.forEach(({ el, forUser }, i) => {
        const tag = makeTag(i + 1, forUser);
        el.prepend(tag);
        // ※ 추출기 차단 이중 구조:
        //   사용자: .sUKAcb에 삽입 → 추출기는 .VndcI.veK2kb.innerText만 읽으므로 미포함
        //   모델:   .CKgc1d에 삽입 → 추출기는 [data-container-id="4"] 우선 사용 + aria-hidden 스킵
    });

    // ── 5. "턴 번호 지우기" 플로팅 버튼 ─────────────────────────────
    const btn = document.createElement('button');
    btn.id        = 'ai-turn-clear-btn';
    btn.title     = '턴 번호 지우기';

    // 아이콘: 취소선 7
    const icon = document.createElement('s');
    icon.textContent = '7';
    icon.style.cssText = 'font-style:normal;font-weight:700;pointer-events:none';
    btn.appendChild(icon);

    btn.style.cssText = [
        'position:fixed',
        'bottom:88px',       // 구글 AI "아래로" 버튼 위쪽
        'right:20px',
        'width:40px',
        'height:40px',
        'border-radius:50%',
        'border:2px solid #1a73e8',
        'background:#fff',
        'color:#1a73e8',
        'font-size:17px',
        'cursor:pointer',
        'z-index:9999',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'box-shadow:0 2px 8px rgba(0,0,0,.25)',
        'transition:background .15s',
    ].join(';');

    btn.onmouseenter = () => btn.style.background = '#e8f0fe';
    btn.onmouseleave = () => btn.style.background = '#fff';

    btn.onclick = () => {
        document.querySelectorAll('.ai-turn-tag').forEach(el => el.remove());
        btn.remove();
    };

    document.body.appendChild(btn);

    console.log(`턴 번호 ${utterances.length}개 삽입 완료`);

}();
