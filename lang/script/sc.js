/* Nobody Here Can Read This - what every room shares: a few sounds, small helpers, the people (standing in the
   scene, and as busts for the interviews), the girls' script drawn as SVG, and a drag-or-click helper for bins
   that hold several things. Loaded after engine.js.

   The girls' script is described by SHAPE names only (ring, arch, hook2, lens, standR ...). Nothing in this file
   says which letter a shape stands for: that is in case.json, and the player works it out. */
window.SC = (function () {
  'use strict';
  var X = {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  X.sfx = {
    card: function () { B({ type: 'highpass', f: 2600, f2: 4000, dur: 0.14, peak: 0.07, a: 0.02 }); },
    put: function () { T({ f: 220, f2: 150, dur: 0.1, peak: 0.16 }); B({ type: 'lowpass', f: 1200, dur: 0.04, peak: 0.1 }); },
    radio: function () { B({ type: 'bandpass', f: 1800, q: 2, dur: 0.35, peak: 0.06, a: 0.01 }); T({ type: 'square', f: 1100, dur: 0.06, peak: 0.018, when: 0.32 }); },
    buzz: function () { T({ type: 'sawtooth', f: 160, dur: 0.2, peak: 0.03 }); T({ type: 'sawtooth', f: 160, dur: 0.2, peak: 0.03, when: 0.3 }); },
    press: function () { T({ f: 90, f2: 55, dur: 0.32, peak: 0.3 }); B({ type: 'lowpass', f: 500, dur: 0.22, peak: 0.14 }); },
    key: function () { B({ dur: 0.03, f: 3200, q: 4, peak: 0.1 }); T({ f: 640, dur: 0.04, peak: 0.04 }); },
    rub: function () { B({ type: 'bandpass', f: 900, q: 1.5, dur: 0.18, peak: 0.05, a: 0.05 }); }
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
  /* Hangul shown as a thing to study (never as instructions), and other scripts: never underlined */
  X.hg = function (s) { return '<!--nogloss--><span class="hg">' + s + '</span><!--/nogloss-->'; };
  X.fx = function (s, cls) { return '<!--nogloss--><span class="fx ' + (cls || '') + '">' + s + '</span><!--/nogloss-->'; };
  X.tell = function (key) {
    var o = { t: ER.flag(key) || {} };
    o.has = function (k) { return !!o.t[k]; };
    o.set = function (k) { if (o.t[k]) return false; o.t[k] = 1; ER.flag(key, o.t); return true; };
    return o;
  };

  /* ---------- the girls' script ---------- */
  var SW = 9;
  function ln(d, w) { return '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="' + (w || SW) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function dt(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 8) + '" fill="currentColor"/>'; }
  function ring(x, y, r, w) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="currentColor" stroke-width="' + (w || SW) + '"/>'; }
  var TK1 = ln('M6 30L18 6'), TK2 = TK1 + ln('M22 30L34 6');
  var ARCH = ln('M20 84C20 22 80 22 80 84'), HOOK = 'M14 78H64Q84 78 84 58V28', LENS = ln('M10 54Q50 14 90 54Q50 94 10 54Z'), TEETH = ln('M12 78L31 34L50 78L69 34L88 78');
  var SHAPE = {
    ring: { w: 100, h: 100, s: ring(50, 54, 26) },
    arch: { w: 100, h: 100, s: ARCH },
    arch1: { w: 100, h: 100, s: ARCH + TK1 },
    hook: { w: 100, h: 100, s: ln(HOOK) },
    hook1: { w: 100, h: 100, s: ln(HOOK) + TK1 },
    hook2: { w: 100, h: 100, s: ln(HOOK) + TK2 },
    hookloop: { w: 100, h: 100, s: ln('M30 78H64Q84 78 84 58V28') + ring(20, 74, 10, 8) },
    hookwave: { w: 100, h: 100, s: ln('M10 78Q18 64 26 78T42 78H64Q84 78 84 58V28') },
    lens: { w: 100, h: 100, s: LENS },
    lens1: { w: 100, h: 100, s: LENS + TK1 },
    lens2: { w: 100, h: 100, s: LENS + TK2 },
    teeth: { w: 100, h: 100, s: TEETH },
    lip: { w: 100, h: 100, s: ln('M20 34Q50 8 80 34Q50 60 20 34Z', 8) + ln('M22 90L36 62L50 90L64 62L78 90', 8) },
    /* the girls' vowels: Sejong's heaven, earth and person, drawn their own way: a dot, the curve of the earth, a little standing person */
    stand: { w: 60, h: 100, s: ln('M30 32V92') + ring(30, 17, 10, 7) },
    standR: { w: 64, h: 100, s: ln('M22 32V92') + ring(22, 17, 10, 7) + dt(50, 62) },
    standL: { w: 64, h: 100, s: ln('M42 32V92') + ring(42, 17, 10, 7) + dt(14, 62) },
    flat: { w: 100, h: 60, s: ln('M8 16Q50 56 92 16') },
    flatUp: { w: 100, h: 64, s: ln('M8 30Q50 70 92 30') + dt(50, 12) },
    flatDown: { w: 100, h: 64, s: ln('M8 6Q50 46 92 6') + dt(50, 54) },
    clock: { w: 100, h: 100, s: ring(50, 56, 30) + ln('M50 8V18') + ln('M50 56L62 68') + ln('M50 56V80', 7) },
    tilde: { w: 60, h: 40, s: ln('M6 26Q16 8 28 22T54 16', 7) },
    plus: { w: 60, h: 60, s: ln('M30 8V52M8 30H52') },
    tens: { w: 100, h: 100, s: ln('M12 52H58') + ln('M80 22V82') },
    heart: { w: 100, h: 90, s: ln('M50 84C10 56 6 34 14 20C24 4 44 8 50 26C56 8 76 4 86 20C94 34 90 56 50 84Z', 7) }
  };
  X.SHAPE = SHAPE;
  var TALL = { stand: 1, standR: 1, standL: 1 };
  function r2(n) { return Math.round(n * 100) / 100; }
  /* one shape, centred in the box x y w h */
  X.part = function (name, x, y, w, h, pad) {
    var g = SHAPE[name]; if (!g) return '';
    pad = pad == null ? 0.08 : pad;
    var s = Math.min(w * (1 - 2 * pad) / g.w, h * (1 - 2 * pad) / g.h);
    return '<g transform="translate(' + r2(x + (w - g.w * s) / 2) + ' ' + r2(y + (h - g.h * s) / 2) + ') scale(' + r2(s) + ')">' + g.s + '</g>';
  };
  function row(names, x, y, w, h) { var s = ''; names.forEach(function (nm, i) { s += X.part(nm, x + i * w / names.length, y, w / names.length, h); }); return s; }
  /* 'ring.standR.lens': the consonants before the vowel . the vowel(s) . the consonants after it ('+' joins several) */
  X.parse = function (spec) {
    var a = spec.split('.');
    return { i: a[0] ? a[0].split('+') : [], v: a[1] ? a[1].split('+') : [], f: a[2] ? a[2].split('+') : [] };
  };
  X.partsOf = function (spec) { if (spec.indexOf('.') < 0) return [spec]; var b = X.parse(spec); return b.i.concat(b.v, b.f); };
  /* a syllable block, packed the way Hangul packs one, in the square x y S */
  X.block = function (spec, x, y, S) {
    if (spec.indexOf('.') < 0) return X.part(spec, x, y, S, S, 0.06);
    var b = X.parse(spec), s = '', fin = b.f.length > 0, topH = fin ? 0.64 : 1;
    var talls = b.v.filter(function (v) { return TALL[v]; }), flats = b.v.filter(function (v) { return !TALL[v]; });
    function R(fx, fy, fw, fh) { return [x + fx * S, y + fy * S, fw * S, fh * S]; }
    var a;
    if (talls.length) {
      var ih = flats.length ? topH * 0.64 : topH;
      a = R(0, 0, 0.62, ih); s += row(b.i, a[0], a[1], a[2], a[3]);
      a = R(0.58, 0, 0.42, topH); s += X.part(talls[0], a[0], a[1], a[2], a[3]);
      if (flats.length) { a = R(0.02, ih, 0.58, topH - ih); s += X.part(flats[0], a[0], a[1], a[2], a[3], 0.04); }
    } else {
      var ih2 = topH * (flats.length > 1 ? 0.5 : 0.66), fh = (topH - ih2) / Math.max(1, flats.length);
      a = R(0, 0, 1, ih2); s += row(b.i, a[0], a[1], a[2], a[3]);
      flats.forEach(function (v, k) { var d = R(0.1, ih2 + k * fh, 0.8, fh); s += X.part(v, d[0], d[1], d[2], d[3], 0.04); });
    }
    if (fin) { a = R(0.04, topH, 0.92, 1 - topH); s += row(b.f, a[0], a[1], a[2], a[3]); }
    return s;
  };
  /* Elin's letter, line by line: blocks, ' ' (a space between words) and '~' (the wavy mark) */
  X.LETTER = [
    ['ring.standR', 'arch.standR', 'hook2.standR', '~'],
    ['ring.stand', ' ', 'ring.standR.lens', ' ', 'teeth.flatUp.hookwave', 'hookwave.standL', '~'],
    ['ring.stand', ' ', 'ring.standR.lens', ' ', 'ring.flatDown.lens2', ' ', 'ring.stand.hook', ' ', 'ring.flatUp+flatDown.hookwave', ' ', 'ring.standR.hook2', 'hook2.stand.arch1', '~'],
    ['clock'],
    ['ring.flat', 'hookloop.stand.hook']
  ];
  /* the 1995 sample on the competition board (its English is printed under it on the board) */
  X.BOARD = [['lens1.flat.teeth+hook2', ' ', 'lip+hookwave.stand+flat.hook+hook1+teeth']];
  /* the garden stone: two names, the sign between them, a heart round both, and the sign underneath */
  X.STONE = { a: ['ring.flat', 'hookloop.stand.hook'], b: ['ring.standR', 'arch.standR', 'hook2.standR'] };
  /* every distinct shape in the letter, in a fixed order (the key in the education room uses it) */
  X.KEYPARTS = ['ring', 'arch', 'arch1', 'hook', 'hook2', 'hookloop', 'hookwave', 'lens', 'lens2', 'teeth', 'stand', 'standR', 'standL', 'flat', 'flatUp', 'flatDown'];

  /* Lay out lines of tokens. Returns {w, h, items:[{t:'b'|'~', spec, x, y, S, line, n}]} (n counts blocks) */
  X.layout = function (lines, o) {
    o = o || {};
    var S = o.S || 60, gap = o.gap == null ? 6 : o.gap, wg = o.word || 26, lh = o.lh || S + 30, items = [], w = 0, n = 0;
    lines.forEach(function (ln2, li) {
      var x = o.x || 0, y = (o.y || 0) + li * lh;
      ln2.forEach(function (t) {
        if (t === ' ') { x += wg; return; }
        if (t === '~') { items.push({ t: '~', spec: 'tilde', x: x, y: y + S * 0.55, S: S * 0.5, line: li }); x += S * 0.55 + gap; return; }
        items.push({ t: 'b', spec: t, x: x, y: y, S: S, line: li, n: n++ }); x += S + gap;
      });
      w = Math.max(w, x);
    });
    return { w: w, h: lines.length * lh, items: items };
  };
  X.draw = function (L, cls) {
    return L.items.map(function (it) {
      var inner = it.t === '~' ? X.part('tilde', it.x, it.y, it.S, it.S * 0.66, 0.05) : X.block(it.spec, it.x, it.y, it.S);
      return '<g class="' + (cls || 'gb') + '" data-n="' + (it.n == null ? '' : it.n) + '" data-spec="' + it.spec + '">' +
        '<rect x="' + r2(it.x - 3) + '" y="' + r2(it.y - 3) + '" width="' + r2(it.S + 6) + '" height="' + r2(it.S + 6) + '" fill="transparent"/>' + inner + '</g>';
    }).join('');
  };
  /* the whole letter as a small picture on a sheet of museum notepaper */
  X.letterDoc = function (w) {
    var L = X.layout(X.LETTER, { S: 52, lh: 74, x: 34, y: 76 });
    return '<svg class="lettersvg" viewBox="0 0 640 480" width="' + (w || 560) + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="4" y="4" width="632" height="472" fill="#fdfbf3" stroke="#d8d0bc" stroke-width="2"/>' +
      '<g fill="none" stroke="#c9d6e2" stroke-width="1.4">' + [1, 2, 3, 4, 5, 6].map(function (i) { return '<path d="M20 ' + (60 + i * 74) + 'H620"/>'; }).join('') + '</g>' +
      '<text x="320" y="38" text-anchor="middle" font-family="Cinzel,serif" font-size="15" fill="#8a3a2a" letter-spacing="3">ELMSWORTH MUSEUM OF WRITING</text>' +
      '<path d="M250 48H390" stroke="#8a3a2a" stroke-width="1.2"/>' +
      '<g color="#23305a">' + X.draw(L) + '</g></svg>';
  };
  /* the carving on the stone: names, the sign between, the heart round them, the sign under */
  function heartPath(x, y, w, h) {
    function P(a, b) { return r2(x + a * w) + ' ' + r2(y + b * h); }
    return 'M' + P(0.5, 1) + 'C' + P(0.1, 0.66) + ' ' + P(0.0, 0.4) + ' ' + P(0.1, 0.2) + 'C' + P(0.22, 0.0) + ' ' + P(0.44, 0.04) + ' ' + P(0.5, 0.24) +
      'C' + P(0.56, 0.04) + ' ' + P(0.78, 0.0) + ' ' + P(0.9, 0.2) + 'C' + P(1.0, 0.4) + ' ' + P(0.9, 0.66) + ' ' + P(0.5, 1) + 'Z';
  }
  /* the carving: returns {svg, box:[x, y, w, h]} */
  X.stoneArt = function (o) {
    o = o || {};
    var S = o.S || 64, x0 = o.x || 70, y0 = o.y || 70, s = '';
    var A = X.layout([X.STONE.a], { S: S, x: x0, y: y0 }), Bn = X.layout([X.STONE.b], { S: S, x: A.w + S * 0.9, y: y0 });
    s += '<g class="nameA">' + X.draw(A, 'gs') + '</g>';
    s += '<g class="oddsign" data-o="plus">' + X.part('plus', A.w + S * 0.08, y0 + S * 0.2, S * 0.6, S * 0.6) + '</g>';
    s += '<g class="nameB">' + X.draw(Bn, 'gs') + '</g>';
    var W = Bn.w - x0, hw = W * 1.32, hx = x0 + W / 2 - hw / 2, hy = y0 - S * 0.8, hh = S * 2.8;
    s += '<g class="oddsign" data-o="heart"><path d="' + heartPath(hx, hy, hw, hh) + '" fill="none" stroke="currentColor" stroke-width="' + r2(S * 0.09) + '" stroke-linejoin="round"/></g>';
    s += '<g class="oddsign" data-o="tens">' + X.part('tens', x0 + W / 2 - S * 0.4, hy + hh + S * 0.05, S * 0.8, S * 0.8) + '</g>';
    return { svg: s, box: [hx, hy, hw, hh + S * 0.9] };
  };

  /* the stone itself, with its carving, as a picture of width w */
  X.stoneSVG = function (w, inner) {
    var art = X.stoneArt({ S: 56, x: 0, y: 0 }), b = art.box, m = 46;
    var vx = b[0] - m, vy = b[1] - m, vw = b[2] + 2 * m, vh = b[3] + 2 * m;
    return '<svg viewBox="' + r2(vx) + ' ' + r2(vy) + ' ' + r2(vw) + ' ' + r2(vh) + '" width="' + (w || 480) + '" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M' + r2(vx + 10) + ' ' + r2(vy + vh - 6) + 'Q' + r2(vx) + ' ' + r2(vy + 30) + ' ' + r2(vx + vw * 0.2) + ' ' + r2(vy + 14) + 'Q' + r2(vx + vw * 0.5) + ' ' + r2(vy - 4) + ' ' + r2(vx + vw * 0.82) + ' ' + r2(vy + 10) +
      'Q' + r2(vx + vw) + ' ' + r2(vy + 30) + ' ' + r2(vx + vw - 8) + ' ' + r2(vy + vh - 4) + 'z" fill="#bcb6a8" stroke="#8a8478" stroke-width="3"/>' +
      '<g color="#4a463e">' + art.svg + '</g>' + (inner || '') + '</svg>';
  };

  /* ---------- several things to a bin: drag, or click the thing and then the bin ---------- */
  X.bins = function (root, o) {
    var held = null, D = document;
    function hold(n) { if (held) held.classList.remove('held'); held = n; if (n) n.classList.add('held'); }
    function put(item, target) {
      if (target === o.home) o.home.appendChild(item);
      else (target.querySelector(o.inner || '.bin-in') || target).appendChild(item);
      ER.sfx.click(); hold(null); if (o.change) o.change();
    }
    function targetAt(x, y) {
      var t = D.elementFromPoint(x, y); if (!t || !t.closest) return null;
      return t.closest(o.bin) || (o.home.contains(t) || t === o.home ? o.home : null);
    }
    root.addEventListener('pointerdown', function (e) {
      var item = e.target.closest ? e.target.closest(o.item) : null;
      if (!item || e.button || (o.lock && o.lock())) return;
      e.preventDefault();
      var r = item.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top, moved = false, sx = e.clientX, sy = e.clientY;
      function mv(ev) {
        if (!moved) {
          if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 6) return;
          moved = true; item.style.width = r.width + 'px'; item.classList.add('fly'); hold(null);
        }
        item.style.left = (ev.clientX - dx) + 'px'; item.style.top = (ev.clientY - dy) + 'px';
      }
      function up(ev) {
        D.removeEventListener('pointermove', mv); D.removeEventListener('pointerup', up); D.removeEventListener('pointercancel', up);
        if (moved) {
          item.classList.remove('fly'); item.style.left = item.style.top = item.style.width = '';
          var t = targetAt(ev.clientX, ev.clientY); if (t) put(item, t);
        } else {
          var b = held && held !== item ? item.closest(o.bin) : null;
          if (b && root.contains(b)) put(held, b); else hold(held === item ? null : item);
        }
      }
      D.addEventListener('pointermove', mv); D.addEventListener('pointerup', up); D.addEventListener('pointercancel', up);
    });
    root.addEventListener('click', function (e) {
      if (!held || (o.lock && o.lock())) return;
      if (e.target.closest && e.target.closest(o.item)) return;
      var t = e.target.closest ? (e.target.closest(o.bin) || (o.home.contains(e.target) || e.target === o.home ? o.home : null)) : null;
      if (t) put(held, t);
    });
  };

  /* ---------- people, standing: feet at 0 0, about 300 high ---------- */
  X.PEOPLE = {
    delgado: { skin: '#c58c62', hair: '#1e1a18', hs: 'crop', top: '#1d2a5a', stripe: '#f2f2f2', coat: '#6b7a52', bottom: '#1d2a5a', shoes: '#f2f2f2', stubble: 1, whistle: 1, tall: 1.06 },
    szabo: { skin: '#efd2b8', hair: '#b9b4ae', hs: 'curl', top: '#8a6a44', bottom: '#5a4a3a', shirt: '#f4efe4', bow: '#8a1f2a', glasses: '#2a2420', thin: 1 },
    moreau: { skin: '#e2b896', hair: '#d8d4ce', hs: 'bald', top: '#26304a', bottom: '#26304a', badge: '#d9b44a', tache: '#d8d4ce', cap: '#26304a', wide: 1 },
    elin: { skin: '#f2d6c0', hair: '#d9b46a', hs: 'plait', top: '#3d7a5a', bottom: '#3a3a44', scarf: '#c8502a', skirt: 0 },
    agata: { skin: '#e0b48e', hair: '#2a1a14', hs: 'bun', top: '#f1f1ee', bottom: '#2c3440', coat: '#e8e8e2', glasses: '#5a3a2a', scarf: '#3a6a8a' }
  };
  var HAIR = {
    crop: 'M-23 -270q2 -30 23 -30t23 30q-6 -14 -23 -15t-23 15z',
    curl: 'M-28 -268q-6 -20 6 -32q4 -14 22 -12q18 -2 22 12q12 12 6 32q-4 -10 -10 -14q-6 6 -18 4q-12 2 -18 -4q-6 4 -10 14z',
    bald: 'M-25 -262q-2 -10 2 -16l4 8zM25 -262q2 -10 -2 -16l-4 8z',
    plait: 'M-25 -266q0 -36 25 -36t25 36q-8 -16 -25 -18q-17 2 -25 18zM18 -262q14 12 10 46q-2 18 -10 26l-6 -4q8 -10 8 -24q0 -24 -8 -36z',
    bun: 'M-24 -268q2 -32 24 -32t24 32q-8 -14 -24 -16q-16 2 -24 16zM-12 -306a12 10 0 1 1 24 0a12 10 0 1 1 -24 0z'
  };
  X.person = function (o, more) {
    var k, p = {}; for (k in o) p[k] = o[k]; for (k in (more || {})) p[k] = more[k];
    var sk = p.skin, s = '', w = p.wide ? 1.18 : p.thin ? 0.88 : 1;
    s += '<g transform="scale(' + (p.tall || 1) + ')">';
    s += '<ellipse cx="0" cy="2" rx="' + 44 * w + '" ry="8" fill="#000" opacity="' + (p.shadow == null ? 0.2 : p.shadow) + '"/>';
    s += '<path d="M' + (-19 * w) + ' 0L' + (-17 * w) + ' -112H' + (-2) + 'L-3 0zM3 0L2 -112H' + (17 * w) + 'L' + (19 * w) + ' 0z" fill="' + p.bottom + '"/>';
    s += '<path d="M' + (-25 * w) + ' 0h22v7h-26zM3 0h22v7h-22z" fill="' + (p.shoes || '#2a2420') + '"/>';
    if (p.stripe) s += '<path d="M' + (-16 * w) + ' -4L' + (-15 * w) + ' -108M' + (15 * w) + ' -4L' + (16 * w) + ' -108" stroke="' + p.stripe + '" stroke-width="3"/>';
    s += '<path d="M' + (-36 * w) + ' -100Q' + (-42 * w) + ' -228 0 -240Q' + (42 * w) + ' -228 ' + (36 * w) + ' -100z" fill="' + p.top + '"/>';
    if (p.shirt) s += '<path d="M-10 -238l10 30 10 -30z" fill="' + p.shirt + '"/>';
    if (p.bow) s += '<path d="M-12 -240l12 6 12 -6v12l-12 -6 -12 6z" fill="' + p.bow + '"/>';
    if (p.stripe) s += '<path d="M-2 -238V-102" stroke="' + p.stripe + '" stroke-width="3"/><path d="M' + (-30 * w) + ' -200l12 0" stroke="' + p.stripe + '" stroke-width="2"/>';
    if (p.coat) s += '<path d="M' + (-38 * w) + ' -92Q' + (-46 * w) + ' -226 -6 -240L-10 -92zM' + (38 * w) + ' -92Q' + (46 * w) + ' -226 6 -240L10 -92z" fill="' + p.coat + '"/>';
    if (p.badge) s += '<path d="M14 -206l10 -4 10 4v10q-10 8 -20 0z" fill="' + p.badge + '"/><path d="M-26 -196h18" stroke="#9aa6c0" stroke-width="3"/>';
    if (p.scarf) s += '<path d="M-20 -244q20 14 40 0l2 14q-22 14 -44 0z" fill="' + p.scarf + '"/><path d="M8 -232l8 46l10 -2l-8 -44z" fill="' + p.scarf + '"/>';
    if (p.whistle) s += '<path d="M-12 -238q12 40 24 0" stroke="#d93a2a" stroke-width="2" fill="none"/><rect x="-5" y="-204" width="10" height="7" rx="2" fill="#c9c9c9"/>';
    var sl = p.coat || p.top;
    s += '<path d="M' + (-33 * w) + ' -212q-15 44 -6 96M' + (33 * w) + ' -212q15 44 6 96" stroke="' + sl + '" stroke-width="15" fill="none" stroke-linecap="round"/>';
    s += '<circle cx="' + (-39 * w) + '" cy="-112" r="8" fill="' + sk + '"/><circle cx="' + (39 * w) + '" cy="-112" r="8" fill="' + sk + '"/>';
    s += '<rect x="-7" y="-252" width="14" height="16" fill="' + sk + '"/><ellipse cx="0" cy="-272" rx="22" ry="26" fill="' + sk + '"/>';
    if (p.back) s += '<ellipse cx="0" cy="-276" rx="23" ry="27" fill="' + p.hair + '"/>';
    else {
      if (HAIR[p.hs]) s += '<path d="' + HAIR[p.hs] + '" fill="' + p.hair + '"/>';
      s += '<path d="M-10 -272h6M4 -272h6" stroke="#231c18" stroke-width="2.8" stroke-linecap="round"/>';
      if (p.tache) s += '<path d="M-12 -258q12 -8 24 0q-12 4 -24 0z" fill="' + p.tache + '"/>';
      s += '<path d="M-6 -255q6 ' + (p.smile == null ? 3 : p.smile) + ' 12 0" stroke="#8c4a3c" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      if (p.stubble) s += '<path d="M-18 -262q18 22 36 0" stroke="' + p.hair + '" stroke-width="5" fill="none" opacity=".25"/>';
      if (p.glasses) s += '<circle cx="-8" cy="-272" r="7" fill="none" stroke="' + p.glasses + '" stroke-width="2"/><circle cx="8" cy="-272" r="7" fill="none" stroke="' + p.glasses + '" stroke-width="2"/><path d="M-1 -272h2" stroke="' + p.glasses + '" stroke-width="2"/>';
    }
    if (p.cap) s += '<path d="M-23 -294q23 -30 46 0z" fill="' + p.cap + '"/><path d="M-27 -296h54v6h-54z" fill="#141a2a"/><circle cx="0" cy="-304" r="4" fill="#d9b44a"/>';
    if (p.extra) s += p.extra;
    return s + '</g>';
  };
  X.who = function (name, more) { return X.person(X.PEOPLE[name], more); };

  /* busts for the interviews (240 x 300) */
  var BUST = {
    delgado: { bg: '#1d2a5a', skin: '#c58c62', hair: '#1e1a18', top: '#1d2a5a', stripe: '#f2f2f2', coat: '#6b7a52', crop: 1, stubble: 1, whistle: 1 },
    szabo: { bg: '#6a4a2c', skin: '#efd2b8', hair: '#b9b4ae', top: '#8a6a44', curl: 1, bow: '#8a1f2a', glasses: '#2a2420', old: 1 },
    moreau: { bg: '#26304a', skin: '#e2b896', hair: '#d8d4ce', top: '#26304a', cap: 1, tache: 1, badge: 1, old: 1 },
    elin: { bg: '#2c5a44', skin: '#f2d6c0', hair: '#d9b46a', top: '#3d7a5a', plait: 1, scarf: '#c8502a' },
    agata: { bg: '#3a6a8a', skin: '#e0b48e', hair: '#2a1a14', top: '#f1f1ee', bun: 1, glasses: '#5a3a2a', scarf: '#3a6a8a' }
  };
  X.face = function (name, mood) {
    var o = BUST[name], s = '', sm = mood === 'smile' ? 10 : mood === 'cross' ? -6 : 3;
    s += '<svg viewBox="0 0 240 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><rect x="-200" y="-200" width="640" height="500" fill="' + o.bg + '"/><circle cx="40" cy="40" r="90" fill="#fff" opacity=".08"/>';
    s += '<path d="M10 300q10 -96 110 -104q100 8 110 104z" fill="' + o.top + '"/>';
    if (o.stripe) s += '<path d="M120 206V300M40 250h30" stroke="' + o.stripe + '" stroke-width="5"/><path d="M10 300q8 -80 70 -100l20 100zM230 300q-8 -80 -70 -100l-20 100z" fill="' + o.coat + '"/>';
    if (o.bow) s += '<path d="M104 196l16 26 16 -26z" fill="#f4efe4"/><path d="M98 198l22 10 22 -10v18l-22 -10 -22 10z" fill="' + o.bow + '"/>';
    if (o.badge) s += '<path d="M160 236l14 -6 14 6v14q-14 12 -28 0z" fill="#d9b44a"/>';
    if (o.scarf) s += '<path d="M76 196q44 30 88 0l6 22q-50 30 -100 0z" fill="' + o.scarf + '"/>';
    if (o.whistle) s += '<path d="M96 200q24 60 48 0" stroke="#d93a2a" stroke-width="3" fill="none"/><rect x="112" y="252" width="16" height="10" rx="3" fill="#c9c9c9"/>';
    s += '<rect x="104" y="164" width="32" height="36" fill="' + o.skin + '"/>';
    if (o.plait) s += '<path d="M170 110q22 40 12 110q-4 20 -14 30l-8 -6q10 -14 10 -30q2 -60 -12 -96z" fill="' + o.hair + '"/>';
    s += '<ellipse cx="120" cy="118" rx="52" ry="62" fill="' + o.skin + '"/><ellipse cx="68" cy="124" rx="8" ry="13" fill="' + o.skin + '"/><ellipse cx="172" cy="124" rx="8" ry="13" fill="' + o.skin + '"/>';
    if (o.crop) s += '<path d="M68 104q2 -62 52 -64t52 64q-12 -32 -52 -34t-52 34z" fill="' + o.hair + '"/>';
    if (o.curl) s += '<path d="M60 116q-14 -40 10 -64q8 -26 50 -24q42 -2 50 24q24 24 10 64q-8 -22 -20 -30q-14 12 -40 8q-26 4 -40 -8q-12 8 -20 30z" fill="' + o.hair + '"/>';
    if (o.plait) s += '<path d="M64 112q2 -70 56 -72t56 72q-14 -36 -56 -38t-56 38z" fill="' + o.hair + '"/>';
    if (o.bun) s += '<path d="M64 110q2 -68 56 -70t56 70q-14 -34 -56 -36t-56 36z" fill="' + o.hair + '"/><ellipse cx="120" cy="40" rx="24" ry="18" fill="' + o.hair + '"/>';
    if (o.cap) s += '<path d="M62 92q58 -54 116 0v-14q-58 -46 -116 0z" fill="#26304a"/><path d="M110 92h82q-4 14 -30 16h-52z" fill="#111"/><circle cx="120" cy="64" r="7" fill="#d9b44a"/>';
    s += '<path d="M90 104q10 -6 20 0M130 104q10 -6 20 0" stroke="#3a2a20" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="120" rx="5" ry="6.5" fill="#2a2420"/><ellipse cx="140" cy="120" rx="5" ry="6.5" fill="#2a2420"/><circle cx="102" cy="118" r="1.6" fill="#fff"/><circle cx="142" cy="118" r="1.6" fill="#fff"/>' +
      '<path d="M120 126q-5 14 2 18" stroke="#a0705a" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    if (o.tache) s += '<path d="M96 150q24 -14 48 0q-24 8 -48 0z" fill="' + o.hair + '"/>';
    s += '<path d="M104 158q16 ' + sm + ' 32 0" stroke="#8c3a32" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    if (o.stubble) s += '<path d="M76 140q44 60 88 0" stroke="#1e1a18" stroke-width="16" fill="none" opacity=".12"/>';
    if (o.old) s += '<path d="M84 96q8 -3 16 -1M140 95q8 -2 16 1M86 134q6 4 12 3M142 137q6 1 12 -3" stroke="#a07a60" stroke-width="2" fill="none" opacity=".6"/>';
    if (o.glasses) s += '<g fill="none" stroke="' + o.glasses + '" stroke-width="3"><circle cx="100" cy="120" r="15"/><circle cx="140" cy="120" r="15"/><path d="M115 118h10M85 116l-18 -4M155 116l18 -4"/></g>';
    return s + '</svg>';
  };
  return X;
})();
