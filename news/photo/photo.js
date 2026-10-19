/* One Sun - what every room of the story shares: a few sounds, small helpers, people as standing figures, and the
   pictures themselves. Loaded after engine.js. Nothing in here knows an answer.

   THE PICTURES are drawn with a real perspective camera, so that every shadow, every line and every thing that stands
   in line with another is where it would be in a photograph. The camera stands 1.6 m above the ground and looks level;
   X is metres to the east (right), Z metres to the north (away from the camera), Y metres up.
   The lake picture (Esme's, and the morning one) is taken from lamp post 4 on the south side of the boating lake in
   Lockyer Park, looking due north. Its full frame is 1050 x 700. Gideon Platt's square is cut out of it (PH.PLATT).
   The sun at six in the evening on 5 September (latitude about 52.5 N, summer time): azimuth 261, height 15 degrees,
   so shadows point to 81 degrees (a little north of east) and are 3.73 times as long as the thing. At half past seven
   in the morning: azimuth 91, height 9, shadows to 271 degrees, 6.3 times as long. At one o'clock: due south, height 44,
   shadows due north and about as long as the thing. */
window.PH = (function () {
  'use strict';
  var X = {}, D = document;
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds (through the engine, so that the sound button switches them) ---------- */
  X.sfx = {
    slip: function () { B({ type: 'highpass', f: 2600, dur: 0.11, peak: 0.08, a: 0.02 }); },
    pin: function () { B({ dur: 0.03, f: 2400, q: 3, peak: 0.2 }); T({ f: 520, f2: 300, dur: 0.07, peak: 0.16, when: 0.01 }); },
    key: function () { B({ dur: 0.02, f: 1600, q: 2, peak: 0.22 }); T({ f: 240, f2: 150, dur: 0.05, peak: 0.12 }); },
    pen: function () { B({ type: 'bandpass', f: 2600, f2: 3400, q: 2, dur: 0.2, peak: 0.05, a: 0.03 }); },
    shutter: function () { B({ dur: 0.025, f: 3600, q: 2, peak: 0.22 }); B({ dur: 0.03, f: 2200, q: 2, peak: 0.18, when: 0.07 }); },
    snip: function () { B({ dur: 0.03, f: 5200, q: 4, peak: 0.16 }); B({ dur: 0.03, f: 4200, q: 4, peak: 0.14, when: 0.09 }); },
    drawer: function () { B({ type: 'lowpass', f: 500, f2: 240, dur: 0.3, peak: 0.2, a: 0.04 }); T({ f: 96, f2: 70, dur: 0.12, peak: 0.2, when: 0.26 }); },
    mail: function () { T({ type: 'triangle', f: 880, dur: 0.12, peak: 0.07 }); T({ type: 'triangle', f: 1320, dur: 0.18, peak: 0.06, when: 0.1 }); },
    ring: function () { [0, 0.18, 0.62, 0.8].forEach(function (w) { T({ type: 'square', f: 440, dur: 0.12, peak: 0.025, when: w }); T({ type: 'square', f: 480, dur: 0.12, peak: 0.02, when: w }); }); },
    door: function () { T({ f: 120, f2: 70, dur: 0.22, peak: 0.3 }); B({ type: 'lowpass', f: 600, dur: 0.2, peak: 0.12 }); }
  };
  /* a step inside a room is done: the music answers in the room's key; without music, three plain notes */
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
    var st = ER.state(), end = ER.flag('tEnd') || Date.now();
    if (st.fin && st.fin.secs) return Math.max(1, Math.round(st.fin.secs / 60));
    return Math.max(1, Math.round((end - (st.t0 || end)) / 60000));
  };
  X.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  /* pick and place for HTML pieces: a thing is dragged to a place, or clicked and then the place is clicked.
     o = {item, zone, lock: fn, pick: fn(item), drop: fn(item, zone) -> false to refuse} */
  X.place = function (root, o) {
    var held = null;
    function hold(n) { if (held) held.classList.remove('held'); held = n; if (n) n.classList.add('held'); if (o.pick) o.pick(n); }
    function zoneAt(x, y) { var t = D.elementFromPoint(x, y); return t && t.closest ? t.closest(o.zone) : null; }
    root.addEventListener('pointerdown', function (e) {
      var item = e.target.closest ? e.target.closest(o.item) : null;
      if (!item || e.button || (o.lock && o.lock())) return;
      e.preventDefault();
      var r = item.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top, sx = e.clientX, sy = e.clientY, moved = false;
      function mv(ev) {
        if (!moved) {
          if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 6) return;
          moved = true; hold(item); item.style.width = r.width + 'px'; item.classList.add('fly');
        }
        item.style.left = (ev.clientX - dx) + 'px'; item.style.top = (ev.clientY - dy) + 'px';
      }
      function up(ev) {
        D.removeEventListener('pointermove', mv); D.removeEventListener('pointerup', up); D.removeEventListener('pointercancel', up);
        if (moved) {
          item.classList.remove('fly'); item.style.left = item.style.top = item.style.width = '';
          var z = zoneAt(ev.clientX, ev.clientY);
          if (z && o.drop(item, z) !== false) hold(null);
        } else hold(held === item ? null : item);
      }
      D.addEventListener('pointermove', mv); D.addEventListener('pointerup', up); D.addEventListener('pointercancel', up);
    });
    root.addEventListener('click', function (e) {
      if (!held || (o.lock && o.lock())) return;
      if (e.target.closest && e.target.closest(o.item)) return;
      var z = e.target.closest ? e.target.closest(o.zone) : null;
      if (z && o.drop(held, z) !== false) hold(null);
    });
    return { hold: hold, held: function () { return held; } };
  };
  /* a glass that follows the mouse over a drawing: svg is the <svg>, art the id of the group to copy, r the radius */
  X.loupe = function (svg, artId, r, zoom, bounds) {
    var ns = 'http://www.w3.org/2000/svg', id = 'lp' + Math.floor(Math.random() * 1e6), g = D.createElementNS(ns, 'g');
    g.setAttribute('pointer-events', 'none'); g.style.display = 'none';
    g.innerHTML = '<defs><clipPath id="' + id + '"><circle r="' + r + '"/></clipPath></defs><circle r="' + (r + 5) + '" fill="#000" opacity=".35" cx="3" cy="4"/><circle r="' + (r + 2) + '" fill="#fff"/>' +
      '<g clip-path="url(#' + id + ')"><g class="lpin"><use href="#' + artId + '"/></g></g><circle r="' + (r + 1) + '" fill="none" stroke="#2a2a2a" stroke-width="' + (r / 9).toFixed(1) + '"/>';
    svg.appendChild(g);
    var inner = g.querySelector('.lpin');
    svg.addEventListener('pointermove', function (e) {
      var p = ER.pt(svg, e);
      if (bounds && !(p.x >= bounds[0] && p.x <= bounds[2] && p.y >= bounds[1] && p.y <= bounds[3])) { g.style.display = 'none'; return; }
      g.style.display = 'block'; g.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')');
      inner.setAttribute('transform', 'scale(' + zoom + ') translate(' + (-p.x).toFixed(1) + ' ' + (-p.y).toFixed(1) + ')');
    });
    svg.addEventListener('pointerleave', function () { g.style.display = 'none'; });
    return g;
  };

  /* ---------- people, standing in a room: feet at 0 0, about 300 high ---------- */
  X.person = function (o) {
    var skin = o.skin || '#e8c4a2', hair = o.hair || '#3a2a1c', top = o.top || '#3d4f63', bot = o.bottom || '#2b3038', s = '', i;
    s += '<ellipse cx="0" cy="3" rx="52" ry="9" fill="#000" opacity="' + (o.shadow == null ? 0.32 : o.shadow) + '"/>';
    if (o.skirt) s += '<path d="M-16 0v-70h12v70zM4 0v-70h12v70z" fill="' + (o.tights || '#2e2a33') + '"/><path d="M-36 -62h72l-9 -66h-54z" fill="' + bot + '"/>';
    else s += '<path d="M-21 0v-112h18v112zM3 0v-112h18v112z" fill="' + bot + '"/>';
    s += '<path d="M-27 0h25v8h-29zM2 0h25l4 8h-29z" fill="' + (o.shoes || '#141516') + '"/>';
    var hem = o.long ? -60 : -98;
    s += '<path d="M-36 ' + hem + 'C-41 -150 -45 -212 -28 -232Q0 -246 28 -232C45 -212 41 -150 36 ' + hem + 'Z" fill="' + top + '"/>';
    s += '<path d="M-10 -239l10 26 10 -26z" fill="' + (o.shirt || '#ecebe4') + '"/>';
    if (o.cardi) { s += '<path d="M-10 -239L0 -196L10 -239" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="2.6"/><path d="M0 -196V' + hem + '" stroke="#000" stroke-opacity=".22" stroke-width="2"/>'; for (i = 0; i < 4; i++) s += '<circle cx="5" cy="' + (-184 + i * 22) + '" r="2.6" fill="#fff" opacity=".7"/>'; }
    if (o.jacket) s += '<path d="M0 -212V' + hem + '" stroke="#000" stroke-opacity=".28" stroke-width="2"/><path d="M-10 -239L-19 -208L0 -192L19 -208L10 -239" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="2.6" stroke-linejoin="round"/>';
    if (o.vest) s += '<path d="M-34 -104C-39 -150 -42 -206 -27 -229L-10 -238L0 -212L10 -238L27 -229C42 -206 39 -150 34 -104Z" fill="' + (o.vestCol || '#d9e021') + '"/><path d="M-38 -156h76M-36 -128h72" stroke="#cfd6da" stroke-width="8"/>' +
      (o.vestText ? '<text x="0" y="-176" class="fL" font-size="13" font-weight="900" text-anchor="middle" fill="#2a2a1a" textLength="52" lengthAdjust="spacingAndGlyphs">' + o.vestText + '</text>' : '');
    if (o.lit) s += '<path d="M28 -232C45 -212 41 -150 36 ' + hem + '" fill="none" stroke="' + o.lit + '" stroke-width="3.5" opacity=".55"/>';
    var la = o.armL || 'M-31 -222Q-49 -170 -42 -122', ra = o.armR || 'M31 -222Q49 -170 42 -122';
    s += '<path d="' + la + '" stroke="' + (o.sleeve || top) + '" stroke-width="15" fill="none" stroke-linecap="round"/><path d="' + ra + '" stroke="' + (o.sleeve || top) + '" stroke-width="15" fill="none" stroke-linecap="round"/>';
    s += '<circle cx="' + (o.handL ? o.handL[0] : -42) + '" cy="' + (o.handL ? o.handL[1] : -113) + '" r="7.5" fill="' + skin + '"/><circle cx="' + (o.handR ? o.handR[0] : 42) + '" cy="' + (o.handR ? o.handR[1] : -113) + '" r="7.5" fill="' + skin + '"/>';
    s += '<rect x="-7" y="-256" width="14" height="20" fill="' + skin + '"/><ellipse cx="0" cy="-275" rx="22.5" ry="25" fill="' + skin + '"/>';
    if (o.style === 'bob') s += '<path d="M-24 -270Q-27 -304 0 -305Q27 -304 24 -270L24 -248Q20 -262 18 -282Q0 -292 -18 -282Q-20 -262 -24 -248Z" fill="' + hair + '"/>';
    else if (o.style === 'short') s += '<path d="M-23 -276Q-25 -303 0 -304Q25 -303 23 -276Q14 -291 0 -291Q-14 -291 -23 -276Z" fill="' + hair + '"/>';
    else if (o.style === 'bald') s += '<path d="M-23 -262Q-26 -276 -22 -282Q-21 -270 -19 -258ZM23 -262Q26 -276 22 -282Q21 -270 19 -258Z" fill="' + hair + '"/>';
    else if (o.style === 'pony') s += '<path d="M-23 -274Q-25 -303 0 -304Q25 -303 23 -274Q12 -292 0 -292Q-12 -292 -23 -274Z" fill="' + hair + '"/><path d="M20 -292Q42 -284 34 -248Q30 -262 22 -276Z" fill="' + hair + '"/>';
    else if (o.style === 'bun') s += '<path d="M-23 -274Q-25 -303 0 -304Q25 -303 23 -274Q12 -292 0 -292Q-12 -292 -23 -274Z" fill="' + hair + '"/><circle cx="0" cy="-308" r="11" fill="' + hair + '"/>';
    else if (o.style === 'curly') { for (i = 0; i < 7; i++) s += '<circle cx="' + (-21 + i * 7) + '" cy="' + (-292 - (i === 0 || i === 6 ? -6 : i === 1 || i === 5 ? 3 : 7)) + '" r="8.5" fill="' + hair + '"/>'; }
    if (o.cap) s += '<path d="M-25 -284Q-22 -306 2 -306Q24 -305 25 -286Q8 -293 -10 -290Q-24 -288 -38 -279Q-34 -287 -25 -284Z" fill="' + o.cap + '"/>';
    if (o.flatcap) s += '<path d="M-26 -282Q-26 -302 2 -303Q26 -302 27 -284Q14 -289 -4 -288Q-22 -287 -34 -280Q-32 -283 -26 -282Z" fill="' + o.flatcap + '"/>';
    s += '<ellipse cx="-8" cy="-275" rx="2.3" ry="2.8" fill="#221b17"/><ellipse cx="8" cy="-275" rx="2.3" ry="2.8" fill="#221b17"/>' +
      '<path d="M1 -273q-3 7 1 9" stroke="#000" stroke-opacity=".28" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M-6 -259q6 ' + (o.smile == null ? 3 : o.smile) + ' 12 0" stroke="#7d3f34" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    if (o.tash) s += '<path d="M-10 -264q10 -6 20 0q-10 4 -20 0z" fill="' + o.tash + '"/>';
    if (o.beard) s += '<path d="M-22 -272Q-22 -242 0 -238Q22 -242 22 -272Q16 -256 0 -256Q-16 -256 -22 -272Z" fill="' + o.beard + '"/>';
    if (o.glasses) s += '<g fill="none" stroke="' + o.glasses + '" stroke-width="1.8"><rect x="-15" y="-281" width="12" height="10" rx="3"/><rect x="3" y="-281" width="12" height="10" rx="3"/><path d="M-3 -277h6"/></g>';
    if (o.extra) s += o.extra;
    return s;
  };
  X.PEOPLE = {
    kasia: { skin: '#f0d3bc', hair: '#c8763a', style: 'bun', top: '#2d3a4a', bottom: '#1c232c', shirt: '#e6e2d6', glasses: '#1d1d1d', jacket: 1 },
    hammond: { skin: '#eccfb4', hair: '#e8e6e0', style: 'bald', top: '#7a6a4f', bottom: '#4a443c', shirt: '#cfd8e0', cardi: 1, glasses: '#3a3a3a' },
    lorna: { skin: '#d9a37c', hair: '#2a2420', style: 'bob', top: '#7a1f24', bottom: '#202226', shirt: '#f2efe8', jacket: 1 },
    lou: { skin: '#b07a52', hair: '#1b1512', style: 'curly', top: '#3b4a3a', bottom: '#2a2d2f', shirt: '#d9d6c8', jacket: 1 },
    hamish: { skin: '#efc9ae', hair: '#f1efe9', style: 'bald', top: '#2f4f7a', bottom: '#3a3f2a', shirt: '#e8e2d2', tash: '#f4f2ec' },
    esme: { skin: '#f2d6c2', hair: '#6b4426', style: 'pony', top: '#3a3f6b', bottom: '#26292e', shirt: '#e8e4da', vest: 1, vestText: 'CREW', vestCol: '#dfe62a' }
  };
  X.who = function (name, more) {
    var o = {}, k, base = X.PEOPLE[name];
    for (k in base) o[k] = base[k];
    for (k in (more || {})) o[k] = more[k];
    return X.person(o);
  };

  /* ================= THE PICTURES ================= */
  var F = 750, CX = 525, HY = 350, EYE = 1.6;
  function P(x, y, z) { return [CX + F * x / z, HY - F * (y - EYE) / z]; }
  function pp(x, y, z) { var p = P(x, y, z); return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }
  function f1(v) { return (+v).toFixed(1); }
  X.P = P;
  var SUN = {
    eve: { s: [0.9877, 0.1564], k: 3.732, lit: 'L' },
    dawn: { s: [-0.9998, 0.0175], k: 6.314, lit: 'R' }
  };
  X.SUN = SUN;
  X.PLATT = { x: 40, y: 40, w: 560, h: 560 };
  X.LAMP = { x: -0.3, y: 2.5, z: 12 };
  function rnd(seed) { var r = seed; return function () { r = (r * 16807) % 2147483647; return r / 2147483647; }; }

  /* the shadow of an upright thing on the ground, for the sun: w is its width across the shadow, h its height */
  function sunShadow(x, z, w, h, sun, taper, col, op) {
    var dx = sun.s[0] * sun.k * h, dz = sun.s[1] * sun.k * h, nx = -sun.s[1], nz = sun.s[0], t = taper == null ? 0.55 : taper;
    return '<path d="M' + pp(x + nx * w / 2, 0, z + nz * w / 2) + 'L' + pp(x + dx + nx * w * t / 2, 0, z + dz + nz * w * t / 2) +
      'L' + pp(x + dx - nx * w * t / 2, 0, z + dz - nz * w * t / 2) + 'L' + pp(x - nx * w / 2, 0, z - nz * w / 2) + 'Z" fill="' + (col || '#1e2a24') + '" opacity="' + (op || 0.42) + '"/>';
  }
  function sunTip(x, z, h, sun) { return P(x + sun.s[0] * sun.k * h, 0, z + sun.s[1] * sun.k * h); }
  /* a lamp's shadow: from the foot of the thing away from the lamp */
  function lampTip(x, z, h) { var L = X.LAMP, k = L.y / (L.y - h); return [L.x + (x - L.x) * k, L.z + (z - L.z) * k]; }

  /* a small person in a picture: feet at x y, hp pixels tall. o.pose: stand | run | walk | point | phone | clap | wave;
     o.dir: 1 faces right, -1 left, 0 faces the camera */
  function fig(x, y, hp, o) {
    var u = hp / 10, d = o.dir || 0, s = '', sk = o.skin || '#e3bf9c', top = o.top || '#3a4a5a', lg = o.legs || '#2b2f36', hr = o.hair || '#3a2a1c';
    var lw = 0.78, lit = o.lit === 'R' ? 1 : -1;
    s += '<g transform="translate(' + f1(x) + ' ' + f1(y) + ') scale(' + u.toFixed(3) + ')">';
    if (o.pose === 'run') {
      var k = d || 1;
      s += '<g transform="scale(' + k + ' 1)">';
      s += '<path d="M0.2 -4.7L2.2 -2.6L1.6 -0.2" fill="none" stroke="' + lg + '" stroke-width="0.95" stroke-linecap="round" stroke-linejoin="round"/>';
      s += '<path d="M-0.2 -4.6L-1.4 -2.4L-2.9 -2.8" fill="none" stroke="' + lg + '" stroke-width="0.95" stroke-linecap="round" stroke-linejoin="round"/>';
      s += '<path d="M-0.9 -4.4L0.9 -4.6L1.6 -8.0L-0.2 -8.3Z" fill="' + top + '"/>';
      if (o.num) s += '<rect x="0.5" y="-7.2" width="0.9" height="0.8" fill="#fff" transform="rotate(12 0.9 -6.8)"/>';
      s += '<path d="M1.2 -7.8L2.3 -6.4L3.1 -7.3" fill="none" stroke="' + sk + '" stroke-width="' + lw + '" stroke-linecap="round" stroke-linejoin="round"/>';
      s += '<path d="M0.2 -7.8L-1.2 -6.2L-0.6 -5.2" fill="none" stroke="' + sk + '" stroke-width="' + lw + '" stroke-linecap="round" stroke-linejoin="round"/>';
      s += '<circle cx="1.2" cy="-9.1" r="0.88" fill="' + sk + '"/><path d="M0.3 -9.3Q0.5 -10.3 1.4 -10.1Q2.1 -10 2.0 -9.4Q1.2 -9.8 0.3 -9.3Z" fill="' + hr + '"/>';
      s += '</g>';
    } else if (o.pose === 'walk') {
      var w = d || 1;
      s += '<g transform="scale(' + w + ' 1)">';
      s += '<path d="M0.1 -4.6L1.1 0" stroke="' + lg + '" stroke-width="0.95" stroke-linecap="round"/><path d="M-0.1 -4.6L-1.0 0" stroke="' + lg + '" stroke-width="0.95" stroke-linecap="round"/>';
      s += '<path d="M-1.1 -4.2L1.1 -4.2L1.0 -8.2L-1.0 -8.2Z" fill="' + top + '"/>' + (o.coat ? '<path d="M-1.2 -3.0L1.2 -3.0L1.1 -8.2L-1.1 -8.2Z" fill="' + top + '"/>' : '');
      s += '<path d="M0 -7.9L0.9 -5.4" stroke="' + top + '" stroke-width="0.8" stroke-linecap="round"/>';
      s += '<circle cx="0.15" cy="-9.1" r="0.88" fill="' + sk + '"/>';
      s += o.hat ? '<path d="M-0.8 -9.3Q-0.8 -10.4 0.15 -10.4Q1.1 -10.4 1.1 -9.3Z" fill="' + o.hat + '"/>' : '<path d="M-0.7 -9.3Q-0.6 -10.2 0.2 -10.1Q1 -10.1 1 -9.4Q0.3 -9.8 -0.7 -9.3Z" fill="' + hr + '"/>';
      if (o.scarf) s += '<path d="M-0.6 -8.2h1.5v0.5h-1.5z" fill="' + o.scarf + '"/>';
      s += '</g>';
      if (o.breath) s += '<g fill="#fff" opacity=".9"><circle cx="' + (1.5 * w) + '" cy="-8.9" r="0.5"/><circle cx="' + (2.3 * w) + '" cy="-9.25" r="0.75"/><circle cx="' + (3.2 * w) + '" cy="-9.0" r="0.6"/><circle cx="' + (3.9 * w) + '" cy="-9.35" r="0.4"/></g>';
    } else {
      /* facing the camera */
      s += '<path d="M-0.95 0L-0.85 -4.7L-0.1 -4.7L-0.2 0Z M0.2 0L0.1 -4.7L0.85 -4.7L0.95 0Z" fill="' + lg + '"/>';
      s += '<path d="M-1.2 0h1v0.35h-1.2zM0.2 0h1l0.2 0.35h-1.2z" fill="#151617"/>';
      s += '<path d="M-1.45 -4.3C-1.65 -6 -1.7 -7.5 -1.2 -8.1L1.2 -8.1C1.7 -7.5 1.65 -6 1.45 -4.3Z" fill="' + top + '"/>';
      if (o.vest) s += '<path d="M-1.35 -4.6C-1.5 -6 -1.55 -7.4 -1.1 -8.0L-0.35 -8.1L0 -7.2L0.35 -8.1L1.1 -8.0C1.55 -7.4 1.5 -6 1.35 -4.6Z" fill="' + (o.vestCol || '#dfe62a') + '"/><path d="M-1.5 -5.3h3M-1.45 -4.85h2.9" stroke="#d5dbdf" stroke-width="0.22"/>' +
        (o.vestText ? '<text x="0" y="-6.25" font-family="Libre Franklin,sans-serif" font-size="0.62" font-weight="900" text-anchor="middle" fill="#2a2a1a"' + (o.mirror ? ' transform="scale(-1 1)"' : '') + ' textLength="2.1" lengthAdjust="spacingAndGlyphs">' + o.vestText + '</text>' : '');
      if (o.num) s += '<rect x="-0.55" y="-6.9" width="1.1" height="0.85" fill="#fff"/><text x="0" y="-6.25" font-family="Libre Franklin,sans-serif" font-size="0.55" font-weight="900" text-anchor="middle" fill="#1a1a1a">' + o.num + '</text>';
      var A = { stand: ['M-1.25 -7.9Q-1.75 -6.4 -1.6 -4.8', 'M1.25 -7.9Q1.75 -6.4 1.6 -4.8', [-1.6, -4.6], [1.6, -4.6]],
        point: ['M-1.25 -7.9Q-1.75 -6.4 -1.6 -4.8', 'M1.15 -7.9L2.4 -9.4L3.0 -10.4', [-1.6, -4.6], [3.05, -10.6]],
        wave: ['M-1.25 -7.9Q-1.75 -6.4 -1.6 -4.8', 'M1.15 -7.9L2.0 -9.2L2.2 -10.6', [-1.6, -4.6], [2.2, -10.8]],
        phone: ['M-1.15 -7.9L-0.9 -6.8L-0.25 -8.4', 'M1.15 -7.9L0.9 -6.8L0.25 -8.4', [-0.25, -8.55], [0.25, -8.55]],
        clap: ['M-1.15 -7.9L-1.0 -6.6L-0.2 -7.0', 'M1.15 -7.9L1.0 -6.6L0.2 -7.0', [-0.15, -7.05], [0.15, -7.05]] }[o.pose || 'stand'];
      s += '<path d="' + A[0] + '" fill="none" stroke="' + (o.sleeve || top) + '" stroke-width="' + lw + '" stroke-linecap="round" stroke-linejoin="round"/><path d="' + A[1] + '" fill="none" stroke="' + (o.sleeve || top) + '" stroke-width="' + lw + '" stroke-linecap="round" stroke-linejoin="round"/>';
      s += '<circle cx="' + A[2][0] + '" cy="' + A[2][1] + '" r="0.34" fill="' + sk + '"/><circle cx="' + A[3][0] + '" cy="' + A[3][1] + '" r="0.34" fill="' + sk + '"/>';
      s += '<rect x="-0.32" y="-8.6" width="0.64" height="0.6" fill="' + sk + '"/><ellipse cx="0" cy="-9.15" rx="0.82" ry="0.9" fill="' + sk + '"/>';
      if (o.pony) s += '<path d="M-0.84 -9.2Q-0.9 -10.25 0 -10.25Q0.9 -10.25 0.84 -9.2Q0.5 -9.9 0 -9.9Q-0.5 -9.9 -0.84 -9.2Z" fill="' + hr + '"/><path d="M0.7 -9.9Q1.5 -9.6 1.25 -8.4Q1.05 -9.0 0.75 -9.4Z" fill="' + hr + '"/>';
      else if (o.bald) s += '<path d="M-0.84 -9.0Q-0.92 -9.5 -0.78 -9.7L-0.7 -8.9ZM0.84 -9.0Q0.92 -9.5 0.78 -9.7L0.7 -8.9Z" fill="' + hr + '"/>';
      else if (o.hat) s += '<path d="M-0.86 -9.3Q-0.86 -10.45 0 -10.45Q0.86 -10.45 0.86 -9.3Z" fill="' + o.hat + '"/>';
      else if (o.flatcap) s += '<path d="M-0.9 -9.45Q-0.85 -10.3 0.05 -10.3Q0.9 -10.3 0.92 -9.5Q0.2 -9.75 -0.5 -9.6Q-0.9 -9.5 -1.2 -9.25Z" fill="' + o.flatcap + '"/>';
      else s += '<path d="M-0.84 -9.25Q-0.9 -10.25 0 -10.25Q0.9 -10.25 0.84 -9.25Q0.5 -9.8 0 -9.8Q-0.5 -9.8 -0.84 -9.25Z" fill="' + hr + '"/>';
      if (o.beard) s += '<path d="M-0.8 -9.1Q-0.75 -8.0 0 -7.95Q0.75 -8.0 0.8 -9.1Q0.5 -8.55 0 -8.55Q-0.5 -8.55 -0.8 -9.1Z" fill="' + o.beard + '"/>';
      if (o.tash) s += '<path d="M-0.38 -8.85q0.38 -0.2 0.76 0q-0.38 0.15 -0.76 0z" fill="' + o.tash + '"/>';
      if (o.glasses) s += '<path d="M-0.66 -9.32h0.56v0.32q-0.28 0.14 -0.56 0zM0.1 -9.32h0.56v0.32q-0.28 0.14 -0.56 0z" fill="#121314"/><path d="M-0.1 -9.25h0.2" stroke="#121314" stroke-width="0.07"/>' +
        '<circle cx="' + (lit < 0 ? -0.52 : 0.22) + '" cy="-9.22" r="0.07" fill="#fff"/><circle cx="' + (lit < 0 ? 0.24 : 0.56) + '" cy="-9.22" r="0.07" fill="#fff"/>';
      if (o.laugh) s += '<path d="M-0.28 -8.78q0.28 0.3 0.56 0z" fill="#5a2a22"/>';
      if (o.pose === 'phone') s += '<rect x="-0.38" y="-9.35" width="0.76" height="1.15" rx="0.12" fill="#1b1d22"/>';
      if (o.camera) s += '<rect x="-0.8" y="-6.9" width="1.1" height="0.8" rx="0.1" fill="#1b1d22"/><rect x="0.25" y="-6.75" width="1.4" height="0.5" fill="#2a2d33"/>';
    }
    if (o.brolly === 'furled') s += '<path d="M' + (1.7 * (d || 1)) + ' -4.4L' + (2.2 * (d || 1)) + ' -0.2" stroke="' + (o.brollyCol || '#b22d1b') + '" stroke-width="0.42" stroke-linecap="round"/>';
    if (o.brolly === 'up') s += '<path d="M0.4 -7.2V-11.0" stroke="#222" stroke-width="0.12"/><path d="M-2.4 -10.6Q0.4 -13.2 3.2 -10.6Q2.5 -10.9 1.8 -10.5Q1.1 -10.9 0.4 -10.5Q-0.3 -10.9 -1.0 -10.5Q-1.7 -10.9 -2.4 -10.6Z" fill="' + (o.brollyCol || '#2b5d8a') + '"/>';
    /* the side the light comes from: a thin warm edge */
    if (o.rim) s += '<path d="M' + (lit * 1.35) + ' -4.6C' + (lit * 1.6) + ' -6 ' + (lit * 1.6) + ' -7.5 ' + (lit * 1.15) + ' -8.0" fill="none" stroke="' + o.rim + '" stroke-width="0.25" opacity=".7"/>';
    s += '</g>';
    return s;
  }
  X.fig = fig;

  /* the Teapot: cx, by = the middle of the bottom of its basket, s = pixels to a metre. lit: 'L' or 'R' */
  X.teapot = function (cx, by, s, o) {
    o = o || {};
    var id = o.id || 'tp', lit = o.lit || 'L', g = '', i, R = rnd(5), dots = [[-5, 8], [0, 12], [5, 8.5], [-3, 15.5], [3.5, 15.6], [-7, 12.5], [7.2, 12.2], [0, 6], [-1.5, 17.6], [2, 9.6], [-4, 11], [6, 15]];
    g += '<defs><linearGradient id="' + id + 'b" x1="' + (lit === 'L' ? 0 : 1) + '" y1="0" x2="' + (lit === 'L' ? 1 : 0) + '" y2="0"><stop offset="0" stop-color="#e24a39"/><stop offset=".55" stop-color="#c2301f"/><stop offset="1" stop-color="#7c1c12"/></linearGradient></defs>';
    g += '<g transform="translate(' + f1(cx) + ' ' + f1(by) + ') scale(' + s.toFixed(3) + ' ' + (-s).toFixed(3) + ')">';
    g += '<path d="M-0.7 1.2L-1.5 3.8M0.7 1.2L1.5 3.8M0 1.2V3.8" stroke="#3a2a1a" stroke-width="0.12"/>';
    g += '<path d="M-0.8 0h1.6l0.1 1.25h-1.8z" fill="#a9763f"/><path d="M-0.85 1.1h1.7" stroke="#6b4422" stroke-width="0.18"/>';
    if (o.pilot) g += '<circle cx="0.2" cy="1.65" r="0.32" fill="#efc9ae"/>';
    if (o.flame) g += '<path d="M-0.35 3.2Q0 4.6 0.35 3.2Q0.15 3.6 0 3.0Q-0.15 3.6 -0.35 3.2Z" fill="#ffb347"/>';
    g += '<path d="M8.6 7.4C11 7.6 12.3 11 14 15.6L12.6 16.3C11.3 13.6 10.1 11.7 8.9 11.9Z" fill="url(#' + id + 'b)"/>';
    g += '<path d="M-8.7 13.6C-13.2 14.2 -13.6 7.8 -8.5 7.4L-8.7 9.3C-11.5 9.7 -11.4 12.4 -8.9 12.0Z" fill="url(#' + id + 'b)"/>';
    g += '<path d="M-1.5 3.8C-6 4.5 -9.6 7.6 -9.1 11.2C-8.6 15.2 -5 18.6 0 18.6C5 18.6 8.6 15.2 9.1 11.2C9.6 7.6 6 4.5 1.5 3.8Z" fill="url(#' + id + 'b)"/>';
    for (i = 0; i < dots.length; i++) g += '<ellipse cx="' + dots[i][0] + '" cy="' + dots[i][1] + '" rx="' + (0.95 + R() * 0.25).toFixed(2) + '" ry="0.85" fill="#f4e6c8" opacity="' + (lit === 'L' ? (dots[i][0] > 5 ? 0.55 : 0.92) : (dots[i][0] < -5 ? 0.55 : 0.92)) + '"/>';
    g += '<ellipse cx="0" cy="18.4" rx="5.4" ry="0.9" fill="#f4e6c8"/><path d="M-4.8 18.4Q-4.4 21 0 21Q4.4 21 4.8 18.4Z" fill="#efe0c0"/><circle cx="0" cy="21.7" r="0.95" fill="#f4e6c8"/>';
    g += '<path d="M' + (lit === 'L' ? 3.5 : -3.5) + ' 18.5Q' + (lit === 'L' ? 8 : -8) + ' 14.6 ' + (lit === 'L' ? 8.3 : -8.3) + ' 10.4Q' + (lit === 'L' ? 7.6 : -7.6) + ' 6.6 ' + (lit === 'L' ? 3 : -3) + ' 4.4Q' + (lit === 'L' ? 9.6 : -9.6) + ' 8 ' + (lit === 'L' ? 9.1 : -9.1) + ' 11.2Q' + (lit === 'L' ? 8.6 : -8.6) + ' 15.2 ' + (lit === 'L' ? 3.5 : -3.5) + ' 18.5Z" fill="#000" opacity=".22"/>';
    g += '</g>';
    return g;
  };

  /* ---------- the lake, from lamp post 4, looking north. o = {id, time: 'eve' | 'dawn'} ---------- */
  X.lake = function (o) {
    o = o || {};
    var id = o.id || 'lk', eve = o.time !== 'dawn', sun = eve ? SUN.eve : SUN.dawn, s = '', i, R = rnd(eve ? 21 : 33), p, q, x;
    var gnd = function (z) { return HY + F * EYE / z; };
    s += '<defs><linearGradient id="' + id + 'sky" x1="0" y1="0" x2="0" y2="1">' + (eve ?
      '<stop offset="0" stop-color="#7f93a8"/><stop offset=".6" stop-color="#c9c7b8"/><stop offset="1" stop-color="#f0d9a6"/>' :
      '<stop offset="0" stop-color="#9cc0de"/><stop offset=".7" stop-color="#d9e2e6"/><stop offset="1" stop-color="#f6dcc6"/>') + '</linearGradient>' +
      '<linearGradient id="' + id + 'wat" x1="0" y1="0" x2="1" y2="0">' + (eve ? '<stop offset="0" stop-color="#d9cfae"/><stop offset=".55" stop-color="#9aa7a8"/><stop offset="1" stop-color="#55626e"/>' :
      '<stop offset="0" stop-color="#b9cbd8"/><stop offset="1" stop-color="#e8d6cc"/>') + '</linearGradient>' +
      '<linearGradient id="' + id + 'grs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (eve ? '#5f7a3e' : '#6c8752') + '"/><stop offset="1" stop-color="' + (eve ? '#3e5528' : '#4f6a3a') + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'glo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff3c4" stop-opacity=".95"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="' + id + 'lc"><rect x="0" y="360" width="1050" height="44.5"/></clipPath><clipPath id="' + id + 'fr"><rect x="0" y="0" width="1050" height="700"/></clipPath></defs><g clip-path="url(#' + id + 'fr)">';
    s += '<rect x="0" y="0" width="1050" height="370" fill="url(#' + id + 'sky)"/>';
    if (eve) {
      /* the shower going away to the east, and the clear sky coming in from the west */
      s += '<g fill="#56606e" opacity=".55">' + [[700, 40, 120, 60], [820, 20, 150, 70], [960, 50, 140, 80], [760, 120, 110, 50], [900, 140, 150, 60], [1020, 180, 120, 60], [640, 150, 80, 40], [840, 200, 130, 40]].map(function (c) { return '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + c[2] + '" ry="' + c[3] + '"/>'; }).join('') + '</g>' +
        '<g fill="#454f5c" opacity=".5">' + [[860, 60, 110, 50], [980, 110, 110, 60], [760, 70, 70, 36], [940, 210, 100, 30]].map(function (c) { return '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + c[2] + '" ry="' + c[3] + '"/>'; }).join('') + '</g>' +
        '<g stroke="#5b6573" stroke-width="2" opacity=".35">' + (function () { var t = ''; for (var k = 0; k < 26; k++) { var xx = 700 + k * 14; t += '<path d="M' + xx + ' ' + (215 + (k % 3) * 9) + 'l-8 60"/>'; } return t; })() + '</g>' +
        '<path d="M0 120Q90 100 180 126Q250 96 330 118" fill="none" stroke="#fff6d8" stroke-width="20" opacity=".35" stroke-linecap="round"/>';
    } else {
      s += '<rect x="900" y="200" width="300" height="170" fill="url(#' + id + 'glo)" opacity=".7"/>';
    }
    /* the water tower, behind the trees, out to the north-west */
    p = P(-52, 30, 160); q = P(-52, 22, 160);
    s += '<g fill="' + (eve ? '#8a8f8c' : '#9aa4ac') + '"><path d="M' + f1(p[0] - 17) + ' ' + f1(q[1]) + 'L' + f1(p[0] - 9) + ' 290M' + f1(p[0] + 17) + ' ' + f1(q[1]) + 'L' + f1(p[0] + 9) + ' 290M' + f1(p[0] - 5) + ' ' + f1(q[1]) + 'L' + f1(p[0] - 3) + ' 290M' + f1(p[0] + 5) + ' ' + f1(q[1]) + 'L' + f1(p[0] + 3) + ' 290" stroke="' + (eve ? '#7d827f' : '#8d969e') + '" stroke-width="3"/>' +
      '<rect x="' + f1(p[0] - 23.4) + '" y="' + f1(p[1]) + '" width="46.9" height="' + f1(q[1] - p[1]) + '"/><path d="M' + f1(p[0] - 25) + ' ' + f1(p[1]) + 'h50l-4 -6h-42z" fill="' + (eve ? '#6f7471' : '#86909a') + '"/></g>' +
      (eve ? '<rect x="' + f1(p[0] - 23.4) + '" y="' + f1(p[1]) + '" width="16" height="' + f1(q[1] - p[1]) + '" fill="#d8c79c" opacity=".45"/>' : '<rect x="' + f1(p[0] + 7) + '" y="' + f1(p[1]) + '" width="16" height="' + f1(q[1] - p[1]) + '" fill="#f3dccb" opacity=".5"/>');
    /* the spire of St Aldhelm's, far off to the north */
    p = P(21, 65, 420);
    s += '<path d="M' + f1(p[0] - 8) + ' 292L' + f1(p[0]) + ' ' + f1(p[1]) + 'L' + f1(p[0] + 8) + ' 292Z" fill="' + (eve ? '#5e5a52' : '#7a8490') + '"/><path d="M' + f1(p[0]) + ' ' + f1(p[1] - 6) + 'V' + f1(p[1]) + '" stroke="#55524c" stroke-width="1.2"/>' +
      (eve ? '<path d="M' + f1(p[0] - 8) + ' 292L' + f1(p[0]) + ' ' + f1(p[1]) + 'L' + f1(p[0] - 1.5) + ' 292Z" fill="#e0cc98" opacity=".7"/>' : '');
    /* the trees on the far shore */
    var tr = 'M-10 362V286', tx;
    for (tx = -10; tx <= 1060; tx += 22) tr += 'Q' + (tx + 11) + ' ' + (268 + R() * 16).toFixed(0) + ' ' + (tx + 22) + ' ' + (280 + R() * 10).toFixed(0);
    tr += 'V362Z';
    s += '<path d="' + tr + '" fill="' + (eve ? '#3c5232' : '#59705a') + '"/>';
    for (i = 0; i < 40; i++) { x = R() * 1050; s += '<ellipse cx="' + x.toFixed(0) + '" cy="' + (288 + R() * 60).toFixed(0) + '" rx="' + (8 + R() * 12).toFixed(0) + '" ry="' + (6 + R() * 8).toFixed(0) + '" fill="' + (eve ? (x < 500 ? '#6b7f3e' : '#33462c') : '#6b8268') + '" opacity=".55"/>'; }
    /* the boathouse on the north shore, and its flagpole */
    var b0 = P(-2, 0, 126), b1 = P(12, 0, 126), be = P(0, 4, 126), br = P(5, 7, 126), fp = P(6.3, 12, 126), fb = P(6.3, 6.6, 126);
    s += '<rect x="' + f1(b0[0]) + '" y="' + f1(be[1]) + '" width="' + f1(b1[0] - b0[0]) + '" height="' + f1(b0[1] - be[1]) + '" fill="' + (eve ? '#b9a27c' : '#a9a49a') + '"/>' +
      '<path d="M' + f1(b0[0] - 3) + ' ' + f1(be[1]) + 'L' + f1(br[0]) + ' ' + f1(br[1]) + 'L' + f1(b1[0] + 3) + ' ' + f1(be[1]) + 'Z" fill="#4e5a5e"/>' +
      '<g fill="#2b3134">'; for (i = 0; i < 5; i++) s += '<rect x="' + f1(b0[0] + 6 + i * 15.6) + '" y="' + f1(be[1] + 6) + '" width="8" height="10"/>'; s += '</g>' +
      '<path d="M' + f1(fp[0]) + ' ' + f1(fb[1]) + 'V' + f1(fp[1]) + '" stroke="#e8e6df" stroke-width="1.6"/>' +
      (eve ? '<path d="M' + f1(fp[0]) + ' ' + f1(fp[1]) + 'l11 1.5l-1 4l-10 -1.5z" fill="#2b5d8a"/>' : '<path d="M' + f1(fp[0]) + ' ' + f1(fp[1]) + 'l2.5 0l-0.5 9l-2 0z" fill="#2b5d8a"/>');
    /* the lake: the sky in it, the far shore upside down */
    s += '<rect x="0" y="360" width="1050" height="44.5" fill="url(#' + id + 'wat)"/><g clip-path="url(#' + id + 'lc)">';
    s += '<path d="M-10 360H1060V372Q800 370 600 373T-10 371Z" fill="' + (eve ? '#2f4128' : '#5b6e5c') + '" opacity=".75"/>';
    s += '<rect x="' + f1(b0[0]) + '" y="360" width="' + f1(b1[0] - b0[0]) + '" height="' + f1(P(0, -4, 126)[1] - 360) + '" fill="' + (eve ? '#9a8a6a' : '#a09c94') + '" opacity=".5"/>';
    for (i = 0; i < 22; i++) { x = R() * 1050; s += '<path d="M' + x.toFixed(0) + ' ' + (375 + R() * 28).toFixed(0) + 'h' + (14 + R() * 40).toFixed(0) + '" stroke="#fff" stroke-width="1" opacity=".35"/>'; }
    s += '</g>';
    if (!eve) s += '<path d="M-10 352Q200 344 420 354T820 350T1060 356V402Q800 396 600 400T-10 398Z" fill="#f4f1ec" opacity=".72"/><path d="M-10 372Q300 364 600 372T1060 370V392H-10Z" fill="#fff" opacity=".35"/>';
    /* the island and its summer house */
    var ic = P(-13, 0.3, 40), ia = P(-17.5, 0.3, 40), ib = P(-8.5, 0.3, 40), hw = P(-15, 3, 40), he = P(-11, 3, 40), hr = P(-13, 6, 40), hv = P(-13, 8, 40), hb = P(-15, 0.3, 40);
    s += '<path d="M' + f1(ia[0]) + ' ' + f1(ia[1] + 3) + 'Q' + f1(ic[0]) + ' ' + f1(ia[1] - 6) + ' ' + f1(ib[0]) + ' ' + f1(ib[1] + 3) + 'Q' + f1(ic[0]) + ' ' + f1(ia[1] + 9) + ' ' + f1(ia[0]) + ' ' + f1(ia[1] + 3) + 'Z" fill="' + (eve ? '#4f6a33' : '#5d7650') + '"/>';
    s += '<ellipse cx="' + f1(ia[0] + 18) + '" cy="' + f1(ia[1] - 2) + '" rx="16" ry="9" fill="' + (eve ? '#3f5a2a' : '#56704c') + '"/><ellipse cx="' + f1(ib[0] - 16) + '" cy="' + f1(ib[1] - 3) + '" rx="18" ry="10" fill="' + (eve ? '#466232' : '#5a7450') + '"/>';
    s += '<rect x="' + f1(hw[0]) + '" y="' + f1(hw[1]) + '" width="' + f1(he[0] - hw[0]) + '" height="' + f1(hb[1] - hw[1]) + '" fill="#efe9da"/>' +
      '<g fill="#3a3f45">'; for (i = 0; i < 3; i++) s += '<rect x="' + f1(hw[0] + 8 + i * 22) + '" y="' + f1(hw[1] + 10) + '" width="12" height="' + f1(hb[1] - hw[1] - 18) + '" rx="6"/>'; s += '</g>' +
      (eve ? '<rect x="' + f1(hw[0]) + '" y="' + f1(hw[1]) + '" width="18" height="' + f1(hb[1] - hw[1]) + '" fill="#fff3d4" opacity=".55"/>' : '') +
      '<path d="M' + f1(hw[0] - 6) + ' ' + f1(hw[1]) + 'L' + f1(hr[0]) + ' ' + f1(hr[1]) + 'L' + f1(he[0] + 6) + ' ' + f1(hw[1]) + 'Z" fill="#2f5c4f"/>' +
      '<path d="M' + f1(hr[0]) + ' ' + f1(hr[1]) + 'V' + f1(hv[1]) + '" stroke="#1d1f22" stroke-width="2.2"/>' +
      '<path d="M' + f1(hv[0] - 11) + ' ' + f1(hv[1] + 8) + 'h22M' + f1(hv[0] + 11) + ' ' + f1(hv[1] + 8) + 'l-5 -4M' + f1(hv[0] + 11) + ' ' + f1(hv[1] + 8) + 'l-5 4" stroke="#1d1f22" stroke-width="1.8" fill="none"/>' +
      '<path d="M' + f1(hv[0] - 5) + ' ' + f1(hv[1] + 3) + 'q4 -7 9 -2l2 -4l1 6q-6 4 -12 0z" fill="#1d1f22"/>';
    /* the near bank, the path round the lake, and the lawn */
    s += '<path d="M-10 404.5H1060V413.2H-10Z" fill="' + (eve ? '#55703a' : '#5f7a49') + '"/>';
    s += '<path d="M-10 413.2H1060V432.8H-10Z" fill="' + (eve ? '#8d8576' : '#b3a994') + '"/>' + (eve ? '<path d="M-10 413.2H1060V432.8H-10Z" fill="#fff" opacity=".08"/>' : '');
    s += '<path d="M-10 432.8H1060V710H-10Z" fill="url(#' + id + 'grs)"/>';
    for (i = 0; i < 160; i++) { x = R() * 1050; var yy = 440 + Math.pow(R(), 0.8) * 260; s += '<path d="M' + x.toFixed(0) + ' ' + yy.toFixed(0) + 'l' + (R() * 3 - 1.5).toFixed(1) + ' -' + (2 + (yy - 430) / 40).toFixed(1) + '" stroke="' + (eve ? '#7a9447' : '#86a061') + '" stroke-width="1.2" opacity=".6"/>'; }
    if (eve) {
      /* puddles after the shower: the sky in them */
      [[0, 16.4, 1.5], [-2.0, 8.3, 0.45], [1.8, 6.3, 0.6], [6.2, 16.0, 0.9]].forEach(function (pd) {
        var c = P(pd[0], 0, pd[1]), a = P(pd[0] - pd[2], 0, pd[1]), n = P(pd[0], 0, pd[1] - 0.3), f = P(pd[0], 0, pd[1] + 0.3);
        s += '<ellipse cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" rx="' + f1(c[0] - a[0]) + '" ry="' + f1(Math.max(2, (n[1] - f[1]) / 2)) + '" fill="#d9d5c3"/><ellipse cx="' + f1(c[0] - (c[0] - a[0]) * 0.2) + '" cy="' + f1(c[1]) + '" rx="' + f1((c[0] - a[0]) * 0.55) + '" ry="' + f1(Math.max(1, (n[1] - f[1]) / 4)) + '" fill="#f2e3b8" opacity=".8"/>';
      });
    }
    /* the ice-cream kiosk, at the left edge, and (in the evening) the long shadow it throws */
    var KA = [-8.5, 11], KB = [-6.5, 11], KC = [-6.5, 13], KD = [-8.5, 13], kh = 2.4, kdx = sun.s[0] * sun.k * kh, kdz = sun.s[1] * sun.k * kh;
    if (eve) s += '<path d="M' + pp(KA[0], 0, KA[1]) + 'L' + pp(KB[0], 0, KB[1]) + 'L' + pp(KB[0] + kdx, 0, KB[1] + kdz) + 'L' + pp(KC[0] + kdx, 0, KC[1] + kdz) + 'L' + pp(KD[0] + kdx, 0, KD[1] + kdz) + 'L' + pp(KD[0], 0, KD[1]) + 'Z" fill="#1e2a1c" opacity=".55"/>';
    /* ---- shadows on the ground (drawn before the things that cast them) ---- */
    var people = [], arch = eve, ev = [];
    if (eve) {
      /* the runners of the Lakeside 5K, going right, to the finish */
      [[7.0, 16.5, '#d8432a', '#1b1d22', 1], [5.2, 15.8, '#2b5d8a', '#1b1d22', 0], [4.6, 17.2, '#f2f0e6', '#2b5d8a', 0], [3.0, 16.0, '#1f7a4a', '#1b1d22', 0], [2.1, 17.0, '#7a3f8a', '#222', 0],
        [0.9, 15.6, '#e0b21c', '#1b1d22', 0], [-0.6, 16.6, '#1b1d22', '#3a3f45', 0], [-2.0, 15.9, '#c23b6a', '#1b1d22', 0], [-3.4, 17.0, '#3a8ac0', '#1b1d22', 0]].forEach(function (r, k) {
        people.push({ x: r[0], z: r[1], h: 1.74 + (k % 3) * 0.04, o: { pose: 'run', dir: 1, top: r[2], legs: r[3], skin: ['#e3bf9c', '#b07a52', '#f0d3bc', '#7a5236'][k % 4], hair: ['#2a1d14', '#1b1512', '#c8763a', '#3a2a1c'][k % 4], num: 1, rim: '#fff0c8' }, w: 0.5, lead: r[4] });
      });
      people.push({ x: -4.5, z: 18, h: 1.2, o: { pose: 'point', top: '#2b5d8a', legs: '#2a2d33', skin: '#f0d3bc', hair: '#c8763a', brolly: 'furled', brollyCol: '#d8432a', rim: '#fff0c8' }, w: 0.4, boy: 1 });
      people.push({ x: 7.6, z: 14.8, h: 1.72, o: { pose: 'wave', top: '#3a3f45', legs: '#22252a', vest: 1, vestText: 'MARSHAL', skin: '#b07a52', hair: '#111', rim: '#fff0c8' }, w: 0.5 });
      people.push({ x: 12.5, z: 20.5, h: 1.66, o: { pose: 'clap', top: '#7a2f3a', legs: '#2a2d33', skin: '#f0d3bc', hair: '#5a3a1a', rim: '#fff0c8' }, w: 0.5 });
      people.push({ x: 13.6, z: 21, h: 1.8, o: { pose: 'stand', top: '#2f4f3a', legs: '#2a2d33', skin: '#e3bf9c', hair: '#2a1d14', brolly: 'furled', brollyCol: '#2b5d8a', rim: '#fff0c8' }, w: 0.5 });
      people.push({ x: 7.0, z: 21.4, h: 1.6, o: { pose: 'clap', top: '#c9b48a', legs: '#3a3f45', skin: '#7a5236', hair: '#111', rim: '#fff0c8' }, w: 0.5 });
      people.push({ x: -3.0, z: 5, h: 1.8, o: { pose: 'stand', top: '#2a2d33', legs: '#1f2226', vest: 1, vestText: 'STEWARD', skin: '#e8c4a2', hair: '#4a3a2a', glasses: 1, laugh: 1, rim: '#fff0c8' }, w: 0.55, steward: 1 });
    } else {
      [[-2.5, 16.5, -1, '#5a3a2a', '#d8432a'], [3.0, 15.8, 1, '#2f4f3a', '#e0b21c'], [6.5, 17.4, -1, '#2b3a5a', '#ecebe4'], [7.3, 17.6, -1, '#7a2f3a', ''], [0.6, 8.6, -1, '#7a2f3a', '#e0b21c']].forEach(function (r) {
        people.push({ x: r[0], z: r[1], h: 1.72, o: { pose: 'walk', dir: r[2], top: r[3], legs: '#2a2d33', coat: 1, hat: '#3a3f45', scarf: r[4] || null, breath: 1, skin: '#f0d3bc', rim: '#fff4e0', lit: 'R' }, w: 0.5 });
      });
    }
    /* shadows */
    people.forEach(function (m) { s += sunShadow(m.x, m.z, m.w * 1.6, m.h, sun, 0.5, '#1e2a1c', eve ? 0.4 : 0.55); });
    s += sunShadow(-3.5, 7, 0.5, 0.6, sun, 0.8);                    /* the bollard */
    s += sunShadow(-1.0, 9.5, 0.7, 0.5, sun, 0.6);                  /* the dog */
    if (eve) {
      /* the mast of the floodlight: only the part outside the kiosk's shadow shows */
      var m0 = P(2.35, 0, 12 + 2.68 * 0.1564), m1 = sunTip(-0.3, 12, 2.5, sun);
      s += '<path d="M' + f1(m0[0]) + ' ' + f1(m0[1]) + 'L' + f1(m1[0]) + ' ' + f1(m1[1]) + '" stroke="#1e2a1c" stroke-width="2.4" opacity=".45"/>';
      /* the litter bin is in the kiosk's shadow: the only light that can throw a shadow there is the floodlight */
      var lt = lampTip(-3.9, 12, 0.9);
      s += '<path d="M' + pp(-3.9, 0, 11.8) + 'L' + pp(lt[0], 0, 11.88) + 'L' + pp(lt[0], 0, 12.12) + 'L' + pp(-3.9, 0, 12.2) + 'Z" fill="#0d140c" opacity=".6"/>';
      /* the arch's legs */
      s += sunShadow(8.5, 18, 0.9, 4, sun, 0.9) + sunShadow(11.5, 18, 0.9, 4, sun, 0.9);
    } else {
      s += sunShadow(-3.9, 12, 0.5, 0.9, sun, 0.8) + sunShadow(-0.3, 12, 0.3, 2.5, sun, 0.6);
      s += '<path d="M' + pp(KA[0], 0, KA[1]) + 'L' + pp(KD[0], 0, KD[1]) + 'L' + pp(KD[0] + kdx, 0, KD[1] + kdz) + 'L' + pp(KA[0] + kdx, 0, KA[1] + kdz) + 'Z" fill="#1e2a1c" opacity=".3"/>';
    }
    /* ---- the balloons ---- */
    if (eve) {
      var bb = P(-7.5, 7, 70);
      s += X.teapot(bb[0], bb[1], F / 70, { id: id + 'tp', lit: 'L', pilot: 1 });
    } else {
      [[-40, 80, 260, '#e0b21c', '#2b5d8a'], [-5, 45, 180, '#1f7a4a', '#f2f0e6'], [60, 110, 300, '#7a3f8a', '#e0b21c'], [-90, 70, 240, '#2b5d8a', '#d8432a']].forEach(function (b) {
        var c = P(b[0], b[1] + 10, b[2]), r = 8 * F / b[2];
        s += '<g><path d="M' + f1(c[0] - r) + ' ' + f1(c[1]) + 'A' + f1(r) + ' ' + f1(r * 1.1) + ' 0 1 1 ' + f1(c[0] + r) + ' ' + f1(c[1]) + 'Q' + f1(c[0] + r * 0.5) + ' ' + f1(c[1] + r * 1.1) + ' ' + f1(c[0] + r * 0.2) + ' ' + f1(c[1] + r * 1.35) + 'H' + f1(c[0] - r * 0.2) + 'Q' + f1(c[0] - r * 0.5) + ' ' + f1(c[1] + r * 1.1) + ' ' + f1(c[0] - r) + ' ' + f1(c[1]) + 'Z" fill="' + b[3] + '"/>' +
          '<path d="M' + f1(c[0] - r * 0.33) + ' ' + f1(c[1] - r * 1.05) + 'Q' + f1(c[0] - r * 0.45) + ' ' + f1(c[1] + r * 0.4) + ' ' + f1(c[0] - r * 0.12) + ' ' + f1(c[1] + r * 1.3) + 'H' + f1(c[0] + r * 0.12) + 'Q' + f1(c[0] + r * 0.45) + ' ' + f1(c[1] + r * 0.4) + ' ' + f1(c[0] + r * 0.33) + ' ' + f1(c[1] - r * 1.05) + 'Z" fill="' + b[4] + '"/>' +
          '<rect x="' + f1(c[0] - r * 0.15) + '" y="' + f1(c[1] + r * 1.6) + '" width="' + f1(r * 0.3) + '" height="' + f1(r * 0.25) + '" fill="#6b4422"/><path d="M' + f1(c[0] + r) + ' ' + f1(c[1] - r * 0.4) + 'A' + f1(r) + ' ' + f1(r * 1.1) + ' 0 0 1 ' + f1(c[0] + r * 0.2) + ' ' + f1(c[1] + r * 1.3) + '" fill="none" stroke="#000" stroke-opacity=".0"/></g>';
      });
      var tb = P(25, 60, 220);
      s += X.teapot(tb[0], tb[1], F / 220, { id: id + 'tp', lit: 'R', flame: 1 });
    }
    /* ---- things on the ground, far to near ---- */
    var things = [];
    people.forEach(function (m) { things.push({ z: m.z, draw: function () { var f = P(m.x, 0, m.z); return fig(f[0], f[1], m.h * F / m.z, m.o); } }); });
    if (arch) things.push({ z: 18, draw: function () {
      var l0 = P(8.5, 0, 18), l1 = P(11.5, 0, 18), t0 = P(8.5, 4, 18), b2 = P(8.5, 3.0, 18), ck = P(7.9, 2.4, 18.5), cb = P(7.9, 0, 18.5), w = 0.32 * F / 18;
      return '<path d="M' + f1(l0[0]) + ' ' + f1(l0[1]) + 'V' + f1(t0[1] + w) + 'Q' + f1(l0[0]) + ' ' + f1(t0[1]) + ' ' + f1(l0[0] + w) + ' ' + f1(t0[1]) + 'H' + f1(l1[0] - w) + 'Q' + f1(l1[0]) + ' ' + f1(t0[1]) + ' ' + f1(l1[0]) + ' ' + f1(t0[1] + w) + 'V' + f1(l1[1]) + '" fill="none" stroke="#e8e4d4" stroke-width="' + f1(w * 2) + '"/>' +
        '<path d="M' + f1(l0[0] - w) + ' ' + f1(l0[1]) + 'V' + f1(t0[1] + w) + '" stroke="#fff6dc" stroke-width="' + f1(w * 0.7) + '" opacity=".8"/>' +
        '<rect x="' + f1(l0[0] + w) + '" y="' + f1(t0[1] + w * 0.3) + '" width="' + f1(l1[0] - l0[0] - 2 * w) + '" height="' + f1(b2[1] - t0[1]) + '" fill="#d8432a"/>' +
        '<text x="' + f1((l0[0] + l1[0]) / 2) + '" y="' + f1(t0[1] + (b2[1] - t0[1]) * 0.66) + '" font-family="Libre Franklin,sans-serif" font-weight="900" font-size="' + f1((b2[1] - t0[1]) * 0.62) + '" text-anchor="middle" fill="#fff" letter-spacing="1">FINISH</text>' +
        '<text x="' + f1((l0[0] + l1[0]) / 2) + '" y="' + f1(t0[1] + (b2[1] - t0[1]) * 0.95) + '" font-family="DM Mono,monospace" font-size="' + f1((b2[1] - t0[1]) * 0.2) + '" text-anchor="middle" fill="#ffe3c4">LAKESIDE 5K</text>' +
        '<path d="M' + f1(cb[0]) + ' ' + f1(cb[1]) + 'V' + f1(ck[1]) + '" stroke="#222" stroke-width="3"/><rect x="' + f1(ck[0] - 22) + '" y="' + f1(ck[1] - 16) + '" width="44" height="16" fill="#111"/>' +
        '<text x="' + f1(ck[0]) + '" y="' + f1(ck[1] - 3.5) + '" font-family="DM Mono,monospace" font-size="12.5" font-weight="500" text-anchor="middle" fill="#ff5a3c">16:52</text>';
    } });
    things.push({ z: 13, draw: function () {
      /* the kiosk: its front, and its east side in shade */
      var a = P(-8.5, 0, 11), b = P(-6.5, 0, 11), c = P(-6.5, 0, 13), at = P(-8.5, kh, 11), bt = P(-6.5, kh, 11), ct = P(-6.5, kh, 13), r1 = P(-8.7, kh + 0.3, 10.8), r2 = P(-6.3, kh + 0.3, 10.8);
      var hs = P(-8.2, 1.7, 11), he = P(-6.8, 1.0, 11);
      return '<path d="M' + f1(b[0]) + ' ' + f1(b[1]) + 'L' + f1(c[0]) + ' ' + f1(c[1]) + 'L' + f1(ct[0]) + ' ' + f1(ct[1]) + 'L' + f1(bt[0]) + ' ' + f1(bt[1]) + 'Z" fill="' + (eve ? '#5c6a7a' : '#8a96a2') + '"/>' +
        '<rect x="' + f1(a[0]) + '" y="' + f1(at[1]) + '" width="' + f1(b[0] - a[0]) + '" height="' + f1(a[1] - at[1]) + '" fill="' + (eve ? '#a9c6dd' : '#7c8c9a') + '"/>' +
        '<rect x="' + f1(hs[0]) + '" y="' + f1(hs[1]) + '" width="' + f1(he[0] - hs[0]) + '" height="' + f1(he[1] - hs[1]) + '" fill="' + (eve ? '#2a3a48' : '#b7bec4') + '"/>' +
        (eve ? '' : '<g stroke="#8d969e" stroke-width="2">' + (function () { var t = ''; for (var k = 1; k < 8; k++) t += '<path d="M' + f1(hs[0]) + ' ' + f1(hs[1] + (he[1] - hs[1]) * k / 8) + 'H' + f1(he[0]) + '"/>'; return t; })() + '</g>') +
        '<path d="M' + f1(r1[0]) + ' ' + f1(r1[1]) + 'H' + f1(r2[0]) + 'L' + f1(ct[0] + 4) + ' ' + f1(ct[1] - 3) + 'L' + f1(bt[0]) + ' ' + f1(bt[1]) + 'H' + f1(at[0]) + 'Z" fill="#f2efe6"/>' +
        '<text x="' + f1((a[0] + b[0]) / 2) + '" y="' + f1(at[1] + 22) + '" font-family="Libre Franklin,sans-serif" font-size="17" font-weight="900" text-anchor="middle" fill="#c23b6a">ICE CREAMS</text>';
    } });
    things.push({ z: 12, draw: function () {
      /* the litter bin, in the kiosk's shadow, and the floodlight on its mast, lit for the evening concert */
      var b = P(-3.9, 0, 12), t = P(-3.9, 0.9, 12), w = 0.25 * F / 12, m = P(-0.3, 0, 12), mt = P(-0.3, 2.5, 12), r = '';
      r += '<path d="M' + f1(b[0] - w) + ' ' + f1(b[1]) + 'L' + f1(b[0] - w * 1.1) + ' ' + f1(t[1] + 4) + 'H' + f1(b[0] + w * 1.1) + 'L' + f1(b[0] + w) + ' ' + f1(b[1]) + 'Z" fill="' + (eve ? '#1f3d2c' : '#2f5a40') + '"/><rect x="' + f1(b[0] - w * 1.2) + '" y="' + f1(t[1]) + '" width="' + f1(w * 2.4) + '" height="5" fill="' + (eve ? '#16291e' : '#24432f') + '"/>' +
        (eve ? '' : '<path d="M' + f1(b[0] + w * 0.3) + ' ' + f1(b[1]) + 'V' + f1(t[1] + 4) + '" stroke="#fff4e0" stroke-width="3" opacity=".5"/>');
      r += '<path d="M' + f1(m[0]) + ' ' + f1(m[1]) + 'V' + f1(mt[1]) + '" stroke="#3a3f45" stroke-width="7"/>' + (eve ? '<path d="M' + f1(m[0] - 3) + ' ' + f1(m[1] - 8) + 'V' + f1(mt[1]) + '" stroke="#d6c08a" stroke-width="2" opacity=".6"/>' : '');
      r += '<path d="M' + f1(mt[0] + 1) + ' ' + f1(mt[1] - 8) + 'l15 -3l2 14l-15 5z" fill="#2a2d33"/><path d="M' + f1(mt[0]) + ' ' + f1(mt[1] - 8) + 'v16" stroke="' + (eve ? '#fff8d8' : '#9aa0a6') + '" stroke-width="4.5" stroke-linecap="round"/>';
      if (eve) r += '<ellipse cx="' + f1(mt[0] - 4) + '" cy="' + f1(mt[1]) + '" rx="34" ry="28" fill="url(#' + id + 'glo)"/>';
      return r;
    } });
    things.push({ z: 9.5, draw: function () {
      /* a terrier, looking at the balloon */
      var f = P(-1.0, 0, 9.5), u = F / 9.5;
      return '<g transform="translate(' + f1(f[0]) + ' ' + f1(f[1]) + ') scale(' + (u / 10).toFixed(3) + ')">' +
        '<path d="M-3.2 0V-2.3M-2.2 0V-2.2M2.0 0V-2.3M2.8 0V-2.2" stroke="#e8e0cc" stroke-width="0.7" stroke-linecap="round"/>' +
        '<path d="M-3.6 -2.0Q-3.8 -3.6 -2.4 -3.8H2.6Q3.6 -3.7 3.4 -2.2Q3.2 -1.6 2.4 -1.7H-2.8Q-3.5 -1.6 -3.6 -2.0Z" fill="#efe7d2"/>' +
        '<path d="M3.0 -3.6Q4.4 -4.8 3.6 -5.0L3.2 -4.2" fill="#efe7d2"/><path d="M-3.4 -3.4L-3.8 -4.6" stroke="#efe7d2" stroke-width="0.5"/>' +
        '<path d="M-1.4 -3.8Q-1.0 -4.6 0 -5.0Q0.9 -5.3 1.0 -4.6L0.2 -3.8Z" fill="#efe7d2"/>' +
        '<path d="M-0.4 -5.0Q-0.6 -5.6 -0.1 -5.5L0.2 -5.0Z" fill="#8a6a46"/><circle cx="0.3" cy="-4.65" r="0.12" fill="#111"/><path d="M-3.3 -3.0Q0 -3.4 3.2 -2.8" stroke="' + (eve ? '#fff6dc' : '#fff') + '" stroke-width="0.25" opacity=".6"/>' +
        '<path d="M-0.4 -3.9h1.0" stroke="#d8432a" stroke-width="0.25"/></g>';
    } });
    things.push({ z: 7, draw: function () {
      var b = P(-3.5, 0, 7), t = P(-3.5, 0.6, 7), w = 0.11 * F / 7;
      return '<rect x="' + f1(b[0] - w) + '" y="' + f1(t[1]) + '" width="' + f1(w * 2) + '" height="' + f1(b[1] - t[1]) + '" rx="3" fill="#2a2d33"/><rect x="' + f1(b[0] - w) + '" y="' + f1(t[1] + 6) + '" width="' + f1(w * 2) + '" height="3" fill="#cfd6da"/>' +
        '<path d="M' + f1(b[0] + (eve ? -w + 2 : w - 2)) + ' ' + f1(b[1] - 2) + 'V' + f1(t[1] + 2) + '" stroke="' + (eve ? '#fff0c8' : '#fff4e0') + '" stroke-width="2" opacity=".6"/>';
    } });
    things.sort(function (a, b) { return b.z - a.z; });
    things.forEach(function (t) { s += t.draw(); });
    /* the light of the day over everything */
    if (eve) s += '<rect x="0" y="0" width="1050" height="700" fill="#ffcf7a" opacity=".06" pointer-events="none"/>';
    else s += '<rect x="0" y="0" width="1050" height="700" fill="#cfe2ff" opacity=".06" pointer-events="none"/>';
    return s + '</g>';
  };

  /* where things are in the evening picture, in the 1050 x 700 frame (for the pages and the tests) */
  X.OBJ = (function () {
    var sun = SUN.eve, o = {}, lt = lampTip(-3.9, 12, 0.9);
    o.bollard = { top: P(-3.5, 0.6, 7), tip: sunTip(-3.5, 7, 0.6, sun) };
    o.dog = { top: P(-1.0, 0.5, 9.5), tip: sunTip(-1.0, 9.5, 0.5, sun) };
    o.boy = { top: P(-4.5, 1.2, 18), tip: sunTip(-4.5, 18, 1.2, sun) };
    o.bin = { top: P(-3.9, 0.9, 12), tip: P(lt[0], 0, lt[1]) };
    o.lamp = P(-0.3, 2.5, 12);
    var bb = P(-7.5, 7, 70), s70 = F / 70;
    o.balloon = [bb[0] - 13.6 * s70, bb[1] - 22.7 * s70, bb[0] + 14 * s70, bb[1]];
    var a0 = P(8.5, 4, 18), a1 = P(11.5, 3.0, 18);
    o.finish = [a0[0], a0[1], a1[0], a1[1]];
    var l = P(7.0, 0, 16.5), lh = 1.74 * F / 16.5;
    o.leader = [l[0] - lh * 0.32, l[1] - lh * 1.06, l[0] + lh * 0.34, l[1]];
    var st = P(-3.0, 0, 5), sh = 1.8 * F / 5;
    o.steward = [st[0] - sh * 0.17, st[1] - sh * 1.03, st[0] + sh * 0.17, st[1]];
    o.lens = [st[0], st[1] - 9.25 * sh / 10];
    var i0 = P(-17.5, 8, 40), i1 = P(-8.5, 0, 40);
    o.island = [i0[0], i0[1], i1[0], i1[1] + 4];
    var k0 = P(-8.5, 2.7, 11), k1 = P(-6.5, 0, 13);
    o.kiosk = [k0[0], k0[1], k1[0], P(-8.5, 0, 11)[1]];
    var f0 = P(-0.3, 2.5, 12), f2 = P(-0.3, 0, 12);
    o.floodlight = [f0[0] - 20, f0[1] - 14, f0[0] + 6, f2[1]];
    var h0 = P(-2, 7, 126), h1 = P(12, 0, 126);
    o.boathouse = [h0[0] - 3, P(6.3, 12, 126)[1], h1[0] + 3, h1[1]];
    o.runners = [[7.0, 16.5], [5.2, 15.8], [4.6, 17.2], [3.0, 16.0], [2.1, 17.0], [0.9, 15.6], [-0.6, 16.6], [-2.0, 15.9], [-3.4, 17.0]].map(function (r) { var f = P(r[0], 0, r[1]), h = 1.76 * F / r[1]; return [f[0] - h * 0.3, f[1] - h, f[0] + h * 0.32, f[1]]; });
    return o;
  })();

  /* ---------- the festival field, looking north. o = {id, time: 'noon' | 'shower'} ---------- */
  X.field = function (o) {
    o = o || {};
    var id = o.id || 'fd', noon = o.time !== 'shower', s = '', i, R = rnd(noon ? 7 : 9), x, p;
    s += '<defs><linearGradient id="' + id + 'sky" x1="0" y1="0" x2="0" y2="1">' + (noon ? '<stop offset="0" stop-color="#5f9fd6"/><stop offset="1" stop-color="#cfe4f2"/>' : '<stop offset="0" stop-color="#5d6670"/><stop offset="1" stop-color="#9aa2a8"/>') + '</linearGradient>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (noon ? '#8fb357' : '#566e3e') + '"/><stop offset="1" stop-color="' + (noon ? '#5f8a34' : '#3c522a') + '"/></linearGradient>' +
      '<clipPath id="' + id + 'fr"><rect x="0" y="0" width="1050" height="700"/></clipPath></defs><g clip-path="url(#' + id + 'fr)">';
    s += '<rect x="0" y="0" width="1050" height="360" fill="url(#' + id + 'sky)"/>';
    if (noon) { [[200, 90, 70], [700, 60, 90], [930, 130, 50]].forEach(function (c) { s += '<g fill="#fff" opacity=".9"><ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + c[2] + '" ry="' + (c[2] * 0.32) + '"/><ellipse cx="' + (c[0] - c[2] * 0.4) + '" cy="' + (c[1] - c[2] * 0.14) + '" rx="' + (c[2] * 0.45) + '" ry="' + (c[2] * 0.3) + '"/><ellipse cx="' + (c[0] + c[2] * 0.3) + '" cy="' + (c[1] - c[2] * 0.2) + '" rx="' + (c[2] * 0.5) + '" ry="' + (c[2] * 0.36) + '"/></g>'; }); }
    else s += '<path d="M0 0H1050V150Q900 130 760 160T420 150T0 170Z" fill="#454d56" opacity=".8"/>';
    p = P(-80, 55, 220);
    s += '<path d="M' + f1(p[0] - 9) + ' 300L' + f1(p[0]) + ' ' + f1(p[1]) + 'L' + f1(p[0] + 9) + ' 300Z" fill="' + (noon ? '#8f8a7e' : '#6c6f70') + '"/>';
    var tr = 'M-10 360V300', tx;
    for (tx = -10; tx <= 1060; tx += 24) tr += 'Q' + (tx + 12) + ' ' + (282 + R() * 18).toFixed(0) + ' ' + (tx + 24) + ' ' + (294 + R() * 10).toFixed(0);
    s += '<path d="' + tr + 'V360Z" fill="' + (noon ? '#3f6a34' : '#33452c') + '"/>';
    s += '<rect x="0" y="358" width="1050" height="352" fill="url(#' + id + 'g)"/>';
    for (i = 0; i < 140; i++) { x = R() * 1050; var yy = 365 + Math.pow(R(), 0.8) * 335; s += '<path d="M' + x.toFixed(0) + ' ' + yy.toFixed(0) + 'l' + (R() * 3 - 1.5).toFixed(1) + ' -' + (2 + (yy - 360) / 45).toFixed(1) + '" stroke="' + (noon ? '#a9c76e' : '#6f8a52') + '" stroke-width="1.2" opacity=".6"/>'; }
    /* marquees at the sides, a burger van */
    [[-22, 34, '#f2f0e6', '#d8432a'], [16, 40, '#f2f0e6', '#2b5d8a']].forEach(function (m) {
      var a = P(m[0] - 4, 0, m[1]), b = P(m[0] + 4, 0, m[1]), t = P(m[0], 4.2, m[1]), e = P(m[0] - 4, 2.6, m[1]);
      s += '<rect x="' + f1(a[0]) + '" y="' + f1(e[1]) + '" width="' + f1(b[0] - a[0]) + '" height="' + f1(a[1] - e[1]) + '" fill="' + m[2] + '"/>' +
        '<path d="M' + f1(a[0] - 4) + ' ' + f1(e[1]) + 'L' + f1(t[0]) + ' ' + f1(t[1]) + 'L' + f1(b[0] + 4) + ' ' + f1(e[1]) + 'Z" fill="' + m[3] + '"/>' +
        '<rect x="' + f1(a[0] + (b[0] - a[0]) * 0.3) + '" y="' + f1(e[1] + 6) + '" width="' + f1((b[0] - a[0]) * 0.4) + '" height="' + f1(a[1] - e[1] - 6) + '" fill="#3a3f45" opacity=".5"/>';
    });
    p = P(9, 0, 22); var pt = P(9, 2.6, 22), pe = P(14, 0, 22);
    s += '<rect x="' + f1(p[0]) + '" y="' + f1(pt[1]) + '" width="' + f1(pe[0] - p[0]) + '" height="' + f1(p[1] - pt[1]) + '" fill="#e8e2d2"/><rect x="' + f1(p[0] + 12) + '" y="' + f1(pt[1] + 10) + '" width="' + f1(pe[0] - p[0] - 24) + '" height="18" fill="#2a2d33"/>' +
      '<text x="' + f1((p[0] + pe[0]) / 2) + '" y="' + f1(pt[1] - 4) + '" font-family="Libre Franklin,sans-serif" font-weight="900" font-size="13" text-anchor="middle" fill="#d8432a">BURGERS · TEAS</text>';
    var ppl = [], sunN = { s: [-0.342, 0.94], k: 1.03 };      /* the camera on the field looks a little east of north (20 degrees): north, and the spire, are left of the middle */
    if (noon) {
      /* the Teapot laid out on the grass, for people to look at */
      var e0 = P(-3, 0, 14), e1 = P(3, 0, 14), e2 = P(2, 0, 40), e3 = P(-2, 0, 40);
      s += '<path d="M' + f1(e0[0]) + ' ' + f1(e0[1]) + 'L' + f1(e1[0]) + ' ' + f1(e1[1]) + 'Q' + f1(P(4.5, 0, 26)[0]) + ' ' + f1(P(4.5, 0, 26)[1]) + ' ' + f1(e2[0]) + ' ' + f1(e2[1]) + 'L' + f1(e3[0]) + ' ' + f1(e3[1]) + 'Q' + f1(P(-4.5, 0, 26)[0]) + ' ' + f1(P(-4.5, 0, 26)[1]) + ' ' + f1(e0[0]) + ' ' + f1(e0[1]) + 'Z" fill="#c2301f"/>';
      for (i = 0; i < 22; i++) { var zz = 15 + R() * 24, xx = (R() - 0.5) * 6 * (1 - (zz - 14) / 40); p = P(xx, 0, zz); s += '<ellipse cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" rx="' + f1(0.5 * F / zz) + '" ry="' + f1(0.12 * F / zz) + '" fill="#f4e6c8"/>'; }
      var sp = P(3.2, 0, 22), st2 = P(6.5, 0, 25);
      s += '<path d="M' + f1(sp[0]) + ' ' + f1(sp[1] - 2) + 'L' + f1(st2[0]) + ' ' + f1(st2[1] - 2) + 'L' + f1(st2[0]) + ' ' + f1(st2[1] + 3) + 'L' + f1(sp[0]) + ' ' + f1(sp[1] + 4) + 'Z" fill="#a8281a"/>';
      var bk = P(-0.9, 0, 12.5), bk2 = P(0.9, 1.2, 12.5);
      s += '<rect x="' + f1(bk[0]) + '" y="' + f1(bk2[1]) + '" width="' + f1(bk2[0] - bk[0]) + '" height="' + f1(bk[1] - bk2[1]) + '" fill="#a9763f" transform="rotate(-8 ' + f1(bk[0]) + ' ' + f1(bk[1]) + ')"/>';
      ppl = [[-4.0, 6.5, '#f2f0e6', 'stand'], [-2.4, 8.5, '#d8432a', 'point'], [3.4, 7.2, '#e0b21c', 'stand'], [4.8, 9.6, '#2b5d8a', 'stand'], [1.8, 11, '#7a3f8a', 'stand'], [-6.4, 13, '#1f7a4a', 'stand']];
      ppl.forEach(function (m) { s += sunShadow(m[0], m[1], 0.8, 1.7, sunN, 0.6, '#24331a', 0.55); });
      ppl.forEach(function (m) { var f = P(m[0], 0, m[1]); s += fig(f[0], f[1], 1.7 * F / m[1], { pose: m[3], top: m[2], legs: m[2] === '#f2f0e6' ? '#2b5d8a' : '#3a3f45', skin: ['#e3bf9c', '#f0d3bc', '#b07a52'][Math.round(m[1]) % 3], hair: '#3a2a1c' }); });
      s += '<rect x="0" y="0" width="1050" height="700" fill="#fff7d8" opacity=".05" pointer-events="none"/>';
    } else {
      /* the shower: everybody under umbrellas, the Teapot's basket under a sheet, nothing flying */
      var k0 = P(-1, 0, 12), k1 = P(1, 1.3, 12);
      s += '<rect x="' + f1(k0[0]) + '" y="' + f1(k1[1]) + '" width="' + f1(k1[0] - k0[0]) + '" height="' + f1(k0[1] - k1[1]) + '" fill="#a9763f"/><path d="M' + f1(k0[0] - 14) + ' ' + f1(k0[1] - 10) + 'Q' + f1((k0[0] + k1[0]) / 2) + ' ' + f1(k1[1] - 40) + ' ' + f1(k1[0] + 14) + ' ' + f1(k0[1] - 10) + 'Z" fill="#2b5d8a" opacity=".9"/>' +
        '<rect x="' + f1(P(2.5, 0, 13)[0]) + '" y="' + f1(P(2.5, 1.0, 13)[1]) + '" width="' + f1(1.5 * F / 13) + '" height="' + f1(1.0 * F / 13) + '" rx="10" fill="#c2301f"/><text x="' + f1(P(3.25, 0, 13)[0]) + '" y="' + f1(P(3.25, 0.4, 13)[1]) + '" font-family="Libre Franklin,sans-serif" font-weight="900" font-size="14" text-anchor="middle" fill="#f4e6c8">TEAPOT</text>';
      ppl = [[-3.8, 10.5, '#3a3f45', '#d8432a'], [-1.8, 9, '#2f4f3a', '#e0b21c'], [3.2, 9.6, '#7a2f3a', '#1f7a4a'], [5.6, 12.5, '#2b3a5a', '#f2f0e6'], [-6.2, 14, '#5a3a2a', '#7a3f8a'], [1.0, 16, '#3a3f45', '#2b5d8a']];
      ppl.forEach(function (m) { var f = P(m[0], 0, m[1]); s += fig(f[0], f[1], 1.7 * F / m[1], { pose: 'stand', top: m[2], legs: '#2a2d33', skin: '#e3bf9c', hair: '#3a2a1c', brolly: 'up', brollyCol: m[3] }); });
      [[-2, 8.5, 1.1], [4.5, 11.2, 0.9], [-5, 18, 1.4]].forEach(function (pd) { var c = P(pd[0], 0, pd[1]), a = P(pd[0] - pd[2], 0, pd[1]); s += '<ellipse cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" rx="' + f1(c[0] - a[0]) + '" ry="' + f1((c[0] - a[0]) * 0.12) + '" fill="#9aa2a8" opacity=".85"/>'; });
      s += '<g stroke="#e8eef2" stroke-width="1.2" opacity=".45">';
      for (i = 0; i < 160; i++) { x = R() * 1100; s += '<path d="M' + x.toFixed(0) + ' ' + (R() * 680).toFixed(0) + 'l-6 26"/>'; }
      s += '</g><rect x="0" y="0" width="1050" height="700" fill="#5d6670" opacity=".12" pointer-events="none"/>';
    }
    return s + '</g>';
  };

  /* ---------- "the pilot waves": a picture made of two pictures (600 x 400) ---------- */
  X.pilot = function (o) {
    o = o || {};
    var id = o.id || 'pl', s = '';
    s += '<defs><clipPath id="' + id + 'c"><rect width="600" height="400"/></clipPath><linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a98a8"/><stop offset="1" stop-color="#e2d6b4"/></linearGradient></defs><g clip-path="url(#' + id + 'c)">';
    s += '<rect width="600" height="400" fill="url(#' + id + 's)"/>';
    s += '<path d="M0 250Q120 236 240 248T600 244V400H0Z" fill="#9aa7a8"/><path d="M0 250Q120 236 240 248T600 244V262H0Z" fill="#3c5232"/>';
    s += '<g fill="#fff" opacity=".85"><ellipse cx="120" cy="330" rx="70" ry="22"/><ellipse cx="80" cy="310" rx="30" ry="18"/><ellipse cx="160" cy="306" rx="26" ry="16"/><circle cx="60" cy="290" r="6"/><circle cx="190" cy="284" r="5"/><circle cx="110" cy="276" r="4"/></g>';
    s += X.teapot(470, 300, 15, { id: id + 't', lit: 'L' }).replace('<g transform', '<g opacity="1" transform');
    /* the man, pasted in: lit hard from above and from the right */
    s += '<g transform="translate(300 400)">' +
      '<path d="M-120 0V-80Q-110 -150 -40 -160H40Q110 -150 120 -80V0Z" fill="#e8e2d2"/><path d="M40 -160Q110 -150 120 -80V0H60Z" fill="#fff" opacity=".35"/>' +
      '<path d="M-150 0V-40H150V0Z" fill="#a9763f"/><path d="M-150 -40H150" stroke="#6b4422" stroke-width="10"/><path d="M-140 -20H140M-140 -6H140" stroke="#8a5a2a" stroke-width="3"/>' +
      '<path d="M-60 -160Q-120 -230 -150 -320" stroke="#e8e2d2" stroke-width="30" stroke-linecap="round" fill="none"/><circle cx="-152" cy="-330" r="18" fill="#d9a37c"/>' +
      '<rect x="-16" y="-190" width="32" height="34" fill="#d9a37c"/><ellipse cx="0" cy="-232" rx="50" ry="56" fill="#d9a37c"/><path d="M0 -232Q30 -240 46 -220Q44 -180 0 -176Z" fill="#fff" opacity=".18"/>' +
      '<path d="M-52 -250Q-50 -296 0 -298Q52 -296 54 -252Q20 -262 -10 -262Q-36 -262 -52 -250Z" fill="#1b1d22"/><path d="M-60 -252Q0 -272 74 -246L70 -236Q4 -258 -58 -242Z" fill="#1b1d22"/>' +
      '<path d="M-40 -236h34v20q-17 10 -34 0zM6 -236h34v20q-17 10 -34 0z" fill="#121314"/><path d="M-6 -230h12" stroke="#121314" stroke-width="4"/>' +
      '<path d="M-36 -233h26v14q-13 7 -26 0zM10 -233h26v14q-13 7 -26 0z" fill="#3aa6d6"/><path d="M-36 -224h26M10 -224h26" stroke="#f2deb0" stroke-width="5"/><circle cx="-18" cy="-231" r="3.5" fill="#fff"/><circle cx="28" cy="-231" r="3.5" fill="#fff"/>' +
      '<path d="M-20 -196q20 16 40 0" stroke="#7d3f34" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-4 -196l-10 -12h28z" fill="#7a4a32" opacity=".35"/>' +
      '</g>';
    s += '<g fill="#fff" opacity=".7"><circle cx="160" cy="388" r="9"/><circle cx="440" cy="392" r="7"/><circle cx="500" cy="380" r="5"/></g>';
    return s + '</g>';
  };

  /* ---------- Lou's picture at the shallows, ten past six (900 x 600). The people in it have ids ---------- */
  X.SHALLOWS = [
    { id: 'hamish', x: 330, y: 470, h: 230 }, { id: 'crew', x: 470, y: 452, h: 250 }, { id: 'esme', x: 600, y: 470, h: 190 },
    { id: 'steward', x: 712, y: 462, h: 236 }, { id: 'platt', x: 830, y: 450, h: 250 }, { id: 'runner', x: 148, y: 470, h: 236 }
  ];
  X.shallows = function (o) {
    o = o || {};
    var id = o.id || 'sh', s = '', i, R = rnd(41), x;
    s += '<defs><linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fa3b8"/><stop offset="1" stop-color="#f0d9a6"/></linearGradient>' +
      '<clipPath id="' + id + 'c"><rect width="900" height="600"/></clipPath></defs><g clip-path="url(#' + id + 'c)">';
    s += '<rect width="900" height="330" fill="url(#' + id + 's)"/><g fill="#56606e" opacity=".5"><ellipse cx="640" cy="60" rx="130" ry="60"/><ellipse cx="790" cy="40" rx="150" ry="70"/><ellipse cx="720" cy="140" rx="120" ry="50"/><ellipse cx="880" cy="150" rx="110" ry="60"/></g>';
    s += '<path d="M0 300Q200 280 400 296T900 286V340H0Z" fill="#3c5232"/>';
    s += '<rect x="0" y="330" width="900" height="120" fill="#9aa7a8"/><path d="M0 330H900V346Q600 340 300 348T0 344Z" fill="#2f4128" opacity=".6"/>';
    for (i = 0; i < 26; i++) { x = R() * 900; s += '<path d="M' + x.toFixed(0) + ' ' + (360 + R() * 80).toFixed(0) + 'h' + (14 + R() * 40).toFixed(0) + '" stroke="#fff" stroke-width="1.2" opacity=".4"/>'; }
    s += '<path d="M0 450Q300 436 600 446T900 440V600H0Z" fill="#5f7a3e"/>';
    /* the Teapot, down in the water: its basket on its side, its body lying across the shallows */
    s += '<path d="M60 360Q150 300 300 318Q420 300 520 330Q560 370 470 392Q300 410 160 400Q70 396 60 360Z" fill="#c2301f"/>' +
      '<g fill="#f4e6c8">'; [[120, 356], [190, 336], [260, 350], [330, 332], [400, 352], [460, 340], [230, 378], [360, 384], [150, 380]].forEach(function (d) { s += '<ellipse cx="' + d[0] + '" cy="' + d[1] + '" rx="11" ry="7"/>'; }); s += '</g>' +
      '<path d="M500 330Q560 300 600 252L612 262Q580 312 520 350Z" fill="#a8281a"/><ellipse cx="96" cy="360" rx="30" ry="12" fill="#efe0c0"/>' +
      '<path d="M290 430l60 -30l30 44l-60 30z" fill="#a9763f"/><path d="M290 430l60 -30" stroke="#6b4422" stroke-width="6"/>' +
      '<path d="M560 330Q640 380 700 420" stroke="#e8e4d4" stroke-width="3" fill="none"/>';
    /* the people */
    var shallow = { hamish: { pose: 'stand', top: '#2f4f7a', legs: '#2f3a4a', skin: '#efc9ae', hair: '#f1efe9', bald: 1, tash: '#f4f2ec' },
      crew: { pose: 'stand', top: '#2a2d33', legs: '#1f2226', vest: 1, vestText: 'CREW', skin: '#e3bf9c', hair: '#3a2a1c' },
      esme: { pose: 'phone', top: '#3a3f6b', legs: '#26292e', vest: 1, vestText: 'CREW', skin: '#f2d6c2', hair: '#6b4426', pony: 1 },
      steward: { pose: 'stand', top: '#2a2d33', legs: '#1f2226', vest: 1, vestText: 'STEWARD', skin: '#e8c4a2', hair: '#4a3a2a', glasses: 1 },
      platt: { pose: 'stand', top: '#5a4a3a', legs: '#2a2d33', skin: '#e8c4a2', hair: '#3a2a1c', beard: '#4a3a2a', flatcap: '#4a443c', camera: 1 },
      runner: { pose: 'stand', top: '#d8432a', legs: '#1b1d22', skin: '#b07a52', hair: '#1b1512', num: '214' } };
    X.SHALLOWS.forEach(function (m) {
      s += '<path d="M' + m.x + ' ' + m.y + 'l' + (m.h * 0.9) + ' ' + (-m.h * 0.06) + 'l0 8l' + (-m.h * 0.9) + ' 4z" fill="#1e2a1c" opacity=".35"/>';
      s += '<g class="who" data-who="' + m.id + '">' + fig(m.x, m.y, m.h, shallow[m.id]) + '<rect x="' + (m.x - m.h * 0.2) + '" y="' + (m.y - m.h * 1.08) + '" width="' + (m.h * 0.4) + '" height="' + (m.h * 1.1) + '" fill="#fff" opacity="0"/></g>';
    });
    s += '<path d="M500 448Q540 430 560 330" stroke="#e8e4d4" stroke-width="3" fill="none"/>';
    s += '<rect width="900" height="600" fill="#ffcf7a" opacity=".05" pointer-events="none"/>';
    return s + '</g>';
  };

  /* ---------- a lens, close up (200 x 200): what the sunglasses saw. kind: 'crew' or 'beach' ---------- */
  X.lens = function (kind, id) {
    id = id || ('ln' + kind);
    var s = '<defs><clipPath id="' + id + 'c"><ellipse cx="100" cy="100" rx="96" ry="84"/></clipPath><radialGradient id="' + id + 'g" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient></defs>';
    s += '<g clip-path="url(#' + id + 'c)">';
    if (kind === 'crew') {
      /* behind the camera: the café, the low sun on the left, lamp post 4, and the photographer. A mirror: CREW reads backwards */
      s += '<rect width="200" height="200" fill="#3a3a30"/><path d="M0 0H200V118Q100 100 0 118Z" fill="#c9b886"/><circle cx="18" cy="96" r="22" fill="#fff6d0"/><circle cx="18" cy="96" r="40" fill="#fff6d0" opacity=".3"/>' +
        '<path d="M60 112Q60 92 70 86H178Q188 92 190 112Z" fill="#7a6a56"/><rect x="74" y="92" width="100" height="16" fill="#e8e0cc"/><text x="124" y="104.5" font-family="Libre Franklin,sans-serif" font-weight="900" font-size="11" text-anchor="middle" fill="#2b5d8a" transform="translate(248 0) scale(-1 1)">LAKESIDE CAFE</text>' +
        '<path d="M0 118Q100 100 200 118V200H0Z" fill="#4f6a33"/><path d="M146 72V152" stroke="#2a2d33" stroke-width="3"/><rect x="140" y="64" width="12" height="9" fill="#2a2d33"/><rect x="141" y="118" width="10" height="11" fill="#e8e0cc"/><text x="146" y="127" font-family="Libre Franklin,sans-serif" font-weight="900" font-size="9" text-anchor="middle" fill="#1d1d1d" transform="translate(292 0) scale(-1 1)">4</text>' +
        fig(104, 168, 96, { pose: 'phone', top: '#3a3f6b', legs: '#26292e', vest: 1, vestText: 'CREW', mirror: 1, skin: '#f2d6c2', hair: '#6b4426', pony: 1, rim: '#fff0c8' });
    } else {
      /* behind the camera: a beach, palm trees and a high sun */
      s += '<rect width="200" height="200" fill="#5fb2e8"/><circle cx="110" cy="22" r="16" fill="#fffbe8"/><circle cx="110" cy="22" r="30" fill="#fffbe8" opacity=".3"/>' +
        '<path d="M0 104Q100 96 200 104V130H0Z" fill="#1f7ab0"/><path d="M0 128Q100 118 200 128V200H0Z" fill="#f2deb0"/>' +
        '<path d="M44 140Q40 100 52 70" stroke="#7a5a32" stroke-width="5" fill="none"/><path d="M52 70q-26 -6 -36 8M52 70q-20 -18 -34 -16M52 70q8 -22 28 -24M52 70q26 -6 34 10M52 70q16 6 22 22" stroke="#2f7a3a" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<path d="M160 138Q164 104 152 82" stroke="#7a5a32" stroke-width="4" fill="none"/><path d="M152 82q-22 -4 -30 8M152 82q-6 -18 -22 -20M152 82q14 -16 30 -10M152 82q22 2 26 16" stroke="#2f7a3a" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<path d="M96 166v-14" stroke="#222" stroke-width="2"/><path d="M84 152q12 -12 24 0z" fill="#e0b21c"/>' +
        fig(122, 176, 50, { pose: 'phone', top: '#e0b21c', legs: '#2b5d8a', skin: '#e3bf9c', hair: '#3a2a1c' });
    }
    s += '<ellipse cx="100" cy="100" rx="96" ry="84" fill="url(#' + id + 'g)"/></g><ellipse cx="100" cy="100" rx="96" ry="84" fill="none" stroke="#121314" stroke-width="7"/>';
    return s;
  };

  /* ---------- the plan of Lockyer Park (720 x 540). Landmarks: PH.MARK; lamp posts: PH.POSTS ---------- */
  function M(x, z) { return [360 + 1.2 * x, 490 - 1.05 * z]; }
  X.M = M;
  X.MARK = {
    spire: { at: M(21, 420), name: 'the spire of St Aldhelm’s' }, tower: { at: M(-52, 160), name: 'the water tower' },
    flag: { at: M(6.3, 126), name: 'the flagpole on the boathouse' }, house: { at: M(-13, 40), name: 'the summer house on the island' },
    fountain: { at: M(96, 64), name: 'the fountain' }, cafe: { at: M(0, -22), name: 'the Lakeside Café' }, oak: { at: M(-80, 132), name: 'the old oak' }
  };
  X.POSTS = [1, 2, 3, 4, 5, 6, 7].map(function (n) { return M(-75 + 25 * (n - 1), 0); });
  X.map = function () {
    var s = '', i, p, q;
    s += '<rect width="720" height="540" fill="#f2ecd8"/>';
    /* the park's edge, its lawns and trees */
    s += '<path d="M150 30H600V528H150Z" fill="#dfe6c4" stroke="#7d8f5a" stroke-width="2"/>';
    var R = rnd(13);
    for (i = 0; i < 70; i++) { var tx = 158 + R() * 434, ty = 36 + R() * 480; if (tx > 205 && tx < 445 && ty > 350 && ty < 480) continue; if (ty > 150 && ty < 310 && tx > 236 && tx < 460) continue; s += '<circle cx="' + tx.toFixed(0) + '" cy="' + ty.toFixed(0) + '" r="' + (4 + R() * 4).toFixed(1) + '" fill="#9bb37a" opacity=".8"/>'; }
    /* the festival field */
    p = M(-100, 320); q = M(80, 180);
    s += '<rect x="' + p[0] + '" y="' + p[1] + '" width="' + (q[0] - p[0]) + '" height="' + (q[1] - p[1]) + '" fill="#eef0d0" stroke="#7d8f5a" stroke-width="1.5" stroke-dasharray="5 4"/>' +
      '<text x="' + ((p[0] + q[0]) / 2) + '" y="' + ((p[1] + q[1]) / 2 - 6) + '" class="fL" font-size="12" font-weight="800" text-anchor="middle" fill="#5a6a3a" letter-spacing="1.5">FESTIVAL FIELD</text>' +
      '<text x="' + ((p[0] + q[0]) / 2) + '" y="' + ((p[1] + q[1]) / 2 + 10) + '" class="fM" font-size="10" text-anchor="middle" fill="#5a6a3a">balloons go up here</text>';
    /* the lake */
    s += '<path d="' + (function () { var t = '', k; for (k = 0; k <= 40; k++) { var a = k / 40 * Math.PI * 2, x = -30 + 90 * Math.cos(a) + 6 * Math.sin(3 * a), z = 71 + 49 * Math.sin(a) + 3 * Math.cos(2 * a); var m = M(x, z); t += (k ? 'L' : 'M') + m[0].toFixed(1) + ' ' + m[1].toFixed(1); } return t + 'Z'; })() + '" fill="#a9cfe6" stroke="#5c8fb5" stroke-width="2"/>';
    s += '<text x="' + M(-62, 92)[0] + '" y="' + M(-62, 92)[1] + '" class="fN" font-size="15" font-style="italic" font-weight="600" text-anchor="middle" fill="#2c5f86">Boating Lake</text>';
    p = M(-13, 40); s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="9" ry="6" fill="#cfdcae" stroke="#5c8fb5" stroke-width="1"/>';
    /* paths: the terrace along the south, the path round the lake (the route of the 5K), the paths to the gates */
    p = M(-110, 0); q = M(110, 0);
    s += '<path d="M' + p[0] + ' ' + p[1] + 'H' + q[0] + '" stroke="#c9b993" stroke-width="7"/><text x="' + (q[0] + 6) + '" y="' + (q[1] + 4) + '" class="fM" font-size="9.5" fill="#6b5a3a">the Terrace</text>';
    s += '<path d="' + (function () { var t = '', k; for (k = 0; k <= 40; k++) { var a = k / 40 * Math.PI * 2, x = -30 + 104 * Math.cos(a), z = 71 + 58 * Math.sin(a); var m = M(x, z); t += (k ? 'L' : 'M') + m[0].toFixed(1) + ' ' + m[1].toFixed(1); } return t + 'Z'; })() + '" fill="none" stroke="#d8432a" stroke-width="1.6" stroke-dasharray="4 4" opacity=".75"/>';
    p = M(9, 16); s += '<path d="M' + (p[0] - 7) + ' ' + p[1] + 'h14" stroke="#d8432a" stroke-width="3"/><text x="' + (p[0] + 10) + '" y="' + (p[1] - 4) + '" class="fL" font-size="9.5" font-weight="800" fill="#d8432a">5K FINISH</text>';
    s += '<text x="' + M(-128, 120)[0] + '" y="' + M(-128, 120)[1] + '" class="fM" font-size="9" fill="#d8432a" transform="rotate(-70 ' + M(-128, 120)[0] + ' ' + M(-128, 120)[1] + ')">Lakeside 5K route</text>';
    /* the railway, south-east */
    s += '<path d="M600 300L720 220M600 300" stroke="#2a2a2a" stroke-width="2.2"/><path d="M600 300L720 220" stroke="#2a2a2a" stroke-width="7" stroke-dasharray="1.5 9"/><text x="640" y="246" class="fM" font-size="9.5" fill="#2a2a2a" transform="rotate(-34 640 246)">railway</text>';
    /* landmarks */
    var LB = { spire: [10, 4, 'start'], tower: [-10, 4, 'end'], flag: [10, -6, 'start'], house: [-12, 4, 'end'], fountain: [0, 20, 'middle'], cafe: [12, 4, 'start'], oak: [-10, 4, 'end'] };
    Object.keys(X.MARK).forEach(function (k) {
      var m = X.MARK[k], a = m.at, lb = LB[k];
      s += '<g class="mk" data-mk="' + k + '">';
      if (k === 'spire') s += '<path d="M' + a[0] + ' ' + (a[1] - 9) + 'l6 14h-12z" fill="#5a4a3a"/><rect x="' + (a[0] - 7) + '" y="' + (a[1] + 5) + '" width="14" height="10" fill="#5a4a3a"/>';
      else if (k === 'tower') s += '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="8" fill="#7d8a94" stroke="#3a4650" stroke-width="2"/>';
      else if (k === 'flag') s += '<rect x="' + (a[0] - 14) + '" y="' + (a[1] - 2) + '" width="22" height="9" fill="#b9a27c" stroke="#5a4a3a" stroke-width="1"/><path d="M' + a[0] + ' ' + a[1] + 'v-14l9 3l-9 3" stroke="#2b5d8a" stroke-width="1.6" fill="#2b5d8a"/>';
      else if (k === 'house') s += '<path d="M' + (a[0] - 5) + ' ' + a[1] + 'l5 -8l5 8z" fill="#2f5c4f"/><circle cx="' + a[0] + '" cy="' + (a[1] + 2) + '" r="3" fill="#efe9da" stroke="#2f5c4f"/>';
      else if (k === 'fountain') s += '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="8" fill="#a9cfe6" stroke="#5c8fb5" stroke-width="2"/><circle cx="' + a[0] + '" cy="' + a[1] + '" r="2.5" fill="#5c8fb5"/>';
      else if (k === 'cafe') s += '<rect x="' + (a[0] - 18) + '" y="' + (a[1] - 7) + '" width="36" height="14" fill="#c9a37a" stroke="#5a4a3a" stroke-width="1"/>';
      else if (k === 'oak') s += '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="11" fill="#6f8f4a" stroke="#3f5a2a" stroke-width="1.5"/>';
      s += '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="15" fill="#fff" opacity="0"/><circle class="hit" cx="' + a[0] + '" cy="' + a[1] + '" r="4" fill="#d8432a" stroke="#fff" stroke-width="1.5"/>';
      s += '<text x="' + (a[0] + lb[0]) + '" y="' + (a[1] + lb[1]) + '" class="fL" font-size="10.5" font-weight="700" text-anchor="' + lb[2] + '" fill="#2a2a1a" stroke="#f2ecd8" stroke-width="3" paint-order="stroke">' + m.name.replace(/^the /, '').replace('’', "'") + '</text></g>';
    });
    /* the lamp posts on the Terrace */
    X.POSTS.forEach(function (a, k) {
      s += '<g class="post" data-post="' + (k + 1) + '"><circle cx="' + a[0] + '" cy="' + a[1] + '" r="11" fill="#fff" opacity="0"/><circle cx="' + a[0] + '" cy="' + a[1] + '" r="6.5" fill="#fffdf6" stroke="#2a2a1a" stroke-width="1.5"/>' +
        '<text x="' + a[0] + '" y="' + (a[1] + 3.5) + '" class="fL" font-size="9" font-weight="900" text-anchor="middle" fill="#2a2a1a">' + (k + 1) + '</text></g>';
    });
    s += '<text x="' + M(-110, 0)[0] + '" y="' + (M(-110, 0)[1] + 22) + '" class="fM" font-size="9.5" fill="#6b5a3a">lamp posts 1-7</text>';
    p = M(-14, 12); s += '<rect x="' + (p[0] - 5) + '" y="' + (p[1] - 3) + '" width="10" height="6" fill="#c23b6a"/><text x="' + (p[0] - 8) + '" y="' + (p[1] + 3) + '" class="fM" font-size="8.5" text-anchor="end" fill="#6b5a3a">kiosk</text>';
    /* north, scale, title */
    s += '<g transform="translate(660 70)"><path d="M0 -26L8 4L0 -2L-8 4Z" fill="#2a2a1a"/><text x="0" y="20" class="fL" font-size="13" font-weight="900" text-anchor="middle" fill="#2a2a1a">N</text></g>';
    s += '<g transform="translate(616 512)"><path d="M0 0h60" stroke="#2a2a1a" stroke-width="3"/><path d="M0 -4v8M30 -3v6M60 -4v8" stroke="#2a2a1a" stroke-width="1.5"/><text x="30" y="-8" class="fM" font-size="10" text-anchor="middle" fill="#2a2a1a">50 m</text></g>';
    s += '<text x="20" y="34" class="fL" font-size="16" font-weight="900" fill="#2a2a1a" letter-spacing="1">LOCKYER PARK</text><text x="20" y="52" class="fM" font-size="10" fill="#6b5a3a">Cobbleford Balloon Weekend · plan</text>';
    return s;
  };
  return X;
})();
