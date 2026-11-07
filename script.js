(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header turns solid once the page moves
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

  // About slider: the arrow moves one photograph on, then back to the start
  var track = document.querySelector('[data-slider-track]');
  var next = document.querySelector('[data-slider-next]');
  if (track && next) {
    next.addEventListener('click', function () {
      var step = track.firstElementChild.getBoundingClientRect().width + 16;
      var end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      track.scrollTo({ left: end ? 0 : track.scrollLeft + step, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  // Homes rail: one panel open at a time
  var rail = document.querySelector('[data-rail]');
  if (rail) {
    var items = Array.prototype.slice.call(rail.querySelectorAll('.rail__item'));
    var current = 0;
    var open = function (i) {
      current = (i + items.length) % items.length;
      items.forEach(function (item, n) {
        item.classList.toggle('is-open', n === current);
        item.querySelector('button').setAttribute('aria-expanded', String(n === current));
      });
    };
    items.forEach(function (item, i) {
      item.querySelector('button').addEventListener('click', function () { open(i); });
    });
    rail.querySelector('[data-rail-prev]').addEventListener('click', function () { open(current - 1); });
    rail.querySelector('[data-rail-next]').addEventListener('click', function () { open(current + 1); });
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
