/* In Her Own Words - what every room shares: a few sounds, small helpers, the people (standing in the scene, and as
   busts for the interviews), and drawn sound: waveforms and hiss bands made from a seeded random number, so that the
   same file always looks the same. Loaded after engine.js. Nothing in here knows an answer. */
window.VX = (function () {
  'use strict';
  var X = {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds. No beeps, no hum, no bells: in this story those are evidence. ---------- */
  X.sfx = {
    fader: function () { B({ type: 'bandpass', f: 900, f2: 1600, q: 2, dur: 0.18, peak: 0.06, a: 0.03 }); },
    jack: function () { T({ f: 180, f2: 90, dur: 0.08, peak: 0.25 }); B({ dur: 0.03, f: 2600, q: 3, peak: 0.12 }); },
    pin: function () { B({ dur: 0.025, f: 4200, q: 4, peak: 0.12 }); },
    marker: function () { B({ type: 'highpass', f: 3000, dur: 0.06, peak: 0.06 }); },
    print: function () { for (var i = 0; i < 6; i++) B({ dur: 0.05, f: 1400 + i * 60, q: 2, peak: 0.05, when: i * 0.09 }); },
    wind: function () { B({ type: 'lowpass', f: 500, f2: 260, dur: 1.4, peak: 0.12, a: 0.4 }); }
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
  X.mine = function (id, title, html, quiet) { return ER.addClue(id, title, '<h4>' + title + '</h4>' + html, 'vg-mine', 'Your notes', quiet); };
  X.terms = function (list) {
    var G = window.GLOSS || [];
    list.forEach(function (w) { for (var i = 0; i < G.length; i++) if (G[i][0] === w) { ER.addWord(G[i][0], G[i][1]); break; } });
  };
  X.minutesPlayed = function () {
    var st = ER.state();
    if (st.fin && st.fin.secs) return Math.max(1, Math.round(st.fin.secs / 60));
    return Math.max(1, Math.round((Date.now() - (st.t0 || Date.now())) / 60000));
  };

  /* ---------- seeded noise, for drawings of sound ---------- */
  X.rng = function (seed) {
    var s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000; };
  };
  /* A voice: blobs of sound where the words are. words = [[t0, t1, loud], ...] in seconds; px = pixels per second.
     Returns a closed path that is symmetric round y. */
  X.voicePath = function (x0, y, px, total, words, h, seed, step) {
    var r = X.rng(seed), top = [], bot = [], t, a, i, k, w;
    step = step || 0.06;
    for (t = 0; t <= total; t += step) {
      a = 0.6;
      for (i = 0; i < words.length; i++) {
        w = words[i];
        if (t >= w[0] && t <= w[1]) { k = Math.sin(Math.PI * (t - w[0]) / (w[1] - w[0])); a = Math.max(a, (w[2] || 1) * h * (0.35 + 0.65 * k) * (0.45 + 0.55 * r())); }
      }
      top.push((x0 + t * px).toFixed(1) + ' ' + (y - a).toFixed(1));
      bot.unshift((x0 + t * px).toFixed(1) + ' ' + (y + a).toFixed(1));
    }
    return 'M' + top.join('L') + 'L' + bot.join('L') + 'Z';
  };
  /* A band of hiss: level(t) gives the height at time t; rough(t) how much it flickers. */
  X.hissPath = function (x0, y, px, total, level, rough, seed) {
    var r = X.rng(seed), top = [], bot = [], t, a, j;
    for (t = 0; t <= total + 0.0001; t += 0.1) {
      j = rough(t) * (r() - 0.5);
      a = Math.max(0.5, level(t) + j);
      top.push((x0 + t * px).toFixed(1) + ' ' + (y - a).toFixed(1));
      bot.unshift((x0 + t * px).toFixed(1) + ' ' + (y + a).toFixed(1));
    }
    return 'M' + top.join('L') + 'L' + bot.join('L') + 'Z';
  };
  /* A line that wanders (a hum's pitch): wander(t) in pixels. */
  X.linePath = function (x0, y, px, total, wander) {
    var p = [], t;
    for (t = 0; t <= total + 0.0001; t += 0.1) p.push((x0 + t * px).toFixed(1) + ' ' + (y + wander(t)).toFixed(1));
    return 'M' + p.join('L');
  };

  /* ---------- people, standing: feet at 0 0, about 300 high ----------
     o = {skin, hair, style, top, sleeve, bottom, legs, shirt, coat, glasses, beard, smile, extra, phones, hivis} */
  var HAIR = {
    short: 'M-24 -276q2 -30 24 -30t24 30q-10 -14 -24 -14t-24 14z',
    tail: 'M-25 -274q1 -33 25 -33t25 33q-10 -15 -25 -15t-25 15zM18 -290q22 6 18 46q-6 -4 -12 -2q4 -24 -10 -34z',
    bun: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM-10 -310a10 10 0 1 1 20 0a10 10 0 1 1 -20 0z',
    crop: 'M-23 -280q3 -24 23 -24t23 24q-10 -8 -23 -8t-23 8z',
    bald: 'M-25 -270q-1 -8 2 -14q4 6 4 14zM25 -270q1 -8 -2 -14q-4 6 -4 14z'
  };
  X.person = function (o) {
    var skin = o.skin || '#e8c4a2', hair = o.hair || '#3a2a1c', top = o.top || '#2e6b8f', bot = o.bottom || '#2c2c33', s = '';
    s += '<ellipse cx="0" cy="2" rx="46" ry="8" fill="#000" opacity="' + (o.shadow == null ? 0.22 : o.shadow) + '"/>';
    if (o.legs === 'skirt') s += '<path d="M-17 0v-74h13v74zM4 0v-74h13v74z" fill="' + (o.tights || skin) + '"/><path d="M-33 -66h66l-6 -66h-54z" fill="' + bot + '"/>';
    else s += '<path d="M-20 0v-100h17v100zM3 0v-100h17v100z" fill="' + bot + '"/>';
    s += '<path d="M-24 0h22v7h-26zM2 0h22v7h-22z" fill="' + (o.shoes || '#1d1f24') + '"/>';
    if (o.coat) s += '<path d="M-42 -40q-6 -150 42 -200t42 200z" fill="' + o.coat + '"/>';
    s += '<path d="M-38 -94q-7 -138 38 -146t38 146z" fill="' + top + '"/>';
    if (o.coat) s += '<path d="M-38 -60q-4 -130 22 -176l14 30v146zM38 -60q4 -130 -22 -176l-14 30v146z" fill="' + o.coat + '"/>';
    if (o.hivis) s += '<path d="M-36 -120h72M-34 -150h68" stroke="#e8f0f0" stroke-width="7"/>';
    if (o.shirt) s += '<path d="M-10 -238l10 26 10 -26z" fill="' + o.shirt + '"/>';
    s += '<path d="M-34 -204q-15 40 -5 88M34 -204q15 40 5 88" stroke="' + (o.sleeve || o.coat || top) + '" stroke-width="15" fill="none" stroke-linecap="round"/>' +
      '<circle cx="-39" cy="-112" r="8" fill="' + skin + '"/><circle cx="39" cy="-112" r="8" fill="' + skin + '"/>';
    s += '<rect x="-7" y="-256" width="14" height="20" fill="' + skin + '"/><circle cx="0" cy="-274" r="24" fill="' + skin + '"/>';
    if (o.face === false) s += '<circle cx="0" cy="-277" r="24.5" fill="' + hair + '"/>';
    else {
      if (o.style && HAIR[o.style]) s += '<path d="' + HAIR[o.style] + '" fill="' + hair + '"/>';
      if (o.beard) s += '<path d="M-22 -270q2 30 22 32q20 -2 22 -32q-6 14 -22 14t-22 -14z" fill="' + o.beard + '"/>';
      s += '<path d="M-11 -273h7M4 -273h7" stroke="#2a2420" stroke-width="2.6" stroke-linecap="round"/><path d="M-6 -260q6 ' + (o.smile == null ? 3 : o.smile) + ' 12 0" stroke="#8c4a3c" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      if (o.glasses) s += '<circle cx="-8" cy="-273" r="7" fill="none" stroke="' + o.glasses + '" stroke-width="2"/><circle cx="8" cy="-273" r="7" fill="none" stroke="' + o.glasses + '" stroke-width="2"/>';
    }
    if (o.phones) s += '<path d="M-20 -238q20 14 40 0" fill="none" stroke="#1a1a1e" stroke-width="5"/><circle cx="-22" cy="-236" r="7" fill="#1a1a1e"/><circle cx="22" cy="-236" r="7" fill="#1a1a1e"/>';
    if (o.extra) s += o.extra;
    return s;
  };
  X.PEOPLE = {
    lena: { skin: '#f0d6c2', hair: '#1c1714', style: 'tail', top: '#2f6a5e', sleeve: '#2f6a5e', bottom: '#2a2a33', phones: 1 },
    ivo: { skin: '#e9c5a6', hair: '#b8b2a8', style: 'short', beard: '#c9c3b8', top: '#3a3f47', coat: '#e2c21e', hivis: 1, bottom: '#2f3a4a', smile: 1 },
    chandra: { skin: '#b9825c', hair: '#2a2220', style: 'bun', top: '#ece4d6', coat: '#7a2e3a', bottom: '#2c2a33', legs: 'skirt', tights: '#2c2a33', glasses: '#c9a24a', smile: 0 },
    halvard: { skin: '#f0d4c0', hair: '#e6e2da', style: 'bald', top: '#d9d2c2', coat: '#6b5a3a', bottom: '#4a4038', glasses: '#2a2a2a' }
  };
  X.who = function (name, more) {
    var o = {}, k, base = X.PEOPLE[name];
    for (k in base) o[k] = base[k];
    for (k in (more || {})) o[k] = more[k];
    return X.person(o);
  };

  /* ---------- the same people as busts, for the interviews (240 x 300) ---------- */
  var BUST = {
    lena: { bg: '#24403a', skin: '#f0d6c2', hair: '#1c1714', style: 'tail', top: '#2f6a5e', phones: 1 },
    ivo: { bg: '#2a2f38', skin: '#e9c5a6', hair: '#b8b2a8', style: 'short', top: '#e2c21e', shirt: '#3a3f47', beard: '#c9c3b8', hat: '#8a2a2a' },
    chandra: { bg: '#4a2a30', skin: '#b9825c', hair: '#2a2220', style: 'bun', top: '#7a2e3a', shirt: '#ece4d6', glasses: '#c9a24a', grey: 1 },
    halvard: { bg: '#3a3428', skin: '#f0d4c0', hair: '#e6e2da', style: 'bald', top: '#6b5a3a', shirt: '#d9d2c2', glasses: '#2a2a2a', phone: 1 }
  };
  var BHAIR = {
    tail: 'M62 118q0 -72 58 -74t58 74q-14 -34 -58 -36t-58 36zM164 70q40 20 30 110q-10 -8 -22 -6q8 -60 -14 -90z',
    short: 'M64 116q0 -66 56 -68t56 68q-14 -30 -56 -32t-56 32z',
    bun: 'M64 118q0 -68 56 -70t56 70q-14 -32 -56 -34t-56 34zM100 40a20 20 0 1 1 40 0a20 20 0 1 1 -40 0z',
    bald: 'M64 132q-4 -24 6 -40q8 18 8 40zM176 132q4 -24 -6 -40q-8 18 -8 40z'
  };
  X.face = function (name, mood) {
    var o = BUST[name], s = '', sm = mood === 'smile' ? 10 : mood === 'cross' ? -6 : 3;
    s += '<svg viewBox="0 0 240 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><rect x="-200" y="-200" width="640" height="500" fill="' + o.bg + '"/><circle cx="196" cy="54" r="80" fill="#fff" opacity=".07"/>';
    s += '<path d="M14 300q8 -96 106 -104q98 8 106 104z" fill="' + o.top + '"/>';
    if (o.shirt) s += '<path d="M96 200l24 40 24 -40z" fill="' + o.shirt + '"/>';
    s += '<rect x="104" y="164" width="32" height="36" fill="' + o.skin + '"/>';
    s += '<ellipse cx="120" cy="120" rx="54" ry="62" fill="' + o.skin + '"/><ellipse cx="66" cy="126" rx="8" ry="13" fill="' + o.skin + '"/><ellipse cx="174" cy="126" rx="8" ry="13" fill="' + o.skin + '"/>';
    s += '<path d="' + BHAIR[o.style] + '" fill="' + o.hair + '"/>';
    if (o.grey) s += '<path d="M92 62q20 -10 44 -4" stroke="#bdb6ae" stroke-width="5" fill="none" opacity=".8"/>';
    if (o.beard) s += '<path d="M68 130q4 64 52 68q48 -4 52 -68q-12 30 -52 30t-52 -30z" fill="' + o.beard + '"/>';
    if (o.hat) s += '<path d="M62 96q0 -58 58 -58t58 58z" fill="' + o.hat + '"/><rect x="58" y="88" width="124" height="16" rx="6" fill="' + o.hat + '" opacity=".85"/><circle cx="120" cy="34" r="10" fill="' + o.hat + '"/>';
    s += '<path d="M90 104q10 -6 20 0M130 104q10 -6 20 0" stroke="#3a2a20" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="122" rx="5" ry="6.5" fill="#2a2420"/><ellipse cx="140" cy="122" rx="5" ry="6.5" fill="#2a2420"/><circle cx="102" cy="120" r="1.6" fill="#fff"/><circle cx="142" cy="120" r="1.6" fill="#fff"/>' +
      '<path d="M120 128q-5 14 2 18" stroke="#9a6a4a" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M104 156q16 ' + sm + ' 32 0" stroke="#8c3a32" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    if (o.glasses) s += '<g fill="none" stroke="' + o.glasses + '" stroke-width="3"><rect x="84" y="108" width="32" height="26" rx="8"/><rect x="124" y="108" width="32" height="26" rx="8"/><path d="M116 120h8M84 118l-18 -4M156 118l18 -4"/></g>';
    if (o.phones) s += '<path d="M70 200q50 28 100 0" fill="none" stroke="#1a1a1e" stroke-width="9"/><rect x="58" y="188" width="26" height="22" rx="9" fill="#1a1a1e"/><rect x="156" y="188" width="26" height="22" rx="9" fill="#1a1a1e"/>';
    if (o.phone) s += '<rect x="168" y="96" width="24" height="54" rx="5" fill="#222" transform="rotate(14 180 123)"/><path d="M172 160q14 4 22 -8" stroke="' + o.skin + '" stroke-width="16" stroke-linecap="round"/>';
    return s + '</svg>';
  };
  return X;
})();
