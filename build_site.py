# -*- coding: utf-8 -*-
"""4050 중년 셀러 AI 장사 지침서 — 지침서 전체 본문 + 프롬프트 18선 원클릭 복사 웹페이지 빌더.

원본
  · 지침서 전체 원고 : viral-marketing/4050중년셀러-이커머스-AI장사지침서-전체원고.md
  · 프롬프트 18선     : .work/prompts_data.py  (복사되는 텍스트는 이 데이터와 100% 동일)

산출물
  · index.html (본문·부록·PDF 섹션 단일 파일)
  · _chars.txt (페이지에 실제로 쓰인 글자)
  · fonts/GmarketSansTTF{L,M,B}.woff2 (위 글자만 담은 서브셋)
"""
import html
import importlib.util
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(ROOT / ".work"))
spec = importlib.util.spec_from_file_location("prompts_data", ROOT / ".work" / "prompts_data.py")
pd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pd)
PROMPTS = pd.PROMPTS

BOOK_MD = ROOT / "viral-marketing" / "4050중년셀러-이커머스-AI장사지침서-전체원고.md"

YOUTUBE = "https://youtube.com/@JJU_E-Commerce"
CHATGPT = "https://chatgpt.com/"
CLAUDE = "https://claude.ai/new"
PDF_MOBILE = "https://drive.google.com/file/d/167v6ieCETbFTs1pqgTeuYcKuFcqBJEqf/view"
PDF_PC = "https://drive.google.com/file/d/1sk5aZe6nuBDZnulNpVGJ4jKRed3uX5fX/view"
PDF_PPTX = "https://drive.google.com/file/d/1mACG4qkkkACxO0NQrnKl0qV3Re25AHvr/view"

CAT_COLOR = {
    "기초": "#2563EB",
    "소싱": "#0E7490",
    "마진": "#B45309",
    "상페": "#7C3AED",
    "CS": "#BE123C",
    "루틴": "#0F766E",
}
CAT_FULL = {
    "기초": "기초 세팅",
    "소싱": "상품 소싱",
    "마진": "마진 계산",
    "상페": "상세페이지",
    "CS": "고객 응대",
    "루틴": "다채널 루틴",
}

HINT = {
    1: "챗GPT [설정] → [맞춤 설정(Custom Instructions)] 칸에 그대로 붙여넣으세요.",
    2: "새 대화창에 붙여넣고, 원하는 조건이 있으면 문장 끝에 한 줄만 덧붙이세요.",
    3: "[ ] 안에 검토 중인 상품명을 넣고 그대로 붙여넣으세요.",
    4: "[ ] 안에 쿠팡에서 잘 팔리는 상품명을 넣고 붙여넣으세요.",
    5: "1688 업체 페이지의 업체명·업력·재구매율 글자를 복사해 [ ] 안에 넣으세요.",
    6: "내 상품의 판매가·공장가만 [ ] 안에서 바꾸면 1원 단위로 계산해 줍니다.",
    7: "내 도착단가를 [ ] 안에 넣고 붙여넣으세요.",
    8: "[ ] 안에 상품명과 단품가격을 넣고 붙여넣으세요.",
    9: "1688 상세페이지의 중국어 스펙을 복사해 [ ] 안에 붙여넣으세요.",
    10: "[ ] 안에 상품명을 넣고 붙여넣으세요.",
    11: "상품명과 타깃 고객을 [ ] 안에 넣고 붙여넣으세요.",
    12: "[ ] 안에 상품명을 넣고 붙여넣으세요.",
    13: "송장번호와 지역 허브만 [ ] 안에서 바꿔 고객 답변에 그대로 붙여넣으세요.",
    14: "왕복 배송비 금액을 [ ] 안에 넣어 고객 답변에 붙여넣으세요.",
    15: "맞교환·환불 중 하나만 남기고 고객 답변에 붙여넣으세요.",
    16: "상호명을 [ ] 안에 넣고 리뷰 답글에 붙여넣으세요.",
    17: "상호명·상품명·혜택을 [ ] 안에 넣고 구매 감사 메시지로 보내세요.",
    18: "확정한 기획안(상품명·도착단가·판매가·소구점)을 [ ] 안에 넣으세요.",
}


def esc(t: str) -> str:
    return html.escape(t, quote=False)


BRACKET = re.compile(r"\[([^\[\]\n]{1,200})\]")


def rich(t: str) -> str:
    """escape + [대괄호] 골드 강조 (프롬프트 본문용)"""
    out = esc(t)
    return BRACKET.sub(lambda m: '<mark class="ph">[%s]</mark>' % m.group(1), out)


def inline(t: str, gold_brackets: bool = False) -> str:
    """한 줄 마크다운 → HTML (굵게·기울임·링크·인라인코드)."""
    out = esc(t)
    if gold_brackets:
        out = BRACKET.sub(lambda m: '<em class="hl">[%s]</em>' % m.group(1), out)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)
    out = re.sub(r"(?<![\*\w])\*([^\*\n]+?)\*(?![\*\w])", r"<em>\1</em>", out)
    out = re.sub(
        r"\[([^\]]+)\]\((https?://[^)\s]+)\)",
        r'<a href="\2" target="_blank" rel="noopener">\1</a>',
        out,
    )
    out = re.sub(r"`([^`]+)`", r"<code>\1</code>", out)
    return out


QUOTES = "\"'\u2018\u2019\u201c\u201d"


def prompt_key(s: str) -> str:
    """원고 코드블록과 prompts_data 본문을 같은 프롬프트로 묶기 위한 비교 키.

    원고 블록은 첫 줄에 `[프롬프트 N: ...]` 제목이 붙고, CS 대본은 앞뒤 따옴표가
    감싸고 있어 글자 그대로는 같지 않다. 제목 줄과 따옴표·공백만 걷어내고 비교한다.
    """
    s = s.strip()
    if s.startswith("[") and "\n" in s:
        s = s.split("\n", 1)[1]
    return "".join(ch for ch in s if ch not in QUOTES and not ch.isspace())


PROMPT_BY_BODY = {prompt_key(p["body"]): p for p in PROMPTS}


class BookRenderer:
    """지침서 마크다운(## 저자 소개 ~ ## [부록] 직전)을 읽기 좋은 카드 HTML로 바꾼다."""

    def __init__(self, md: str):
        self.sections = []       # [{"id","badge","title","body":[...]}]
        self.toc = []            # [(id, badge, plain_title)]
        self.cur = None
        lines = md.split("\n")
        start = next(i for i, l in enumerate(lines) if l.startswith("## 저자 소개"))
        end = next(i for i, l in enumerate(lines) if l.startswith("## [부록]"))
        self._render(lines[start:end])

    # ---------- 기본 ----------
    def _body(self):
        return self.cur["body"]

    def add_h2(self, text: str):
        t = text.strip()
        badge, title, sid = "본문", t, "sec%d" % (len(self.sections) + 1)
        m = re.match(r"^(\d+)장\.\s*(.*)$", t)
        if m:
            badge, title, sid = "제%s장" % m.group(1), m.group(2), "ch%s" % m.group(1)
        elif t.startswith("프롤로그"):
            badge, title, sid = "프롤로그", re.sub(r"^프롤로그\s*:?\s*", "", t), "prologue"
        elif t.startswith("에필로그"):
            badge, title, sid = "에필로그", re.sub(r"^에필로그\s*:?\s*", "", t), "epilogue"
        elif t.startswith("저자 소개"):
            badge, title, sid = "저자 소개", re.sub(r"^저자 소개\s*:?\s*", "", t), "author"
        plain = re.sub(r"\*\*", "", title)
        self.cur = {"id": sid, "badge": badge, "title": inline(title, True), "body": []}
        self.sections.append(self.cur)
        self.toc.append((sid, badge, plain))

    def add_h3(self, text: str):
        self._body().append('<h3 class="h3">%s</h3>' % inline(text.strip(), True))

    def add_h4(self, text: str):
        t = text.strip().replace("**", "")
        self._body().append('<h4 class="h4">%s</h4>' % inline(t, True))

    def add_para(self, lines):
        parts = []
        for k, l in enumerate(lines):
            br = l.endswith("  ")
            parts.append(inline(l.strip()))
            if k < len(lines) - 1:
                parts.append("<br>" if br else " ")
        txt = "".join(parts).strip()
        if txt:
            self._body().append('<p class="bp">%s</p>' % txt)

    def add_list(self, items):
        out, cur_type = [], None
        for it in items:
            if it["type"] != cur_type:
                if cur_type:
                    out.append("</%s>" % cur_type)
                out.append('<%s class="blist">' % it["type"])
                cur_type = it["type"]
            inner = "<br>".join(inline(part) for part in it["parts"])
            out.append("<li>%s</li>" % inner)
        if cur_type:
            out.append("</%s>" % cur_type)
        self._body().append("".join(out))

    def add_action(self, text: str):
        t = text.strip().lstrip("👉").strip()
        self._body().append('<p class="act">👉 %s</p>' % inline(t))

    def add_table(self, rows):
        cells = [[c.strip() for c in r.strip().strip("|").split("|")] for r in rows]
        head, data = cells[0], [r for r in cells[2:] if any(r)]
        th = "".join("<th>%s</th>" % inline(c) for c in head)
        trs = []
        for r in data:
            tds = []
            for idx, c in enumerate(r):
                label = re.sub(r"[*<]", "", head[idx]) if idx < len(head) else ""
                tds.append('<td data-l="%s">%s</td>' % (esc(label), inline(c)))
            trs.append("<tr>%s</tr>" % "".join(tds))
        self._body().append(
            '<div class="tblwrap"><table class="btbl"><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>'
            % (th, "".join(trs))
        )

    def add_quote(self, buf):
        text = "\n".join(buf).strip()
        plain = re.sub(r"\*\*", "", text)
        if "🎥" in plain:
            m = re.search(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", text)
            url = m.group(2) if m else YOUTUBE
            lines = [l.strip() for l in plain.split("\n") if l.strip()]
            title = re.sub(r"^🎥\s*", "", lines[0]).strip()
            desc = " ".join(l for l in lines[1:] if "🔗" not in l and not l.startswith("["))
            self._body().append(
                '<div class="vid"><p class="vid-t"><span aria-hidden="true">🎥</span> %s</p>'
                '<p class="vid-d">%s</p>'
                '<a class="vid-a" href="%s" target="_blank" rel="noopener">▶ 유튜브 영상 보기</a></div>'
                % (esc(title), esc(desc), esc(url))
            )
            return
        if "🔔" in plain:
            url = re.search(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", text)
            url = url.group(2) if url else YOUTUBE
            plines = [l.strip() for l in plain.split("\n") if l.strip()]
            ttl = re.sub(r"^🔔\s*", "", plines[0]).strip()
            desc = " ".join(l for l in plines[1:] if "🔗" not in l and not l.startswith("["))
            self._body().append(
                '<div class="sub-box"><p class="sub-t">🔔 %s</p>%s'
                '<a class="btn btn-yt" href="%s" target="_blank" rel="noopener">'
                '<span class="ico" aria-hidden="true">▶</span><span>쭈대표 유튜브 구독하기 (@JJU_E-Commerce)</span></a></div>'
                % (esc(ttl), ('<p class="sub-d">%s</p>' % esc(desc)) if desc else "", esc(url))
            )
            return
        if plain.startswith("쭈대표 한마디"):
            body = re.sub(r"^쭈대표 한마디\s*[—-]\s*", "", plain)
            self._body().append(
                '<div class="tip"><span class="tip-b">쭈대표 한마디</span><p>%s</p></div>'
                % inline(body)
            )
            return
        if "※" in plain:
            self._body().append('<div class="notice"><p>%s</p></div>' % inline(plain))
            return
        self._body().append('<blockquote class="bquote"><p>%s</p></blockquote>' % inline(plain))

    def add_code(self, body: str):
        p = PROMPT_BY_BODY.get(prompt_key(body))
        if p:
            pid, no = "c%02d" % p["no"], p["no"]
            self._body().append(
                '<div class="pblock">'
                '<div class="pb-head"><span class="no">No.%02d</span>'
                '<span class="pb-t">%s</span></div>'
                '<pre class="code">%s</pre>'
                '<div class="raw" hidden>%s</div>'
                '<div class="pb-foot">'
                '<button type="button" class="btn copy sm" data-copy="%s">'
                '<span class="ico" aria-hidden="true">📋</span><span class="lbl">이 프롬프트 복사</span></button>'
                '<a class="pb-link" href="#p%02d">부록 카드로 보기 →</a>'
                "</div></div>"
                % (no, esc(p["title"]), rich(p["body"]), esc(p["body"]), pid, no)
            )
        else:
            self._body().append('<pre class="code plain">%s</pre>' % esc(body))

    # ---------- 루프 ----------
    def _render(self, lines):
        i = 0
        n = len(lines)
        while i < n:
            raw = lines[i]
            s = raw.strip()
            if not s or s == "---":
                i += 1
                continue
            if s.startswith("```"):
                j, buf = i + 1, []
                while j < n and not lines[j].strip().startswith("```"):
                    buf.append(lines[j])
                    j += 1
                self.add_code("\n".join(buf))
                i = j + 1
                continue
            if s.startswith("|"):
                j, rows = i, []
                while j < n and lines[j].strip().startswith("|"):
                    rows.append(lines[j])
                    j += 1
                self.add_table(rows)
                i = j
                continue
            if s.startswith(">"):
                j, buf = i, []
                while j < n and lines[j].strip().startswith(">"):
                    buf.append(re.sub(r"^>\s?", "", lines[j].strip()))
                    j += 1
                self.add_quote(buf)
                i = j
                continue
            if s.startswith("#### "):
                self.add_h4(s[5:])
                i += 1
                continue
            if s.startswith("### "):
                self.add_h3(s[4:])
                i += 1
                continue
            if s.startswith("## "):
                self.add_h2(s[3:])
                i += 1
                continue
            if s.startswith("👉"):
                self.add_action(s)
                i += 1
                continue
            if re.match(r"^(?:- |\d+\. )", s) and not raw.startswith("  "):
                j, items, cur = i, [], None
                while j < n:
                    r2 = lines[j]
                    s2 = r2.strip()
                    if not s2 or s2 == "---":
                        break
                    m = re.match(r"^(- |\d+\. )(.+)$", s2)
                    if m and not r2.startswith("  "):
                        if cur:
                            items.append(cur)
                        cur = {"type": "ol" if m.group(1)[0].isdigit() else "ul", "parts": [m.group(2)]}
                    elif r2.startswith("  ") and cur is not None:
                        cur["parts"].append(s2)
                    else:
                        break
                    j += 1
                if cur:
                    items.append(cur)
                self.add_list(items)
                i = j
                continue
            # 문단
            j, buf = i, []
            while j < n:
                r2 = lines[j]
                s2 = r2.strip()
                if not s2:
                    break
                if s2 == "---" or s2.startswith(("```", "|", ">", "#", "👉")):
                    break
                if (s2.startswith("- ") or re.match(r"^\d+\. ", s2)) and not r2.startswith("  "):
                    break
                buf.append(r2)
                j += 1
            self.add_para(buf)
            i = max(j, i + 1)


# ---------------------------------------------------------------- 카드 / 목차
def card(p) -> str:
    no = p["no"]
    pid = "p%02d" % no
    cat = p["cat"]
    color = CAT_COLOR.get(cat, "#B45309")
    return f"""
    <article class="card" id="{pid}" aria-labelledby="{pid}-t">
      <div class="card-top">
        <span class="no">No.{no:02d}</span>
        <span class="cat"><i style="background:{color}"></i>{CAT_FULL.get(cat, cat)}</span>
      </div>
      <h2 class="ct" id="{pid}-t">{esc(p['title'])}</h2>
      <p class="hint">{esc(HINT.get(no, '새 대화창에 그대로 붙여넣으세요.'))}</p>
      <pre class="code">{rich(p['body'])}</pre>
      <div class="raw" hidden>{esc(p['body'])}</div>
      <button type="button" class="btn copy" data-copy="{pid}">
        <span class="ico" aria-hidden="true">📋</span><span class="lbl">프롬프트 복사하기</span>
      </button>
      <p class="after">복사한 뒤 챗GPT·클로드 입력창에 붙여넣으면 끝납니다.</p>
    </article>"""


CARDS = "".join(card(p) for p in PROMPTS)


def prompt_index() -> str:
    rows = []
    for p in PROMPTS:
        color = CAT_COLOR.get(p["cat"], "#B45309")
        rows.append(
            f'<a class="idx-item" href="#p{p["no"]:02d}">'
            f'<span class="idx-no" style="color:{color}">{p["no"]:02d}</span>'
            f'<span class="idx-t">{esc(p["title"])}</span></a>'
        )
    return "\n".join(rows)


IDX = prompt_index()


# ---------------------------------------------------------------- 본문 렌더
BOOK = BookRenderer(BOOK_MD.read_text(encoding="utf-8"))


def book_toc() -> str:
    rows = []
    for sid, badge, title in BOOK.toc:
        rows.append(
            f'<a class="toc-item" href="#{sid}"><span class="toc-badge">{esc(badge)}</span>'
            f'<span class="toc-t">{esc(title)}</span></a>'
        )
    return "\n".join(rows)


def book_html() -> str:
    out = []
    for sec in BOOK.sections:
        out.append(
            '<section class="book-sec" id="%s">\n'
            '  <p class="sec-badge">%s</p>\n'
            '  <h2 class="sec-title">%s</h2>\n'
            '  <div class="sec-body">\n%s\n  </div>\n</section>'
            % (sec["id"], esc(sec["badge"]), sec["title"], "\n".join(sec["body"]))
        )
    return "\n".join(out)


BOOK_BODY = book_html()
BOOK_TOC = book_toc()
CHAPTER_COUNT = sum(1 for s in BOOK.sections if s["id"].startswith("ch"))

CSS = """
:root{
  --navy:#0F172A; --navy-2:#16233C; --navy-3:#20304D;
  --gold:#D97706; --gold-2:#F0A93B; --gold-deep:#B45309;
  --ink:#14203A; --ink-2:#37506F; --paper:#FFFFFF;
  --cream:#FFF6E6; --line:#E3E9F1; --muted:#94A3B8;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{
  margin:0;background:var(--navy);color:#E5EAF3;
  font-family:"Gmarket Sans","Apple SD Gothic Neo","Malgun Gothic",system-ui,"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;
  font-size:17.5px;line-height:1.78;letter-spacing:-.01em;
  word-break:keep-all;overflow-wrap:anywhere;
}
img{max-width:100%}
a{color:inherit}
.wrap{max-width:720px;margin:0 auto;padding:0 15px}

/* ── 상단 고정 내비게이션 ─────────────────────────── */
.topbar{
  position:sticky;top:0;z-index:50;
  background:rgba(15,23,42,.95);backdrop-filter:blur(10px);
  border-bottom:1px solid rgba(217,119,6,.35);
}
.topbar .inner{max-width:720px;margin:0 auto;padding:7px 10px;display:flex;gap:6px;align-items:center}
.tab{
  flex:1 1 0;display:flex;align-items:center;justify-content:center;gap:5px;
  min-height:44px;padding:6px 4px;border-radius:11px;
  font-size:14px;font-weight:700;letter-spacing:-.03em;text-decoration:none;
  color:#C7D2E4;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);
  white-space:nowrap;
}
.tab .ic{font-size:15px;line-height:1}
.tab.on{color:#1A1206;background:linear-gradient(180deg,#F5B957,#E08A0C);border-color:#F0A93B}

/* ── 히어로 ──────────────────────────────────────── */
.hero{padding:26px 0 6px;text-align:center}
.hero .avatar{width:112px;height:112px;margin:0 auto 14px;border-radius:50%;
  background:radial-gradient(circle at 50% 35%,#1E2E4D,#0F172A);border:2.5px solid rgba(240,169,59,.85);
  box-shadow:0 10px 26px rgba(0,0,0,.4);overflow:hidden;display:block}
.hero .avatar img{width:100%;height:100%;object-fit:cover;display:block}
.hero .kicker{display:inline-block;font-size:13.5px;font-weight:700;color:var(--gold-2);letter-spacing:.04em;margin-bottom:12px}
.hero h1{margin:0;font-size:27px;line-height:1.36;font-weight:700;color:#fff;letter-spacing:-.035em}
.hero h1 .g{color:var(--gold-2);display:block;font-size:31px;margin-top:6px}
.hero .lead{margin:16px auto 0;max-width:560px;font-size:16.5px;line-height:1.75;color:#C7D2E4}
.hero .lead b{color:#fff}
.chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:18px 0 0}
.chip{border:1.5px solid rgba(240,169,59,.75);color:var(--gold-2);border-radius:999px;padding:8px 13px;font-size:13.5px;font-weight:700;line-height:1}
.rule{width:52px;height:3px;background:var(--gold);border-radius:2px;margin:22px auto 0}

/* ── 버튼 공통 ───────────────────────────────────── */
.btn{
  display:flex;align-items:center;justify-content:center;gap:9px;width:100%;
  min-height:60px;padding:13px 15px;border:0;border-radius:15px;
  font-family:inherit;font-size:18px;font-weight:700;letter-spacing:-.03em;
  text-decoration:none;cursor:pointer;touch-action:manipulation;
}
.btn .ico{font-size:21px;line-height:1}
.btn-yt{background:linear-gradient(180deg,#F0A93B,#D97706);color:#1A1206;box-shadow:0 8px 22px rgba(217,119,6,.32);font-size:16.5px;padding:13px 9px}
.btn-nav{background:rgba(255,255,255,.07);color:#fff;border:1.5px solid rgba(240,169,59,.5);min-height:56px;font-size:16.5px}
.btn-nav.pill{justify-content:flex-start;padding-left:16px}
.btn-ghost{background:rgba(255,255,255,.06);color:#fff;border:1.5px solid rgba(255,255,255,.2);min-height:52px;font-size:15.5px}
.btn-ai{background:rgba(255,255,255,.07);color:#fff;border:1.5px solid rgba(255,255,255,.22);min-height:52px;font-size:15.5px}
.btn-ai.claude{border-color:rgba(240,169,59,.55)}
.btn-row{display:grid;gap:10px;margin:22px 0 0}
.btn-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}

/* 히어로 빠른 이동 */
.quick{display:grid;gap:9px;margin:16px 0 0}
.quick .btn-nav{justify-content:flex-start;gap:10px;padding-left:15px;min-height:56px;font-size:16.5px}
.quick .btn-nav .ar{margin-left:auto;color:var(--gold-2);font-size:17px}

/* ── 섹션 머리 ───────────────────────────────────── */
.zone{margin:44px auto 0;scroll-margin-top:70px}
.zone-head{text-align:center;margin:0 0 18px}
.zone-head .zh{display:inline-block;font-size:12.5px;font-weight:700;color:var(--gold-2);letter-spacing:.08em;margin-bottom:8px}
.zone-head h2{margin:0;font-size:24px;color:#fff;letter-spacing:-.035em}
.zone-head p{margin:8px auto 0;max-width:560px;font-size:15px;line-height:1.7;color:#A9B7CC}

/* ── 소개 카드 ───────────────────────────────────── */
.intro{
  margin:0 0 18px;padding:22px 18px;border-radius:20px;
  background:linear-gradient(180deg,#1B2A45,#131E33);border:1px solid rgba(240,169,59,.28);
}
.intro h2{margin:0 0 6px;font-size:19px;color:#fff;letter-spacing:-.03em}
.intro p{margin:0 0 10px;font-size:15px;line-height:1.75;color:#C4D0E2}
.intro p:last-child{margin-bottom:0}
.intro b{color:#FFD79A}
.intro .byline{margin:14px 0 0;padding-top:14px;border-top:1px solid rgba(255,255,255,.13);font-size:14px;color:#9FB0C7;line-height:1.75}
.intro .byline b{color:#fff}

/* 지침서 차례 */
.booktoc{margin:0 0 18px;padding:20px 16px;border:1px solid rgba(255,255,255,.13);border-radius:20px;background:rgba(255,255,255,.04)}
.booktoc h2{margin:0 0 4px;font-size:17px;color:#fff}
.booktoc p.sub{margin:0 0 13px;font-size:13.5px;color:var(--muted)}
.toc{display:grid;gap:7px}
.toc-item{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;background:rgba(255,255,255,.06);text-decoration:none;border:1px solid rgba(255,255,255,.08)}
.toc-badge{flex:0 0 auto;font-size:11.5px;font-weight:700;color:#1A1206;background:linear-gradient(180deg,#F5B957,#E08A0C);border-radius:7px;padding:4px 7px;line-height:1.2;white-space:nowrap}
.toc-t{font-size:14.5px;color:#E5EAF3;line-height:1.4;font-weight:500}

/* ── 책 본문 카드 ────────────────────────────────── */
.book-sec{
  background:var(--paper);color:var(--ink);border-radius:22px;
  padding:24px 19px 20px;margin:0 0 20px;
  box-shadow:0 14px 34px rgba(0,0,0,.28);
  scroll-margin-top:70px;
}
.sec-badge{display:inline-block;margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.06em;
  color:var(--gold-deep);background:var(--cream);border:1px solid rgba(217,119,6,.35);border-radius:999px;padding:5px 11px;line-height:1}
.sec-title{margin:0 0 14px;font-size:23px;line-height:1.42;font-weight:700;color:var(--navy);letter-spacing:-.04em;
  padding-bottom:14px;border-bottom:2px solid rgba(217,119,6,.28)}
.sec-title .hl{color:var(--gold-deep);font-style:normal}
.sec-body p.bp{margin:0 0 14px;font-size:17.5px;line-height:1.85;color:#1B2A44;letter-spacing:-.012em}
.sec-body p.bp strong{color:var(--navy);font-weight:700}
.sec-body p.bp a{color:var(--gold-deep);text-decoration:none;border-bottom:1px solid rgba(180,83,9,.45);font-weight:700}
.h3{margin:26px 0 10px;padding-left:11px;border-left:4px solid var(--gold);font-size:19.5px;line-height:1.45;color:var(--navy);letter-spacing:-.035em}
.h4{margin:20px 0 9px;font-size:17.5px;line-height:1.5;color:#0F172A;letter-spacing:-.03em}
.h4 .hl,.h3 .hl{color:var(--gold-deep);font-style:normal}
ul.blist,ol.blist{margin:0 0 15px;padding-left:20px}
ul.blist li,ol.blist li{margin:0 0 8px;font-size:17px;line-height:1.78;color:#22334F}
ul.blist li::marker{color:var(--gold)}
ol.blist li::marker{color:var(--gold-deep);font-weight:700}
p.act{margin:0 0 16px;padding:13px 15px;border-radius:13px;background:var(--cream);border:1px solid rgba(217,119,6,.35);
  font-size:16.5px;line-height:1.7;color:#7A3D05;font-weight:700}
.tblwrap{margin:0 0 16px;overflow-x:auto;-webkit-overflow-scrolling:touch}
.btbl{width:100%;border-collapse:collapse;font-size:15.5px;line-height:1.6}
.btbl th{background:var(--navy);color:#FFD79A;font-weight:700;text-align:left;padding:10px 11px;border:1px solid var(--navy);letter-spacing:-.02em}
.btbl td{padding:10px 11px;border:1px solid var(--line);color:#22334F;vertical-align:top;background:#fff}
.btbl tbody tr:nth-child(even) td{background:#F8FAFD}

/* 콜아웃 */
.tip{margin:0 0 16px;padding:15px 16px 15px 16px;border-radius:15px;background:#FFF9EE;border:1.5px solid rgba(217,119,6,.4)}
.tip-b{display:inline-block;margin-bottom:6px;font-size:12.5px;font-weight:700;color:#fff;background:var(--gold-deep);border-radius:999px;padding:4px 9px;line-height:1}
.tip p{margin:0;font-size:16px;line-height:1.78;color:#5B3A12}
.notice{margin:0 0 16px;padding:13px 15px;border-radius:13px;background:#F4F7FB;border-left:4px solid #93A7C4}
.notice p{margin:0;font-size:15px;line-height:1.75;color:#42536B}
.bquote{margin:0 0 16px;padding:13px 16px;border-left:4px solid var(--gold);background:#FBF7EF}
.bquote p{margin:0;font-size:16.5px;line-height:1.8;color:#4A3B24}
.vid{margin:0 0 16px;padding:15px 16px;border-radius:15px;background:#0F172A;color:#E5EAF3}
.vid-t{margin:0 0 6px;font-size:15.5px;line-height:1.6;color:#FFD79A;font-weight:700}
.vid-d{margin:0 0 12px;font-size:14.5px;line-height:1.7;color:#C4D0E2}
.vid-a{display:block;text-align:center;padding:11px 12px;border-radius:11px;background:linear-gradient(180deg,#F0A93B,#D97706);color:#1A1206;font-size:15px;font-weight:700;text-decoration:none}
.sub-box{margin:26px 0 0;padding:18px 15px;border-radius:16px;background:rgba(240,169,59,.1);border:1px solid rgba(240,169,59,.4)}
.sub-t{margin:0 0 6px;font-size:15.5px;font-weight:700;color:#8A4A05;text-align:center;line-height:1.6}
.sub-d{margin:0 0 12px;font-size:14px;line-height:1.7;color:#6B4A1E;text-align:center}

/* 본문 속 프롬프트 블록 */
.pblock{margin:0 0 18px;padding:15px 14px 13px;border-radius:16px;background:#F7F9FC;border:1px solid #DEE6F0;border-top:4px solid var(--gold)}
.pb-head{display:flex;align-items:center;gap:8px;margin:0 0 10px}
.pb-t{font-size:14.5px;font-weight:700;color:#334155;line-height:1.4;letter-spacing:-.02em}
.no{font-size:13px;font-weight:700;color:#fff;background:var(--navy);border-radius:7px;padding:5px 8px;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap}
.code{
  margin:0 0 12px;padding:15px 13px;
  background:#fff;border:1px solid #E2E8F0;border-left:5px solid var(--gold);
  border-radius:13px;
  font-family:"Gmarket Sans","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif;
  font-size:16.5px;line-height:1.78;color:#111827;
  white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere;
}
.code.plain{border-left-color:#93A7C4}
.ph{background:#FFF0D2;color:#9A4A06;font-weight:700;border-radius:4px;padding:0 2px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.pb-foot{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.btn.copy{background:linear-gradient(180deg,#E8890C,#B45309);color:#fff;box-shadow:0 8px 20px rgba(180,83,9,.32);font-size:19.5px;min-height:62px}
.btn.copy.sm{width:auto;flex:1 1 auto;min-height:48px;font-size:15.5px;padding:10px 14px;border-radius:12px;gap:6px}
.btn.copy.sm .ico{font-size:16px}
.btn.copy .lbl{letter-spacing:-.02em}
.btn.copy.done{background:linear-gradient(180deg,#12805C,#0B6444);box-shadow:0 8px 20px rgba(11,100,68,.32)}
.pb-link{font-size:13.5px;font-weight:700;color:var(--gold-deep);text-decoration:none;border-bottom:1px solid rgba(180,83,9,.4);white-space:nowrap}

/* ── 부록 프롬프트 카드 ──────────────────────────── */
#prompts{scroll-margin-top:70px}
.idx{margin:0 0 20px;padding:20px 16px;border:1px solid rgba(255,255,255,.13);border-radius:20px;background:rgba(255,255,255,.04)}
.idx h2{margin:0 0 4px;font-size:17px;color:#fff}
.idx p.sub{margin:0 0 13px;font-size:13.5px;color:var(--muted)}
.idx-grid{display:grid;gap:7px}
.idx-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.06);text-decoration:none;border:1px solid rgba(255,255,255,.08)}
.idx-no{font-size:13.5px;font-weight:700;min-width:22px;font-variant-numeric:tabular-nums}
.idx-t{font-size:14px;color:#E5EAF3;line-height:1.35;font-weight:500}
.card{
  background:var(--paper);color:var(--ink);border-radius:22px;
  padding:22px 18px 18px;margin:0 0 20px;
  box-shadow:0 14px 34px rgba(0,0,0,.28);
  scroll-margin-top:70px;
}
.card:target{box-shadow:0 0 0 3px var(--gold),0 14px 34px rgba(0,0,0,.28)}
.card-top{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.cat{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:#334155;background:#EEF2F7;border-radius:999px;padding:6px 10px;line-height:1}
.cat i{width:8px;height:8px;border-radius:50%;display:inline-block}
.ct{margin:0 0 8px;font-size:20.5px;line-height:1.42;font-weight:700;color:var(--navy);letter-spacing:-.035em}
.hint{margin:0 0 13px;font-size:14.5px;line-height:1.65;color:#5A6B85}
.after{margin:10px 0 0;font-size:13px;color:#5A6B85;text-align:center}

/* ── PDF 섹션 ────────────────────────────────────── */
#pdf{scroll-margin-top:70px}
.pdf-box{margin:0;padding:22px 16px 16px;border:1px solid rgba(240,169,59,.42);border-radius:22px;background:linear-gradient(180deg,rgba(240,169,59,.14),rgba(240,169,59,.05))}
.pdf-head{margin:0 0 6px;font-size:19px;font-weight:700;color:#FFD79A;line-height:1.45;text-align:center;letter-spacing:-.03em}
.pdf-sub{margin:0 0 14px;font-size:13.5px;color:#B9C6DA;text-align:center;line-height:1.6}
.btn-pdf{
  justify-content:flex-start;gap:10px;min-height:70px;padding:13px 14px;
  background:linear-gradient(180deg,#FFFFFF,#E7EEF8);color:var(--navy);
  border:1.5px solid rgba(240,169,59,.85);
  box-shadow:0 8px 20px rgba(0,0,0,.2);text-align:left;
}
.btn-pdf .ico{font-size:24px}
.pdf-txt{display:flex;flex-direction:column;min-width:0}
.pdf-txt b{font-size:16.5px;font-weight:700;letter-spacing:-.03em;line-height:1.3}
.pdf-txt em{font-style:normal;font-size:12.5px;font-weight:500;color:#4E6079;margin-top:4px;line-height:1.3;letter-spacing:-.01em}
.pdf-foot{margin:11px 0 0;font-size:12.5px;color:#A9B7CC;line-height:1.5;text-align:center}
.pdf-mini{margin:10px 0 0;font-size:12px;line-height:1.7;color:#8E9FB8;text-align:center;letter-spacing:-.02em}
.pdf-mini a{color:#B9C6DA;text-decoration:none;border-bottom:1px solid rgba(185,198,218,.35);white-space:nowrap}
.pdf-mini .sep{color:#5C6B84;padding:0 2px}

/* ── 하단 ───────────────────────────────────────── */
.cta{margin:34px 0 0;padding:26px 18px;border-radius:22px;background:linear-gradient(180deg,#1B2A45,#131E33);border:1px solid rgba(240,169,59,.28);text-align:center}
.cta h2{margin:0 0 8px;font-size:21px;color:#fff;line-height:1.45;letter-spacing:-.03em}
.cta p{margin:0 0 18px;font-size:15px;color:#B9C6DA}
.top-link{display:block;text-align:center;margin:20px 0 0;font-size:14.5px;color:var(--gold-2);text-decoration:none;font-weight:700}
.foot{margin:26px 0 40px;text-align:center;font-size:12.5px;color:#7C8AA0;line-height:1.75}
.foot a{color:#9FB0C7;text-decoration:none;border-bottom:1px solid rgba(159,176,199,.4)}

/* ── 토스트 ─────────────────────────────────────── */
.toast{
  position:fixed;left:50%;bottom:22px;z-index:90;
  transform:translate(-50%,160%);transition:transform .28s cubic-bezier(.2,.8,.2,1);
  max-width:92vw;padding:14px 20px;border-radius:999px;
  background:#0B1220;border:1.5px solid var(--gold);
  color:#fff;font-size:15px;font-weight:700;line-height:1.4;text-align:center;
  box-shadow:0 14px 34px rgba(0,0,0,.55);
}
.toast.show{transform:translate(-50%,0)}

/* ── 반응형 ─────────────────────────────────────── */
@media (min-width:560px){
  .quick{grid-template-columns:1fr 1fr}
  .quick .q-full{grid-column:1 / -1}
}
@media (max-width:430px){
  body{font-size:16.8px}
  .hero{padding:20px 0 4px}
  .hero .avatar{width:96px;height:96px;margin-bottom:12px}
  .hero h1{font-size:22.5px}
  .hero h1 .g{font-size:26px}
  .hero .lead{font-size:15.5px}
  .chips{gap:6px}
  .chip{font-size:12.5px;padding:7px 10px}
  .btn{font-size:16px;min-height:56px}
  .btn-yt{font-size:14.5px;line-height:1.3;padding:12px 8px;min-height:56px}
  .btn-ai,.btn-ghost{font-size:14.5px;min-height:48px;gap:5px;padding:10px 4px}
  .btn-ai .ico,.btn-ghost .ico{font-size:17px}
  .quick .btn-nav{min-height:54px;font-size:15.5px;padding-left:13px}
  .zone-head h2{font-size:21px}
  .zone-head p{font-size:14px}
  .book-sec{padding:20px 15px 17px;border-radius:18px}
  .sec-title{font-size:20.5px}
  .sec-body p.bp{font-size:16.5px;line-height:1.85}
  .h3{font-size:18px}
  .h4{font-size:16.5px}
  ul.blist li,ol.blist li{font-size:16px}
  .code{font-size:15.8px;padding:13px 12px}
  .card{padding:18px 14px 16px;border-radius:18px}
  .ct{font-size:19px}
  .btn.copy{font-size:18px;min-height:60px}
  .btn.copy.sm{font-size:14.5px;min-height:46px;padding:9px 12px}
  .pb-link{font-size:12.5px}
  .toc-t{font-size:13.5px}
  .idx-t{font-size:13.5px}
  .pdf-head{font-size:17.5px}
  .toast{font-size:14px;padding:12px 15px}
  .tab{font-size:12.5px;gap:3px;min-height:42px;padding:5px 2px}
  .tab .ic{font-size:13.5px}
  /* 표: 폰에서는 행마다 카드로 */
  .btbl,.btbl tbody,.btbl tr,.btbl td{display:block;width:100%}
  .btbl thead{display:none}
  .btbl tr{margin:0 0 10px;border:1px solid var(--line);border-radius:13px;overflow:hidden;background:#fff}
  .btbl td{border:0;border-top:1px solid #EEF2F7;padding:9px 12px;font-size:15px}
  .btbl tbody tr td:first-child{background:var(--navy);color:#FFD79A;font-weight:700;border-top:0}
  .btbl td[data-l]:not(:first-child)::before{content:attr(data-l) " · ";font-weight:700;color:#8A6A2F}
}
@media (max-width:340px){
  .btn-2{grid-template-columns:1fr}
  .hero h1{font-size:20px}
  .hero h1 .g{font-size:23px}
}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.toast{transition:none}}
"""

JS = """
(function(){
  var toast=document.getElementById('toast'),tt=null;
  function showToast(msg,ms){
    toast.textContent=msg;toast.classList.add('show');
    clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show');},ms||2600);
  }
  function legacyCopy(text){
    var ta=document.createElement('textarea');
    ta.value=text;ta.setAttribute('readonly','');
    ta.style.position='fixed';ta.style.top='0';ta.style.left='0';
    ta.style.width='1px';ta.style.height='1px';ta.style.padding='0';
    ta.style.border='0';ta.style.opacity='0';
    document.body.appendChild(ta);
    var ok=false;
    try{
      ta.focus();ta.select();ta.setSelectionRange(0,text.length);
      ok=document.execCommand('copy');
    }catch(e){ok=false;}
    document.body.removeChild(ta);
    return ok;
  }
  function copyText(text){
    return new Promise(function(resolve){
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){resolve(true);},function(){resolve(legacyCopy(text));});
      }else{
        resolve(legacyCopy(text));
      }
    });
  }
  function flash(btn,ok){
    var lbl=btn.querySelector('.lbl');
    if(!lbl){return;}
    if(!btn.dataset.orig){btn.dataset.orig=lbl.textContent;}
    clearTimeout(btn._t);
    if(ok){
      btn.classList.add('done');lbl.textContent='✅ 복사 완료!';
      showToast('✅ 복사 완료! 챗GPT/클로드에 붙여넣으세요');
    }else{
      showToast('복사가 안 되면 프롬프트 글을 길게 눌러 직접 복사해 주세요',3400);
    }
    btn._t=setTimeout(function(){btn.classList.remove('done');lbl.textContent=btn.dataset.orig;},2600);
  }
  document.addEventListener('click',function(e){
    var btn=e.target.closest?e.target.closest('[data-copy]'):null;
    if(!btn){return;}
    var box=document.getElementById(btn.getAttribute('data-copy'));
    if(!box){return;}
    var raw=box.querySelector('.raw');
    var text=raw?raw.textContent:box.querySelector('.code').innerText;
    copyText(text).then(function(ok){flash(btn,ok);});
  },false);

  /* PDF 버튼: 기기 자동 판별 */
  var pdfBtn=document.getElementById('pdfMain');
  function isMobileDevice(){
    var ua=navigator.userAgent||'';
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)){return true;}
    if(navigator.maxTouchPoints>1 && window.innerWidth<=1024){return true;}
    return window.innerWidth<=768;
  }
  function setPdfHref(){
    if(!pdfBtn){return;}
    var url=isMobileDevice()?pdfBtn.getAttribute('data-mobile'):pdfBtn.getAttribute('data-pc');
    if(url && pdfBtn.getAttribute('href')!==url){pdfBtn.setAttribute('href',url);}
  }
  setPdfHref();
  window.addEventListener('resize',setPdfHref,false);
  window.addEventListener('orientationchange',setPdfHref,false);
  if(pdfBtn){
    pdfBtn.addEventListener('pointerdown',setPdfHref,false);
    pdfBtn.addEventListener('touchstart',setPdfHref,{passive:true});
    pdfBtn.addEventListener('click',setPdfHref,false);
  }

  /* 상단 탭 현재 위치 표시 */
  var tabs=[].slice.call(document.querySelectorAll('.tab'));
  var zones=['guide','prompts','pdf'].map(function(id){return document.getElementById(id);}).filter(Boolean);
  function markTab(){
    var y=window.scrollY+120,idx=0;
    zones.forEach(function(z,i){ if(z.offsetTop<=y){idx=i;} });
    tabs.forEach(function(t,i){t.classList.toggle('on',i===idx);});
  }
  markTab();
  window.addEventListener('scroll',markTab,{passive:true});

  /* 링크 복사 */
  var share=document.getElementById('share');
  if(share){
    share.addEventListener('click',function(){
      var url=location.origin+location.pathname;
      copyText(url).then(function(ok){
        showToast(ok?'🔗 페이지 링크가 복사되었습니다':'주소창의 링크를 길게 눌러 복사해 주세요');
      });
    });
  }
})();
"""

HTML = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>실패 없이 시작하는 중년의 이커머스 AI 장사 지침서 | 쭈대표의 이커머스</title>
<meta name="description" content="4050 중년 셀러를 위한 이커머스 AI 장사 지침서 전체 본문을 웹에서 바로 읽고, 프롬프트 18선은 버튼 한 번으로 복사하세요. 소장용 PDF도 이 페이지에서 받을 수 있습니다.">
<meta name="theme-color" content="#0F172A">
<meta property="og:title" content="실패 없이 시작하는 중년의 이커머스 AI 장사 지침서 | 쭈대표의 이커머스">
<meta property="og:description" content="지침서 전체 본문 읽기부터 프롬프트 18선 원클릭 복사까지, 링크 하나로 끝냅니다.">
<meta property="og:type" content="article">
<meta property="og:image" content="https://juhwan7812-dot.github.io/4050-ai-prompts/img/cover-560.png">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%230F172A'/%3E%3Ctext x='50' y='70' font-size='52' text-anchor='middle'%3E%F0%9F%93%98%3C/text%3E%3C/svg%3E">
<link rel="preload" href="fonts/GmarketSansTTFBold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/GmarketSansTTFMedium.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face{{font-family:"Gmarket Sans";font-weight:300;font-style:normal;font-display:swap;src:url("fonts/GmarketSansTTFLight.woff2") format("woff2")}}
@font-face{{font-family:"Gmarket Sans";font-weight:500;font-style:normal;font-display:swap;src:url("fonts/GmarketSansTTFMedium.woff2") format("woff2")}}
@font-face{{font-family:"Gmarket Sans";font-weight:700;font-style:normal;font-display:swap;src:url("fonts/GmarketSansTTFBold.woff2") format("woff2")}}
{CSS}
</style>
</head>
<body id="top">

<nav class="topbar" aria-label="페이지 바로가기"><div class="inner">
  <a class="tab on" href="#guide"><span class="ic" aria-hidden="true">📖</span><span>본문</span></a>
  <a class="tab" href="#prompts"><span class="ic" aria-hidden="true">📋</span><span>프롬프트 18선</span></a>
  <a class="tab" href="#pdf"><span class="ic" aria-hidden="true">📥</span><span>PDF</span></a>
</div></nav>

<header class="hero"><div class="wrap">
  <span class="avatar"><picture>
    <source srcset="img/cover-280.webp" type="image/webp">
    <img src="img/cover-280.png" alt="쭈대표 캐리커처" width="280" height="280" loading="eager">
  </picture></span>
  <span class="kicker">4050 인생 2막 · 유튜브에서 약속한 그 지침서</span>
  <h1>실패 없이 시작하는<span class="g">중년의 이커머스 AI 장사 지침서</span></h1>
  <p class="lead">PDF 다운로드 없이 <b>지침서 전체 본문</b>을 여기서 읽으시고, <b>프롬프트 18선</b>은 버튼 한 번으로 복사해 쓰십시오.</p>
  <div class="chips"><span class="chip">유통 18년</span><span class="chip">온라인 셀러 3년</span><span class="chip">프롬프트 18선 수록</span></div>
  <div class="rule"></div>
  <div class="btn-row">
    <a class="btn btn-yt" href="{YOUTUBE}" target="_blank" rel="noopener"><span class="ico" aria-hidden="true">▶</span><span>쭈대표 유튜브 구독하기 (@JJU_E-Commerce)</span></a>
  </div>
  <div class="quick">
    <a class="btn btn-nav q-full" href="#guide"><span class="ico" aria-hidden="true">📖</span><span>지침서 본문 보기</span><span class="ar" aria-hidden="true">↓</span></a>
    <a class="btn btn-nav" href="#prompts"><span class="ico" aria-hidden="true">📋</span><span>프롬프트 18선</span></a>
    <a class="btn btn-nav" href="#pdf"><span class="ico" aria-hidden="true">📥</span><span>소장용 PDF 받기</span></a>
  </div>
</div></header>

<div class="wrap zone" id="guide">
  <div class="zone-head">
    <span class="zh">지침서 전체 본문</span>
    <h2>제1장부터 에필로그까지</h2>
    <p>책으로 낸 원고를 한 글자도 줄이지 않고 그대로 옮겼습니다. 폰에서 확대하지 않고 읽으실 수 있게 큰 글씨로 세팅했습니다.</p>
  </div>

  <section class="intro">
    <h2>이 페이지 하나로 끝냅니다</h2>
    <p>지금까지는 PDF를 받아 폰 뷰어로 열어야 했고, 그 안에서는 보안 설정 때문에 프롬프트 <b>복사</b>가 막혔습니다. 이제 링크 하나만 누르면 <b>지침서 전체 본문 읽기</b>부터 <b>프롬프트 원클릭 복사</b>까지 바로 됩니다.</p>
    <p>본문을 읽다가 프롬프트가 나오면 그 자리에서 <b>[📋 이 프롬프트 복사]</b>를 누르십시오. 18개 전체를 한 번에 훑고 싶으시면 <a href="#prompts">프롬프트 18선</a>으로 바로 가시면 됩니다.</p>
    <p>골드색 <b>[대괄호]</b> 자리는 예시입니다. 내 상품명·가격·송장번호로 바꿔 넣으시면 됩니다.</p>
    <p class="byline"><b>쭈대표</b> — 오프라인 유통 18년(2008년~) · 온라인 셀러 3년<br>화려한 요행 대신 정직한 1원 계산으로 가족을 지키는 1인 쇼핑몰 첫걸음</p>
  </section>

  <nav class="booktoc" aria-label="지침서 차례">
    <h2>지침서 차례</h2>
    <p class="sub">장을 누르면 그 자리로 바로 이동합니다.</p>
    <div class="toc">
{BOOK_TOC}
    </div>
  </nav>

{BOOK_BODY}

  <a class="top-link" href="#top">▲ 맨 위로</a>
</div>

<div class="wrap zone" id="prompts">
  <div class="zone-head">
    <span class="zh">부록</span>
    <h2>프롬프트 18선 원클릭 복사</h2>
    <p>18개 전부 무료 플랜에서도 돌려볼 수 있습니다. 버튼을 누르면 전문이 복사되고, 챗GPT·클로드에 붙여넣으면 끝납니다.</p>
  </div>

  <nav class="idx" aria-label="프롬프트 목차">
    <h2>18선 바로가기</h2>
    <p class="sub">번호를 누르면 해당 프롬프트 카드로 이동합니다.</p>
    <div class="idx-grid">
{IDX}
    </div>
  </nav>

{CARDS}

  <a class="top-link" href="#top">▲ 맨 위로</a>
</div>

<div class="wrap zone" id="pdf">
  <div class="zone-head">
    <span class="zh">소장용</span>
    <h2>PDF로도 간직하십시오</h2>
    <p>손에 들고 여러 번 보실 분을 위해 만들었습니다. 버튼 하나면 기기에 맞는 판으로 바로 열립니다.</p>
  </div>
  <div class="pdf-box">
    <p class="pdf-head">📥 소장용 무료 지침서 PDF</p>
    <p class="pdf-sub">휴대폰은 세로 42장 · PC는 가로 29장으로 자동 선택됩니다</p>
    <a class="btn btn-pdf" id="pdfMain" href="{PDF_MOBILE}" target="_blank" rel="noopener" data-mobile="{PDF_MOBILE}" data-pc="{PDF_PC}" aria-label="소장용 무료 지침서 PDF 받기"><span class="ico" aria-hidden="true">📥</span><span class="pdf-txt"><b>소장용 무료 지침서 PDF 받기</b><em>가입·이메일 입력 없이 바로 열립니다</em></span></a>
    <p class="pdf-foot">페이지 안에서 본문 읽기와 프롬프트 복사가 모두 되니, PDF는 보관용으로만 쓰셔도 됩니다</p>
    <p class="pdf-mini">직접 선택: <a href="{PDF_MOBILE}" target="_blank" rel="noopener">모바일용(42장)</a><span class="sep">·</span><a href="{PDF_PC}" target="_blank" rel="noopener">PC용(29장)</a><span class="sep">·</span><a href="{PDF_PPTX}" target="_blank" rel="noopener">PPTX 편집본</a></p>
  </div>
</div>

<div class="wrap">
  <section class="cta">
    <h2>혼자 하지 마세요.<br>옆에서 같이 계산해 드립니다.</h2>
    <p>매주 4050 중년 셀러를 위한 정직한 실전 유통 영상이 올라옵니다.</p>
    <a class="btn btn-yt" href="{YOUTUBE}" target="_blank" rel="noopener"><span class="ico" aria-hidden="true">▶</span><span>쭈대표 유튜브 구독하기 (@JJU_E-Commerce)</span></a>
    <div class="btn-2" style="margin-top:10px">
      <a class="btn btn-ai" href="{CHATGPT}" target="_blank" rel="noopener"><span class="ico" aria-hidden="true">💬</span><span>챗GPT 바로가기</span></a>
      <a class="btn btn-ai claude" href="{CLAUDE}" target="_blank" rel="noopener"><span class="ico" aria-hidden="true">🤖</span><span>클로드 바로가기</span></a>
    </div>
    <button type="button" class="btn btn-ghost" id="share" style="margin-top:10px"><span class="ico" aria-hidden="true">🔗</span><span>이 페이지 링크 복사하기</span></button>
  </section>

  <p class="foot">
    지침서에 나오는 상품명·가격·마진 수치는 이해를 돕기 위한 <b>예시</b>입니다. [대괄호] 자리를 내 상품의 실제 숫자로 바꿔 넣으십시오.<br>
    1위안=300원 도착단가는 작고 가벼운 생활용품 기준의 예시 계수이며, 부피(CBM)·무게·운임·수수료 조건에 따라 달라집니다.<br><br>
    © 쭈대표의 이커머스 · <a href="{YOUTUBE}" target="_blank" rel="noopener">@JJU_E-Commerce</a>
  </p>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script>{JS}</script>
</body>
</html>
"""

(HERE / "index.html").write_text(HTML, encoding="utf-8")

# ------------------------------------------------------------ 폰트 서브셋
text = re.sub(r"<[^>]+>", "", HTML)
prev = (HERE / "_chars.txt").read_text(encoding="utf-8") if (HERE / "_chars.txt").exists() else ""
extras = (
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ "
    ".,:;!?()[]{}<>/*-+=%&@#'\"~·…•▶▲▼✅📋💬🤖🔗📱💻📥📖📘🔔🎥👉↑↓①②③④⑤⑥⑦⑧"
)
chars = "".join(sorted(set(text) | set(extras) | set(prev)))
(HERE / "_chars.txt").write_text(chars, encoding="utf-8")

try:
    from fontTools import subset as ftsubset

    src = ROOT / ".work" / "fonts"
    for name in ("GmarketSansTTFLight", "GmarketSansTTFMedium", "GmarketSansTTFBold"):
        if not (src / (name + ".ttf")).exists():
            print("skip (source missing):", name)
            continue
        ftsubset.main([
            str(src / (name + ".ttf")),
            "--text=" + chars,
            "--flavor=woff2",
            "--output-file=" + str(HERE / "fonts" / (name + ".woff2")),
            "--layout-features=*",
            "--no-hinting",
            "--desubroutinize",
            "--ignore-missing-glyphs",
        ])
    print("fonts subset ok")
except Exception as e:  # noqa: BLE001
    print("font subset failed:", e)

print("index.html written:", (HERE / "index.html").stat().st_size, "bytes |", len(chars), "unique chars")
print("sections:", len(BOOK.sections), "| chapters:", CHAPTER_COUNT, "| toc:", len(BOOK.toc))
