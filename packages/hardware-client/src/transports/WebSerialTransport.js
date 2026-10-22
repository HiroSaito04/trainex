// Local USB serial mode needs Chromium, user gesture, and HTTPS/localhost.
// Never request or open a serial port without the user's click.
export class WebSerialTransport {
 constructor({serial=globalThis.navigator?.serial,baudRate=115200}={}){this.serial=serial;this.baudRate=baudRate;this.port=null;this.listeners=new Set();this.running=false;this.writer=null;}
 onMessage(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 async connect(){
  if(!this.serial?.requestPort)throw new Error('Web Serial unavailable in this browser.');
  this.port=await this.serial.requestPort();await this.port.open({baudRate:this.baudRate});
  this.running=true;this.readerTask=this.#read();
 }
 async #read(){
  const decoder=new TextDecoder();let pending='';
  while(this.running&&this.port?.readable){
   const reader=this.port.readable.getReader();
   try {while(this.running){const {value,done}=await reader.read();if(done)break;pending+=decoder.decode(value,{stream:true});if(pending.length>16384)pending='';let index;while((index=pending.indexOf('\n'))>=0){const line=pending.slice(0,index).trim();pending=pending.slice(index+1);if(line)for(const fn of this.listeners)fn(line);}}}
   catch(e){if(this.running)for(const fn of this.listeners)fn(JSON.stringify({type:'transport_error',reason:e.message}))}
   finally{reader.releaseLock();}
   break;
  }
 }
 async send(message){if(!this.port?.writable)throw new Error('Serial disconnected');const writer=this.port.writable.getWriter();try{await writer.write(new TextEncoder().encode((typeof message==='string'?message:JSON.stringify(message))+'\n'))}finally{writer.releaseLock()}}
 async close(){this.running=false;try{await this.port?.close()}catch{}this.port=null}
}
