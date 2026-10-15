import {getCharacter} from './logic';
import {newKey} from './api';
export type SavedResult={localId:string;slug:string;createdAt:number;ownerKey?:string;publicToken?:string;expiresAt?:number};
const key='hair-ego-results-v2';
export function savedResults():SavedResult[]{try{const values=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(values)?values.filter(v=>v&&typeof v.localId==='string'&&getCharacter(v.slug)&&Number.isFinite(v.createdAt)&&(!v.ownerKey||/^[a-f0-9]{48}$/.test(v.ownerKey))&&(!v.publicToken||/^[a-f0-9]{48}$/.test(v.publicToken))):[];}catch{return [];}}
export function storeResult(result:SavedResult){const list=savedResults().filter(v=>v.localId!==result.localId);localStorage.setItem(key,JSON.stringify([result,...list]));}
export function removeResult(localId:string){localStorage.setItem(key,JSON.stringify(savedResults().filter(v=>v.localId!==localId)));}
export function makeResult(slug:string):SavedResult{return {localId:newKey(),slug,createdAt:Date.now()};}
