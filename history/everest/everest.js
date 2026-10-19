/* Snow Conditions Bad - what every room of the story shares: a few sounds, faces, a time setter, the papers that
   are needed in more than one room, and small helpers. Loaded after engine.js. Nothing in here knows an answer. */
window.EV = (function () {
  'use strict';
  var X = {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds (through the engine, so the sound button switches them) ---------- */
  X.sfx = {
    type: function (n) { for (var i = 0; i < (n || 1); i++) { B({ dur: 0.03, f: 2300 + (i % 3) * 300, q: 3, peak: 0.16, when: i * 0.09 }); T({ f: 160, dur: 0.03, peak: 0.08, when: i * 0.09 }); } },
    ding: function () { T({ f: 1760, dur: 0.6, peak: 0.06 }); T({ f: 2640, dur: 0.35, peak: 0.025 }); },
    stamp: function () { T({ f: 140, f2: 70, dur: 0.12, peak: 0.35 }); B({ dur: 0.04, f: 1200, q: 1, peak: 0.2 }); },
    pin: function () { B({ dur: 0.025, f: 4200, q: 4, peak: 0.18 }); T({ f: 210, dur: 0.05, peak: 0.08 }); },
    step: function () { B({ type: 'lowpass', f: 500, dur: 0.12, peak: 0.25, a: 0.01 }); },
    gust: function () { B({ type: 'bandpass', f: 500, f2: 900, q: 0.6, dur: 2.2, peak: 0.12, a: 0.7 }); },
    crackle: function (n) { for (var i = 0; i < (n || 6); i++) B({ type: 'highpass', f: 2500 + (i * 731) % 2400, dur: 0.03 + (i % 3) * 0.03, peak: 0.08, when: i * 0.11 + (i % 2) * 0.05 }); },
    tick: function () { B({ dur: 0.02, f: 5000, q: 6, peak: 0.12 }); },
    teleprinter: function (n) { for (var i = 0; i < (n || 10); i++) { B({ dur: 0.025, f: 1800 + (i % 4) * 200, q: 2, peak: 0.12, when: i * 0.07 }); } },
    pencil: function () { B({ type: 'highpass', f: 3000, dur: 0.12, peak: 0.05, a: 0.03 }); },
    pour: function () { B({ type: 'bandpass', f: 900, f2: 1600, q: 2, dur: 0.9, peak: 0.06, a: 0.1 }); }
  };

  /* A door opens: the music answers in the room's own key, as it does after ER.exit (these rooms leave through
     ER.exitOk and ER.leave, because something is always said between the lock and the door). */
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
  /* words that went over a wire are always set in typewriter letters */
  X.said = function (w) { return '<span class="said">' + w + '</span>'; };

  /* ---------- times: minutes after midnight -> "16.45" ---------- */
  X.clock = function (m) { m = ((m % 1440) + 1440) % 1440; var h = Math.floor(m / 60), n = m % 60; return (h < 10 ? '0' : '') + h + '.' + (n < 10 ? '0' : '') + n; };
  X.dur = function (m) { var h = Math.floor(m / 60), n = m % 60; return h + ' h ' + (n < 10 ? '0' : '') + n; };

  /* ---------- a setter: two brass buttons and a window. o = {val, min, max, step, fmt, onChange} ---------- */
  X.setter = function (o) {
    var el = ER.el('span', 'ts', '<button type="button" class="ts-dn" aria-label="less">&minus;</button><output></output><button type="button" class="ts-up" aria-label="more">+</button>');
    var v = o.val, out = el.querySelector('output');
    function paint() { out.textContent = (o.fmt || X.clock)(v); el.setAttribute('data-v', v); }
    function step(d) {
      if (el.classList.contains('done')) return;
      v = Math.max(o.min, Math.min(o.max, v + d * (o.step || 15)));
      el.classList.remove('ok', 'no'); paint(); X.sfx.tick(); if (o.onChange) o.onChange(v);
    }
    el.querySelector('.ts-dn').addEventListener('click', function () { step(-1); });
    el.querySelector('.ts-up').addEventListener('click', function () { step(1); });
    paint();
    return { el: el, get: function () { return v; }, set: function (n) { v = n; paint(); },
      mark: function (s) { el.classList.remove('ok', 'no', 'done'); if (s) el.classList.add(s); if (s === 'ok') el.classList.add('done'); } };
  };

  /* ---------- faces, for the people you talk to ---------- */
  var F = {
    phurba: { skin: '#a0673f', hair: '#1a1410', coat: '#5a2f22', trim: '#c9a25a', hat: 'wool', hatc: '#b5402e' },
    morris: { skin: '#e2a483', hair: '#3a2a1c', coat: '#4a6a7a', trim: '#2c3e48', burn: 1, hood: 1 },
    vohra: { skin: '#8a5a3a', hair: '#141110', coat: '#a08a5a', trim: '#6b5a33', hat: 'beret', hatc: '#20304a', tache: 1 },
    dunmore: { skin: '#efc9ad', hair: '#9a7a52', coat: '#e9e6dc', trim: '#1d2a4a', specs: 1, tie: '#1d2a4a' },
    baptiste: { skin: '#7a4a2e', hair: '#141110', coat: '#d8ccb0', trim: '#7a1d14', hat: 'panama', hatc: '#efe6cc', tie: '#7a1d14' },
    thwaite: { skin: '#eab89a', hair: '#7d7468', coat: '#f2efe6', trim: '#4a3a2a', bald: 1, specs: 1, vest: '#3d3b44', tie: '#7a1d14' },
    okoro: { skin: '#5a3624', hair: '#141110', coat: '#f2efe6', trim: '#22314a', specs: 1, tie: '#22314a', phones: 1 }
  };
  X.FACE = function (k) {
    var p = F[k] || F.phurba, s = '<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">';
    s += '<path d="M18 240q8-70 82-78q74 8 82 78z" fill="' + p.coat + '"/>';
    if (p.vest) s += '<path d="M66 172q34 30 68 0l8 68H58z" fill="' + p.vest + '"/>';
    s += '<path d="M82 160l18 22 18-22" fill="' + (p.tie ? '#f6f3ea' : p.trim) + '"/>';
    if (p.tie) s += '<path d="M96 178h8l4 40-8 10-8-10z" fill="' + p.tie + '"/>';
    if (p.hood) s += '<path d="M44 196q-6-60 56-66q62 6 56 66" fill="none" stroke="' + p.trim + '" stroke-width="12"/>';
    if (p.phones) s += '<path d="M62 92q38-56 76 0" fill="none" stroke="#1a1a1a" stroke-width="6"/><rect x="54" y="88" width="14" height="26" rx="5" fill="#1a1a1a"/><rect x="132" y="88" width="14" height="26" rx="5" fill="#1a1a1a"/>';
    s += '<rect x="88" y="132" width="24" height="34" fill="' + p.skin + '"/>';
    s += '<ellipse cx="100" cy="100" rx="38" ry="46" fill="' + p.skin + '"/>';
    if (!p.bald) s += '<path d="M62 96q0-52 38-52t38 52q-8-26-38-28q-30 2-38 28z" fill="' + p.hair + '"/>';
    else s += '<path d="M62 104q-2-20 6-30M138 104q2-20-6-30" stroke="' + p.hair + '" stroke-width="8" fill="none"/>';
    if (p.burn) s += '<ellipse cx="82" cy="110" rx="9" ry="5" fill="#d0705a" opacity=".55"/><ellipse cx="118" cy="110" rx="9" ry="5" fill="#d0705a" opacity=".55"/>';
    s += '<circle cx="86" cy="100" r="3.4" fill="#1b1512"/><circle cx="114" cy="100" r="3.4" fill="#1b1512"/>';
    s += '<path d="M78 90q8-5 16 0M106 90q8-5 16 0" stroke="' + p.hair + '" stroke-width="3" fill="none"/>';
    if (p.specs) s += '<g fill="none" stroke="#2a2a2a" stroke-width="2.5"><circle cx="86" cy="101" r="10"/><circle cx="114" cy="101" r="10"/><path d="M96 101h8"/></g>';
    if (p.tache) s += '<path d="M86 124q14-8 28 0q-14 5-28 0z" fill="#141110"/>';
    s += '<path d="M90 130q10 5 20 0" stroke="#5a2a20" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    if (p.hat === 'wool') s += '<path d="M60 82q0-46 40-46t40 46z" fill="' + p.hatc + '"/><path d="M60 82h80" stroke="#f1e2c0" stroke-width="7"/><circle cx="100" cy="34" r="7" fill="#f1e2c0"/><path d="M66 70h68M64 58h72" stroke="#f1e2c0" stroke-width="2" stroke-dasharray="4 4"/>';
    if (p.hat === 'beret') s += '<path d="M58 74q4-30 46-30q36 2 38 26q-40-10-84 4z" fill="' + p.hatc + '"/><circle cx="72" cy="66" r="5" fill="#c9a25a"/>';
    if (p.hat === 'panama') s += '<ellipse cx="100" cy="66" rx="66" ry="12" fill="' + p.hatc + '"/><path d="M68 66q0-34 32-34t32 34z" fill="' + p.hatc + '"/><path d="M68 60h64" stroke="#3a2a1c" stroke-width="5"/>';
    return s + '</svg>';
  };

  /* ---------- papers that are needed in more than one room ---------- */
  X.DESK = '<h4>Codes and ciphers</h4><h5>From the Foreign Desk, Printing House Square. Keep with the card.</h5>' +
    '<p>A <b>cipher</b> changes letters. EVEREST becomes FWFSFTU. Anybody who sees a cipher knows at once that there is a secret, and a secret is worth money to a rival.</p>' +
    '<p>A <b>code</b> changes meanings. One whole phrase stands for one whole message, and the phrase can be anything at all. Ours are made of ordinary mountain news, and the best news sounds the worst. An operator who reads SNOW CONDITIONS BAD will yawn and send it on. Nobody steals a weather report.</p>' +
    '<p>So read the card, not the words. A phrase means what the card says, and nothing else. A phrase that is not on the card means nothing at all, so it must arrive exactly as you wrote it.</p>' +
    '<p>London must have your message by <span class="fig">11 p.m.</span>, London time, on Monday 1 June, to print it on the morning of the Coronation.</p>';
  X.CODE = '<h4>The Times &middot; Everest &middot; 1953</h4><h5>Code card. Keep it on you, never in a tent.</h5><div class="cc"><div>' +
    '<h6>I. THE NEWS (begin with one)</h6><table>' +
    '<tr><td>SNOW CONDITIONS BAD</td><td>The summit has been reached.</td></tr>' +
    '<tr><td>WEATHER IMPROVING</td><td>An attempt has failed. Another will follow.</td></tr>' +
    '<tr><td>ROUTE TO COL OPEN</td><td>No more attempts this year.</td></tr>' +
    '<tr><td>WIND STRONG</td><td>Nothing to report yet. All safe.</td></tr></table>' +
    '<h6>III. THE RULES</h6><ol><li>The news first.</li><li>Then the climbers who reached the summit, in the order of the alphabet.</li>' +
    '<li>After the first climber, one word for the day of the climb, counted from the day you write the message: TODAY, YESTERDAY, or RECENTLY (two days ago, or more).</li>' +
    '<li>STOP between the parts.</li></ol></div><div>' +
    '<h6>II. THE CLIMBERS</h6><table>' +
    '<tr><td>AWAITING PORTERS</td><td>Bourdillon</td></tr><tr><td>AWAITING MAIL</td><td>Evans</td></tr>' +
    '<tr><td>ICEFALL DIFFICULT</td><td>Gregory</td></tr><tr><td>ADVANCED BASE ABANDONED</td><td>Hillary</td></tr>' +
    '<tr><td>CAMP FIVE ABANDONED</td><td>Hunt</td></tr><tr><td>ADVANCED BASE OCCUPIED</td><td>Lowe</td></tr>' +
    '<tr><td>LHOTSE FACE ICY</td><td>Noyce</td></tr><tr><td>AWAITING IMPROVEMENT</td><td>Tenzing</td></tr></table>' +
    '<p style="margin-top:8px">For the rest of the party, see the back of the card.</p></div></div>';
  var OXSVG = '<svg viewBox="0 0 600 150"><g font-family="\'Courier Prime\',monospace" font-size="13" fill="#22201b">' +
    '<text x="10" y="18" font-weight="700">OXYGEN IN ONE BREATH</text>' +
    '<text x="10" y="44">sea level</text><text x="10" y="76">Base Camp</text><text x="10" y="108">summit</text></g>' +
    '<g fill="#7a1d14"><circle cx="110" cy="40" r="7"/><circle cx="128" cy="40" r="7"/><circle cx="146" cy="40" r="7"/><circle cx="164" cy="40" r="7"/><circle cx="182" cy="40" r="7"/><circle cx="200" cy="40" r="7"/>' +
    '<circle cx="110" cy="72" r="7"/><circle cx="128" cy="72" r="7"/><circle cx="146" cy="72" r="7"/><circle cx="110" cy="104" r="7"/><circle cx="128" cy="104" r="7"/></g>' +
    '<g fill="none" stroke="#7a1d14" stroke-width="1.5"><circle cx="164" cy="72" r="7"/><circle cx="182" cy="72" r="7"/><circle cx="200" cy="72" r="7"/><circle cx="146" cy="104" r="7"/><circle cx="164" cy="104" r="7"/><circle cx="182" cy="104" r="7"/><circle cx="200" cy="104" r="7"/></g>' +
    '<g stroke="#22201b" stroke-width="2" fill="none"><rect x="262" y="34" width="26" height="70" rx="10" fill="#d97a2b"/><path d="M288 52h30"/><rect x="318" y="44" width="16" height="16"/><path d="M334 52q20 0 26 20"/><path d="M352 70q10-10 22 0v18q-10 10-22 0z" fill="#e9e6dc"/>' +
    '<path d="M380 80h26" stroke-dasharray="4 4"/><path d="M400 74l8 6-8 6"/>' +
    '<rect x="452" y="34" width="26" height="70" rx="10" fill="#d97a2b"/><path d="M478 52h20"/><ellipse cx="516" cy="54" rx="18" ry="14" fill="#e9e6dc"/><path d="M534 54q16 0 20 16"/>' +
    '<path d="M546 68q10-10 22 0v18q-10 10-22 0z" fill="#e9e6dc"/><path d="M552 92q-4 30-40 32h-10"/><rect x="474" y="114" width="28" height="18" rx="3" fill="#c9c3ae"/><path d="M474 122q-10-30 26-54"/></g>' +
    '<g font-family="\'Courier Prime\',monospace" font-size="12" fill="#22201b"><text x="262" y="126">OPEN-CIRCUIT</text><text x="350" y="62">mask</text><text x="380" y="100">out to the air</text>' +
    '<text x="452" y="148">CLOSED-CIRCUIT</text><text x="502" y="36">bag</text><text x="404" y="128">soda lime</text></g></svg>';
  X.OXY = '<h4>Oxygen notes</h4><h5>Typed at Base Camp for everybody, April 1953. Pinned to a crate.</h5><div class="two"><div>' +
    '<p><b>THIN AIR.</b> The higher you go, the thinner the air. At Base Camp, about 5,400 m up, each breath holds about half the oxygen of a breath at sea level. On the summit, 29,002 feet (about 8,840 m), it holds about a third.</p>' +
    '<p><b>GETTING USED TO IT.</b> Over days and weeks the body breathes faster and makes more red blood cells to carry oxygen. This is <b>acclimatisation</b>, and it cannot be hurried. So we climb high to carry loads, and come down to sleep, again and again.</p>' +
    '<p><b>MOUNTAIN SICKNESS.</b> Go up too fast and you get a headache, you feel sick, you cannot get your breath. Rest helps a little. Going down helps most, and quickest. Never go on up.</p></div><div>' +
    '<p><b>TWO SETS.</b> Open-circuit: you breathe the air round you, with oxygen added from the bottle, and breathe out into the air. Closed-circuit: pure oxygen from a bag; soda lime takes out what you breathe out, and the oxygen goes round again. It goes further, but it is heavier and harder to mend.</p></div></div>' + OXSVG;
  X.PLAN = '<h4>THE ASSAULT</h4>' +
    '<p><b>1st pair</b> &mdash; BOURDILLON &middot; EVANS &mdash; closed-circuit sets &mdash; from the South Col.</p>' +
    '<p class="pen">26 May: reached the South Summit. Turned back. Both safe.</p>' +
    '<p><b>2nd pair</b> &mdash; TENZING &middot; HILLARY &mdash; open-circuit sets &mdash; from a top camp above the Col, carried up by Lowe, Gregory and Ang Nyima.</p>' +
    '<p>Everybody else: carry, wait, and keep out of the way of the cook.</p>';
  var ROUTE = '<svg viewBox="0 0 560 230"><g font-family="\'Caveat\',cursive" font-size="17" fill="#2f3a55">' +
    '<path d="M20 30L130 62 230 112 310 140 350 160 395 155 415 150 450 196 500 180 540 186" fill="none" stroke="#2f3a55" stroke-width="3"/>' +
    '<path d="M310 140Q352 40 415 150" fill="none" stroke="#8c2f24" stroke-width="2.5" stroke-dasharray="7 5"/>' +
    '<g fill="#2f3a55"><circle cx="20" cy="30" r="5"/><circle cx="130" cy="62" r="5"/><circle cx="230" cy="112" r="5"/><circle cx="310" cy="140" r="5"/><circle cx="415" cy="150" r="5"/><circle cx="540" cy="186" r="5"/></g>' +
    '<text x="10" y="18">Base Camp 5,400</text><text x="104" y="52">Lobuje 4,900</text><text x="196" y="104">Pheriche 4,250</text><text x="254" y="166">Pangboche 3,950</text>' +
    '<text x="392" y="138">Thyangboche 3,870</text><text x="482" y="212">Namche 3,440</text>' +
    '<text x="40" y="74" fill="#6b7491">9 km, stones on ice</text><text x="150" y="106" fill="#6b7491">8 km, down</text><text x="226" y="148" fill="#6b7491">6 km, down</text>' +
    '<text x="324" y="190" fill="#6b7491">6 km: down to the river,</text><text x="324" y="208" fill="#6b7491">then up 200 m</text>' +
    '<text x="330" y="66" fill="#8c2f24">high path: 4 km, up 600 m</text>' +
    '<text x="430" y="226" fill="#6b7491">10 km: down to the bridge, then up 300 m</text></g></svg>';
  X.RULE = '<p>Phurba does not read, so last month you wrote down his rule for him, word for word.</p>' +
    '<p><b>On the ice.</b> From Base Camp down to Lobuje the path is stones on top of the glacier. Even I go slowly there: 3 kilometres in an hour.</p>' +
    '<p><b>On the path.</b> Below Lobuje, downhill or level: 4 kilometres in an hour.</p>' +
    '<p><b>Uphill.</b> For every 100 metres you climb, add a quarter of an hour. (The little ups and downs are in the speeds already.)</p>' +
    '<p><b>Rest.</b> Half an hour for tea, all together, or your legs will make you pay for it later.</p>' +
    '<p><b>An honest time.</b> Add it up, then say &ldquo;about&rdquo;. A man who promises you a minute has never walked this path.</p>' + ROUTE;
  X.MAIL = '<h4>The Times &middot; Everest mail</h4><h5>A card for the runners&rsquo; boss. Read it to them.</h5>' +
    '<p>Runners carry the expedition&rsquo;s letters from Base Camp to Kathmandu: about 180 miles of path, up over the ridges, down to the rivers and up again. A good runner takes <b>eight days</b>. Do not ask him to run. Ask him to arrive.</p>' +
    '<p>So what goes by runner is old when it gets there. A letter written at Base Camp on a Sunday reaches Kathmandu on the Monday of the week after.</p>' +
    '<p>For news that cannot wait, the runner goes only as far as <b>Namche Bazar</b>. There is a wireless post there, and from Namche to Kathmandu by wireless takes minutes, not days.</p>';
  var CLOCKS = '<svg viewBox="0 0 250 250"><g font-family="\'IBM Plex Mono\',monospace" font-size="12" fill="#18241c" text-anchor="middle">' +
    '<g fill="#fff" stroke="#18241c" stroke-width="2"><circle cx="125" cy="44" r="32"/><circle cx="50" cy="196" r="32"/><circle cx="200" cy="196" r="32"/></g>' +
    '<g stroke="#18241c" stroke-width="3" stroke-linecap="round"><path d="M125 44v-20M125 44h14"/><path d="M50 196v-20M50 196l-12 8"/><path d="M200 196v-20M200 196l12-7"/></g>' +
    '<text x="125" y="94">G.M.T.</text><text x="50" y="244">LONDON, summer</text><text x="200" y="244">INDIA &amp; NEPAL</text>' +
    '<g fill="none" stroke="#7a1d14" stroke-width="2"><path d="M146 70l38 96"/><path d="M104 70l-38 96"/></g>' +
    '<text x="196" y="122" fill="#7a1d14" font-weight="600">+5 h 30</text><text x="58" y="122" fill="#7a1d14" font-weight="600">+1 h</text></g></svg>';
  X.WIRELESS = '<h4>Wireless post &middot; Namche Bazar</h4><div class="two"><div>' +
    '<p><b>SCHEDULE.</b> This set talks to Kathmandu once a day, at <b>1130 G.M.T.</b> The batteries are charged by a small engine and must last. At other times the set is silent.</p>' +
    '<p><b>TIME.</b> Every wireless log in the world is kept in G.M.T., Greenwich Mean Time, so that a time means the same thing at both ends. Clocks in India and Nepal: G.M.T. + 5 hours 30 minutes. Clocks in Britain: G.M.T. in winter, but in summer Britain puts them one hour forward. That is British Summer Time, G.M.T. + 1 hour (in 1953, from 19 April to 4 October).</p>' +
    '<p>Going east, clocks are ahead. Going west, they are behind. Cross midnight, and the date changes too.</p>' +
    '<p><b>MESSAGES</b> are sent exactly as they are written. The operator does not correct them.</p></div>' + CLOCKS + '</div>';
  X.CHANCERY = '<h4>Before anything goes to London</h4><h5>British Embassy, Kathmandu &middot; Chancery rule card</h5>' +
    '<p>Ask four questions of every report. <b>Who</b> wrote it? <b>Where</b> was he? <b>When?</b> And <b>how could he know?</b></p>' +
    '<p>A report can be no newer than the news inside it. A letter written today about something seen a week ago is a week old, however fresh the ink. When news has travelled, find the day it set out.</p>' +
    '<p>If that day is before the thing the report describes, the writer did not see it, and nobody who saw it told him. It is a guess or a rumour, however right it may turn out to be.</p>';
  X.TIMETABLE = '<h4>The Coronation number</h4><p>Tuesday 2 June. All times on this board are <b>London</b> times.</p>' +
    '<table><tr><td>Last news for the paper</td><td><b>11.00 p.m.</b></td></tr><tr><td>Plates</td><td>11.30 p.m.</td></tr><tr><td>Presses</td><td>midnight</td></tr><tr><td>Vans to the trains</td><td>from 1.00 a.m.</td></tr></table>' +
    '<p>From the moment a message arrives: decode and check it, <b>15 minutes</b>. Write the story, <b>45 minutes</b>. Set it in type and read the proofs, <b>1 hour</b>.</p>' +
    '<p>Telegrams from Kathmandu come through Delhi. Foreign stamps are local times: change them before you panic.</p>';
  return X;
})();
