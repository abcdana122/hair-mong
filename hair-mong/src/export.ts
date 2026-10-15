import type {Character} from './logic';
// Rendered from ResultCard at 3x resolution; never rebuild text with separate canvas coordinates.
export async function savePng(c:Character){
 const response=await fetch(`/hair-mong/og/${encodeURIComponent(c.slug)}.png?v=poster-3x-1`);
 if(!response.ok||!response.headers.get('content-type')?.includes('image/png'))throw new Error('Result image unavailable');
 const source=await response.blob(),url=URL.createObjectURL(source);
 try{
  const img=new Image();img.src=url;await img.decode();
  if(img.naturalWidth<1080)throw new Error('Result image resolution is too low');
  const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
  ctx.drawImage(img,0,0);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('PNG failed')),'image/png'));
  const downloadUrl=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=downloadUrl;link.download=`hairmong-${c.slug}.png`;document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(downloadUrl),60000);
 }finally{URL.revokeObjectURL(url);}
}
