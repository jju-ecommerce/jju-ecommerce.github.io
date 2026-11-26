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
    grand:   { meta: '🏛️ 총괄이사 · 쭈1 · 쭈2 · 쭈3 · 4명', placeholder: '대표님, 지시를 한 줄로 (@all = 전원)' },
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

  /* ---------------- seeds ---------------- */
  function seed() {
    if (state.messages.length) return;
    state.messages = [
      { id: 'seed-1', room: 'grand', author: 'director', author_name: '총괄이사', body: '[11/26 출근 보고] 대표님, 오늘 3채널 6편 예약(2번 11:10·21:30 / 3번 11:50·18:40 / 1번 12:31·19:21) 완료했고, [10회] 대본도 유튜브_대본 12행에 올려 뒀습니다. 발행되면 링크 확인해서 바로 보고드리겠습니다.', created_at: iso(240) },
      { id: 'seed-2', room: 'grand', author: 'jju1', author_name: '쭈1', body: '1번 폰 대기 중입니다. 12:31 · 19:21 발행 확인하고 첫 댓글까지 챙기겠습니다.', created_at: iso(236) },
      { id: 'seed-3', room: 'grand', author: 'jju2', author_name: '쭈2', body: '2번 대기 중입니다. 11:10 · 21:30 예약 확인하고, 발행되면 링크 올리겠습니다.', created_at: iso(234) },
      { id: 'seed-4', room: 'grand', author: 'jju3', author_name: '쭈3', body: '3번 대기 중입니다. 11:50 · 18:40 예약과 업리카 세션 상태 함께 보겠습니다.', created_at: iso(232) },
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
  }

  function flashServer(mode) { if (mode === 'ok' && SB.connected) setServerState('ok'); }

  function connectStored() {
    if (!state.supabase.url || !state.supabase.key) {
      SB.connected = false;
      setServerState('none');
      return;
    }
    SB.connected = true;
    setServerState('none', '연결 정보 있음 · 동기화 확인 중');
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
        state.room = b.dataset.room;
        document.querySelectorAll('.room-tab').forEach(function (x) {
          var on = x === b;
          x.classList.toggle('active', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        el.roomMeta.textContent = ROOMS[state.room].meta;
        el.chatInput.placeholder = ROOMS[state.room].placeholder;
        el.chatInput.blur();
        renderChat();
        save();
      });
    });

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
      if (e.key === 'Escape') { closeModal(); hideMentions(); }
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

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && SB.connected) pullAll().catch(function () {});
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
    renderTasks();
    renderCrew();
    bind();

    var params = new URLSearchParams(location.search);
    var v = params.get('view');
    setView(v && document.getElementById('view-' + v) ? v : 'office');

    connectStored();

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
