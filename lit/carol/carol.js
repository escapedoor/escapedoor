/* The Boy in Sunday Clothes - what every room shares: a few sounds of its own, small helpers, and the pages of the book
   (Project Gutenberg eBook #46) that more than one room shows. Loaded after engine.js. Nothing in here knows an answer. */
(function () {
  'use strict';
  var X = window.CC = window.CC || {};
  var T = function (o) { try { ER.tone(o); } catch (e) {} }, B = function (o) { try { ER.burst(o); } catch (e) {} };

  X.sfx = {
    quill: function () { B({ type: 'highpass', f: 3800, dur: 0.12, peak: 0.05, a: 0.02 }); B({ type: 'highpass', f: 4400, dur: 0.1, peak: 0.04, a: 0.02, when: 0.14 }); },
    clink: function () { T({ f: 2600 + Math.random() * 500, dur: 0.18, peak: 0.06 }); T({ f: 4100 + Math.random() * 400, dur: 0.12, peak: 0.03, when: 0.01 }); },
    chain: function () { B({ dur: 0.08, f: 5200, q: 3, peak: 0.12 }); B({ dur: 0.07, f: 3600, q: 3, peak: 0.1, when: 0.09 }); B({ dur: 0.06, f: 4400, q: 3, peak: 0.08, when: 0.17 }); },
    clank: function () { T({ f: 180, f2: 90, dur: 0.25, peak: 0.3 }); B({ dur: 0.1, f: 2600, q: 2, peak: 0.16 }); },
    whoosh: function () { B({ type: 'bandpass', f: 400, f2: 1800, q: 0.7, dur: 0.9, peak: 0.1, a: 0.3 }); },
    snow: function () { B({ type: 'lowpass', f: 900, dur: 0.18, peak: 0.08, a: 0.03 }); },
    pluck: function () { T({ type: 'triangle', f: 392, dur: 0.4, peak: 0.08 }); },
    church: function () {                          /* London's bells on Christmas morning: shown on screen whenever they sound */
      [0, 0.42, 0.84, 1.26, 1.68, 2.1].forEach(function (w, i) { var f = [660, 590, 525, 495, 440, 392][i]; [1, 2.01, 2.76].forEach(function (m, j) { T({ f: f * m, dur: 1.4 / (j + 1), peak: 0.07 / (j + 1), when: w }); }); });
    }
  };
  X.solved = function (quiet) {
    var sung = false;
    try { sung = !!(ER.music && ER.music() && ER.track && ER.track.sting('solved', null, !!quiet)); } catch (e) {}
    if (!sung && !quiet) ER.sfx.ok();
  };
  X.thing = function (sel, word, line, busy) {
    ER.$$(sel).forEach(function (n) {
      n.addEventListener('click', function (e) {
        if (busy && busy()) return;
        if (word) ER.wordAt(e.clientX, e.clientY, word);
        if (line) ER.say(typeof line === 'function' ? line() : line);
      });
    });
  };
  X.mine = function (id, title, html, quiet) { return ER.addClue(id, title, '<h4>' + title + '</h4>' + html, 'mine', 'Your notes', quiet); };
  X.terms = function (list) {
    var G = window.GLOSS || [];
    list.forEach(function (w) { for (var i = 0; i < G.length; i++) if (G[i][0] === w) { ER.addWord(G[i][0], G[i][1]); break; } });
  };
  X.told = function (key) {
    var t = ER.flag(key) || {};
    return { has: function (k) { return !!t[k]; }, set: function (k) { if (t[k]) return false; t[k] = 1; ER.flag(key, t); return true; } };
  };
  X.minutesPlayed = function () {
    var st = ER.state();
    if (st.fin && st.fin.secs) return Math.max(1, Math.round(st.fin.secs / 60));
    return Math.max(1, Math.round((st.secs || 60) / 60));
  };
  /* With one card picked up, a click on a place that is already filled puts the new card there and sends the old one home. */
  X.swapIn = function (root, itemSel, slotSel, home) {
    root.addEventListener('pointerdown', function (e) {
      var it = e.target.closest ? e.target.closest(itemSel) : null, slot = it && it.closest(slotSel), held = root.querySelector(itemSel + '.held');
      if (!it || !slot || !held || held === it || e.button) return;
      e.stopPropagation(); e.preventDefault();
      home.appendChild(it); slot.click();
    }, true);
  };
  /* a page of the book: the running head, the stave, and Dickens's words */
  X.page = function (stave, title, body, from) {
    return '<div class="rh"><span>A CHRISTMAS CAROL</span><span>' + stave + '</span></div><h4>' + title + '</h4>' + body +
      (from ? '<p class="src">' + from + '</p>' : '');
  };
})();
