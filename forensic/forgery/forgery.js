/* Lot Forty-One - what every room of the story shares: a few sounds, a tool that can be carried about a bench,
   the people as figures, the picture (The Linnet), its frame and its brass bird, and the letter of "1793".
   Loaded after engine.js (cast.js before it). Nothing in here knows an answer. */
window.FG = (function () {
  'use strict';
  var X = {}, D = document, NS = 'http://www.w3.org/2000/svg';
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds (through the engine, so that the sound button switches them) ---------- */
  X.sfx = {
    lamp: function () { B({ dur: 0.02, f: 3200, q: 2, peak: 0.18 }); T({ f: 120, dur: 0.12, peak: 0.05 }); },
    pour: function () { B({ type: 'bandpass', f: 900, f2: 1600, q: 1.2, dur: 0.7, peak: 0.07, a: 0.08 }); },
    plop: function () { T({ f: 520, f2: 180, dur: 0.12, peak: 0.16 }); B({ type: 'highpass', f: 2600, dur: 0.12, peak: 0.05 }); },
    beep: function () { T({ type: 'square', f: 1760, dur: 0.07, peak: 0.04 }); },
    slide: function () { B({ type: 'bandpass', f: 1500, f2: 2600, q: 0.7, dur: 0.16, peak: 0.04, a: 0.04 }); },
    focus: function () { B({ dur: 0.012, f: 5200, q: 6, peak: 0.07 }); },
    pencil: function () { B({ type: 'highpass', f: 3400, dur: 0.14, peak: 0.06, a: 0.03 }); },
    stamp: function () { T({ f: 110, f2: 52, dur: 0.17, peak: 0.5 }); B({ type: 'lowpass', f: 900, dur: 0.06, peak: 0.35 }); },
    dot: function () { T({ type: 'triangle', f: 660, dur: 0.07, peak: 0.12 }); },
    clink: function () { T({ f: 2500, dur: 0.16, peak: 0.07 }); T({ f: 3350, dur: 0.1, peak: 0.035, when: 0.01 }); },
    gavel: function () { T({ f: 180, f2: 70, dur: 0.16, peak: 0.55 }); B({ type: 'bandpass', f: 1300, q: 1.4, dur: 0.07, peak: 0.45 }); }
  };
  /* A door opens. The music answers in the room's own key, as it does after ER.exit; without music, three plain notes. */
  X.solved = function (quiet) {
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
  X.terms = function (list) {                            /* the words of the subject go into the notebook when the page that teaches them has been read */
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
  X.mix = function (a, b, k) {                          /* k of the way from colour a to colour b */
    var i, out = '#', va, vb;
    for (i = 1; i < 7; i += 2) { va = parseInt(a.substr(i, 2), 16); vb = parseInt(b.substr(i, 2), 16); out += ('0' + Math.round(va + (vb - va) * k).toString(16)).slice(-2); }
    return out;
  };
  /* carry a tool about inside a bench; h = {start() -> false to refuse, move(pos), end(pos, moved)}; returns {pos, set, home} */
  X.tool = function (svg, node, home, h, lim) {
    var pos = { x: home.x, y: home.y }, off = { x: 0, y: 0 };
    h = h || {}; lim = lim || [0, 0, 1000, 600];
    function place() { node.setAttribute('transform', 'translate(' + pos.x.toFixed(1) + ' ' + pos.y.toFixed(1) + ')'); }
    ER.drag(node, {
      start: function (e) { if (h.start && h.start() === false) return false; var p = ER.pt(svg, e); off.x = pos.x - p.x; off.y = pos.y - p.y; },
      move: function (e) { var p = ER.pt(svg, e); pos.x = X.clamp(p.x + off.x, lim[0], lim[2]); pos.y = X.clamp(p.y + off.y, lim[1], lim[3]); place(); if (h.move) h.move(pos); },
      end: function (e, moved) { if (h.end) h.end({ x: pos.x, y: pos.y }, moved); }
    });
    place();
    return { pos: pos, set: function (x, y) { pos.x = x; pos.y = y; place(); }, home: function () { pos.x = home.x; pos.y = home.y; place(); } };
  };
  X.fill = function (sel, html) { var n = ER.$(sel); if (n) n.innerHTML = html; };

  /* ---------- the people: a standing figure, feet at 0,0, about 330 tall. bust = no shadow, for FACE() ---------- */
  X.person = function (o, bust) {
    o = o || {};
    var sk = o.skin || '#e4c19c', hr = o.hair || '#3a2a20', coat = o.coat || '#555', dk = X.mix(coat, '#000000', 0.3), lt = X.mix(coat, '#ffffff', 0.14);
    var skd = X.mix(sk, '#5a2a14', 0.22), hem = o.long ? -44 : -100, s = '', w = o.w || 1, st = o.hairStyle || 'short';
    if (!bust) s += '<ellipse cx="0" cy="3" rx="' + (56 * w) + '" ry="8" fill="#000" opacity=".3"/>';
    s += '<g transform="scale(' + w + ' 1)">';
    /* legs, shoes */
    if (o.skirt) s += '<path d="M-13 0v-58h9v58zM4 0v-58h9v58z" fill="' + (o.legs || '#2a2a30') + '"/>';
    else s += '<path d="M-20 0v-124h17v124zM3 0v-124h17v124z" fill="' + (o.legs || '#2a2a30') + '"/>';
    s += '<path d="M-25 0h23v8h-27zM2 0h23v8h-23z" fill="' + (o.shoes || '#151210') + '"/>';
    if (o.skirt) s += '<path d="M-36 -52l8 -72h56l8 72z" fill="' + o.skirt + '"/>';
    /* hair that falls behind the head */
    if (st === 'bob') s += '<path d="M-34 -294q0 -42 34 -42t34 42v32h-13v-26h-42v26h-13z" fill="' + hr + '"/>';
    if (st === 'bun') s += '<circle cx="0" cy="-330" r="14" fill="' + hr + '"/>';
    /* coat */
    s += '<path d="M-46 ' + hem + 'C-53 -150 -51 -232 -30 -250L30 -250C51 -232 53 -150 46 ' + hem + 'Z" fill="' + coat + '"/>';
    s += '<path d="M-46 ' + hem + 'C-53 -150 -51 -232 -30 -250L-18 -250C-34 -200 -30 -140 -26 ' + hem + 'Z" fill="#000" opacity=".12"/>';
    if (o.check) s += '<g stroke="' + X.mix(coat, '#ffffff', 0.25) + '" stroke-width="1.2" opacity=".5"><path d="M-40 -200h80M-44 -160h88M-46 -120h92M-20 -246v' + (246 + hem) + 'M20 -246v' + (246 + hem) + '"/></g>';
    s += '<path d="M-14 -250L0 -204L14 -250Z" fill="' + (o.shirt || '#eee') + '"/>';
    if (o.check) s += '<path d="M-10 -248l10 34 10 -34" fill="none" stroke="#e8d8c0" stroke-width="2" opacity=".6"/>';
    if (o.tie) s += '<path d="M-4 -246h8l-1 6 3 36 -6 8 -6 -8 3 -36z" fill="' + o.tie + '"/><path d="M-3 -230l6 6M-3 -220l6 6" stroke="' + X.mix(o.tie, '#000000', 0.3) + '" stroke-width="1.2"/>';
    s += '<path d="M-14 -250L-25 -214L-6 -196M14 -250L25 -214L6 -196" fill="none" stroke="' + dk + '" stroke-width="2.4"/>';
    if (!o.long) s += '<circle cx="0" cy="-180" r="2.6" fill="' + dk + '"/><circle cx="0" cy="-150" r="2.6" fill="' + dk + '"/>';
    else s += '<circle cx="-4" cy="-182" r="2.6" fill="' + dk + '"/><circle cx="-4" cy="-150" r="2.6" fill="' + dk + '"/><circle cx="-4" cy="-118" r="2.6" fill="' + dk + '"/>';
    if (o.scarf) s += '<path d="M-19 -254q19 12 38 0l-3 15q-16 8 -32 0z" fill="' + o.scarf + '"/><path d="M6 -244l7 56h11l-7 -58z" fill="' + o.scarf + '"/><path d="M8 -196h14" stroke="' + X.mix(o.scarf, '#000000', 0.25) + '" stroke-width="2"/>';
    if (o.lanyard) s += '<path d="M-10 -250l7 64M10 -250l-7 64" stroke="' + o.lanyard + '" stroke-width="2.4"/><rect x="-10" y="-188" width="20" height="25" rx="2" fill="#f4f6f2"/><rect x="-6" y="-183" width="12" height="9" fill="' + o.lanyard + '"/>';
    if (o.pearls) { s += '<g fill="#f6f1e6" stroke="#cfc6b4" stroke-width=".5">'; for (var i = 0; i < 9; i++) { var a = Math.PI * (0.15 + 0.7 * i / 8); s += '<circle cx="' + (-Math.cos(a) * 15).toFixed(1) + '" cy="' + (-250 + Math.sin(a) * 9).toFixed(1) + '" r="2.4"/>'; } s += '</g>'; }
    if (o.chain) s += '<path d="M-12 -250q-4 40 12 56q16 -16 12 -56" fill="none" stroke="#c9a54a" stroke-width="1"/><g fill="none" stroke="#2a2420" stroke-width="1.6"><circle cx="-6" cy="-190" r="5"/><circle cx="6" cy="-190" r="5"/></g>';
    if (o.bag) s += '<path d="M-30 -248L34 -120" stroke="' + o.bag + '" stroke-width="5"/><path d="M26 -130h34v30h-34z" fill="' + o.bag + '"/><path d="M26 -122h34" stroke="' + X.mix(o.bag, '#000000', 0.3) + '" stroke-width="2"/>';
    /* arms and hands */
    var hand = o.gloves ? '#f4f2ec' : sk, P = o.pose || 'down', arm = function (d) { return '<path d="' + d + '" stroke="' + coat + '" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; };
    var hd = function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="8" fill="' + hand + '"/>'; };
    if (P === 'fold') s += arm('M-40 -236q-12 52 2 70l34 -4') + arm('M40 -236q12 52 -2 70l-34 -4') + hd(-4, -170) + hd(4, -166);
    else if (P === 'cap') s += arm('M-40 -236q-14 64 6 98l18 -2') + arm('M40 -236q14 64 -6 98l-18 -2') + '<path d="M-24 -146q24 -18 48 0l4 14q-28 10 -56 0z" fill="#5a5a4a"/><path d="M-26 -134q26 8 52 0" stroke="#3a3a2e" stroke-width="2" fill="none"/>' + hd(-16, -138) + hd(16, -138);
    else if (P === 'torch') s += arm('M-40 -236q-12 60 -6 116') + arm('M40 -236q16 44 2 76l-22 -8') + hd(-46, -118) + '<rect x="12" y="-188" width="9" height="26" rx="3" fill="#6b3fa0" transform="rotate(-18 16 -175)"/><circle cx="12" cy="-189" r="4" fill="#c9a8ff" opacity=".8"/>' + hd(19, -168);
    else if (P === 'umbrella') s += '<path d="M-48 -126L-54 2" stroke="#1a1a1a" stroke-width="3"/><path d="M-50 -110l-9 96h10l6 -96z" fill="#1c1f2a"/><path d="M-48 -126q0 -16 12 -14" stroke="#5a3a1c" stroke-width="5" fill="none" stroke-linecap="round"/>' + arm('M-40 -236q-12 60 -6 112') + arm('M40 -236q12 60 6 116') + hd(-46, -122) + hd(46, -118);
    else if (P === 'hold') s += arm('M-40 -236q-12 60 -6 116') + arm('M40 -236q16 44 2 76l-22 -8') + hd(-46, -118) + '<rect x="2" y="-196" width="34" height="44" rx="2" fill="' + (o.folder || '#2f5a3a') + '" transform="rotate(-8 18 -174)"/>' + hd(19, -168);
    else s += arm('M-40 -236q-12 60 -6 116') + arm('M40 -236q12 60 6 116') + hd(-46, -118) + hd(46, -118);
    /* neck, head, face */
    s += '<rect x="-8" y="-272" width="16" height="24" fill="' + skd + '"/>';
    s += '<ellipse cx="-26" cy="-290" rx="5" ry="8" fill="' + skd + '"/><ellipse cx="26" cy="-290" rx="5" ry="8" fill="' + skd + '"/>';
    if (o.earrings) s += '<circle cx="-26" cy="-280" r="2.6" fill="' + o.earrings + '"/><circle cx="26" cy="-280" r="2.6" fill="' + o.earrings + '"/>';
    s += '<ellipse cx="0" cy="-292" rx="25" ry="29" fill="' + sk + '"/>';
    if (o.beard) s += '<path d="M-24 -290q0 30 24 32q24 -2 24 -32q-6 16 -24 16t-24 -16z" fill="' + hr + '"/>';
    s += '<ellipse cx="-10" cy="-293" rx="4.6" ry="3.2" fill="#f7f1e6"/><ellipse cx="10" cy="-293" rx="4.6" ry="3.2" fill="#f7f1e6"/>' +
      '<circle cx="-9.4" cy="-293" r="2.3" fill="#231a14"/><circle cx="10.6" cy="-293" r="2.3" fill="#231a14"/>';
    s += '<path d="M-16 -301q6 -4 12 -1M4 -302q6 -3 12 1" stroke="' + (o.brows || X.mix(hr, '#000000', 0.2)) + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    s += '<path d="M0 -290q-4 10 0 12q3 1 5 -1" stroke="' + skd + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
    s += o.mouth === 'smile' ? '<path d="M-8 -276q8 6 16 0" stroke="' + (o.lips || '#8c4a3c') + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' :
      '<path d="M-7 -275h14" stroke="' + (o.lips || '#8c4a3c') + '" stroke-width="2.4" stroke-linecap="round"/>';
    /* hair in front */
    if (st === 'short') s += '<path d="M-26 -296q-2 -36 26 -36t26 36q-8 -20 -26 -20t-26 20z" fill="' + hr + '"/>';
    else if (st === 'swept') s += '<path d="M-27 -294q-6 -44 29 -46q30 0 27 42q-8 -26 -29 -26q-17 0 -27 30z" fill="' + hr + '"/><path d="M-20 -318q20 -14 44 -4" stroke="' + X.mix(hr, '#ffffff', 0.5) + '" stroke-width="3" fill="none"/>';
    else if (st === 'bob') s += '<path d="M-26 -298q3 -30 26 -31q23 1 26 31q-10 -14 -26 -14q-16 0 -26 14z" fill="' + hr + '"/>';
    else if (st === 'bun') s += '<path d="M-26 -294q-1 -36 26 -37q27 1 26 37q-6 -18 -26 -20q-20 2 -26 20z" fill="' + hr + '"/>';
    else if (st === 'curly') { for (var k = 0; k < 9; k++) { var t = Math.PI * (1.05 + 0.9 * k / 8); s += '<circle cx="' + (Math.cos(t) * 24).toFixed(1) + '" cy="' + (-298 + Math.sin(t) * 24).toFixed(1) + '" r="10" fill="' + hr + '"/>'; } }
    else if (st === 'bald') s += '<path d="M-26 -290q-5 -16 4 -24v22zM26 -290q5 -16 -4 -24v22z" fill="' + hr + '"/>';
    if (o.pencil) s += '<path d="M20 -316l14 -12" stroke="#e8b93a" stroke-width="4" stroke-linecap="round"/><path d="M34 -328l3 -3" stroke="#3a2a1a" stroke-width="3"/>';
    if (o.glasses === 'round') s += '<g fill="#fff" fill-opacity=".14" stroke="#1a1614" stroke-width="2"><circle cx="-10" cy="-293" r="8"/><circle cx="10" cy="-293" r="8"/></g><path d="M-2 -293h4M-18 -294l-8 -3M18 -294l8 -3" stroke="#1a1614" stroke-width="2"/>';
    if (o.glasses === 'square') s += '<g fill="#fff" fill-opacity=".14" stroke="#1a1614" stroke-width="2.2"><rect x="-19" y="-299" width="16" height="11" rx="2"/><rect x="3" y="-299" width="16" height="11" rx="2"/></g><path d="M-3 -294h6M-19 -294l-7 -2M19 -294l7 -2" stroke="#1a1614" stroke-width="2"/>' +
      '<path d="M-26 -292q-6 30 4 52M26 -292q6 30 -4 52" stroke="#9a8a6a" stroke-width="1" fill="none"/>';
    return s + '</g>';
  };
  X.fig = function (who) { return X.person((window.CAST || {})[who] || {}); };

  /* ---------- The Linnet: the picture itself, 190 x 240, top left at 0,0 ----------
     o = {feather: false (the floor before 1958), sig: false (no name in the corner)} */
  var pid = 0;
  X.painting = function (o) {
    o = o || {};
    var s = '', id = 'fgp' + (++pid);
    s += '<clipPath id="' + id + '"><rect width="190" height="240"/></clipPath><g clip-path="url(#' + id + ')">';
    s += '<rect width="190" height="240" fill="#2a2416"/>';
    [[130, 112], [104, 92], [80, 70], [56, 50], [34, 30]].forEach(function (r) { s += '<ellipse cx="60" cy="76" rx="' + r[0] + '" ry="' + r[1] + '" fill="#7a6a44" opacity=".13"/>'; });
    s += '<path d="M0 176h190v64H0z" fill="#5a4026"/><path d="M0 176h190" stroke="#24180c" stroke-width="2.4"/><path d="M0 197h190M0 219h190" stroke="#3a2814" stroke-width="1.3"/><path d="M62 197v22M150 176v21M30 219v21M118 219v21" stroke="#3a2814" stroke-width="1"/>';
    /* the perch on its post */
    s += '<path d="M40 176V98" stroke="#4a3018" stroke-width="5"/><path d="M28 176h24" stroke="#3a2614" stroke-width="5"/><path d="M18 98h96" stroke="#6b4a26" stroke-width="5" stroke-linecap="round"/><path d="M18 96h96" stroke="#8a6436" stroke-width="1.5" stroke-linecap="round"/>';
    /* the linnet: brown back, red cap and breast */
    s += '<path d="M54 92q-14 6 -26 18l6 2q12 -10 24 -14z" fill="#4a3220"/>';
    s += '<ellipse cx="70" cy="84" rx="17" ry="11" fill="#8a6440" transform="rotate(-18 70 84)"/><path d="M58 86q10 -10 26 -8q-8 10 -26 8z" fill="#5a3e24"/>';
    s += '<path d="M74 92q10 -2 14 -12q-2 12 -12 16z" fill="#c43a30" opacity=".85"/><circle cx="86" cy="73" r="8" fill="#9a7450"/><path d="M82 66q5 -4 9 1l-2 3q-4 -2 -7 -1z" fill="#c8332a"/>';
    s += '<circle cx="88" cy="72" r="1.6" fill="#120c08"/><path d="M93 73l6 1 -6 2z" fill="#6b6050"/><path d="M68 94l-1 4M74 94l1 4" stroke="#3a2614" stroke-width="1.6"/>';
    /* the blue-and-white jug */
    s += '<path d="M112 176q-12 -30 4 -52q5 -8 2 -16h30q-3 8 2 16q16 22 4 52z" fill="#eef0ea"/><path d="M118 108h30q-2 -6 2 -8h-34q4 2 2 8z" fill="#dfe3dc"/>';
    s += '<path d="M152 120q18 0 16 18q-2 14 -14 18" fill="none" stroke="#e2e6df" stroke-width="5"/>';
    s += '<g fill="none" stroke="#2d4f9a" stroke-width="1.8"><path d="M116 128q17 6 34 0M114 166q19 6 38 0"/><path d="M124 146q4 -8 8 0t8 0M130 156q3 -5 6 0"/><circle cx="133" cy="138" r="4"/><path d="M121 114h24"/></g>';
    s += '<path d="M112 176q-12 -30 4 -52q5 -8 2 -16h8q-2 8 -6 16q-12 24 0 52z" fill="#b9bfb4" opacity=".55"/>';
    /* half a lemon */
    s += '<ellipse cx="66" cy="184" rx="20" ry="9" fill="#d9a92a"/><ellipse cx="62" cy="181" rx="15" ry="7" fill="#f2e08a"/><g stroke="#e3c24a" stroke-width="1"><path d="M62 181l-12 -2M62 181l-8 5M62 181l2 6M62 181l11 2M62 181l9 -4M62 181l-1 -7"/></g><path d="M82 186q8 2 10 -4" stroke="#c8961e" stroke-width="3" fill="none"/>';
    if (o.feather !== false) s += '<path d="M132 220q14 -10 30 -8q-12 6 -30 8z" fill="#f4f3ee"/><path d="M130 221q16 -6 34 -10" stroke="#d9d6cc" stroke-width="1" fill="none"/><path d="M128 222l-4 2" stroke="#e8e6de" stroke-width="1.2"/>';
    if (o.sig !== false) s += '<text x="10" y="233" font-family="Libre Baskerville,serif" font-style="italic" font-size="7.5" fill="#15110c" letter-spacing=".4">L. STERCK</text>';
    s += '<rect width="190" height="240" fill="#c9a43a" opacity=".07"/></g>';
    return s;
  };
  /* the gilt frame round a picture of w x h (top left at 0,0), with the brass bird on top */
  X.frame = function (w, h, bird) {
    var f = 22, s = '';
    s += '<rect x="' + (-f) + '" y="' + (-f) + '" width="' + (w + 2 * f) + '" height="' + (h + 2 * f) + '" fill="#a77d2c"/>';
    s += '<rect x="' + (-f + 3) + '" y="' + (-f + 3) + '" width="' + (w + 2 * f - 6) + '" height="' + (h + 2 * f - 6) + '" fill="none" stroke="#e6c873" stroke-width="3"/>';
    s += '<rect x="' + (-f + 9) + '" y="' + (-f + 9) + '" width="' + (w + 2 * f - 18) + '" height="' + (h + 2 * f - 18) + '" fill="none" stroke="#7a5a1c" stroke-width="4" stroke-dasharray="3 3"/>';
    s += '<rect x="-5" y="-5" width="' + (w + 10) + '" height="' + (h + 10) + '" fill="none" stroke="#d9b45a" stroke-width="4"/><rect x="-1.5" y="-1.5" width="' + (w + 3) + '" height="' + (h + 3) + '" fill="none" stroke="#3a2a10" stroke-width="3"/>';
    [[-f, -f], [w + f, -f], [-f, h + f], [w + f, h + f]].forEach(function (c) { s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="9" fill="#d9b45a" stroke="#7a5a1c" stroke-width="2"/><circle cx="' + c[0] + '" cy="' + c[1] + '" r="3" fill="#7a5a1c"/>'; });
    if (bird !== false) s += '<g transform="translate(' + (w / 2) + ' ' + (-f - 2) + ')">' + X.bird() + '</g>';
    return s;
  };
  /* the "gold" bird: gilded brass, on a little scroll; about 46 wide, 0,0 is the middle of its foot */
  X.bird = function (dull) {
    var g = dull ? '#a88a46' : '#d9b04a', hi = dull ? '#c9ad6a' : '#f4dc8a', lo = dull ? '#6b5426' : '#8a6420';
    return '<path d="M-22 0q22 -12 44 0" fill="none" stroke="' + lo + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M-14 -6q-4 -14 8 -20q10 -6 18 2l8 -2 -5 6q2 10 -8 14q-12 4 -21 0z" fill="' + g + '" stroke="' + lo + '" stroke-width="1.4"/>' +
      '<path d="M-14 -8l-12 -4 8 8z" fill="' + g + '" stroke="' + lo + '" stroke-width="1.2"/><path d="M-6 -12q6 -4 12 2" stroke="' + lo + '" stroke-width="1.4" fill="none"/>' +
      '<circle cx="9" cy="-21" r="1.6" fill="' + lo + '"/><path d="M-8 -16q4 -8 12 -6" stroke="' + hi + '" stroke-width="1.6" fill="none"/>';
  };

  /* ---------- the letter of "1793": the same words wherever it is read ----------
     the lines that make a claim are spans, so that the director's office can set each one against the evidence */
  X.LETTER = '<p class="ld">Coldharbour, the 3rd of May 1793</p><p>My dear Harriet,</p>' +
    '<p>You ask what is to become of the pictures now that our father is gone. The rest may go to the sale-room with my blessing, but I shall keep the little Linnet. <span class="ln" data-l="l1">It has been in our family since the year 1646, when Lieven Sterck painted it for our ancestor Matthew Tredwell, then a merchant in Haarlem.</span></p>' +
    '<p>You will remember it over the fire in the green parlour: <span class="ln" data-l="l2">the linnet on his perch with his red cap, the blue jug, the half lemon,</span> <span class="ln" data-l="l3">the little white feather lying on the boards,</span> <span class="ln" data-l="l4">and the painter&rsquo;s name, very small, in the corner.</span></p>' +
    '<p><span class="ln" data-l="l5">Our mother had the gold frame made for it, with a little gold bird to sit on top,</span> so that, as she used to say, the linnet should have a friend.</p>' +
    '<p>I shall hang it in my study, and look at it when the accounts will not add up.</p><p class="sg">Your loving brother,<br>Nathaniel Tredwell</p>';
  return X;
})();
