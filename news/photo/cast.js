/* The people of "One Sun", as busts of 200 x 260, each in the light of the place where you meet them.
   FACE('kasia' | 'hammond' | 'lorna' | 'lou' | 'platt' | 'hamish' | 'esme') gives the picture for an interview.
   (Gideon Platt and Hamish Ure are voices on a telephone: they are drawn with the telephone.) */
(function () {
  function head(o) {
    var s = '';
    s += '<rect x="87" y="144" width="26" height="44" fill="' + o.skin + '"/><path d="M87 166q13 11 26 0v22h-26z" fill="' + o.shade + '" opacity=".6"/>';
    s += '<ellipse cx="58" cy="112" rx="6" ry="10" fill="' + o.skin + '"/><ellipse cx="142" cy="112" rx="6" ry="10" fill="' + o.skin + '"/>';
    s += '<ellipse cx="100" cy="106" rx="' + (o.wide || 41) + '" ry="' + (o.long || 49) + '" fill="' + o.skin + '"/>';
    if (o.glow) s += '<path d="' + (o.glowL ? 'M73 68Q50 106 74 146' : 'M127 68Q150 106 126 146') + '" fill="none" stroke="' + o.glow + '" stroke-width="7" stroke-linecap="round" opacity=".42"/>';
    return s;
  }
  function eyes(o) {
    var e = o.eye || '#3a2a1c', w = o.wide || 5, y = o.y || 112;
    return '<ellipse cx="83" cy="' + y + '" rx="6.5" ry="' + w + '" fill="#fbf7ee"/><ellipse cx="117" cy="' + y + '" rx="6.5" ry="' + w + '" fill="#fbf7ee"/>' +
      '<circle cx="' + (83 + (o.look || 0)) + '" cy="' + (y + 0.5) + '" r="3.4" fill="' + e + '"/><circle cx="' + (117 + (o.look || 0)) + '" cy="' + (y + 0.5) + '" r="3.4" fill="' + e + '"/>' +
      '<circle cx="' + (84 + (o.look || 0)) + '" cy="' + (y - 0.7) + '" r="1" fill="#fff"/><circle cx="' + (118 + (o.look || 0)) + '" cy="' + (y - 0.7) + '" r="1" fill="#fff"/>';
  }
  function nose(c) { return '<path d="M100 116q-5 12 0 16q5 2 7 -2" stroke="' + c + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; }
  function body(fill) { return '<path d="M6 260Q8 206 48 192L84 178H116L152 192Q192 206 194 260Z" fill="' + fill + '"/>'; }
  function phone(side) { return side === 'L' ? '<path d="M44 150Q40 112 58 96L70 104Q58 120 62 150Z" fill="#1b1d22"/><rect x="40" y="148" width="26" height="40" rx="6" fill="#1b1d22"/>' :
    '<path d="M156 150Q160 112 142 96L130 104Q142 120 138 150Z" fill="#1b1d22"/><rect x="134" y="148" width="26" height="40" rx="6" fill="#1b1d22"/>'; }

  var S = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>';

  /* Kasia Wrobel, the night picture editor: red hair in a knot held with a pencil, black glasses, the blue light of six screens */
  S += '<symbol id="fc-kasia" viewBox="0 0 200 260"><rect width="200" height="260" fill="#0f1a26"/>' +
    '<g fill="#1f6fa8" opacity=".35"><rect x="10" y="20" width="56" height="38"/><rect x="72" y="14" width="56" height="40"/><rect x="134" y="20" width="56" height="38"/></g><path d="M0 0L120 260H0Z" fill="#5ab0e6" opacity=".08"/>' +
    body('#2d3a4a') + '<path d="M84 178L100 220L116 178Z" fill="#e6e2d6"/><path d="M84 178L66 210L98 238M116 178L134 210L102 238" fill="none" stroke="#1c2633" stroke-width="5" stroke-linejoin="round"/>' +
    head({ skin: '#f0d3bc', shade: '#d6b094', glow: '#7cc4f0', glowL: 1 }) +
    '<path d="M58 108Q54 52 100 50Q146 52 142 108Q136 76 112 70Q90 80 64 82Q59 94 58 108Z" fill="#c8763a"/><circle cx="104" cy="44" r="20" fill="#c8763a"/><path d="M84 30l42 26" stroke="#e9c93a" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M72 98q10 -4 20 0M108 98q11 -4 21 0" stroke="#9a5a2a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    eyes({ eye: '#3a6a5a', wide: 4.5, look: -1 }) + nose('#d6b094') +
    '<g fill="none" stroke="#1d1d1d" stroke-width="4"><rect x="69" y="103" width="28" height="19" rx="3"/><rect x="103" y="103" width="28" height="19" rx="3"/><path d="M97 110h6M69 108l-11 -3M131 108l11 -3"/></g>' +
    '<path d="M88 146q12 2 24 -2" stroke="#8c4a3c" stroke-width="3.2" fill="none" stroke-linecap="round"/></symbol>';

  /* Cyril Hammond, seventy-four, staff photographer from 1971 to 2016: bald, a white fringe, a brown cardigan, a loupe on a cord,
     lit from below by the light table */
  S += '<symbol id="fc-hammond" viewBox="0 0 200 260"><rect width="200" height="260" fill="#2a2018"/><rect x="0" y="200" width="200" height="60" fill="#f3f6f2" opacity=".2"/>' +
    '<g fill="#4a3a2a"><rect x="10" y="20" width="40" height="150"/><rect x="150" y="20" width="40" height="150"/></g><g fill="#6b5a44"><rect x="14" y="30" width="32" height="20"/><rect x="14" y="60" width="32" height="20"/><rect x="14" y="90" width="32" height="20"/><rect x="154" y="30" width="32" height="20"/><rect x="154" y="60" width="32" height="20"/><rect x="154" y="90" width="32" height="20"/></g>' +
    body('#7a6a4f') + '<path d="M84 178L100 228L116 178Z" fill="#cfd8e0"/><path d="M100 200v40" stroke="#5a4a36" stroke-width="2"/><circle cx="104" cy="210" r="3" fill="#e8e0cc"/><circle cx="104" cy="232" r="3" fill="#e8e0cc"/>' +
    '<path d="M86 180Q100 214 114 180" fill="none" stroke="#1d1d1d" stroke-width="2"/><circle cx="100" cy="214" r="9" fill="#1d1d1d"/><circle cx="100" cy="214" r="5" fill="#9ab"/>' +
    head({ skin: '#eccfb4', shade: '#cfae92' }) +
    '<path d="M100 150Q60 150 60 112" fill="none" stroke="#fffbe8" stroke-width="5" opacity=".25"/>' +
    '<path d="M58 118Q55 92 64 84Q62 102 66 120ZM142 118Q145 92 136 84Q138 102 134 120Z" fill="#e8e6e0"/>' +
    '<path d="M72 98q10 -4 20 1M108 99q11 -5 21 -1" stroke="#cfcac0" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    eyes({ eye: '#4a5a6a', wide: 3.5 }) + nose('#cfae92') +
    '<g fill="#fff" fill-opacity=".12" stroke="#3a3a3a" stroke-width="2.2"><circle cx="83" cy="114" r="12"/><circle cx="117" cy="114" r="12"/></g><path d="M95 113h10" stroke="#3a3a3a" stroke-width="2"/>' +
    '<path d="M86 146q14 6 28 0" stroke="#8c4a3c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M76 134q-3 8 3 13M124 134q3 8 -3 13" stroke="#cfae92" stroke-width="2" fill="none"/></symbol>';

  /* Lorna Frisby, the night editor: a black bob, a red jacket, a voice that carries through glass. On the roof at night, a flask in her hand */
  S += '<symbol id="fc-lorna" viewBox="0 0 200 260"><rect width="200" height="260" fill="#151a2e"/>' +
    '<g fill="#fff">' + (function () { var t = '', k, r = 7; for (k = 0; k < 26; k++) { r = (r * 16807) % 2147483647; var x = r % 200; r = (r * 16807) % 2147483647; var y = r % 120; t += '<circle cx="' + x + '" cy="' + y + '" r="' + (k % 4 ? 0.8 : 1.4) + '"/>'; } return t; })() + '</g><path d="M0 200Q100 180 200 196V260H0Z" fill="#e2a24a" opacity=".18"/>' +
    body('#7a1f24') + '<path d="M84 178L100 220L116 178Z" fill="#f2efe8"/><path d="M84 178L66 208L98 238M116 178L134 208L102 238" fill="none" stroke="#561418" stroke-width="5" stroke-linejoin="round"/>' +
    head({ skin: '#d9a37c', shade: '#bb8660', glow: '#e2a24a' }) +
    '<path d="M54 140Q42 54 100 50Q158 54 146 140L136 142Q140 104 132 84Q100 96 68 84Q60 104 64 142Z" fill="#2a2420"/>' +
    '<path d="M72 98q10 -5 20 -1M108 97q11 -4 21 1" stroke="#2a2420" stroke-width="3.6" fill="none" stroke-linecap="round"/>' +
    eyes({ eye: '#2a1d14', wide: 4.2, look: 1 }) + nose('#bb8660') +
    '<path d="M86 148q14 -3 28 0" stroke="#7a2f2f" stroke-width="3.6" fill="none" stroke-linecap="round"/>' +
    '<rect x="146" y="196" width="26" height="56" rx="6" fill="#8a9198"/><rect x="146" y="196" width="26" height="12" rx="4" fill="#3a3f45"/><circle cx="148" cy="214" r="9" fill="#d9a37c"/></symbol>';

  /* Lou Pennock, staff photographer: black curls, a green jacket with too many pockets, two cameras; in the light of the van */
  S += '<symbol id="fc-lou" viewBox="0 0 200 260"><rect width="200" height="260" fill="#1d2420"/><rect x="0" y="0" width="200" height="90" fill="#2c3630"/>' +
    '<g fill="#111"><circle cx="30" cy="40" r="14"/><circle cx="66" cy="40" r="10"/><rect x="120" y="28" width="60" height="24" rx="4"/></g><path d="M0 0L80 260H0Z" fill="#ffe6a8" opacity=".07"/>' +
    body('#3b4a3a') + '<path d="M84 178L100 220L116 178Z" fill="#d9d6c8"/><rect x="52" y="210" width="24" height="18" rx="2" fill="#2e3a2e"/><rect x="124" y="210" width="24" height="18" rx="2" fill="#2e3a2e"/>' +
    '<path d="M70 180L120 250" stroke="#111" stroke-width="5"/><rect x="104" y="222" width="40" height="28" rx="4" fill="#1b1d22"/><circle cx="124" cy="236" r="10" fill="#2a2d33"/><circle cx="124" cy="236" r="5" fill="#3a6a8a"/>' +
    head({ skin: '#b07a52', shade: '#93613e', glow: '#ffe6a8', glowL: 1 }) +
    (function () { var t = '', k; for (k = 0; k < 11; k++) t += '<circle cx="' + (58 + k * 8.4) + '" cy="' + (66 - Math.sin(k / 10 * Math.PI) * 18) + '" r="11" fill="#1b1512"/>'; return t + '<circle cx="56" cy="88" r="10" fill="#1b1512"/><circle cx="144" cy="88" r="10" fill="#1b1512"/><circle cx="54" cy="104" r="8" fill="#1b1512"/><circle cx="146" cy="104" r="8" fill="#1b1512"/>'; })() +
    '<path d="M72 99q10 -4 20 0M108 99q11 -4 21 0" stroke="#1b1512" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
    eyes({ eye: '#2a1d14', wide: 4.6, look: -1 }) + nose('#93613e') +
    '<path d="M86 144q14 9 28 0" stroke="#5a2a22" stroke-width="3.2" fill="none" stroke-linecap="round"/></symbol>';

  /* Gideon Platt, freelance: a beard, a flat cap, a large camera bag, and a telephone. Seen on the screen of the desk phone */
  S += '<symbol id="fc-platt" viewBox="0 0 200 260"><rect width="200" height="260" fill="#3a3530"/><rect x="0" y="0" width="200" height="120" fill="#4a443c"/><rect x="120" y="24" width="64" height="70" fill="#5a544a"/><path d="M128 32h48v54h-48z" fill="#8a9a7a" opacity=".5"/>' +
    body('#5a4a3a') + '<path d="M84 178L100 216L116 178Z" fill="#b9b2a2"/><path d="M60 196L150 252" stroke="#1d1d1d" stroke-width="8"/>' +
    head({ skin: '#e8c4a2', shade: '#c9a07c' }) +
    '<path d="M58 124Q58 172 100 176Q142 172 142 124Q130 150 100 150Q70 150 58 124Z" fill="#4a3a2a"/><path d="M84 140q16 -6 32 0q-16 6 -32 0z" fill="#4a3a2a"/>' +
    '<path d="M54 96Q54 52 102 52Q148 54 148 96Q126 86 100 86Q72 86 54 96Z" fill="#4a443c"/><path d="M50 96Q100 78 162 92L160 100Q100 88 52 104Z" fill="#3a352e"/>' +
    '<path d="M72 102q10 -3 20 1M108 101q11 -3 21 0" stroke="#3a2a1c" stroke-width="3.6" fill="none" stroke-linecap="round"/>' +
    eyes({ eye: '#2a1d14', wide: 4, look: 2 }) + nose('#c9a07c') + phone('R') + '</symbol>';

  /* Hamish Ure, the Teapot's pilot: seventy-one, bald, a white moustache like a yard brush, still wet to the knees */
  S += '<symbol id="fc-hamish" viewBox="0 0 200 260"><rect width="200" height="260" fill="#26344a"/><path d="M0 170Q60 150 120 166T200 160V260H0Z" fill="#c2301f" opacity=".5"/><g fill="#f4e6c8" opacity=".5"><circle cx="30" cy="190" r="8"/><circle cx="90" cy="176" r="8"/><circle cx="170" cy="182" r="8"/></g>' +
    body('#2f4f7a') + '<path d="M84 178L100 218L116 178Z" fill="#e8e2d2"/>' +
    head({ skin: '#efc9ae', shade: '#d4a888', glow: '#ffd88a' }) +
    '<path d="M58 118Q55 96 62 88Q62 104 65 120ZM142 118Q145 96 138 88Q138 104 135 120Z" fill="#f1efe9"/>' +
    '<path d="M72 98q10 -4 20 1M108 99q11 -5 21 -1" stroke="#e8e4dc" stroke-width="4.4" fill="none" stroke-linecap="round"/>' +
    eyes({ eye: '#3a5a7a', wide: 4.4, look: -1 }) + nose('#d4a888') +
    '<path d="M70 140Q100 124 130 140Q118 150 100 146Q82 150 70 140Z" fill="#f4f2ec"/><path d="M90 154q10 3 20 0" stroke="#8c4a3c" stroke-width="2.6" fill="none" stroke-linecap="round"/>' + phone('L') + '</symbol>';

  /* Esme Ure, fourteen, the Teapot's ground crew: a ponytail, a hi-vis vest that says CREW, her phone, and a grin */
  S += '<symbol id="fc-esme" viewBox="0 0 200 260"><rect width="200" height="260" fill="#1b2232"/><circle cx="160" cy="40" r="60" fill="#ffd88a" opacity=".15"/>' +
    body('#3a3f6b') + '<path d="M30 260Q32 214 60 200L84 182L100 210L116 182L140 200Q168 214 170 260Z" fill="#dfe62a"/><path d="M38 236h124" stroke="#d5dbdf" stroke-width="9"/>' +
    '<text x="100" y="226" font-family="Libre Franklin,sans-serif" font-weight="900" font-size="18" text-anchor="middle" fill="#2a2a1a" letter-spacing="2">CREW</text>' +
    head({ skin: '#f2d6c2', shade: '#d8b49c', wide: 38, long: 46 }) +
    '<path d="M60 108Q56 56 100 54Q144 56 140 108Q132 80 100 76Q70 80 60 108Z" fill="#6b4426"/><path d="M136 70Q170 80 160 148Q150 118 138 96Z" fill="#6b4426"/>' +
    '<path d="M74 99q9 -4 18 0M108 99q10 -4 18 0" stroke="#6b4426" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    eyes({ eye: '#3a6a5a', wide: 5 }) + nose('#d8b49c') +
    '<path d="M84 140q16 12 32 0" stroke="#7d3f34" stroke-width="3" fill="#fff" stroke-linecap="round"/><g fill="#e8a08a" opacity=".5"><circle cx="74" cy="132" r="6"/><circle cx="126" cy="132" r="6"/></g></symbol>';

  S += '</defs></svg>';
  window.CAST_SVG = S;
  window.FACE = function (who) {
    var bg = { kasia: '#0f1a26', hammond: '#2a2018', lorna: '#151a2e', lou: '#1d2420', platt: '#3a3530', hamish: '#26344a', esme: '#1b2232' }[who] || '#222';
    return '<svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMax meet" style="background:' + bg + '"><use href="#fc-' + who + '"/></svg>';
  };
})();
