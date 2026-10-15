import {useEffect,useState} from 'react';
import {characters} from '../logic';
import {Mascot} from './Mascot';
export function HeroCarousel(){
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduced(media.matches);sync();media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync);},[]);
 useEffect(()=>{if(paused||reduced)return;const timer=setInterval(()=>{if(!document.hidden)setIndex(i=>(i+1)%characters.length);},2600);return()=>clearInterval(timer);},[paused,reduced]);
 const current=characters[index];
 return <div className="hero-carousel"><div className="hero-art"><p className="speech">주인님, 저도 취향이 있어요.</p><Mascot c={characters[(index+7)%8]} className="hero-one"/><div key={current.slug} className="hero-current"><Mascot c={current} className="hero-two"/></div><Mascot c={characters[(index+1)%8]} className="hero-three"/><p className="art-caption"><strong>{current.name}</strong><span>{current.trait}</span></p></div><div className="hero-controls"><div className="hero-dots" aria-label="헤어몽 골라보기">{characters.map((c,i)=><button key={c.slug} type="button" aria-label={c.name+' 보기'} aria-pressed={i===index} onClick={()=>setIndex(i)}><span/></button>)}</div>{!reduced&&<button type="button" className="hero-pause" onClick={()=>setPaused(p=>!p)} aria-label={paused?'캐릭터 자동 넘기기 재생':'캐릭터 자동 넘기기 일시정지'}>{paused?'▶':'Ⅱ'}</button>}</div></div>;
}
