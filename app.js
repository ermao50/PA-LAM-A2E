'use strict';
const clips = window.VIDEO_DATA;
const player = document.querySelector('#player');
const tabs = [...document.querySelectorAll('[data-mode]')];
const modeInfo = {
  ablation: {labels:['B · LAM-A2E','P · P-LAM-A2E','PA · PA-LAM-A2E'], note:'B shows the original motion. In P, listen for the speech events that coincide with a brow raise. At the same times, watch whether PA raises the brows and opens the eyes or lowers the brows and tightens the eyelids.'},
  comparison: {labels:['EchoAvatar','EmoTalk','NVIDIA Audio2Face-3D','LAM-A2E','PA-LAM-A2E'], note:'The five columns show the same utterance on the same avatar. Compare how far the brows move, how the eyelid opening changes, and when each movement occurs.'}
};
let mode = 'ablation';
let clipIndex = 1;
let pendingStart = null;
const clipButtons = document.querySelector('.clip-buttons');
const filmstrip = document.querySelector('#filmstrip');
clips.forEach((clip,index)=>{
  const button=document.createElement('button');
  button.type='button';button.innerHTML=`<strong>${clip.id}</strong>${clip.tone}`;
  button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>selectClip(index));
  clipButtons.append(button);
  const thumb=document.createElement('button');thumb.type='button';
  thumb.innerHTML=`<img alt="${clip.id} ${clip.tone} comparison preview" loading="lazy"><span class="thumb-text"><b>${clip.id} · ${clip.tone}</b><span>${clip.seconds.toFixed(1)} s</span></span>`;
  thumb.setAttribute('aria-pressed','false');thumb.addEventListener('click',()=>selectClip(index));filmstrip.append(thumb);
});
function selectClip(index){clipIndex=index;render();}
function render(start = null){
  pendingStart = start;
  player.pause();
  const clip=clips[clipIndex],video=clip[mode];
  document.querySelector('#video-error').hidden=true;
  player.poster=video.poster;player.src=video.src;
  player.setAttribute('aria-label',`${clip.id} ${clip.tone}: ${modeInfo[mode].labels.join(', ')}`);
  player.load();
  document.querySelector('#clip-title').textContent=`${clip.id} · ${clip.tone}`;
  document.querySelector('#clip-description').textContent=clip.description;
  document.querySelector('#clip-duration').textContent=`${video.seconds.toFixed(2)} s`;
  document.querySelector('#method-key').innerHTML=modeInfo[mode].labels.map((label,i)=>`<span class="${i===modeInfo[mode].labels.length-1?'highlight':''}">${label}</span>`).join('');
  document.querySelector('#viewing-note').textContent=modeInfo[mode].note;
  const download=document.querySelector('#download');download.href=video.src;download.download=video.src.split('/').pop();
  document.querySelector('#download-size').textContent=`${(video.bytes/1e6).toFixed(1)} MB`;
  [...clipButtons.children].forEach((button,i)=>button.setAttribute('aria-pressed',String(i===clipIndex)));
  [...filmstrip.children].forEach((button,i)=>{button.setAttribute('aria-pressed',String(i===clipIndex));button.querySelector('img').src=clips[i][mode].poster;});
  tabs.forEach(tab=>{const active=tab.dataset.mode===mode;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
  document.querySelector('#comparison-panel').setAttribute('aria-labelledby',`tab-${mode}`);
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>{mode=tab.dataset.mode;render();});
  tab.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+1)%tabs.length;tabs[next].focus();tabs[next].click();}});
});
document.querySelectorAll('[data-figure-mode]').forEach(link=>link.addEventListener('click',event=>{
  if(event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  mode=link.dataset.figureMode;
  clipIndex=clips.findIndex(clip=>clip.id===link.dataset.clip);
  render(Number(link.dataset.start));
  player.focus({preventScroll:true});
  player.scrollIntoView({block:'center'});
}));
player.addEventListener('loadedmetadata',()=>{
  player.playbackRate=Number(document.querySelector('#speed').value);
  if(pendingStart!==null){player.currentTime=pendingStart;pendingStart=null;}
});
player.addEventListener('error',()=>{document.querySelector('#video-error').hidden=false;});
document.querySelector('#speed').addEventListener('change',event=>{player.playbackRate=Number(event.target.value);});
document.querySelector('#replay').addEventListener('click',async()=>{player.currentTime=0;try{await player.play();}catch{document.querySelector('#video-error').hidden=false;}});
render();
