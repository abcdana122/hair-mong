import {readFile,mkdir,writeFile} from 'node:fs/promises';
const data=JSON.parse(await readFile('hair-mong/src/content.json','utf8'));
const html=await readFile('dist/hair-mong/index.html','utf8');
const origin=(process.env.SITE_URL||'https://abcdana.com').replace(/\/$/,'');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
for(const c of data.characters){
 const dir=`dist/hair-mong/share/${c.slug}`;await mkdir(dir,{recursive:true});
 const meta=`<meta property="og:title" content="내 헤어몽은 ${c.name}"><meta property="og:description" content="${esc(c.one_liner)}"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image">${origin?`<meta property="og:url" content="${origin}/hair-mong/share/${c.slug}/"><meta property="og:image" content="${origin}/hair-mong/og/${c.slug}.png"><meta name="twitter:image" content="${origin}/hair-mong/og/${c.slug}.png">`:''}`;
 await writeFile(`${dir}/index.html`,html.replace('</head>',`${meta}</head>`).replace('<title>내 머릿속에 사는 헤어몽은? · HairTwin</title>',`<title>${c.name} · 헤어몽 테스트</title>`));
}
await mkdir('dist/hair-mong',{recursive:true});await writeFile('dist/hair-mong/index.html',html);
console.log(`8 static share pages generated. ${origin?'Absolute OG URLs configured.':'Set SITE_URL at build time for absolute OG image URLs.'}`);
