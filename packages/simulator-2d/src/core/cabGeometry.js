import {CAB_VIEWBOX,DISPLAY_DETENTS} from '../config/consoleParts.js';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
export function getSvgPoint(clientX,clientY,svg){
 if(!svg||!Number.isFinite(clientX)||!Number.isFinite(clientY))return null;
 const ctm=svg.getScreenCTM?.();
 if(ctm&&typeof DOMPoint!=='undefined')try{const p=new DOMPoint(clientX,clientY).matrixTransform(ctm.inverse());return {x:p.x,y:p.y};}catch{}
 const r=svg.getBoundingClientRect?.();if(!r||r.width<=0||r.height<=0)return null;
 const scale=Math.min(r.width/CAB_VIEWBOX.width,r.height/CAB_VIEWBOX.height);
 return {x:(clientX-r.left-(r.width-CAB_VIEWBOX.width*scale)/2)/scale,y:(clientY-r.top-(r.height-CAB_VIEWBOX.height*scale)/2)/scale};
}
// Exact SVG TEXT_P4 ... TEXT_EB baselines (alternating 48/54 source-unit gaps).
const DETENT_BASELINES=[1671.57,1719.57,1773.57,1821.57,1875.57,1923.57,1977.57,2025.57,2079.57,2127.57,2181.57,2229.57,2283.57].map(y=>y*1800/8784);
export function masterDetentFromY(y){
 let closest=0;
 for(let i=1;i<DETENT_BASELINES.length;i++)if(Math.abs(y-DETENT_BASELINES[i])<Math.abs(y-DETENT_BASELINES[closest]))closest=i;
 return DISPLAY_DETENTS[clamp(closest,0,DISPLAY_DETENTS.length-1)];
}
export function detentBaselineForArt(index){return DETENT_BASELINES[index]??DETENT_BASELINES[4];}
export function masterDetentFromClientPoint(x,y,svg){const p=getSvgPoint(x,y,svg);return p?masterDetentFromY(p.y):'N';}
export function detentIndexForArt(value){return DISPLAY_DETENTS.indexOf(value);}
export const CAB_ZOOM_LEVELS=Object.freeze([1,1.5,2.2,3.2,4.5]);
export function partBounds(shape){
 if(shape.kind==='rect')return {x:shape.x,y:shape.y,w:shape.w,h:shape.h};
 if(shape.kind==='circle')return {x:shape.cx-shape.r,y:shape.cy-shape.r,w:2*shape.r,h:2*shape.r};
 if(shape.kind==='polygon'){const xs=shape.points.map(p=>p[0]),ys=shape.points.map(p=>p[1]);return {x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};}
 throw new Error(`Unknown shape ${shape.kind}`);
}
export function shapeContains(shape,x,y){
 if(shape.kind==='circle')return (x-shape.cx)**2+(y-shape.cy)**2<=shape.r**2;
 if(shape.kind==='rect')return x>=shape.x&&x<=shape.x+shape.w&&y>=shape.y&&y<=shape.y+shape.h;
 if(shape.kind==='polygon'){let inside=false;for(let i=0,j=shape.points.length-1;i<shape.points.length;j=i++){
 const a=shape.points[i],b=shape.points[j];const intersects=(a[1]>y)!==(b[1]>y);if(intersects&&x<((b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))inside=!inside;
 }return inside;}return false;
}
