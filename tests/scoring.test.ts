import {test} from 'node:test';
import assert from 'node:assert/strict';
import {characters,questions,score,complete,getCharacter} from '../hair-mong/src/logic';
test('8 unique characters and correct question order',()=>{assert.equal(new Set(characters.map(c=>c.slug)).size,8);assert.deepEqual(questions.map(q=>q.id),['Q01','Q02','Q03','Q04','Q05','Q06','Q07','Q08']);assert.ok(questions.every(q=>q.options.length===4));});
test('32 mappings valid; every character occurs exactly four times',()=>{const counts=Object.fromEntries(characters.map(c=>[c.slug,0]));for(const q of questions.filter(q=>q.kind==='scored'))for(const o of q.options){assert.ok(o.score_type&&getCharacter(o.score_type));counts[o.score_type!]++;}assert.deepEqual(Object.values(counts),Array(8).fill(4));});
const a={Q01:0,Q02:0,Q03:0,Q04:0,Q05:0,Q06:0,Q07:0,Q08:0};
test('known scores, complete validation, invalid input',()=>{assert.deepEqual(score(a).scores,{mukmuki:1,jamjami:0,jupjupi:3,ssakdugi:1,gakjabi:1,challangmong:0,bokguyojeong:1,garaeopi:1});assert.ok(complete(a));assert.equal(complete({}),false);assert.equal(score({Q01:99}).candidates.length,0);});
test('surveys never affect results',()=>{assert.deepEqual(score({...a,S01:0,S02:3}),score({...a,S01:null,S02:null}));});
test('edits replace old answer',()=>{const edited=score({...a,Q01:3});assert.equal(edited.scores.jupjupi,2);assert.equal(edited.scores.jamjami,1);assert.equal(Object.values(edited.scores).reduce((x,y)=>x+y),8);});
test('tied votes resolve automatically using the more behavioral question',()=>{const r=score({Q01:0,Q02:0});assert.equal(r.candidates.length,1);assert.equal(r.candidates[0].slug,'mukmuki');});
test('every character reachable as unique winner',()=>{for(const c of characters){const answer:Record<string,number>={};for(const q of questions.filter(q=>q.kind==='scored')){const i=q.options.findIndex(o=>o.score_type===c.slug);answer[q.id]=i<0?0:i;}assert.equal(score(answer).candidates[0].slug,c.slug);assert.equal(score(answer).candidates.length,1);}});
test('all sharing slugs valid; unknown rejected',()=>{characters.forEach(c=>assert.ok(getCharacter(c.slug)));assert.equal(getCharacter('bad'),undefined);});

test('all 65,536 complete answer combinations yield exactly one reachable deterministic winner',()=>{
 const winners=new Set<string>();
 for(let n=0;n<65536;n++){
  let code=n;const answer:Record<string,number>={};for(const q of questions){answer[q.id]=code%4;code=Math.floor(code/4);}
  const r=score(answer);assert.equal(r.candidates.length,1);const winner=r.candidates[0].slug;winners.add(winner);
  assert.equal(r.scores[winner],Math.max(...Object.values(r.scores)));
  assert.equal(score({...answer}).candidates[0].slug,winner);
 }
 assert.equal(winners.size,8);
});

test('equal weighted scores use the documented stable priority',()=>{const r=score({Q01:0,Q02:0,Q03:0,Q04:0,Q05:0,Q06:2,Q07:0,Q08:3});assert.equal(r.adjustedScores.ssakdugi,r.adjustedScores.bokguyojeong);assert.equal(r.candidates[0].slug,'bokguyojeong');});
