# 4050 중년 셀러 AI 장사 지침서 · 전체 본문 + 프롬프트 18선 원클릭 복사

쭈대표의 이커머스(@JJU_E-Commerce) 지침서를 **한 페이지**에 통째로 담았습니다.

- 주소: <https://jju-ecommerce.github.io/>
- **지침서 전체 본문**: 저자 소개 · 프롤로그 · 제1장~제5장 · 에필로그를 한 글자도 줄이지 않고
  폰에서 확대 없이 읽히도록 큰 글씨(16.5~18px)와 표·콜아웃으로 옮겼습니다.
- **프롬프트 18선**: 본문 속 프롬프트 자리에서 바로 복사할 수 있고, 부록 카드(`#p01`~`#p18`)에
  큰 **[📋 프롬프트 복사하기]** 버튼이 있습니다. PDF·유튜브 설명란의 `#p01`~`#p18` 링크가 그대로 작동합니다.
  복사되는 텍스트는 `.work/prompts_data.py`의 원문과 100% 동일합니다.
- **소장용 PDF**: 페이지 맨 아래 버튼 하나로 기기를 판별해 폰은 42장 세로형, PC는 29장 가로형이 열립니다.
  작은 보조 링크로 모바일용 · PC용 · PPTX 편집본을 직접 고를 수도 있습니다.
- `[대괄호]` 자리는 골드 굵게 표시되어 "여기만 바꾸세요"를 바로 알아볼 수 있습니다.
- 폰트: 지마켓 산스(Gmarket Sans) 서브셋 woff2. 외부 CDN 없이 이 저장소가 전부 제공합니다.

## 파일

| 파일 | 설명 |
| --- | --- |
| `index.html` | 페이지 본문(스타일·스크립트 포함 단일 파일) |
| `fonts/*.woff2` | 지마켓 산스 Light/Medium/Bold 서브셋(페이지에 쓰인 글자만) |
| `img/cover-*.{png,webp}` | 히어로 캐리커처(280/560px, png·webp) |
| `build_site.py` | 페이지 생성 스크립트 |

## 빌드와 배포

```bash
python3 build_site.py          # index.html + _chars.txt + 폰트 서브셋까지 한 번에
git add -A && git commit -m "..." 
git push origin main && git branch -f gh-pages main && git push -f origin gh-pages
```

원본: `viral-marketing/4050중년셀러-이커머스-AI장사지침서-전체원고.md`(본문), `.work/prompts_data.py`(프롬프트 18선).

© 쭈대표의 이커머스
