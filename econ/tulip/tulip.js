/* Trading in Wind - what every room of the story shares: a few sounds, small helpers, the people of Dykesend
   (standing in the scene, and as busts for the interviews), a tulip drawn in SVG, and the number drum that several
   locks are set with. Loaded after engine.js. Nothing in here knows an answer. */
window.TULIP = (function () {
  'use strict';
  var X = {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds (through the engine, so that the sound button switches them) ---------- */
  X.sfx = {
    gavel: function () { T({ f: 180, f2: 90, dur: 0.12, peak: 0.45 }); B({ type: 'lowpass', f: 1400, dur: 0.05, peak: 0.35 }); },
    drum: function () { B({ dur: 0.025, f: 2600, q: 5, peak: 0.1 }); T({ f: 420, dur: 0.04, peak: 0.05 }); },
    chalk: function () { B({ type: 'highpass', f: 4200, dur: 0.18, peak: 0.06, a: 0.02 }); B({ type: 'highpass', f: 5200, dur: 0.1, peak: 0.05, when: 0.16 }); },
    pin: function () { T({ f: 1900, dur: 0.06, peak: 0.06 }); B({ dur: 0.02, f: 5000, q: 3, peak: 0.08 }); },
    snip: function () { B({ dur: 0.03, f: 6000, q: 4, peak: 0.14 }); B({ dur: 0.03, f: 4800, q: 4, peak: 0.12, when: 0.07 }); },
    glass: function () { T({ f: 1760, dur: 0.3, peak: 0.05 }); T({ f: 2640, dur: 0.2, peak: 0.03 }); },
    splash: function () { B({ type: 'lowpass', f: 900, f2: 300, dur: 0.4, peak: 0.18, a: 0.01 }); },
    moo: function () { T({ type: 'sawtooth', f: 140, f2: 110, dur: 0.9, peak: 0.03, a: 0.2 }); }
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
  X.pounds = function (n) { return '£' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); };

  /* ---------- the number drum: a row of wheels, one for each figure ----------
     node: an empty element. o = {digits, sep (commas), before, after, val, change(v), lock()}.
     Click above or below a figure, or turn the mouse wheel over it. */
  X.drum = function (node, o) {
    var n = o.digits || 3, dig = [], i, v = Math.max(0, Math.round(o.val || 0)), s = '';
    for (i = n - 1; i >= 0; i--) { dig[i] = v % 10; v = Math.floor(v / 10); }
    node.classList.add('dr');
    if (o.before) s += '<span class="dr-fix">' + o.before + '</span>';
    for (i = 0; i < n; i++) {
      var left = n - i;
      if (i && o.sep && left % 3 === 0) s += '<span class="dr-fix dr-pt">,</span>';
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

  /* ---------- a tulip, drawn: base of the stem at 0 0, about 150 high.
     o = {cup, flame, pat: 'tiger' | 'feather' | 'plain', seed (for the feathered break: every flower different), stem} */
  X.tulip = function (o) {
    var cup = o.cup || '#c8202a', fl = o.flame || '#f2c02a', s = '';
    s += '<path d="M0 0V-96" stroke="' + (o.stem || '#3f7a3a') + '" stroke-width="5"/>';
    s += '<path d="M0 -10q-34 -20 -30 -70q18 26 30 52z" fill="#4f8a44"/><path d="M0 -24q30 -16 28 -62q-16 24 -28 46z" fill="#5a9a4c"/>';
    s += '<path d="M-26 -100q-6 -40 10 -56q10 12 16 8q6 4 16 -8q16 16 10 56q-8 14 -26 14t-26 -14z" fill="' + cup + '"/>';
    if (o.pat === 'tiger') {
      s += '<path d="M-14 -96q-6 -26 2 -50q4 22 6 50zM-2 -92q-2 -34 2 -58q6 26 4 58zM10 -96q8 -26 2 -50q-6 22 -8 50z" fill="' + fl + '"/>';
    } else if (o.pat === 'feather') {
      var r = o.seed || 1, i, x, h;
      for (i = 0; i < 6; i++) {
        r = (r * 9301 + 49297) % 233280; x = -20 + i * 8 + (r % 5) - 2; h = 18 + (r % 30);
        s += '<path d="M' + x + ' ' + (-98 + (r % 9)) + 'q' + ((r % 7) - 3) + ' ' + (-h / 2) + ' ' + ((r % 9) - 4) + ' ' + (-h) + '" stroke="' + fl + '" stroke-width="' + (1.5 + (r % 4)) + '" fill="none" stroke-linecap="round"/>';
      }
    }
    s += '<path d="M-26 -100q26 12 52 0" stroke="rgba(0,0,0,.18)" stroke-width="2" fill="none"/>';
    return s;
  };

  /* ---------- people, standing: feet at 0 0, about 300 high ---------- */
  var HAIR = {
    short: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13z',
    bob: 'M-25 -276q2 -30 25 -30t25 30q-10 -12 -25 -12t-25 12zM-25 -282q-7 26 -2 42h10q-4 -22 -1 -34zM25 -282q7 26 2 42h-10q4 -22 1 -34z',
    bun: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM-11 -308a11 11 0 1 1 22 0a11 11 0 1 1 -22 0z',
    plait: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM16 -290q16 20 10 70l-8 -2q4 -40 -10 -60z',
    curly: 'M-27 -280a9 9 0 1 1 9 -9a11 11 0 1 1 18 -7a11 11 0 1 1 18 7a9 9 0 1 1 9 9q-12 -12 -27 -12t-27 12z',
    bald: 'M-24 -268q-3 -14 5 -22q-1 10 0 20zM24 -268q3 -14 -5 -22q1 10 0 20z',
    wave: 'M-26 -272q-2 -34 26 -34t26 30q-14 -18 -26 -10t-26 14z'
  };
  X.person = function (o) {
    var skin = o.skin || '#e8c4a2', hair = o.hair || '#3a2a1c', top = o.top || '#2e6b8f', bot = o.bottom || '#2c2c33', s = '';
    s += '<ellipse cx="0" cy="2" rx="46" ry="8" fill="#000" opacity="' + (o.shadow == null ? 0.22 : o.shadow) + '"/>';
    if (o.legs === 'skirt') s += '<path d="M-17 0v-74h13v74zM4 0v-74h13v74z" fill="' + (o.tights || skin) + '"/><path d="M-33 -66h66l-6 -66h-54z" fill="' + bot + '"/>';
    else s += '<path d="M-20 0v-100h17v100zM3 0v-100h17v100z" fill="' + bot + '"/>';
    s += '<path d="M-24 0h22v7h-26zM2 0h22v7h-22z" fill="' + (o.shoes || '#2a2420') + '"/>';
    if (o.boots) s += '<path d="M-21 0v-34h18v34zM3 0v-34h18v34z" fill="' + o.boots + '"/>';
    if (o.coat) s += '<path d="M-42 -40q-8 -150 42 -200t42 200z" fill="' + o.coat + '"/>';
    s += '<path d="M-38 -94q-7 -138 38 -146t38 146z" fill="' + top + '"/>';
    if (o.apron) s += '<path d="M-24 -96v-96h48v96z" fill="' + o.apron + '"/><path d="M-24 -192l-8 -34M24 -192l8 -34" stroke="' + o.apron + '" stroke-width="4"/>';
    if (o.shirt) s += '<path d="M-9 -238l9 24 9 -24z" fill="' + o.shirt + '"/>';
    if (o.tie) s += '<path d="M-3 -234h6l3 30 -6 9 -6 -9z" fill="' + o.tie + '"/>';
    if (o.scarf) s += '<path d="M-20 -238q20 14 40 0v10q-20 14 -40 0z" fill="' + o.scarf + '"/><path d="M8 -230l6 40h-10z" fill="' + o.scarf + '"/>';
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
    if (o.hat) s += '<path d="M-34 -288h68v-6h-12v-16q-22 -8 -44 0v16h-12z" fill="' + o.hat + '"/>';
    if (o.extra) s += o.extra;
    return s;
  };
  X.PEOPLE = {
    gotobed: { skin: '#efd2b8', hair: '#c8c2b8', style: 'wave', top: '#5a2a3a', sleeve: '#5a2a3a', bottom: '#2a2a30', legs: 'skirt', tights: '#3a3a44', shirt: '#f2efe6', glasses: '#2a2420', scarf: '#c9a24a' },
    pearl: { skin: '#e6b48e', hair: '#2a1a12', style: 'plait', top: '#2f6a6a', sleeve: '#2f6a6a', bottom: '#2a2a3a', shoes: '#c8202a' },
    tebbutt: { skin: '#f0c8a8', hair: '#a8a29a', style: 'bald', top: '#3a4a7a', bottom: '#3a4a7a', coat: '#c8a878', shirt: '#f4f1ea', tie: '#c8202a', smile: 8 },
    sadie: { skin: '#e9b897', hair: '#7a2a1a', style: 'bun', top: '#2a3a2a', sleeve: '#e8dcc0', bottom: '#2a2a2a', apron: '#e8dcc0' },
    ulric: { skin: '#e6c4a2', hair: '#e8e4dc', style: 'bald', top: '#6a5a3a', bottom: '#4a4438', shirt: '#e8e2d0', tie: '#2a4a6a', glasses: '#8a6a2a' },
    maud: { skin: '#d8a882', hair: '#d8d4cc', style: 'short', top: '#4a5a3a', sleeve: '#4a5a3a', bottom: '#3a3a30', boots: '#1f3a24', coat: '#5a6a3a', cap: '#3a3a30' },
    purkiss: { skin: '#efd0b8', hair: '#f0ece4', style: 'bun', top: '#8a5a7a', sleeve: '#8a5a7a', bottom: '#4a4a5a', legs: 'skirt', tights: '#6a6a74', apron: '#7a8a5a', glasses: '#4a3a4a' }
  };
  X.who = function (name, more) {
    var o = {}, k, base = X.PEOPLE[name];
    for (k in base) o[k] = base[k];
    for (k in (more || {})) o[k] = more[k];
    return X.person(o);
  };
  /* somebody small in a crowd: feet at 0 0, about 90 high; dir 1 faces right, -1 left */
  X.small = function (x, y, c, h, dir) {
    return '<g transform="translate(' + x + ' ' + y + ')"><path d="M-9 0v-30h7v30zM2 0v-30h7v30z" fill="#3a3a44"/><path d="M-13 -28q-2 -40 13 -44t13 44z" fill="' + c + '"/>' +
      '<circle cx="0" cy="-80" r="9" fill="#e6c4a4"/><path d="M-9 -83q0 -11 9 -11t9 11z" fill="' + h + '"/><circle cx="' + (dir * 4) + '" cy="-80" r="1.5" fill="#2a2420"/></g>';
  };

  /* ---------- the same people as busts, for the interviews (240 x 300) ---------- */
  var BUST = {
    gotobed: { bg: '#5a2a3a', skin: '#efd2b8', hair: '#c8c2b8', style: 'wave', top: '#5a2a3a', shirt: '#f2efe6', glasses: '#2a2420', scarf: '#c9a24a' },
    pearl: { bg: '#2f6a6a', skin: '#e6b48e', hair: '#2a1a12', style: 'plait', top: '#2f6a6a', pencil: 1 },
    tebbutt: { bg: '#3a4a7a', skin: '#f0c8a8', hair: '#a8a29a', style: 'bald', top: '#c8a878', shirt: '#f4f1ea', tie: '#c8202a', rose: 1 },
    sadie: { bg: '#2a3a2a', skin: '#e9b897', hair: '#7a2a1a', style: 'bun', top: '#2a3a2a', apron: '#e8dcc0' },
    ulric: { bg: '#6a5a3a', skin: '#e6c4a2', hair: '#e8e4dc', style: 'bald', top: '#6a5a3a', shirt: '#e8e2d0', tie: '#2a4a6a', glasses: '#8a6a2a', brows: 1 },
    maud: { bg: '#4a5a3a', skin: '#d8a882', hair: '#d8d4cc', style: 'short', top: '#5a6a3a', cap: '#3a3a30', brows: 1 },
    purkiss: { bg: '#8a5a7a', skin: '#efd0b8', hair: '#f0ece4', style: 'bun', top: '#8a5a7a', apron: '#7a8a5a', glasses: '#4a3a4a' }
  };
  var BHAIR = {
    plait: 'M64 120q0 -70 56 -72t56 72q-14 -34 -56 -36t-56 36zM160 86q34 30 22 150l-16 -4q10 -90 -14 -132z',
    short: 'M64 116q0 -66 56 -68t56 68q-14 -30 -56 -32t-56 32z',
    bun: 'M64 118q0 -68 56 -70t56 70q-14 -32 -56 -34t-56 34zM98 42a22 22 0 1 1 44 0a22 22 0 1 1 -44 0z',
    wave: 'M60 124q-4 -78 60 -80t62 70q-24 -40 -60 -26t-62 36z',
    bald: 'M62 128q-6 -34 12 -54q-4 22 -2 48zM178 128q6 -34 -12 -54q4 22 2 48z'
  };
  X.face = function (name, mood) {
    var o = BUST[name], s = '', sm = mood === 'smile' ? 10 : mood === 'cross' ? -7 : 3;
    s += '<svg viewBox="0 0 240 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><rect x="-200" y="-200" width="640" height="500" fill="' + o.bg + '"/><circle cx="196" cy="54" r="80" fill="#fff" opacity=".1"/>';
    s += '<path d="M14 300q8 -96 106 -104q98 8 106 104z" fill="' + o.top + '"/>';
    if (o.shirt) s += '<path d="M98 200l22 40 22 -40z" fill="' + o.shirt + '"/>';
    if (o.apron) s += '<path d="M70 300v-84q50 -14 100 0v84z" fill="' + o.apron + '"/><path d="M84 214l-14 -22M156 214l14 -22" stroke="' + o.apron + '" stroke-width="7"/>';
    if (o.tie) s += '<path d="M113 204h14l6 58 -13 16 -13 -16z" fill="' + o.tie + '"/>';
    if (o.scarf) s += '<path d="M86 200q34 26 68 0v16q-34 24 -68 0z" fill="' + o.scarf + '"/>';
    if (o.rose) s += '<g transform="translate(58 236)"><path d="M0 0v18" stroke="#3f7a3a" stroke-width="3"/><path d="M-9 -4q-2 -14 4 -18q4 4 5 2q2 2 5 -2q6 4 4 18q-4 5 -9 5t-9 -5z" fill="#c8202a"/><path d="M-4 -6q-1 -9 2 -14M3 -6q1 -9 -1 -14" stroke="#f2c02a" stroke-width="2"/></g>';
    s += '<rect x="104" y="164" width="32" height="36" fill="' + o.skin + '"/>';
    s += '<ellipse cx="120" cy="120" rx="54" ry="62" fill="' + o.skin + '"/><ellipse cx="66" cy="126" rx="8" ry="13" fill="' + o.skin + '"/><ellipse cx="174" cy="126" rx="8" ry="13" fill="' + o.skin + '"/>';
    s += '<path d="' + BHAIR[o.style] + '" fill="' + o.hair + '"/>';
    if (o.cap) s += '<path d="M58 96q62 -50 124 0q-20 -8 -62 -10t-62 10z" fill="' + o.cap + '"/><path d="M60 96q60 -12 140 6q-20 -18 -78 -18" fill="' + o.cap + '" stroke="#2a2a20" stroke-width="2"/>';
    s += '<path d="M90 ' + (o.brows ? 102 : 106) + 'q10 ' + (o.brows ? -2 : -6) + ' 20 0M130 ' + (o.brows ? 102 : 106) + 'q10 ' + (o.brows ? -2 : -6) + ' 20 0" stroke="#3a2a20" stroke-width="' + (o.brows ? 5 : 3.5) + '" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="122" rx="5" ry="6.5" fill="#2a2420"/><ellipse cx="140" cy="122" rx="5" ry="6.5" fill="#2a2420"/><circle cx="102" cy="120" r="1.6" fill="#fff"/><circle cx="142" cy="120" r="1.6" fill="#fff"/>' +
      '<path d="M120 128q-5 14 2 18" stroke="#8a5a40" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M104 156q16 ' + sm + ' 32 0" stroke="#8c3a32" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="88" cy="146" rx="9" ry="5" fill="#e88a7a" opacity=".3"/><ellipse cx="152" cy="146" rx="9" ry="5" fill="#e88a7a" opacity=".3"/>';
    if (o.glasses) s += '<g fill="none" stroke="' + o.glasses + '" stroke-width="3"><circle cx="100" cy="122" r="15"/><circle cx="140" cy="122" r="15"/><path d="M115 120h10M85 118l-18 -4M155 118l18 -4"/></g>';
    if (o.pencil) s += '<path d="M168 70l26 30" stroke="#f2c02a" stroke-width="6" stroke-linecap="round"/><path d="M190 96l6 7" stroke="#2a2420" stroke-width="3"/>';
    return s + '</svg>';
  };
  return X;
})();
