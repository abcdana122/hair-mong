import {readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import {chromium} from 'playwright';

// Preserve original generated PNGs; create smaller transparent WebP files for the quiz.
const dir='hair-mong/public/questions/v3';
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
try{
 const page=await browser.newPage();
 for(const name of readdirSync(dir).filter(n=>n.endsWith('.png'))){
  const data='data:image/png;base64,'+readFileSync(`${dir}/${name}`).toString('base64');
  const webp=await page.evaluate(async src=>{const img=new Image();img.src=src;await img.decode();const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=Math.round(img.height/img.width*1000);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/webp',.88);},data);
  if(!webp.startsWith('data:image/webp;'))throw new Error('WebP encoding unavailable');
  const target=`${dir}/${name.replace('.png','.webp')}`;
  writeFileSync(target,Buffer.from(webp.split(',')[1],'base64'));
  console.log(name,Math.round(statSync(target).size/1024)+' KB');
 }
}finally{await browser.close();}
