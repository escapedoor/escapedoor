/* Four and a Half Times - what every room of the story shares: a few sounds of the desert (sand, salt, a short-wave hiss,
   time pips, a far aeroplane), number wheels, the sky over the party for the nights of 14 and 15 April 1988, and the
   small short-wave receiver that only listens. Loaded after engine.js. Nothing in here knows an answer: the sky is worked
   out from star positions and the clock, as the real one is. */
window.DUNE = (function () {
  'use strict';
  var X = {}, D = document, NS = 'http://www.w3.org/2000/svg', RAD = Math.PI / 180;
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds (through the engine, so that the sound button switches them) ---------- */
  X.sfx = {
    step: function () { B({ type: 'lowpass', f: 620, dur: 0.12, peak: 0.16 }); B({ type: 'lowpass', f: 520, dur: 0.12, peak: 0.13, when: 0.4 }); },
    crunch: function () { B({ type: 'highpass', f: 2600, dur: 0.09, peak: 0.07 }); B({ type: 'bandpass', f: 1400, q: 1.2, dur: 0.07, peak: 0.06, when: 0.05 }); },
    stone: function () { T({ f: 900, f2: 640, dur: 0.05, peak: 0.08 }); B({ dur: 0.03, f: 2200, q: 3, peak: 0.1 }); },
    notch: function () { B({ dur: 0.018, f: 3400, q: 5, peak: 0.09 }); T({ f: 900, f2: 700, dur: 0.03, peak: 0.03 }); },
    pin: function () { T({ f: 260, f2: 150, dur: 0.07, peak: 0.18 }); B({ dur: 0.03, f: 2400, q: 3, peak: 0.12 }); },
    pencil: function () { B({ type: 'highpass', f: 3000, dur: 0.16, peak: 0.05, a: 0.03 }); },
    click: function () { B({ dur: 0.02, f: 2600, q: 2, peak: 0.16 }); T({ f: 180, dur: 0.04, peak: 0.06 }); },
    water: function () { B({ type: 'bandpass', f: 700, f2: 1300, q: 0.8, dur: 0.5, peak: 0.07, a: 0.15 }); },
    glint: function () { T({ f: 2600, f2: 3400, dur: 0.18, peak: 0.035 }); T({ f: 3900, dur: 0.12, peak: 0.02, when: 0.05 }); },
    no: function () { T({ type: 'triangle', f: 150, f2: 92, dur: 0.26, peak: 0.24 }); },
    /* one pip of the time signal: a short one, or the long one that marks the second */
    pip: function (long, when) { T({ type: 'sine', f: 1000, dur: long ? 0.55 : 0.1, peak: 0.07, a: 0.005, when: when || 0 }); }
  };
  /* A steady short-wave hiss while the receiver is open: louder off a station, softer on one. */
  var hiss = null;
  X.hiss = function (level) {
    try {
      var c = ER.audio && ER.audio(), out = ER.out && ER.out(); if (!c || !out) return;
      if (level == null || level <= 0) { if (hiss) { var h = hiss; hiss = null; h.g.gain.setTargetAtTime(0.0001, c.currentTime, 0.08); setTimeout(function () { try { h.s.stop(); } catch (e) {} }, 500); } return; }
      if (!hiss) {
        var n = c.sampleRate * 2, buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0), i;
        for (i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
        s.buffer = buf; s.loop = true; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.6; g.gain.value = 0.0001;
        s.connect(f); f.connect(g); g.connect(out); s.start();
        hiss = { s: s, g: g, f: f };
      }
      hiss.g.gain.setTargetAtTime(0.05 * level, c.currentTime, 0.06);
    } catch (e) {}
  };
  /* A small aeroplane, far off: a buzz that comes and goes. Plays for dur seconds; vol 0..1 */
  X.plane = function (dur, vol) {
    try {
      var c = ER.audio && ER.audio(), out = ER.out && ER.out(); if (!c || !out || !ER.sound()) return;
      var t = c.currentTime, o = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), v = 0.03 * (vol || 1);
      o.type = 'sawtooth'; o.frequency.value = 92; o2.type = 'sawtooth'; o2.frequency.value = 93.5; f.type = 'lowpass'; f.frequency.value = 420;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f); o2.connect(f); f.connect(g); g.connect(out); o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
    } catch (e) {}
  };
  /* A door opens. The music answers in the room's own key, as it does after ER.exit; without music, three plain notes. */
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
    var st = ER.state(), end = ER.flag('tEnd') || Date.now();
    if (st.fin && st.fin.secs) return Math.max(1, Math.round(st.fin.secs / 60));
    return Math.max(1, Math.round((end - (st.t0 || end)) / 60000));
  };
  X.el = function (tag, attrs, html) {
    var n = D.createElementNS(NS, tag), k;
    for (k in attrs) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  };
  X.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  function two(n) { return (n < 10 ? '0' : '') + n; }
  X.two = two;
  /* minutes after midnight -> "14.10" */
  X.clock = function (m) { m = ((Math.round(m) % 1440) + 1440) % 1440; return two(Math.floor(m / 60)) + '.' + two(m % 60); };
  /* a little random that is the same every time (for stipple, grass and stars of the scenery) */
  X.rnd = function (seed) { var s = seed || 1; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };

  /* ---------- wheels: a number set one figure at a time ----------
     o = {label, vals: [[...], ...] one list for each wheel, start: [index, ...], sep: {wheelIndex: 'text before it'}, tail: 'text after', cls, change: fn} */
  X.wheels = function (box, o) {
    var at = (o.start || o.vals.map(function () { return 0; })).slice(), s = o.label ? '<small>' + o.label + '</small>' : '', off = false;
    o.vals.forEach(function (v, i) {
      if (o.sep && o.sep[i]) s += '<i>' + o.sep[i] + '</i>';
      s += '<span class="wl"><button type="button" data-j="' + i + '" data-d="1" title="up">&#9650;</button><b></b><button type="button" data-j="' + i + '" data-d="-1" title="down">&#9660;</button></span>';
    });
    if (o.tail) s += '<i>' + o.tail + '</i>';
    var n = ER.el('span', 'wls ' + (o.cls || ''), s), cells = ER.$$('b', n);
    function draw() { cells.forEach(function (c, i) { c.textContent = o.vals[i][at[i]]; }); }
    n.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null, j, len;
      if (!b || off) return;
      j = +b.getAttribute('data-j'); len = o.vals[j].length;
      at[j] = (at[j] + (+b.getAttribute('data-d')) + len) % len;
      X.sfx.notch(); draw(); if (o.change) o.change();
    });
    box.appendChild(n); draw();
    return {
      node: n,
      get: function () { return at.map(function (k, i) { return o.vals[i][k]; }).join(''); },
      at: function () { return at.slice(); },
      set: function (list) { at = list.slice(); draw(); },
      lock: function (on) { off = !!on; n.classList.toggle('off', off); }
    };
  };
  X.DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  X.HOURS = (function () { var a = [], i; for (i = 0; i < 24; i++) a.push(two(i)); return a; })();
  X.MINS = (function () { var a = [], i; for (i = 0; i < 60; i++) a.push(two(i)); return a; })();

  /* ---------- the sky ----------
     The place of the party, and the clock: sidereal time at 00.00 Western Standard Time on Thursday 14 April 1988 there,
     and how fast it runs (360.9856 degrees a day). Star positions are J2000 catalogue places: in twelve years they move by
     less than a sixth of a degree, which no drawing here can show. */
  var SITE = { phi: -25, lst0: 206.054 };
  X.SITE = SITE;
  X.lst = function (minutes, day) { return (SITE.lst0 + (day || 0) * 360.9856 + minutes * 0.2506845) % 360; };
  X.altaz = function (ra, dec, lst) {
    var H = (lst - ra) * RAD, d = dec * RAD, p = SITE.phi * RAD;
    var alt = Math.asin(Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H));
    var az = Math.atan2(-Math.sin(H) * Math.cos(d), Math.cos(p) * Math.sin(d) - Math.sin(p) * Math.cos(d) * Math.cos(H));
    return [alt / RAD, (az / RAD + 360) % 360];
  };
  function vec(alt, az) { alt *= RAD; az *= RAD; return [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function crs(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function unit(a) { var n = Math.sqrt(dot(a, a)); return [a[0] / n, a[1] / n, a[2] / n]; }
  X.vec = vec;
  /* A view of the sky as the eye sees it through a window (a gnomonic projection: every straight line in the sky,
     the horizon among them, is a straight line on the paper). Facing azimuth az0, looking up alt0 degrees. */
  X.view = function (az0, alt0, f, cx, cy) {
    var c = vec(alt0, az0), r = vec(0, az0 + 90), u = crs(r, c);
    var fn = function (alt, az) { var v = vec(alt, az), d = dot(v, c); if (d < 0.12) return null; return [cx + f * dot(v, r) / d, cy - f * dot(v, u) / d]; };
    fn.back = function (x, y) {           /* paper -> [alt, az] */
      var a = (x - cx) / f, b = (cy - y) / f, v = unit([c[0] + a * r[0] + b * u[0], c[1] + a * r[1] + b * u[1], c[2] + a * r[2] + b * u[2]]);
      return [Math.asin(v[2]) / RAD, (Math.atan2(v[0], v[1]) / RAD + 360) % 360];
    };
    return fn;
  };
  /* equatorial (ra, dec) -> unit vector, and the point k * (angle from p to q) beyond q on the great circle from p through q */
  function eq(ra, dec) { ra *= RAD; dec *= RAD; return [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)]; }
  X.beyond = function (p, q, k) {
    var a = eq(p[0], p[1]), b = eq(q[0], q[1]), sep = Math.acos(X.clamp(dot(a, b), -1, 1)), n = unit(crs(a, b)), t = unit(crs(n, b)), g = k * sep;
    var v = [Math.cos(g) * b[0] + Math.sin(g) * t[0], Math.cos(g) * b[1] + Math.sin(g) * t[1], Math.cos(g) * b[2] + Math.sin(g) * t[2]];
    return [(Math.atan2(v[1], v[0]) / RAD + 360) % 360, Math.asin(v[2]) / RAD];
  };
  /* the middle line of the Milky Way (galactic latitude b), as [ra, dec] points */
  X.galactic = function (b, l0, l1, step) {
    var M = [[-0.0548755604, -0.8734370902, -0.4838350155], [0.4941094279, -0.4448296300, 0.7469822445], [-0.8676661490, -0.1980763734, 0.4559837762]], out = [], l, g, e, i;
    for (l = l0; l <= l1; l += step || 3) {
      g = [Math.cos(b * RAD) * Math.cos(l * RAD), Math.cos(b * RAD) * Math.sin(l * RAD), Math.sin(b * RAD)];
      e = [0, 0, 0]; for (i = 0; i < 3; i++) e[i] = M[0][i] * g[0] + M[1][i] * g[1] + M[2][i] * g[2];
      out.push([(Math.atan2(e[1], e[0]) / RAD + 360) % 360, Math.asin(e[2]) / RAD]);
    }
    return out;
  };
  /* The southern stars, with plain labels only (a name would give the game away): [id, ra, dec, magnitude] */
  X.SOUTH = [
    ['k03', 186.650, -63.099, 0.8], ['k08', 187.791, -57.113, 1.6], ['k11', 191.930, -59.689, 1.3], ['k14', 183.786, -58.749, 2.8], ['k16', 185.340, -60.401, 3.6],
    ['k01', 219.902, -60.834, -0.3], ['k02', 210.956, -60.373, 0.6], ['k04', 190.379, -48.960, 2.2], ['k05', 204.972, -53.466, 2.3], ['k06', 218.877, -42.158, 2.3],
    ['k07', 208.885, -47.288, 2.5], ['k09', 182.090, -50.722, 2.6], ['k10', 211.671, -36.370, 2.1], ['k12', 200.149, -36.712, 2.8], ['k13', 173.945, -63.020, 3.1],
    ['k15', 189.296, -69.136, 2.7], ['k17', 191.570, -68.108, 3.0], ['k18', 188.117, -72.133, 3.9], ['k19', 195.568, -71.549, 3.6],
    ['k20', 252.166, -69.028, 1.9], ['k22', 238.786, -63.430, 2.9], ['k23', 229.727, -68.680, 2.9],
    ['k25', 95.988, -52.696, -0.7], ['k26', 138.300, -69.717, 1.7], ['k30', 125.628, -59.510, 1.9], ['k27', 139.273, -59.275, 2.2], ['k28', 160.739, -64.394, 2.7],
    ['k29', 146.776, -65.072, 3.0], ['k31', 153.434, -70.038, 3.3], ['k32', 158.006, -61.685, 3.3], ['k33', 154.271, -61.333, 3.4],
    ['k34', 122.383, -47.337, 1.8], ['k21', 131.176, -54.708, 2.0], ['k35', 136.999, -43.433, 2.2], ['k24', 140.528, -55.011, 2.5], ['k36', 161.692, -49.420, 2.7], ['k37', 142.675, -57.034, 3.1],
    ['k38', 120.896, -40.003, 2.3], ['k39', 109.286, -37.097, 2.7], ['k40', 24.429, -57.237, 0.5], ['k41', 306.412, -56.735, 1.9],
    ['k42', 220.482, -47.388, 2.3], ['k43', 224.633, -43.134, 2.7], ['k44', 261.325, -55.530, 2.9], ['k45', 262.960, -49.876, 3.0],
    ['k46', 263.402, -37.104, 1.6], ['k47', 264.330, -42.998, 1.9], ['k48', 265.622, -39.030, 2.4], ['k49', 252.541, -34.293, 2.3], ['k50', 247.352, -26.432, 1.0],
    ['k51', 6.411, -77.254, 2.8], ['k52', 29.692, -61.570, 2.9], ['k53', 317.195, -88.956, 5.4], ['k54', 101.287, -16.716, -1.5], ['k55', 201.298, -11.161, 1.0],
    ['k56', 104.656, -28.972, 1.5], ['k57', 111.024, -29.303, 2.5], ['k58', 107.098, -26.393, 1.8], ['k59', 95.675, -17.956, 2.0]
  ];
  /* the two clouds of Magellan and two dark and bright patches beside the Cross: [ra, dec, width, height in degrees] */
  X.PATCH = { lmc: [80.9, -69.75, 10, 8], smc: [13.2, -72.8, 5, 3], coal: [192.5, -62.6, 7, 5], neb: [161.3, -59.7, 2.4, 2] };
  /* The north-western sky at dusk on 14 April 1988: a planet with the stars of Orion and Taurus. [id, ra, dec, mag] */
  X.WEST = [
    ['p1', 67.95, 25.85, -4.4],
    ['w01', 68.980, 16.509, 0.9], ['w02', 56.871, 24.105, 2.9], ['w03', 57.291, 24.053, 3.6], ['w04', 56.219, 24.113, 3.7], ['w05', 56.457, 24.368, 3.9], ['w06', 56.582, 23.948, 4.2], ['w07', 56.302, 24.467, 4.3],
    ['w08', 81.573, 28.608, 1.7], ['w09', 88.793, 7.407, 0.5], ['w10', 81.283, 6.350, 1.6], ['w11', 78.634, -8.202, 0.1], ['w12', 86.939, -9.670, 2.1],
    ['w13', 85.190, -1.943, 1.8], ['w14', 84.053, -1.202, 1.7], ['w15', 83.002, -0.299, 2.2], ['w16', 79.172, 45.998, 0.1], ['w17', 113.650, 31.888, 1.6],
    ['w18', 116.329, 28.026, 1.1], ['w19', 114.825, 5.225, 0.4], ['w20', 101.287, -16.716, -1.5], ['w21', 64.948, 15.628, 3.6], ['w22', 67.154, 19.180, 3.5],
    ['w23', 65.733, 17.543, 3.8], ['w24', 67.166, 15.871, 3.4], ['w25', 99.428, 16.399, 1.9], ['w26', 89.882, 44.947, 1.9], ['w27', 95.740, 22.514, 2.9]
  ];
  X.starR = function (m) { return X.clamp(3.6 - 0.62 * m, 0.7, 5.4); };

  /* ---------- the receiver: a small short-wave set that only listens ----------
     o = {f: MHz to start at, signal: function (f) -> 0..1 (how much station there is under the needle), change: fn(f)} */
  X.receiver = function (o) {
    var f = o.f || 6, s, i, x, svg, needle, meter, knob, freqT, lockOn = false, box = ER.el('div', 'rx');
    function FX(v) { return 70 + (v - 2) * 860 / 8; }
    s = '<svg class="rxs" viewBox="0 0 1000 250"><defs><linearGradient id="rxC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b5f52"/><stop offset="1" stop-color="#3a3d34"/></linearGradient>' +
      '<linearGradient id="rxD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e3b0"/><stop offset="1" stop-color="#d8c27e"/></linearGradient></defs>' +
      '<rect width="1000" height="250" rx="18" fill="url(#rxC)"/><rect x="8" y="8" width="984" height="234" rx="14" fill="none" stroke="#7b806e" stroke-width="2"/>' +
      '<rect x="50" y="26" width="900" height="96" rx="6" fill="#1d1f1a"/><rect x="58" y="34" width="884" height="80" rx="4" fill="url(#rxD)"/>';
    for (i = 20; i <= 100; i++) { x = FX(i / 10); s += '<path d="M' + x.toFixed(1) + ' 34v' + (i % 10 ? (i % 5 ? 9 : 15) : 22) + '" stroke="#3a2e14" stroke-width="' + (i % 10 ? 1 : 1.8) + '"/>'; }
    for (i = 2; i <= 10; i++) s += '<text class="rxN" x="' + FX(i) + '" y="74" text-anchor="middle">' + i + '</text>';
    s += '<text class="rxL" x="900" y="104" text-anchor="end">MEGAHERTZ</text><text class="rxL" x="66" y="104">SHORT WAVE</text>' +
      '<g id="rx-needle"><path d="M0 30V118" stroke="#c8321e" stroke-width="3"/></g>' +
      '<g transform="translate(70 140)"><rect width="320" height="90" rx="6" fill="#2b2d26"/><g fill="#1a1b17">';
    for (i = 0; i < 9; i++) s += '<rect x="' + (14 + i * 34) + '" y="14" width="22" height="62" rx="3"/>';
    s += '</g></g><g transform="translate(430 146)"><rect width="150" height="78" rx="5" fill="#1d1f1a"/><rect x="8" y="8" width="134" height="52" rx="3" fill="#e9dcae"/>' +
      '<path d="M18 52A58 58 0 0 1 132 52" fill="none" stroke="#3a2e14" stroke-width="1.5"/><path d="M104 22l8 -6M118 34l9 -4" stroke="#c8321e" stroke-width="2.5"/>' +
      '<g id="rx-meter" transform="translate(75 58)"><path d="M0 0V-46" stroke="#1d1f1a" stroke-width="2"/></g><text class="rxL" x="75" y="73" text-anchor="middle" fill="#cfc6a0">SIGNAL</text></g>' +
      '<text id="rx-f" class="rxF" x="700" y="200" text-anchor="middle"></text><text class="rxL" x="700" y="226" text-anchor="middle" fill="#cfc6a0">TUNED TO</text>' +
      '<g id="rx-knob" transform="translate(880 186)" class="tool"><circle r="50" fill="#22241f" stroke="#7b806e" stroke-width="3"/><circle r="40" fill="#30332b"/><g id="rx-grip"></g><circle r="8" fill="#7b806e"/></g>' +
      '<rect id="rx-strip" class="tool" x="58" y="30" width="884" height="92" fill="#fff" opacity="0"/></svg>';
    box.innerHTML = s;
    svg = box.querySelector('svg'); needle = svg.querySelector('#rx-needle'); meter = svg.querySelector('#rx-meter'); knob = svg.querySelector('#rx-grip'); freqT = svg.querySelector('#rx-f');
    var g = ''; for (i = 0; i < 12; i++) g += '<path d="M0 -38V-28" stroke="#9aa08a" stroke-width="3" transform="rotate(' + i * 30 + ')"/>'; knob.innerHTML = g;
    function draw() {
      needle.setAttribute('transform', 'translate(' + FX(f).toFixed(1) + ' 0)');
      knob.setAttribute('transform', 'rotate(' + (f * 180).toFixed(1) + ')');
      var sig = o.signal ? o.signal(f) : 0;
      meter.setAttribute('transform', 'translate(75 58) rotate(' + (-62 + 124 * sig).toFixed(1) + ')');
      freqT.textContent = f.toFixed(1) + ' MHz';
      svg.setAttribute('data-f', f.toFixed(1));
    }
    function set(v, quiet) { var old = f.toFixed(1); f = Math.round(X.clamp(v, 2, 10) * 10) / 10; draw(); if (f.toFixed(1) !== old) { if (!quiet) X.sfx.notch(); if (o.change) o.change(f); } }
    ER.drag(svg.querySelector('#rx-strip'), {
      start: function () { if (lockOn) return false; },
      move: function (e) { var p = ER.pt(svg, e); set(2 + (p.x - 70) * 8 / 860); },
      end: function (e) { var p = ER.pt(svg, e); set(2 + (p.x - 70) * 8 / 860); }
    });
    var kx = 0, kf = 0;
    ER.drag(svg.querySelector('#rx-knob'), {
      start: function (e) { if (lockOn) return false; kx = ER.pt(svg, e).x; kf = f; },
      move: function (e) { set(kf + (ER.pt(svg, e).x - kx) / 40); },
      end: function () {}
    });
    draw();
    return { node: box, svg: svg, get: function () { return f; }, set: set, lock: function (on) { lockOn = !!on; box.classList.toggle('off', lockOn); }, redraw: draw };
  };
  return X;
})();
