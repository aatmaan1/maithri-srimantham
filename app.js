(()=>{
'use strict';
const {clamp,smooth,mix,opacity,phase}=JourneyMath;
const $=id=>document.getElementById(id),scenes=[...document.querySelectorAll('.scene')],phases=[...document.querySelectorAll('.phase')];
const journey=$('journey'),stage=$('stage'),invitation=$('invitation'),canvas=$('particles'),ctx=canvas.getContext('2d');
const reduceQuery=matchMedia('(prefers-reduced-motion: reduce)'),mobileQuery=matchMedia('(max-width: 700px)');
let reduced=reduceQuery.matches,mobile=mobileQuery.matches,range=1,top=0,target=0,current=0,previous=0,playing=false,raf=0,dirty=true,ready=false,visible=!document.hidden,pointerX=0,pointerY=0,w=1,h=1,dpr=1,elapsed=0;
const audio=$('flute');let musicUserMuted=false,resumeMusicAfterVisibility=false;
function updateMusic(on){$('music').setAttribute('aria-pressed',String(on));$('music').setAttribute('aria-label',on?'Mute flute music':'Play flute music');$('music').title=on?'Mute flute music':'Play flute music';$('music-slash').toggleAttribute('hidden',on);}
async function startMusic(){if(musicUserMuted)return;audio.volume=.4;try{await audio.play();updateMusic(!audio.paused)}catch{updateMusic(false)}}
$('music').addEventListener('click',()=>{if(!audio.paused){musicUserMuted=true;audio.pause()}else{musicUserMuted=false;startMusic()}});
audio.addEventListener('play',()=>updateMusic(true));audio.addEventListener('pause',()=>updateMusic(false));audio.addEventListener('error',()=>updateMusic(false));
// Try on arrival; browsers that require activation retry on the first interaction.
function startMusicOnInteraction(event){if(event.target.closest?.('#music')||musicUserMuted||!audio.paused)return;startMusic()}
for(const type of ['click','touchend','keydown'])document.addEventListener(type,startMusicOnInteraction,{passive:true});
audio.addEventListener('play',()=>{for(const type of ['click','touchend','keydown'])document.removeEventListener(type,startMusicOnInteraction)});
startMusic();
const names=['The heavens','The divine journey','Becoming light','The first home','Growing in love','A celebration awaits','The Shrimantam ceremony','Family blessings'];
$('scene-nav').innerHTML=names.map((name,i)=>`<button type="button" aria-label="${name}" data-scene="${i}" title="${name}"></button>`).join('');
const dots=[...$('scene-nav').querySelectorAll('button')];
const particles=Array.from({length:mobile?40:75},(_,i)=>({x:((i*73.173)%997)/997,y:((i*139.7)%991)/991,z:.2+(i%7)/8,r:.65+(i%5)*.35,phase:i*2.399}));
function measure(){top=journey.offsetTop;range=Math.max(1,journey.offsetHeight-stage.clientHeight);w=stage.clientWidth;h=stage.clientHeight;dpr=Math.min(devicePixelRatio||1,1.7);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);dirty=true;wake()}
function move(id,x=0,y=0,s=1,r=0){const el=$(id);if(!el)return;el.style.transform=`translate3d(${reduced?0:x}vw,${reduced?0:y}vh,0) scale(${reduced?1:s}) rotate(${reduced?0:r}deg)`}
function alpha(id,a){$(id).style.opacity=clamp(a)}
function pulse(t){return reduced?1:1+Math.sin(t*2.8)*.035}
function render(t,time){
  const drift=reduced?0:Math.sin(time*.55)*.7,px=reduced?0:pointerX*.6,py=reduced?0:pointerY*.4;
  for(let i=0;i<8;i++){
    const a=reduced?(Math.min(7,Math.floor(t))===i?1:0):opacity(i,t);
    scenes[i].style.opacity=a;scenes[i].style.visibility=a>.0001?'visible':'hidden';
    if(a<=.0001)continue;
    const q=clamp(t-i);
    if(i===0){move('sky1',-q*.6,0,1.03+q*.035);move('far1',q*-3,0,1);move('near1',q*-5,q*7,1+q*.06);move('baby1',mix(-9,8,q)+px,3-q*7+drift+py,mix(.86,1.02,q),mix(-3,0,q));move('sparkles1',q*5,drift,1);}
    if(i===1){move('sky2',-q,0,1.06+q*.06);move('portal2',0,0,mix(.9,1.15,q));move('baby2',mix(mobile?13:12,mobile?19:18,q)+px,mix(mobile?-16:-8,mobile?-13:-9,q)+drift+py,mix(mobile?1.14:1.25,mobile?.86:.96,q),-2);move('rays2',0,0,pulse(time));move('near2',-q*7,q*10,1+q*.1);}
    if(i===2){move('sky3',0,0,1.1+q*.045);move('dissolve3',mobile?14:12,mobile?-3:-4,mobile?.80:.82);phases.forEach((el,j)=>el.style.opacity=phase(j,q));alpha('orb3',phase(4,q));move('orb3',mobile?0:8,mobile?-3:-6,pulse(time));alpha('trail3',smooth(.15,.7,q)*.55);move('trail3',q*5,drift,1);}
    if(i===3){move('warm4',0,0,1.05+q*.025);move('mother4',mix(6,0,q),0,mix(.95,1,q));move('orb4',mix(mobile?2:8,mobile?0:6,smooth(.1,.8,q)),mix(mobile?-3:-6,mobile?2:4,smooth(.1,.8,q)),mix(1,.3,smooth(.35,.95,q))*pulse(time));alpha('orb4',1-smooth(.78,1,q));alpha('glow4',smooth(.45,.9,q));move('glow4',0,0,pulse(time));alpha('trail4',Math.sin(q*Math.PI)*.4);move('trail4',q*7,q*3,mix(.8,.5,q));}
    if(i===4){move('warm5',0,0,1.07);alpha('newlife5',1);move('newlife5',0,0,mix(1.17,1.01,q)*pulse(time*.3));}
    if(i===5){move('entrance6',0,0,mix(1.18,1.015,q));move('thoranam6',px*.4,mix(-6,0,q),mix(1.08,1,q),Math.sin(time*.2)*.2);alpha('thoranam6',.55);move('kolam6',0,mix(7,0,q),mix(1.2,1,q));alpha('kolam6',smooth(.25,.7,q)*.85);move('petals6',Math.sin(time*.2),((time*1.8)%12)-6,1.05);alpha('petals6',.35);}
    if(i===6){move('ceremony7',0,0,mix(1.12,1.015,q));move('ensemble7',0,0,mix(1.1,1,q));move('left7',mix(-7,0,smooth(.12,.65,q)),0,1,0);move('right7',mix(7,0,smooth(.2,.75,q)),0,1,0);alpha('left7',smooth(.05,.4,q));alpha('right7',smooth(.14,.5,q));alpha('father7',smooth(.08,.42,q));move('lamp7a',mix(-3,0,q),0,1);move('lamp7b',mix(3,0,q),0,1);move('flowers7',px*.5,mix(6,0,q),1.03);}
    if(i===7){move('family8',0,-q*.5,mobile?mix(1.01,1,q):mix(1.075,1.015,q));move('petals8',Math.sin(time*.2),((time*1.5)%12)-6,1.05);alpha('petals8',.45);move('flowers8',0,2-q*2,1.02);}
  }
  const wash=(Math.exp(-Math.pow((t-3.95)/.13,2))*.24+Math.exp(-Math.pow((t-4.98)/.14,2))*.18);
  alpha('light-wash',reduced?0:wash);
  $('progress-fill').style.transform=`scaleX(${clamp(t/8)})`;
  $('scroll-cue').style.opacity=1-smooth(.03,.3,t);$('scroll-cue').style.visibility=t>.3?'hidden':'visible';
  document.body.classList.toggle('story-finished',scrollY>top+range+stage.clientHeight*.15);
  const scene=Math.min(7,Math.floor(t+.15));dots.forEach((el,i)=>el.setAttribute('aria-current',String(i===scene)));
  drawParticles(t,time);
}
function drawParticles(t,time){
 if(!ctx)return;ctx.clearRect(0,0,w,h);if(reduced)return;
 const petal=smooth(4.8,5.8,t);const strength=clamp(.3+Math.sin(t*.65)*.2+.3*petal);
 for(const p of particles){
  const x=((p.x*w+Math.sin(time*.16+p.phase)*22+w)%w),y=((p.y*h+(petal?time*12*p.z:-time*6*p.z))%h+h)%h;
  const flicker=.3+.7*(Math.sin(time*1.5+p.phase)*.5+.5);ctx.globalAlpha=strength*flicker;
  if(petal>.3){ctx.save();ctx.translate(x,y);ctx.rotate(time*.35+p.phase);ctx.fillStyle=p.phase%3>1?'#efa079':'#ed8caa';ctx.beginPath();ctx.ellipse(0,0,p.r*2.4,p.r*.9,0,0,Math.PI*2);ctx.fill();ctx.restore()}
  else{ctx.fillStyle='#fff1b6';ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();if(p.r>1.6){ctx.globalAlpha*=.15;ctx.beginPath();ctx.arc(x,y,p.r*3.5,0,Math.PI*2);ctx.fill()}}
 }ctx.globalAlpha=1;
}
function setPlaying(value){playing=value;$('play').setAttribute('aria-pressed',String(value));$('play').setAttribute('aria-label',value?'Pause journey':'Play journey automatically');$('play').title=value?'Pause journey':'Play journey automatically';$('play-icon').toggleAttribute('hidden',value);$('pause-icon').toggleAttribute('hidden',!value);previous=0;dirty=true;wake()}
function scrollToTimeline(t){setPlaying(false);window.scrollTo({top:top+range*clamp(t/8),behavior:reduced?'instant':'smooth'});dirty=true;wake()}
function tick(now){
 raf=0;if(!visible)return;
 const dt=previous?Math.min(50,now-previous):16.67;previous=now;elapsed+=dt/1000;
 if(playing&&ready){const end=invitation.offsetTop;const next=Math.min(end,scrollY+dt*(range+stage.clientHeight)/96000);window.scrollTo(0,next);if(next>=end-1)setPlaying(false);}
 target=clamp((scrollY-top)/range*8,0,8);current=reduced?target:current+(target-current)*(1-Math.exp(-dt/105));if(Math.abs(target-current)<.00003)current=target;
 const inStory=scrollY<invitation.offsetTop+80;
 if(dirty||inStory||Math.abs(current-target)>.00003){render(current,elapsed);dirty=false;}
 if(playing||(inStory&&!reduced)||Math.abs(current-target)>.00003)wake();
}
function wake(){if(!raf&&visible)raf=requestAnimationFrame(tick)}
function stopOnInput(){if(playing)setPlaying(false)}
addEventListener('scroll',()=>{dirty=true;wake()},{passive:true});
addEventListener('wheel',stopOnInput,{passive:true});addEventListener('touchstart',stopOnInput,{passive:true});
addEventListener('keydown',e=>{if(e.target.closest?.('button,a,input,textarea,select'))return;if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))stopOnInput()});
addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!reduced){pointerX=e.clientX/innerWidth-.5;pointerY=e.clientY/innerHeight-.5;wake()}},{passive:true});
addEventListener('resize',measure);reduceQuery.addEventListener('change',e=>{reduced=e.matches;measure()});mobileQuery.addEventListener('change',e=>{mobile=e.matches;measure()});
document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(!visible){resumeMusicAfterVisibility=!audio.paused;audio.pause()}else if(resumeMusicAfterVisibility&&!musicUserMuted){startMusic()}previous=0;if(!visible&&raf){cancelAnimationFrame(raf);raf=0}else wake()});
$('play').addEventListener('click',()=>{if(scrollY>=invitation.offsetTop-5)window.scrollTo(0,0);if(!playing&&!musicUserMuted)startMusic();setPlaying(!playing)});
$('replay').addEventListener('click',()=>scrollToTimeline(0));$('revisit').addEventListener('click',()=>{scrollToTimeline(0);$('play').focus({preventScroll:true})});
$('skip').addEventListener('click',e=>{e.preventDefault();setPlaying(false);invitation.scrollIntoView({behavior:reduced?'instant':'smooth'});setTimeout(()=>{$('invitation-title').setAttribute('tabindex','-1');$('invitation-title').focus({preventScroll:true})},reduced?0:800)});
dots.forEach((el,i)=>el.addEventListener('click',()=>scrollToTimeline(i+.4)));
async function load(){const primary=[$('sky1'),$('baby1'),$('near1')];await Promise.race([Promise.allSettled(primary.map(img=>img.decode?.())),new Promise(resolve=>setTimeout(resolve,4500))]);ready=true;document.body.classList.remove('loading');measure()}
measure();load();
})();
