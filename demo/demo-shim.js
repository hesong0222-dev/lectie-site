/* 체험판 보조: 서버가 필요한 동작은 눌렀을 때 작은 안내만 띄운다. */
(function () {
  var MSG = '체험판에서는 꺼져 있어요';
  var last = 0, timer;
  function toast(msg) {
    var t = document.getElementById('demo-toast');
    if (!t) return;
    t.textContent = msg || MSG;
    t.classList.add('on');
    clearTimeout(timer);
    timer = setTimeout(function () { t.classList.remove('on'); }, 1800);
  }
  window.demoToast = toast;

  // 서버 호출은 막고 안내만 (연결 확인 /ping은 '연결됨'으로 둔다)
  var realFetch = window.fetch;
  window.fetch = function (url, opt) {
    var u = String(url && url.url || url || '');
    if (/\/ping(\?|$)/.test(u)) return Promise.resolve(new Response(null, { status: 204 }));
    if (/\/tutor\/voice/.test(u)) return Promise.resolve(new Response('{"stt":false,"tts":false}', { status: 200 }));
    if (/memory\.json/.test(u)) return Promise.resolve(new Response('[]', { status: 200 }));
    if (/^(https?:)?\/\/(fonts|cdnjs)/.test(u) && realFetch) return realFetch.apply(this, arguments);
    var now = Date.now();
    if (now - last > 1200) { last = now; toast(); }
    return Promise.reject(new Error('demo'));
  };

  // 화면 안 스크립트가 만든 서버 주소 링크는 내려받은 파일로 바꾼다
  function local(h) {
    var m;
    if (h === '/' || h === '/today' || /^\/\?(date=[\d-]+)?$/.test(h)) return 'index.html';
    if (/^\/\?view=week$/.test(h)) return 'week.html';
    if ((m = h.match(/^\/\?view=week&date=(\d{4}-\d\d-\d\d)/))) return null;
    if ((m = h.match(/^\/course\/(\d{3})$/))) return 'course-' + m[1] + '.html';
    if (h === '/course') return 'course-101.html';
    if (h === '/study') return 'study.html';
    if (h === '/review') return 'review.html';
    if (h === '/upcoming') return 'upcoming.html';
    if (h === '/notes') return 'notes.html';
    if ((m = h.match(/^\/notes\?course=(\d{3})/))) return 'notes-course-' + m[1] + '.html';
    return null;
  }
  function fixLinks(root) {
    (root || document).querySelectorAll('a[href^="/"]').forEach(function (a) {
      var h = a.getAttribute('href');
      a.setAttribute('href', local(h) || '#demo-off');
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    fixLinks();
    new MutationObserver(function () { fixLinks(); }).observe(document.body, { childList: true, subtree: true });
  });

  // 눌러서 이동할 곳이 없는 링크, 서버로 보내는 양식
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (a && a.getAttribute('href') === '#demo-off') { e.preventDefault(); toast(); return; }
    if (e.target.closest && e.target.closest('[data-rec],[data-rec-end]')) { e.preventDefault(); e.stopImmediatePropagation(); toast('녹음은 체험판에서 꺼져 있어요'); }
  }, true);
  document.addEventListener('submit', function (e) {
    e.preventDefault(); e.stopPropagation(); toast();
  }, true);

  // 마이크도 켜지 않는다
  if (navigator.mediaDevices) {
    try { navigator.mediaDevices.getUserMedia = function () { toast('녹음은 체험판에서 꺼져 있어요'); return Promise.reject(new Error('demo')); }; } catch (e) { /* 무시 */ }
  }

  // 서비스 워커·푸시 알림 등록은 하지 않는다
  if (navigator.serviceWorker) {
    try { navigator.serviceWorker.register = function () { return Promise.reject(new Error('demo')); }; } catch (e) { /* 무시 */ }
  }
})();
