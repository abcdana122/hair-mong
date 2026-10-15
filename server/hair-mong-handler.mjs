import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {readFileSync} from 'node:fs';
const slugs=JSON.parse(readFileSync(new URL('../hair-mong/src/content.json',import.meta.url),'utf8')).characters.map(c=>c.slug);
const hash=value=>createHash('sha256').update(value).digest('hex');
const token=()=>randomBytes(24).toString('hex');
const validKey=value=>typeof value==='string'&&/^[a-f0-9]{48}$/.test(value);
const eventNames=new Set(['test_view','test_start','test_complete','result_download','result_share','result_copy','friend_view','friend_test_start']);
const DAY=86400000;
const limits=new Map();
export async function handleVote(req,res,db,{origin,adminKey='',now=Date.now}){
 async function clean(){await db.prepare('DELETE FROM results WHERE expires_at <= ?').run(now());await db.prepare('DELETE FROM events WHERE day < ?').run(new Date(now()-90*DAY).toISOString().slice(0,10));}
 const allowedOrigins=new Set([new URL(origin).origin]);
 if(new URL(origin).origin==='https://abcdana.com')allowedOrigins.add('https://www.abcdana.com');
 const json=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
 const countEvent=async(name,id=token())=>(await db.prepare('INSERT OR IGNORE INTO events (id,name,day) VALUES (?,?,?)').run(id,name,new Date(now()).toISOString().slice(0,10)));
 const auth=(req,row)=>{const secret=req.headers.authorization?.replace(/^Bearer /,'');return validKey(secret)&&hash(secret)===row.owner_hash;};
 async function body(req){if(req.body!==undefined){let parsed;try{parsed=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{throw Object.assign(new Error('요청 형식을 확인해 주세요.'),{status:400});}if(!parsed||typeof parsed!=='object'||Array.isArray(parsed)||Buffer.byteLength(JSON.stringify(parsed))>4096)throw Object.assign(new Error('요청 형식을 확인해 주세요.'),{status:400});return parsed;}let data='';for await(const part of req){data+=part;if(Buffer.byteLength(data)>4096)throw Object.assign(new Error('요청이 너무 커요.'),{status:413});}try{const parsed=JSON.parse(data||'{}');if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('invalid');return parsed;}catch{throw Object.assign(new Error('요청 형식을 확인해 주세요.'),{status:400});}}
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
  let path;
  try{path=decodeURIComponent(new URL(req.url,'http://local').pathname.replace('/api/hair-mong/','/api/'));}catch{return json(res,400,{error:'잘못된 주소예요.'});}
  if(path.startsWith('/friend/')||path.startsWith('/api/'))res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  try{
   if(path.startsWith('/api/')) {
    await clean();
    if(req.method!=='GET'&&!allowedOrigins.has(req.headers.origin))return json(res,403,{error:'이 사이트에서 다시 시도해 주세요.'});
    if(req.method!=='GET'&&!req.headers['content-type']?.startsWith('application/json'))return json(res,415,{error:'JSON 요청이 필요해요.'});
    let cookie=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('he_browser='))?.slice(11);
    if(!validKey(cookie)){cookie=token();res.setHeader('Set-Cookie',`he_browser=${cookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${origin.startsWith('https:')?'; Secure':''}`);}
    const browserHash=hash(cookie);
    // A bounded per-browser throttle; this is not a claim of unique-person detection.
    if(limits.size>10000)limits.clear();
    const window=limits.get(browserHash)||{time:now(),count:0};
    if(now()-window.time>60000){window.time=now();window.count=0;}
    window.count++;limits.set(browserHash,window);
    if(window.count>150)return json(res,429,{error:'잠시 후 다시 시도해 주세요.'});
    if(path==='/api/health'&&req.method==='GET')return json(res,200,{ok:true});
    if(path==='/api/events'&&req.method==='POST'){
     const b=await body(req);if(!eventNames.has(b.name)||!validKey(b.id))return json(res,400,{error:'유효하지 않은 이벤트예요.'});
     await countEvent(b.name,b.id);return json(res,200,{ok:true});
    }
    if(path==='/api/admin/metrics'&&req.method==='GET'){
     const supplied=req.headers.authorization?.replace(/^Bearer /,'')||'';
     if(!adminKey||!timingSafeEqual(Buffer.from(hash(supplied)),Buffer.from(hash(adminKey))))return json(res,403,{error:'접근할 수 없어요.'});
     return json(res,200,{daily:(await db.prepare('SELECT day,name,COUNT(*) AS count FROM events GROUP BY day,name ORDER BY day DESC').all()),activeResults:(await db.prepare('SELECT COUNT(*) AS count FROM results').get()).count,activeVotes:(await db.prepare('SELECT COUNT(*) AS count FROM votes').get()).count});
    }
    if(path==='/api/results'&&req.method==='POST'){
     const b=await body(req);if(!slugs.includes(b.slug)||!validKey(b.ownerKey))return json(res,400,{error:'결과 정보를 확인해 주세요.'});
     const existing=(await db.prepare('SELECT * FROM results WHERE owner_hash=?').get(hash(b.ownerKey)));
     if(existing){if(existing.slug!==b.slug)return json(res,409,{error:'이미 다른 결과에 사용한 키예요.'});return json(res,200,{id:existing.id,publicToken:existing.public_token,expiresAt:existing.expires_at});}
     const recent=(await db.prepare('SELECT COUNT(*) AS count FROM results WHERE creator_hash=? AND created_at>?').get(browserHash,now()-DAY)).count;
     if(recent>=20)return json(res,429,{error:'오늘 만든 링크가 많아요. 내일 다시 시도해 주세요.'});
     const id=token(),publicToken=token(),expiresAt=now()+90*DAY;
     (await db.prepare('INSERT INTO results VALUES (?,?,?,?,?,?,?,?)').run(id,publicToken,hash(b.ownerKey),browserHash,b.slug,now(),expiresAt,now()));await countEvent('poll_created',id);
     return json(res,201,{id,publicToken,expiresAt});
    }
    const match=path.match(/^\/api\/polls\/([a-f0-9]{48})(\/vote|\/owner)?$/);
    if(match){
     const row=(await db.prepare('SELECT * FROM results WHERE public_token=?').get(match[1]));
     if(!row)return json(res,404,{error:'링크가 없거나 만료됐어요. 보낸 친구에게 새 링크를 부탁해 주세요.'});
     if(match[2]==='/owner'){
      if(!auth(req,row))return json(res,403,{error:'이 결과를 만든 브라우저에서 열어주세요.'});
      if(req.method==='DELETE'){(await db.prepare('DELETE FROM results WHERE id=?').run(row.id));return json(res,200,{ok:true});}
      if(req.method!=='GET')return json(res,405,{error:'지원하지 않는 요청이에요.'});
      const counts=Object.fromEntries(slugs.map(s=>[s,0]));
      for(const item of (await db.prepare('SELECT slug,COUNT(*) AS count FROM votes WHERE result_id=? GROUP BY slug').all(row.id)))counts[item.slug]=item.count;
      const total=Object.values(counts).reduce((a,b)=>a+b,0),max=Math.max(...Object.values(counts));
      return json(res,200,{id:row.id,slug:row.slug,counts,total,leaders:max?slugs.filter(s=>counts[s]===max):[],createdAt:row.created_at,updatedAt:row.updated_at,expiresAt:row.expires_at});
     }
     if(req.method==='GET'&&!match[2]){const vote=(await db.prepare('SELECT slug FROM votes WHERE result_id=? AND voter_hash=?').get(row.id,browserHash));return json(res,200,{voted:!!vote,choice:vote?.slug||null,isOwner:row.creator_hash===browserHash,expiresAt:row.expires_at});}
     if(req.method==='POST'&&match[2]==='/vote'){
      if(row.creator_hash===browserHash)return json(res,403,{error:'내 투표에는 참여할 수 없어요. 친구에게 링크를 보내주세요.'});
      const b=await body(req);if(!slugs.includes(b.slug))return json(res,400,{error:'캐릭터 하나를 골라주세요.'});
      const written=(await db.prepare('INSERT OR IGNORE INTO votes VALUES (?,?,?,?)').run(row.id,browserHash,b.slug,now()));
      if(!written.changes)return json(res,409,{error:'이 브라우저에서는 이미 선택했어요.',code:'ALREADY_VOTED'});
      (await db.prepare('UPDATE results SET updated_at=? WHERE id=?').run(now(),row.id));await countEvent('friend_vote');return json(res,201,{ok:true});
     }
    }
    return json(res,404,{error:'요청한 정보를 찾을 수 없어요.'});
   }
   return json(res,404,{error:'요청한 정보를 찾을 수 없어요.'});
  }catch(e){throw e;}
}
