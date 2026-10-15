export class ApiError extends Error {constructor(message:string,public status:number){super(message);}}
export function newKey(){return Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');}
export async function api<T>(path:string,method='GET',body?:unknown,ownerKey?:string):Promise<T>{
 let response:Response;
 try{response=await fetch(path,{method,credentials:'same-origin',keepalive:method==='POST',headers:{...(body?{'Content-Type':'application/json'}:{}),...(ownerKey?{Authorization:`Bearer ${ownerKey}`}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000)});}catch{throw new ApiError('서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.',0);}
 let data;try{data=await response.json();}catch{throw new ApiError('서버 응답을 읽지 못했어요. 다시 시도해 주세요.',response.status);}
 if(!response.ok)throw new ApiError(data.error||'요청을 처리하지 못했어요.',response.status);return data;
}
export const track=(name:string)=>{void api('/api/hair-mong/events','POST',{name,id:newKey()}).catch(()=>undefined);};
