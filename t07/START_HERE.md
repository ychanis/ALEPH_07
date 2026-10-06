# 과제 7 시작하기

1. https://pds-diary-yc.ksyji123.chatgpt.site 를 엽니다.
2. ‘처음 오셨나요? 가입하기’에서 본인이 정한 아이디·비밀번호로 가입하고 로그인합니다. 비밀번호는 AI나 제출란에 보내지 않습니다.
3. 계정 설정 → 과제 6 소유자 계정 확인 → 본인의 ChatGPT 계정으로 확인 → 계정 설정으로 돌아와 ‘확인한 기존 기록 연결하기’를 누릅니다.
4. 기존 다이어리에서 과제 6 자료가 이어졌는지 확인합니다.
5. 상단 ‘과제 7 · 5일 기록’에서 질문과 계획 규칙을 고정하고 실제 오늘 학습 기록을 남깁니다.
6. 서로 다른 서울 날짜에 2일차 기록을 남긴 뒤, 3일차 기록 전에 계획 규칙 하나를 변경합니다.
7. 5일차까지 기록한 뒤 내보내기, 합계·평균 직접 계산, 설명서 ⑤와 제출문 판단을 작성합니다.

오늘 2026-10-06 시작하면 가장 빠른 5일차는 2026-10-10입니다. 시작이 늦어지면 완료 날짜도 늦어집니다. 테스트 기록을 실제 날짜 기록으로 사용하지 않습니다.

## GitHub에 올리기 — Git 이력 유지

GitHub에서 ychanis/ALEPH_07 공개 저장소를 새로 만듭니다. README·license·gitignore를 추가하지 않은 빈 저장소로 만듭니다.

다운로드 ZIP을 Downloads에서 풀어 ALEPH_07_upload 폴더가 생기면 Git Bash에서 다음을 실행합니다.

```bash
cd ~/Downloads/ALEPH_07_upload
git clone -b main ALEPH_07.bundle ALEPH_07
cd ALEPH_07
git remote set-url origin https://github.com/ychanis/ALEPH_07.git
git push -u origin main
git merge-base --is-ancestor 42000913e5c7618ee1952557bf9a899d5a7bf058 HEAD
git rev-parse HEAD
```

`merge-base`는 성공하면 별도 문구 없이 끝납니다. 마지막 full commit을 소스 URL에 넣습니다. 새 git init으로 다시 만들면 T06 조상 이력이 없어지니 bundle로 복제합니다.

GitHub 로그인은 본인 브라우저에서 합니다. 소스 업로드는 배포된 결과물의 개인 자료에 영향을 주지 않습니다.

## 제출 전 남은 것

- 본인 계정 가입, 기존 T06 자료 연결과 확인
- 실제 5일 기록 및 3일차 전 규칙 변경
- 5일차 합계·평균 직접 검산, 전체 JSON 내보내기
- 본인의 판단 3줄 보완
- GitHub ALEPH_07 업로드와 고정 full commit 소스 URL

인증 구현 설명서와 요청·응답 기록은 t07 폴더에 있습니다. 구현된 기능과 실제 완주 여부는 다릅니다.
