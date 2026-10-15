import {createServer} from 'node:http';
import {readFile,mkdir,copyFile} from 'node:fs/promises';
import {existsSync,statSync,readFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {chromium} from 'playwright';
const root=resolve('dist'),origin='http://127.0.0.1:5188';
const server=createServer((req,res)=>{let file=resolve(root,'.'+new URL(req.url,origin).pathname);if(!file.startsWith(root+sep)){res.writeHead(404);return res.end();}if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');if(!existsSync(file)){res.writeHead(404);return res.end();}const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf'};res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(readFileSync(file));});
await new Promise(r=>server.listen(5188,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
try{
 const page=await browser.newPage({viewport:{width:480,height:1000},deviceScaleFactor:3});
 const {characters}=JSON.parse(await readFile('hair-mong/src/content.json','utf8'));
 await mkdir('hair-mong/public/og',{recursive:true});
 for(const c of characters){await page.goto(`${origin}/hair-mong/share/${c.slug}/`);await page.getByRole('heading',{name:c.name,exact:true}).waitFor();await page.evaluate(async()=>{await document.fonts.ready;for(const f of ['Hippie','Kyobo Hand','Rising Chai','Gmarket Sans'])if(!document.fonts.check(`400 18px "${f}"`))throw Error('Missing font '+f);});await page.locator('.receipt .mascot img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));await page.locator('.receipt').screenshot({path:`hair-mong/public/og/${c.slug}.png`});await copyFile(`hair-mong/public/og/${c.slug}.png`,`dist/hair-mong/og/${c.slug}.png`);}
 await mkdir('test-results',{recursive:true});await page.setViewportSize({width:1000,height:950});await page.goto(origin+'/hair-mong/character-preview.html');await page.locator('article img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));await page.screenshot({path:'test-results/characters-v2.png',fullPage:true});
 console.log('PASS: 8 result cards rendered at 3x resolution with all custom fonts.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
