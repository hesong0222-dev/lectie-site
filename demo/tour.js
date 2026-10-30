/* 체험판 둘러보기: 심사위원이 처음 열면 핵심 장면 여섯 곳을 차례로 짚는다.
   단계는 주소의 ?tour=N 으로 넘기고, 처음 한 번 자동으로 띄웠는지는 sessionStorage에 적는다. */
(function () {
  var STEPS = [
    { page: 'index.html', sel: '#due .ulist',
      t: '김하늘(가상)의 금요일 아침',
      b: '렉티는 학교 LMS의 공지·과제·자료·쪽지를 스스로 읽고, 시험과 마감을 이 한 줄 목록으로 모아 둡니다. 학생이 직접 입력한 일정은 없습니다.' },
    { page: 'week-2026-11-02.html', sel: '.pn-chg a.li', max: 2,
      t: '바뀐 수업을 시간표에 반영',
      b: '목요일 휴강과 화요일 실습의 온라인 전환이 다음 주 시간표에 들어가 있습니다. 둘 다 교수님 공지 글에서 찾아낸 변경입니다.' },
    { page: 'week-2026-11-02.html', text: '중간 보고서 이메일 제출',
      t: '과제 목록에 없던 마감',
      b: '이 마감은 LMS 과제 목록에 없습니다. 공지 본문의 "금요일 자정까지 이메일로" 한 줄에서 꺼냈습니다. 개발자 본인이 1주일(10과목) 써 보니 이런 마감이 12개 나왔습니다.' },
    { page: 'course-101-s-2026-10-28_0900.html', sel: '.md ul',
      t: '수업이 끝나면 요약 노트',
      b: '녹음과 강의 자료로 요약을 만듭니다. 문장 끝의 작은 칩은 근거 자료와 쪽수이고, 누르면 아래 원문으로 갑니다.' },
    { page: 'course-101-x-1.html', sel: '.md ul',
      t: '시험 전에 정리본과 예상 문제',
      b: '공지에서 시험 날짜·범위·규칙을 모으고, 범위에 맞춘 정리본과 예상 문제를 미리 만들어 둡니다.' },
    { page: 'study.html', sel: '.slist',
      t: '공강 시간에 맞춘 복습',
      b: '오늘 빈 시간에 복습 4개(80분)를 배치했습니다. 줄을 누르면 문제 카드가 열립니다. 이제 자유롭게 눌러 보세요. 녹음과 튜터는 체험판에서 꺼져 있습니다.' }
  ];
  var KEY = 'lectie-tour-seen';

  function here() {
    var p = location.pathname.split('/').pop() || 'index.html';
    return p.indexOf('.html') < 0 ? 'index.html' : p;
  }
  function seen() { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function markSeen() { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }

  function targets(s) {
    if (s.sel) return [].slice.call(document.querySelectorAll(s.sel), 0, s.max || 1);
    var all = document.querySelectorAll('a,li');
    for (var i = 0; i < all.length; i++) if (all[i].textContent.indexOf(s.text) >= 0 && !all[i].querySelector('a,li')) return [all[i]];
    return [];
  }

  var CSS =
    '#tour-card{position:fixed;right:20px;bottom:76px;width:340px;z-index:2147483100;background:#fff;color:#1d1d1f;border-radius:14px;' +
    'box-shadow:0 10px 32px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.06);padding:16px 18px 14px;font:14px/1.6 "Noto Sans KR",system-ui,sans-serif}' +
    '#tour-card .n{font:500 11px/1 system-ui,sans-serif;letter-spacing:.06em;color:#C8272B;margin-bottom:6px}' +
    '#tour-card h3{margin:0 0 6px;font-size:16px;line-height:1.35;text-wrap:balance}' +
    '#tour-card p{margin:0;color:#3a3a3c}' +
    '#tour-card .row{display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:8px}' +
    '#tour-card button{font:inherit;border:0;cursor:pointer;border-radius:999px}' +
    '#tour-card .x{background:none;color:#8e8e93;padding:6px 2px}' +
    '#tour-card .go{background:#1d1d1f;color:#fff;padding:7px 16px;font-weight:600}' +
    '.tour-hit{outline:2px solid #C8272B!important;outline-offset:-2px;border-radius:6px;background-color:rgba(200,39,43,.06)!important}' +
    '#tour-again{color:#ffd60a;background:none;border:0;font:inherit;cursor:pointer;padding:0 0 0 6px;text-decoration:underline}' +
    '@media (prefers-color-scheme:dark){#tour-card{background:#1c1c1e;color:#f2f2f7;box-shadow:0 10px 32px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.1)}' +
    '#tour-card p{color:#d1d1d6}#tour-card .go{background:#f2f2f7;color:#1c1c1e}#tour-card .n{color:#FF6B5E}}' +
    '@media (max-width:600px){#tour-card{left:12px;right:12px;width:auto;bottom:calc(64px + env(safe-area-inset-bottom,0px))}}';
  var styled = false, padded = null;

  // 짚은 곳을 화면 위쪽 1/4 높이로 올린다(아래쪽은 안내 카드가 가림). 앱은 안쪽 상자가 스크롤되기도 한다.
  function bringUp(el) {
    var r = el.getBoundingClientRect(), want = innerHeight * 0.25;
    if (r.top >= 40 && r.bottom <= innerHeight - 300) return;
    for (var p = el.parentElement; p; p = p.parentElement) {
      if (p !== document.body && /auto|scroll/.test(getComputedStyle(p).overflowY)) break;
    }
    var box = p || document.body;
    padded = box; box.style.paddingBottom = '320px';   // 끝까지 내려도 카드에 가리지 않게 잠시 여백
    var dy = el.getBoundingClientRect().top - want;
    if (p) p.scrollTop += dy; else scrollBy(0, dy);
  }

  function show(i) {
    var s = STEPS[i];
    markSeen();
    if (!styled) { var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); styled = true; }
    var els = targets(s);
    els.forEach(function (e) { e.classList.add('tour-hit'); });
    if (els[0]) setTimeout(function () { bringUp(els[0]); }, 350);
    var last = i === STEPS.length - 1;
    var c = document.createElement('div');
    c.id = 'tour-card';
    c.setAttribute('role', 'dialog');
    c.innerHTML = '<div class="n">둘러보기 ' + (i + 1) + ' / ' + STEPS.length + '</div><h3></h3><p></p>' +
      '<div class="row"><button type="button" class="x">' + (last ? '' : '그만 보기') + '</button>' +
      '<button type="button" class="go">' + (last ? '닫기' : '다음 ›') + '</button></div>';
    c.querySelector('h3').textContent = s.t;
    c.querySelector('p').textContent = s.b;
    document.body.appendChild(c);
    function close() { c.remove(); els.forEach(function (e) { e.classList.remove('tour-hit'); }); if (padded) { padded.style.paddingBottom = ''; padded = null; } }
    c.querySelector('.x').onclick = close;
    c.querySelector('.go').onclick = function () {
      if (last) return close();
      var nx = STEPS[i + 1];
      if (nx.page === here()) { close(); show(i + 1); }
      else location.href = nx.page + '?tour=' + (i + 1);
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    var m = location.search.match(/[?&]tour=(\d+)/);
    var i = m ? +m[1] : (here() === 'index.html' && !seen() ? 0 : -1);
    if (i >= 0 && i < STEPS.length && STEPS[i].page === here()) show(i);
    var band = document.getElementById('demo-band');
    if (band && here() === 'index.html') {
      var b = document.createElement('button');
      b.id = 'tour-again'; b.type = 'button'; b.textContent = '둘러보기';
      b.onclick = function () { var c = document.getElementById('tour-card'); if (c) c.remove(); show(0); };
      band.appendChild(b);
    }
  });
})();
