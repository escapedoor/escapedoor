/* Everybody Thinks So - what every room shares: a few sounds, small helpers, and the people of Gorsey and Crickmore
   (standing in the scene, and as busts for the interviews). Loaded after engine.js. Nothing in here knows an answer. */
window.FD = (function () {
  'use strict';
  var X = {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds. No pings and no chimes: in a story about a phone app, those would sound like notifications. ---------- */
  X.sfx = {
    pen: function () { B({ type: 'highpass', f: 2600, dur: 0.07, peak: 0.07 }); },
    pin: function () { B({ dur: 0.025, f: 4200, q: 4, peak: 0.12 }); },
    chalk: function () { B({ type: 'bandpass', f: 3400, q: 1.5, dur: 0.12, peak: 0.08, a: 0.01 }); B({ type: 'bandpass', f: 2800, q: 1.5, dur: 0.08, peak: 0.05, when: 0.1 }); },
    tray: function () { T({ f: 210, f2: 150, dur: 0.12, peak: 0.16 }); B({ dur: 0.04, f: 1800, q: 2, peak: 0.08 }); },
    flip: function () { B({ dur: 0.03, f: 2200, q: 2, peak: 0.14 }); B({ dur: 0.03, f: 1600, q: 2, peak: 0.1, when: 0.05 }); },
    tap: function () { B({ dur: 0.018, f: 3000, q: 3, peak: 0.08 }); },
    switch: function () { T({ f: 320, f2: 260, dur: 0.05, peak: 0.12 }); B({ dur: 0.02, f: 3600, q: 3, peak: 0.08 }); },
    howl: function () { T({ type: 'sine', f: 1180, f2: 1320, dur: 1.4, peak: 0.035, a: 0.9 }); },
    pock: function () { T({ f: 900, f2: 700, dur: 0.05, peak: 0.12 }); }
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
  X.mine = function (id, title, html, quiet) { return ER.addClue(id, title, '<h4>' + title + '</h4>' + html, 'fd-mine', 'Your notes', quiet); };
  X.terms = function (list) {
    var G = window.GLOSS || [];
    list.forEach(function (w) { for (var i = 0; i < G.length; i++) if (G[i][0] === w) { ER.addWord(G[i][0], G[i][1]); break; } });
  };
  X.minutesPlayed = function () {
    var st = ER.state();
    if (st.fin && st.fin.secs) return Math.max(1, Math.round(st.fin.secs / 60));
    return Math.max(1, Math.round((Date.now() - (st.t0 || Date.now())) / 60000));
  };

  /* ---------- people, standing: feet at 0 0, about 300 high ----------
     o = {skin, hair, style, top, sleeve, bottom, skirt, coat, apron, glasses, beard, tache, smile, cap, whistle, gloves, extra} */
  var HAIR = {
    plait: 'M-25 -272q0 -34 25 -34t25 34q-9 -16 -25 -16t-25 16zM20 -284q16 8 12 34q-2 14 4 26q-10 2 -14 -10q-6 -18 -2 -50z',
    crop: 'M-23 -281q2 -23 23 -23t23 23q-10 -7 -23 -7t-23 7z',
    bald: 'M-25 -268q-1 -9 3 -15q4 6 4 15zM25 -268q1 -9 -3 -15q-4 6 -4 15z',
    bun: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM-9 -311a10 10 0 1 1 18 0a10 10 0 1 1 -18 0z',
    mess: 'M-27 -270q-4 -40 27 -40q34 0 28 40q-6 -12 -10 -8q-4 -12 -10 -6q-4 -10 -10 -4q-6 -8 -10 2q-6 -6 -8 6q-4 0 -7 10z',
    bob: 'M-27 -246q-6 -60 27 -62q33 2 27 62q-6 -2 -8 -8q2 -24 -19 -30q-21 6 -19 30q-2 6 -8 8z',
    grey: 'M-26 -256q-4 -52 26 -52t26 52q-6 -6 -6 -14q-2 -22 -20 -24q-18 2 -20 24q0 8 -6 14z'
  };
  X.person = function (o) {
    var skin = o.skin || '#e8c4a2', hair = o.hair || '#3a2a1c', top = o.top || '#2e6b8f', bot = o.bottom || '#2c2f38', s = '';
    s += '<ellipse cx="0" cy="3" rx="48" ry="8" fill="#000" opacity="' + (o.shadow == null ? 0.22 : o.shadow) + '"/>';
    if (o.skirt) s += '<path d="M-16 0v-74h12v74zM4 0v-74h12v74z" fill="' + (o.tights || '#2c2a33') + '"/><path d="M-32 -68h64l-7 -62h-50z" fill="' + o.skirt + '"/>';
    else s += '<path d="M-21 0l1 -102h17l-1 102zM4 0l-1 -102h17l1 102z" fill="' + bot + '"/>';
    s += '<path d="M-25 0h23v7h-27zM2 0h23l2 7h-25z" fill="' + (o.shoes || '#1d1f24') + '"/>';
    if (o.coat) s += '<path d="M-43 -46q-6 -146 43 -196t43 196z" fill="' + o.coat + '"/>';
    s += '<path d="M-38 -96q-7 -136 38 -144t38 144z" fill="' + top + '"/>';
    if (o.apron) s += '<path d="M-26 -60v-120q26 -12 52 0v120z" fill="' + o.apron + '"/><path d="M-26 -176q26 -30 52 0" fill="none" stroke="' + o.apron + '" stroke-width="5"/>';
    if (o.coat) s += '<path d="M-38 -62q-4 -128 22 -174l14 30v144zM38 -62q4 -128 -22 -174l-14 30v144z" fill="' + o.coat + '"/>';
    if (o.whistle) s += '<path d="M-14 -236q14 40 28 0" fill="none" stroke="#c9ccd2" stroke-width="2"/><rect x="-4" y="-200" width="10" height="7" rx="2" fill="#c9ccd2"/>';
    var sl = o.sleeve || o.coat || top;
    s += '<path d="M-34 -204q-16 40 -6 88M34 -204q16 40 6 88" stroke="' + sl + '" stroke-width="15" fill="none" stroke-linecap="round"/>';
    if (o.gloves) s += '<circle cx="-40" cy="-111" r="11" fill="' + o.gloves + '"/><circle cx="40" cy="-111" r="11" fill="' + o.gloves + '"/>';
    else s += '<circle cx="-40" cy="-112" r="8" fill="' + skin + '"/><circle cx="40" cy="-112" r="8" fill="' + skin + '"/>';
    s += '<rect x="-7" y="-256" width="14" height="20" fill="' + skin + '"/><circle cx="0" cy="-274" r="24" fill="' + skin + '"/>';
    if (o.style && HAIR[o.style]) s += '<path d="' + HAIR[o.style] + '" fill="' + hair + '"/>';
    if (o.cap) s += '<path d="M-26 -282q4 -26 30 -24q22 2 24 22z" fill="' + o.cap + '"/><path d="M14 -286q16 0 22 6l-22 2z" fill="' + o.cap + '"/>';
    if (o.beard) s += '<path d="M-22 -270q2 30 22 32q20 -2 22 -32q-6 14 -22 14t-22 -14z" fill="' + o.beard + '"/>';
    s += '<path d="M-11 -273h7M4 -273h7" stroke="#2a2420" stroke-width="2.6" stroke-linecap="round"/>';
    if (o.tache) s += '<path d="M-12 -262q12 -8 24 0q-6 4 -12 2q-6 2 -12 -2z" fill="' + o.tache + '"/>';
    s += '<path d="M-6 -258q6 ' + (o.smile == null ? 3 : o.smile) + ' 12 0" stroke="#8c4a3c" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    if (o.glasses) s += '<circle cx="-8" cy="-273" r="7" fill="none" stroke="' + o.glasses + '" stroke-width="2"/><circle cx="8" cy="-273" r="7" fill="none" stroke="' + o.glasses + '" stroke-width="2"/>';
    if (o.extra) s += o.extra;
    return s;
  };
  X.PEOPLE = {
    freya: { skin: '#f3dccb', hair: '#b5512a', style: 'plait', top: '#e8b62c', coat: '#e8b62c', bottom: '#2c3440', glasses: '#2a2a2a', smile: 1 },
    ade: { skin: '#6e4329', hair: '#1a1210', style: 'crop', beard: '#1a1210', top: '#3f7a4a', bottom: '#2a2c33', smile: 2 },
    ken: { skin: '#eab99a', hair: '#a59a8e', style: 'bald', top: '#7a8aa0', apron: '#f4f1ea', bottom: '#3a3a40', tache: '#8a7e72', smile: -2 },
    isla: { skin: '#f0d0b8', hair: '#d8b860', style: 'bun', top: '#b8282e', bottom: '#1f2330', whistle: 1, smile: 0 },
    jamie: { skin: '#cf9a72', hair: '#3a2616', style: 'mess', top: '#c8d43a', bottom: '#1d2a20', gloves: '#2a6a3a', smile: -2 },
    clare: { skin: '#f2dccb', hair: '#c9c4bc', style: 'bob', top: '#2f7f86', skirt: '#4a3a48', glasses: '#a8822a', smile: 2 },
    gordon: { skin: '#e8c4a8', hair: '#8a8480', style: 'bald', top: '#d6cdb8', coat: '#7a5a3a', bottom: '#3a3428', cap: '#4a4a3a', tache: '#9a9490' },
    lyn: { skin: '#8a5a3c', hair: '#2a2220', style: 'bob', top: '#7a3a6a', skirt: '#2a2830', glasses: '#d8c070', smile: 1 },
    elaine: { skin: '#f0d6c4', hair: '#e8e4de', style: 'grey', top: '#8a3a4a', coat: '#4a6a8a', skirt: '#3a3a44', smile: 0 }
  };
  X.who = function (name, more) {
    var o = {}, k, base = X.PEOPLE[name];
    for (k in base) o[k] = base[k];
    for (k in (more || {})) o[k] = more[k];
    return X.person(o);
  };
  /* somebody in the audience, seen from behind or from far off: just a shape */
  X.figure = function (x, y, sc, col, head) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')"><path d="M-30 0q0 -70 30 -74q30 4 30 74z" fill="' + col + '"/><circle cx="0" cy="-90" r="19" fill="' + head + '"/></g>';
  };

  /* ---------- the same people as busts, for the interviews (240 x 300) ---------- */
  var BUST = {
    freya: { bg: '#3a4a3a', skin: '#f3dccb', hair: '#b5512a', style: 'plait', top: '#e8b62c', shirt: '#2c3440', glasses: '#2a2a2a', pen: 1 },
    ade: { bg: '#2c4a36', skin: '#6e4329', hair: '#1a1210', style: 'crop', top: '#3f7a4a', shirt: '#e8e2d2', beard: '#1a1210' },
    ken: { bg: '#5a4a3a', skin: '#eab99a', hair: '#a59a8e', style: 'bald', top: '#f4f1ea', shirt: '#7a8aa0', tache: '#8a7e72', flour: 1 },
    isla: { bg: '#3a2228', skin: '#f0d0b8', hair: '#d8b860', style: 'bun', top: '#b8282e', shirt: '#f2f2f2', whistle: 1 },
    jamie: { bg: '#24382a', skin: '#cf9a72', hair: '#3a2616', style: 'mess', top: '#c8d43a', shirt: '#2a6a3a' },
    clare: { bg: '#1e2c44', skin: '#f2dccb', hair: '#c9c4bc', style: 'bob', top: '#2f7f86', shirt: '#f0ece4', glasses: '#a8822a', chain: 1 },
    gordon: { bg: '#3a3428', skin: '#e8c4a8', hair: '#8a8480', style: 'bald', top: '#7a5a3a', shirt: '#d6cdb8', cap: '#4a4a3a', tache: '#9a9490' }
  };
  var BHAIR = {
    plait: 'M62 118q0 -74 58 -76t58 76q-14 -36 -58 -38t-58 36zM166 84q22 30 16 90q-2 30 10 50q-18 2 -24 -20q-8 -40 -16 -100z',
    crop: 'M64 112q0 -62 56 -64t56 64q-14 -26 -56 -28t-56 28z',
    bald: 'M64 132q-4 -24 6 -40q8 18 8 40zM176 132q4 -24 -6 -40q-8 18 -8 40z',
    bun: 'M64 118q0 -68 56 -70t56 70q-14 -32 -56 -34t-56 34zM100 40a20 20 0 1 1 40 0a20 20 0 1 1 -40 0z',
    mess: 'M58 132q-10 -92 62 -92q74 0 64 92q-8 -24 -18 -18q-6 -26 -20 -14q-8 -20 -24 -8q-12 -16 -22 4q-14 -10 -18 10q-12 0 -24 26z',
    bob: 'M56 176q-14 -128 64 -132q78 4 64 132q-12 -4 -16 -18q4 -54 -48 -66q-52 12 -48 66q-4 14 -16 18z'
  };
  X.face = function (name, mood) {
    var o = BUST[name], s = '', sm = mood === 'smile' ? 10 : mood === 'cross' ? -6 : 3;
    s += '<svg viewBox="0 0 240 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><rect x="-200" y="-200" width="640" height="500" fill="' + o.bg + '"/><circle cx="40" cy="60" r="90" fill="#fff" opacity=".06"/>';
    s += '<path d="M14 300q8 -96 106 -104q98 8 106 104z" fill="' + o.top + '"/>';
    if (o.shirt) s += '<path d="M96 200l24 40 24 -40z" fill="' + o.shirt + '"/>';
    if (o.flour) s += '<g fill="#fff" opacity=".55"><circle cx="70" cy="250" r="6"/><circle cx="84" cy="270" r="4"/><circle cx="160" cy="262" r="5"/></g>';
    s += '<rect x="104" y="164" width="32" height="36" fill="' + o.skin + '"/>';
    s += '<ellipse cx="120" cy="120" rx="54" ry="62" fill="' + o.skin + '"/><ellipse cx="66" cy="126" rx="8" ry="13" fill="' + o.skin + '"/><ellipse cx="174" cy="126" rx="8" ry="13" fill="' + o.skin + '"/>';
    s += '<path d="' + BHAIR[o.style] + '" fill="' + o.hair + '"/>';
    if (o.cap) s += '<path d="M60 96q4 -56 62 -56q54 0 58 50z" fill="' + o.cap + '"/><path d="M150 84q36 0 50 12l-50 4z" fill="' + o.cap + '"/>';
    if (o.beard) s += '<path d="M68 130q4 64 52 68q48 -4 52 -68q-12 30 -52 30t-52 -30z" fill="' + o.beard + '"/>';
    s += '<path d="M90 104q10 -6 20 0M130 104q10 -6 20 0" stroke="#3a2a20" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="122" rx="5" ry="6.5" fill="#2a2420"/><ellipse cx="140" cy="122" rx="5" ry="6.5" fill="#2a2420"/><circle cx="102" cy="120" r="1.6" fill="#fff"/><circle cx="142" cy="120" r="1.6" fill="#fff"/>' +
      '<path d="M120 128q-5 14 2 18" stroke="#9a6a4a" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    if (o.tache) s += '<path d="M96 150q24 -16 48 0q-12 8 -24 4q-12 4 -24 -4z" fill="' + o.tache + '"/>';
    s += '<path d="M104 160q16 ' + sm + ' 32 0" stroke="#8c3a32" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    if (o.glasses) s += '<g fill="none" stroke="' + o.glasses + '" stroke-width="3"><circle cx="100" cy="121" r="15"/><circle cx="140" cy="121" r="15"/><path d="M115 120h10M85 118l-18 -4M155 118l18 -4"/></g>';
    if (o.chain) s += '<path d="M67 116q-10 60 30 84M173 116q10 60 -30 84" fill="none" stroke="#a8822a" stroke-width="1.6" stroke-dasharray="2 3"/>';
    if (o.whistle) s += '<path d="M92 200q28 50 56 0" fill="none" stroke="#d8dce2" stroke-width="3"/><rect x="112" y="238" width="18" height="12" rx="3" fill="#d8dce2"/>';
    if (o.pen) s += '<rect x="172" y="70" width="8" height="44" rx="3" fill="#2a6ad0" transform="rotate(-20 176 92)"/><rect x="60" y="70" width="8" height="44" rx="3" fill="#d03a2a" transform="rotate(20 64 92)"/>';
    return s + '</svg>';
  };
  return X;
})();
