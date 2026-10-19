/* Past the Lion - what the five rooms of the story share.
   THE MAZE IS DATA: one list of ways through the hedges (EDGES), and everything else is made from it: Goodchild's plan,
   every view from inside, the photographs, the walk that follows a line of directions, and the maze seen from the terrace.
   So the plan, the views and the text cannot disagree. Squares are named "x,y": x from the west (0) to the east (6),
   y from the north (0) to the south (6). One square is three metres, which Goodchild calls four paces.
   Loaded after engine.js. Nothing in here knows an answer. */
window.MZ = (function () {
  'use strict';
  var X = {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- the maze ---------- */
  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];                       /* 0 north, 1 east, 2 south, 3 west */
  X.DX = DX; X.DY = DY; X.DN = 'NESW';
  var EDGES = ('0,0-1,0 1,0-1,1 1,0-2,0 2,0-3,0 3,0-4,0 4,0-4,1 4,1-5,1 5,1-5,0 5,1-6,1 6,1-6,0 6,1-6,2 5,1-5,2 5,2-4,2 4,2-3,2 ' +
    '3,2-3,3 3,0-3,1 2,0-2,1 2,1-2,2 2,2-2,3 1,1-0,1 0,1-0,2 1,1-1,2 1,2-1,3 1,3-1,4 3,3-4,3 4,3-5,3 5,3-6,3 1,4-2,4 2,4-3,4 ' +
    '2,4-2,5 2,5-1,5 1,5-0,5 0,5-0,4 0,4-0,3 1,5-1,6 1,6-0,6 1,6-2,6 2,5-3,5 3,5-3,6 3,5-4,5 4,5-5,5 5,5-6,5 4,5-4,6 5,5-5,6 ' +
    '6,5-6,6 4,5-4,4 4,4-5,4 5,4-6,4').split(' ');
  var ODD = { '1,3-1,4': 'gap', '1,1-1,2': 'steps' };              /* the gap behind the lion (with the near steps), and the far steps */
  var THING = { '5,6': ['bench', 2], '3,4': ['bench', 0], '0,3': ['bench', 0], '1,4': ['lion', 3], '5,0': ['urn', 0], '3,3': ['dial', -1] };   /* [what, the side it stands against] */
  var SUNK = { '1,3': 1, '1,2': 1 };                                /* the Dip */
  var WAY = {};
  EDGES.forEach(function (e) { var p = e.split('-'), k = ODD[e] || 'open'; WAY[p[0] + '>' + p[1]] = k; WAY[p[1] + '>' + p[0]] = k; });
  /* what is on side d of square x,y: 'open', 'gap', 'steps', 'gate', 'door', or null for a hedge */
  X.kind = function (x, y, d) {
    if (x === 3 && y === 6 && d === 2) return 'gate';
    if (x === 6 && y === 3 && d === 1) return 'door';
    return WAY[x + ',' + y + '>' + (x + DX[d]) + ',' + (y + DY[d])] || null;
  };
  X.pass = function (x, y, d) { var k = X.kind(x, y, d); return k === 'open' || k === 'gap' || k === 'steps'; };
  X.thing = function (x, y) { return THING[x + ',' + y] || null; };
  X.sunk = function (x, y) { return !!SUNK[x + ',' + y]; };

  /* What is seen from square x,y looking in direction d: one entry for each square of the lane ahead (the first is the
     square you stand in). l, r: the side (0 = hedge); lf, rf: is the side lane shut just beyond the opening?;
     f: 'lion:a' a thing and where it stands (a ahead, l, r, b behind, c in the middle); s: sunk; hl, hr: a hat over
     that hedge; fw: how the lane goes on. end: what stops it. */
  X.describe = function (x, y, d, hats) {
    var cells = [], L = (d + 3) % 4, R = (d + 1) % 4, c, t, fw;
    function shut(cx, cy) { var k = X.kind(cx, cy, d); return !k || k === 'gap' ? 1 : 0; }      /* a gap that has all but grown over looks like hedge from the side */
    function hat(cx, cy) { return (hats || []).some(function (h) { return h[0] === cx && h[1] === cy; }); }
    for (;;) {
      c = { l: X.kind(x, y, L) || 0, r: X.kind(x, y, R) || 0 };
      if (c.l) c.lf = shut(x + DX[L], y + DY[L]);
      if (c.r) c.rf = shut(x + DX[R], y + DY[R]);
      t = THING[x + ',' + y];
      if (t) c.f = t[0] + ':' + (t[1] < 0 ? 'c' : 'arbl'.charAt((t[1] - d + 4) % 4));
      if (SUNK[x + ',' + y]) c.s = 1;
      if (!c.l && hat(x + DX[L], y + DY[L])) c.hl = 1;
      if (!c.r && hat(x + DX[R], y + DY[R])) c.hr = 1;
      cells.push(c);
      fw = X.kind(x, y, d);
      if (fw === 'open' || fw === 'gap' || fw === 'steps') { c.fw = fw; x += DX[d]; y += DY[d]; continue; }
      return { c: cells, end: fw || 'hedge' };
    }
  };
  var KEYS = ['l', 'r', 'lf', 'rf', 'f', 's', 'hl', 'hr', 'fw'];
  /* are two views the same in every detail? (the test uses it to hold each photograph to the maze) */
  X.same = function (a, b) {
    if (a.c.length !== b.c.length || a.end !== b.end) return false;
    return a.c.every(function (c, i) { return KEYS.every(function (k) { return (c[k] || 0) === (b.c[i][k] || 0); }); });
  };
  /* Where does what a photograph shows differ from the view at a pin? null, or the first difference. The sides of the
     square the camera stands in are outside the picture, and so is a hat. */
  X.differ = function (ph, v) {
    var i, n = Math.min(ph.c.length, v.c.length), a, b;
    for (i = 0; i < ph.c.length; i++) {
      a = ph.c[i].f || ''; b = (v.c[i] && v.c[i].f) || '';
      if (a && a !== b) return { what: 'thing', k: i, a: a, b: b, near: v.c.map(function (c) { return (c.f || '').split(':')[0]; }).indexOf(a.split(':')[0]) };
    }
    for (i = 0; i < n; i++) {
      if ((v.c[i].f || '') !== (ph.c[i].f || '')) return { what: 'extra', k: i, b: v.c[i].f };
      if (i && (ph.c[i].l || 0) !== (v.c[i].l || 0)) return { what: 'side', side: 'left', k: i, a: ph.c[i].l || 0, b: v.c[i].l || 0 };
      if (i && (ph.c[i].r || 0) !== (v.c[i].r || 0)) return { what: 'side', side: 'right', k: i, a: ph.c[i].r || 0, b: v.c[i].r || 0 };
    }
    if (ph.c.length !== v.c.length) return { what: 'len', a: ph.c.length, b: v.c.length };
    if (ph.end !== v.end) return { what: 'end', a: ph.end, b: v.end };
    return null;
  };

  /* One line of directions, done exactly as it is written. st = {x, y, d}; ln = ['turn', 'left'|'right'|'round'],
     ['back', thing], ['take', n, 'left'|'right'], ['far', 'can'|thing], ['past'], ['hedge', 'left'|'right', thing].
     Returns {ok, why, x, y, d, trail: [[x, y], ...], n}. Nobody is carried past the lion or down the steps except by
     the line that says so. */
  X.act = function (st, ln) {
    var x = st.x, y = st.y, d = st.d, tr = [], sd, got, t, i, j, nd, hand, turns, moved;
    function here(name) { var q = THING[x + ',' + y]; return !!q && q[0] === name; }
    function res(ok, why, n) { return { ok: ok, why: why || '', x: x, y: y, d: d, trail: tr, n: n || 0 }; }
    function go() { x += DX[d]; y += DY[d]; tr.push([x, y]); }
    if (ln[0] === 'turn') { d = (d + (ln[1] === 'left' ? 3 : ln[1] === 'right' ? 1 : 2)) % 4; return res(true); }
    if (ln[0] === 'back') {
      t = THING[x + ',' + y];
      if (!t || t[0] !== ln[1] || t[1] < 0) return res(false, 'nothing');
      d = (t[1] + 2) % 4; return res(true);
    }
    if (ln[0] === 'take') {
      sd = (d + (ln[2] === 'left' ? 3 : 1)) % 4; got = 0;
      while (X.kind(x, y, d) === 'open') {
        go();
        if (X.kind(x, y, sd) === 'open' && ++got === ln[1]) { d = sd; go(); return res(true); }
      }
      return res(false, 'few', got);
    }
    if (ln[0] === 'far') {
      if (X.kind(x, y, d) !== 'open') return res(false, 'wall');
      while (X.kind(x, y, d) === 'open') { go(); if (ln[1] !== 'can' && here(ln[1])) return res(true); }
      return ln[1] === 'can' ? res(true) : res(false, 'nosuch');
    }
    if (ln[0] === 'past') {
      if (!here('lion')) return res(false, 'nolion');
      for (i = 0; i < 4; i++) if (X.kind(x, y, i) === 'gap') d = i;
      go();
      while (SUNK[x + ',' + y] && X.pass(x, y, d)) go();
      return res(true);
    }
    if (ln[0] === 'hedge') {
      hand = ln[1] === 'left' ? 3 : 1; turns = [hand, 0, (hand + 2) % 4, 2];
      for (i = 0; i < 90; i++) {
        if (tr.length && here(ln[2])) return res(true);
        moved = false;
        for (j = 0; j < 4 && !moved; j++) {
          nd = (d + turns[j]) % 4;
          if (X.kind(x, y, nd) === 'open') { d = nd; go(); moved = true; }
        }
        if (!moved) return res(false, 'stuck');
      }
      return res(false, 'round');
    }
    return res(false, 'what');
  };
  /* a walk with its loops and dead ends cut out */
  X.straighten = function (cells) {
    var out = [], i, j, k;
    for (i = 0; i < cells.length; i++) {
      k = cells[i][0] + ',' + cells[i][1]; j = out.indexOf(k);
      if (j >= 0) out.length = j + 1; else out.push(k);
    }
    return out;
  };

  /* ---------- sounds (through the engine, so that the sound button switches them) ---------- */
  X.sfx = {
    step: function () { B({ type: 'bandpass', f: 1500, q: 0.9, dur: 0.11, peak: 0.07, a: 0.02 }); B({ type: 'bandpass', f: 2300, q: 1.2, dur: 0.08, peak: 0.04, a: 0.02, when: 0.07 }); },      /* a step on gravel */
    squelch: function () { T({ f: 150, f2: 70, dur: 0.18, peak: 0.2 }); B({ type: 'lowpass', f: 600, dur: 0.16, peak: 0.16, a: 0.03 }); },
    turn: function () { B({ type: 'highpass', f: 3000, dur: 0.1, peak: 0.035, a: 0.03 }); },
    leaf: function () { B({ type: 'highpass', f: 3600, dur: 0.3, peak: 0.07, a: 0.08 }); },                                  /* a hand, or a shoulder, in a hedge */
    stamp: function () { T({ f: 130, f2: 70, dur: 0.12, peak: 0.42 }); B({ dur: 0.04, f: 1500, q: 1, peak: 0.2 }); },
    pin: function () { T({ f: 320, f2: 180, dur: 0.06, peak: 0.16 }); B({ dur: 0.025, f: 2600, q: 3, peak: 0.1 }); },
    pencil: function () { B({ type: 'bandpass', f: 2200, q: 1.4, dur: 0.11, peak: 0.06, a: 0.02 }); },
    lid: function () { T({ f: 900, f2: 620, dur: 0.5, peak: 0.1 }); T({ f: 1790, dur: 0.35, peak: 0.04 }); B({ dur: 0.03, f: 2400, q: 2, peak: 0.16 }); },   /* the lid of a tea urn */
    horn: function () { T({ type: 'square', f: 392, dur: 0.16, peak: 0.05 }); T({ type: 'square', f: 494, dur: 0.22, peak: 0.05, when: 0.2 }); }             /* the horn of an electric scooter */
  };
  X.solved = function (quiet) {
    var sung = false;
    try { sung = !!(ER.music && ER.music() && ER.track && ER.track.sting('solved', null, !!quiet)); } catch (e) {}
    if (!sung && !quiet) ER.sfx.ok();
  };

  /* ---------- small helpers ---------- */
  X.item = function (sel, word, line, busy) {
    ER.$$(sel).forEach(function (n) {
      n.addEventListener('click', function (e) {
        if (busy && busy()) return;
        if (word) ER.wordAt(e.clientX, e.clientY, word);
        if (line) ER.say(typeof line === 'function' ? line() : line);
      });
    });
  };
  X.mine = function (id, title, html, quiet) { return ER.addClue(id, title, '<h4>' + title + '</h4>' + html, 'mine', 'Your notes', quiet); };
  X.words = function (list) {
    var G = window.GLOSS || [];
    list.forEach(function (w) { for (var i = 0; i < G.length; i++) if (G[i][0] === w) { ER.addWord(G[i][0], G[i][1]); break; } });
  };
  X.mins = function () {
    var st = ER.state(), end = ER.flag('tEnd') || Date.now();
    if (st.fin && st.fin.secs) return Math.max(1, Math.round(st.fin.secs / 60));
    return Math.max(1, Math.round((end - (st.t0 || end)) / 60000));
  };

  /* ---------- the view from inside ---------- */
  var CX = 800, CY = 330, PM = 186.7, HT = 1.8;                     /* PM: pixels for a metre, one square away; HT: the hedges are 1.8 m */
  function r1(n) { return Math.round(n * 10) / 10; }
  function px(lat, d) { return CX + lat * PM / d; }
  function py(h, d, eye) { return CY - (h - eye) * PM / d; }
  function P(lat, h, d, eye) { return r1(px(lat, d)) + ',' + r1(py(h, d, eye)); }
  function poly(pts, fill, more) { return '<polygon points="' + pts.join(' ') + '" fill="' + fill + '"' + (more || '') + '/>'; }
  function mix(a, b, t) {
    var o = '#', i, u, v;
    for (i = 1; i < 7; i += 2) { u = parseInt(a.substr(i, 2), 16); v = parseInt(b.substr(i, 2), 16); o += ('0' + Math.round(u + (v - u) * t).toString(16)).slice(-2); }
    return o;
  }
  function fog(col, k) { return mix(col, '#a8c9a6', Math.min(0.5, k * 0.085)); }
  var HEDGE = { l: '#2a5a2b', r: '#3f7d37', f: '#34692f' }, STONE = '#a39c8a', GRAVEL = '#dccb9c', MUD = '#6a4f33';

  /* a hedge from one corner to another (both at the same height range): the yew, its lit top, and stone below ground level */
  function hedge(pts4, col, k, id, low) {
    return poly(pts4, fog(col, k)) + poly(pts4, 'url(#' + id + '-leaf)', ' opacity="' + r1(Math.max(0.25, 0.75 - k * 0.1)) + '"') +
      '<polyline points="' + pts4[0] + ' ' + pts4[1] + '" fill="none" stroke="' + fog('#7fb065', k) + '" stroke-width="' + r1(Math.max(1.5, 7 - k * 1.4)) + '" stroke-linecap="round"/>' + (low || '');
  }
  function sideWall(lat, dn, df, g, eye, col, k, id) {
    var low = g < 0 ? poly([P(lat, 0, dn, eye), P(lat, 0, df, eye), P(lat, g, df, eye), P(lat, g, dn, eye)], fog(lat < 0 ? '#8d8676' : STONE, k)) +
      '<polyline points="' + P(lat, 0, dn, eye) + ' ' + P(lat, 0, df, eye) + '" fill="none" stroke="#6f6a5c" stroke-width="3"/>' : '';
    return hedge([P(lat, HT, dn, eye), P(lat, HT, df, eye), P(lat, 0, df, eye), P(lat, 0, dn, eye)], col, k, id, low);
  }
  function flat(l1, l2, d, g, eye, k, id, x1, x2) {                 /* a hedge that faces you; x1, x2: screen limits */
    var a = px(l1, d), b = px(l2, d), t = py(HT, d, eye), z = py(0, d, eye), s;
    if (x1 != null) { a = Math.max(a, x1); b = Math.min(b, x2); }
    if (b - a < 0.5) return '';
    function q(y1, y2) { return [r1(a) + ',' + r1(y1), r1(b) + ',' + r1(y1), r1(b) + ',' + r1(y2), r1(a) + ',' + r1(y2)]; }
    s = hedge(q(t, z), HEDGE.f, k, id);
    if (g < 0) s += poly(q(z, py(g, d, eye)), fog(STONE, k)) + '<path d="M' + r1(a) + ' ' + r1(z) + 'H' + r1(b) + '" stroke="#6f6a5c" stroke-width="3"/>';
    return s;
  }
  function sideGap(sgn, c, key, k, dn, df, g, eye, id) {
    var lat = sgn * 1.5, kd = c[key], near = c[key + 'f'], D = near ? df : df + 1, lo = px(lat, sgn < 0 ? dn : df), hi = px(lat, sgn < 0 ? df : dn), s = '', m1, m2;
    if (kd === 'gap') {                                              /* a hedge that has all but grown across a way through */
      m1 = (dn + df) / 2 - 0.13 * (df - dn + 0.4); m2 = (dn + df) / 2 + 0.13 * (df - dn + 0.4);
      return sideWall(lat, dn, df, g, eye, sgn < 0 ? HEDGE.l : HEDGE.r, k, id) +
        poly([P(lat, HT - 0.28, m1, eye), P(lat, HT - 0.34, m2, eye), P(lat, 0, m2, eye), P(lat, 0, m1, eye)], '#0e2412') +
        poly([P(lat, 0.5, (m1 + m2) / 2, eye), P(lat, 0.5, m2, eye), P(lat, 0, m2, eye), P(lat, 0, (m1 + m2) / 2, eye)], '#55503f', ' opacity=".8"');
    }
    if (!near) s += sideWall(sgn * 4.5, df, D, 0, eye, sgn < 0 ? HEDGE.l : HEDGE.r, k + 1, id);
    s += flat(sgn < 0 ? -4.5 : 1.5, sgn < 0 ? -1.5 : 4.5, D, 0, eye, k + (near ? 0 : 1), id, lo, hi);
    if (kd === 'steps') s += '<path d="M' + P(lat, 0, dn + 0.08, eye).replace(',', ' ') + 'L' + P(lat, 0, df - 0.08, eye).replace(',', ' ') + '" stroke="#8d8676" stroke-width="' + r1(9 / (k + 0.6)) + '"/>';
    return s;
  }
  function stairs(d0, d1, h0, h1, eye, k) {                          /* from (d0, h0) to (d1, h1), four treads, drawn from the far end */
    var s = '', n = 4, i, a, b, h, up = h1 > h0, w = 1.42;
    for (i = n - 1; i >= 0; i--) {
      a = d0 + (d1 - d0) * i / n; b = d0 + (d1 - d0) * (i + 1) / n;
      h = up ? h0 + (h1 - h0) * i / n : h0 + (h1 - h0) * (i + 1) / n;
      if (up) s += poly([P(-w, h + (h1 - h0) / n, b, eye), P(w, h + (h1 - h0) / n, b, eye), P(w, h, b, eye), P(-w, h, b, eye)], fog('#7d7768', k));
      a = Math.max(a, 0.1);
      s += poly([P(-w, h, a, eye), P(w, h, a, eye), P(w, h, b, eye), P(-w, h, b, eye)], fog(up ? '#b3ad9b' : (i % 2 ? '#a9a391' : '#b9b3a1'), k), ' stroke="#6f6a5c" stroke-width="1.5"');
    }
    return s;
  }
  /* the things in the maze, drawn in centimetres with the ground at 0 and up as minus */
  var SPR = {
    bench: '<ellipse cx="0" cy="2" rx="88" ry="9" fill="#2b3f1c" opacity=".3"/>' +
      '<path d="M-74 0v-92h7V0zM67 0v-92h7V0zM-58 0v-44h6V0zM52 0v-44h6V0z" fill="#d9d4c2"/>' +
      '<path d="M-78 -90h156v7h-156zM-78 -77h156v6h-156zM-78 -65h156v6h-156z" fill="#f6f3e8"/><path d="M-80 -50h160v8h-160z" fill="#f6f3e8"/><path d="M-80 -42h160v4h-160z" fill="#bdb8a6"/>' +
      '<path d="M-84 -62h14v5h-14zM70 -62h14v5h-14z" fill="#e9e5d6"/>',
    lion: '<ellipse cx="0" cy="3" rx="64" ry="10" fill="#2b3f1c" opacity=".3"/>' +
      '<path d="M-46 0v-12h92v12zM-40 -12v-40h80v40zM-46 -52v-9h92v9z" fill="#b5ae9c"/><path d="M-40 -12h80M-40 -52h80" stroke="#8d8676" stroke-width="2.5"/>' +
      '<path d="M-36 -61q-10 -30 4 -52h64q14 22 4 52z" fill="#a9a290"/>' +
      '<path d="M-22 -61v-48q0 -8 7 -8t7 8v48zM8 -61v-48q0 -8 7 -8t7 8v48z" fill="#bdb6a4"/><path d="M-26 -61h20v-6h-20zM6 -61h20v-6h-20z" fill="#cdc7b6"/>' +
      '<path d="M-24 -66v5M-19 -66v5M-14 -66v5M8 -66v5M13 -66v5M18 -66v5" stroke="#8d8676" stroke-width="1.6"/>' +
      '<path d="M0 -176q-20 0 -32 12t-10 30q-8 8 -4 18q6 12 18 14q12 10 28 10t28 -10q12 -2 18 -14q4 -10 -4 -18q2 -18 -10 -30t-32 -12z" fill="#968f7d"/>' +
      '<path d="M-30 -158q-10 14 -8 30M30 -158q10 14 8 30M-18 -170q-6 8 -6 18M18 -170q6 8 6 18M-34 -118q6 12 16 16M34 -118q-6 12 -16 16" stroke="#7b7566" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M-24 -160l-4 -14 14 6zM24 -160l4 -14 -14 6z" fill="#a9a290"/>' +
      '<ellipse cx="0" cy="-140" rx="23" ry="26" fill="#c2bca9"/>' +
      '<path d="M-15 -150q5 -5 10 0M5 -150q5 -5 10 0" stroke="#5d584c" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="-10" cy="-146" r="2.4" fill="#4a463c"/><circle cx="10" cy="-146" r="2.4" fill="#4a463c"/>' +
      '<path d="M-7 -138h14l-4 7h-6z" fill="#7b7566"/><ellipse cx="0" cy="-123" rx="12" ry="9" fill="#2d2a24"/>' +
      '<path d="M-9 -129l3 6 3 -6M3 -129l3 6 3 -6" stroke="#e7e2d2" stroke-width="1.6" fill="none"/><path d="M-12 -131q12 -8 24 0" stroke="#8d8676" stroke-width="2.4" fill="none"/>' +
      '<path d="M-30 -30q8 6 14 0M20 -96q6 -5 10 2" stroke="#5f8a4a" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>',
    urn: '<ellipse cx="0" cy="3" rx="50" ry="8" fill="#2b3f1c" opacity=".3"/>' +
      '<path d="M-36 0v-9h72v9zM-30 -9v-66h60v66zM-36 -75v-8h72v8z" fill="#b5ae9c"/><path d="M-30 -9h60M-30 -75h60" stroke="#8d8676" stroke-width="2.5"/><path d="M-18 -62h36v40h-36z" fill="none" stroke="#9a9382" stroke-width="2"/>' +
      '<path d="M-16 -83q0 -8 6 -11h20q6 3 6 11z" fill="#a9a290"/>' +
      '<path d="M-9 -94q-34 -12 -38 -44q-1 -8 5 -12h84q6 4 5 12q-4 32 -38 44z" fill="#bdb6a4"/>' +
      '<path d="M-50 -150q0 -6 6 -6h88q6 0 6 6t-6 6h-88q-6 0 -6 -6z" fill="#cdc7b6"/><ellipse cx="0" cy="-152" rx="40" ry="3.4" fill="#3d392f"/>' +
      '<path d="M-44 -136q-16 -2 -14 10q2 9 16 10M44 -136q16 -2 14 10q-2 9 -16 10" stroke="#a9a290" stroke-width="5" fill="none"/>' +
      '<path d="M-30 -128q30 14 60 0M-22 -112q22 9 44 0" stroke="#9a9382" stroke-width="2" fill="none"/><path d="M-28 -40q6 5 12 0" stroke="#5f8a4a" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>',
    dial: '<ellipse cx="0" cy="3" rx="58" ry="9" fill="#2b3f1c" opacity=".28"/>' +
      '<path d="M-46 0v-9h92v9zM-34 -9v-9h68v9z" fill="#b5ae9c"/><path d="M-46 -9h92" stroke="#8d8676" stroke-width="2"/>' +
      '<path d="M-14 -18q-10 -10 -6 -24q8 -16 2 -30q-3 -10 4 -16h28q7 6 4 16q-6 14 2 30q4 14 -6 24z" fill="#bdb6a4"/><path d="M-12 -44h24M-10 -74h20" stroke="#9a9382" stroke-width="2"/>' +
      '<path d="M-30 -96h60v8h-60z" fill="#a9a290"/><path d="M-34 -102h68v6h-68z" fill="#cdc7b6"/><ellipse cx="0" cy="-103" rx="30" ry="3.6" fill="#6f8f6a"/>' +
      '<path d="M-4 -103l22 0 -22 -24z" fill="#5d7f5c"/>',
    cup: '<path d="M-9 0h18v-4h-18zM-3 -4h6v-8h-6z" fill="#b9c0c9"/><path d="M-13 -34q0 22 13 22t13 -22z" fill="#e3e8ee"/><path d="M-13 -34h26" stroke="#f7fafc" stroke-width="2.4"/>' +
      '<path d="M-13 -31q-9 0 -8 8t10 7M13 -31q9 0 8 8t-10 7" stroke="#c9d0d9" stroke-width="2.6" fill="none"/><path d="M-6 -30q-1 10 3 14" stroke="#fff" stroke-width="2" fill="none" opacity=".9"/>',
    cap: '<ellipse cx="14" cy="-104" rx="7.5" ry="2.6" fill="#17181c"/><ellipse cx="14" cy="-104.6" rx="5" ry="1.5" fill="#3a3c45"/>',
    hat: '<path d="M-17 -3q-1 -16 4 -19q13 -4 26 0q5 3 4 19z" fill="#f4efdf"/><path d="M-17 -6h34v5h-34z" fill="#2e3a4d"/><ellipse cx="0" cy="0" rx="26" ry="4.5" fill="#ebe5d2"/><path d="M-10 -21q10 -3 20 0" stroke="#d6cfba" stroke-width="1.5" fill="none"/>'
  };
  function sprite(name, lat, d, g, eye) {
    return '<g transform="translate(' + r1(px(lat, d)) + ' ' + r1(py(g, d, eye)) + ') scale(' + (Math.round(PM / d) / 100) + ')">' + SPR[name] + '</g>';
  }
  /* what stands beyond the hedges, by the way you face: the house is north of the maze, the church west, the tents south, the cedars east */
  function backdrop(bk) {
    if (bk === 0) return '<g><path d="M470 330v-112l60 -34h540l60 34v112z" fill="#e2cf9f"/><path d="M450 222l80 -52h540l80 52z" fill="#8a5f4a"/>' +
      '<path d="M560 170v-40h34v40zM980 170v-40h34v40zM770 170v-34h28v34z" fill="#b98a6a"/>' +
      '<g fill="#6f7f8f"><rect x="520" y="244" width="26" height="40"/><rect x="590" y="244" width="26" height="40"/><rect x="660" y="244" width="26" height="40"/><rect x="900" y="244" width="26" height="40"/><rect x="970" y="244" width="26" height="40"/><rect x="1040" y="244" width="26" height="40"/></g>' +
      '<path d="M1150 330v-150h80v150z" fill="#d6c292"/><path d="M1140 182l50 -44 50 44z" fill="#7a5442"/><path d="M1178 138v-26h24v26z" fill="#f1ead8"/><path d="M1172 112l18 -20 18 20z" fill="#5d7f5c"/><path d="M1190 92v-16" stroke="#3a3229" stroke-width="3"/>' +
      '<circle cx="1190" cy="216" r="22" fill="#f6f1e0" stroke="#3a3229" stroke-width="4"/><path d="M1190 216v-15M1190 216l11 6" stroke="#3a3229" stroke-width="3.5" stroke-linecap="round"/></g>';
    if (bk === 1) return '<g fill="#2f5a3c"><path d="M250 330q-20 -150 60 -200q80 50 60 200z"/><path d="M1180 330q-30 -190 70 -250q100 60 70 250z"/></g>' +
      '<g fill="#274c33"><path d="M620 330v-30q-90 -4 -150 -34q120 -6 150 -30q-60 -6 -110 -32q90 -2 110 -28q-40 -6 -70 -26q60 -2 80 -40q20 38 80 40q-30 20 -70 26q20 26 110 28q-50 26 -110 32q30 24 150 30q-60 30 -150 34v30z"/></g>';
    if (bk === 2) return '<g><path d="M300 330l30 -90 150 -70 150 70 30 90z" fill="#f7f3e6"/><path d="M330 240l150 -70 150 70" fill="none" stroke="#d6cfba" stroke-width="5"/><path d="M480 170v-44" stroke="#6b5a3c" stroke-width="4"/><path d="M480 126l44 12 -44 12z" fill="#c9453a"/>' +
      '<path d="M960 330l24 -70 116 -56 116 56 24 70z" fill="#f1ecdc"/><path d="M1100 204v-36" stroke="#6b5a3c" stroke-width="4"/><path d="M1100 168l36 10 -36 10z" fill="#2f6aa8"/>' +
      '<path d="M0 250q400 60 800 14t800 20" fill="none" stroke="#6b5a3c" stroke-width="2"/>' +
      '<g><path d="M90 260l22 2 -8 30z" fill="#c9453a"/><path d="M230 276l22 0 -10 30z" fill="#f2c14e"/><path d="M700 280l22 -4 -6 31z" fill="#2f6aa8"/><path d="M840 262l22 -1 -9 30z" fill="#c9453a"/><path d="M1320 262l22 2 -8 30z" fill="#f2c14e"/><path d="M1470 276l22 1 -10 30z" fill="#3f8a4e"/></g></g>';
    return '<g><path d="M0 330q200 -90 460 -40t500 -30t640 10v60z" fill="#8fb98a"/>' +
      '<path d="M720 330v-190h120v190z" fill="#cfc4a6"/><path d="M712 140v-22h16v12h20v-12h16v12h20v-12h16v12h20v-12h16v22z" fill="#bdb294"/>' +
      '<path d="M764 196q16 -30 32 0v40h-32z" fill="#5d5a52"/><path d="M780 118v-56" stroke="#3a3229" stroke-width="4"/><path d="M780 62l46 10 -46 12z" fill="#c9453a"/><path d="M620 330v-70l100 -40v110z" fill="#c2b698"/><path d="M612 262l108 -44" stroke="#8a5f4a" stroke-width="8"/></g>';
  }
  function endWall(end, d, g, eye, k, id) {
    var s = '', t = py(HT, d, eye), z = py(0, d, eye), a, b;
    if (end === 'gate') {                                            /* two pillars of yew, and the lawn between them */
      a = px(-0.75, d); b = px(0.75, d);
      s += '<rect x="' + r1(a) + '" y="' + r1(py(2.6, d, eye)) + '" width="' + r1(b - a) + '" height="' + r1(z - py(2.6, d, eye)) + '" fill="#bfe3a0"/>' +
        '<rect x="' + r1(a) + '" y="' + r1(py(0.6, d, eye)) + '" width="' + r1(b - a) + '" height="' + r1(z - py(0.6, d, eye)) + '" fill="#8fc56e"/>' +
        '<g stroke="#fbfaf2" stroke-width="' + r1(7 / (k + 0.7)) + '" fill="none"><path d="M' + r1(a) + ' ' + r1(py(1.05, d, eye)) + 'H' + r1(b) + 'M' + r1(a) + ' ' + r1(py(0.25, d, eye)) + 'H' + r1(b) +
        'M' + r1(a) + ' ' + r1(py(1.05, d, eye)) + 'L' + r1(b) + ' ' + r1(py(0.25, d, eye)) + '"/></g>' +
        flat(-1.5, -0.75, d, g, eye, k, id) + flat(0.75, 1.5, d, g, eye, k, id) +
        poly([P(-0.9, 2.35, d, eye), P(0.9, 2.35, d, eye), P(0.75, HT, d, eye), P(-0.75, HT, d, eye)], fog(HEDGE.f, k));
      return s;
    }
    s += flat(-1.5, 1.5, d, g, eye, k, id);
    if (end === 'door') {
      a = px(-0.5, d); b = px(0.5, d);
      s += '<rect x="' + r1(a) + '" y="' + r1(py(1.72, d, eye)) + '" width="' + r1(b - a) + '" height="' + r1(z - py(1.72, d, eye)) + '" fill="#3b6f6a" stroke="#234a46" stroke-width="3"/>' +
        '<path d="M' + r1((a + b) / 2) + ' ' + r1(py(1.72, d, eye)) + 'V' + r1(z) + '" stroke="#234a46" stroke-width="2"/><circle cx="' + r1(b - (b - a) * 0.16) + '" cy="' + r1(py(0.9, d, eye)) + '" r="' + r1(5 / (k + 0.7)) + '" fill="#d9c16a"/>';
    }
    return s;
  }
  /* V: a view from X.describe. o = {id: a name for this drawing's own patterns, bk: 0-3 which way it looks, cup, cap} */
  X.draw = function (V, o) {
    o = o || {};
    var id = o.id || 'mz', n = V.c.length, eye = 1.5 + (V.c[0].s ? -1 : 0), s, k, c, dn, df, g, f, nm, rel, fd, fl, prev, nxt;
    s = '<defs><linearGradient id="' + id + '-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f9fe0"/><stop offset=".55" stop-color="#a9d4f2"/><stop offset="1" stop-color="#e6f3f7"/></linearGradient>' +
      '<pattern id="' + id + '-leaf" width="58" height="46" patternUnits="userSpaceOnUse"><g fill="#16351a"><ellipse cx="8" cy="9" rx="6" ry="3"/><ellipse cx="33" cy="6" rx="7" ry="3"/><ellipse cx="50" cy="20" rx="6" ry="3"/><ellipse cx="20" cy="26" rx="7" ry="3.4"/><ellipse cx="42" cy="38" rx="6" ry="3"/><ellipse cx="6" cy="40" rx="5" ry="2.6"/></g>' +
      '<g fill="#6aa052"><ellipse cx="20" cy="12" rx="5" ry="2.4"/><ellipse cx="46" cy="9" rx="4" ry="2"/><ellipse cx="34" cy="24" rx="5" ry="2.4"/><ellipse cx="10" cy="26" rx="4" ry="2"/><ellipse cx="26" cy="40" rx="5" ry="2.4"/><ellipse cx="54" cy="34" rx="4" ry="2"/></g></pattern></defs>' +
      '<rect x="-1000" y="-400" width="3600" height="' + (CY + 400) + '" fill="url(#' + id + '-sky)"/>' +
      '<g fill="#fff" opacity=".85"><ellipse cx="' + (300 + (o.bk || 0) * 230) + '" cy="96" rx="130" ry="26"/><ellipse cx="' + (390 + (o.bk || 0) * 230) + '" cy="76" rx="86" ry="24"/><ellipse cx="' + (1500 - (o.bk || 0) * 310) + '" cy="150" rx="110" ry="20"/></g>' +
      (o.bk == null ? '' : backdrop(o.bk)) +
      '<rect x="-1000" y="' + CY + '" width="3600" height="' + (1320 - CY) + '" fill="' + GRAVEL + '"/>';
    for (k = n - 1; k >= 0; k--) {
      c = V.c[k]; dn = Math.max(k - 0.5, 0.14); df = k + 0.5; g = c.s ? -1 : 0; prev = k ? V.c[k - 1] : null; nxt = V.c[k + 1] || null;
      if (k === n - 1) s += endWall(V.end, df, g, eye, k, id);
      s += poly([P(-1.5, g, dn, eye), P(1.5, g, dn, eye), P(1.5, g, df, eye), P(-1.5, g, df, eye)], fog(c.s ? MUD : GRAVEL, k * 0.6));
      if (c.s) s += '<ellipse cx="' + r1(px(0.3, Math.max(k, 0.3))) + '" cy="' + r1(py(g, Math.max(k, 0.3), eye)) + '" rx="' + r1(120 / Math.max(k, 0.3)) + '" ry="' + r1(22 / Math.max(k, 0.3)) + '" fill="#8fa3ad" opacity=".55"/>';
      else if (k) s += '<path d="M' + P(-1.5, 0, dn, eye).replace(',', ' ') + 'L' + P(1.5, 0, dn, eye).replace(',', ' ') + '" stroke="#c4b283" stroke-width="2" opacity=".7"/>';
      if (c.s && nxt && !nxt.s) s += stairs(Math.max(df - 0.44, 0.1), df, -1, 0, eye, k);
      if (c.s && prev && !prev.s) s += stairs(dn, dn + 0.44, 0, -1, eye, k);
      if (k) {
        if (c.hl) s += sprite('hat', -2.05, k, 1.93, eye);
        if (c.hr) s += sprite('hat', 2.05, k, 1.93, eye);
      }
      s += c.l ? sideGap(-1, c, 'l', k, dn, df, g, eye, id) : sideWall(-1.5, dn, df, g, eye, HEDGE.l, k, id);
      s += c.r ? sideGap(1, c, 'r', k, dn, df, g, eye, id) : sideWall(1.5, dn, df, g, eye, HEDGE.r, k, id);
      if (c.f) {
        f = c.f.split(':'); nm = f[0]; rel = f[1];
        fd = rel === 'a' ? k + (k ? 0.3 : 0.38) : rel === 'b' ? k - 0.3 : rel === 'c' ? Math.max(k, 0.42) : Math.max(k, 0.3);
        fl = rel === 'l' ? -0.95 : rel === 'r' ? 0.95 : 0;
        if (fd > 0.1) {
          s += sprite(nm, fl, fd, g, eye);
          if (nm === 'dial' && o.cup) s += '<g transform="translate(' + r1(px(fl, fd)) + ' ' + r1(py(g + 1.03, fd, eye)) + ') scale(' + (Math.round(PM / fd) / 100) + ')">' + SPR.cup + '</g>';
          if (nm === 'dial' && o.cap) s += sprite('cap', fl, fd, g, eye);
        }
      }
      if (prev && prev.fw === 'gap') {                               /* the hedge has grown almost shut across the lane */
        g = Math.min(g, prev.s ? -1 : 0);
        s += flat(-1.5, -0.42, dn, g, eye, k, id) + flat(0.42, 1.5, dn, g, eye, k, id) +
          poly([P(-0.5, HT, dn, eye), P(0.5, HT, dn, eye), P(0.36, 1.42, dn, eye), P(0, 1.5, dn, eye), P(-0.38, 1.38, dn, eye)], fog('#2c5a2a', k)) +
          '<path d="M' + P(-0.42, 1.3, dn, eye).replace(',', ' ') + 'V' + r1(py(g, dn, eye)) + 'M' + P(0.42, 1.3, dn, eye).replace(',', ' ') + 'V' + r1(py(g, dn, eye)) + '" stroke="#16351a" stroke-width="' + r1(8 / (k + 0.5)) + '"/>';
      }
    }
    return s;
  };
  X.view = function (x, y, d, o) { o = o || {}; if (o.bk == null) o.bk = d; return X.draw(X.describe(x, y, d, o.hats), o); };

  /* ---------- Goodchild's plan (from above) ---------- */
  var S = 62, OX = 64, OY = 74;
  X.PLAN = { S: S, OX: OX, OY: OY, W: 562, H: 596 };
  X.cellAt = function (x, y) { return [OX + x * S + S / 2, OY + y * S + S / 2]; };
  X.plan = function (o) {
    o = o || {};
    var s = '<svg class="mz-plan" viewBox="0 0 562 596" xmlns="http://www.w3.org/2000/svg">', x, y, a, b, t, seg = '', gap = '', c;
    s += '<rect width="562" height="596" fill="#f4ecd2"/><g stroke="#b9c6cf" stroke-width="1" opacity=".55">';
    for (a = 2; a < 562; a += 15.5) s += '<path d="M' + r1(a) + ' 0V596"/>';
    for (a = 12; a < 596; a += 15.5) s += '<path d="M0 ' + r1(a) + 'H562"/>';
    s += '</g><rect x="' + OX + '" y="' + OY + '" width="' + S * 7 + '" height="' + S * 7 + '" fill="#efe0b4"/>';
    for (c in SUNK) { t = c.split(','); s += '<rect x="' + (OX + t[0] * S + 5) + '" y="' + (OY + t[1] * S) + '" width="' + (S - 10) + '" height="' + S + '" fill="#b99f78" opacity=".75"/>'; }
    function line(x1, y1, x2, y2) { return 'M' + (OX + x1 * S) + ' ' + (OY + y1 * S) + 'L' + (OX + x2 * S) + ' ' + (OY + y2 * S); }
    for (y = 0; y < 7; y++) for (x = 0; x < 7; x++) {
      if (!X.pass(x, y, 0)) seg += line(x, y, x + 1, y);
      else if (X.kind(x, y, 0) === 'gap') seg += line(x, y, x + 0.36, y) + line(x + 0.64, y, x + 1, y);
      if (!X.pass(x, y, 3)) seg += line(x, y, x, y + 1);
      if (y === 6 && X.kind(x, y, 2) !== 'gate') seg += line(x, 7, x + 1, 7);
      if (x === 6 && X.kind(x, y, 1) !== 'door') seg += line(7, y, 7, y + 1);
      if (X.kind(x, y, 0) === 'steps' || X.kind(x, y, 0) === 'gap') {              /* steps are drawn on the low side */
        b = SUNK[x + ',' + y] ? 1 : -1;
        for (a = 1; a < 4; a++) gap += 'M' + (OX + x * S + 12) + ' ' + (OY + y * S + b * a * 6) + 'h' + (S - 24);
      }
    }
    s += '<path d="' + seg + '" stroke="#2f6b2a" stroke-width="9" stroke-linecap="round" fill="none"/><path d="' + seg + '" stroke="#5c9a4a" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".8"/>' +
      '<path d="' + gap + '" stroke="#6b6250" stroke-width="2.2" fill="none"/>';
    function at(k) { var q = k.split(','); return [OX + q[0] * S + S / 2, OY + q[1] * S + S / 2]; }
    for (c in THING) {
      t = THING[c]; a = at(c); x = a[0] + (t[1] < 0 ? 0 : DX[t[1]] * 15); y = a[1] + (t[1] < 0 ? 0 : DY[t[1]] * 15);
      if (t[0] === 'bench') s += '<rect x="' + (x - (t[1] % 2 ? 5 : 17)) + '" y="' + (y - (t[1] % 2 ? 17 : 5)) + '" width="' + (t[1] % 2 ? 10 : 34) + '" height="' + (t[1] % 2 ? 34 : 10) + '" rx="2" fill="#fbfaf2" stroke="#55503f" stroke-width="2"/>' +
        '<text x="' + a[0] + '" y="' + (a[1] + (t[1] === 2 ? -8 : 22)) + '" class="pl-h">seat</text>';
      if (t[0] === 'lion') s += '<circle cx="' + x + '" cy="' + y + '" r="10" fill="#b5ae9c" stroke="#55503f" stroke-width="2"/><circle cx="' + x + '" cy="' + y + '" r="4.5" fill="#8d8676"/><text x="' + (a[0] + 8) + '" y="' + (a[1] + 24) + '" class="pl-h">lion</text>';
      if (t[0] === 'urn') s += '<path d="M' + (x - 9) + ' ' + (y - 8) + 'h18l-4 16h-10z" fill="#b5ae9c" stroke="#55503f" stroke-width="2"/><text x="' + a[0] + '" y="' + (a[1] + 24) + '" class="pl-h">urn</text>';
      if (t[0] === 'dial') s += '<circle cx="' + x + '" cy="' + (y - 4) + '" r="13" fill="#d9e2d0" stroke="#55503f" stroke-width="2"/><path d="M' + x + ' ' + (y - 4) + 'l9 -9" stroke="#55503f" stroke-width="2.5"/><text x="' + a[0] + '" y="' + (a[1] + 25) + '" class="pl-h b">DIAL</text>';
    }
    a = at('1,2');
    s += '<text x="' + a[0] + '" y="' + (a[1] + S / 2 + 5) + '" class="pl-h" transform="rotate(-90 ' + a[0] + ' ' + (a[1] + S / 2 + 5) + ')">the Dip</text>';
    a = at('0,4');
    s += '<text x="' + a[0] + '" y="' + (a[1] + 2) + '" class="pl-n">gap: wants</text><text x="' + a[0] + '" y="' + (a[1] + 17) + '" class="pl-n">clipping</text>' +
      '<path d="M' + (a[0] + 16) + ' ' + (a[1] - 12) + 'q14 -18 44 -17l-7 -5m7 5l-7 5" fill="none" stroke="#35507f" stroke-width="1.6"/>' +
      '<text x="' + (OX + 3.5 * S) + '" y="' + (OY + 7 * S + 24) + '" class="pl-h b">GATE</text><path d="M' + (OX + 3.5 * S) + ' ' + (OY + 7 * S + 44) + 'v-12" stroke="#55503f" stroke-width="2"/>' +
      '<text x="' + (OX + 7 * S + 12) + '" y="' + (OY + 3.5 * S - 6) + '" class="pl-h b" style="text-anchor:start">YEW</text><text x="' + (OX + 7 * S + 12) + '" y="' + (OY + 3.5 * S + 12) + '" class="pl-h b" style="text-anchor:start">DOOR</text>' +
      '<g transform="translate(30 60)"><path d="M0 26V-26M0 -26l-8 14M0 -26l8 14" stroke="#55503f" stroke-width="2.5" fill="none" stroke-linecap="round"/><text x="0" y="-32" class="pl-h b">N</text></g>' +
      '<text x="' + (OX + 2) + '" y="38" class="pl-t" style="text-anchor:start">Summerhays Maze</text><text x="' + (OX + 7 * S) + '" y="38" class="pl-n" style="text-anchor:end">planted 1962 · hedges: yew, six foot</text>' +
      '<text x="' + (OX + 7 * S) + '" y="56" class="pl-n" style="text-anchor:end">one square is four paces · R. Goodchild</text>';
    if (o.cells) for (y = 0; y < 7; y++) for (x = 0; x < 7; x++) s += '<rect class="pc" data-c="' + x + ',' + y + '" x="' + (OX + x * S) + '" y="' + (OY + y * S) + '" width="' + S + '" height="' + S + '" fill="#fff" fill-opacity="0"/>';
    return s + '<g class="pl-top"></g></svg>';
  };
  /* a pin on the plan: a letter in a circle, and an arrow for the way the camera looked */
  X.pin = function (x, y, d, label, col) {
    var a = X.cellAt(x, y), s = '<g class="pl-pin" transform="translate(' + a[0] + ' ' + a[1] + ')">';
    if (d != null) s += '<g transform="rotate(' + d * 90 + ')"><path d="M0 -29l-10 14h20z" fill="' + col + '" stroke="#fbfaf2" stroke-width="2"/></g>';
    return s + '<circle r="14" fill="' + col + '" stroke="#fbfaf2" stroke-width="2.5"/><text y="6" class="pin-t">' + label + '</text></g>';
  };

  /* ---------- the maze from the terrace ---------- */
  /* The hedges drawn standing up, row by row from the far side. flip: seen from the north (from the house), so that the
     gate is on the far side and the Yew Door on the left. */
  X.aboveAt = function (ox, oy, cw, ch, x, y, flip) { return [ox + ((flip ? 6 - x : x) + 0.5) * cw, oy + ((flip ? 6 - y : y) + 0.5) * ch]; };
  X.above = function (ox, oy, cw, ch, hh, flip) {
    var s = '<rect x="' + (ox - 8) + '" y="' + (oy - 6) + '" width="' + (cw * 7 + 16) + '" height="' + (ch * 7 + 12) + '" fill="#d7c592"/>', x, y, r, c, t = 8, gx, gy, th, q,
      NS = flip ? 2 : 0, WS = flip ? 1 : 3, SS = flip ? 0 : 2, ES = flip ? 3 : 1;
    function shut(x, y, d) { return !X.kind(x, y, d); }
    function hz(c, r) { gx = ox + c * cw; gy = oy + r * ch; return '<rect x="' + r1(gx - t / 2) + '" y="' + r1(gy - hh - t) + '" width="' + r1(cw + t) + '" height="' + t + '" fill="#5c9a4a"/><rect x="' + r1(gx - t / 2) + '" y="' + r1(gy - hh) + '" width="' + r1(cw + t) + '" height="' + hh + '" fill="#23502a"/>'; }
    function vt(c, r) { gx = ox + c * cw; gy = oy + r * ch; return '<rect x="' + r1(gx - t / 2) + '" y="' + r1(gy - hh - t) + '" width="' + t + '" height="' + r1(ch + t) + '" fill="#4f8f43"/><rect x="' + r1(gx - t / 2) + '" y="' + r1(gy + ch - hh) + '" width="' + t + '" height="' + hh + '" fill="#1f4a26"/>'; }
    for (r = 0; r < 7; r++) {
      y = flip ? 6 - r : r;
      for (c = 0; c < 7; c++) if (shut(flip ? 6 - c : c, y, NS)) s += hz(c, r);
      for (c = 0; c < 7; c++) {
        x = flip ? 6 - c : c;
        if (SUNK[x + ',' + y]) s += '<rect x="' + (ox + c * cw + t) + '" y="' + (oy + r * ch) + '" width="' + (cw - 2 * t) + '" height="' + ch + '" fill="#8a6f4c"/>';
        if (shut(x, y, WS)) s += vt(c, r);
        if (c === 6 && shut(x, y, ES)) s += vt(7, r);
        th = THING[x + ',' + y];
        if (th) {
          q = [ox + c * cw + cw / 2, oy + r * ch + ch / 2];
          s += th[0] === 'dial' ? '<ellipse cx="' + q[0] + '" cy="' + (q[1] + 3) + '" rx="11" ry="5" fill="#8d8676"/><rect x="' + (q[0] - 3.5) + '" y="' + (q[1] - 16) + '" width="7" height="19" fill="#cdc7b6"/><ellipse cx="' + q[0] + '" cy="' + (q[1] - 16) + '" rx="8" ry="3" fill="#6f8f6a"/>' :
            th[0] === 'bench' ? '<rect x="' + (q[0] - 11) + '" y="' + (q[1] - 6) + '" width="22" height="8" fill="#fbfaf2"/><rect x="' + (q[0] - 11) + '" y="' + (q[1] + 2) + '" width="22" height="3" fill="#bdb8a6"/>' :
            '<rect x="' + (q[0] - 6) + '" y="' + (q[1] - 14) + '" width="12" height="16" fill="#b5ae9c"/><rect x="' + (q[0] - 8) + '" y="' + (q[1] - 18) + '" width="16" height="5" fill="#cdc7b6"/>';
        }
      }
    }
    for (c = 0; c < 7; c++) if (shut(flip ? 6 - c : c, flip ? 0 : 6, SS)) s += hz(c, 7);
    return s;
  };

  /* ---------- the people, standing (origin at the feet; about 300 tall) ---------- */
  function person(o) {
    var sk = o.skin || '#e2bd9c', sk2 = o.shade || '#c99a78', s = '<ellipse cx="0" cy="3" rx="' + (o.wide || 58) + '" ry="8" fill="#1f3d18" opacity=".32"/>';
    if (o.skirt) s += '<path d="M-13 0v-52h10V0zM4 0v-52h10V0z" fill="' + sk2 + '"/><path d="M-38 -46q4 -78 38 -82t40 82z" fill="' + o.bot + '"/>';
    else s += '<path d="M-20 0l2 -124h18V0zM2 0v-124h18l2 124z" fill="' + o.bot + '"/>';
    s += '<path d="M-26 0h26v9h-29zM2 0h26v9h-23z" fill="' + (o.shoe || '#2a2228') + '"/>' + (o.shine ? '<path d="M-22 2h10M8 2h10" stroke="#fff" stroke-width="2" opacity=".7"/>' : '') +
      (o.mud ? '<path d="M-28 9h30v-6q-14 -6 -30 0zM1 9h29v-6q-14 -6 -29 0z" fill="#6a4f33"/>' : '');
    s += '<path d="M-38 -104q-8 -120 38 -130t40 130z" fill="' + o.top + '"/>' + (o.front || '');
    s += '<path d="M-28 -214q-18 42 -6 86" stroke="' + (o.arm || o.top) + '" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="-34" cy="-124" r="7.5" fill="' + sk + '"/>' +
      (o.armR || '<path d="M28 -214q20 40 6 86" stroke="' + (o.arm || o.top) + '" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="35" cy="-124" r="7.5" fill="' + sk + '"/>');
    s += '<rect x="-5" y="-252" width="13" height="16" fill="' + sk2 + '"/><circle cx="2" cy="-270" r="22" fill="' + sk + '"/>' + (o.head || '') +
      '<path d="M-8 -270h7M6 -270h7" stroke="#2a1a12" stroke-width="2.4"/><path d="M-3 -258h9" stroke="#7a3f30" stroke-width="2.2"/>' + (o.face || '');
    return s + (o.extra || '');
  }
  var PEOPLE = {
    kemble: function () {
      return person({ top: '#3f7f8f', bot: '#f4efe2', skirt: 1, shoe: '#6b3a2a',
        front: '<path d="M-24 -50q2 -90 26 -96t28 96z" fill="#fbfaf2"/><path d="M-14 -146l-8 -74M18 -146l8 -74" stroke="#fbfaf2" stroke-width="5"/><g fill="#d23b2e"><circle cx="-8" cy="-120" r="4"/><circle cx="12" cy="-100" r="4"/><circle cx="-2" cy="-76" r="4"/><circle cx="16" cy="-62" r="4"/><circle cx="-14" cy="-58" r="4"/></g>',
        armR: '<path d="M28 -214q26 26 2 58" stroke="#3f7f8f" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M-8 -176l50 -8 8 52 -50 8z" fill="#b98a55" stroke="#6b4a2a" stroke-width="2.5"/><path d="M0 -166l38 -6 6 38 -38 6z" fill="#fbfaf2"/><circle cx="28" cy="-154" r="7.5" fill="#e2bd9c"/>',
        head: '<path d="M-21 -268q-6 -30 23 -31t25 31q0 12 -4 20q0 -30 -21 -34t-20 6q-4 4 -3 8z" fill="#a8532a"/><path d="M-21 -268q-4 12 2 22M25 -268q4 12 -2 22" stroke="#a8532a" stroke-width="6" fill="none" stroke-linecap="round"/>' });
    },
    bexley: function () {
      return '<g transform="scale(1.1)">' + person({ top: '#efe6cf', bot: '#e9dfc6', shoe: '#6b3a1c', shine: 1, skin: '#eac3a4',
        front: '<path d="M-10 -230l12 86 12 -86z" fill="#fbfaf2"/><path d="M-1 -226l3 50 3 -50z" fill="#2e3a4d"/><path d="M2 -150v46" stroke="#d6cbb0" stroke-width="2.5"/>',
        armR: '<path d="M28 -214q24 30 -6 56" stroke="#efe6cf" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="22" cy="-160" r="7.5" fill="#eac3a4"/><circle cx="22" cy="-150" r="8" fill="#d9c16a" stroke="#8a6a26" stroke-width="2"/>',
        head: '<path d="M-20 -288q-2 -22 6 -25q16 -5 32 0q8 3 6 25z" fill="#f4efdf"/><path d="M-20 -292h44v6h-44z" fill="#2e3a4d"/><ellipse cx="2" cy="-286" rx="34" ry="6" fill="#ebe5d2"/><path d="M-8 -262q10 -5 20 0" stroke="#8d8676" stroke-width="3" fill="none"/>' }) + '</g>';
    },
    goodchild: function () {
      return person({ top: '#e9e2cf', bot: '#5a5240', shoe: '#3a2a1c', mud: 1, skin: '#d9a184', shade: '#c98f76',
        front: '<path d="M-28 -110q-6 -100 30 -112t34 112z" fill="#4f6b3a"/><path d="M2 -218v108" stroke="#35502a" stroke-width="2.5"/><g fill="#d9c16a"><circle cx="8" cy="-190" r="2.6"/><circle cx="8" cy="-164" r="2.6"/><circle cx="8" cy="-138" r="2.6"/></g>',
        arm: '#e9e2cf',
        head: '<path d="M-22 -286q0 -20 24 -20t24 20z" fill="#cfb26a"/><ellipse cx="2" cy="-285" rx="36" ry="6" fill="#bfa35c"/><path d="M-20 -290h44" stroke="#6b5a3c" stroke-width="3"/><path d="M-20 -266q-3 10 2 18M24 -266q3 10 -2 18" stroke="#eceff1" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M-9 -260q11 -8 22 0q-11 6 -22 0z" fill="#f4f6f7"/>',
        extra: '<path d="M62 6V-250" stroke="#8a6a45" stroke-width="6" stroke-linecap="round"/><path d="M40 2h46" stroke="#55503f" stroke-width="7" stroke-linecap="round"/><path d="M42 4v12M52 4v12M62 4v12M72 4v12M82 4v12" stroke="#55503f" stroke-width="3"/><circle cx="56" cy="-150" r="8" fill="#d9a184"/>' });
    },
    sanghera: function () {
      return person({ top: '#27365a', bot: '#b9b2a0', shoe: '#3a2a1c', skin: '#b8875a', shade: '#a87448',
        front: '<path d="M-10 -230l12 60 12 -60z" fill="#fbfaf2"/><path d="M-1 -228l3 44 3 -44z" fill="#8c2f24"/><g fill="#d9c16a"><circle cx="-6" cy="-150" r="3"/><circle cx="-6" cy="-128" r="3"/></g>',
        head: '<path d="M-23 -272q-4 -34 25 -36t26 34q-12 -12 -26 -12t-25 14z" fill="#2f4f8f"/><path d="M-20 -284q22 -22 46 2M-14 -296q16 -10 34 0" stroke="#3f63ad" stroke-width="3" fill="none"/><path d="M-16 -262q0 22 18 24t18 -24q-8 8 -18 8t-18 -8z" fill="#f1efe8"/>' });
    },
    oduya: function () {
      return person({ top: '#f2c14e', bot: '#3f5f8f', shoe: '#fbfaf2', skin: '#6b4423', shade: '#5a3a1f',
        front: '<path d="M-22 -110v-70h48v70z" fill="#3f5f8f"/><path d="M-16 -180l-6 -40M20 -180l6 -40" stroke="#3f5f8f" stroke-width="7"/>',
        armR: '<path d="M28 -214q22 16 2 40" stroke="#f2c14e" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M-18 -218l10 30M22 -218l-8 30" stroke="#17181c" stroke-width="3"/><rect x="-16" y="-196" width="38" height="26" rx="4" fill="#17181c"/><circle cx="3" cy="-183" r="11" fill="#3a3c45" stroke="#6f7480" stroke-width="2.5"/><circle cx="3" cy="-183" r="5" fill="#8fb4d9"/><circle cx="30" cy="-176" r="7.5" fill="#6b4423"/>',
        head: '<path d="M-21 -272q-2 -28 23 -28t24 28q-10 -12 -24 -12t-23 12z" fill="#15100c"/><g stroke="#15100c" stroke-width="5" stroke-linecap="round"><path d="M-20 -272v30M-13 -276v40M24 -272v30M17 -276v40"/></g><g fill="#f2c14e"><circle cx="-20" cy="-240" r="3"/><circle cx="-13" cy="-234" r="3"/><circle cx="24" cy="-240" r="3"/><circle cx="17" cy="-234" r="3"/></g>' });
    },
    ravenscroft: function () {
      return '<g transform="translate(-52 0)">' + person({ top: '#c98fb0', bot: '#55657a', shoe: '#fbfaf2', skin: '#ecc7a8',
        armR: '<path d="M28 -214q30 30 44 64" stroke="#c98fb0" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="74" cy="-148" r="7.5" fill="#ecc7a8"/>',
        head: '<path d="M-21 -272q-2 -28 23 -28t24 28q-10 -12 -24 -12t-23 12z" fill="#6b4a2a"/><path d="M22 -280q22 4 20 34" stroke="#6b4a2a" stroke-width="9" fill="none" stroke-linecap="round"/>' }) + '</g>' +
        '<g><ellipse cx="74" cy="4" rx="70" ry="8" fill="#1f3d18" opacity=".3"/><path d="M24 -148l14 4 -4 10 -12 -6z" fill="#3a3c45"/><path d="M30 -142L56 -40M56 -40h76M124 -40L104 -96" stroke="#3a3c45" stroke-width="5" fill="none"/>' +
        '<path d="M48 -116h82q8 0 8 10l-6 48q-2 10 -12 10h-52q-10 0 -13 -10z" fill="#2f6aa8"/><path d="M96 -116q-4 -44 36 -52l6 62z" fill="#3f7fc0"/><path d="M60 -92h62" stroke="#fbfaf2" stroke-width="5"/>' +
        '<circle cx="84" cy="-100" r="9" fill="#ecc7a8"/><path d="M62 -84q22 -10 56 0v20h-56z" fill="#fbfaf2"/>' +
        '<g fill="#17181c"><circle cx="44" cy="-12" r="12"/><circle cx="62" cy="-12" r="12"/><circle cx="110" cy="-12" r="12"/><circle cx="128" cy="-12" r="12"/></g><g fill="#8d9299"><circle cx="44" cy="-12" r="4"/><circle cx="62" cy="-12" r="4"/><circle cx="110" cy="-12" r="4"/><circle cx="128" cy="-12" r="4"/></g></g>';
    },
    twins: function () {                                             /* two ten-year-olds, sitting on the grass */
      function kid(x, top, hair, pig) {
        return '<g transform="translate(' + x + ' 0)"><path d="M-30 0q-4 -22 14 -26h40q20 0 30 14l8 12z" fill="#55657a"/><path d="M40 -6l26 4v8h-30z" fill="#fbfaf2"/>' +
          '<path d="M-24 -22q-6 -70 24 -76t28 76z" fill="' + top + '"/><path d="M-16 -86q-14 30 4 60" stroke="' + top + '" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="-10" cy="-26" r="6" fill="#ecc7a8"/>' +
          '<rect x="-3" y="-108" width="10" height="12" fill="#d9b08c"/><circle cx="2" cy="-124" r="19" fill="#ecc7a8"/>' +
          '<path d="M-17 -126q-2 -24 19 -24t20 24q-8 -10 -20 -10t-19 10z" fill="' + hair + '"/>' + (pig ? '<path d="M-17 -126q-12 4 -10 22M21 -126q12 4 10 22" stroke="' + hair + '" stroke-width="7" fill="none" stroke-linecap="round"/>' : '') +
          '<circle cx="-5" cy="-124" r="2" fill="#2a1a12"/><circle cx="9" cy="-124" r="2" fill="#2a1a12"/><path d="M-3 -114q5 4 10 0" stroke="#7a3f30" stroke-width="2" fill="none"/><path d="M-10 -40l12 6M-6 -50l10 4" stroke="#5f8a4a" stroke-width="3"/></g>';
      }
      return '<ellipse cx="40" cy="4" rx="120" ry="10" fill="#1f3d18" opacity=".3"/>' + kid(0, '#d9573a', '#c98a3a', 1) + kid(92, '#3f8a4e', '#c98a3a', 0);
    },
    fairbrass: function () {                                         /* on her scooter: three wheels, a basket, a rug */
      return '<ellipse cx="6" cy="4" rx="118" ry="10" fill="#1f3d18" opacity=".3"/>' +
        '<g fill="#17181c"><circle cx="-76" cy="-20" r="20"/><circle cx="58" cy="-20" r="20"/><circle cx="84" cy="-16" r="18"/></g><g fill="#c9ced3"><circle cx="-76" cy="-20" r="7"/><circle cx="58" cy="-20" r="7"/><circle cx="84" cy="-16" r="6"/></g>' +
        '<path d="M-96 -40h196q10 0 10 10v6h-206z" fill="#8c2f24"/><path d="M-76 -40L-64 -150" stroke="#3a3c45" stroke-width="8" stroke-linecap="round"/><path d="M-84 -152h40" stroke="#17181c" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M-128 -124h44l-6 44h-32z" fill="#b98a55" stroke="#6b4a2a" stroke-width="2.5"/><path d="M-126 -110h40M-124 -96h36" stroke="#6b4a2a" stroke-width="2"/><path d="M-120 -124q6 -16 22 -10" stroke="#c9453a" stroke-width="5" fill="none"/><circle cx="-100" cy="-132" r="9" fill="#c9453a"/>' +
        '<path d="M20 -40v-96q0 -10 10 -10h44q10 0 10 10v96z" fill="#3a3c45"/>' +
        '<path d="M-36 -40q-6 -52 20 -62h64v62z" fill="#3f6f5f"/><g stroke="#d9c16a" stroke-width="3" opacity=".8"><path d="M-30 -62h78M-24 -84h72M-10 -100v60M18 -102v62"/></g><g stroke="#8c2f24" stroke-width="2" opacity=".8"><path d="M-32 -52h80M-26 -74h74M4 -102v62M34 -102v62"/></g>' +
        '<path d="M-4 -98q-6 -108 34 -114t38 114z" fill="#7f8fc0"/><path d="M12 -200q-36 16 -60 40" stroke="#7f8fc0" stroke-width="13" fill="none" stroke-linecap="round"/><circle cx="-50" cy="-158" r="7.5" fill="#ecc7a8"/>' +
        '<path d="M18 -206q14 10 28 0" stroke="#f7f4ea" stroke-width="4" fill="none"/><rect x="26" y="-232" width="12" height="16" fill="#d9b08c"/><circle cx="32" cy="-250" r="21" fill="#ecc7a8"/>' +
        '<path d="M12 -252q-2 -24 20 -25t22 25q-9 -11 -22 -11t-20 11z" fill="#f1f3f5"/><circle cx="44" cy="-272" r="10" fill="#f1f3f5"/>' +
        '<g fill="none" stroke="#555a63" stroke-width="2"><circle cx="24" cy="-250" r="6"/><circle cx="40" cy="-250" r="6"/><path d="M30 -250h4"/></g><path d="M27 -238h10" stroke="#7a3f30" stroke-width="2.2"/>';
    }
  };
  X.fig = function (who) { return PEOPLE[who] ? PEOPLE[who]() : ''; };
  X.figs = function () { ER.$$('[data-fig]').forEach(function (g) { g.innerHTML = X.fig(g.getAttribute('data-fig')); }); };

  /* the four marks of the hunt, as rubber stamps print them */
  X.MARK = [
    '<path d="M0 -15l4.400 9.200 10 1.300 -7.300 7 1.800 10 -8.900 -4.800 -8.900 4.800 1.800 -10 -7.300 -7 10 -1.300z"/>',
    '<ellipse cx="0" cy="5" rx="8" ry="7"/><circle cx="-10" cy="-5" r="3.600"/><circle cx="-4" cy="-11" r="3.600"/><circle cx="4" cy="-11" r="3.600"/><circle cx="10" cy="-5" r="3.600"/>',
    '<path d="M-14 12v-8h8v-8h8v-8h12v24z"/>',
    '<path d="M-11 -12h22v4h-22zM-9 -7h18q0 12 -6 15v4h5v3h-16v-3h5v-4q-6 -3 -6 -15z"/>'
  ];
  X.mark = function (i, size, col) { return '<svg viewBox="-18 -18 36 36" width="' + size + '" height="' + size + '"><g fill="' + (col || '#5a2a8c') + '">' + X.MARK[i] + '</g></svg>'; };

  /* ---------- the papers ---------- */
  X.DOC = {
    prog: '<h4><small>SUMMERHAYS &middot; LITTLE HAYS</small>Open Day</h4>' +
      '<p class="sub">House, gardens and maze &middot; in aid of the roof</p>' +
      '<table><tr><td>12.00</td><td>The gates open.</td></tr>' +
      '<tr><td>1.00</td><td>Dog show on the lower lawn. Judge: the village constable.</td></tr>' +
      '<tr><td>2.00</td><td><b>THE MAZE HUNT.</b> Cards from the table at the maze gate. Five rhymes and four stamps. The first child to stand at the dial with four stamps on a card wins the Maze Cup. (A child is anybody under fifteen.)</td></tr>' +
      '<tr><td>2.45</td><td>The Yew Door, in the east hedge of the maze, is unlocked for the presentation party. Committee only. Hunters go in at the gate.</td></tr>' +
      '<tr><td>2.30</td><td>Teas in the tent.</td></tr>' +
      '<tr><td>4.00</td><td><b>The Maze Cup</b> is presented at the dial by Miss D. Fairbrass.</td></tr>' +
      '<tr><td>4.30</td><td>The raffle is drawn.</td></tr></table>' +
      '<p class="small">Pushchairs and wheelchairs: the hunt has twelve steps in it, and nobody can be carried round them. The only flat way to the dial is by the Yew Door, from 2.45.</p>' +
      '<p class="small">The hedges are six feet high. Please do not lift small children over them.</p>' +
      '<p class="sig">D. Fairbrass, for the committee</p>',
    rhymes: '<h4>The Maze Hunt</h4>' +
      '<p class="sub">Five rhymes, written in 1962 by Sir Edmund Marchmont, who planted the maze. &ldquo;I mean what I say,&rdquo; he told the first hunters, &ldquo;and I say what I mean. Read it as it is written.&rdquo;</p>' +
      '<div class="cols"><div>' +
      '<p class="v"><b>I</b>Come in, and walk till yew trees say<br>That you may go no more that way.<br>Turn right. This is the Long Green Walk.<br>Now count, my dear, and do not talk:<br>The second gap upon your right<br>Will bring a garden seat in sight.<br>Sit down, and feel beneath, with care.<br>My first mark has been waiting there.</p>' +
      '<p class="v"><b>II</b>Go back the way you came, and then<br>Turn left along the Walk again.<br>You&rsquo;ll pass the lane that let you in:<br>Once you are past it, then begin<br>To look. The first way on your right<br>Will bring a lion into sight.<br>He&rsquo;s on your left; his jaws are wide.<br>Be brave, and put your hand inside.</p>' +
      '</div><div>' +
      '<p class="v"><b>III</b>He has not moved since &rsquo;Sixty-two,<br>And will not move aside for you.<br>No matter. Past the lion go,<br>Then down six steps to the path below,<br>And up six more. Upon the last<br>My third mark tells you: you have passed.</p>' +
      '<p class="v"><b>IV</b>Now lay your left hand on the yew,<br>And keep it there, whatever you do.<br>Wherever that green wall may turn,<br>Go with it, as far as the urn,<br>And no further. Reach in, and find<br>My fourth. (The spiders will not mind.)</p>' +
      '<p class="v"><b>V</b>Now turn your back upon the urn.<br>Walk on. There are two ways to turn<br>Upon your right. The first is wrong.<br>The second take; and before long<br>The path will bend. Go where it bends.<br>And there, my dear, the hunting ends.</p>' +
      '</div></div>',
    book: '<h4>Teas <small>Mrs Kemble&rsquo;s order book</small></h4>' +
      '<table><tr><td>2.31</td><td>Table 1. Four teas, four scones. Paid.</td></tr>' +
      '<tr><td>2.38</td><td>Urn no. 1 filled again. Urn no. 2 is empty and cold: it is not wanted till the four o&rsquo;clock rush.</td></tr>' +
      '<tr><td>2.46</td><td>Table 3. Dr Sanghera and his granddaughter. Two teas, one squash, three scones. He says that the lion has beaten him again.</td></tr>' +
      '<tr><td>2.52</td><td>Table 3 again. One more scone. Paid.</td></tr>' +
      '<tr><td>2.55</td><td>Miss Fairbrass comes in on her scooter and parks at urn no. 2, as she does every year. She says that no. 2 is not to be touched till four. Very well.</td></tr>' +
      '<tr><td>2.59</td><td>The Trevithick twins, shouting. THE CUP HAS GONE.</td></tr>' +
      '<tr><td>3.00</td><td>Shut the tent? No. People in trouble want tea.</td></tr></table>'
  };
  X.PAPER = {
    prog: ['The programme', 'On your table at the gate', 'prog'],
    rhymes: ['The five rhymes', 'The Maze Hunt, 1962', 'rhymes'],
    book: ['Mrs Kemble’s order book', 'The tea tent', 'book'],
    plan: ['Goodchild’s plan of the maze', 'From above', 'planpaper']
  };
  X.doc = function (id) { return id === 'plan' ? '<h4>The maze, from above</h4>' + X.plan() + '<p>North is at the top. The house is north of the maze, and the church is to the west. Hunters go in at the gate, on the south side. The Yew Door is in the east hedge.</p>' : X.DOC[id]; };
  X.file = function (id, quiet) { var p = X.PAPER[id]; return ER.addClue(id, p[0], X.doc(id), p[2], p[1], quiet); };
  X.read = function (id, done) { var p = X.PAPER[id]; ER.read({ html: X.doc(id), cls: p[2], clue: { id: id, title: p[0], kind: p[1] }, done: done }); };
  return X;
})();
