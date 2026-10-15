/* Pure timeline math, shared by the renderer and verification. */
(function(root){
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const smooth=(a,b,v)=>{const x=clamp((v-a)/(b-a));return x*x*(3-2*x)};
  const mix=(a,b,t)=>a+(b-a)*clamp(t);
  const opacity=(i,t)=> (i===0?1:smooth(i-.2,i+.2,t))*(i===7?1:1-smooth(i+.8,i+1.2,t));
  const phase=(i,p)=>Math.max(0,1-Math.abs(p*4-i));
  root.JourneyMath={clamp,smooth,mix,opacity,phase};
})(globalThis);
