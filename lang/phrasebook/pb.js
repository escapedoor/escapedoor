/* The Verb Comes Last - what every room of the story shares: a few sounds, small helpers, the people (standing in
   the scene, and as busts for the interviews), the player's own Isuvo word list, and the arrow dial.
   Loaded after engine.js. Nothing in here knows an answer.

   Isuvo (the island's language) is always written inside <span class="iv"> (or <text class="iv"> in a drawing),
   so that test.py can find every word of it and check it against the grammar. */
window.PB = (function () {
  'use strict';
  var X = {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  X.sfx = {
    page: function () { B({ type: 'highpass', f: 2200, f2: 4200, dur: 0.22, peak: 0.07, a: 0.04 }); },
    chalk: function () { B({ type: 'bandpass', f: 3200, f2: 2200, q: 3, dur: 0.12, peak: 0.07, a: 0.01 }); },
    snip: function () { B({ type: 'bandpass', f: 5200, q: 5, dur: 0.05, peak: 0.12 }); B({ type: 'bandpass', f: 3800, q: 5, dur: 0.05, peak: 0.1, when: 0.07 }); },
    put: function () { T({ f: 180, f2: 110, dur: 0.12, peak: 0.25 }); B({ type: 'lowpass', f: 900, dur: 0.05, peak: 0.12 }); },
    egg: function () { T({ f: 1400, dur: 0.06, peak: 0.05 }); },
    tile: function () { B({ dur: 0.03, f: 2400, q: 3, peak: 0.12 }); T({ f: 520, dur: 0.05, peak: 0.05 }); },
    mew: function () { T({ type: 'triangle', f: 700, f2: 1050, dur: 0.18, peak: 0.05, a: 0.04 }); T({ type: 'triangle', f: 1050, f2: 620, dur: 0.28, peak: 0.05, when: 0.17 }); }
  };
  /* a lock opens without leaving the room: the music answers in the room's key, or three plain notes */
  X.solved = function (quiet) {
    var sung = false;
    try { sung = !!(ER.music && ER.music() && ER.track && ER.track.sting('solved', null, !!quiet)); } catch (e) {}
    if (!sung && !quiet) ER.sfx.ok();
  };

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
  /* Isuvo inside running text: never underlined by the dictionary */
  X.iv = function (s) { return '<!--nogloss--><span class="iv">' + s + '</span><!--/nogloss-->'; };

  /* ---------- your own word list: the page that replaces the torn ones. It grows by one part a room. ---------- */
  var WL = /*wordlist*/[
    ['On the quay', [
      ['tomo', 'man'], ['neka', 'child'], ['kumo', 'cat'], ['pesa', 'fish'], ['kalo', 'boat'], ['mora', 'market'],
      ['vidi', 'see (vidika: saw)'], ['semi', 'eat'], ['nuru', 'go'], ['tavi', 'take, carry'],
      ['-ta', 'on the one the action is done to (the object)'], ['-ka', 'on a verb: it happened before now (past)'], ['-vi', 'to (moravi: to the market)'],
      ['Tari', 'the fisherman (his name is on his boat)'], ['Lukahemi', 'what the islanders call Philippa'], ['order', 'the verb comes last']]],
    ['At the market', [
      ['bura', 'loaf, bread'], ['pea', 'egg (NOT a pea!)'], ['mela', 'honey'], ['Mela', 'the woman at the stall (her name means honey)'], ['lamo', 'lamp, light'],
      ['vasi', 'big'], ['piko', 'small'], ['une', 'one'], ['tivo', 'two'], ['sami', 'three'], ['pena', 'five'], ['dabi', 'be (somewhere)'],
      ['-li', 'more than one, but never after a number: tivo pea, two eggs'], ['-su', '&rsquo;s, of (kumosu pesa: the cat&rsquo;s fish)'], ['-ko', 'at, in, on'],
      ['kesado', 'the guest house (the sign up the lane)'], ['order', 'a word that describes comes before its noun: vasi pesa, big fish']]],
    ['In the kitchen', [
      ['hemi', 'woman'], ['kesa', 'guest, stranger'], ['do', 'house (kesa + do: guest house)'], ['tamu', 'water'], ['lapi', 'tea'], ['vola', 'drink'], ['tole', 'give'],
      ['naso', 'know'], ['no', 'what (nota: what, as object; noko: at what = where)'], ['novi', 'to what = where to'],
      ['-ne', 'the polite ending; it comes last of all (volakane: drank, politely)'], ['mo-', 'not (monasone: I don&rsquo;t know)'],
      ['luka', 'book, paper'], ['lukado', 'the school (book + house)'], ['Sanu', 'the girl who has the torn pages']]],
    ['At the school', [
      ['tira', 'step, stair'], ['zuli', 'fall'], ['podo', 'foot (one piece: not po + do!)'], ['duma', 'hurt'], ['ari', 'come'],
      ['lamodo', 'lighthouse (lamo + do, light + house)'], ['Lukahemi', 'luka + hemi: the book woman'], ['Naso', 'the teacher (her name means she knows)']]]
  ];
  X.wordlist = function (upto, quiet) {
    var had = ER.flag('wl-n') || 0;
    if (upto <= had) return;                                  /* it only ever grows */
    ER.flag('wl-n', upto);
    var h ='<h4>Your own word list</h4><p class="sm">Worked out from examples, because the real one was torn out.</p>', i;
    for (i = 0; i < upto && i < WL.length; i++) {
      h += '<h5>' + WL[i][0] + '</h5><table>' + WL[i][1].map(function (r) {
        return '<tr><td>' + (r[0] === 'order' ? '<i>order</i>' : '<!--nogloss--><b class="iv">' + r[0] + '</b><!--/nogloss-->') + '</td><td>' + r[1] + '</td></tr>';
      }).join('') + '</table>';
    }
    var st = ER.state(), c = null;
    st.clues.forEach(function (k) { if (k.id === 'wl') c = k; });
    if (c) { c.h = h; ER.persist(true); if (!quiet) ER.toast('Your word list has grown: ' + WL[upto - 1][0].toLowerCase()); return; }
    ER.addClue('wl', 'Your own word list', h, 'wlist', 'Your notes', quiet);
  };

  /* ---------- the arrow dial (for small numbers) ---------- */
  X.dial = function (node, o) {
    var v = o.val == null ? o.min : o.val;
    node.classList.add('dl');
    node.innerHTML = '<button type="button" class="dl-up" aria-label="up">&#9650;</button><b></b><button type="button" class="dl-dn" aria-label="down">&#9660;</button>';
    var out = node.querySelector('b');
    function paint() { out.textContent = o.fmt ? o.fmt(v) : String(v); }
    function set(n) { n = Math.max(o.min, Math.min(o.max, n)); if (n === v) return; v = n; paint(); X.sfx.tile(); if (o.change) o.change(v); }
    node.querySelector('.dl-up').addEventListener('click', function (e) { e.stopPropagation(); if (o.lock && o.lock()) return; set(v + 1); });
    node.querySelector('.dl-dn').addEventListener('click', function (e) { e.stopPropagation(); if (o.lock && o.lock()) return; set(v - 1); });
    paint();
    return { get: function () { return v; }, node: node };
  };

  /* ---------- people, standing: feet at 0 0, about 300 high ---------- */
  var HAIR = {
    short: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13z',
    bob: 'M-25 -272q0 -34 25 -34t25 34l-2 26q-4 -30 -23 -32q-19 2 -23 32z',
    bun: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM-10 -310a10 10 0 1 1 20 0a10 10 0 1 1 -20 0z',
    pony: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM20 -294q24 2 22 44q-9 -6 -11 -24q-6 -8 -13 -10z',
    plaits: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM-26 -272q-8 26 -4 52h8q-2 -24 2 -48zM26 -272q8 26 4 52h-8q2 -24 -2 -48z',
    thin: 'M-24 -268q-3 -18 7 -28q-3 12 -1 24zM24 -268q3 -18 -7 -28q3 12 1 24z',
    none: ''
  };
  X.person = function (o) {
    var skin = o.skin || '#e8c4a2', hair = o.hair || '#3a2a1c', top = o.top || '#2e6b8f', bot = o.bottom || '#2c2c33', s = '';
    s += '<ellipse cx="0" cy="2" rx="46" ry="8" fill="#000" opacity="' + (o.shadow == null ? 0.22 : o.shadow) + '"/>';
    if (o.legs === 'skirt') s += '<path d="M-16 0v-60h12v60zM4 0v-60h12v60z" fill="' + (o.stock || skin) + '"/><path d="M-36 -54h72l-8 -86h-56z" fill="' + bot + '"/>';
    else s += '<path d="M-20 0v-100h17v100zM3 0v-100h17v100z" fill="' + bot + '"/>';
    s += '<path d="M-25 0h23v7h-27zM2 0h23v7h-23z" fill="' + (o.shoes || '#2a2420') + '"/>';
    s += '<path d="M-38 -94q-7 -138 38 -146t38 146z" fill="' + top + '"/>';
    if (o.knit) s += '<path d="M-36 -150h72M-37 -136h74M-35 -122h70" stroke="' + o.knit + '" stroke-width="4" stroke-dasharray="6 4" fill="none"/>';
    if (o.apron) s += '<path d="M-26 -96v-90h52v90z" fill="' + o.apron + '"/><path d="M-26 -186l-6 -34M26 -186l6 -34" stroke="' + o.apron + '" stroke-width="4"/>';
    if (o.shawl) s += '<path d="M-40 -226q40 70 80 0l4 30q-44 70 -88 0z" fill="' + o.shawl + '"/>';
    if (o.coat) s += '<path d="M-3 -236v140" stroke="' + o.coat + '" stroke-width="3"/><circle cx="-10" cy="-200" r="3" fill="' + o.coat + '"/><circle cx="-10" cy="-170" r="3" fill="' + o.coat + '"/><circle cx="-10" cy="-140" r="3" fill="' + o.coat + '"/>';
    if (o.tie) s += '<path d="M-9 -238l9 20 9 -20z" fill="#fff"/><path d="M-3 -232h6l3 30 -6 9 -6 -9z" fill="' + o.tie + '"/>';
    s += '<path d="M-34 -204q-15 40 -5 88M34 -204q15 40 5 88" stroke="' + (o.sleeve || top) + '" stroke-width="15" fill="none" stroke-linecap="round"/>' +
      '<circle cx="-39" cy="-112" r="8" fill="' + skin + '"/><circle cx="39" cy="-112" r="8" fill="' + skin + '"/>';
    s += '<rect x="-7" y="-256" width="14" height="20" fill="' + skin + '"/><circle cx="0" cy="-274" r="24" fill="' + skin + '"/>';
    if (o.back) s += '<circle cx="0" cy="-277" r="24.5" fill="' + hair + '"/>';
    else {
      if (o.style && HAIR[o.style]) s += '<path d="' + HAIR[o.style] + '" fill="' + hair + '"/>';
      s += '<path d="M-11 -273h7M4 -273h7" stroke="#2a2420" stroke-width="2.6" stroke-linecap="round"/><path d="M-6 -260q6 ' + (o.smile == null ? 4 : o.smile) + ' 12 0" stroke="#8c4a3c" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      if (o.beard) s += '<path d="M-22 -270q-2 34 22 40q24 -6 22 -40q-6 14 -22 14t-22 -14z" fill="' + o.beard + '"/><path d="M-6 -259q6 3 12 0" stroke="#5a4a40" stroke-width="2" fill="none"/>';
      if (o.glasses) s += '<circle cx="-8" cy="-273" r="7" fill="none" stroke="' + o.glasses + '" stroke-width="2"/><circle cx="8" cy="-273" r="7" fill="none" stroke="' + o.glasses + '" stroke-width="2"/>';
    }
    if (o.cap) s += '<path d="M-26 -284q2 -26 26 -26t26 26q-26 -8 -52 0z" fill="' + o.cap + '"/><circle cx="0" cy="-312" r="6" fill="' + o.cap + '"/>';
    if (o.peak) s += '<path d="M-24 -288q24 -22 48 0v-8q-24 -18 -48 0z" fill="' + o.peak + '"/><path d="M-2 -288h34q-2 6 -12 7h-22z" fill="#1a1a1a"/><circle cx="0" cy="-298" r="4" fill="#d9b44a"/>';
    if (o.scarf) s += '<path d="M-27 -276q0 -36 27 -36t27 36q-4 10 -6 18q-2 -30 -21 -32q-19 2 -21 32q-2 -8 -6 -18z" fill="' + o.scarf + '"/><path d="M14 -256l14 30l8 -6z" fill="' + o.scarf + '"/>';
    if (o.extra) s += o.extra;
    return s;
  };
  X.PEOPLE = {
    tari: { skin: '#d9a77c', hair: '#8a8a86', style: 'short', top: '#2c4a78', knit: '#4a6a9a', bottom: '#3a3530', beard: '#b9b4ac', cap: '#9a2a22' },
    mela: { skin: '#e2b48c', hair: '#3a2416', style: 'bun', top: '#c26a2a', bottom: '#5a3a28', legs: 'skirt', apron: '#e9d8a8', scarf: '#a3242a', smile: 6 },
    hova: { skin: '#e8c4a8', hair: '#f2efe8', style: 'bun', top: '#2a2428', bottom: '#2a2428', legs: 'skirt', shawl: '#5a2a3a', glasses: '#5a4a3a', smile: 5 },
    naso: { skin: '#c99a72', hair: '#1c120c', style: 'bob', top: '#3a7a5a', sleeve: '#3a7a5a', bottom: '#3a3a42', coat: '#2a5a42' },
    sanu: { skin: '#e2b48c', hair: '#4a2a16', style: 'plaits', top: '#f2c21b', knit: '#e2a41b', bottom: '#2c3a4a', legs: 'skirt', stock: '#2c3a4a', smile: 7 },
    buli: { skin: '#e8c4a2', hair: '#f2f2ee', style: 'thin', top: '#1f2a44', bottom: '#1f2a44', coat: '#d9b44a', beard: '#f2f2ee' },
    philippa: { skin: '#f0d0b8', hair: '#f4f2ee', style: 'bob', top: '#c8302a', sleeve: '#c8302a', bottom: '#3a3f4a', glasses: '#2a2a2a', coat: '#8a1a14', smile: 6 },
    kaplan: { skin: '#f0c8a8', hair: '#8a6a4a', style: 'thin', top: '#4a4f58', sleeve: '#4a4f58', bottom: '#3a3f48', tie: '#a3242a', smile: -3 },
    nakashima: { skin: '#f0d4b8', hair: '#9a9a96', style: 'bob', top: '#9a8ac0', sleeve: '#9a8ac0', bottom: '#4a4a5a', legs: 'skirt', stock: '#4a4a5a', glasses: '#4a3a5a', smile: 5 },
    brennan: { skin: '#f0d0b8', hair: '#2a1a12', style: 'pony', top: '#1f2a44', sleeve: '#1f2a44', bottom: '#1f2a44', peak: '#1f2a44', knit: '#2a3a5a' }
  };
  X.who = function (name, more) {
    var o = {}, k, base = X.PEOPLE[name];
    for (k in base) o[k] = base[k];
    for (k in (more || {})) o[k] = more[k];
    return X.person(o);
  };

  /* ---------- the same people as busts, for the interviews (240 x 300) ---------- */
  var BUST = {
    tari: { bg: '#2c4a78', skin: '#d9a77c', hair: '#8a8a86', top: '#2c4a78', knit: '#4a6a9a', beard: '#b9b4ac', cap: '#9a2a22' },
    mela: { bg: '#c26a2a', skin: '#e2b48c', hair: '#3a2416', top: '#c26a2a', scarf: '#a3242a', apron: '#e9d8a8' },
    hova: { bg: '#5a2a3a', skin: '#e8c4a8', hair: '#f2efe8', top: '#2a2428', shawl: '#5a2a3a', glasses: '#5a4a3a', bun: 1, old: 1 },
    naso: { bg: '#3a7a5a', skin: '#c99a72', hair: '#1c120c', top: '#3a7a5a', bob: 1, chalk: 1 },
    sanu: { bg: '#e2a41b', skin: '#e2b48c', hair: '#4a2a16', top: '#f2c21b', plaits: 1 },
    buli: { bg: '#1f2a44', skin: '#e8c4a2', hair: '#f2f2ee', top: '#1f2a44', beard: '#f2f2ee', old: 1 },
    philippa: { bg: '#8a1a14', skin: '#f0d0b8', hair: '#f4f2ee', top: '#c8302a', glasses: '#2a2a2a', bob: 1, old: 1, chain: 1 },
    kaplan: { bg: '#4a4f58', skin: '#f0c8a8', hair: '#8a6a4a', top: '#4a4f58', tie: '#a3242a', bald: 1 },
    nakashima: { bg: '#6a5a90', skin: '#f0d4b8', hair: '#9a9a96', top: '#9a8ac0', glasses: '#4a3a5a', bob: 1 },
    brennan: { bg: '#1f2a44', skin: '#f0d0b8', hair: '#2a1a12', top: '#1f2a44', peak: 1, knit: '#2a3a5a' }
  };
  X.face = function (name, mood) {
    var o = BUST[name], s = '', sm = mood === 'smile' ? 10 : mood === 'cross' ? -6 : 3;
    s += '<svg viewBox="0 0 240 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><rect x="-200" y="-200" width="640" height="500" fill="' + o.bg + '"/><circle cx="196" cy="54" r="80" fill="#fff" opacity=".1"/>';
    s += '<path d="M14 300q8 -96 106 -104q98 8 106 104z" fill="' + o.top + '"/>';
    if (o.knit) s += '<path d="M30 250h180M24 270h192" stroke="' + o.knit + '" stroke-width="7" stroke-dasharray="10 7"/>';
    if (o.apron) s += '<path d="M70 300v-84q50 -14 100 0v84z" fill="' + o.apron + '"/>';
    if (o.shawl) s += '<path d="M20 300q20 -110 100 -96q80 -14 100 96l-30 0q-10 -60 -70 -66q-60 6 -70 66z" fill="' + o.shawl + '"/>';
    if (o.tie) s += '<path d="M102 196l18 26 18 -26z" fill="#fff"/><path d="M112 204h16l6 56 -14 18 -14 -18z" fill="' + o.tie + '"/>';
    s += '<rect x="104" y="164" width="32" height="36" fill="' + o.skin + '"/>';
    if (o.plaits) s += '<path d="M58 110q-12 70 -4 120h20q-6 -50 0 -110zM182 110q12 70 4 120h-20q6 -50 0 -110z" fill="' + o.hair + '"/><circle cx="64" cy="232" r="7" fill="#c8302a"/><circle cx="176" cy="232" r="7" fill="#c8302a"/>';
    if (o.bob) s += '<path d="M58 120q-4 -76 62 -78t62 78l-6 50q-8 -70 -56 -76q-48 6 -56 76z" fill="' + o.hair + '"/>';
    s += '<ellipse cx="120" cy="120" rx="54" ry="62" fill="' + o.skin + '"/><ellipse cx="66" cy="126" rx="8" ry="13" fill="' + o.skin + '"/><ellipse cx="174" cy="126" rx="8" ry="13" fill="' + o.skin + '"/>';
    if (o.bald) s += '<path d="M64 118q-2 -26 10 -40q-2 20 2 40zM176 118q2 -26 -10 -40q2 20 -2 40z" fill="' + o.hair + '"/>';
    else if (o.bob) s += '<path d="M64 110q4 -60 56 -62t56 62q-20 -30 -56 -32t-56 32z" fill="' + o.hair + '"/>';
    else if (o.scarf) s += '<path d="M56 120q-4 -82 64 -84t64 84q-14 -40 -64 -42t-64 42z" fill="' + o.scarf + '"/><path d="M170 150l26 40l12 -10z" fill="' + o.scarf + '"/>';
    else s += '<path d="M64 116q0 -66 56 -68t56 68q-14 -30 -56 -32t-56 32z" fill="' + o.hair + '"/>';
    if (o.bun) s += '<circle cx="120" cy="50" r="20" fill="' + o.hair + '"/>';
    if (o.cap) s += '<path d="M60 100q2 -64 60 -64t60 64q-60 -16 -120 0z" fill="' + o.cap + '"/><circle cx="120" cy="34" r="10" fill="' + o.cap + '"/><path d="M62 92q58 -14 116 0" stroke="#7a1a14" stroke-width="5" fill="none"/>';
    if (o.peak) s += '<path d="M62 92q58 -50 116 0v-16q-58 -42 -116 0z" fill="#1f2a44"/><path d="M110 92h82q-4 14 -30 16h-52z" fill="#111"/><circle cx="120" cy="66" r="7" fill="#d9b44a"/>';
    s += '<path d="M90 106q10 -6 20 0M130 106q10 -6 20 0" stroke="#3a2a20" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="122" rx="5" ry="6.5" fill="#2a2420"/><ellipse cx="140" cy="122" rx="5" ry="6.5" fill="#2a2420"/><circle cx="102" cy="120" r="1.6" fill="#fff"/><circle cx="142" cy="120" r="1.6" fill="#fff"/>' +
      '<path d="M120 128q-5 14 2 18" stroke="#b07a5a" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    if (o.beard) s += '<path d="M66 128q-4 70 54 76q58 -6 54 -76q-14 34 -54 34t-54 -34z" fill="' + o.beard + '"/><path d="M106 160q14 ' + (sm / 2) + ' 28 0" stroke="#6a5a50" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    else s += '<path d="M104 156q16 ' + sm + ' 32 0" stroke="#8c3a32" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    if (o.old) s += '<path d="M84 98q8 -3 16 -1M140 97q8 -2 16 1M86 136q6 4 12 3M142 139q6 1 12 -3" stroke="#a07a60" stroke-width="2" fill="none" opacity=".6"/>';
    s += '<ellipse cx="88" cy="146" rx="9" ry="5" fill="#e88a7a" opacity=".3"/><ellipse cx="152" cy="146" rx="9" ry="5" fill="#e88a7a" opacity=".3"/>';
    if (o.glasses) s += '<g fill="none" stroke="' + o.glasses + '" stroke-width="3"><circle cx="100" cy="122" r="15"/><circle cx="140" cy="122" r="15"/><path d="M115 120h10M85 118l-18 -4M155 118l18 -4"/></g>';
    if (o.chain) s += '<path d="M68 122q-6 70 52 80q58 -10 52 -80" stroke="#d9b44a" stroke-width="2" fill="none" stroke-dasharray="3 3"/>';
    if (o.chalk) s += '<path d="M150 182l26 -8" stroke="#fff" stroke-width="6" stroke-linecap="round"/>';
    return s + '</svg>';
  };

  /* the cat, Pesahiba: sitting, about 70 high, feet at 0 0 */
  X.cat = function (tail) {
    return '<g class="cat"><path d="M-22 0q-6 -40 10 -56q-6 -16 2 -26l8 10q6 -2 12 0l8 -10q8 10 2 26q16 16 10 56z" fill="#2a2420"/>' +
      '<path id="' + (tail || 'tail') + '" d="M20 -4q30 -2 30 -26" stroke="#2a2420" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<circle cx="-5" cy="-62" r="2.4" fill="#e8d84a"/><circle cx="7" cy="-62" r="2.4" fill="#e8d84a"/><path d="M-8 -6v6M8 -6v6" stroke="#4a4038" stroke-width="2"/></g>';
  };
  return X;
})();
