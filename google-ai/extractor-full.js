javascript:!function(){

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// § 마크다운 변환기
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const uuidMap={}, sourceCards={};
let citeN=0;
function cid(u){if(!uuidMap[u])uuidMap[u]=++citeN;return uuidMap[u];}

// 소스 카드 수집 (페이지 전체에서 한 번)
document.querySelectorAll('div.b8PhZd').forEach(c=>{
  const id=c.dataset.srcId, a=c.querySelector('a[href]');
  if(!id||!a) return;
  const texts=[...c.querySelectorAll('*')]
    .flatMap(e=>[...e.childNodes])
    .filter(n=>n.nodeType===3&&n.textContent.trim().length>3&&!n.textContent.includes('http'))
    .map(n=>n.textContent.trim());
  sourceCards[id]={url:a.href, title:texts[0]||a.href};
});

const STOP=new Set(['Jd31eb','IPFD1d','xqrfzf','b8PhZd','alk4p','q4PqPb','LIBz9e','P8PNlb','IeADvc','ntxe','Fsg96']);

function ch(e,d){return [...e.childNodes].map(x=>nd(x,d||0)).join('');}

function nd(e,d){
  if(e.nodeType===3){const t=e.textContent;return t.includes('TgQPHd')?'':t;}
  if(e.nodeType!==1) return '';
  const tg=e.tagName.toLowerCase(), cl=e.classList;
  const st=e.getAttribute('style')||'';
  if(st.includes('display:none')||st.includes('display: none')) return '';
  if(e.getAttribute('aria-hidden')==='true') return '';
  if(['script','style','noscript','svg','path'].includes(tg)) return '';
  if(tg==='button') return e.dataset.amic?`[${cid(e.dataset.iclUuid||'')}]`:'';
  if([...cl].some(c=>STOP.has(c))) return '';
  if(tg==='div'&&!cl.length){
    const p=(e.textContent||'').slice(0,30);
    if(p.includes('Share public link')) return '';
    if(['stibee','developers.google','itsys.hansung'].some(s=>p.includes(s))) return '';
  }
  // 헤딩
  if(cl.contains('otQkpb')) return `\n\n## ${e.textContent.trim()}\n\n`;
  // 코드 블록
  if(cl.contains('r1PmQe')||cl.contains('pHpOfb')){
    const lg=e.querySelector('.vVRw1d'), ce=e.querySelector('code')||e.querySelector('pre');
    return `\n\n\`\`\`${lg?lg.textContent.trim().toLowerCase():''}\n${ce?ce.textContent.trim():''}\n\`\`\`\n\n`;
  }
  // 인라인 코드
  if(tg==='code'&&cl.contains('KDcb0c')) return `\`${e.textContent.trim()}\``;
  if(tg==='pre'){const c=e.querySelector('code');return `\n\n\`\`\`\n${(c||e).textContent.trim()}\n\`\`\`\n\n`;}
  // 서식
  if(tg==='strong'||tg==='b'||cl.contains('Yjhzub')) return `**${ch(e,d).trim()}**`;
  if(tg==='em'||cl.contains('eujQNb')){
    if(e.querySelector('strong,b')) return `***${e.textContent.trim()}***`;
    return `*${ch(e,d).trim()}*`;
  }
  if(tg==='s'||cl.contains('iVKwMc')) return `~~${e.textContent.trim()}~~`;
  if(tg==='hr') return '\n\n---\n\n';
  // 인용구
  if(tg==='blockquote'){
    return '\n\n'+ch(e,d).trim().split('\n').map(l=>'> '+l).join('\n')+'\n\n';
  }
  // 테이블
  if(tg==='table') return tbl(e,d);
  if(cl.contains('Fv6NCb')||cl.contains('jT79ld')){const t=e.querySelector('table');return t?tbl(t,d):ch(e,d);}
  // 리스트
  if(tg==='ul') return lst(e,false,d);
  if(tg==='ol') return lst(e,true,d);
  if(tg==='li') return li(e,'*',d);
  // 링크
  if(tg==='a'){
    const h=e.href||'';
    if(!h||['policies.google','support.google','gstatic'].some(s=>h.includes(s))) return ch(e,d);
    return `[${ch(e,d).trim()||h}](${h})`;
  }
  // 이미지
  if(tg==='img'){const s=e.src||'';return s.includes('gstatic')||s.startsWith('data:')?'':s?`![${e.alt||''}](${s})`:'';} 
  if(tg==='br') return '\n';
  // 단락
  if(cl.contains('n6owBd')){const i=ch(e,d).trim();return i?`\n\n${i}\n\n`:'';}
  return ch(e,d);
}

function lst(e,ord,lv){
  const its=[];let k=1;
  [...e.children].forEach(c=>{
    if(c.tagName.toLowerCase()==='li'){its.push(li(c,ord?k+++'.':'*',lv));} 
  });
  const r=its.join('');return lv===0?`\n\n${r}\n`:r;
}

function li(e,bl,lv){
  const pad='   '.repeat(lv),ps=[],sb=[];
  [...e.childNodes].forEach(c=>{
    if(c.nodeType===1&&['ul','ol'].includes(c.tagName.toLowerCase()))sb.push(c);
    else ps.push(nd(c,lv));
  });
  let t=ps.join('').trim()
    .replace(/\[(\d+)\]\s*\[(\d+)\]/g,'[$1, $2]')
    .replace(/\[(\d+),\s*(\d+)\]\s*\[(\d+)\]/g,'[$1, $2, $3]');
  let r=`${pad}${bl} ${t}\n`;
  sb.forEach(s=>r+=lst(s,s.tagName.toLowerCase()==='ol',lv+1));
  return r;
}

function tbl(e,d){
  const rows=[];
  e.querySelectorAll('tr').forEach(tr=>{
    const cells=[];
    tr.querySelectorAll('th,td').forEach(c=>{
      let t='';
      [...c.childNodes].forEach(x=>{
        if(x.nodeType===3&&!x.textContent.includes('TgQPHd'))t+=x.textContent;
        else if(x.nodeType===1){
          if(x.tagName.toLowerCase()==='button'&&x.dataset.amic)t+=`[${cid(x.dataset.iclUuid||'')}]`;
          else t+=ch(x,d);
        }
      });
      cells.push(t.replace(/TgQPHd\|.*/,'').trim().replace(/\s+/g,' '));
    });
    if(cells.length)rows.push(cells);
  });
  if(!rows.length)return '';
  const m=Math.max(...rows.map(r=>r.length));
  rows.forEach(r=>{while(r.length<m)r.push('');});
  return '\n\n'+[
    '| '+rows[0].join(' | ')+' |',
    '| '+Array(m).fill('---').join(' | ')+' |',
    ...rows.slice(1).map(r=>'| '+r.join(' | ')+' |')
  ].join('\n')+'\n\n';
}

// 엘리먼트 → 마크다운 (최종 정리 포함)
function toMarkdown(el){
  const container=el.querySelector('[data-container-id="4"]')||el.querySelector('.CKgc1d')||el;
  let text=ch(container,0).trim()
    .replace(/\n{4,}/g,'\n\n\n')
    .replace(/[ \t]+\n/g,'\n')
    .replace(/  +/g,' ');
  // 소스 각주 추가
  if(Object.keys(uuidMap).length&&Object.keys(sourceCards).length){
    const refs=Object.keys(sourceCards).sort((a,b)=>+a-+b)
      .map(id=>`[${id}] [${sourceCards[id].title}](${sourceCards[id].url})`).join('\n\n');
    text+='\n\n---\n\n**참조:**\n\n'+refs;
  }
  return text.trim();
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// § 기존 코드 (모델 추출 부분만 교체)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const chatData=[];
const userSelector=".VndcI.veK2kb";
const modelSelector=".n6owBd.awi2gc";        // ← fallback 용으로 유지
const chatBlocks=document.querySelectorAll(".tonYlb");

chatBlocks.forEach(block=>{
    // 사용자 메시지 추출 (기존 그대로)
    const userElement=block.querySelector(userSelector);
    if(userElement){
        chatData.push({
            role:"user",
            parts:[{text:userElement.innerText.trim()}]
        });
    }

    // ── 모델 메시지 추출 (교체된 부분) ──────────────
    // 우선순위: CKgc1d 컨테이너 → .n6owBd.awi2gc fallback
    const modelContainer=block.querySelector('.CKgc1d');
    if(modelContainer){
        const combinedText=toMarkdown(modelContainer);
        if(combinedText.trim()){
            chatData.push({
                role:"model",
                parts:[{text:combinedText}]
            });
        }
    } else {
        // fallback: 기존 방식 (마크다운 변환 적용)
        const modelElements=block.querySelectorAll(modelSelector);
        if(modelElements.length>0){
            const combinedText=Array.from(modelElements)
                .map(el=>toMarkdown(el))
                .join("\n\n");
            chatData.push({
                role:"model",
                parts:[{text:combinedText}]
            });
        }
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// § 이하 기존 코드 그대로
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const totalTurns=chatData.length;
if(totalTurns===0) return alert("대화를 찾지 못했습니다.");

const userInput=prompt(`총 ${totalTurns}턴 발견. 시작,개수 (예: 1,${totalTurns})`,`1,${totalTurns}`);
if(userInput){
    const [startStr,countStr]=userInput.split(",");
    const startIndex=parseInt(startStr.trim());
    const count=parseInt(countStr.trim());
    const selectedData=chatData.slice(startIndex-1,startIndex-1+count);
    if(selectedData.length===0)return;

    const endIndex=startIndex+selectedData.length-1;
    const fileName=`gemini_chat_${startIndex}_to_${endIndex}.json`;
    const jsonString=JSON.stringify(selectedData,null,2);

    const blob=new Blob([jsonString],{type:"application/json"});
    const downloadLink=document.createElement("a");
    downloadLink.href=URL.createObjectURL(blob);
    downloadLink.download=fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    const previewContainer=document.createElement("div");
    previewContainer.style="position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:99999;padding:20px;overflow:auto;font-family:monospace;color:black;";
    previewContainer.innerText=jsonString;

    const closeButton=document.createElement("button");
    closeButton.innerText="닫기";
    closeButton.style="position:fixed;top:10px;right:20px;padding:10px;";
    closeButton.onclick=()=>previewContainer.remove();

    previewContainer.appendChild(closeButton);
    document.body.appendChild(previewContainer);
}
}();
