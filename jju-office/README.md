# 쭈대표 AI 오피스

쭈대표님 전용 모바일·PC 통합 관제 웹앱(PWA)입니다. 본폰 1대와 서브폰 3대에서 움직이는 비서 4인방(총괄이사 · 쭈1 · 쭈2 · 쭈3)을 한 화면에서 지휘합니다.

- 주소: https://juhwan7812-dot.github.io/jju-office/
- 설치: 안드로이드 크롬 `⋮ → 앱 설치` / 아이폰 사파리 `공유 → 홈 화면에 추가`

## 화면

| 탭 | 내용 |
| --- | --- |
| 🏛️ 회의실 | 대회의실(4인방 전원) · 지휘실(대표님–총괄이사 1:1) · 라운지(자유 기록). `+` 로 `@all · @총괄이사 · @쭈1 · @쭈2 · @쭈3` 멘션 삽입 |
| 📊 대시보드 | 오늘의 운영, 대표님 결정 대기, 비서 4인방 상태 |
| 🛒 소싱 | 일일 소싱 4종(등록 행·도착원가·판매가·경쟁가)과 소싱 원칙 |
| 🧵 스레드 | 3채널 오늘 예약 현황과 운영 수칙 |
| 🎬 유튜브 | 1~10회 대본 진행 상황 |
| 📝 메모 | 오늘 할 일 체크리스트 |
| 🤖 비서 | 4인방 역할 카드 |

## 동작 방식

1. **로컬 모드(기본)** — 서버 없이 바로 동작합니다. 회의실 메시지·메모는 그 기기 브라우저(localStorage)에 저장됩니다.
2. **AI 서버 연결(Supabase)** — 우측 상단 `AI 서버` 배지를 눌러 Project URL 과 anon key 를 넣으면 `office_messages` · `office_tasks` 테이블과 동기화됩니다. 4.5초 주기로 주고받으며, 여러 기기에서 같은 회의실을 봅니다.

### Supabase 준비

1. Supabase 프로젝트를 만들고 **SQL Editor** 에서 [`supabase-office-schema.sql`](supabase-office-schema.sql) 을 실행합니다.
2. **Project Settings → API** 의 `Project URL` 과 `anon public` 키를 앱의 `AI 서버` 창에 넣고 **저장**을 누릅니다.
3. `연결 테스트` 로 테이블까지 붙었는지 확인할 수 있습니다.

> anon key 는 앱을 쓰는 기기의 브라우저에만 저장되며 이 저장소에는 들어 있지 않습니다. 스키마는 개인 오피스 기준으로 anon 역할에 읽기·쓰기를 열어 두었으니 키를 외부에 공유하지 마세요.

### 메시지 author 값

`boss`(대표님) · `director`(총괄이사, 본폰) · `jju1`(1번 폰) · `jju2`(2번 폰) · `jju3`(3번 폰). 비서 쪽에서 아래처럼 넣으면 회의실에 바로 뜹니다.

```bash
curl -X POST "$SUPABASE_URL/rest/v1/office_messages" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"room":"grand","author":"jju1","author_name":"쭈1","body":"1번 12:31 발행 완료했습니다."}'
```

`room` 은 `grand`(대회의실) · `command`(지휘실) · `lounge`(라운지) 중 하나입니다.

## 파일

```
index.html                  화면
styles.css                  크림·브라운·골드 테마(라이트/다크)
app.js                      회의실·메모·서버 동기화
manifest.json               PWA 설치 정보
sw.js                       오프라인 캐시
supabase-office-schema.sql  서버 테이블·정책
icons/                      앱 아이콘(192·512·maskable·apple-touch)
scripts/make-icons.py       아이콘 생성 스크립트
```

## 보안

이 저장소는 공개 저장소입니다. 전화번호·이메일·비밀번호·API 키·시트 ID 같은 개인 정보는 넣지 않았습니다. 서버 접속 정보는 각 기기의 브라우저에만 저장됩니다.
