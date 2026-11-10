/* Bible Challenge — games */
(function () {
  "use strict";
  var D = window.BC_DATA, B = window.BC, L = function (a, b) { return B.L(a, b); }, esc = B.esc, ic = B.ic;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function lang() { return B.S().lang; }

  /* ---------- stage (full-screen game layer) ---------- */
  var stage = null, timers = [];
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function every(fn, ms) { var t = setInterval(fn, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = []; }
  function open(title) {
    close(true);
    stage = document.createElement("div"); stage.className = "stage";
    stage.innerHTML = '<div class="sky"></div><div class="stage-in"><div class="ghead"><button class="iconbtn" data-x="1" aria-label="close">' + ic("close") + '</button><div class="ttl">' + esc(title) + '</div><div style="width:40px"></div></div><div class="body" style="display:flex;flex-direction:column;flex:1"></div></div>';
    document.body.appendChild(stage);
    $("[data-x]", stage).onclick = function () { B.sfx("tap"); close(); };
    return body();
  }
  function body() { return $(".body", stage); }
  function set(html) { clearTimers(); var b = body(); b.innerHTML = html; b.style.animation = "none"; void b.offsetWidth; b.style.animation = "viewIn .35s cubic-bezier(.2,.8,.2,1)"; $(".stage-in", stage).scrollTop = 0; return b; }
  function close(silent) { clearTimers(); if (stage) { stage.remove(); stage = null; } if (!silent) B.refresh(); }
  function pop(text) { var p = document.createElement("div"); p.className = "pop"; p.textContent = text; document.body.appendChild(p); setTimeout(function () { p.remove(); }, 1000); }

  function results(o) {
    var b = set('<div class="result">' + trophySvg() + '<div class="eyebrow">' + esc(o.kicker) + '</div><div class="bigscore" id="rs">0</div><div class="muted small">' + L("points", "puntos") + "</div>" +
      (o.newBest ? '<div class="pill" style="margin-top:12px;color:var(--gold)">' + ic("star") + L("New record!", "¡Nuevo récord!") + "</div><br>" : "") +
      '<div class="xpgain">' + ic("bolt").replace("<svg", '<svg style="width:16px;height:16px"') + "+" + o.xp + " XP</div>" +
      '<div class="rgrid">' + o.stats.map(function (s) { return '<div class="stat"><b>' + s[1] + "</b><span>" + s[0] + "</span></div>"; }).join("") + "</div>" +
      (o.extra || "") + '</div><div class="gfoot">' + (B.shareScore && o.label ? '<button class="btn line block" style="margin-bottom:10px" id="sharepost">' + ic("share") + L("Share on my wall", "Compartir en mi muro") + "</button>" : "") + '<button class="btn gold block" id="again">' + ic("refresh") + L("Play again", "Jugar otra vez") + '</button><button class="btn ghost block" style="margin-top:10px" id="home">' + L("Back to menu", "Volver al menú") + "</button></div>");
    var el = $("#rs", b), n = 0, target = o.score, st = performance.now();
    (function tick(t) { var f = Math.min(1, (t - st) / 900); n = Math.round(target * (1 - Math.pow(1 - f, 3))); el.textContent = n.toLocaleString(); if (f < 1) requestAnimationFrame(tick); })(st);
    $("#again", b).onclick = function () { B.sfx("tap"); o.again(); };
    $("#home", b).onclick = function () { B.sfx("tap"); close(); };
    var sp = $("#sharepost", b); if (sp) sp.onclick = function () { sp.disabled = true; B.shareScore(o.label, o.score, o.stats); };
    if (o.good) { B.sfx("win"); B.confetti(); }
  }
  function trophySvg() {
    return '<svg class="trophy" viewBox="0 0 120 120" fill="none"><defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1c9"/><stop offset=".5" stop-color="#e9c27a"/><stop offset="1" stop-color="#a7752c"/></linearGradient></defs>' +
      '<circle cx="60" cy="54" r="46" fill="#e9c27a" opacity=".12"/><path d="M38 22h44v24a22 22 0 0 1-44 0z" fill="url(#tg)"/><path d="M38 28H24v6a16 16 0 0 0 16 16M82 28h14v6a16 16 0 0 1-16 16" stroke="#e9c27a" stroke-width="5" fill="none"/>' +
      '<path d="M54 66h12v16H54z" fill="#c8913f"/><rect x="40" y="82" width="40" height="12" rx="3" fill="url(#tg)"/><rect x="34" y="94" width="52" height="8" rx="3" fill="#a7752c"/><path d="m60 30 3.2 6.6 7.3 1-5.3 5.1 1.3 7.2L60 46.5l-6.5 3.4 1.3-7.2-5.3-5.1 7.3-1z" fill="#fff8e6"/></svg>';
  }
  function finishCommon() { B.unlock("first"); }

  /* ---------- trivia core (shared by solo and family) ---------- */
  var CATS = [["mix", "Mixed", "Mixto"], ["ot", "Old Testament", "Antiguo Testamento"], ["nt", "New Testament", "Nuevo Testamento"], ["jesus", "Life of Jesus", "Vida de Jesús"], ["people", "Bible People", "Personajes"]];
  function catName(c) { var x = CATS.filter(function (k) { return k[0] === c; })[0]; return x ? L(x[1], x[2]) : ""; }
  function pool(cat, diff, n) {
    var all = D.TRIVIA.filter(function (q) { return cat === "mix" || q[0] === cat; });
    var exact = shuffle(all.filter(function (q) { return !diff || q[1] === diff; }));
    var rest = shuffle(all.filter(function (q) { return diff && q[1] !== diff; })).sort(function (a, b) { return Math.abs(a[1] - diff) - Math.abs(b[1] - diff); });
    var list = exact.concat(rest);
    if (list.length < n) list = list.concat(shuffle(D.TRIVIA.filter(function (q) { return list.indexOf(q) < 0; })));
    return list.slice(0, n).map(prep);
  }
  function prep(q) {
    var es = lang() === "es", opts = (es ? q[7] : q[5]).map(function (t, i) { return { t: t, ok: i === q[2] }; });
    return { cat: q[0], diff: q[1], ref: q[3], q: es ? q[6] : q[4], opts: shuffle(opts) };
  }
  var LIMIT = 20;
  // draws one question; calls done({correct, timeLeft, points})
  function askQuestion(b, q, opts, done) {
    var mount = $("#qmount", b);
    mount.innerHTML = '<div class="timer" id="tm"><i></i></div><div class="qcat">' + catName(q.cat) + " · " + ["", L("Easy", "Fácil"), L("Medium", "Medio"), L("Hard", "Difícil")][q.diff] + '</div><h2 class="question">' + esc(q.q) + '</h2><div class="opts">' +
      q.opts.map(function (o, i) { return '<button class="opt" data-i="' + i + '"><span class="k">' + "ABCD"[i] + "</span><span>" + esc(o.t) + "</span></button>"; }).join("") + "</div>" +
      (opts.lifelines ? '<div class="lifelines"><button class="btn ghost sm" id="l50" ' + (opts.used50 ? "disabled" : "") + ">" + ic("half") + '50/50</button><button class="btn ghost sm" id="lt" ' + (opts.usedTime ? "disabled" : "") + ">" + ic("clock") + "+10s</button></div>" : "") + '<div id="fb"></div>';
    var left = LIMIT, total = LIMIT, answered = false, bar = $("#tm i", mount), tm = $("#tm", mount);
    var iv = every(function () {
      left = Math.max(0, left - .1); bar.style.transform = "scaleX(" + left / total + ")"; tm.classList.toggle("low", left < 5);
      if (left < 5 && Math.abs(left - Math.round(left)) < .05 && left > 0) B.sfx("tick");
      if (left <= 0) pick(-1);
    }, 100);
    function pick(i) {
      if (answered) return; answered = true; clearInterval(iv);
      var btns = $$(".opt", mount), ok = i >= 0 && q.opts[i].ok;
      btns.forEach(function (x, k) { x.disabled = true; if (q.opts[k].ok) x.classList.add("right"); else if (k === i) x.classList.add("wrong"); });
      $$(".lifelines .btn", mount).forEach(function (x) { x.disabled = true; });
      B.sfx(ok ? "good" : "bad");
      var right = q.opts.filter(function (o) { return o.ok; })[0].t;
      $("#fb", mount).innerHTML = '<div class="feedback">' + (ok ? "<b>" + L("Correct!", "¡Correcto!") + "</b> " : i < 0 ? "<b style=\"color:var(--bad)\">" + L("Time's up.", "Se acabó el tiempo.") + "</b> " : "<b style=\"color:var(--bad)\">" + L("Not quite.", "Casi.") + "</b> ") +
        (ok ? "" : L("The answer is ", "La respuesta es ") + "<b>" + esc(right) + "</b>. ") + (q.ref ? '<span class="muted">' + ic("book").replace("<svg", '<svg style="width:14px;height:14px;vertical-align:-2px"') + " " + esc(B.refText(q.ref)) + "</span>" : "") + "</div>";
      done({ correct: ok, left: left });
    }
    $$(".opt", mount).forEach(function (x) { x.onclick = function () { pick(+x.dataset.i); }; });
    if (opts.lifelines) {
      $("#l50", mount).onclick = function () {
        if (answered) return; opts.used50 = true; this.disabled = true; B.sfx("tap");
        var wrong = shuffle(q.opts.map(function (o, i) { return o.ok ? -1 : i; }).filter(function (i) { return i >= 0; })).slice(0, 2);
        wrong.forEach(function (i) { $$(".opt", mount)[i].classList.add("gone"); });
      };
      $("#lt", mount).onclick = function () { if (answered) return; opts.usedTime = true; this.disabled = true; B.sfx("tap"); left += 10; total = Math.max(total, left); };
    }
  }

  /* ---------- 1. Coffee & Trivia ---------- */
  var tset = { cat: "mix", diff: 1 };
  function trivia() {
    var b = open(L("Coffee & Trivia", "Café y Trivia"));
    setupTrivia();
  }
  function setupTrivia() {
    var b = set('<div style="text-align:center;margin:4px 0 18px">' + '<div class="title">' + L("Coffee & Trivia", "Café y Trivia") + '</div><p class="muted" style="margin:6px 0 0">' + L("10 questions · 20 seconds each · build combos for bonus points", "10 preguntas · 20 segundos cada una · haz combos para ganar más") + "</p></div>" +
      '<div class="card"><div class="field"><span>' + L("Category", "Categoría") + '</span><div class="chips">' + CATS.map(function (c) { return '<button class="chipbtn ' + (tset.cat === c[0] ? "on" : "") + '" data-c="' + c[0] + '">' + L(c[1], c[2]) + "</button>"; }).join("") + "</div></div>" +
      '<div class="field" style="margin:0"><span>' + L("Difficulty", "Dificultad") + '</span><div class="seg">' + [[1, "Easy", "Fácil"], [2, "Medium", "Medio"], [3, "Hard", "Difícil"]].map(function (d) { return '<button data-d="' + d[0] + '" class="' + (tset.diff === d[0] ? "on" : "") + '">' + L(d[1], d[2]) + "</button>"; }).join("") + "</div></div></div>" +
      '<div class="card" style="margin-top:12px"><div class="lrow" style="padding-top:0"><div class="ic">' + ic("bolt") + "</div><div><b>" + L("Combos", "Combos") + "</b><span>" + L("3 in a row = x1.5 · 5 in a row = x2", "3 seguidas = x1.5 · 5 seguidas = x2") + '</span></div></div><div class="lrow" style="padding-bottom:0"><div class="ic">' + ic("half") + "</div><div><b>" + L("Lifelines", "Comodines") + "</b><span>" + L("One 50/50 and one +10 seconds per game", "Un 50/50 y un +10 segundos por partida") + "</span></div></div></div>" +
      '<div class="gfoot"><button class="btn gold block" id="go">' + L("Start", "Comenzar") + "</button></div>");
    $$("[data-c]", b).forEach(function (x) { x.onclick = function () { tset.cat = x.dataset.c; B.sfx("tap"); setupTrivia(); }; });
    $$("[data-d]", b).forEach(function (x) { x.onclick = function () { tset.diff = +x.dataset.d; B.sfx("tap"); setupTrivia(); }; });
    $("#go", b).onclick = function () { B.sfx("tap"); runTrivia(); };
  }
  function runTrivia() {
    var qs = pool(tset.cat, tset.diff, 10), i = 0, score = 0, combo = 0, best = 0, right = 0, marks = [], opts = { lifelines: true };
    function next() {
      var q = qs[i];
      var b = set('<div class="hud"><div class="dots">' + qs.map(function (_, k) { return "<i class=\"" + (marks[k] || (k === i ? "cur" : "")) + "\"></i>"; }).join("") + '</div></div>' +
        '<div class="hud"><span class="pill">' + ic("star") + '<span id="sc">' + score + '</span></span>' + (combo >= 2 ? '<span class="pill combo">' + ic("flame") + "x" + combo + "</span>" : "") + '<span class="spacer"></span><span class="pill">' + (i + 1) + "/" + qs.length + '</span></div><div id="qmount"></div><div class="gfoot"><button class="btn gold block hidden" id="nx">' + (i + 1 < qs.length ? L("Next", "Siguiente") : L("See results", "Ver resultados")) + "</button></div>");
      askQuestion(b, q, opts, function (r) {
        if (r.correct) {
          combo++; right++; best = Math.max(best, combo);
          var mult = combo >= 5 ? 2 : combo >= 3 ? 1.5 : 1, pts = Math.round((100 + 50 * Math.min(1, r.left / LIMIT)) * mult);
          score += pts; $("#sc", b).textContent = score; pop("+" + pts + (mult > 1 ? "  x" + mult : ""));
          if (combo === 3 || combo === 5) B.sfx("combo");
          marks[i] = "ok";
        } else { combo = 0; marks[i] = "no"; }
        var nb = $("#nx", b); nb.classList.remove("hidden"); nb.onclick = function () { B.sfx("tap"); i++; if (i < qs.length) next(); else end(); };
      });
    }
    function end() {
      var st = B.S().stats.trivia, newBest = score > st.best;
      st.played++; st.correct += right; st.total += qs.length; st.best = Math.max(st.best, score); st.bestCombo = Math.max(st.bestCombo || 0, best); B.save();
      var xp = right * 5 + (right === qs.length ? 30 : 0);
      finishCommon(); B.addXP(xp); B.task("trivia"); B.submitScore("trivia", score);
      if (right === qs.length) B.unlock("perfect"); if (best >= 5) B.unlock("combo5");
      results({ label: L("Coffee & Trivia", "Café y Trivia"), kicker: right === qs.length ? L("Perfect round!", "¡Ronda perfecta!") : right >= 7 ? L("Excellent!", "¡Excelente!") : right >= 4 ? L("Well done!", "¡Bien hecho!") : L("Keep learning!", "¡Sigue aprendiendo!"),
        score: score, xp: xp, newBest: newBest && st.played > 1, good: right >= 6,
        stats: [[L("Correct", "Correctas"), right + "/" + qs.length], [L("Best combo", "Mejor combo"), "x" + best], [L("Record", "Récord"), st.best]], again: runTrivia });
    }
    next();
  }

  /* ---------- 2. Complete the Verse ---------- */
  var STOP = ("unto that with shall them they their which from have hath thee thou thine shalt will into upon there these those what when your also were been this than then neither nor ye are his him her for not but all the and was let our you who whom whosoever saith said cometh came " +
    "para como pero porque esta este estas estos entre cuando sobre todo todos toda todas hasta desde ellos nosotros vosotros vuestro vuestra vuestros vuestras nuestro nuestra donde quien cual aquel aquella también sino pues mas dijo dice").split(" ");
  function split(text) {
    return text.split(" ").map(function (tok) {
      var m = tok.match(/^([“"¿¡(]*)(.*?)([.,;:!?”")]*)$/);
      return { pre: m[1], w: m[2], post: m[3] };
    });
  }
  function candidates(tokens) {
    return tokens.map(function (t, i) { return i; }).filter(function (i) {
      var w = tokens[i].w, c = w.toLowerCase().replace(/[^a-záéíóúüñ']/gi, "");
      return c.length >= 4 && STOP.indexOf(c) < 0 && !/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ']/.test(w);
    });
  }
  function verseGame() { open(L("Complete the Verse", "Completa el Versículo")); setupVerse(); }
  function setupVerse() {
    var b = set('<div style="text-align:center;margin:4px 0 18px"><div class="title">' + L("Complete the Verse", "Completa el Versículo") + '</div><p class="muted" style="margin:6px 0 0">' + L("Tap the missing words in the right order. 5 verses, each one a little harder.", "Toca las palabras que faltan en el orden correcto. 5 versículos, cada uno un poco más difícil.") + "</p></div>" +
      '<div class="card vb" style="font-size:19px">' + (lang() === "es" ? 'Lámpara es a mis <span class="blank fill">pies</span> tu palabra, Y <span class="blank cur">lumbrera</span> a mi camino.' : 'Thy word is a <span class="blank fill">lamp</span> unto my feet, and a <span class="blank cur">light</span> unto my path.') + "</div>" +
      '<div class="tiles" style="opacity:.8;pointer-events:none"><span class="wtile">' + L("light", "lumbrera") + '</span><span class="wtile">' + L("rock", "roca") + '</span><span class="wtile">' + L("heart", "corazón") + "</span></div>" +
      '<div class="gfoot"><button class="btn gold block" id="go">' + L("Start", "Comenzar") + "</button></div>");
    $("#go", b).onclick = function () { B.sfx("tap"); runVerse(); };
  }
  function runVerse() {
    var idx = shuffle(D.VERSES.map(function (_, i) { return i; }).filter(function (i) { return B.verse(i).text.length < 230; })).slice(0, 5);
    var k = 0, score = 0, mistakes = 0, perfectCount = 0;
    function next() {
      var v = B.verse(idx[k]), tokens = split(v.text), cand = candidates(tokens), nBlank = [2, 2, 3, 3, 4][k];
      var chosen = [];
      shuffle(cand).forEach(function (i) { if (chosen.length < nBlank && chosen.every(function (c) { return Math.abs(c - i) > 1; })) chosen.push(i); });
      chosen.sort(function (a, b) { return a - b; });
      var answers = chosen.map(function (i) { return tokens[i].w; });
      var decoys = [], others = shuffle(D.VERSES.map(function (_, i) { return i; }).filter(function (i) { return i !== idx[k]; }));
      for (var o = 0; o < others.length && decoys.length < 2; o++) {
        var tk = split(B.verse(others[o]).text), cc = candidates(tk);
        if (cc.length) { var w = tk[cc[Math.floor(Math.random() * cc.length)]].w; if (answers.concat(decoys).map(function (x) { return x.toLowerCase(); }).indexOf(w.toLowerCase()) < 0) decoys.push(w); }
      }
      var tiles = shuffle(answers.map(function (w, i) { return { w: w, a: i }; }).concat(decoys.map(function (w) { return { w: w, a: -1 }; })));
      var html = tokens.map(function (t, i) { var bi = chosen.indexOf(i); return esc(t.pre) + (bi >= 0 ? '<span class="blank" data-b="' + bi + '">' + esc(t.w) + "</span>" : esc(t.w)) + esc(t.post); }).join(" ");
      var b = set('<div class="hud"><div class="dots">' + idx.map(function (_, j) { return "<i class=\"" + (j < k ? "ok" : j === k ? "cur" : "") + "\"></i>"; }).join("") + '</div></div><div class="hud"><span class="pill">' + ic("star") + '<span id="sc">' + score + '</span>' + '</span><span class="spacer"></span><span class="pill">' + (k + 1) + "/5</span></div>" +
        '<div class="card vb">' + html + '<div class="ref" style="font-family:var(--sans);margin-top:12px">' + esc(v.refT) + "</div></div>" +
        '<div class="tiles">' + tiles.map(function (t, i) { return '<button class="wtile" data-t="' + i + '">' + esc(t.w) + "</button>"; }).join("") + '</div><div id="fb"></div><div class="gfoot"><button class="btn gold block hidden" id="nx">' + (k < 4 ? L("Next verse", "Siguiente versículo") : L("See results", "Ver resultados")) + "</button></div>");
      var cur = 0, miss = 0, t0 = Date.now();
      function mark() { $$(".blank", b).forEach(function (x) { x.classList.toggle("cur", +x.dataset.b === cur); }); }
      mark();
      $$(".wtile", b).forEach(function (el) {
        el.onclick = function () {
          var t = tiles[+el.dataset.t];
          if (t.w.toLowerCase() === answers[cur].toLowerCase()) {
            B.sfx("tap"); el.classList.add("used"); var bl = $('.blank[data-b="' + cur + '"]', b); bl.classList.add("fill"); bl.classList.remove("cur"); cur++;
            if (cur >= answers.length) {
              var pts = Math.max(20, answers.length * 100 - miss * 40) + Math.max(0, 60 - Math.round((Date.now() - t0) / 1000) * 2);
              score += pts; mistakes += miss; if (!miss) perfectCount++; $("#sc", b).textContent = score;
              B.sfx("good"); pop("+" + pts);
              $$(".wtile", b).forEach(function (x) { x.classList.add("used"); });
              $("#fb", b).innerHTML = '<div class="feedback center">' + (miss ? L("Done!", "¡Listo!") : "<b>" + L("Perfect!", "¡Perfecto!") + "</b>") + " " + esc(v.refT) + "</div>";
              var nb = $("#nx", b); nb.classList.remove("hidden"); nb.onclick = function () { B.sfx("tap"); k++; if (k < idx.length) next(); else end(); };
            } else mark();
          } else { miss++; B.sfx("bad"); el.classList.remove("no"); void el.offsetWidth; el.classList.add("no"); }
        };
      });
    }
    function end() {
      var st = B.S().stats.verse, newBest = score > st.best;
      st.played++; st.best = Math.max(st.best, score); st.perfect += perfectCount; B.save();
      var xp = 25 + perfectCount * 5;
      finishCommon(); B.addXP(xp); B.task("verse"); B.submitScore("verse", score); if (!mistakes) B.unlock("scribe");
      results({ label: L("Complete the Verse", "Completa el Versículo"), kicker: !mistakes ? L("Flawless!", "¡Sin errores!") : L("Great memory!", "¡Buena memoria!"), score: score, xp: xp, newBest: newBest && st.played > 1, good: mistakes <= 2,
        stats: [[L("Perfect", "Perfectos"), perfectCount + "/5"], [L("Mistakes", "Errores"), mistakes], [L("Record", "Récord"), st.best]], again: runVerse });
    }
    next();
  }

  /* ---------- 3. Books in Order ---------- */
  function books() { open(L("Books in Order", "Libros en Orden")); setupBooks(); }
  function setupBooks() {
    var b = set('<div style="text-align:center;margin:4px 0 18px"><div class="title">' + L("Books in Order", "Libros en Orden") + '</div><p class="muted" style="margin:6px 0 0">' + L("Tap the books in the order they appear in the Bible. 6 rounds — be quick for bonus points.", "Toca los libros en el orden en que aparecen en la Biblia. 6 rondas: si eres rápido, ganas más.") + "</p></div>" +
      '<div class="blist" style="pointer-events:none">' + [["GEN", 1, "ok"], ["RUT", 2, "ok"], ["PSA", "", ""], ["MAT", "", ""]].map(function (x) { var bk = B.BOOK[x[0]]; return '<div class="bk ' + x[2] + '"><span class="n">' + x[1] + "</span>" + esc(B.bookName(x[0])) + "<small>" + (bk.t === "OT" ? L("OT", "AT") : L("NT", "NT")) + "</small></div>"; }).join("") + "</div>" +
      '<div class="gfoot"><button class="btn gold block" id="go">' + L("Start", "Comenzar") + "</button></div>");
    $("#go", b).onclick = function () { B.sfx("tap"); runBooks(); };
  }
  function runBooks() {
    var R = 6, r = 0, score = 0, mistakes = 0;
    function next() {
      var n = r < 2 ? 4 : r < 4 ? 5 : 6;
      var pick = shuffle(D.BOOKS.map(function (_, i) { return i; })).slice(0, n), order = pick.slice().sort(function (a, b) { return a - b; }), shown = shuffle(pick);
      var b = set('<div class="hud"><div class="dots">' + Array.apply(null, Array(R)).map(function (_, j) { return "<i class=\"" + (j < r ? "ok" : j === r ? "cur" : "") + "\"></i>"; }).join("") + '</div></div><div class="hud"><span class="pill">' + ic("star") + '<span id="sc">' + score + '</span>' + '</span><span class="spacer"></span><span class="pill">' + L("Round ", "Ronda ") + (r + 1) + "/" + R + "</span></div>" +
        '<p class="muted center" style="margin:4px 0 14px">' + L("Tap them from first to last", "Tócalos del primero al último") + '</p><div class="blist">' + shown.map(function (i) { var bk = D.BOOKS[i]; return '<button class="bk" data-i="' + i + '"><span class="n"></span>' + esc(lang() === "es" ? bk[2] : bk[1]) + "<small>" + (bk[3] === "OT" ? L("OT", "AT") : "NT") + "</small></button>"; }).join("") + '</div><div id="fb"></div><div class="gfoot"></div>');
      var pos = 0, miss = 0, t0 = Date.now();
      $$(".bk", b).forEach(function (el) {
        el.onclick = function () {
          if (el.classList.contains("ok")) return;
          var i = +el.dataset.i;
          if (i === order[pos]) {
            pos++; el.classList.add("ok"); $(".n", el).textContent = pos; B.sfx("tap");
            if (pos === n) {
              var secs = (Date.now() - t0) / 1000, pts = Math.max(0, n * 60 - miss * 40) + Math.max(0, Math.round(80 - secs * 4));
              score += pts; mistakes += miss; B.sfx("good"); pop("+" + pts); $("#sc", b).textContent = score;
              var g = D.BOOKS[order[0]][4];
              $("#fb", b).innerHTML = '<div class="feedback center">' + (miss ? L("Done!", "¡Listo!") : "<b>" + L("Perfect order!", "¡Orden perfecto!") + "</b>") + "</div>";
              later(function () { r++; if (r < R) next(); else end(); }, 1300);
            }
          } else { miss++; B.sfx("bad"); el.classList.remove("no"); void el.offsetWidth; el.classList.add("no"); }
        };
      });
    }
    function end() {
      var st = B.S().stats.books, newBest = score > st.best;
      st.played++; st.best = Math.max(st.best, score); B.save();
      var xp = 20 + (mistakes ? 0 : 20);
      finishCommon(); B.addXP(xp); B.submitScore("books", score); if (!mistakes) B.unlock("librarian");
      results({ label: L("Books in Order", "Libros en Orden"), kicker: !mistakes ? L("Bible scholar!", "¡Experto bíblico!") : L("Good job!", "¡Buen trabajo!"), score: score, xp: xp, newBest: newBest && st.played > 1, good: mistakes <= 3,
        stats: [[L("Rounds", "Rondas"), R], [L("Mistakes", "Errores"), mistakes], [L("Record", "Récord"), st.best]], again: runBooks,
        extra: '<div class="card" style="text-align:left"><div class="eyebrow" style="margin-bottom:8px">' + L("Tip", "Consejo") + '</div><p class="muted small" style="margin:0">' + L("The Bible has 66 books: 39 in the Old Testament and 27 in the New Testament.", "La Biblia tiene 66 libros: 39 en el Antiguo Testamento y 27 en el Nuevo.") + "</p></div>" });
    }
    next();
  }

  /* ---------- 4. Sermon vs Sermon ---------- */
  var serm = null;
  function sermon() { open(L("Sermon vs Sermon", "Sermón vs Sermón")); setupSermon(); }
  function pickSermonVerse() { var v; do { v = Math.floor(Math.random() * D.VERSES.length); } while (serm && serm.v === v); return v; }
  function setupSermon() {
    var me = B.S().name || L("Player 1", "Jugador 1");
    if (!serm) serm = { names: [me, ""], mins: 5, v: pickSermonVerse() };
    var v = B.verse(serm.v);
    var b = set('<div style="text-align:center;margin:4px 0 18px"><div class="title">' + L("Sermon vs Sermon", "Sermón vs Sermón") + '</div><p class="muted" style="margin:6px 0 0">' + L("Same verse, two preachers. Prepare, preach, and let the group decide.", "El mismo versículo, dos predicadores. Prepara, predica y que el grupo decida.") + "</p></div>" +
      '<div class="card hero" style="padding:20px"><div class="row"><div class="eyebrow">' + L("Your verse", "Tu versículo") + '</div><span class="spacer"></span><button class="link" id="rv">' + ic("refresh").replace("<svg", '<svg style="width:15px;height:15px;vertical-align:-3px;margin-right:4px"') + L("Change", "Cambiar") + '</button></div><p class="verse" style="font-size:19px">' + esc(v.text) + '</p><div class="ref">' + esc(v.refT) + "</div></div>" +
      '<div class="card" style="margin-top:12px"><div class="field"><span>' + L("Preachers", "Predicadores") + "</span>" +
      [0, 1].map(function (i) { return '<div class="player-row">' + B.avatar(serm.names[i] || String(i + 1), i * 2) + '<input class="input" data-n="' + i + '" maxlength="16" placeholder="' + L("Preacher ", "Predicador ") + (i + 1) + '" value="' + esc(serm.names[i]) + '"></div>'; }).join("") + "</div>" +
      '<div class="field" style="margin:0"><span>' + L("Preparation time", "Tiempo de preparación") + '</span><div class="seg">' + [3, 5, 10].map(function (m) { return '<button data-m="' + m + '" class="' + (serm.mins === m ? "on" : "") + '">' + m + " min</button>"; }).join("") + "</div></div></div>" +
      '<div class="gfoot"><button class="btn gold block" id="go">' + L("Start", "Comenzar") + "</button></div>");
    $("#rv", b).onclick = function () { B.sfx("tap"); serm.v = pickSermonVerse(); setupSermon(); };
    $$("[data-n]", b).forEach(function (x) { x.oninput = function () { serm.names[+x.dataset.n] = x.value.trim(); }; });
    $$("[data-m]", b).forEach(function (x) { x.onclick = function () { serm.mins = +x.dataset.m; B.sfx("tap"); setupSermon(); }; });
    $("#go", b).onclick = function () {
      serm.names = serm.names.map(function (n, i) { return n || L("Preacher ", "Predicador ") + (i + 1); });
      serm.notes = [{}, {}]; serm.scores = [[0, 0, 0, 0], [0, 0, 0, 0]]; B.sfx("tap"); passTo(0, function () { write(0); });
    };
  }
  function passTo(p, then, subtitle) {
    var b = set('<div class="passcard">' + B.avatar(serm.names[p], p * 2, "lg") + '<div class="eyebrow">' + L("Pass the phone to", "Pásale el teléfono a") + "</div><h2>" + esc(serm.names[p]) + '</h2><p class="muted">' + (subtitle || L("The other preacher shouldn't look!", "¡El otro predicador no debe mirar!")) + '</p></div><div class="gfoot"><button class="btn gold block" id="rd">' + L("I'm ready", "Estoy listo") + "</button></div>");
    $("#rd", b).onclick = function () { B.sfx("tap"); then(); };
  }
  var FIELDS = [["title", "Sermon title", "Título del sermón", 1], ["big", "Main idea in one sentence", "Idea principal en una frase", 2], ["p1", "Point 1", "Punto 1", 2], ["p2", "Point 2", "Punto 2", 2], ["p3", "Point 3", "Punto 3", 2], ["app", "Application: what should we do?", "Aplicación: ¿qué debemos hacer?", 3]];
  function write(p) {
    var v = B.verse(serm.v), n = serm.notes[p];
    var b = set('<div class="card" style="padding:14px 16px"><div class="row"><div><div class="eyebrow">' + esc(serm.names[p]) + '</div><div class="ref" style="margin-top:2px">' + esc(v.refT) + '</div></div><span class="spacer"></span><div class="bigtimer" id="clk" style="font-size:30px">' + serm.mins + ':00</div></div><p class="verse" style="font-size:16px;margin:10px 0 0">' + esc(v.text) + "</p></div>" +
      '<div style="margin-top:14px">' + FIELDS.map(function (f) { return '<label class="field"><span>' + L(f[1], f[2]) + "</span>" + (f[3] === 1 ? '<input class="input" data-f="' + f[0] + '" maxlength="80" value="' + esc(n[f[0]] || "") + '">' : '<textarea class="input" style="min-height:' + (f[3] * 30) + 'px" data-f="' + f[0] + '">' + esc(n[f[0]] || "") + "</textarea>") + "</label>"; }).join("") + "</div>" +
      '<div class="gfoot"><button class="btn gold block" id="dn">' + L("I'm done", "Terminé") + "</button></div>");
    $$("[data-f]", b).forEach(function (x) { x.oninput = function () { n[x.dataset.f] = x.value; }; });
    var end = Date.now() + serm.mins * 60000, clk = $("#clk", b);
    every(function () {
      var s = Math.max(0, Math.round((end - Date.now()) / 1000)); clk.textContent = Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2);
      clk.style.color = s <= 30 ? "var(--bad)" : ""; if (s <= 10 && s > 0) B.sfx("tick");
      if (s <= 0) { B.toast(L("Time's up!", "¡Se acabó el tiempo!"), "", "clock"); finish(); }
    }, 500);
    function finish() { clearTimers(); if (p === 0) passTo(1, function () { write(1); }); else present(0); }
    $("#dn", b).onclick = function () { B.sfx("tap"); finish(); };
  }
  function outlineHTML(p) {
    var n = serm.notes[p], pts = ["p1", "p2", "p3"].map(function (k) { return n[k]; }).filter(Boolean);
    return '<div class="outline"><h3>' + esc(n.title || L("Untitled sermon", "Sermón sin título")) + "</h3>" + (n.big ? "<p><b>" + esc(n.big) + "</b></p>" : "") +
      (pts.length ? "<ol>" + pts.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol>" : "") + (n.app ? '<p><span class="eyebrow">' + L("Application", "Aplicación") + "</span><br>" + esc(n.app) + "</p>" : "") + "</div>";
  }
  function present(p) {
    var b = set('<div class="center" style="margin-bottom:14px"><div class="eyebrow">' + L("Preaching now", "Predicando ahora") + '</div><div class="title" style="margin-top:4px">' + esc(serm.names[p]) + '</div></div><div class="card">' + outlineHTML(p) + "</div>" +
      '<div class="card center" style="margin-top:12px"><div class="muted small">' + L("Up to 3 minutes to preach", "Hasta 3 minutos para predicar") + '</div><div class="bigtimer" id="clk">3:00</div><button class="btn ghost sm" id="st">' + ic("clock") + L("Start timer", "Iniciar tiempo") + "</button></div>" +
      '<div class="gfoot"><button class="btn gold block" id="nx">' + (p === 0 ? L("Next preacher", "Siguiente predicador") : L("Time to judge", "A juzgar")) + "</button></div>");
    $("#st", b).onclick = function () {
      this.disabled = true; var end = Date.now() + 180000, clk = $("#clk", b);
      every(function () { var s = Math.max(0, Math.round((end - Date.now()) / 1000)); clk.textContent = Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); clk.style.color = s <= 15 ? "var(--bad)" : ""; if (s === 0) { clearTimers(); B.sfx("bad"); } }, 500);
    };
    $("#nx", b).onclick = function () { B.sfx("tap"); if (p === 0) present(1); else judge(); };
  }
  var CRIT = [["Faithful to the Bible", "Fiel a la Biblia", "Stays true to the verse", "Respeta el versículo"], ["Clarity", "Claridad", "Easy to follow", "Fácil de seguir"], ["Application", "Aplicación", "Useful for daily life", "Útil para la vida diaria"], ["Passion", "Pasión", "Preached with heart", "Predicado con el corazón"]];
  function judge() {
    var star = ic("star");
    var b = set('<div class="center" style="margin-bottom:14px"><div class="title">' + L("The group decides", "El grupo decide") + '</div><p class="muted small" style="margin:6px 0 0">' + L("Agree together and give each preacher 1 to 5 stars.", "Pónganse de acuerdo y den de 1 a 5 estrellas a cada predicador.") + "</p></div>" +
      [0, 1].map(function (p) { return '<div class="card"><div class="row" style="margin-bottom:6px">' + B.avatar(serm.names[p], p * 2) + "<b style=\"font-size:17px\">" + esc(serm.names[p]) + "</b></div>" + CRIT.map(function (c, ci) { return '<div class="crit"><div><b>' + L(c[0], c[1]) + "</b><span>" + L(c[2], c[3]) + '</span></div><div class="stars" data-p="' + p + '" data-c="' + ci + '">' + [1, 2, 3, 4, 5].map(function (s) { return '<button data-s="' + s + '" aria-label="' + s + '">' + star + "</button>"; }).join("") + "</div></div>"; }).join("") + "</div>"; }).join("") +
      '<div class="gfoot"><button class="btn gold block" id="rev" disabled>' + ic("trophy") + L("Reveal the winner", "Revelar al ganador") + "</button>" +
      '<button class="btn ghost block" style="margin-top:10px" id="ai">' + L("Ask ChatGPT for feedback (optional)", "Pedir opinión a ChatGPT (opcional)") + '</button><a class="btn line block hidden" id="aiLink" style="margin-top:10px" href="https://chatgpt.com/" target="_blank" rel="noopener">' + L("Open ChatGPT", "Abrir ChatGPT") + ic("external") + "</a></div>");
    function check() { $("#rev", b).disabled = serm.scores.some(function (r) { return r.some(function (x) { return !x; }); }); }
    $$(".stars", b).forEach(function (g) {
      var p = +g.dataset.p, c = +g.dataset.c;
      $$("button", g).forEach(function (s) { s.onclick = function () { B.sfx("tap"); serm.scores[p][c] = +s.dataset.s; $$("button", g).forEach(function (x) { x.classList.toggle("on", +x.dataset.s <= +s.dataset.s); }); check(); }; });
    });
    $("#rev", b).onclick = reveal;
    $("#ai", b).onclick = function () {
      var v = B.verse(serm.v), txt = L("Please judge this friendly Christian sermon-preparation game. Be fair, kind and biblically careful. Do not treat legitimate denominational differences as errors. For each preacher give a score from 1 to 10 for faithfulness to the text, clarity and application, one strength, one suggestion, and then name a winner.\n\nVerse: ",
        "Por favor juzga este juego cristiano y amistoso de preparación de sermones. Sé justo, amable y cuidadoso con la Biblia. No trates las diferencias denominacionales legítimas como errores. Para cada predicador da una nota del 1 al 10 en fidelidad al texto, claridad y aplicación, una fortaleza, una sugerencia, y luego nombra a un ganador.\n\nVersículo: ") +
        v.refT + " — " + v.text + "\n\n" + [0, 1].map(function (p) { var n = serm.notes[p]; return serm.names[p] + ":\n" + FIELDS.map(function (f) { return L(f[1], f[2]) + ": " + (n[f[0]] || "-"); }).join("\n"); }).join("\n\n");
      var done = function () {
        B.toast(L("Copied!", "¡Copiado!"), L("Now paste it in ChatGPT", "Ahora pégalo en ChatGPT"), "check");
        var a = $("#aiLink", b); if (a) a.classList.remove("hidden");
      };
      try { navigator.clipboard.writeText(txt).then(done, done); } catch (e) { done(); }
    };
  }
  function reveal() {
    var tot = serm.scores.map(function (r) { return r.reduce(function (a, b) { return a + b; }, 0); }), w = tot[0] === tot[1] ? -1 : tot[0] > tot[1] ? 0 : 1;
    B.S().stats.sermon.played++; B.save(); finishCommon(); B.unlock("preacher"); B.addXP(40);
    var b = set('<div class="result"><div class="eyebrow">' + (w < 0 ? L("It's a tie!", "¡Empate!") : L("The winner is", "El ganador es")) + "</div>" +
      (w < 0 ? '<div class="title" style="margin:10px 0 0">' + L("Both preached with power", "Los dos predicaron con poder") + "</div>" : '<div style="margin:18px 0 8px">' + '<div style="display:flex;justify-content:center">' + B.avatar(serm.names[w], w * 2, "", 110) + "</div>" + '</div><div class="title" style="font-size:34px">' + esc(serm.names[w]) + "</div>") +
      '<div class="rgrid" style="grid-template-columns:1fr 1fr">' + [0, 1].map(function (p) { return '<div class="stat"><b>' + tot[p] + "/20</b><span>" + esc(serm.names[p]) + "</span></div>"; }).join("") + "</div>" +
      '<div class="xpgain">+40 XP</div><p class="muted small" style="margin-top:14px">' + L("“Preach the word; be instant in season, out of season.” — 2 Timothy 4:2", "“Que prediques la palabra; que instes a tiempo y fuera de tiempo.” — 2 Timoteo 4:2") + "</p></div>" +
      '<div class="gfoot"><button class="btn gold block" id="again">' + ic("refresh") + L("New battle", "Nuevo duelo") + '</button><button class="btn ghost block" style="margin-top:10px" id="home">' + L("Back to menu", "Volver al menú") + "</button></div>");
    B.sfx("win"); B.confetti();
    $("#again", b).onclick = function () { B.sfx("tap"); serm.v = pickSermonVerse(); setupSermon(); };
    $("#home", b).onclick = function () { close(); };
  }

  /* ---------- 5. Family Mode ---------- */
  var fam = null;
  function family() { open(L("Family Mode", "Modo Familia")); setupFamily(); }
  function setupFamily() {
    var st = B.S();
    if (!fam) fam = { players: st.family && st.family.length ? st.family.slice() : [st.name || "", ""], diff: 1, per: 5 };
    var b = set('<div style="text-align:center;margin:4px 0 18px"><div class="title">' + L("Family Mode", "Modo Familia") + '</div><p class="muted" style="margin:6px 0 0">' + L("Pass the phone around. Everyone answers their own questions. Highest score wins!", "Pasen el teléfono. Cada uno contesta sus preguntas. ¡Gana el que más puntos tenga!") + "</p></div>" +
      '<div class="card"><div class="field"><span>' + L("Players", "Jugadores") + " (" + fam.players.length + "/8)</span>" +
      fam.players.map(function (n, i) { return '<div class="player-row">' + B.avatar(n || String(i + 1), i) + '<input class="input" data-n="' + i + '" maxlength="14" placeholder="' + L("Player ", "Jugador ") + (i + 1) + '" value="' + esc(n) + '">' + (fam.players.length > 2 ? '<button class="iconbtn" data-rm="' + i + '" aria-label="remove">' + ic("minus") + "</button>" : "") + "</div>"; }).join("") +
      (fam.players.length < 8 ? '<button class="btn ghost sm" id="add">' + ic("plus") + L("Add player", "Agregar jugador") + "</button>" : "") + "</div>" +
      '<div class="field"><span>' + L("Difficulty", "Dificultad") + '</span><div class="seg">' + [[1, "Easy", "Fácil"], [2, "Medium", "Medio"], [3, "Hard", "Difícil"]].map(function (d) { return '<button data-d="' + d[0] + '" class="' + (fam.diff === d[0] ? "on" : "") + '">' + L(d[1], d[2]) + "</button>"; }).join("") + "</div></div>" +
      '<div class="field" style="margin:0"><span>' + L("Questions per player", "Preguntas por jugador") + '</span><div class="seg">' + [3, 5, 7].map(function (n) { return '<button data-p="' + n + '" class="' + (fam.per === n ? "on" : "") + '">' + n + "</button>"; }).join("") + "</div></div></div>" +
      '<div class="gfoot"><button class="btn gold block" id="go">' + L("Start", "Comenzar") + "</button></div>");
    $$("[data-n]", b).forEach(function (x) { x.oninput = function () { fam.players[+x.dataset.n] = x.value.trim(); }; });
    $$("[data-rm]", b).forEach(function (x) { x.onclick = function () { fam.players.splice(+x.dataset.rm, 1); setupFamily(); }; });
    var ad = $("#add", b); if (ad) ad.onclick = function () { fam.players.push(""); B.sfx("tap"); setupFamily(); var ins = $$("[data-n]"); ins[ins.length - 1].focus(); };
    $$("[data-d]", b).forEach(function (x) { x.onclick = function () { fam.diff = +x.dataset.d; setupFamily(); }; });
    $$("[data-p]", b).forEach(function (x) { x.onclick = function () { fam.per = +x.dataset.p; setupFamily(); }; });
    $("#go", b).onclick = function () {
      fam.players = fam.players.map(function (n, i) { return n || L("Player ", "Jugador ") + (i + 1); });
      st.family = fam.players.slice(); B.save(); B.sfx("tap"); runFamily();
    };
  }
  function runFamily() {
    var P = fam.players, n = P.length, total = n * fam.per, qs = pool("mix", fam.diff, total), turn = 0;
    var score = P.map(function () { return 0; }), right = P.map(function () { return 0; }), combo = P.map(function () { return 0; });
    function standings() {
      return '<div class="card" style="margin-top:16px;text-align:left">' + P.map(function (nm, i) { return i; }).sort(function (a, b) { return score[b] - score[a]; }).map(function (i, r) {
        return '<div class="lrow" style="padding:10px 0"><b style="width:18px;flex:none;color:var(--muted)">' + (r + 1) + "</b>" + B.avatar(P[i], i, "", 34) + '<div style="flex:1;min-width:0"><b>' + esc(P[i]) + '</b></div><span class="end" style="color:var(--ink);font-weight:800">' + score[i] + "</span></div>";
      }).join("") + "</div>";
    }
    function pass() {
      var p = turn % n, round = Math.floor(turn / n) + 1;
      var b = set('<div class="passcard" style="padding-top:10px">' + B.avatar(P[p], p, "lg") + '<div class="eyebrow">' + L("Round ", "Ronda ") + round + "/" + fam.per + '</div><h2>' + L("Your turn, ", "Te toca, ") + esc(P[p]) + '</h2><p class="muted">' + L("Take the phone and get ready.", "Toma el teléfono y prepárate.") + "</p>" + (turn ? standings() : "") + '</div><div class="gfoot"><button class="btn gold block" id="rd">' + L("I'm ready!", "¡Estoy listo!") + "</button></div>");
      $("#rd", b).onclick = function () { B.sfx("tap"); ask(p); };
    }
    function ask(p) {
      var b = set('<div class="hud">' + B.avatar(P[p], p, "", 36) + "<b>" + esc(P[p]) + '</b><span class="spacer"></span><span class="pill">' + ic("star") + score[p] + "</span>" + (combo[p] >= 2 ? '<span class="pill combo">' + ic("flame") + "x" + combo[p] + "</span>" : "") + '</div><div id="qmount"></div><div class="gfoot"><button class="btn gold block hidden" id="nx"></button></div>');
      askQuestion(b, qs[turn], { lifelines: false }, function (r) {
        if (r.correct) { combo[p]++; right[p]++; var mult = combo[p] >= 3 ? 1.5 : 1, pts = Math.round((100 + 50 * Math.min(1, r.left / LIMIT)) * mult); score[p] += pts; pop("+" + pts); }
        else combo[p] = 0;
        turn++;
        var nb = $("#nx", b); nb.classList.remove("hidden");
        nb.textContent = turn < total ? L("Pass to ", "Pasar a ") + P[turn % n] : L("See the winner", "Ver al ganador");
        nb.onclick = function () { B.sfx("tap"); if (turn < total) pass(); else end(); };
      });
    }
    function end() {
      var order = P.map(function (_, i) { return i; }).sort(function (a, b) { return score[b] - score[a]; });
      var st = B.S(); st.stats.family.played++; B.save(); finishCommon(); B.unlock("family"); B.addXP(30);
      var podium = [order[1], order[0], order[2]].map(function (i, k) { if (i === undefined) return "<div></div>"; var cls = ["p2", "p1", "p3"][k]; return '<div class="' + cls + '">' + B.avatar(P[i], i) + "<b>" + esc(P[i]) + "</b><small>" + score[i] + '</small><div class="bar">' + ["2", "1", "3"][k] + "</div></div>"; }).join("");
      var tie = n > 1 && score[order[0]] === score[order[1]];
      var b = set('<div class="result"><div class="eyebrow">' + (tie ? L("It's a tie at the top!", "¡Empate en el primer lugar!") : L("Champion", "Campeón")) + '</div><div class="title" style="font-size:32px;margin-top:4px">' + esc(tie ? P[order[0]] + " & " + P[order[1]] : P[order[0]]) + '</div><div class="podium">' + podium + "</div>" +
        '<div class="card" style="text-align:left">' + order.map(function (i, r) { return '<div class="lrow" style="padding:10px 0"><b style="width:22px;color:var(--muted)">' + (r + 1) + "</b><div><b>" + esc(P[i]) + "</b><span>" + right[i] + "/" + fam.per + " " + L("correct", "correctas") + '</span></div><span class="end" style="color:var(--ink);font-weight:800">' + score[i] + "</span></div>"; }).join("") + "</div>" +
        '<div class="xpgain">+30 XP</div></div><div class="gfoot"><button class="btn gold block" id="again">' + ic("refresh") + L("Play again", "Jugar otra vez") + '</button><button class="btn ghost block" style="margin-top:10px" id="home">' + L("Back to menu", "Volver al menú") + "</button></div>");
      B.sfx("win"); B.confetti();
      $("#again", b).onclick = function () { B.sfx("tap"); setupFamily(); };
      $("#home", b).onclick = function () { close(); };
    }
    pass();
  }

  window.Games = { trivia: trivia, verse: verseGame, books: books, sermon: sermon, family: family };
})();
