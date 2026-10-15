# 헤어몽 독립 Vercel 배포

이 폴더가 **새 GitHub 저장소의 루트**입니다. 포트폴리오 코드는 포함하지 않습니다.
방문자는 `https://abcdana.com/hair-mong`을 사용하고, 앱은 별도 Vercel 프로젝트에서 실행됩니다.

## 1. Supabase 준비

Supabase SQL Editor에서 `server/hair-mong-schema.sql`을 실행하세요.
`hair_mong` 전용 스키마를 생성하며 public Data API에 테이블을 노출하지 않습니다.
Connect → Transaction pooler 연결 URI를 복사하고 DB 비밀번호를 채우세요. 비밀번호 특수문자는 URL 인코딩해야 합니다.

## 2. 새 Vercel 프로젝트

이 폴더 내용을 새 GitHub 저장소에 올립니다. `node_modules`, `dist`, `.env`는 올리지 않습니다.
Vercel → Add New → Project → 새 저장소 Import:

| 항목 | 값 |
|---|---|
| Root Directory | 저장소 루트 (`.`) |
| Framework Preset | Other (`vercel.json` 설정 사용) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` |
| Node.js | 22.x 또는 24.x |

환경변수:
- `DATABASE_URL`: Supabase Transaction pooler URI. 서버 전용이며 VITE_ 접두사를 붙이지 않습니다.
- `SITE_URL`: `https://abcdana.com`. `/hair-mong` 경로를 붙이지 않습니다.
- `ADMIN_KEY`: 운영 집계를 조회할 때만 필요한 임의의 긴 비밀 값(선택).

먼저 별도 Preview 주소에서 직접 투표를 검증하려면 그 환경의 SITE_URL을 해당 Preview origin으로 지정하세요.
Production의 SITE_URL은 abcdana.com이어야 합니다. 보안상 다른 origin에서 투표 생성 요청은 거부됩니다.
배포된 프로젝트의 **고정 Production 도메인** `프로젝트명.vercel.app`을 확인합니다. 매번 바뀌는 배포별 주소는 쓰지 않습니다.

## 3. 기존 abcdana.com 연결

이 폴더에서 실행:

```sh
npm run proxy:config -- https://실제프로젝트명.vercel.app
```

`abcdana.vercel.json`이 생성됩니다. 기존 abcdana 저장소에 vercel.json이 있으면:

```sh
npm run proxy:config -- https://실제프로젝트명.vercel.app 기존-vercel.json의-경로
```

기존 설정을 보존한 파일을 생성합니다. 결과를 확인한 뒤 **기존 abcdana 저장소의 vercel.json**에 반영하고 해당 프로젝트를 재배포하세요.
프록시 규칙은 `/hair-mong`, `/hair-mong/*`, `/api/hair-mong/*` 세 경로를 전달합니다.
`abcdana.com` 도메인은 기존 포트폴리오 프로젝트에 그대로 둡니다. 새 프로젝트로 이동하지 않습니다.
새 프로젝트의 Production URL은 프록시에서 인증 없이 접근할 수 있어야 합니다. 비공개 Deployment Protection으로 막혀 있으면 연결되지 않습니다.

## 4. 공개 전 확인

- abcdana.com의 포트폴리오가 그대로 열리는지
- abcdana.com/hair-mong에서 질문, 결과, 폰트와 이미지가 정상인지
- 이미지 저장 후 글자·그림이 화면과 동일한지
- 다른 브라우저로 친구 링크를 열어 투표하고 원래 브라우저에서 집계가 바뀌는지
- 친구 링크 새로고침, 다시 하기, 링크 삭제가 정상인지
- 휴대전화와 인앱 브라우저의 실제 다운로드 확인

## 로컬 검증

```sh
npm ci
npm run build
npm test
npx playwright install chromium
npm run test:browser
```

`npm test`는 로컬 PostgreSQL 호환 엔진(PGlite)을 이용합니다. 실제 Supabase 계정에는 접속하지 않습니다.
Windows에 Edge가 있다면 환경변수 `BROWSER_CHANNEL=msedge`로 브라우저 테스트를 실행할 수 있습니다.
`npm run dev`는 화면 작업용이며 Vercel 투표 API를 실행하지 않습니다.

## 수정 및 데이터

앱 소스: `hair-mong/src`, 에셋: `hair-mong/public`, Vercel API: `api`, DB 로직: `server`.
저장 PNG는 실제 결과 카드에서 미리 생성한 3배 해상도 이미지입니다. UI·문구를 변경했다면 이 프로젝트에서 `npm run build` → `npm run render:cards`를 실행하고 갱신된 `hair-mong/public/og`를 함께 GitHub에 올리세요.
로컬 SQLite 개발 투표는 공개 Supabase로 자동 이전하지 않습니다. 서버에서 링크와 이벤트를 90일 기준으로 정리합니다.

이 패키지는 로컬 빌드와 PostgreSQL 호환 기능 테스트를 위한 것입니다. 실제 Supabase 접속·Vercel 라우팅·공개 도메인 검증은 환경변수와 프록시 연결 후 별도로 완료해야 합니다.


## 현재 연결 주소

공개 주소: https://www.abcdana.com/hair-mong
Vercel 원본: https://hair-mong.vercel.app/hair-mong
Supabase TLS 연결에는 server/certs/supabase-ca.crt의 공식 CA를 사용하며 인증서·호스트 검증을 유지합니다. DATABASE_URL의 SSL 쿼리 옵션은 명시적인 안전 설정을 덮어쓰지 않도록 제거합니다.


## 자동 결과와 캐릭터 v2

동점 선택 화면을 없애고 응답 수 → 문항 가중치 → 고정 우선순위로 단일 결과를 확정합니다. 규칙은 SCORING.md, 전수 검사는 npm run test:scoring을 참조하세요.
8종 입체 캐릭터는 hair-mong/public/characters/v2에 있습니다. 원본 SVG는 보존합니다. 생성 프롬프트와 분위기 참고 출처는 design/character-generation-v2.json에 기록했습니다. 캐릭터 모음은 /hair-mong/character-preview.html에서 볼 수 있습니다. UI 또는 캐릭터 변경 후 npm run render:cards로 저장 이미지를 갱신하세요.
