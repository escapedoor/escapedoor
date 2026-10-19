/* The people of "Lot Forty-One". Each is a set of choices for FG.person() in forgery.js, which draws them standing
   (feet at 0,0) in the scenes, and FACE(who) crops the same drawing to a bust for an interview. */
window.CAST = {
  /* Dr Leonie Hartnell: paint, paper and ink. Grey curls, square glasses on a cord, a camel coat, the laboratory's pass */
  hartnell: { skin: '#8a5a3c', hair: '#b9b4ae', hairStyle: 'curly', coat: '#b48a5a', long: true, legs: '#2e2a2a', shoes: '#1a1614',
    shirt: '#f1ede4', scarf: '#c9952f', glasses: 'square', lanyard: '#1f6b5a', pose: 'down', bg: '#1d2d33', mouth: 'flat' },
  /* Femi Odum: twenty-four, a green coat, a pencil behind her ear that she has forgotten about */
  femi: { skin: '#5e3a24', hair: '#17110d', hairStyle: 'bun', coat: '#3f6e4a', legs: '#23262e', shoes: '#efe9de', shirt: '#e9d9b8',
    pencil: true, bag: '#6b3f2a', earrings: '#e8c873', pose: 'down', bg: '#2a3328', mouth: 'flat' },
  /* Mr Rollo Garrick: head of pictures for thirty-one years. Silver hair swept back, a navy suit, a yellow tie, an umbrella */
  garrick: { skin: '#e8c4a8', hair: '#d9d6d0', hairStyle: 'swept', coat: '#232c45', legs: '#232c45', shoes: '#140f0c', shirt: '#f4f2ee',
    tie: '#e2b93b', pose: 'umbrella', bg: '#2c2433', mouth: 'smile', brows: '#c9c5bf' },
  /* Mrs Constance Lisle: the director, the founder's great-great-granddaughter. Pearls, glasses on a chain */
  lisle: { skin: '#efd2bc', hair: '#c9b48a', hairStyle: 'bob', coat: '#6e1f2e', legs: '#1f1a1c', shoes: '#2a1618', shirt: '#f1e6d8',
    pearls: true, chain: true, skirt: '#2a2228', pose: 'fold', bg: '#3a1e24', mouth: 'flat' },
  /* Mr Jack Tredwell: the owner of the picture. A farmer, a wax jacket, his cap in his hands */
  tredwell: { skin: '#e0a98a', hair: '#8a7a6a', hairStyle: 'bald', coat: '#4a4a2c', legs: '#3a3f4a', shoes: '#3a2a1c', shirt: '#9c3b30',
    check: true, pose: 'cap', bg: '#23302a', mouth: 'flat', w: 1.12 },
  /* Mrs Delphine Roux: a dealer in Dutch pictures, from London. A silver bob, a black coat, a small purple lamp */
  roux: { skin: '#f0d6c4', hair: '#e2e0dc', hairStyle: 'bob', coat: '#141416', long: true, legs: '#141416', shoes: '#0c0c0e', shirt: '#d8d2c8',
    lips: '#b3262c', pose: 'torch', bg: '#25202c', mouth: 'smile', glasses: 'round' },
  /* Owen, the head porter: a brown warehouse coat and white cotton gloves */
  owen: { skin: '#c99a76', hair: '#3a2a20', hairStyle: 'short', coat: '#6b4a2e', long: true, legs: '#2a2a2e', shoes: '#141210', shirt: '#dfe3e6',
    beard: true, gloves: true, pose: 'down', bg: '#2a2620', mouth: 'flat' }
};

/* the face for an interview: the same drawing, cropped to head and shoulders */
window.FACE = function (who) {
  var c = window.CAST[who] || {}, bg = c.bg || '#222';
  var fig = (window.FG && FG.person) ? FG.person(c, true) : '';
  return '<svg viewBox="-74 -356 148 192" preserveAspectRatio="xMidYMax meet" style="background:' + bg + '">' +
    '<rect x="-120" y="-420" width="240" height="320" fill="' + bg + '"/><circle cx="46" cy="-330" r="58" fill="#fff" opacity=".06"/>' +
    '<path d="M-120 -200h240v40h-240z" fill="#000" opacity=".18"/>' + fig + '</svg>';
};
