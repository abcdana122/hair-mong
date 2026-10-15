import {useState} from 'react';
import {track} from '../api';
export function ShareActions({url,text}:{url:string;text:string}){
 const [message,setMessage]=useState(''),[manual,setManual]=useState(false);
 const copy=async()=>{try{await navigator.clipboard.writeText(url);setMessage('링크를 복사했어요. 친구에게 보내주세요.');track('result_copy');}catch{setManual(true);setMessage('아래 링크를 선택해 직접 복사해 주세요.');}};
 const share=async()=>{if(!navigator.share){await copy();return;}try{await navigator.share({title:'헤어몽 테스트',text,url});setMessage('공유 창에서 전달을 마쳤어요.');track('result_share');}catch(e){if(!(e instanceof Error&&e.name==='AbortError')){setManual(true);setMessage('공유 창을 열지 못했어요. 링크를 복사해 주세요.');}}};
 return <div className="share-actions"><button className="secondary" onClick={share}>친구에게 보내기</button><div className="share-links"><button onClick={copy}>링크 복사</button><a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">X에 공유</a></div>{message&&<p role="status" className="small">{message}</p>}{manual&&<input aria-label="공유 링크" readOnly value={url} onFocus={e=>e.target.select()}/>}</div>;
}
