import {useEffect,useRef,useState} from 'react';
import {api,ApiError,track} from '../api';
import {characters,getCharacter} from '../logic';
import {resultCopy} from '../result-content';
import {Mascot} from './Mascot';
type Poll={voted:boolean;choice:string|null;isOwner:boolean};
export function FriendPage({token}:{token:string}){
 const [poll,setPoll]=useState<Poll|null>(null),[error,setError]=useState(''),[choice,setChoice]=useState(''),[busy,setBusy]=useState(false),[missing,setMissing]=useState(false),[attempt,setAttempt]=useState(0);const sent=useRef(false);
 useEffect(()=>{let active=true;setError('');api<Poll>(`/api/hair-mong/polls/${token}`).then(p=>{if(active){setPoll(p);if(p.choice)setChoice(p.choice);}}).catch(e=>{if(active){setError(e.message);setMissing(e instanceof ApiError&&e.status===404);}});if(!sent.current){track('friend_view');sent.current=true;}return()=>{active=false;};},[token,attempt]);
 const vote=async()=>{if(!choice||busy)return;setBusy(true);setError('');try{await api(`/api/hair-mong/polls/${token}/vote`,'POST',{slug:choice});setPoll({voted:true,choice,isOwner:false});}catch(e){if(e instanceof ApiError&&e.status===409){setAttempt(v=>v+1);}else setError((e as Error).message);}finally{setBusy(false);}};
 const start=()=>{track('friend_test_start');location.assign('/hair-mong?start=1');};
 return <section className="friend-page">
  {poll?.voted?<><p className="eyebrow">친구에게 한 표 보냈어요</p><Mascot c={getCharacter(poll.choice||choice)!}/><h1>선택 완료!<br/>그런데 너는 어떤 헤어몽일까?</h1><p className="section-copy">이 친구에게는 {getCharacter(poll.choice||choice)?.name}가 어울린다고 골랐어요.</p><button className="primary" onClick={start}>내 헤어몽 테스트하기</button><p className="small">10문항 · 약 2분</p></>:<>
   <p className="eyebrow">친구가 너의 생각을 궁금해해</p><h1>너 눈에는 이 친구가<br/>어떤 헤어몽 같아?</h1>
   {poll?.isOwner?<><p className="section-copy">내가 만든 링크예요. 친구에게 보내고 선택을 기다려봐요.</p><a className="secondary link-button" href={`/hair-mong?poll=${token}`}>내 결과로 돌아가기</a></>:poll?<><p className="section-copy">이 친구를 떠올리며 하나만 골라줘.<br/>테스트를 먼저 풀 필요는 없어.</p><div className="friend-grid">{characters.map(c=><button key={c.slug} aria-pressed={choice===c.slug} disabled={busy} className={choice===c.slug?'selected':''} onClick={()=>setChoice(c.slug)}><Mascot c={c}/><strong>{c.name}</strong><span>{resultCopy[c.slug].headline}</span></button>)}</div><div className="vote-submit"><button className="primary" disabled={!choice||busy} onClick={vote}>{busy?'보내는 중…':choice?`${getCharacter(choice)?.name}로 선택하기`:'캐릭터 하나를 골라줘'}</button><p className="small">선택하면 바꿀 수 없어요. 이름은 받지 않아요.</p></div></>:!error&&<p className="section-copy" role="status">친구의 링크를 열고 있어요…</p>}
  </>}
  {error&&<div className="error" role="alert"><p>{error}</p>{!missing&&<button className="secondary" onClick={()=>setAttempt(v=>v+1)}>다시 불러오기</button>}</div>}
  {missing&&<button className="primary" onClick={start}>내 헤어몽 테스트하기</button>}
 </section>;
}
