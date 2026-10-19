/* Where's It To? - what every room of the story shares: a few sounds, small helpers, the transcript of the call (the
   one paper every room needs), and the people, standing in the scene and as busts for the interviews.
   Loaded after engine.js. Nothing in here knows an answer.

   PROOFREAD: the transcript below (AC.CALL) is story text that wordlist.py --text does not see. */
window.AC = (function () {
  'use strict';
  var X = {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  X.sfx = {
    pin: function () { T({ f: 900, f2: 300, dur: 0.06, peak: 0.12 }); B({ dur: 0.03, f: 3200, q: 3, peak: 0.1 }); },
    stamp: function () { T({ f: 140, f2: 70, dur: 0.12, peak: 0.35 }); B({ type: 'lowpass', f: 700, dur: 0.06, peak: 0.2 }); },
    film: function () { B({ type: 'highpass', f: 1800, f2: 5200, dur: 0.18, peak: 0.08, a: 0.05 }); },
    pencil: function () { B({ type: 'bandpass', f: 4200, f2: 2600, q: 4, dur: 0.16, peak: 0.07, a: 0.01 }); },
    ring: function () { [0, 0.42].forEach(function (w) { T({ f: 440, dur: 0.32, peak: 0.06, when: w }); T({ f: 480, dur: 0.32, peak: 0.06, when: w }); }); },
    beep: function () { T({ type: 'square', f: 1250, dur: 0.07, peak: 0.04 }); }
  };
  /* a lock opens without leaving the room: the music answers in the room's key, or three plain notes */
  X.solved = function (quiet) {
    var sung = false;
    try { sung = !!(ER.music && ER.music() && ER.track && ER.track.sting('solved', null, !!quiet)); } catch (e) {}
    if (!sung && !quiet) ER.sfx.ok();
  };
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
  X.mine = function (id, title, html, quiet) { return ER.addClue(id, title, '<h4>' + title + '</h4>' + html, 'mine', 'Your notes', quiet); };
  X.terms = function (list) {
    var G = window.GLOSS || [];
    list.forEach(function (w) { for (var i = 0; i < G.length; i++) if (G[i][0] === w) { ER.addWord(G[i][0], G[i][1]); break; } });
  };
  X.minutesPlayed = function () {
    var st = ER.state();
    if (st.fin && st.fin.secs) return Math.max(1, Math.round(st.fin.secs / 60));
    return Math.max(1, Math.round((Date.now() - (st.t0 || Date.now())) / 60000));
  };
  /* Pick-and-place like ER.dnd, for places that hold many items (columns, rows): nothing is ever sent home to make room.
     Drag an item onto a place, or click the item and then the place. o = {item, slot, home, change, lock} */
  X.many = function (root, o) {
    var held = null, D = document;
    function hold(n) { if (held) held.classList.remove('held'); held = n; if (n) n.classList.add('held'); }
    function put(item, target) { target.appendChild(item); ER.sfx.click(); hold(null); if (o.change) o.change(); }
    function targetAt(x, y) {
      var t = D.elementFromPoint(x, y); if (!t || !t.closest) return null;
      return t.closest(o.slot) || (o.home.contains(t) || t === o.home ? o.home : null);
    }
    root.addEventListener('pointerdown', function (e) {
      var item = e.target.closest ? e.target.closest(o.item) : null;
      if (!item || e.button || (o.lock && o.lock())) return;
      e.preventDefault();
      var r = item.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top, moved = false, sx = e.clientX, sy = e.clientY;
      function mv(ev) {
        if (!moved) {
          if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 6) return;
          moved = true; item.style.width = r.width + 'px'; item.classList.add('fly'); hold(null);
        }
        item.style.left = (ev.clientX - dx) + 'px'; item.style.top = (ev.clientY - dy) + 'px';
      }
      function up(ev) {
        D.removeEventListener('pointermove', mv); D.removeEventListener('pointerup', up); D.removeEventListener('pointercancel', up);
        if (moved) {
          item.classList.remove('fly'); item.style.left = item.style.top = item.style.width = '';
          var t = targetAt(ev.clientX, ev.clientY); if (t) put(item, t);
        } else {
          var s = held && held !== item ? (item.closest(o.slot) || (o.home.contains(item) ? o.home : null)) : null;
          if (s && root.contains(s)) put(held, s); else hold(held === item ? null : item);
        }
      }
      D.addEventListener('pointermove', mv); D.addEventListener('pointerup', up); D.addEventListener('pointercancel', up);
    });
    root.addEventListener('click', function (e) {
      if (!held || (o.lock && o.lock())) return;
      if (e.target.closest && e.target.closest(o.item)) return;
      var t = e.target.closest ? (e.target.closest(o.slot) || (o.home.contains(e.target) || e.target === o.home ? o.home : null)) : null;
      if (t) put(held, t);
    });
  };
  /* sound symbols inside running text: never underlined by the dictionary, always in a face that has them */
  X.ipa = function (s) { return '<!--nogloss--><span class="ipa">' + s + '</span><!--/nogloss-->'; };

  /* ---------- the call: the producer's typed log, and Petra's red pencil on it ---------- */
  function mk(words, note) { return '<span class="mk"><i>' + note + '</i>' + words + '</span>'; }
  function m(t) { return '<p><b>MAX</b>&nbsp; ' + t + '</p>'; }
  function s(t) { return '<p class="sh"><b>SHONA</b>&nbsp; ' + t + '</p>'; }
  function p(t) { return '<p><b>PETRA</b>&nbsp; ' + t + '</p>'; }
  function g(t) { return '<p class="gap">' + t + '</p>'; }
  X.CALL = '<h4>NIGHTJAR &middot; programme log &middot; line 3</h4><p class="sub">Typed live by the producer, Yolande Crabtree. Red pencil: Dr Quilliam, listening on the line from the Rennie Building.</p>' +
    g('00.41.05') +
    m('Nineteen minutes to one on Nightjar, and tonight it&rsquo;s the words your family uses. Line three: Shona. You&rsquo;re driving, Shona?') +
    s('I am, Max. Hands-free, don&rsquo;t worry. I&rsquo;ve just come off a late shift, and I&rsquo;m only now going ' + mk('home', 'no h') + '.') +
    m('What do you do?') +
    s('I&rsquo;m a vet nurse. We had a Labrador in tonight who&rsquo;d eaten a sock. A whole sock. He&rsquo;s fine. The sock isn&rsquo;t.') +
    m('And the words?') +
    s('It&rsquo;s my nan. She&rsquo;s eighty-two, she lives with us, and she&rsquo;s got words nobody else has got. When it starts going dark of an evening, she says it&rsquo;s gone all ' + mk('dimpsy', 'word?') + '. And when she can&rsquo;t find something, it&rsquo;s &ldquo;' + mk('Where&rsquo;s it to?', 'grammar!') + '&rdquo; Where&rsquo;s my glasses to? Where&rsquo;s the remote to?') +
    m('Lovely. Dr Quilliam, where&rsquo;s Shona from?') +
    p('Don&rsquo;t tell me, Shona. Keep talking. Say &ldquo;car park&rdquo; for me.') +
    s(mk('Car park.', 'r ... r') + ' <span class="gap">[laughs]</span> Our car park at work was ' + mk('half', 'no h') + ' under ' + mk('water', 'no t: a catch') + ' tonight. I&rsquo;ve never seen rain like it.') +
    g('00.44.10 &nbsp;[three minutes about the rain, and her nan&rsquo;s pasties]') +
    p('And what do the young ones in your family say?') +
    s('My boy&rsquo;s nine. He says &ldquo;awesome&rdquo;, and &ldquo;trash&rdquo;, and he says &ldquo;fall&rdquo; for autumn. It&rsquo;s all ' + mk('them cartoons', 'grammar') + '. And now I&rsquo;ve started! I said to him last week, &ldquo;' + mk('Fall', 'word') + '&rsquo;s my favourite time of year.&rdquo; I&rsquo;m a ' + mk('wee', 'word') + ' bit worried he&rsquo;ll grow up American.') +
    m('A wee bit?') +
    s('<span class="gap">[laughs]</span> Don&rsquo;t you start.') +
    g('00.49.30 &nbsp;[two callers on hold are put through and back; Shona stays on the line]') +
    s('Oh, here&rsquo;s the grid. <span class="gap">[a rattle]</span> Right, I&rsquo;m up on the top now. You can&rsquo;t see a thing up here. No street lights. Just sheep&rsquo;s eyes in the headlights.') +
    p('Is it far, home?') +
    s('No, I&rsquo;m nearly to Hensey. Nan&rsquo;ll have the kettle on, and I&rsquo;m having a ' + mk('hot', 'no h') + ' ' + mk('bath', 'long a') + '.') +
    p('Say that again for me. &ldquo;Bath.&rdquo;') +
    s(mk('Bath!', 'long a') + ' <span class="gap">[laughs]</span> A big hot bath. Hang on, I&rsquo;m going down to the lake now. There&rsquo;s water over the road. There&rsquo;s always a ' + mk('little', 'catch') + ' bit at the ' + mk('bottom', 'catch') + ', but that&rsquo;s &hellip; that&rsquo;s a lot.') +
    m('Go carefully, Shona.') +
    s('I&rsquo;ll go slow. It&rsquo;s deeper than &hellip; Max, it&rsquo;s coming in. The water&rsquo;s coming in. The engine&rsquo;s &hellip;') +
    '<p class="end">00.52.40 &nbsp;THE LINE GOES DEAD.</p>';
  X.call = function (done) {
    ER.read({ html: X.CALL, cls: 'log', clue: { id: 'call', title: 'The call: Shona on line 3', kind: 'Transcript' }, done: done });
  };

  /* ---------- people, standing: feet at 0 0, about 300 high ---------- */
  var HAIR = {
    bob: 'M-26 -270q0 -36 26 -36t26 36l-3 30q-5 -34 -23 -36q-18 2 -23 36z',
    bun: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM-11 -312a11 11 0 1 1 22 0a11 11 0 1 1 -22 0z',
    curls: 'M-30 -262q-8 -44 30 -48q38 4 30 48q-6 -6 -8 -22q-8 6 -22 4q-14 2 -22 -4q-2 16 -8 22z',
    pony: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13zM20 -294q22 4 18 50q-8 -8 -9 -26q-5 -10 -11 -12z',
    short: 'M-24 -276q2 -29 24 -29t24 29q-10 -13 -24 -13t-24 13z'
  };
  X.person = function (o) {
    var skin = o.skin || '#e8c4a2', hair = o.hair || '#3a2a1c', top = o.top || '#2e6b8f', bot = o.bottom || '#2c2c33', s = '';
    s += '<ellipse cx="0" cy="2" rx="46" ry="8" fill="#000" opacity="' + (o.shadow == null ? 0.25 : o.shadow) + '"/>';
    if (o.legs === 'skirt') s += '<path d="M-16 0v-60h12v60zM4 0v-60h12v60z" fill="' + (o.stock || '#2a2a30') + '"/><path d="M-36 -54h72l-8 -86h-56z" fill="' + bot + '"/>';
    else s += '<path d="M-20 0v-100h17v100zM3 0v-100h17v100z" fill="' + bot + '"/>';
    s += '<path d="M-25 0h23v7h-27zM2 0h23v7h-23z" fill="' + (o.shoes || '#2a2420') + '"/>';
    s += '<path d="M-38 -94q-7 -138 38 -146t38 146z" fill="' + top + '"/>';
    if (o.cardi) s += '<path d="M-38 -94q-7 -138 38 -146q-14 60 -10 146zM38 -94q7 -138 -38 -146q14 60 10 146z" fill="' + o.cardi + '"/>';
    if (o.mac) s += '<path d="M-40 -60q-8 -170 40 -180t40 180z" fill="' + o.mac + '"/><path d="M0 -236v176" stroke="rgba(0,0,0,.25)" stroke-width="3"/><path d="M-36 -130h72" stroke="rgba(0,0,0,.2)" stroke-width="5"/>';
    if (o.lanyard) s += '<path d="M-12 -236l12 70 12 -70" stroke="' + o.lanyard + '" stroke-width="3" fill="none"/><rect x="-9" y="-170" width="18" height="24" rx="2" fill="#fff" stroke="#888"/>';
    s += '<path d="M-34 -204q-15 40 -5 88M34 -204q15 40 5 88" stroke="' + (o.sleeve || o.cardi || o.mac || top) + '" stroke-width="15" fill="none" stroke-linecap="round"/>' +
      '<circle cx="-39" cy="-112" r="8" fill="' + skin + '"/><circle cx="39" cy="-112" r="8" fill="' + skin + '"/>';
    s += '<rect x="-7" y="-256" width="14" height="20" fill="' + skin + '"/><circle cx="0" cy="-274" r="24" fill="' + skin + '"/>';
    if (o.style && HAIR[o.style]) s += '<path d="' + HAIR[o.style] + '" fill="' + hair + '"/>';
    s += '<path d="M-11 -273h7M4 -273h7" stroke="#2a2420" stroke-width="2.6" stroke-linecap="round"/><path d="M-6 -260q6 ' + (o.smile == null ? 4 : o.smile) + ' 12 0" stroke="#8c4a3c" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    if (o.glasses) s += '<rect x="-16" y="-279" width="13" height="10" rx="2" fill="none" stroke="' + o.glasses + '" stroke-width="2"/><rect x="3" y="-279" width="13" height="10" rx="2" fill="none" stroke="' + o.glasses + '" stroke-width="2"/><path d="M-3 -275h6" stroke="' + o.glasses + '" stroke-width="2"/>';
    if (o.phones) s += '<path d="M-27 -276q0 -38 27 -38t27 38" stroke="#1a1a1a" stroke-width="5" fill="none"/><rect x="-32" y="-284" width="10" height="20" rx="4" fill="#1a1a1a"/><rect x="22" y="-284" width="10" height="20" rx="4" fill="#1a1a1a"/>';
    if (o.mug) s += '<g transform="translate(40 -118)"><rect x="-8" y="-12" width="16" height="18" rx="2" fill="' + o.mug + '"/><path d="M8 -8q7 0 7 6t-7 6" stroke="' + o.mug + '" stroke-width="3" fill="none"/></g>';
    if (o.extra) s += o.extra;
    return s;
  };
  X.PEOPLE = {
    petra: { skin: '#f0d2bc', hair: '#9a9894', style: 'bob', top: '#e8e2d2', cardi: '#3f6b4f', bottom: '#33343c', legs: 'skirt', stock: '#2a2a30', glasses: '#7a2a2a', lanyard: '#b2361f', smile: 2 },
    nia: { skin: '#e9c09a', hair: '#2a1a14', style: 'curls', top: '#c8402e', bottom: '#2a3550', smile: 5, shoes: '#e8e4dc' }
  };
  X.who = function (name, more) {
    var o = {}, k, base = X.PEOPLE[name];
    for (k in base) o[k] = base[k];
    for (k in (more || {})) o[k] = more[k];
    return X.person(o);
  };

  /* ---------- busts for the interviews (240 x 300) ---------- */
  var BUST = {
    petra: { bg: '#3f6b4f', skin: '#f0d2bc', hair: '#9a9894', top: '#3f6b4f', shirt: '#e8e2d2', bob: 1, glasses: '#7a2a2a', old: 1 },
    nia: { bg: '#c8402e', skin: '#e9c09a', hair: '#2a1a14', top: '#c8402e', curls: 1 },
    yolande: { bg: '#4a3a6a', skin: '#b98060', hair: '#1a1210', top: '#2a2a3a', phones: 1, braids: 1 },
    tamsin: { bg: '#a3241e', skin: '#f2d4bc', hair: '#c8803a', top: '#1c2a3c', phones: 1, pony: 1, badge: 1 },
    max: { bg: '#1c2433', skin: '#dcae8a', hair: '#5a4030', top: '#5a6a7a', phones: 1, beard: '#6a4a36' },
    shona: { bg: '#2f7a7a', skin: '#f2cfb4', hair: '#a8582a', top: '#2f6a8a', pony: 1, foil: 1 },
    vera: { bg: '#8a5a7a', skin: '#f0d4c0', hair: '#f2f0ea', top: '#a86a8a', bun: 1, old: 1, glasses: '#5a4a3a' }
  };
  X.face = function (name, mood) {
    var o = BUST[name], s = '', sm = mood === 'smile' ? 10 : mood === 'cross' ? -6 : mood === 'worried' ? -2 : 3;
    s += '<svg viewBox="0 0 240 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><rect x="-200" y="-200" width="640" height="500" fill="' + o.bg + '"/><path d="M-20 300L120 -40L260 300z" fill="#fff" opacity=".06"/>';
    s += '<path d="M14 300q8 -96 106 -104q98 8 106 104z" fill="' + o.top + '"/>';
    if (o.shirt) s += '<path d="M92 200l28 60 28 -60q-28 -10 -56 0z" fill="' + o.shirt + '"/>';
    if (o.foil) s += '<path d="M10 300q10 -90 110 -96q100 6 110 96z" fill="#d8dde2"/><path d="M40 260l40 -30M140 240l50 30M90 280l30 -40" stroke="#fff" stroke-width="4" opacity=".7"/>';
    if (o.badge) s += '<rect x="150" y="236" width="40" height="24" rx="3" fill="#e8c24a"/><path d="M158 248h24" stroke="#1c2a3c" stroke-width="3"/>';
    s += '<rect x="104" y="164" width="32" height="36" fill="' + o.skin + '"/>';
    if (o.bob) s += '<path d="M56 124q-4 -80 64 -82t64 82l-6 52q-8 -74 -58 -80q-50 6 -58 80z" fill="' + o.hair + '"/>';
    if (o.braids) s += '<path d="M58 110q-14 80 -6 150h18q-8 -70 4 -140zM182 110q14 80 6 150h-18q8 -70 -4 -140z" fill="' + o.hair + '"/>';
    if (o.curls) s += '<path d="M50 140q-20 -110 70 -110t70 110q-10 -10 -14 -30q-8 10 -20 4q-14 8 -36 4q-22 4 -36 -4q-12 6 -20 -4q-4 20 -14 30z" fill="' + o.hair + '"/>';
    if (o.pony) s += '<path d="M168 70q48 10 36 110q-14 -16 -16 -50q-8 -30 -20 -40z" fill="' + o.hair + '"/>';
    s += '<ellipse cx="120" cy="120" rx="54" ry="62" fill="' + o.skin + '"/><ellipse cx="66" cy="126" rx="8" ry="13" fill="' + o.skin + '"/><ellipse cx="174" cy="126" rx="8" ry="13" fill="' + o.skin + '"/>';
    if (o.bob) s += '<path d="M62 112q4 -62 58 -64t58 64q-22 -32 -58 -34t-58 34z" fill="' + o.hair + '"/>';
    else if (o.curls) s += '<path d="M60 112q2 -64 60 -66t60 66q-10 -14 -22 -24q-10 10 -38 8q-28 2 -38 -8q-12 10 -22 24z" fill="' + o.hair + '"/>';
    else s += '<path d="M64 116q0 -66 56 -68t56 68q-14 -30 -56 -32t-56 32z" fill="' + o.hair + '"/>';
    if (o.bun) s += '<circle cx="120" cy="50" r="22" fill="' + o.hair + '"/>';
    s += '<path d="M90 106q10 -6 20 0M130 106q10 -6 20 0" stroke="#3a2a20" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="122" rx="5" ry="6.5" fill="#2a2420"/><ellipse cx="140" cy="122" rx="5" ry="6.5" fill="#2a2420"/><circle cx="102" cy="120" r="1.6" fill="#fff"/><circle cx="142" cy="120" r="1.6" fill="#fff"/>' +
      '<path d="M120 128q-5 14 2 18" stroke="#a8745a" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    if (o.beard) s += '<path d="M66 128q-4 70 54 76q58 -6 54 -76q-14 34 -54 34t-54 -34z" fill="' + o.beard + '"/><path d="M106 160q14 ' + (sm / 2) + ' 28 0" stroke="#3a2a20" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    else s += '<path d="M104 156q16 ' + sm + ' 32 0" stroke="#8c3a32" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    if (o.old) s += '<path d="M84 98q8 -3 16 -1M140 97q8 -2 16 1M86 138q6 4 12 3M142 141q6 1 12 -3" stroke="#a07a60" stroke-width="2" fill="none" opacity=".6"/>';
    s += '<ellipse cx="88" cy="146" rx="9" ry="5" fill="#e88a7a" opacity=".3"/><ellipse cx="152" cy="146" rx="9" ry="5" fill="#e88a7a" opacity=".3"/>';
    if (o.glasses) s += '<g fill="none" stroke="' + o.glasses + '" stroke-width="3.5"><rect x="83" y="110" width="32" height="24" rx="5"/><rect x="125" y="110" width="32" height="24" rx="5"/><path d="M115 120h10M83 118l-16 -4M157 118l16 -4"/></g>';
    if (o.phones) s += '<path d="M58 118q0 -96 62 -96t62 96" stroke="#15151a" stroke-width="10" fill="none"/><rect x="46" y="104" width="22" height="42" rx="9" fill="#15151a"/><rect x="172" y="104" width="22" height="42" rx="9" fill="#15151a"/><path d="M58 140q6 34 40 38" stroke="#15151a" stroke-width="4" fill="none"/><circle cx="100" cy="178" r="5" fill="#15151a"/>';
    return s + '</svg>';
  };
  return X;
})();
