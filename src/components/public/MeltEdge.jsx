"use client";
// Water drops hanging from the edge between two sections. The generator below is the
// design file's own code (savd-home-final-v2.html), kept as plain JS on purpose.
import { useEffect, useRef } from "react";

const rng=a=>()=>(a=a*16807%2147483647)/2147483647;
const f=n=>n.toFixed(1);
function spline(P){
 const n=P.length,g=i=>P[Math.max(0,Math.min(n-1,i))];let d='';
 for(let i=0;i<n-1;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2);
  d+=`C${f(p1[0]+(p2[0]-p0[0])/6)} ${f(p1[1]+(p2[1]-p0[1])/6)} ${f(p2[0]-(p3[0]-p1[0])/6)} ${f(p2[1]-(p3[1]-p1[1])/6)} ${f(p2[0])} ${f(p2[1])}`}
 return d}
const tear=(cx,yb,rb,ry,tp,wj=0)=>`M${f(cx-wj)} ${f(yb-tp)}L${f(cx+wj)} ${f(yb-tp)}C${f(cx+wj+rb*.05)} ${f(yb-tp*.55)} ${f(cx+rb)} ${f(yb-rb*.95)} ${f(cx+rb)} ${f(yb)}A${f(rb)} ${f(ry)} 0 0 1 ${f(cx-rb)} ${f(yb)}C${f(cx-rb)} ${f(yb-rb*.95)} ${f(cx-wj-rb*.05)} ${f(yb-tp*.55)} ${f(cx-wj)} ${f(yb-tp)}Z`;
function melt(box){
 const svg=box.querySelector('svg'),sd=+box.dataset.seed,r=rng(sd),W=1440,P=[];
 for(let i=0;i<=24;i++)P.push([i*60,14+r()*22]);
 let d=`M0 0H${W}V${P[24][1]}`;
 for(let i=24;i>0;i--)d+=`Q${P[i][0]} ${P[i][1]} ${(P[i][0]+P[i-1][0])/2} ${(P[i][1]+P[i-1][1])/2}`;
 let h=`<path class="base" d="${d}L0 ${P[0][1]}Z"/>`,fd='',x=34+r()*30,items=[];
 while(x<W-34){
  const t=r(),y0=8;let L,rb,gap;
  if(t<.34){rb=3.3+r()*1.2;L=62+r()*50;gap=44+r()*60}          // small, long fall
  else if(t<.72){rb=4.5+r()*1.5;L=88+r()*60;gap=64+r()*80}     // medium
  else{rb=6+r()*2;L=56+r()*44;gap=84+r()*90}                   // big, heavy, short
  const ry=rb*1.08,tp=rb*2.6,yb=y0+L-ry,H=yb-y0,i=items.length,lean=(r()-.5)*7;
  const wn=1.3+rb*.32,am=.6+r()*1.4,fq=1+r()*1.6,ph=r()*6.28,Lp=[],Rp=[],N=10;
  let cxN=x;
  for(let k=0;k<=N;k++){
   const u=Math.pow(k/N,1.5),y=y0+H*u,cx=x+lean*u+u*am*Math.sin(fq*6.283*u+ph);
   const w=wn*(1+.5*Math.pow(1-u,2)+.16*Math.sin(u*19+ph)*(1-u))+2.2*Math.exp(-(y-y0)/3.2);
   Lp.push([cx-w,y]);Rp.push([cx+w,y]);cxN=cx;
  }
  const R2=Rp.slice().reverse();
  const td=`M${f(Lp[0][0])} ${f(Lp[0][1])}${spline(Lp)}L${f(R2[0][0])} ${f(R2[0][1])}${spline(R2)}Z`;
  h+=`<g class="dp"><path class="b" d="${td}"/></g>`
   +`<g class="bb"><path class="b" d="${tear(cxN,yb,rb,ry,tp,wn)}"/><ellipse cx="${f(cxN-rb*.42)}" cy="${f(yb+ry*.12)}" rx="${f(rb*.16)}" ry="${f(ry*.34)}" fill="#fff" opacity=".5"/><ellipse cx="${f(cxN-rb*.3)}" cy="${f(yb-ry*.2)}" rx="${f(rb*.09)}" ry="${f(rb*.09)}" fill="#fff" opacity=".85"/></g>`;
  items.push({H,dl:0,dur:2.8+r()*1.9,v:0});
  if(L>76)fd+=`<g class="fdw" data-i="${i}" style="opacity:0" transform="translate(${f(cxN)} ${f(y0+L+4)})"><g class="fd" style="animation-delay:-${f(r()*6)}s;animation-duration:${f(4.4+r()*2.6)}s"><path class="b" d="${tear(0,3.8,3.8,4.1,10)}"/><ellipse cx="-1.3" cy="4.2" rx=".7" ry="1.3" fill="#fff" opacity=".55"/></g></g>`;
  x+=gap;
 }
 svg.innerHTML=h+fd;
 const E=[...svg.querySelectorAll('.dp')],B=[...svg.querySelectorAll('.bb')],F={};svg.querySelectorAll('.fdw').forEach(e=>F[e.dataset.i]=e);
 return{svg,L:items.map((it,i)=>Object.assign(it,{el:E[i],bb:B[i],f:F[i]}))};
}

export function MeltEdge({ seed }) {
  const ref = useRef(null);
  useEffect(() => {
    const o = melt(ref.current);
    const RM = matchMedia("(prefers-reduced-motion:reduce)").matches;
    let raf;
    function tick(now) {
      if (!o.on && o.svg.getBoundingClientRect().top < innerHeight * 0.97) { o.on = true; o.t0 = now; }
      const el = o.on ? (now - o.t0) / 1e3 : -1;
      o.L.forEach((q) => {
        if (q.v < 1 && el >= q.dl) { const k = RM ? 1 : Math.min(1, (el - q.dl) / q.dur); q.v = 1 - Math.pow(1 - k, 2); }
        q.el.style.transform = `scaleY(${Math.max(0.001, q.v).toFixed(4)})`;
        q.bb.style.transform = `translateY(${(-(1 - q.v) * q.H).toFixed(2)}px)`;
        if (q.f) q.f.style.opacity = q.v > 0.97 ? 1 : 0;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seed]);
  return (
    <div className="melt" data-seed={seed} ref={ref}>
      <svg viewBox="0 0 1440 180" preserveAspectRatio="xMidYMin slice" aria-hidden="true" />
    </div>
  );
}
