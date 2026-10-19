/* Open This Together, part B (the operator) - what every room of this part shares.
   LG.card(...)     the card in the top left corner that says what to ask or tell the partner first
   LG.thing(...)    a thing in the scene that answers a click with a line (and a name tag)
   LG.counter(...)  a number set with arrows, for the dive log and the clock
   The plans, the radio rules, the catalogue card and the two faces live here, so that every room shows the same ones. */
window.LG = (function () {
  'use strict';
  var D = document, cardEl = null;

  function card(parts) {
    if (!cardEl) {
      cardEl = ER.el('div', 'pcard');
      D.body.appendChild(cardEl);
      cardEl.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.w')) return;
        cardEl.classList.toggle('min');
        cardEl.querySelector('.fold').textContent = cardEl.classList.contains('min') ? 'open' : 'fold';
      });
    }
    var s = '<span class="fold">fold</span>';
    parts.forEach(function (p) { s += '<h6>' + p[0] + '</h6>' + p[1].map(function (l) { return '<p>' + l + '</p>'; }).join(''); });
    var was = cardEl.innerHTML;
    cardEl.innerHTML = ER.gloss(s);
    cardEl.classList.remove('min');
    if (was && was !== cardEl.innerHTML) { cardEl.classList.remove('ping'); void cardEl.offsetWidth; cardEl.classList.add('ping'); }
  }
  function thing(sel, word, text, busy) {
    var n = ER.$(sel); if (!n) return;
    n.addEventListener('click', function (e) {
      if (busy && busy()) return;
      var t = typeof text === 'function' ? text() : text;
      if (word) ER.wordAt(e.clientX, e.clientY, word);
      if (t) ER.say(t);
    });
  }
  /* vals: the values in order; o.big: also a pair of arrows that jump ten at a time; o.cls: extra class */
  function counter(vals, start, o) {
    o = o || {};
    var i = Math.max(0, vals.indexOf(start)), el = ER.el('span', 'ctr' + (o.cls ? ' ' + o.cls : ''));
    el.innerHTML = (o.big ? '<button type="button" data-d="-10" title="ten down">&laquo;</button>' : '') + '<button type="button" data-d="-1" title="down">&#9660;</button><b></b>' +
      '<button type="button" data-d="1" title="up">&#9650;</button>' + (o.big ? '<button type="button" data-d="10" title="ten up">&raquo;</button>' : '');
    if (o.id) el.id = o.id;
    function show() { el.querySelector('b').textContent = vals[i]; }
    el.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null; if (!b) return;
      i = (i + parseInt(b.getAttribute('data-d'), 10) + vals.length * 10) % vals.length; show(); ER.sfx.tick(0.6);
      if (o.change) o.change();
    });
    show();
    return { el: el, value: function () { return vals[i]; }, set: function (v) { var j = vals.indexOf(v); if (j >= 0) { i = j; show(); } } };
  }
  function range(a, b, step, dec, pad) {
    var out = [], v;
    for (v = a; v <= b + 1e-9; v += step) { var s = dec ? v.toFixed(dec) : String(Math.round(v)); if (pad) while (s.length < pad) s = '0' + s; out.push(s); }
    return out;
  }

  /* ---------- the two people you talk to ---------- */
  var FACE = {
    blundell: '<svg viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="320" fill="#3a2c1c"/><path d="M20 320q0 -110 100 -118q100 8 100 118z" fill="#2c3a52"/><path d="M86 214l34 40 34 -40" fill="#e6e0d0"/><path d="M110 236h20l-4 50h-12z" fill="#7a2a22"/>' +
      '<rect x="104" y="180" width="32" height="34" fill="#d9a888"/><ellipse cx="120" cy="134" rx="56" ry="64" fill="#e2b28e"/><path d="M64 120q-10 -40 14 -54M176 120q10 -40 -14 -54" stroke="#ece8de" stroke-width="16" stroke-linecap="round" fill="none"/>' +
      '<path d="M80 108q16 -12 32 -2M128 106q16 -10 32 2" stroke="#ece8de" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="98" cy="124" r="5" fill="#2a1c12"/><circle cx="142" cy="124" r="5" fill="#2a1c12"/>' +
      '<path d="M120 128q-8 22 2 28" stroke="#b07a5a" stroke-width="4" fill="none"/><path d="M96 170q24 14 48 0" stroke="#7a3a2a" stroke-width="4" fill="none"/><path d="M88 160q32 -10 64 0q-32 6 -64 0z" fill="#ece8de"/>' +
      '<ellipse cx="120" cy="74" rx="62" ry="14" fill="#1d2a40"/><path d="M70 74q4 -40 50 -42q46 2 50 42z" fill="#2c3a52"/><rect x="104" y="46" width="32" height="12" rx="3" fill="#c9a94e"/></svg>',
    phone: '<svg viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="320" fill="#2a2016"/><path d="M40 270q0 -60 30 -80h100q30 20 30 80z" fill="#1b1b1b"/><circle cx="120" cy="236" r="40" fill="#e8e0cc"/><circle cx="120" cy="236" r="14" fill="#1b1b1b"/>' +
      '<g fill="#1b1b1b">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (k) { var a = (k * 30 - 120) * Math.PI / 180; return '<circle cx="' + (120 + 28 * Math.cos(a)).toFixed(1) + '" cy="' + (236 + 28 * Math.sin(a)).toFixed(1) + '" r="5"/>'; }).join('') + '</g>' +
      '<path d="M40 150q-10 -50 30 -60h100q40 10 30 60l-26 6q-4 -30 -20 -32h-68q-16 2 -20 32z" fill="#1b1b1b"/><path d="M200 160q30 40 10 100q-20 50 10 60" stroke="#1b1b1b" stroke-width="5" fill="none"/>' +
      '<text x="120" y="58" font-family="Kalam,cursive" font-weight="700" font-size="20" fill="#f2d28f" text-anchor="middle">Mrs Treharne</text><text x="120" y="80" font-family="Space Mono,monospace" font-size="12" fill="#d9c49a" text-anchor="middle">across the river</text></svg>'
  };

  /* ---------- papers ---------- */
  var ABC = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'X-ray', 'Yankee', 'Zulu'];
  var RULES = '<h4>Radio rules · Rillmouth Harbour Dive Team</h4>' +
    '<p>1. Say who you are calling, then who you are: &ldquo;Diver, this is Topside.&rdquo;<br>2. Say &ldquo;over&rdquo; when you have finished and want an answer.<br>3. Say every number back, to check it.<br>4. Never say &ldquo;there&rdquo;. Say WHERE.<br>5. Spell every name:</p>' +
    '<div class="abc">' + ABC.map(function (w) { return '<span><b>' + w.charAt(0) + '</b> ' + w + '</span>'; }).join('') + '</div>' +
    '<p>The operator keeps the dive log. The diver keeps the operator informed. Nobody keeps biscuits on the radio.</p>';

  function door(x, y, w, dir, dbl) {           /* a door in a wall: an opening and its swing, drawn the way architects draw them */
    var s = '<path d="M' + x + ' ' + y + 'h' + w + '" stroke="#e9edf0" stroke-width="5"/>', r = dbl ? w / 2 : w;
    if (dbl) s += '<path d="M' + x + ' ' + y + 'v' + (dir * r) + 'M' + x + ' ' + (y + dir * r) + 'A' + r + ' ' + r + ' 0 0 ' + (dir > 0 ? 0 : 1) + ' ' + (x + r) + ' ' + y + 'M' + (x + w) + ' ' + y + 'v' + (dir * r) + 'M' + (x + w) + ' ' + (y + dir * r) + 'A' + r + ' ' + r + ' 0 0 ' + (dir > 0 ? 1 : 0) + ' ' + (x + r) + ' ' + y + '" stroke="#5a7a9a" stroke-width="1.5" fill="none"/>';
    else s += '<path d="M' + x + ' ' + y + 'v' + (dir * r) + 'M' + x + ' ' + (y + dir * r) + 'A' + r + ' ' + r + ' 0 0 ' + (dir > 0 ? 0 : 1) + ' ' + (x + r) + ' ' + y + '" stroke="#5a7a9a" stroke-width="1.5" fill="none"/>';
    return s;
  }
  var T = 'font-family="Barlow Condensed,sans-serif" font-weight="700" fill="#1a3a5a" text-anchor="middle"', K = 'font-family="Kalam,cursive" font-weight="700" fill="#6a4a2a"';
  var PLAN = '<h4>Rillmouth Museum · the basement</h4><svg viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="420" fill="#e9edf0"/>' +
    '<g stroke="#1a3a5a" stroke-width="4" fill="#f6f8fa"><rect x="50" y="110" width="120" height="90"/><rect x="170" y="30" width="250" height="170"/><rect x="420" y="30" width="140" height="170"/>' +
    '<rect x="50" y="250" width="120" height="70"/><rect x="170" y="250" width="250" height="100"/><rect x="420" y="250" width="140" height="70"/><rect x="560" y="170" width="70" height="110"/></g>' +
    '<rect x="50" y="200" width="510" height="50" fill="#dfe6ec"/><rect x="10" y="200" width="40" height="50" fill="#cfd8e0" stroke="#1a3a5a" stroke-width="2"/><g stroke="#1a3a5a" stroke-width="1.5"><path d="M18 200v50M26 200v50M34 200v50M42 200v50"/></g>' +
    '<rect x="170" y="2" width="250" height="28" fill="#c9d4de"/><g stroke="#8aa0b4" stroke-width="1"><path d="M180 2l20 28M200 2l20 28M220 2l20 28M240 2l20 28M260 2l20 28M300 2l20 28M320 2l20 28M340 2l20 28M360 2l20 28M380 2l20 28"/></g>' +
    door(95, 200, 30, -1, true) + door(280, 200, 30, -1, true) + door(480, 200, 16, -1) + door(280, 250, 30, 1, true) + door(480, 250, 16, 1) + door(280, 30, 30, 1, true) +
    '<path d="M95 250h30" stroke="#e9edf0" stroke-width="5"/><path d="M95 250l5 6 5 -6 5 6 5 -6 5 6 5 -6" stroke="#5a7a9a" stroke-width="1.5" fill="none"/>' +
    '<path d="M420 45v22" stroke="#e9edf0" stroke-width="5"/><path d="M560 212v26" stroke="#e9edf0" stroke-width="6"/><rect x="556" y="210" width="8" height="30" fill="#5a7a9a"/>' +
    '<g fill="#c9d4de" stroke="#8aa0b4" stroke-width="1"><rect x="182" y="44" width="40" height="140"/><rect x="368" y="44" width="40" height="140"/></g>' +
    '<text x="110" y="160" ' + T + ' font-size="15">PRINT ROOM</text><text x="295" y="120" ' + T + ' font-size="20" letter-spacing="2">LONG STORE</text><text x="490" y="120" ' + T + ' font-size="15">BOILER ROOM</text>' +
    '<text x="110" y="292" ' + T + ' font-size="15">LIFT</text><text x="295" y="306" ' + T + ' font-size="15">OLD KITCHEN</text><text x="490" y="292" ' + T + ' font-size="15">COAL STORE</text>' +
    '<text x="595" y="230" ' + T + ' font-size="12" transform="rotate(-90 595 226)">STRONGROOM</text><text x="305" y="230" ' + T + ' font-size="14" letter-spacing="4" fill="#4a6a8a">LOWER CORRIDOR</text>' +
    '<text x="295" y="20" ' + T + ' font-size="11" fill="#4a6a8a">FRONT STAIRS</text><text x="30" y="268" ' + T + ' font-size="11">STAIRS</text><text x="30" y="281" ' + T + ' font-size="11">up to the</text><text x="30" y="294" ' + T + ' font-size="11">Lodge</text>' +
    '<text x="295" y="58" ' + T + ' font-size="11" fill="#4a6a8a">main doors</text><text x="295" y="192" ' + T + ' font-size="11" fill="#4a6a8a">back doors</text>' +
    '<g transform="translate(606 46)"><path d="M0 -26l10 26h-20z" fill="#1a3a5a"/><text x="0" y="22" ' + T + ' font-size="16">N</text></g>' +
    '<text x="16" y="386" ' + K + ' font-size="15">Long Store: glass case fallen across the main doors. O.B. 9 p.m.</text><text x="68" y="338" ' + K + ' font-size="14">out of use since 1987</text>' +
    '<text x="16" y="410" ' + K + ' font-size="15">Strongroom: do NOT open in a flood! A.T.</text></svg>' +
    '<p>Drawn for the museum in 1998. North is at the top. The stairs from the Lodge come down at the west end of the Lower Corridor.</p>' +
    '<p class="pencil">Every door down there is locked except the coal store and the lift gate. Keys in the cupboard. O.B.</p>';

  var STORE = '<h4>Rillmouth Museum · the Long Store</h4><svg viewBox="0 0 520 560" xmlns="http://www.w3.org/2000/svg"><rect width="520" height="560" fill="#e9edf0"/>' +
    '<rect x="60" y="60" width="400" height="440" fill="#f6f8fa" stroke="#1a3a5a" stroke-width="5"/>' + door(230, 60, 60, 1, true) + door(230, 500, 60, -1, true) +
    '<path d="M460 80v32" stroke="#e9edf0" stroke-width="6"/><text x="490" y="92" ' + T + ' font-size="11" fill="#4a6a8a">to the</text><text x="490" y="105" ' + T + ' font-size="11" fill="#4a6a8a">Boiler Room</text>' +
    [['D', 70, 'figurehead', '(the Halcyon)'], ['E', 210, 'pike', 'in a glass case'], ['F', 350, 'rocking', 'horse']].map(function (b) {
      return '<rect x="66" y="' + b[1] + '" width="130" height="130" fill="#dfe6ec" stroke="#5a7a9a" stroke-width="2"/><text x="131" y="' + (b[1] + 62) + '" ' + T + ' font-size="44">' + b[0] + '</text><text x="131" y="' + (b[1] + 92) + '" ' + K + ' font-size="15" text-anchor="middle">' + b[2] + '</text><text x="131" y="' + (b[1] + 110) + '" ' + K + ' font-size="13" text-anchor="middle">' + b[3] + '</text>'; }).join('') +
    [['A', 70, 'bear', ''], ['B', 210, 'penny-', 'farthing'], ['C', 350, 'rowing boat', '(Dabchick)']].map(function (b) {
      return '<rect x="324" y="' + b[1] + '" width="130" height="130" fill="#dfe6ec" stroke="#5a7a9a" stroke-width="2"/><text x="389" y="' + (b[1] + 62) + '" ' + T + ' font-size="44">' + b[0] + '</text><text x="389" y="' + (b[1] + 92) + '" ' + K + ' font-size="15" text-anchor="middle">' + b[2] + '</text><text x="389" y="' + (b[1] + 110) + '" ' + K + ' font-size="13" text-anchor="middle">' + b[3] + '</text>'; }).join('') +
    '<rect x="208" y="458" width="18" height="18" fill="#1a3a5a"/><text x="150" y="472" ' + K + ' font-size="13">pillar, with gauge</text>' +
    '<text x="260" y="40" ' + T + ' font-size="15" letter-spacing="2">MAIN DOORS</text><text x="260" y="54" ' + T + ' font-size="11" fill="#4a6a8a">everybody comes in here</text>' +
    '<text x="260" y="526" ' + T + ' font-size="13" letter-spacing="1">back doors</text><text x="260" y="542" ' + T + ' font-size="11" fill="#4a6a8a">from the Lower Corridor</text>' +
    '<g transform="translate(486 160)"><path d="M0 -26l10 26h-20z" fill="#1a3a5a"/><text x="0" y="22" ' + T + ' font-size="16">N</text></g></svg>' +
    '<p>Bays are lettered from the main doors: A, B and C down the left-hand side as you come in, D, E and F down the right-hand side. Each bay has its letter painted on the floor and low on its upright.</p>' +
    '<p>Top shelves: 2.60 m above the floor. Depth gauges are painted on the pillar inside the back doors and on the end upright of every bay.</p>';

  var CARD31 = '<h4>2025.31 &nbsp; THE RILLMOUTH BOX (time capsule)</h4>' +
    '<p>Oak box with brass corners and a brass handle at each end.</p><p>A ship under sail carved on the lid.</p><p>Brass plate on the front: OPEN THIS TOGETHER.</p>' +
    '<p>46 &times; 30 &times; 22 cm. 6 kg.</p><p>Letters from the children of Rillmouth School to the children of 2026, sealed 5 November 1926. Found in the wall of the old school, May 2025.</p>' +
    '<p>TO BE OPENED: SATURDAY 7 NOVEMBER 2026.</p><p>Where: Long Store, Bay D, top shelf.</p><p class="hand">Moved to D top shelf on Monday: rain forecast. A.T.</p>';

  var sfx = {
    radio: function () { ER.burst({ type: 'highpass', f: 2200, dur: 0.18, peak: 0.08, a: 0.01 }); ER.tone({ type: 'square', f: 1400, dur: 0.05, peak: 0.03, when: 0.16 }); },
    keys: function () { [0, 0.07, 0.15, 0.22].forEach(function (w, i) { ER.tone({ f: 2400 + i * 300, dur: 0.12, peak: 0.05, when: w }); }); },
    drawer: function () { ER.burst({ type: 'lowpass', f: 600, dur: 0.35, peak: 0.18, a: 0.05 }); ER.sfx.clunk(); }
  };
  function mins() { var s = ER.state(); return Math.max(1, Math.round(((s.fin ? s.fin.secs : s.secs) || 0) / 60)); }

  return {
    card: card, thing: thing, counter: counter, range: range, FACE: FACE, RULES: RULES, PLAN: PLAN, STORE: STORE, CARD31: CARD31, sfx: sfx, mins: mins,
    rules: function () { ER.read({ html: RULES, cls: 'rules', clue: { id: 'rules', title: 'The radio rules', kind: 'Pinned by the radio' } }); },
    plan: function (done) { ER.read({ html: PLAN, cls: 'plan', clue: { id: 'plan', title: 'Plan of the basement', kind: 'Pinned on the wall' }, done: done }); },
    store: function (done) { ER.read({ html: STORE, cls: 'plan tall', clue: { id: 'store', title: 'Plan of the Long Store', kind: 'Pinned on the wall' }, done: done }); }
  };
})();
