(function () {
  var URL = 'https://ycbsjewthfzhkuuysblv.supabase.co/rest/v1/beta_signups';
  var KEY = 'sb_publishable_sEs5EZgj9pC0t5LwLslsAQ_BwxtT2gr';
  var form = document.getElementById('beta-form');
  var msg = document.getElementById('form-msg');
  var btn = document.getElementById('f-submit');
  var done = document.getElementById('done');
  var sending = false;
  var EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  function fail(text, el) {
    msg.textContent = text;
    if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
  }
  function val(name) { return form.elements[name].value.trim(); }
  function orNull(s) { return s ? s : null; }

  form.addEventListener('input', function (e) { e.target.removeAttribute('aria-invalid'); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    msg.textContent = '';
    var f = form.elements;
    var devices = Array.prototype.map.call(form.querySelectorAll('input[name=devices]:checked'), function (c) { return c.value; });

    if (!val('name')) return fail('이름을 적어 주세요.', f.name);
    if (!EMAIL.test(val('email'))) return fail('연락 이메일을 확인해 주세요.', f.email);
    if (!val('school')) return fail('학교를 적어 주세요.', f.school);
    if (!devices.length) return fail('쓰는 기기를 하나 이상 골라 주세요.', form.querySelector('input[name=devices]'));
    if (val('apple_id') && !EMAIL.test(val('apple_id'))) return fail('애플 ID 이메일을 확인해 주세요.', f.apple_id);
    if (val('google_account') && !EMAIL.test(val('google_account'))) return fail('구글 계정 이메일을 확인해 주세요.', f.google_account);
    if (!f.consent.checked) return fail('개인정보 수집에 동의해 주세요.', f.consent);
    if (!f.age14.checked) return fail('만 14세 이상인지 확인해 주세요.', f.age14);

    var body = {
      name: val('name'),
      email: val('email').toLowerCase(),
      school: val('school'),
      devices: devices,
      apple_id: orNull(val('apple_id')),
      google_account: orNull(val('google_account')),
      note: orNull(val('note')),
      age14: true
    };

    sending = true;
    btn.disabled = true;
    btn.textContent = '보내는 중';

    fetch(URL, {
      method: 'POST',
      headers: {
        'apikey': KEY,
        'Authorization': 'Bearer ' + KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(body)
    }).then(function (res) {
      if (res.ok) {
        form.hidden = true;
        done.hidden = false;
        done.focus();
      } else if (res.status === 409) {
        fail('이미 신청하셨어요. 입력하신 이메일로 안내해 드릴게요.');
      } else {
        fail('보내지 못했어요. 잠시 뒤 다시 시도해 주세요.');
      }
    }).catch(function () {
      fail('보내지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.');
    }).then(function () {
      sending = false;
      btn.disabled = false;
      btn.textContent = '베타 신청하기';
    });
  });
})();
