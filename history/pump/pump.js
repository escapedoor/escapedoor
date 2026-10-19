/* By the Nearest Road - what every room of the story shares: a few sounds, faces, a number setter, a tray-and-bins kit,
   the papers that are needed in more than one room, and small helpers. Loaded after engine.js. Nothing in here
   knows an answer. (The papers here are proofread with the rooms: wordlist.py --text does not read this file.) */
window.PU = (function () {
  'use strict';
  var X = {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds (through the engine, so the sound button switches them) ---------- */
  X.sfx = {
    pen: function () { B({ type: 'highpass', f: 3200, dur: 0.18, peak: 0.05, a: 0.04 }); B({ type: 'highpass', f: 3800, dur: 0.12, peak: 0.04, a: 0.03, when: 0.2 }); },
    stamp: function () { T({ f: 140, f2: 70, dur: 0.12, peak: 0.35 }); B({ dur: 0.04, f: 1200, q: 1, peak: 0.2 }); },
    pin: function () { B({ dur: 0.025, f: 4200, q: 4, peak: 0.18 }); T({ f: 210, dur: 0.05, peak: 0.08 }); },
    chalk: function () { for (var i = 0; i < 3; i++) B({ type: 'bandpass', f: 2600 + i * 300, q: 3, dur: 0.07, peak: 0.07, when: i * 0.08 }); },
    splash: function () { B({ type: 'bandpass', f: 700, f2: 1500, q: 1.2, dur: 0.5, peak: 0.12, a: 0.03 }); T({ f: 520, f2: 260, dur: 0.18, peak: 0.05, when: 0.05 }); },
    squeak: function () { T({ type: 'sawtooth', f: 620, f2: 420, dur: 0.35, peak: 0.03, a: 0.06 }); T({ type: 'sawtooth', f: 560, f2: 700, dur: 0.3, peak: 0.025, a: 0.06, when: 0.4 }); },
    clink: function () { T({ f: 1900, dur: 0.25, peak: 0.05 }); T({ f: 2850, dur: 0.18, peak: 0.025 }); },
    hoof: function () { for (var i = 0; i < 4; i++) B({ type: 'lowpass', f: 600, dur: 0.06, peak: 0.18, when: i * 0.22 + (i % 2) * 0.05 }); },
    gavel: function () { T({ f: 180, f2: 120, dur: 0.1, peak: 0.3 }); B({ dur: 0.03, f: 900, q: 2, peak: 0.2 }); }
  };

  /* A door opens: the music answers in the room's own key, as it does after ER.exit (these rooms leave through
     ER.exit(..., {wait: true}) and ER.leave, because something is always said between the lock and the door). */
  X.solved = function (quiet) {
    var sung = false;
    try { sung = !!(ER.music && ER.music() && ER.track && ER.track.sting('solved', null, !!quiet)); } catch (e) {}
    if (!sung && !quiet) ER.sfx.ok();
  };
  X.mood = function (m) { try { if (ER.mood) ER.mood(m); } catch (e) {} };
  X.thing = function (sel, word, line, busy) {
    ER.$$(sel).forEach(function (n) {
      n.addEventListener('click', function (e) {
        if (busy && busy()) return;
        if (word) ER.wordAt(e.clientX, e.clientY, word);
        if (line) { var l = typeof line === 'function' ? line() : line; if (l) ER.say(l); }
      });
    });
  };
  X.mine = function (id, title, html, quiet) { return ER.addClue(id, title, '<h4>' + title + '</h4>' + html, 'mine', 'Your notes', quiet); };
  X.learn = function () {
    for (var i = 0; i < arguments.length; i++) {
      var w = arguments[i], list = window.GLOSS || [], j;
      for (j = 0; j < list.length; j++) if (list[j][0].toLowerCase() === w.toLowerCase()) { ER.addWord(list[j][0], list[j][1]); break; }
    }
  };
  /* a paper from an earlier room must be in the notebook even when a room is opened directly (a lesson that starts half way) */
  X.need = function (id, title, html, cls, kind) {
    var c = ER.state().clues, i;
    for (i = 0; i < c.length; i++) if (c[i].id === id) return;
    ER.addClue(id, title, html, cls, kind, true);
  };
  X.has = function (id) { return ER.state().clues.some(function (c) { return c.id === id; }); };
  X.slip = function () { ER.flag('slips', (ER.flag('slips') || 0) + 1); };
  X.slips = function () { return ER.flag('slips') || 0; };
  /* the first of the candidates that a tag accepts (to say what kind of wrong a wrong try is), or null */
  X.why = function (tagName, cands) { for (var i = 0; i < cands.length; i++) if (ER.check(tagName, cands[i])) return cands[i]; return null; };
  /* a room's last words, then the button at the bottom of the screen */
  X.door = function (btn, file, flagKey) {
    ER.flag(flagKey, file);
    btn.classList.add('on');
    btn.onclick = function () { if (btn.getAttribute('data-gone')) return; btn.setAttribute('data-gone', '1'); X.solved(true); setTimeout(function () { ER.leave(file); }, 900); };
  };

  /* ---------- a number setter. o = {val, min, max, steps: [10, 1], fmt, onChange} ---------- */
  X.num = function (o) {
    var st = o.steps || [1], el = ER.el('span', 'ns'), v = o.val, out;
    var h = '';
    st.forEach(function (s) { h += '<button type="button" data-d="' + (-s) + '" aria-label="less">&minus;' + (st.length > 1 ? s : '') + '</button>'; });
    h += '<output></output>';
    st.slice().reverse().forEach(function (s) { h += '<button type="button" data-d="' + s + '" aria-label="more">+' + (st.length > 1 ? s : '') + '</button>'; });
    el.innerHTML = h; out = el.querySelector('output');
    function paint() { out.textContent = o.fmt ? o.fmt(v) : String(v); el.setAttribute('data-v', v); }
    ER.$$('button', el).forEach(function (b) {
      b.addEventListener('click', function () {
        if (el.classList.contains('done')) return;
        v = Math.max(o.min, Math.min(o.max, v + parseInt(b.getAttribute('data-d'), 10)));
        el.classList.remove('ok', 'no'); paint(); ER.sfx.tick(0.6); if (o.onChange) o.onChange(v);
      });
    });
    paint();
    return { el: el, get: function () { return v; }, set: function (n) { v = n; paint(); },
      mark: function (s) { el.classList.remove('ok', 'no', 'done'); if (s) el.classList.add(s); if (s === 'ok') el.classList.add('done'); } };
  };

  /* ---------- cards and bins: drag a card into a bin, or click the card and then the bin. Many cards to a bin.
     o = {item: '.pc', bin: '.bin', home: node, change: fn, lock: fn -> bool}. A bin may hold an inner '.bin-in'. ---------- */
  X.bins = function (root, o) {
    var held = null, D = document;
    function hold(n) { if (held) held.classList.remove('held'); held = n; if (n) n.classList.add('held'); }
    function into(t) { return t === o.home ? o.home : (t.querySelector('.bin-in') || t); }
    function put(item, t) { into(t).appendChild(item); item.classList.remove('no', 'ok'); ER.sfx.click(); hold(null); if (o.change) o.change(); }
    function targetAt(x, y) {
      var t = D.elementFromPoint(x, y); if (!t || !t.closest) return null;
      var b = t.closest(o.bin); if (b && root.contains(b)) return b;
      return o.home.contains(t) ? o.home : null;
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
        } else if (held && held !== item) {
          var b = item.closest(o.bin);
          if (b && root.contains(b)) put(held, b); else if (o.home.contains(item)) put(held, o.home); else hold(item);
        } else hold(held === item ? null : item);
      }
      D.addEventListener('pointermove', mv); D.addEventListener('pointerup', up); D.addEventListener('pointercancel', up);
    });
    root.addEventListener('click', function (e) {
      if (!held || (o.lock && o.lock())) return;
      if (e.target.closest && e.target.closest(o.item)) return;
      var b = e.target.closest ? e.target.closest(o.bin) : null;
      if (b && root.contains(b)) put(held, b);
      else if (o.home.contains(e.target)) put(held, o.home);
    });
    return { drop: function () { hold(null); } };
  };

  /* ---------- faces, for the people you talk to ---------- */
  var F = {
    snow: { skin: '#ecc6a6', hair: '#3a2a1c', coat: '#1d1d24', stock: 1, recede: 1 },
    peebles: { skin: '#f0c9ae', hair: '#a9a294', coat: '#2a2a32', vest: '#6a4a2a', bald: 1, chops: 1, specs: 1, stock: 1 },
    florrie: { skin: '#f2cdb0', hair: '#8a3c1a', coat: '#6a4a6a', shawl: '#8a5a3a', mob: 1, freck: 1 },
    stannard: { skin: '#e2b08e', hair: '#4a3424', coat: '#3a3a2c', vest: '#8a7a4a', beard: 1, hat: 'top', stock: 1 },
    whitehead: { skin: '#efc8aa', hair: '#2a1c12', coat: '#141418', bands: 1 },
    mudge: { skin: '#d9a07a', hair: '#6a4a2a', coat: '#e6dcc4', apron: '#b89a62', beard: 1, hat: 'flat', hatc: '#4a3a2a' },
    pook: { skin: '#e8b898', hair: '#9a9488', coat: '#24345a', brass: 1, chops: 1, hat: 'peak', hatc: '#1c2844' },
    applin: { skin: '#eec4a6', hair: '#8a8478', coat: '#18181c', mob: 1, black: 1 },
    chair: { skin: '#e9b896', hair: '#d6d0c4', coat: '#22222a', vest: '#4a1a1a', chops: 1, bald: 1, chain: 1, stock: 1 }
  };
  X.FACE = function (k) {
    var p = F[k] || F.snow, s = '<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">';
    s += '<path d="M14 240q8-72 86-80q78 8 86 80z" fill="' + p.coat + '"/>';
    if (p.shawl) s += '<path d="M20 240q10-60 80-70q70 10 80 70l-30 0q-10-40-50-44q-40 4-50 44z" fill="' + p.shawl + '"/><path d="M60 196l40 30 40-30" stroke="#5a3a26" stroke-width="3" fill="none"/>';
    if (p.vest) s += '<path d="M64 174q36 30 72 0l8 66H56z" fill="' + p.vest + '"/>';
    if (p.chain) s += '<path d="M70 214q30 14 60 0" stroke="#d9b24a" stroke-width="3" fill="none"/><circle cx="100" cy="221" r="4" fill="#d9b24a"/>';
    if (p.apron) s += '<path d="M62 176h76l6 64H56z" fill="' + p.apron + '"/><path d="M62 176l-14-14M138 176l14-14" stroke="' + p.apron + '" stroke-width="6"/>';
    if (p.brass) s += '<g fill="#d9b24a"><circle cx="100" cy="190" r="4"/><circle cx="100" cy="208" r="4"/><circle cx="100" cy="226" r="4"/></g>';
    s += '<path d="M82 160l18 22 18-22" fill="' + (p.black ? '#18181c' : '#f6f3ea') + '"/>';
    if (p.stock) s += '<path d="M84 164h32l-6 12H90z" fill="#141414"/>';
    if (p.bands) s += '<path d="M92 166h16v6h-16z" fill="#f6f3ea"/><path d="M94 172h5v22h-5zM101 172h5v22h-5z" fill="#f6f3ea"/>';
    s += '<rect x="88" y="132" width="24" height="34" fill="' + p.skin + '"/>';
    s += '<ellipse cx="100" cy="100" rx="38" ry="46" fill="' + p.skin + '"/>';
    if (p.freck) s += '<g fill="#c98a62" opacity=".6"><circle cx="80" cy="112" r="1.6"/><circle cx="86" cy="116" r="1.4"/><circle cx="118" cy="112" r="1.6"/><circle cx="112" cy="116" r="1.4"/></g>';
    if (p.bald) s += '<path d="M62 106q-2-22 6-34M138 106q2-22-6-34" stroke="' + p.hair + '" stroke-width="9" fill="none"/>';
    else if (p.recede) s += '<path d="M62 100q-2-40 22-52q-8 18-10 46zM138 100q2-40-22-52q8 18 10 46z" fill="' + p.hair + '"/><path d="M76 52q24-14 48 0q-24-6-48 0z" fill="' + p.hair + '"/>';
    else if (!p.mob) s += '<path d="M62 96q0-52 38-52t38 52q-8-26-38-28q-30 2-38 28z" fill="' + p.hair + '"/>';
    if (p.chops) s += '<path d="M62 92q-4 34 10 50q6-24 6-46zM138 92q4 34-10 50q-6-24-6-46z" fill="' + p.hair + '"/>';
    if (p.beard) s += '<path d="M64 108q2 52 36 58q34-6 36-58q-8 22-36 24q-28-2-36-24z" fill="' + p.hair + '"/>';
    s += '<circle cx="86" cy="100" r="3.4" fill="#1b1512"/><circle cx="114" cy="100" r="3.4" fill="#1b1512"/>';
    s += '<path d="M78 90q8-5 16 0M106 90q8-5 16 0" stroke="' + (p.mob ? '#7a4a2a' : p.hair) + '" stroke-width="3" fill="none"/>';
    if (p.specs) s += '<g fill="none" stroke="#2a2a2a" stroke-width="2.5"><circle cx="86" cy="101" r="10"/><circle cx="114" cy="101" r="10"/><path d="M96 101h8"/></g>';
    if (!p.beard) s += '<path d="M90 130q10 5 20 0" stroke="#5a2a20" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    if (p.mob) s += '<path d="M60 92q-6-50 40-54q46 4 40 54q-10-24-40-26q-30 2-40 26z" fill="' + (p.black ? '#f2efe6' : '#f6f3ea') + '"/><path d="M58 92q42-16 84 0" stroke="#d8d2c4" stroke-width="4" fill="none"/>' + (p.black ? '' : '<path d="M66 64q-4 12 0 22M134 64q4 12 0 22" stroke="' + p.hair + '" stroke-width="6"/>');
    if (p.hat === 'top') s += '<rect x="64" y="10" width="72" height="54" fill="#141414"/><ellipse cx="100" cy="64" rx="52" ry="9" fill="#141414"/><rect x="64" y="50" width="72" height="7" fill="#3a2a1c"/>';
    if (p.hat === 'flat') s += '<path d="M58 76q4-34 46-34q38 2 40 28q-44-6-86 6z" fill="' + p.hatc + '"/><path d="M58 76q-8 4 4 6l40-6" fill="' + p.hatc + '"/>';
    if (p.hat === 'peak') s += '<path d="M62 70q0-28 38-28t38 28z" fill="' + p.hatc + '"/><path d="M60 70h80l10 8H60z" fill="#101a30"/><rect x="62" y="58" width="76" height="5" fill="#d9b24a"/>';
    return s + '</svg>';
  };

  /* ---------- papers that are needed in more than one room ---------- */
  var ROW = '<svg viewBox="0 0 760 132"><g font-family="\'Libre Caslon Text\',serif" font-size="10.5" fill="#4a4f40">' +
    '<g fill="none" stroke="#9aa08c" stroke-width="1"><rect x="2" y="22" width="756" height="84"/><path d="M110 22v84M180 22v84M222 22v84M268 22v84M350 22v84M500 22v84M660 22v84"/></g>' +
    '<g font-family="Oswald,sans-serif" font-size="12" fill="#7a1d14" text-anchor="middle"><text x="56" y="16">1</text><text x="145" y="16">2</text><text x="201" y="16">3</text><text x="245" y="16">4</text><text x="309" y="16">5</text><text x="425" y="16">6</text><text x="580" y="16">7</text><text x="709" y="16">8</text></g>' +
    '<text x="8" y="36">When and where</text><text x="116" y="36">Name</text><text x="186" y="36">Sex</text><text x="228" y="36">Age</text><text x="274" y="36">Rank or</text><text x="274" y="48">profession</text><text x="356" y="36">Cause of death</text><text x="506" y="36">Informant: who,</text><text x="506" y="48">and was he there?</text><text x="666" y="36">When</text><text x="666" y="48">registered</text></g>' +
    '<g font-family="\'Homemade Apple\',cursive" font-size="10.5" fill="#26304a"><text x="8" y="74">2nd Sept. 1854</text><text x="8" y="92">38 Broad Street</text><text x="128" y="80">&#8212; &#8212;</text><text x="186" y="80">M</text><text x="228" y="80">38</text><text x="274" y="80">Tailor</text><text x="356" y="74">Cholera, 10 hours.</text><text x="356" y="92">Certified.</text><text x="506" y="74">His wife, present</text><text x="506" y="92">at the death</text><text x="666" y="74">2nd Sept.</text><text x="666" y="92">1854</text></g>' +
    '<text x="380" y="126" text-anchor="middle" font-family="\'Libre Caslon Text\',serif" font-style="italic" font-size="11" fill="#6b6552">(In the copies in this story the names are left out.)</text></svg>';
  X.LINE = '<h4>How to read a line of the register</h4><h5>General Register Office &middot; for the copying room</h5>' + ROW +
    '<p>Every death in England and Wales is written down by the <b>registrar</b> of the <b>sub-district</b> where it happened, in a line of eight columns. Read all eight.</p>' +
    '<p>The <b>cause</b> is what a doctor certified, or what the <b>informant</b> said. Copy it exactly as it is written, and never improve it.</p>' +
    '<p>The <b>place</b> is where the person died. That may be a hospital a mile from home, and then the death belongs to the hospital&rsquo;s sub-district, not the home&rsquo;s.</p>' +
    '<p>A death is <b>registered</b> a day or several days after it happens. So a list of the deaths registered in one week is not the same as a list of the deaths that happened in that week.</p>' +
    '<p>Our weeks run from Sunday to Saturday.</p>';
  X.REQUEST = '<h4>Dr Snow&rsquo;s note</h4><h5>Handed to Mr Peebles, Tuesday 5 September 1854</h5>' +
    '<p style="text-align:right">Sackville Street, Piccadilly<br>4th September 1854</p><p>Sir,</p>' +
    '<p>With the kind permission of the Registrar General, I should be glad to have a list of the <b>deaths from cholera, registered during the week ending 2nd September, in the sub-districts of Golden Square, Berwick Street, and St Ann&rsquo;s, Soho</b>, with the place of death in each case.</p>' +
    '<p>I am, Sir, your obedient servant,<br><i>John Snow</i></p>';
  X.CARD = '<h4>On believing what is written</h4><h5>Notes for a young clerk &middot; A. P.</h5><ol>' +
    '<li>Ask who wrote it, and whether he was there. A registrar was not at the bedside: he writes down what he is told.</li>' +
    '<li>A doctor&rsquo;s word for the cause is better than a neighbour&rsquo;s, and a neighbour&rsquo;s is better than a newspaper&rsquo;s.</li>' +
    '<li>A newspaper prints what it heard yesterday, and what its readers would like to believe.</li>' +
    '<li>A letter tells you what the writer saw, and also what the writer wants.</li>' +
    '<li>When two papers disagree, believe the writer who was nearest to the thing itself, unless he has a reason to be wrong.</li>' +
    '<li>A guess written in a firm hand is still a guess.</li></ol>';
  X.H41 = '<p>From the Hampstead returns, on Mr Peebles&rsquo;s desk. Not for Dr Snow: wrong district, and registered on Monday. I copied it anyway.</p>' +
    '<p><b>Hampstead No. 41.</b> &ldquo;At West End, on 2nd September, the widow of a percussion-cap maker, aged 59 years, diarrhœa two hours, cholera epidemica sixteen hours.&rdquo; Registered 4th September.</p>';
  X.LIST = '<p>Six lines from the returns, copied for Dr Snow:</p>' +
    '<p>No. 214, 38 Broad Street, tailor, 38. No. 215, 12 Peter Street, girl of 6. No. 216, 9 Dean Street, French polisher, 45. No. 221, 8 Cambridge Street, boy of 4. No. 224, 18 Poland Street, tailor&rsquo;s wife, 33. No. 226, 14 Silver Street, laundress, 41.</p>' +
    '<p>Mr Peebles copied the rest. In the week, in the three sub-districts: <b>89</b> deaths from cholera registered. Only 6 in the first four days, 4 on Thursday 31 August, and <b>79</b> on Friday and Saturday. So it began on Thursday night.</p>';
  var MARKSVG = '<svg viewBox="0 0 520 150"><g font-family="\'EB Garamond\',serif" font-size="14" fill="#1f2438">' +
    '<path d="M10 70H510M10 104H510" stroke="#1f2438" stroke-width="1.5"/><text x="180" y="92" font-style="italic">BROAD STREET</text>' +
    '<g fill="none" stroke="#7a6a4e" stroke-width="1"><rect x="40" y="30" width="60" height="38"/><rect x="104" y="30" width="60" height="38"/><rect x="168" y="30" width="60" height="38"/><rect x="232" y="30" width="60" height="38"/></g>' +
    '<g fill="#1f2438"><rect x="54" y="60" width="32" height="5"/><rect x="118" y="60" width="32" height="5"/><rect x="118" y="53" width="32" height="5"/><rect x="118" y="46" width="32" height="5"/><rect x="182" y="60" width="32" height="5"/></g>' +
    '<text x="40" y="22">1 death</text><text x="112" y="22">3 deaths: a pile</text>' +
    '<rect x="380" y="20" width="110" height="44" fill="none" stroke="#7a1d14" stroke-dasharray="4 3"/><text x="390" y="38" fill="#7a1d14">the hospital</text><text x="390" y="56" fill="#7a1d14">NOT here</text>' +
    '<path d="M380 50Q320 40 270 58" stroke="#7a1d14" stroke-width="1.5" fill="none"/><path d="M276 52l-8 6 10 3" stroke="#7a1d14" stroke-width="1.5" fill="none"/>' +
    '<text x="240" y="132">the house he came from, or where he was taken ill: HERE</text></g></svg>';
  X.MARK = '<h4>How I mark the map</h4><h5>Dr Snow&rsquo;s rule, written out for the clerk</h5>' + MARKSVG +
    '<p>To <b>plot</b> the deaths, draw one short black bar for each death across the line of the street at the house. A second death at the same house goes on top of the first, so a <b>pile</b> of bars is a house that lost many.</p>' +
    '<p>Mark the house where the person lived, or where the fatal illness was caught. Never the hospital or the workhouse where they died, and never the place they were buried: those tell you about the end, not the beginning.</p>' +
    '<p>When the bars are all down, do not look at any one bar. Look at where they <b>crowd</b> together, in a <b>cluster</b>, and ask what stands in the middle of the crowd. Then ask what else stands there.</p>';
  var SMELLSVG = '<svg viewBox="0 0 700 300"><g font-family="\'Architects Daughter\',cursive" font-size="14" fill="#2a2416">' +
    '<g stroke="#5a4a30" stroke-width="16" stroke-linecap="square" fill="none" opacity=".35"><path d="M40 150H660M170 30V280M120 30V280M420 30V150M420 150V280M500 30V280M500 190H660M420 260H660"/></g>' +
    '<g fill="#6a7a2a" opacity=".28"><ellipse cx="320" cy="150" rx="230" ry="44"/><ellipse cx="400" cy="90" rx="50" ry="70"/><ellipse cx="260" cy="110" rx="60" ry="36"/></g>' +
    '<g fill="#2a2416"><text x="230" y="178">Broad Street</text><text x="430" y="50">Poland St.</text><text x="58" y="44">Carnaby St.</text><text x="176" y="270">Marshall St.</text><text x="510" y="276">Berwick St.</text></g>' +
    '<g font-family="\'IBM Plex Mono\',monospace" font-weight="600" font-size="15" fill="#7a1d14"><text x="190" y="155">G</text><text x="318" y="155">G</text><text x="470" y="155">G</text><text x="600" y="155">G</text><text x="414" y="80">G</text><text x="414" y="116">G</text></g>' +
    '<circle cx="328" cy="140" r="5" fill="#1a1a1a"/><text x="300" y="132" font-size="12">pump</text>' +
    '<rect x="380" y="56" width="34" height="80" fill="none" stroke="#2a2416" stroke-width="1.5"/><text x="330" y="70" font-size="12">workhouse</text>' +
    '<rect x="240" y="104" width="60" height="34" fill="none" stroke="#2a2416" stroke-width="1.5"/><text x="222" y="98" font-size="12">brewery: malt, drains</text>' +
    '<text x="40" y="236" font-size="13">old burial ground</text><text x="40" y="252" font-size="13">somewhere here?</text>' +
    '<text x="460" y="236" font-size="12">G = grating of the sewer</text><text x="460" y="252" font-size="12">shading = very foul</text></g></svg>';
  X.SMELL = '<h4>Map of Nuisances, Broad Street district</h4><p>Smells noted by me in person on the 4th and 5th of September, 1854. &mdash; H. Stannard, Inspector of Nuisances.</p>' + SMELLSVG +
    '<p>Worst at the gratings of the sewer in Broad Street, and at the two in Poland Street by the workhouse gate. The brewery yard: malt and drains. A rumour that the digging of the new sewer has opened an old burial ground to the west: not yet confirmed by my nose.</p>';
  var ROADSVG = '<svg viewBox="0 0 560 170"><g font-family="\'EB Garamond\',serif" font-size="14" fill="#1f2438">' +
    '<g stroke="#9a8a6a" stroke-width="12" stroke-linecap="square"><path d="M40 40H520M40 40V140M520 40V140M40 140H200"/></g>' +
    '<path d="M260 60V150" stroke="#5a1f14" stroke-width="6"/><text x="270" y="124" fill="#5a1f14">a wall</text>' +
    '<circle cx="40" cy="140" r="9" fill="#1f2438"/><text x="54" y="164">pump P</text><circle cx="520" cy="140" r="9" fill="#1f2438"/><text x="468" y="164">pump Q</text>' +
    '<path d="M200 140h30" stroke="#9a8a6a" stroke-width="12"/><circle cx="236" cy="140" r="6" fill="#7a1d14"/><text x="196" y="124" fill="#7a1d14">house</text>' +
    '<path d="M244 140L512 140" stroke="#7a1d14" stroke-width="1.5" stroke-dasharray="5 5"/><text x="330" y="160" fill="#7a1d14">nearer to Q on the map</text>' +
    '<text x="140" y="30">but nearer to P by the road</text><path d="M280 34V46" stroke="#1f2438" stroke-width="2"/><text x="268" y="62" font-size="12">pin</text></g></svg>';
  X.ROAD = '<h4>By the nearest road</h4><h5>Dr Snow, Sackville Street &middot; a page for the clerk</h5><div class="two"><div>' +
    '<p>Water is fetched on foot, along the streets, in jugs and pails. So a house belongs to the pump that is nearest <b>to walk to</b>, not the pump that is nearest on the map, <b>as the crow flies</b>. A court with one way out, a wall, a street that turns back on itself: each can make a near pump far.</p>' +
    '<p>To find the edge between two pumps, count the yards along the road from each pump to the street in question, and along the street itself. Where the two counts are equal, put a <b>pin</b>. Join the pins, and you have the line on which the two pumps are equally near: the <b>boundary</b> between them.</p>' +
    '<p>People inside the line will send to one pump; people outside it, to the other, unless they have a reason of their own. Find the reason.</p></div>' + ROADSVG + '</div>';
  X.CALLS = '<h4>House calls, Wednesday</h4><h5>From Dr Snow&rsquo;s notebook: the houses nearer, by the road, to another pump</h5>' +
    '<div class="ent"><i>9 Carnaby Street</i>A widow, 61, died Friday 1st. Her daughter: &ldquo;The Marlborough Street water is foul. We have always sent the girl to Broad Street for ours.&rdquo;</div>' +
    '<div class="ent"><i>22 Peter Street</i>A girl of nine, died Saturday 2nd. Went every day to the school in Dufour&rsquo;s Place, off Broad Street. Her mother thinks it likely she drank at the pump on the way, as the children do.</div>' +
    '<div class="ent"><i>30 Marshall Street</i>A cabinet-maker, 44, died Friday 1st. Worked all day at a shop in Broad Street; his wife says the men there kept a can filled at the pump.</div>' +
    '<div class="ent"><i>3 Wardour Street</i>A shoemaker, 60, died Monday 28th August, after a week&rsquo;s illness. Nobody in the house fetches from Broad Street.</div>' +
    '<div class="ent"><i>6 Brewer Street</i>A woman, 35, died Saturday 2nd. Her husband: &ldquo;Rupert Street is nearer, but the Broad Street water is better. I fetched it myself on Thursday.&rdquo;</div>' +
    '<p>If the water is the cause, each of these must have a reason, or else be one of the few deaths that were happening in these streets all August, before Thursday night.</p>';
  X.WATER = '<h4>Pump water, Broad Street</h4><h5>Dr Snow&rsquo;s note on the bottle</h5>' +
    '<p>Sunday 3rd, evening: very little to be seen in it. I hesitated. Monday and Tuesday: small white specks, visible to the naked eye on close looking, more on one day than another. At the start of the outbreak it may have been worse.</p>' +
    '<p>People say it is the best water in Soho: cold, clear and pleasant. That is why they walk to it from streets away.</p>';
  var TWOSVG = '<svg viewBox="0 0 520 150"><g font-family="\'EB Garamond\',serif" font-size="14" fill="#1f2438">' +
    '<circle cx="190" cy="76" r="66" fill="#6a7a2a" fill-opacity=".18" stroke="#6a7a2a" stroke-width="2"/><circle cx="330" cy="76" r="66" fill="#2a5a8a" fill-opacity=".18" stroke="#2a5a8a" stroke-width="2"/>' +
    '<text x="120" y="20" fill="#4a5a1a">BAD AIR says</text><text x="320" y="20" fill="#1a4a7a">WATER says</text>' +
    '<text x="232" y="72">fits</text><text x="228" y="90">both</text><text x="140" y="84">fits only</text><text x="140" y="100">this one</text><text x="350" y="84">fits only</text><text x="350" y="100">this one</text>' +
    '<text x="186" y="146" font-style="italic">count the cases out here</text></g></svg>';
  X.TWO = '<h4>Where two explanations disagree</h4><h5>Dr Snow &middot; a note sent round to the brewery</h5>' + TWOSVG +
    '<p>Two explanations, or <b>theories</b>, that fit the same crowd of bars can only be told apart where they say different things. So find the places where they disagree.</p>' +
    '<p><b>Bad air</b> says: whoever breathes the foul air of these streets is in danger, so a building in the middle of the stink should suffer like its neighbours. <b>Water</b> says: whoever drinks from the pump is in danger, so a building in the middle of the stink that has water of its own should escape.</p>' +
    '<p>Do not count the cases that fit both: they prove nothing either way. Count the ones that fit only one: they are the <b>evidence</b>. A case that seems not to fit, an <b>exception</b>,, once properly explained, is worth more than a hundred that do.</p>';
  X.WHNOTE = '<h4>St James&rsquo;s Workhouse, Poland Street</h4><h5>From the Master&rsquo;s Office, 7th September</h5>' +
    '<p>Inmates living in the house when the cholera began: <span class="fig">535</span>. Deaths from cholera among them: <span class="fig">5</span>. (Persons brought in from the streets already ill, who died here, are not counted with the inmates: they were taken ill outside.)</p>' +
    '<p>Water: our own <b>pump-well</b> in the yard, besides the Grand Junction Company&rsquo;s supply. No inmate is sent to Broad Street for water.</p>' +
    '<p>The relieving officer reckons that the streets round us on three sides have lost <b>about one person in every five</b> of those who stayed.</p>';
  X.LANTERN = '<h4>The Weekly Lantern</h4><h5>Wednesday, September 6, 1854 &middot; Price Twopence</h5><h6>CHOLERA AT HAMPSTEAD</h6>' +
    '<p>We learn with regret that a lady of West End, the widow of a well-known manufacturer, died of cholera on Saturday last. She had, no doubt, taken the disease on a visit to her late husband&rsquo;s works in Broad Street, Soho, a district whose foul air has this week claimed so many.</p>' +
    '<p>Our own heights, we are happy to say, remain perfectly healthy, and the breezes of the Heath are the best physician.</p>';
  X.CART = '<h4>Eley&rsquo;s cart book</h4><h5>Kept by the carter; copied into your book by Florrie, who reads it upside down</h5>' +
    '<p><b>Wed 30 Aug.</b> West End: 1 stone bottle, pump water, for Mrs E., as usual. Cases to the Great Northern.</p>' +
    '<p><b>Thurs 31 Aug.</b> West End: 1 stone bottle, pump water, for Mrs E., as usual. Filled 7 o&rsquo;clock. Gone up 8.</p>' +
    '<p><b>Fri 1 Sept.</b> No cart. Works shut.</p>';
  X.ORDERS = '<h4>Standing Orders</h4><h5>Board of Guardians of the Poor &middot; St James, Westminster</h5>' +
    '<p><b>No. 7.</b> Any person who is not a member, and is permitted to address the Board, shall:</p><ol>' +
    '<li>first, say in one sentence what he asks the Board to <i>do</i>;</li>' +
    '<li>second, give the facts on which he relies, <i>the plainest first</i>: that is, what any member could see for himself;</li>' +
    '<li>third, give the facts that need more explaining;</li>' +
    '<li>fourth, say what will be said <i>against</i> him (the <b>objections</b>), and answer it, before any member is put to the trouble of saying it;</li>' +
    '<li>last, say what it will <i>cost</i> the parish.</li></ol>' +
    '<p>He shall not speak for more than ten minutes, and shall not read from a book.</p>';
  return X;
})();
