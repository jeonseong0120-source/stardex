# Stardex 작업 컨텍스트

이 파일은 다음 작업자가 프로젝트의 현재 상태와 작업 규칙을 빠르게 복구하기 위한 기록이다. 기능을 추가하거나 중요한 버그를 수정할 때마다 아래 내용을 갱신한다.

## 프로젝트

- Next/Vinext 기반 Cloudflare Workers 앱
- 로컬 개발 주소: `http://localhost:5173`
- 기본 브랜치: `main`
- 카드 데이터: `components/packs/moe-cards.ts`
- 카드 상세 회전/뒤집기 뷰어: `app/gallery-enhancer.tsx`
- 메인 화면: `app/page.tsx`
- 전역 스타일: `app/globals.css`, 랜딩 스타일: `app/landing-hero.css`

## 현재 상태 (2026-09-24)

- Moe 카드 157–186번 30장을 추가했다.
- 이미지 파일은 `public/cards/moe-*.png`에 저장되어 있다.
- 신규 카드의 이름, 희귀도, 번호, 영문명, 아트워크를 `MOE_CARDS`에 등록했다.
- 동일한 번호를 `app/gallery-enhancer.tsx`의 `cardMap`에 등록해 카드 상세 회전/뒤집기 뷰어에서 사용할 수 있다.
- 나인테일 암수 카드의 아트워크 매핑 오류를 수정했다. 여성 098은 `moe-ninetales-f-sr.png`, 남성 099는 `moe-ninetales-m-sr.png`다.
- 상단 네비게이션에 로그인 버튼을 통합했고, 랜딩 페이지는 라벤더/화이트 아이보리 테마를 유지한다.
- `npm run build`가 통과한 상태다.

## 작업 규칙

- 기존 카드/뷰어 컴포넌트를 우선 재사용한다. 카드 추가 시 데이터 배열과 `cardMap` 숫자 매핑을 함께 갱신한다.
- 카드 번호와 사용자가 요청한 순서를 먼저 대조하고, 아트워크 파일명까지 확인한다.
- 변경 후 `npm run build`를 실행한다.
- 인증 키나 로컬 비밀값이 들어 있는 `.dev.vars`는 커밋하지 않는다.
- 작업 완료 시 이 파일의 `현재 상태`와 검증 명령을 갱신한다.

## 검증

```bash
npm run build
```
