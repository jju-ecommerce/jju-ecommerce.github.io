/* ============================================================
   쭈대표 AI 오피스 · app
   ============================================================ */
(function () {
  'use strict';

  var LS_KEY = 'jju-office-store-v1';

  /* ---------------- people ---------------- */
  var PEOPLE = {
    boss:     { name: '쭈대표', initial: '대', cls: 'p-boss', device: '' },
    director: { name: '총괄이사', initial: '총', cls: 'p-director', device: '본폰' },
    jju1:     { name: '쭈1', initial: '1', cls: 'p-jju1', device: '1번 폰' },
    jju2:     { name: '쭈2', initial: '2', cls: 'p-jju2', device: '2번 폰' },
    jju3:     { name: '쭈3', initial: '3', cls: 'p-jju3', device: '3번 폰' }
  };

  var CREW = [
    {
      id: 'director', name: '총괄이사', device: '본폰', handle: '지휘 총괄',
      role: '4인방 지시 하달과 결과 취합. 원고 사실 검수, 발행·시트 반영 확인, 일일 소싱 1종을 맡습니다.',
      tags: ['지휘', '원고 검수', '발행 확인', '소싱 1종']
    },
    {
      id: 'jju1', name: '쭈1', device: '1번 폰', handle: '@jju20231004',
      role: '스레드 1번 채널 운영. 월요일 유튜브 주제·대본 3종 추천과 원고 작성, 일일 소싱 1종을 맡습니다.',
      tags: ['1번 채널', '유튜브 대본', '소싱 1종']
    },
    {
      id: 'jju2', name: '쭈2', device: '2번 폰', handle: '@songdossanai',
      role: '스레드 2번 채널 운영과 1688 신상품 서칭. 원고 작성과 발행 확인, 일일 소싱 1종을 맡습니다.',
      tags: ['2번 채널', '1688 서칭', '소싱 1종']
    },
    {
      id: 'jju3', name: '쭈3', device: '3번 폰', handle: '@daliva_jnt',
      role: '스레드 3번 채널 운영. 업리카 세션 만료 시 직접 발행으로 대체하고, 오늘 할 일 프로그램과 소싱 1종을 맡습니다.',
      tags: ['3번 채널', '업리카 대응', '소싱 1종']
    }
  ];

  var ROOMS = {
    grand:   { meta: '🏛️ 총괄이사 · 쭈1 · 쭈2 · 쭈3 · 4명', placeholder: '지시를 한 줄로 (@all = 전원)' },
    command: { meta: '👑 쭈대표 · 총괄이사 · 1:1', placeholder: '총괄이사에게 한 줄 지시' },
    lounge:  { meta: '☕ 자유 기록 · 아이디어와 공지', placeholder: '라운지에 남길 메모' }
  };

  var TASKS_SEED = [
    '스레드 3채널 6편 발행 확인 (2번 11:10·21:30 / 3번 11:50·18:40 / 1번 12:31·19:21)',
    '일일 소싱 33~36행 판매가 확정 검토',
    '[10회] 4050 AI, 이렇게 시작하세요 QPrompt 멘트로 촬영 준비',
    '원고 무단 복사 4계정 대응 결정 (@liquidgroove · @mooni.lab.kr · @susieq286 · @hopkoohq)',
    '에이블리 77% 페이백 참여 여부 확인 (12/1~3 · 12/11까지 사용)',
    '데스크탑(컴퓨존 i51722) 램 32GB·윈도우 11 추가 여부'
  ];

  /* ---------------- state ---------------- */
  var state = {
    theme: 'light',
    view: 'office',
    room: 'grand',
    messages: [],
    tasks: [],
    supabase: { url: '', key: '' }
  };

  var SB = { connected: false, timer: null, lastPull: 0, busy: false };

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

  function save() {
    if (DEMO) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        theme: state.theme,
        view: state.view,
        room: state.room,
        messages: state.messages.slice(-400),
        tasks: state.tasks,
        supabase: state.supabase
      }));
    } catch (e) { /* storage full or blocked */ }
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
      state.tasks = Array.isArray(s.tasks) ? s.tasks : [];
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
      { id: 'seed-1', room: 'grand', author: 'director', author_name: '총괄이사', body: '[11/26] 3채널 6편 예약 완료, [10회] 대본도 시트 12행 등록.', created_at: iso(240) },
      { id: 'seed-2', room: 'grand', author: 'jju1', author_name: '쭈1', body: '1번 폰 대기 중입니다. 12:31 · 19:21 발행 확인할게요.', created_at: iso(236) },
      { id: 'seed-3', room: 'grand', author: 'jju2', author_name: '쭈2', body: '2번 대기 중입니다. 11:10 · 21:30 확인하고 링크 올리겠습니다.', created_at: iso(234) },
      { id: 'seed-4', room: 'grand', author: 'jju3', author_name: '쭈3', body: '3번 대기 중입니다. 11:50 · 18:40이랑 업리카 세션 보겠습니다.', created_at: iso(232) },
      { id: 'seed-5', room: 'command', author: 'director', author_name: '총괄이사', body: '지휘실입니다, 대표님. 오늘 결정하실 것 세 가지(원고 무단 복사 4계정 대응 · 에이블리 77% 페이백 · 데스크탑 보류) 정리해 뒀습니다. 말씀만 주세요.', created_at: iso(230) },
      { id: 'seed-6', room: 'lounge', author: 'director', author_name: '총괄이사', body: '라운지 — 자유 기록. 아이디어나 공지를 남겨두면 회의실 지시로 이어서 처리합니다.', created_at: iso(228) }
    ];
    if (!state.tasks.length) {
      state.tasks = TASKS_SEED.map(function (t) {
        return { id: uid(), title: t, done: false };
      });
    }
    save();
  }

  /* ---------------- view ---------------- */
  function setView(name) {
    var target = document.getElementById('view-' + name);
    if (!target) return;
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
    if (name === 'office') {
      window.requestAnimationFrame(scrollChat);
    } else {
      el.main.scrollTop = 0;
      var v = target;
      v.scrollTop = 0;
    }
    /* 오피스 맵을 보고 있을 때만 캐릭터가 걸어 다닙니다 */
    if (name === 'map') {
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

  /* ---------------- chat ---------------- */
  function roomMessages(room) {
    return state.messages
      .filter(function (m) { return m.room === room; })
      .sort(function (a, b) { return new Date(a.created_at) - new Date(b.created_at); });
  }

  function renderChat() {
    var log = el.chatLog;
    var list = roomMessages(state.room);
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
      av.textContent = p.initial;

      var main = document.createElement('div');
      main.className = 'msg-main';

      var head = document.createElement('div');
      head.className = 'msg-head';
      var nm = document.createElement('span');
      nm.className = 'msg-name';
      nm.textContent = m.author_name || p.name;
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
      bub.textContent = m.body;

      main.appendChild(head);
      main.appendChild(bub);
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
    if (!text) return;
    var msg = {
      id: uid(),
      room: state.room,
      author: 'boss',
      author_name: '쭈대표',
      body: text,
      created_at: new Date().toISOString()
    };
    addMessage(msg);
    el.chatInput.value = '';
    resizeInput();
    hideMentions();

    if (SB.connected) {
      sbInsert('office_messages', {
        id: msg.id, room: msg.room, author: msg.author, author_name: msg.author_name, body: msg.body
      }).then(function () {
        flashServer('ok');
      }).catch(function () {
        toast('서버 전송 실패 · 기기에는 저장했어요');
      });
    } else {
      toast('기기에 저장했어요 · AI 서버를 연결하면 4인방에 전달됩니다');
    }
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

  /* ---------------- tasks ---------------- */
  function renderTasks() {
    var list = el.todoList;
    list.innerHTML = '';
    if (!state.tasks.length) {
      var p = document.createElement('li');
      p.className = 'todo-empty';
      p.textContent = '할 일이 없습니다. 아래에 추가해 보세요.';
      list.appendChild(p);
    }
    state.tasks.forEach(function (t) {
      var li = document.createElement('li');
      li.className = 'todo-item' + (t.done ? ' done' : '');

      var cb = document.createElement('button');
      cb.className = 'todo-check';
      cb.setAttribute('aria-label', t.done ? '완료 취소' : '완료 표시');
      cb.setAttribute('aria-pressed', t.done ? 'true' : 'false');
      cb.textContent = '✓';
      cb.addEventListener('click', function () { toggleTask(t); });

      var tx = document.createElement('span');
      tx.className = 'todo-text';
      tx.textContent = t.title;

      var del = document.createElement('button');
      del.className = 'todo-del';
      del.setAttribute('aria-label', '할 일 삭제');
      del.textContent = '✕';
      del.addEventListener('click', function () { removeTask(t); });

      li.appendChild(cb);
      li.appendChild(tx);
      li.appendChild(del);
      list.appendChild(li);
    });

    var done = state.tasks.filter(function (t) { return t.done; }).length;
    el.memoProgress.textContent = done + '/' + state.tasks.length;
    save();
  }

  function toggleTask(t) {
    t.done = !t.done;
    renderTasks();
    if (SB.connected) {
      sbPatch('office_tasks', t.id, { done: t.done, updated_at: new Date().toISOString() })
        .catch(function () { /* keep local */ });
    }
  }

  function removeTask(t) {
    state.tasks = state.tasks.filter(function (x) { return x.id !== t.id; });
    renderTasks();
    if (SB.connected) {
      sbDelete('office_tasks', t.id).catch(function () { /* keep local */ });
    }
  }

  function addTask(title) {
    var t = { id: uid(), title: title, done: false };
    state.tasks.push(t);
    renderTasks();
    if (SB.connected) {
      sbInsert('office_tasks', { id: t.id, title: t.title, owner: 'boss', done: false })
        .catch(function () { toast('서버 저장 실패 · 기기에만 저장했어요'); });
    }
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
        '<div class="crew-mini-txt"><b>' + c.name + '</b><span>' + c.device + ' · ' + c.handle + '</span></div>';
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
          '<div class="crew-head-txt"><h3>' + c.name + '</h3><p>' + c.device + ' · ' + c.handle + '</p></div>' +
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
      speed: 4.2, tripChance: 0.2,
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
      spots: ['d1', 'midT', 'leftT', 'leftM', 'topL'],
      trips: ['lngSofa', 'gTopL', 'topC'],
      speed: 4.8, tripChance: 0.22,
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
      spots: ['d2', 'midM', 'midT', 'topR'],
      trips: ['lngBar', 'gBot', 'topL'],
      speed: 4.6, tripChance: 0.2,
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
      spots: ['d3', 'midL', 'midB', 'botL'],
      trips: ['gBot', 'lngSofa', 'midT'],
      speed: 5, tripChance: 0.2,
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
    w.idleUntil = now + 2400 + Math.random() * 4200;
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

  function paintBubble(w) {
    if (!w.el) return;
    var txtEl = w.el.querySelector('.bub-txt');
    if (!txtEl) return;
    var txt = w.mood || w.cfg.duty;
    if (w.showLatest) {
      var last = latestBy(w.id);
      if (last && last.body) txt = clipText(last.body, 18);
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
    });
  }

  /* ---------------- 말풍선 겹침 정리 ---------------- */
  var BUB_GAP = 6;

  function overlapArea(a, b) {
    var w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    var h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return (w > 0 && h > 0) ? w * h : 0;
  }

  function bubRect(pos, cx, cy, fx, fy, fw, fh, bw, bh) {
    if (pos === 'up') return { x: cx - bw / 2, y: fy - BUB_GAP - bh, w: bw, h: bh };
    if (pos === 'down') return { x: cx - bw / 2, y: fy + fh + BUB_GAP, w: bw, h: bh };
    if (pos === 'left') return { x: fx - BUB_GAP - bw, y: cy - bh / 2, w: bw, h: bh };
    return { x: fx + fw + BUB_GAP, y: cy - bh / 2, w: bw, h: bh };
  }

  function bubScore(r, placed, sw, sh) {
    var out = 0;
    if (r.x < 2) out += 2 - r.x;
    if (r.y < 2) out += 2 - r.y;
    if (r.x + r.w > sw - 2) out += r.x + r.w - (sw - 2);
    if (r.y + r.h > sh - 2) out += r.y + r.h - (sh - 2);
    var over = 0;
    for (var i = 0; i < placed.length; i++) over += overlapArea(r, placed[i]);
    return over + out * 80;
  }

  function layoutBubbles() {
    if (!el.mapStage) return;
    var sw = WALK.w || el.mapStage.clientWidth;
    var sh = WALK.h || el.mapStage.clientHeight;
    if (!sw || !sh) return;

    var placed = [];
    var order = WALKERS.slice().sort(function (a, b) { return b.y - a.y; });

    order.forEach(function (w) {
      var fig = w.el;
      if (!fig) return;
      var bub = fig.querySelector('.map-bubble');
      if (!bub) return;
      var bw = bub.offsetWidth;
      var bh = bub.offsetHeight;
      if (!bw || !bh) return;

      var fw = fig.offsetWidth;
      var fh = fig.offsetHeight;
      var cx = sw * w.x / 100;
      var cy = sh * w.y / 100;
      var fx = cx - fw / 2;
      var fy = cy - fh / 2;

      var pref = w.cfg.bubble === 'right' ? ['right', 'up', 'down', 'left'] : ['up', 'right', 'left', 'down'];
      var best = null;
      for (var i = 0; i < pref.length; i++) {
        var r = bubRect(pref[i], cx, cy, fx, fy, fw, fh, bw, bh);
        var score = bubScore(r, placed, sw, sh) + i * 40;
        if (!best || score < best.score) best = { pos: pref[i], r: r, score: score };
        if (score < 40) break;
      }

      /* 자리가 자주 바뀌면 깜빡이므로, 지금 자리가 조금 나빠도 유지합니다. */
      var cur = bub.dataset.pos;
      if (cur && cur !== best.pos) {
        var cr = bubRect(cur, cx, cy, fx, fy, fw, fh, bw, bh);
        var cs = bubScore(cr, placed, sw, sh) + Math.max(0, pref.indexOf(cur)) * 40;
        if (cs <= best.score + 120) best = { pos: cur, r: cr, score: cs };
      }

      if (bub.dataset.pos !== best.pos) bub.dataset.pos = best.pos;
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

  function startMapWalk() {
    if (WALK.on) return;
    if (state.view !== 'map') return;
    if (document.visibilityState === 'hidden') return;
    if (!measureStage()) return;
    WALK.on = true;
    WALK.last = 0;
    WALK.layoutAt = 0;
    WALKERS.forEach(moveFig);
    layoutBubbles();
    WALK.raf = requestAnimationFrame(walkFrame);
  }

  function stopMapWalk() {
    WALK.on = false;
    if (WALK.raf) cancelAnimationFrame(WALK.raf);
    WALK.raf = 0;
    WALK.last = 0;
  }

  /* ---------------- 그리기 ---------------- */
  function renderMapFigures() {
    var box = el.mapFigs;
    if (!box) return;
    box.innerHTML = '';
    WALKERS = [];

    MAP_CAST.forEach(function (c) {
      var p = PEOPLE[c.id];
      var st = MAP_NODES[c.station] || { x: 50, y: 50 };
      var w = {
        id: c.id, cfg: c, node: c.station,
        x: st.x, y: st.y,
        path: [], target: null, trip: false,
        idleUntil: 0, moodUntil: 0, mood: '', moveLabel: '', showLatest: false,
        landTimer: 0, el: null
      };

      var fig = document.createElement('button');
      fig.type = 'button';
      fig.className = 'map-fig fig-' + c.id;
      fig.dataset.person = c.id;
      fig.setAttribute('aria-label', p.name + ' 최근 보고 보기');

      var bub = document.createElement('span');
      bub.className = 'map-bubble';
      bub.dataset.pos = c.bubble === 'right' ? 'right' : 'up';
      var bubTxt = document.createElement('span');
      bubTxt.className = 'bub-txt';
      bubTxt.textContent = c.duty;
      bub.appendChild(bubTxt);

      var body = document.createElement('span');
      body.className = 'map-fig-body is-idle';
      var av = document.createElement('span');
      av.className = 'map-avatar ' + p.cls;
      av.textContent = p.initial;
      var nm = document.createElement('span');
      nm.className = 'map-name';
      nm.textContent = p.name;
      body.appendChild(av);
      body.appendChild(nm);

      fig.appendChild(bub);
      fig.appendChild(body);
      fig.addEventListener('click', function () { openSheet(c.id); });

      w.el = fig;
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
        card.setAttribute('aria-label', row.p.name + ' 빠른 시트 열기');
        card.addEventListener('click', function () { openSheet(row.c.id); });

        var av = document.createElement('span');
        av.className = 'map-avatar sm ' + row.p.cls;
        av.textContent = row.p.initial;

        var txt = document.createElement('span');
        txt.className = 'map-stat-txt';

        var top = document.createElement('span');
        top.className = 'map-stat-top';
        var nm = document.createElement('b');
        nm.textContent = row.p.name;
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
    el.sheetAvatar.textContent = p.initial;
    el.sheetName.textContent = p.name;
    el.sheetMeta.textContent = p.device + ' · ' + (here || (last && ROOM_LABEL[last.room] ? ROOM_LABEL[last.room] : c.place));
    el.sheetBody.textContent = last
      ? clipText(last.body, 220)
      : '아직 올린 보고가 없습니다. 회의실에서 ' + p.name + '에게 지시하면 최근 보고가 여기에 뜹니다.';
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
    renderChat();
    save();
  }

  function goRoom(room) {
    if (!ROOMS[room]) return;
    selectRoom(room);
    closeSheet();
    setView('office');
  }

  /* ---------------- AI한도 ---------------- */
  /* 기기별 상태만 직접 기록합니다. 피클 사용량 자체는 각 기기 앱에서만 보입니다. */
  var LIMITS_KEY = 'jju-office-limits-v1';

  var LIMIT_DEVICES = [
    { id: 'director', device: '본폰' },
    { id: 'jju1', device: '1번 폰' },
    { id: 'jju2', device: '2번 폰' },
    { id: 'jju3', device: '3번 폰' }
  ];

  var LIMIT_STATES = [
    { id: 'free', label: '여유' },
    { id: 'care', label: '주의' },
    { id: 'out', label: '소진' }
  ];

  var limitState = {};

  function loadLimits() {
    limitState = {};
    var raw = null;
    try { raw = localStorage.getItem(LIMITS_KEY); } catch (e) { raw = null; }
    if (!raw) return;
    try {
      var s = JSON.parse(raw);
      if (!s || typeof s !== 'object') return;
      LIMIT_DEVICES.forEach(function (d) {
        var v = s[d.id];
        if (v && typeof v === 'object' && v.status) {
          var ok = LIMIT_STATES.some(function (x) { return x.id === v.status; });
          if (ok) limitState[d.id] = { status: v.status, at: v.at || '' };
        }
      });
    } catch (e) { /* ignore */ }
  }

  function saveLimits() {
    try { localStorage.setItem(LIMITS_KEY, JSON.stringify(limitState)); } catch (e) { /* ignore */ }
  }

  function shortStamp(isoStr) {
    var d = new Date(isoStr);
    if (isNaN(d)) return '';
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + timeLabel(isoStr);
  }

  function setLimitStatus(id, status) {
    var cur = limitState[id];
    if (cur && cur.status === status) {
      delete limitState[id];
    } else {
      limitState[id] = { status: status, at: new Date().toISOString() };
    }
    saveLimits();
    renderLimits();
  }

  function renderLimits() {
    var box = el.limitRows;
    if (!box) return;
    box.innerHTML = '';

    var recorded = 0;

    LIMIT_DEVICES.forEach(function (d) {
      var p = PEOPLE[d.id];
      var cur = limitState[d.id];
      if (cur) recorded += 1;

      var row = document.createElement('div');
      row.className = 'limit-row';

      var who = document.createElement('div');
      who.className = 'limit-who';

      var av = document.createElement('div');
      av.className = 'avatar ' + p.cls;
      av.textContent = p.initial;

      var txt = document.createElement('div');
      txt.className = 'limit-who-txt';
      var nm = document.createElement('b');
      nm.textContent = p.name;
      var dv = document.createElement('span');
      dv.textContent = d.device + (cur && cur.at ? ' · ' + shortStamp(cur.at) : '');
      txt.appendChild(nm);
      txt.appendChild(dv);

      who.appendChild(av);
      who.appendChild(txt);

      var seg = document.createElement('div');
      seg.className = 'seg';
      seg.setAttribute('role', 'group');
      seg.setAttribute('aria-label', p.name + ' 상태');

      LIMIT_STATES.forEach(function (s) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'st-' + s.id;
        b.textContent = s.label;
        var on = !!(cur && cur.status === s.id);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.setAttribute('aria-label', p.name + ' ' + s.label + (on ? ' · 누르면 기록 해제' : ' 상태로 기록'));
        b.addEventListener('click', function () { setLimitStatus(d.id, s.id); });
        seg.appendChild(b);
      });

      row.appendChild(who);
      row.appendChild(seg);
      box.appendChild(row);
    });

    if (el.limitSaved) {
      el.limitSaved.textContent = recorded ? recorded + '/' + LIMIT_DEVICES.length + ' 기록' : '미기록';
    }
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
    }).catch(function (e) {
      setServerState('err', e && e.status === 404
        ? '테이블이 없습니다 · 스키마 SQL을 먼저 실행해 주세요'
        : '연결 확인 실패 · 로컬 모드로 동작 중');
    });
    startPolling();
  }

  function startPolling() {
    if (SB.timer) clearInterval(SB.timer);
    SB.timer = setInterval(function () {
      if (document.visibilityState === 'visible') pullAll().catch(function () {});
    }, 4500);
  }

  function pullAll() {
    if (!SB.connected || SB.busy) return Promise.reject(new Error('not connected'));
    SB.busy = true;
    return Promise.all([
      sbRequest('/rest/v1/office_messages?select=*&order=created_at.asc&limit=400'),
      sbRequest('/rest/v1/office_tasks?select=*&order=created_at.asc&limit=200')
    ]).then(function (r) {
      SB.busy = false;
      SB.lastPull = Date.now();
      mergeMessages(r[0] || []);
      mergeTasks(r[1] || []);
      return true;
    }).catch(function (e) {
      SB.busy = false;
      throw e;
    });
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
        author_name: r.author_name || (PEOPLE[r.author] ? PEOPLE[r.author].name : '비서'),
        body: r.body || '', created_at: r.created_at || new Date().toISOString()
      });
      changed = true;
    });
    if (changed) {
      state.messages.sort(function (a, b) { return new Date(a.created_at) - new Date(b.created_at); });
      save();
      if (state.view === 'office') renderChat();
    }
    updateMap();
  }

  function mergeTasks(rows) {
    if (!Array.isArray(rows) || !rows.length) return;
    var changed = false;
    rows.forEach(function (r) {
      if (!r || !r.id) return;
      var idx = state.tasks.findIndex(function (t) { return t.id === r.id; });
      if (idx === -1) {
        state.tasks.push({ id: r.id, title: r.title || '(제목 없음)', done: !!r.done });
        changed = true;
      } else {
        if (state.tasks[idx].done !== !!r.done) { state.tasks[idx].done = !!r.done; changed = true; }
        if (r.title && state.tasks[idx].title !== r.title) { state.tasks[idx].title = r.title; changed = true; }
      }
    });
    if (changed) renderTasks();
  }

  /* ---------------- toast ---------------- */
  var toastTimer = null;
  function toast(text) {
    el.toast.textContent = text;
    el.toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove('show'); }, 2600);
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
        startPolling();
        toast('AI 서버에 연결했어요');
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
    if (SB.timer) { clearInterval(SB.timer); SB.timer = null; }
    save();
    el.sbUrl.value = '';
    el.sbKey.value = '';
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

  /* ---------------- init ---------------- */
  function cacheEls() {
    el.main = document.getElementById('main');
    el.chatLog = document.getElementById('chatLog');
    el.chatInput = document.getElementById('chatInput');
    el.sendBtn = document.getElementById('sendBtn');
    el.plusBtn = document.getElementById('plusBtn');
    el.mentionMenu = document.getElementById('mentionMenu');
    el.roomMeta = document.getElementById('roomMeta');
    el.todoList = document.getElementById('todoList');
    el.todoForm = document.getElementById('todoForm');
    el.todoInput = document.getElementById('todoInput');
    el.memoProgress = document.getElementById('memoProgress');
    el.crewRow = document.getElementById('crewRow');
    el.crewList = document.getElementById('crewList');
    el.mapFigs = document.getElementById('mapFigs');
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
    el.limitRows = document.getElementById('limitRows');
    el.limitSaved = document.getElementById('limitSaved');
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
    el.toast = document.getElementById('toast');
    el.todayLabel = document.getElementById('todayLabel');
  }

  function bind() {
    document.querySelectorAll('.menu-item').forEach(function (b) {
      b.addEventListener('click', function () { setView(b.dataset.view); });
    });
    document.querySelectorAll('.bn-item').forEach(function (b) {
      b.addEventListener('click', function () { setView(b.dataset.view); });
    });
    document.querySelectorAll('[data-view].link-btn, [data-view].crew-mini').forEach(function (b) {
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

    el.sendBtn.addEventListener('click', sendMessage);
    el.chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); sendMessage(); }
    });

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

    el.serverBtn.addEventListener('click', openModal);
    document.getElementById('serverClose').addEventListener('click', closeModal);
    el.serverModal.addEventListener('click', function (e) {
      if (e.target.dataset.close) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeModal(); closeSheet(); hideMentions(); }
    });
    document.getElementById('sbSave').addEventListener('click', saveServer);
    document.getElementById('sbTest').addEventListener('click', testFromModal);
    document.getElementById('sbClear').addEventListener('click', clearServer);

    el.todoForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (el.todoInput.value || '').trim();
      if (!v) return;
      addTask(v);
      el.todoInput.value = '';
    });

    document.querySelectorAll('#view-blog [data-copy]').forEach(function (b) {
      b.addEventListener('click', function () { copyBlog(b.dataset.copy); });
    });

    if (el.postSeg) {
      el.postSeg.querySelectorAll('button[data-status]').forEach(function (b) {
        b.addEventListener('click', function () { setBlogStatus(b.dataset.status); });
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        if (SB.connected) pullAll().catch(function () {});
        if (state.view === 'map') startMapWalk();
      } else {
        stopMapWalk();
      }
    });

    window.addEventListener('resize', function () {
      if (state.view !== 'map') return;
      if (!measureStage()) return;
      WALKERS.forEach(moveFig);
      layoutBubbles();
    });
  }

  function resizeInput() { /* reserved for future multiline composer */ }

  function init() {
    cacheEls();
    var had = load();
    if (!had) seed();
    if (!state.tasks.length) {
      state.tasks = TASKS_SEED.map(function (t) { return { id: uid(), title: t, done: false }; });
    }
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
    loadLimits();
    renderLimits();
    loadBlog();
    renderBlog();
    bind();

    var params = new URLSearchParams(location.search);
    var v = params.get('view');
    setView(v && document.getElementById('view-' + v) ? v : 'office');

    var autoConnected = applyHashConfig();
    connectStored(autoConnected);
    if (autoConnected) toast('AI 서버에 자동 연결됐어요');

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () { /* offline install unavailable */ });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
