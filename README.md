# 프롬프트 18선 · 원클릭 복사 (4050 중년 셀러 AI 장사 지침서)

쭈대표의 이커머스(@JJU_E-Commerce) 4050 지침서에 실린 **실전 프롬프트 18선**을
스마트폰에서 바로 복사해 쓸 수 있게 만든 모바일 웹페이지입니다.

- 주소: <https://juhwan7812-dot.github.io/4050-ai-prompts/>
- 각 프롬프트에 `#p01` ~ `#p18` 앵커가 있어 PDF·유튜브 설명란에서 해당 프롬프트로 바로 들어올 수 있습니다.
- 각 카드의 **[📋 프롬프트 복사하기]** 버튼을 누르면 전문이 클립보드로 복사됩니다
  (`navigator.clipboard.writeText` + 구형 브라우저 `execCommand` fallback).
- `[대괄호]` 자리는 골드 굵게 표시되어 "여기만 바꾸세요"를 바로 알아볼 수 있습니다.
- 폰트: 지마켓 산스(Gmarket Sans) 서브셋 woff2. 외부 CDN 없이 이 저장소가 전부 제공합니다.

## 파일

| 파일 | 설명 |
| --- | --- |
| `index.html` | 페이지 본문(스타일·스크립트 포함 단일 파일) |
| `fonts/*.woff2` | 지마켓 산스 Light/Medium/Bold 서브셋 |
| `build_site.py` | 페이지 생성 스크립트 (프롬프트 원문은 `.work/prompts_data.py`) |

## 배포

GitHub Pages(main 브랜치 루트)로 서비스합니다. 수정 후에는 `python3 build_site.py`로
`index.html`을 다시 만들고 커밋·푸시하면 1분 안에 반영됩니다.

© 쭈대표의 이커머스
