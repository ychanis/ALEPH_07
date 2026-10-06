# ALEPH 07 · 플랜두씨 다이어리 2

과제 6의 플랜두씨 다이어리에 가입·로그인·서버 세션과 계정별 자료 접근 제어를 붙였습니다. 공개 첫 화면은 로그인 화면이며, 로그인 뒤에는 해당 계정의 기록만 조회합니다.

**과제는 아직 완주 전입니다.** 실제 계정으로 기록을 연결하고 서로 다른 서울 날짜 5일을 사용해야 합니다. 검증용 계정의 테스트 자료를 실제 사용 기록으로 제출하지 않습니다.

- 결과물: https://pds-diary-yc.ksyji123.chatgpt.site
- T06 고정 소스: https://github.com/ychanis/ALEPH_06/tree/42000913e5c7618ee1952557bf9a899d5a7bf058
- [인증 설명서](t07/AUTH_IMPLEMENTATION.md)
- [실제 요청·응답 기록](t07/evidence-local.json)
- [배포 API 요청·응답 기록](t07/evidence-live.json)
- [처음 시작·GitHub 업로드 안내](t07/START_HERE.md)
- [5일 기록·검산 안내](t07/FIVE_DAYS.md)
- [제출 초안](t07/SUBMISSION_DRAFT.md)

## 기능

가입·로그인·로그아웃, bcryptjs 3.0.3 / 비용 12, HttpOnly·Secure·SameSite 쿠키, 8시간 서버 세션, 로그아웃과 비밀번호 변경에 따른 폐기, 두 계정 간 읽기·수정·삭제 차단, 계정별 JSON 내보내기와 계정·자료 삭제.

기존 계획·할 일·실행·돌아보기는 보존합니다. 과제 6 자료 연결은 소유자의 플랫폼 계정 확인과 앱 로그인이 모두 있어야 가능하며 다른 가입자는 기존 자료를 가져갈 수 없습니다.

5일 기록에는 서버 서울 날짜, 하루 한 건, 고정 지표·단위·계산 규칙, 2일차 뒤·3일차 전 계획 규칙 변경 한 번, 변경 시각·이유·참조 ID, 합계·평균과 전후 비교가 포함됩니다.

## 실행·확인

Node 24 이상 사용. 의존성은 고정 pnpm lockfile 기준으로 설치합니다.

```bash
npm run install:ci
node t07/run-checks.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

로컬 58항목과 배포 API 45항목이 통과했습니다. 자동 확인은 실제 API 코드에 HTTP 요청을 보내고 메모리 SQLite로 D1 동작을 대체합니다. 운영 Cloudflare 환경의 확인과 구분합니다. 테스트는 임시 계정을 생성하고 비밀번호와 세션값을 가린 JSON을 기록합니다.

Git 이력 확인:

```bash
git merge-base --is-ancestor 42000913e5c7618ee1952557bf9a899d5a7bf058 HEAD
```

종료 코드 0이면 제출 당시 T06 commit이 조상에 포함됩니다. ZIP만 새 git init으로 올리면 이 조건을 잃습니다. 제공하는 Git bundle로 복제해 ALEPH_07에 올립니다.

## 아직 못 막은 것

속도 제한·계정 잠금, 비밀번호 재설정, 이메일 소유 확인, 2단계 인증, 보안 감사 로그·경보는 구현하지 않았습니다. 자세한 위험과 검증 한계는 설명서 ⑥에 기록했습니다. 실제 비밀번호나 세션값을 README·문서·Git에 적지 않습니다.
