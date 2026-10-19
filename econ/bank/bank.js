/* Still Open at Four - what every room of the story shares: a few sounds, small helpers, the people of Brockholt
   (standing in the scene, and as busts for the interviews), banknotes, and the number drum that most of the locks are
   set with. Loaded after engine.js. Nothing in here knows an answer. */
window.BANK = (function () {
  'use strict';
  var X = {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds (through the engine, so that the sound button switches them) ---------- */
  X.sfx = {
    coin: function () { T({ f: 2400, dur: 0.18, peak: 0.07 }); T({ f: 3610, dur: 0.12, peak: 0.04, when: 0.01 }); },
    drum: function () { B({ dur: 0.025, f: 2600, q: 5, peak: 0.1 }); T({ f: 420, dur: 0.04, peak: 0.05 }); },
    stamp: function () { T({ f: 150, f2: 70, dur: 0.16, peak: 0.4 }); B({ type: 'lowpass', f: 800, dur: 0.06, peak: 0.25 }); },
    notes: function () { B({ type: 'highpass', f: 3000, dur: 0.22, peak: 0.07, a: 0.04 }); B({ type: 'highpass', f: 3600, dur: 0.12, peak: 0.05, when: 0.12 }); },
    clank: function () { T({ f: 260, f2: 180, dur: 0.35, peak: 0.12, type: 'triangle' }); T({ f: 523, dur: 0.25, peak: 0.05 }); B({ dur: 0.05, f: 2500, q: 2, peak: 0.12 }); },
    cup: function () { T({ f: 1700, dur: 0.2, peak: 0.05 }); T({ f: 2550, dur: 0.14, peak: 0.03 }); },
    ping: function () { T({ f: 1318, dur: 0.16, peak: 0.06 }); T({ f: 1760, dur: 0.22, peak: 0.05, when: 0.1 }); }
  };
  X.solved = function (quiet) {
    var sung = false;
    try { sung = !!(ER.music && ER.music() && ER.track && ER.track.sting('solved', null, !!quiet)); } catch (e) {}
    if (!sung && !quiet) ER.sfx.ok();
  };

  /* ---------- small helpers ---------- */
  X.thing = function (sel, word, line, busy, after) {
    ER.$$(sel).forEach(function (n) {
      n.addEventListener('click', function (e) {
        if (busy && busy()) return;
        if (word) ER.wordAt(e.clientX, e.clientY, word);
        if (line) ER.say(typeof line === 'function' ? line() : line);
        if (after) after();
      });
    });
  };
  X.mine = function (id, title, html, quiet) { return ER.addClue(id, title, '<h4>' + title + '</h4>' + html, 'mine', 'Your notes', quiet); };
  X.terms = function (list) {
    var G = window.GLOSS || [];
    list.forEach(function (w) { for (var i = 0; i < G.length; i++) if (G[i][0] === w) { ER.addWord(G[i][0], G[i][1]); break; } });
  };
  X.minutesPlayed = function () {
    var st = ER.state();
    if (st.fin && st.fin.secs) return Math.max(1, Math.round(st.fin.secs / 60));
    return Math.max(1, Math.round((Date.now() - (st.t0 || Date.now())) / 60000));
  };
  /* pounds as the story writes them: £4,243.60, £400 */
  X.pounds = function (n, pence) {
    var s = Math.floor(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (pence) s += '.' + ('0' + Math.round((Math.abs(n) % 1) * 100)).slice(-2);
    return (n < 0 ? '−' : '') + '£' + s;
  };

  /* ---------- the number drum: a row of wheels, one for each figure ----------
     node: an empty element. o = {digits, dec (figures after the point), sep (commas), before, after, val, change(v), lock()}.
     Click above or below a figure, or turn the mouse wheel over it. The value is a whole number of the smallest unit. */
  X.drum = function (node, o) {
    var n = o.digits || 3, dig = [], i, v = Math.max(0, Math.round(o.val || 0)), s = '';
    for (i = n - 1; i >= 0; i--) { dig[i] = v % 10; v = Math.floor(v / 10); }
    node.classList.add('dr');
    if (o.before) s += '<span class="dr-fix">' + o.before + '</span>';
    for (i = 0; i < n; i++) {
      var left = n - i - (o.dec || 0);
      if (i && o.dec && left === 0) s += '<span class="dr-fix dr-pt">.</span>';
      else if (i && o.sep && left > 0 && left % 3 === 0) s += '<span class="dr-fix dr-pt">,</span>';
      s += '<span class="dr-w" data-i="' + i + '"><button type="button" class="dr-up" aria-label="up">&#9650;</button><b></b><button type="button" class="dr-dn" aria-label="down">&#9660;</button></span>';
    }
    if (o.after) s += '<span class="dr-fix">' + o.after + '</span>';
    node.innerHTML = s;
    function val() { var x = 0; for (var j = 0; j < n; j++) x = x * 10 + dig[j]; return x; }
    function paint() { ER.$$('.dr-w', node).forEach(function (w) { w.querySelector('b').textContent = dig[+w.getAttribute('data-i')]; }); }
    function turn(j, d) {
      if (o.lock && o.lock()) return;
      dig[j] = (dig[j] + d + 10) % 10; paint(); X.sfx.drum(); if (o.change) o.change(val());
    }
    ER.$$('.dr-w', node).forEach(function (w) {
      var j = +w.getAttribute('data-i');
      w.querySelector('.dr-up').addEventListener('click', function (e) { e.stopPropagation(); turn(j, 1); });
      w.querySelector('.dr-dn').addEventListener('click', function (e) { e.stopPropagation(); turn(j, -1); });
      w.addEventListener('wheel', function (e) { e.preventDefault(); turn(j, e.deltaY < 0 ? 1 : -1); }, { passive: false });
    });
    paint();
    return {
      get: val, node: node,
      set: function (x) { x = Math.max(0, Math.round(x)); for (var j = n - 1; j >= 0; j--) { dig[j] = x % 10; x = Math.floor(x / 10); } paint(); }
    };
  };

  /* ---------- banknotes, drawn ---------- */
  X.bundle = function (x, y, w, rot) {
    w = w || 60;
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ')"><rect x="0" y="0" width="' + w + '" height="' + (w * 0.5).toFixed(0) + '" rx="2" fill="#b98a7a"/>' +
      '<rect x="2" y="-3" width="' + w + '" height="' + (w * 0.5).toFixed(0) + '" rx="2" fill="#d9a898" stroke="#8a5a4a" stroke-width="1"/>' +
      '<rect x="' + (w * 0.42).toFixed(0) + '" y="-3" width="' + (w * 0.18).toFixed(0) + '" height="' + (w * 0.5).toFixed(0) + '" fill="#f0e6c0"/>' +
      '<circle cx="' + (w * 0.22).toFixed(0) + '" cy="' + (w * 0.22).toFixed(0) + '" r="' + (w * 0.09).toFixed(1) + '" fill="#8a5a4a" opacity=".5"/></g>';
  };

  /* ---------- people, standing: feet at 0 0, about 300 high ---------- */
  var HAIR = {
    short: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13z',
    bob: 'M-25 -276q2 -30 25 -30t25 30q-10 -12 -25 -12t-25 12zM-25 -282q-7 26 -2 42h10q-4 -22 -1 -34zM25 -282q7 26 2 42h-10q4 -22 1 -34z',
    bun: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM-11 -308a11 11 0 1 1 22 0a11 11 0 1 1 -22 0z',
    pony: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM20 -294q24 2 22 44q-9 -6 -11 -24q-6 -8 -13 -10z',
    curly: 'M-27 -280a9 9 0 1 1 9 -9a11 11 0 1 1 18 -7a11 11 0 1 1 18 7a9 9 0 1 1 9 9q-12 -12 -27 -12t-27 12z',
    thin: 'M-24 -268q-3 -18 7 -28q-3 12 -1 24zM24 -268q3 -18 -7 -28q3 12 1 24z'
  };
  X.person = function (o) {
    var skin = o.skin || '#e8c4a2', hair = o.hair || '#3a2a1c', top = o.top || '#2e6b8f', bot = o.bottom || '#2c2c33', s = '';
    s += '<ellipse cx="0" cy="2" rx="46" ry="8" fill="#000" opacity="' + (o.shadow == null ? 0.22 : o.shadow) + '"/>';
    if (o.legs === 'skirt') s += '<path d="M-17 0v-74h13v74zM4 0v-74h13v74z" fill="' + (o.tights || skin) + '"/><path d="M-33 -66h66l-6 -66h-54z" fill="' + bot + '"/>';
    else s += '<path d="M-20 0v-100h17v100zM3 0v-100h17v100z" fill="' + bot + '"/>';
    s += '<path d="M-24 0h22v7h-26zM2 0h22v7h-22z" fill="' + (o.shoes || '#2a2420') + '"/>';
    if (o.coat) s += '<path d="M-42 -40q-8 -150 42 -200t42 200z" fill="' + o.coat + '"/>';
    s += '<path d="M-38 -94q-7 -138 38 -146t38 146z" fill="' + top + '"/>';
    if (o.apron) s += '<path d="M-24 -96v-96h48v96z" fill="' + o.apron + '"/><path d="M-24 -192l-8 -34M24 -192l8 -34" stroke="' + o.apron + '" stroke-width="4"/>';
    if (o.shirt) s += '<path d="M-9 -238l9 24 9 -24z" fill="' + o.shirt + '"/>';
    if (o.tie) s += '<path d="M-3 -234h6l3 30 -6 9 -6 -9z" fill="' + o.tie + '"/>';
    if (o.badge) s += '<rect x="10" y="-212" width="18" height="8" rx="1" fill="' + o.badge + '"/>';
    s += '<path d="M-34 -204q-15 40 -5 88M34 -204q15 40 5 88" stroke="' + (o.sleeve || o.coat || top) + '" stroke-width="15" fill="none" stroke-linecap="round"/>' +
      '<circle cx="-39" cy="-112" r="8" fill="' + skin + '"/><circle cx="39" cy="-112" r="8" fill="' + skin + '"/>';
    s += '<rect x="-7" y="-256" width="14" height="20" fill="' + skin + '"/><circle cx="0" cy="-274" r="24" fill="' + skin + '"/>';
    if (o.back) s += '<circle cx="0" cy="-277" r="24.5" fill="' + hair + '"/>';
    else {
      if (o.style && HAIR[o.style]) s += '<path d="' + HAIR[o.style] + '" fill="' + hair + '"/>';
      s += '<path d="M-11 -273h7M4 -273h7" stroke="#2a2420" stroke-width="2.6" stroke-linecap="round"/><path d="M-6 -260q6 ' + (o.smile == null ? 3 : o.smile) + ' 12 0" stroke="#8c4a3c" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      if (o.glasses) s += '<path d="M-15 -272h11M4 -272h11" stroke="' + o.glasses + '" stroke-width="2.2"/><path d="M-15 -272q5 6 11 0M4 -272q5 6 11 0" stroke="' + o.glasses + '" stroke-width="2" fill="none"/>';
    }
    if (o.cap) s += '<path d="M-27 -284q27 -26 54 0q-4 -6 -27 -9t-27 9zM20 -286l18 4" stroke="' + o.cap + '" stroke-width="5" fill="' + o.cap + '"/>';
    if (o.hat) s += '<path d="M-24 -290h48v-12q-24 -12 -48 0z" fill="' + o.hat + '"/>';
    if (o.extra) s += o.extra;
    return s;
  };
  X.PEOPLE = {
    delacour: { skin: '#efd2b8', hair: '#bdb8b0', style: 'bob', top: '#26304a', sleeve: '#26304a', bottom: '#26304a', legs: 'skirt', tights: '#3a3a44', shirt: '#f2efe6', glasses: '#8a6a2a' },
    yuki: { skin: '#f0d6b8', hair: '#141214', style: 'pony', top: '#7a1f2b', sleeve: '#f4f1ea', bottom: '#22222a', shirt: '#f4f1ea', badge: '#e8c45a' },
    ellwood: { skin: '#ecc7a8', hair: '#d8d4cc', style: 'thin', top: '#7a6a4a', bottom: '#4a4438', shirt: '#e8e2d0', tie: '#6a2a2a', cap: '#8a7a56' },
    wanda: { skin: '#e9b897', hair: '#a3422a', style: 'curly', top: '#3a7a5a', sleeve: '#3a7a5a', bottom: '#2a3a34', apron: '#f2e6c8' },
    ursula: { skin: '#efd0b8', hair: '#e8e4dc', style: 'bun', top: '#9a5a8a', sleeve: '#9a5a8a', bottom: '#4a4a5a', legs: 'skirt', tights: '#6a6a74', shirt: '#f4eee4', glasses: '#4a3a4a' },
    rook: { skin: '#e6c09c', hair: '#4a3a30', style: 'short', top: '#55504a', bottom: '#2a2a30', coat: '#3a3a40', shirt: '#d8d0c0', tie: '#2a4a3a' },
    pathak: { skin: '#9c6a48', hair: '#1a1412', style: 'short', top: '#f4f1ea', sleeve: '#f4f1ea', bottom: '#5a5a5a', apron: '#e8e2d4', hat: '#f4f1ea', shoes: '#f4f1ea' }
  };
  X.who = function (name, more) {
    var o = {}, k, base = X.PEOPLE[name];
    for (k in base) o[k] = base[k];
    for (k in (more || {})) o[k] = more[k];
    return X.person(o);
  };
  /* somebody in a queue, small and plain: feet at 0 0, about 90 high; dir 1 faces right, -1 left */
  X.small = function (x, y, c, h, dir, bag) {
    var s = '<g transform="translate(' + x + ' ' + y + ')"><path d="M-9 0v-30h7v30zM2 0v-30h7v30z" fill="#3a3a44"/><path d="M-13 -28q-2 -40 13 -44t13 44z" fill="' + c + '"/>' +
      '<circle cx="0" cy="-80" r="9" fill="#e6c4a4"/><path d="M-9 -83q0 -11 9 -11t9 11z" fill="' + h + '"/><circle cx="' + (dir * 4) + '" cy="-80" r="1.5" fill="#2a2420"/>';
    if (bag) s += '<rect x="' + (dir > 0 ? 8 : -20) + '" y="-46" width="12" height="16" rx="2" fill="#e8dcc0" stroke="#a08a60"/>';
    return s + '</g>';
  };

  /* ---------- the same people as busts, for the interviews (240 x 300) ---------- */
  var BUST = {
    delacour: { bg: '#26304a', skin: '#efd2b8', hair: '#bdb8b0', style: 'bob', top: '#26304a', shirt: '#f2efe6', half: '#8a6a2a', pearls: 1 },
    yuki: { bg: '#7a1f2b', skin: '#f0d6b8', hair: '#141214', style: 'pony', top: '#7a1f2b', shirt: '#f4f1ea', badge: 1, pen: 1 },
    ellwood: { bg: '#6a5a3a', skin: '#ecc7a8', hair: '#d8d4cc', style: 'thin', top: '#7a6a4a', shirt: '#e8e2d0', tie: '#6a2a2a', cap: '#8a7a56', brows: 1 },
    wanda: { bg: '#3a7a5a', skin: '#e9b897', hair: '#a3422a', style: 'curly', top: '#3a7a5a', apron: '#f2e6c8' },
    ursula: { bg: '#9a5a8a', skin: '#efd0b8', hair: '#e8e4dc', style: 'bun', top: '#9a5a8a', shirt: '#f4eee4', glasses: '#4a3a4a' },
    rook: { bg: '#3a3a40', skin: '#e6c09c', hair: '#4a3a30', style: 'short', top: '#3a3a40', shirt: '#d8d0c0', tie: '#2a4a3a', grey: 1, brows: 1 },
    pathak: { bg: '#c08a3a', skin: '#9c6a48', hair: '#1a1412', style: 'short', top: '#f4f1ea', hat: '#f4f1ea', flour: 1 }
  };
  var BHAIR = {
    pony: 'M64 120q0 -70 56 -72t56 72q-14 -34 -56 -36t-56 36zM168 76q46 4 40 92q-14 -16 -18 -48q-8 -20 -22 -26z',
    short: 'M64 116q0 -66 56 -68t56 68q-14 -30 -56 -32t-56 32z',
    bun: 'M64 118q0 -68 56 -70t56 70q-14 -32 -56 -34t-56 34zM98 42a22 22 0 1 1 44 0a22 22 0 1 1 -44 0z',
    bob: 'M60 124q-2 -76 60 -78t60 78q-16 -36 -60 -38t-60 38zM58 118q-8 40 4 64h18q-10 -26 -6 -60zM182 118q8 40 -4 64h-18q10 -26 6 -60z',
    curly: 'M58 118a18 18 0 1 1 14 -30a22 22 0 1 1 30 -26a22 22 0 1 1 36 0a22 22 0 1 1 30 26a18 18 0 1 1 14 30q-30 -34 -62 -34t-62 34z',
    thin: 'M62 128q-6 -34 12 -54q-4 22 -2 48zM178 128q6 -34 -12 -54q4 22 2 48z'
  };
  X.face = function (name, mood) {
    var o = BUST[name], s = '', sm = mood === 'smile' ? 10 : mood === 'cross' ? -7 : 3;
    s += '<svg viewBox="0 0 240 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><rect x="-200" y="-200" width="640" height="500" fill="' + o.bg + '"/><circle cx="196" cy="54" r="80" fill="#fff" opacity=".1"/>';
    s += '<path d="M14 300q8 -96 106 -104q98 8 106 104z" fill="' + o.top + '"/>';
    if (o.shirt) s += '<path d="M98 200l22 40 22 -40z" fill="' + o.shirt + '"/>';
    if (o.apron) s += '<path d="M70 300v-84q50 -14 100 0v84z" fill="' + o.apron + '"/><path d="M84 214l-14 -22M156 214l14 -22" stroke="' + o.apron + '" stroke-width="7"/>';
    if (o.tie) s += '<path d="M113 204h14l6 58 -13 16 -13 -16z" fill="' + o.tie + '"/>';
    if (o.badge) s += '<rect x="150" y="236" width="40" height="14" rx="2" fill="#e8c45a"/><path d="M156 243h28" stroke="#7a1f2b" stroke-width="2"/>';
    if (o.pearls) s += '<g fill="#f4f0e4">' + [0, 1, 2, 3, 4, 5, 6].map(function (k) { return '<circle cx="' + (96 + k * 8) + '" cy="' + (206 + Math.abs(k - 3) * -2 + 6) + '" r="3.4"/>'; }).join('') + '</g>';
    s += '<rect x="104" y="164" width="32" height="36" fill="' + o.skin + '"/>';
    s += '<ellipse cx="120" cy="120" rx="54" ry="62" fill="' + o.skin + '"/><ellipse cx="66" cy="126" rx="8" ry="13" fill="' + o.skin + '"/><ellipse cx="174" cy="126" rx="8" ry="13" fill="' + o.skin + '"/>';
    s += '<path d="' + BHAIR[o.style] + '" fill="' + o.hair + '"/>';
    if (o.grey) s += '<path d="M66 118q4 -20 12 -26M174 118q-4 -20 -12 -26" stroke="#b8b0a4" stroke-width="5" fill="none"/>';
    if (o.cap) s += '<path d="M58 92q62 -50 124 0q-20 -8 -62 -10t-62 10z" fill="' + o.cap + '"/><path d="M60 92q60 -12 140 6q-20 -18 -78 -18" fill="' + o.cap + '" stroke="#5a4a30" stroke-width="2"/>';
    if (o.hat) s += '<path d="M62 96h116v-30q-58 -26 -116 0z" fill="' + o.hat + '" stroke="#d8d2c4" stroke-width="3"/>';
    s += '<path d="M90 ' + (o.brows ? 102 : 106) + 'q10 ' + (o.brows ? -2 : -6) + ' 20 0M130 ' + (o.brows ? 102 : 106) + 'q10 ' + (o.brows ? -2 : -6) + ' 20 0" stroke="#3a2a20" stroke-width="' + (o.brows ? 5 : 3.5) + '" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="122" rx="5" ry="6.5" fill="#2a2420"/><ellipse cx="140" cy="122" rx="5" ry="6.5" fill="#2a2420"/><circle cx="102" cy="120" r="1.6" fill="#fff"/><circle cx="142" cy="120" r="1.6" fill="#fff"/>' +
      '<path d="M120 128q-5 14 2 18" stroke="#8a5a40" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M104 156q16 ' + sm + ' 32 0" stroke="#8c3a32" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="88" cy="146" rx="9" ry="5" fill="#e88a7a" opacity=".3"/><ellipse cx="152" cy="146" rx="9" ry="5" fill="#e88a7a" opacity=".3"/>';
    if (o.glasses) s += '<g fill="none" stroke="' + o.glasses + '" stroke-width="3"><circle cx="100" cy="122" r="15"/><circle cx="140" cy="122" r="15"/><path d="M115 120h10M85 118l-18 -4M155 118l18 -4"/></g>';
    if (o.half) s += '<g fill="none" stroke="' + o.half + '" stroke-width="3"><path d="M84 128h32q-2 12 -16 12t-16 -12zM124 128h32q-2 12 -16 12t-16 -12zM116 130h8M84 128l-18 -6M156 128l18 -6"/></g>';
    if (o.pen) s += '<path d="M60 74l20 40" stroke="#1f3a8a" stroke-width="5" stroke-linecap="round"/>';
    if (o.flour) s += '<g fill="#fff" opacity=".7"><circle cx="150" cy="146" r="5"/><circle cx="158" cy="140" r="3"/><circle cx="96" cy="250" r="7"/><circle cx="110" cy="262" r="4"/></g>';
    return s + '</svg>';
  };
  return X;
})();
