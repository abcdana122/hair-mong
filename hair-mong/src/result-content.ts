import {getCharacter} from './logic';
export type ResultCopy={headline:string;keywords:string[];behaviors:string[];self:string;seen:string};
export const resultCopy:Record<string,ResultCopy>={
 mukmuki:{headline:'예쁘게 풀고 다니려고 길렀는데 결국 또 묶음.',keywords:['머리끈 필수','편한 게 최고','현실파'],behaviors:['손목에 머리끈이 없으면 뭔가 허전하다.','머리를 풀고 나가도 어느새 다시 묶고 있다.','새 머리를 고를 때도 묶이는 길이인지 먼저 본다.'],self:'편해야 오래 예쁘다고 생각하는 나',seen:'늘 머리를 야무지게 묶고 다니는 친구'},
 jamjami:{headline:'드라이할 10분이면 10분 더 잘 수 있는데?',keywords:['잠이 먼저','최소한의 손질','편안함'],behaviors:['알람을 미룬 만큼 머리 손질 시간도 줄어든다.','고데기보다 모자를 자주 집는다.','감고 말리기만 해도 되는 머리를 찾는다.'],self:'아침의 10분을 잠에 쓰고 싶은 나',seen:'머리보다 잠을 소중히 여기는 친구'},
 jupjupi:{headline:'헤어 사진은 100장인데 내 머리는 작년이랑 똑같음.',keywords:['저장 장인','취향 수집','예약은 나중에'],behaviors:['마음에 드는 머리를 보면 일단 저장한다.','미용실 예약 전에 참고 사진부터 늘어난다.','딱 하나 고르려니 모든 사진이 아깝다.'],self:'마음에 드는 스타일을 차곡차곡 모으는 나',seen:'머리 얘기만 나오면 사진부터 보내주는 친구'},
 ssakdugi:{headline:'머리 자를까? 고민한 순간 이미 가위 들었음.',keywords:['일단 실행','앞머리 변화','결정은 빠르게'],behaviors:['갑자기 꽂힌 머리는 오늘 당장 하고 싶다.','앞머리 몇 가닥만 손보려다 범위가 넓어진다.','바꾼 머리가 어색해도 일단 새로워서 좋다.'],self:'생각났을 때 바로 바꾸고 싶은 나',seen:'어느 날 갑자기 새 머리로 나타나는 친구'},
 gakjabi:{headline:'바람 불면 내 하루도 같이 무너짐.',keywords:['앞머리 1mm','세팅에 진심','디테일'],behaviors:['집을 나서기 전에 거울을 한 번 더 본다.','앞머리가 마음에 안 들면 계속 손이 간다.','좋다는 도구도 사용법부터 꼼꼼히 살핀다.'],self:'작은 차이까지 맞춰야 마음이 놓이는 나',seen:'언제 만나도 머리를 꼼꼼히 손질한 친구'},
 challangmong:{headline:'현실의 머리보다 상상 속 내 머리가 더 익숙함.',keywords:['헤어 광고 주인공','상상력','이상적인 머리'],behaviors:['사진 속 머리를 한 내 모습을 먼저 상상한다.','샴푸 광고를 보면 괜히 머리를 쓸어 넘긴다.','아침 손질 시간과 원하는 머리 사이에 차이가 있다.'],self:'머릿속에서는 이미 헤어 광고를 찍는 나',seen:'하고 싶은 머리 얘기에 눈이 반짝이는 친구'},
 bokguyojeong:{headline:'트리트먼트만큼은 누구보다 진심.',keywords:['머릿결 우선','관리 루틴','신중파'],behaviors:['새로운 시술이 끌려도 머릿결부터 생각한다.','욕실에서 트리트먼트는 좀처럼 빠지지 않는다.','제품을 고를 때 머릿결 관리에 도움이 될지 본다.'],self:'바꾸기 전에 머릿결부터 챙기는 나',seen:'머릿결 관리법을 물어보고 싶은 친구'},
 garaeopi:{headline:'머리가 익숙해지면 바꾸고 싶어짐.',keywords:['변신은 일상','새로운 색','다음 스타일'],behaviors:['머리를 바꾸고 나서도 다음 머리를 구경한다.','새로운 색이나 스타일을 보면 해보고 싶다.','예전 사진을 보면 머리로 시기를 구분한다.'],self:'익숙해질 때쯤 새 스타일이 궁금해지는 나',seen:'만날 때마다 머리가 조금씩 달라지는 친구'},
};
const same:Record<string,[string,string]>={
 mukmuki:['나도 친구도 인정한 머리끈 동맹.','풀고 나간 날보다 묶고 돌아온 날이 더 익숙한 우리.'],
 jamjami:['자기 객관화까지 완벽한 잠잠이.','나도 알고, 친구들도 아는 나의 확고한 수면 우선주의.'],
 jupjupi:['저장 폴더의 존재감은 숨길 수 없다.','내 취향 수집력은 친구들 사이에서도 이미 유명한가 봐.'],
 ssakdugi:['실행력만큼은 모두가 인정.','바꾸고 싶다는 말과 새 머리 사이가 짧다는 걸 친구들도 안다.'],
 gakjabi:['그 1mm, 친구들도 알아봤다.','내가 공들인 머리를 친구들도 기억하고 있었네.'],
 challangmong:['내 상상 속 헤어 광고, 친구도 시청 중.','하고 싶은 머리를 말할 때의 내 표정이 다 들켰나 봐.'],
 bokguyojeong:['머릿결에 진심인 건 숨길 수 없다.','내가 챙기는 관리 습관을 친구들도 알아봤다.'],
 garaeopi:['다음 머리 예고편을 기다리는 친구들.','새로운 머리에 신나는 건 나도 알고 친구들도 아는 사실.'],
};
const special:Record<string,[string,string]>={
 'jupjupi:mukmuki':['취향은 패션위크, 현실은 머리끈.','나는 새 헤어스타일 사진을 모으지만, 친구들 기억 속 나는 늘 머리를 묶고 있음.'],
 'challangmong:jamjami':['머릿속은 헤어 광고, 아침엔 알람 연장.','나는 찰랑이는 머리를 꿈꾸고, 친구들은 잠을 더 자고 싶어 하는 내 모습을 기억하네.'],
 'gakjabi:jamjami':['힘준 날의 나와 힘 뺀 날의 나.','내 기준은 앞머리 1mm인데, 친구들에겐 편안한 모습이 더 익숙한가 봐.'],
 'bokguyojeong:garaeopi':['변신 뒤에는 꼼꼼한 관리가 있다.','친구들은 바뀐 머리를 보고, 나는 그 머리를 챙기는 데 더 마음을 쓰는 중.'],
 'jamjami:gakjabi':['잠은 더 자고 싶지만 티는 안 났네.','나는 손질 시간을 아끼는데, 친구들은 꽤 공들인 머리로 보고 있나 봐.'],
 'garaeopi:jupjupi':['다음 변신의 예고편이 너무 많았나?','나는 바꾸는 게 좋은데, 친구들은 내가 보내준 머리 사진을 먼저 떠올렸네.'],
};
export function comparison(mine:string,friend:string){
 const a=getCharacter(mine),b=getCharacter(friend);if(!a||!b)return null;
 const custom=mine===friend?same[mine]:special[`${mine}:${friend}`];
 return {title:custom?.[0]||`${a.name}인 줄 알았는데, 친구 눈엔 ${b.name}.`,description:custom?.[1]||`${resultCopy[mine].self}. 친구들에겐 ${resultCopy[friend].seen}로 보였나 봐.`};
}
