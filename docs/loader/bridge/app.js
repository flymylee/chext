(()=>{
'use strict';
const P=document.getElementById('preview'), N=document.getElementById('notice'), msg=document.getElementById('message'), app=window.__chext11;
const q=new URLSearchParams(location.search), expected=q.get('from');
let loaded=false;
function load(html,url){
  const doc=new DOMParser().parseFromString(html,'text/html');
  doc.querySelectorAll('script,iframe,object,embed,meta[http-equiv="Content-Security-Policy"]').forEach(e=>e.remove());
  P.onload=()=>{
    try{
      app.setDoc(P.contentDocument);
      app.sourceUrl=url||location.href;
      app.sourceHost=new URL(url||location.href).hostname;
      app.info('Snapshot ready — changes affect the snapshot only');
      loaded=true;
      N.hidden=true;P.hidden=false;
    }catch(e){msg.textContent='Unable to access preview: '+e.message}
  };
  P.srcdoc='<!doctype html>'+doc.documentElement.outerHTML;
}
window.addEventListener('message',e=>{
  if(!expected||e.origin!==expected||e.source!==window.opener||e.data?.type!=='CHEXT_SNAPSHOT')return;
  load(e.data.html,e.data.url);
},{once:false});
document.getElementById('load').onclick=()=>{
  const html=document.getElementById('import').value;
  if(html.trim())load(html,location.href);
};
if(window.opener&&expected){
  try{window.opener.postMessage({type:'CHEXT_READY'},expected)}catch(e){msg.textContent=e.message}
}else msg.textContent='No opener detected. Paste saved HTML below or reopen from the Bridge bookmarklet.';
setTimeout(()=>{if(!loaded&&expected)msg.textContent='Still waiting. The site may block opener communication (COOP). Manual HTML import is available below.'},4500);
})();
