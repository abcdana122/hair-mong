import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {handleVote} from '../server/hair-mong-handler.mjs';
import {database} from '../server/hair-mong-database.mjs';
const pg=new PGlite();await pg.exec(await readFile(new URL('../server/hair-mong-schema.sql',import.meta.url),'utf8'));
const db=database(async(sql,args)=>{const r=await pg.query(sql,args);return {rows:r.rows,rowCount:r.affectedRows};});
const cookies={};let time=Date.now();const key=()=>randomBytes(24).toString('hex');
async function request(who,path,method='GET',body,secret,origin='https://abcdana.com'){
 const headers={origin,'content-type':'application/json',cookie:cookies[who]||'',...(secret?{authorization:`Bearer ${secret}`}:{})};let status=200,data;const out={};
 await handleVote({url:'/api/hair-mong'+path,headers,method,body},{setHeader:(k,v)=>out[k]=v,writeHead:(s,h)=>{status=s;Object.assign(out,h);},end:v=>{data=JSON.parse(v);}},db,{origin:'https://abcdana.com',now:()=>time});
 if(out['Set-Cookie'])cookies[who]=out['Set-Cookie'].split(';')[0];return {status,data};
}
try{
 await assert.rejects(()=>request('a','/results','POST','{'),error=>error.status===400);
 const secret=key();assert.equal((await request('a','/results','POST',{slug:'jupjupi',ownerKey:secret},null,'https://evil.example')).status,403);
 const made=await request('a','/results','POST',{slug:'jupjupi',ownerKey:secret});assert.equal(made.status,201);const path='/polls/'+made.data.publicToken;
 assert.equal((await request('a','/results','POST',{slug:'jupjupi',ownerKey:secret})).data.publicToken,made.data.publicToken);
 assert.equal((await request('b',path+'/owner')).status,403);assert.equal((await request('a',path+'/vote','POST',{slug:'mukmuki'})).status,403);
 assert.equal((await request('b',path+'/vote','POST',{slug:'mukmuki'})).status,201);assert.equal((await request('b',path+'/vote','POST',{slug:'jamjami'})).status,409);
 const stats=await request('a',path+'/owner','GET',undefined,secret);assert.equal(stats.data.total,1);assert.deepEqual(stats.data.leaders,['mukmuki']);
 assert.equal((await request('c',path+'/vote','POST',{slug:'jamjami'})).status,201);assert.equal((await request('a',path+'/owner','GET',undefined,secret)).data.leaders.length,2);
 assert.equal((await request('a',path+'/owner','DELETE',{},secret)).status,200);assert.equal((await request('b',path)).status,404);
 const newer=await request('a','/results','POST',{slug:'jupjupi',ownerKey:key()});time+=91*86400000;assert.equal((await request('b','/polls/'+newer.data.publicToken)).status,404);
 console.log('PASS PostgreSQL: creation, retry, owner access, self/duplicate vote, counts, ties, deletion, expiry, origin check');
}finally{await pg.close();}
