import {useEffect,useRef,useState} from 'react';
import {createCabinRenderer} from '../core/CabinRenderer.js';
import {CABIN_MODEL_URL} from '../config/cabinConfig.js';
export default function CabinViewport({state,onPicked,onReady,onMasterDetent,modelUrl=CABIN_MODEL_URL,cameraResetToken=0}){
 const mountRef=useRef(null),apiRef=useRef(null);
 const refs=useRef({state,onPicked,onReady,onMasterDetent});refs.current={state,onPicked,onReady,onMasterDetent};
 const [error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{
  let cancelled=false,instance=null;setError('');setLoading(true);
  try{
   instance=createCabinRenderer({container:mountRef.current,modelUrl,
    onPicked:o=>refs.current.onPicked?.(o),onReady:m=>refs.current.onReady?.(m),
    onMasterDetent:p=>refs.current.onMasterDetent?.(p)});
   apiRef.current=instance;instance.setTrainState(refs.current.state);
   instance.ready.then(()=>{if(!cancelled)setLoading(false)}).catch(e=>{if(!cancelled){setLoading(false);setError(e.message)}});
  }catch(e){if(!cancelled){setLoading(false);setError(e.message)}}
  return()=>{cancelled=true;instance?.dispose();if(apiRef.current===instance)apiRef.current=null};
 },[modelUrl]);
 useEffect(()=>{apiRef.current?.setTrainState(state)},[state]);
 useEffect(()=>{if(cameraResetToken)apiRef.current?.resetCamera()},[cameraResetToken]);
 return <div className="t3d-canvas-frame">
  <div ref={mountRef} className="t3d-canvas-mount"/>
  {loading&&!error&&<p className="t3d-loader" role="status">Loading your original driver cabin…</p>}
  {error&&<div className="t3d-model-error" role="alert"><strong>Cabin unavailable</strong><p>{error}</p></div>}
  <p className="t3d-viewport-hint">Drag: look around 360° · WASD/arrows: move inside only · Click in-cab buttons · Drag the master lever</p>
 </div>;
}
