/* The Boy in Sunday Clothes - the people of A Christmas Carol, drawn in ink and wash in the spirit of John Leech's plates
   (never of any film). Nothing in here knows an answer.
   FACE(who)  a bust for an interview (200 x 260)
   CC.fig(o)  a standing figure with its feet at 0,0, 300 units high before scaling (o.h)  */
(function () {
  'use strict';
  var INK = '#2b2118';
  function K(w) { return ' stroke="' + INK + '" stroke-width="' + (w || 2.4) + '" stroke-linejoin="round" stroke-linecap="round"'; }

  /* ---------- a standing figure, 300 high: feet at 0, head centre at -262 ---------- */
  function fig(o) {
    o = o || {};
    var s = '', w = o.w || 1, skin = o.skin || '#f0d2b4', coat = o.coat || '#3d3a44', legs = o.legs || '#4a4250', hair = o.hair || '#6b5a48';
    var sh = 34 * w;                                   /* half the width of the shoulders */
    s += '<ellipse cx="0" cy="2" rx="' + (44 * w) + '" ry="7" fill="#000" opacity=".22"/>';
    /* legs, or a long garment */
    if (o.kind === 'dress' || o.kind === 'gown' || o.kind === 'robe' || o.kind === 'shroud') {
      var hem = o.kind === 'shroud' ? 0 : -6, wide = (o.kind === 'robe' ? 70 : o.kind === 'shroud' ? 58 : 54) * w;
      if (o.kind !== 'shroud') s += '<path d="M-16 0h12v-8h-12zM4 0h13v-8h-13z" fill="' + (o.shoes || '#2a2420') + '"/>';
      if (o.feet) s += '<path d="M-18 0q2 -10 12 -9q6 2 4 9zM6 0q-2 -10 9 -9q8 1 7 9z" fill="' + skin + '"' + K(1.6) + '/>';
      s += '<path d="M' + (-sh) + ' -226Q' + (-sh - 14) + ' -120 ' + (-wide) + ' ' + hem + 'H' + wide + 'Q' + (sh + 14) + ' -120 ' + sh + ' -226z" fill="' + coat + '"' + K() + '/>';
      if (o.kind === 'robe') s += '<path d="M' + (-wide) + ' ' + (hem - 4) + 'H' + wide + '" stroke="#f4efe4" stroke-width="12"/><path d="M-12 -226l-4 220M12 -226l4 220" stroke="#f4efe4" stroke-width="10"/>';
      if (o.kind === 'gown') s += '<path d="M' + (-sh + 6) + ' -150q' + sh + ' 10 ' + (2 * sh - 12) + ' 0" fill="none" stroke="' + (o.sash || '#8a3b2c') + '" stroke-width="6"/><path d="M0 -224v218" stroke="' + INK + '" stroke-width="1.6" opacity=".5"/>';
      if (o.kind === 'dress') s += '<path d="M' + (-sh + 4) + ' -150h' + (2 * sh - 8) + '" stroke="' + (o.sash || '#f0e6d2') + '" stroke-width="5"/>' + (o.apron ? '<path d="M-24 -148h48l8 120h-64z" fill="' + o.apron + '"' + K(1.6) + '/>' : '');
    } else {
      s += '<path d="M-15 0l1 -130h12l1 130zM3 0l1 -130h12l1 130z" fill="' + legs + '"' + K(2) + '/>';
      s += '<path d="M-22 0h20v-8h-17zM2 0h22l-3 -8h-19z" fill="' + (o.shoes || '#221c18') + '"/>';
      if (o.kind === 'tunic') s += '<path d="M' + (-sh + 4) + ' -226L-36 -120H36L' + (sh - 4) + ' -226z" fill="' + coat + '"' + K() + '/><path d="M-34 -150h68" stroke="#ffe9a0" stroke-width="7"/>';
      else {
        s += '<path d="M' + (-sh) + ' -226Q' + (-sh - 8) + ' -170 ' + (-sh + 2) + ' -118L' + (-sh + 4) + ' ' + (o.tails ? -70 : -96) + 'H' + (sh - 4) + 'L' + (sh - 2) + ' -118Q' + (sh + 8) + ' -170 ' + sh + ' -226z" fill="' + coat + '"' + K() + '/>';
        if (o.vest) s += '<path d="M-14 -224l-4 92h36l-4 -92z" fill="' + o.vest + '"' + K(1.6) + '/>';
        s += '<path d="M-14 -224l14 30 14 -30" fill="none"' + K(1.8) + '/>';
      }
    }
    /* neck things */
    if (o.neck === 'comforter') s += '<path d="M-20 -232q20 12 40 0l2 10q-22 12 -44 0z" fill="' + (o.neckc || '#f2efe6') + '"' + K(1.6) + '/><path d="M8 -224l6 ' + (o.longEnds ? 150 : 70) + 'h10l-6 -' + (o.longEnds ? 150 : 70) + 'z" fill="' + (o.neckc || '#f2efe6') + '"' + K(1.6) + '/>';
    else if (o.neck === 'collar') s += '<path d="M-22 -234l10 -26 12 20 12 -20 10 26z" fill="#fbf8ef"' + K(1.6) + '/>';
    else if (o.neck === 'cravat') s += '<path d="M-10 -232h20l-4 16h-12z" fill="' + (o.neckc || '#f4f0e6') + '"' + K(1.4) + '/>';
    else if (o.neck === 'fur') s += '<path d="M-30 -232q30 22 60 0l-6 14q-24 14 -48 0z" fill="#f4efe4"' + K(1.4) + '/>';
    /* arms */
    var ac = o.arm || coat, L = o.armL || 'down', R = o.armR || 'down', hands = '';
    function arm(side, pose) {
      var x = side * sh, d, hx, hy;
      if (pose === 'up') { d = 'M' + x + ' -222q' + (side * 22) + ' -30 ' + (side * 18) + ' -76'; hx = x + side * 18; hy = -298; }
      else if (pose === 'out') { d = 'M' + x + ' -220q' + (side * 40) + ' 6 ' + (side * 74) + ' -6'; hx = x + side * 74; hy = -226; }
      else if (pose === 'point') { d = 'M' + x + ' -220q' + (side * 40) + ' 20 ' + (side * 80) + ' 40'; hx = x + side * 80; hy = -180; }
      else if (pose === 'front') { d = 'M' + x + ' -220q' + (side * 6) + ' 50 ' + (-side * (sh - 10)) + ' 70'; hx = x - side * (sh - 8) - side * (sh - 30); hy = -150; }
      else if (pose === 'hip') { d = 'M' + x + ' -220q' + (side * 22) + ' 40 ' + (side * 2) + ' 66'; hx = x + side * 2; hy = -154; }
      else { d = 'M' + x + ' -220q' + (side * 10) + ' 50 ' + (side * 6) + ' 98'; hx = x + side * 6; hy = -120; }
      s += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + (o.thin ? 13 : 17) + '" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + ac + '" stroke-width="' + (o.thin ? 9 : 13) + '" stroke-linecap="round"/>';
      hands += '<circle cx="' + hx + '" cy="' + hy + '" r="7" fill="' + (o.glove || skin) + '"' + K(1.6) + '/>';
      return [hx, hy];
    }
    var hl = arm(-1, L), hr = arm(1, R);
    s += hands;
    /* head */
    if (o.kind !== 'shroud') {
      s += '<rect x="-7" y="-246" width="14" height="14" fill="' + skin + '"/>';
      s += '<ellipse cx="0" cy="-262" rx="' + (o.headw || 20) + '" ry="24" fill="' + skin + '"' + K() + '/>';
      var hs = o.hairStyle || 'short';
      if (hs === 'short') s += '<path d="M-20 -266q2 -24 20 -24q20 0 20 24q-6 -12 -20 -12q-14 0 -20 12z" fill="' + hair + '"' + K(1.6) + '/>';
      else if (hs === 'bald') s += '<path d="M-21 -258q-3 -14 4 -18M21 -258q3 -14 -4 -18" fill="none" stroke="' + hair + '" stroke-width="6" stroke-linecap="round"/>';
      else if (hs === 'long') s += '<path d="M-22 -258q-4 -36 22 -36q26 0 22 36l6 40q-12 4 -16 -10q-2 -26 -12 -36q-10 10 -12 36q-4 14 -16 10z" fill="' + hair + '"' + K(1.6) + '/>';
      else if (hs === 'bun') s += '<path d="M-21 -262q-2 -28 21 -28q23 0 21 28q-6 -16 -21 -16q-15 0 -21 16z" fill="' + hair + '"' + K(1.6) + '/><circle cx="0" cy="-290" r="9" fill="' + hair + '"' + K(1.4) + '/>';
      else if (hs === 'curls') s += '<path d="M-24 -256q-8 -40 24 -40q32 0 24 40l4 30q-10 -2 -10 -14q-2 -22 -18 -28q-16 6 -18 28q0 12 -10 14z" fill="' + hair + '"' + K(1.6) + '/>';
      else if (hs === 'pigtail') s += '<path d="M-20 -264q2 -24 20 -24q20 0 20 24q-4 -10 -20 -10q-16 0 -20 10z" fill="' + hair + '"' + K(1.6) + '/><path d="M18 -258q16 10 10 40" fill="none" stroke="' + hair + '" stroke-width="5"/><path d="M24 -232l8 4" stroke="' + INK + '" stroke-width="3"/>';
      /* face */
      var fc = o.face || 'plain';
      if (fc !== 'none') {
        s += '<path d="M-9 -266h5M4 -266h5" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>';
        if (o.nose === 'pointed') s += '<path d="M0 -264l9 14l-8 1" fill="' + skin + '"' + K(1.6) + '/>';
        else s += '<path d="M0 -263q4 8 -2 10" fill="none"' + K(1.6) + '/>';
        if (fc === 'smile') s += '<path d="M-8 -248q8 7 16 0" fill="none"' + K(1.8) + '/>';
        else if (fc === 'sad') s += '<path d="M-7 -246q7 -4 14 0" fill="none"' + K(1.8) + '/>';
        else if (fc === 'stern') s += '<path d="M-8 -248h16" stroke="' + INK + '" stroke-width="2"/><path d="M-11 -272l7 3M11 -272l-7 3" stroke="' + INK + '" stroke-width="2.4"/>';
        else s += '<path d="M-6 -248h12" stroke="' + INK + '" stroke-width="1.8"/>';
        if (o.cheeks) s += '<circle cx="-12" cy="-254" r="4" fill="' + o.cheeks + '" opacity=".6"/><circle cx="12" cy="-254" r="4" fill="' + o.cheeks + '" opacity=".6"/>';
      }
      /* hats */
      if (o.hat === 'top') s += '<path d="M-26 -282h52" stroke="' + INK + '" stroke-width="5"/><path d="M-17 -284l-2 -44h38l-2 44z" fill="' + (o.hatc || '#25211f') + '"' + K(1.6) + '/>';
      else if (o.hat === 'night') s += '<path d="M-22 -272q4 -30 30 -26q20 6 22 36q-8 -10 -14 -8q-14 -12 -38 -2z" fill="' + (o.hatc || '#f2ede2') + '"' + K(1.6) + '/><circle cx="31" cy="-258" r="5" fill="' + (o.hatc || '#f2ede2') + '"' + K(1.4) + '/>';
      else if (o.hat === 'bonnet') s += '<path d="M-26 -250q-6 -48 26 -48q32 0 26 48q-6 -30 -26 -30q-20 0 -26 30z" fill="' + (o.hatc || '#7a5a8a') + '"' + K(1.6) + '/>';
      else if (o.hat === 'wreath') s += '<path d="M-24 -280q24 -14 48 0" fill="none" stroke="#2f6b2f" stroke-width="7"/><g fill="#c22a1e"><circle cx="-14" cy="-284" r="3"/><circle cx="2" cy="-288" r="3"/><circle cx="16" cy="-284" r="3"/></g><path d="M-8 -284l-3 10M10 -284l3 10" stroke="#e8f4ff" stroke-width="2"/>';
      else if (o.hat === 'cap') s += '<path d="M-22 -276q22 -18 44 0z" fill="' + (o.hatc || '#4a4038') + '"' + K(1.6) + '/>';
      else if (o.hat === 'kerchief') s += '<path d="M-22 -262q0 -34 22 -34q22 0 22 34" fill="none" stroke="#efe8d8" stroke-width="5"/><path d="M-20 -248q20 20 40 0" fill="none" stroke="#efe8d8" stroke-width="6"/>';
    } else {
      /* the Phantom: a hood and nothing in it */
      s += '<path d="M-30 -226q-10 -70 30 -80q40 10 30 80z" fill="' + coat + '"' + K() + '/><path d="M-14 -246q14 -40 28 0q-14 10 -28 0z" fill="#0b0a0d"/>';
    }
    if (o.extra) s += o.extra;
    var sc = (o.h || 300) / 300;
    return '<g transform="scale(' + (o.flip ? -sc : sc) + ' ' + sc + ')">' + s + '</g>';
  }

  /* ---------- busts for the interviews ---------- */
  function sym(id, bg, body) { return '<symbol id="cc-' + id + '" viewBox="0 0 200 260"><rect width="200" height="260" fill="' + bg + '"/>' + body + '</symbol>'; }
  var HATCH = '<g stroke="' + INK + '" stroke-width="1" opacity=".18"><path d="M0 40l40 -40M0 80l80 -80M0 120l120 -120M0 160l160 -160M0 200l200 -200M0 240l200 -200M40 260l160 -160M80 260l120 -120M120 260l80 -80M160 260l40 -40"/></g>';
  function shoulders(c, extra) { return '<path d="M8 260q4 -62 50 -74l30 -6h24l30 6q46 12 50 74z" fill="' + c + '"' + K(3) + '/>' + (extra || ''); }
  function head(o) {
    var skin = o.skin || '#f0d2b4', s = '<rect x="88" y="150" width="24" height="34" fill="' + skin + '"/>';
    s += '<ellipse cx="100" cy="112" rx="' + (o.rx || 38) + '" ry="' + (o.ry || 48) + '" fill="' + skin + '"' + K(3) + '/>';
    return s;
  }
  var BUST = {
    bob: ['#d9d2c0', shoulders('#5a5248', '<path d="M64 192q36 22 72 0l4 14q-40 24 -80 0z" fill="#f2efe6"' + K(2.4) + '/><path d="M118 200l14 60h18l-14 -60z" fill="#f2efe6"' + K(2.4) + '/>') +
      head({ skin: '#efcfae', rx: 34, ry: 44 }) + '<path d="M66 100q2 -44 34 -44q32 0 34 44q-10 -22 -34 -22q-24 0 -34 22z" fill="#8a6a4a"' + K(2) + '/>' +
      '<path d="M82 108h10M108 108h10" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M100 112q6 12 -2 16" fill="none"' + K(2) + '/><path d="M88 138q12 6 24 0" fill="none"' + K(2.2) + '/><circle cx="76" cy="126" r="6" fill="#e88a7a" opacity=".45"/><circle cx="124" cy="126" r="6" fill="#e88a7a" opacity=".45"/>'],
    fred: ['#e9d6b8', shoulders('#3b4f6a', '<path d="M84 186l16 34 16 -34z" fill="#fbf8ef"' + K(2) + '/><path d="M92 192h16l-4 12h-8z" fill="#b8332a"/>') +
      head({ skin: '#f3c9a4' }) + '<path d="M62 104q0 -54 38 -54q40 0 40 54q-8 -26 -40 -26q-30 0 -38 26z" fill="#6a3f22"' + K(2) + '/>' +
      '<path d="M80 108h10M110 108h10" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M100 112q6 12 -2 16" fill="none"' + K(2) + '/><path d="M84 136q16 12 32 0" fill="none"' + K(2.4) + '/><circle cx="74" cy="124" r="8" fill="#e8705a" opacity=".5"/><circle cx="126" cy="124" r="8" fill="#e8705a" opacity=".5"/>' +
      '<g fill="#fff" opacity=".8"><circle cx="146" cy="70" r="3"/><circle cx="154" cy="58" r="2"/></g>'],
    gentleman: ['#d6dbcf', shoulders('#2e3236', '<path d="M60 200q40 30 80 0" fill="none"' + K(2) + '/><path d="M84 184l16 26 16 -26z" fill="#fbf8ef"' + K(2) + '/>') +
      head({ skin: '#f1c8a8', rx: 44, ry: 46 }) + '<path d="M58 100q-4 -30 10 -40M142 100q4 -30 -10 -40" fill="none" stroke="#b8b0a4" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M78 106h10M112 106h10" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><circle cx="83" cy="106" r="11" fill="none"' + K(1.8) + '/><circle cx="117" cy="106" r="11" fill="none"' + K(1.8) + '/><path d="M94 106h12" stroke="' + INK + '" stroke-width="1.8"/>' +
      '<path d="M100 112q8 12 -2 18" fill="none"' + K(2) + '/><path d="M82 138q18 10 36 0" fill="none"' + K(2.4) + '/><path d="M60 140q40 40 80 0" fill="none" stroke="#e8b498" stroke-width="2"/>' +
      '<rect x="128" y="196" width="50" height="64" fill="#7a5a3a"' + K(2) + '/><path d="M136 210h34M136 222h30M136 234h34" stroke="#f0e6cc" stroke-width="2"/>'],
    marley: ['#1c2a2e', '<g opacity=".86">' + shoulders('#5f6f6a', '<path d="M70 196q30 14 60 0v64h-60z" fill="#7d8c84"' + K(2) + '/>') +
      head({ skin: '#cfe0d4' }) + '<path d="M64 112q-2 -58 36 -60q38 2 36 60" fill="none" stroke="#e9efe4" stroke-width="7"/><path d="M62 128q38 40 76 0" fill="none" stroke="#e9efe4" stroke-width="9"/>' +
      '<path d="M136 96q20 4 22 40" fill="none" stroke="#9fb0a6" stroke-width="7" stroke-linecap="round"/>' +
      '<circle cx="84" cy="104" r="6" fill="none"' + K(2.2) + '/><circle cx="116" cy="104" r="6" fill="none"' + K(2.2) + '/><circle cx="84" cy="104" r="2" fill="' + INK + '"/><circle cx="116" cy="104" r="2" fill="' + INK + '"/>' +
      '<path d="M70 78h24M106 78h24" stroke="' + INK + '" stroke-width="2"/><rect x="72" y="70" width="22" height="10" rx="5" fill="none"' + K(1.6) + '/><rect x="106" y="70" width="22" height="10" rx="5" fill="none"' + K(1.6) + '/>' +
      '<path d="M100 110q6 12 -2 16" fill="none"' + K(2) + '/><path d="M88 138h24" stroke="' + INK + '" stroke-width="2.2"/></g>' +
      '<g fill="none" stroke="#a8b4b0" stroke-width="7"><ellipse cx="40" cy="236" rx="16" ry="10"/><ellipse cx="66" cy="244" rx="16" ry="10"/><ellipse cx="160" cy="236" rx="16" ry="10"/></g><rect x="128" y="226" width="30" height="24" fill="#8a9690"' + K(2) + '/>'],
    pastghost: ['#fbf3dc', '<path d="M100 0l-30 70h60z" fill="#fff8d8" opacity=".9"/>' + shoulders('#fffdf6', '<path d="M40 232q60 16 120 0" fill="none" stroke="#f2cf5a" stroke-width="8"/><g fill="#e85a7a"><circle cx="60" cy="214" r="5"/><circle cx="140" cy="214" r="5"/></g><g fill="#f2c040"><circle cx="76" cy="220" r="4"/><circle cx="124" cy="220" r="4"/></g>') +
      head({ skin: '#fde8d6', rx: 34, ry: 42 }) + '<path d="M64 116q-6 -60 36 -60q42 0 36 60l6 60q-12 0 -14 -20q-2 -50 -28 -60q-26 10 -28 60q-2 20 -14 20z" fill="#fdfdf8"' + K(2) + '/>' +
      '<circle cx="86" cy="110" r="3" fill="' + INK + '"/><circle cx="114" cy="110" r="3" fill="' + INK + '"/><path d="M92 136q8 4 16 0" fill="none"' + K(2) + '/><circle cx="78" cy="126" r="6" fill="#f7a8a8" opacity=".5"/><circle cx="122" cy="126" r="6" fill="#f7a8a8" opacity=".5"/>' +
      '<path d="M100 56v-40" stroke="#fff3b0" stroke-width="12" stroke-linecap="round"/><path d="M100 54v-34" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'],
    fezziwig: ['#f2d9a8', shoulders('#7a3a2a', '<path d="M54 200q46 40 92 0v60h-92z" fill="#e6b85a"' + K(2) + '/><g fill="#8a5a1a"><circle cx="100" cy="214" r="3"/><circle cx="100" cy="232" r="3"/><circle cx="100" cy="250" r="3"/></g>') +
      head({ skin: '#f4c09a', rx: 46, ry: 46 }) + '<path d="M50 112q-8 -66 50 -68q58 2 50 68q10 -10 8 6q-8 30 -14 12q-4 -40 -44 -46q-40 6 -44 46q-6 18 -14 -12q-2 -16 8 -6z" fill="#f4f1ea"' + K(2) + '/>' +
      '<path d="M78 106q6 -6 12 0M110 106q6 -6 12 0" fill="none"' + K(2.4) + '/><circle cx="100" cy="122" r="8" fill="#e8806a"' + K(1.6) + '/><path d="M76 140q24 22 48 0" fill="#9a2a20"' + K(2.4) + '/><circle cx="68" cy="128" r="9" fill="#e8705a" opacity=".55"/><circle cx="132" cy="128" r="9" fill="#e8705a" opacity=".55"/>'],
    mrscratchit: ['#e6d2c4', shoulders('#6a4a6a', '<path d="M60 194q40 24 80 0" fill="none" stroke="#c23a4a" stroke-width="7"/><path d="M76 200l-8 20M124 200l8 20" stroke="#c23a4a" stroke-width="5"/>') +
      head({ skin: '#f0caa8', rx: 36, ry: 44 }) + '<path d="M60 116q-6 -64 40 -64q46 0 40 64q-8 -34 -40 -36q-32 2 -40 36z" fill="#5a3a2a"' + K(2) + '/><path d="M58 92q42 -52 84 0q-8 -46 -42 -48q-34 2 -42 48z" fill="#f3efe6"' + K(1.8) + '/><path d="M60 92l-10 14M140 92l10 14" stroke="#c23a4a" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M82 110h10M108 110h10" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M100 114q5 10 -2 14" fill="none"' + K(2) + '/><path d="M88 138q12 6 24 0" fill="none"' + K(2.2) + '/>'],
    presentghost: ['#dfe9d0', '<path d="M0 260q10 -70 70 -84h60q60 14 70 84z" fill="#2f6b2f"' + K(3) + '/><path d="M70 176q30 40 60 0" fill="#f3c9a4"' + K(2) + '/><path d="M60 180q-4 40 0 80M140 180q4 40 0 80" stroke="#f4efe4" stroke-width="14"/>' +
      head({ skin: '#f3c9a4', rx: 42, ry: 48 }) + '<path d="M56 120q-10 -70 44 -72q54 2 44 72l10 40q-14 4 -18 -14q0 -50 -36 -60q-36 10 -36 60q-4 18 -18 14z" fill="#6a3f1e"' + K(2) + '/>' +
      '<path d="M58 80q42 -30 84 0" fill="none" stroke="#2f6b2f" stroke-width="10"/><g fill="#c22a1e"><circle cx="70" cy="74" r="4"/><circle cx="100" cy="64" r="4"/><circle cx="130" cy="74" r="4"/></g><path d="M84 70l-4 14M116 70l4 14" stroke="#eaf6ff" stroke-width="3"/>' +
      '<path d="M80 108q6 -6 12 0M108 108q6 -6 12 0" fill="none"' + K(2.4) + '/><path d="M100 114q6 12 -2 16" fill="none"' + K(2) + '/><path d="M80 138q20 16 40 0" fill="none"' + K(2.4) + '/>']
  };
  var spr = '';
  Object.keys(BUST).forEach(function (k) { spr += sym(k, BUST[k][0], (k === 'marley' ? '' : HATCH) + BUST[k][1]); });
  window.CAST_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>' + spr + '</defs></svg>';
  window.FACE = function (who) {
    var bg = BUST[who] ? BUST[who][0] : '#222';
    return '<svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMax meet" style="background:' + bg + '"><use href="#cc-' + who + '"/></svg>';
  };
  window.CC = window.CC || {};
  window.CC.fig = fig;
  window.CC.INK = INK;
})();
