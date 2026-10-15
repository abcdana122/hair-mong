import content from './content.json';
export const characters = content.characters;
export const questions: {id:string;kind:string;question:string;helper:string;allow_skip:boolean;step:number;options:{label:string;quote?:string;score_type?:string;survey_value?:string}[]}[] = content.questions.filter(q=>q.kind==='scored').map((q,i)=>({...q,step:i+1}));
export type Character = typeof characters[number];
export type Answers = Record<string, number | null>;
// A full selection is 100 units; all question bonuses together are only 36.
// Thus bonuses can resolve a tie but cannot overturn a one-vote lead.
export const questionBonus:Record<string,number>={Q01:1,Q02:8,Q03:4,Q04:7,Q05:3,Q06:6,Q07:5,Q08:2};
// Final stable fallback: care/detail/practical actions before hypothetical preferences.
export const resultPriority=['bokguyojeong','gakjabi','mukmuki','jamjami','garaeopi','ssakdugi','jupjupi','challangmong'];
export function score(answers: Answers) {
 const scores:Record<string,number>=Object.fromEntries(characters.map(c=>[c.slug,0]));
 const units:Record<string,number>={...scores};
 for(const q of questions){
  const answer=answers[q.id];
  if(answer==null||!Number.isInteger(answer))continue;
  const slug=q.options[answer]?.score_type;
  if(slug&&slug in scores){scores[slug]++;units[slug]+=100+questionBonus[q.id];}
 }
 const ranked=characters.filter(c=>scores[c.slug]>0).sort((a,b)=>units[b.slug]-units[a.slug]||resultPriority.indexOf(a.slug)-resultPriority.indexOf(b.slug));
 const adjustedScores=Object.fromEntries(characters.map(c=>[c.slug,units[c.slug]/100]));
 return {scores,adjustedScores,candidates:ranked.slice(0,1)};
}
export function complete(answers: Answers) {return questions.filter(q => q.kind === 'scored').every(q => Number.isInteger(answers[q.id]) && Number(answers[q.id]) >= 0 && Number(answers[q.id]) < 4);}
export function getCharacter(slug: string) {return characters.find(c => c.slug === slug);}
