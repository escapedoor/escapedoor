/* The people of "Past the Lion", as busts of 200 x 260.
   FACE('kemble' | 'twins' | 'oduya' | 'bexley' | 'goodchild' | 'fairbrass' | 'sanghera') gives the picture for an interview. */
(function () {
  var FACE_PATH = 'M61 98Q60 60 100 58Q140 60 139 98Q142 134 119 152Q100 160 81 152Q58 134 61 98Z';
  var BODY = 'M2 260Q4 204 44 190L84 174H116L156 190Q196 204 198 260Z';
  function head(skin, shade) {
    return '<rect x="88" y="142" width="24" height="40" fill="' + shade + '"/><ellipse cx="59" cy="112" rx="6" ry="10" fill="' + shade + '"/><ellipse cx="141" cy="112" rx="6" ry="10" fill="' + shade + '"/><path d="' + FACE_PATH + '" fill="' + skin + '"/>';
  }
  function eyes(iris, lid) {
    return '<ellipse cx="82" cy="114" rx="6.200" ry="4.400" fill="#f7f1e6"/><ellipse cx="118" cy="114" rx="6.200" ry="4.400" fill="#f7f1e6"/><circle cx="83" cy="114" r="3.100" fill="' + iris + '"/><circle cx="119" cy="114" r="3.100" fill="' + iris + '"/>' +
      '<circle cx="84" cy="113" r="1" fill="#fff"/><circle cx="120" cy="113" r="1" fill="#fff"/><path d="M74 110q8 -4 16 0M110 110q8 -4 16 0" stroke="' + lid + '" stroke-width="2.400" fill="none"/>';
  }
  function nose(col) { return '<path d="M101 112q-8 18 -2 24q7 2 9 -3" stroke="' + col + '" stroke-width="2.800" fill="none" stroke-linecap="round"/>'; }
  function sym(id, inner) { return '<symbol id="ch-' + id + '" viewBox="0 0 200 260">' + inner + '</symbol>'; }
  var SKY = '<rect width="200" height="260" fill="#8cc4ec"/><ellipse cx="150" cy="40" rx="50" ry="13" fill="#fff" opacity=".8"/>';
  var YEW = '<rect width="200" height="260" fill="#2f5d2b"/><g fill="#234a23"><ellipse cx="30" cy="40" rx="16" ry="7"/><ellipse cx="150" cy="70" rx="18" ry="7"/><ellipse cx="40" cy="150" rx="15" ry="6"/><ellipse cx="170" cy="190" rx="16" ry="7"/><ellipse cx="96" cy="22" rx="14" ry="6"/></g><g fill="#4a8a3f"><ellipse cx="70" cy="60" rx="10" ry="4"/><ellipse cx="170" cy="30" rx="10" ry="4"/><ellipse cx="20" cy="100" rx="10" ry="4"/><ellipse cx="180" cy="130" rx="9" ry="4"/></g>';
  var TENT = '<rect width="200" height="260" fill="#f3ead2"/><g stroke="#e3d6b4" stroke-width="10"><path d="M30 0v260M100 0v260M170 0v260"/></g><circle cx="186" cy="30" r="80" fill="#fff8d8" opacity=".5"/>';
  var BUNT = '<path d="M0 26q100 30 200 6" fill="none" stroke="#6b5a3c" stroke-width="1.500"/><path d="M18 31l16 3 -6 20z" fill="#c9453a"/><path d="M62 42l16 1 -8 20z" fill="#f2c14e"/><path d="M110 44l16 -2 -5 21z" fill="#2f6aa8"/><path d="M156 36l16 -3 -4 21z" fill="#3f8a4e"/>';

  window.CAST_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>' +

  /* Mrs Kemble, who runs the committee and the tea tent: auburn hair, a pencil behind one ear, an apron with strawberries on it */
  sym('kemble', SKY + BUNT +
    '<path d="' + BODY + '" fill="#3f7f8f"/><path d="M70 196h60v64h-60z" fill="#fbfaf2"/><path d="M72 198l-10 -20M128 198l10 -20" stroke="#fbfaf2" stroke-width="7"/>' +
    '<g fill="#d23b2e"><circle cx="86" cy="214" r="5"/><circle cx="112" cy="226" r="5"/><circle cx="92" cy="244" r="5"/><circle cx="120" cy="250" r="5"/></g><g fill="#3f8a4e"><path d="M83 208h6l-3 4z"/><path d="M109 220h6l-3 4z"/><path d="M89 238h6l-3 4z"/></g>' +
    head('#ecc7a8', '#d9b08c') +
    '<path d="M54 128Q42 44 100 38Q158 44 146 128Q150 96 132 76Q100 90 62 84Q52 100 54 128Z" fill="#a8532a"/><path d="M54 120q-6 20 6 34M146 120q6 20 -6 34" stroke="#a8532a" stroke-width="9" fill="none" stroke-linecap="round"/>' +
    '<path d="M138 96l24 -30" stroke="#f2c14e" stroke-width="5" stroke-linecap="round"/><path d="M160 68l4 -6" stroke="#2a2228" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M70 102q10 -8 21 -4M109 98q11 -4 21 4" stroke="#7a3a1c" stroke-width="3.200" fill="none" stroke-linecap="round"/>' + eyes('#3a5a4a', '#3a2a1a') + nose('#c99a78') +
    '<path d="M86 142q14 10 28 0" stroke="#a3392e" stroke-width="3.200" fill="none" stroke-linecap="round"/><ellipse cx="72" cy="130" rx="8" ry="5" fill="#e59a8a" opacity=".4"/><ellipse cx="128" cy="130" rx="8" ry="5" fill="#e59a8a" opacity=".4"/>') +

  /* Bea and Gus Trevithick, ten: grass on their knees and cake on their faces */
  sym('twins', '<rect width="200" height="260" fill="#6fae5a"/><path d="M0 0h200v120H0z" fill="#2f5d2b"/><path d="M0 120h200" stroke="#234a23" stroke-width="6"/><g stroke="#5c9a4a" stroke-width="3"><path d="M20 250l4 -18M60 256l-3 -16M150 252l4 -18M186 256l-2 -14"/></g>' +
    '<g transform="translate(-30 64) scale(.82)"><path d="' + BODY + '" fill="#d9573a"/>' + head('#ecc7a8', '#d9b08c') +
    '<path d="M56 110Q48 46 100 42Q152 46 144 110Q140 76 100 72Q60 76 56 110Z" fill="#c98a3a"/><path d="M58 100q-18 6 -14 40M142 100q18 6 14 40" stroke="#c98a3a" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="44" cy="140" r="5" fill="#d23b2e"/><circle cx="156" cy="140" r="5" fill="#d23b2e"/>' +
    eyes('#4a6a8a', '#3a2a1a') + nose('#c99a78') + '<path d="M84 140q16 14 32 0q-16 5 -32 0z" fill="#f7f1e6" stroke="#8a4a3c" stroke-width="2.400"/><g fill="#b9794a" opacity=".6"><circle cx="72" cy="126" r="1.600"/><circle cx="78" cy="131" r="1.600"/><circle cx="124" cy="127" r="1.600"/><circle cx="130" cy="131" r="1.600"/></g></g>' +
    '<g transform="translate(66 76) scale(.82)"><path d="' + BODY + '" fill="#3f8a4e"/>' + head('#ecc7a8', '#d9b08c') +
    '<path d="M56 104Q50 44 100 40Q150 44 144 104Q136 70 100 74Q70 62 56 104Z" fill="#c98a3a"/>' +
    eyes('#4a6a8a', '#3a2a1a') + nose('#c99a78') + '<path d="M88 144q12 4 24 -2" stroke="#8a4a3c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M120 148q6 2 8 -4" stroke="#7a4a2a" stroke-width="4" fill="none" stroke-linecap="round"/><g fill="#b9794a" opacity=".6"><circle cx="72" cy="126" r="1.600"/><circle cx="78" cy="131" r="1.600"/><circle cx="124" cy="127" r="1.600"/></g></g>') +

  /* Miss Oduya of the Parish News: seventeen, braids with yellow beads, and a camera nearly as big as her head */
  sym('oduya', YEW +
    '<path d="' + BODY + '" fill="#f2c14e"/><path d="M68 190l22 70M132 190l-22 70" stroke="#17181c" stroke-width="5"/>' +
    '<rect x="62" y="218" width="76" height="42" rx="6" fill="#17181c"/><circle cx="100" cy="244" r="20" fill="#3a3c45" stroke="#6f7480" stroke-width="4"/><circle cx="100" cy="244" r="10" fill="#8fb4d9"/><circle cx="96" cy="240" r="3" fill="#fff" opacity=".8"/>' +
    head('#6b4423', '#5a3a1f') +
    '<path d="M56 106Q50 46 100 42Q150 46 144 106Q138 74 100 72Q62 74 56 106Z" fill="#15100c"/>' +
    '<g stroke="#15100c" stroke-width="8" stroke-linecap="round"><path d="M56 100v60M66 78v20M144 100v60M46 110v40M154 110v40"/></g><g fill="#f2c14e"><circle cx="56" cy="164" r="5"/><circle cx="144" cy="164" r="5"/><circle cx="46" cy="154" r="5"/><circle cx="154" cy="154" r="5"/></g>' +
    '<path d="M70 102q10 -6 21 -3M109 99q11 -3 21 3" stroke="#15100c" stroke-width="3.400" fill="none" stroke-linecap="round"/>' + eyes('#2a1a0c', '#15100c') + nose('#462b15') +
    '<path d="M84 140q16 14 32 0q-16 4 -32 0z" fill="#f7f1e6" stroke="#3a1f12" stroke-width="2.400" stroke-linejoin="round"/>') +

  /* Mr Bexley, the auctioneer: six foot five, a panama hat, and the look of a man who has been kept waiting */
  sym('bexley', SKY +
    '<path d="' + BODY + '" fill="#efe6cf"/><path d="M84 176L100 214L116 176Z" fill="#fbfaf2"/><path d="M96 190h8l3 40 -7 8 -7 -8z" fill="#2e3a4d"/><path d="M64 184l36 60 36 -60 -12 -6 -24 36 -24 -36z" fill="#e3d8bd"/>' +
    '<rect x="89" y="148" width="22" height="30" fill="#d9b393"/><ellipse cx="62" cy="112" rx="6" ry="11" fill="#d9b393"/><ellipse cx="138" cy="112" rx="6" ry="11" fill="#d9b393"/>' +
    '<path d="M64 96Q63 56 100 54Q137 56 136 96Q140 142 118 162Q100 172 82 162Q60 142 64 96Z" fill="#eac3a4"/>' +
    '<path d="M60 78q-4 -44 12 -50q28 -10 56 0q16 6 12 50z" fill="#f4efdf"/><path d="M60 70h80v12h-80z" fill="#2e3a4d"/><ellipse cx="100" cy="82" rx="66" ry="11" fill="#ebe5d2"/><path d="M40 84q60 14 120 0" stroke="#d6cfba" stroke-width="2" fill="none"/>' +
    '<path d="M70 104q10 -9 22 -3M108 101q12 -6 22 3" stroke="#6b5a4a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="82" cy="116" rx="6" ry="3.400" fill="#f7f1e6"/><ellipse cx="118" cy="116" rx="6" ry="3.400" fill="#f7f1e6"/><circle cx="82" cy="117" r="2.800" fill="#3a4a5a"/><circle cx="118" cy="117" r="2.800" fill="#3a4a5a"/><path d="M74 113h16M110 113h16" stroke="#8a6a55" stroke-width="2.400"/>' +
    '<path d="M101 112q-9 28 -3 34q8 3 11 -3" stroke="#c49a78" stroke-width="2.800" fill="none" stroke-linecap="round"/><path d="M86 152q14 -6 28 0" stroke="#6b5a4a" stroke-width="3.600" fill="none" stroke-linecap="round"/><path d="M92 160h16" stroke="#8a4a3c" stroke-width="2.600"/>') +

  /* Mr Goodchild, head gardener: a straw hat that has been sat on, white whiskers, and a green waistcoat */
  sym('goodchild', YEW +
    '<path d="' + BODY + '" fill="#e9e2cf"/><path d="M52 192l48 68 48 -68v68H52z" fill="#4f6b3a"/><path d="M100 258v-30" stroke="#35502a" stroke-width="3"/><circle cx="100" cy="246" r="4" fill="#d9c16a"/><path d="M86 176L100 200L114 176Z" fill="#d3c9ad"/>' +
    head('#d9a184', '#c98f76') +
    '<path d="M54 92q-5 26 6 44l8 -40zM146 92q5 26 -6 44l-8 -40z" fill="#eceff1"/>' +
    '<path d="M58 86q-2 -40 42 -42t42 42z" fill="#cfb26a"/><ellipse cx="100" cy="86" rx="68" ry="11" fill="#bfa35c"/><path d="M58 80h84" stroke="#6b5a3c" stroke-width="5"/><path d="M150 82l18 -8 4 10" fill="none" stroke="#bfa35c" stroke-width="4"/><path d="M76 52l10 14M118 48l-6 16" stroke="#a88f4a" stroke-width="2"/>' +
    '<path d="M68 104q11 -7 23 -2M109 102q12 -5 23 2" stroke="#f4f6f7" stroke-width="5.500" fill="none" stroke-linecap="round"/><circle cx="82" cy="116" r="3.400" fill="#2a3a2a"/><circle cx="118" cy="116" r="3.400" fill="#2a3a2a"/>' +
    '<path d="M68 121q4 4 9 3M132 121q-4 4 -9 3" stroke="#b97c64" stroke-width="1.800" fill="none"/><path d="M100 112q-10 20 -3 27q9 3 12 -3" stroke="#b97c64" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M72 146q28 -16 56 0q-6 12 -28 6q-22 6 -28 -6z" fill="#f4f6f7"/><ellipse cx="72" cy="130" rx="8" ry="5" fill="#d9705a" opacity=".35"/><ellipse cx="128" cy="130" rx="8" ry="5" fill="#d9705a" opacity=".35"/>') +

  /* Miss Fairbrass, thirty years headmistress of Little Hays School: white hair, spectacles on a chain, pearls */
  sym('fairbrass', TENT + BUNT +
    '<path d="' + BODY + '" fill="#7f8fc0"/><path d="M84 176L100 206L116 176Z" fill="#fbfaf2"/><path d="M66 188q34 40 34 72M134 188q-34 40 -34 72" stroke="#6a7ab0" stroke-width="12" fill="none"/>' +
    '<g fill="#f7f4ea" stroke="#d6cfba" stroke-width="1"><circle cx="80" cy="186" r="4.500"/><circle cx="89" cy="191" r="4.500"/><circle cx="100" cy="193" r="4.500"/><circle cx="111" cy="191" r="4.500"/><circle cx="120" cy="186" r="4.500"/></g>' +
    head('#ecc7a8', '#d9b08c') +
    '<circle cx="100" cy="34" r="17" fill="#f1f3f5"/><path d="M90 32q10 -8 20 0" stroke="#c9ced3" stroke-width="2" fill="none"/>' +
    '<path d="M56 106Q48 46 100 42Q152 46 144 106Q138 74 100 70Q62 74 56 106Z" fill="#f1f3f5"/><path d="M70 60q30 -14 60 0" stroke="#c9ced3" stroke-width="2" fill="none"/>' +
    '<path d="M69 100q11 -9 22 -2M109 98q11 -7 22 2" stroke="#8d9299" stroke-width="3" fill="none" stroke-linecap="round"/>' + eyes('#3a5a7a', '#3a3040') +
    '<g fill="none" stroke="#3a3c45" stroke-width="2.600"><ellipse cx="82" cy="115" rx="13" ry="10"/><ellipse cx="118" cy="115" rx="13" ry="10"/><path d="M95 114h10"/></g><path d="M69 118q-12 30 4 60M131 118q12 30 -4 60" stroke="#d9c16a" stroke-width="1.600" fill="none"/>' +
    nose('#c9a084') + '<path d="M88 146h24" stroke="#8a3a3c" stroke-width="3.200" stroke-linecap="round"/><path d="M76 134q-2 8 2 13M124 134q2 8 -2 13" stroke="#c9a084" stroke-width="1.800" fill="none"/>') +

  /* Dr Sanghera, forty years the village doctor: a navy turban, a white beard, a blazer */
  sym('sanghera', TENT +
    '<path d="' + BODY + '" fill="#27365a"/><path d="M84 176L100 214L116 176Z" fill="#fbfaf2"/><path d="M96 190h8l3 40 -7 8 -7 -8z" fill="#8c2f24"/><path d="M64 184l36 60 36 -60 -12 -6 -24 36 -24 -36z" fill="#1f2c4a"/>' +
    head('#b8875a', '#a87448') +
    '<path d="M60 150q-6 -30 0 -44q40 26 80 0q6 14 0 44q-14 30 -40 30t-40 -30z" fill="#f1efe8"/><path d="M84 142q16 -8 32 0q-16 12 -32 0z" fill="#b8875a"/><path d="M90 146h20" stroke="#7a4a3c" stroke-width="2.600"/>' +
    '<path d="M52 104Q40 34 100 28Q160 34 148 104Q130 70 100 70Q70 70 52 104Z" fill="#2f4f8f"/><path d="M58 84q42 -40 84 0M70 60q30 -22 60 0M100 30v40" stroke="#3f63ad" stroke-width="3" fill="none"/><path d="M92 70l8 -14 8 14z" fill="#8c2f24"/>' +
    '<path d="M70 102q10 -6 21 -3M109 99q11 -3 21 3" stroke="#f1efe8" stroke-width="4" fill="none" stroke-linecap="round"/>' + eyes('#2a1a0c', '#3a2a1a') +
    '<g fill="none" stroke="#6b5a3c" stroke-width="2.200"><rect x="70" y="106" width="24" height="16" rx="5"/><rect x="106" y="106" width="24" height="16" rx="5"/><path d="M94 113h12"/></g>' + nose('#8f6238')) +

  '</defs></svg>';

  var BG = { kemble: '#8cc4ec', twins: '#6fae5a', oduya: '#2f5d2b', bexley: '#8cc4ec', goodchild: '#2f5d2b', fairbrass: '#f3ead2', sanghera: '#f3ead2' };
  window.FACE = function (who) {
    return '<svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMax meet" style="background:' + (BG[who] || '#222') + '"><use href="#ch-' + who + '"/></svg>';
  };
})();
