import content from './content.json';
export const characters = content.characters;
export const questions: {id:string;kind:string;question:string;helper:string;allow_skip:boolean;step:number;options:{label:string;quote?:string;score_type?:string;survey_value?:string}[]}[] = content.questions.filter(q=>q.kind==='scored').map((q,i)=>({...q,step:i+1}));
export type Character = typeof characters[number];
export type Answers = Record<string, number | null>;
export function score(answers: Answers) {
  const scores: Record<string, number> = Object.fromEntries(characters.map(c => [c.slug, 0]));
  for (const q of questions) {
    const a = answers[q.id];
    if(q.kind !== 'scored' || a == null || !Number.isInteger(a)) continue;
    const slug = q.options[a]?.score_type;
    if(slug && slug in scores) scores[slug]++;
  }
  const max = Math.max(...Object.values(scores));
  return { scores, candidates: max ? characters.filter(c => scores[c.slug] === max) : [] };
}
export function complete(answers: Answers) {return questions.filter(q => q.kind === 'scored').every(q => Number.isInteger(answers[q.id]) && Number(answers[q.id]) >= 0 && Number(answers[q.id]) < 4);}
export function getCharacter(slug: string) {return characters.find(c => c.slug === slug);}
