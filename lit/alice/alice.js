/* The Torn Pages of Wonderland - what every room shares: small helpers, a few sounds, and the people of the book drawn
   in the spirit of Tenniel's pictures (ink lines, hatching), feet at 0,0. FACE(who) crops a figure for an interview.
   Loaded after engine.js. Nothing in here knows an answer. */
window.AL = (function () {
  'use strict';
  var X = {}, D = document;
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds (through the engine, so the sound button switches them) ---------- */
  X.sfx = {
    tear: function () { B({ type: 'highpass', f: 1800, f2: 5200, dur: 0.32, peak: 0.12, a: 0.01 }); },
    page: function () { B({ type: 'highpass', f: 2600, dur: 0.22, peak: 0.08, a: 0.04 }); },
    splash: function () { B({ type: 'lowpass', f: 1400, f2: 300, dur: 0.6, peak: 0.22, a: 0.01 }); T({ f: 300, f2: 120, dur: 0.25, peak: 0.08 }); },
    clink: function () { T({ f: 2600 + Math.random() * 500, dur: 0.25, peak: 0.05 }); T({ f: 3900, dur: 0.15, peak: 0.02, when: 0.03 }); },
    thump: function () { T({ f: 110, f2: 55, dur: 0.22, peak: 0.35 }); B({ type: 'lowpass', f: 600, dur: 0.08, peak: 0.2 }); },
    whoosh: function () { B({ type: 'bandpass', f: 400, f2: 2400, q: 0.8, dur: 0.8, peak: 0.12, a: 0.25 }); },
    trumpet: function () { [0, 0.28, 0.56].forEach(function (w) { T({ type: 'sawtooth', f: 523, dur: 0.22, peak: 0.035, a: 0.02, when: w }); T({ type: 'square', f: 784, dur: 0.22, peak: 0.015, a: 0.02, when: w }); }); },
    cards: function () { for (var i = 0; i < 14; i++) B({ type: 'highpass', f: 2200 + Math.random() * 1800, dur: 0.06, peak: 0.07, when: i * 0.05 + Math.random() * 0.03 }); }
  };
  X.solved = function (quiet) {
    var sung = false;
    try { sung = !!(ER.music && ER.music() && ER.track && ER.track.sting('solved', null, !!quiet)); } catch (e) {}
    if (!sung && !quiet) ER.sfx.ok();
  };

  /* ---------- small helpers ---------- */
  X.thing = function (sel, word, line, busy) {
    ER.$$(sel).forEach(function (n) {
      n.addEventListener('click', function (e) {
        if (busy && busy()) return;
        if (word) ER.wordAt(e.clientX, e.clientY, word);
        if (line) ER.say(typeof line === 'function' ? line() : line);
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
    return Math.max(1, Math.round((st.secs || 60) / 60));
  };
  X.told = function (key) {
    var t = ER.flag(key) || {};
    return { has: function (k) { return !!t[k]; }, set: function (k) { if (t[k]) return false; t[k] = 1; ER.flag(key, t); return true; } };
  };
  /* For an ER.dnd puzzle: with one item picked up, a click on a filled slot puts the new item there and sends the old one home. */
  X.swapIn = function (root, itemSel, slotSel, home) {
    root.addEventListener('pointerdown', function (e) {
      var it = e.target.closest ? e.target.closest(itemSel) : null, slot = it && it.closest(slotSel), held = root.querySelector(itemSel + '.held');
      if (!it || !slot || !held || held === it || e.button) return;
      e.stopPropagation(); e.preventDefault();
      home.appendChild(it); slot.click();
    }, true);
  };
  /* Fine engraver's hatching, for the shadows of every scene (Tenniel drew with lines, not with grey) */
  X.hatch = function (id, col, gap, ang) {
    gap = gap || 6;
    return '<pattern id="' + id + '" width="' + gap + '" height="' + gap + '" patternUnits="userSpaceOnUse" patternTransform="rotate(' + (ang == null ? 35 : ang) + ')">' +
      '<path d="M0 0v' + gap + '" stroke="' + col + '" stroke-width="1.1"/></pattern>';
  };

  /* ---------- the people of the book: feet at 0,0 ---------- */
  var INK = ' stroke="#231a14" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  var thin = ' stroke="#231a14" stroke-width="1.4" stroke-linecap="round" fill="none"';
  function eye(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 2.6) + '" fill="#231a14"/>'; }
  var FIG = {}, BOX = {};

  /* Alice, after Tenniel: long fair hair held back by a band, a full skirt, a white pinafore. Her dress is a pale primrose. */
  FIG.alice = '<ellipse cx="0" cy="2" rx="46" ry="7" fill="#000" opacity=".22"/>' +
    '<path d="M-17 0l1 -62h10l1 62zM6 0l1 -62h10l1 62z" fill="#fbf8f0"' + INK + '/>' +
    '<path d="M-26 0q0 -8 10 -8h6v8zM6 0v-8h6q10 0 10 8z" fill="#231a14"/>' +
    '<path d="M-54 -58q4 -86 30 -104h48q26 18 30 104q-56 14 -108 0z" fill="#f2df92"' + INK + '/>' +
    '<path d="M-36 -62q2 -70 18 -90h36q16 20 18 90q-36 8 -72 0z" fill="#fdfbf4"' + INK + '/>' +
    '<path d="M-28 -84q28 6 56 0" ' + thin + ' opacity=".5"/><path d="M-20 -110q20 4 40 0" ' + thin + ' opacity=".4"/>' +
    '<path d="M-24 -196q24 -10 48 0l-4 44h-40z" fill="#f2df92"' + INK + '/><path d="M-16 -190h32v34h-32z" fill="#fdfbf4"' + INK + '/>' +
    '<path d="M-16 -190l-10 -6M16 -190l10 -6" ' + thin + '/>' +
    '<circle cx="-27" cy="-186" r="11" fill="#f2df92"' + INK + '/><circle cx="27" cy="-186" r="11" fill="#f2df92"' + INK + '/>' +
    '<path d="M-31 -178q-12 26 -6 48M31 -178q12 26 6 48" fill="none" stroke="#f4d8bf" stroke-width="7" stroke-linecap="round"/>' +
    '<circle cx="-37" cy="-128" r="5" fill="#f4d8bf"' + INK + '/><circle cx="37" cy="-128" r="5" fill="#f4d8bf"' + INK + '/>' +
    '<path d="M-24 -230q-14 30 -10 64q4 10 12 12q-4 -30 2 -54zM24 -230q14 30 10 64q-4 10 -12 12q4 -30 -2 -54z" fill="#e7c36a"' + INK + '/>' +
    '<rect x="-5" y="-206" width="10" height="12" fill="#f4d8bf"/>' +
    '<ellipse cx="0" cy="-224" rx="19" ry="23" fill="#f6dfc9"' + INK + '/>' +
    '<path d="M-21 -226q2 -26 21 -28q19 2 21 28q-6 -16 -21 -18q-15 2 -21 18z" fill="#e7c36a"' + INK + '/>' +
    '<path d="M-20 -236q20 -14 40 0" fill="none" stroke="#231a14" stroke-width="4"/>' +
    eye(-7, -224, 2.2) + eye(7, -224, 2.2) + '<path d="M-2 -218q2 3 4 0" ' + thin + '/><path d="M-4 -211q4 2 8 0" ' + thin + '/>';
  BOX.alice = [-60, -262, 120, 156];

  /* The White Rabbit: a jacket, a waistcoat, a watch on a chain */
  FIG.rabbit = '<ellipse cx="0" cy="2" rx="36" ry="6" fill="#000" opacity=".22"/>' +
    '<path d="M-20 0q-4 -10 6 -12h10v12zM2 0v-12h10q10 2 6 12z" fill="#fbfaf6"' + INK + '/>' +
    '<path d="M-14 -12v-46h12v46zM2 -12v-46h12v46z" fill="#e9e2cf"' + INK + '/>' +
    '<path d="M-34 -50q-2 -60 34 -84q36 24 34 84q-34 12 -68 0z" fill="#8c3b2a"' + INK + '/>' +
    '<path d="M-14 -56q-2 -44 14 -70q16 26 14 70q-14 6 -28 0z" fill="#e6c25a"' + INK + '/>' +
    '<g fill="#231a14"><circle cx="0" cy="-104" r="1.8"/><circle cx="0" cy="-90" r="1.8"/><circle cx="0" cy="-76" r="1.8"/></g>' +
    '<path d="M6 -84q14 6 18 20" fill="none" stroke="#b8902e" stroke-width="1.6"/>' +
    '<path d="M-30 -116q-14 24 -8 44M30 -116q14 18 -4 34" fill="none" stroke="#8c3b2a" stroke-width="12" stroke-linecap="round"/>' +
    '<circle cx="-38" cy="-70" r="6" fill="#fbfaf6"' + INK + '/>' +
    '<circle cx="24" cy="-80" r="12" fill="#e9c75a"' + INK + '/><circle cx="24" cy="-80" r="8.5" fill="#fffbe8" stroke="#8a6a1e" stroke-width="1"/><path d="M24 -80v-6M24 -80h4" stroke="#231a14" stroke-width="1.3"/><circle cx="24" cy="-93" r="2" fill="#e9c75a"/>' +
    '<path d="M-10 -168q-12 -50 -2 -70q10 14 8 66zM10 -168q12 -50 2 -70q-10 14 -8 66z" fill="#fbfaf6"' + INK + '/>' +
    '<path d="M-8 -176q-6 -34 -2 -50q4 12 5 48zM8 -176q6 -34 2 -50q-4 12 -5 48z" fill="#f2b8bc"/>' +
    '<ellipse cx="0" cy="-150" rx="21" ry="24" fill="#fbfaf6"' + INK + '/>' +
    '<path d="M-14 -132q14 8 28 0l-6 10h-16z" fill="#f6f1e6"' + INK + '/>' +
    eye(-8, -154, 2.6) + eye(8, -154, 2.6) + '<path d="M-3 -142l3 3 3 -3z" fill="#e48a96"/>' +
    '<path d="M-6 -140l-18 -2M-6 -138l-17 4M6 -140l18 -2M6 -138l17 4" ' + thin + '/>';
  BOX.rabbit = [-48, -240, 96, 125];
  /* the same Rabbit as herald of the court, with a trumpet and a tabard of hearts */
  FIG.herald = FIG.rabbit + '<path d="M-22 -112h44v62h-44z" fill="#f6efe2"' + INK + '/>' +
    '<g fill="#c4202e"><path d="M-6 -96c-6 -8 -14 -2 -8 6l8 8 8 -8c6 -8 -2 -14 -8 -6z"/><path d="M0 -70c-4 -5 -9 -1 -5 4l5 5 5 -5c4 -5 -1 -9 -5 -4z"/></g>' +
    '<path d="M30 -112l46 -26v10l-46 22z" fill="#e9c75a"' + INK + '/><path d="M74 -142q12 -4 12 8q0 12 -12 8z" fill="#e9c75a"' + INK + '/>';
  BOX.herald = BOX.rabbit;

  /* The Mouse, wet through */
  FIG.mouse = '<ellipse cx="0" cy="2" rx="30" ry="5" fill="#000" opacity=".22"/>' +
    '<path d="M22 -6q40 6 46 -14q4 -14 -10 -16" fill="none" stroke="#8a7f78" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M-24 -2q-6 -34 22 -40q28 2 30 36q-24 10 -52 4z" fill="#a49b94"' + INK + '/>' +
    '<circle cx="-18" cy="-52" r="10" fill="#a49b94"' + INK + '/><circle cx="-18" cy="-52" r="5" fill="#e8b6b0"/>' +
    '<ellipse cx="-24" cy="-36" rx="14" ry="11" fill="#a49b94"' + INK + '/>' + eye(-28, -38, 2) +
    '<circle cx="-38" cy="-34" r="2.4" fill="#231a14"/><path d="M-36 -32l-14 0M-36 -30l-12 4" ' + thin + '/>' +
    '<path d="M-14 -2l-2 -6M6 -2l0 -6" ' + thin + '/><g stroke="#6aa8c8" stroke-width="2" stroke-linecap="round"><path d="M-6 6v5M12 6v4M-20 4v4"/></g>';
  BOX.mouse = [-56, -70, 76, 98];

  /* The Dodo, leaning on a stick, as solemn as a bishop */
  FIG.dodo = '<ellipse cx="0" cy="2" rx="48" ry="7" fill="#000" opacity=".22"/>' +
    '<path d="M38 0l-6 -110" stroke="#5a3a1a" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="-112" r="5" fill="#5a3a1a"/>' +
    '<path d="M-16 0l2 -24M10 0l-2 -24" stroke="#c89a3a" stroke-width="5" stroke-linecap="round"/><path d="M-26 0h18M2 0h18" stroke="#c89a3a" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M-44 -30q-10 -70 34 -86q44 6 46 64q-2 30 -36 30q-30 6 -44 -8z" fill="#8f8a84"' + INK + '/>' +
    '<path d="M-44 -50q-20 0 -24 14q12 -2 22 4" fill="#d8d2c6"' + INK + '/>' +
    '<path d="M-20 -70q20 10 30 36" ' + thin + '/><path d="M-30 -56q20 8 30 30" ' + thin + '/>' +
    '<path d="M24 -88q10 -6 12 -24" fill="none" stroke="#8f8a84" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M-6 -112q-2 -34 14 -46q20 -4 26 12q2 14 -8 22z" fill="#8f8a84"' + INK + '/>' +
    '<path d="M28 -150q28 -2 34 18q2 10 -8 10q-2 -10 -12 -10q-8 0 -16 -4z" fill="#e3c27a"' + INK + '/>' + eye(20, -146, 2.6) +
    '<path d="M18 -156q4 -4 8 0" ' + thin + '/>';
  BOX.dodo = [-60, -170, 130, 170];

  FIG.duck = '<ellipse cx="0" cy="2" rx="26" ry="5" fill="#000" opacity=".2"/>' +
    '<path d="M-22 -6q-6 -24 20 -28q26 2 26 22q-20 10 -46 6z" fill="#f2ecd8"' + INK + '/><circle cx="-14" cy="-40" r="11" fill="#f2ecd8"' + INK + '/>' +
    '<path d="M-24 -40q-14 0 -16 4q8 4 16 2z" fill="#e8a63a"' + INK + '/>' + eye(-16, -42, 2) + '<path d="M-8 -2v4M8 -2v4" stroke="#e8a63a" stroke-width="3"/>';
  BOX.duck = [-44, -56, 74, 60];
  FIG.lory = '<ellipse cx="0" cy="2" rx="20" ry="4" fill="#000" opacity=".2"/>' +
    '<path d="M-14 -4q-4 -30 14 -36q16 4 14 34q-14 6 -28 2z" fill="#3e8a4a"' + INK + '/><path d="M-10 -8q4 -14 10 -18q6 6 4 18z" fill="#d8402a"/>' +
    '<circle cx="0" cy="-46" r="10" fill="#d8402a"' + INK + '/><path d="M8 -48q8 0 6 8q-4 -2 -6 -2z" fill="#3a2a1a"/>' + eye(2, -48, 1.8) + '<path d="M4 -2l8 12" stroke="#3e8a4a" stroke-width="5" stroke-linecap="round"/>';
  BOX.lory = [-24, -60, 46, 60];
  FIG.eaglet = '<ellipse cx="0" cy="2" rx="20" ry="4" fill="#000" opacity=".2"/>' +
    '<path d="M-14 -4q-6 -28 14 -34q18 4 14 32q-14 6 -28 2z" fill="#9a6a3a"' + INK + '/><circle cx="2" cy="-42" r="10" fill="#e6dccb"' + INK + '/>' +
    '<path d="M10 -44q8 2 4 8q-2 -2 -6 -2z" fill="#e8b23a"' + INK + '/>' + eye(4, -44, 1.8);
  BOX.eaglet = [-24, -56, 46, 58];
  FIG.crab = '<ellipse cx="0" cy="2" rx="20" ry="4" fill="#000" opacity=".2"/><ellipse cx="0" cy="-10" rx="16" ry="10" fill="#c8503a"' + INK + '/>' +
    '<path d="M-14 -6l-10 6M-14 -2l-8 8M14 -6l10 6M14 -2l8 8M-10 -18l-8 -10M10 -18l8 -10" stroke="#c8503a" stroke-width="3" stroke-linecap="round"/>' + eye(-4, -16, 1.6) + eye(4, -16, 1.6);

  /* The Hatter: a tall hat with its price ticket still on it, a spotted bow tie, a teacup */
  FIG.hatter = '<ellipse cx="0" cy="2" rx="44" ry="7" fill="#000" opacity=".22"/>' +
    '<path d="M-16 0v-70h12v70zM4 0v-70h12v70z" fill="#5a5a6a"' + INK + '/><path d="M-26 0q0 -8 10 -8h10v8zM4 0v-8h12q10 0 10 8z" fill="#231a14"/>' +
    '<path d="M-40 -66q-6 -90 40 -110q46 20 40 110q-40 10 -80 0z" fill="#3e6a52"' + INK + '/>' +
    '<path d="M-12 -170l12 40 12 -40z" fill="#f6efe2"' + INK + '/><path d="M-16 -170l16 10 16 -10 -2 14 -14 -4 -14 4z" fill="#c4402e"' + INK + '/>' +
    '<g fill="#fff"><circle cx="-8" cy="-164" r="1.6"/><circle cx="8" cy="-164" r="1.6"/></g>' +
    '<path d="M-34 -150q-18 30 -4 60M34 -150q18 20 4 46" fill="none" stroke="#3e6a52" stroke-width="13" stroke-linecap="round"/>' +
    '<circle cx="-38" cy="-88" r="7" fill="#f2d2b6"' + INK + '/><circle cx="38" cy="-100" r="7" fill="#f2d2b6"' + INK + '/>' +
    '<path d="M34 -110h24v-8q-12 -6 -24 0z" fill="#fdfbf4"' + INK + '/><path d="M58 -116q8 0 6 6q-2 4 -6 2" fill="none" stroke="#231a14" stroke-width="2"/>' +
    '<ellipse cx="0" cy="-198" rx="22" ry="25" fill="#f2d2b6"' + INK + '/>' +
    '<path d="M2 -200q16 4 12 14q-6 4 -12 0" fill="#ecc0a0"' + INK + '/>' + eye(-8, -206, 2.4) + eye(10, -206, 2.4) +
    '<path d="M-10 -184q8 4 14 -2" ' + thin + '/><path d="M-22 -200q-8 -4 -6 6q2 8 6 6" fill="#f2d2b6"' + INK + '/>' +
    '<path d="M-28 -220h56v8h-56z" fill="#3a2a2a"' + INK + '/><path d="M-22 -222l-6 -64h56l-6 64z" fill="#4a3a3a"' + INK + '/>' +
    '<path d="M-24 -236h48v10h-48z" fill="#b84a3a"/>' +
    '<g transform="rotate(-8 18 -244)"><rect x="6" y="-262" width="28" height="18" fill="#fdfbf4"' + INK + '/><text x="20" y="-249" font-family="EB Garamond,serif" font-size="10" text-anchor="middle" fill="#231a14">10/6</text></g>';
  BOX.hatter = [-62, -296, 132, 168];

  /* The March Hare, with straw in his ears */
  FIG.hare = '<ellipse cx="0" cy="2" rx="40" ry="6" fill="#000" opacity=".22"/>' +
    '<path d="M-14 0v-60h10v60zM4 0v-60h10v60z" fill="#b08a5a"' + INK + '/>' +
    '<path d="M-34 -56q-4 -80 34 -96q38 16 34 96q-34 10 -68 0z" fill="#d6c6a0"' + INK + '/>' +
    '<path d="M-14 -146l14 26 14 -26z" fill="#fbf8ef"' + INK + '/><path d="M-10 -146h20l-10 10z" fill="#3a5aa0"/>' +
    '<path d="M-28 -130q-16 26 -8 50M28 -130q16 20 0 46" fill="none" stroke="#d6c6a0" stroke-width="12" stroke-linecap="round"/>' +
    '<path d="M-12 -196q-14 -56 -4 -80q12 16 10 76zM8 -196q16 -54 12 -80q-14 14 -18 76z" fill="#b8925e"' + INK + '/>' +
    '<path d="M-14 -258l-10 -14M-10 -262l2 -16M14 -258l14 -12M20 -262l10 -6" stroke="#e8c84a" stroke-width="2.4" stroke-linecap="round"/>' +
    '<ellipse cx="0" cy="-170" rx="22" ry="27" fill="#b8925e"' + INK + '/>' +
    '<ellipse cx="0" cy="-158" rx="12" ry="8" fill="#e6d4b0"/>' + eye(-9, -176, 3) + eye(9, -176, 3) +
    '<circle cx="-9" cy="-176" r="6" fill="none" stroke="#231a14" stroke-width="1.2"/><circle cx="9" cy="-176" r="6" fill="none" stroke="#231a14" stroke-width="1.2"/>' +
    '<path d="M-3 -162l3 3 3 -3z" fill="#c87a7a"/><path d="M-6 -158l-18 -2M6 -158l18 -2" ' + thin + '/>';
  BOX.hare = [-52, -280, 104, 150];

  FIG.dormouse = '<ellipse cx="0" cy="2" rx="28" ry="5" fill="#000" opacity=".2"/>' +
    '<path d="M-26 -2q-4 -36 26 -38q30 2 26 38z" fill="#b07a4a"' + INK + '/><circle cx="-16" cy="-34" r="8" fill="#b07a4a"' + INK + '/><circle cx="-16" cy="-34" r="4" fill="#e8b6a0"/>' +
    '<path d="M-20 -16q4 3 8 0" ' + thin + '/><path d="M24 -6q16 6 14 -8" fill="none" stroke="#b07a4a" stroke-width="4" stroke-linecap="round"/>' +
    '<text x="22" y="-40" font-family="Caveat,cursive" font-size="16" fill="#5a4a3a">z</text><text x="32" y="-52" font-family="Caveat,cursive" font-size="12" fill="#5a4a3a">z</text>';
  BOX.dormouse = [-34, -60, 72, 66];

  /* The Cheshire Cat: only the head, and the grin most of all (centre of the head at 0,0) */
  FIG.cathead = '<path d="M-58 -10q-6 -40 16 -58l-4 -30 26 18q20 -6 40 0l26 -18 -4 30q22 18 16 58q-12 46 -58 46q-46 0 -58 -46z" fill="#b48a5a"' + INK + '/>' +
    '<path d="M-40 -46q8 6 14 2M26 -44q8 4 14 -2M-48 -20q10 2 16 -2M32 -22q10 4 16 -2M-10 -56l4 8M10 -56l-4 8" ' + thin + ' stroke-width="2.4"/>' +
    '<ellipse cx="-22" cy="-24" rx="10" ry="12" fill="#e8d24a"' + INK + '/><ellipse cx="22" cy="-24" rx="10" ry="12" fill="#e8d24a"' + INK + '/>' +
    '<ellipse cx="-22" cy="-24" rx="3" ry="9" fill="#231a14"/><ellipse cx="22" cy="-24" rx="3" ry="9" fill="#231a14"/>' +
    '<path d="M-4 -6h8l-4 5z" fill="#d88a8a"/>' +
    '<path d="M-46 6q46 34 92 0q-6 26 -46 30q-40 -4 -46 -30z" fill="#fbfaf2"' + INK + '/>' +
    '<path d="M-36 12v10M-26 16v12M-16 18v14M-6 19v15M6 19v15M16 18v14M26 16v12M36 12v10M-40 9q40 22 80 0" ' + thin + '/>' +
    '<path d="M-30 -2l-30 -6M-30 2l-30 4M30 -2l30 -6M30 2l30 4" ' + thin + '/>';

  /* card people: a card for a body, hands and feet at its corners. pip: 'heart' | 'club' | 'spade' | 'diamond' */
  function pip(kind, x, y, s, col) {
    var t = 'translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')';
    if (kind === 'heart') return '<path transform="' + t + '" d="M0 6c-10 -8 -12 -16 -6 -18c3 -1 5 1 6 3c1 -2 3 -4 6 -3c6 2 4 10 -6 18z" fill="' + (col || '#c4202e') + '"/>';
    if (kind === 'diamond') return '<path transform="' + t + '" d="M0 -10l7 10 -7 10 -7 -10z" fill="' + (col || '#c4202e') + '"/>';
    if (kind === 'club') return '<g transform="' + t + '" fill="' + (col || '#231a14') + '"><circle cx="0" cy="-6" r="4.5"/><circle cx="-5" cy="1" r="4.5"/><circle cx="5" cy="1" r="4.5"/><path d="M-2 2l-2 8h8l-2 -8z"/></g>';
    return '<g transform="' + t + '" fill="' + (col || '#231a14') + '"><path d="M0 -10c-8 8 -12 12 -8 16c3 2 6 0 8 -3c2 3 5 5 8 3c4 -4 0 -8 -8 -16z"/><path d="M-2 4l-2 7h8l-2 -7z"/></g>';
  }
  X.pip = pip;
  function card(kind, n, head, extra) {
    var s = '<ellipse cx="0" cy="2" rx="40" ry="6" fill="#000" opacity=".2"/>' +
      '<path d="M-28 0l4 -8M24 0l4 -8" stroke="#231a14" stroke-width="3"/>' +
      '<rect x="-34" y="-128" width="68" height="118" rx="6" fill="#fbf8ef"' + INK + '/>';
    if (n === 'K' || n === 'Q' || n === 'J') s += '<rect x="-26" y="-120" width="52" height="102" rx="3" fill="none" stroke="#c4202e" stroke-width="1.4"/>';
    var P = { 2: [[0, -104], [0, -34]], 5: [[-14, -104], [14, -104], [0, -69], [-14, -34], [14, -34]], 7: [[-14, -108], [14, -108], [0, -88], [-14, -70], [14, -70], [-14, -32], [14, -32]], 3: [[0, -104], [0, -69], [0, -34]], 10: [[-14, -110], [14, -110], [0, -96], [-14, -82], [14, -82], [-14, -56], [14, -56], [0, -42], [-14, -28], [14, -28]] };
    (P[n] || []).forEach(function (p) { s += pip(kind, p[0], p[1], 0.9); });
    if (typeof n === 'string') { s += pip(kind, -22, -110, 0.6) + pip(kind, 22, -26, 0.6); }
    s += '<text x="-26" y="-112" font-family="EB Garamond,serif" font-size="12" fill="' + (kind === 'heart' || kind === 'diamond' ? '#c4202e' : '#231a14') + '">' + n + '</text>';
    s += '<path d="M-34 -110q-16 10 -18 30M34 -110q16 10 18 30" fill="none" stroke="#231a14" stroke-width="3" stroke-linecap="round"/>';
    s += (extra || '') + (head || '');
    return s;
  }
  var cardHead = function (skin, hat) { return '<rect x="-5" y="-140" width="10" height="14" fill="' + skin + '"/><ellipse cx="0" cy="-154" rx="16" ry="18" fill="' + skin + '"' + INK + '/>' + eye(-6, -156, 2) + eye(6, -156, 2) + '<path d="M-5 -146q5 3 10 0" ' + thin + '/>' + (hat || ''); };
  var crown = function (y, w) { w = w || 16; return '<path d="M-' + w + ' ' + y + 'l0 -16 ' + (w / 2) + ' 9 ' + (w / 2) + ' -14 ' + (w / 2) + ' 14 ' + (w / 2) + ' -9 0 16z" fill="#e9c75a"' + INK + '/>'; };
  FIG.queen = card('heart', 'Q', '<rect x="-5" y="-140" width="10" height="14" fill="#f2d6c0"/><ellipse cx="0" cy="-156" rx="18" ry="20" fill="#f2d6c0"' + INK + '/>' +
    '<path d="M-10 -160l7 3M10 -160l-7 3" stroke="#231a14" stroke-width="2.4"/>' + eye(-6, -154, 2) + eye(6, -154, 2) + '<path d="M-7 -142q7 -4 14 0" stroke="#a01a2a" stroke-width="2.4" fill="none"/>' +
    '<path d="M-18 -162q-6 20 -4 30M18 -162q6 20 4 30" stroke="#5a3a2a" stroke-width="5" fill="none"/>' + crown(-172, 18),
    '<path d="M-20 -96h40M-20 -60h40" stroke="#c4202e" stroke-width="1.2"/>');
  BOX.queen = [-60, -200, 120, 130];
  FIG.king = card('heart', 'K', '<rect x="-5" y="-140" width="10" height="14" fill="#f2d6c0"/><ellipse cx="0" cy="-156" rx="17" ry="19" fill="#f2d6c0"' + INK + '/>' +
    eye(-6, -158, 2) + eye(6, -158, 2) + '<path d="M-14 -150q14 26 28 0q-4 16 -14 18q-10 -2 -14 -18z" fill="#e8e2d2"' + INK + '/>' + crown(-170, 17));
  BOX.king = [-60, -196, 120, 130];
  /* the King as judge: his crown over a great wig */
  FIG.judge = card('heart', 'K', '<rect x="-5" y="-140" width="10" height="14" fill="#f2d6c0"/>' +
    '<path d="M-30 -150q-4 -36 30 -40q34 4 30 40q4 20 -6 34q-6 -20 -6 -34q-18 6 -36 0q0 14 -6 34q-10 -14 -6 -34z" fill="#f2efe6"' + INK + '/>' +
    '<ellipse cx="0" cy="-156" rx="16" ry="18" fill="#f2d6c0"' + INK + '/>' + eye(-6, -158, 2) + eye(6, -158, 2) +
    '<circle cx="-6" cy="-158" r="5" fill="none" stroke="#231a14" stroke-width="1.2"/><circle cx="6" cy="-158" r="5" fill="none" stroke="#231a14" stroke-width="1.2"/>' +
    '<path d="M-12 -150q12 22 24 0q-4 14 -12 16q-8 -2 -12 -16z" fill="#e8e2d2"' + INK + '/>' + crown(-182, 15));
  BOX.judge = BOX.king;
  /* the Knave of Hearts: a feathered cap, and the King's crown on a crimson velvet cushion */
  FIG.knave = card('heart', 'J', cardHead('#f2d6c0', '<path d="M-18 -166q18 -16 36 0z" fill="#c4202e"' + INK + '/><path d="M14 -170q16 -14 22 -2" fill="none" stroke="#e9c75a" stroke-width="3"/>') +
    '<path d="M-8 -142q8 -4 16 0" stroke="#231a14" stroke-width="1.6" fill="none"/>',
    '<path d="M-20 -100h40" stroke="#c4202e" stroke-width="1.2"/>');
  FIG.knaveCushion = FIG.knave + '<g id="cushion"><path d="M-46 -78q46 -14 92 0q-46 14 -92 0z" fill="#a01a3a"' + INK + '/><g transform="translate(0 -6)">' + crown(-80, 14) + '</g></g>';
  BOX.knave = [-60, -186, 120, 130];
  FIG.knaveChains = FIG.knave + '<path d="M-52 -80q10 10 20 0q10 -10 20 0q10 10 20 0q10 -10 20 0q10 10 24 0" fill="none" stroke="#7a7a82" stroke-width="3"/>';
  FIG.gardener = function (n) {
    return card('spade', n, cardHead('#e8c8a8'),
      '<path d="M46 -60l18 -40" stroke="#7a5a2a" stroke-width="4" stroke-linecap="round"/><path d="M60 -104l10 -10 4 4 -8 10z" fill="#c4202e"' + INK + '/>' +
      '<g fill="#c4202e"><circle cx="-40" cy="-78" r="3"/><circle cx="20" cy="-40" r="2.4"/><circle cx="-10" cy="-96" r="2"/></g>');
  };
  BOX.gardener = [-60, -186, 140, 130];
  /* a soldier of clubs bent double to make a croquet arch (feet and hands on the ground) */
  FIG.arch = '<path d="M-36 0q-6 -70 36 -76q42 6 36 76" fill="none" stroke="#231a14" stroke-width="3"/>' +
    '<path d="M-30 -2q-4 -60 30 -66q34 6 30 66" fill="none" stroke="#fbf8ef" stroke-width="16"/>' +
    '<path d="M-38 -2q-4 -66 38 -72q42 6 38 72M-22 -2q-2 -52 22 -58q24 6 22 58" fill="none" stroke="#231a14" stroke-width="1.8"/>' +
    pip('club', 0, -64, 0.7) + pip('club', -26, -36, 0.6) + pip('club', 26, -36, 0.6);
  FIG.flamingo = '<path d="M0 0l-2 -60M6 0l2 -60" stroke="#e88a9a" stroke-width="3"/><ellipse cx="2" cy="-72" rx="22" ry="14" fill="#f2a2b2"' + INK + '/>' +
    '<path d="M18 -78q20 -20 4 -50q-10 -16 6 -24" fill="none" stroke="#f2a2b2" stroke-width="7" stroke-linecap="round"/><path d="M28 -152q12 -2 14 8l-8 6z" fill="#231a14"/>' + eye(30, -150, 1.8);
  FIG.hedgehog = '<path d="M-18 0q-2 -22 18 -24q20 2 18 24z" fill="#8a6a4a"' + INK + '/><path d="M-14 -10l-6 -8M-6 -18l-2 -10M4 -20l2 -10M12 -14l6 -8M16 -4l8 -4" stroke="#231a14" stroke-width="1.6"/>' +
    '<circle cx="-16" cy="-6" r="5" fill="#d8b890"/>' + eye(-17, -8, 1.4);
  FIG.lizard = '<path d="M-20 0q-4 -20 6 -30q10 -6 16 4l4 26z" fill="#6a9a4a"' + INK + '/><circle cx="-6" cy="-36" r="9" fill="#6a9a4a"' + INK + '/>' + eye(-8, -38, 1.8) + '<path d="M6 -4q20 0 24 -14" fill="none" stroke="#6a9a4a" stroke-width="4" stroke-linecap="round"/>';
  FIG.sister = '<path d="M-60 0q10 -80 40 -100h40q30 20 40 100z" fill="#7a8ab0"' + INK + '/><circle cx="0" cy="-118" r="18" fill="#f2d8c0"' + INK + '/>' +
    '<path d="M-20 -122q2 -24 20 -26q18 2 20 26q-4 -12 -20 -14q-16 2 -20 14z" fill="#8a5a2a"' + INK + '/>';

  X.fig = function (who, a) { var f = FIG[who]; return typeof f === 'function' ? f(a) : (f || ''); };
  X.face = function (who, bg, arg) {
    var b = BOX[who] || BOX[String(who).replace(/[A-Z].*$/, '')] || [-60, -200, 120, 156], f = X.fig(who, arg);
    var w = b[2], h = w * 1.3, y = b[1] + b[3] - h + h * 0.14;
    return '<svg viewBox="' + b[0] + ' ' + y.toFixed(1) + ' ' + w + ' ' + h.toFixed(1) + '" preserveAspectRatio="xMidYMax meet" style="background:' + (bg || '#efe6d2') + '">' + f + '</svg>';
  };
  X.catFace = function () { return '<svg viewBox="-100 -130 200 260" style="background:#d8e6c8">' + FIG.cathead + '</svg>'; };
  return X;
})();
