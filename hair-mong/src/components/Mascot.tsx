import type {Character} from '../logic';
export function Mascot({c,className=''}:{c:Character;className?:string}){
 return <div className={`mascot ${className}`} role="img" aria-label={c.name}><img src={`/hair-mong/characters/v2/${c.slug}.png`} alt="" width="1280" height="1280" draggable={false} loading="lazy" decoding="async"/></div>;
}
