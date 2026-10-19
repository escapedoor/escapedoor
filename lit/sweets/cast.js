/* The people of "Miss Plunkett's Last Recipe", as busts of 200 x 260.
   FACE('gribble' | 'mortlake' | 'huxtable' | 'tuttle' | 'plunkett') gives the picture for an interview. */
(function () {
  var K = ' stroke="#2a1a24" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  function sym(id, bg, body) { return '<symbol id="ch-' + id + '" viewBox="0 0 200 260"><rect width="200" height="260" fill="' + bg + '"/>' + body + '</symbol>'; }
  window.CAST_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>' +

  /* Mr Norbert Gribble: long and grey, a bowler hat, a pencil behind each ear, a clipboard held like a shield */
  sym('gribble', '#c9d3d6',
    '<g fill="#b4c0c4"><rect x="12" y="20" width="40" height="56"/><rect x="148" y="30" width="40" height="56"/></g>' +
    '<path d="M10 260q4 -58 46 -70l30 -8h28l30 8q42 12 46 70z" fill="#80858f"' + K + '/><path d="M84 184l16 50 16 -50z" fill="#f4f2ec"/><path d="M96 196l4 -8 4 8 -4 46z" fill="#8a2a3a"/>' +
    '<path d="M84 184l-20 30 26 40M116 184l20 30 -26 40" fill="none"' + K + '/>' +
    '<g transform="rotate(-10 60 230)"><rect x="22" y="206" width="70" height="60" rx="4" fill="#a8774a"' + K + '/><rect x="28" y="214" width="58" height="52" fill="#fdfbf2"/><path d="M34 226h44M34 236h40M34 246h44" stroke="#6a6a7a" stroke-width="2"/></g>' +
    '<rect x="88" y="150" width="24" height="36" fill="#e3bd98"/>' +
    '<ellipse cx="100" cy="112" rx="38" ry="50" fill="#f0cfae"' + K + '/><path d="M62 112q-12 -4 -11 12q2 10 12 8M138 112q12 -4 11 12q-2 10 -12 8" fill="#f0cfae"' + K + '/>' +
    '<path d="M56 112l-16 -44M144 112l16 -44" stroke="#e7b829" stroke-width="6" stroke-linecap="round"/><path d="M40 68l-3 -8M160 68l3 -8" stroke="#3a3a3a" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M76 104h16M108 104h16" stroke="#2a1a24" stroke-width="3.4" stroke-linecap="round"/><circle cx="84" cy="112" r="3.6" fill="#2a1a24"/><circle cx="116" cy="112" r="3.6" fill="#2a1a24"/>' +
    '<path d="M100 112q8 26 -5 30" fill="none"' + K + '/><path d="M86 146h28" stroke="#2a1a24" stroke-width="3" stroke-linecap="round"/><path d="M84 138q16 -4 32 0" fill="none" stroke="#9a8a7a" stroke-width="3"/>' +
    '<ellipse cx="100" cy="68" rx="58" ry="10" fill="#1e1e22"/><path d="M62 68q0 -58 38 -58t38 58z" fill="#26262b"/><path d="M62 58h76" stroke="#4a3a2a" stroke-width="5"/>') +

  /* Mrs Venetia Mortlake: hair the height of a chimney, sunglasses at night, pink and pearls */
  sym('mortlake', '#f7d6e2',
    '<g fill="#fbe6ee"><circle cx="30" cy="40" r="14"/><circle cx="172" cy="60" r="18"/><circle cx="160" cy="20" r="8"/></g>' +
    '<path d="M8 260q4 -60 52 -74l40 -6 40 6q48 14 52 74z" fill="#e0447f"' + K + '/>' +
    '<path d="M40 200q60 -40 120 0q-10 30 -60 30t-60 -30z" fill="#f6eedc"' + K + '/>' +
    '<g fill="#fffaf0" stroke="#c8b89a" stroke-width="1.5"><circle cx="76" cy="196" r="6"/><circle cx="88" cy="200" r="6"/><circle cx="100" cy="202" r="6"/><circle cx="112" cy="200" r="6"/><circle cx="124" cy="196" r="6"/></g>' +
    '<rect x="88" y="150" width="24" height="34" fill="#e8b898"/>' +
    '<path d="M56 130q-50 -50 -14 -100q24 -36 58 -32q34 -4 58 32q36 50 -14 100q8 -40 -10 -60q-34 14 -68 0q-18 20 -10 60z" fill="#f4d47a"' + K + '/>' +
    '<ellipse cx="100" cy="122" rx="34" ry="42" fill="#f0c7a8"' + K + '/>' +
    '<path d="M70 90q30 -26 60 0q-30 -10 -60 0z" fill="#f4d47a"/>' +
    '<path d="M68 106h26v16h-26zM106 106h26v16h-26z" fill="#1c1c22" stroke="#c9a23a" stroke-width="2"/><path d="M94 112h12" stroke="#c9a23a" stroke-width="3"/><path d="M72 110l8 -2" stroke="#fff" stroke-width="2" opacity=".6"/>' +
    '<path d="M100 120q5 12 -2 16" fill="none" stroke="#b4806a" stroke-width="2.6"/>' +
    '<path d="M86 146q14 9 28 0q-14 -5 -28 0z" fill="#d1103e" stroke="#9a0c2e" stroke-width="2"/><circle cx="74" cy="136" r="7" fill="#ff8aa8" opacity=".55"/><circle cx="126" cy="136" r="7" fill="#ff8aa8" opacity=".55"/>' +
    '<circle cx="64" cy="132" r="5" fill="#fffaf0" stroke="#c8b89a"/><circle cx="136" cy="132" r="5" fill="#fffaf0" stroke="#c8b89a"/>') +

  /* Mr Cuthbert Huxtable: round, bald, a pince-nez, a waistcoat with eleven pockets, a purse held tight */
  sym('huxtable', '#d9e3c8',
    '<g fill="#c8d6b2"><rect x="20" y="30" width="30" height="30" rx="4"/><rect x="150" y="40" width="30" height="30" rx="4"/></g>' +
    '<path d="M0 260q4 -70 60 -80h80q56 10 60 80z" fill="#3f6a4a"' + K + '/><path d="M62 180h76q10 40 0 80h-76q-10 -40 0 -80z" fill="#b0823a"' + K + '/>' +
    '<g fill="#8a6228" stroke="#5a3e14" stroke-width="2"><rect x="70" y="200" width="22" height="16" rx="2"/><rect x="108" y="200" width="22" height="16" rx="2"/><rect x="70" y="232" width="22" height="16" rx="2"/><rect x="108" y="232" width="22" height="16" rx="2"/></g>' +
    '<path d="M76 222q24 18 48 0" fill="none" stroke="#e8c860" stroke-width="3"/><circle cx="124" cy="222" r="5" fill="#e8c860"/>' +
    '<rect x="86" y="156" width="28" height="28" fill="#e2b48e"/>' +
    '<ellipse cx="100" cy="118" rx="48" ry="46" fill="#f2c8a4"' + K + '/>' +
    '<path d="M52 120q-14 -16 -4 -36q8 14 10 34zM148 120q14 -16 4 -36q-8 14 -10 34z" fill="#e8e4dc"/><path d="M80 74q20 -6 40 0" fill="none" stroke="#fff" stroke-width="4" opacity=".5"/>' +
    '<circle cx="82" cy="116" r="13" fill="#fff" fill-opacity=".35" stroke="#2a1a24" stroke-width="3"/><circle cx="118" cy="116" r="13" fill="#fff" fill-opacity=".35" stroke="#2a1a24" stroke-width="3"/><path d="M95 116h10M131 116q16 10 18 30" fill="none" stroke="#2a1a24" stroke-width="2.4"/>' +
    '<circle cx="82" cy="116" r="3.6" fill="#2a1a24"/><circle cx="118" cy="116" r="3.6" fill="#2a1a24"/><path d="M72 98q10 -6 18 0M110 98q10 -6 18 0" fill="none" stroke="#2a1a24" stroke-width="3"/>' +
    '<circle cx="100" cy="134" r="6" fill="#e8a888"/><path d="M88 150q12 -5 24 0" fill="none"' + K + '/>') +

  /* Mr Rex Tuttle: very large, very loud, orange and green checks, a moustache like handlebars */
  sym('tuttle', '#f6dcc0',
    '<g fill="#f0cba6"><rect x="10" y="50" width="20" height="120"/><rect x="170" y="40" width="20" height="130"/></g>' +
    '<path d="M-6 260q2 -70 64 -82h84q62 12 64 82z" fill="#e0843a"' + K + '/>' +
    '<path d="M20 260l12 -70M60 260l6 -82M100 260v-80M140 260l-6 -82M180 260l-12 -70M0 220h200M10 196h180" fill="none" stroke="#3e7a3a" stroke-width="3"/>' +
    '<path d="M82 178l18 40 18 -40z" fill="#fff"/><path d="M90 186q10 8 20 0l-10 14z" fill="#d61e2a"/>' +
    '<rect x="84" y="156" width="32" height="26" fill="#d97a64"/>' +
    '<ellipse cx="100" cy="118" rx="54" ry="52" fill="#e8907a"' + K + '/>' +
    '<path d="M44 104q2 -64 56 -66q60 2 58 66q-58 -16 -114 0z" fill="#6a7a3a"' + K + '/><path d="M42 104q-2 10 8 10h100q10 0 8 -12" fill="#4a5a2a"' + K + '/>' +
    '<circle cx="80" cy="124" r="5" fill="#2a1a24"/><circle cx="120" cy="124" r="5" fill="#2a1a24"/><path d="M68 112q12 -8 24 0M108 112q12 -8 24 0" fill="none" stroke="#2a1a24" stroke-width="4"/>' +
    '<ellipse cx="100" cy="142" rx="13" ry="10" fill="#d06a5a"' + K + '/>' +
    '<path d="M98 154q-30 -10 -58 10q-10 -16 10 -24q24 -8 48 4zM102 154q30 -10 58 10q10 -16 -10 -24q-24 -8 -48 4z" fill="#4a2a14"/>' +
    '<path d="M80 164q20 18 40 0q-20 6 -40 0z" fill="#7a1a1a"/>') +

  /* Miss Ottoline Plunkett: ninety-three, tiny, spectacles like the bottoms of jam jars, a green hat with a bobble */
  sym('plunkett', '#efe0f4',
    '<g fill="#e4cdee"><circle cx="26" cy="200" r="16"/><circle cx="178" cy="190" r="12"/><circle cx="170" cy="40" r="10"/></g>' +
    '<path d="M14 260q6 -58 50 -70l36 -6 36 6q44 12 50 70z" fill="#7a3f9a"' + K + '/>' +
    '<path d="M40 226h30v26h-30zM130 226h30v26h-30z" fill="#5a2a7a"/><circle cx="52" cy="232" r="7" fill="#ff5a8a"/><circle cx="62" cy="236" r="6" fill="#f2c040"/><circle cx="146" cy="232" r="7" fill="#7ad0c0"/>' +
    '<path d="M86 186l14 22 14 -22" fill="#f4f0ea"/>' +
    '<rect x="88" y="160" width="24" height="28" fill="#e8c4a8"/>' +
    '<ellipse cx="100" cy="128" rx="40" ry="44" fill="#f0d0b6"' + K + '/>' +
    '<path d="M60 124q-4 -40 40 -42q44 2 40 42q-14 -22 -40 -22t-40 22z" fill="#f4f0ea"' + K + '/>' +
    '<circle cx="80" cy="126" r="17" fill="#fff" fill-opacity=".55" stroke="#2a1a24" stroke-width="4"/><circle cx="120" cy="126" r="17" fill="#fff" fill-opacity=".55" stroke="#2a1a24" stroke-width="4"/><path d="M97 126h6" stroke="#2a1a24" stroke-width="4"/>' +
    '<circle cx="80" cy="126" r="6" fill="#4a2a5a"/><circle cx="120" cy="126" r="6" fill="#4a2a5a"/><circle cx="82" cy="123" r="2" fill="#fff"/><circle cx="122" cy="123" r="2" fill="#fff"/>' +
    '<path d="M100 134q5 10 -3 14" fill="none" stroke="#c39a80" stroke-width="2.6"/><path d="M84 154q16 12 32 0" fill="none"' + K + '/><path d="M70 146q-4 6 0 12M130 146q4 6 0 12" fill="none" stroke="#d8b49a" stroke-width="2"/>' +
    '<path d="M56 98q0 -60 44 -60q46 0 46 60z" fill="#3e8a4a"' + K + '/><path d="M56 98h90" stroke="#2a6a3a" stroke-width="8"/><path d="M70 72l60 0M66 84l70 0" stroke="#4fa05a" stroke-width="3"/>' +
    '<circle cx="100" cy="34" r="15" fill="#f2c040"' + K + '/><path d="M138 70l20 -40" stroke="#e0c040" stroke-width="5" stroke-linecap="round"/>') +
  '</defs></svg>';

  window.FACE = function (who) {
    var bg = { gribble: '#c9d3d6', mortlake: '#f7d6e2', huxtable: '#d9e3c8', tuttle: '#f6dcc0', plunkett: '#efe0f4' }[who] || '#222';
    return '<svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMax meet" style="background:' + bg + '"><use href="#ch-' + who + '"/></svg>';
  };
})();
