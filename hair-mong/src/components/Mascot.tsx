import type {Character} from '../logic';
import {characterSvg} from '../characters';
export function Mascot({c,className=''}:{c:Character;className?:string}){return <div className={`mascot ${className}`} role="img" aria-label={c.name} dangerouslySetInnerHTML={{__html:characterSvg(c)}}/>;}
