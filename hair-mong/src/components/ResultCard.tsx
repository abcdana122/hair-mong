import type {CSSProperties} from 'react';
import type {Character} from '../logic';
import {resultCopy} from '../result-content';
import {Mascot} from './Mascot';
const thoughts:Record<string,string[]>={
 mukmuki:['일단 묶자','머리끈 어디 갔지?','편한 게 예쁜 거야'],jamjami:['5분만 더…','고데기는 내일','감고 말리면 끝!'],
 jupjupi:['이 머리도 예쁜데?','일단 저장 ♡','예약은… 나중에'],ssakdugi:['지금 자를까?','딱 조금만!','오히려 좋아'],
 gakjabi:['1mm만 더','거울 한 번만','바람아 멈춰'],challangmong:['상상은 이미 완성','찰랑이면 좋겠다','내가 광고 주인공'],
 bokguyojeong:['머릿결은 소중해','트리트먼트 필수','천천히 바꾸자'],garaeopi:['다음엔 무슨 색?','또 바꾸고 싶어','새 머리, 새 기분!'],
};
function Doodle({kind}:{kind:'spark'|'loop'}){
 return <svg className={`box-doodle ${kind}`} width="52" height="30" viewBox="0 0 52 30" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">{kind==='spark'?<><path d="M15 3L17 12L26 14L17 16L15 25L13 16L4 14L13 12Z"/><path d="M35 5l3 5m6 4 5-1M34 21l4-2"/></>:<><path d="M3 21C11 5 36 3 34 13S12 27 15 16S40 8 46 19M40 18l7 3 1-7"/></>}</g></svg>;
}
export function ResultCard({character:c}:{character:Character}){
 const copy=resultCopy[c.slug];
 return <article className="receipt mong-poster" style={{'--poster-color':c.colors.split(' / ')[1]} as CSSProperties} aria-label={`${c.name} 헤어몽 결과 카드`}>
  <div className="poster-title"><div className="poster-meta"><span>나의 헤어몽 도감</span><span>NO. {c.id.slice(1).padStart(3,'0')}</span></div><div className="poster-name"><h1 tabIndex={-1}>{c.name}</h1><span className="poster-stamp" aria-hidden="true">MY<br/>HAIR<br/>MONG</span></div><p className="representative">{copy.headline}</p></div>
  <div className="poster-ribbon" aria-hidden="true">✳ MEET YOUR HAIR MONG ✳ MEET YOUR HAIR MONG ✳</div>
  <div className="poster-inner"><div className="thought-column"><div className="decorated-heading"><h2 className="mind-title">머릿속</h2><Doodle kind="spark"/></div><div className="thought-pills">{thoughts[c.slug].map(t=><span key={t}>{t}</span>)}</div></div><div className="poster-character"><span className="poster-star" aria-hidden="true">✧</span><Mascot c={c}/><span className="character-caption">이게 바로 나야!</span></div></div>
  <section className="poster-habits"><div><div className="decorated-heading"><h2 className="reality-title">현실의 나</h2><Doodle kind="loop"/></div><div className="keywords">{copy.keywords.map(word=><span key={word}>{word}</span>)}</div><ul>{copy.behaviors.map(line=><li key={line}>{line}</li>)}</ul></div></section>
  <div className="poster-bottom"><span aria-hidden="true">↗</span><p>{copy.self}</p><span aria-hidden="true">✳</span></div>
  <div className="poster-ribbon" aria-hidden="true">✳ A LITTLE HAIR, A LOT OF ME ✳ A LITTLE HAIR, A LOT OF ME</div>
 </article>;
}
