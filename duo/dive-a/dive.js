/* Open This Together, part A (the diver) - what every room of this part shares.
   DV.card(...)   the card in the top left corner that says what to tell or ask the partner first
   DV.thing(...)  a thing in the scene that answers a click with a line (and a name tag)
   DV.look(...)   a close look at one thing, in the torch beam, with buttons
   DV.watch / DV.pillar / DV.air   the three things a diver reads: drawn, never written as numbers
   The papers that every room can show again live here too, so that they read the same everywhere. */
window.DV = (function () {
  'use strict';
  var D = document, cardEl = null;

  function card(parts) {
    if (!cardEl) {
      cardEl = ER.el('div', 'pcard');
      D.body.appendChild(cardEl);
      cardEl.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.w')) return;
        cardEl.classList.toggle('min');
        cardEl.querySelector('.fold').textContent = cardEl.classList.contains('min') ? 'open' : 'fold';
      });
    }
    var s = '<span class="fold">fold</span>';
    parts.forEach(function (p) { s += '<h6>' + p[0] + '</h6>' + p[1].map(function (l) { return '<p>' + l + '</p>'; }).join(''); });
    var was = cardEl.innerHTML;
    cardEl.innerHTML = ER.gloss(s);
    cardEl.classList.remove('min');
    if (was && was !== cardEl.innerHTML) { cardEl.classList.remove('ping'); void cardEl.offsetWidth; cardEl.classList.add('ping'); }
  }

  function thing(sel, word, text, busy) {
    var n = ER.$(sel); if (!n) return;
    n.addEventListener('click', function (e) {
      if (busy && busy()) return;
      var t = typeof text === 'function' ? text() : text;
      if (word) ER.wordAt(e.clientX, e.clientY, word);
      if (t) ER.say(t);
    });
  }

  /* o = {kicker, title, pic, text, acts: [{id, label, fn(api), cls}], msg, lock (false = a plain look, no hint bar), onClose} */
  function look(o) {
    var box = ER.el('div', 'lk'), api;
    box.innerHTML = '<div class="lk-pic"></div><div class="lk-body"><h5><small></small></h5><div class="lk-text"></div><p class="lk-msg"></p><div class="lk-acts"></div></div>';
    box.querySelector('.lk-pic').innerHTML = o.pic || '';
    box.querySelector('h5 small').textContent = o.kicker || '';
    box.querySelector('h5').appendChild(D.createTextNode(o.title));
    box.querySelector('.lk-text').innerHTML = ER.gloss(o.text || '');
    api = {
      box: box,
      msg: function (t) { box.querySelector('.lk-msg').innerHTML = ER.gloss(t || ''); },
      pic: function (s) { box.querySelector('.lk-pic').innerHTML = s; },
      acts: function (list) {
        var a = box.querySelector('.lk-acts'); a.innerHTML = '';
        (list || []).forEach(function (x) {
          var b = ER.el('button', 'btn' + (x.cls ? ' ' + x.cls : ''), x.label); b.type = 'button';
          if (x.id) b.id = x.id;
          b.addEventListener('click', function () { x.fn(api); });
          a.appendChild(b);
        });
      }
    };
    api.acts(o.acts);
    if (o.msg) api.msg(o.msg);
    ER.open(o.lock === false ? 'ov-look' : 'ov-lock', box, o.onClose);
    return api;
  }

  /* ---------- the diver's three dials ---------- */
  function watch(h, m) {
    var s = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="97" fill="#15191b"/>' +
      '<circle cx="100" cy="100" r="88" fill="#e8d04a"/><circle cx="100" cy="100" r="74" fill="#0d1416"/>', i, a, r1, r2, ha, ma;
    for (i = 0; i < 60; i++) {
      a = i * 6 * Math.PI / 180; r1 = i % 5 ? 68 : 60; r2 = 72;
      s += '<path d="M' + (100 + r1 * Math.sin(a)).toFixed(1) + ' ' + (100 - r1 * Math.cos(a)).toFixed(1) + 'L' + (100 + r2 * Math.sin(a)).toFixed(1) + ' ' + (100 - r2 * Math.cos(a)).toFixed(1) + '" stroke="#dff7ee" stroke-width="' + (i % 5 ? 1.2 : 3.4) + '"/>';
    }
    [['12', 0], ['3', 90], ['6', 180], ['9', 270]].forEach(function (n) {
      a = n[1] * Math.PI / 180;
      s += '<text x="' + (100 + 47 * Math.sin(a)).toFixed(1) + '" y="' + (100 - 47 * Math.cos(a) + 8).toFixed(1) + '" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="22" fill="#dff7ee" text-anchor="middle">' + n[0] + '</text>';
    });
    for (i = 0; i < 12; i++) { a = i * 30 * Math.PI / 180; s += '<circle cx="' + (100 + 80 * Math.sin(a)).toFixed(1) + '" cy="' + (100 - 80 * Math.cos(a)).toFixed(1) + '" r="2.4" fill="#15191b"/>'; }
    ha = ((h % 12) + m / 60) * 30; ma = m * 6;
    s += '<g transform="rotate(' + ha.toFixed(1) + ' 100 100)"><path d="M100 112V62" stroke="#8ff7d8" stroke-width="8" stroke-linecap="round"/></g>' +
      '<g transform="rotate(' + ma.toFixed(1) + ' 100 100)"><path d="M100 116V36" stroke="#8ff7d8" stroke-width="4.5" stroke-linecap="round"/></g>' +
      '<circle cx="100" cy="100" r="6" fill="#e8d04a"/></svg>';
    return s;
  }
  function pillar(level) {
    var s = '<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="300" fill="#06292c"/>' +
      '<rect x="44" y="0" width="112" height="300" fill="#b7b2a2"/><rect x="44" y="0" width="14" height="300" fill="#9d9888"/><rect x="142" y="0" width="14" height="300" fill="#cfcab9"/>' +
      '<text x="100" y="20" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="13" letter-spacing="2" fill="#2a2a24" text-anchor="middle">DEPTH · METRES</text>', v, y, yw;
    function Y(val) { return 270 - (val - 2.1) * 600; }
    for (v = 2.1; v <= 2.501; v += 0.02) {
      y = Y(v); var major = Math.abs(Math.round(v * 10) - v * 10) < 0.001;
      s += '<path d="M' + (major ? 62 : 62) + ' ' + y.toFixed(1) + 'h' + (major ? 46 : 22) + '" stroke="#1d1d1a" stroke-width="' + (major ? 3.2 : 2) + '"/>';
      if (major) s += '<text x="116" y="' + (y + 7).toFixed(1) + '" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="22" fill="#1d1d1a">' + v.toFixed(1) + '</text>';
    }
    yw = Y(level);
    s += '<rect x="0" y="' + yw.toFixed(1) + '" width="200" height="' + (300 - yw).toFixed(1) + '" fill="#0b4a4e" fill-opacity=".72"/>' +
      '<path d="M0 ' + yw.toFixed(1) + 'q25 -4 50 0t50 0t50 0t50 0" stroke="#9fe9df" stroke-width="2.5" fill="none"/></svg>';
    return s;
  }
  function air(bar) {
    var s = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="96" fill="#2a2f31"/><circle cx="100" cy="100" r="84" fill="#f1efe4"/>', v, a, r1;
    function A(val) { return (-135 + val * 0.9) * Math.PI / 180; }
    for (v = 0; v <= 300; v += 10) {
      a = A(v); r1 = v % 50 ? 70 : 62;
      s += '<path d="M' + (100 + r1 * Math.sin(a)).toFixed(1) + ' ' + (100 - r1 * Math.cos(a)).toFixed(1) + 'L' + (100 + 78 * Math.sin(a)).toFixed(1) + ' ' + (100 - 78 * Math.cos(a)).toFixed(1) + '" stroke="#1d2224" stroke-width="' + (v % 50 ? 1.4 : 3) + '"/>';
      if (!(v % 50)) s += '<text x="' + (100 + 48 * Math.sin(a)).toFixed(1) + '" y="' + (100 - 48 * Math.cos(a) + 6).toFixed(1) + '" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="17" fill="#1d2224" text-anchor="middle">' + v + '</text>';
    }
    var ra = A(0) * 180 / Math.PI, rb = A(60) * 180 / Math.PI;
    s += '<path d="' + arc(ra, rb) + '" stroke="#c4372b" stroke-width="7" fill="none"/>';
    s += '<text x="100" y="140" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="16" letter-spacing="3" fill="#1d2224" text-anchor="middle">BAR</text>';
    a = (-135 + bar * 0.9);
    s += '<g transform="rotate(' + a.toFixed(1) + ' 100 100)"><path d="M100 112V30" stroke="#151515" stroke-width="4" stroke-linecap="round"/></g><circle cx="100" cy="100" r="7" fill="#151515"/></svg>';
    return s;
  }
  function arc(a1, a2) {
    var r = 81, x1 = 100 + r * Math.sin(a1 * Math.PI / 180), y1 = 100 - r * Math.cos(a1 * Math.PI / 180), x2 = 100 + r * Math.sin(a2 * Math.PI / 180), y2 = 100 - r * Math.cos(a2 * Math.PI / 180);
    return 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'A' + r + ' ' + r + ' 0 0 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
  }

  /* ---------- papers ---------- */
  var ABC = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'X-ray', 'Yankee', 'Zulu'];
  var SLATE = '<h4>Your slate</h4>' +
    '<p>Yellow plastic, with a pencil on a string. The front is for writing on under water. The back has the team&rsquo;s radio rules, scratched in years ago by somebody with a compass point and a lot of patience.</p>' +
    '<p><b>RADIO RULES · RILLMOUTH HARBOUR DIVE TEAM</b></p>' +
    '<p>1. Say who you are calling, then who you are: &ldquo;Topside, this is Diver.&rdquo;<br>2. Say &ldquo;over&rdquo; when you have finished and want an answer.<br>3. Say every number back, to check it.<br>4. Never say &ldquo;there&rdquo;. Say WHERE.<br>5. Spell every name:</p>' +
    '<div class="abc">' + ABC.map(function (w) { return '<span><b>' + w.charAt(0) + '</b> ' + w + '</span>'; }).join('') + '</div>' +
    '<p>Along the top edge there is a ruler, in centimetres. The slate is exactly 30 centimetres long.</p>';
  function slate() { ER.read({ html: SLATE, cls: 'slate', clue: { id: 'slate', title: 'Your slate', kind: 'On your belt' } }); }

  /* ---------- small sounds of water ---------- */
  var sfx = {
    bubbles: function () { for (var i = 0; i < 6; i++) ER.tone({ f: 380 + Math.random() * 500, f2: 900 + Math.random() * 600, dur: 0.07, peak: 0.05, when: i * 0.09 + Math.random() * 0.05 }); },
    splash: function () { ER.burst({ type: 'lowpass', f: 900, f2: 200, dur: 0.6, peak: 0.25, a: 0.02 }); },
    wade: function () { ER.burst({ type: 'bandpass', f: 500, f2: 260, q: 0.8, dur: 0.5, peak: 0.18, a: 0.05 }); ER.burst({ type: 'bandpass', f: 700, f2: 300, q: 0.8, dur: 0.45, peak: 0.12, a: 0.05, when: 0.55 }); },
    clink: function () { ER.tone({ f: 1900, dur: 0.18, peak: 0.07 }); ER.tone({ f: 2600, dur: 0.12, peak: 0.04, when: 0.05 }); },
    turn: function () { ER.tone({ type: 'sawtooth', f: 90, f2: 70, dur: 0.35, peak: 0.07, a: 0.05 }); ER.burst({ dur: 0.08, f: 1200, q: 2, peak: 0.08, when: 0.25 }); }
  };

  function mins() { var s = ER.state(); return Math.max(1, Math.round(((s.fin ? s.fin.secs : s.secs) || 0) / 60)); }

  return { card: card, thing: thing, look: look, watch: watch, pillar: pillar, air: air, slate: slate, SLATE: SLATE, sfx: sfx, mins: mins };
})();
