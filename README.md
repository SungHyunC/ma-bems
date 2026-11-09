# MA-BEMS · 멀티에이전트 건물 에너지 관리 대시보드

**라이브 사이트: https://sunghyunc.github.io/ma-bems/**

6개 에이전트(코디네이터·HVAC·조명·태양광·ESS·EV 충전)가 15분마다 관찰→계획→협상→실행→검증을 반복하며
가상 캠퍼스(Helio Campus)의 피크·요금·쾌적을 함께 관리합니다. 같은 날씨로 룰 기반 BMS를 나란히 돌려
절감 효과를 비교하고, 수요 예측·센서 고장 감지(FDD)·검증 근거 탭을 함께 보여 줍니다.
2026학년도 2학기 기업연계형 캡스톤디자인 출품작입니다.

## 구성

```
방문자 브라우저 ──HTTPS──> GitHub Pages (이 저장소의 public/)        시뮬레이션·에이전트·예측·FDD: 브라우저에서 실행
       │
       └─ AI 비서 탭 ──HTTPS + 접근 키──> Cloudflare Tunnel ──> 운영자 PC 게이트웨이 ──> 로컬 LLM (Ollama · Qwen3-8B)
                                                               (키 검사 · CORS · 속도 제한)    └─ 관리자 키만: Claude
```

- **정적 프런트엔드**: `public/index.html` 한 파일과 데이터 CSV. 서버 없이 브라우저에서 모두 돕니다.
- **AI 비서**: 운영자 PC의 게이트웨이를 Cloudflare Tunnel로 공개합니다. 포트 개방·고정 IP가 필요 없고,
  게이트웨이는 파일을 하나도 내주지 않으며 API만 응답합니다. 모든 호출에 운영자가 발급한 접근 키가 필요합니다.
  게이트웨이 주소는 `public/config.json`에 있고, 운영자 PC가 터널을 열 때마다 자동으로 갱신됩니다.
- **배포 파이프라인**: `main`에 푸시하면 GitHub Actions가 검사(페이지 스크립트 문법, config 형식, 비밀값 스캔)를
  통과한 경우에만 GitHub Pages로 배포합니다 (`.github/workflows/deploy.yml`).

## AI 비서 쓰는 법

운영자에게 받은 접근 키를 AI 탭에 넣거나, 키가 담긴 공유 링크(`…/ma-bems/#key=…`)로 들어오면 됩니다.
키는 그 브라우저에만 저장되고 주소창에서는 바로 지워집니다. 운영자 PC가 꺼져 있으면 AI 탭은 "꺼짐"으로 표시되고,
나머지 기능은 그대로 동작합니다.

## 한계

- 절감률 등 성능 수치는 시뮬레이션 기준입니다(계량 데이터 보정 전).
- AI 비서는 운영자 PC가 켜져 있을 때만 동작합니다. 지금 터널은 계정 없는 Cloudflare Quick Tunnel이라
  주소가 실행마다 바뀌고 응답이 한 번에 도착합니다(스트리밍 없음). 상시 운영이라면 자체 도메인과
  Cloudflare 계정의 이름 있는 터널로 바꾸면 되고, 이때는 `config.json`의 주소만 달라집니다.

## 데이터 출처

`public/data/` — Building Data Genome 2 (BDG2), CC BY 4.0. 자세한 내용은 `public/data/README.md`.
