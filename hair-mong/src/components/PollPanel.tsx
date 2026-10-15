import {useCallback,useEffect,useState} from 'react';
import {api,ApiError,newKey} from '../api';
import {characters,getCharacter} from '../logic';
import {comparison} from '../result-content';
import {storeResult,type SavedResult} from '../storage';
import {Mascot} from './Mascot';
import {ShareActions} from './ShareActions';
type Stats={slug:string;counts:Record<string,number>;total:number;leaders:string[];expiresAt:number};
export function PollPanel({result,onUpdate}:{result:SavedResult;onUpdate:(r:SavedResult)=>void}){
 const [stats,setStats]=useState<Stats|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[confirm,setConfirm]=useState(false),[unavailable,setUnavailable]=useState(false);
 const refresh=useCallback(async()=>{
  if(!result.publicToken||!result.ownerKey)return;
  try{setError('');const data=await api<Stats>(`/api/hair-mong/polls/${result.publicToken}/owner`,'GET',undefined,result.ownerKey);setStats(data);setUnavailable(false);}catch(e){setError((e as Error).message);setStats(null);if(e instanceof ApiError&&[403,404].includes(e.status))setUnavailable(true);}
 },[result.publicToken,result.ownerKey]);
 useEffect(()=>{void refresh();const focus=()=>{void refresh();};window.addEventListener('focus',focus);return()=>window.removeEventListener('focus',focus);},[refresh]);
 const create=async()=>{
  if(busy)return;setBusy(true);setError('');
  try{
   const pending={...result,ownerKey:result.ownerKey||newKey()};
   // Persist the credential before sending; retrying can recover a lost response.
   storeResult(pending);onUpdate(pending);
   const data=await api<{publicToken:string;expiresAt:number}>('/api/hair-mong/results','POST',{slug:result.slug,ownerKey:pending.ownerKey});
   const saved={...pending,...data};storeResult(saved);onUpdate(saved);
  }catch(e){setError(e instanceof ApiError?e.message:'이 브라우저에서 결과를 보관하지 못했어요. 저장소 설정을 확인해 주세요.');}finally{setBusy(false);}
 };
 const clearLink=async()=>{
  setBusy(true);try{if(!unavailable)await api(`/api/hair-mong/polls/${result.publicToken}/owner`,'DELETE',{},result.ownerKey);
   const saved={...result,publicToken:undefined,ownerKey:undefined,expiresAt:undefined};storeResult(saved);onUpdate(saved);setStats(null);setConfirm(false);setError('');setUnavailable(false);
  }catch(e){setError((e as Error).message);}finally{setBusy(false);}
 };
 const mine=getCharacter(result.slug)!;
 const leaders=stats?.leaders.map(s=>getCharacter(s)!).filter(Boolean)||[];
 const copy=leaders.length===1?comparison(result.slug,leaders[0].slug):null;
 return <section className="poll-panel" aria-labelledby="poll-heading">
  <p className="eyebrow">친구가 보는 나</p><h2 id="poll-heading">너 눈에는 나 어떤 애 같아?</h2>
  {!result.publicToken?<><p className="section-copy">나는 {mine.name}. 친구들도 그렇게 볼까?<br/>링크를 보내면 친구는 캐릭터 하나만 고르면 돼요.</p><button className="primary" disabled={busy} onClick={create}>{busy?'링크 만드는 중…':'친구 눈에는 내가 어떤 헤어몽일까?'}</button></>:<>
   {!unavailable&&<ShareActions url={`${location.origin}/hair-mong/friend/${result.publicToken}`} text="나 헤어몽 테스트 했는데ㅋㅋ 너 눈에는 나 어떤 캐릭터 같아?"/>}
   <div className="stats-heading"><h3>친구들의 현재 선택</h3><button className="text-button" onClick={()=>void refresh()}>새로고침</button></div>
   {!stats&&!error&&<p role="status">친구들의 선택을 불러오는 중…</p>}
   {stats&&<><p className="vote-total">참여 친구 <strong>{stats.total}명</strong></p>
    {stats.total===0?<div className="empty-state"><Mascot c={mine}/><p>아직 친구들의 선택이 없어요.</p><span>링크를 보내고 첫 번째 선택을 기다려봐요.</span></div>:<>
     <div className="comparison-card"><div className="comparison-pair"><div><span>내 테스트 결과</span><Mascot c={mine}/><strong>{mine.name}</strong></div><span className="versus">&</span><div><span>{leaders.length>1?'친구들 공동 1위':'친구들 최다 선택'}</span><div className={leaders.length>1?'tied-mascots':''}>{leaders.map(c=><Mascot key={c.slug} c={c}/>)}</div><strong>{leaders.map(c=>c.name).join(' · ')}</strong></div></div>
      <h3>{copy?.title||'친구마다 떠올린 내 모습이 달라요.'}</h3><p>{copy?.description||`${leaders.map(c=>c.name).join(', ')}가 ${stats.counts[leaders[0].slug]}표씩 공동 1위예요. 한 유형으로 정하지 않고 함께 보여드려요.`}</p>
     </div>
     <ul className="vote-counts">{characters.map(c=><li key={c.slug}><span>{c.name}</span><div className="vote-bar"><i style={{width:`${stats.counts[c.slug]/stats.total*100}%`}}/></div><strong>{stats.counts[c.slug]}표</strong></li>)}</ul>
    </>}
   </>}
   <p className="small">{result.expiresAt&&`${new Date(result.expiresAt).toLocaleDateString('ko-KR')}까지 참여 가능`}</p>
   {confirm?<div className="delete-confirm"><p>{unavailable?'이 브라우저에 남은 링크 정보를 지울까요? 서버 데이터는 삭제하지 않아요.':'링크와 친구들의 투표를 삭제할까요? 내 테스트 결과는 남아요.'}</p><button disabled={busy} onClick={clearLink}>{unavailable?'링크 정보 지우기':'삭제하기'}</button><button onClick={()=>setConfirm(false)}>취소</button></div>:<button className="text-button" onClick={()=>setConfirm(true)}>{unavailable?'사용할 수 없는 링크 정리하기':'투표 링크 삭제'}</button>}
  </>}
  {error&&<p className="error" role="alert">{error}</p>}
 </section>;
}
