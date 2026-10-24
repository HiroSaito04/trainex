import {useEffect,useRef,useState} from 'react';

/** Linear state values are eased between engine snapshots, without changing engine state. */
export function useAnimatedValue(target,durationMs=180){
 const [value,setValue]=useState(Number.isFinite(target)?target:null);
 const valueRef=useRef(Number.isFinite(target)?target:null);
 useEffect(()=>{
   if(!Number.isFinite(target)){valueRef.current=null;setValue(null);return;}
   const prefersReducedMotion=typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   if(prefersReducedMotion||typeof requestAnimationFrame!=='function'){
     valueRef.current=target;setValue(target);return;
   }
   const from=Number.isFinite(valueRef.current)?valueRef.current:target;
   const start=performance.now();let frame=0;
   const advance=now=>{
     const t=Math.min(1,(now-start)/durationMs);
     const eased=t*t*(3-2*t);
     const next=from+(target-from)*eased;
     valueRef.current=next;setValue(next);
     if(t<1)frame=requestAnimationFrame(advance);
   };
   frame=requestAnimationFrame(advance);
   return()=>cancelAnimationFrame(frame);
 },[target,durationMs]);
 return value;
}
