# -*- coding: utf-8 -*-
"""4050 프롬프트 18선 — 원클릭 복사 모바일 웹페이지 빌더.

원고(viral-marketing/4050중년셀러-이커머스-AI장사지침서-전체원고.md)의
프롬프트 본문을 .work/prompts_data.py에서 그대로 가져와 index.html을 만든다.
"""
import html
import importlib.util
import json
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
    """escape + [대괄호] 골드 강조"""
    out = esc(t)
    return BRACKET.sub(lambda m: '<mark class="ph">[%s]</mark>' % m.group(1), out)


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


def toc() -> str:
    items = []
    for p in PROMPTS:
        color = CAT_COLOR.get(p["cat"], "#B45309")
        items.append(
            f'<a class="toc-item" href="#p{p["no"]:02d}"><span class="toc-no" style="color:{color}">{p["no"]:02d}</span>'
            f'<span class="toc-t">{esc(p["title"])}</span></a>'
        )
    return "\n".join(items)


CARDS = "".join(card(p) for p in PROMPTS)
TOC = toc()

CSS = """
:root{
  --navy:#0F172A; --navy-2:#16233C; --navy-3:#20304D;
  --gold:#D97706; --gold-2:#F0A93B; --gold-deep:#B45309;
  --ink:#0F172A; --paper:#FFFFFF; --muted:#94A3B8;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{
  margin:0;background:var(--navy);color:#E5EAF3;
  font-family:"Gmarket Sans","Apple SD Gothic Neo","Malgun Gothic",system-ui,"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;
  font-size:18px;line-height:1.72;letter-spacing:-.01em;
  word-break:keep-all;overflow-wrap:anywhere;
}
img{max-width:100%}
a{color:inherit}
.wrap{max-width:680px;margin:0 auto;padding:0 16px}

/* 상단 고정 바 */
.topbar{
  position:sticky;top:0;z-index:50;
  background:rgba(15,23,42,.94);backdrop-filter:blur(10px);
  border-bottom:1px solid rgba(217,119,6,.35);
}
.topbar .inner{max-width:680px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;gap:10px}
.topbar .who{font-size:13px;font-weight:700;color:var(--gold-2);letter-spacing:.02em}
.topbar .name{font-size:15px;font-weight:700;color:#fff;margin-left:auto}

/* 히어로 */
.hero{padding:34px 0 10px;text-align:center}
.hero .kicker{display:inline-block;font-size:14px;font-weight:700;color:var(--gold-2);letter-spacing:.06em;margin-bottom:14px}
.hero h1{margin:0;font-size:31px;line-height:1.34;font-weight:700;color:#fff;letter-spacing:-.03em}
.hero h1 .g{color:var(--gold-2);display:block;font-size:37px;margin-top:4px}
.hero .lead{margin:16px auto 0;max-width:520px;font-size:17px;line-height:1.7;color:#C7D2E4}
.hero .lead b{color:#fff}
.chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:20px 0 0}
.chip{border:1.5px solid rgba(240,169,59,.75);color:var(--gold-2);border-radius:999px;padding:8px 14px;font-size:14px;font-weight:700;line-height:1}
.rule{width:56px;height:3px;background:var(--gold);border-radius:2px;margin:24px auto 0}

/* 상단 버튼 */
.btn{
  display:flex;align-items:center;justify-content:center;gap:9px;width:100%;
  min-height:62px;padding:14px 16px;border:0;border-radius:16px;
  font-family:inherit;font-size:19px;font-weight:700;letter-spacing:-.02em;
  text-decoration:none;cursor:pointer;touch-action:manipulation;
}
.btn .ico{font-size:22px;line-height:1}
.btn-yt{background:linear-gradient(180deg,#F0A93B,#D97706);color:#1A1206;box-shadow:0 8px 22px rgba(217,119,6,.32);font-size:17.5px;letter-spacing:-.03em;padding:14px 10px}
.btn-ai{background:rgba(255,255,255,.07);color:#fff;border:1.5px solid rgba(255,255,255,.22);min-height:54px;font-size:16px}
.btn-ai.claude{border-color:rgba(240,169,59,.55)}
.btn-row{display:grid;gap:10px;margin:24px 0 0}
.btn-2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}

/* 지침서 PDF 다운로드 */
.pdf-box{margin:20px 0 0;padding:16px 14px 13px;border:1px solid rgba(240,169,59,.42);border-radius:20px;background:rgba(240,169,59,.09);text-align:left}
.pdf-head{margin:0 0 11px;font-size:14.5px;font-weight:700;color:#FFD79A;line-height:1.45;text-align:center;letter-spacing:-.02em}
.btn-pdf{
  justify-content:flex-start;gap:9px;min-height:66px;padding:12px 13px;
  background:linear-gradient(180deg,#FFFFFF,#E7EEF8);color:var(--navy);
  border:1.5px solid rgba(240,169,59,.85);
  box-shadow:0 8px 20px rgba(0,0,0,.2);text-align:left;
}
.btn-pdf .ico{font-size:23px}
.pdf-txt{display:flex;flex-direction:column;min-width:0}
.pdf-txt b{font-size:16px;font-weight:700;letter-spacing:-.03em;line-height:1.25}
.pdf-txt em{font-style:normal;font-size:12.5px;font-weight:500;color:#5A6B85;margin-top:3px;line-height:1.2;letter-spacing:-.01em}
.pdf-foot{margin:10px 0 0;font-size:12.5px;color:#A9B7CC;line-height:1.5;text-align:center}
.pdf-mini{margin:8px 0 0;font-size:12px;line-height:1.6;color:#8E9FB8;text-align:center;letter-spacing:-.02em}
.pdf-mini a{color:#B9C6DA;text-decoration:none;border-bottom:1px solid rgba(185,198,218,.35);white-space:nowrap}
.pdf-mini .sep{color:#5C6B84;padding:0 2px}
/* 목차 */
.toc-box{margin:34px 0 0;padding:20px 16px;border:1px solid rgba(255,255,255,.13);border-radius:20px;background:rgba(255,255,255,.04)}
.toc-box h2{margin:0 0 4px;font-size:17px;color:#fff}
.toc-box p.sub{margin:0 0 14px;font-size:14px;color:var(--muted)}
.toc{display:grid;gap:8px}
.toc-item{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;background:rgba(255,255,255,.06);text-decoration:none;border:1px solid rgba(255,255,255,.08)}
.toc-no{font-size:14px;font-weight:700;min-width:22px;font-variant-numeric:tabular-nums}
.toc-t{font-size:15px;color:#E5EAF3;line-height:1.35;font-weight:500}

/* 카드 */
main{padding:26px 0 8px}
.sec-head{display:flex;align-items:baseline;gap:10px;margin:30px 0 14px}
.sec-head h2{margin:0;font-size:20px;color:#fff}
.sec-head .n{font-size:14px;color:var(--gold-2);font-weight:700}
.card{
  background:var(--paper);color:var(--ink);border-radius:22px;
  padding:22px 18px 18px;margin:0 0 20px;
  box-shadow:0 14px 34px rgba(0,0,0,.28);
  scroll-margin-top:64px;
}
.card:target{box-shadow:0 0 0 3px var(--gold),0 14px 34px rgba(0,0,0,.28)}
.card-top{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.no{font-size:14px;font-weight:700;color:#fff;background:var(--navy);border-radius:8px;padding:5px 9px;line-height:1;font-variant-numeric:tabular-nums}
.cat{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:#334155;background:#EEF2F7;border-radius:999px;padding:6px 10px;line-height:1}
.cat i{width:8px;height:8px;border-radius:50%;display:inline-block}
.ct{margin:0 0 8px;font-size:21px;line-height:1.4;font-weight:700;color:var(--ink);letter-spacing:-.03em}
.hint{margin:0 0 14px;font-size:14.5px;line-height:1.6;color:#64748B}
.code{
  margin:0 0 16px;padding:16px 14px;
  background:#F6F8FB;border:1px solid #E2E8F0;border-left:5px solid var(--gold);
  border-radius:14px;
  font-family:"Gmarket Sans","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif;
  font-size:16.5px;line-height:1.78;color:#111827;
  white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere;
}
.ph{background:#FFF0D2;color:#9A4A06;font-weight:700;border-radius:4px;padding:0 2px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.btn.copy{background:linear-gradient(180deg,#E8890C,#B45309);color:#fff;box-shadow:0 8px 20px rgba(180,83,9,.32);font-size:20px;min-height:64px}
.btn.copy .lbl{letter-spacing:-.01em}
.btn.copy.done{background:linear-gradient(180deg,#12805C,#0B6444);box-shadow:0 8px 20px rgba(11,100,68,.32)}
.after{margin:10px 0 0;font-size:13.5px;color:#64748B;text-align:center}

/* 하단 CTA */
.cta{margin:34px 0 0;padding:26px 18px;border-radius:22px;background:linear-gradient(180deg,#1B2A45,#131E33);border:1px solid rgba(240,169,59,.28);text-align:center}
.cta h2{margin:0 0 8px;font-size:22px;color:#fff;line-height:1.4}
.cta p{margin:0 0 18px;font-size:15.5px;color:#B9C6DA}
.foot{margin:26px 0 40px;text-align:center;font-size:12.5px;color:#7C8AA0;line-height:1.7}
.foot a{color:#9FB0C7;text-decoration:none;border-bottom:1px solid rgba(159,176,199,.4)}
.top-link{display:block;text-align:center;margin:6px 0 0;font-size:14.5px;color:var(--gold-2);text-decoration:none;font-weight:700}
.note{margin:18px 0 0;padding:14px 16px;border-radius:14px;background:rgba(240,169,59,.1);border:1px solid rgba(240,169,59,.3);font-size:14.5px;color:#EBD5B4;line-height:1.65;text-align:left}
.note b{color:#FFD79A}

/* 토스트 */
.toast{
  position:fixed;left:50%;bottom:22px;z-index:90;
  transform:translate(-50%,160%);transition:transform .28s cubic-bezier(.2,.8,.2,1);
  max-width:92vw;padding:14px 20px;border-radius:999px;
  background:#0B1220;border:1.5px solid var(--gold);
  color:#fff;font-size:15.5px;font-weight:700;line-height:1.4;text-align:center;
  box-shadow:0 14px 34px rgba(0,0,0,.55);
}
.toast.show{transform:translate(-50%,0)}
@media (min-width:520px){.btn-2{grid-template-columns:1fr 1fr}}
/* 좁은 폰(360~420px) */
@media (max-width:430px){
  .hero h1{font-size:25px}
  .hero h1 .g{font-size:30px}
  .hero .lead{font-size:15.5px}
  .btn{font-size:16.5px}
  .btn-yt{font-size:15px;line-height:1.3;padding:12px 8px;min-height:58px}
  .btn-ai{font-size:14.5px;min-height:50px;gap:5px;padding:10px 3px}
  .btn-ai .ico{font-size:17px}
  .pdf-box{margin-top:16px;padding:14px 12px 11px;border-radius:16px}
  .pdf-head{font-size:13.5px;margin-bottom:9px}
  .pdf-mini{font-size:11.5px;line-height:1.65}
  .btn-pdf{min-height:58px;padding:11px 12px;gap:9px}
  .btn-pdf .ico{font-size:21px}
  .pdf-txt b{font-size:16px}
  .pdf-txt em{font-size:12px;margin-top:2px}
  .pdf-foot{font-size:12px;margin-top:8px}
  .btn.copy{font-size:18px;min-height:60px}
  .card{padding:18px 14px 16px;border-radius:18px}
  .ct{font-size:19px}
  .code{font-size:16px;padding:14px 12px}
  .chip{font-size:12.5px;padding:7px 11px}
  .toast{font-size:14px;padding:12px 14px}
  .toc-t{font-size:14px}
  .cta h2{font-size:19px}
}
@media (max-width:340px){
  .btn-2{grid-template-columns:1fr}
  .hero h1{font-size:22px}
  .hero h1 .g{font-size:26px}
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
    var card=document.getElementById(btn.getAttribute('data-copy'));
    if(!card){return;}
    var raw=card.querySelector('.raw');
    var text=raw?raw.textContent:card.querySelector('.code').innerText;
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
<title>프롬프트 18선 원클릭 복사 | 쭈대표의 이커머스</title>
<meta name="description" content="4050 중년 셀러를 위한 AI 장사 지침서 프롬프트 18선. 버튼 한 번 누르면 전문이 복사됩니다. 챗GPT·클로드에 붙여넣기만 하세요.">
<meta name="theme-color" content="#0F172A">
<meta property="og:title" content="프롬프트 18선 원클릭 복사 | 쭈대표의 이커머스">
<meta property="og:description" content="버튼 한 번 누르면 프롬프트 전문이 복사됩니다. 4050 중년 셀러 AI 장사 지침서 18선.">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%230F172A'/%3E%3Ctext x='50' y='70' font-size='54' text-anchor='middle'%3E%F0%9F%93%8B%3C/text%3E%3C/svg%3E">
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
<div class="topbar"><div class="inner">
  <span class="who">쭈대표의 이커머스</span>
  <span class="name">프롬프트 18선</span>
</div></div>

<header class="hero"><div class="wrap">
  <span class="kicker">4050 인생 2막 · 실전 유통 가이드</span>
  <h1>버튼 한 번이면 끝나는<span class="g">AI 프롬프트 18선</span></h1>
  <p class="lead">복잡하게 타이핑하지 마세요. <b>[📋 프롬프트 복사하기]</b>를 누르고, 챗GPT나 클로드 입력창에 <b>붙여넣기만</b> 하면 됩니다.</p>
  <div class="chips"><span class="chip">유통 18년</span><span class="chip">온라인 셀러 3년</span><span class="chip">프롬프트 18선 수록</span></div>
  <div class="rule"></div>
  <div class="btn-row">
    <a class="btn btn-yt" href="{YOUTUBE}" target="_blank" rel="noopener"><span class="ico" aria-hidden="true">▶</span><span>쭈대표 유튜브 구독하기 (@JJU_E-Commerce)</span></a>
    <div class="btn-2">
      <a class="btn btn-ai" href="{CHATGPT}" target="_blank" rel="noopener"><span class="ico" aria-hidden="true">💬</span><span>챗GPT 바로가기</span></a>
      <a class="btn btn-ai claude" href="{CLAUDE}" target="_blank" rel="noopener"><span class="ico" aria-hidden="true">🤖</span><span>클로드 바로가기</span></a>
    </div>
  </div>
  <div class="pdf-box">
    <p class="pdf-head">📥 지침서 PDF, 버튼 하나면 끝납니다</p>
    <a class="btn btn-pdf" id="pdfMain" href="{PDF_MOBILE}" target="_blank" rel="noopener" data-mobile="{PDF_MOBILE}" data-pc="{PDF_PC}" aria-label="무료 지침서 PDF 받기"><span class="ico" aria-hidden="true">📥</span><span class="pdf-txt"><b>무료 지침서 PDF 받기</b><em>휴대폰·PC 화면에 맞춰 자동으로 열립니다</em></span></a>
    <p class="pdf-foot">가입·이메일 입력 없이 바로 열립니다</p>
    <p class="pdf-mini">직접 선택: <a href="{PDF_MOBILE}" target="_blank" rel="noopener">모바일용(42장)</a><span class="sep">·</span><a href="{PDF_PC}" target="_blank" rel="noopener">PC용(29장)</a><span class="sep">·</span><a href="{PDF_PPTX}" target="_blank" rel="noopener">PPTX 편집본</a></p>
  </div>
  <div class="note"><b>사용법 3단계</b> — ① 아래에서 필요한 프롬프트를 찾습니다. ② <b>복사 버튼</b>을 누릅니다. ③ 챗GPT·클로드에 붙여넣고, <b>골드색 [대괄호]</b> 자리만 내 상품으로 바꿉니다.</div>
</div></header>

<div class="wrap">
  <nav class="toc-box" aria-label="프롬프트 목차">
    <h2>목차 — 18선 바로가기</h2>
    <p class="sub">번호를 누르면 해당 프롬프트로 바로 이동합니다.</p>
    <div class="toc">
{TOC}
    </div>
  </nav>
</div>

<main class="wrap">
  <div class="sec-head"><h2>프롬프트 18선 전문</h2><span class="n">전 18개 · 순서대로</span></div>
{CARDS}

  <a class="top-link" href="#top">▲ 맨 위 목차로</a>

  <section class="cta" id="more">
    <h2>혼자 하지 마세요.<br>옆에서 같이 계산해 드립니다.</h2>
    <p>매주 4050 중년 셀러를 위한 정직한 실전 유통 영상이 올라옵니다.</p>
    <a class="btn btn-yt" href="{YOUTUBE}" target="_blank" rel="noopener"><span class="ico" aria-hidden="true">▶</span><span>쭈대표 유튜브 구독하기 (@JJU_E-Commerce)</span></a>
    <div class="btn-2">
      <a class="btn btn-ai" href="{CHATGPT}" target="_blank" rel="noopener"><span class="ico" aria-hidden="true">💬</span><span>챗GPT 바로가기</span></a>
      <a class="btn btn-ai claude" href="{CLAUDE}" target="_blank" rel="noopener"><span class="ico" aria-hidden="true">🤖</span><span>클로드 바로가기</span></a>
    </div>
    <button type="button" class="btn btn-ai" id="share" style="margin-top:10px"><span class="ico" aria-hidden="true">🔗</span><span>이 페이지 링크 복사하기</span></button>
  </section>

  <p class="foot">
    프롬프트에 나오는 상품명·가격·마진 수치는 이해를 돕기 위한 <b>예시</b>입니다. [대괄호] 자리를 내 상품의 실제 숫자로 바꿔 넣으십시오.<br>
    1위안=300원 도착단가는 작고 가벼운 생활용품 기준의 예시 계수이며, 부피(CBM)·무게·운임·수수료 조건에 따라 달라집니다.<br><br>
    © 쭈대표의 이커머스 · <a href="{YOUTUBE}" target="_blank" rel="noopener">@JJU_E-Commerce</a>
  </p>
</main>

<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script>{JS}</script>
</body>
</html>
"""

(HERE / "index.html").write_text(HTML, encoding="utf-8")

# 폰트 서브셋 (페이지에 실제로 쓰인 글자만)
text = re.sub(r"<[^>]+>", "", HTML)
chars = sorted(set(text) | set("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ .,:;!?()[]{}<>/*-+=%&@#'\"~·…•▶▲✅📋💬🤖🔗📱💻📥①②③"))
(HERE / "_chars.txt").write_text("".join(chars), encoding="utf-8")
print("index.html written:", (HERE / "index.html").stat().st_size, "bytes |", len(chars), "unique chars")
