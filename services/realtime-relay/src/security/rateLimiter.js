export function createRateLimiter({max=30,windowMs=1000}={}){
 const hits=new Map();return {allow(key,now=Date.now()){
  const item=hits.get(key); if(!item||now-item.start>=windowMs){hits.set(key,{start:now,count:1});return true}
  if(item.count>=max)return false;item.count++;return true;
 },reset(){hits.clear()}};
}
