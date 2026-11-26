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

  /* 2026-11-26 오피스 기준 실제 진행 중인 할 일 — AI 서버 미연결 시 이 기기 목록으로 씁니다. */
  var TASKS_SEED = [
    { title: '쭈3(3번 폰) 오피스 외부 연동 승인하기', owner: 'boss' },
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
        taskFilter: state.taskFilter,
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
      state.tasks = seedTasks();
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
    if (name === 'tasks') {
      renderTasks();
      if (SB.connected) pullTasks().catch(function () {});
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

  /* ---------------- 📋 할 일 ---------------- */
  /* Supabase office_tasks 실제 컬럼: id · title · owner · done · due_date · created_at · updated_at
     AI 서버가 붙으면 서버 목록이 기준이고, 연결 전에는 이 기기(localStorage)에만 담깁니다. */

  var TASK_OWNERS = [
    { id: 'boss', label: '대표님 결정' },
    { id: 'director', label: '총괄이사' },
    { id: 'jju1', label: '쭈1' },
    { id: 'jju2', label: '쭈2' },
    { id: 'jju3', label: '쭈3' }
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

  function layoutBubbles() {
    if (!el.mapStage) return;
    var sw = WALK.w || el.mapStage.clientWidth;
    var sh = WALK.h || el.mapStage.clientHeight;
    if (!sw || !sh) return;

    var placed = [];
    var blockers = [];
    var order = WALKERS.slice().sort(function (a, b) { return b.y - a.y; });

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

    /* 방 이름표(존 태그)도 살짝 피해 갑니다 */
    var stageRect = el.mapStage.getBoundingClientRect();
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
    var bubbleLayer = el.mapBubbles;
    if (bubbleLayer) bubbleLayer.innerHTML = '';
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
      av.textContent = p.initial;
      var nm = document.createElement('span');
      nm.className = 'map-name';
      nm.textContent = p.name;
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
    }).catch(function (e) {
      setServerState('err', e && e.status === 404
        ? '테이블이 없습니다 · 스키마 SQL을 먼저 실행해 주세요'
        : '연결 확인 실패 · 로컬 모드로 동작 중');
    });
    startPolling();
  }

  function startPolling() {
    if (SB.timer) clearInterval(SB.timer);
    var tick = 0;
    SB.timer = setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      tick += 1;
      pullMessages().catch(function () {});
      /* 할 일 탭을 보고 있을 때는 매번, 다른 화면에서는 4번에 한 번만 맞춥니다 */
      if (state.view === 'tasks' || tick % 4 === 0) pullTasks().catch(function () {});
    }, 4500);
  }

  function pullMessages() {
    if (!SB.connected || SB.busy) return Promise.reject(new Error('not connected'));
    SB.busy = true;
    return sbRequest('/rest/v1/office_messages?select=*&order=created_at.asc&limit=400')
      .then(function (rows) {
        SB.busy = false;
        SB.lastPull = Date.now();
        mergeMessages(rows || []);
        return true;
      })
      .catch(function (e) {
        SB.busy = false;
        throw e;
      });
  }

  function pullAll() {
    if (!SB.connected) return Promise.reject(new Error('not connected'));
    return Promise.all([
      pullMessages(),
      pullTasks()
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

  /* ---------------- 🔔 웹 푸시 알림 ---------------- */
  /* VAPID 공개키는 공개 정보입니다(비밀키는 Supabase Edge Function 시크릿에만 저장). */
  var VAPID_PUBLIC_KEY = 'BLsYdjB1PvxgqFW1LsvjOKqEfQ6qry4P77QkHh04m2z7yXbYx5pAx4OtnRy4_XlqHofAiABdweCvsc_qRUrq0pA';
  var PUSH = { busy: false, sub: null, synced: false, lastError: '', opened: false };
  var APP_VERSION = 'v30';

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

  function pushHelpLines(perm, hasSub, connected) {
    if (perm === 'unsupported') return ['이 브라우저는 웹 알림을 지원하지 않아요. 크롬 앱에서 이 주소를 열어 주세요.'];
    if (perm === 'denied') return [
      '폰에서 이 앱의 알림이 막혀 있어요. 아래 순서대로 한 번만 풀어 주세요.',
      '① 홈 화면의 「쭈대표 오피스」 아이콘을 길게 누르기 → 앱 정보 → 알림 → ‘허용’',
      '② 크롬에서 열었다면 주소창 왼쪽 자물쇠 → 알림 → 허용',
      '③ 돌아와서 [알림 허용하고 켜기]를 다시 누르기'
    ];
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
      pushHelpLines(perm, hasSub, connected).forEach(function (line) {
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
      if (!sub) { renderPushBtn('off'); return null; }
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
        startPolling();
        PUSH.synced = false;
        refreshPushState();
        syncPushSubscription();
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
      if (e.key === 'Escape') { closeModal(); closeSheet(); hideMentions(); closePushPanel(); }
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
    bind();

    var params = new URLSearchParams(location.search);
    var v = params.get('view');
    setView(v && document.getElementById('view-' + v) ? v : 'office');

    var autoConnected = applyHashConfig();
    connectStored(autoConnected);
    if (autoConnected) toast('AI 서버에 자동 연결됐어요');

    refreshPushState().then(renderPushPanel);
    syncPushSubscription();

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) {
          if (reg && reg.update) reg.update().catch(function () {});
        }).catch(function () { /* offline install unavailable */ });
      });
      /* 새 서비스워커가 이 화면을 인계하면 최신 app.js·styles.css로 한 번만 새로 고칩니다. */
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        var last = 0;
        try { last = Number(sessionStorage.getItem('jju-office-sw-reload') || 0); } catch (e) { last = 0; }
        if (Date.now() - last < 15000) return;
        try { sessionStorage.setItem('jju-office-sw-reload', String(Date.now())); } catch (e) {}
        location.reload();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
