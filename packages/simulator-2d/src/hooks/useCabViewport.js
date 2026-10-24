import {useCallback,useEffect,useRef,useState} from 'react';
import {CAB_ZOOM_LEVELS} from '../core/cabGeometry.js';

export function useCabViewport(){
 const viewerRef=useRef(null);
 const scrollRef=useRef(null);
 const [zoomIndex,setZoomIndex]=useState(0);
 const [expanded,setExpanded]=useState(false);
 const [fallback,setFallback]=useState(false);

 const setZoom=useCallback(delta=>setZoomIndex(i=>Math.max(0,Math.min(CAB_ZOOM_LEVELS.length-1,i+delta))),[]);
 const fit=useCallback(()=>{setZoomIndex(0);scrollRef.current?.scrollTo?.({left:0,top:0,behavior:'auto'});},[]);
 const toggleExpanded=useCallback(async()=>{
   if(fallback){setFallback(false);return;}
   const element=viewerRef.current;
   if(!element)return;
   if(document.fullscreenElement===element){await document.exitFullscreen();return;}
   if(element.requestFullscreen){
     try{await element.requestFullscreen();return;}catch{ /* Safari/iOS: use fixed modal fallback. */ }
   }
   setFallback(true);
 },[fallback]);

 useEffect(()=>{
   const changed=()=>setExpanded(document.fullscreenElement===viewerRef.current);
   const escape=e=>{if(e.key==='Escape')setFallback(false);};
   document.addEventListener('fullscreenchange',changed);
   document.addEventListener('keydown',escape);
   return()=>{document.removeEventListener('fullscreenchange',changed);document.removeEventListener('keydown',escape);};
 },[]);
 useEffect(()=>{
   if(!fallback)return;
   const before=document.body.style.overflow;
   document.body.style.overflow='hidden';
   return()=>{document.body.style.overflow=before;};
 },[fallback]);
 return {viewerRef,scrollRef,zoom:CAB_ZOOM_LEVELS[zoomIndex],zoomIndex,maxZoomIndex:CAB_ZOOM_LEVELS.length-1,
   expanded:expanded||fallback,fallback,setZoom,fit,toggleExpanded};
}
