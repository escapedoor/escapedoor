/* Five Minutes of Questioning - what every room shares: a few sounds, small helpers, and the people of the Haverleigh
   imitation game (standing in the scene, and as busts for the interviews). Loaded after engine.js. Nothing in here
   knows an answer. */
window.IM = (function () {
  'use strict';
  var X = {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds: keys, relays, paper. No bells and no alarms: in this story a bell and an alarm are evidence. ---------- */
  X.sfx = {
    key: function () { B({ dur: 0.022, f: 2600 + Math.random() * 900, q: 3, peak: 0.1 }); },
    keys: function (n) { for (var i = 0; i < (n || 6); i++) B({ dur: 0.02, f: 2400 + Math.random() * 1200, q: 3, peak: 0.08, when: i * (0.07 + Math.random() * 0.06) }); },
    tty: function (n) { for (var i = 0; i < (n || 10); i++) { B({ dur: 0.03, f: 1500 + (i % 3) * 300, q: 2, peak: 0.1, when: i * 0.1 }); T({ f: 95, dur: 0.04, peak: 0.05, when: i * 0.1 }); } },
    flap: function () { B({ dur: 0.04, f: 1300, q: 2, peak: 0.14 }); B({ dur: 0.03, f: 900, q: 2, peak: 0.1, when: 0.05 }); },
    relay: function () { T({ f: 240, f2: 180, dur: 0.05, peak: 0.12 }); B({ dur: 0.02, f: 4200, q: 4, peak: 0.08 }); },
    pin: function () { B({ dur: 0.025, f: 4200, q: 4, peak: 0.12 }); },
    tap: function () { B({ dur: 0.018, f: 3000, q: 3, peak: 0.08 }); },
    cup: function () { T({ f: 1900, dur: 0.18, peak: 0.04 }); T({ f: 2850, dur: 0.12, peak: 0.02 }); },
    stamp: function () { T({ f: 130, f2: 80, dur: 0.12, peak: 0.3 }); B({ dur: 0.04, f: 1200, q: 1, peak: 0.16 }); }
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
  X.mine = function (id, title, html, quiet) { return ER.addClue(id, title, '<h4>' + title + '</h4>' + html, 'im-mine', 'Your notes', quiet); };
  X.terms = function (list) {
    var G = window.GLOSS || [];
    list.forEach(function (w) { for (var i = 0; i < G.length; i++) if (G[i][0] === w) { ER.addWord(G[i][0], G[i][1]); break; } });
  };
  X.minutesPlayed = function () {
    var st = ER.state();
    if (st.fin && st.fin.secs) return Math.max(1, Math.round(st.fin.secs / 60));
    return Math.max(1, Math.round((Date.now() - (st.t0 || Date.now())) / 60000));
  };
  /* a lock that lives in an overlay: o = {cls, html, init(box, msg)} */
  X.lock = function (cls, html, init) {
    var box = ER.el('div', 'pz ' + cls);
    box.innerHTML = html + '<div class="pz-foot"><p class="pmsg"></p><button type="button" class="btn pz-go"></button></div>';
    var m = box.querySelector('.pmsg');
    function msg(t) { m.innerHTML = ER.gloss(t); }
    init(box, msg);
    return { box: box, open: function () { ER.open('ov-lock', box); }, isOpen: function () { return !!box.parentNode; } };
  };

  /* ---------- people, standing: feet at 0 0, about 300 high ---------- */
  var HAIR = {
    crop: 'M-23 -281q2 -23 23 -23t23 23q-10 -7 -23 -7t-23 7z',
    bald: 'M-25 -268q-1 -9 3 -15q4 6 4 15zM25 -268q1 -9 -3 -15q-4 6 -4 15z',
    bun: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM-9 -311a10 10 0 1 1 18 0a10 10 0 1 1 -18 0z',
    bob: 'M-27 -246q-6 -60 27 -62q33 2 27 62q-6 -2 -8 -8q2 -24 -19 -30q-21 6 -19 30q-2 6 -8 8z',
    grey: 'M-26 -256q-4 -52 26 -52t26 52q-6 -6 -6 -14q-2 -22 -20 -24q-18 2 -20 24q0 8 -6 14z',
    fringe: 'M-27 -244q-6 -64 27 -64q33 0 27 64q-5 -2 -6 -8l-1 -24q-20 4 -40 -2l-1 26q-1 6 -6 8z',
    curls: 'M-28 -262q-8 -46 28 -48q38 2 28 48q-4 -8 -8 -6q2 -14 -8 -16q-4 -10 -12 -4q-8 -6 -12 4q-10 2 -8 16q-4 -2 -8 6z'
  };
  X.person = function (o) {
    var skin = o.skin || '#e8c4a2', hair = o.hair || '#3a2a1c', top = o.top || '#2e6b8f', bot = o.bottom || '#2c2f38', s = '';
    s += '<ellipse cx="0" cy="3" rx="48" ry="8" fill="#000" opacity="' + (o.shadow == null ? 0.22 : o.shadow) + '"/>';
    if (o.skirt) s += '<path d="M-16 0v-74h12v74zM4 0v-74h12v74z" fill="' + (o.tights || '#2c2a33') + '"/><path d="M-32 -68h64l-7 -62h-50z" fill="' + o.skirt + '"/>';
    else s += '<path d="M-21 0l1 -102h17l-1 102zM4 0l-1 -102h17l1 102z" fill="' + bot + '"/>';
    s += '<path d="M-25 0h23v7h-27zM2 0h23l2 7h-25z" fill="' + (o.shoes || '#1d1f24') + '"/>';
    if (o.coat) s += '<path d="M-43 -46q-6 -146 43 -196t43 196z" fill="' + o.coat + '"/>';
    s += '<path d="M-38 -96q-7 -136 38 -144t38 144z" fill="' + top + '"/>';
    if (o.apron) s += '<path d="M-26 -60v-120q26 -12 52 0v120z" fill="' + o.apron + '"/>';
    if (o.coat) s += '<path d="M-38 -62q-4 -128 22 -174l14 30v144zM38 -62q4 -128 -22 -174l-14 30v144z" fill="' + o.coat + '"/>';
    if (o.collar) s += '<path d="M-14 -238q14 8 28 0v6q-14 8 -28 0z" fill="#1a1a1e"/><rect x="-5" y="-236" width="10" height="7" fill="#fff"/>';
    if (o.lanyard) s += '<path d="M-14 -236l14 70l14 -70" fill="none" stroke="' + o.lanyard + '" stroke-width="3"/><rect x="-9" y="-170" width="18" height="24" rx="2" fill="#fff"/>';
    if (o.scarf) s += '<path d="M-20 -238q20 14 40 0l2 12q-22 14 -44 0z" fill="' + o.scarf + '"/><path d="M8 -230l6 46h-12z" fill="' + o.scarf + '"/>';
    var sl = o.sleeve || o.coat || top;
    s += '<path d="M-34 -204q-16 40 -6 88M34 -204q16 40 6 88" stroke="' + sl + '" stroke-width="15" fill="none" stroke-linecap="round"/>';
    s += '<circle cx="-40" cy="-112" r="8" fill="' + skin + '"/><circle cx="40" cy="-112" r="8" fill="' + skin + '"/>';
    s += '<rect x="-7" y="-256" width="14" height="20" fill="' + skin + '"/><circle cx="0" cy="-274" r="24" fill="' + skin + '"/>';
    if (o.style && HAIR[o.style]) s += '<path d="' + HAIR[o.style] + '" fill="' + hair + '"/>';
    if (o.cap) s += '<path d="M-26 -282q4 -26 30 -24q22 2 24 22z" fill="' + o.cap + '"/><path d="M14 -286q16 0 22 6l-22 2z" fill="' + o.cap + '"/>';
    s += '<path d="M-11 -273h7M4 -273h7" stroke="#2a2420" stroke-width="2.6" stroke-linecap="round"/>';
    if (o.tache) s += '<path d="M-12 -262q12 -8 24 0q-6 4 -12 2q-6 2 -12 -2z" fill="' + o.tache + '"/>';
    s += '<path d="M-6 -258q6 ' + (o.smile == null ? 3 : o.smile) + ' 12 0" stroke="#8c4a3c" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    if (o.glasses) s += '<circle cx="-8" cy="-273" r="7" fill="none" stroke="' + o.glasses + '" stroke-width="2"/><circle cx="8" cy="-273" r="7" fill="none" stroke="' + o.glasses + '" stroke-width="2"/>';
    if (o.chain) s += '<path d="M-15 -272q-6 30 6 40M15 -272q6 30 -6 40" fill="none" stroke="#a8822a" stroke-width="1.2" stroke-dasharray="2 2"/>';
    if (o.extra) s += o.extra;
    return s;
  };
  X.PEOPLE = {
    hazel: { skin: '#f0d8c6', hair: '#d8d4cc', style: 'bob', top: '#5a7a5a', coat: '#3f5a46', skirt: '#4a4048', glasses: '#a8822a', chain: 1, smile: 2 },
    gately: { skin: '#eac0a4', hair: '#7a3a2a', style: 'bun', top: '#f0e6f0', coat: '#7a3a8a', bottom: '#2a2430', glasses: '#c8302a', lanyard: '#e8b020', smile: 5 },
    rohan: { skin: '#9a6440', hair: '#1a1210', style: 'crop', top: '#2a3a6a', bottom: '#22242a', smile: 3 },
    georgie: { skin: '#f4dccb', hair: '#c4622a', style: 'curls', top: '#3a7a5a', bottom: '#2a2c33', smile: 0 },
    jiwoo: { skin: '#f0d4b8', hair: '#141016', style: 'fringe', top: '#e8e2d4', coat: '#b8946a', bottom: '#2a2a32', scarf: '#8a2a3a', smile: 0 },
    norman: { skin: '#e8b8a0', hair: '#d0ccc4', style: 'grey', top: '#8a6a4a', bottom: '#3a3a40', tache: '#c0bab0', smile: 4 },
    sowden: { skin: '#e6c0a4', hair: '#9a948c', style: 'grey', top: '#1e1e24', bottom: '#1e1e24', collar: 1, glasses: '#3a3a3a', smile: 2 },
    lorraine: { skin: '#f0d4c0', hair: '#e0c070', style: 'bob', top: '#2a2a30', coat: '#b8282e', bottom: '#2a2a30', smile: 1 },
    bianchi: { skin: '#d8a888', hair: '#3a2a22', style: 'bald', top: '#f4f0e8', apron: '#2a2a2a', bottom: '#2a2a2a', tache: '#3a2a22', smile: 4 }
  };
  X.who = function (name, more) {
    var o = {}, k, base = X.PEOPLE[name];
    for (k in base) o[k] = base[k];
    for (k in (more || {})) o[k] = more[k];
    return X.person(o);
  };
  /* somebody far off: just a shape */
  X.figure = function (x, y, sc, col, head) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ')"><path d="M-30 0q0 -70 30 -74q30 4 30 74z" fill="' + col + '"/><circle cx="0" cy="-90" r="19" fill="' + head + '"/></g>';
  };

  /* ---------- the same people as busts, for the interviews (240 x 300) ---------- */
  var BUST = {
    hazel: { bg: '#2e4a3a', skin: '#f0d8c6', hair: '#d8d4cc', style: 'bob', top: '#3f5a46', shirt: '#e8e2d2', glasses: '#a8822a', chain: 1 },
    gately: { bg: '#4a2a52', skin: '#eac0a4', hair: '#7a3a2a', style: 'bun', top: '#7a3a8a', shirt: '#f0e6f0', glasses: '#c8302a', lanyard: '#e8b020' },
    rohan: { bg: '#1e2a48', skin: '#9a6440', hair: '#1a1210', style: 'crop', top: '#2a3a6a', shirt: '#d8dce8' },
    georgie: { bg: '#24402e', skin: '#f4dccb', hair: '#c4622a', style: 'curls', top: '#3a7a5a', shirt: '#f0ece0', freckles: 1 },
    jiwoo: { bg: '#3a2a22', skin: '#f0d4b8', hair: '#141016', style: 'fringe', top: '#b8946a', shirt: '#e8e2d4', scarf: '#8a2a3a' },
    norman: { bg: '#4a3a2a', skin: '#e8b8a0', hair: '#d0ccc4', style: 'grey', top: '#8a6a4a', shirt: '#e8e0d0', tache: '#c0bab0' },
    sowden: { bg: '#2a2a34', skin: '#e6c0a4', hair: '#9a948c', style: 'grey', top: '#1e1e24', collar: 1, glasses: '#3a3a3a' },
    lorraine: { bg: '#3a1a1e', skin: '#f0d4c0', hair: '#e0c070', style: 'bob', top: '#b8282e', shirt: '#2a2a30' }
  };
  var BHAIR = {
    crop: 'M64 112q0 -62 56 -64t56 64q-14 -26 -56 -28t-56 28z',
    bun: 'M64 118q0 -68 56 -70t56 70q-14 -32 -56 -34t-56 34zM100 40a20 20 0 1 1 40 0a20 20 0 1 1 -40 0z',
    bob: 'M56 176q-14 -128 64 -132q78 4 64 132q-12 -4 -16 -18q4 -54 -48 -66q-52 12 -48 66q-4 14 -16 18z',
    grey: 'M60 150q-10 -100 60 -102q70 2 60 102q-8 -10 -10 -26q-4 -44 -50 -48q-46 4 -50 48q-2 16 -10 26z',
    fringe: 'M56 180q-14 -136 64 -136q78 0 64 136q-12 -4 -14 -18l-2 -70q-48 12 -96 0l-2 70q-2 14 -14 18z',
    curls: 'M54 150q-16 -110 66 -112q84 2 66 112q-8 -18 -18 -14q4 -30 -16 -34q-8 -22 -32 -10q-24 -12 -32 10q-20 4 -16 34q-10 -4 -18 14z'
  };
  X.face = function (name, mood) {
    var o = BUST[name], s = '', sm = mood === 'smile' ? 10 : mood === 'cross' ? -6 : mood === 'sad' ? -3 : 3;
    s += '<svg viewBox="0 0 240 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><rect x="-200" y="-200" width="640" height="500" fill="' + o.bg + '"/><circle cx="40" cy="60" r="90" fill="#fff" opacity=".06"/>';
    s += '<path d="M14 300q8 -96 106 -104q98 8 106 104z" fill="' + o.top + '"/>';
    if (o.shirt) s += '<path d="M96 200l24 40 24 -40z" fill="' + o.shirt + '"/>';
    if (o.collar) s += '<path d="M92 198q28 14 56 0v10q-28 14 -56 0z" fill="#111"/><rect x="112" y="200" width="16" height="12" fill="#fff"/>';
    if (o.scarf) s += '<path d="M78 196q42 24 84 0l4 22q-46 26 -92 0z" fill="' + o.scarf + '"/><path d="M130 210l12 80h-22z" fill="' + o.scarf + '"/>';
    if (o.lanyard) s += '<path d="M88 200l32 80l32 -80" fill="none" stroke="' + o.lanyard + '" stroke-width="5"/>';
    s += '<rect x="104" y="164" width="32" height="36" fill="' + o.skin + '"/>';
    s += '<ellipse cx="120" cy="120" rx="54" ry="62" fill="' + o.skin + '"/><ellipse cx="66" cy="126" rx="8" ry="13" fill="' + o.skin + '"/><ellipse cx="174" cy="126" rx="8" ry="13" fill="' + o.skin + '"/>';
    s += '<path d="' + BHAIR[o.style] + '" fill="' + o.hair + '"/>';
    s += '<path d="M90 104q10 -6 20 0M130 104q10 -6 20 0" stroke="#3a2a20" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="122" rx="5" ry="6.5" fill="#2a2420"/><ellipse cx="140" cy="122" rx="5" ry="6.5" fill="#2a2420"/><circle cx="102" cy="120" r="1.6" fill="#fff"/><circle cx="142" cy="120" r="1.6" fill="#fff"/>' +
      '<path d="M120 128q-5 14 2 18" stroke="#9a6a4a" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    if (o.freckles) s += '<g fill="#c88a5a" opacity=".7"><circle cx="92" cy="138" r="1.8"/><circle cx="99" cy="142" r="1.6"/><circle cx="86" cy="143" r="1.5"/><circle cx="146" cy="138" r="1.8"/><circle cx="153" cy="142" r="1.6"/><circle cx="140" cy="143" r="1.5"/></g>';
    if (o.tache) s += '<path d="M96 150q24 -16 48 0q-12 8 -24 4q-12 4 -24 -4z" fill="' + o.tache + '"/>';
    s += '<path d="M104 160q16 ' + sm + ' 32 0" stroke="#8c3a32" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    if (o.glasses) s += '<g fill="none" stroke="' + o.glasses + '" stroke-width="3"><circle cx="100" cy="121" r="15"/><circle cx="140" cy="121" r="15"/><path d="M115 120h10M85 118l-18 -4M155 118l18 -4"/></g>';
    if (o.chain) s += '<path d="M67 116q-10 60 30 84M173 116q10 60 -30 84" fill="none" stroke="#a8822a" stroke-width="1.6" stroke-dasharray="2 3"/>';
    return s + '</svg>';
  };
  return X;
})();
