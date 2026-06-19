// Gemini 채팅방 턴 번호 삽입
javascript:!function(){
    // 1. 이미 번호가 붙어있다면 중복 방지를 위해 기존 번호를 삭제합니다.
    document.querySelectorAll(".gemini-turn-tag").forEach(el => el.remove());

    // 2. 메시지 요소들을 모두 찾습니다.
    const elements = document.querySelectorAll("user-query-content, message-content");

    elements.forEach((e, index) => {
        const turnNum = index + 1;
        
        // 3. 번호를 담을 span 태그 생성
        const turnTag = document.createElement("span");
        turnTag.className = "gemini-turn-tag";
        turnTag.innerText = `[제 ${turnNum} 턴]`;

        // 4. 시각적 스타일 및 추출 방지 설정
        turnTag.style = `
            color: #d93025; 
            font-weight: bold; 
            margin-right: 10px; 
            background: #fce8e6; 
            padding: 2px 8px; 
            border-radius: 12px; 
            font-size: 12px; 
            display: inline-block;
            user-select: none; /* 마우스 드래그 시 선택되지 않음 */
            pointer-events: none; /* 클릭 방해 금지 */
            vertical-align: middle;
        `;
        
        // 5. 메시지 본문 맨 앞에 삽입
        e.prepend(turnTag);
    });

    console.log(`총 ${elements.length}개의 턴 번호 삽입 완료!`);
}();
