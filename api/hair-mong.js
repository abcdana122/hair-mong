import pg from 'pg';
import {handleVote} from '../server/hair-mong-handler.mjs';
import {database} from '../server/hair-mong-database.mjs';
let pool;
export default async function handler(req,res){
 const route=req.query?.path||new URL(req.url,'http://local').searchParams.get('path');
 if(route)req.url='/api/hair-mong/'+(Array.isArray(route)?route.join('/'):route);
 const origin=process.env.SITE_URL;
 if(!process.env.DATABASE_URL||!origin){res.statusCode=503;res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({error:'투표 서버를 준비하고 있어요.'}));}
 pool??=new pg.Pool({connectionString:process.env.DATABASE_URL,max:2,idleTimeoutMillis:10000,connectionTimeoutMillis:8000,ssl:{rejectUnauthorized:true}});
 let client;const headers={};let status=200,payload;
 const buffered={setHeader:(key,value)=>{headers[key]=value;},writeHead:(code,values)=>{status=code;Object.assign(headers,values);},end:value=>{payload=value;}};
 try{
  client=await pool.connect();await client.query('BEGIN');await client.query("SET LOCAL statement_timeout = '8s'");
  await client.query('SELECT pg_advisory_xact_lock(72100815)');
  await handleVote(req,buffered,database((sql,args)=>client.query(sql,args)),{origin,adminKey:process.env.ADMIN_KEY||''});
  await client.query('COMMIT');res.writeHead(status,headers);res.end(payload);
 }catch(error){
  console.error('HairMong DB request failed',{code:error.code||'UNKNOWN',type:error.name||'Error'});
  if(client)await client.query('ROLLBACK').catch(()=>{});
  const status=[400,413,415].includes(error.status)?error.status:503;
  res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:status===503?'저장하지 못했어요. 잠시 후 다시 시도해 주세요.':error.message}));
 }finally{client?.release();}
}
