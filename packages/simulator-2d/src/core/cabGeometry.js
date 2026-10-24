import {CAB_VIEWBOX,DISPLAY_DETENTS} from '../config/consoleParts.js';

const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));

/**
 * SVG scene and all the hotspots use one viewBox. No CSS percentages or
 * separately scaled HTML hit targets exist anymore.
 */
export function getSvgPoint(clientX,clientY,svg){
  if (!svg || !Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;
  const ctm=svg.getScreenCTM?.();
  if(ctm && typeof DOMPoint!=='undefined'){
    try{const p=new DOMPoint(clientX,clientY).matrixTransform(ctm.inverse());return {x:p.x,y:p.y};}catch{/* fall back */}
  }
  const r=svg.getBoundingClientRect?.();
  if(!r || r.width<=0 || r.height<=0)return null;
  // xMidYMid meet. Account for letterboxing on unusual aspect ratios.
  const scale=Math.min(r.width/CAB_VIEWBOX.width,r.height/CAB_VIEWBOX.height);
  const ox=r.left+(r.width-CAB_VIEWBOX.width*scale)/2;
  const oy=r.top+(r.height-CAB_VIEWBOX.height*scale)/2;
  return {x:(clientX-ox)/scale,y:(clientY-oy)/scale};
}
export function masterDetentFromY(y){
  if(!Number.isFinite(y))return 'N';
  return DISPLAY_DETENTS[clamp(Math.floor((y-329)/14.1),0,7)];
}
export function masterDetentFromClientPoint(clientX,clientY,svg){
  const point=getSvgPoint(clientX,clientY,svg);
  return point?masterDetentFromY(point.y):'N';
}
export function detentIndexForArt(value){return DISPLAY_DETENTS.indexOf(value);}
export const CAB_ZOOM_LEVELS=Object.freeze([1,1.5,2.2,3.2,4.5]);

export function partBounds(shape){
  if(shape.kind==='rect')return {x:shape.x,y:shape.y,w:shape.w,h:shape.h};
  if(shape.kind==='circle')return {x:shape.cx-shape.r,y:shape.cy-shape.r,w:2*shape.r,h:2*shape.r};
  if(shape.kind==='polygon'){
    const xx=shape.points.map(p=>p[0]),yy=shape.points.map(p=>p[1]);
    return {x:Math.min(...xx),y:Math.min(...yy),w:Math.max(...xx)-Math.min(...xx),h:Math.max(...yy)-Math.min(...yy)};
  }
  throw new Error(`Unknown shape: ${shape.kind}`);
}
export function shapeContains(shape,x,y){
  if(shape.kind==='circle')return (x-shape.cx)**2+(y-shape.cy)**2<=shape.r**2;
  if(shape.kind==='rect')return x>=shape.x&&x<=shape.x+shape.w&&y>=shape.y&&y<=shape.y+shape.h;
  if(shape.kind==='polygon'){
    let inside=false;
    for(let i=0,j=shape.points.length-1;i<shape.points.length;j=i++){
      const a=shape.points[i],b=shape.points[j];
      if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))inside=!inside;
    }
    return inside;
  }
  return false;
}
