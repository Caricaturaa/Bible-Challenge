/* Bible Challenge — core: local state, progress, icons, sound, sharing helpers */
(function () {
  "use strict";
  var D = window.BC_DATA;
  var KEY = "bc2";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- state ---------------- */
  var S = load();
  function fresh() {
    return { v: 1, lang: null, theme: "dark", accent: "violet", sound: true, haptic: true, name: "", color: 0, xp: 0,
      streak: { n: 0, last: null, best: 0 }, days: {}, favs: [], notes: {}, plan: { id: "john21", done: [] },
      stats: { trivia: { played: 0, best: 0, correct: 0, total: 0, bestCombo: 0 }, verse: { played: 0, best: 0, perfect: 0 },
        books: { played: 0, best: 0 }, sermon: { played: 0 }, family: { played: 0 } },
      ach: {}, shares: 0, family: [], created: Date.now() };
  }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) { var m = merge(fresh(), s); if (!m.themeChosen || (m.theme !== 'light' && m.theme !== 'dark')) m.theme = 'dark'; return m; } } catch (e) {}
    var f = fresh();
    try { // carry over the language from the old version of the app
      var old = localStorage.getItem("bibleChallengeLanguage"); if (old === "es" || old === "en") f.lang = old;
      var nm = localStorage.getItem("bibleChallengeDisplayName"); if (nm && nm.length < 30) f.name = nm.replace(/[†✦]/g, "").trim();
    } catch (e) {}
    return f;
  }
  function merge(a, b) { for (var k in b) { if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && a[k] && typeof a[k] === "object") a[k] = merge(a[k], b[k]); else a[k] = b[k]; } return a; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  /* ---------------- language ---------------- */
  function L(en, es) { return S.lang === "es" ? es : en; }
  var BOOK = {}; D.BOOKS.forEach(function (b, i) { BOOK[b[0]] = { en: b[1], es: b[2], t: b[3], g: b[4], i: i }; });
  function bookName(code) { var b = BOOK[code]; return b ? (S.lang === "es" ? b.es : b.en) : code; }
  function refText(r) { if (!r) return ""; var p = r.split(" "); return bookName(p[0]) + " " + p[1]; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function verse(i) { var v = D.VERSES[i]; return { i: i, ref: v[0], refT: refText(v[0]), text: S.lang === "es" ? v[2] : v[1], note: S.lang === "es" ? v[4] : v[3], ver: S.lang === "es" ? "RVR1960" : "KJV" }; }

  /* ---------------- dates ---------------- */
  function dstr(d) { d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function today() { return dstr(); }
  function addDays(s, n) { var p = s.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2] + n); return dstr(d); }
  function dayNum() { var d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
  function votdIndex() { return (dayNum() * 7 + 3) % D.VERSES.length; }
  function dayRec(k) { k = k || today(); return S.days[k] || (S.days[k] = { xp: 0, read: false, trivia: false, verse: false, bonus: false }); }

  /* ---------------- levels & XP ---------------- */
  function xpFor(l) { return 50 * l * (l - 1); }           // xp needed to reach level l
  function level(xp) { var l = 1; while (xp >= xpFor(l + 1)) l++; return l; }
  var TITLES = [["Seed", "Semilla"], ["Sprout", "Brote"], ["Disciple", "Discípulo"], ["Faithful Servant", "Siervo Fiel"], ["Prayer Warrior", "Guerrero de Oración"],
    ["Messenger", "Mensajero"], ["Teacher of the Word", "Maestro de la Palabra"], ["Shepherd", "Pastor"], ["Watchman", "Atalaya"], ["Shining Light", "Lumbrera"]];
  function title(l) { var t = TITLES[Math.min(l, TITLES.length) - 1]; return L(t[0], t[1]); }

  function streakNow() {
    var s = S.streak; if (!s.last) return 0;
    var t = today(); if (s.last === t || s.last === addDays(t, -1)) return s.n; return 0;
  }
  function touchStreak() {
    var t = today(), s = S.streak;
    if (s.last === t) return;
    s.n = s.last === addDays(t, -1) ? s.n + 1 : 1; s.last = t; s.best = Math.max(s.best || 0, s.n);
    if (s.n >= 3) unlock("streak3"); if (s.n >= 7) unlock("streak7"); if (s.n >= 30) unlock("streak30");
  }
  function addXP(n) {
    if (!n) return;
    var before = level(S.xp);
    S.xp += n; dayRec().xp += n; touchStreak();
    var after = level(S.xp);
    save();
    if (after > before) {
      setTimeout(function () {
        sfx("level"); confetti(); toast(L("Level up!", "¡Subiste de nivel!"), L("Level ", "Nivel ") + after + " · " + title(after), "crown");
      }, 600);
      if (after >= 5) unlock("level5"); if (after >= 10) unlock("level10");
    }
  }
  function task(id) {
    var r = dayRec(); if (r[id]) return false;
    r[id] = true; addXP(20);
    if (r.read && r.trivia && r.verse && !r.bonus) {
      r.bonus = true; addXP(50); unlock("daily");
      setTimeout(function () { sfx("level"); confetti(); toast(L("Daily challenge complete!", "¡Reto diario completo!"), "+50 XP", "flame"); }, 1400);
    }
    save(); return true;
  }

  /* ---------------- achievements ---------------- */
  var ACH = [
    ["first", "spark", "First step", "Primer paso", "Finish your first game", "Termina tu primer juego"],
    ["daily", "flame", "Full day", "Día completo", "Complete the daily challenge", "Completa el reto diario"],
    ["streak3", "flame", "3-day streak", "Racha de 3", "Play 3 days in a row", "Juega 3 días seguidos"],
    ["streak7", "flame", "Week of faith", "Semana de fe", "Play 7 days in a row", "Juega 7 días seguidos"],
    ["streak30", "crown", "Unshakable", "Inquebrantable", "Play 30 days in a row", "Juega 30 días seguidos"],
    ["perfect", "star", "Perfect round", "Ronda perfecta", "10 of 10 in Trivia", "10 de 10 en Trivia"],
    ["combo5", "bolt", "On fire", "En llamas", "5 right answers in a row", "5 respuestas seguidas"],
    ["scribe", "feather", "Scribe", "Escriba", "Complete the Verse with no mistakes", "Completa el Versículo sin errores"],
    ["librarian", "books", "Librarian", "Bibliotecario", "Books in Order with no mistakes", "Libros en Orden sin errores"],
    ["preacher", "mic", "Preacher", "Predicador", "Play Sermon vs Sermon", "Juega Sermón vs Sermón"],
    ["family", "users", "Family night", "Noche familiar", "Play Family Mode", "Juega el Modo Familia"],
    ["reader", "book", "Faithful reader", "Lector fiel", "Read the verse of the day 7 times", "Lee el versículo del día 7 veces"],
    ["favs", "heart", "Treasured words", "Palabras atesoradas", "Save 5 favorite verses", "Guarda 5 versículos favoritos"],
    ["share", "share", "Light of the world", "Luz del mundo", "Share a verse", "Comparte un versículo"],
    ["level5", "shield", "Prayer Warrior", "Guerrero de oración", "Reach level 5", "Llega al nivel 5"],
    ["level10", "crown", "Shining Light", "Lumbrera", "Reach level 10", "Llega al nivel 10"]
  ];
  function unlock(id) {
    if (S.ach[id]) return; S.ach[id] = today(); save();
    var a = ACH.filter(function (x) { return x[0] === id; })[0]; if (!a) return;
    setTimeout(function () { sfx("unlock"); toast(L("Achievement unlocked", "Logro desbloqueado"), L(a[2], a[3]), a[1]); }, 900);
  }

  /* ---------------- icons ---------------- */
  var P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    play: '<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="16" cy="11" r=".9" fill="currentColor"/><circle cx="18" cy="13.6" r=".9" fill="currentColor"/>',
    book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20v-3"/><path d="M12 6.5v6M9.5 8.7h5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    flame: '<path d="M12 22c4 0 7-2.7 7-7 0-3.5-2.2-6.2-4-8 0 2.2-1 3.8-2.6 4.3C12.7 8.4 11 5 8.5 3c.4 3-1.2 5-2.6 6.8C4.7 11.3 5 13 5 15c0 4.3 3 7 7 7z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5" stroke-width="3"/>',
    heart: '<path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.2 5 3 1.4-1.8 3-3 5-3 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/>',
    share: '<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" fill="currentColor"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    half: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a4 4 0 0 1-4 4M7 5H4v2a4 4 0 0 0 4 4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14.6c2.6.1 4.4 1.8 5 4.6"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
    books: '<rect x="3" y="4" width="4" height="16" rx="1"/><rect x="8.5" y="4" width="4" height="16" rx="1"/><path d="m14.5 5.2 3.8-1 3.3 15.5-3.8 1z"/>',
    feather: '<path d="M20.2 3.8a6 6 0 0 0-8.5 0L5 10.5V19h8.5l6.7-6.7a6 6 0 0 0 0-8.5zM16 8 2 22M17.5 15H9"/>',
    spark: '<path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l3.5 3.5M15.5 15.5 19 19M19 5l-3.5 3.5M8.5 15.5 5 19"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor"/>',
    crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="currentColor"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    volume: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
    phone: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M11 18.5h2"/>',
    fb: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8z"/>',
    gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8S10.5 3 8 3.5 7 8 12 8zm0 0s1.5-5 4-4.5S17 8 12 8z"/>',
    download: '<path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M5 20h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>'
  };
  function ic(n, cls) { return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || "") + "</svg>"; }

  // illustrations for the game tiles
  var ART = {
    trivia: '<svg class="art" viewBox="0 0 120 120" fill="none"><circle cx="70" cy="50" r="44" fill="#ffb26b" opacity=".12"/><path d="M38 52h52v22a22 22 0 0 1-22 22h-8a22 22 0 0 1-22-22z" fill="#2a1a10" stroke="#e9c27a" stroke-width="3"/><path d="M90 58h6a10 10 0 0 1 0 20h-8" stroke="#e9c27a" stroke-width="3"/><path d="M52 40c0-6 6-6 6-12M66 40c0-6 6-6 6-12" stroke="#ffe3a6" stroke-width="3" stroke-linecap="round" opacity=".7"/><text x="64" y="84" text-anchor="middle" font-family="Lora,serif" font-weight="700" font-size="26" fill="#ffe3a6">?</text></svg>',
    verse: '<svg class="art" viewBox="0 0 120 120" fill="none"><circle cx="66" cy="54" r="44" fill="#7fb4ff" opacity=".12"/><rect x="34" y="30" width="58" height="66" rx="6" fill="#0f1a33" stroke="#e9c27a" stroke-width="3"/><path d="M44 46h38M44 56h26M44 66h38M44 76h18" stroke="#c9d8ff" stroke-width="3" stroke-linecap="round" opacity=".6"/><rect x="70" y="52" width="16" height="8" rx="2" fill="#e9c27a"/><path d="M28 30a8 8 0 0 1 16 0M82 96a8 8 0 0 0 16 0" stroke="#e9c27a" stroke-width="3"/></svg>',
    books: '<svg class="art" viewBox="0 0 120 120" fill="none"><circle cx="66" cy="54" r="44" fill="#58d39a" opacity=".12"/><rect x="34" y="34" width="14" height="62" rx="3" fill="#163a2a" stroke="#e9c27a" stroke-width="3"/><rect x="50" y="26" width="14" height="70" rx="3" fill="#1d2d4a" stroke="#e9c27a" stroke-width="3"/><rect x="66" y="40" width="14" height="56" rx="3" fill="#3a1d1d" stroke="#e9c27a" stroke-width="3"/><path d="m84 44 12-3 11 52-12 3z" fill="#2c2440" stroke="#e9c27a" stroke-width="3"/><path d="M38 46h6M54 38h6M70 52h6" stroke="#ffe3a6" stroke-width="3"/></svg>',
    sermon: '<svg class="art" viewBox="0 0 140 140" fill="none"><circle cx="70" cy="66" r="52" fill="#b39bff" opacity=".14"/><path d="M38 70h64l-8 50H46z" fill="#20183a" stroke="#e9c27a" stroke-width="3"/><path d="M30 62h80v10H30z" fill="#e9c27a"/><rect x="62" y="22" width="16" height="28" rx="8" fill="#20183a" stroke="#e9c27a" stroke-width="3"/><path d="M70 50v12" stroke="#e9c27a" stroke-width="3"/><path d="M60 92h20M70 82v22" stroke="#ffe3a6" stroke-width="4" stroke-linecap="round"/><path d="M28 34l-8-6M112 34l8-6M24 50h-9M116 50h9" stroke="#ffe3a6" stroke-width="3" stroke-linecap="round" opacity=".6"/></svg>',
    family: '<svg class="art" viewBox="0 0 140 140" fill="none"><circle cx="70" cy="70" r="54" fill="#e9c27a" opacity=".12"/><circle cx="48" cy="56" r="13" fill="#2a2140" stroke="#e9c27a" stroke-width="3"/><circle cx="92" cy="56" r="13" fill="#2a2140" stroke="#e9c27a" stroke-width="3"/><circle cx="70" cy="74" r="10" fill="#2a2140" stroke="#ffe3a6" stroke-width="3"/><path d="M24 104c2-14 12-22 24-22s20 6 22 14c2-8 10-14 22-14s22 8 24 22" stroke="#e9c27a" stroke-width="3" stroke-linecap="round"/><path d="M56 108c1-9 7-14 14-14s13 5 14 14" stroke="#ffe3a6" stroke-width="3" stroke-linecap="round"/><path d="m70 20 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#ffe3a6"/></svg>'
  };

  var COLORS = [["#ffe3a6", "#e0a030"], ["#ffc2a8", "#e0603e"], ["#bfe0ff", "#3f7ee6"], ["#c9f2d9", "#26a86a"], ["#e3d2ff", "#7d5ad6"], ["#ffd1e6", "#d9478d"], ["#ffe0c2", "#f07b2e"], ["#c4f1fb", "#1597bf"]];
  function avatar(name, color, cls, px) {
    var c = COLORS[(color || 0) % COLORS.length];
    var ch = (name || "?").trim().charAt(0).toUpperCase() || "?";
    var size = px ? ";width:" + px + "px;height:" + px + "px;font-size:" + Math.round(px * .42) + "px" : "";
    return '<div class="avatar ' + (cls || "") + '" style="--a1:' + c[0] + ";--a2:" + c[1] + size + '">' + esc(ch) + "</div>";
  }

  /* ---------------- sound & haptics ---------------- */
  var AC = null;
  function ctx() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (AC && AC.state === "suspended") AC.resume(); return AC; }
  function tone(f, t0, dur, type, vol) {
    var a = ctx(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain(); o.type = type || "sine"; o.frequency.value = f;
    var t = a.currentTime + t0; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .12, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .02);
  }
  function sfx(n) {
    if (S.sound) {
      if (n === "tap") tone(660, 0, .06, "triangle", .05);
      else if (n === "good") { tone(784, 0, .16, "triangle", .11); tone(1175, .08, .26, "triangle", .1); }
      else if (n === "bad") { tone(196, 0, .22, "sawtooth", .05); tone(147, .08, .28, "sine", .1); }
      else if (n === "combo") { [880, 1109, 1319].forEach(function (f, i) { tone(f, i * .06, .18, "triangle", .08); }); }
      else if (n === "level") { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, i * .09, .45, "triangle", .1); }); }
      else if (n === "unlock") { [1319, 1568, 2093].forEach(function (f, i) { tone(f, i * .07, .35, "sine", .07); }); }
      else if (n === "tick") tone(1000, 0, .04, "square", .025);
      else if (n === "win") { [392, 523, 659, 784, 659, 784, 1047].forEach(function (f, i) { tone(f, i * .11, .4, "triangle", .1); }); }
    }
    if (S.haptic && navigator.vibrate) { try { navigator.vibrate(n === "bad" ? [30, 40, 30] : n === "good" ? 15 : n === "tap" ? 6 : 0); } catch (e) {} }
  }

  /* ---------------- confetti ---------------- */
  function confetti() {
    var c = document.createElement("canvas"); c.id = "confetti"; document.body.appendChild(c);
    var w = c.width = innerWidth * devicePixelRatio, h = c.height = innerHeight * devicePixelRatio, x = c.getContext("2d");
    var cols = ["#ffe3a6", "#e9c27a", "#fff6dd", "#b88a3e", "#ff8a4c", "#7fb4ff"], ps = [];
    for (var i = 0; i < 140; i++) ps.push({ x: w / 2 + (Math.random() - .5) * w * .3, y: h * .35, vx: (Math.random() - .5) * 26, vy: -Math.random() * 30 - 8, s: (Math.random() * 7 + 4) * devicePixelRatio, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[i % cols.length], f: Math.random() < .5 });
    var t0 = performance.now();
    (function step(t) {
      x.clearRect(0, 0, w, h);
      ps.forEach(function (p) { p.vy += .9; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; if (p.f) x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); else { x.beginPath(); x.arc(0, 0, p.s / 3, 0, 7); x.fill(); } x.restore(); });
      if (t - t0 < 2600) requestAnimationFrame(step); else c.remove();
    })(t0);
  }

  /* ---------------- toast & sheet ---------------- */
  function toast(a, b, icon) {
    var t = document.createElement("div"); t.className = "toast";
    t.innerHTML = '<div class="md">' + ic(icon || "star") + "</div><div><b>" + esc(a) + "</b>" + (b ? "<span>" + esc(b) + "</span>" : "") + "</div>";
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3500);
  }
  function sheet(html, onMount) {
    closeSheet();
    var s = document.createElement("div"); s.className = "scrim"; s.id = "scrim";
    var p = document.createElement("div"); p.className = "sheet"; p.id = "sheet"; p.innerHTML = html;
    s.addEventListener("click", closeSheet);
    document.body.appendChild(s); document.body.appendChild(p);
    if (onMount) onMount(p);
    return p;
  }
  function closeSheet() { var a = $("#scrim"), b = $("#sheet"); if (a) a.remove(); if (b) b.remove(); }

  /* ---------------- share a verse as an image ---------------- */
  function wrap(x, text, maxW) {
    var words = text.split(" "), lines = [], line = "";
    words.forEach(function (w) { var t = line ? line + " " + w : w; if (x.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line); return lines;
  }
  function verseImage(v) {
    return new Promise(function (res) {
      var c = document.createElement("canvas"), W = 1080, H = 1350; c.width = W; c.height = H; var x = c.getContext("2d");
      var dawn = S.theme === "dawn";
      var g = x.createLinearGradient(0, 0, 0, H);
      if (dawn) { g.addColorStop(0, "#f8f0de"); g.addColorStop(1, "#e8d9bb"); } else { g.addColorStop(0, "#141c36"); g.addColorStop(1, "#070b17"); }
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      var gold = dawn ? "#a8742a" : "#e9c27a", ink = dawn ? "#2b2115" : "#f6f0e4";
      // light rays
      x.save(); x.translate(W / 2, 250); x.globalAlpha = dawn ? .1 : .09;
      for (var i = 0; i < 36; i++) { x.rotate(Math.PI * 2 / 36); x.fillStyle = gold; x.beginPath(); x.moveTo(0, 0); x.lineTo(-22, -1100); x.lineTo(22, -1100); x.closePath(); x.fill(); }
      x.restore();
      var rg = x.createRadialGradient(W / 2, 250, 10, W / 2, 250, 520); rg.addColorStop(0, dawn ? "rgba(255,255,255,.5)" : "rgba(233,194,122,.25)"); rg.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = rg; x.fillRect(0, 0, W, H);
      // border
      x.strokeStyle = gold; x.globalAlpha = .55; x.lineWidth = 3; x.strokeRect(54, 54, W - 108, H - 108); x.globalAlpha = .25; x.strokeRect(70, 70, W - 140, H - 140); x.globalAlpha = 1;
      var img = new Image();
      img.onload = img.onerror = function () {
        if (img.width) { x.save(); var s = 170, ix = W / 2 - s / 2, iy = 150; x.beginPath(); x.roundRect ? x.roundRect(ix, iy, s, s, 38) : x.rect(ix, iy, s, s); x.clip(); x.drawImage(img, ix, iy, s, s); x.restore(); }
        var size = v.text.length > 220 ? 50 : v.text.length > 140 ? 58 : 66;
        x.font = "italic 500 " + size + "px Lora, Georgia, serif"; x.fillStyle = ink; x.textAlign = "center";
        var lines = wrap(x, "“" + v.text + "”", W - 240), lh = size * 1.42, total = lines.length * lh, y0 = 380 + (H - 380 - 280 - total) / 2 + size;
        lines.forEach(function (l, i) { x.fillText(l, W / 2, y0 + i * lh); });
        x.fillStyle = gold; x.font = "700 40px system-ui, -apple-system, Roboto, sans-serif"; x.fillText(v.refT.toUpperCase(), W / 2, y0 + total + 40);
        x.font = "600 26px system-ui, -apple-system, Roboto, sans-serif"; x.globalAlpha = .7; x.fillStyle = ink; x.fillText(v.ver, W / 2, y0 + total + 86); x.globalAlpha = 1;
        x.fillStyle = gold; x.font = "800 30px system-ui, -apple-system, Roboto, sans-serif"; x.fillText("BIBLE CHALLENGE", W / 2, H - 120);
        c.toBlob(function (b) { res(b); }, "image/png");
      };
      img.src = "img/icon-192.jpg";
    });
  }
  function shareVerse(i) {
    var v = verse(i);
    var p = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('italic 500 40px Lora')]).catch(function () {}) : Promise.resolve();
    p.then(function () { return verseImage(v); }).then(function (blob) {
      var file; try { file = new File([blob], "versiculo-" + v.ref.replace(/[^A-Z0-9]/gi, "-") + ".png", { type: "image/png" }); } catch (e) {}
      var url = URL.createObjectURL(blob);
      sheet('<h2>' + L("Share this verse", "Comparte este versículo") + '</h2><p class="muted small">' + L("A beautiful card, ready for WhatsApp, Instagram or Facebook.", "Una tarjeta lista para WhatsApp, Instagram o Facebook.") + '</p>' +
        '<img src="' + url + '" alt="" style="width:100%;border-radius:18px;margin:10px 0 16px;border:1px solid var(--line)">' +
        '<div class="row"><button class="btn gold block" id="shNow">' + ic("share") + L("Share", "Compartir") + '</button><button class="btn ghost" id="shCopy" style="white-space:nowrap">' + L("Copy text", "Copiar texto") + '</button></div><p class="muted small center" style="margin:12px 0 0">' + L("Tip: press and hold the picture to save it.", "Consejo: mantén presionada la imagen para guardarla.") + '</p>', function (sh) {
          var text = "“" + v.text + "” — " + v.refT;
          function copy() {
            var ok = function () { toast(L("Copied!", "¡Copiado!"), L("Paste it anywhere", "Pégalo donde quieras"), "check"); };
            try { navigator.clipboard.writeText(text + "\n\nBible Challenge").then(ok, function () {}); } catch (e) {}
          }
          $("#shNow", sh).onclick = function () {
            S.shares++; unlock("share"); save();
            try {
              if (file && navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], text: text }).catch(copy);
              else if (navigator.share) navigator.share({ text: text + "\n\nBible Challenge" }).catch(copy);
              else copy();
            } catch (e) { copy(); }
          };
          $("#shCopy", sh).onclick = function () { S.shares++; unlock("share"); save(); copy(); };
        });
    });
  }


  function xpForLevel(l) { return xpFor(l); }
  window.BC = { D: D, S: function () { return S; }, setS: function (x) { S = x; }, fresh: fresh, merge: merge, save: save, L: L, esc: esc, ic: ic, P: P, ART: ART, sfx: sfx, confetti: confetti,
    toast: toast, sheet: sheet, closeSheet: closeSheet, addXP: addXP, task: task, unlock: unlock, ACH: ACH, verse: verse, votdIndex: votdIndex, refText: refText,
    bookName: bookName, BOOK: BOOK, avatar: avatar, COLORS: COLORS, level: level, xpFor: xpForLevel, title: title, streakNow: streakNow, dayRec: dayRec,
    today: today, addDays: addDays, dstr: dstr, shareVerse: shareVerse, $: $, $$: $$,
    refresh: function () { if (BC.onRefresh) BC.onRefresh(); }, go: function (t) { if (BC.onGo) BC.onGo(t); }, submitScore: function (g, s) { if (BC.onScore) BC.onScore(g, s); } };
  var BC = window.BC;
})();
