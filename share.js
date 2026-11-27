// 수업 정리 공유 페이지: 주소 /s/<코드> 의 코드로 공개 미리보기를 불러온다. 받은 글은 textContent 로만 넣는다.
(function () {
  var API = "https://ycbsjewthfzhkuuysblv.supabase.co/functions/v1/class-share/preview?code=";
  var FRIEND = "같은 수업 친구";
  var $ = function (id) { return document.getElementById(id); };
  var show = function (id) { ["lost", "wait", "closed", "open"].forEach(function (k) { $(k).hidden = k !== id; }); };
  var m = location.pathname.match(/^\/s\/([A-Za-z0-9]{6,12})\/?$/);
  if (!m) { show("lost"); return; }
  var code = m[1];
  document.title = "수업 정리 - 렉티";
  show("wait");

  var DAY = ["일", "월", "화", "수", "목", "금", "토"];
  // 회차 'YYYY-MM-DD HH:MM' → '11월 23일(월) 13:30 수업'
  function unitLabel(u) {
    var p = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2})$/.exec(u || "");
    if (!p) return "";
    var d = new Date(+p[1], +p[2] - 1, +p[3]);
    return (+p[2]) + "월 " + (+p[3]) + "일(" + DAY[d.getDay()] + ") " + p[4] + " 수업";
  }
  function until(iso) {
    var d = new Date(iso);
    return isNaN(d) ? "" : (d.getMonth() + 1) + "월 " + d.getDate() + "일까지 열려요";
  }
  var CLOSED = {
    off: ["보낸 사람이 공유를 껐어요", "보낸 친구에게 새 링크를 부탁해 주세요."],
    expired: ["기한이 지난 링크예요", "공유 링크는 7일 동안 열려요. 보낸 친구에게 새 링크를 부탁해 주세요."],
    none: ["없는 링크예요", "주소가 맞는지 확인해 주세요."],
    slow: ["잠시 뒤에 다시 열어 주세요", "요청이 많아 잠깐 쉬고 있어요."]
  };
  function closed(s) {
    var c = CLOSED[s] || ["지금은 열 수 없어요", "잠시 뒤에 다시 열어 주세요."];
    $("closed-h").textContent = c[0];
    $("closed-p").textContent = c[1];
    show("closed");
  }

  fetch(API + code).then(function (r) { return r.json(); }).then(function (d) {
    if (d.status !== "ok") return closed(d.status);
    var who = d.from_name && d.from_name !== FRIEND ? d.from_name + " 님이" : "같은 수업 친구가";
    $("title").textContent = who + " " + d.course_name + " 수업 정리를 보냈어요";
    $("meta").textContent = [unitLabel(d.unit), until(d.expires_at)].filter(Boolean).join(", ");
    var box = $("lines");
    (d.preview || []).forEach(function (l) { var p = document.createElement("p"); p.textContent = l; box.appendChild(p); });
    document.title = d.course_name + " 수업 정리 - 렉티";
    show("open");
  }).catch(function () { closed("error"); });

  $("app").href = "kr.classradar.app://share/" + code;
  $("copy").addEventListener("click", function () {
    var b = this, url = "https://lectie.app/s/" + code;
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { b.textContent = "복사했어요"; },
      function () { b.textContent = url; });
  });
})();
