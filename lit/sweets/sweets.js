/* Miss Plunkett's Last Recipe - what every room of the story shares: a few sounds, small helpers, the people as small
   figures (feet at 0,0), the factory cat, and the brass-plate verses. Loaded after engine.js. Nothing in here knows an answer. */
window.SW = (function () {
  'use strict';
  var X = {}, D = document;
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds (through the engine, so the sound button switches them) ---------- */
  X.sfx = {
    pop: function () { T({ f: 520, f2: 260, dur: 0.09, peak: 0.16 }); B({ f: 900, q: 1, dur: 0.05, peak: 0.12 }); },
    clunk: function () { T({ f: 140, f2: 70, dur: 0.2, peak: 0.4 }); B({ type: 'lowpass', f: 700, dur: 0.06, peak: 0.25 }); },
    ding: function () { [1, 2.4, 3.9].forEach(function (m, i) { T({ f: 990 * m, dur: 1.1 / (i + 1), peak: 0.13 / (i + 1) }); }); },
    till: function () { B({ dur: 0.05, f: 3000, q: 2, peak: 0.2 }); [1320, 1760].forEach(function (f, i) { T({ f: f, dur: 0.9, peak: 0.1, when: 0.08 + i * 0.12 }); }); T({ f: 160, f2: 90, dur: 0.25, peak: 0.35, when: 0.3 }); },
    click: function () { B({ dur: 0.02, f: 2600, q: 2, peak: 0.18 }); },
    whoosh: function () { B({ type: 'bandpass', f: 500, f2: 2600, q: 0.8, dur: 0.7, peak: 0.12, a: 0.2 }); },
    bubble: function () { T({ f: 300 + Math.random() * 200, f2: 700, dur: 0.06, peak: 0.08 }); },
    hiss: function () { B({ type: 'highpass', f: 3500, dur: 0.9, peak: 0.06, a: 0.1 }); },
    press: function () { T({ f: 90, f2: 50, dur: 0.3, peak: 0.45 }); B({ type: 'lowpass', f: 1200, dur: 0.12, peak: 0.3, when: 0.05 }); },
    slosh: function () { B({ type: 'lowpass', f: 900, f2: 400, dur: 0.35, peak: 0.16, a: 0.06 }); },
    tink: function () { T({ f: 2400 + Math.random() * 600, dur: 0.2, peak: 0.05 }); },
    box: function () {                                    /* a music box: a little tune that plays as a machine does its worst */
      [72, 76, 79, 84, 79, 76, 74, 72].forEach(function (n, i) { T({ type: 'triangle', f: 440 * Math.pow(2, (n - 69) / 12), dur: 0.5, peak: 0.07, when: i * 0.22 }); });
    }
  };
  X.solved = function (quiet) {                         /* the music answers in the room's key, as it does after ER.exit */
    var sung = false;
    try { sung = !!(ER.music && ER.music() && ER.track && ER.track.sting('solved', null, !!quiet)); } catch (e) {}
    if (!sung && !quiet) ER.sfx.ok();
  };

  /* ---------- small helpers ---------- */
  X.thing = function (sel, word, line, busy) {          /* a thing in the scene that has a name and something to say */
    ER.$$(sel).forEach(function (n) {
      n.addEventListener('click', function (e) {
        if (busy && busy()) return;
        if (word) ER.wordAt(e.clientX, e.clientY, word);
        if (line) ER.say(typeof line === 'function' ? line() : line);
      });
    });
  };
  X.mine = function (id, title, html, quiet) { return ER.addClue(id, title, '<h4>' + title + '</h4>' + html, 'mine', 'Your notes', quiet); };
  X.terms = function (list) {                            /* the words of the subject go into the notebook when the page that teaches them is read */
    var G = window.GLOSS || [];
    list.forEach(function (w) { for (var i = 0; i < G.length; i++) if (G[i][0] === w) { ER.addWord(G[i][0], G[i][1]); break; } });
  };
  X.minutesPlayed = function () {
    var st = ER.state();
    if (st.fin && st.fin.secs) return Math.max(1, Math.round(st.fin.secs / 60));
    return Math.max(1, Math.round((st.secs || 60) / 60));
  };
  X.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  /* For an ER.dnd puzzle: with one item picked up, a click on a slot that is already filled puts the new item there and
     sends the old one home (otherwise the click would only pick the old one up instead). */
  X.swapIn = function (root, itemSel, slotSel, home) {
    root.addEventListener('pointerdown', function (e) {
      var it = e.target.closest ? e.target.closest(itemSel) : null, slot = it && it.closest(slotSel), held = root.querySelector(itemSel + '.held');
      if (!it || !slot || !held || held === it || e.button) return;
      e.stopPropagation(); e.preventDefault();
      home.appendChild(it); slot.click();
    }, true);
  };
  X.told = function (key) {                              /* a room's set of things already done, kept in the saved game */
    var t = ER.flag(key) || {};
    return { has: function (k) { return !!t[k]; }, set: function (k) { if (t[k]) return false; t[k] = 1; ER.flag(key, t); return true; } };
  };

  /* ---------- the brass-plate verses on Miss Plunkett's machines ---------- */
  X.VERSE = {
    read: ['The Man Who Would Not Read', ['There was a Man who would not Read:', '&lsquo;Instructions? Pah! I have no need.&rsquo;', 'He pulled the Lever marked DO NOT,', 'And this, my Dears, is what he got:', '', 'A Cloud of Floss from Hat to Toe.', 'And there he Stays. The Moral? Oh,', 'It&rsquo;s Short, and Easy to Recall:', 'READ FIRST. Or do not Pull at All.']],
    vain: ['The Lady Who Admired Herself', ['A Lady, very Rich and Vain,', 'Admired herself in every Pane,', 'In every Spoon, in every Tray,', 'Some Forty Thousand Times a Day.', '', 'She bent to Kiss a Shining Thing.', 'It went WHIRR-CLICK. It went TWING-TWING.', 'It Wrapped her up from Toe to Chin', 'In Golden Foil, and Tucked her In.', '', 'Her Face still Shows through Cellophane.', 'She&rsquo;s Pleased. She&rsquo;d Do It All Again.']],
    mean: ['The Man Who Never Gave Away', ['A Man who Never Gave Away', 'So much as Crumbs, or Time of Day,', 'Found Something Free upon a Shelf,', 'And Ate it Quickly, by Himself.', '', 'Now Watch him Give, and Give, and Give:', 'His Gloves, his Hat, his Purse. (Forgive', 'The Cat for Taking them. Cats Do.)', 'It Wears Off, Dears. By Half-past Two.']]
  };
  X.verseHtml = function (k, where) {
    var v = X.VERSE[k];
    return '<h4>' + v[0] + '</h4>' + v[1].map(function (l) { return l ? '<p>' + l + '</p>' : '<p class="gap"></p>'; }).join('') +
      '<p class="gap"></p><p style="font-size:14px;letter-spacing:.2em;text-transform:uppercase;opacity:.75">' + where + '</p>';
  };
  /* the music box plays while the plate is read, and the plate goes into the notebook */
  X.verse = function (k, where, done) {
    X.sfx.box();
    ER.read({ html: X.verseHtml(k, where), cls: 'verse', clue: { id: 'verse-' + k, title: X.VERSE[k][0], kind: 'A brass plate' }, done: done });
  };

  /* ---------- the people, as small figures: feet at 0,0 ---------- */
  var INK = 'stroke="#2a1a24" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';
  var FIG = {
    gribble: '<ellipse cx="0" cy="3" rx="44" ry="7" fill="#000" opacity=".3"/>' +
      '<path d="M-17 0v-150h12v150zM5 0v-150h12v150z" fill="#5d626b" ' + INK + '/><path d="M-26 0h22v-9h-19zM4 0h24l-3 -9h-21z" fill="#1c1c20"/>' +
      '<path d="M-34 -136q-6 -112 34 -120q40 8 34 120z" fill="#80858f" ' + INK + '/><path d="M-9 -255l9 34 9 -34z" fill="#f4f2ec"/><path d="M-3 -236l3 -6 3 6 -3 44z" fill="#8a2a3a"/>' +
      '<path d="M-10 -254l-10 40 14 30M10 -254l10 40 -14 30" fill="none" ' + INK + '/>' +
      '<path d="M-30 -232q-14 60 0 80l24 -10" fill="none" stroke="#80858f" stroke-width="13" stroke-linecap="round"/><path d="M30 -232q14 40 4 66l-26 4" fill="none" stroke="#80858f" stroke-width="13" stroke-linecap="round"/>' +
      '<g transform="rotate(-8 -6 -170)"><rect x="-30" y="-204" width="46" height="60" rx="3" fill="#a8774a" ' + INK + '/><rect x="-26" y="-196" width="38" height="48" fill="#fdfbf2"/><path d="M-22 -188h28M-22 -180h30M-22 -172h24M-22 -164h30M-22 -156h18" stroke="#6a6a7a" stroke-width="1.6"/><rect x="-14" y="-208" width="14" height="8" rx="2" fill="#bfc4ca"/></g>' +
      '<circle cx="-6" cy="-158" r="7" fill="#f0cfae"/><circle cx="8" cy="-164" r="7" fill="#f0cfae"/>' +
      '<rect x="-7" y="-268" width="14" height="16" fill="#e3bd98"/><ellipse cx="0" cy="-292" rx="21" ry="29" fill="#f0cfae" ' + INK + '/>' +
      '<path d="M-21 -292q-7 -2 -6 8q2 6 6 4M21 -292q7 -2 6 8q-2 6 -6 4" fill="#f0cfae" ' + INK + '/>' +
      '<path d="M-24 -290l-10 -26M24 -290l9 -26" stroke="#e7b829" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M-10 -296h6M4 -296h6" stroke="#2a1a24" stroke-width="2.6" stroke-linecap="round"/><path d="M0 -294q4 14 -3 16" fill="none" ' + INK + '/><path d="M-7 -275h12" stroke="#2a1a24" stroke-width="2.2" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="-315" rx="32" ry="6" fill="#1e1e22"/><path d="M-21 -316q0 -34 21 -34t21 34z" fill="#26262b"/><path d="M-21 -322h42" stroke="#4a3a2a" stroke-width="3"/>',
    mortlake: '<ellipse cx="0" cy="3" rx="50" ry="8" fill="#000" opacity=".3"/>' +
      '<path d="M-12 0l2 -60h8l2 60zM4 0l2 -60h8l2 60z" fill="#f0c7a8" ' + INK + '/><path d="M-18 0h16l-2 -6h-12zM6 0h16l-2 -6h-12z" fill="#c4134a"/>' +
      '<path d="M-48 -56q4 -150 48 -176q44 26 48 176z" fill="#e0447f" ' + INK + '/><path d="M-30 -90h60" stroke="#b02a5e" stroke-width="3"/>' +
      '<path d="M-40 -214q40 -34 80 0q-10 22 -40 22t-40 -22z" fill="#f6eedc" ' + INK + '/><path d="M-30 -206q30 18 60 0" fill="none" stroke="#e8dcc4" stroke-width="5"/>' +
      '<g fill="#fffaf0" stroke="#c8b89a" stroke-width="1"><circle cx="-14" cy="-196" r="4"/><circle cx="-5" cy="-193" r="4"/><circle cx="5" cy="-193" r="4"/><circle cx="14" cy="-196" r="4"/></g>' +
      '<path d="M40 -196q22 30 8 62" fill="none" stroke="#e0447f" stroke-width="13" stroke-linecap="round"/><path d="M-40 -196q-26 26 -20 64" fill="none" stroke="#e0447f" stroke-width="13" stroke-linecap="round"/>' +
      '<circle cx="48" cy="-132" r="7" fill="#f0c7a8"/><g transform="rotate(-20 52 -150)"><path d="M50 -136v-14" stroke="#c9a23a" stroke-width="4"/><ellipse cx="50" cy="-164" rx="13" ry="16" fill="#c9a23a" ' + INK + '/><ellipse cx="50" cy="-164" rx="9" ry="12" fill="#dff2fa"/></g>' +
      '<circle cx="-58" cy="-130" r="7" fill="#f0c7a8"/>' +
      '<ellipse cx="0" cy="-246" rx="19" ry="23" fill="#f0c7a8" ' + INK + '/>' +
      '<path d="M-24 -250q-30 -40 -6 -76q14 -32 30 -30q16 -2 30 30q24 36 -6 76q4 -30 -8 -42q-16 8 -32 0q-12 12 -8 42z" fill="#f4d47a" ' + INK + '/>' +
      '<path d="M-12 -310q12 -10 24 0" fill="none" stroke="#d9b24a" stroke-width="3"/>' +
      '<path d="M-17 -252h14v8h-14zM3 -252h14v8h-14z" fill="#1c1c22"/><path d="M-3 -249h6" stroke="#1c1c22" stroke-width="2"/>' +
      '<path d="M-7 -233q7 5 14 0q-7 -3 -14 0z" fill="#d1103e"/><circle cx="-13" cy="-238" r="4" fill="#ff8aa8" opacity=".6"/><circle cx="13" cy="-238" r="4" fill="#ff8aa8" opacity=".6"/>',
    huxtable: '<ellipse cx="0" cy="3" rx="46" ry="7" fill="#000" opacity=".3"/>' +
      '<path d="M-16 0v-62h12v62zM4 0v-62h12v62z" fill="#4a4a3a" ' + INK + '/><path d="M-24 0h20v-8h-16zM4 0h22l-3 -8h-19z" fill="#3a2414"/>' +
      '<ellipse cx="0" cy="-110" rx="52" ry="62" fill="#3f6a4a" ' + INK + '/><path d="M-30 -158q30 -16 60 0q8 50 -4 98q-26 12 -52 0q-12 -48 -4 -98z" fill="#b0823a" ' + INK + '/>' +
      '<g fill="#8a6228" stroke="#5a3e14" stroke-width="1.5"><rect x="-26" y="-140" width="16" height="12" rx="2"/><rect x="10" y="-140" width="16" height="12" rx="2"/><rect x="-27" y="-112" width="16" height="12" rx="2"/><rect x="11" y="-112" width="16" height="12" rx="2"/><rect x="-26" y="-86" width="16" height="12" rx="2"/><rect x="10" y="-86" width="16" height="12" rx="2"/></g>' +
      '<g fill="#e8c860"><circle cx="0" cy="-150" r="3"/><circle cx="0" cy="-130" r="3"/><circle cx="0" cy="-110" r="3"/><circle cx="0" cy="-90" r="3"/></g><path d="M-18 -120q18 14 36 0" fill="none" stroke="#e8c860" stroke-width="2.5"/>' +
      '<path d="M-46 -140q-16 30 -4 60" fill="none" stroke="#3f6a4a" stroke-width="13" stroke-linecap="round"/><path d="M46 -140q14 20 -4 46" fill="none" stroke="#3f6a4a" stroke-width="13" stroke-linecap="round"/>' +
      '<circle cx="-50" cy="-78" r="7" fill="#f2c8a4"/><circle cx="40" cy="-92" r="7" fill="#f2c8a4"/><ellipse cx="34" cy="-86" rx="8" ry="6" fill="#7a2a3a" ' + INK + '/>' +
      '<ellipse cx="0" cy="-196" rx="27" ry="25" fill="#f2c8a4" ' + INK + '/><path d="M-27 -196q-8 -10 -2 -20q4 8 6 18zM27 -196q8 -10 2 -20q-4 8 -6 18z" fill="#e8e4dc"/>' +
      '<circle cx="-9" cy="-198" r="7" fill="none" stroke="#2a1a24" stroke-width="2"/><circle cx="9" cy="-198" r="7" fill="none" stroke="#2a1a24" stroke-width="2"/><path d="M-2 -198h4" stroke="#2a1a24" stroke-width="2"/>' +
      '<circle cx="-9" cy="-198" r="2" fill="#2a1a24"/><circle cx="9" cy="-198" r="2" fill="#2a1a24"/><path d="M-5 -182q5 -3 10 0" fill="none" ' + INK + '/><circle cx="0" cy="-189" r="3" fill="#e8a888"/>',
    tuttle: '<ellipse cx="0" cy="3" rx="56" ry="8" fill="#000" opacity=".3"/>' +
      '<path d="M-26 0v-130h22v130zM4 0v-130h22v130z" fill="#d7792e" ' + INK + '/><path d="M-22 -130v130M-12 -130v130M10 -130v130M20 -130v130" stroke="#3e7a3a" stroke-width="2"/>' +
      '<path d="M-34 0h30v-10h-28zM4 0h32l-3 -10h-29z" fill="#5a2a14"/>' +
      '<path d="M-62 -110q-8 -140 62 -150q70 10 62 150z" fill="#e0843a" ' + INK + '/>' +
      '<path d="M-50 -110q0 -120 50 -138M-20 -112q-2 -110 20 -136M20 -112q2 -110 -20 -136M50 -110q0 -120 -50 -138M-60 -140h120M-60 -180h120M-50 -220h100" fill="none" stroke="#3e7a3a" stroke-width="2.4"/>' +
      '<path d="M-10 -250l10 30 10 -30z" fill="#fff"/><path d="M-7 -246q7 6 14 0l-7 10z" fill="#d61e2a"/>' +
      '<path d="M-54 -220q-22 40 -14 90" fill="none" stroke="#e0843a" stroke-width="20" stroke-linecap="round"/><path d="M54 -220q30 20 34 -26" fill="none" stroke="#e0843a" stroke-width="20" stroke-linecap="round"/>' +
      '<circle cx="-68" cy="-128" r="11" fill="#e8a080"/><circle cx="88" cy="-250" r="11" fill="#e8a080"/>' +
      '<ellipse cx="0" cy="-286" rx="33" ry="32" fill="#e8907a" ' + INK + '/>' +
      '<path d="M-36 -296q0 -36 36 -38q40 2 38 40q-36 -10 -74 -2z" fill="#6a7a3a" ' + INK + '/><path d="M-38 -296q-2 6 4 6h72q6 0 2 -8" fill="#4a5a2a"/>' +
      '<circle cx="-12" cy="-284" r="3.2" fill="#2a1a24"/><circle cx="12" cy="-284" r="3.2" fill="#2a1a24"/><ellipse cx="0" cy="-272" rx="8" ry="6" fill="#d06a5a"/>' +
      '<path d="M-2 -264q-18 -6 -34 6q-6 -10 6 -14q14 -4 28 2zM2 -264q18 -6 34 6q6 -10 -6 -14q-14 -4 -28 2z" fill="#4a2a14"/>' +
      '<path d="M-10 -254q10 8 20 0" fill="none" ' + INK + '/>',
    plunkett: '<ellipse cx="0" cy="3" rx="40" ry="6" fill="#000" opacity=".3"/>' +
      '<path d="M34 0l-10 -150" stroke="#5a3a1a" stroke-width="6" stroke-linecap="round"/><path d="M14 -150q10 -12 20 0" fill="none" stroke="#5a3a1a" stroke-width="6"/>' +
      '<path d="M-12 0v-40h9v40zM3 0v-40h9v40z" fill="#3a2a4a"/><path d="M-18 0h16v-7h-13zM2 0h17l-3 -7h-14z" fill="#2a1a12"/>' +
      '<path d="M-30 -36q-6 -100 30 -110q36 8 30 110z" fill="#4a7a5a" ' + INK + '/>' +
      '<path d="M-34 -70q-4 -84 30 -94q38 6 36 92q-30 10 -66 2z" fill="#7a3f9a" ' + INK + '/>' +
      '<path d="M-20 -100h12v14h-12zM10 -98h12v14h-12z" fill="#5a2a7a"/><circle cx="-14" cy="-96" r="4" fill="#ff5a8a"/><circle cx="16" cy="-94" r="4" fill="#f2c040"/>' +
      '<path d="M24 -150q8 -6 4 4" fill="none" stroke="#7a3f9a" stroke-width="11" stroke-linecap="round"/><circle cx="24" cy="-150" r="6" fill="#f0d0b6"/>' +
      '<ellipse cx="-4" cy="-180" rx="21" ry="22" fill="#f0d0b6" ' + INK + '/>' +
      '<circle cx="-12" cy="-182" r="9" fill="#fff" fill-opacity=".5" stroke="#2a1a24" stroke-width="2.4"/><circle cx="6" cy="-182" r="9" fill="#fff" fill-opacity=".5" stroke="#2a1a24" stroke-width="2.4"/>' +
      '<circle cx="-12" cy="-182" r="2.6" fill="#2a1a24"/><circle cx="6" cy="-182" r="2.6" fill="#2a1a24"/><path d="M-10 -167q6 4 12 0" fill="none" ' + INK + '/>' +
      '<path d="M-26 -186q-2 -22 22 -24q24 2 22 24q-10 -12 -22 -12t-22 12z" fill="#f4f0ea"/>' +
      '<path d="M-28 -196q0 -30 24 -30q26 0 26 30z" fill="#3e8a4a" ' + INK + '/><circle cx="-4" cy="-232" r="9" fill="#f2c040" ' + INK + '/><path d="M-28 -196h50" stroke="#2a6a3a" stroke-width="4"/>',
    cocoon: '<ellipse cx="0" cy="3" rx="70" ry="10" fill="#000" opacity=".25"/>' +
      '<path d="M-26 0h22v-10h-20zM6 0h24l-3 -10h-21z" fill="#5a2a14"/>' +
      '<path d="M-70 -20q-30 -80 0 -160q10 -80 70 -90q60 10 72 90q30 80 0 160q-30 30 -72 26q-40 4 -70 -26z" fill="#ffb3d1" stroke="#e48ab0" stroke-width="3"/>' +
      '<path d="M-56 -60q30 -30 60 0t60 0M-60 -120q30 -26 60 0t60 0M-50 -190q24 -22 50 0t50 0M-40 -40q40 20 80 0" fill="none" stroke="#ff8ec0" stroke-width="3" opacity=".8"/>' +
      '<path d="M-2 -226q-18 -6 -34 6q-6 -10 6 -14q14 -4 28 2zM2 -226q18 -6 34 6q6 -10 -6 -14q-14 -4 -28 2z" fill="#4a2a14"/>' +
      '<circle cx="-12" cy="-244" r="3.4" fill="#2a1a24"/><circle cx="12" cy="-244" r="3.4" fill="#2a1a24"/>',
    wrapped: '<ellipse cx="0" cy="3" rx="70" ry="9" fill="#000" opacity=".25"/>' +
      '<path d="M-56 -150l-46 -40v90zM56 -150l46 -40v90z" fill="#e8c048" stroke="#a8822a" stroke-width="3"/><path d="M-60 -150l-30 -30M-60 -150l-36 -10M60 -150l30 -30M60 -150l36 -10" stroke="#a8822a" stroke-width="2"/>' +
      '<rect x="-60" y="-290" width="120" height="290" rx="54" fill="#f2cf5a" stroke="#a8822a" stroke-width="3"/>' +
      '<path d="M-60 -60h120M-60 -230h120" stroke="#d9a830" stroke-width="5"/><path d="M-40 -280q-6 140 0 270" stroke="#fff6c8" stroke-width="7" opacity=".6" fill="none"/>' +
      '<ellipse cx="0" cy="-200" rx="30" ry="36" fill="#dff2fa" stroke="#a8822a" stroke-width="3"/>' +
      '<path d="M-22 -206q-14 -28 4 -40q14 -10 30 0q16 14 2 40" fill="#f4d47a"/><ellipse cx="0" cy="-196" rx="14" ry="17" fill="#f0c7a8"/>' +
      '<path d="M-10 -200h7M3 -200h7" stroke="#2a1a24" stroke-width="2.6" stroke-linecap="round"/><path d="M-5 -186q5 4 10 0q-5 -2 -10 0z" fill="#d1103e"/>' +
      '<text x="0" y="-100" font-family="Fredericka the Great,serif" font-size="22" fill="#8a5a1a" text-anchor="middle">MORTLAKE</text>',
    catsit: '<ellipse cx="0" cy="2" rx="30" ry="5" fill="#000" opacity=".25"/><path d="M-22 0q-6 -40 6 -56q-8 -18 2 -30l8 10q8 -4 16 0l8 -10q10 12 2 30q12 16 6 56z" fill="#e8913a" ' + INK + '/>' +
      '<path d="M22 -4q26 0 22 -22" fill="none" stroke="#e8913a" stroke-width="8" stroke-linecap="round"/><path d="M-10 -40h20M-12 -30h24M-10 -20h20" stroke="#c46a1a" stroke-width="3"/>' +
      '<path d="M-7 -68q3 -3 6 0M3 -68q3 -3 6 0" fill="none" stroke="#2a1a24" stroke-width="2.2"/><path d="M-2 -62l2 2 2 -2" fill="none" stroke="#2a1a24" stroke-width="1.8"/>' +
      '<path d="M-6 -60l-16 -2M-6 -58l-15 4M8 -60l16 -2M8 -58l15 4" stroke="#fff" stroke-width="1"/>',
    catsleep: '<ellipse cx="0" cy="2" rx="38" ry="5" fill="#000" opacity=".25"/><path d="M-36 0q0 -34 34 -34q40 0 38 34z" fill="#e8913a" ' + INK + '/>' +
      '<path d="M-30 -10q-8 -20 6 -26l4 -12 8 8q8 -2 12 2" fill="#e8913a" ' + INK + '/><path d="M-22 -22q3 2 6 0" fill="none" stroke="#2a1a24" stroke-width="2"/>' +
      '<path d="M36 -4q10 -2 4 -12q-8 6 -40 6" fill="none" stroke="#c46a1a" stroke-width="5" stroke-linecap="round"/><path d="M-4 -30v26M8 -32v28M20 -30v24" stroke="#c46a1a" stroke-width="3"/>'
  };
  X.fig = function (who) { return FIG[who] || ''; };

  /* a glass jar of sweets with a label: x, y of the foot, w wide, h high */
  X.jar = function (x, y, w, h, sweet, label, labFont) {
    var s = '', i, k, r = w / 2, top = y - h;
    s += '<path d="M' + (x - r) + ' ' + (y - 8) + 'v' + (-(h - 30)) + 'q0 -12 ' + (r * 0.3) + ' -14h' + (w * 0.7) + 'q' + (r * 0.3) + ' 2 ' + (r * 0.3) + ' 14v' + (h - 30) + 'q0 8 -8 8h' + (-(w - 16)) + 'q-8 0 -8 -8z" fill="#e8f4f6" fill-opacity=".35" stroke="#9ab6c0" stroke-width="2"/>';
    for (i = 0; i < 26; i++) { k = (i * 37) % 100 / 100; s += '<circle cx="' + (x - r + 8 + ((i * 53) % (w - 16))).toFixed(1) + '" cy="' + (y - 12 - ((i * 29) % Math.max(10, h - 44)) * 0.9).toFixed(1) + '" r="' + (w / 12 + k * 3).toFixed(1) + '" fill="' + sweet[i % sweet.length] + '"/>'; }
    s += '<rect x="' + (x - r * 0.62) + '" y="' + (top - 6) + '" width="' + (w * 0.62) + '" height="14" rx="3" fill="#b0402a" stroke="#6a2414" stroke-width="1.5"/>';
    s += '<path d="M' + (x - r + 6) + ' ' + (top + 18) + 'v' + (h - 40) + '" stroke="#fff" stroke-width="4" opacity=".5"/>';
    if (label) s += '<rect x="' + (x - r + 6) + '" y="' + (y - h * 0.62) + '" width="' + (w - 12) + '" height="' + (h * 0.28) + '" rx="3" fill="#fff8e4" stroke="#8a6a3a" stroke-width="1.5"/>' + label;
    return s;
  };
  return X;
})();
