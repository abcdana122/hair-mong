export function database(query){return {prepare(statement){
 let n=0;let sql=statement.replace(/\?/g,()=>`$${++n}`).replace(/\b(results|votes|events)\b/g,'hair_mong.$1');
 if(sql.startsWith('INSERT OR IGNORE'))sql=sql.replace('INSERT OR IGNORE','INSERT')+' ON CONFLICT DO NOTHING';
 const execute=async args=>{const result=await query(sql,args);return {...result,rows:result.rows.map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[key,['count','created_at','expires_at','updated_at'].includes(key)?Number(value):value])))};};
 return {get:async(...args)=>(await execute(args)).rows[0],all:async(...args)=>(await execute(args)).rows,run:async(...args)=>({changes:(await execute(args)).rowCount})};
}};}
