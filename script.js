(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header condenses once the page moves
  var head = document.querySelector('[data-head]');
  if (head) {
    var onScroll = function () { head.classList.toggle('is-condensed', window.scrollY > 32); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile menu
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    };
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
  }

  // Content rises with a 60ms stagger
  document.querySelectorAll('[data-rise-group]').forEach(function (group) {
    group.querySelectorAll('[data-rise]').forEach(function (el, i) {
      el.style.transitionDelay = (i * 60) + 'ms';
    });
  });

  // Each lap settles once as it arrives
  var laps = document.querySelectorAll('[data-lap]');
  var groups = document.querySelectorAll('[data-rise-group]');
  if (reduced || !('IntersectionObserver' in window)) {
    laps.forEach(function (l) { l.classList.add('is-settled'); });
    groups.forEach(function (g) { g.classList.add('is-risen'); });
  } else {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(entry.target.hasAttribute('data-lap') ? 'is-settled' : 'is-risen');
        seen.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    laps.forEach(function (l) { seen.observe(l); });
    groups.forEach(function (g) { seen.observe(g); });
  }

  // Form: a name and one way to reach you, nothing else required
  var form = document.querySelector('[data-form]');
  if (form) {
    var name = form.querySelector('#f-name');
    var email = form.querySelector('#f-email');
    var phone = form.querySelector('#f-phone');
    var show = function (input, id, message) {
      var el = document.getElementById(id);
      el.textContent = message;
      el.hidden = !message;
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    };
    form.addEventListener('submit', function (e) {
      var who = name.value.trim();
      var mail = email.value.trim();
      var tel = phone.value.trim();
      var mailBad = mail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail);
      show(name, 'e-name', who ? '' : 'Please add your name.');
      show(email, 'e-email', mailBad ? 'That email address looks incomplete.' : '');
      show(phone, 'e-contact', mail || tel ? '' : 'Please add an email or a phone number so a reply can reach you.');
      if (!who || mailBad || (!mail && !tel)) {
        e.preventDefault();
        form.querySelector('[aria-invalid="true"]').focus();
        return;
      }
      e.preventDefault();
      window.location.href = form.getAttribute('action');
    });
  }
})();
