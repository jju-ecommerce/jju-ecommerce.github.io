# 쭈대표 AI 오피스

쭈대표님 전용 모바일·PC 통합 관제 웹앱(PWA)입니다. 본폰 1대와 서브폰 3대에서 움직이는 비서 4인방(주드 · 하루 · 다온 · 로이)을 한 화면에서 지휘합니다.

- 주소: https://jju-ecommerce.github.io/jju-office/
- 모바일 미리보기(PC에서 폰 화면 확인): https://jju-ecommerce.github.io/jju-office/preview.html
- 설치: 안드로이드 크롬 `⋮ → 앱 설치` / 아이폰 사파리 `공유 → 홈 화면에 추가`

## 화면

| 탭 | 내용 |
| --- | --- |
| 🗺️ 오피스 맵 | 탑다운 평면도 위 3구역(대회의실·지휘실·라운지) 핫스팟 + 4인방 캐릭터. 캐릭터가 담당 구역을 걸어 다니고(가끔 다른 방으로 외출 후 복귀) 말풍선은 상태 멘트와 최신 보고를 번갈아 보여 줍니다. 구역을 누르면 회의실 탭으로 바로 입장, 캐릭터·말풍선을 누르면 최근 보고 시트 |
| 🏛️ 회의실 | 대회의실(4인방 전원) · 지휘실(대표님–주드 1:1) · 라운지(자유 기록). `+` 로 `@all · @주드 · @하루 · @다온 · @로이` 멘션 삽입 |
| 📊 대시보드 | 오늘의 운영, 대표님 결정 대기, 비서 4인방 상태 |
| 🛒 소싱 | 일일 소싱 4종(등록 행·도착원가·판매가·경쟁가)과 소싱 원칙 |
| 🧵 스레드 | 3채널 오늘 예약 현황과 운영 수칙 |
| 🎬 유튜브 | 1~10회 대본 진행 상황 |
| ✍️ 블로그 | 도매에빠지다 네이버 블로그 SEO — 공략 키워드(복사), 도매몰 디렉토리 3곳 진행(나셀러·셀러위키·도매리스트닷컴, 이 브라우저에만 저장), 11/25 원고(제목·본문·해시태그 11개) 원클릭 복사와 발행 상태(초안·발행완료) |
| 📋 할 일 | 할 일·약속 — Supabase `office_tasks`와 동기화. 제목 + 담당(대표님 결정·주드·하루·다온·로이) + **날짜(약속)** 빠른 추가(오늘·내일·날짜 없음 칩, 날짜 선택), 날짜 배지(`오늘`·`내일`·`11/28 (토)`·`지남`)를 눌러 날짜 변경/삭제, 약속은 날짜순·날짜 없는 할 일은 뒤로 정렬, 보기 필터(전체·오늘·날짜없음·예정된 약속), 체크로 진행 중/완료 분리, 삭제, 상단에 미완료 건수 배지. AI 서버 미연결 시 이 기기에만 저장 (하단 바 `📋 할 일`) |
| 🤖 비서 | 4인방 역할 카드 |

## 동작 방식

1. **로컬 모드(기본)** — 서버 없이 바로 동작합니다. 회의실 메시지·할 일은 그 기기 브라우저(localStorage)에 저장됩니다.
2. **AI 서버 연결(Supabase)** — 우측 상단 `AI 서버` 배지를 눌러 Project URL 과 anon key 를 넣으면 `office_messages` · `office_tasks` 테이블과 동기화됩니다. 4.5초 주기로 주고받으며, 여러 기기에서 같은 회의실·할 일을 봅니다. 할 일은 `📋 할 일` 탭을 보고 있을 때 매 주기, 다른 화면에서는 4주기에 한 번 맞춥니다.

### 원터치 연결 (주소 한 줄)

각 기기에서 `AI 서버` 창에 키를 직접 넣지 않아도, 아래처럼 주소 끝에 `#sb_url=...&sb_key=...` 를 붙여 한 번 열면 설정이 그 기기 브라우저에 저장되고 바로 연결됩니다. 연결되면 앱이 주소창의 해시를 스스로 지워 깔끔하게 남깁니다.

```text
https://jju-ecommerce.github.io/jju-office/#sb_url=<Project URL>&sb_key=<anon key>
```

이 해시 주소는 비밀번호와 같습니다. 단톡방·SNS에 그대로 올리지 말고, 기기마다 한 번씩만 열어 주세요. 이 저장소(공개)에는 키가 들어 있지 않습니다.

### Supabase 준비

1. Supabase 프로젝트를 만들고 **SQL Editor** 에서 [`supabase-office-schema.sql`](supabase-office-schema.sql) 을 실행합니다.
2. **Project Settings → API** 의 `Project URL` 과 `anon public` 키를 앱의 `AI 서버` 창에 넣고 **저장**을 누릅니다.
3. `연결 테스트` 로 테이블까지 붙었는지 확인할 수 있습니다.

> anon key 는 앱을 쓰는 기기의 브라우저에만 저장되며 이 저장소에는 들어 있지 않습니다. 스키마는 개인 오피스 기준으로 anon 역할에 읽기·쓰기를 열어 두었으니 키를 외부에 공유하지 마세요.

### 메시지 author 값

`boss`(대표님) · `director`(주드, 본폰) · `jju1`(1번 폰) · `jju2`(2번 폰) · `jju3`(3번 폰). 비서 쪽에서 아래처럼 넣으면 회의실에 바로 뜹니다.

```bash
curl -X POST "$SUPABASE_URL/rest/v1/office_messages" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"room":"grand","author":"jju1","author_name":"하루","body":"1번 12:31 발행 완료했습니다."}'
```

`room` 은 `grand`(대회의실) · `command`(지휘실) · `lounge`(라운지) 중 하나입니다.

### 할 일(`office_tasks`) 컬럼

`id`(uuid) · `title`(text) · `owner`(text — `boss`·`director`·`jju1`·`jju2`·`jju3`) · `done`(boolean) · `due_date`(date, 선택) · `created_at` · `updated_at`

비서 쪽에서 할 일을 올리거나 완료 처리할 때:

```bash
curl -X POST "$SUPABASE_URL/rest/v1/office_tasks" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"에이블리 페이백 결정","owner":"boss","done":false}'

curl -X PATCH "$SUPABASE_URL/rest/v1/office_tasks?id=eq.<id>" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" -d '{"done":true}'
```

날짜 약속은 `due_date` 에 `YYYY-MM-DD` 를 넣습니다(비우면 날짜 없는 할 일). 앱에서도 같은 방식으로 저장되고, 화면에서는 `오늘`·`내일`·`11/28 (토)`·`지남` 배지로 보입니다.

```bash
curl -X POST "$SUPABASE_URL/rest/v1/office_tasks" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"달리바 상세페이지 검수 약속","owner":"boss","done":false,"due_date":"2026-11-28"}'

curl -X PATCH "$SUPABASE_URL/rest/v1/office_tasks?id=eq.<id>" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" -d '{"due_date":null}'
```

## 파일

```
index.html                  화면
styles.css                  크림·브라운·골드 테마(라이트/다크)
app.js                      회의실·오피스 맵·할 일·서버 동기화
assets/office-floorplan.jpg  오피스 맵 평면도(1402×1122)
manifest.json               PWA 설치 정보
sw.js                       오프라인 캐시
supabase-office-schema.sql  서버 테이블·정책
icons/                      앱 아이콘(192·512·maskable·apple-touch)
scripts/make-icons.py       아이콘 생성 스크립트
```

## 보안

이 저장소는 공개 저장소입니다. 대표님의 전화번호·이메일·비밀번호·API 키·시트 ID 같은 개인 정보는 넣지 않았습니다. 서버 접속 정보는 각 기기의 브라우저에만 저장됩니다. 블로그 탭의 고객센터 번호(1566-0902)는 도매에빠지다가 공개한 사업자 대표번호이고, 디렉토리 연락처는 각 디렉토리가 공개한 입점 문의 메일입니다.
