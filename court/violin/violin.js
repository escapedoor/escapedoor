/* So That You Are Sure - small helpers that every room of the story shares. Loaded after engine.js.
   Nothing in here knows an answer. */
window.VN = (function () {
  'use strict';
  var X = {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  /* ---------- sounds (through the engine, so the sound button switches them).
     This is a story about a musician: nothing here has a pitch that could be heard as a tune, nothing ticks and nothing knocks. ---------- */
  X.sfx = {
    card: function () { B({ type: 'highpass', f: 1800, dur: 0.08, peak: 0.12, a: 0.01 }); },                                          /* an index card on a table */
    tab: function () { B({ type: 'highpass', f: 2600, f2: 4200, dur: 0.12, peak: 0.08, a: 0.02 }); },                                 /* a sticky tab pressed down */
    pen: function () { B({ type: 'highpass', f: 3200, dur: 0.26, peak: 0.07, a: 0.05 }); },                                           /* a highlighter across a line */
    wheel: function () { B({ type: 'lowpass', f: 700, dur: 0.06, peak: 0.12 }); },                                                    /* a measuring wheel on paving stones */
    string: function () { B({ type: 'bandpass', f: 1300, q: 0.8, dur: 0.1, peak: 0.07, a: 0.01 }); },                                /* a length of string pulled tight */
    door: function () { T({ f: 90, f2: 55, dur: 0.35, peak: 0.4 }); B({ type: 'lowpass', f: 900, dur: 0.25, peak: 0.3 }); },          /* a steel door in the cells */
    keys: function () { B({ dur: 0.07, f: 6200, q: 3, peak: 0.1 }); B({ dur: 0.06, f: 4700, q: 3, peak: 0.08, when: 0.08 }); },
    note: function () { B({ type: 'highpass', f: 2200, dur: 0.18, peak: 0.08, a: 0.03 }); },                                         /* a folded note passed forward */
    hm: function () { T({ type: 'triangle', f: 160, f2: 140, dur: 0.22, peak: 0.07, a: 0.05 }); }                                    /* a small doubtful sound, for a wrong try */
  };

  /* A door opens. The music answers in the room's own key, as it does after ER.exit (these rooms leave through
     ER.exitOk and ER.leave, because something is always said between the lock and the door); without music, three plain notes. */
  X.solved = function (quiet) {
    var sung = false;
    try { sung = !!(ER.music && ER.music() && ER.track && ER.track.sting('solved', null, !!quiet)); } catch (e) {}
    if (!sung && !quiet) ER.sfx.ok();
  };
  /* mark this room as done in the saved game (ER.exit does it; a room that uses ER.exitOk does it here) */
  X.done = function (id) { var st = ER.state(); st.done = st.done || {}; st.done[id] = 1; ER.persist(true); };

  /* a thing in the scene that has a name and something to say */
  X.thing = function (sel, word, line, busy) {
    ER.$$(sel).forEach(function (n) {
      n.addEventListener('click', function (e) {
        if (busy && busy()) return;
        if (word) ER.wordAt(e.clientX, e.clientY, word);
        if (line) ER.say(typeof line === 'function' ? line() : line);
      });
    });
  };
  /* a note of your own in the notebook */
  X.mine = function (id, title, html, quiet) { return ER.addClue(id, title, '<h4>' + title + '</h4>' + html, 'mine', 'Your notes', quiet); };
  /* the story's own words go into the notebook when they are first needed */
  X.learn = function (list) {
    var G = window.GLOSS || [];
    list.forEach(function (w) {
      for (var i = 0; i < G.length; i++) if (G[i][0].toLowerCase() === w.toLowerCase()) { ER.addWord(G[i][0], G[i][1]); return; }
    });
  };
  X.bump = function (flag) { var n = (ER.flag(flag) || 0) + 1; ER.flag(flag, n); return n; };
  /* a paper from the notebook, shown on top of whatever is open */
  X.look = function (id, missing) {
    var c = ER.state().clues.filter(function (x) { return x.id === id; })[0];
    var d = c ? ER.el('div', 'doc ' + c.c, ER.gloss(c.h)) : ER.el('div', 'doc typed', '<p>' + missing + '</p>');
    ER.sfx.paper(); ER.open('ov-read', d, null, { top: true });
  };
  /* minutes played, for the last page */
  X.minutes = function () {
    var st = ER.state(), secs = st.fin && st.fin.secs ? st.fin.secs : (st.secs || 0);
    return Math.max(1, Math.round(secs / 60));
  };
  return X;
})();
