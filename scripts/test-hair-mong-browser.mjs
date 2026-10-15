import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {existsSync,statSync,readFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {handleVote} from '../server/hair-mong-handler.mjs';
import {database} from '../server/hair-mong-database.mjs';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const pg=new PGlite();await pg.exec(await readFile('server/hair-mong-schema.sql','utf8'));
const db=database(async(sql,args)=>{const r=await pg.query(sql,args);return {rows:r.rows,rowCount:r.affectedRows};});
const origin='http://127.0.0.1:5187';
function serve(req,res){const root=resolve('dist');let file=resolve(root,'.'+new URL(req.url,origin).pathname);if(file!==root&&!file.startsWith(root+sep)){res.writeHead(404);return res.end();}if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');if(!existsSync(file))file=resolve(root,'index.html');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf'};res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(readFileSync(file));}

const server=createServer(async(req,res)=>{if(req.url.startsWith('/api/hair-mong/')){try{await handleVote(req,res,db,{origin});}catch(e){console.error(e.message);res.writeHead(500);res.end('{}');}}else {if(req.url.startsWith('/hair-mong/friend/'))req.url='/hair-mong/index.html';serve(req,res);}});await new Promise(r=>server.listen(5187,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
try{
 const a=await browser.newContext({viewport:{width:390,height:844}}),p=await a.newPage();
 await p.goto(origin+'/hair-mong');await p.getByRole('button',{name:'내 머리의 속마음 듣기'}).click();
 for(let i=0;i<8;i++){await p.locator('.options>button').first().click();await p.waitForTimeout(200);}
 await p.getByRole('heading',{name:'줍줍이',exact:true}).waitFor();await p.evaluate(()=>document.fonts.ready);assert.ok(await p.locator('.brand-visible').isVisible());
 const dl=p.waitForEvent('download');await p.getByRole('button',{name:'결과 이미지 저장',exact:true}).click();await (await dl).saveAs('test-results/download.png');
 await p.getByRole('button',{name:'친구 눈에는 내가 어떤 헤어몽일까?',exact:true}).click();await p.getByText('아직 친구들의 선택이 없어요.').waitFor();
 const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('hair-ego-results-v2'))[0]);const b=await browser.newContext(),f=await b.newPage();await f.goto(origin+'/hair-mong/friend/'+saved.publicToken);await f.locator('.friend-grid button').first().click();await f.getByRole('button',{name:'묶묶이로 선택하기'}).click();await f.getByRole('heading',{name:/선택 완료/}).waitFor();
 await p.reload();await p.getByText('취향은 패션위크, 현실은 머리끈.').waitFor();for(const width of [320,390,480]){await p.setViewportSize({width,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 const tied=await browser.newContext();const t=await tied.newPage();await t.goto(origin+'/hair-mong');
 await t.evaluate(()=>sessionStorage.setItem('hair-ego-session-v2',JSON.stringify({answers:{Q01:0,Q02:0,Q03:0,Q04:0,Q05:0,Q06:2,Q07:0,Q08:3},step:7,screen:'quiz'})));await t.reload();await t.locator('.options>button').nth(3).click();await t.getByRole('heading',{name:'복구요정',exact:true}).waitFor();assert.equal(await t.getByText('더 나 같은 애는?').count(),0);
 await t.evaluate(()=>sessionStorage.setItem('hair-ego-session-v2',JSON.stringify({answers:{Q01:0,Q02:0,Q03:0,Q04:0,Q05:0,Q06:2,Q07:0,Q08:3},step:7,screen:'tie'})));await t.reload();await t.getByRole('heading',{name:'복구요정',exact:true}).waitFor();await tied.close();
 console.log('PASS standalone /hair-mong, download, PostgreSQL friend vote, refresh, mobile widths');
}finally{await browser.close();await new Promise(r=>server.close(r));await pg.close();}
