/* The people of "So That You Are Sure", as busts of 200 x 260 without a background, so that the same drawing can stand
   in a scene (a witness box, a bench, a counter) and sit in the panel of an interview.
   FACE('ezra') gives the bust on its own colour, for ER.talk and for the cross-examination. */
(function () {
  function face(y, o) {          /* y: the middle of the head. brows, eyes, nose, mouth */
    var s = '<path d="M72 ' + (y - 9) + 'q11-' + (o.arch || 5) + ' 22 0M106 ' + (y - 9) + 'q11-' + (o.arch || 5) + ' 22 0" stroke="' + o.brow + '" stroke-width="' + (o.bw || 4) + '" fill="none" stroke-linecap="round"/>';
    s += '<ellipse cx="84" cy="' + (y + 6) + '" rx="6.500" ry="4.400" fill="#f7f1e6"/><ellipse cx="116" cy="' + (y + 6) + '" rx="6.500" ry="4.400" fill="#f7f1e6"/>';
    s += '<circle cx="85" cy="' + (y + 6) + '" r="3.200" fill="' + o.eye + '"/><circle cx="117" cy="' + (y + 6) + '" r="3.200" fill="' + o.eye + '"/><circle cx="86" cy="' + (y + 5) + '" r="1" fill="#fff"/><circle cx="118" cy="' + (y + 5) + '" r="1" fill="#fff"/>';
    s += '<path d="M100 ' + (y + 7) + 'q-6 15 0 19q5 2 8-2" stroke="' + o.shade + '" stroke-width="2.600" fill="none" stroke-linecap="round"/>';
    s += '<path d="M' + (o.mouth || ('88 ' + (y + 39) + 'q12 5 24-1')) + '" stroke="' + (o.lip || '#8a4a44') + '" stroke-width="3.200" fill="none" stroke-linecap="round"/>';
    return s;
  }
  /* a short court wig: a pale cap, three rolls of curls over each ear, and two little tails behind */
  function wig(y) {
    var s = '<path d="M70 ' + (y + 50) + 'l-6 24h12zM130 ' + (y + 50) + 'l6 24h-12z" fill="#d8d2c2" stroke="#a9a28e" stroke-width="1.500"/>';
    s += '<path d="M58 ' + (y + 6) + 'Q54 ' + (y - 46) + ' 100 ' + (y - 48) + 'Q146 ' + (y - 46) + ' 142 ' + (y + 6) + 'Q132 ' + (y - 24) + ' 100 ' + (y - 26) + 'Q68 ' + (y - 24) + ' 58 ' + (y + 6) + 'z" fill="#e9e4d6" stroke="#b5ae99" stroke-width="1.500"/>';
    s += '<g stroke="#b5ae99" stroke-width="1.400" fill="none"><path d="M70 ' + (y - 30) + 'q30-14 60 0M66 ' + (y - 20) + 'q34-14 68 0"/></g>';
    [0, 12, 24].forEach(function (d) {
      s += '<ellipse cx="57" cy="' + (y + 2 + d) + '" rx="11" ry="6.500" fill="#ece7da" stroke="#a9a28e" stroke-width="1.500"/><ellipse cx="143" cy="' + (y + 2 + d) + '" rx="11" ry="6.500" fill="#ece7da" stroke="#a9a28e" stroke-width="1.500"/>';
    });
    return s;
  }
  /* bands: two white tabs at the throat */
  var BANDS = '<path d="M91 182h8v40h-9zM101 182h8l1 40h-9z" fill="#fbfbf8" stroke="#c9ccd0" stroke-width="1"/>';
  var GROWN = 'M6 260Q8 206 46 192L82 178H118L154 192Q192 206 194 260Z';
  var P = {};

  /* Ezra Mallon, twenty-six, in the dock: a borrowed jacket a size too big, a green jumper, and hair that will not lie down */
  P.ezra = '<path d="' + GROWN + '" fill="#2c3a55"/><path d="M82 178L100 230L118 178Z" fill="#3e6b4a"/><path d="M84 180Q100 196 116 180" stroke="#2f5639" stroke-width="5" fill="none"/>' +
    '<path d="M82 178L58 212L92 246ZM118 178L142 212L108 246Z" fill="#35466a"/><path d="M40 222l20 4M160 222l-20 4" stroke="#24304a" stroke-width="3"/>' +
    '<rect x="89" y="150" width="22" height="34" fill="#e2b896"/><ellipse cx="61" cy="112" rx="7" ry="11" fill="#e2b896"/><ellipse cx="139" cy="112" rx="7" ry="11" fill="#e2b896"/>' +
    '<circle cx="62" cy="124" r="2.400" fill="#d9b25a"/>' +
    '<ellipse cx="100" cy="108" rx="38" ry="46" fill="#ecc6a6"/>' +
    '<g fill="#2a1d16"><circle cx="66" cy="84" r="13"/><circle cx="80" cy="70" r="14"/><circle cx="98" cy="64" r="15"/><circle cx="117" cy="68" r="14"/><circle cx="132" cy="80" r="13"/><circle cx="62" cy="98" r="8"/><circle cx="138" cy="96" r="8"/><circle cx="90" cy="76" r="11"/><circle cx="110" cy="76" r="11"/></g>' +
    '<g fill="#5a4436" opacity=".35"><circle cx="82" cy="140" r="1.200"/><circle cx="90" cy="144" r="1.200"/><circle cx="100" cy="146" r="1.200"/><circle cx="110" cy="144" r="1.200"/><circle cx="118" cy="140" r="1.200"/><circle cx="86" cy="136" r="1.100"/><circle cx="114" cy="136" r="1.100"/><circle cx="95" cy="150" r="1.100"/><circle cx="105" cy="150" r="1.100"/></g>' +
    face(108, { brow: '#2a1d16', eye: '#4a3a2a', shade: '#c08e6c', mouth: '89 146q11-2 22 1', lip: '#8a4a44', arch: 3 });

  /* Miss Imogen Blackwood, counsel for the defence: wig, gown, bands, and a pencil behind one ear */
  P.blackwood = '<path d="' + GROWN + '" fill="#141418"/><path d="M82 178L100 196L118 178Z" fill="#fbfbf8"/><path d="M46 192Q60 214 64 260M154 192Q140 214 136 260" stroke="#26262c" stroke-width="5" fill="none"/>' +
    '<path d="M70 196q8 30 4 64M130 196q-8 30-4 64" stroke="#2a2a30" stroke-width="3" fill="none"/>' + BANDS +
    '<rect x="89" y="150" width="22" height="34" fill="#c99870"/><ellipse cx="62" cy="112" rx="6" ry="10" fill="#c99870"/><ellipse cx="138" cy="112" rx="6" ry="10" fill="#c99870"/>' +
    '<path d="M64 112q-8 30 4 58q6-30 2-54zM136 112q8 30-4 58q-6-30-2-54z" fill="#2a1c16"/>' +
    '<ellipse cx="100" cy="110" rx="37" ry="45" fill="#d8a77c"/>' +
    wig(84) + '<path d="M136 92l18-26" stroke="#e8b923" stroke-width="5" stroke-linecap="round"/><path d="M154 66l3-5" stroke="#e9c9a4" stroke-width="5" stroke-linecap="round"/>' +
    face(110, { brow: '#2a1c16', eye: '#2b1c12', shade: '#a2764f', mouth: '88 148q12 3 24-1', lip: '#9a3a3a', arch: 4 });

  /* Mr Anselm Dewhurst, for the Crown: wig, gown, bands, half-moon glasses and a long patient face */
  P.dewhurst = '<path d="' + GROWN + '" fill="#141418"/><path d="M82 178L100 196L118 178Z" fill="#fbfbf8"/><path d="M46 192Q60 214 64 260M154 192Q140 214 136 260" stroke="#26262c" stroke-width="5" fill="none"/>' + BANDS +
    '<rect x="90" y="152" width="20" height="32" fill="#e3c2a0"/><ellipse cx="63" cy="110" rx="6" ry="11" fill="#e3c2a0"/><ellipse cx="137" cy="110" rx="6" ry="11" fill="#e3c2a0"/>' +
    '<ellipse cx="100" cy="110" rx="35" ry="50" fill="#eccfb2"/>' + wig(82) +
    face(110, { brow: '#7a6e62', eye: '#3a4a5c', shade: '#c29878', mouth: '90 152h20', lip: '#8a5a50' }) +
    '<path d="M74 120h20q-2 10-10 10t-10-10zM106 120h20q-2 10-10 10t-10-10z" fill="none" stroke="#6b6e75" stroke-width="2.200"/><path d="M94 122h12" stroke="#6b6e75" stroke-width="2"/>';

  /* Her Honour Judge Lennox: a short wig, a violet robe, and a sash */
  P.lennox = '<path d="' + GROWN + '" fill="#5b3f86"/><path d="M82 178L100 196L118 178Z" fill="#fbfbf8"/><path d="M40 200Q70 190 100 236L96 260H62Q52 220 40 200Z" fill="#b3262c"/><path d="M160 200q-20 30-30 60" stroke="#4a3270" stroke-width="4" fill="none"/>' + BANDS +
    '<rect x="89" y="150" width="22" height="34" fill="#e8c2a2"/><ellipse cx="62" cy="110" rx="6" ry="10" fill="#e8c2a2"/><ellipse cx="138" cy="110" rx="6" ry="10" fill="#e8c2a2"/>' +
    '<ellipse cx="100" cy="108" rx="37" ry="45" fill="#f1cfb2"/>' + wig(82) +
    face(108, { brow: '#8d8f92', eye: '#3a4a5c', shade: '#c59877', mouth: '89 146q11 3 22 0', lip: '#9a5348', arch: 6 }) +
    '<circle cx="84" cy="114" r="11" fill="none" stroke="#2b2a26" stroke-width="2.200"/><circle cx="116" cy="114" r="11" fill="none" stroke="#2b2a26" stroke-width="2.200"/><path d="M95 114h10" stroke="#2b2a26" stroke-width="2"/>';

  /* Mrs Gwendolen Askew, seventy-four: forty years a music teacher. A lavender cardigan, a brooch shaped like a treble clef, glasses on a chain */
  P.askew = '<path d="' + GROWN + '" fill="#9a87b8"/><path d="M82 178L100 214L118 178Z" fill="#f6f2e6"/><path d="M82 178L70 206L96 222ZM118 178L130 206L104 222Z" fill="#8a77a8"/>' +
    '<g fill="#f6f2e6"><circle cx="86" cy="186" r="3"/><circle cx="92" cy="192" r="3"/><circle cx="100" cy="194" r="3"/><circle cx="108" cy="192" r="3"/><circle cx="114" cy="186" r="3"/></g>' +
    '<path d="M138 214q-8-10-2-18q8 2 4 12q-6 12 2 22q4 6-2 8q-6-2-2-8" stroke="#d9b25a" stroke-width="3" fill="none"/>' +
    '<path d="M74 132q-2 40 20 56M126 132q2 40-20 56" stroke="#c9b37a" stroke-width="1.500" fill="none"/>' +
    '<rect x="90" y="152" width="20" height="30" fill="#e3c2a0"/><ellipse cx="63" cy="110" rx="6" ry="10" fill="#e3c2a0"/><ellipse cx="137" cy="110" rx="6" ry="10" fill="#e3c2a0"/>' +
    '<ellipse cx="100" cy="110" rx="36" ry="44" fill="#efd3bb"/>' +
    '<path d="M62 108Q56 62 100 60Q144 62 138 108Q132 80 100 78Q68 80 62 108Z" fill="#eeeeea"/><circle cx="100" cy="52" r="17" fill="#e6e6e2"/><path d="M86 52q14-8 28 0" stroke="#c9c9c4" stroke-width="2" fill="none"/>' +
    face(110, { brow: '#bdbdb8', eye: '#4a5a6c', shade: '#c29878', mouth: '89 148q11 4 22 0', lip: '#a05a60', arch: 6 }) +
    '<circle cx="84" cy="116" r="10" fill="none" stroke="#7a6a4a" stroke-width="2"/><circle cx="116" cy="116" r="10" fill="none" stroke="#7a6a4a" stroke-width="2"/><path d="M94 116h12" stroke="#7a6a4a" stroke-width="2"/>';

  /* Kostas Andreou, of Andreou's café: a striped apron, a tea towel on one shoulder, and a moustache that has opinions */
  P.kostas = '<path d="' + GROWN + '" fill="#f3f1ea"/><path d="M60 196h80l8 64H52z" fill="#3a5a8a"/><g stroke="#f3f1ea" stroke-width="4"><path d="M70 196v64M86 196v64M102 196v64M118 196v64M134 196v64"/></g>' +
    '<path d="M60 196Q100 174 140 196" stroke="#2a3f63" stroke-width="5" fill="none"/><path d="M132 186l30 8 10 40-26-6z" fill="#e8d9a8"/><path d="M140 196l24 6M144 210l22 6" stroke="#b3262c" stroke-width="2.500"/>' +
    '<rect x="88" y="150" width="24" height="34" fill="#c99870"/><ellipse cx="61" cy="112" rx="7" ry="11" fill="#c99870"/><ellipse cx="139" cy="112" rx="7" ry="11" fill="#c99870"/>' +
    '<ellipse cx="100" cy="110" rx="39" ry="46" fill="#d6a47a"/>' +
    '<path d="M61 112q-4-24 6-36q-2 20 2 38zM139 112q4-24-6-36q2 20-2 38z" fill="#9a9a96"/>' +
    face(108, { brow: '#5a5a56', eye: '#2b1c12', shade: '#a2764f', mouth: '90 150q10 3 20 0', lip: '#6a3a30', bw: 5 }) +
    '<path d="M78 138q22-12 44 0q-6 8-22 4q-16 4-22-4z" fill="#4a4a46"/>';

  /* Mr Clive Tunnicliffe, the usher: a black gown with no wig, a lanyard, and thirty years of telling people where to stand */
  P.tunnicliffe = '<path d="' + GROWN + '" fill="#1c1c22"/><path d="M82 178L100 220L118 178Z" fill="#dfe4ea"/><path d="M96 184h8l2 32h-12z" fill="#1f4a6a"/><path d="M80 184q20 60 40 0" stroke="#2f6a9a" stroke-width="3" fill="none"/>' +
    '<rect x="88" y="228" width="24" height="18" rx="2" fill="#fbfbf8"/><path d="M92 234h16M92 240h10" stroke="#1f4a6a" stroke-width="2"/>' +
    '<rect x="90" y="152" width="20" height="32" fill="#e3c2a0"/><ellipse cx="63" cy="110" rx="6" ry="11" fill="#e3c2a0"/><ellipse cx="137" cy="110" rx="6" ry="11" fill="#e3c2a0"/>' +
    '<ellipse cx="100" cy="110" rx="36" ry="46" fill="#eccfb2"/>' +
    '<path d="M64 100Q60 66 100 64Q140 66 136 100Q130 80 100 80Q70 80 64 100Z" fill="#a9abb0"/>' +
    face(110, { brow: '#8d8f92', eye: '#3a4a5c', shade: '#c29878', mouth: '90 150q10-2 20 0', lip: '#8a5a50' }) +
    '<rect x="73" y="108" width="22" height="15" rx="3" fill="none" stroke="#3a3a3a" stroke-width="2.200"/><rect x="105" y="108" width="22" height="15" rx="3" fill="none" stroke="#3a3a3a" stroke-width="2.200"/><path d="M95 114h10" stroke="#3a3a3a" stroke-width="2"/>';

  /* Mrs Kath Hindle, custody officer in the cells: a white shirt with black epaulettes, keys on a chain, hair pulled back hard */
  P.hindle = '<path d="' + GROWN + '" fill="#f4f4f0"/><path d="M82 178L100 206L118 178Z" fill="#f4f4f0" stroke="#c9ccd0"/><path d="M96 184h8l3 44h-14z" fill="#1c1c22"/>' +
    '<path d="M40 196l34-8 2 10-34 8zM160 196l-34-8-2 10 34 8z" fill="#1c1c22"/><path d="M48 198h18M134 198h18" stroke="#d9b25a" stroke-width="2"/>' +
    '<path d="M126 224q10 10 6 30" stroke="#8d9097" stroke-width="3" fill="none" stroke-dasharray="4 3"/><circle cx="131" cy="254" r="5" fill="none" stroke="#8d9097" stroke-width="3"/>' +
    '<rect x="89" y="150" width="22" height="34" fill="#e8c2a2"/><ellipse cx="62" cy="110" rx="6" ry="10" fill="#e8c2a2"/><ellipse cx="138" cy="110" rx="6" ry="10" fill="#e8c2a2"/>' +
    '<ellipse cx="100" cy="110" rx="37" ry="45" fill="#f1cfb2"/>' +
    '<path d="M62 104Q58 62 100 60Q142 62 138 104Q130 74 100 72Q70 74 62 104Z" fill="#8f5a2a"/><ellipse cx="100" cy="58" rx="16" ry="9" fill="#7a4a22"/>' +
    face(110, { brow: '#7a4a22', eye: '#3b5a3a', shade: '#c59877', mouth: '90 148h20', lip: '#9a5348' });

  /* Ms Anjali Desai, the clerk of Court 2: a black gown, her hair in a knot, and the court's papers in a blue folder */
  P.desai = '<path d="' + GROWN + '" fill="#1c1c22"/><path d="M82 178L100 206L118 178Z" fill="#f4f4f0"/><path d="M46 192Q60 214 64 260M154 192Q140 214 136 260" stroke="#2a2a30" stroke-width="5" fill="none"/>' +
    '<rect x="70" y="222" width="60" height="40" fill="#2f4a6a"/><path d="M76 232h48" stroke="#9fc3d8" stroke-width="3"/>' +
    '<rect x="89" y="150" width="22" height="34" fill="#a2764f"/><ellipse cx="62" cy="110" rx="6" ry="10" fill="#a2764f"/><ellipse cx="138" cy="110" rx="6" ry="10" fill="#a2764f"/>' +
    '<ellipse cx="100" cy="110" rx="37" ry="45" fill="#b98560"/>' +
    '<path d="M62 106Q58 62 100 60Q142 62 138 106Q130 76 100 74Q70 76 62 106Z" fill="#1d1410"/><circle cx="100" cy="54" r="15" fill="#1d1410"/>' +
    face(110, { brow: '#1d1410', eye: '#22160f', shade: '#8a5e3c', mouth: '90 148q10 3 20 0', lip: '#6a3a30' }) +
    '<rect x="72" y="108" width="24" height="16" rx="7" fill="none" stroke="#5a4a3a" stroke-width="2"/><rect x="104" y="108" width="24" height="16" rx="7" fill="none" stroke="#5a4a3a" stroke-width="2"/><path d="M96 114h8" stroke="#5a4a3a" stroke-width="2"/>';

  var s = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>', k;
  for (k in P) s += '<symbol id="ch-' + k + '" viewBox="0 0 200 260">' + P[k] + '</symbol>';
  window.CAST_SVG = s + '</defs></svg>';
  var BG = { ezra: '#3a4636', blackwood: '#2e2a3a', dewhurst: '#3a3430', lennox: '#3a2a4a', askew: '#4a4058', kostas: '#3f3a2e', tunnicliffe: '#2f3a44', hindle: '#36404a', desai: '#2e3440' };
  window.FACE = function (id) {
    return '<svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMax meet" style="background:' + (BG[id] || '#2a3038') + '"><use href="#ch-' + id + '"/></svg>';
  };
})();
