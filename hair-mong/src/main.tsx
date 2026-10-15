import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {characters,questions,score,complete,getCharacter,type Answers} from './logic';
import {savePng} from './export';
import {questionArt} from './question-art';
import {resultCopy} from './result-content';
import {track} from './api';
import {makeResult,savedResults,storeResult,removeResult,type SavedResult} from './storage';
import {Mascot} from './components/Mascot';
import {HeroCarousel} from './components/HeroCarousel';
import {Logo} from './components/Logo';
import {ResultCard} from './components/ResultCard';
import {ShareActions} from './components/ShareActions';
import {PollPanel} from './components/PollPanel';
import {FriendPage} from './components/FriendPage';
import './style.css';

const sessionKey='hair-ego-session-v2';
function resetSessionForHome(){try{sessionStorage.setItem(sessionKey,JSON.stringify({answers:{},step:0,screen:'home'}));}catch{/* navigation still works without storage */}}
function initialState(){
 const fallback={answers:{} as Answers,step:0,screen:'home',result:null as SavedResult|null};
 if(new URLSearchParams(location.search).has('start'))return {...fallback,screen:'quiz'};
 const poll=new URLSearchParams(location.search).get('poll');
 const owned=poll?savedResults().find(r=>r.publicToken===poll):null;
 if(owned)return {...fallback,screen:'result',result:owned};
 try{
  const v2=sessionStorage.getItem(sessionKey);
  const v=JSON.parse(v2||sessionStorage.getItem('hair-ego-v1')||'null');
  if(v?.answers&&typeof v.answers==='object'){
   const answers:Answers={};for(const q of questions){const a=v.answers[q.id];if(Number.isInteger(a)&&a>=0&&a<4)answers[q.id]=a;}
   if(v.screen==='home')return fallback;
   if(v.screen==='quiz'){const firstMissing=questions.findIndex(q=>answers[q.id]===undefined);const step=v2&&v.flowVersion===3&&Number.isInteger(v.step)&&v.step>=0&&v.step<questions.length&&questions.slice(0,v.step).every(q=>answers[q.id]!==undefined)?v.step:firstMissing<0?questions.length-1:firstMissing;return {answers,step,screen:'quiz',result:null};}
   if(v.screen==='tie'&&complete(answers)){const result=makeResult(score(answers).candidates[0].slug);try{storeResult(result);}catch{/* storage optional */}return {answers,step:questions.length-1,screen:'result',result};}
   if(v.screen==='result'&&getCharacter(v.slug)){
    const result=savedResults().find(r=>r.localId===v.localId)||makeResult(v.slug);try{storeResult(result);}catch{/* optional until friend link creation */}
    return {answers,step:questions.length-1,screen:'result',result};
   }
  }
 }catch{/* unavailable or malformed storage */}
 const latest=savedResults()[0];return latest?{...fallback,screen:'result',result:latest}:fallback;
}
function Privacy({close}:{close:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{ref.current?.showModal();},[]);
 return <dialog ref={ref} className="privacy-dialog" onClose={close}><button className="close" onClick={()=>ref.current?.close()} aria-label="닫기">×</button><h2>개인정보와 저장 안내</h2>
  <p>이름·연락처·사진을 받지 않아요. 질문별 답변은 현재 브라우저 세션에만 보관하며 서버로 보내지 않아요. 세션은 브라우저의 탭 복원 기능으로 복구될 수 있어요.</p>
  <p>내 결과와 투표 관리용 키는 이 기기의 브라우저에 보관해요. 브라우저 데이터를 지우거나 다른 기기로 이동하면 내 투표 현황을 다시 열 수 없어요.</p>
  <p>친구 링크를 만들면 결과 유형·임의 식별자·생성 시각을 서버에 저장해요. 친구가 고른 유형과 중복 확인용 브라우저 식별자의 해시도 저장하며, 링크 생성 후 90일이 지나면 삭제해요. 내 결과의 ‘투표 링크 삭제’로 먼저 삭제할 수도 있어요.</p>
  <p>중복 참여 제한을 위해 브라우저 쿠키를 1년간 유지해요. 로그인 없이 다른 기기나 쿠키 삭제까지 막을 수는 없어요. 방문·시작·완료·저장·공유와 친구 참여 이벤트는 일별 집계용으로 90일간 보관해요. 이벤트에는 답변·이름·원문 IP를 저장하지 않으며 광고 추적은 사용하지 않아요.</p>
  <button className="primary" onClick={()=>ref.current?.close()}>알겠어요</button>
 </dialog>;
}
function BrandIntro(){return <aside className="brand-intro brand-visible"><a href="/hair-mong" onClick={resetSessionForHome} aria-label="헤어몽 홈"><Logo/></a><h3>원하는 머리,<br/>내 머리에서는 어떨까?</h3><p>HairTwin은 모발 상태를 반영한 헤어 시뮬레이션 기술을 개발하고 있습니다.</p></aside>;}
function App(){
 const [initial]=useState(initialState),[answers,setAnswers]=useState(initial.answers),[step,setStep]=useState(initial.step),[screen,setScreen]=useState(initial.screen),[result,setResult]=useState(initial.result);
 const [busy,setBusy]=useState(false),[toast,setToast]=useState(''),[privacy,setPrivacy]=useState(false);
 const lock=useRef(false),viewTracked=useRef(false);const main=useRef<HTMLElement>(null);
 const shared=location.pathname.startsWith('/hair-mong/share/'),friend=location.pathname.startsWith('/hair-mong/friend/');
 const pathToken=location.pathname.split('/')[3]||'';
 const character=getCharacter(shared?pathToken:result?.slug||'');
 useEffect(()=>{if(!viewTracked.current&&!friend){track('test_view');if(new URLSearchParams(location.search).has('start'))track('test_start');viewTracked.current=true;}
  if(friend){const meta=document.createElement('meta');meta.name='robots';meta.content='noindex,nofollow,noarchive';document.head.appendChild(meta);return()=>meta.remove();}
 },[friend]);
 useEffect(()=>{if(shared||friend)return;try{sessionStorage.setItem(sessionKey,JSON.stringify({flowVersion:3,answers,step,screen,slug:result?.slug,localId:result?.localId}));}catch{/* storage optional */}},[answers,step,screen,result,shared,friend]);
 useEffect(()=>{window.scrollTo(0,0);const heading=main.current?.querySelector<HTMLElement>('h1');heading?.setAttribute('tabindex','-1');heading?.focus();},[screen,step]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(timer);},[toast]);
 useEffect(()=>{if(screen!=='quiz')return;const next=questions[step+1];if(next){const img=new Image();img.src=questionArt[next.id].src;}},[screen,step]);
 const updateResult=(r:SavedResult)=>{setResult(r);};
 const start=()=>{if(shared||friend){location.assign('/hair-mong?start=1');return;}window.history.replaceState(null,'','/hair-mong');setAnswers({});setStep(0);setResult(null);setScreen('quiz');track('test_start');};
 const restart=()=>{window.history.replaceState(null,'','/hair-mong');setAnswers({});setStep(0);setResult(null);setToast('');setScreen('home');};
 const finish=(slug:string)=>{const r=makeResult(slug);try{storeResult(r);}catch{setToast('이 브라우저에 결과를 보관하지 못했어요. 이미지로 저장해 주세요.');}setResult(r);setScreen('result');track('test_complete');};
 const choose=(index:number)=>{if(lock.current)return;lock.current=true;setBusy(true);const next={...answers,[questions[step].id]:index};setAnswers(next);
  setTimeout(()=>{lock.current=false;setBusy(false);if(step<questions.length-1)setStep(step+1);else if(complete(next)){setScreen('loading');setTimeout(()=>{finish(score(next).candidates[0].slug);},700);}else setScreen('home');},160);
 };
 const download=async()=>{if(!character||busy)return;setBusy(true);try{await savePng(character);track('result_download');setToast('이미지를 저장했어요. 다운로드를 확인해 주세요.');}catch{setToast('이미지를 저장하지 못했어요. 다시 시도하거나 화면을 캡처해 주세요.');}finally{setBusy(false);}};
 return <><header className="header"><a href="/hair-mong" onClick={resetSessionForHome} aria-label="헤어몽 홈"><Logo/><span className="brand-sub">헤어몽 테스트</span></a></header><main ref={main}>
 {friend?<FriendPage token={pathToken}/>:shared&&!character?<section className="simple"><h1>결과를 찾을 수 없어요.</h1><button className="primary" onClick={start}>내 헤어몽 찾기</button></section>:
 (shared||screen==='result')&&character?<section className="result">
  <ResultCard character={character}/>
  <aside className="tip"><div className="result-section-heading"><span className="section-number">02</span><div><p className="section-kicker">미용실에 가져갈 한마디</p><h2>성공 확률 높이는 한마디</h2></div></div><div className="salon-note"><span className="quote-mark" aria-hidden="true">“</span><small className="tip-context">오늘의 미용실 메모</small><p>{character.tip}</p><span className="note-tag">이것만 기억해요 ↗</span></div></aside>
  <button className="primary" disabled={busy} onClick={download}>{busy?'이미지 만드는 중…':'결과 이미지 저장'}</button>
  {shared?<button className="secondary" onClick={start}>나도 테스트하기</button>:<><ShareActions url={`${location.origin}/hair-mong/share/${character.slug}/`} text={`내 헤어몽은 ${character.name}. ${resultCopy[character.slug].headline}`}/><button className="restart-button" onClick={restart}><span aria-hidden="true">↻</span> 다시 하기</button>{result&&<PollPanel key={result.localId} result={result} onUpdate={updateResult}/>} {result&&!result.publicToken&&<button className="text-button" onClick={()=>{try{removeResult(result.localId);setResult(null);setScreen('home');}catch{setToast('결과를 지우지 못했어요.');}}}>이 기기에서 이 결과 지우기</button>}</>}
  <BrandIntro/>
 </section>:screen==='home'?<section className="landing"><div className="landing-title"><p className="eyebrow">내 머릿속에 사는 헤어몽은?</p><h1>이 머리 하고 싶은데,<br/>내가 감당 가능함?</h1><p className="intro intro-promise">내 유형 알아보기 <span>&amp;</span><br/>성공 확률 높이는 한마디</p></div><HeroCarousel/><div className="start-block"><p className="test-meta">10문항 · 약 2분</p><button className="primary" onClick={start}>내 머리의 속마음 듣기</button></div><details className="meet"><summary>어떤 헤어몽이 있나요?<span aria-hidden="true">＋</span></summary><div className="character-grid">{characters.map(c=><div key={c.slug}><Mascot c={c}/><strong>{c.name}</strong><span>{c.trait}</span></div>)}</div></details></section>:
 screen==='quiz'?<section className="quiz"><div className="quiz-top"><button aria-label="이전 질문" disabled={busy} onClick={()=>step===0?setScreen('home'):setStep(step-1)}>←</button><span>{String(step+1).padStart(2,'0')} <em>/ {questions.length}</em></span><span className="eyebrow">머리와 나 사이</span></div><div className="progress" role="progressbar" aria-valuenow={step+1} aria-valuemin={0} aria-valuemax={questions.length} aria-label="질문 진행률"><div style={{width:`${(step+1)/questions.length*100}%`}}/></div><span className="eyebrow">Q{step+1}.</span><h1>{questions[step].question}</h1><p className="helper">{questions[step].helper}</p><div className="question-art"><img key={questions[step].id} src={questionArt[questions[step].id].src} alt={questionArt[questions[step].id].alt} width="720" height="380"/></div><div className="options">{questions[step].options.map((o,i)=><button key={`${step}-${i}`} aria-pressed={answers[questions[step].id]===i} className={answers[questions[step].id]===i?'selected':''} disabled={busy} onClick={()=>choose(i)}><span className="option-quote">“{o.quote}”</span><span className="option-action">{o.label}</span></button>)}</div><p className="small">정답은 없어요. 평소의 나에 가까운 쪽으로.</p></section>:
 screen==='loading'?<section className="simple"><Mascot c={characters[0]}/><h1>내 머리의 취향을<br/>살펴보는 중…</h1></section>:<section className="simple"><h1>테스트를 다시 시작해 주세요.</h1><button className="primary" onClick={start}>테스트 시작하기</button></section>}
 </main><footer><div><span>made by @eltica.404</span></div><button onClick={()=>setPrivacy(true)}>개인정보 안내</button></footer>{toast&&<div className="toast" role="status">{toast}</div>}{privacy&&<Privacy close={()=>setPrivacy(false)}/>}</>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
