/* Only What Was Asked - small helpers that every room of the story shares. Loaded after engine.js.
   Nothing in here knows an answer: what TALLY says to each question is written in the room that asks it. */
window.SLP = (function () {
  'use strict';
  var X = {}, D = document;
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };
  function el(t, cls, html) { var e = D.createElement(t); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ---------- sounds (through the engine, so the sound button switches them) ---------- */
  X.sfx = {
    key: function () { B({ dur: 0.022, f: 2900, q: 3, peak: 0.13 }); },
    beep: function () { T({ type: 'triangle', f: 1046, dur: 0.07, peak: 0.07 }); T({ type: 'triangle', f: 1318, dur: 0.09, peak: 0.06, when: 0.08 }); },     /* TALLY has an answer */
    nope: function () { T({ type: 'triangle', f: 330, dur: 0.12, peak: 0.08 }); T({ type: 'triangle', f: 262, dur: 0.16, peak: 0.07, when: 0.12 }); },
    print: function () { for (var i = 0; i < 6; i++) B({ dur: 0.04, f: 3400, q: 2, peak: 0.07, when: i * 0.06 }); },
    hiss: function (d) { B({ type: 'highpass', f: 3000, dur: d || 1.4, peak: 0.08, a: 0.2 }); },
    clip: function () { B({ dur: 0.03, f: 4200, q: 4, peak: 0.2 }); T({ f: 700, f2: 520, dur: 0.05, peak: 0.08, when: 0.02 }); },
    flag: function () { T({ f: 240, f2: 180, dur: 0.06, peak: 0.2 }); B({ dur: 0.03, f: 1500, q: 2, peak: 0.16 }); },
    shutter: function () { B({ dur: 0.03, f: 5000, q: 2, peak: 0.18 }); B({ dur: 0.05, f: 2400, q: 2, peak: 0.12, when: 0.09 }); },
    slide: function () { B({ type: 'bandpass', f: 900, f2: 1400, q: 1.2, dur: 0.12, peak: 0.08 }); },
    lever: function () { T({ f: 140, f2: 70, dur: 0.25, peak: 0.4 }); B({ dur: 0.06, f: 1700, q: 1, peak: 0.2 }); },
    rumble: function (d) { T({ type: 'sawtooth', f: 41, f2: 46, dur: d || 3, peak: 0.12, a: 0.8 }); B({ type: 'lowpass', f: 240, dur: d || 3, peak: 0.12, a: 0.8 }); },
    down: function (d) { T({ type: 'sawtooth', f: 46, f2: 30, dur: d || 3, peak: 0.12, a: 0.05 }); B({ type: 'lowpass', f: 260, f2: 80, dur: d || 3, peak: 0.12, a: 0.05 }); },
    kettle: function () { B({ type: 'bandpass', f: 1800, f2: 2600, q: 3, dur: 1.6, peak: 0.05, a: 0.6 }); },
    hm: function () { T({ type: 'triangle', f: 150, f2: 118, dur: 0.26, peak: 0.12, a: 0.05 }); }
  };

  /* A door opens: the room's music answers in its own key, as after ER.exit; without music, three plain notes. */
  X.solved = function (quiet) {
    var sung = false;
    try { sung = !!(ER.music && ER.music() && ER.track && ER.track.sting('solved', null, !!quiet)); } catch (e) {}
    if (!sung && !quiet) ER.sfx.ok();
  };
  X.done = function (id) { var st = ER.state(); st.done = st.done || {}; st.done[id] = 1; ER.persist(true); };
  /* a thing in the scene that has a name and something to say */
  X.thing = function (sel, word, line, busy) {
    ER.$$(sel).forEach(function (n) {
      n.addEventListener('click', function (e) {
        if (busy && busy()) return;
        if (word) ER.wordAt(e.clientX, e.clientY, word);
        var t = typeof line === 'function' ? line() : line;
        if (t) ER.say(t);
      });
    });
  };
  /* your own notes: pencil on the back of a pod's checklist */
  X.mine = function (id, title, html, quiet) { return ER.addClue(id, title, '<h4>' + title + '</h4>' + html, 'mine', 'Your notes', quiet); };
  X.learn = function (list) {
    var G = window.GLOSS || [];
    list.forEach(function (w) {
      for (var i = 0; i < G.length; i++) if (G[i][0].toLowerCase() === w.toLowerCase()) { ER.addWord(G[i][0], G[i][1]); return; }
    });
  };
  X.bump = function (flag) { var n = (ER.flag(flag) || 0) + 1; ER.flag(flag, n); return n; };
  X.minutes = function () {
    var st = ER.state(), secs = st.fin && st.fin.secs ? st.fin.secs : (st.secs || 0);
    return Math.max(1, Math.round(secs / 60));
  };
  /* one thing after another, each after its own wait (setTimeout, so that a hidden tab does not stop it half way) */
  X.seq = function (steps, done) {
    var i = 0, t = 0, dead = false;
    function next() {
      if (dead) return;
      if (i >= steps.length) { if (done) done(); return; }
      var s = steps[i++];
      t = setTimeout(function () { if (dead) return; if (s[1]) s[1](); next(); }, s[0]);
    }
    next();
    return function () { dead = true; clearTimeout(t); };
  };

  /* ---------- TALLY's question line ----------
     Words are buttons; a click puts the word at the end of the line. ASK sends the line, and the room decides what
     TALLY says: o.reply(line) gets the line in small letters ("what is the ship doing?") and returns
     {t: 'what TALLY says', id: 'a name for this answer', bad: true if it is no answer at all} or null.
     o = {words: [...], title, note, reply(line), onReply(r, line)}.  Returns {el, add(word), clear(), say(text), busy(bool)} */
  X.ask = function (host, o) {
    var box = el('div', 'tq'), line = [], busy = false;
    box.innerHTML = '<div class="tq-scr"><div class="tq-head"><b>TALLY</b><span></span></div><div class="tq-log"></div>' +
      '<div class="tq-line"><i>&gt;</i><span class="tq-q"></span><u class="tq-cur">_</u></div></div>' +
      '<div class="tq-keys"></div><div class="tq-foot"><span></span><button type="button" class="btn tq-back">&#9003;</button>' +
      '<button type="button" class="btn tq-clear">Clear</button><button type="button" class="btn tq-ask">Ask</button></div>';
    host.appendChild(box);
    box.querySelector('.tq-head span').textContent = o.title || 'Ship’s computer · answers questions';
    box.querySelector('.tq-foot span').textContent = o.note || 'Click words to make a question. Then ASK.';
    var keys = box.querySelector('.tq-keys'), logEl = box.querySelector('.tq-log'), qEl = box.querySelector('.tq-q');
    function add(w, fresh) {
      if (ER.$$('.tq-k', keys).some(function (k) { return k.getAttribute('data-w') === w; })) return;
      var b = el('button', 'tq-k' + (w === '?' ? ' qm' : '') + (fresh ? ' new' : '')); b.type = 'button'; b.textContent = w; b.setAttribute('data-w', w);
      keys.appendChild(b);
    }
    (o.words || []).forEach(function (w) { add(w); });
    function paint() { qEl.textContent = line.join(' ').replace(/ \?/g, '?'); }
    function text() { return line.join(' ').replace(/ \?/g, '?').toLowerCase().replace(/\s+/g, ' ').trim(); }
    function say(t, cls) {
      var p = el('p', cls || 'a', t); logEl.appendChild(p);
      while (logEl.children.length > 14) logEl.removeChild(logEl.firstChild);
      logEl.scrollTop = logEl.scrollHeight; return p;
    }
    keys.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.tq-k') : null; if (!b || busy) return;
      if (line.length >= 12) { ER.shake(qEl.parentNode); return; }
      b.classList.remove('new');
      line.push(b.getAttribute('data-w')); X.sfx.key(); paint();
    });
    box.querySelector('.tq-back').addEventListener('click', function () { if (!busy && line.length) { line.pop(); X.sfx.key(); paint(); } });
    box.querySelector('.tq-clear').addEventListener('click', function () { if (!busy) { line = []; X.sfx.key(); paint(); } });
    box.querySelector('.tq-ask').addEventListener('click', function () {
      if (busy) return;
      var q = text();
      if (!q) { ER.shake(qEl.parentNode); return; }
      var shown = line.join(' ').replace(/ \?/g, '?');
      say(shown, 'q');
      line = []; paint(); busy = true; box.classList.add('busy');
      setTimeout(function () {
        busy = false; box.classList.remove('busy');
        var r = o.reply(q) || { t: 'I cannot read that as a question.', bad: true };
        var p = say(ER.gloss(r.t), r.bad ? 'a x' : 'a');
        if (r.id) p.setAttribute('data-id', r.id);
        if (r.bad) X.sfx.nope(); else X.sfx.beep();
        if (o.onReply) o.onReply(r, q);
      }, 520);
    });
    return { el: box, add: function (w) { add(w, true); }, clear: function () { line = []; paint(); }, say: say, busy: function (b) { busy = !!b; box.classList.toggle('busy', busy); } };
  };
  /* the answers TALLY gives to any line that is not a question it knows */
  X.fallback = function (q) {
    if (!/\?$/.test(q)) return { t: 'That is not a question. I do not take orders or news. I take questions.', bad: true };
    if (/^(is|are|will|can|did|was|were|has|have|does|do)\b/.test(q)) return { t: 'I cannot answer that question with a yes or a no. Look at the order of the words.', bad: true };
    if (/^(what|when|who|where|why|how)\b/.test(q)) return { t: 'I do not understand the question. Look at the order of the words.', bad: true };
    return { t: 'I cannot read that as a question. A question begins with a question word, or with IS, ARE, WILL, CAN or DID.', bad: true };
  };
  return X;
})();
