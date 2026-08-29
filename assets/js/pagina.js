/* ============================================================
   DANOVA TECH — animazioni delle pagine interne
   Gli stessi blocchi della home (cursore, reveal, tilt, raggio,
   scramble, barra di scorrimento, FAQ), senza il preloader.
   ============================================================ */
(function(){
"use strict";
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (s,c)=> (c||document).querySelector(s);
const $$ = (s,c)=> Array.from((c||document).querySelectorAll(s));
const lerp=(a,b,t)=>a+(b-a)*t;
document.documentElement.classList.remove('no-js');

/* ---------- 1. cursore + magnetico ---------- */
const cur=$('.cur'), ring=$('.cur-r');
const DESKTOP = !('ontouchstart' in window) && innerWidth>1024;
if(DESKTOP && cur && ring){
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;
    cur.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;});
  (function loop(){rx=lerp(rx,mx,.16);ry=lerp(ry,my,.16);
    ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(loop);})();
  addEventListener('mouseleave',()=>ring.classList.add('hide'));
  addEventListener('mouseenter',()=>ring.classList.remove('hide'));
  const HOV='a,button,summary,[data-tilt],input,textarea,select';
  document.addEventListener('mouseover',e=>{ if(e.target.closest(HOV)) ring.classList.add('big');});
  document.addEventListener('mouseout', e=>{ if(e.target.closest(HOV)) ring.classList.remove('big');});
}
if(DESKTOP){
  $$('[data-mag]').forEach(el=>{
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-(r.left+r.width/2))*.28, y=(e.clientY-(r.top+r.height/2))*.4;
      el.style.transform=`translate(${x}px,${y}px)`;
    });
    el.addEventListener('mouseleave',()=>{el.style.transform='';});
  });
}

/* ---------- 2. raggio diagonale per sezione ---------- */
function runBeam(sec){
  if(RM||!sec) return;
  let b=sec.querySelector(':scope > .beam');
  if(!b){b=document.createElement('div');b.className='beam';b.style.top='45%';sec.appendChild(b);}
  b.classList.remove('run'); void b.offsetWidth; b.classList.add('run');
}

/* ---------- 3. comparsa al scorrimento ---------- */
const rvIO=new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); rvIO.unobserve(e.target);} });
},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
$$('[data-rv]').forEach(el=>{
  const sib=Array.from(el.parentElement.children).filter(c=>c.hasAttribute('data-rv'));
  el.style.transitionDelay=(sib.indexOf(el)*90)+'ms';
  rvIO.observe(el);
});
const secIO=new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting) runBeam(e.target); });
},{threshold:.22});
$$('section').forEach(s=>secIO.observe(s));

/* ---------- 4. inclinazione 3D + faretto ---------- */
$$('[data-tilt]').forEach(el=>{
  el.addEventListener('mousemove',e=>{
    const r=el.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
    el.style.setProperty('--mx',(px*100)+'%');
    el.style.setProperty('--my',(py*100)+'%');
    if(RM||innerWidth<900) return;
    el.style.transform=`perspective(1000px) rotateY(${(px-.5)*7}deg) rotateX(${(.5-py)*7}deg) translateY(-6px) scale(1.012)`;
  });
  el.addEventListener('mouseleave',()=>{el.style.transform='';});
});

/* ---------- 5. intestazione, barra di avanzamento, torna su ---------- */
const hdr=$('#hdr'), prog=$('#prog'), topBtn=$('#top');
let tick=false;
function onScroll(){
  const sy=scrollY;
  if(!tick){requestAnimationFrame(()=>{
    if(hdr) hdr.classList.toggle('stuck',sy>40);
    if(prog){ const max=document.documentElement.scrollHeight-innerHeight;
      prog.style.width=(sy/Math.max(max,1)*100)+'%'; }
    if(topBtn) topBtn.classList.toggle('on',sy>innerHeight*.9);
    tick=false;
  });tick=true;}
}
addEventListener('scroll',onScroll,{passive:true});
if(topBtn) topBtn.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

/* ---------- 6. menu mobile ---------- */
const burger=$('#burger'), mob=$('#mob');
if(burger && mob){
  burger.addEventListener('click',()=>{
    const on=mob.classList.toggle('on'); burger.classList.toggle('on',on);
    document.body.style.overflow=on?'hidden':'';
    if(on) $$('#mob a').forEach((a,i)=>a.style.transitionDelay=(120+i*70)+'ms');
  });
  $$('#mob a').forEach(a=>a.addEventListener('click',()=>{
    mob.classList.remove('on');burger.classList.remove('on');document.body.style.overflow='';
  }));
}

/* ---------- 7. scramble delle etichette ---------- */
const CH='ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&/*<>[]{}';
function scramble(el){
  const fin=el.textContent; let f=0; const total=fin.length*3+12;
  clearInterval(el._sc);
  el._sc=setInterval(()=>{
    f++;
    el.textContent=fin.split('').map((c,i)=> i<f/3 ? c : (c===' '?' ':CH[Math.floor(Math.random()*CH.length)])).join('');
    if(f>=total){clearInterval(el._sc);el.textContent=fin;}
  },28);
}
const scIO=new IntersectionObserver(es=>{es.forEach(e=>{
  if(e.isIntersecting){ if(!RM) scramble(e.target); scIO.unobserve(e.target);}
})},{threshold:.6});
$$('[data-scramble]').forEach(e=>scIO.observe(e));

/* ---------- 8. domande frequenti ---------- */
$$('.faq details').forEach(d=>{
  const ans=$('.ans',d), sum=$('summary',d);
  if(!ans||!sum) return;
  sum.addEventListener('click',e=>{
    e.preventDefault();
    const open=d.hasAttribute('open');
    $$('.faq details[open]').forEach(o=>{ if(o!==d){
      const a=$('.ans',o); if(a) a.style.height='0px';
      setTimeout(()=>o.removeAttribute('open'),300);} });
    if(open){
      ans.style.height=ans.scrollHeight+'px';
      requestAnimationFrame(()=>ans.style.height='0px');
      setTimeout(()=>d.removeAttribute('open'),480);
    }else{
      d.setAttribute('open',''); ans.style.height='0px';
      requestAnimationFrame(()=>ans.style.height=ans.scrollHeight+'px');
      setTimeout(()=>{ if(d.hasAttribute('open')) ans.style.height='auto'; },520);
    }
  });
});

/* ---------- 9. anno nel piede ---------- */
const yy=$('#yy'); if(yy) yy.textContent=new Date().getFullYear();
onScroll();
})();
