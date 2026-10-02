(function () {
  var $ = function (id) { return document.getElementById(id); };
  var form = $('signup-form');
  var errorEl = $('form-error');
  var btn = $('submit-btn');

  /* "Join the list" and "Sign up for details" land on #signup: put the cursor in the form. */
  function focusForm() {
    if (location.hash !== '#signup' || form.hidden) return;
    try { $('first-name').focus(); } catch (e) {}
  }
  window.addEventListener('hashchange', focusForm);
  /* On arrival from another page the browser jumps to #signup after loading and drops
     focus, so focus the field once that has happened. */
  window.addEventListener('load', function () { setTimeout(focusForm, 50); });

  function fail(msg, el) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
  }
  function clearErrors() {
    errorEl.hidden = true;
    ['first-name', 'last-name', 'email'].forEach(function (id) { $(id).removeAttribute('aria-invalid'); });
  }

  /* Sends the sign-up to Kit. Resolves "ok", or "native" when the browser blocked the
     background request and the form should be posted the ordinary way instead. */
  async function save() {
    var res;
    try {
      res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    } catch (e) {
      return 'native';
    }
    var data = null;
    try { data = await res.json(); } catch (e) {}
    if (res.ok && (!data || data.status !== 'failed')) return 'ok';
    throw new Error('kit-rejected');
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearErrors();
    var first = $('first-name').value.trim();
    var last = $('last-name').value.trim();
    var email = $('email').value.trim().toLowerCase();
    if (!first) return fail('Add your first name.', $('first-name'));
    if (!last) return fail('Add your last name.', $('last-name'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('Enter a valid email address, like name@example.com.', $('email'));
    if (!$('agree').checked) return fail('Tick the box to agree to notifications from The Elopery.', $('agree'));

    btn.disabled = true;
    btn.textContent = 'Saving';
    try {
      var how = await save();
      if (how === 'native') { form.submit(); return; }
      $('thanks-title').textContent = 'Almost there, ' + first + '.';
      $('thanks-body').textContent = 'One more step: we sent a confirmation email to ' + email + '. Click the link in it to finish signing up.';
      form.hidden = true;
      $('thanks').hidden = false;
      form.reset();
    } catch (err) {
      fail('We could not save your sign-up just now. Please try again in a little while.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign me up';
    }
  });
})();
