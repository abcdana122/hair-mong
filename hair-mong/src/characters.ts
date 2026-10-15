import type { Character } from './logic';
export function characterSvg(c: Character) {
 const color=c.colors.split(' / ')[0];
 const forms: Record<string,string>={
 mukmuki:'<path d="M66 158C34 120 45 44 78 41C103 40 79 94 91 117C104 89 84 29 113 26C146 26 122 91 133 118C144 90 145 45 165 54C196 69 166 131 158 161Z"/><ellipse cx="112" cy="138" rx="55" ry="24" fill="#bd789d"/><path d="M75 149L66 187M107 160L106 192M144 151L158 184"/>',
 jamjami:'<path d="M48 117C21 81 58 71 76 78C76 43 116 51 128 67C158 45 178 71 173 92C212 97 199 144 174 153C138 177 72 169 48 146Q32 137 48 117Z"/><path d="M63 78Q73 18 159 43L177 81L129 66Z" fill="#7b9dcc"/><circle cx="177" cy="81" r="11" fill="#fff9ec"/><path d="M95 84Q108 62 118 82" fill="none"/>',
 jupjupi:'<path d="M36 74L82 56L111 141L61 159Z" fill="#fff9ec"/><path d="M142 48L191 64L169 158L128 139Z" fill="#fff9ec"/><rect x="62" y="65" width="108" height="114" rx="13"/><path d="M78 65V179M97 59V39H139V60" fill="none"/><path d="M142 83L155 83L155 100L142 100Z" fill="#fff9ec"/>',
 ssakdugi:'<path d="M36 157Q55 117 72 71Q87 33 116 48Q142 23 166 67L192 141L161 134L143 167L112 145L86 182L61 151Z"/><path d="M74 83L89 67M138 62L153 82" fill="none"/>',
 gakjabi:'<path d="M58 173V51Q58 38 68 38Q76 38 76 51V78H85V39Q85 26 95 26Q103 26 103 39V78H113V36Q113 23 123 23Q131 23 131 36V78H141V45Q141 32 151 32Q159 32 159 45V78H169V173Z"/><path d="M80 97L98 93M130 93L148 97" fill="none"/>',
 challangmong:'<path d="M156 33C67 13 24 84 86 106C153 129 148 166 65 183C165 212 220 125 140 99C86 80 111 48 156 33Z"/><path d="M181 32L185 45L200 49L185 54L181 69L176 54L162 49L176 44Z" fill="#fff9ec"/>',
 bokguyojeong:'<rect x="88" y="32" width="49" height="32" rx="9" fill="#fff9ec"/><path d="M81 68H144L155 84Q192 91 184 135Q186 184 113 184Q40 181 42 132Q34 89 71 83Z"/><path d="M54 142Q108 192 173 145M54 154Q108 198 170 159" fill="none"/><path d="M106 21H143V33H107Z"/>',
 garaeopi:'<path d="M48 73Q101 30 163 61Q200 82 181 143Q160 181 73 165Q34 144 48 73Z"/><path d="M112 54Q152 109 114 170Q198 176 184 99Q180 57 112 54Z" fill="#bda8d8"/><ellipse cx="65" cy="113" rx="22" ry="46" fill="#fff0e4"/><path d="M61 93Q80 114 59 137M163 151Q206 165 204 120" fill="none"/>'
 };
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 220"><g fill="${color}" stroke="#393441" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${forms[c.slug]}<path d="M87 181L82 194L69 194M143 181L149 194L162 194" fill="none"/></g><g fill="#393441"><ellipse cx="98" cy="116" rx="3.5" ry="5"/><ellipse cx="130" cy="116" rx="3.5" ry="5"/></g><path d="M108 132Q115 136 121 130" fill="none" stroke="#393441" stroke-width="3" stroke-linecap="round"/></svg>`;
}
