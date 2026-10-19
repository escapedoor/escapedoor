/* Squeezed - what every room of the story shares: a few sounds, small helpers, the people (standing in the scene,
   and as busts for the interviews), lemons and coins, and the chalk dial that most of the locks are set with.
   Loaded after engine.js. Nothing in here knows an answer. */
window.STALL = (function () {
  'use strict';
  var X = {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds (through the engine, so that the sound button switches them) ---------- */
  X.sfx = {
    coin: function () { T({ f: 2400, dur: 0.18, peak: 0.07 }); T({ f: 3610, dur: 0.12, peak: 0.04, when: 0.01 }); B({ dur: 0.02, f: 6000, q: 3, peak: 0.08 }); },
    coins: function () { for (var i = 0; i < 4; i++) T({ f: 2100 + i * 380, dur: 0.12, peak: 0.05, when: i * 0.06 }); },
    chalk: function () { B({ type: 'bandpass', f: 3200, f2: 2200, q: 3, dur: 0.12, peak: 0.07, a: 0.01 }); },
    tick: function () { B({ dur: 0.02, f: 3600, q: 4, peak: 0.12 }); },
    slip: function () { B({ type: 'highpass', f: 2600, dur: 0.14, peak: 0.08, a: 0.02 }); },
    ice: function () { for (var i = 0; i < 3; i++) T({ f: 1900 + i * 520, dur: 0.09, peak: 0.05, when: i * 0.05 }); },
    thud: function () { T({ f: 140, f2: 70, dur: 0.16, peak: 0.4 }); B({ type: 'lowpass', f: 700, dur: 0.06, peak: 0.25 }); }
  };
  /* A door opens. The music answers in the room's own key, as it does after ER.exit; without music, three plain notes. */
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
  /* money as it is written in the story: 40p, £2.50, -80p */
  X.money = function (p) {
    var neg = p < 0, a = Math.abs(p), s;
    s = a < 100 ? a + 'p' : '£' + (a / 100).toFixed(2);
    return (neg ? '−' : '') + s;
  };

  /* ---------- the chalk dial: a number that goes up and down ----------
     node: an empty element. o = {min, max, step, val, fmt(v), change(v), big}. Click the arrows, or turn the mouse wheel over it. */
  X.dial = function (node, o) {
    var v = o.val == null ? o.min : o.val;
    node.classList.add('dl');
    node.innerHTML = '<button type="button" class="dl-up" aria-label="up">&#9650;</button><b></b><button type="button" class="dl-dn" aria-label="down">&#9660;</button>';
    var out = node.querySelector('b');
    function paint() { out.textContent = o.fmt ? o.fmt(v) : String(v); }
    function set(n, quiet) {
      n = Math.max(o.min, Math.min(o.max, n));
      if (n === v) return;
      v = n; paint(); if (!quiet) X.sfx.chalk(); if (o.change) o.change(v);
    }
    node.querySelector('.dl-up').addEventListener('click', function (e) { e.stopPropagation(); if (o.lock && o.lock()) return; set(v + (o.step || 1)); });
    node.querySelector('.dl-dn').addEventListener('click', function (e) { e.stopPropagation(); if (o.lock && o.lock()) return; set(v - (o.step || 1)); });
    node.addEventListener('wheel', function (e) { e.preventDefault(); if (o.lock && o.lock()) return; set(v + (e.deltaY < 0 ? 1 : -1) * (o.step || 1)); }, { passive: false });
    paint();
    return { get: function () { return v; }, set: function (n) { set(n, true); paint(); }, node: node };
  };

  /* ---------- things that turn up everywhere ---------- */
  X.lemon = function (x, y, r, rot) {
    r = r || 14;
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ')"><ellipse rx="' + r + '" ry="' + (r * 0.78).toFixed(1) + '" fill="#f6d32b" stroke="#c79a12" stroke-width="1.6"/>' +
      '<path d="M' + r + ' 0l' + (r * 0.3).toFixed(1) + ' -2v4z" fill="#c79a12"/><ellipse cx="' + (-r * 0.35).toFixed(1) + '" cy="' + (-r * 0.3).toFixed(1) + '" rx="' + (r * 0.3).toFixed(1) + '" ry="' + (r * 0.16).toFixed(1) + '" fill="#fff6a8" opacity=".7"/></g>';
  };
  X.slice = function (x, y, r) {
    var s = '<g transform="translate(' + x + ' ' + y + ')"><circle r="' + r + '" fill="#f2c21b"/><circle r="' + (r * 0.84).toFixed(1) + '" fill="#fff4a0"/>', i, a;
    for (i = 0; i < 8; i++) { a = i * Math.PI / 4; s += '<path d="M0 0L' + (Math.cos(a) * r * 0.8).toFixed(1) + ' ' + (Math.sin(a) * r * 0.8).toFixed(1) + '" stroke="#f2c21b" stroke-width="' + (r * 0.09).toFixed(1) + '"/>'; }
    return s + '<circle r="' + (r * 0.12).toFixed(1) + '" fill="#f2c21b"/></g>';
  };
  X.bunting = function (x1, y1, x2, y2, sag, n, cols) {
    var s = '<path d="M' + x1 + ' ' + y1 + 'Q' + ((x1 + x2) / 2) + ' ' + ((y1 + y2) / 2 + sag * 2) + ' ' + x2 + ' ' + y2 + '" fill="none" stroke="#5a4a3a" stroke-width="2"/>', i, t, x, y, mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag * 2;
    for (i = 0; i < n; i++) {
      t = (i + 0.5) / n;
      x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2; y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2;
      s += '<path d="M' + (x - 13).toFixed(0) + ' ' + y.toFixed(0) + 'L' + (x + 13).toFixed(0) + ' ' + y.toFixed(0) + 'L' + x.toFixed(0) + ' ' + (y + 30).toFixed(0) + 'z" fill="' + cols[i % cols.length] + '"/>';
    }
    return s;
  };

  /* ---------- people, standing: feet at 0 0, about 300 high ----------
     o = {skin, hair, style, top, bottom, legs: 'trousers' | 'skirt' | 'shorts', shirt, tie, apron, sleeve, extra, face: false} */
  var HAIR = {
    short: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13z',
    long: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM-25 -282q-9 36 -3 70h11q-6 -34 -2 -56zM25 -282q9 36 3 70h-11q6 -34 2 -56z',
    bob: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM-24 -282q-7 24 -2 40h9q-4 -20 -1 -32zM24 -282q7 24 2 40h-9q4 -20 1 -32z',
    bun: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM-11 -308a11 11 0 1 1 22 0a11 11 0 1 1 -22 0z',
    pony: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM20 -294q24 2 22 44q-9 -6 -11 -24q-6 -8 -13 -10z',
    curly: 'M-27 -280a9 9 0 1 1 9 -9a11 11 0 1 1 18 -7a11 11 0 1 1 18 7a9 9 0 1 1 9 9q-12 -12 -27 -12t-27 12z',
    tuft: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM-6 -302l4 -12 4 9 6 -10 2 12z',
    thin: 'M-24 -268q-3 -18 7 -28q-3 12 -1 24zM24 -268q3 -18 -7 -28q3 12 1 24z',
    wrap: 'M-26 -278q0 -32 26 -32t26 32q-8 -8 -26 -8t-26 8zM-26 -282q-4 -14 6 -24q20 -12 40 0q10 10 6 24z'
  };
  X.person = function (o) {
    var skin = o.skin || '#e8c4a2', hair = o.hair || '#3a2a1c', top = o.top || '#2e6b8f', bot = o.bottom || '#2c2c33', s = '';
    s += '<ellipse cx="0" cy="2" rx="46" ry="8" fill="#000" opacity="' + (o.shadow == null ? 0.22 : o.shadow) + '"/>';
    if (o.legs === 'skirt') s += '<path d="M-17 0v-74h13v74zM4 0v-74h13v74z" fill="' + skin + '"/><path d="M-33 -66h66l-6 -66h-54z" fill="' + bot + '"/>';
    else if (o.legs === 'shorts') s += '<path d="M-19 0v-70h15v70zM4 0v-70h15v70z" fill="' + skin + '"/><path d="M-22 -60h20v-40h-20zM2 -60h20v-40h-20z" fill="' + bot + '"/>';
    else s += '<path d="M-20 0v-100h17v100zM3 0v-100h17v100z" fill="' + bot + '"/>';
    s += '<path d="M-24 0h22v7h-26zM2 0h22v7h-22z" fill="' + (o.shoes || '#f2f0ea') + '"/>';
    if (o.style === 'afro') s += '<circle cx="0" cy="-282" r="32" fill="' + hair + '"/>';
    s += '<path d="M-38 -94q-7 -138 38 -146t38 146z" fill="' + top + '"/>';
    if (o.apron) s += '<path d="M-24 -96v-96h48v96z" fill="' + o.apron + '"/><path d="M-24 -192l-8 -34M24 -192l8 -34" stroke="' + o.apron + '" stroke-width="4"/>';
    if (o.face !== false && o.shirt) s += '<path d="M-9 -238l9 24 9 -24z" fill="' + o.shirt + '"/>';
    if (o.tie) s += '<path d="M-3 -234h6l3 30 -6 9 -6 -9z" fill="' + o.tie + '"/>';
    s += '<path d="M-34 -204q-15 40 -5 88M34 -204q15 40 5 88" stroke="' + (o.sleeve || top) + '" stroke-width="15" fill="none" stroke-linecap="round"/>' +
      '<circle cx="-39" cy="-112" r="8" fill="' + skin + '"/><circle cx="39" cy="-112" r="8" fill="' + skin + '"/>';
    s += '<rect x="-7" y="-256" width="14" height="20" fill="' + skin + '"/><circle cx="0" cy="-274" r="24" fill="' + skin + '"/>';
    if (o.face === false) s += '<circle cx="0" cy="-277" r="24.5" fill="' + hair + '"/>';
    else {
      if (o.style && HAIR[o.style]) s += '<path d="' + HAIR[o.style] + '" fill="' + hair + '"/>';
      s += '<path d="M-11 -273h7M4 -273h7" stroke="#2a2420" stroke-width="2.6" stroke-linecap="round"/><path d="M-6 -260q6 ' + (o.smile == null ? 4 : o.smile) + ' 12 0" stroke="#8c4a3c" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      if (o.glasses) s += '<circle cx="-8" cy="-273" r="7" fill="none" stroke="' + o.glasses + '" stroke-width="2"/><circle cx="8" cy="-273" r="7" fill="none" stroke="' + o.glasses + '" stroke-width="2"/>';
    }
    if (o.extra) s += o.extra;
    return s;
  };
  X.PEOPLE = {
    kit: { skin: '#f1cfb0', hair: '#c4672a', style: 'pony', top: '#f6d32b', sleeve: '#f6d32b', bottom: '#2f4a3a', shirt: '#fff', apron: '#3a8a4a', shoes: '#fff' },
    rory: { skin: '#f1cfb0', hair: '#c4672a', style: 'tuft', top: '#2e6b8f', bottom: '#2c3a4a', legs: 'shorts', shirt: '#fff' },
    tomasz: { skin: '#f3d9c4', hair: '#e2c88a', style: 'short', top: '#ffffff', sleeve: '#ffffff', bottom: '#3a3f47', shirt: '#fff', tie: '#3a8a4a', glasses: '#2a2c33' },
    rosa: { skin: '#c99a72', hair: '#1c120c', style: 'bun', top: '#1f8a86', sleeve: '#1f8a86', bottom: '#f2efe6', legs: 'shorts', shirt: '#f2efe6', apron: '#f2efe6' },
    cheung: { skin: '#e8c8a8', hair: '#2a2420', style: 'wrap', top: '#ffffff', sleeve: '#ffffff', bottom: '#2c2c33', apron: '#3a6fa8', shoes: '#2a2c33' },
    lucia: { skin: '#d9a77c', hair: '#4a2a1a', style: 'long', top: '#2f8ac9', sleeve: '#2f8ac9', bottom: '#2c3a4a', shirt: '#fff' },
    okonjo: { skin: '#7a4a2e', hair: '#15110f', style: 'wrap', top: '#c2185b', sleeve: '#c2185b', bottom: '#2a2233', legs: 'skirt', shirt: '#f1dfc8', shoes: '#2a2c33' },
    petrie: { skin: '#efcdb0', hair: '#c9c4bc', style: 'thin', top: '#d9d4c4', sleeve: '#d9d4c4', bottom: '#5a5a52', shirt: '#fff', tie: '#a3242a', shoes: '#4a3a2a', glasses: '#4a4a4a' }
  };
  X.who = function (name, more) {
    var o = {}, k, base = X.PEOPLE[name];
    for (k in base) o[k] = base[k];
    for (k in (more || {})) o[k] = more[k];
    return X.person(o);
  };

  /* ---------- the same people as busts, for the interviews (240 x 300) ---------- */
  var BUST = {
    kit: { bg: '#3a8a4a', skin: '#f1cfb0', hair: '#c4672a', style: 'pony', top: '#f6d32b', apron: '#2f6b3a', freckles: 1, chalk: 1 },
    rory: { bg: '#2e6b8f', skin: '#f1cfb0', hair: '#c4672a', style: 'tuft', top: '#2e6b8f', freckles: 1, lolly: 1 },
    tomasz: { bg: '#5a6470', skin: '#f3d9c4', hair: '#e2c88a', style: 'short', top: '#ffffff', tie: '#3a8a4a', glasses: '#2a2c33' },
    rosa: { bg: '#1f8a86', skin: '#c99a72', hair: '#1c120c', style: 'bun', top: '#1f8a86', apron: '#f2efe6', ear: '#f6d32b' },
    cheung: { bg: '#3a6fa8', skin: '#e8c8a8', hair: '#2a2420', style: 'wrap', top: '#ffffff', apron: '#3a6fa8', cap: '#ffffff' },
    lucia: { bg: '#2f8ac9', skin: '#d9a77c', hair: '#4a2a1a', style: 'long', top: '#2f8ac9', cap: '#ffffff' },
    okonjo: { bg: '#c2185b', skin: '#7a4a2e', hair: '#15110f', style: 'wrap', top: '#c2185b', wrapc: '#f6d32b', glasses: '#1a1a1a' },
    petrie: { bg: '#a3242a', skin: '#efcdb0', hair: '#c9c4bc', style: 'thin', top: '#d9d4c4', tie: '#a3242a', glasses: '#4a4a4a', hat: '#e9dfb8' }
  };
  var BHAIR = {
    pony: 'M64 120q0 -70 56 -72t56 72q-14 -34 -56 -36t-56 36zM168 76q46 4 40 92q-14 -16 -18 -48q-8 -20 -22 -26z',
    tuft: 'M64 116q0 -66 56 -68t56 68q-14 -30 -56 -32t-56 32zM104 52l6 -26 10 20 12 -22 4 26z',
    short: 'M64 116q0 -66 56 -68t56 68q-14 -30 -56 -32t-56 32z',
    bun: 'M64 118q0 -68 56 -70t56 70q-14 -32 -56 -34t-56 34zM98 42a22 22 0 1 1 44 0a22 22 0 1 1 -44 0z',
    long: 'M64 118q0 -68 56 -70t56 70q-14 -32 -56 -34t-56 34zM60 112q-14 80 -2 150h28q-14 -70 -8 -140zM180 112q14 80 2 150h-28q14 -70 8 -140z',
    wrap: 'M58 116q-4 -76 62 -78t62 78q-18 -22 -62 -24t-62 24z',
    thin: 'M62 128q-6 -34 12 -54q-4 22 -2 48zM178 128q6 -34 -12 -54q4 22 2 48z'
  };
  X.face = function (name, mood) {
    var o = BUST[name], s = '', sm = mood === 'smile' ? 10 : mood === 'cross' ? -6 : 3;
    s += '<svg viewBox="0 0 240 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><rect x="-200" y="-200" width="640" height="500" fill="' + o.bg + '"/><circle cx="196" cy="54" r="80" fill="#fff" opacity=".1"/>';
    s += '<path d="M14 300q8 -96 106 -104q98 8 106 104z" fill="' + o.top + '"/>';
    if (o.apron) s += '<path d="M70 300v-84q50 -14 100 0v84z" fill="' + o.apron + '"/><path d="M84 214l-14 -22M156 214l14 -22" stroke="' + o.apron + '" stroke-width="7"/>';
    if (o.tie) s += '<path d="M112 200h16l6 60 -14 18 -14 -18z" fill="' + o.tie + '"/>';
    s += '<rect x="104" y="164" width="32" height="36" fill="' + o.skin + '"/>';
    if (o.style === 'long') s += '<path d="M60 112q-14 80 -2 150h28q-14 -70 -8 -140zM180 112q14 80 2 150h-28q14 -70 8 -140z" fill="' + o.hair + '"/>';
    s += '<ellipse cx="120" cy="120" rx="54" ry="62" fill="' + o.skin + '"/><ellipse cx="66" cy="126" rx="8" ry="13" fill="' + o.skin + '"/><ellipse cx="174" cy="126" rx="8" ry="13" fill="' + o.skin + '"/>';
    if (o.style === 'wrap') s += '<path d="' + BHAIR.wrap + '" fill="' + (o.wrapc || o.hair) + '"/>';
    else if (o.style !== 'long') s += '<path d="' + BHAIR[o.style] + '" fill="' + o.hair + '"/>';
    else s += '<path d="M64 118q0 -68 56 -70t56 70q-14 -32 -56 -34t-56 34z" fill="' + o.hair + '"/>';
    if (o.cap) s += '<path d="M66 90q54 -40 108 0v-14q-54 -30 -108 0z" fill="' + o.cap + '" stroke="#d9d9d9" stroke-width="2"/>';
    if (o.hat) s += '<path d="M44 84q76 -16 152 0q-10 8 -24 8q-4 -44 -52 -46t-52 46q-14 0 -24 -8z" fill="' + o.hat + '"/><path d="M68 76h104" stroke="#a3242a" stroke-width="7"/>';
    s += '<path d="M90 106q10 -6 20 0M130 106q10 -6 20 0" stroke="#3a2a20" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="122" rx="5" ry="6.5" fill="#2a2420"/><ellipse cx="140" cy="122" rx="5" ry="6.5" fill="#2a2420"/><circle cx="102" cy="120" r="1.6" fill="#fff"/><circle cx="142" cy="120" r="1.6" fill="#fff"/>' +
      '<path d="M120 128q-5 14 2 18" stroke="#b07a5a" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M104 156q16 ' + sm + ' 32 0" stroke="#8c3a32" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="88" cy="146" rx="9" ry="5" fill="#e88a7a" opacity=".35"/><ellipse cx="152" cy="146" rx="9" ry="5" fill="#e88a7a" opacity=".35"/>';
    if (o.freckles) s += '<g fill="#b0603a" opacity=".55"><circle cx="92" cy="138" r="1.6"/><circle cx="99" cy="141" r="1.6"/><circle cx="86" cy="142" r="1.4"/><circle cx="148" cy="138" r="1.6"/><circle cx="141" cy="141" r="1.6"/><circle cx="154" cy="142" r="1.4"/></g>';
    if (o.glasses) s += '<g fill="none" stroke="' + o.glasses + '" stroke-width="3"><circle cx="100" cy="122" r="15"/><circle cx="140" cy="122" r="15"/><path d="M115 120h10M85 118l-18 -4M155 118l18 -4"/></g>';
    if (o.chalk) s += '<path d="M124 132l10 2" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>';
    if (o.ear) s += '<circle cx="66" cy="142" r="4" fill="' + o.ear + '"/><circle cx="174" cy="142" r="4" fill="' + o.ear + '"/>';
    if (o.lolly) s += '<path d="M150 170l40 -24" stroke="#fff" stroke-width="5"/><rect x="176" y="112" width="30" height="44" rx="12" fill="#e2453a" transform="rotate(-30 191 134)"/>';
    return s + '</svg>';
  };
  return X;
})();
