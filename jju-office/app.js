/* ============================================================
   쭈대표 AI 오피스 · app
   ============================================================ */
(function () {
  'use strict';

  var LS_KEY = 'jju-office-store-v1';

  /* ---------------- people ---------------- */
  var PEOPLE = {
    boss:     { name: '쭈대표', initial: '대', cls: 'p-boss', device: '' },
    director: { name: '주드', title: '총괄이사', initial: '주', cls: 'p-director', device: '본폰' },
    jju1:     { name: '하루', title: '팀장', initial: '하', cls: 'p-jju1', device: '1번 폰' },
    jju2:     { name: '다온', title: '과장', initial: '다', cls: 'p-jju2', device: '2번 폰' },
    jju3:     { name: '로이', title: '대리', initial: '로', cls: 'p-jju3', device: '3번 폰' }
  };

  /* 화면 표시 이름은 직함까지 붙입니다 — 주드 총괄이사 · 하루 팀장 · 다온 과장 · 로이 대리
     아바타 원 글자(initial)와 내부 키(id)·멘션(@주드)은 짧은 이름 그대로 둡니다. */
  function pname(p) { return p ? (p.title ? p.name + ' ' + p.title : p.name) : ''; }
  function pnameOf(id) { return pname(PEOPLE[id]) || id; }
  var CREW_IDS = ['director', 'jju1', 'jju2', 'jju3'];

  /* ---------------- 캐릭터 아바타 (v36) ---------------- */
  /* 4인방 아바타는 외부 파일 요청 없이 그리는 인라인 SVG입니다(선명·가벼움·오프라인 안전).
     id·defs·외부 참조를 쓰지 않아 여러 번 복제해도 충돌하지 않습니다. */
  var CHAR_ART = {
    /* 쭈대표(대표님) — v40: 대표님 공식 캐리커쳐(카카오 채널 프로필 640px → 160×160 리사이즈).
       사진이 안 뜨면(오프라인 첫 로딩·파일 없음) 아래 CHAR_ART_FALLBACK 의 그려 둔 캐릭터로 대신합니다. */
    boss: '<img class="char-img" src="assets/boss-avatar.png" alt="쭈대표 캐리커쳐" width="64" height="64" decoding="async">',
    director: '<svg class="char-svg" viewBox="0 0 64 64" role="presentation" focusable="false" aria-hidden="true"><rect width="64" height="64" fill="#243152"/><ellipse cx="32" cy="63" rx="31" ry="12" fill="#1B2540"/><rect x="27.4" y="35" width="9.2" height="12" rx="4.2" fill="#E0B590"/><path d="M2 64 C2 51.6 15.6 45 32 45 C48.4 45 62 51.6 62 64 Z" fill="#2E3E60"/><path d="M27 45.2 C30 45.1 34 45.1 37 45.2 L34.4 54.2 L29.6 54.2 Z" fill="#F2EFE5"/><path d="M27 45.2 L31.4 45.2 L32 48.8 L28.1 49.6 Z" fill="#243250"/><path d="M37 45.2 L32.6 45.2 L32 48.8 L35.9 49.6 Z" fill="#243250"/><path d="M32 47.4 L33.9 49.6 L33 58.6 Q32 59.4 31 58.6 L30.1 49.6 Z" fill="#E3B14C"/><path d="M30.7 45.8 h2.6 l1 1.6 h-4.6 Z" fill="#F0CB79"/><circle cx="45.8" cy="53" r="2.4" fill="#E3B14C"/><circle cx="45.8" cy="53" r="1" fill="#F7E0AC"/><ellipse cx="32" cy="25.8" rx="17.4" ry="15.6" fill="#4A4455"/><circle cx="32" cy="30.8" r="15.8" fill="#F4CFAE"/><circle cx="16.8" cy="32.0" r="3.1" fill="#E4B996"/><circle cx="47.199999999999996" cy="32.0" r="3.1" fill="#E4B996"/><path d="M15.4 26.2 C15.6 17.4 22.2 11.6 32 11.6 C42.2 11.6 49.2 17.6 48.6 26.6 C47.6 22.6 44.8 20.6 41.2 20.8 C37.8 21 35.4 22.6 31.8 22.4 C27.2 22.2 24.4 20 21.4 20.6 C18.6 21.2 16.4 23.2 15.4 26.2 Z" fill="#4A4455"/><path d="M33.6 12.4 C33.2 15.6 33 18.8 32.9 21.8" stroke="#6B6478" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M26.6 14.4 C25.2 16.8 24.4 19 24.2 21.2" stroke="#767084" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M40.4 15.4 C40.2 17.4 40 19.2 39.7 20.6" stroke="#767084" stroke-width="1.05" fill="none" stroke-linecap="round"/><path d="M15.8 24.4 C15.2 28.6 15.4 32.4 16.4 34.8 C17.4 31.6 17.8 27.8 17.4 24 Z" fill="#3E3849"/><path d="M48.2 24.4 C48.8 28.6 48.6 32.4 47.6 34.8 C46.6 31.6 46.2 27.8 46.6 24 Z" fill="#3E3849"/><rect x="24.5" y="28.2" width="3.6" height="1.5" rx="0.75" fill="#6A6376"/><rect x="35.900000000000006" y="28.2" width="3.6" height="1.5" rx="0.75" fill="#6A6376"/><g class="char-eyes"><circle cx="26.4" cy="32.6" r="2.5" fill="#2B2633"/><circle cx="37.6" cy="32.6" r="2.5" fill="#2B2633"/><circle cx="25.65" cy="31.700000000000003" r="0.85" fill="#FFFFFF"/><circle cx="36.85" cy="31.700000000000003" r="0.85" fill="#FFFFFF"/></g><g fill="none" stroke="#E3B14C" stroke-width="1.8" stroke-linejoin="round"><rect x="20.2" y="27.8" width="10.4" height="9" rx="2.4"/><rect x="33.4" y="27.8" width="10.4" height="9" rx="2.4"/><path d="M30.6 31.8 H33.4"/><path d="M20.2 30.6 L16.6 31.4"/><path d="M43.8 30.6 L47.4 31.4"/></g><path d="M21 28.6 H28.8 V31.4 H21 Z" fill="#FFFFFF" opacity="0.09"/><ellipse cx="21" cy="37" rx="3.2" ry="1.9" fill="#FF8A75" opacity="0.34"/><ellipse cx="43" cy="37" rx="3.2" ry="1.9" fill="#FF8A75" opacity="0.34"/><path d="M28.8 39.6 Q32 42 35.2 39.6" stroke="#A65C48" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>',
    jju1: '<svg class="char-svg" viewBox="0 0 64 64" role="presentation" focusable="false" aria-hidden="true"><rect width="64" height="64" fill="#E4574C"/><ellipse cx="32" cy="63" rx="31" ry="12" fill="#CB463C"/><rect x="27.4" y="35" width="9.2" height="12" rx="4.2" fill="#E6AE7E"/><path d="M2 64 C2 51.6 15.6 45 32 45 C48.4 45 62 51.6 62 64 Z" fill="#F2604F"/><path d="M27 45.2 C30 45.1 34 45.1 37 45.2 L34.4 54.2 L29.6 54.2 Z" fill="#FFE8DC"/><path d="M27 45.2 L31.4 45.2 L32 48.8 L28.1 49.6 Z" fill="#D94E3F"/><path d="M37 45.2 L32.6 45.2 L32 48.8 L35.9 49.6 Z" fill="#D94E3F"/><path d="M14.4 30.4 C14.4 15.6 22.4 6.4 32 6.4 C41.6 6.4 49.6 15.6 49.6 30.4 L49.6 43.6 C49.6 45.4 47.6 45.8 46.4 44.4 C45.2 43 45 39.4 45 36.4 L45 28 C45 24 41 21.6 32 21.6 C23 21.6 19 24 19 28 L19 36.4 C19 39.4 18.8 43 17.6 44.4 C16.4 45.8 14.4 45.4 14.4 43.6 Z" fill="#6E3A2B"/><circle cx="32" cy="30.8" r="15.8" fill="#F8D3AF"/><circle cx="16.8" cy="32.0" r="3.1" fill="#E7B78D"/><circle cx="47.199999999999996" cy="32.0" r="3.1" fill="#E7B78D"/><path d="M15.2 27.4 C15.4 19.2 22.4 14 32 14 C41.6 14 48.8 19.2 48.8 27.4 C47.4 23.4 44 21.2 39.4 21.6 C35.4 22 32.6 24 28.4 23.4 C23.4 22.6 18 23.6 15.2 27.4 Z" fill="#6E3A2B"/><path d="M20.4 18.4 C26.6 13.2 39.8 13.6 44.4 20.2 C37 18.4 27.6 21 22.8 25.2 C19.6 27.8 19.2 21.4 20.4 18.4 Z" fill="#87482F"/><rect x="24.5" y="28" width="3.6" height="1.5" rx="0.75" fill="#8A4E33"/><rect x="35.900000000000006" y="28" width="3.6" height="1.5" rx="0.75" fill="#8A4E33"/><g class="char-eyes"><circle cx="26.4" cy="32.6" r="2.5" fill="#2E2330"/><circle cx="37.6" cy="32.6" r="2.5" fill="#2E2330"/><circle cx="25.65" cy="31.700000000000003" r="0.85" fill="#FFFFFF"/><circle cx="36.85" cy="31.700000000000003" r="0.85" fill="#FFFFFF"/></g><ellipse cx="21" cy="37" rx="3.2" ry="1.9" fill="#FF8A75" opacity="0.55"/><ellipse cx="43" cy="37" rx="3.2" ry="1.9" fill="#FF8A75" opacity="0.55"/><path d="M28.6 39 Q32 43 35.4 39" stroke="#C2503F" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M15.6 28.6 C13.2 12.4 25.4 4.6 32 4.6 C38.6 4.6 50.8 12.4 48.4 28.6" fill="none" stroke="#3B2B2C" stroke-width="2.5" stroke-linecap="round"/><rect x="11.2" y="26.6" width="6.6" height="10.4" rx="3.3" fill="#3B2B2C"/><rect x="12.2" y="28.4" width="4.6" height="6.8" rx="2.3" fill="#F2604F"/><rect x="46.2" y="26.6" width="6.6" height="10.4" rx="3.3" fill="#3B2B2C"/><rect x="47.2" y="28.4" width="4.6" height="6.8" rx="2.3" fill="#F2604F"/><path d="M17.6 34.4 C17.6 40 21.8 42.4 25.6 41.2" fill="none" stroke="#3B2B2C" stroke-width="1.8" stroke-linecap="round"/><circle cx="26.2" cy="41" r="2" fill="#3B2B2C"/><path d="M52.4 14.6 L53.4 18.2 L57 19.2 L53.4 20.2 L52.4 23.8 L51.4 20.2 L47.8 19.2 L51.4 18.2 Z" fill="#FFE7A0"/></svg>',
    jju2: '<svg class="char-svg" viewBox="0 0 64 64" role="presentation" focusable="false" aria-hidden="true"><rect width="64" height="64" fill="#2E9E7E"/><ellipse cx="32" cy="63" rx="31" ry="12" fill="#25886C"/><rect x="27.4" y="35" width="9.2" height="12" rx="4.2" fill="#D5A47A"/><path d="M2 64 C2 51.6 15.6 45 32 45 C48.4 45 62 51.6 62 64 Z" fill="#3AA98A"/><path d="M27 45.2 C30 45.1 34 45.1 37 45.2 L34.4 54.2 L29.6 54.2 Z" fill="#F6FBF7"/><path d="M27 45.2 L31.4 45.2 L32 48.8 L28.1 49.6 Z" fill="#2C8E75"/><path d="M37 45.2 L32.6 45.2 L32 48.8 L35.9 49.6 Z" fill="#2C8E75"/><circle cx="32" cy="9" r="5.6" fill="#1F4B45"/><path d="M29.6 7.2 A3.4 3.4 0 0 1 34.4 6.6" stroke="#2E6A61" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle cx="32" cy="28.8" r="17.2" fill="#1F4B45"/><circle cx="32" cy="30.8" r="15.8" fill="#F3CCA8"/><circle cx="16.8" cy="32.0" r="3.1" fill="#E0B48C"/><circle cx="47.199999999999996" cy="32.0" r="3.1" fill="#E0B48C"/><path d="M15.2 27.2 C15.4 19 22.4 13.8 32 13.8 C41.6 13.8 48.6 19 48.8 27.2 C47.2 23.4 43.8 21.4 39 21.8 C35 22.2 32.4 24 28.2 23.4 C23.2 22.6 18 23.4 15.2 27.2 Z" fill="#1F4B45"/><path d="M20.6 18 C27 12.6 39.6 13 44.2 19.6 C36.8 17.8 27.4 20.4 22.6 24.6 C19.4 27.2 19.4 21 20.6 18 Z" fill="#2C6A61"/><path d="M17.2 22.4 L19 26.6 L16.2 26.8 Z" fill="#8FE3C9"/><rect x="24.5" y="28" width="3.6" height="1.5" rx="0.75" fill="#173D38"/><rect x="35.900000000000006" y="28" width="3.6" height="1.5" rx="0.75" fill="#173D38"/><g class="char-eyes"><circle cx="26.4" cy="32.6" r="2.5" fill="#22302E"/><circle cx="37.6" cy="32.6" r="2.5" fill="#22302E"/><circle cx="25.65" cy="31.700000000000003" r="0.85" fill="#FFFFFF"/><circle cx="36.85" cy="31.700000000000003" r="0.85" fill="#FFFFFF"/></g><g fill="none" stroke="#134A43" stroke-width="1.15" opacity="0.85"><circle cx="26.4" cy="32.6" r="5.2"/><circle cx="37.6" cy="32.6" r="5.2"/><path d="M31.6 32.2 H32.4"/><path d="M21.2 31.6 L17.6 30.6"/><path d="M42.8 31.6 L46.4 30.6"/></g><ellipse cx="21" cy="37" rx="3.2" ry="1.9" fill="#FF8A75" opacity="0.45"/><ellipse cx="43" cy="37" rx="3.2" ry="1.9" fill="#FF8A75" opacity="0.45"/><path d="M29 39.4 Q32 41.8 35 39.4" stroke="#8E5B45" stroke-width="1.8" stroke-linecap="round" fill="none"/><rect x="40.2" y="49" width="9.8" height="8.6" rx="2.2" fill="#F6FBF7"/><rect x="42" y="53.6" width="1.8" height="2.4" fill="#3AA98A"/><rect x="44.5" y="51.8" width="1.8" height="4.2" fill="#2C8E75"/><rect x="47" y="50.4" width="1.8" height="5.6" fill="#3AA98A"/></svg>',
    jju3: '<svg class="char-svg" viewBox="0 0 64 64" role="presentation" focusable="false" aria-hidden="true"><rect width="64" height="64" fill="#6E7FC8"/><ellipse cx="32" cy="63" rx="31" ry="12" fill="#5C6DB4"/><rect x="27.4" y="35" width="9.2" height="12" rx="4.2" fill="#E4AE84"/><path d="M2 64 C2 51.6 15.6 45 32 45 C48.4 45 62 51.6 62 64 Z" fill="#7C63C4"/><path d="M27 45.2 C30 45.1 34 45.1 37 45.2 L34.4 54.2 L29.6 54.2 Z" fill="#A9DCF7"/><path d="M27 45.2 L31.4 45.2 L32 48.8 L28.1 49.6 Z" fill="#6A52AE"/><path d="M37 45.2 L32.6 45.2 L32 48.8 L35.9 49.6 Z" fill="#6A52AE"/><path d="M32 49.6 L32 61" stroke="#5E47A8" stroke-width="1.4" fill="none"/><ellipse cx="32" cy="27.4" rx="17.2" ry="15.4" fill="#4B3A78"/><circle cx="32" cy="30.8" r="15.8" fill="#F7D2AE"/><circle cx="16.8" cy="32.0" r="3.1" fill="#E5B58C"/><circle cx="47.199999999999996" cy="32.0" r="3.1" fill="#E5B58C"/><path d="M16.4 21.8 C17.6 25.6 19.4 27.6 21.8 28.6 C20.2 25.2 19.6 22.8 19.8 20.4 Z" fill="#4B3A78"/><path d="M47.6 21.8 C46.4 25.6 44.6 27.6 42.2 28.6 C43.8 25.2 44.4 22.8 44.2 20.4 Z" fill="#4B3A78"/><path d="M17.4 23 C24 20.6 40 20.6 46.6 23 C40 22.4 24 22.4 17.4 23 Z" fill="#3F3168" opacity="0.55"/><path d="M15.6 23.2 C15.8 12.6 23 6.6 32 6.6 C41 6.6 48.2 12.8 48.4 23.2 C40 19.8 24 19.8 15.6 23.2 Z" fill="#8FD3F4"/><path d="M15.6 23.2 C16 18.8 17.6 15.4 20.4 13.2 C21.2 17.6 22.8 20.6 25.2 22.8 Z" fill="#7AC7EE"/><path d="M46.8 20.4 C51.4 20.2 55.2 21.4 56.8 23.4 C57.8 24.8 57 26.4 54.6 26.8 C50.6 27.4 46.8 26 44.8 24 Z" fill="#7AC7EE"/><circle cx="32" cy="6.9" r="1.9" fill="#7AC7EE"/><rect x="24.5" y="29" width="3.6" height="1.5" rx="0.75" fill="#3A2C60"/><rect x="35.900000000000006" y="29" width="3.6" height="1.5" rx="0.75" fill="#3A2C60"/><g class="char-eyes"><path d="M22.6 33.2 Q26.2 30 29.8 33.2" stroke="#2A2230" stroke-width="1.9" fill="none" stroke-linecap="round"/><circle cx="37.6" cy="32.8" r="2.6" fill="#2A2230"/><circle cx="36.85" cy="31.9" r="0.9" fill="#FFFFFF"/></g><ellipse cx="21" cy="37" rx="3.2" ry="1.9" fill="#FF8A75" opacity="0.6"/><ellipse cx="43" cy="37" rx="3.2" ry="1.9" fill="#FF8A75" opacity="0.6"/><path d="M28.2 39 Q32 43.6 35.8 39" stroke="#B96A52" stroke-width="1.8" stroke-linecap="round" fill="none"/><circle cx="22.6" cy="54" r="4.6" fill="#A9DCF7"/><path d="M23.6 50.6 L21 54.4 L22.9 54.4 L21.8 57.6 L24.6 53.6 L22.7 53.6 Z" fill="#6E7FC8"/></svg>',
  };

  /* 사진 아바타가 뜨지 않을 때 쓰는 대체 그림 — 대표님 자리에 글자 배지가 나오지 않도록
    4인방과 같은 방식으로 그린 쭈대표 캐릭터를 남겨 둡니다. */
  var CHAR_ART_FALLBACK = {
    boss: '<svg class="char-svg" viewBox="0 0 64 64" role="presentation" focusable="false" aria-hidden="true"><rect width="64" height="64" fill="#8A5A2B"/><ellipse cx="32" cy="63" rx="31" ry="12" fill="#6E451C"/><rect x="27.4" y="35" width="9.2" height="12" rx="4.2" fill="#E3B48F"/><path d="M2 64 C2 51.6 15.6 45 32 45 C48.4 45 62 51.6 62 64 Z" fill="#33281E"/><path d="M27 45.2 C30 45.1 34 45.1 37 45.2 L34.4 54.2 L29.6 54.2 Z" fill="#FFF8EC"/><path d="M27 45.2 L31.4 45.2 L32 48.8 L28.1 49.6 Z" fill="#2B221A"/><path d="M37 45.2 L32.6 45.2 L32 48.8 L35.9 49.6 Z" fill="#2B221A"/><path d="M32 47.6 L34 50.6 L32 58.8 L30 50.6 Z" fill="#C79A3B"/><path d="M34 50.6 L33.2 53.4 L34.4 54.2 L35 51.6 Z" fill="#E3B14C"/><circle cx="44.8" cy="52.6" r="2.1" fill="#E9C464"/><circle cx="44.8" cy="52.6" r="0.9" fill="#FFF0C6"/><circle cx="32" cy="30.8" r="15.8" fill="#F4CFAE"/><circle cx="16.8" cy="32.0" r="3.1" fill="#E4B996"/><circle cx="47.2" cy="32.0" r="3.1" fill="#E4B996"/><path d="M15.6 27.2 C15.8 18.2 22.8 12.6 32 12.6 C41.4 12.6 48.4 18.4 48.4 27.4 C46.6 22.8 42.4 20.8 37.8 21.4 C34.2 21.8 32.6 23.2 28.6 22.6 C24 21.8 19.4 22.8 15.6 27.2 Z" fill="#2B2118"/><path d="M34.2 13.2 C33.6 16.2 33.3 18.8 33.2 21.6" stroke="#4E3E30" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M17.2 23.6 C16.4 26.6 16.2 29.6 16.6 32" stroke="#7E7264" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M46.8 23.6 C47.6 26.6 47.8 29.6 47.4 32" stroke="#7E7264" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M15.9 26.6 C15.1 30.4 15.3 33.8 16.3 36 C17.3 33 17.7 29.8 17.3 26.2 Z" fill="#241C14"/><path d="M48.1 26.6 C48.9 30.4 48.7 33.8 47.7 36 C46.7 33 46.3 29.8 46.7 26.2 Z" fill="#241C14"/><rect x="23.9" y="27.4" width="4.4" height="1.7" rx="0.85" fill="#241C14"/><rect x="35.7" y="27.4" width="4.4" height="1.7" rx="0.85" fill="#241C14"/><g class="char-eyes"><circle cx="26.4" cy="32.6" r="2.5" fill="#2A221B"/><circle cx="37.6" cy="32.6" r="2.5" fill="#2A221B"/><circle cx="25.65" cy="31.7" r="0.85" fill="#FFFFFF"/><circle cx="36.85" cy="31.7" r="0.85" fill="#FFFFFF"/></g><ellipse cx="21" cy="37.2" rx="3.2" ry="1.9" fill="#FF8A75" opacity="0.38"/><ellipse cx="43" cy="37.2" rx="3.2" ry="1.9" fill="#FF8A75" opacity="0.38"/><path d="M28.4 39.2 Q32 42.4 35.6 39.2" stroke="#A65C48" stroke-width="1.9" stroke-linecap="round" fill="none"/><path d="M28.2 45.2 C30 45.6 34 45.6 35.8 45.2" stroke="#FFF8EC" stroke-width="1" fill="none" opacity="0.5"/></svg>'
  };

  /* 아바타 칸(.map-avatar) 안에 캐릭터 그림(또는 사진)을 채웁니다. */
  function paintAvatar(node, id) {
    if (!node) return;
    node.innerHTML = '<span class="avatar-face">' + (CHAR_ART[id] || '') + '</span>';
    var img = node.querySelector('img.char-img');
    if (!img) return;
    function useFallback() {
      var face = node.querySelector('.avatar-face');
      if (!face) return;
      var art = CHAR_ART_FALLBACK[id];
      if (art) { face.innerHTML = art; return; }
      face.textContent = (PEOPLE[id] && PEOPLE[id].initial) || '·';
      node.classList.remove('avatar-char');
    }
    img.addEventListener('error', useFallback);
    if (img.complete && img.naturalWidth === 0) useFallback();
  }

  /* ---------------- 외부 AI 아이콘 (v39) ---------------- */
  /* ChatGPT·Codex 는 4인방처럼 캐릭터 그림이 없으므로, 서비스 성격(대화 / 코드)을 담은
     인라인 SVG 배지로 그립니다. 공식 로고를 그대로 옮기지 않은 자체 아이콘이며,
     id·defs·외부 참조를 쓰지 않아 여러 번 복제해도 충돌하지 않습니다. */
  var TOOL_ART = {
    chatgpt: '<svg class="tool-svg" viewBox="0 0 64 64" role="presentation" focusable="false" aria-hidden="true"><rect width="64" height="64" fill="#0E8C69"/><path d="M14 18.5 C14 16 16 14 18.5 14 H45.5 C48 14 50 16 50 18.5 V36.5 C50 39 48 41 45.5 41 H30 L20.5 48.6 V41 H18.5 C16 41 14 39 14 36.5 Z" fill="#EAFBF4"/><path d="M32 20.4 L34.4 27 L41 29.4 L34.4 31.8 L32 38.4 L29.6 31.8 L23 29.4 L29.6 27 Z" fill="#12A37B"/><circle cx="42.5" cy="24.5" r="1.9" fill="#12A37B"/></svg>',
    codex: '<svg class="tool-svg" viewBox="0 0 64 64" role="presentation" focusable="false" aria-hidden="true"><rect width="64" height="64" fill="#31384B"/><path d="M25 22 L16.5 31.6 L25 41.2" fill="none" stroke="#EAF0FF" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M39 22 L47.5 31.6 L39 41.2" fill="none" stroke="#EAF0FF" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M35 19.5 L29 44.5" fill="none" stroke="#8FE3C9" stroke-width="3.2" stroke-linecap="round"/><path d="M50.5 14.5 L51.3 17.2 L54 18 L51.3 18.8 L50.5 21.5 L49.7 18.8 L47 18 L49.7 17.2 Z" fill="#FFE7A0"/></svg>'
  };

  /* 🔋 AI 한도 표에 4인방과 함께 오르는 외부 AI 도구 2종.
     저장 키는 office_ai_quotas 의 id 그대로 'chatgpt' · 'codex' 입니다(스키마 변경 없음 — id 는 text). */
  var AI_TOOL_IDS = ['chatgpt', 'codex'];
  var AI_TOOLS = {
    chatgpt: { name: 'ChatGPT', role: 'OpenAI · 대화·자료 조사' },
    codex:   { name: 'Codex',   role: 'OpenAI · 코드·스크립트' }
  };
  var QUOTA_IDS = CREW_IDS.concat(AI_TOOL_IDS);
  var QUOTA_GROUPS = [
    { label: 'AI 비서 4인방', hint: '릴레이 추천 기준', ids: CREW_IDS },
    { label: '외부 AI 도구', hint: 'ChatGPT · Codex', ids: AI_TOOL_IDS }
  ];

  function isToolId(id) { return AI_TOOL_IDS.indexOf(id) !== -1; }

  var CREW = [
    {
      id: 'director', name: '주드 총괄이사', device: '본폰', handle: '지휘 총괄',
      role: '4인방 지시 하달과 결과 취합. 원고 사실 검수, 발행·시트 반영 확인, 일일 소싱 1종을 맡습니다.',
      tags: ['지휘', '원고 검수', '발행 확인', '소싱 1종']
    },
    {
      id: 'jju1', name: '하루 팀장', device: '1번 폰', handle: '@jju20231004',
      role: '스레드 1번 채널 운영. 월요일 유튜브 주제·대본 3종 추천과 원고 작성, 일일 소싱 1종을 맡습니다.',
      tags: ['1번 채널', '유튜브 대본', '소싱 1종']
    },
    {
      id: 'jju2', name: '다온 과장', device: '2번 폰', handle: '@songdossanai',
      role: '스레드 2번 채널 운영과 1688 신상품 서칭. 원고 작성과 발행 확인, 일일 소싱 1종을 맡습니다.',
      tags: ['2번 채널', '1688 서칭', '소싱 1종']
    },
    {
      id: 'jju3', name: '로이 대리', device: '3번 폰', handle: '@daliva_jnt',
      role: '스레드 3번 채널 운영. 업리카 세션 만료 시 직접 발행으로 대체하고, 오늘 할 일 프로그램과 소싱 1종을 맡습니다.',
      tags: ['3번 채널', '업리카 대응', '소싱 1종']
    }
  ];

  var ROOMS = {
    grand:   { meta: '🏛️ ' + CREW_IDS.map(pnameOf).join(' · ') + ' · 4명', placeholder: '지시를 한 줄로 (@all = 전원)' },
    command: { meta: '👑 쭈대표 · ' + pnameOf('director') + ' · 1:1', placeholder: pnameOf('director') + '에게 한 줄 지시' },
    lounge:  { meta: '☕ 자유 기록 · 아이디어와 공지', placeholder: '라운지에 남길 메모' }
  };

  /* 2026-11-26 오피스 기준 실제 진행 중인 할 일 — AI 서버 미연결 시 이 기기 목록으로 씁니다. */
  var TASKS_SEED = [
    { title: '로이 대리(3번 폰) 오피스 외부 연동 승인하기', owner: 'boss' },
    { title: '에이블리 12/1~3 77% 페이백 참여 여부 결정', owner: 'boss' },
    { title: '유튜브 [10회] 4050 AI 이렇게 시작하세요 QPrompt 확인·촬영', owner: 'boss' },
    { title: '컴퓨존 데스크탑 i51722 램 32GB·윈도우·배송지 결정', owner: 'boss' },
    { title: '소싱 시트 33~36행 검토 및 목요일 소싱 재개 여부 결정', owner: 'boss' },
    { title: '내일(11/27)부터 도매에빠지다 최신상품순 블로그 작성 개시', owner: 'jju2', due: 1 }
  ];

  function seedTasks() {
    return TASKS_SEED.map(function (t) {
      return {
        id: uid(), title: t.title, owner: t.owner, done: false,
        due_date: t.due === undefined ? '' : shiftISO(t.due),
        created_at: new Date().toISOString()
      };
    });
  }

  /* ---------------- state ---------------- */
  var state = {
    theme: 'light',
    view: 'office',
    room: 'grand',
    messages: [],
    tasks: [],
    taskFilter: 'all',
    dlCat: 'all',
    dlSort: 'new',
    quotas: [],
    supabase: { url: '', key: '' }
  };

  /* v39 — 서버 트래픽 절감 상태.
     cursor·primed 는 증분 조회(gt) 기준, fails 는 연속 실패(기준이 어긋났을 때 전체 재조회),
     paused 는 숨은 탭에서 폴링을 멈춰 둔 상태입니다. */
  var SB = { connected: false, timer: null, lastPull: 0, busy: false,
             tick: 0, cursor: '', primed: false, fails: 0, paused: false };

  /* 폴링 주기와 증분 조회 상한 (v39)
     — 예전에는 4.5초마다 office_messages 전체(최대 400행)를 다시 받았습니다.
       글이 쌓일수록 한 번의 폴링이 수십~수백 KB가 되어 무료 플랜 Egress(5GB)를 넘겼습니다. */
  var POLL_MS = 6000;
  var MSG_FIRST_LIMIT = 200;   /* 첫 조회: 최신 200건만 */
  var MSG_DELTA_LIMIT = 120;   /* 증분 1회 상한 — 꽉 차면 한 번 더 이어 받습니다 */

  var DEMO = false;
  try {
    DEMO = new URLSearchParams(location.search).get('demo') === '1';
  } catch (e) { DEMO = false; }

  var el = {};

  /* ---------------- utils ---------------- */
  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  function todayStamp() {
    var d = new Date();
    return new Date(d.getTime());
  }

  function iso(offsetMinutes) {
    return new Date(Date.now() - (offsetMinutes || 0) * 60000).toISOString();
  }

  function timeLabel(isoStr) {
    var d = new Date(isoStr);
    if (isNaN(d)) return '';
    var h = d.getHours();
    var m = d.getMinutes();
    var ap = h < 12 ? '오전' : '오후';
    var hh = h % 12;
    if (hh === 0) hh = 12;
    return ap + ' ' + hh + ':' + (m < 10 ? '0' + m : m);
  }

  function koDate() {
    try {
      return new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    } catch (e) {
      return '';
    }
  }

  function savePack(msgs) {
    return {
      theme: state.theme,
      view: state.view,
      room: state.room,
      messages: msgs,
      tasks: state.tasks,
      taskFilter: state.taskFilter,
      dlCat: state.dlCat,
      dlSort: state.dlSort,
      quotas: state.quotas,
      supabase: state.supabase
    };
  }

  function writeStore(pack) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(pack));
      return true;
    } catch (e) { return false; }
  }

  /* 기기 저장(data URL) 사진은 무겁습니다. 저장 한도를 넘으면 최근 keep장만 남긴 사본을 만듭니다
     — 화면(state)의 메시지는 건드리지 않습니다. */
  function trimPhotoCopies(msgs, keep) {
    var out = [];
    var seen = 0;
    for (var i = msgs.length - 1; i >= 0; i--) {
      var m = msgs[i];
      var isLocalPhoto = m && typeof m.image_url === 'string' && m.image_url.indexOf('data:') === 0;
      if (!isLocalPhoto) { out.unshift(m); continue; }
      seen += 1;
      if (seen <= keep) { out.unshift(m); continue; }
      var c = {};
      Object.keys(m).forEach(function (k) { c[k] = m[k]; });
      delete c.image_url;
      c.image_lost = true;
      out.unshift(c);
    }
    return out;
  }

  function save() {
    if (DEMO) return;
    var recent = state.messages.slice(-400);
    if (writeStore(savePack(recent))) return;
    /* 한도 초과 — 오래된 기기 저장 사진부터 정리해 글은 남깁니다. */
    if (writeStore(savePack(trimPhotoCopies(recent, 3)))) return;
    writeStore(savePack(trimPhotoCopies(recent, 0)));
  }

  function load() {
    if (DEMO) return false;
    var raw = null;
    try { raw = localStorage.getItem(LS_KEY); } catch (e) { raw = null; }
    if (!raw) return false;
    try {
      var s = JSON.parse(raw);
      if (!s || typeof s !== 'object') return false;
      state.theme = s.theme === 'dark' ? 'dark' : 'light';
      state.room = ROOMS[s.room] ? s.room : 'grand';
      state.messages = Array.isArray(s.messages) ? s.messages : [];
      state.tasks = (Array.isArray(s.tasks) ? s.tasks : []).map(function (t) {
        return {
          id: (t && t.id) || uid(),
          title: String((t && t.title) || ''),
          owner: (t && PEOPLE[t.owner]) ? t.owner : 'boss',
          done: !!(t && t.done),
          due_date: (t && t.due_date) || '',
          created_at: (t && t.created_at) || new Date().toISOString(),
          unsynced: !!(t && t.unsynced)
        };
      }).filter(function (t) { return t.title; });
      state.taskFilter = (s.taskFilter === 'today' || s.taskFilter === 'upcoming') ? s.taskFilter : 'all';
      state.dlCat = DL_CATS.indexOf(s.dlCat) !== -1 ? s.dlCat : 'all';
      state.dlSort = s.dlSort === 'name' ? 'name' : 'new';
      state.quotas = normalizeQuotaList(s.quotas);
      if (s.supabase && typeof s.supabase === 'object') {
        state.supabase.url = s.supabase.url || '';
        state.supabase.key = s.supabase.key || '';
      }
      return true;
    } catch (e) { return false; }
  }

  /* ---------------- one-touch connect (URL hash) ---------------- */
  /* 주소 끝에 #sb_url=...&sb_key=... 를 붙여 열면 서버 설정을 자동으로 저장하고
     바로 연결합니다. 키는 저장소(localStorage)에만 남고 코드에는 남지 않습니다. */
  function parseHashConfig() {
    var raw = (window.location.hash || '').replace(/^#+/, '');
    if (!raw) return null;
    var url = '', key = '';
    raw.split('&').forEach(function (pair) {
      if (!pair) return;
      var i = pair.indexOf('=');
      var k = i === -1 ? pair : pair.slice(0, i);
      var v = i === -1 ? '' : pair.slice(i + 1);
      try {
        k = decodeURIComponent(k.replace(/\+/g, ' '));
        v = decodeURIComponent(v.replace(/\+/g, ' '));
      } catch (e) { /* keep raw */ }
      k = k.trim();
      if (k === 'sb_url') url = v.trim();
      else if (k === 'sb_key') key = v.trim();
    });
    if (!/^https?:\/\//i.test(url) || !key) return null;
    return { url: url, key: key };
  }

  function stripHash() {
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (e) { /* ignore */ }
  }

  function applyHashConfig() {
    var cfg = parseHashConfig();
    if (!cfg) return false;
    state.supabase.url = cfg.url;
    state.supabase.key = cfg.key;
    save();
    stripHash();
    return true;
  }

  /* ---------------- seeds ---------------- */
  function seed() {
    if (state.messages.length) return;
    state.messages = [
      { id: 'seed-1', room: 'grand', author: 'director', author_name: '주드 총괄이사', body: '[11/26] 3채널 6편 예약 완료, [10회] 대본도 시트 12행 등록.', created_at: iso(240) },
      { id: 'seed-2', room: 'grand', author: 'jju1', author_name: '하루 팀장', body: '1번 폰 대기 중입니다. 12:31 · 19:21 발행 확인할게요.', created_at: iso(236) },
      { id: 'seed-3', room: 'grand', author: 'jju2', author_name: '다온 과장', body: '2번 대기 중입니다. 11:10 · 21:30 확인하고 링크 올리겠습니다.', created_at: iso(234) },
      { id: 'seed-4', room: 'grand', author: 'jju3', author_name: '로이 대리', body: '3번 대기 중입니다. 11:50 · 18:40이랑 업리카 세션 보겠습니다.', created_at: iso(232) },
      { id: 'seed-5', room: 'command', author: 'director', author_name: '주드 총괄이사', body: '지휘실입니다, 대표님. 오늘 결정하실 것 세 가지(원고 무단 복사 4계정 대응 · 에이블리 77% 페이백 · 데스크탑 보류) 정리해 뒀습니다. 말씀만 주세요.', created_at: iso(230) },
      { id: 'seed-6', room: 'lounge', author: 'director', author_name: '주드 총괄이사', body: '라운지 — 자유 기록. 아이디어나 공지를 남겨두면 회의실 지시로 이어서 처리합니다.', created_at: iso(228) }
    ];
    if (!state.tasks.length) {
      state.tasks = seedTasks();
    }
    save();
  }

  /* ---------------- 🖥️ PC 2단 배치 (v44) ----------------
     1280px 이상 PC 에서 '오피스 맵'·'회의실'을 볼 때는 두 화면을 좌우로 함께 보여 줍니다.
       왼쪽 = 오피스 맵 + 그 아래 4인방 배치 카드 / 오른쪽 = 대회의실 채팅창
     · 폭 판정은 window.innerWidth 하나만 봅니다(창을 줄여 1279px 이하가 되면 곧바로 해제).
     · 1279px 이하(폰·태블릿·좁은 창)는 예전처럼 탭 전환 방식 그대로입니다.
     · 클래스(app.pc-split)만 켜고 끄고, 배치는 styles.css 의 @media (min-width:1280px) 가 맡습니다. */
  var PC_SPLIT_MIN = 1280;

  function pcSplitWide() {
    var w = window.innerWidth ||
      (document.documentElement && document.documentElement.clientWidth) || 0;
    return w >= PC_SPLIT_MIN;
  }

  function pcSplitWanted() {
    if (!pcSplitWide()) return false;
    return state.view === 'map' || state.view === 'office';
  }

  /* 지금 2단(맵+회의실 동시)으로 보이는 중인가 — 채팅 관련 동작의 판정에 씁니다. */
  function pcSplitOn() {
    var app = document.getElementById('app');
    return !!(app && app.classList.contains('pc-split'));
  }

  /* 대회의실 채팅이 화면에 보이는 중인가(회의실 탭이거나, PC 2단으로 함께 보일 때). */
  function chatVisible() {
    return state.view === 'office' || pcSplitOn();
  }

  /* 보이는 쪽(맵/회의실)을 1.1초 동안 테두리로 살짝 강조합니다. */
  var PULSE = { timer: 0, el: null };
  function pulseCol(name) {
    if (!pcSplitOn()) return;
    var col = document.getElementById(name === 'office' ? 'view-office' : 'view-map');
    if (!col) return;
    if (PULSE.timer) clearTimeout(PULSE.timer);
    if (PULSE.el) PULSE.el.classList.remove('col-pulse');
    col.classList.remove('col-pulse');
    void col.offsetWidth;          /* 애니메이션을 처음부터 다시 */
    col.classList.add('col-pulse');
    PULSE.el = col;
    PULSE.timer = setTimeout(function () {
      col.classList.remove('col-pulse');
      PULSE.el = null;
      PULSE.timer = 0;
    }, 1200);
  }

  /* 클래스 상태를 지금 화면 폭·탭에 맞춥니다. 바뀌었으면 true. */
  function syncPcSplit() {
    var app = document.getElementById('app');
    if (!app) return false;
    var on = pcSplitWanted();
    var was = app.classList.contains('pc-split');
    if (on === was) return false;
    app.classList.toggle('pc-split', on);
    if (on) {
      /* 맵이 display:none → 보이는 상태로 바뀌었으니 크기를 다시 재고 캐릭터를 깨웁니다. */
      window.requestAnimationFrame(function () {
        if (!pcSplitOn()) return;
        if (measureStage()) { WALKERS.forEach(moveFig); layoutBubbles(); }
        startMapWalk();
      });
    } else if (state.view !== 'map') {
      stopMapWalk();
    }
    return true;
  }

  /* ---------------- view ---------------- */
  function setView(name) {
    var target = document.getElementById('view-' + name);
    if (!target) return;
    closeReadPop();
    var prev = state.view;
    state.view = name;
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.toggle('active', v.id === 'view-' + name);
    });
    document.querySelectorAll('.menu-item').forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === name);
    });
    document.querySelectorAll('.bn-item').forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === name);
    });
    /* PC 2단 — 맵/회의실을 볼 때만 두 화면을 함께 켭니다. */
    syncPcSplit();
    if (name === 'office') {
      window.requestAnimationFrame(scrollChat);
      if (prev !== name) pulseCol('office');
    } else {
      el.main.scrollTop = 0;
      var v = target;
      v.scrollTop = 0;
      if (name === 'map' && prev !== name) pulseCol('map');
    }
    if (name === 'tasks') {
      renderTasks();
      if (SB.connected) pullTasks().catch(function () {});
    }
    if (name === 'deliverables') {
      renderDeliverables();
      if (!DL.pulled) { DL.pulled = true; pullDeliverables(); }
    }
    if (name === 'quota') {
      renderQuota();
      pullQuotas();
    }
    /* 오피스 맵이 화면에 보이면(맵 탭 또는 PC 2단) 캐릭터가 걸어 다닙니다 */
    if (name === 'map' || pcSplitOn()) {
      window.requestAnimationFrame(startMapWalk);
    } else {
      stopMapWalk();
    }
    try {
      var url = new URL(location.href);
      url.searchParams.set('view', name);
      history.replaceState(null, '', url.toString());
    } catch (e) { /* ignore */ }
    save();
  }

  /* ---------------- 💬 읽음 표시 · 안 읽은 인원수 (v41) ----------------
     카카오톡처럼 말풍선 옆에 "안 읽은 사람 수"를 작은 노란 숫자로 붙입니다.
     · 방별 참여 멤버에서 작성자 본인을 뺀 나머지 중, office_reads 의 last_read_at 이
       그 글의 created_at 보다 뒤인 사람은 '읽음'으로 보고 나머지를 셉니다.
     · 읽음 현황은 Supabase public.office_reads 에만 두고, 이 기기에는 방마다 마지막으로
       받아 온 값만 들고 있습니다(기기 저장 X — 폴링 때 갱신).
     · 테이블이 없거나(404) 권한이 없으면(401/403) 조용히 꺼집니다 — 앱 동작은 그대로. */
  var ROOM_MEMBERS = {
    grand:   ['boss', 'director', 'jju1', 'jju2', 'jju3'],
    lounge:  ['boss', 'director', 'jju1', 'jju2', 'jju3'],
    command: ['boss', 'director']
  };
  var MEMBER_IDS = ['boss', 'director', 'jju1', 'jju2', 'jju3'];

  /* 이 기기를 쓰는 사람 — 기본은 대표님(boss). 다른 폰은 주소에 ?member=jju2 처럼 붙이면
     그 브라우저에 기억합니다(읽음 기록의 주인). */
  var ME = { id: 'boss' };

  var READ = {
    byRoom: {},     /* room → { member: last_read_at(ms) } */
    mine: {},       /* room → 이 기기(ME)가 마지막으로 읽은 시각 — 서버 응답이 늦어도 내 배지에서 나를 빼기 위해 */
    fetched: {},    /* room → 마지막 조회 시각 */
    busy: {},       /* room → 조회 중 */
    off: false,     /* 테이블 없음·권한 없음 → 더 시도하지 않음 */
    lastMark: 0,    /* 마지막 읽음 기록(upsert) 시각 */
    lastMarkRoom: ''
  };
  var READ_MS = 20000;   /* 같은 방 읽음 현황을 다시 받는 최소 간격(전송량 절감) */

  function roomMemberList(room) {
    if (ROOM_MEMBERS[room]) return ROOM_MEMBERS[room];
    if (typeof room === 'string' && room.indexOf('dm:') === 0) {
      var who = room.slice(3);
      return who ? ['boss', who] : ['boss'];
    }
    return MEMBER_IDS;
  }

  function stripMemberParam() {
    try {
      var u = new URL(window.location.href);
      if (!u.searchParams.has('member')) return;
      u.searchParams.delete('member');
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    } catch (e) { /* ignore */ }
  }

  function initMember() {
    var want = '';
    var saved = '';
    try { want = new URLSearchParams(location.search).get('member') || ''; } catch (e) { want = ''; }
    try { saved = localStorage.getItem('jju-office-member') || ''; } catch (e) { saved = ''; }
    if (want && MEMBER_IDS.indexOf(want) !== -1) {
      ME.id = want;
      try { localStorage.setItem('jju-office-member', want); } catch (e) { /* ignore */ }
      stripMemberParam();
      return;
    }
    if (saved && MEMBER_IDS.indexOf(saved) !== -1) ME.id = saved;
  }

  function readMapFor(room) { return READ.byRoom[room] || null; }

  /* 그 글을 아직 읽지 않은 참여자 수 — 작성자 본인은 빼고 셉니다. */
  function unreadCount(msg, map) {
    if (!msg) return 0;
    var at = Date.parse(msg.created_at);
    if (isNaN(at)) return 0;
    var reads = map || readMapFor(msg.room);
    if (!reads) return 0;        /* 읽음 현황을 아직 못 받았으면 표시하지 않습니다 */
    var members = roomMemberList(msg.room);
    var n = 0;
    for (var i = 0; i < members.length; i++) {
      var who = members[i];
      if (who === msg.author) continue;
      var t = reads[who];
      if (!t || t < at) n += 1;
    }
    return n;
  }

  function setReadBadge(b, n) {
    if (!b) return;
    if (n > 0) {
      b.hidden = false;
      b.textContent = String(n);
      b.title = '안 읽은 사람 ' + n + '명 · 눌러서 누가 읽었는지 보기';
      b.setAttribute('aria-label', '안 읽은 사람 ' + n + '명 · 읽음 상세 보기');
    } else {
      b.textContent = '';
      b.hidden = true;           /* 0명이면 숨김 */
      b.removeAttribute('title');
      b.removeAttribute('aria-label');
    }
  }

  function readSpan(n, id) {
    var b = document.createElement('span');
    b.className = 'unread-count';
    if (id) b.setAttribute('data-unread', id);
    /* v42: 배지를 눌러 읽음 상세(누가 읽음/안 읽음)를 엽니다 — 키보드로도 열 수 있게 합니다. */
    b.setAttribute('role', 'button');
    b.setAttribute('tabindex', '0');
    b.setAttribute('aria-haspopup', 'dialog');
    b.setAttribute('aria-expanded', 'false');
    setReadBadge(b, n);
    return b;
  }

  /* 이미 그려 둔 배지만 다시 칠합니다 — 방 전체를 다시 그리지 않아 스크롤이 튀지 않습니다. */
  function paintUnread(room) {
    var log = el.chatLog;
    if (!log || !log.querySelectorAll) return;
    var badges = log.querySelectorAll('.unread-count[data-unread]');
    for (var i = 0; i < badges.length; i++) {
      var id = badges[i].getAttribute('data-unread');
      var msg = null;
      for (var j = 0; j < state.messages.length; j++) {
        if (state.messages[j].id === id) { msg = state.messages[j]; break; }
      }
      var n = (msg && msg.room === room) ? unreadCount(msg) : 0;
      setReadBadge(badges[i], n);
      /* 배지가 사라졌는데 팝오버만 떠 있으면 같이 닫습니다 */
      if (!n && READPOP.badge === badges[i]) closeReadPop();
    }
  }

  /* 화면에 그려진 배지 수와 지금 계산값이 어긋나는지 (0이면 그대로 칠해도 됨) */
  function unreadBadgeGap(room) {
    var log = el.chatLog;
    if (!log || !log.querySelectorAll) return 0;
    var nodes = log.querySelectorAll('.unread-count[data-unread]');
    var shown = 0;
    for (var i = 0; i < nodes.length; i++) if (!nodes[i].hidden) shown += 1;
    var want = 0;
    var list = roomMessages(room);
    for (var j = 0; j < list.length; j++) if (unreadCount(list[j]) > 0) want += 1;
    return want - shown;
  }

  /* ---------------- 💬 읽음 상세 팝오버 (v42) ----------------
     말풍선 옆 노란 숫자 배지를 누르면 '누가 읽었고 누가 아직 안 읽었는지'를 작은 팝오버로 보여 줍니다.
     · 이미 받아 둔 office_reads(READ.byRoom)만 씁니다 — 여기서 서버로 새로 묻지 않습니다(추가 전송 0건).
     · 배지는 unreadCount() 와 똑같은 기준(작성자 제외 · last_read_at >= 글 시각)으로 읽음/안 읽음을 가릅니다.
     · 바깥을 누르거나 Esc·스크롤·다시 그리기에서 조용히 닫힙니다. */
  var READPOP = { node: null, badge: null, id: '' };

  /* 한 글의 읽음/안 읽음 명단 — 읽음 현황을 아직 못 받았으면 known=false */
  function readPeople(msg) {
    var out = { read: [], unread: [], at: Date.parse(msg.created_at), known: false };
    var reads = readMapFor(msg.room);
    if (!reads || isNaN(out.at)) return out;
    out.known = true;
    var members = roomMemberList(msg.room);
    for (var i = 0; i < members.length; i++) {
      var who = members[i];
      if (who === msg.author) continue;          /* 작성자는 세지 않습니다 */
      var t = reads[who];
      if (t && t >= out.at) out.read.push(who);
      else out.unread.push(who);
    }
    return out;
  }

  function readPopName(id) {
    var p = PEOPLE[id];
    return p ? p.name : id;
  }

  function closeReadPop() {
    if (!READPOP.node) return;
    var node = READPOP.node;
    if (node.parentNode) node.parentNode.removeChild(node);
    if (READPOP.badge) {
      READPOP.badge.classList.remove('is-open');
      READPOP.badge.setAttribute('aria-expanded', 'false');
    }
    READPOP.node = null;
    READPOP.badge = null;
    READPOP.id = '';
  }

  /* 배지 옆에 붙이되 화면 밖으로 나가지 않게 — 위가 좁으면 아래로 뒤집습니다. */
  function placeReadPop(badge, node) {
    var r = badge && badge.getBoundingClientRect ? badge.getBoundingClientRect() : null;
    var w = node.offsetWidth || 196;
    var h = node.offsetHeight || 104;
    var vw = window.innerWidth || document.documentElement.clientWidth || 360;
    var vh = window.innerHeight || document.documentElement.clientHeight || 640;
    var left = (r && r.width) ? (r.left + r.width / 2 - w / 2) : 12;
    if (left + w > vw - 8) left = vw - w - 8;
    if (left < 8) left = 8;
    var top = (r && r.height) ? (r.top - h - 8) : 64;
    if (top < 8 && r && r.bottom) top = Math.min(r.bottom + 8, vh - h - 8);
    if (top < 8) top = 8;
    node.style.left = Math.round(left) + 'px';
    node.style.top = Math.round(top) + 'px';
  }

  function fillReadPop(node, msg, info) {
    var head = document.createElement('p');
    head.className = 'read-pop-head';
    head.textContent = '읽음 현황';
    node.appendChild(head);

    function row(label, ids, cls) {
      var p = document.createElement('p');
      p.className = 'read-pop-row ' + cls;
      var b = document.createElement('b');
      b.textContent = label;
      var s = document.createElement('span');
      s.className = 'read-pop-names';
      s.textContent = ids.length ? ids.map(readPopName).join(' · ') : '없음';
      p.appendChild(b);
      p.appendChild(s);
      return p;
    }

    if (!info.known) {
      var na = document.createElement('p');
      na.className = 'read-pop-note';
      na.textContent = '읽음 현황을 아직 받지 못했어요';
      node.appendChild(na);
    } else {
      node.appendChild(row('읽음', info.read, 'is-read'));
      node.appendChild(row('안 읽음', info.unread, 'is-unread'));
    }

    var foot = document.createElement('p');
    foot.className = 'read-pop-foot';
    foot.textContent = timeLabel(msg.created_at) + ' 글 기준';
    node.appendChild(foot);
  }

  function openReadPop(badge, msg) {
    var node = document.createElement('div');
    node.className = 'read-pop';
    node.setAttribute('role', 'dialog');
    node.setAttribute('aria-label', '읽음 상세');
    fillReadPop(node, msg, readPeople(msg));
    document.body.appendChild(node);
    placeReadPop(badge, node);
    badge.classList.add('is-open');
    badge.setAttribute('aria-expanded', 'true');
    READPOP.node = node;
    READPOP.badge = badge;
    READPOP.id = msg.id || '';
  }

  function toggleReadPop(badge) {
    if (!badge) return;
    var id = badge.getAttribute('data-unread') || '';
    if (READPOP.node && READPOP.id === id) { closeReadPop(); return; }
    closeReadPop();
    var msg = null;
    for (var i = 0; i < state.messages.length; i++) {
      if (state.messages[i].id === id) { msg = state.messages[i]; break; }
    }
    if (!msg) return;
    openReadPop(badge, msg);
  }

  /* 방 읽음 현황 조회 — 숨은 탭에서는 하지 않습니다(전송량 절감). */
  function pullReads(room, force) {
    if (!SB.connected || READ.off) return Promise.resolve(false);
    room = room || state.room;
    if (!room || pageHidden()) return Promise.resolve(false);
    var now = Date.now();
    if (!force && READ.fetched[room] && now - READ.fetched[room] < READ_MS) return Promise.resolve(false);
    if (READ.busy[room]) return Promise.resolve(false);
    READ.busy[room] = true;
    return sbRequest('/rest/v1/office_reads?room=eq.' + encodeURIComponent(room) +
                     '&select=member,last_read_at').then(function (rows) {
      READ.busy[room] = false;
      READ.fetched[room] = Date.now();
      var map = {};
      (Array.isArray(rows) ? rows : []).forEach(function (r) {
        if (!r || !r.member) return;
        var t = Date.parse(r.last_read_at);
        if (!isNaN(t)) map[r.member] = t;
      });
      var mine = READ.mine[room];
      if (mine && (!map[ME.id] || map[ME.id] < mine)) map[ME.id] = mine;
      READ.byRoom[room] = map;
      if (room === state.room && chatVisible()) {
        if (unreadBadgeGap(room) !== 0) renderChat();
        else paintUnread(room);
      }
      return true;
    }).catch(function (e) {
      READ.busy[room] = false;
      /* 테이블 미존재(404)·권한(401/403)이면 더 시도하지 않고 조용히 끕니다. */
      if (e && (e.status === 404 || e.status === 401 || e.status === 403)) READ.off = true;
      return false;
    });
  }

  /* 내가 이 방을 읽었다고 남깁니다(upsert) — 그 방을 보고 있을 때 + 화면이 보일 때만. */
  function markRead(room, force) {
    if (!SB.connected || READ.off) return;
    room = room || state.room;
    if (!room || state.room !== room || !chatVisible()) return;
    if (pageHidden()) return;
    var now = Date.now();
    /* 내가 지금 보고 있으니 내 읽음은 바로 반영합니다(내 배지에서 나를 빼고 셈).
       테이블이 없거나 응답이 없으면 배지 자체가 안 뜨므로 엉뚱한 숫자는 생기지 않습니다. */
    READ.mine[room] = now;
    if (READ.byRoom[room]) {
      READ.byRoom[room][ME.id] = now;
      if (chatVisible()) paintUnread(room);
    }
    /* 같은 방·같은 순간에 여러 경로(입장·새 글·폴링)가 겹쳐도 쓰기는 한 번만 —
       force 도 1.5초 안의 중복은 건너뜁니다(전송량 절감). */
    if (READ.lastMarkRoom === room && now - READ.lastMark < (force ? 1500 : READ_MS)) return;
    READ.lastMark = now;
    READ.lastMarkRoom = room;
    var stamp = new Date(now).toISOString();
    sbRequest('/rest/v1/office_reads?on_conflict=room,member', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: { room: room, member: ME.id, last_read_at: stamp }
    }).catch(function (e) {
      if (e && (e.status === 404 || e.status === 401 || e.status === 403)) READ.off = true;
      /* 그 밖의 오류는 조용히 무시 — 앱 동작에는 영향 없음 */
    });
  }

  /* ---------------- chat ---------------- */
  function roomMessages(room) {
    return state.messages
      .filter(function (m) { return m.room === room; })
      .sort(function (a, b) { return new Date(a.created_at) - new Date(b.created_at); });
  }

  function renderChat() {
    var log = el.chatLog;
    var list = roomMessages(state.room);
    closeReadPop();          /* 다시 그리면 예전 배지가 사라지므로 팝오버도 닫습니다 */
    log.innerHTML = '';

    if (!list.length) {
      var empty = document.createElement('p');
      empty.className = 'chat-empty';
      empty.textContent = state.room === 'lounge'
        ? '아직 남긴 기록이 없습니다.\n오늘 할 일이나 아이디어를 한 줄 남겨보세요.'
        : '아직 대화가 없습니다. 한 줄 지시로 시작해 보세요.';
      log.appendChild(empty);
      return;
    }

    list.forEach(function (m) {
      var p = PEOPLE[m.author] || { name: m.author_name || m.author, initial: '·', cls: 'p-boss', device: '' };
      var row = document.createElement('div');
      row.className = 'msg' + (m.author === 'boss' ? ' boss' : '');

      var av = document.createElement('div');
      av.className = 'avatar ' + p.cls;
      /* 4인방은 오피스 맵·AI 한도 탭과 같은 캐릭터 그림을 씁니다.
         대표님(boss)도 v40 부터 같은 캐릭터 그림을 씁니다(쭈대표 캐리커쳐).
         시스템 등 CHAR_ART 에 없는 화자는 기존 원형 글자 배지를 그대로 둡니다. */
      if (CHAR_ART[m.author]) {
        av.className += ' avatar-char';
        av.setAttribute('data-char', m.author);
        paintAvatar(av, m.author);
      } else {
        av.textContent = p.initial;
      }

      var main = document.createElement('div');
      main.className = 'msg-main';

      var head = document.createElement('div');
      head.className = 'msg-head';
      var nm = document.createElement('span');
      nm.className = 'msg-name';
      nm.textContent = PEOPLE[m.author] ? pname(p) : (m.author_name || pname(p));
      head.appendChild(nm);
      if (p.device && m.author !== 'boss') {
        var dv = document.createElement('span');
        dv.className = 'msg-device';
        dv.textContent = p.device;
        head.appendChild(dv);
      }
      var tm = document.createElement('span');
      tm.className = 'msg-time';
      tm.textContent = timeLabel(m.created_at);
      head.appendChild(tm);

      var bub = document.createElement('div');
      bub.className = 'bubble';
      if (m.body) {
        var tx = document.createElement('div');
        tx.className = 'bubble-text';
        tx.textContent = m.body;
        bub.appendChild(tx);
      }
      if (m.image_url) {
        bub.classList.add('has-photo');
        bub.appendChild(photoNode(m));
      }
      if (!m.image_url && m.image_lost) {
        var lost = document.createElement('div');
        lost.className = 'bubble-note';
        lost.textContent = '사진은 기기 저장 한도로 정리됐어요';
        bub.appendChild(lost);
      }

      /* 말풍선 옆(보낸 사람 반대쪽)에 안 읽은 인원수 — 카카오톡과 같은 자리·같은 모양 */
      var line = document.createElement('div');
      line.className = 'bubble-line';
      line.appendChild(bub);
      var uc = unreadCount(m);
      if (uc > 0) line.appendChild(readSpan(uc, m.id));

      main.appendChild(head);
      main.appendChild(line);
      row.appendChild(av);
      row.appendChild(main);
      log.appendChild(row);
    });

    scrollChat();
  }

  function scrollChat() {
    var log = el.chatLog;
    if (!log) return;
    log.scrollTop = log.scrollHeight;
  }

  function addMessage(msg) {
    state.messages.push(msg);
    state.messages.sort(function (a, b) { return new Date(a.created_at) - new Date(b.created_at); });
    save();
    if (msg.room === state.room) renderChat();
    updateMap();
  }

  function sendMessage() {
    var text = (el.chatInput.value || '').trim();
    var photo = PHOTO.pending;
    if (!text && !photo) return;
    if (PHOTO.busy) { toast('사진을 준비하고 있어요 · 잠깐만 기다려 주세요'); return; }

    var msg = {
      id: uid(),
      room: state.room,
      author: 'boss',
      author_name: '쭈대표',
      body: text,
      created_at: new Date().toISOString()
    };
    if (photo) {
      /* 보내기 전에는 기기 저장용 data URL로 바로 보여 주고, 서버에 올라가면 공개 주소로 바꿉니다. */
      msg.image_url = photo.dataUrl;
      msg.image_size = photo.w + '×' + photo.h;
      msg.image_from = photo.from;
    }
    addMessage(msg);
    el.chatInput.value = '';
    resizeInput();
    hideMentions();
    clearPhoto();

    /* 글을 보낸 직후 내 읽음을 남기고, 다른 사람의 읽음 현황을 바로 받아 옵니다(보고 있는 중). */
    markRead(msg.room, true);
    pullReads(msg.room, true).catch(function () {});

    if (!SB.connected || !state.supabase.url || !state.supabase.key) {
      toast(photo
        ? '사진과 글을 이 기기에 저장했어요 · AI 서버를 연결하면 4인방에 전달됩니다'
        : '기기에 저장했어요 · AI 서버를 연결하면 4인방에 전달됩니다', photo ? 3600 : 2600);
      return;
    }

    if (!photo) {
      insertMessage(msg, false).then(function () {
        flashServer('ok');
      }).catch(function () {
        toast('서버 전송 실패 · 기기에는 저장했어요');
      });
      return;
    }

    uploadPhoto(photo).then(function (url) {
      msg.image_url = url;              /* 기기 저장은 공개 주소로(용량 절약) */
      if (PHOTO.remote.indexOf(msg.id) === -1) PHOTO.remote.push(msg.id);
      save();
      if (msg.room === state.room) renderChat();
      return insertMessage(msg, true);
    }).then(function () {
      flashServer('ok');
    }).catch(function (err) {
      /* 사진이 안 올라가도 글은 반드시 전달합니다(사진은 이 기기에 남습니다). */
      insertMessage(msg, false).then(function () {
        photoFallbackNote(err);
      }).catch(function () {
        toast('서버 전송 실패 · 사진과 글은 기기에 저장했어요', 3600);
      });
    });
  }

  /* ---------------- 📷 사진 · 카메라 (v38) ---------------- */
  /* 갤러리(#photoInput)와 즉시 촬영(#cameraInput capture=environment)이 같은 길을 씁니다.
     ① 고른 파일을 data URL로 읽고 ② Canvas로 긴 변 1280px까지 줄여 JPEG 0.82로 다시 인코딩
     ③ 전송 전 미리보기(썸네일 + ✕) ④ 보내면 Storage(office-attachments)에 올리고 주소만 메시지에 남깁니다.
     DB의 image_url 컬럼이나 Storage 버킷이 아직 없어도 글이 실패하지 않게, 실패하면 글로만 보냅니다. */

  var PHOTO = {
    max: 1280,                       /* 긴 변 최대 px */
    quality: 0.82,                   /* JPEG 압축 품질 */
    maxInput: 15 * 1024 * 1024,      /* 원본 파일 상한 15MB */
    bucket: 'office-attachments',
    pending: null,                   /* { dataUrl, name, from, w, h, bytes, resized } */
    column: null,                    /* image_url 컬럼: null 모름 · true 있음 · false 없음 */
    bucketOk: null,                  /* Storage 버킷: null 모름 · true/false */
    remote: [],                      /* 서버 주소로 바뀐 메시지 id (기기 저장 배지 판단) */
    busy: false,
    opened: null
  };

  /* 긴 변을 max 이하로 줄이는 비율 계산(작은 사진은 늘리지 않습니다). */
  function photoPlan(w, h, max) {
    w = Number(w) || 0;
    h = Number(h) || 0;
    var longest = Math.max(w, h);
    var limit = Number(max) || PHOTO.max;
    if (!w || !h || longest <= limit) return { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)), scale: 1 };
    var scale = limit / longest;
    return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)), scale: scale };
  }

  function photoBytes(dataUrl) {
    var s = String(dataUrl || '');
    var i = s.indexOf(',');
    if (i < 0) return 0;
    var b64 = s.slice(i + 1);
    var pad = b64.slice(-2) === '==' ? 2 : (b64.slice(-1) === '=' ? 1 : 0);
    return Math.max(0, Math.round(b64.length * 3 / 4) - pad);
  }

  function readImageFile(file) {
    return new Promise(function (resolve, reject) {
      if (typeof FileReader === 'undefined') { reject(new Error('no-file-reader')); return; }
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = function () { reject(new Error('read')); };
      try { reader.readAsDataURL(file); } catch (e) { reject(e); }
    });
  }

  function loadPhotoImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('decode')); };
      img.src = src;
    });
  }

  /* Canvas가 없는 환경(아주 오래된 브라우저·테스트 러너)이면 null을 돌려주고 원본을 그대로 씁니다. */
  function canvasJpeg(img, max, quality) {
    var w = img.naturalWidth || img.width || 0;
    var h = img.naturalHeight || img.height || 0;
    if (!w || !h) return null;
    var plan = photoPlan(w, h, max);
    var canvas = document.createElement('canvas');
    canvas.width = plan.w;
    canvas.height = plan.h;
    var ctx = null;
    try { ctx = canvas.getContext ? canvas.getContext('2d') : null; } catch (e) { ctx = null; }
    if (!ctx) return null;
    try {
      /* PNG·투명 배경이 JPEG에서 검게 나오지 않게 흰 바탕을 깔고 그립니다. */
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, plan.w, plan.h);
      ctx.drawImage(img, 0, 0, plan.w, plan.h);
      var out = canvas.toDataURL('image/jpeg', quality || PHOTO.quality);
      if (!out || out.indexOf('data:image/jpeg') !== 0) return null;
      return { dataUrl: out, w: plan.w, h: plan.h };
    } catch (e) { return null; }
  }

  function pickPhoto(file, from) {
    if (!file) return;
    var name = String(file.name || '') || (from === 'camera' ? '카메라 촬영' : '사진');
    var type = String(file.type || '');
    if (type && type.indexOf('image/') !== 0) { toast('사진 파일만 첨부할 수 있어요'); return; }
    if (file.size && file.size > PHOTO.maxInput) { toast('사진이 너무 커요 · 15MB 이하로 골라 주세요', 3200); return; }

    PHOTO.busy = true;
    setPhotoBusy(true);
    readImageFile(file).then(function (dataUrl) {
      if (!dataUrl) throw new Error('empty');
      return loadPhotoImage(dataUrl).then(function (img) {
        var out = canvasJpeg(img, PHOTO.max, PHOTO.quality);
        var finalUrl = (out && out.dataUrl) ? out.dataUrl : dataUrl;
        PHOTO.pending = {
          dataUrl: finalUrl,
          name: name,
          from: from === 'camera' ? 'camera' : (from === 'clipboard' ? 'clipboard' : 'gallery'),
          w: out ? out.w : (img.naturalWidth || img.width || 0),
          h: out ? out.h : (img.naturalHeight || img.height || 0),
          bytes: photoBytes(finalUrl),
          resized: !!(out && out.dataUrl)
        };
      });
    }).then(function () {
      PHOTO.busy = false;
      setPhotoBusy(false);
      renderPhotoStrip();
      var kb = Math.max(1, Math.round(PHOTO.pending.bytes / 1024));
      toast('사진 준비됐어요 · ' + PHOTO.pending.w + '×' + PHOTO.pending.h + ' · ' + kb + 'KB · 보내기를 누르면 전송됩니다', 2600);
    }).catch(function () {
      PHOTO.busy = false;
      setPhotoBusy(false);
      toast('사진을 읽지 못했어요 · 다른 사진으로 다시 시도해 주세요', 3200);
    });
  }

  /* ---------------- 📋 클립보드 붙여넣기 (v40) ----------------
     채팅 입력창에서 Ctrl+V(또는 폰의 붙여넣기)로 이미지를 넣으면
     갤러리·카메라와 똑같은 길(pickPhoto)로 들어가 미리보기·전송이 됩니다.
     캡처 도구로 찍은 화면을 파일로 저장하지 않고 그대로 지시에 붙일 수 있습니다.
     글(텍스트) 붙여넣기는 브라우저 기본 동작을 그대로 둡니다. */
  function clipboardImageFiles(ev) {
    var out = [];
    var dt = ev && (ev.clipboardData || ev.data);
    if (!dt) return out;
    var items = dt.items || [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it || it.kind !== 'file') continue;
      if (it.type && it.type.indexOf('image/') !== 0) continue;
      var f = it.getAsFile ? it.getAsFile() : null;
      if (f) out.push({ file: f, type: it.type || f.type || '' });
    }
    if (!out.length && dt.files) {
      for (var j = 0; j < dt.files.length; j++) {
        var fj = dt.files[j];
        if (fj && (!fj.type || fj.type.indexOf('image/') === 0)) out.push({ file: fj, type: fj.type || '' });
      }
    }
    return out;
  }

  function attachClipboardImage(ev) {
    var found = clipboardImageFiles(ev);
    if (!found.length) return false;         /* 이미지가 없으면 기본 붙여넣기(글자)에 맡깁니다 */
    if (ev.preventDefault) ev.preventDefault();
    if (PHOTO.busy) { toast('사진을 준비하고 있어요 · 잠깐만 기다려 주세요'); return true; }
    var first = found[0].file;
    /* 클립보드 이미지는 파일 이름이 없는 경우가 많아 알아보기 쉬운 이름을 붙여 줍니다. */
    if (!first.name) {
      try {
        var ext = (found[0].type || 'image/png').split('/')[1] || 'png';
        first = new File([first], '붙여넣은-사진-' + Date.now() + '.' + ext, { type: found[0].type || first.type || 'image/png' });
      } catch (e) { /* File 생성자를 못 쓰는 브라우저는 원본 그대로 */ }
    }
    pickPhoto(first, 'clipboard');
    return true;
  }

  function setPhotoBusy(on) {
    [el.photoBtn, el.cameraBtn].forEach(function (b) {
      if (!b) return;
      b.classList.toggle('is-busy', !!on);
      b.setAttribute('aria-busy', on ? 'true' : 'false');
    });
    if (el.photoStrip) el.photoStrip.classList.toggle('is-loading', !!on);
  }

  function renderPhotoStrip() {
    var p = PHOTO.pending;
    if (!el.photoStrip) return;
    if (!p) {
      el.photoStrip.hidden = true;
      if (el.photoThumb) el.photoThumb.removeAttribute('src');
      setPhotoDbNote();
      return;
    }
    el.photoStrip.hidden = false;
    if (el.photoThumb) {
      el.photoThumb.src = p.dataUrl;
      el.photoThumb.alt = '첨부 사진 미리보기';
    }
    if (el.photoMeta) {
      var kb = Math.max(1, Math.round(p.bytes / 1024));
      el.photoMeta.textContent = (p.from === 'camera' ? '📷 촬영' : (p.from === 'clipboard' ? '📋 붙여넣기' : '🖼️ 갤러리')) + ' · ' + p.w + '×' + p.h + ' · ' + kb + 'KB';
    }
    setPhotoDbNote();
  }

  function clearPhoto() {
    PHOTO.pending = null;
    PHOTO.busy = false;
    try { if (el.photoInput) el.photoInput.value = ''; } catch (e) { /* ignore */ }
    try { if (el.cameraInput) el.cameraInput.value = ''; } catch (e) { /* ignore */ }
    setPhotoBusy(false);
    renderPhotoStrip();
  }

  /* DB·Storage 준비 상태를 미리보기와 AI 서버 창에 한 줄로 알려 줍니다. */
  function setPhotoDbNote() {
    var note = '', warn = false;
    if (PHOTO.column === false) {
      note = 'DB 준비 전 · 지금은 이 기기에만 표시';
      warn = true;
    } else if (PHOTO.column === true && PHOTO.bucketOk === false) {
      note = '사진 저장소 없음 · 글만 전송됩니다';
      warn = true;
    } else if (PHOTO.column === true) {
      note = '서버 준비됨 · 보내면 4인방에 함께 전달';
    }
    if (el.photoNote) {
      el.photoNote.textContent = note;
      el.photoNote.classList.toggle('warn', warn);
      el.photoNote.hidden = !note;
    }
    if (el.photoDbNote) {
      if (PHOTO.column === false) {
        el.photoDbNote.textContent = '📷 사진 첨부: DB에 image_url 컬럼이 없습니다 · 스키마 SQL을 실행해 주세요';
      } else if (PHOTO.column === true && PHOTO.bucketOk === false) {
        el.photoDbNote.textContent = '📷 사진 첨부: Storage 버킷(office-attachments)이 없습니다 · 스키마 SQL의 Storage 블록을 실행해 주세요';
      } else if (PHOTO.column === true) {
        el.photoDbNote.textContent = '📷 사진 첨부: 서버 준비됨 · office-attachments 버킷에 올라갑니다';
      } else if (SB.connected) {
        el.photoDbNote.textContent = '📷 사진 첨부: 서버 확인 중… (확인 전에는 이 기기에만 저장)';
      } else {
        el.photoDbNote.textContent = '📷 사진 첨부: 서버 연결 전 · 사진은 이 기기에만 저장됩니다';
      }
    }
  }

  /* 라이트박스에서 크게 보기 */
  function photoFileName() {
    var d = new Date();
    return 'jju-office-' + isoDate(d).replace(/-/g, '') + '-' + pad2(d.getHours()) + pad2(d.getMinutes()) + '.jpg';
  }

  function openPhoto(m) {
    var url = typeof m === 'string' ? m : (m && m.image_url);
    if (!url) return;
    PHOTO.opened = {
      url: url,
      remote: /^https?:/i.test(url),
      meta: (m && m.image_size) || '',
      when: (m && m.created_at) || ''
    };
    if (el.photoBig) {
      el.photoBig.src = url;
      el.photoBig.alt = '첨부 사진 크게 보기';
    }
    if (el.photoMetaLine) {
      var bits = [];
      if (PHOTO.opened.remote) {
        bits.push('서버 저장');
      } else {
        bits.push('이 기기 저장');
      }
      if (PHOTO.opened.meta) bits.push(PHOTO.opened.meta);
      if (PHOTO.opened.when) bits.push(timeLabel(PHOTO.opened.when));
      el.photoMetaLine.textContent = bits.join(' · ');
    }
    if (el.photoDl) {
      el.photoDl.href = url;
      el.photoDl.setAttribute('download', photoFileName());
    }
    if (el.photoModal) el.photoModal.hidden = false;
  }

  function closePhoto() {
    if (!el.photoModal || el.photoModal.hidden) return;
    el.photoModal.hidden = true;
    if (el.photoBig) el.photoBig.removeAttribute('src');
    PHOTO.opened = null;
  }

  /* 서버 사진은 download 속성이 무시되므로(다른 출처) 받아서 blob으로 저장합니다. */
  function savePhotoFile(e) {
    if (!PHOTO.opened) return;
    var url = PHOTO.opened.url;
    if (!PHOTO.opened.remote) return;      /* data: URL 은 download 속성이 그대로 동작 */
    if (e && e.preventDefault) e.preventDefault();
    var went = false;
    function openInstead() {
      if (went) return;
      went = true;
      try { window.open(url, '_blank', 'noopener'); } catch (err) { /* ignore */ }
    }
    try {
      fetch(url).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.blob();
      }).then(function (blob) {
        if (!window.URL || typeof window.URL.createObjectURL !== 'function') { openInstead(); return; }
        var obj = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = obj;
        a.download = photoFileName();
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { try { window.URL.revokeObjectURL(obj); } catch (err) { /* ignore */ } }, 4000);
      }).catch(openInstead);
    } catch (err) { openInstead(); }
  }

  function photoNode(m) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bubble-photo';
    btn.setAttribute('aria-label', '사진 크게 보기');
    var img = document.createElement('img');
    img.src = m.image_url;
    img.alt = '첨부 사진';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', function () { btn.classList.add('is-broken'); });
    btn.appendChild(img);
    if (/^data:/i.test(m.image_url) && PHOTO.remote.indexOf(m.id) === -1) {
      var tag = document.createElement('span');
      tag.className = 'bubble-photo-tag';
      tag.textContent = '기기 저장';
      btn.appendChild(tag);
    }
    btn.addEventListener('click', function () { openPhoto(m); });
    return btn;
  }

  function dataUrlToBlob(dataUrl) {
    var s = String(dataUrl || '');
    var comma = s.indexOf(',');
    if (comma < 0) throw new Error('bad-data-url');
    var meta = s.slice(0, comma);
    var b64 = s.slice(comma + 1);
    var mime = (meta.match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
    var bin = atob(b64);
    var len = bin.length;
    var arr = new Uint8Array(len);
    for (var i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  function photoPath() {
    var d = new Date();
    return 'office/' + isoDate(d) + '/' + d.getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
  }

  /* Storage 업로드 → 공개 주소 반환. 실패는 그대로 던져 호출부가 글만 보내게 합니다. */
  function uploadPhoto(photo) {
    var dataUrl = photo && photo.dataUrl;
    if (!dataUrl) return Promise.reject(new Error('no-photo'));
    if (!state.supabase.url || !state.supabase.key) return Promise.reject(new Error('no-server'));
    var path = photoPath();
    var blob;
    try { blob = dataUrlToBlob(dataUrl); } catch (e) { return Promise.reject(e); }
    return fetch(sbBase() + '/storage/v1/object/' + PHOTO.bucket + '/' + path, {
      method: 'POST',
      headers: {
        'apikey': state.supabase.key,
        'Authorization': 'Bearer ' + state.supabase.key,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true',
        'cache-control': 'max-age=31536000'
      },
      body: blob
    }).then(function (res) {
      if (!res.ok) {
        var err = new Error('HTTP ' + res.status);
        err.status = res.status;
        err.detail = 'storage';
        /* 404(버킷 없음)·403(정책 거부)는 준비 안 됨으로 확정하고, 그 밖은 확인 불가로 둡니다. */
        if (res.status === 404 || res.status === 403) PHOTO.bucketOk = false;
        throw err;
      }
      PHOTO.bucketOk = true;
      return sbBase() + '/storage/v1/object/public/' + PHOTO.bucket + '/' + path;
    });
  }

  function isColumnMissing(err) {
    if (!err) return false;
    var d = String(err.detail || '') + ' ' + String(err.message || '');
    return d.indexOf('42703') !== -1 || d.indexOf('image_url') !== -1 || /column .* does not exist/i.test(d);
  }

  /* 메시지 1건 저장. image_url 컬럼이 없으면 같은 id로 컬럼 없이 한 번 더 시도합니다.
     (컬럼 오류로 실패한 INSERT는 행을 만들지 않으므로 재시도가 중복을 남기지 않습니다) */
  function insertMessage(msg, withImage) {
    var row = {
      id: msg.id,
      room: msg.room,
      author: msg.author,
      author_name: msg.author_name,
      body: msg.body || (msg.image_url ? '📷 사진' : '')
    };
    if (withImage && msg.image_url && !/^data:/i.test(msg.image_url)) row.image_url = msg.image_url;
    return sbInsert('office_messages', row).catch(function (err) {
      if (!row.image_url) throw err;
      if (!(isColumnMissing(err) || err.status === 400)) throw err;
      PHOTO.column = false;
      setPhotoDbNote();
      var textRow = {
        id: msg.id, room: msg.room, author: msg.author, author_name: msg.author_name,
        body: msg.body || '📷 사진'
      };
      return sbInsert('office_messages', textRow).then(function (r) {
        photoFallbackNote(err);
        return r;
      });
    });
  }

  function photoFallbackNote(err) {
    if (PHOTO.column === false) {
      toast('사진은 이 기기에만 있어요 · DB에 image_url 칸을 만들면 4인방에 함께 전송됩니다', 4600);
    } else if (PHOTO.bucketOk === false) {
      toast('사진 저장소가 아직 없어 글만 전달했어요 · 스키마 SQL의 Storage 블록을 실행해 주세요', 4800);
    } else if (err) {
      toast('사진 업로드가 안 돼 글만 전달했어요 · 잠시 후 다시 시도해 주세요', 3800);
    }
  }

  /* 연결 직후 사진 준비 상태 확인 — 컬럼·버킷이 없어도 조용히 안내만 바꿉니다. */
  function probePhotoColumn() {
    if (!SB.connected || !state.supabase.url || !state.supabase.key) {
      PHOTO.column = null;
      setPhotoDbNote();
      return Promise.resolve(null);
    }
    return fetch(sbBase() + '/rest/v1/office_messages?select=id,image_url&limit=1', { headers: sbHeaders() })
      .then(function (res) {
        if (res.ok) PHOTO.column = true;
        else if (res.status === 400 || res.status === 404) PHOTO.column = false;
        else PHOTO.column = null;
        setPhotoDbNote();
        return PHOTO.column;
      })
      .catch(function () {
        PHOTO.column = null;
        setPhotoDbNote();
        return null;
      });
  }

  /* ---------------- mentions ---------------- */
  function showMentions() {
    el.mentionMenu.hidden = false;
    el.plusBtn.setAttribute('aria-expanded', 'true');
  }

  function hideMentions() {
    el.mentionMenu.hidden = true;
    el.plusBtn.setAttribute('aria-expanded', 'false');
  }

  function insertMention(text) {
    var input = el.chatInput;
    var start = input.selectionStart || 0;
    var end = input.selectionEnd || 0;
    var v = input.value || '';
    var insert = text + ' ';
    input.value = v.slice(0, start) + insert + v.slice(end);
    var pos = start + insert.length;
    input.focus();
    try { input.setSelectionRange(pos, pos); } catch (e) { /* ignore */ }
    hideMentions();
  }

  /* ---------------- theme ---------------- */
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    el.themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#14100C' : '#F6EDE0');
    save();
  }

  /* ---------------- 📋 할 일 ---------------- */
  /* Supabase office_tasks 실제 컬럼: id · title · owner · done · due_date · created_at · updated_at
     AI 서버가 붙으면 서버 목록이 기준이고, 연결 전에는 이 기기(localStorage)에만 담깁니다. */

  var TASK_OWNERS = [
    { id: 'boss', label: '대표님 결정' },
    { id: 'director', label: '주드 총괄이사' },
    { id: 'jju1', label: '하루 팀장' },
    { id: 'jju2', label: '다온 과장' },
    { id: 'jju3', label: '로이 대리' }
  ];

  var taskSig = '';
  var taskWrites = 0;        /* 지금 서버로 보내고 있는 할 일 쓰기 수 */
  var lastTaskWriteAt = 0;   /* 마지막 쓰기가 끝난 시각 — 그 전에 떠난 조회 결과는 버립니다 */
  var taskGone = {};         /* 지금 지우는 중인 id — 그 전에 떠난 조회가 돌아와도 목록에 다시 올리지 않습니다 */

  function ownerLabel(id) {
    for (var i = 0; i < TASK_OWNERS.length; i++) {
      if (TASK_OWNERS[i].id === id) return TASK_OWNERS[i].label;
    }
    return TASK_OWNERS[0].label;
  }

  /* ---- 날짜(약속) 도우미 ---- */
  var WEEK_KO = ['일', '월', '화', '수', '목', '금', '토'];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function isoDate(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function todayISO() { return isoDate(new Date()); }

  function shiftISO(days) {
    var d = new Date();
    d.setDate(d.getDate() + (days || 0));
    return isoDate(d);
  }

  /* 'YYYY-MM-DD'를 new Date(str)로 읽으면 UTC 자정이라 하루 밀립니다. 로컬 자정으로 직접 만듭니다. */
  function parseISODate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    if (!m) return null;
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d.getTime()) ? null : d;
  }

  function dayGap(s) {
    var d = parseISODate(s);
    if (!d) return null;
    var t = parseISODate(todayISO());
    return Math.round((d.getTime() - t.getTime()) / 86400000);
  }

  function dueState(s) {
    if (!s) return 'none';
    var g = dayGap(s);
    if (g === null) return 'none';
    if (g < 0) return 'past';
    if (g === 0) return 'today';
    if (g === 1) return 'tomorrow';
    return 'future';
  }

  function dueLabel(s) {
    var d = parseISODate(s);
    if (!d) return '';
    var g = dayGap(s);
    var md = (d.getMonth() + 1) + '/' + d.getDate() + ' (' + WEEK_KO[d.getDay()] + ')';
    if (g === 0) return '오늘';
    if (g === 1) return '내일';
    if (g === -1) return '어제';
    if (g < -1) return md + ' 지남';
    return md;
  }

  /* 날짜 있는 약속을 날짜순으로 먼저, 같은 날짜면 등록순. 날짜 없는 할 일은 그 뒤에. */
  function byDueThenCreated(a, b) {
    var ad = a.due_date ? dayGap(a.due_date) : null;
    var bd = b.due_date ? dayGap(b.due_date) : null;
    if (ad !== null && bd !== null) {
      if (ad !== bd) return ad - bd;
      return byCreated(a, b);
    }
    if (ad !== null) return -1;
    if (bd !== null) return 1;
    return byCreated(a, b);
  }

  function taskMatchesFilter(t, f) {
    if (f === 'today') {
      if (!t.due_date) return true;      /* 날짜 없는 할 일은 늘 오늘 볼 것 */
      var g = dayGap(t.due_date);
      return g !== null && g <= 0;       /* 오늘 + 지난 날짜 */
    }
    if (f === 'upcoming') {
      if (!t.due_date) return false;
      var gu = dayGap(t.due_date);
      return gu !== null && gu > 0;      /* 내일 이후 예정된 약속 */
    }
    return true;
  }

  function taskFromRow(r) {
    return {
      id: r.id,
      title: r.title || '(제목 없음)',
      owner: PEOPLE[r.owner] ? r.owner : 'boss',
      done: !!r.done,
      due_date: r.due_date || '',
      created_at: r.created_at || new Date().toISOString()
    };
  }

  function byCreated(a, b) { return new Date(a.created_at) - new Date(b.created_at); }

  function renderDueControl(t) {
    var wrap = document.createElement('span');
    wrap.className = 'todo-due-wrap';

    var btn = document.createElement('button');
    btn.type = 'button';
    var st = dueState(t.due_date);
    btn.className = 'todo-due ' + (t.due_date ? 'st-' + st : 'none');
    btn.textContent = t.due_date ? dueLabel(t.due_date) : '📅 날짜';
    btn.setAttribute('aria-label', t.due_date
      ? '약속 날짜 ' + t.due_date + ' 바꾸기'
      : '약속 날짜 정하기');
    btn.addEventListener('click', function () { openDueEditor(t, wrap); });
    wrap.appendChild(btn);
    return wrap;
  }

  /* 배지를 누르면 그 자리에서 날짜를 고르고 바로 서버에 반영합니다. */
  function openDueEditor(t, wrap) {
    wrap.innerHTML = '';
    var input = document.createElement('input');
    input.type = 'date';
    input.className = 'todo-due-input';
    input.value = t.due_date || '';
    input.setAttribute('aria-label', '약속 날짜 선택');

    var clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'todo-due-clear';
    clear.textContent = '날짜 없음';
    clear.setAttribute('aria-label', '날짜 없애기');

    var settled = false;
    function settle(val) {
      if (settled) return;
      settled = true;
      if ((val || '') === (t.due_date || '')) renderTasks();
      else setTaskDue(t, val || '');
    }

    input.addEventListener('change', function () { settle(input.value); });
    input.addEventListener('blur', function () {
      setTimeout(function () { if (!settled) settle(input.value); }, 150);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') { settled = true; renderTasks(); }
    });
    clear.addEventListener('click', function () { settled = true; setTaskDue(t, ''); });

    wrap.appendChild(input);
    wrap.appendChild(clear);
    try {
      input.focus();
      if (input.showPicker) input.showPicker();
    } catch (e) { /* picker unavailable on this browser */ }
  }

  function renderTaskRow(t) {
    var li = document.createElement('li');
    li.className = 'todo-item' + (t.done ? ' done' : '');

    var cb = document.createElement('button');
    cb.type = 'button';
    cb.className = 'todo-check';
    cb.setAttribute('aria-label', t.done ? '완료 취소' : '완료 표시');
    cb.setAttribute('aria-pressed', t.done ? 'true' : 'false');
    cb.textContent = '✓';
    cb.addEventListener('click', function () { toggleTask(t); });

    var body = document.createElement('div');
    body.className = 'todo-body';

    var tx = document.createElement('span');
    tx.className = 'todo-text';
    tx.textContent = t.title;
    body.appendChild(tx);

    var meta = document.createElement('span');
    meta.className = 'todo-meta';
    var owner = document.createElement('span');
    owner.className = 'todo-owner ow-' + (t.owner || 'boss');
    owner.textContent = ownerLabel(t.owner) + (t.unsynced ? ' · 기기에만' : '');
    meta.appendChild(owner);
    meta.appendChild(renderDueControl(t));
    body.appendChild(meta);

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'todo-del';
    del.setAttribute('aria-label', '할 일 삭제');
    del.textContent = '✕';
    del.addEventListener('click', function () { removeTask(t); });

    li.appendChild(cb);
    li.appendChild(body);
    li.appendChild(del);
    return li;
  }

  function emptyTaskRow(text) {
    var li = document.createElement('li');
    li.className = 'todo-empty';
    li.textContent = text;
    return li;
  }

  function renderTasks() {
    if (!el.taskOpenList || !el.taskDoneList) return;

    var f = state.taskFilter || 'all';
    var openAll = state.tasks.filter(function (t) { return !t.done; });
    var doneAll = state.tasks.filter(function (t) { return t.done; });
    var open = openAll.filter(function (t) { return taskMatchesFilter(t, f); }).sort(byDueThenCreated);
    var done = doneAll.filter(function (t) { return taskMatchesFilter(t, f); })
      .sort(function (a, b) { return byCreated(b, a); });

    el.taskOpenList.innerHTML = '';
    if (open.length) {
      open.forEach(function (t) { el.taskOpenList.appendChild(renderTaskRow(t)); });
    } else {
      el.taskOpenList.appendChild(emptyTaskRow(f === 'upcoming'
        ? '예정된 약속이 없습니다. 위에서 날짜를 골라 추가해 보세요.'
        : (f === 'today' ? '오늘·날짜 없는 할 일이 없습니다.' : '진행 중인 할 일이 없습니다. 위에 한 줄 추가해 보세요.')));
    }

    el.taskDoneList.innerHTML = '';
    if (done.length) {
      done.forEach(function (t) { el.taskDoneList.appendChild(renderTaskRow(t)); });
    } else {
      el.taskDoneList.appendChild(emptyTaskRow('완료한 일이 아직 없습니다.'));
    }

    var todayN = 0, soonN = 0, pastN = 0, noneN = 0;
    openAll.forEach(function (t) {
      var st = dueState(t.due_date);
      if (st === 'today') todayN += 1;
      else if (st === 'tomorrow' || st === 'future') soonN += 1;
      else if (st === 'past') pastN += 1;
      else noneN += 1;
    });

    el.taskBadge.textContent = '진행 중 ' + openAll.length + '건';
    el.taskOpenCount.textContent = open.length + '건';
    el.taskDoneCount.textContent = done.length + '건';

    var bits = ['오늘 ' + todayN + '건', '예정 ' + soonN + '건'];
    if (pastN) bits.push('지남 ' + pastN + '건');
    bits.push('날짜 없음 ' + noneN + '건', '완료 ' + doneAll.length + '건');
    el.taskSummary.textContent = bits.join(' · ');

    if (el.taskFilter) {
      el.taskFilter.querySelectorAll('button[data-filter]').forEach(function (b) {
        var k = b.dataset.filter || 'all';
        b.classList.toggle('active', k === f);
        b.setAttribute('aria-pressed', k === f ? 'true' : 'false');
      });
    }
    if (el.tfAll) el.tfAll.textContent = openAll.length;
    if (el.tfToday) el.tfToday.textContent = openAll.filter(function (t) { return taskMatchesFilter(t, 'today'); }).length;
    if (el.tfUp) el.tfUp.textContent = openAll.filter(function (t) { return taskMatchesFilter(t, 'upcoming'); }).length;

    el.taskSyncNote.textContent = SB.connected
      ? 'AI 서버 연결됨 · 4인방과 실시간 공유 중'
      : '이 기기에만 저장 · AI 서버를 연결하면 4인방과 실시간 공유';
    if (el.taskServerChip) el.taskServerChip.textContent = SB.connected ? '서버 연동' : '기기 저장';

    taskSig = state.tasks.map(function (t) {
      return t.id + ':' + (t.done ? 1 : 0) + ':' + (t.unsynced ? 1 : 0) + ':' + t.title + ':' + (t.owner || '') + ':' + (t.due_date || '');
    }).join('|');
    save();
    renderPcSide();
  }

  function taskWrite(promise) {
    taskWrites += 1;
    function done() {
      taskWrites -= 1;
      lastTaskWriteAt = Date.now();
    }
    return promise.then(function (r) { done(); return r; }, function (e) { done(); throw e; });
  }

  function addTask(title, owner, dueDate) {
    var due = /^\d{4}-\d{2}-\d{2}$/.test(String(dueDate || '')) ? dueDate : '';
    var t = {
      id: uid(),
      title: title,
      owner: PEOPLE[owner] ? owner : 'boss',
      done: false,
      due_date: due,
      created_at: new Date().toISOString()
    };
    state.tasks.push(t);
    renderTasks();
    var what = due ? '약속(' + dueLabel(due) + ')으로 담았어요' : '할 일로 담았어요';
    if (!SB.connected) { toast(what + ' · 이 기기에 저장'); return; }
    taskWrite(sbInsert('office_tasks', { id: t.id, title: t.title, owner: t.owner, done: false, due_date: due || null }))
      .then(function () { return pullTasks(); })
      .catch(function () {
        t.unsynced = true;
        renderTasks();
        toast('서버 저장 실패 · 이 기기에만 담아 뒀어요');
      });
  }

  /* 입력줄의 날짜 칸·빠른 칩(오늘·내일·날짜 없음) 동기화 */
  function setDueInput(v) {
    if (el.taskDue) el.taskDue.value = v || '';
    syncDueChips();
  }

  function syncDueChips() {
    var v = el.taskDue ? el.taskDue.value : '';
    var st = v ? dueState(v) : 'none';
    if (el.taskDueBox) el.taskDueBox.classList.toggle('has-date', !!v);
    if (!el.taskDueChips) return;
    el.taskDueChips.querySelectorAll('button[data-due]').forEach(function (b) {
      var k = b.dataset.due;
      var on = (k === 'today' && st === 'today') || (k === 'tomorrow' && st === 'tomorrow') ||
               (k === 'none' && st === 'none');
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* 기존 항목의 날짜만 바꾸기·지우기 */
  function setTaskDue(t, due) {
    var cur = liveTask(t);
    var prev = cur.due_date || '';
    var next = /^\d{4}-\d{2}-\d{2}$/.test(String(due || '')) ? due : '';
    if (next === prev) { renderTasks(); return; }
    cur.due_date = next;
    renderTasks();
    if (cur.unsynced || !SB.connected) {
      toast(next ? dueLabel(next) + ' 약속으로 바꿨어요 · 이 기기에만' : '날짜를 지웠어요 · 이 기기에만');
      return;
    }
    taskWrite(sbPatch('office_tasks', cur.id, { due_date: next || null, updated_at: new Date().toISOString() }))
      .then(function () { return pullTasks().catch(function () {}); })
      .catch(function () {
        cur.due_date = prev;
        renderTasks();
        toast('서버 반영 실패 · AI 서버 연결을 확인해 주세요');
      });
  }

  /* 4.5초 조회가 돌면서 항목 객체가 새로 만들어지면, 화면이 들고 있던 옛 객체 대신
     지금 목록에 있는 같은 id의 항목을 고쳐야 합니다. */
  function liveTask(t) {
    for (var i = 0; i < state.tasks.length; i++) {
      if (state.tasks[i].id === t.id) return state.tasks[i];
    }
    return t;
  }

  function toggleTask(t) {
    var cur = liveTask(t);
    var next = !cur.done;
    cur.done = next;
    renderTasks();
    if (!SB.connected) return;
    taskWrite(sbPatch('office_tasks', t.id, { done: next, updated_at: new Date().toISOString() }))
      .catch(function () {
        cur.done = !next;
        renderTasks();
        toast('서버 반영 실패 · AI 서버 연결을 확인해 주세요');
      });
  }

  function removeTask(t) {
    var cur = liveTask(t);
    var idx = state.tasks.indexOf(cur);
    taskGone[t.id] = Date.now();
    state.tasks = state.tasks.filter(function (x) { return x.id !== t.id; });
    renderTasks();
    if (!SB.connected) return;
    taskWrite(sbDelete('office_tasks', t.id)).then(function () {
      /* 서버에서 지워진 걸 확인한 뒤에 이 id를 풀어 줍니다(그 사이 조회가 와도 부활하지 않게) */
      lastTaskWriteAt = Date.now();
    }).catch(function () {
      delete taskGone[t.id];
      var back = state.tasks.some(function (x) { return x.id === cur.id; });
      if (!back) {
        if (idx >= 0) state.tasks.splice(idx, 0, cur);
        else state.tasks.push(cur);
      }
      renderTasks();
      toast('서버 삭제 실패 · 연결을 확인해 주세요');
    });
  }

  /* 서버 rows -> 화면. 서버에 아직 못 올린 항목(unsynced)은 목록에 남겨 둡니다. */
  function applyServerTasks(rows) {
    var now = Date.now();
    Object.keys(taskGone).forEach(function (id) {
      if (now - taskGone[id] > 20000) delete taskGone[id];
    });
    var list = rows.filter(function (r) { return !taskGone[r.id]; }).map(taskFromRow);
    state.tasks.forEach(function (t) {
      if (!t.unsynced) return;
      var dup = list.some(function (x) { return x.id === t.id; });
      if (!dup) list.push(t);
    });
    list.sort(byCreated);
    var sig = list.map(function (t) {
      return t.id + ':' + (t.done ? 1 : 0) + ':' + (t.unsynced ? 1 : 0) + ':' + t.title + ':' + (t.owner || '') + ':' + (t.due_date || '');
    }).join('|');
    state.tasks = list;
    if (sig === taskSig) return;
    renderTasks();
  }

  function pullTasks() {
    if (!SB.connected) return Promise.resolve(false);
    var askedAt = Date.now();
    return sbRequest('/rest/v1/office_tasks?select=id,title,owner,done,due_date,created_at&order=created_at.asc&limit=500')
      .then(function (rows) {
        if (!Array.isArray(rows)) return false;
        /* 방금 내가 보낸 쓰기보다 먼저 떠난 조회는 옛 값이므로 화면에 반영하지 않습니다 */
        if (taskWrites > 0 || askedAt < lastTaskWriteAt) return false;
        applyServerTasks(rows);
        return true;
      });
  }

  /* ---------------- crew ---------------- */
  function renderCrew() {
    var row = el.crewRow;
    row.innerHTML = '';
    CREW.forEach(function (c) {
      var p = PEOPLE[c.id];
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'crew-mini';
      card.setAttribute('data-view', 'assistants');
      card.innerHTML = '<div class="avatar ' + p.cls + '">' + p.initial + '</div>' +
        '<div class="crew-mini-txt"><b>' + pname(p) + '</b><span>' + c.device + ' · ' + c.handle + '</span></div>';
      card.addEventListener('click', function () { setView('assistants'); });
      row.appendChild(card);
    });

    var list = el.crewList;
    list.innerHTML = '';
    CREW.forEach(function (c) {
      var p = PEOPLE[c.id];
      var card = document.createElement('article');
      card.className = 'card crew-card';
      card.innerHTML =
        '<div class="crew-head">' +
          '<div class="avatar ' + p.cls + '">' + p.initial + '</div>' +
          '<div class="crew-head-txt"><h3>' + pname(p) + '</h3><p>' + c.device + ' · ' + c.handle + '</p></div>' +
          '<span class="chip chip-ok">대기</span>' +
        '</div>' +
        '<p class="crew-role">' + c.role + '</p>' +
        '<div class="crew-tags">' + c.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>';
      list.appendChild(card);
    });
  }

  /* ---------------- 🗺️ 오피스 맵 ---------------- */
  /* 캐릭터는 평면도(1402×1122) 위 노드를 그래프로 이어 실제로 걸어 다닙니다.
     노드의 room 값에 따라 말풍선 멘트와 '현재 위치' 카드가 방에 맞춰 바뀝니다. */
  var MAP_NODES = {
    /* 👑 지휘실 · 중앙 사무 공간 */
    topC:    { x: 57,   y: 26,   room: 'command' },
    topL:    { x: 44,   y: 25.5, room: 'command' },
    cmdL:    { x: 42.5, y: 21.5, room: 'command' },
    topR:    { x: 68,   y: 25.5, room: 'command' },
    cmdR:    { x: 75,   y: 21.5, room: 'command' },
    topRR:   { x: 76.5, y: 27,   room: 'command' },
    d1:      { x: 49,   y: 33,   room: 'command' },
    d2:      { x: 63.5, y: 47,   room: 'command' },
    d3:      { x: 48,   y: 60,   room: 'command' },
    midT:    { x: 56.5, y: 34,   room: 'command' },
    midM:    { x: 56.5, y: 46,   room: 'command' },
    midL:    { x: 56.5, y: 60,   room: 'command' },
    midB:    { x: 53,   y: 74,   room: 'command' },
    midBB:   { x: 52,   y: 87,   room: 'command' },
    leftT:   { x: 37,   y: 26,   room: 'command' },
    leftM:   { x: 37,   y: 46,   room: 'command' },
    leftL:   { x: 37,   y: 68,   room: 'command' },
    leftB:   { x: 37,   y: 84,   room: 'command' },
    botL:    { x: 45,   y: 89,   room: 'command' },
    bMid:    { x: 46,   y: 71,   room: 'command' },
    rMid:    { x: 76.5, y: 42,   room: 'command' },
    /* 🏛️ 대회의실 */
    door:    { x: 34,   y: 23.5, room: 'grand' },
    gTopR:   { x: 30.5, y: 21,   room: 'grand' },
    gTopL:   { x: 20,   y: 22,   room: 'grand' },
    gMid:    { x: 31,   y: 47,   room: 'grand' },
    gBot:    { x: 29.5, y: 70,   room: 'grand' },
    /* ☕ 라운지 */
    lngIn:   { x: 63,   y: 88,   room: 'lounge' },
    lngSofa: { x: 70,   y: 79.5, room: 'lounge' },
    lngBar:  { x: 85.5, y: 71.5, room: 'lounge' }
  };

  var MAP_EDGES = [
    ['topC', 'topL'], ['topL', 'leftT'], ['topL', 'cmdL'],
    ['topC', 'topR'], ['topR', 'cmdR'], ['topR', 'topRR'],
    ['topC', 'midT'], ['midT', 'd1'], ['midT', 'midM'], ['midM', 'd2'],
    ['midM', 'midL'], ['midL', 'd3'], ['midL', 'midB'], ['midB', 'midBB'],
    ['midBB', 'botL'], ['botL', 'leftB'], ['leftB', 'leftL'], ['leftL', 'leftM'], ['leftM', 'leftT'],
    ['midB', 'bMid'], ['bMid', 'leftL'], ['topRR', 'rMid'],
    ['midBB', 'lngIn'], ['lngIn', 'lngSofa'], ['lngSofa', 'lngBar'],
    ['leftT', 'door'], ['door', 'gTopR'], ['gTopR', 'gTopL'], ['gTopR', 'gMid'], ['gMid', 'gBot']
  ];

  var MAP_LINK = {};
  MAP_EDGES.forEach(function (e) {
    (MAP_LINK[e[0]] = MAP_LINK[e[0]] || []).push(e[1]);
    (MAP_LINK[e[1]] = MAP_LINK[e[1]] || []).push(e[0]);
  });

  /* 노드 그래프 최단 경로(BFS) — 복도만 따라 걷게 합니다. */
  function mapPath(from, to) {
    if (!MAP_NODES[from] || !MAP_NODES[to] || from === to) return [];
    var prev = {};
    var seen = {};
    var q = [from];
    seen[from] = true;
    while (q.length) {
      var cur = q.shift();
      var nb = MAP_LINK[cur] || [];
      for (var i = 0; i < nb.length; i++) {
        var n = nb[i];
        if (seen[n]) continue;
        seen[n] = true;
        prev[n] = cur;
        if (n === to) {
          var out = [to];
          var p = to;
          while (p !== from) {
            p = prev[p];
            if (!p) return [];
            out.unshift(p);
          }
          return out.slice(1);
        }
        q.push(n);
      }
    }
    return [];
  }

  var MAP_CAST = [
    {
      id: 'director', station: 'topC', bubble: 'right',
      place: '👑 지휘실', duty: '지휘실 대기 · 지시 대기',
      spots: ['topC', 'cmdL', 'topR', 'topL', 'cmdR'],
      trips: ['lngBar', 'gTopR', 'topRR'],
      speed: 4.2, tripChance: 0.14,
      moods: {
        command: ['지시 정리 중', '원고 사실 검수', '발행·시트 확인', '소싱 4종 취합', '4인방 보고 대기'],
        grand: ['대회의실 입장', '회의 준비 중', '보고 한 줄 정리'],
        lounge: ['커피 한 잔', '잠깐 환기 중', '라운지에서 정리'],
        walk: ['이동 중…', '자리 비움', '잠시 이동']
      }
    },
    {
      id: 'jju1', station: 'd1', bubble: 'up',
      place: '👑 지휘실 워크스테이션', duty: '1번 채널 대기 중',
      spots: ['d1', 'leftT', 'leftM', 'leftL'],
      trips: ['lngSofa', 'gTopL', 'topC'],
      speed: 4.8, tripChance: 0.16,
      moods: {
        command: ['스레드 체크 중', '유튜브 대본 작성', '소싱 확인 중', '1번 원고 다듬기'],
        grand: ['대본 공유 중', '주제 3종 정리', '회의실 대기'],
        lounge: ['커피 타는 중', '머리 식히는 중'],
        walk: ['이동 중…', '복도 지나는 중']
      }
    },
    {
      id: 'jju2', station: 'd2', bubble: 'up',
      place: '👑 지휘실 워크스테이션', duty: '2번 채널 대기 중',
      spots: ['d2', 'topRR', 'rMid'],
      trips: ['lngBar', 'gBot', 'topL'],
      speed: 4.6, tripChance: 0.14,
      moods: {
        command: ['1688 신상품 서칭', '2번 채널 체크', '소싱가 비교 중', '원고 발행 확인'],
        grand: ['1688 후보 공유', '신상품 정리 중', '회의실 대기'],
        lounge: ['커피 한 모금', '소파에서 점검'],
        walk: ['이동 중…', '1688 보러 가는 중']
      }
    },
    {
      id: 'jju3', station: 'd3', bubble: 'up',
      place: '👑 지휘실 워크스테이션', duty: '3번 채널 대기 중',
      spots: ['d3', 'midB', 'bMid', 'botL'],
      trips: ['gBot', 'lngSofa', 'topL'],
      speed: 5, tripChance: 0.14,
      moods: {
        command: ['3번 채널 체크', '업리카 세션 확인', '오늘 할 일 정리', '소싱 확인 중'],
        grand: ['발행 결과 공유', '체크리스트 정리', '회의실 대기'],
        lounge: ['잠깐 숨 고르기', '라운지 대기'],
        walk: ['이동 중…', '잠시 자리 비움']
      }
    }
  ];

  var ROOM_LABEL = { grand: '🏛️ 대회의실', command: '👑 지휘실', lounge: '☕ 라운지' };

  function latestBy(author) {
    var latest = null;
    state.messages.forEach(function (m) {
      if (m.author !== author) return;
      if (!latest || new Date(m.created_at) > new Date(latest.created_at)) latest = m;
    });
    return latest;
  }

  function clipText(text, max) {
    var plain = String(text || '').replace(/\s+/g, ' ').trim();
    var chars = Array.from(plain);
    if (chars.length <= max) return chars.join('');
    return chars.slice(0, max - 1).join('') + '…';
  }

  function pickPhrase(pool, prev) {
    if (!pool || !pool.length) return '대기 중';
    if (pool.length === 1) return pool[0];
    var pick = pool[Math.floor(Math.random() * pool.length)];
    var guard = 0;
    while (pick === prev && guard++ < 6) pick = pool[Math.floor(Math.random() * pool.length)];
    return pick;
  }

  /* ---------------- 걷기 엔진 ---------------- */
  var WALKERS = [];
  var WALK = { raf: 0, on: false, last: 0, w: 0, h: 0, layoutAt: 0, moodAt: 0 };

  function walkerOf(id) {
    for (var i = 0; i < WALKERS.length; i++) if (WALKERS[i].id === id) return WALKERS[i];
    return null;
  }

  function measureStage() {
    if (!el.mapStage) return false;
    WALK.w = el.mapStage.clientWidth;
    WALK.h = el.mapStage.clientHeight;
    return !!(WALK.w && WALK.h);
  }

  function moveFig(w) {
    if (!w.el) return;
    var px = (WALK.w || 0) * w.x / 100;
    var py = (WALK.h || 0) * w.y / 100;
    w.el.style.transform = 'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px) translate(-50%,-50%)';
    w.el.style.zIndex = String(10 + Math.round(w.y));
  }

  function setWalkState(w, walking) {
    var body = w.el && w.el.querySelector('.map-fig-body');
    if (!body) return;
    if (w.landTimer) { clearTimeout(w.landTimer); w.landTimer = 0; }
    body.classList.remove('is-land');
    body.classList.toggle('is-walk', walking);
    body.classList.toggle('is-idle', !walking);
  }

  /* 걷는 방향 — 그림만 좌우로 뒤집고 이름표 글자는 그대로 둡니다. */
  function setFacing(w, dir) {
    if (w.dir === dir) return;
    w.dir = dir;
    if (w.el) w.el.dataset.dir = dir;
  }

  function planWalker(w, now) {
    var cfg = w.cfg;
    var trip = Math.random() < (cfg.tripChance || 0.18);
    var pool = (trip ? cfg.trips : cfg.spots) || [cfg.station];
    var goal = pool[Math.floor(Math.random() * pool.length)];
    if (goal === w.node && pool.length > 1) {
      goal = pool[(pool.indexOf(goal) + 1) % pool.length];
    }
    var path = mapPath(w.node, goal);
    if (!path.length) {
      w.idleUntil = now + 2400;
      return;
    }
    w.trip = trip;
    w.path = path;
    w.target = w.path.shift();
    w.showLatest = false;

    var goalRoom = (MAP_NODES[goal] || {}).room;
    var curRoom = (MAP_NODES[w.node] || {}).room;
    w.moveLabel = goalRoom !== curRoom
      ? (goalRoom === 'grand' ? '대회의실로 이동' : goalRoom === 'lounge' ? '라운지로 이동' : '지휘실로 복귀')
      : '';
    w.mood = w.moveLabel || pickPhrase(cfg.moods.walk, w.mood);
    w.moodUntil = now + 3400 + Math.random() * 1600;
    paintBubble(w);
    setWalkState(w, true);
  }

  function arrive(w, now) {
    setWalkState(w, false);
    w.moveLabel = '';
    var room = (MAP_NODES[w.node] || {}).room || 'command';
    var pool = (w.cfg.moods && w.cfg.moods[room]) || w.cfg.moods.command || ['대기 중'];
    var last = latestBy(w.id);
    w.showLatest = !!(last && Math.random() < 0.45);
    if (!w.showLatest) w.mood = pickPhrase(pool, w.mood);
    w.idleUntil = now + 4200 + Math.random() * 5200;
    w.moodUntil = now + 3400 + Math.random() * 3200;
    paintBubble(w);

    var body = w.el && w.el.querySelector('.map-fig-body');
    if (body) {
      body.classList.remove('is-walk', 'is-idle');
      body.classList.add('is-land');
      w.landTimer = setTimeout(function () {
        w.landTimer = 0;
        body.classList.remove('is-land');
        body.classList.add('is-idle');
      }, 520);
    }
    updateMap(false);
  }

  function stepWalker(w, dt, now) {
    if (!w.target) {
      if (now < w.idleUntil) return;
      planWalker(w, now);
      return;
    }
    var t = MAP_NODES[w.target];
    if (!t) { w.target = null; return; }
    var dx = t.x - w.x;
    var dy = t.y - w.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    /* 걷는 방향으로 얼굴을 돌립니다(이름표 글자는 그대로 — 그림만 좌우 반전). */
    if (Math.abs(dx) > 0.3) setFacing(w, dx < 0 ? 'l' : 'r');
    var step = (w.cfg.speed || 4.6) * dt;
    if (dist <= step) {
      w.x = t.x;
      w.y = t.y;
      w.node = w.target;
      w.target = null;
      if (w.path.length) { w.target = w.path.shift(); return; }
      arrive(w, now);
      return;
    }
    w.x += (dx / dist) * step;
    w.y += (dy / dist) * step;
  }

  function narrowScreen() {
    return (window.innerWidth || document.documentElement.clientWidth || 0) < 480;
  }

  function paintBubble(w) {
    if (!w.bubble) return;
    var txtEl = w.bubble.querySelector('.bub-txt');
    if (!txtEl) return;
    var txt = w.mood || w.cfg.duty;
    if (w.showLatest) {
      var last = latestBy(w.id);
      if (last && last.body) txt = clipText(last.body, narrowScreen() ? 12 : 18);
    }
    if (txtEl.textContent === txt) return;
    txtEl.textContent = txt;
    txtEl.classList.remove('is-pop');
    void txtEl.offsetWidth;
    txtEl.classList.add('is-pop');
    WALK.layoutAt = 0;
  }

  function rollMoods(now) {
    WALKERS.forEach(function (w) {
      if (now < w.moodUntil) return;
      w.moodUntil = now + 3800 + Math.random() * 3600;
      if (w.target) {
        w.showLatest = false;
        w.mood = (w.moveLabel && Math.random() < 0.7) ? w.moveLabel : pickPhrase(w.cfg.moods.walk, w.mood);
      } else {
        var room = (MAP_NODES[w.node] || {}).room || 'command';
        var pool = (w.cfg.moods && w.cfg.moods[room]) || w.cfg.moods.command || ['대기 중'];
        var last = latestBy(w.id);
        w.showLatest = !!(last && Math.random() < 0.4);
        if (!w.showLatest) w.mood = pickPhrase(pool, w.mood);
      }
      paintBubble(w);
      if (!w.target && Math.random() < 0.22) hop(w);
    });
  }

  /* 가끔 한 번 살짝 들썩 — 가만히 서 있어도 살아 있게 */
  function hop(w) {
    var body = w.el && w.el.querySelector('.map-fig-body');
    if (!body || body.classList.contains('is-walk')) return;
    body.classList.remove('is-idle');
    body.classList.add('is-land');
    setTimeout(function () {
      body.classList.remove('is-land');
      if (!w.target) body.classList.add('is-idle');
    }, 500);
  }

  /* ---------------- 말풍선 겹침 정리 ---------------- */
  /* 말풍선은 캐릭터(.map-fig)와 분리된 레이어에 절대 좌표로 그립니다.
     그래야 다른 캐릭터 머리 뒤로 말풍선이 숨지 않습니다. */
  var BUB_GAP = 6;
  var BUB_GAP2 = 26;

  function overlapArea(a, b) {
    var w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    var h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return (w > 0 && h > 0) ? w * h : 0;
  }

  function bubRect(pos, cx, cy, fx, fy, fw, fh, bw, bh) {
    var gap = (pos === 'up2' || pos === 'down2') ? BUB_GAP2 : BUB_GAP;
    if (pos === 'up' || pos === 'up2') return { x: cx - bw / 2, y: fy - gap - bh, w: bw, h: bh };
    if (pos === 'down' || pos === 'down2') return { x: cx - bw / 2, y: fy + fh + gap, w: bw, h: bh };
    if (pos === 'left') return { x: fx - gap - bw, y: cy - bh / 2, w: bw, h: bh };
    return { x: fx + fw + gap, y: cy - bh / 2, w: bw, h: bh };
  }

  function bubScore(r, placed, blockers, sw, sh) {
    var out = 0;
    if (r.x < 2) out += 2 - r.x;
    if (r.y < 2) out += 2 - r.y;
    if (r.x + r.w > sw - 2) out += r.x + r.w - (sw - 2);
    if (r.y + r.h > sh - 2) out += r.y + r.h - (sh - 2);
    var over = 0;
    for (var i = 0; i < placed.length; i++) over += overlapArea(r, placed[i]);
    var blocked = 0;
    for (var j = 0; j < blockers.length; j++) blocked += overlapArea(r, blockers[j].r) * blockers[j].w;
    return over + blocked + out * 120;
  }

  /* 이름표가 이웃 캐릭터 얼굴·다른 이름표에 가리지 않도록 좌우로 조금 비켜 놓습니다.
     가만히 있는데도 자리가 계속 바뀌면 깜박이므로, 지금 자리에 보너스 점수를 줘서 유지합니다. */
  var NAME_SHIFT = {};
  var NAME_CANDS = [0, -0.45, 0.45, -0.85, 0.85, -1.3, 1.3];

  function declutterNames(sw, sh, order, stageRect) {
    var avatars = [];
    var placedNames = [];

    order.forEach(function (w) {
      if (!w.el) return;
      var av = w.el.querySelector('.map-avatar');
      if (!av) return;
      var ar = av.getBoundingClientRect();
      avatars.push({ x: ar.x - stageRect.x, y: ar.y - stageRect.y, w: ar.width, h: ar.height });
    });

    /* 방 이름표(대회의실·지휘실·라운지)도 피합니다 */
    var zoneRects = [].map.call(el.mapStage.querySelectorAll('.zone-tag'), function (tag) {
      var tr = tag.getBoundingClientRect();
      return { x: tr.x - stageRect.x, y: tr.y - stageRect.y, w: tr.width, h: tr.height };
    });

    order.forEach(function (w) {
      if (!w.el) return;
      var nm = w.el.querySelector('.map-name');
      if (!nm || !nm.offsetWidth) return;
      var nr = nm.getBoundingClientRect();
      var nw = nr.width;
      var nh = nr.height;
      var cx = sw * w.x / 100;
      var top = nr.y - stageRect.y;
      var cur = NAME_SHIFT[w.id] || 0;
      var best = null;

      for (var i = 0; i < NAME_CANDS.length; i++) {
        var off = Math.round(NAME_CANDS[i] * nw);
        var r = { x: cx - nw / 2 + off, y: top, w: nw, h: nh };
        var score = Math.abs(off) * 0.08;
        if (r.x < 2) score += (2 - r.x) * 40;
        if (r.x + r.w > sw - 2) score += (r.x + r.w - sw + 2) * 40;
        for (var a = 0; a < avatars.length; a++) score += overlapArea(r, avatars[a]) * 1.4;
        for (var z = 0; z < zoneRects.length; z++) score += overlapArea(r, zoneRects[z]) * 0.9;
        for (var b = 0; b < placedNames.length; b++) score += overlapArea(r, placedNames[b]);
        if (off === cur) score -= 14;
        if (!best || score < best.score) best = { score: score, r: r, off: off };
      }

      NAME_SHIFT[w.id] = best.off;
      nm.style.transform = best.off ? 'translateX(' + best.off + 'px)' : '';
      placedNames.push(best.r);
    });

    return placedNames;
  }

  function layoutBubbles() {
    if (!el.mapStage) return;
    var sw = WALK.w || el.mapStage.clientWidth;
    var sh = WALK.h || el.mapStage.clientHeight;
    if (!sw || !sh) return;

    var placed = [];
    var blockers = [];
    var order = WALKERS.slice().sort(function (a, b) { return b.y - a.y; });
    var stageRect = el.mapStage.getBoundingClientRect();
    var nameRects = declutterNames(sw, sh, order, stageRect);

    /* 캐릭터 몸(머리+이름표)도 장애물로 넣어 말풍선이 얼굴을 가리지 않게 */
    order.forEach(function (w) {
      if (!w.el) return;
      var fw = w.el.offsetWidth;
      var fh = w.el.offsetHeight;
      var cx = sw * w.x / 100;
      var cy = sh * w.y / 100;
      w.figBox = { x: cx - fw / 2, y: cy - fh / 2, w: fw, h: fh };
      blockers.push({ r: { x: cx - fw / 2 - 2, y: cy - fh / 2 - 2, w: fw + 4, h: fh + 4 }, w: 0.35 });
    });

    /* 이름표(직함 포함)는 글자가 읽혀야 하므로 더 강한 장애물로 둡니다 */
    nameRects.forEach(function (r) {
      blockers.push({ r: { x: r.x - 3, y: r.y - 3, w: r.w + 6, h: r.h + 6 }, w: 1.1 });
    });

    /* 방 이름표(존 태그)도 살짝 피해 갑니다 */
    [].forEach.call(el.mapStage.querySelectorAll('.zone-tag'), function (tag) {
      var tr = tag.getBoundingClientRect();
      blockers.push({ r: { x: tr.x - stageRect.x, y: tr.y - stageRect.y, w: tr.width, h: tr.height }, w: 0.6 });
    });

    order.forEach(function (w) {
      var bub = w.bubble;
      if (!bub || !w.figBox) return;
      var bw = bub.offsetWidth;
      var bh = bub.offsetHeight;
      if (!bw || !bh) return;

      var box = w.figBox;
      var cx = box.x + box.w / 2;
      var cy = box.y + box.h / 2;

      var pref = w.cfg.bubble === 'right'
        ? ['right', 'up', 'up2', 'down', 'left', 'down2']
        : ['up', 'up2', 'down', 'right', 'down2', 'left'];
      var best = null;
      for (var i = 0; i < pref.length; i++) {
        var r = bubRect(pref[i], cx, cy, box.x, box.y, box.w, box.h, bw, bh);
        var score = bubScore(r, placed, blockers, sw, sh) + i * 40;
        if (!best || score < best.score) best = { pos: pref[i], r: r, score: score };
        if (score < 40) break;
      }

      /* 자리가 자주 바뀌면 깜빡이므로, 지금 자리가 조금 나빠도 유지합니다. */
      var cur = bub.dataset.pos;
      if (cur && cur !== best.pos) {
        var cr = bubRect(cur, cx, cy, box.x, box.y, box.w, box.h, bw, bh);
        var cs = bubScore(cr, placed, blockers, sw, sh) + Math.max(0, pref.indexOf(cur)) * 40;
        if (cs <= best.score + 200) best = { pos: cur, r: cr, score: cs };
      }

      if (bub.dataset.pos !== best.pos) bub.dataset.pos = best.pos;
      bub.classList.toggle('no-tail', best.pos === 'up2' || best.pos === 'down2');
      bub.style.left = best.r.x.toFixed(1) + 'px';
      bub.style.top = best.r.y.toFixed(1) + 'px';
      placed.push(best.r);
    });
  }

  /* ---------------- 프레임 루프 ---------------- */
  function walkFrame(ts) {
    if (!WALK.on) return;
    var now = ts || performance.now();
    var dt = WALK.last ? Math.min(0.1, (now - WALK.last) / 1000) : 0.016;
    WALK.last = now;

    if (!WALK.w || !WALK.h) {
      if (!measureStage()) { WALK.raf = requestAnimationFrame(walkFrame); return; }
      WALKERS.forEach(moveFig);
    }

    for (var i = 0; i < WALKERS.length; i++) stepWalker(WALKERS[i], dt, now);
    for (i = 0; i < WALKERS.length; i++) moveFig(WALKERS[i]);

    if (now - WALK.layoutAt > 300) { WALK.layoutAt = now; layoutBubbles(); }
    if (now - WALK.moodAt > 700) { WALK.moodAt = now; rollMoods(now); }

    WALK.raf = requestAnimationFrame(walkFrame);
  }

  var WALK_RETRY = 0;
  function startMapWalk() {
    if (WALK.on) return;
    if (state.view !== 'map' && !pcSplitOn()) return;
    if (document.visibilityState === 'hidden') return;
    if (!measureStage()) {
      /* 첫 프레임에 아직 맵 크기가 안 잡혔으면(2단으로 막 켠 순간) 한두 번만 다시 시도합니다. */
      if (WALK_RETRY < 2) {
        WALK_RETRY += 1;
        window.requestAnimationFrame(startMapWalk);
      }
      return;
    }
    WALK_RETRY = 0;
    WALK.on = true;
    WALK.last = 0;
    WALK.layoutAt = 0;
    WALKERS.forEach(moveFig);
    layoutBubbles();
    WALK.raf = requestAnimationFrame(walkFrame);
  }

  function stopMapWalk() {
    WALK.on = false;
    WALK_RETRY = 0;
    if (WALK.raf) cancelAnimationFrame(WALK.raf);
    WALK.raf = 0;
    WALK.last = 0;
  }

  /* ---------------- 그리기 ---------------- */
  function renderMapFigures() {
    var box = el.mapFigs;
    if (!box) return;
    box.innerHTML = '';
    var bubbleLayer = el.mapBubbles;
    if (bubbleLayer) bubbleLayer.innerHTML = '';
    WALKERS = [];

    MAP_CAST.forEach(function (c) {
      var p = PEOPLE[c.id];
      var st = MAP_NODES[c.station] || { x: 50, y: 50 };
      var w = {
        id: c.id, cfg: c, node: c.station,
        x: st.x, y: st.y,
        path: [], target: null, trip: false, dir: 'r',
        idleUntil: 0, moodUntil: 0, mood: '', moveLabel: '', showLatest: false,
        landTimer: 0, el: null
      };

      var fig = document.createElement('button');
      fig.type = 'button';
      fig.className = 'map-fig fig-' + c.id;
      fig.dataset.person = c.id;
      fig.dataset.dir = 'r';
      fig.setAttribute('aria-label', pname(p) + ' 최근 보고 보기');

      var bub = document.createElement('span');
      bub.className = 'map-bubble';
      bub.dataset.pos = 'up';
      bub.style.left = '-9999px';   /* 첫 배치 전까지 화면 밖에 둡니다 */
      var bubTxt = document.createElement('span');
      bubTxt.className = 'bub-txt';
      bubTxt.textContent = c.duty;
      bub.appendChild(bubTxt);
      bub.addEventListener('click', function () { openSheet(c.id); });
      if (bubbleLayer) bubbleLayer.appendChild(bub);

      var body = document.createElement('span');
      body.className = 'map-fig-body is-idle';
      var av = document.createElement('span');
      av.className = 'map-avatar ' + p.cls;
      paintAvatar(av, c.id);
      var nm = document.createElement('span');
      nm.className = 'map-name';
      var nmName = document.createElement('b');
      nmName.textContent = p.name;
      nm.appendChild(nmName);
      if (p.title) {
        var nmTitle = document.createElement('i');
        nmTitle.textContent = p.title;
        nm.appendChild(nmTitle);
      }
      body.appendChild(av);
      body.appendChild(nm);

      fig.appendChild(body);
      fig.addEventListener('click', function () { openSheet(c.id); });

      w.el = fig;
      w.bubble = bub;
      w.idleUntil = performance.now() + WALKERS.length * 1100 + Math.random() * 900;
      WALKERS.push(w);
      box.appendChild(fig);
      moveFig(w);
    });

    updateMap(true);
    startMapWalk();
  }

  var mapSig = '';
  var mapCards = [];

  function updateMap(force) {
    if (!el.mapFigs) return;
    var connected = !!SB.connected;

    if (el.mapSyncChip) {
      el.mapSyncChip.textContent = connected ? '실시간 연결' : '로컬 모드';
      el.mapSyncChip.classList.toggle('chip-ok', connected);
      el.mapSyncChip.classList.toggle('chip-soft', !connected);
    }
    if (el.mapLiveDot) el.mapLiveDot.classList.toggle('off', !connected);

    var rows = MAP_CAST.map(function (c) {
      var last = latestBy(c.id);
      var w = walkerOf(c.id);
      var here = w && MAP_NODES[w.node] ? ROOM_LABEL[MAP_NODES[w.node].room] : '';
      var place = here || (last && ROOM_LABEL[last.room] ? ROOM_LABEL[last.room] : c.place);

      if (w && last && (!w.lastSeen || w.lastSeen.id !== last.id)) {
        w.lastSeen = last;
        w.showLatest = true;
        w.moodUntil = performance.now() + 6000;
        paintBubble(w);
      }

      return {
        c: c,
        p: PEOPLE[c.id],
        last: last,
        place: place,
        status: last ? clipText(last.body, 22) : c.duty
      };
    });

    if (!el.mapStatus) return;

    var sig = (connected ? '1' : '0') + '|' + rows.map(function (r) {
      return r.c.id + '·' + r.place + '·' + r.status;
    }).join('|');
    if (!force && sig === mapSig) return;
    mapSig = sig;

    /* 카드는 한 번만 만들고 글자만 바꿉니다 — 폴링 중에 누르던 탭이 끊기지 않게. */
    if (mapCards.length !== rows.length) {
      el.mapStatus.innerHTML = '';
      mapCards = rows.map(function (row) {
        var card = document.createElement('button');
        card.type = 'button';
        card.className = 'map-stat';
        card.setAttribute('aria-label', pname(row.p) + ' 빠른 시트 열기');
        card.addEventListener('click', function () { openSheet(row.c.id); });

        var av = document.createElement('span');
        av.className = 'map-avatar sm ' + row.p.cls;
        paintAvatar(av, row.c.id);

        var txt = document.createElement('span');
        txt.className = 'map-stat-txt';

        var top = document.createElement('span');
        top.className = 'map-stat-top';
        var nm = document.createElement('b');
        nm.textContent = pname(row.p);
        var pl = document.createElement('i');
        top.appendChild(nm);
        top.appendChild(pl);

        var st = document.createElement('span');
        st.className = 'map-stat-status';

        txt.appendChild(top);
        txt.appendChild(st);
        card.appendChild(av);
        card.appendChild(txt);
        el.mapStatus.appendChild(card);
        return { card: card, place: pl, status: st };
      });
    }

    rows.forEach(function (row, i) {
      var refs = mapCards[i];
      if (!refs) return;
      if (refs.place.textContent !== row.place) refs.place.textContent = row.place;
      if (refs.status.textContent !== row.status) refs.status.textContent = row.status;
    });
  }

  function openSheet(id) {
    var c = MAP_CAST.filter(function (x) { return x.id === id; })[0];
    if (!c || !el.mapSheet) return;
    var p = PEOPLE[id];
    var last = latestBy(id);
    var w = walkerOf(id);
    var here = w && MAP_NODES[w.node] ? ROOM_LABEL[MAP_NODES[w.node].room] : '';

    el.sheetAvatar.className = 'map-avatar sheet-avatar ' + p.cls;
    paintAvatar(el.sheetAvatar, id);
    el.sheetName.textContent = pname(p);
    el.sheetMeta.textContent = p.device + ' · ' + (here || (last && ROOM_LABEL[last.room] ? ROOM_LABEL[last.room] : c.place));
    el.sheetBody.textContent = last
      ? clipText(last.body, 220)
      : '아직 올린 보고가 없습니다. 회의실에서 ' + pname(p) + '에게 지시하면 최근 보고가 여기에 뜹니다.';
    el.sheetTime.textContent = last ? timeLabel(last.created_at) + ' · ' + (ROOM_LABEL[last.room] || '') : '';

    el.sheetRooms.querySelectorAll('[data-map-room]').forEach(function (b) {
      var hereRoom = !!(last && last.room === b.dataset.mapRoom);
      b.classList.toggle('here', hereRoom);
      b.setAttribute('aria-current', hereRoom ? 'true' : 'false');
    });

    el.mapSheet.hidden = false;
  }

  function closeSheet() {
    if (el.mapSheet) el.mapSheet.hidden = true;
  }

  function selectRoom(room) {
    if (!ROOMS[room]) return;
    state.room = room;
    document.querySelectorAll('.room-tab').forEach(function (b) {
      var on = b.dataset.room === room;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    el.roomMeta.textContent = ROOMS[room].meta;
    el.chatInput.placeholder = ROOMS[room].placeholder;
    el.chatInput.blur();
    /* 방에 들어왔으니 이 방을 읽음으로 남기고, 다른 사람의 읽음 현황을 바로 받아 옵니다. */
    markRead(room, true);
    pullReads(room, true).catch(function () {});
    renderChat();
    save();
  }

  function goRoom(room) {
    if (!ROOMS[room]) return;
    selectRoom(room);
    closeSheet();
    setView('office');
    pulseCol('office');
  }

  /* ---------------- ✍️ 블로그 ---------------- */
  /* 원고·키워드·디렉토리는 2026-11-25 정리본 기준입니다.
     발행 상태와 디렉토리 진행은 이 브라우저(localStorage)에만 저장됩니다. */
  var BLOG_KEY = 'jju-office-blog-v1';

  var BLOG_KEYWORDS = [
    { kw: '생활용품 도매 사이트', kind: '핵심' },
    { kw: '소량 사입 도매몰', kind: '핵심' },
    { kw: '문구 위탁판매 도매처', kind: '핵심' },
    { kw: '여행용품 B2B 도매', kind: '핵심' },
    { kw: '생활잡화 도매', kind: '확장' },
    { kw: '스마트스토어 소싱처', kind: '확장' },
    { kw: '쿠팡 위탁 도매', kind: '확장' },
    { kw: '사업자 전용 도매몰', kind: '확장' }
  ];

  var BLOG_DIRS = [
    {
      id: 'naseller', name: '나셀러',
      note: '무료 · 고객센터 운영자 문의 게시판에 사이트 정보를 적어 신청',
      url: 'https://naseller.com/mall_list/1436', linkText: '나셀러'
    },
    {
      id: 'sellerwiki', name: '셀러위키',
      note: 'B2B 도매리스트 300곳 · 입점 페이지 톡상담 또는 메일 seller-wiki@daum.net',
      url: 'https://sellerwiki.co.kr/appy-to-sell', linkText: '입점 안내'
    },
    {
      id: 'domaelist', name: '도매리스트닷컴',
      note: '랭킹·신상품 노출 · 제휴 메일 mousy008@cscommerce.co.kr 로 연동 문의',
      url: 'https://domaelist.com/', linkText: '도매리스트'
    }
  ];

  var BLOG_POST = {
    title: '생활잡화·문구 소량 사입 도매사이트 | 도매에빠지다(제이엔티인터내셔날) 이용 안내',
    hashtags: '#도매사이트 #도매몰 #소량사입 #생활용품도매 #문구도매 #여행용품도매 #위탁판매 #스마트스토어소싱 #쿠팡소싱 #도매에빠지다 #제이엔티인터내셔날',
    body: [
      "스마트스토어나 쿠팡, 오픈마켓을 운영하다 보면 결국 가장 고민되는 부분이 '실제로 회전되는 상품'과 '안정적인 출고'입니다.",
      '',
      '대형 도매 플랫폼에서 흔한 상품을 똑같이 소싱하면 가격 경쟁에 치이기 쉽고, 그렇다고 처음부터 해외 직수입으로 대량 사입을 하기엔 재고 부담이 큽니다. 오늘은 생활잡화부터 문구, 여행, 디지털 소품까지 실전 셀러 관점에서 선별한 상품을 공급하는 B2B 사업자 전용 도매몰, 도매에빠지다(fallindomae.co.kr)를 소개합니다.',
      '',
      '1. 도매에빠지다는 어떤 곳인가요?',
      '',
      '도매에빠지다는 인천 남동구에 물류 거점을 둔 제이엔티인터내셔날이 운영하는 B2B 도매 쇼핑몰입니다. 오랜 기간 도매꾹·도매매 공급사로 활동하며 쌓아온 소싱 데이터와 실판매 경험을 바탕으로, 시장에서 실제 수요가 검증된 생활 밀착형 상품을 중심으로 공급하고 있습니다.',
      '',
      '· 운영사: 제이엔티인터내셔날',
      '· 공식 도매몰: https://fallindomae.co.kr',
      '· 출고 및 택배: 인천 남동구 출고 / 한진택배',
      '· 고객센터: 1566-0902 (평일 10:00~16:00, 주말·공휴일 제외)',
      '',
      '2. 주요 취급 카테고리 및 인기 상품',
      '',
      '특정 계절에만 반짝하는 상품보다 사계절 꾸준히 수요가 있는 실용 잡화와 틈새 아이디어 소품 비중이 높습니다.',
      '',
      '· 생활·주방·청소: 층간소음 방지 퍼즐 매트, 극세사 청소 덧신(신발커버), 일본 휴대용 미니드라이버 세트',
      '· 여행·야외·스포츠: RFID 차단 여권가방, 캐리어 바퀴 보호커버(8개입), 냉감 스포츠타월',
      '· 디지털·문구·오피스: 다용도 매직 보자기(테크랩), 탁상용 각도조절 스마트폰 거치대, A4 5칸 아코디언 파일 폴더, 스탠드형 클립보드, 마그네틱 북마크',
      '· 아웃도어·수납: 밀리터리 전술 스마트폰 벨트 파우치, 감성 파스텔 2단 필통 파우치',
      '',
      '이 외에도 매주 신상품이 꾸준히 입고되고 있어 스토어 구색을 넓히거나 테스트 사입 품목을 찾기에 좋습니다.',
      '',
      '3. 이런 셀러분들께 추천합니다',
      '',
      '· 생활잡화·문구·여행용품 카테고리로 신규 소싱처를 찾고 계신 분',
      '· 대형 플랫폼 외에 직거래 기반의 안정적인 공급처를 확보하고 싶은 분',
      '· 실사용 수요가 확인된 가성비 위주의 틈새 소품을 테스트해 보고 싶은 분',
      '',
      '4. 회원가입 및 이용 방법',
      '',
      '도매에빠지다는 사업자 회원 전용 폐쇄몰로 운영되며, 모든 상품의 공급 단가는 회원가입 및 승인 후 확인하실 수 있습니다.',
      '',
      '1) 공식 사이트(https://fallindomae.co.kr) 접속 후 회원가입',
      '2) 사업자 회원 인증 완료',
      '3) 로그인 후 품목별 공급 단가 및 주문 조건 확인',
      '',
      '(※ 최소 주문 수량, 합배송, 당일 출고 마감 시간 등 세부 거래 조건은 사이트 내 공지사항 또는 고객센터 1566-0902를 통해 확인하실 수 있습니다.)',
      '',
      '안정적인 공급처 한 곳을 확보해 두면 상품 소싱에 드는 시간과 시행착오를 크게 줄일 수 있습니다. 생활·문구·잡화류 사입처를 찾고 계셨다면 도매에빠지다에서 신상품과 인기 품목을 먼저 살펴보시기 바랍니다.'
    ].join('\n')
  };

  var BLOG_DIR_STATES = [
    { id: 'idle', label: '미신청' },
    { id: 'applied', label: '신청함' },
    { id: 'done', label: '등록됨' }
  ];

  var blogState = { dirs: {}, status: 'draft' };

  function loadBlog() {
    blogState = { dirs: {}, status: 'draft' };
    var raw = null;
    try { raw = localStorage.getItem(BLOG_KEY); } catch (e) { raw = null; }
    if (!raw) return;
    try {
      var s = JSON.parse(raw);
      if (!s || typeof s !== 'object') return;
      if (s.status === 'published') blogState.status = 'published';
      if (s.dirs && typeof s.dirs === 'object') {
        BLOG_DIRS.forEach(function (d) {
          var v = s.dirs[d.id];
          if (v === 'applied' || v === 'done') blogState.dirs[d.id] = v;
        });
      }
    } catch (e) { /* ignore */ }
  }

  function saveBlog() {
    try { localStorage.setItem(BLOG_KEY, JSON.stringify(blogState)); } catch (e) { /* ignore */ }
  }

  function postMetaText() {
    var tags = BLOG_POST.hashtags.split(' ').filter(Boolean);
    return '제목 ' + BLOG_POST.title.length + '자 · 본문 ' + BLOG_POST.body.length.toLocaleString('ko-KR') +
      '자 · 해시태그 ' + tags.length + '개';
  }

  function renderBlogKeywords() {
    var list = el.kwList;
    if (!list) return;
    list.innerHTML = '';
    BLOG_KEYWORDS.forEach(function (k) {
      var li = document.createElement('li');
      li.className = 'kw-item';

      var name = document.createElement('b');
      name.textContent = k.kw;

      var kind = document.createElement('span');
      kind.className = 'kw-kind ' + (k.kind === '핵심' ? 'kw-core' : 'kw-sub');
      kind.textContent = k.kind;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kw-copy';
      btn.setAttribute('aria-label', k.kw + ' 복사');
      btn.textContent = '복사';
      btn.addEventListener('click', function () {
        writeClipboard(k.kw).then(function (ok) {
          toast(ok ? '키워드를 복사했어요 — ' + k.kw : '복사가 안 됐어요 · 길게 눌러 선택해 주세요');
        });
      });

      li.appendChild(name);
      li.appendChild(kind);
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function renderBlogDirs() {
    var box = el.dirRows;
    if (!box) return;
    box.innerHTML = '';

    var done = 0;

    BLOG_DIRS.forEach(function (d) {
      var cur = blogState.dirs[d.id] || 'idle';
      if (cur === 'done') done += 1;

      var row = document.createElement('div');
      row.className = 'dir-row';

      var top = document.createElement('div');
      top.className = 'dir-top';
      var nm = document.createElement('b');
      nm.textContent = d.name;
      var link = document.createElement('a');
      link.className = 'dir-link';
      link.href = d.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = d.linkText;
      top.appendChild(nm);
      top.appendChild(link);

      var note = document.createElement('p');
      note.className = 'dir-note';
      note.textContent = d.note;

      var seg = document.createElement('div');
      seg.className = 'seg dir-seg';
      seg.setAttribute('role', 'group');
      seg.setAttribute('aria-label', d.name + ' 진행 상태');

      BLOG_DIR_STATES.forEach(function (s) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'ds-' + s.id;
        b.textContent = s.label;
        var on = cur === s.id;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.setAttribute('aria-label', d.name + ' ' + s.label + (on ? ' · 누르면 미신청으로' : ''));
        b.addEventListener('click', function () { setBlogDir(d.id, s.id); });
        seg.appendChild(b);
      });

      row.appendChild(top);
      row.appendChild(note);
      row.appendChild(seg);
      box.appendChild(row);
    });

    if (el.dirProgress) el.dirProgress.textContent = '등록 ' + done + '/' + BLOG_DIRS.length;
    if (el.dirStat) el.dirStat.textContent = done + '/' + BLOG_DIRS.length;
  }

  function setBlogDir(id, status) {
    var cur = blogState.dirs[id] || 'idle';
    if (cur === status || status === 'idle') delete blogState.dirs[id];
    else blogState.dirs[id] = status;
    saveBlog();
    renderBlogDirs();
  }

  function renderBlogPost() {
    if (!el.postTitle) return;
    el.postTitle.textContent = BLOG_POST.title;
    el.postMeta.textContent = postMetaText();

    el.postTags.innerHTML = '';
    BLOG_POST.hashtags.split(' ').filter(Boolean).forEach(function (t) {
      var sp = document.createElement('span');
      sp.textContent = t;
      el.postTags.appendChild(sp);
    });

    el.postBody.textContent = BLOG_POST.body;
    if (el.postSummary) el.postSummary.textContent = '본문 전체 보기 · ' + BLOG_POST.body.length.toLocaleString('ko-KR') + '자';

    var published = blogState.status === 'published';
    el.postChip.textContent = published ? '발행완료' : '초안';
    el.postChip.classList.toggle('chip-ok', published);
    el.postChip.classList.toggle('chip-warn', !published);

    if (el.postSeg) {
      el.postSeg.querySelectorAll('button[data-status]').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.status === blogState.status ? 'true' : 'false');
      });
    }
  }

  function setBlogStatus(status) {
    blogState.status = status === 'published' ? 'published' : 'draft';
    saveBlog();
    renderBlogPost();
    toast(blogState.status === 'published' ? '발행완료로 기록했어요' : '초안으로 되돌렸어요');
  }

  function blogCopyText(kind) {
    if (kind === 'title') return BLOG_POST.title;
    if (kind === 'body') return BLOG_POST.body;
    if (kind === 'tags') return BLOG_POST.hashtags;
    return BLOG_POST.title + '\n\n' + BLOG_POST.body + '\n\n' + BLOG_POST.hashtags;
  }

  var COPY_LABEL = { all: '원고 전체를', title: '제목을', body: '본문을', tags: '해시태그를' };

  function copyBlog(kind) {
    var text = blogCopyText(kind);
    writeClipboard(text).then(function (ok) {
      if (ok) {
        toast(COPY_LABEL[kind] + ' 복사했어요 · ' + text.length.toLocaleString('ko-KR') + '자');
      } else {
        toast('복사가 안 됐어요 · 본문을 길게 눌러 선택해 주세요');
      }
    });
  }

  function writeClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return legacyCopy(text);
      });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    var ok = false;
    try {
      ta.select();
      ok = document.execCommand('copy');
    } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function renderBlog() {
    renderBlogKeywords();
    renderBlogDirs();
    renderBlogPost();
  }

  /* ---------------- supabase ---------------- */
  function sbBase() { return (state.supabase.url || '').replace(/\/+$/, ''); }
  function sbHeaders(extra) {
    var h = {
      'apikey': state.supabase.key,
      'Authorization': 'Bearer ' + state.supabase.key,
      'Content-Type': 'application/json'
    };
    if (extra) Object.keys(extra).forEach(function (k) { h[k] = extra[k]; });
    return h;
  }

  function sbRequest(path, opts) {
    opts = opts || {};
    return fetch(sbBase() + path, {
      method: opts.method || 'GET',
      headers: sbHeaders(opts.headers),
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          var err = new Error('HTTP ' + res.status);
          err.status = res.status;
          err.detail = t;
          throw err;
        });
      }
      if (res.status === 204) return null;
      return res.text().then(function (t) { return t ? JSON.parse(t) : null; });
    });
  }

  function sbInsert(table, row) {
    return sbRequest('/rest/v1/' + table, {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: row
    });
  }

  function sbPatch(table, id, patch) {
    return sbRequest('/rest/v1/' + table + '?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { 'Prefer': 'return=minimal' },
      body: patch
    });
  }

  function sbDelete(table, id) {
    return sbRequest('/rest/v1/' + table + '?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
  }

  function testConnection(url, key) {
    var base = (url || '').replace(/\/+$/, '');
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, 9000);
    return fetch(base + '/rest/v1/office_messages?select=id&limit=1', {
      headers: { 'apikey': key, 'Authorization': 'Bearer ' + key },
      signal: ctrl.signal
    }).then(function (res) {
      clearTimeout(t);
      if (res.ok) return { ok: true };
      if (res.status === 404) return { ok: false, code: 'no_table', msg: '테이블이 없습니다. 스키마 SQL을 먼저 실행해 주세요.' };
      if (res.status === 401 || res.status === 403) return { ok: false, code: 'auth', msg: '키가 맞지 않습니다. anon key를 다시 확인해 주세요.' };
      return { ok: false, code: 'http', msg: '연결 실패 (HTTP ' + res.status + ')' };
    }).catch(function () {
      clearTimeout(t);
      return { ok: false, code: 'net', msg: '주소에 닿지 않습니다. Project URL을 확인해 주세요.' };
    });
  }

  function setServerState(mode, note) {
    var pill = el.serverBtn;
    pill.classList.remove('ok', 'err');
    el.liveDot.classList.toggle('off', mode !== 'ok');
    if (mode === 'ok') {
      pill.classList.add('ok');
      el.serverPillState.textContent = '연결';
      el.serverStatus.classList.add('ok');
      el.serverStatus.classList.remove('err');
      el.serverStatus.textContent = note || '연결됨 · office_messages · office_tasks 동기화 중';
    } else if (mode === 'err') {
      pill.classList.add('err');
      el.serverPillState.textContent = '확인';
      el.serverStatus.classList.add('err');
      el.serverStatus.classList.remove('ok');
      el.serverStatus.textContent = note || '연결 확인 실패 · 로컬 모드로 동작 중';
    } else {
      el.serverPillState.textContent = '서버';
      el.serverStatus.classList.remove('ok', 'err');
      el.serverStatus.textContent = note || '연결되지 않음 · 로컬 모드로 동작 중';
    }
    updateMap();
    if (el.taskBadge) renderTasks();
  }

  function flashServer(mode) { if (mode === 'ok' && SB.connected) setServerState('ok'); }

  function connectStored(auto) {
    if (DEMO) { setServerState('none'); return; }
    if (!state.supabase.url || !state.supabase.key) {
      SB.connected = false;
      setServerState('none');
      return;
    }
    SB.connected = true;
    /* 해시로 들어온 경우에는 바로 online 으로 보여 주고, 아래 동기화로 확인합니다. */
    if (auto) {
      setServerState('ok', '연결됨 · Supabase 동기화 중');
    } else {
      setServerState('none', '연결 정보 있음 · 동기화 확인 중');
    }
    pullAll().then(function () {
      setServerState('ok');
      probePhotoColumn();
      /* 연결되면 지금 보고 있는 방을 읽음으로 남깁니다(내 배지에서 나를 빼고 셈). */
      markRead(state.room, true);
    }).catch(function (e) {
      setServerState('err', e && e.status === 404
        ? '테이블이 없습니다 · 스키마 SQL을 먼저 실행해 주세요'
        : '연결 확인 실패 · 로컬 모드로 동작 중');
      setPhotoDbNote();
    });
    startPolling();
  }

  /* 폰 화면이 꺼졌거나 앱이 뒤로 갔는지 — 이때는 폴링 타이머 자체를 멈춥니다. */
  function pageHidden() {
    return document.visibilityState === 'hidden' || document.hidden === true;
  }

  function stopPolling() {
    if (SB.timer) { clearInterval(SB.timer); SB.timer = null; }
    SB.paused = true;
  }

  function startPolling() {
    if (SB.timer) { clearInterval(SB.timer); SB.timer = null; }
    SB.tick = 0;
    /* 숨은 탭에서는 타이머를 만들지 않습니다 — 복귀(visibilitychange) 때 다시 켭니다. */
    if (pageHidden()) { SB.paused = true; return; }
    SB.paused = false;
    SB.timer = setInterval(pollTick, POLL_MS);
  }

  function pollTick() {
    if (pageHidden()) { stopPolling(); return; }
    if (!SB.connected) { stopPolling(); return; }
    SB.tick += 1;
    pullMessages().catch(function () {});
    /* 할 일 탭을 보고 있을 때는 매번, 다른 화면에서는 5번에 한 번(약 30초)만 맞춥니다 */
    if (state.view === 'tasks' || SB.tick % 5 === 0) pullTasks().catch(function () {});
    /* AI 한도는 그 화면을 볼 때만, 그것도 3번에 한 번(약 18초)만 확인합니다 */
    if (state.view === 'quota' && SB.tick % 3 === 0) pullQuotas().catch(function () {});
    /* 회의실 채팅이 화면에 보일 때만(회의실 탭·PC 2단) 읽음 기록·현황을 맞춥니다(각각 20초에 한 번 이내). */
    if (chatVisible()) {
      markRead(state.room);
      pullReads(state.room).catch(function () {});
    }
  }

  /* 서버가 준 created_at 중 가장 늦은 시각을 다음 증분 조회의 기준으로 삼습니다.
     (기기 시계 오차에 흔들리지 않게 로컬 시간은 쓰지 않습니다. ms 아래는 버리므로
      경계에 걸친 행이 한 번 더 올 수 있지만 id 로 걸러져 중복되지 않습니다.) */
  function noteMsgCursor(rows) {
    var max = 0;
    (rows || []).forEach(function (r) {
      if (!r || !r.created_at) return;
      var t = new Date(r.created_at).getTime();
      if (!isNaN(t) && t > max) max = t;
    });
    if (!max) return;
    var next = new Date(max).toISOString();
    if (!SB.cursor || new Date(next).getTime() > new Date(SB.cursor).getTime()) SB.cursor = next;
  }

  /* 첫 조회는 최신 200건만, 그 뒤로는 마지막으로 받은 시각 이후(gt)만 받아 병합합니다.
     — 매 폴링마다 전체 행을 다시 받던 v38 방식 대비 응답 본문이 거의 0에 가깝습니다. */
  function pullMessages(opts) {
    if (!SB.connected) return Promise.reject(new Error('not connected'));
    if (SB.busy) return Promise.reject(new Error('busy'));
    SB.busy = true;
    var full = !SB.primed || !SB.cursor || (opts && opts.full === true);
    var path;
    if (full) {
      path = '/rest/v1/office_messages?select=*&order=created_at.desc&limit=' + MSG_FIRST_LIMIT;
    } else {
      path = '/rest/v1/office_messages?select=*&order=created_at.asc&created_at=gt.' +
        encodeURIComponent(SB.cursor) + '&limit=' + MSG_DELTA_LIMIT;
    }
    return sbRequest(path).then(function (rows) {
      SB.busy = false;
      SB.lastPull = Date.now();
      SB.fails = 0;
      SB.primed = true;
      var list = Array.isArray(rows) ? rows : [];
      mergeMessages(list);
      noteMsgCursor(list);
      /* 증분이 상한을 꽉 채웠으면 더 남아 있을 수 있으니 이어 받습니다. */
      if (!full && list.length >= MSG_DELTA_LIMIT) return pullMessages();
      return true;
    }).catch(function (e) {
      SB.busy = false;
      SB.fails += 1;
      /* 기준 시각이 어긋난 것으로 보이면(3회 연속 실패) 다음 폴링에서 전체를 다시 받습니다. */
      if (SB.fails >= 3) { SB.primed = false; SB.fails = 0; }
      throw e;
    });
  }

  function pullAll() {
    if (!SB.connected) return Promise.reject(new Error('not connected'));
    return Promise.all([
      pullMessages(),
      pullTasks(),
      pullReads(state.room, true)
    ]).then(function () { return true; });
  }

  function mergeMessages(rows) {
    if (!Array.isArray(rows) || !rows.length) return;
    var changed = false;
    rows.forEach(function (r) {
      if (!r || !r.room || !ROOMS[r.room]) return;
      var exists = state.messages.some(function (m) { return m.id === r.id; });
      if (exists) return;
      state.messages.push({
        id: r.id, room: r.room, author: r.author || 'director',
        author_name: r.author_name || (PEOPLE[r.author] ? pname(PEOPLE[r.author]) : '비서'),
        body: r.body || '', image_url: r.image_url || '',
        created_at: r.created_at || new Date().toISOString()
      });
      changed = true;
    });
    if (changed) {
      state.messages.sort(function (a, b) { return new Date(a.created_at) - new Date(b.created_at); });
      save();
      if (chatVisible()) {
        /* 방을 보고 있는 중에 새 글이 왔으면 읽음으로 남기고(숨은 탭이면 내부에서 건너뜀)
           다른 사람의 읽음 현황도 다시 맞춥니다. */
        markRead(state.room);
        pullReads(state.room).catch(function () {});
        renderChat();
      }
    }
    updateMap();
  }

  /* ---------------- 🔔 웹 푸시 알림 ---------------- */
  /* VAPID 공개키는 공개 정보입니다(비밀키는 Supabase Edge Function 시크릿에만 저장). */
  var VAPID_PUBLIC_KEY = 'BLsYdjB1PvxgqFW1LsvjOKqEfQ6qry4P77QkHh04m2z7yXbYx5pAx4OtnRy4_XlqHofAiABdweCvsc_qRUrq0pA';
  var PUSH = { busy: false, sub: null, synced: false, lastError: '', opened: false };
  var APP_VERSION = 'v47';

  function pushSupported() {
    return ('serviceWorker' in navigator) && ('PushManager' in window) && ('Notification' in window);
  }

  function urlBase64ToUint8Array(base64String) {
    var pad = new Array(((4 - (base64String.length % 4)) % 4) + 1).join('=');
    var base64 = (base64String + pad).replace(/-/g, '+').replace(/_/g, '/');
    var raw = atob(base64);
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function bufToB64u(buf) {
    var bytes = new Uint8Array(buf);
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function pushRegistration() {
    if (!('serviceWorker' in navigator)) return Promise.reject(new Error('unsupported'));
    return navigator.serviceWorker.getRegistration().then(function (reg) {
      if (reg && (reg.active || reg.installing || reg.waiting)) return navigator.serviceWorker.ready;
      return navigator.serviceWorker.register('sw.js').then(function () {
        return navigator.serviceWorker.ready;
      });
    });
  }

  function renderPushBtn(mode) {
    if (!el.pushBtn) return;
    el.pushBtn.classList.remove('is-on', 'is-off', 'is-denied', 'is-unsupported');
    if (mode === 'unsupported') {
      el.pushBtn.classList.add('is-unsupported');
      el.pushBtn.hidden = true;
      return;
    }
    el.pushBtn.hidden = false;
    if (mode === 'wait') {
      el.pushBtn.classList.add('is-off');
      el.pushLabel.textContent = '…';
      return;
    }
    if (mode === 'on') {
      el.pushBtn.classList.add('is-on');
      el.pushIcon.textContent = '🔔';
      el.pushLabel.textContent = '알림 ON';
      el.pushBtn.setAttribute('aria-pressed', 'true');
      el.pushBtn.title = '알림 켜짐 · 눌러서 끄기';
      return;
    }
    if (mode === 'denied') {
      el.pushBtn.classList.add('is-denied');
      el.pushIcon.textContent = '🔕';
      el.pushLabel.textContent = '알림 차단';
      el.pushBtn.setAttribute('aria-pressed', 'false');
      el.pushBtn.title = '브라우저 설정에서 이 사이트 알림을 허용해 주세요';
      return;
    }
    el.pushBtn.classList.add('is-off');
    el.pushIcon.textContent = '🔔';
    el.pushLabel.textContent = '알림';
    el.pushBtn.setAttribute('aria-pressed', 'false');
    el.pushBtn.title = '새 글이 오면 폰으로 알림';
  }

  function refreshPushState() {
    if (!pushSupported()) { renderPushBtn('unsupported'); return Promise.resolve(); }
    if (Notification.permission === 'denied') { renderPushBtn('denied'); return Promise.resolve(); }
    return pushRegistration().then(function (reg) {
      return reg.pushManager.getSubscription();
    }).then(function (sub) {
      PUSH.sub = sub || null;
      renderPushBtn(sub && Notification.permission === 'granted' ? 'on' : 'off');
      if (PUSH.opened) renderPushPanel();
    }).catch(function () {
      renderPushBtn('off');
      if (PUSH.opened) renderPushPanel();
    });
  }

  function subKeys(sub) {
    var json = null;
    try { json = sub.toJSON ? sub.toJSON() : null; } catch (e) { json = null; }
    if (json && json.keys && json.keys.p256dh) return json.keys;
    return {
      p256dh: sub.getKey ? bufToB64u(sub.getKey('p256dh')) : '',
      auth: sub.getKey ? bufToB64u(sub.getKey('auth')) : ''
    };
  }

  function savePushSubscription(sub) {
    if (!state.supabase.url || !state.supabase.key) return Promise.reject(new Error('no-server'));
    var keys = subKeys(sub);
    return sbRequest('/rest/v1/office_push_subscriptions?on_conflict=endpoint', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: {
        endpoint: sub.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: (navigator.userAgent || '').slice(0, 400)
      }
    });
  }

  function deletePushSubscription(endpoint) {
    if (!state.supabase.url || !state.supabase.key || !endpoint) return Promise.resolve();
    return sbRequest('/rest/v1/office_push_subscriptions?endpoint=eq.' + encodeURIComponent(endpoint), {
      method: 'DELETE'
    }).catch(function () { /* 기기 쪽 구독 해지는 이미 끝났습니다 */ });
  }

  /* 앱을 새로 열었을 때 이미 만든 구독을 서버에 다시 맞춰 둡니다. */
  function syncPushSubscription() {
    if (!pushSupported() || PUSH.synced || Notification.permission !== 'granted') return;
    if (!state.supabase.url || !state.supabase.key) return;
    PUSH.synced = true;
    pushRegistration().then(function (reg) {
      return reg.pushManager.getSubscription();
    }).then(function (sub) {
      if (!sub) { PUSH.sub = null; return; }
      PUSH.sub = sub;
      return savePushSubscription(sub).then(function () {
        PUSH.synced = true;
        if (PUSH.opened) renderPushPanel();
      }, function () { PUSH.synced = false; });
    }).catch(function () { PUSH.synced = false; });
  }

  function permState() {
    return ('Notification' in window) ? Notification.permission : 'unsupported';
  }

  /* 구형 콜백 방식·신형 Promise 방식·예외를 모두 받아 한 번만 결과를 냅니다. */
  function requestNotifyPermission() {
    return new Promise(function (resolve) {
      var done = false;
      function finish(p) {
        if (done) return;
        done = true;
        resolve(p || permState());
      }
      var ret;
      try {
        ret = Notification.requestPermission(function (p) { finish(p); });
      } catch (e) {
        finish(permState());
        return;
      }
      if (ret && typeof ret.then === 'function') ret.then(finish, function () { finish(); });
      /* 안드로이드에서 권한 창이 응답 없이 사라지는 경우에도 12초 뒤엔 멈춥니다. */
      setTimeout(function () { finish(); }, 12000);
    });
  }

  function pushHelpLines(perm, hasSub, connected, lastError) {
    if (perm === 'unsupported') return ['이 브라우저는 웹 알림을 지원하지 않아요. 크롬 앱에서 이 주소를 열어 주세요.'];
    if (perm === 'denied') return [
      '폰에서 이 앱의 알림이 막혀 있어요. 아래 순서대로 한 번만 풀어 주세요.',
      '① 홈 화면의 「쭈대표 오피스」 아이콘을 길게 누르기 → 앱 정보 → 알림 → ‘허용’',
      '② 크롬에서 열었다면 주소창 왼쪽 자물쇠 → 알림 → 허용',
      '③ 돌아와서 [알림 허용하고 켜기]를 다시 누르기'
    ];
    if (lastError && /AbortError|InvalidStateError|NotSupportedError/.test(lastError)) return [
      '폰의 푸시 알림 서비스가 막힌 상태예요(오류: ' + lastError + ').',
      '① 앱을 완전히 종료했다가 다시 열기',
      '② 크롬에서 「jju-ecommerce.github.io/jju-office」를 직접 열어 한 번 더 시도',
      '③ 그래도 안 되면 Chrome 앱 정보 → 알림 → ‘허용’ 확인'
    ];
    if (lastError && /권한|cancel|denied/i.test(lastError)) return ['알림 권한이 허용되지 않았어요. [알림 허용하고 켜기]를 다시 눌러 ‘허용’을 선택해 주세요.'];
    if (lastError && /서버 저장/.test(lastError)) return ['이 기기 알림은 켜졌지만 서버 등록이 실패했어요. AI 연결을 확인하고 다시 눌러 주세요.'];
    if (perm === 'granted' && !hasSub) return ['알림 권한은 허용됐는데 이 기기 등록이 아직이에요. [알림 허용하고 켜기]를 눌러 주세요.'];
    if (hasSub && !connected) return ['이 기기 알림은 켜졌어요. AI 연결을 하면 서버에도 자동 등록되어 다른 비서 글도 받습니다.'];
    if (hasSub) return ['알림이 켜져 있어요. 새 글이 올라오면 앱을 닫아 두어도 폰 상단에 뜹니다.'];
    return ['[알림 허용하고 켜기]를 누르면 폰에 권한 창이 뜹니다. 한 번만 허용해 주세요.'];
  }

  function renderPushPanel() {
    if (!el.pushModal || !el.pushStatus) return;
    var perm = permState();
    var supported = pushSupported();
    var connected = !!(state.supabase.url && state.supabase.key);
    var swOn = !!(navigator.serviceWorker && navigator.serviceWorker.controller);
    var hasSub = !!PUSH.sub;
    var saved = !!(hasSub && PUSH.synced);

    var rows = [
      ['알림 권한', perm === 'granted' ? '허용됨' : (perm === 'denied' ? '차단됨' : (perm === 'default' ? '아직 묻지 않음' : '지원 안 함')), perm === 'granted' ? 'ok' : (perm === 'denied' ? 'bad' : '')],
      ['푸시 지원', supported ? '지원' : '지원 안 함', supported ? 'ok' : 'bad'],
      ['서비스워커', swOn ? '동작 중' : '준비 중', swOn ? 'ok' : ''],
      ['AI 서버', connected ? '연결됨' : '연결 안 됨', connected ? 'ok' : ''],
      ['이 기기 등록', saved ? '완료 · 서버 저장' : (hasSub ? '기기에만 저장' : '아직'), saved ? 'ok' : '']
    ];
    if (PUSH.lastError) rows.push(['최근 오류', PUSH.lastError, 'bad']);
    rows.push(['앱 버전', APP_VERSION, '']);

    el.pushStatus.innerHTML = '';
    rows.forEach(function (r) {
      var li = document.createElement('li');
      var k = document.createElement('span');
      k.className = 'ps-k';
      k.textContent = r[0];
      var v = document.createElement('b');
      v.className = 'ps-v' + (r[2] ? ' ' + r[2] : '');
      v.textContent = r[1];
      li.appendChild(k);
      li.appendChild(v);
      el.pushStatus.appendChild(li);
    });

    if (el.pushHelp) {
      el.pushHelp.innerHTML = '';
      pushHelpLines(perm, hasSub, connected, PUSH.lastError).forEach(function (line) {
        var p = document.createElement('p');
        p.textContent = line;
        el.pushHelp.appendChild(p);
      });
    }

    if (el.pushMain) {
      var on = (perm === 'granted' && hasSub);
      el.pushMain.textContent = on ? '알림 끄기' : '알림 허용하고 켜기';
      el.pushMain.classList.toggle('primary', !on);
      el.pushMain.classList.toggle('ghost', on);
    }
  }

  function openPushPanel() {
    if (!el.pushModal) return;
    PUSH.opened = true;
    el.pushModal.hidden = false;
    renderPushPanel();
  }

  function closePushPanel() {
    if (!el.pushModal) return;
    PUSH.opened = false;
    el.pushModal.hidden = true;
  }

  /* 서비스워커·캐시를 모두 지우고 새로 받아 옵니다(구버전이 물려 있을 때 복구용). */
  function hardRefresh() {
    toast('최신 버전으로 새로 고치는 중이에요…', 6000);
    var jobs = [];
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
        jobs.push(navigator.serviceWorker.getRegistrations().then(function (regs) {
          return Promise.all(regs.map(function (reg) { return reg.unregister(); }));
        }));
      }
    } catch (e) {}
    try {
      if (window.caches && caches.keys) {
        jobs.push(caches.keys().then(function (keys) {
          return Promise.all(keys.map(function (k) { return caches.delete(k); }));
        }));
      }
    } catch (e) {}
    Promise.all(jobs).catch(function () {}).then(function () { location.reload(); });
  }

  function enablePush() {
    if (PUSH.busy) return Promise.resolve();
    PUSH.busy = true;
    PUSH.lastError = '';
    renderPushBtn('wait');
    renderPushPanel();
    /* 어떤 경우에도 버튼이 잠긴 채로 남지 않도록 20초 뒤 자동 해제합니다. */
    var unlock = setTimeout(function () { PUSH.busy = false; }, 20000);
    return requestNotifyPermission().then(function (perm) {
      if (perm !== 'granted') {
        PUSH.lastError = '권한 ' + perm;
        renderPushBtn(perm === 'denied' ? 'denied' : 'off');
        toast(perm === 'denied' ? '폰 설정에서 알림을 허용해야 켤 수 있어요' : '알림 허용이 취소됐어요');
        return null;
      }
      return pushRegistration().then(function (reg) {
        return reg.pushManager.getSubscription().then(function (existing) {
          if (existing) return existing;
          return reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          });
        });
      }).then(function (sub) {
        PUSH.sub = sub;
        renderPushBtn('on');
        toast('알림을 켰어요 · 기기 등록 중…');
        return savePushSubscription(sub).then(function () {
          PUSH.synced = true;
          PUSH.lastError = '';
          toast('알림을 켰어요 · 새 글이 오면 폰 상단에 뜹니다');
        }, function (e) {
          PUSH.synced = false;
          PUSH.lastError = '서버 저장 실패 ' + ((e && (e.status || e.name)) || '');
          toast('이 기기에서는 켰어요 · AI 연결을 확인해 주세요');
        });
      });
    }).catch(function (e) {
      var name = (e && e.name) || '';
      PUSH.lastError = name || (e && e.message) || '알 수 없는 오류';
      if (name === 'NotAllowedError') {
        renderPushBtn(permState() === 'denied' ? 'denied' : 'off');
        toast('알림 허용이 막혀 있어요 · 앱 정보 → 알림에서 허용해 주세요');
      } else if (name === 'AbortError' || name === 'NotSupportedError' || name === 'InvalidStateError') {
        renderPushBtn('off');
        toast('폰 알림 서비스가 막혀 있어요 · 크롬에서 한 번 열어 시도해 주세요');
      } else if (name === 'no-server') {
        renderPushBtn('off');
        toast('AI 연결을 하면 서버에도 등록돼요');
      } else {
        renderPushBtn('off');
        toast('알림 설정에 실패했어요 · 잠시 후 다시 시도해 주세요');
      }
    }).then(function () {
      clearTimeout(unlock);
      PUSH.busy = false;
      renderPushPanel();
    });
  }

  function disablePush() {
    if (PUSH.busy) return Promise.resolve();
    PUSH.busy = true;
    PUSH.lastError = '';
    renderPushBtn('wait');
    renderPushPanel();
    return pushRegistration().then(function (reg) {
      return reg.pushManager.getSubscription();
    }).then(function (sub) {
      if (!sub) { PUSH.sub = null; PUSH.synced = false; renderPushBtn('off'); return null; }
      var ep = sub.endpoint;
      PUSH.sub = null;
      return sub.unsubscribe().then(function () {
        return deletePushSubscription(ep);
      }).then(function () {
        renderPushBtn('off');
        toast('알림을 껐어요');
      });
    }).catch(function (e) {
      PUSH.lastError = '해제 실패 ' + ((e && e.name) || '');
      renderPushBtn('off');
      toast('알림을 끄지 못했어요 · 잠시 후 다시 시도해 주세요');
    }).then(function () {
      PUSH.busy = false;
      renderPushPanel();
    });
  }

  /* 종 버튼: 어떤 상태에서도 첫 줄에서 즉시 반응하고, 설정 창을 띄워 원인을 보여 줍니다. */
  function togglePush() {
    toast('알림 설정을 확인하고 있어요…', 3200);
    openPushPanel();
    if (PUSH.busy) return;
    var perm = permState();
    if (!pushSupported() || perm === 'denied') return;
    if (perm === 'granted' && PUSH.sub) return;
    enablePush();
  }

  /* index.html의 종 버튼(onclick)에서 부릅니다. */
  window.JJU_PUSH = togglePush;

  /* ---------------- 📂 작업물(자료실) ---------------- */
  /* 정적 기본 목록 — app.js에 들어 있어 서버가 없어도 즉시 뜼니다.
     file = 이 저장소 안 파일(앱에서 미리보기·다운로드), url = 바깥 링크(새 탭). */
  var DL_CATS = ['all', 'ebook', 'video', 'image', 'doc', 'util'];
  var DL_KIND = {
    web:   { label: 'WEB',   ico: '🔗' },
    pdf:   { label: 'PDF',   ico: '📕' },
    pptx:  { label: 'PPTX',  ico: '📊' },
    video: { label: 'MP4',   ico: '🎬' },
    image: { label: 'PNG',   ico: '🖼️' },
    csv:   { label: 'CSV',   ico: '🧮' },
    md:    { label: 'MD',    ico: '📝' },
    xlsx:  { label: 'XLSX',  ico: '📗' },
    sheet: { label: 'SHEET', ico: '📈' },
    doc:   { label: 'DOC',   ico: '📄' },
    sql:   { label: 'SQL',   ico: '🗄️' },
    app:   { label: 'APP',   ico: '📱' }
  };

  var DL_SEED = [
    /* 전자책 */
    { id: 'ebook-free-web', cat: 'ebook', kind: 'web',
      title: '무료 지침서 웹페이지 · 4050 인생 2막',
      desc: '중년 셀러 첫시작 지침서 무료 배포판 — 브라우저에서 바로 읽기',
      url: 'https://jju-ecommerce.github.io/', tags: ['무료', '지침서', '퍼널', '랜딩'], date: '2026-11-23' },
    { id: 'ebook-free-mobile', cat: 'ebook', kind: 'pdf',
      title: '무료 지침서 모바일 PDF',
      desc: '폰 화면에 맞춘 무료 지침서 PDF',
      url: 'https://drive.google.com/file/d/167v6ieCETbFTs1pqgTeuYcKuFcqBJEqf/view', tags: ['무료', 'PDF', '모바일'], date: '2026-11-15', approx: true },
    { id: 'ebook-free-pc', cat: 'ebook', kind: 'pdf',
      title: '무료 지침서 PC PDF',
      desc: 'PC에서 읽기 좋은 무료 지침서 PDF',
      url: 'https://drive.google.com/file/d/1sk5aZe6nuBDZnulNpVGJ4jKRed3uX5fX/view', tags: ['무료', 'PDF', 'PC'], date: '2026-11-15', approx: true },
    { id: 'ebook-free-pptx', cat: 'ebook', kind: 'pptx',
      title: '무료 지침서 슬라이드북 PPTX',
      desc: '무료 배포용 슬라이드북(구글 슬라이드)',
      url: 'https://docs.google.com/presentation/d/1mACG4qkkkACxO0NQrnKl0qV3Re25AHvr/edit', tags: ['무료', 'PPTX', '슬라이드'], date: '2026-11-15' },
    { id: 'ebook-paid1-pc', cat: 'ebook', kind: 'pdf',
      title: '유료 1호 PC PDF',
      desc: '4050 이커머스, 이 한 권으로 끝낸다 — PC용',
      url: 'https://drive.google.com/file/d/1EikOUAdiUcj5Uw4syGhuGlLImTgFYXd0/view', tags: ['유료', '1호', 'PDF', 'PC'], date: '2026-11-18', approx: true, locked: true },
    { id: 'ebook-paid1-mobile', cat: 'ebook', kind: 'pdf',
      title: '유료 1호 모바일 PDF',
      desc: '4050 이커머스, 이 한 권으로 끝낸다 — 모바일용',
      url: 'https://drive.google.com/file/d/1nsXA93xxA0uqfEVlwnpJRiCret-LljdW/view', tags: ['유료', '1호', 'PDF', '모바일'], date: '2026-11-18', approx: true, locked: true },
    { id: 'ebook-paid1-manual', cat: 'ebook', kind: 'pdf',
      title: '유료 1호 부록 · 상품등록 매뉴얼',
      desc: '1호 구매자 배포용 상품등록 실습 매뉴얼',
      url: 'https://drive.google.com/file/d/1AA7BIV9NdiVvm-b1Pn7Y6XKv08NyyMlP/view', tags: ['유료', '1호', '부록', '매뉴얼'], date: '2026-11-18', approx: true, locked: true },
    { id: 'ebook-paid2-mobile', cat: 'ebook', kind: 'pdf',
      title: '유료 2호 모바일 PDF · 도매꾹 공급사 실전편',
      desc: '다품목 1인 셀러 실무 — 모바일용',
      url: 'https://drive.google.com/file/d/1aSV3KJtzKSrnQvci1XGOLd7PRYWiQceS/view', tags: ['유료', '2호', 'PDF', '모바일'], date: '2026-11-18', approx: true, locked: true },
    { id: 'ebook-paid2-pc', cat: 'ebook', kind: 'pdf',
      title: '유료 2호 PC PDF · 도매꾹 공급사 실전편',
      desc: '다품목 1인 셀러 실무 — PC용',
      url: 'https://drive.google.com/file/d/1IfcM0RpsaH1GWZ8faG9NMC75yRr8pFSj/view', tags: ['유료', '2호', 'PDF', 'PC'], date: '2026-11-18', approx: true, locked: true },

    /* 영상 */
    { id: 'video-intro', cat: 'video', kind: 'video',
      title: '소개 모션그래픽 16:9',
      desc: '오피스·유튜브 인트로용 모션그래픽 (16:9, MP4)',
      file: 'assets/jju-intro-motion-16x9.mp4', size: '9.7MB', tags: ['인트로', '모션그래픽', '유튜브'], date: '2026-11-27' },

    /* 이미지 */
    { id: 'img-jju-logo', cat: 'image', kind: 'image',
      title: '쭈대표 이커머스 투명 로고',
      desc: '배경 투명 PNG — 썸네일·상세·배너 공통 사용',
      file: 'assets/jju-ecom-logo-transparent.png', size: '641KB', tags: ['로고', '브랜드', '투명PNG'], date: '2026-11-27' },
    { id: 'img-daliva-logo', cat: 'image', kind: 'image',
      title: '달리바 투명 로고',
      desc: '달리바 상품 상세·배너용 투명 로고(드라이브)',
      url: 'https://drive.google.com/file/d/1mEkp63OpiM14JIsfKcOIG45vussrhUKC/view', tags: ['로고', '달리바', '브랜드'], date: '2026-11-25', approx: true, locked: true },
    { id: 'img-jnt-logo', cat: 'image', kind: 'image',
      title: 'JNT 인터내셔날 로고 시안 · 럭셔리 모노',
      desc: '제이엔티인터내셔날 로고안 2차 3건 중 주요안',
      file: 'assets/jnt-logo-luxury-mono.png', size: '916KB', tags: ['로고', 'JNT', '시안'], date: '2026-11-25' },

    /* 문서/표 */
    { id: 'doc-sourcing-sheet', cat: 'doc', kind: 'sheet',
      title: '제이엔티 일일 쿠팡 소싱 보고서',
      desc: '일일 소싱 행·도착원가·판매가·경쟁가 보고 시트',
      url: 'https://docs.google.com/spreadsheets/d/1-LRGzoWqtzTeOxkBg0l5F4CoRGdBN_eiECJ73a5_Tuk/edit', tags: ['시트', '소싱', '쿠팡'], date: '2026-11-26', approx: true, locked: true },
    { id: 'doc-script-sheet', cat: 'doc', kind: 'sheet',
      title: '스레드·유튜브 대본 통합 시트',
      desc: '스레드_3채널_바이럴_마케팅_원고 + [유튜브_대본] 탭',
      url: 'https://docs.google.com/spreadsheets/d/1KtpmojsNcgc8XKS03RVwJzrX6C151Rb9eTBhF4O3cJI/edit', tags: ['시트', '스레드', '유튜브', '대본'], date: '2026-11-26', approx: true, locked: true },
    { id: 'doc-naver-blog', cat: 'doc', kind: 'doc',
      title: '도매에빠지다 네이버 블로그 홍보글',
      desc: '제목·본문·해시태그 11개 — 11/25 작성분',
      url: 'https://docs.google.com/document/d/19HrjuWHFoHHVeRtMvzctYeWwEpwzN1Vo_9AzTn0Xcfg/edit', tags: ['블로그', '원고', '도매에빠지다'], date: '2026-11-25', locked: true },
    { id: 'doc-roas-csv', cat: 'doc', kind: 'csv',
      title: '판매가·원가별 396행 손익분기 ROAS 표',
      desc: '물류비·판매가·도착원가 → 개당 공헌이익·손익분기 ROAS·목표 ROAS',
      file: 'assets/coupang-breakeven-roas-396.csv', size: '13KB', tags: ['ROAS', '손익분기', '쿠팡광고', 'CSV'], date: '2026-11-27' },
    { id: 'doc-ads-research', cat: 'doc', kind: 'md',
      title: '쿠팡 광고 관리 비법 리서치 보고서',
      desc: '공식 문서·실무 블로그·유튜브 전수 리서치 — 표기 구분 포함',
      file: 'assets/coupang-ads-playbook-2026-11-26.md', size: '30KB', tags: ['쿠팡광고', '리서치', '유튜브'], date: '2026-11-26' },
    { id: 'doc-domeggook-xlsx', cat: 'doc', kind: 'xlsx',
      title: '도매꾹 베스트100 생활잡화·문구 분석 (사진 포함)',
      desc: '베스트100 상품·가격·이미지 정리 엑셀',
      file: 'assets/domeggook-best100-2026-11-25.xlsx', size: '477KB', tags: ['도매꾹', '소싱', '엑셀', '베스트100'], date: '2026-11-25' },
    { id: 'doc-weekly-youtube', cat: 'doc', kind: 'md',
      title: '주간 유튜브 추천 3선 대본 (11/23)',
      desc: '월요일 08:30 루틴 — 주제 3선과 전체 대본·큐시트',
      file: 'assets/weekly-youtube-3picks-2026-11-23.md', size: '49KB', tags: ['유튜브', '대본', '주간루틴'], date: '2026-11-23' },

    /* 유틸리티 */
    { id: 'util-office-app', cat: 'util', kind: 'app',
      title: '쭈대표 AI 오피스 웹앱',
      desc: '지금 보고 있는 오피스 — 대회의실·할 일·대시보드',
      url: 'https://jju-ecommerce.github.io/jju-office/', tags: ['오피스', '앱', 'PWA'], date: '2026-11-27' },
    { id: 'util-yt-channel', cat: 'util', kind: 'web',
      title: '유튜브 채널 · 쭈대표의 이커머스',
      desc: '@JJU_E-Commerce 바로가기',
      url: 'https://www.youtube.com/@JJU_E-Commerce', tags: ['유튜브', '채널'], date: '2026-11-19', approx: true },
    { id: 'util-schema-sql', cat: 'util', kind: 'sql',
      title: '오피스 AI 서버 스키마 SQL',
      desc: 'Supabase SQL Editor에 붙여 넣을 테이블·정책 >',
      file: 'supabase-office-schema.sql', size: '3KB', tags: ['Supabase', '스키마', '설치'], date: '2026-11-27' }
  ];

  var DL = {
    cat: 'all', sort: 'new', q: '',
    items: DL_SEED.slice(),
    source: 'static', sourceLabel: '정적 목록',
    loading: false, pulled: false, opened: null, seq: 0
  };

  function dlKind(k) { return DL_KIND[k] || { label: String(k || '').toUpperCase(), ico: '📎' }; }

  function dlHref(it) { return (it && (it.file || it.url)) || '#'; }

  function dlIsFile(it) { return !!(it && it.file); }

  function dlStamp(it) {
    var d = String((it && it.date) || '');
    var md = d.length >= 10 ? d.slice(5, 10) : d;
    return (it && it.approx ? '≈ ' : '') + (md ? md.replace('-', '/') : '—');
  }

  function dlByNew(a, b) {
    var da = String(a.date || ''), db = String(b.date || '');
    if (da !== db) return da < db ? 1 : -1;
    return String(a.title).localeCompare(String(b.title), 'ko');
  }

  function dlByName(a, b) { return String(a.title).localeCompare(String(b.title), 'ko'); }

  function dlCounts() {
    var c = { all: 0, ebook: 0, video: 0, image: 0, doc: 0, util: 0 };
    DL.items.forEach(function (it) {
      c.all += 1;
      if (c[it.cat] !== undefined) c[it.cat] += 1;
    });
    return c;
  }

  function dlFiltered() {
    var q = String(DL.q || '').trim().toLowerCase();
    var list = DL.items.filter(function (it) {
      if (DL.cat !== 'all' && it.cat !== DL.cat) return false;
      if (!q) return true;
      var hay = [it.title, it.desc, it.kind, dlKind(it.kind).label, (it.tags || []).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    return list.sort(DL.sort === 'name' ? dlByName : dlByNew);
  }

  function dlSetNum(el2, n) { if (el2) el2.textContent = String(n); }

  function renderDeliverables() {
    var grid = el.dlGrid;
    if (!grid) return;
    var c = dlCounts();
    var list = dlFiltered();
    var fileN = DL.items.filter(dlIsFile).length;
    var catN = DL_CATS.filter(function (k) { return k !== 'all' && c[k] > 0; }).length;

    dlSetNum(el.dlStatAll, c.all);
    dlSetNum(el.dlStatCat, catN);
    dlSetNum(el.dlStatFile, fileN);
    dlSetNum(el.dlCatAll, c.all);
    dlSetNum(el.dlCatEbook, c.ebook);
    dlSetNum(el.dlCatVideo, c.video);
    dlSetNum(el.dlCatImage, c.image);
    dlSetNum(el.dlCatDoc, c.doc);
    dlSetNum(el.dlCatUtil, c.util);
    dlSetNum(el.dlMenuBadge, c.all);
    if (el.dlCount) el.dlCount.textContent = list.length + '개';
    if (el.dlEmpty) el.dlEmpty.hidden = list.length > 0;

    if (el.dlCats) {
      el.dlCats.querySelectorAll('button[data-cat]').forEach(function (b) {
        var on = b.dataset.cat === DL.cat;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    if (el.dlSort) {
      el.dlSort.querySelectorAll('button[data-sort]').forEach(function (b) {
        var on = b.dataset.sort === DL.sort;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    if (el.dlSourceChip) {
      el.dlSourceChip.textContent = DL.sourceLabel;
      el.dlSourceChip.className = 'chip ' + (DL.source === 'server' ? 'chip-ok' : 'chip-soft');
    }

    grid.innerHTML = '';
    list.forEach(function (it) { grid.appendChild(dlCard(it)); });
  }

  function dlCard(it) {
    var li = document.createElement('li');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dl-card';
    btn.setAttribute('data-dl-id', it.id);
    btn.setAttribute('aria-label', it.title + ' — 미리보기 열기');

    var thumb = document.createElement('span');
    thumb.className = 'dl-thumb' + (it.kind === 'video' ? ' dl-thumb-dark' : '');
    if (it.kind === 'image' && it.file) {
      var im = document.createElement('img');
      im.src = it.file;
      im.alt = '';
      im.loading = 'lazy';
      im.decoding = 'async';
      thumb.appendChild(im);
    } else {
      thumb.textContent = dlKind(it.kind).ico;
    }

    var body = document.createElement('span');
    body.className = 'dl-body';

    var h = document.createElement('span');
    h.className = 'dl-title';
    h.textContent = it.title;
    body.appendChild(h);

    if (it.desc) {
      var d = document.createElement('span');
      d.className = 'dl-desc';
      d.textContent = it.desc;
      body.appendChild(d);
    }

    var foot = document.createElement('span');
    foot.className = 'dl-foot';
    var k = document.createElement('span');
    k.className = 'dl-kind';
    k.textContent = dlKind(it.kind).label;
    foot.appendChild(k);
    if (it.size) {
      var s = document.createElement('span');
      s.className = 'dl-kind';
      s.textContent = it.size;
      foot.appendChild(s);
    }
    if (it.locked) {
      var lk = document.createElement('span');
      lk.className = 'dl-lock';
      lk.textContent = '🔒 공유 제한';
      lk.title = '익명 접속에서는 Google 로그인이 필요합니다';
      foot.appendChild(lk);
    }
    if (it.server) {
      var sv = document.createElement('span');
      sv.className = 'dl-srv';
      sv.textContent = '서버';
      foot.appendChild(sv);
    }
    var st = document.createElement('span');
    st.className = 'dl-stamp';
    st.textContent = dlStamp(it);
    foot.appendChild(st);

    body.appendChild(foot);
    btn.appendChild(thumb);
    btn.appendChild(body);
    li.appendChild(btn);
    return li;
  }

  function setDlSource(kind, label) {
    DL.source = kind;
    DL.sourceLabel = label;
    if (el.dlSourceChip) {
      el.dlSourceChip.textContent = label;
      el.dlSourceChip.className = 'chip ' + (kind === 'server' ? 'chip-ok' : 'chip-soft');
    }
  }

  /* Supabase office_deliverables — 테이블이 없거나(404) 비어 있어도 정적 목록을 그대로 유지합니다. */
  function dlRowItem(r) {
    if (!r || typeof r !== 'object') return null;
    var id = String(r.id || r.slug || '').trim();
    var title = String(r.title || r.name || '').trim();
    if (!id || !title) return null;
    var cat = String(r.category || r.cat || 'util').toLowerCase();
    if (cat === 'all' || DL_CATS.indexOf(cat) === -1) cat = 'util';
    var file = String(r.file_path || r.file || '').trim();
    var url = String(r.url || r.link || '').trim();
    if (!file && !url) return null;
    var kind = String(r.kind || r.type || '').toLowerCase();
    if (!DL_KIND[kind]) {
      var guess = (file || url).split('?')[0].split('.').pop().toLowerCase();
      kind = DL_KIND[guess] ? guess : (file ? 'md' : 'web');
    }
    var tags = Array.isArray(r.tags) ? r.tags : String(r.tags || '').split(',');
    tags = tags.map(function (t) { return String(t || '').trim(); }).filter(Boolean).slice(0, 8);
    return {
      id: 'sb-' + id, cat: cat, kind: kind, title: title,
      desc: String(r.description || r.desc || ''),
      file: file, url: url, tags: tags,
      date: String(r.updated_at || r.created_at || '').slice(0, 10),
      size: String(r.size_label || r.size || ''),
      locked: !!r.locked, server: true
    };
  }

  function mergeDeliverables(rows) {
    var extra = [];
    (Array.isArray(rows) ? rows : []).forEach(function (r) {
      var it = dlRowItem(r);
      if (!it) return;
      if (DL_SEED.some(function (s) { return s.id === it.id; })) return;
      if (extra.some(function (s) { return s.id === it.id; })) return;
      extra.push(it);
    });
    DL.items = extra.length ? DL_SEED.concat(extra) : DL_SEED.slice();
    return extra.length;
  }

  function pullDeliverables() {
    if (!state.supabase.url || !state.supabase.key) {
      setDlSource('static', '정적 목록');
      return Promise.resolve(false);
    }
    if (DL.loading) return Promise.resolve(false);
    DL.loading = true;
    setDlSource('static', '서버 확인 중…');
    return sbRequest('/rest/v1/office_deliverables?select=*&order=updated_at.desc&limit=200')
      .then(function (rows) {
        DL.loading = false;
        var n = mergeDeliverables(rows);
        setDlSource(n ? 'server' : 'static', n ? ('서버 ' + n + '건 추가') : '정적 목록');
        renderDeliverables();
        return true;
      })
      .catch(function (e) {
        DL.loading = false;
        setDlSource('static', (e && e.status === 404) ? '정적 유지 · 테이블 없음' : '정적 유지 · 서버 응답 없음');
        return false;
      });
  }

  /* ---------- 미리보기 모달 ---------- */
  function openDeliverable(it) {
    if (!it || !el.dlModal) return;
    DL.opened = it;
    if (el.dlModalTitle) el.dlModalTitle.textContent = it.title;
    if (el.dlModalMeta) {
      var parts = [dlKind(it.kind).label];
      if (it.size) parts.push(it.size);
      parts.push(dlStamp(it));
      if ((it.tags || []).length) parts.push((it.tags || []).slice(0, 3).map(function (t) { return '#' + t; }).join(' '));
      el.dlModalMeta.textContent = parts.join(' · ');
    }
    var href = dlHref(it);
    if (el.dlOpenTab) el.dlOpenTab.href = href;
    if (el.dlDownload) {
      if (dlIsFile(it)) {
        el.dlDownload.hidden = false;
        el.dlDownload.href = it.file;
        el.dlDownload.setAttribute('download', it.file.split('/').pop());
      } else {
        el.dlDownload.hidden = true;
        el.dlDownload.removeAttribute('href');
      }
    }
    el.dlModal.hidden = false;
    renderDlPreview(it);
  }

  function closeDeliverable() {
    if (!el.dlModal) return;
    el.dlModal.hidden = true;
    DL.opened = null;
    DL.seq += 1;
    if (el.dlPreview) el.dlPreview.innerHTML = '';
  }

  function dlPreviewNote(html) {
    if (!el.dlPreview) return;
    el.dlPreview.innerHTML = '<p class="dl-pv-note">' + html + '</p>';
  }

  function renderDlPreview(it) {
    if (!el.dlPreview) return;
    DL.seq += 1;
    var token = DL.seq;
    el.dlPreview.innerHTML = '';
    var kind = it.kind;

    if (!dlIsFile(it)) {
      dlPreviewNote(it.locked
        ? '🔒 <b>공유 제한 자료</b>입니다.<br>대표님 Google 계정으로 로그인된 브라우저에서 <b>[새 탭에서 열기]</b>를 누르면 바로 열립니다.'
        : '<b>' + dlEsc(dlKind(kind).label) + '</b> 링크입니다.<br><b>[새 탭에서 열기]</b>를 누르면 바로 열립니다.');
      return;
    }

    if (kind === 'image') {
      var im = document.createElement('img');
      im.className = 'dl-pv-img';
      im.src = it.file;
      im.alt = it.title;
      el.dlPreview.appendChild(im);
      return;
    }

    if (kind === 'video') {
      var v = document.createElement('video');
      v.controls = true;
      v.preload = 'metadata';
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.src = it.file;
      el.dlPreview.appendChild(v);
      return;
    }

    if (kind === 'xlsx') {
      dlPreviewNote('📗 엑셀 파일은 브라우저에서 미리보기를 지원하지 않습니다.<br><b>[다운로드]</b>로 받아서 열어 주세요.');
      return;
    }

    /* csv · md · sql · 그 밖의 텍스트 파일 */
    var loading = document.createElement('p');
    loading.className = 'dl-loading';
    loading.textContent = '불러오는 중…';
    el.dlPreview.appendChild(loading);

    fetch(it.file, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    }).then(function (text) {
      if (token !== DL.seq) return;
      el.dlPreview.innerHTML = '';
      if (kind === 'csv') {
        el.dlPreview.appendChild(dlCsvTable(text));
      } else if (kind === 'md') {
        var md = document.createElement('div');
        md.className = 'dl-md';
        md.innerHTML = dlMarkdown(text);
        el.dlPreview.appendChild(md);
      } else {
        var pre = document.createElement('pre');
        pre.className = 'dl-md';
        pre.textContent = text;
        el.dlPreview.appendChild(pre);
      }
    }).catch(function (e) {
      if (token !== DL.seq) return;
      dlPreviewNote('본문을 불러오지 못했습니다 (' + dlEsc((e && e.message) || 'error') + ').<br><b>[다운로드]</b>로 받아서 확인해 주세요.');
    });
  }

  function dlEsc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function dlCsvRows(text) {
    var rows = [], row = [], cur = '', q = false, i = 0;
    var s = String(text || '').replace(/^\uFEFF/, '');
    while (i < s.length) {
      var c = s.charAt(i);
      if (q) {
        if (c === '"') {
          if (s.charAt(i + 1) === '"') { cur += '"'; i += 2; continue; }
          q = false; i += 1; continue;
        }
        cur += c; i += 1; continue;
      }
      if (c === '"') { q = true; i += 1; continue; }
      if (c === ',') { row.push(cur); cur = ''; i += 1; continue; }
      if (c === '\r') { i += 1; continue; }
      if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; i += 1; continue; }
      cur += c; i += 1;
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (v) { return String(v).trim() !== ''; }); });
  }

  function dlCsvTable(text) {
    var rows = dlCsvRows(text);
    var wrap = document.createElement('div');
    wrap.className = 'dl-table-wrap';
    if (!rows.length) {
      var p = document.createElement('p');
      p.className = 'dl-pv-note';
      p.textContent = '표 내용을 읽지 못했습니다.';
      wrap.appendChild(p);
      return wrap;
    }
    var head = rows[0];
    var body = rows.slice(1);
    var limit = 60;
    var shown = body.slice(0, limit);
    var table = document.createElement('table');
    var thead = document.createElement('thead');
    var htr = document.createElement('tr');
    head.forEach(function (h) {
      var th = document.createElement('th');
      th.textContent = String(h).trim();
      htr.appendChild(th);
    });
    thead.appendChild(htr);
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    shown.forEach(function (r) {
      var tr = document.createElement('tr');
      head.forEach(function (_, idx) {
        var td = document.createElement('td');
        td.textContent = String(r[idx] == null ? '' : r[idx]).trim();
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    if (body.length > limit) {
      var note = document.createElement('p');
      note.className = 'dl-pv-note';
      note.textContent = body.length.toLocaleString('ko-KR') + '행 중 ' + limit + '행만 보여 줍니다 · 전체는 다운로드';
      wrap.appendChild(note);
    }
    return wrap;
  }

  function dlMdInline(s) {
    return s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  function dlMdRow(line) {
    var s = String(line).trim().replace(/^\|/, '').replace(/\|$/, '');
    var cells = [], cur = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c === '\\' && s.charAt(i + 1) === '|') { cur += '|'; i += 1; continue; }
      if (c === '|') { cells.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    cells.push(cur.trim());
    return cells;
  }

  function dlMarkdown(src) {
    var lines = String(src || '').replace(/\r\n?/g, '\n').split('\n');
    var out = [], i = 0, list = null;
    function closeList() { if (list) { out.push('</' + list + '>'); list = null; } }
    while (i < lines.length) {
      var line = lines[i];

      if (/^\s*```/.test(line)) {
        closeList();
        var buf = [];
        i += 1;
        while (i < lines.length && !/^\s*```/.test(lines[i])) { buf.push(dlEsc(lines[i])); i += 1; }
        i += 1;
        out.push('<pre><code>' + buf.join('\n') + '</code></pre>');
        continue;
      }

      var h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        closeList();
        var lv = Math.min(h[1].length, 4);
        out.push('<h' + lv + '>' + dlMdInline(dlEsc(h[2])) + '</h' + lv + '>');
        i += 1;
        continue;
      }

      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { closeList(); out.push('<hr>'); i += 1; continue; }

      /* 표: | a | b | 다음 줄이 |---| 구분자 */
      if (line.indexOf('|') !== -1 && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[-:\s|]*$/.test(lines[i + 1]) && lines[i + 1].indexOf('-') !== -1) {
        closeList();
        var headCells = dlMdRow(line);
        var tbl = ['<table><thead><tr>'];
        headCells.forEach(function (c) { tbl.push('<th>' + dlMdInline(dlEsc(c)) + '</th>'); });
        tbl.push('</tr></thead><tbody>');
        i += 2;
        while (i < lines.length && lines[i].indexOf('|') !== -1 && lines[i].trim()) {
          var cells = dlMdRow(lines[i]);
          tbl.push('<tr>');
          headCells.forEach(function (_, idx) { tbl.push('<td>' + dlMdInline(dlEsc(cells[idx] == null ? '' : cells[idx])) + '</td>'); });
          tbl.push('</tr>');
          i += 1;
        }
        tbl.push('</tbody></table>');
        out.push(tbl.join(''));
        continue;
      }

      var ul = line.match(/^\s*[-*+]\s+(.*)$/);
      var ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
      if (ul || ol) {
        var want = ul ? 'ul' : 'ol';
        if (list !== want) { closeList(); out.push('<' + want + '>'); list = want; }
        out.push('<li>' + dlMdInline(dlEsc((ul || ol)[1])) + '</li>');
        i += 1;
        continue;
      }

      if (/^\s*>\s?/.test(line)) {
        closeList();
        var q = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          q.push(dlMdInline(dlEsc(lines[i].replace(/^\s*>\s?/, ''))));
          i += 1;
        }
        out.push('<blockquote>' + q.join('<br>') + '</blockquote>');
        continue;
      }

      if (!line.trim()) { closeList(); i += 1; continue; }

      closeList();
      var para = [];
      while (i < lines.length && lines[i].trim() &&
             !/^(#{1,6}\s|\s*[-*+]\s|\s*\d+[.)]\s|\s*>|\s*```)/.test(lines[i]) &&
             !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i]) &&
             lines[i].indexOf('|') === -1) {
        para.push(lines[i]);
        i += 1;
      }
      if (!para.length) { i += 1; continue; }
      out.push('<p>' + para.map(function (l) { return dlMdInline(dlEsc(l)); }).join('<br>') + '</p>');
    }
    closeList();
    return out.join('');
  }

  function copyDlLink() {
    var it = DL.opened;
    if (!it) return;
    var abs = dlHref(it);
    try { abs = new URL(dlHref(it), location.href).href; } catch (e) { /* keep relative */ }
    writeClipboard(abs).then(function (ok) {
      toast(ok ? '링크를 복사했어요' : '복사가 안 됐어요 · 주소를 길게 눌러 복사해 주세요');
    });
  }

  /* ---------------- toast ---------------- */
  var toastTimer = null;
  function toast(text, ms) {
    if (!el.toast) return;
    el.toast.textContent = text;
    el.toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove('show'); }, ms || 2600);
  }

  /* ---------------- modal ---------------- */
  function openModal() {
    el.sbUrl.value = state.supabase.url || '';
    el.sbKey.value = state.supabase.key || '';
    el.serverModal.hidden = false;
    if (SB.connected) {
      setServerState('ok');
    } else {
      setServerState('none');
    }
    setTimeout(function () { el.sbUrl.focus(); }, 60);
  }

  function closeModal() { el.serverModal.hidden = true; }

  function saveServer() {
    var url = (el.sbUrl.value || '').trim();
    var key = (el.sbKey.value || '').trim();
    if (!/^https?:\/\//.test(url) || !key) {
      setServerState('err', 'Project URL과 anon key를 모두 넣어 주세요');
      return;
    }
    state.supabase.url = url;
    state.supabase.key = key;
    save();
    el.serverStatus.classList.remove('ok', 'err');
    el.serverStatus.textContent = '연결 확인 중…';
    testConnection(url, key).then(function (r) {
      if (r.ok) {
        SB.connected = true;
        setServerState('ok');
        pullAll().catch(function () {});
        probePhotoColumn();
        startPolling();
        PUSH.synced = false;
        refreshPushState();
        syncPushSubscription();
        toast('AI 서버에 연결했어요');
        DL.pulled = false;
        setTimeout(closeModal, 600);
      } else {
        SB.connected = false;
        setServerState('err', r.msg);
      }
    });
  }

  function clearServer() {
    state.supabase.url = '';
    state.supabase.key = '';
    SB.connected = false;
    stopPolling();
    SB.primed = false;
    SB.cursor = '';
    save();
    el.sbUrl.value = '';
    el.sbKey.value = '';
    PHOTO.column = null;
    PHOTO.bucketOk = null;
    setPhotoDbNote();
    setServerState('none');
    toast('연결을 해제했어요 · 로컬 모드');
  }

  function testFromModal() {
    var url = (el.sbUrl.value || '').trim();
    var key = (el.sbKey.value || '').trim();
    if (!url || !key) { setServerState('err', 'Project URL과 anon key를 모두 넣어 주세요'); return; }
    el.serverStatus.classList.remove('ok', 'err');
    el.serverStatus.textContent = '연결 확인 중…';
    testConnection(url, key).then(function (r) {
      setServerState(r.ok ? 'ok' : 'err', r.ok ? '연결 성공 · 저장을 누르면 동기화가 시작됩니다' : r.msg);
    });
  }

  /* ---------------- 🔋 AI 한도 ---------------- */
  /* 4인방이 쓰는 앱(AI) 한도를 사람이 보고 갱신하는 표입니다.
     Supabase office_ai_quotas 가 있으면 4기기와 같이 맞추고,
     테이블이 없거나(404) 응답이 없으면 이 브라우저(localStorage)만 씁니다. */
  var QUOTA_LEVELS = [
    { key: 'free',  label: '여유', min: 70, preset: 100, cls: 'qs-free' },
    { key: 'watch', label: '주의', min: 40, preset: 60,  cls: 'qs-watch' },
    { key: 'near',  label: '임박', min: 1,  preset: 20,  cls: 'qs-near' },
    { key: 'out',   label: '소진', min: 0,  preset: 0,   cls: 'qs-out' }
  ];

  /* 4인방 모두 Free plan. 리셋은 사람이 보는 값이라 문장으로 적습니다.
     ChatGPT·Codex(v39)는 플랜을 앱이 알 수 없으므로 ‘플랜 미확인’으로 두고,
     대표님이 ✏️ 수정으로 실제 값(플랜·리셋 시각·잔여 %)을 적어 두는 자리입니다. */
  var QUOTA_DEFAULTS = {
    director: { plan: 'Free plan', reset: '보통 매일 자정~새벽 사이 초기화', pct: 85, memo: '지휘·원고 검수 우선' },
    jju1:     { plan: 'Free plan', reset: '매일 새벽 4시 전후 초기화',       pct: 80, memo: '1번 채널·유튜브 대본' },
    jju2:     { plan: 'Free plan', reset: '매일 새벽 초기화',                 pct: 75, memo: '2번 채널·1688 서칭' },
    jju3:     { plan: 'Free plan', reset: '매일 새벽 초기화',                 pct: 90, memo: '3번 채널·업리카 대응' },
    chatgpt:  { plan: 'ChatGPT · 플랜 미확인', reset: '앱 → 설정에서 한도·리셋 확인', pct: 100, memo: '대화·자료 조사 — 화면 보고 ✏️ 수정으로 맞추기' },
    codex:    { plan: 'Codex · 플랜 미확인',   reset: 'ChatGPT 플랜 한도에 포함(계정별 상이)', pct: 100, memo: '코드·스크립트 — 화면 보고 ✏️ 수정으로 맞추기' }
  };

  var QUOTA = { source: 'local', sourceLabel: '기기 저장', loading: false, pulled: false };

  function quotaClampPct(v) {
    var n = Math.round(Number(v));
    if (isNaN(n)) n = 0;
    return Math.max(0, Math.min(100, n));
  }

  function quotaLevelKey(pct) {
    var p = quotaClampPct(pct);
    for (var i = 0; i < QUOTA_LEVELS.length; i++) {
      if (p >= QUOTA_LEVELS[i].min) return QUOTA_LEVELS[i].key;
    }
    return 'out';
  }

  function quotaLevel(key) {
    for (var i = 0; i < QUOTA_LEVELS.length; i++) {
      if (QUOTA_LEVELS[i].key === key) return QUOTA_LEVELS[i];
    }
    return QUOTA_LEVELS[QUOTA_LEVELS.length - 1];
  }

  function quotaDefault(id) {
    var d = QUOTA_DEFAULTS[id] || { plan: 'Free plan', reset: '매일 새벽 초기화', pct: 80, memo: '' };
    return { id: id, plan: d.plan, reset: d.reset, pct: quotaClampPct(d.pct), memo: d.memo, updated_at: '' };
  }

  function quotaNorm(id, q) {
    var d = quotaDefault(id);
    if (!q || typeof q !== 'object') return d;
    var rawPct = (q.pct !== undefined && q.pct !== null) ? q.pct : q.percent;
    return {
      id: id,
      plan: String(q.plan || d.plan).slice(0, 60),
      reset: String(q.reset || q.reset_note || d.reset).slice(0, 80),
      pct: quotaClampPct(rawPct === undefined || rawPct === null ? d.pct : rawPct),
      memo: String(q.memo || '').slice(0, 120),
      updated_at: q.updated_at || ''
    };
  }

  function normalizeQuotaList(list) {
    var map = {};
    (Array.isArray(list) ? list : []).forEach(function (q) {
      if (!q) return;
      var id = q.id || q.crew_id;
      if (QUOTA_IDS.indexOf(id) === -1) return;
      map[id] = quotaNorm(id, q);
    });
    return QUOTA_IDS.map(function (id) { return map[id] || quotaDefault(id); });
  }

  function quotaOf(id) {
    for (var i = 0; i < state.quotas.length; i++) {
      if (state.quotas[i] && state.quotas[i].id === id) return state.quotas[i];
    }
    var d = quotaDefault(id);
    state.quotas.push(d);
    return d;
  }

  function quotaStamp(isoStr) {
    if (!isoStr) return '아직 갱신 전';
    var d = new Date(isoStr);
    if (isNaN(d.getTime())) return '아직 갱신 전';
    var now = new Date();
    var hm = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    var same = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    return same ? ('오늘 ' + hm + ' 갱신') : ((d.getMonth() + 1) + '/' + d.getDate() + ' ' + hm + ' 갱신');
  }

  function quotaName(id) {
    return isToolId(id) ? AI_TOOLS[id].name : pname(PEOPLE[id]);
  }

  /* ids 를 주면 그 묶음만 셀니다. 인자가 없으면 전체(4인방 + ChatGPT·Codex) */
  function quotaReadyCount(ids) {
    var list = ids || QUOTA_IDS;
    return state.quotas.filter(function (q) {
      return list.indexOf(q.id) !== -1 && quotaLevelKey(q.pct) === 'free';
    }).length;
  }

  function quotaAvg(ids) {
    var list = ids || QUOTA_IDS;
    var sum = 0;
    list.forEach(function (id) { sum += quotaOf(id).pct; });
    return list.length ? Math.round(sum / list.length) : 0;
  }

  /* 40% 이상 남은 것 중 잔여율이 가장 높은 것 — 없으면 null.
     기본은 4인방(CREW_IDS)이고, AI_TOOL_IDS 를 넘기면 외부 AI 중에서 찾습니다. */
  function quotaBest(ids) {
    var best = null;
    (ids || CREW_IDS).forEach(function (id) {
      var q = quotaOf(id);
      if (q.pct < 40) return;
      if (!best || q.pct > best.pct) best = q;
    });
    return best;
  }

  function setQuotaSource(kind, label) {
    QUOTA.source = kind;
    QUOTA.sourceLabel = label;
    if (!el.quotaSourceChip) return;
    el.quotaSourceChip.textContent = label;
    el.quotaSourceChip.className = 'chip ' + (kind === 'server' ? 'chip-ok' : 'chip-soft');
  }

  function renderQuota() {
    state.quotas = normalizeQuotaList(state.quotas);
    renderPcSide();
    /* 상단 요약은 4인방 기준 — AI 비서 릴레이는 사람 사이에서만 고릅니다. */
    var ready = quotaReadyCount(CREW_IDS);
    var total = CREW_IDS.length;
    var avg = quotaAvg(CREW_IDS);
    var best = quotaBest(CREW_IDS);
    /* 전체 한도 현황은 ChatGPT·Codex 까지 6건으로 따로 표기합니다. */
    var allReady = quotaReadyCount(QUOTA_IDS);
    var allAvg = quotaAvg(QUOTA_IDS);
    var toolBest = quotaBest(AI_TOOL_IDS);

    if (el.quotaStatReady) el.quotaStatReady.textContent = ready + '/' + total;
    if (el.quotaStatAvg) el.quotaStatAvg.textContent = avg + '%';
    if (el.quotaStatRelay) el.quotaStatRelay.textContent = best ? PEOPLE[best.id].name : '없음';
    if (el.quotaMenuBadge) {
      el.quotaMenuBadge.textContent = ready + '/' + total;
      el.quotaMenuBadge.title = '4인방 여유 ' + ready + '/' + total +
        ' · 전체 ' + QUOTA_IDS.length + '건 중 여유 ' + allReady + '건';
    }
    if (el.quotaAllNote) {
      el.quotaAllNote.innerHTML = '전체 <b>' + QUOTA_IDS.length + '건</b> · 여유 <b>' + allReady +
        '건</b> · 평균 잔여 <b>' + allAvg + '%</b> — ChatGPT·Codex 포함, 4인방 ' + ready + '/' + total;
    }

    if (el.quotaReadyChip) {
      el.quotaReadyChip.textContent = ready + '명 여유';
      el.quotaReadyChip.className = 'chip ' + (ready >= 3 ? 'chip-ok' : (ready >= 1 ? 'chip-warn' : 'chip-danger'));
      el.quotaReadyChip.title = '4인방 기준 · 전체 ' + QUOTA_IDS.length + '건 중 여유 ' + allReady + '건';
    }
    if (el.quotaRelayText) {
      var toolTail = toolBest
        ? (' 외부 AI로는 ' + quotaName(toolBest.id) + ' ' + toolBest.pct + '%가 남아 있습니다.')
        : '';
      if (best) {
        el.quotaRelayText.innerHTML = '<b>' + dlEsc(pname(PEOPLE[best.id])) + '</b> 잔여 <b>' + best.pct +
          '%</b> · 4인방 평균 ' + avg + '% — 다음 원고·지시는 이쪽으로 넘기면 됩니다.' + dlEsc(toolTail);
      } else {
        el.quotaRelayText.textContent = '4인방 중 40% 이상 남은 사람이 없습니다. 초기화를 기다리거나 대표님이 직접 처리해 주세요.' + toolTail;
      }
    }

    var wrapEl = el.quotaCards;
    if (!wrapEl) return;
    wrapEl.innerHTML = '';
    QUOTA_GROUPS.forEach(function (g) {
      var head = document.createElement('p');
      head.className = 'quota-group';
      head.setAttribute('data-quota-group', g.ids.join(','));
      head.innerHTML = '<span class="quota-group-name">' + g.label + '</span>' +
        '<span class="quota-group-hint">' + g.hint + ' · ' + g.ids.length + '건</span>';
      wrapEl.appendChild(head);
      g.ids.forEach(function (id) { wrapEl.appendChild(quotaCard(id)); });
    });
  }

  /* ---------------- PC 오피스 현황 패널 (v39) --------------
     PC(1024px 이상)에서만 보이는 왼쪽 패널을 채웁니다.
     폰(1023px 이하)에서는 CSS 로 숨겨지므로, 값만 미리 맞춰 두면 됩니다. */
  function pcOwnerLabel(id) {
    return id === 'boss' ? '대표' : (PEOPLE[id] ? PEOPLE[id].name : '');
  }

  function renderPcSide() {
    var side = document.getElementById('pcSide');
    if (!side) return;

    /* ① 4인방 — 캐릭터 그림은 정적이라 한 번만 그립니다. */
    var crewBox = document.getElementById('pcCrew');
    if (crewBox && !crewBox.getAttribute('data-filled')) {
      crewBox.setAttribute('data-filled', '1');
      CREW_IDS.forEach(function (id) {
        var p = PEOPLE[id];
        var li = document.createElement('li');
        li.setAttribute('data-pc-crew', id);
        li.setAttribute('role', 'button');
        li.setAttribute('tabindex', '0');
        li.setAttribute('aria-label', pname(p) + ' — 오피스 맵 열기');
        var av = document.createElement('span');
        av.className = 'map-avatar ' + p.cls;
        paintAvatar(av, id);
        li.appendChild(av);
        var txt = document.createElement('span');
        txt.className = 'pc-crew-txt';
        txt.innerHTML = '<b>' + dlEsc(pname(p)) + '</b><span>' + dlEsc(p.device) + '</span>';
        li.appendChild(txt);
        li.addEventListener('click', function () { setView('map'); });
        li.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setView('map'); }
        });
        crewBox.appendChild(li);
      });
    }

    /* ② 오늘 할 일 — 진행 중인 것 중 마감이 가까운 3건 */
    var open = state.tasks.filter(function (t) { return !t.done; });
    var taskNote = document.getElementById('pcTaskNote');
    if (taskNote) taskNote.textContent = open.length + '건';
    var taskBox = document.getElementById('pcTasks');
    if (taskBox) {
      taskBox.innerHTML = '';
      var top = open.slice().sort(byDueThenCreated).slice(0, 3);
      if (!top.length) {
        var empty = document.createElement('li');
        empty.className = 'pc-empty';
        empty.textContent = '진행 중인 할 일이 없습니다.';
        taskBox.appendChild(empty);
      } else {
        top.forEach(function (t) {
          var li = document.createElement('li');
          var own = pcOwnerLabel(t.owner);
          li.innerHTML = (own ? '<span class="pc-task-owner">' + dlEsc(own) + '</span>' : '') +
            '<span>' + dlEsc(t.title) + '</span>';
          taskBox.appendChild(li);
        });
      }
    }

    /* ③ AI 한도 — 4인방 잔여율 게이지 */
    var qBox = document.getElementById('pcQuota');
    if (qBox) {
      qBox.innerHTML = '';
      CREW_IDS.forEach(function (id) {
        var q = quotaOf(id);
        var lv = quotaLevelKey(q.pct);
        var barCls = lv === 'free' ? '' : (lv === 'watch' ? 'warn' : 'danger');
        var row = document.createElement('div');
        row.className = 'pc-quota-row';
        row.setAttribute('data-pc-quota', id);
        row.innerHTML = '<span class="pc-quota-name">' + dlEsc(PEOPLE[id].name) + '</span>' +
          '<span class="pc-quota-bar"><i class="' + barCls + '" style="width:' + q.pct + '%"></i></span>' +
          '<span class="pc-quota-pct">' + q.pct + '%</span>';
        qBox.appendChild(row);
      });
    }
    var qNote = document.getElementById('pcQuotaNote');
    if (qNote) qNote.textContent = '여유 ' + quotaReadyCount(CREW_IDS) + '/' + CREW_IDS.length;
  }

  function quotaFormHtml(q) {
    var lvKey = quotaLevelKey(q.pct);
    var statusBtns = QUOTA_LEVELS.map(function (l) {
      return '<button type="button" class="quota-opt" data-quota-status="' + l.key + '" aria-pressed="' +
        (l.key === lvKey ? 'true' : 'false') + '">' + l.label + '</button>';
    }).join('');
    var presets = [100, 75, 50, 25, 0].map(function (n) {
      return '<button type="button" class="quota-pct-btn" data-quota-preset="' + n + '">' + n + '%</button>';
    }).join('');
    return '' +
      '<div class="quota-edit-grid">' +
        '<label class="quota-field"><span>플랜명</span>' +
          '<input type="text" data-quota-input="plan" maxlength="60" value="' + dlEsc(q.plan) + '" placeholder="예: Free plan"></label>' +
        '<label class="quota-field"><span>리셋 시각</span>' +
          '<input type="text" data-quota-input="reset" maxlength="80" value="' + dlEsc(q.reset) + '" placeholder="예: 매일 새벽 4시 전후 초기화"></label>' +
      '</div>' +
      '<div class="quota-set">' +
        '<span class="quota-set-label">상태</span>' +
        '<div class="quota-opts" role="group" aria-label="상태 선택">' + statusBtns + '</div>' +
      '</div>' +
      '<div class="quota-set">' +
        '<span class="quota-set-label">잔여 한도 <b data-quota-range-val>' + q.pct + '%</b></span>' +
        '<div class="quota-pcts" role="group" aria-label="잔여율 빠른 선택">' + presets + '</div>' +
        '<input class="quota-range" type="range" min="0" max="100" step="5" value="' + q.pct + '" data-quota-range aria-label="잔여 한도 퍼센트">' +
      '</div>' +
      '<label class="quota-field quota-field-wide"><span>메모</span>' +
        '<input type="text" data-quota-input="memo" maxlength="120" value="' + dlEsc(q.memo) + '" placeholder="예: 원고 검수 우선"></label>' +
      '<div class="quota-edit-actions">' +
        '<button type="button" class="btn primary quota-save" data-quota-save>저장</button>' +
        '<button type="button" class="btn ghost quota-cancel" data-quota-cancel>닫기</button>' +
      '</div>';
  }

  function quotaCard(id) {
    var q = quotaOf(id);
    var tool = isToolId(id);
    var p = tool ? null : PEOPLE[id];
    var toolInfo = tool ? AI_TOOLS[id] : null;
    var dispName = tool ? toolInfo.name : pname(p);
    var lvKey = quotaLevelKey(q.pct);
    var lv = quotaLevel(lvKey);

    var card = document.createElement('article');
    card.className = 'card quota-card';
    card.setAttribute('data-quota-id', id);
    card.setAttribute('data-status', lvKey);
    card.setAttribute('data-quota-kind', tool ? 'tool' : 'crew');

    var head = document.createElement('div');
    head.className = 'quota-head';
    var av;
    if (tool) {
      /* 외부 AI 는 사람 얼굴 대신 서비스 배지(인라인 SVG) */
      av = document.createElement('span');
      av.className = 'quota-avatar ai-badge ai-' + id;
      av.innerHTML = '<span class="avatar-face">' + TOOL_ART[id] + '</span>';
    } else {
      av = document.createElement('span');
      av.className = 'map-avatar quota-avatar ' + p.cls;
      paintAvatar(av, id);
    }
    head.appendChild(av);

    var txt = document.createElement('div');
    txt.className = 'quota-head-txt';
    var nameEl = document.createElement('h3');
    nameEl.textContent = dispName;
    txt.appendChild(nameEl);
    var crewInfo = null;
    for (var ci = 0; ci < CREW.length; ci++) { if (CREW[ci].id === id) { crewInfo = CREW[ci]; break; } }
    var roleEl = document.createElement('p');
    roleEl.className = 'quota-role';
    roleEl.textContent = tool ? toolInfo.role
      : (crewInfo ? (crewInfo.device + ' · ' + crewInfo.handle) : ((p && p.device) || ''));
    txt.appendChild(roleEl);
    var planLine = document.createElement('p');
    planLine.className = 'quota-plan';
    planLine.textContent = q.plan + (q.reset ? ' · ' + q.reset : '');
    txt.appendChild(planLine);
    head.appendChild(txt);

    var badge = document.createElement('span');
    badge.className = 'quota-status ' + lv.cls;
    badge.setAttribute('data-quota-badge', '1');
    badge.textContent = lv.label;
    head.appendChild(badge);
    card.appendChild(head);

    var gauge = document.createElement('div');
    gauge.className = 'quota-gauge';
    gauge.setAttribute('role', 'progressbar');
    gauge.setAttribute('aria-label', dispName + ' 잔여 한도');
    gauge.setAttribute('aria-valuemin', '0');
    gauge.setAttribute('aria-valuemax', '100');
    gauge.setAttribute('aria-valuenow', String(q.pct));
    var fill = document.createElement('span');
    fill.className = 'quota-gauge-fill ' + lv.cls;
    fill.style.width = q.pct + '%';
    gauge.appendChild(fill);
    card.appendChild(gauge);

    var nums = document.createElement('div');
    nums.className = 'quota-nums';
    var pctEl = document.createElement('b');
    pctEl.className = 'quota-pct';
    pctEl.textContent = q.pct + '%';
    var pctCap = document.createElement('span');
    pctCap.textContent = '잔여';
    var updEl = document.createElement('span');
    updEl.className = 'quota-updated';
    updEl.textContent = quotaStamp(q.updated_at);
    nums.appendChild(pctEl);
    nums.appendChild(pctCap);
    nums.appendChild(updEl);
    card.appendChild(nums);

    var memoEl = document.createElement('p');
    memoEl.className = 'quota-memo';
    memoEl.textContent = q.memo || '메모 없음';
    card.appendChild(memoEl);

    var foot = document.createElement('div');
    foot.className = 'quota-foot';
    var editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'quota-btn';
    editBtn.setAttribute('data-quota-edit', '1');
    editBtn.setAttribute('aria-expanded', 'false');
    editBtn.textContent = '✏️ 수정';
    var doneBtn = document.createElement('button');
    doneBtn.type = 'button';
    doneBtn.className = 'quota-btn ghost';
    doneBtn.setAttribute('data-quota-done', '1');
    doneBtn.textContent = '✓ 지금 확인';
    foot.appendChild(editBtn);
    foot.appendChild(doneBtn);
    card.appendChild(foot);

    var form = document.createElement('div');
    form.className = 'quota-edit';
    form.setAttribute('data-quota-form', '1');
    form.hidden = true;
    form.innerHTML = quotaFormHtml(q);
    card.appendChild(form);

    var range = form.querySelector('[data-quota-range]');
    var rangeVal = form.querySelector('[data-quota-range-val]');
    var draft = { pct: q.pct };

    function paint(v) {
      var n = quotaClampPct(v);
      draft.pct = n;
      var lk = quotaLevelKey(n);
      var l = quotaLevel(lk);
      fill.style.width = n + '%';
      fill.className = 'quota-gauge-fill ' + l.cls;
      pctEl.textContent = n + '%';
      badge.textContent = l.label;
      badge.className = 'quota-status ' + l.cls;
      card.setAttribute('data-status', lk);
      gauge.setAttribute('aria-valuenow', String(n));
      if (rangeVal) rangeVal.textContent = n + '%';
      if (range && Number(range.value) !== n) range.value = String(n);
      form.querySelectorAll('[data-quota-status]').forEach(function (b) {
        var on = b.getAttribute('data-quota-status') === lk;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.classList.toggle('active', on);
      });
      form.querySelectorAll('[data-quota-preset]').forEach(function (b) {
        b.classList.toggle('active', Number(b.getAttribute('data-quota-preset')) === n);
      });
    }

    function openEdit() {
      form.hidden = false;
      planLine.hidden = true;
      editBtn.setAttribute('aria-expanded', 'true');
      editBtn.textContent = '✏️ 접기';
      var planI = form.querySelector('[data-quota-input="plan"]');
      var resetI = form.querySelector('[data-quota-input="reset"]');
      var memoI = form.querySelector('[data-quota-input="memo"]');
      if (planI) planI.value = q.plan;
      if (resetI) resetI.value = q.reset;
      if (memoI) memoI.value = q.memo;
      paint(q.pct);
      if (planI && planI.focus) { try { planI.focus(); } catch (e) {} }
    }

    function closeEdit() {
      form.hidden = true;
      planLine.hidden = false;
      editBtn.setAttribute('aria-expanded', 'false');
      editBtn.textContent = '✏️ 수정';
      paint(q.pct);
    }

    editBtn.addEventListener('click', function () {
      if (form.hidden) openEdit(); else closeEdit();
    });

    function commit() {
      var planI = form.querySelector('[data-quota-input="plan"]');
      var resetI = form.querySelector('[data-quota-input="reset"]');
      var memoI = form.querySelector('[data-quota-input="memo"]');
      q.plan = String((planI && planI.value) || '').trim().slice(0, 60) || 'Free plan';
      q.reset = String((resetI && resetI.value) || '').trim().slice(0, 80);
      q.memo = String((memoI && memoI.value) || '').trim().slice(0, 120);
      q.pct = quotaClampPct(draft.pct);
      q.updated_at = new Date().toISOString();
      save();
      renderQuota();
      persistQuota(id);
      toast(dispName + ' 한도 ' + q.pct + '% · ' + quotaLevel(quotaLevelKey(q.pct)).label + '로 저장했어요');
    }

    form.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var sb = t.closest('[data-quota-status]');
      if (sb) { paint(quotaLevel(sb.getAttribute('data-quota-status')).preset); return; }
      var pb = t.closest('[data-quota-preset]');
      if (pb) { paint(Number(pb.getAttribute('data-quota-preset'))); return; }
      if (t.closest('[data-quota-cancel]')) { closeEdit(); return; }
      if (t.closest('[data-quota-save]')) commit();
    });

    if (range) range.addEventListener('input', function () { paint(range.value); });

    doneBtn.addEventListener('click', function () {
      q.updated_at = new Date().toISOString();
      save();
      renderQuota();
      persistQuota(id);
      toast(dispName + ' 한도 ' + q.pct + '% · 지금 확인으로 기록했어요');
    });

    return card;
  }

  /* 서버에 이 사람 한도 한 줄을 올립니다(있으면 갱신). 실패해도 화면은 기기 저장으로 계속됩니다. */
  function persistQuota(id) {
    var q = quotaOf(id);
    if (!state.supabase.url || !state.supabase.key) {
      setQuotaSource('local', '기기 저장');
      return Promise.resolve(false);
    }
    return sbRequest('/rest/v1/office_ai_quotas?on_conflict=id', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: {
        id: q.id,
        plan: q.plan,
        status: quotaLevelKey(q.pct),
        percent: q.pct,
        reset_note: q.reset,
        memo: q.memo || '',
        updated_at: q.updated_at || new Date().toISOString(),
        updated_by: 'jju1'
      }
    }).then(function () {
      setQuotaSource('server', '서버 동기화');
      return true;
    }).catch(function () {
      setQuotaSource('local', '기기 저장 · 서버 반영 안 됨');
      return false;
    });
  }

  function applyQuotaRows(rows) {
    if (!Array.isArray(rows) || !rows.length) return 0;
    var n = 0;      /* 서버와 맞춰진 사람 수(값이 같아도 포함) */
    var dirty = 0;  /* 기기 값이 실제로 바뀐 사람 수 — 이때만 다시 그립니다 */
    rows.forEach(function (r) {
      if (!r) return;
      var id = r.id || r.crew_id;
      if (QUOTA_IDS.indexOf(id) === -1) return;
      var cur = quotaOf(id);
      var incoming = quotaNorm(id, r);
      var st = incoming.updated_at ? new Date(incoming.updated_at).getTime() : 0;
      var ct = cur.updated_at ? new Date(cur.updated_at).getTime() : 0;
      /* 기기에 더 새 기록이 있으면 그대로 둡니다. */
      if (st && ct && st < ct) return;
      /* 값이 같으면 동기화 인원으로만 세고 다시 그리지 않습니다.
         (같은 시각에 다시 그리면 18초 주기 동기화마다 ✏️ 수정 패널이 닫히던 문제)
         — 본부 핫픽스 41c3434 반영 */
      if (st && ct && st === ct) { n += 1; return; }
      cur.plan = incoming.plan;
      cur.reset = incoming.reset;
      cur.pct = incoming.pct;
      cur.memo = incoming.memo;
      cur.updated_at = incoming.updated_at || cur.updated_at;
      n += 1;
      dirty += 1;
    });
    if (dirty) {
      save();
      renderQuota();
    }
    return n;
  }

  function pullQuotas() {
    if (!state.supabase.url || !state.supabase.key) {
      setQuotaSource('local', '기기 저장');
      return Promise.resolve(false);
    }
    if (QUOTA.loading) return Promise.resolve(false);
    QUOTA.loading = true;
    setQuotaSource('local', '서버 확인 중…');
    return sbRequest('/rest/v1/office_ai_quotas?select=*&order=updated_at.desc&limit=50')
      .then(function (rows) {
        QUOTA.loading = false;
        QUOTA.pulled = true;
        var n = applyQuotaRows(rows);
        setQuotaSource(n ? 'server' : 'local', n ? ('서버 ' + n + '명 동기화') : '기기 저장');
        return true;
      })
      .catch(function (e) {
        QUOTA.loading = false;
        setQuotaSource('local', (e && e.status === 404) ? '기기 저장 · 테이블 없음' : '기기 저장 · 서버 응답 없음');
        return false;
      });
  }

  /* ---------------- init ---------------- */
  function cacheEls() {
    el.main = document.getElementById('main');
    el.chatLog = document.getElementById('chatLog');
    el.chatInput = document.getElementById('chatInput');
    el.sendBtn = document.getElementById('sendBtn');
    el.plusBtn = document.getElementById('plusBtn');
    el.mentionMenu = document.getElementById('mentionMenu');
    el.roomMeta = document.getElementById('roomMeta');
    el.taskForm = document.getElementById('taskForm');
    el.taskInput = document.getElementById('taskInput');
    el.taskOwner = document.getElementById('taskOwner');
    el.taskDue = document.getElementById('taskDue');
    el.taskDueBox = document.getElementById('taskDueBox');
    el.taskDueChips = document.getElementById('taskDueChips');
    el.taskFilter = document.getElementById('taskFilter');
    el.tfAll = document.getElementById('tfAll');
    el.tfToday = document.getElementById('tfToday');
    el.tfUp = document.getElementById('tfUp');
    el.taskBadge = document.getElementById('taskBadge');
    el.taskSummary = document.getElementById('taskSummary');
    el.taskOpenList = document.getElementById('taskOpenList');
    el.taskDoneList = document.getElementById('taskDoneList');
    el.taskOpenCount = document.getElementById('taskOpenCount');
    el.taskDoneCount = document.getElementById('taskDoneCount');
    el.taskSyncNote = document.getElementById('taskSyncNote');
    el.taskServerChip = document.getElementById('taskServerChip');
    el.crewRow = document.getElementById('crewRow');
    el.crewList = document.getElementById('crewList');
    el.mapFigs = document.getElementById('mapFigs');
    el.mapBubbles = document.getElementById('mapBubbles');
    el.mapStage = document.getElementById('mapStage');
    el.mapStatus = document.getElementById('mapStatus');
    el.mapSyncChip = document.getElementById('mapSyncChip');
    el.mapLiveDot = document.getElementById('mapLiveDot');
    el.mapSheet = document.getElementById('mapSheet');
    el.sheetAvatar = document.getElementById('sheetAvatar');
    el.sheetName = document.getElementById('sheetName');
    el.sheetMeta = document.getElementById('sheetMeta');
    el.sheetBody = document.getElementById('sheetBody');
    el.sheetTime = document.getElementById('sheetTime');
    el.sheetRooms = document.getElementById('sheetRooms');
    el.sheetClose = document.getElementById('sheetClose');
    el.kwList = document.getElementById('kwList');
    el.dirRows = document.getElementById('dirRows');
    el.dirProgress = document.getElementById('dirProgress');
    el.dirStat = document.getElementById('dirStat');
    el.postTitle = document.getElementById('postTitle');
    el.postMeta = document.getElementById('postMeta');
    el.postTags = document.getElementById('postTags');
    el.postBody = document.getElementById('postBody');
    el.postSummary = document.getElementById('postSummary');
    el.postChip = document.getElementById('postChip');
    el.postSeg = document.getElementById('postSeg');
    el.themeBtn = document.getElementById('themeBtn');
    el.themeIcon = document.getElementById('themeIcon');
    el.serverBtn = document.getElementById('serverBtn');
    el.serverPillState = document.getElementById('serverPillState');
    el.serverModal = document.getElementById('serverModal');
    el.serverStatus = document.getElementById('serverStatus');
    el.sbUrl = document.getElementById('sbUrl');
    el.sbKey = document.getElementById('sbKey');
    el.liveDot = document.getElementById('liveDot');
    el.pushBtn = document.getElementById('pushBtn');
    el.pushIcon = document.getElementById('pushIcon');
    el.pushLabel = document.getElementById('pushLabel');
    el.pushModal = document.getElementById('pushModal');
    el.pushStatus = document.getElementById('pushStatus');
    el.pushHelp = document.getElementById('pushHelp');
    el.pushMain = document.getElementById('pushMain');
    el.pushOff = document.getElementById('pushOff');
    el.pushRefresh = document.getElementById('pushRefresh');
    el.toast = document.getElementById('toast');
    el.todayLabel = document.getElementById('todayLabel');
    el.dlGrid = document.getElementById('dlGrid');
    el.dlEmpty = document.getElementById('dlEmpty');
    el.dlCount = document.getElementById('dlCount');
    el.dlCats = document.getElementById('dlCats');
    el.dlCatAll = document.getElementById('dlCatAll');
    el.dlCatEbook = document.getElementById('dlCatEbook');
    el.dlCatVideo = document.getElementById('dlCatVideo');
    el.dlCatImage = document.getElementById('dlCatImage');
    el.dlCatDoc = document.getElementById('dlCatDoc');
    el.dlCatUtil = document.getElementById('dlCatUtil');
    el.dlStatAll = document.getElementById('dlStatAll');
    el.dlStatCat = document.getElementById('dlStatCat');
    el.dlStatFile = document.getElementById('dlStatFile');
    el.dlSearch = document.getElementById('dlSearch');
    el.dlSearchClear = document.getElementById('dlSearchClear');
    el.dlSort = document.getElementById('dlSort');
    el.dlSourceChip = document.getElementById('dlSourceChip');
    el.dlMenuBadge = document.getElementById('dlMenuBadge');
    el.dlModal = document.getElementById('dlModal');
    el.dlModalTitle = document.getElementById('dlModalTitle');
    el.dlModalMeta = document.getElementById('dlModalMeta');
    el.dlModalClose = document.getElementById('dlModalClose');
    el.dlPreview = document.getElementById('dlPreview');
    el.dlOpenTab = document.getElementById('dlOpenTab');
    el.dlDownload = document.getElementById('dlDownload');
    el.dlCopyLink = document.getElementById('dlCopyLink');
    el.quotaCards = document.getElementById('quotaCards');
    el.quotaStatReady = document.getElementById('quotaStatReady');
    el.quotaStatAvg = document.getElementById('quotaStatAvg');
    el.quotaStatRelay = document.getElementById('quotaStatRelay');
    el.quotaReadyChip = document.getElementById('quotaReadyChip');
    el.quotaRelayText = document.getElementById('quotaRelayText');
    el.quotaAllNote = document.getElementById('quotaAllNote');
    el.quotaSourceChip = document.getElementById('quotaSourceChip');
    el.quotaMenuBadge = document.getElementById('quotaMenuBadge');
    el.photoStrip = document.getElementById('photoStrip');
    el.photoThumb = document.getElementById('photoThumb');
    el.photoMeta = document.getElementById('photoMeta');
    el.photoNote = document.getElementById('photoNote');
    el.photoDel = document.getElementById('photoDel');
    el.photoBtn = document.getElementById('photoBtn');
    el.cameraBtn = document.getElementById('cameraBtn');
    el.photoInput = document.getElementById('photoInput');
    el.cameraInput = document.getElementById('cameraInput');
    el.photoModal = document.getElementById('photoModal');
    el.photoBig = document.getElementById('photoBig');
    el.photoMetaLine = document.getElementById('photoMetaLine');
    el.photoDl = document.getElementById('photoDl');
    el.photoClose = document.getElementById('photoClose');
    el.photoCloseBtn = document.getElementById('photoCloseBtn');
    el.photoDbNote = document.getElementById('photoDbNote');
  }

  function bind() {
    document.querySelectorAll('.menu-item').forEach(function (b) {
      b.addEventListener('click', function () {
        setView(b.dataset.view);
        /* 2단에서는 같은 탭을 다시 눌러도 그 칼럼을 한 번 더 짚어 줍니다. */
        if (b.dataset.view === 'map' || b.dataset.view === 'office') pulseCol(b.dataset.view);
      });
    });
    document.querySelectorAll('.bn-item').forEach(function (b) {
      b.addEventListener('click', function () { setView(b.dataset.view); });
    });
    document.querySelectorAll('[data-view].link-btn, [data-view].crew-mini, [data-view].pc-more').forEach(function (b) {
      b.addEventListener('click', function () { setView(b.dataset.view); });
    });

    document.querySelectorAll('.room-tab').forEach(function (b) {
      b.addEventListener('click', function () {
        selectRoom(b.dataset.room);
      });
    });

    document.querySelectorAll('.map-zone').forEach(function (b) {
      b.addEventListener('click', function () { goRoom(b.dataset.mapRoom); });
    });

    if (el.sheetRooms) {
      el.sheetRooms.querySelectorAll('[data-map-room]').forEach(function (b) {
        b.addEventListener('click', function () { goRoom(b.dataset.mapRoom); });
      });
    }
    if (el.mapSheet) {
      el.mapSheet.addEventListener('click', function (e) {
        if (e.target.dataset.sheetClose) closeSheet();
      });
    }
    if (el.sheetClose) el.sheetClose.addEventListener('click', closeSheet);

    /* 💬 노란 읽음 배지 → 읽음 상세 팝오버 (v42) — 이미 받아 둔 값만 씁니다(요청 0건). */
    if (el.chatLog) {
      el.chatLog.addEventListener('click', function (e) {
        var badge = e.target && e.target.closest ? e.target.closest('.unread-count[data-unread]') : null;
        if (!badge) return;
        e.stopPropagation();
        toggleReadPop(badge);
      });
      el.chatLog.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
        var badge = e.target && e.target.closest ? e.target.closest('.unread-count[data-unread]') : null;
        if (!badge) return;
        e.preventDefault();
        toggleReadPop(badge);
      });
      el.chatLog.addEventListener('scroll', closeReadPop);
    }
    document.addEventListener('click', function (e) {
      if (!READPOP.node) return;
      if (READPOP.node.contains(e.target)) return;
      if (e.target && e.target.closest && e.target.closest('.unread-count')) return;
      closeReadPop();
    });
    window.addEventListener('resize', closeReadPop);

    el.sendBtn.addEventListener('click', sendMessage);
    el.chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); sendMessage(); }
    });
    /* 📋 입력창에 Ctrl+V 로 붙여넣은 이미지를 바로 첨부 (v40) */
    el.chatInput.addEventListener('paste', function (e) {
      attachClipboardImage(e);
    });
    /* 회의실 화면에서는 입력창 밖에 포커스가 있어도 붙여넣은 이미지를 받습니다.
       (다른 입력칸·메모장의 글 붙여넣기는 건드리지 않습니다) */
    document.addEventListener('paste', function (e) {
      if (e.defaultPrevented) return;
      if (!chatVisible()) return;
      var t = e.target;
      var tag = t && t.tagName ? String(t.tagName).toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
      attachClipboardImage(e);
    });

    /* 📷 사진 · 카메라 */
    if (el.photoBtn) el.photoBtn.addEventListener('click', function () {
      if (el.photoInput) el.photoInput.click();
    });
    if (el.cameraBtn) el.cameraBtn.addEventListener('click', function () {
      if (el.cameraInput) el.cameraInput.click();
    });
    if (el.photoInput) el.photoInput.addEventListener('change', function () {
      var f = el.photoInput.files && el.photoInput.files[0];
      pickPhoto(f, 'gallery');
    });
    if (el.cameraInput) el.cameraInput.addEventListener('change', function () {
      var f = el.cameraInput.files && el.cameraInput.files[0];
      pickPhoto(f, 'camera');
    });
    if (el.photoDel) el.photoDel.addEventListener('click', function () {
      clearPhoto();
      toast('첨부 사진을 뺐어요', 1600);
    });
    if (el.photoModal) {
      el.photoModal.addEventListener('click', function (e) {
        if (e.target.dataset && e.target.dataset.close) closePhoto();
      });
    }
    if (el.photoClose) el.photoClose.addEventListener('click', closePhoto);
    if (el.photoCloseBtn) el.photoCloseBtn.addEventListener('click', closePhoto);
    if (el.photoDl) el.photoDl.addEventListener('click', savePhotoFile);

    el.plusBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (el.mentionMenu.hidden) showMentions(); else hideMentions();
    });

    el.mentionMenu.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mention]');
      if (!b) return;
      insertMention(b.dataset.mention);
    });

    document.addEventListener('click', function (e) {
      if (el.mentionMenu.hidden) return;
      if (el.mentionMenu.contains(e.target) || el.plusBtn.contains(e.target)) return;
      hideMentions();
    });

    el.themeBtn.addEventListener('click', function () {
      applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    /* 종 버튼은 index.html의 onclick(window.JJU_BELL)이 받습니다 — 여기서 또 걸면 두 번 실행됩니다. */
    if (el.pushMain) el.pushMain.addEventListener('click', function () {
      if (permState() === 'granted' && PUSH.sub) disablePush(); else enablePush();
    });
    if (el.pushOff) el.pushOff.addEventListener('click', function () { disablePush(); });
    if (el.pushRefresh) el.pushRefresh.addEventListener('click', hardRefresh);
    if (el.pushModal) {
      el.pushModal.addEventListener('click', function (e) {
        if (e.target.dataset.close) closePushPanel();
      });
      var pushClose = document.getElementById('pushClose');
      if (pushClose) pushClose.addEventListener('click', closePushPanel);
    }

    el.serverBtn.addEventListener('click', openModal);
    document.getElementById('serverClose').addEventListener('click', closeModal);
    el.serverModal.addEventListener('click', function (e) {
      if (e.target.dataset.close) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeReadPop(); closeModal(); closeSheet(); hideMentions(); closePushPanel(); closeDeliverable(); closePhoto(); }
    });
    document.getElementById('sbSave').addEventListener('click', saveServer);
    document.getElementById('sbTest').addEventListener('click', testFromModal);
    document.getElementById('sbClear').addEventListener('click', clearServer);

    el.taskForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (el.taskInput.value || '').trim();
      if (!v) return;
      addTask(v, el.taskOwner.value, el.taskDue ? el.taskDue.value : '');
      el.taskInput.value = '';
      setDueInput('');
      el.taskInput.focus();
    });

    if (el.taskDueChips) {
      el.taskDueChips.querySelectorAll('button[data-due]').forEach(function (b) {
        b.addEventListener('click', function () {
          var k = b.dataset.due;
          setDueInput(k === 'today' ? todayISO() : (k === 'tomorrow' ? shiftISO(1) : ''));
          if (el.taskInput) el.taskInput.focus();
        });
      });
    }
    if (el.taskDue) {
      el.taskDue.addEventListener('change', syncDueChips);
      el.taskDue.addEventListener('input', syncDueChips);
    }
    if (el.taskFilter) {
      el.taskFilter.querySelectorAll('button[data-filter]').forEach(function (b) {
        b.addEventListener('click', function () {
          state.taskFilter = b.dataset.filter || 'all';
          save();
          renderTasks();
        });
      });
    }
    setDueInput(el.taskDue ? el.taskDue.value : '');

    document.querySelectorAll('#view-blog [data-copy]').forEach(function (b) {
      b.addEventListener('click', function () { copyBlog(b.dataset.copy); });
    });

    if (el.postSeg) {
      el.postSeg.querySelectorAll('button[data-status]').forEach(function (b) {
        b.addEventListener('click', function () { setBlogStatus(b.dataset.status); });
      });
    }

    /* 📂 작업물(자료실) */
    if (el.dlSearch) {
      el.dlSearch.addEventListener('input', function () {
        DL.q = el.dlSearch.value || '';
        if (el.dlSearchClear) el.dlSearchClear.hidden = !DL.q;
        renderDeliverables();
      });
    }
    if (el.dlSearchClear) {
      el.dlSearchClear.addEventListener('click', function () {
        if (el.dlSearch) { el.dlSearch.value = ''; el.dlSearch.focus(); }
        DL.q = '';
        el.dlSearchClear.hidden = true;
        renderDeliverables();
      });
    }
    if (el.dlCats) {
      el.dlCats.querySelectorAll('button[data-cat]').forEach(function (b) {
        b.addEventListener('click', function () {
          DL.cat = b.dataset.cat || 'all';
          state.dlCat = DL.cat;
          save();
          renderDeliverables();
        });
      });
    }
    if (el.dlSort) {
      el.dlSort.querySelectorAll('button[data-sort]').forEach(function (b) {
        b.addEventListener('click', function () {
          DL.sort = b.dataset.sort === 'name' ? 'name' : 'new';
          state.dlSort = DL.sort;
          save();
          renderDeliverables();
        });
      });
    }
    if (el.dlGrid) {
      el.dlGrid.addEventListener('click', function (e) {
        var card = e.target.closest('[data-dl-id]');
        if (!card) return;
        var id = card.getAttribute('data-dl-id');
        var it = null;
        for (var i = 0; i < DL.items.length; i++) {
          if (DL.items[i].id === id) { it = DL.items[i]; break; }
        }
        if (it) openDeliverable(it);
      });
    }
    if (el.dlModal) {
      el.dlModal.addEventListener('click', function (e) {
        if (e.target.dataset && e.target.dataset.close) closeDeliverable();
      });
    }
    if (el.dlModalClose) el.dlModalClose.addEventListener('click', closeDeliverable);
    if (el.dlCopyLink) el.dlCopyLink.addEventListener('click', copyDlLink);

    document.addEventListener('visibilitychange', function () {
      if (pageHidden()) {
        /* 폰이 잠기거나 앱을 뒤로 보내면 폴링을 멈춥니다(서버 트래픽 절감). */
        stopPolling();
        stopMapWalk();
        return;
      }
      /* 탭으로 돌아오면 즉시 1회 동기화하고 폴링을 다시 켭니다. */
      if (SB.connected) {
        startPolling();
        pullAll().catch(function () {});
        /* 돌아온 화면에서 보고 있는 방은 읽음으로 남깁니다. */
        markRead(state.room, true);
      }
      if (state.view === 'map' || pcSplitOn()) startMapWalk();
    });

    /* 창 폭이 바뀌면 2단↔탭 배치를 다시 판정하고, 보이는 맵의 크기를 다시 잽니다. */
    var resizeW = window.innerWidth;
    var resizeRaf = 0;
    window.addEventListener('resize', function () {
      if (resizeRaf) return;
      resizeRaf = window.requestAnimationFrame(function () {
        resizeRaf = 0;
        if (window.innerWidth !== resizeW) {
          resizeW = window.innerWidth;
          syncPcSplit();
        }
        if (state.view !== 'map' && !pcSplitOn()) return;
        if (!measureStage()) return;
        WALKERS.forEach(moveFig);
        layoutBubbles();
      });
    });
  }

  function resizeInput() { /* reserved for future multiline composer */ }

  /* ---------------- 🔄 새 버전 업데이트 알림 (v40) ----------------
     · 새 sw.js 가 배포되면 앱을 닫았다 열지 않아도 위쪽에
       `🔄 새 버전 있어요 [지금 적용]` 배너가 뜹니다.
     · [지금 적용] → 대기 중인 서비스워커에 SKIP_WAITING 을 보내고,
       새 서비스워커가 이 화면을 인계(controllerchange)하는 즉시 새로 고칩니다.
       4초 안에 인계가 없으면 서비스워커·캐시를 비우고 새로 고치는 안전망을 씁니다.
     · 트래픽: sw.js 한 파일만, 화면으로 돌아올 때(5분 간격) + 60분마다 한 번 확인합니다.
     · 처음 설치(컨트롤러 없음)일 때는 배너를 띄우지 않습니다.
  ------------------------------------------------------------------ */
  var UPDATE = { reg: null, controlled: false, applying: false, dismissed: false, shown: false, lastCheck: 0, timer: 0 };

  function updateBannerEl() { return document.getElementById('updateBanner'); }

  function showUpdateBanner() {
    if (UPDATE.applying || UPDATE.dismissed || UPDATE.shown) return;
    var box = updateBannerEl();
    if (!box) return;
    UPDATE.shown = true;
    box.hidden = false;
    document.body.classList.add('has-update');
    requestAnimationFrame(function () { box.classList.add('show'); });
  }

  function hideUpdateBanner() {
    var box = updateBannerEl();
    document.body.classList.remove('has-update');
    if (!box) return;
    box.classList.remove('show');
    box.hidden = true;
  }

  /* 새 서비스워커가 이 화면을 인계하면 한 번만 새로 고칩니다. */
  function reloadOnceForUpdate() {
    var last = 0;
    try { last = Number(sessionStorage.getItem('jju-office-sw-reload') || 0); } catch (e) { last = 0; }
    if (Date.now() - last < 15000) return;
    try { sessionStorage.setItem('jju-office-sw-reload', String(Date.now())); } catch (e) {}
    location.reload();
  }

  function applyUpdate() {
    if (UPDATE.applying) return;
    UPDATE.applying = true;
    var btn = document.getElementById('updateApply');
    if (btn) { btn.disabled = true; btn.textContent = '적용 중…'; }

    /* 인계가 오면 controllerchange 리스너가 새로 고칩니다. 4초 안에 안 오면 안전망. */
    var fallback = setTimeout(function () {
      if (window.JJU_HARD_REFRESH) { window.JJU_HARD_REFRESH(); return; }
      reloadOnceForUpdate();
    }, 4000);

    navigator.serviceWorker.addEventListener('controllerchange', function () {
      clearTimeout(fallback);
    });

    try {
      var reg = UPDATE.reg;
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        return;
      }
      if (navigator.serviceWorker.controller) {
        /* 대기 중인 워커는 없지만 캐시가 물려 있을 수 있어 그대로 한 번 새로 고칩니다. */
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        clearTimeout(fallback);
        setTimeout(reloadOnceForUpdate, 250);
        return;
      }
      if (reg && reg.update) reg.update().catch(function () {});
    } catch (e) {
      clearTimeout(fallback);
      reloadOnceForUpdate();
    }
  }

  function watchUpdateRegistration(reg) {
    if (!reg) return;

    function onInstalled(sw) {
      if (!sw || sw.state !== 'installed') return;
      /* 이미 이 앱을 제어하던 서비스워커가 있을 때만 '새 버전'입니다. */
      if (UPDATE.controlled) showUpdateBanner();
    }

    if (reg.installing) {
      var cur = reg.installing;
      cur.addEventListener('statechange', function () { onInstalled(cur); });
    }
    reg.addEventListener('updatefound', function () {
      var sw = reg.installing;
      if (!sw) return;
      sw.addEventListener('statechange', function () { onInstalled(sw); });
    });
  }

  function initUpdateWatcher() {
    var box = updateBannerEl();
    var apply = document.getElementById('updateApply');
    var later = document.getElementById('updateLater');
    if (apply) apply.addEventListener('click', applyUpdate);
    if (later) later.addEventListener('click', function () {
      UPDATE.dismissed = true;
      hideUpdateBanner();
    });
    if (box) box.hidden = true;

    if (!('serviceWorker' in navigator)) return;

    UPDATE.controlled = !!navigator.serviceWorker.controller;

    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) {
        UPDATE.reg = reg;
        UPDATE.lastCheck = Date.now();
        watchUpdateRegistration(reg);
        if (reg.waiting && UPDATE.controlled) showUpdateBanner();
        if (reg.update) reg.update().catch(function () {});
      }).catch(function () { /* offline install unavailable */ });
    });

    /* 새 서비스워커가 이 화면을 인계함 = 새 버전이 준비됨 → 배너(자동 새로 고침은 하지 않음) */
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      var wasControlled = UPDATE.controlled;
      UPDATE.controlled = true;
      if (UPDATE.applying) { reloadOnceForUpdate(); return; }
      if (!wasControlled) return; /* 첫 설치 — 안내할 것이 없습니다 */
      showUpdateBanner();
    });

    /* 가벼운 확인 — 화면 복귀(5분 간격)와 60분마다 sw.js 한 파일만 다시 봅니다. */
    function poke() {
      if (!UPDATE.reg || !UPDATE.reg.update) return;
      if (Date.now() - UPDATE.lastCheck < 5 * 60 * 1000) return;
      UPDATE.lastCheck = Date.now();
      try { UPDATE.reg.update().catch(function () {}); } catch (e) {}
    }
    document.addEventListener('visibilitychange', function () { if (!pageHidden()) poke(); });
    window.addEventListener('focus', poke);
    if (UPDATE.timer) clearInterval(UPDATE.timer);
    UPDATE.timer = setInterval(function () { if (!pageHidden()) poke(); }, 60 * 60 * 1000);
  }

  function init() {
    cacheEls();
    initMember();
    var had = load();
    if (!had) seed();
    DL.cat = state.dlCat || 'all';
    DL.sort = state.dlSort === 'name' ? 'name' : 'new';
    if (!state.tasks.length) state.tasks = seedTasks();
    applyTheme(state.theme);
    el.todayLabel.textContent = koDate();
    el.roomMeta.textContent = ROOMS[state.room].meta;
    el.chatInput.placeholder = ROOMS[state.room].placeholder;
    document.querySelectorAll('.room-tab').forEach(function (b) {
      var on = b.dataset.room === state.room;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    renderChat();
    renderMapFigures();
    renderTasks();
    renderCrew();
    loadBlog();
    renderBlog();
    renderDeliverables();
    renderQuota();
    renderPhotoStrip();
    bind();

    var params = new URLSearchParams(location.search);
    var v = params.get('view');
    setView(v && document.getElementById('view-' + v) ? v : 'office');

    var autoConnected = applyHashConfig();
    connectStored(autoConnected);
    if (autoConnected) toast('AI 서버에 자동 연결됐어요');

    refreshPushState().then(renderPushPanel);
    syncPushSubscription();

    /* 🔄 새 버전 배너 · 서비스워커 갱신 확인 (v40) */
    initUpdateWatcher();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
