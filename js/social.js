/* Bible Challenge — social app: accounts, feeds, friends, messages, calendar, game room */
(function () {
  "use strict";
  var B = window.BC, D = B.D, A = window.API, $ = B.$, $$ = B.$$, esc = B.esc, ic = B.ic;
  var L = function (en, es) { return B.L(en, es); };
  var S = function () { return B.S(); };

  // extra icons
  var P = B.P;
  P.search = '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>';
  P.bell = '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>';
  P.chat = '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/>';
  P.cal = '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>';
  P.send = '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>';
  P.more = '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>';
  P.userplus = '<circle cx="9" cy="8" r="4"/><path d="M2 21c.8-4 3.6-6 7-6s6.2 2 7 6M19 8v6M16 11h6"/>';
  P.usercheck = '<circle cx="9" cy="8" r="4"/><path d="M2 21c.8-4 3.6-6 7-6s6.2 2 7 6M16 11l2 2 4-4"/>';
  P.logout = '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>';
  P.flag = '<path d="M4 21V4M4 4h13l-2 4 2 4H4"/>';
  P.ban = '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>';
  P.alarm = '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M5 3 2 6M19 3l3 3"/>';
  P.note = '<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8 12h8M8 16h6"/>';
  P.pin = '<path d="M12 22s7-7.2 7-12.5A7 7 0 0 0 5 9.5C5 14.8 12 22 12 22z"/><circle cx="12" cy="9.5" r="2.5"/>';
  P.comment = '<path d="M4 5h16v11H8l-4 4z"/>';
  P.lock = '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>';
  P.pray = '<path d="M12 3c-1 2-1.5 4-1.5 6.5v5L7 18l-2 3h7V9.5C12 7 12 5 12 3zM12 3c1 2 1.5 4 1.5 6.5v5L17 18l2 3h-7"/>';
  P.left = P.back;
  P.check2 = '<path d="m4 12.5 4.5 4.5L20 6"/>';
  P.camera = '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>';
  P.image = '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>';
  P.film = '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 8h18M8 3l2.5 5M14 3l2.5 5"/><path d="m10 12 5 3-5 3z" fill="currentColor"/>';
  P.mute = '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="m17 9 5 5M22 9l-5 5"/>';
  P.playbtn = '<path d="M7 4.5v15L19.5 12z" fill="currentColor" stroke="none"/>';

  var REACT = [["amen", "🙏", "Amen", "Amén"], ["love", "❤️", "Love", "Amor"], ["fire", "🔥", "Fire", "Fuego"]];
  var KINDS = { text: ["Post", "Publicación"], prayer: ["Prayer request", "Pedido de oración"], verse: ["Verse", "Versículo"], score: ["Game", "Juego"] };

  var app = { user: null, me: null, tab: "home", notif: { requests: 0, unread: 0, activity: [] }, friends: null, comFilter: "all", chatWith: null, unsub: null, calSel: null, calMonth: null, events: null, lb: { game: "trivia", scope: "friends" }, seenActivity: 0 };

  /* ---------------- helpers ---------------- */
  function ago(iso) {
    var s = Math.max(1, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return L("now", "ahora");
    if (s < 3600) return Math.floor(s / 60) + " min";
    if (s < 86400) return Math.floor(s / 3600) + " h";
    if (s < 604800) return Math.floor(s / 86400) + " " + L("d", "d");
    return new Date(iso).toLocaleDateString(S().lang === "es" ? "es" : "en", { month: "short", day: "numeric" });
  }
  function errText(e) {
    var m = (e && (e.message || e.error_description)) || String(e);
    var map = [
      [/username_taken/, L("That username is taken. Try another one.", "Ese usuario ya existe. Prueba otro.")],
      [/bad_username/, L("Use 3–20 letters, numbers or _ (no spaces).", "Usa de 3 a 20 letras, números o _ (sin espacios).")],
      [/too_young/, L("You must be at least 13 years old to use Bible Challenge online.", "Debes tener al menos 13 años para usar Bible Challenge en línea.")],
      [/bad_birth_year/, L("Check your birth year.", "Revisa tu año de nacimiento.")],
      [/minor_protected/, L("This account belongs to a minor. Only their parent can add them.", "Esta cuenta es de un menor. Solo su papá o mamá puede agregarlo.")],
      [/adult_only/, L("Only adult accounts can approve a teen.", "Solo una cuenta de adulto puede aprobar a un menor.")],
      [/code_not_found/, L("That code doesn't exist or was already used.", "Ese código no existe o ya se usó.")],
      [/Invalid login credentials/i, L("Wrong email or password.", "Correo o contraseña incorrectos.")],
      [/Email not confirmed/i, L("Confirm your email first. Check your inbox.", "Primero confirma tu correo. Revisa tu bandeja de entrada.")],
      [/already registered/i, L("That email already has an account. Sign in instead.", "Ese correo ya tiene una cuenta. Inicia sesión.")],
      [/Password should be|weak/i, L("Use a password with at least 6 characters.", "Usa una contraseña de al menos 6 caracteres.")],
      [/rate limit|too many/i, L("Too many tries. Wait a few minutes and try again.", "Demasiados intentos. Espera unos minutos e intenta otra vez.")],
      [/row-level security|violates/i, L("You can't do that.", "No puedes hacer eso.")],
      [/offline|Failed to fetch|NetworkError/i, L("No connection. Check your internet.", "Sin conexión. Revisa tu internet.")]
    ];
    for (var i = 0; i < map.length; i++) if (map[i][0].test(m)) return map[i][1];
    return L("Something went wrong. Try again.", "Algo salió mal. Intenta otra vez.");
  }
  function fail(e) { console.warn(e); B.toast(errText(e), "", "info"); }
  function badge(n) { return n ? '<span class="nbadge">' + (n > 99 ? "99+" : n) + "</span>" : ""; }
  var STAFF = {};
  function roleBadge(r, uid) {
    var es = uid && STAFF[uid] && STAFF[uid].badge_es;
    return r === "owner" ? '<span class="rbadge owner">' + L("OWNER", es || "DUEÑO") + "</span>" : r === "admin" ? '<span class="rbadge">ADMIN</span>' : "";
  }
  var PH = {}, phWant = {}, phT = null;
  function photoOf(uid) { return PH[uid] && PH[uid].a ? A.photoUrl(PH[uid].a) : null; }
  function av(name, color, px, uid) {
    var h = B.avatar(name, color, "", px);
    if (!uid) return h;
    h = h.replace('<div class="avatar ', '<div data-uid="' + esc(uid) + '" class="avatar ');
    var u = photoOf(uid);
    return u ? h.replace(/<\/div>$/, '<img src="' + esc(u) + '" alt="" loading="lazy"></div>') : h;
  }
  function seedPhoto(p) { if (p && p.id) PH[p.id] = { a: p.avatar_path || null, b: p.banner_path || null }; }
  function paintPhotos(root) {
    $$("[data-uid]", root || document).forEach(function (el) {
      var u = photoOf(el.dataset.uid), img = el.querySelector("img");
      if (u && (!img || img.getAttribute("src") !== u)) { if (!img) { img = document.createElement("img"); img.alt = ""; el.appendChild(img); } img.src = u; }
      else if (!u && img) img.remove();
    });
  }
  function wantPhotos() {
    $$("[data-uid]").forEach(function (el) { var id = el.dataset.uid; if (!(id in PH)) phWant[id] = 1; });
    var ids = Object.keys(phWant); if (!ids.length || !app.me) return;
    clearTimeout(phT); phT = setTimeout(function () {
      var batch = Object.keys(phWant).slice(0, 100); batch.forEach(function (id) { delete phWant[id]; PH[id] = PH[id] || { a: null, b: null }; });
      A.photos(batch).then(function (rows) { (rows || []).forEach(seedPhoto); paintPhotos(); }).catch(function () {});
    }, 60);
  }
  new MutationObserver(function () { if (app.me) wantPhotos(); }).observe(document.body, { childList: true, subtree: true });
  function spinner() { return '<div class="spin"><i></i><i></i><i></i></div>'; }
  function linkify(t) { return esc(t).replace(/\n/g, "<br>"); }

  /* ---------------- theme ---------------- */
  var ACCENTS = [["violet", "#8f72ff", "Violet", "Violeta"], ["blue", "#3b8bff", "Blue", "Azul"], ["gold", "#f5b301", "Gold", "Dorado"], ["green", "#1fbf75", "Green", "Verde"], ["rose", "#ff4f8b", "Rose", "Rosa"]];
  function applyTheme() {
    var t = S().theme === "light" ? "light" : "dark", h = document.documentElement;
    h.setAttribute("data-theme", t); h.setAttribute("data-accent", S().accent || "violet");
    var m = $('meta[name="theme-color"]'); if (m) m.content = t === "light" ? "#f4f2fa" : "#0c0a18";
  }

  /* ---------------- boot & auth ---------------- */
  function boot() {
    try { var m0 = location.search.match(/[?&]add=([a-z0-9_]{3,20})/i); if (m0) localStorage.setItem("bc_add", m0[1].toLowerCase()); } catch (e) {}
    if (!S().lang) { S().lang = /^es/i.test(navigator.language || "es") ? "es" : "en"; B.save(); }
    document.documentElement.lang = S().lang;
    applyTheme();
    var sp = $("#splash");
    function hide() { if (sp) { sp.classList.add("out"); setTimeout(function () { sp.remove(); sp = null; }, 600); } }
    A.ready().then(function (u) {
      app.user = u; A.onAuth(function (ev, user) {
        if (ev === "PASSWORD_RECOVERY") { app.user = user; newPasswordScreen(); return; }
        if (ev === "SIGNED_OUT") { app.user = null; app.me = null; welcome(); }
      });
      return route();
    }).catch(function (e) { console.warn(e); offlineScreen(); }).then(hide);
  }
  function route() {
    if (!app.user) { welcome(); return Promise.resolve(); }
    return A.profile().then(function (p) {
      app.me = p; seedPhoto(p);
      if (!p) return setupProfile();
      if (p.status === "pending_parent") return pendingScreen();
      if (p.status === "suspended") return gate(L("Account suspended", "Cuenta suspendida"), L("Your account was suspended for breaking the community rules.", "Tu cuenta fue suspendida por no cumplir las reglas de la comunidad."));
      startApp();
    });
  }
  function shell(html) {
    var o = $("#auth"); if (!o) { o = document.createElement("div"); o.id = "auth"; o.className = "onb"; document.body.appendChild(o); }
    o.innerHTML = '<div class="sky"></div>' + html; return o;
  }
  function closeShell() { var o = $("#auth"); if (o) o.remove(); }
  function langToggle() { return '<div class="langtog"><button data-l="es" class="' + (S().lang === "es" ? "on" : "") + '">ES</button><button data-l="en" class="' + (S().lang === "en" ? "on" : "") + '">EN</button></div>'; }
  function bindLang(o, again) { $$(".langtog button", o).forEach(function (b) { b.onclick = function () { S().lang = b.dataset.l; B.save(); document.documentElement.lang = S().lang; again(); }; }); }

  function welcome() {
    teardown();
    var o = shell(langToggle() + '<div class="welcome"><img class="logo" src="img/icon-192.jpg" alt="Bible Challenge"><h1 class="wordmark">Bible Challenge</h1>' +
      '<p>' + L("Share your faith, play with friends and grow in the Word — together.", "Comparte tu fe, juega con tus amigos y crece en la Palabra, juntos.") + "</p>" +
      '<div class="wfeat"><span>' + ic("users") + L("Friends", "Amigos") + "</span><span>" + ic("chat") + L("Messages", "Mensajes") + "</span><span>" + ic("play") + L("Games", "Juegos") + "</span><span>" + ic("cal") + L("Calendar", "Calendario") + "</span></div>" +
      '<button class="btn gold block" id="wSign">' + L("Create account", "Crear cuenta") + '</button><button class="btn ghost block" id="wLog" style="margin-top:10px">' + L("I already have an account", "Ya tengo cuenta") + "</button></div>");
    bindLang(o, welcome);
    $("#wSign", o).onclick = function () { B.sfx("tap"); authForm("signup"); };
    $("#wLog", o).onclick = function () { B.sfx("tap"); authForm("login"); };
  }
  function authForm(mode) {
    var su = mode === "signup";
    var o = shell(langToggle() + '<div class="authcard"><button class="iconbtn" id="aBack">' + ic("back") + '</button><h1>' + (su ? L("Create your account", "Crea tu cuenta") : L("Welcome back", "Bienvenido de nuevo")) + "</h1>" +
      '<form id="aForm" novalidate><label class="field"><span>' + L("Email", "Correo electrónico") + '</span><input class="input" id="aEmail" type="email" autocomplete="email" required></label>' +
      '<label class="field"><span>' + L("Password", "Contraseña") + '</span><input class="input" id="aPw" type="password" autocomplete="' + (su ? "new-password" : "current-password") + '" minlength="6" required></label>' +
      '<p class="ferr" id="aErr"></p><button class="btn gold block" id="aGo" type="submit">' + (su ? L("Continue", "Continuar") : L("Sign in", "Entrar")) + "</button></form>" +
      (su ? '<p class="muted small center" style="margin-top:14px">' + L("By continuing you agree to treat everyone with respect. Posts that break the rules can be removed.", "Al continuar aceptas tratar a todos con respeto. Las publicaciones que rompan las reglas pueden ser borradas.") + "</p>"
        : '<button class="link center" id="aForgot" style="display:block;margin:16px auto 0">' + L("Forgot my password", "Olvidé mi contraseña") + "</button>") + "</div>");
    bindLang(o, function () { authForm(mode); });
    $("#aBack", o).onclick = welcome;
    var f = $("#aForm", o), err = $("#aErr", o), go = $("#aGo", o);
    f.onsubmit = function (e) {
      e.preventDefault(); err.textContent = "";
      var em = $("#aEmail", o).value.trim(), pw = $("#aPw", o).value;
      if (!/^\S+@\S+\.\S+$/.test(em)) { err.textContent = L("Write a valid email.", "Escribe un correo válido."); return; }
      if (pw.length < 6) { err.textContent = L("Password needs at least 6 characters.", "La contraseña necesita al menos 6 caracteres."); return; }
      go.disabled = true;
      (su ? A.signUp(em, pw) : A.signIn(em, pw)).then(function (d) {
        if (su && !d.session) { checkEmail(em); return; }
        app.user = A.user(); return route();
      }).catch(function (e) { err.textContent = errText(e); }).then(function () { go.disabled = false; });
    };
    var fg = $("#aForgot", o);
    if (fg) fg.onclick = function () {
      var em = $("#aEmail", o).value.trim();
      if (!/^\S+@\S+\.\S+$/.test(em)) { err.textContent = L("Write your email above first.", "Primero escribe tu correo arriba."); return; }
      A.resetPassword(em).then(function () { B.toast(L("Email sent", "Correo enviado"), L("Open the link to choose a new password.", "Abre el enlace para elegir una contraseña nueva."), "check"); }).catch(function (e) { err.textContent = errText(e); });
    };
  }
  function checkEmail(em) {
    var o = shell('<div class="welcome"><div class="bigicon">' + ic("send") + '</div><h1>' + L("Check your email", "Revisa tu correo") + "</h1><p>" +
      L("We sent a link to ", "Enviamos un enlace a ") + "<b>" + esc(em) + "</b>. " + L("Open it to confirm your account, then come back and sign in.", "Ábrelo para confirmar tu cuenta y luego vuelve a iniciar sesión.") +
      '</p><button class="btn gold block" id="cGo">' + L("Sign in", "Iniciar sesión") + "</button></div>");
    $("#cGo", o).onclick = function () { authForm("login"); };
  }
  function newPasswordScreen() {
    var o = shell('<div class="authcard"><h1>' + L("New password", "Nueva contraseña") + '</h1><label class="field"><span>' + L("New password", "Nueva contraseña") + '</span><input class="input" id="nPw" type="password" minlength="6"></label><p class="ferr" id="nErr"></p><button class="btn gold block" id="nGo">' + L("Save", "Guardar") + "</button></div>");
    $("#nGo", o).onclick = function () {
      var pw = $("#nPw", o).value; if (pw.length < 6) { $("#nErr", o).textContent = L("At least 6 characters.", "Al menos 6 caracteres."); return; }
      A.updatePassword(pw).then(function () { B.toast(L("Password updated", "Contraseña actualizada"), "", "check"); route(); }).catch(function (e) { $("#nErr", o).textContent = errText(e); });
    };
  }
  function setupProfile() {
    var color = S().color || 0, year = new Date().getFullYear();
    var o = shell('<div class="authcard"><h1>' + L("Set up your profile", "Crea tu perfil") + '</h1><p class="muted">' + L("This is how your friends will find you.", "Así te encontrarán tus amigos.") + "</p>" +
      '<div class="row" style="justify-content:center;margin:6px 0 16px" id="pAv">' + av(S().name || "?", color, 84) + "</div>" +
      '<label class="field"><span>' + L("Your name", "Tu nombre") + '</span><input class="input" id="pName" maxlength="30" value="' + esc(S().name || "") + '" placeholder="Yancey"></label>' +
      '<label class="field"><span>' + L("Username", "Usuario") + '</span><div class="prefix"><b>@</b><input class="input" id="pUser" maxlength="20" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="yancey"></div></label>' +
      '<label class="field"><span>' + L("Year you were born", "Año en que naciste") + '</span><input class="input" id="pYear" type="number" inputmode="numeric" min="' + (year - 110) + '" max="' + year + '" placeholder="1990"></label>' +
      '<div class="field"><span>' + L("Color", "Color") + '</span><div class="swatches">' + B.COLORS.map(function (c, i) { return '<button class="sw ' + (i === color ? "on" : "") + '" data-i="' + i + '" style="--a1:' + c[0] + ";--a2:" + c[1] + '"></button>'; }).join("") + "</div></div>" +
      '<p class="ferr" id="pErr"></p><button class="btn gold block" id="pGo">' + L("Create profile", "Crear perfil") + '</button><button class="link center" id="pOut" style="display:block;margin:14px auto 0">' + L("Sign out", "Cerrar sesión") + "</button></div>");
    var nm = $("#pName", o), us = $("#pUser", o);
    function paint() { $("#pAv", o).innerHTML = av(nm.value || "?", color, 84); }
    nm.oninput = function () { paint(); if (!us.dataset.touched) us.value = nm.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_]/g, "").slice(0, 20); };
    us.oninput = function () { us.dataset.touched = 1; us.value = us.value.toLowerCase().replace(/[^a-z0-9_]/g, ""); };
    $$(".sw", o).forEach(function (b) { b.onclick = function (e) { e.preventDefault(); color = +b.dataset.i; $$(".sw", o).forEach(function (x) { x.classList.toggle("on", x === b); }); paint(); }; });
    $("#pOut", o).onclick = function () { A.signOut(); };
    $("#pGo", o).onclick = function () {
      var err = $("#pErr", o), y = +$("#pYear", o).value; err.textContent = "";
      if (!nm.value.trim()) { err.textContent = L("Write your name.", "Escribe tu nombre."); return; }
      if (!/^[a-z0-9_]{3,20}$/.test(us.value)) { err.textContent = errText("bad_username"); return; }
      if (!y || y < year - 110 || y > year) { err.textContent = errText("bad_birth_year"); return; }
      if (year - y < 13) { err.textContent = errText("too_young"); return; }
      this.disabled = true; var btn = this;
      A.createProfile({ username: us.value, display_name: nm.value.trim(), birth_year: y, color: color }).then(function () {
        S().name = nm.value.trim(); S().color = color; B.save(); B.sfx("level"); return route();
      }).catch(function (e) { err.textContent = errText(e); btn.disabled = false; });
    };
  }
  function pendingScreen() {
    var p = app.me;
    var o = shell('<div class="welcome"><div class="bigicon">' + ic("shield") + '</div><h1>' + L("Ask your parent", "Pídele permiso a tu papá o mamá") + "</h1><p>" +
      L("Because you're under 18, a parent needs to approve your account.", "Como eres menor de 18 años, tu papá o mamá tiene que aprobar tu cuenta.") + "</p>" +
      '<div class="card center" style="margin-bottom:16px"><div class="eyebrow">' + L("Your code", "Tu código") + '</div><div class="pcode">' + esc(p.parent_code || "") + '</div><p class="muted small" style="margin:8px 0 0">' +
      L("Your parent opens Bible Challenge with their own account → Profile → Settings → “Approve my child” and types this code.", "Tu papá o mamá abre Bible Challenge con su propia cuenta → Perfil → Ajustes → “Aprobar a mi hijo/a” y escribe este código.") + "</p></div>" +
      '<button class="btn gold block" id="kCheck">' + L("I'm approved, check again", "Ya me aprobaron, revisar") + '</button><button class="link center" id="kOut" style="display:block;margin:14px auto 0">' + L("Sign out", "Cerrar sesión") + "</button></div>");
    $("#kCheck", o).onclick = function () { route().then(function () { if (app.me && app.me.status === "pending_parent") B.toast(L("Not approved yet", "Todavía no te aprueban"), "", "clock"); }); };
    $("#kOut", o).onclick = function () { A.signOut(); };
  }
  function gate(t, msg) {
    var o = shell('<div class="welcome"><div class="bigicon">' + ic("ban") + "</div><h1>" + esc(t) + "</h1><p>" + esc(msg) + '</p><button class="btn ghost block" id="gOut">' + L("Sign out", "Cerrar sesión") + "</button></div>");
    $("#gOut", o).onclick = function () { A.signOut(); };
  }
  function offlineScreen() {
    var o = shell('<div class="welcome"><div class="bigicon">' + ic("globe") + "</div><h1>" + L("No connection", "Sin conexión") + "</h1><p>" + L("Bible Challenge needs internet to connect with your friends.", "Bible Challenge necesita internet para conectarte con tus amigos.") + '</p><button class="btn gold block" id="oRetry">' + L("Try again", "Intentar otra vez") + "</button></div>");
    $("#oRetry", o).onclick = function () { location.reload(); };
  }

  /* ---------------- main app ---------------- */
  var pollT = null;
  function startApp() {
    closeShell();
    S().name = app.me.display_name; S().color = app.me.color; B.save();
    $("#app").classList.remove("hidden"); $("#tabs").classList.remove("hidden");
    B.onRefresh = function () { render(true); };
    B.onGo = function (t) { go(t); };
    B.onScore = function (g, s) { A.submitScore(g, s).catch(function () {}); };
    B.shareScore = shareScore;
    if (app.unsub) app.unsub();
    app.unsub = A.subscribe(onMessage);
    if (A.staff) A.staff().then(function (rows) { (rows || []).forEach(function (x) { STAFF[x.id] = x; }); if (rows && rows.length) render(true); }).catch(function () {});
    clearInterval(pollT); pollT = setInterval(loadNotif, 45000); loadNotif();
    setInterval(checkAlarms, 30000); setTimeout(checkAlarms, 3000);
    go(app.tab || "home");
    setTimeout(handleInviteParam, 600);
    callsBoot();
  }
  function teardown() {
    clearInterval(pollT); if (app.unsub) { app.unsub(); app.unsub = null; }
    if (CALL) hangUp(); if (app.callUnsub) { app.callUnsub(); app.callUnsub = null; }
    $("#app").classList.add("hidden"); $("#tabs").classList.add("hidden");
    $$(".stage").forEach(function (s) { s.remove(); }); B.closeSheet();
  }
  function loadNotif() {
    return A.notifications().then(function (n) {
      app.notif = n; paintBadges();
    }).catch(function () {});
  }
  function unseen() { var c = 0; (app.notif.activity || []).forEach(function (a) { if (new Date(a.at).getTime() > (S().seenAct || 0)) c++; }); return c + (app.notif.requests || 0); }
  function paintBadges() {
    var b = $("#bellBadge"); if (b) b.innerHTML = badge(unseen());
    var m = $('.tab[data-tab="messages"] .tb'); if (m) m.innerHTML = badge(app.notif.unread);
  }
  function onMessage(msg) {
    if (app.chatWith && msg.sender === app.chatWith.id) { appendBubble(msg); A.markRead(msg.sender).catch(function () {}); return; }
    app.notif.unread = (app.notif.unread || 0) + 1; paintBadges(); B.sfx("good");
    B.toast(L("New message", "Mensaje nuevo"), msg.body.slice(0, 60), "chat");
    if (app.tab === "messages") render(true);
  }

  var NAV = [["home", "home", "Home", "Inicio"], ["reels", "film", "Reels", "Reels"], ["community", "globe", "Community", "Comunidad"], ["games", "play", "Games", "Juegos"], ["messages", "chat", "Messages", "Mensajes"]];
  function go(t) { app.tab = t; render(); var v = $("#view"); v.scrollTop = 0; v.classList.remove("enter"); void v.offsetWidth; v.classList.add("enter"); }
  function render(keep) {
    var v = $("#view"), y = v.scrollTop;
    applyTheme();
    $("#tabs").innerHTML = NAV.map(function (n) {
      return '<button class="tab ' + (app.tab === n[0] ? "on" : "") + '" data-tab="' + n[0] + '"><span class="ti">' + ic(n[1]) + '<span class="tb">' + (n[0] === "messages" ? badge(app.notif.unread) : "") + "</span></span>" + L(n[2], n[3]) + "</button>";
    }).join("");
    var t = app.tab;
    v.classList.toggle("immersive", t === "reels");
    if (t !== "reels" && R.obs) { R.obs.disconnect(); R.obs = null; }
    v.innerHTML = (t === "reels" ? "" : header()) + '<div id="tabBody"></div>';
    var body = $("#tabBody");
    if (t === "home") homeTab(body); else if (t === "reels") reelsTab(body); else if (t === "community") communityTab(body); else if (t === "games") gamesTab(body); else messagesTab(body);
    if (keep) v.scrollTop = y;
  }
  function header() {
    var titles = { home: null, community: L("Community", "Comunidad"), games: L("Game Room", "Sala de Juegos"), messages: L("Messages", "Mensajes") };
    var t = titles[app.tab];
    return '<header class="appbar">' + (t ? '<h1 class="pagetitle">' + t + "</h1>" : '<div class="brand"><img src="img/icon-192.jpg" alt=""><span class="wordmark">Bible Challenge</span></div>') +
      '<span class="spacer"></span><button class="iconbtn" data-act="search" aria-label="search">' + ic("search") + '</button><button class="iconbtn" data-act="calendar" aria-label="calendar">' + ic("cal") + '</button><button class="iconbtn" data-act="notif" aria-label="notifications">' + ic("bell") + '<span id="bellBadge">' + badge(unseen()) + "</span></button>" +
      '<button class="avbtn" data-act="me" aria-label="profile">' + av(app.me.display_name, app.me.color, 38, app.me.id) + "</button></header>";
  }

  /* ---------------- home ---------------- */
  function homeTab(el) {
    var v = B.verse(B.votdIndex()), r = B.dayRec(), done = (r.read ? 1 : 0) + (r.trivia ? 1 : 0) + (r.verse ? 1 : 0);
    el.innerHTML = '<div class="stories" id="stories"><button class="story" data-act="bible"><span class="sring">' +
      '<span class="sinner sv">' + ic("book") + "</span></span><small>" + L("Today's verse", "Versículo") + "</small></button>" +
      '<button class="story" data-tab="games"><span class="sring ' + (done === 3 ? "done" : "") + '"><span class="sinner chal"><b>' + done + "/3</b></span></span><small>" + L("Challenge", "Reto diario") + "</small></button>" +
      '<button class="story" data-act="friends"><span class="sring add"><span class="sinner">' + ic("userplus") + "</span></span><small>" + L("Add friends", "Amigos") + "</small></button>" +
      '<button class="story" data-act="invite"><span class="sring"><span class="sinner">' + ic("share") + "</span></span><small>" + L("Invite", "Invitar") + "</small></button>" +
      '<span id="storyFriends"></span></div>' +
      composerCard("friends") +
      '<button class="votd card" data-act="bible"><div class="eyebrow">' + ic("sun").replace("<svg", '<svg style="width:14px;height:14px;vertical-align:-2px;margin-right:4px"') + L("Verse of the day", "Versículo del día") + '</div><p class="verse">' + esc(v.text) + '</p><div class="ref">' + esc(v.refT) + "<small>" + v.ver + "</small></div></button>" +
      '<div id="feed"></div>';
    loadFriends().then(function (fr) {
      var s = $("#storyFriends"); if (!s) return;
      s.innerHTML = fr.slice(0, 12).map(function (f) { return '<button class="story" data-act="profile" data-id="' + f.id + '"><span class="sring friend">' + av(f.display_name, f.color, 58, f.id) + "</span><small>" + esc(f.display_name.split(" ")[0]) + "</small></button>"; }).join("");
    });
    loadFeed($("#feed"), "home");
  }
  function loadFriends(force) {
    if (app.friends && !force) return Promise.resolve(app.friends);
    return A.friends().then(function (f) { app.friends = f || []; return app.friends; }).catch(function () { return app.friends || []; });
  }
  function composerCard(vis) {
    return '<button class="composer card" data-act="compose" data-vis="' + vis + '">' + av(app.me.display_name, app.me.color, 42, app.me.id) + '<span class="cph">' +
      (vis === "public" ? L("Share with the community…", "Comparte con la comunidad…") : L("What's on your heart, ", "¿Qué hay en tu corazón, ") + esc(app.me.display_name.split(" ")[0]) + "?") + "</span>" +
      '<span class="cicons"><i class="c-pr">🙏</i><i class="c-vb">📖</i></span></button>';
  }

  /* ---------------- posts ---------------- */
  var feeds = {};
  function loadFeed(el, scope, user, more) {
    var key = scope + (user || "");
    var st = feeds[key] && more ? feeds[key] : (feeds[key] = { items: [], end: false, el: el });
    st.el = el;
    if (!more) el.innerHTML = spinner();
    var before = more && st.items.length ? st.items[st.items.length - 1].created_at : null;
    return A.feed(scope, before, user).then(function (rows) {
      rows = rows || [];
      st.items = st.items.concat(rows); st.end = rows.length < 20;
      paintFeed(st, scope, user);
    }).catch(function (e) { el.innerHTML = '<div class="empty">' + esc(errText(e)) + "</div>"; });
  }
  function paintFeed(st, scope, user) {
    var items = st.items;
    if (scope === "community" && app.comFilter !== "all") items = items.filter(function (p) { return p.kind === app.comFilter; });
    if (!items.length) {
      st.el.innerHTML = scope === "home" ? '<div class="empty card"><div class="bigicon sm">' + ic("users") + "</div><h3>" + L("Your feed is waiting", "Tu muro está esperando") + "</h3><p>" + L("Add friends to see their posts here, or write your first post.", "Agrega amigos para ver sus publicaciones aquí, o escribe tu primera publicación.") + '</p><div class="row" style="justify-content:center;gap:8px;flex-wrap:wrap"><button class="btn gold" data-act="friends">' + ic("search") + L("Find friends", "Buscar amigos") + '</button><button class="btn ghost" data-act="invite">' + ic("share") + L("Invite", "Invitar") + "</button></div></div>"
        : '<div class="empty">' + (scope === "user" ? L("No posts yet.", "Todavía no hay publicaciones.") : L("Nothing here yet. Be the first to share!", "Todavía no hay nada. ¡Sé el primero en compartir!")) + "</div>";
      return;
    }
    st.el.innerHTML = items.map(postHTML).join("") + (st.end ? "" : '<button class="btn ghost block" data-act="more" data-scope="' + scope + '" data-user="' + (user || "") + '">' + L("Load more", "Ver más") + "</button>");
  }
  function postHTML(p) {
    var mine = p.author === app.me.id, total = p.amen + p.love + p.fire;
    var kind = p.kind !== "text" && KINDS[p.kind] ? '<span class="kchip k-' + p.kind + '">' + (p.kind === "prayer" ? "🙏 " : p.kind === "verse" ? "📖 " : "🏆 ") + L(KINDS[p.kind][0], KINDS[p.kind][1]) + "</span>" : "";
    var verseBox = "";
    if (p.verse_ref) { var vi = D.VERSES.findIndex(function (x) { return x[0] === p.verse_ref; }); if (vi >= 0) { var vv = B.verse(vi); verseBox = '<div class="pverse"><p>' + esc(vv.text) + '</p><b>' + esc(vv.refT) + "</b></div>"; } }
    return '<article class="post card" data-id="' + p.id + '"><header class="phead"><button class="pav" data-act="profile" data-id="' + p.author + '">' + av(p.display_name, p.color, 44, p.author) + '</button><div class="pmeta"><button data-act="profile" data-id="' + p.author + '"><b>' + esc(p.display_name) + "</b>" + roleBadge(p.role, p.author) + '</button><span>' + ago(p.created_at) + " · " + (p.visibility === "public" ? ic("globe") : ic("users")) + "</span></div>" +
      '<button class="iconbtn ghostbtn" data-act="pmenu" data-id="' + p.id + '" data-author="' + p.author + '" data-mine="' + (mine ? 1 : 0) + '">' + ic("more") + "</button></header>" +
      kind + '<div class="pbody">' + linkify(p.body) + "</div>" + verseBox +
      (total || p.comments ? '<div class="pstats"><span>' + (p.amen ? "🙏" : "") + (p.love ? "❤️" : "") + (p.fire ? "🔥" : "") + (total ? " " + total : "") + "</span><span>" + (p.comments ? p.comments + " " + L(p.comments === 1 ? "comment" : "comments", p.comments === 1 ? "comentario" : "comentarios") : "") + "</span></div>" : "") +
      '<div class="pactions">' + REACT.map(function (r) { return '<button class="ract ' + (p.my_reaction === r[0] ? "on" : "") + '" data-act="react" data-id="' + p.id + '" data-k="' + r[0] + '"><span class="em">' + r[1] + "</span>" + L(r[2], r[3]) + "</button>"; }).join("") +
      '<button class="ract" data-act="comments" data-id="' + p.id + '">' + ic("comment") + "</button></div>" +
      '<div class="cbox hidden" id="cb-' + p.id + '"></div></article>';
  }
  function findPost(id) { for (var k in feeds) { var f = feeds[k].items.filter(function (p) { return p.id === id; })[0]; if (f) return f; } return null; }
  function repaintPost(id) {
    var p = findPost(id); if (!p) return;
    $$('.post[data-id="' + id + '"]').forEach(function (el) {
      var open = !$(".cbox", el).classList.contains("hidden"), box = $(".cbox", el).innerHTML;
      var tmp = document.createElement("div"); tmp.innerHTML = postHTML(p); var n = tmp.firstChild;
      el.replaceWith(n); if (open) { var cb = $(".cbox", n); cb.classList.remove("hidden"); cb.innerHTML = box; bindCommentForm(n, id); }
    });
  }
  function react(id, k) {
    var p = findPost(id); if (!p) return;
    var prev = p.my_reaction, next = prev === k ? null : k;
    if (prev) p[prev]--; if (next) p[next]++; p.my_reaction = next; repaintPost(id); B.sfx(next ? "good" : "tap");
    A.react(id, next).catch(function (e) { if (next) p[next]--; if (prev) p[prev]++; p.my_reaction = prev; repaintPost(id); fail(e); });
  }
  function openComments(id) {
    var el = $('.post[data-id="' + id + '"] .cbox'); if (!el) return;
    if (!el.classList.contains("hidden")) { el.classList.add("hidden"); return; }
    el.classList.remove("hidden"); el.innerHTML = spinner();
    A.comments(id).then(function (cs) {
      el.innerHTML = (cs || []).map(function (c) {
        return '<div class="cmt"><button data-act="profile" data-id="' + c.author + '">' + av(c.display_name, c.color, 32, c.author) + '</button><div class="cbub"><b>' + esc(c.display_name) + "</b><p>" + linkify(c.body) + '</p><span>' + ago(c.created_at) +
          (c.author === app.me.id || (findPost(id) || {}).author === app.me.id || isMod() ? ' · <button class="link sm" data-act="delcmt" data-id="' + c.id + '" data-post="' + id + '">' + L("Delete", "Borrar") + "</button>" : ' · <button class="link sm" data-act="report" data-type="comment" data-id="' + c.id + '">' + L("Report", "Reportar") + "</button>") + "</span></div></div>";
      }).join("") + '<form class="cform">' + av(app.me.display_name, app.me.color, 32, app.me.id) + '<input class="input" maxlength="500" placeholder="' + L("Write a comment…", "Escribe un comentario…") + '"><button class="iconbtn send" aria-label="send">' + ic("send") + "</button></form>";
      bindCommentForm($('.post[data-id="' + id + '"]'), id);
      var inp = $("input", el); if (inp) inp.focus();
    }).catch(function (e) { el.innerHTML = '<div class="empty">' + esc(errText(e)) + "</div>"; });
  }
  function bindCommentForm(postEl, id) {
    var f = $(".cform", postEl); if (!f) return;
    f.onsubmit = function (e) {
      e.preventDefault(); var inp = $("input", f), t = inp.value.trim(); if (!t) return;
      inp.disabled = true;
      A.addComment(id, t).then(function () { var p = findPost(id); if (p) p.comments++; B.sfx("good"); var box = $(".cbox", postEl); box.classList.add("hidden"); repaintPost(id); openComments(id); })
        .catch(function (e) { fail(e); inp.disabled = false; });
    };
  }
  function isMod() { return app.me && (app.me.role === "admin" || app.me.role === "owner"); }

  function compose(vis, kind, verseRef) {
    var minor = app.me.is_minor; if (minor) vis = "friends";
    var st = { vis: vis || "friends", kind: kind || "text", verse: verseRef || null };
    var sh = B.sheet('<div class="row" style="margin-bottom:12px">' + av(app.me.display_name, app.me.color, 44, app.me.id) + '<div><b>' + esc(app.me.display_name) + '</b><div class="seg sm" id="cVis"><button data-v="friends">' + ic("users") + L("Friends", "Amigos") + '</button><button data-v="public" ' + (minor ? "disabled" : "") + ">" + ic("globe") + L("Public", "Público") + "</button></div></div></div>" +
      '<textarea class="input big" id="cText" maxlength="2000" placeholder="' + L("Write something that builds others up…", "Escribe algo que edifique a otros…") + '"></textarea><div id="cVerse"></div>' +
      '<div class="chips" id="cKind" style="margin:12px 0"><button class="chipbtn" data-k="text">✏️ ' + L("Post", "Publicación") + '</button><button class="chipbtn" data-k="prayer">🙏 ' + L("Prayer request", "Pedido de oración") + '</button><button class="chipbtn" data-k="verse">📖 ' + L("Verse of the day", "Versículo del día") + "</button></div>" +
      (minor ? '<p class="muted small">' + ic("lock").replace("<svg", '<svg style="width:13px;height:13px;vertical-align:-2px"') + " " + L("Your posts are visible to your friends only.", "Tus publicaciones solo las ven tus amigos.") + "</p>" : "") +
      '<button class="btn gold block" id="cPost">' + L("Post", "Publicar") + "</button>");
    function paint() {
      $$("#cVis button", sh).forEach(function (b) { b.classList.toggle("on", b.dataset.v === st.vis); });
      $$("#cKind button", sh).forEach(function (b) { b.classList.toggle("on", b.dataset.k === st.kind); });
      var vb = $("#cVerse", sh);
      if (st.kind === "verse") { var v = B.verse(B.votdIndex()); st.verse = v.ref; vb.innerHTML = '<div class="pverse"><p>' + esc(v.text) + "</p><b>" + esc(v.refT) + "</b></div>"; } else { st.verse = null; vb.innerHTML = ""; }
    }
    paint();
    $$("#cVis button", sh).forEach(function (b) { b.onclick = function () { if (!b.disabled) { st.vis = b.dataset.v; paint(); } }; });
    $$("#cKind button", sh).forEach(function (b) { b.onclick = function () { st.kind = b.dataset.k; paint(); var t = $("#cText", sh); if (st.kind === "prayer" && !t.value) t.placeholder = L("What can we pray for?", "¿Por qué podemos orar?"); }; });
    var ta = $("#cText", sh); setTimeout(function () { ta.focus(); }, 250);
    $("#cPost", sh).onclick = function () {
      var t = ta.value.trim(); if (!t && st.kind === "verse") t = L("Today's verse 🙌", "Versículo de hoy 🙌");
      if (!t) { ta.focus(); return; }
      this.disabled = true; var btn = this;
      A.createPost({ body: t, visibility: st.vis, kind: st.kind, verse_ref: st.verse }).then(function () {
        B.closeSheet(); B.sfx("level"); B.toast(L("Posted!", "¡Publicado!"), st.vis === "public" ? L("Everyone in the community can see it.", "Toda la comunidad lo puede ver.") : L("Your friends can see it.", "Tus amigos lo pueden ver."), "check");
        B.addXP(5); go(st.vis === "public" && app.tab === "community" ? "community" : app.tab === "community" ? "community" : "home");
      }).catch(function (e) { btn.disabled = false; fail(e); });
    };
  }
  function shareScore(label, score, stats) {
    var txt = L("I just scored ", "Acabo de hacer ") + score.toLocaleString() + L(" points in ", " puntos en ") + label + "! " + (stats && stats[0] ? "(" + stats[0][1] + " " + stats[0][0].toLowerCase() + ") " : "") + L("Can you beat me? 🏆", "¿Me puedes ganar? 🏆");
    A.createPost({ body: txt, visibility: "friends", kind: "score" }).then(function () { B.toast(L("Shared on your wall", "Compartido en tu muro"), "", "check"); }).catch(fail);
  }
  function postMenu(id, author, mine) {
    var html = '<div class="menu">' + (mine || isMod() ? '<button class="mi danger" data-act="delpost" data-id="' + id + '">' + ic("trash") + L("Delete post", "Borrar publicación") + "</button>" : "") +
      (!mine ? '<button class="mi" data-act="report" data-type="post" data-id="' + id + '">' + ic("flag") + L("Report post", "Reportar publicación") + '</button><button class="mi danger" data-act="block" data-id="' + author + '">' + ic("ban") + L("Block this person", "Bloquear a esta persona") + "</button>" : "") +
      '<button class="mi" data-act="closesheet">' + L("Cancel", "Cancelar") + "</button></div>";
    B.sheet(html);
  }
  function reportSheet(type, id) {
    var reasons = [["Offensive or hateful", "Ofensivo o de odio"], ["Bullying or harassment", "Acoso o bullying"], ["Inappropriate content", "Contenido inapropiado"], ["Spam or scam", "Spam o estafa"], ["I'm worried about someone's safety", "Me preocupa la seguridad de alguien"]];
    var sh = B.sheet("<h2>" + L("Report", "Reportar") + '</h2><p class="muted small">' + L("Your report is private. The moderators will review it.", "Tu reporte es privado. Los moderadores lo revisarán.") + '</p><div class="menu">' +
      reasons.map(function (r, i) { return '<button class="mi" data-r="' + i + '">' + L(r[0], r[1]) + "</button>"; }).join("") + "</div>");
    $$("[data-r]", sh).forEach(function (b) {
      b.onclick = function () {
        A.report(type, id, reasons[+b.dataset.r][0]).then(function () { B.closeSheet(); B.toast(L("Thanks for reporting", "Gracias por reportar"), L("We'll review it soon.", "Lo revisaremos pronto."), "shield"); }).catch(fail);
      };
    });
  }

  /* ---------------- invite ---------------- */
  function inviteLink() { return location.origin + location.pathname + "?add=" + encodeURIComponent(app.me.username); }
  function invite() {
    var url = inviteLink(), text = L("Join me on Bible Challenge! Let's share our faith, play Bible games and grow together 🙏 Add me: @", "¡Únete a Bible Challenge conmigo! Compartamos nuestra fe, juguemos juegos bíblicos y crezcamos juntos 🙏 Agrégame: @") + app.me.username;
    function copy() {
      try { navigator.clipboard.writeText(text + "\n" + url).then(function () { B.toast(L("Invite link copied", "Enlace copiado"), L("Paste it in WhatsApp or a text", "Pégalo en WhatsApp o en un mensaje"), "check"); }, sheetCopy); } catch (e) { sheetCopy(); }
    }
    function sheetCopy() { B.sheet("<h2>" + L("Invite friends", "Invitar amigos") + '</h2><p class="muted small">' + L("Copy this link and send it:", "Copia este enlace y envíalo:") + '</p><input class="input" readonly value="' + esc(url) + '" onclick="this.select()">'); }
    if (navigator.share) navigator.share({ title: "Bible Challenge", text: text, url: url }).catch(function (e) { if (e && e.name !== "AbortError") copy(); });
    else copy();
  }
  function inviteCard() {
    return '<div class="card invite"><div class="bigicon sm">' + ic("userplus") + '</div><div style="flex:1;min-width:0"><b>' + L("Invite your friends", "Invita a tus amigos") + '</b><span>' + L("Send them a link to join you here.", "Mándales un enlace para que se unan.") + '</span></div><button class="btn gold sm" data-act="invite">' + ic("share") + L("Invite", "Invitar") + "</button></div>";
  }
  // opened from an invite link: show that person's profile so they can be added
  function handleInviteParam() {
    var m = location.search.match(/[?&]add=([a-z0-9_]{3,20})/i), name = m ? m[1].toLowerCase() : null;
    try { if (!name) name = localStorage.getItem("bc_add"); else localStorage.setItem("bc_add", name); } catch (e) {}
    if (!name || !app.me) return;
    try { localStorage.removeItem("bc_add"); history.replaceState(null, "", location.pathname); } catch (e) {}
    if (name === app.me.username) return;
    A.searchUsers(name).then(function (rs) { var u = (rs || []).filter(function (x) { return x.username === name; })[0]; if (u) openProfile(u.id); }).catch(function () {});
  }

  /* ---------------- community ---------------- */
  function communityTab(el) {
    var chips = [["all", "All", "Todo"], ["prayer", "🙏 Prayer", "🙏 Oración"], ["verse", "📖 Verses", "📖 Versículos"], ["text", "✏️ Posts", "✏️ Publicaciones"], ["score", "🏆 Games", "🏆 Juegos"]];
    el.innerHTML = '<p class="muted small" style="margin:-4px 2px 12px">' + L("Public posts from everyone on Bible Challenge.", "Publicaciones públicas de todos en Bible Challenge.") + "</p>" +
      (app.me.is_minor ? "" : composerCard("public")) +
      '<div class="chips scrollx" style="margin:14px 0">' + chips.map(function (c) { return '<button class="chipbtn ' + (app.comFilter === c[0] ? "on" : "") + '" data-act="cfilter" data-k="' + c[0] + '">' + L(c[1], c[2]) + "</button>"; }).join("") + "</div>" +
      '<div id="feed"></div>';
    loadFeed($("#feed"), "community");
  }

  /* ---------------- people & profiles ---------------- */
  function stage(title, html) {
    var s = document.createElement("div"); s.className = "stage social";
    s.innerHTML = '<div class="sky"></div><div class="stage-in"><div class="ghead"><button class="iconbtn" data-x="1">' + ic("back") + '</button><div class="ttl">' + esc(title) + '</div><div style="width:40px"></div></div><div class="body"></div></div>';
    document.body.appendChild(s);
    $("[data-x]", s).onclick = function () { B.sfx("tap"); s.remove(); if (s.onclose) s.onclose(); };
    var b = $(".body", s); b.innerHTML = html || ""; return { el: s, body: b, close: function () { s.remove(); if (s.onclose) s.onclose(); } };
  }
  function openProfile(id) {
    var st = stage("", spinner());
    var mine = id === app.me.id;
    Promise.all([mine ? Promise.resolve(app.me) : A.getProfile(id), loadFriends(true)]).then(function (r) {
      var p = r[0];
      if (!p) { st.body.innerHTML = '<div class="empty">' + L("This profile isn't available.", "Este perfil no está disponible.") + "</div>"; return; }
      var friend = r[1].some(function (f) { return f.id === id; }); seedPhoto(p);
      $(".ttl", st.el).textContent = p.display_name;
      var lv = B.level(S().xp);
      var bn = A.photoUrl(p.banner_path);
      st.body.innerHTML = '<div class="cover' + (bn ? " hasimg" : "") + '" style="--a1:' + B.COLORS[p.color % 8][0] + ";--a2:" + B.COLORS[p.color % 8][1] + (bn ? ";background-image:url(" + esc(bn) + ")" : "") + '">' + (mine ? '<button class="iconbtn glass coveredit" data-x3="banner">' + ic("camera") + "</button>" : "") + '</div><div class="phero"><div class="avwrap">' + av(p.display_name, p.color, 96, p.id) + (mine ? '<button class="avedit" data-x3="avatar">' + ic("camera") + "</button>" : "") + "</div>" +
        '<h2>' + esc(p.display_name) + roleBadge(p.role, p.id) + '</h2><div class="muted">@' + esc(p.username) + "</div>" + (p.bio ? '<p class="bio">' + esc(p.bio) + "</p>" : "") +
        (mine ? '<div class="pstatsrow"><div><b>' + r[1].length + "</b><span>" + L("Friends", "Amigos") + "</span></div><div><b>" + lv + "</b><span>" + L("Level", "Nivel") + "</span></div><div><b>" + B.streakNow() + "</b><span>" + L("Streak", "Racha") + "</span></div></div>" : "") +
        '<div class="row wrap" id="pActs" style="justify-content:center;margin-top:14px"></div></div>' +
        (mine ? '<div class="section"><h2>' + L("Achievements", "Logros") + '</h2><span class="more">' + Object.keys(S().ach).length + "/" + B.ACH.length + '</span></div><div class="badges">' + B.ACH.map(function (x) { var on = !!S().ach[x[0]]; return '<div class="badge ' + (on ? "" : "locked") + '"><div class="md">' + ic(x[1]) + "</div><span>" + L(x[2], x[3]) + "</span></div>"; }).join("") + "</div>" : "") +
        '<div class="section"><h2>' + L("Posts", "Publicaciones") + '</h2></div><div id="pFeed"></div>';
      $$("[data-x3]", st.body).forEach(function (b) { b.onclick = function () { pickPhoto(b.dataset.x3, function () { st.close(); openProfile(id); }); }; });
      var acts = $("#pActs", st.body);
      function paintActs(rel) {
        if (mine) { acts.innerHTML = '<button class="btn gold sm" data-x2="edit">' + ic("edit") + L("Edit profile", "Editar perfil") + '</button><button class="btn ghost sm" data-x2="friends">' + ic("users") + L("Friends", "Amigos") + '</button><button class="btn ghost sm" data-x2="invite">' + ic("share") + '</button><button class="btn ghost sm" data-x2="settings">' + ic("gear") + "</button>"; }
        else acts.innerHTML = (rel === "friend" ? '<button class="btn ghost sm" data-x2="unfriend">' + ic("usercheck") + L("Friends", "Amigos") + "</button>" + '<button class="btn gold sm" data-x2="msg">' + ic("chat") + L("Message", "Mensaje") + "</button>"
          : rel === "sent" ? '<button class="btn ghost sm" disabled>' + ic("clock") + L("Request sent", "Solicitud enviada") + "</button>"
            : rel === "received" ? '<button class="btn gold sm" data-x2="add">' + ic("usercheck") + L("Accept request", "Aceptar solicitud") + "</button>"
              : '<button class="btn gold sm" data-x2="add">' + ic("userplus") + L("Add friend", "Agregar amigo") + "</button>") +
          '<button class="btn ghost sm" data-x2="more">' + ic("more") + "</button>";
        $$("[data-x2]", acts).forEach(function (b) {
          b.onclick = function () {
            var a = b.dataset.x2; B.sfx("tap");
            if (a === "edit") editProfile(function () { st.close(); openProfile(id); });
            else if (a === "settings") settings();
            else if (a === "invite") invite();
            else if (a === "friends") friendsScreen();
            else if (a === "add") A.sendRequest(id).then(function (res) { B.sfx("good"); app.friends = null; paintActs(res === "friends" ? "friend" : "sent"); }).catch(fail);
            else if (a === "msg") { st.close(); openChat({ id: id, display_name: p.display_name, color: p.color }); }
            else if (a === "unfriend") B.sheet('<div class="menu"><button class="mi danger" id="uf">' + L("Remove friend", "Eliminar de amigos") + '</button><button class="mi" data-act="closesheet">' + L("Cancel", "Cancelar") + "</button></div>", function (sh) {
              $("#uf", sh).onclick = function () { A.removeFriend(id).then(function () { B.closeSheet(); app.friends = null; paintActs("none"); }).catch(fail); };
            });
            else if (a === "more") B.sheet('<div class="menu"><button class="mi" data-act="report" data-type="user" data-id="' + id + '">' + ic("flag") + L("Report profile", "Reportar perfil") + '</button><button class="mi danger" data-act="block" data-id="' + id + '">' + ic("ban") + L("Block", "Bloquear") + "</button>" +
              (isMod() && p.role === "user" ? '<button class="mi danger" data-act="suspend" data-id="' + id + '">' + ic("lock") + L("Suspend account (moderator)", "Suspender cuenta (moderador)") + "</button>" : "") + '<button class="mi" data-act="closesheet">' + L("Cancel", "Cancelar") + "</button></div>");
          };
        });
      }
      var rel = friend ? "friend" : "none";
      if (!mine && !friend) A.searchUsers(p.username).then(function (rs) { var m = (rs || []).filter(function (x) { return x.id === id; })[0]; paintActs(m ? m.relation : "none"); }).catch(function () { paintActs("none"); });
      paintActs(rel);
      loadFeed($("#pFeed", st.body), "user", id);
    }).catch(function (e) { st.body.innerHTML = '<div class="empty">' + esc(errText(e)) + "</div>"; });
  }
  // crop and shrink a picked picture on the phone before uploading
  function cropImage(file, W, H) {
    return new Promise(function (res, rej) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.max(W / img.width, H / img.height), w = W / s, h = H / s, x = (img.width - w) / 2, y = (img.height - h) / 2;
        var c = document.createElement("canvas"); c.width = W; c.height = H; c.getContext("2d").drawImage(img, x, y, w, h, 0, 0, W, H);
        URL.revokeObjectURL(url); c.toBlob(function (b) { b ? res(b) : rej(new Error("image")); }, "image/jpeg", .86);
      };
      img.onerror = function () { rej(new Error("image")); }; img.src = url;
    });
  }
  function pickPhoto(kind, done) {
    var has = kind === "avatar" ? app.me.avatar_path : app.me.banner_path;
    var sh = B.sheet("<h2>" + (kind === "avatar" ? L("Profile picture", "Foto de perfil") : L("Profile banner", "Portada del perfil")) + "</h2>" +
      '<div class="phprev pk-' + kind + '" id="phPrev">' + (kind === "avatar" ? av(app.me.display_name, app.me.color, 140, app.me.id) : '<div class="bannerprev" style="' + (has ? "background-image:url(" + esc(A.photoUrl(has)) + ")" : "") + '"></div>') + "</div>" +
      '<label class="btn gold block" style="margin-top:14px">' + ic("image") + L("Choose a photo", "Elegir una foto") + '<input type="file" accept="image/*" id="phFile" hidden></label>' +
      (has ? '<button class="btn ghost block" id="phDel" style="margin-top:10px;color:var(--bad)">' + ic("trash") + L("Remove", "Quitar") + "</button>" : "") +
      '<p class="ferr" id="phErr" style="margin-top:10px"></p><p class="muted small center">' + L("Please use appropriate photos. Inappropriate photos can be removed.", "Usa fotos apropiadas. Las fotos inapropiadas se pueden quitar.") + "</p>");
    var err = $("#phErr", sh);
    $("#phFile", sh).onchange = function () {
      var f = this.files && this.files[0]; if (!f) return; err.textContent = "";
      if (!/^image\//.test(f.type)) { err.textContent = L("That file isn't a picture.", "Ese archivo no es una foto."); return; }
      var lab = this.parentNode; lab.classList.add("busy"); lab.firstChild && (lab.lastChild.previousSibling.textContent = L("Uploading…", "Subiendo…"));
      cropImage(f, kind === "avatar" ? 480 : 1200, kind === "avatar" ? 480 : 420).then(function (blob) {
        return A.uploadPhoto(kind, blob, has);
      }).then(function (path) {
        if (kind === "avatar") app.me.avatar_path = path; else app.me.banner_path = path;
        seedPhoto(app.me); paintPhotos(); B.closeSheet(); B.sfx("good"); B.toast(L("Saved!", "¡Guardado!"), "", "check"); render(true); if (done) done();
      }).catch(function (e) { lab.classList.remove("busy"); err.textContent = /image/.test(e.message) ? L("We couldn't open that picture. Try another one.", "No pudimos abrir esa foto. Prueba con otra.") : errText(e); });
    };
    var del = $("#phDel", sh);
    if (del) del.onclick = function () {
      A.removePhoto(kind, has).then(function () { if (kind === "avatar") app.me.avatar_path = null; else app.me.banner_path = null; seedPhoto(app.me); paintPhotos(); B.closeSheet(); render(true); if (done) done(); }).catch(fail);
    };
  }
  function editProfile(done) {
    var c = app.me.color;
    var sh = B.sheet("<h2>" + L("Edit profile", "Editar perfil") + '</h2><div class="row" style="gap:10px;margin:8px 0 16px"><button class="btn ghost sm" id="ePic">' + ic("camera") + L("Profile picture", "Foto de perfil") + '</button><button class="btn ghost sm" id="eBan">' + ic("image") + L("Banner", "Portada") + "</button></div>" + '<label class="field"><span>' + L("Name", "Nombre") + '</span><input class="input" id="eName" maxlength="30" value="' + esc(app.me.display_name) + '"></label>' +
      '<label class="field"><span>' + L("About me", "Sobre mí") + '</span><textarea class="input" id="eBio" maxlength="160" placeholder="' + L("e.g. Saved by grace ✝️", "Ej: Salvo por gracia ✝️") + '">' + esc(app.me.bio || "") + "</textarea></label>" +
      '<div class="field"><span>' + L("Color", "Color") + '</span><div class="swatches">' + B.COLORS.map(function (x, i) { return '<button class="sw ' + (i === c ? "on" : "") + '" data-i="' + i + '" style="--a1:' + x[0] + ";--a2:" + x[1] + '"></button>'; }).join("") + "</div></div>" +
      '<button class="btn gold block" id="eSave">' + L("Save", "Guardar") + "</button>");
    $$(".sw", sh).forEach(function (b) { b.onclick = function () { c = +b.dataset.i; $$(".sw", sh).forEach(function (x) { x.classList.toggle("on", x === b); }); }; });
    $("#ePic", sh).onclick = function () { pickPhoto("avatar", done); };
    $("#eBan", sh).onclick = function () { pickPhoto("banner", done); };
    $("#eSave", sh).onclick = function () {
      var n = $("#eName", sh).value.trim(), bio = $("#eBio", sh).value.trim(); if (!n) return;
      A.updateProfile(n, bio, c).then(function () { app.me.display_name = n; app.me.bio = bio; app.me.color = c; S().name = n; S().color = c; B.save(); B.closeSheet(); render(true); if (done) done(); }).catch(fail);
    };
  }
  function friendsScreen(startTab) {
    var st = stage(L("Friends", "Amigos")), tab = startTab || "friends";
    function paint() {
      st.body.innerHTML = '<div class="seg" style="margin-bottom:14px"><button data-t="friends" class="' + (tab === "friends" ? "on" : "") + '">' + L("My friends", "Mis amigos") + '</button><button data-t="requests" class="' + (tab === "requests" ? "on" : "") + '">' + L("Requests", "Solicitudes") + badge(app.notif.requests) + '</button><button data-t="find" class="' + (tab === "find" ? "on" : "") + '">' + L("Find", "Buscar") + '</button></div><div id="fBody">' + spinner() + "</div>";
      $$("[data-t]", st.body).forEach(function (b) { b.onclick = function () { tab = b.dataset.t; paint(); }; });
      var fb = $("#fBody", st.body);
      if (tab === "friends") loadFriends(true).then(function (fr) {
        fb.innerHTML = inviteCard() + (fr.length ? '<div class="card">' + fr.map(function (f) { return personRow(f, f.is_parent ? L("Parent", "Papá/Mamá") : f.is_child ? L("Your child", "Tu hijo/a") : "@" + f.username, '<button class="iconbtn" data-act="chatwith" data-id="' + f.id + '" data-name="' + esc(f.display_name) + '" data-color="' + f.color + '">' + ic("chat") + "</button>"); }).join("") + "</div>"
          : '<div class="empty">' + L("You don't have friends here yet. Search for them!", "Todavía no tienes amigos aquí. ¡Búscalos!") + "</div>");
      });
      else if (tab === "requests") A.requests().then(function (rq) {
        fb.innerHTML = rq && rq.length ? '<div class="card">' + rq.map(function (r) { return personRow({ id: r.user_id, display_name: r.display_name, color: r.color }, "@" + r.username, '<button class="btn gold sm" data-acc="' + r.id + '">' + L("Accept", "Aceptar") + '</button><button class="iconbtn" data-dec="' + r.id + '">' + ic("close") + "</button>"); }).join("") + "</div>" : '<div class="empty">' + L("No pending requests.", "No tienes solicitudes pendientes.") + "</div>";
        $$("[data-acc]", fb).forEach(function (b) { b.onclick = function () { A.respond(b.dataset.acc, true).then(function () { B.sfx("good"); app.friends = null; loadNotif(); tab = "friends"; paint(); }).catch(fail); }; });
        $$("[data-dec]", fb).forEach(function (b) { b.onclick = function () { A.respond(b.dataset.dec, false).then(function () { loadNotif(); paint(); }).catch(fail); }; });
      }).catch(function (e) { fb.innerHTML = '<div class="empty">' + esc(errText(e)) + "</div>"; });
      else {
        fb.innerHTML = inviteCard() + '<div class="searchbar" style="margin-top:12px">' + ic("search") + '<input class="input" id="fQ" placeholder="' + L("Name or @username", "Nombre o @usuario") + '" autocapitalize="off"></div><div id="fRes" style="margin-top:12px"><p class="muted small center">' + L("Type at least 2 letters.", "Escribe al menos 2 letras.") + "</p></div>";
        var q = $("#fQ", fb), t = null; q.focus();
        q.oninput = function () { clearTimeout(t); t = setTimeout(function () { doSearch(q.value.replace(/^@/, ""), $("#fRes", fb)); }, 300); };
      }
    }
    paint(); return st;
  }
  function personRow(f, sub, end) { return '<div class="lrow"><button data-act="profile" data-id="' + f.id + '" style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;text-align:left">' + av(f.display_name, f.color, 44, f.id) + '<div style="min-width:0"><b>' + esc(f.display_name) + "</b><span>" + esc(sub || "") + '</span></div></button><div class="row">' + (end || "") + "</div></div>"; }
  function doSearch(q, el) {
    if (q.trim().length < 2) { el.innerHTML = '<p class="muted small center">' + L("Type at least 2 letters.", "Escribe al menos 2 letras.") + "</p>"; return; }
    el.innerHTML = spinner();
    A.searchUsers(q).then(function (rs) {
      if (!rs || !rs.length) { el.innerHTML = '<div class="empty">' + L("No one found.", "No se encontró a nadie.") + "</div>"; return; }
      el.innerHTML = '<div class="card">' + rs.map(function (u) {
        var btn = u.relation === "friend" ? '<span class="tagok">' + ic("check2") + "</span>" : u.relation === "sent" ? '<span class="muted small">' + L("Sent", "Enviada") + "</span>" : '<button class="btn gold sm" data-add="' + u.id + '">' + (u.relation === "received" ? L("Accept", "Aceptar") : ic("userplus") + L("Add", "Agregar")) + "</button>";
        return personRow(u, "@" + u.username, btn);
      }).join("") + "</div>";
      $$("[data-add]", el).forEach(function (b) { b.onclick = function () { b.disabled = true; A.sendRequest(b.dataset.add).then(function (r) { B.sfx("good"); app.friends = null; b.outerHTML = r === "friends" ? '<span class="tagok">' + ic("check2") + "</span>" : '<span class="muted small">' + L("Sent", "Enviada") + "</span>"; }).catch(function (e) { b.disabled = false; fail(e); }); }; });
    }).catch(function (e) { el.innerHTML = '<div class="empty">' + esc(errText(e)) + "</div>"; });
  }
  function searchScreen() {
    var st = stage(L("Search", "Buscar"), '<div class="searchbar">' + ic("search") + '<input class="input" id="sQ" placeholder="' + L("Search people", "Buscar personas") + '" autocapitalize="off"></div><div id="sRes" style="margin-top:12px"></div>');
    var q = $("#sQ", st.body), t = null; setTimeout(function () { q.focus(); }, 200);
    q.oninput = function () { clearTimeout(t); t = setTimeout(function () { doSearch(q.value.replace(/^@/, ""), $("#sRes", st.body)); }, 300); };
  }
  function notifSheet() {
    S().seenAct = Date.now(); B.save(); paintBadges();
    var sh = B.sheet("<h2>" + L("Notifications", "Notificaciones") + '</h2><div id="nBody">' + spinner() + "</div>");
    Promise.all([A.requests(), A.notifications()]).then(function (r) {
      var rq = r[0] || [], act = (r[1] && r[1].activity) || [], h = "";
      if (rq.length) h += '<div class="eyebrow" style="margin:10px 0 6px">' + L("Friend requests", "Solicitudes de amistad") + "</div><div class=\"card\">" + rq.map(function (x) { return personRow({ id: x.user_id, display_name: x.display_name, color: x.color }, ago(x.created_at), '<button class="btn gold sm" data-acc="' + x.id + '">' + L("Accept", "Aceptar") + '</button><button class="iconbtn" data-dec="' + x.id + '">' + ic("close") + "</button>"); }).join("") + "</div>";
      h += '<div class="eyebrow" style="margin:16px 0 6px">' + L("Activity", "Actividad") + "</div>";
      h += act.length ? '<div class="card">' + act.map(function (a) {
        var e = a.type === "reaction" ? (REACT.filter(function (x) { return x[0] === a.detail; })[0] || [0, "🙏"])[1] : "💬";
        return '<div class="lrow"><div style="position:relative">' + av(a.name, a.color, 42, a.user_id) + '<span class="nemoji">' + e + '</span></div><div style="min-width:0"><b style="font-weight:600">' + esc(a.name) + "</b> <span>" + (a.type === "reaction" ? L("reacted to your post", "reaccionó a tu publicación") : L("commented: ", "comentó: ") + "“" + esc(a.detail) + "”") + '</span><span class="small">' + ago(a.at) + "</span></div></div>";
      }).join("") + "</div>" : '<div class="empty">' + L("Nothing new yet.", "Todavía no hay nada nuevo.") + "</div>";
      $("#nBody", sh).innerHTML = h;
      $$("[data-acc]", sh).forEach(function (b) { b.onclick = function () { A.respond(b.dataset.acc, true).then(function () { B.sfx("good"); app.friends = null; loadNotif(); b.closest(".lrow").remove(); }).catch(fail); }; });
      $$("[data-dec]", sh).forEach(function (b) { b.onclick = function () { A.respond(b.dataset.dec, false).then(function () { loadNotif(); b.closest(".lrow").remove(); }).catch(fail); }; });
    }).catch(function (e) { $("#nBody", sh).innerHTML = '<div class="empty">' + esc(errText(e)) + "</div>"; });
  }

  /* ---------------- messages ---------------- */
  function messagesTab(el) {
    el.innerHTML = pushBanner() + '<div class="frow" id="mFriends"></div><div id="mList">' + spinner() + "</div>";
    loadFriends(true).then(function (fr) {
      var f = $("#mFriends"); if (!f) return;
      f.innerHTML = fr.length ? fr.map(function (x) { return '<button class="story" data-act="chatwith" data-id="' + x.id + '" data-name="' + esc(x.display_name) + '" data-color="' + x.color + '">' + av(x.display_name, x.color, 54, x.id) + "<small>" + esc(x.display_name.split(" ")[0]) + "</small></button>"; }).join("") : "";
    });
    A.conversations().then(function (cs) {
      var m = $("#mList"); if (!m) return;
      if (!cs || !cs.length) { m.innerHTML = '<div class="empty card"><div class="bigicon sm">' + ic("chat") + "</div><h3>" + L("No messages yet", "Todavía no hay mensajes") + "</h3><p>" + L("Tap a friend above to start chatting. You can message your friends only.", "Toca a un amigo arriba para empezar a chatear. Solo puedes escribirle a tus amigos.") + "</p></div>"; return; }
      m.innerHTML = '<div class="card convs">' + cs.map(function (c) {
        return '<button class="conv ' + (c.unread ? "unread" : "") + '" data-act="chatwith" data-id="' + c.user_id + '" data-name="' + esc(c.display_name) + '" data-color="' + c.color + '">' + av(c.display_name, c.color, 52, c.user_id) +
          '<div class="cmain"><div class="row"><b>' + esc(c.display_name) + '</b><span class="spacer"></span><span class="ctime">' + ago(c.last_at) + "</span></div><div class=\"row\"><span class=\"clast\">" + (c.last_from_me ? L("You: ", "Tú: ") : "") + esc(c.last_body) + "</span>" + (c.unread ? '<span class="nbadge static">' + c.unread + "</span>" : "") + "</div></div></button>";
      }).join("") + "</div>";
    }).catch(function (e) { $("#mList").innerHTML = '<div class="empty">' + esc(errText(e)) + "</div>"; });
  }
  function openChat(u) {
    app.chatWith = u;
    var s = document.createElement("div"); s.className = "stage social chat";
    s.innerHTML = '<div class="sky"></div><div class="chathead"><button class="iconbtn" data-x="1">' + ic("back") + '</button><button class="chwho" data-act="profile" data-id="' + u.id + '">' + av(u.display_name, u.color, 40, u.id) + "<b>" + esc(u.display_name) + '</b></button><span class="spacer"></span><button class="iconbtn" id="chCall" aria-label="call">' + ic("call") + '</button><button class="iconbtn" id="chVideo" aria-label="video call">' + ic("video") + '</button><button class="iconbtn" id="chMore">' + ic("more") + '</button></div>' +
      '<div class="msgs" id="msgs">' + spinner() + '</div><form class="msgbar" id="msgForm"><input class="input" id="msgIn" maxlength="1000" autocomplete="off" placeholder="' + L("Message…", "Mensaje…") + '"><button class="sendbtn" aria-label="send">' + ic("send") + "</button></form>";
    document.body.appendChild(s);
    function close() { s.remove(); app.chatWith = null; loadNotif(); if (app.tab === "messages") render(true); }
    $("[data-x]", s).onclick = close;
    $("#chCall", s).onclick = function () { startCall(u, "audio"); };
    $("#chVideo", s).onclick = function () { startCall(u, "video"); };
    $("#chMore", s).onclick = function () { B.sheet('<div class="menu"><button class="mi" data-act="report" data-type="user" data-id="' + u.id + '">' + ic("flag") + L("Report", "Reportar") + '</button><button class="mi danger" data-act="block" data-id="' + u.id + '">' + ic("ban") + L("Block", "Bloquear") + '</button><button class="mi" data-act="closesheet">' + L("Cancel", "Cancelar") + "</button></div>"); };
    A.thread(u.id).then(function (ms) {
      var box = $("#msgs", s); box.innerHTML = (ms && ms.length) ? "" : '<div class="empty" id="chEmpty">' + L("Say hi! 👋", "¡Saluda! 👋") + "</div>";
      (ms || []).forEach(appendBubble); refreshCallLog(u.id); A.markRead(u.id).then(loadNotif).catch(function () {});
    }).catch(function (e) { $("#msgs", s).innerHTML = '<div class="empty">' + esc(errText(e)) + "</div>"; });
    var f = $("#msgForm", s), inp = $("#msgIn", s);
    f.onsubmit = function (e) {
      e.preventDefault(); var t = inp.value.trim(); if (!t) return; inp.value = "";
      var tmp = { id: "tmp" + Date.now(), sender: app.me.id, body: t, created_at: new Date().toISOString(), pending: true };
      appendBubble(tmp);
      A.sendMessage(u.id, t).then(function (m) { var el = $('[data-mid="' + tmp.id + '"]'); if (el) { el.dataset.mid = m.id; el.classList.remove("pending"); } })
        .catch(function (e) { var el = $('[data-mid="' + tmp.id + '"]'); if (el) el.classList.add("failed"); fail(e); });
    };
    setTimeout(function () { inp.focus(); }, 300);
  }
  function appendBubble(m) {
    var box = $("#msgs"); if (!box) return;
    var e = $("#chEmpty"); if (e) e.remove(); var sp = $(".spin", box); if (sp) sp.remove();
    var mine = m.sender === app.me.id, d = document.createElement("div");
    d.className = "bub " + (mine ? "me" : "them") + (m.pending ? " pending" : ""); d.dataset.mid = m.id; d.dataset.at = new Date(m.created_at).getTime();
    d.innerHTML = linkify(m.body) + '<time>' + new Date(m.created_at).toLocaleTimeString(S().lang === "es" ? "es" : "en", { hour: "numeric", minute: "2-digit" }) + "</time>";
    box.appendChild(d); box.scrollTop = box.scrollHeight;
  }

  /* ---------------- calls (voice & video, peer to peer, free) ---------------- */
  P.call = '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>';
  P.video = '<rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="m15.5 10.5 6-3.5v10l-6-3.5z"/>';
  P.videooff = '<rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="m15.5 10.5 6-3.5v10l-6-3.5zM2 3l20 18"/>';
  P.micoff = '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7M3 3l18 18"/>';
  P.flip = '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><path d="M9 13.5a3 3 0 0 1 5.2-2M15 13.5a3 3 0 0 1-5.2 2M14.5 9.5v2h-2M9.5 17.5v-2h2"/>';
  P.hangup = '<path d="M3 14.5c5-4.7 13-4.7 18 0l-2 3-3.5-1.3v-2.7a10 10 0 0 0-7 0v2.7L5 17.5z" fill="currentColor"/>';
  P.speaker = '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>';
  var ICE = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] }];
  var CALL = null;   // the call in progress (only one at a time)
  var ringer = null;

  // iPhone only lets a web page play sound after a tap, so we "unlock" the speaker on the first touch
  var RAC = null;
  function audioCtx() { if (!RAC) { try { RAC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (RAC && RAC.state !== "running") { try { RAC.resume(); } catch (e) {} } return RAC; }
  function unlockAudio() {
    var ac = audioCtx(); if (!ac) return;
    try { var b = ac.createBuffer(1, 1, 22050), src = ac.createBufferSource(); src.buffer = b; src.connect(ac.destination); src.start(0); } catch (e) {}
  }
  ["touchend", "pointerdown", "keydown"].forEach(function (ev) { document.addEventListener(ev, unlockAudio, { passive: true }); });
  function ringStart(outgoing) {
    ringStop();
    var ac = audioCtx(); if (!ac) return;
    var on = true, master = ac.createGain(); master.gain.value = 1; master.connect(ac.destination);
    function tone(f1, f2, at, dur, vol) {
      [f1, f2].forEach(function (f) {
        if (!f) return;
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + .02); g.gain.setValueAtTime(vol, at + dur - .05); g.gain.linearRampToValueAtTime(0, at + dur);
        o.connect(g); g.connect(master); o.start(at); o.stop(at + dur + .05);
      });
    }
    function burst() {
      if (!on) return;
      if (ac.state !== "running") { try { ac.resume(); } catch (e) {} }
      var t = ac.currentTime + .05;
      if (outgoing) tone(440, 480, t, 1.8, .07);                          // ring-back you hear while calling
      else {                                                              // the phone ringing: "ring-ring … ring-ring"
        [0, .45].forEach(function (d) { tone(784, 988, t + d, .38, .22); tone(1175, 0, t + d + .1, .25, .12); });
        [1.1, 1.55].forEach(function (d) { tone(784, 988, t + d, .38, .22); tone(1175, 0, t + d + .1, .25, .12); });
      }
      if (!outgoing && S().haptic && navigator.vibrate) navigator.vibrate([500, 250, 500, 250, 500]);
    }
    burst(); var iv = setInterval(burst, outgoing ? 4000 : 3000);
    ringer = function () { on = false; clearInterval(iv); try { master.disconnect(); } catch (e) {} if (navigator.vibrate) navigator.vibrate(0); };
  }
  function ringStop() { if (ringer) { ringer(); ringer = null; } }

  function callScreen(c) {
    var s = document.createElement("div"); s.className = "callscr " + c.kind + (c.incoming ? " inc" : ""); s.id = "callScr";
    var u = c.other;
    s.innerHTML = '<video id="cRemote" autoplay playsinline></video><audio id="cAudio" autoplay></audio>' +
      '<div class="cwho">' + av(u.display_name, u.color, 112, u.id) + "<h2>" + esc(u.display_name) + '</h2><p id="cState"></p></div>' +
      '<video id="cLocal" autoplay playsinline muted></video>' +
      '<div class="cbar" id="cBar"></div>';
    document.body.appendChild(s);
    clearCallNotifs();
    return s;
  }
  function clearCallNotifs() {
    try { if (navigator.serviceWorker) navigator.serviceWorker.ready.then(function (r) { return r.getNotifications(); }).then(function (ns) { (ns || []).forEach(function (n) { if (n.tag && n.tag.indexOf("call-") === 0) n.close(); }); }).catch(function () {}); } catch (e) {}
  }
  function paintBar() {
    var c = CALL; if (!c) return; var bar = $("#cBar"); if (!bar) return;
    if (c.incoming && c.state === "ringing") {
      bar.innerHTML = '<div class="cbtnw"><button class="cbtn red" id="cDecline">' + ic("hangup") + "</button><small>" + L("Decline", "Rechazar") + '</small></div>' +
        '<div class="cbtnw"><button class="cbtn green pulse" id="cAccept">' + ic(c.kind === "video" ? "video" : "call") + "</button><small>" + L("Accept", "Contestar") + "</small></div>";
      $("#cDecline").onclick = function () { A.callStatus(c.id, "declined").catch(function () {}); endCall(L("Declined", "Rechazada"), true); };
      $("#cAccept").onclick = acceptCall;
      return;
    }
    var vid = c.kind === "video";
    bar.innerHTML = '<div class="cbtnw"><button class="cbtn ' + (c.muted ? "on" : "") + '" id="cMute">' + ic(c.muted ? "micoff" : "mic") + "</button><small>" + (c.muted ? L("Unmute", "Activar") : L("Mute", "Silenciar")) + "</small></div>" +
      (vid ? '<div class="cbtnw"><button class="cbtn ' + (c.camOff ? "on" : "") + '" id="cCam">' + ic(c.camOff ? "videooff" : "video") + "</button><small>" + L("Camera", "Cámara") + '</small></div><div class="cbtnw"><button class="cbtn" id="cFlip">' + ic("flip") + "</button><small>" + L("Flip", "Girar") + "</small></div>" : "") +
      '<div class="cbtnw"><button class="cbtn red" id="cHang">' + ic("hangup") + "</button><small>" + L("End", "Colgar") + "</small></div>";
    $("#cMute").onclick = function () { c.muted = !c.muted; if (c.stream) c.stream.getAudioTracks().forEach(function (t) { t.enabled = !c.muted; }); paintBar(); };
    var cam = $("#cCam"); if (cam) cam.onclick = function () { c.camOff = !c.camOff; if (c.stream) c.stream.getVideoTracks().forEach(function (t) { t.enabled = !c.camOff; }); $("#cLocal").classList.toggle("off", c.camOff); paintBar(); };
    var fl = $("#cFlip"); if (fl) fl.onclick = flipCamera;
    $("#cHang").onclick = function () { hangUp(); };
  }
  function setState(txt) { var e = $("#cState"); if (e) e.textContent = txt; }
  function tick() {
    var c = CALL; if (!c || !c.startedAt) return;
    var sec = Math.floor((Date.now() - c.startedAt) / 1000);
    setState(Math.floor(sec / 60) + ":" + ("0" + sec % 60).slice(-2));
  }

  function getMedia(kind, facing) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error("nomedia"));
    return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: kind === "video" ? { facingMode: facing || "user", width: { ideal: 640 }, height: { ideal: 480 } } : false });
  }
  function mediaError(e) {
    var n = e && e.name;
    B.toast(L("Can't use the microphone/camera", "No se puede usar el micrófono/cámara"), n === "NotAllowedError" ? L("Allow access in your phone's settings for this site.", "Permite el acceso en los ajustes de tu teléfono para este sitio.") : "", "info");
  }

  function buildPeer() {
    var c = CALL;
    var pc = new RTCPeerConnection({ iceServers: ICE });
    c.pc = pc; c.pending = [];
    c.stream.getTracks().forEach(function (t) { pc.addTrack(t, c.stream); });
    pc.onicecandidate = function (e) { if (e.candidate) c.sig.send({ t: "ice", c: e.candidate.toJSON ? e.candidate.toJSON() : e.candidate, from: app.me.id }); };
    pc.ontrack = function (e) {
      var st = e.streams && e.streams[0] ? e.streams[0] : new MediaStream([e.track]);
      var el = c.kind === "video" ? $("#cRemote") : $("#cAudio");
      if (el && el.srcObject !== st) { el.srcObject = st; var p = el.play(); if (p && p.catch) p.catch(function () {}); }
    };
    pc.onconnectionstatechange = function () {
      var s = pc.connectionState;
      if (s === "connected") {
        clearTimeout(c.failT);
        if (!c.startedAt) { c.startedAt = Date.now(); c.tickT = setInterval(tick, 1000); tick(); B.sfx("good"); }
        $("#callScr") && $("#callScr").classList.add("live");
      } else if (s === "failed") {
        endCall(L("Couldn't connect. One of the networks may be blocking direct calls — try on Wi-Fi.", "No se pudo conectar. Una de las redes puede estar bloqueando llamadas directas — intenta con Wi-Fi."));
      } else if (s === "disconnected") {
        setState(L("Reconnecting…", "Reconectando…"));
      }
    };
    return pc;
  }
  function flushIce() { var c = CALL; if (!c || !c.pc || !c.pc.remoteDescription) return; c.pending.splice(0).forEach(function (x) { c.pc.addIceCandidate(x).catch(function () {}); }); }

  function onSignal(m) {
    var c = CALL; if (!c || !m || m.from === app.me.id) return;
    if (m.t === "ready" && !c.incoming && c.pc && !c.offered) {
      c.offered = true; ringStop(); setState(L("Connecting…", "Conectando…"));
      c.pc.createOffer().then(function (o) { return c.pc.setLocalDescription(o); }).then(function () { c.sig.send({ t: "offer", sdp: c.pc.localDescription.sdp, from: app.me.id }); }).catch(function (e) { console.warn(e); });
    } else if (m.t === "offer" && c.incoming && c.pc && !c.answered) {
      c.answered = true; clearInterval(c.readyT);
      c.pc.setRemoteDescription({ type: "offer", sdp: m.sdp }).then(function () { flushIce(); return c.pc.createAnswer(); })
        .then(function (a) { return c.pc.setLocalDescription(a); }).then(function () { c.sig.send({ t: "answer", sdp: c.pc.localDescription.sdp, from: app.me.id }); }).catch(function (e) { console.warn(e); });
    } else if (m.t === "answer" && !c.incoming && c.pc && !c.pc.remoteDescription) {
      c.pc.setRemoteDescription({ type: "answer", sdp: m.sdp }).then(flushIce).catch(function (e) { console.warn(e); });
    } else if (m.t === "ice") {
      if (c.pc && c.pc.remoteDescription) c.pc.addIceCandidate(m.c).catch(function () {}); else c.pending.push(m.c);
    } else if (m.t === "bye") {
      endCall(L("Call ended", "Llamada terminada"));
    }
  }

  function startCall(u, kind) {
    if (CALL) return;
    if (!window.RTCPeerConnection) { B.toast(L("Calls aren't supported on this browser", "Este navegador no permite llamadas"), "", "info"); return; }
    var c = CALL = { id: null, kind: kind, other: u, incoming: false, state: "ringing" };
    var scr = callScreen(c); setState(L("Calling…", "Llamando…")); paintBar();
    getMedia(kind).then(function (stream) {
      if (CALL !== c) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }
      c.stream = stream; if (kind === "video") $("#cLocal", scr).srcObject = stream;
      return A.startCall(u.id, kind).then(function (id) {
        if (CALL !== c) { A.callStatus(id, "ended").catch(function () {}); return; }
        c.id = id; buildPeer();
        c.sig = A.callChannel(id, onSignal, function () { c.sig.send({ t: "hello", from: app.me.id }); });
        A.notifyCall(id);
        ringStart(true); setState(L("Ringing…", "Sonando…"));
        c.noAnswerT = setTimeout(function () { if (CALL === c && !c.offered) { A.callStatus(id, "missed").catch(function () {}); endCall(L("No answer", "No contestó")); } }, 45000);
      });
    }).catch(function (e) {
      if (CALL !== c) return;
      if (e && e.name) mediaError(e); else fail(e);
      endCall("", true);
    });
  }

  function incomingCall(row) {
    if (!row || row.status !== "ringing" || row.callee !== app.me.id) return;
    if (CALL) { if (CALL.id !== row.id) A.callStatus(row.id, "declined").catch(function () {}); return; }
    if (Date.now() - new Date(row.created_at).getTime() > 60000) return;
    var finish = function (u) {
      if (CALL) return;
      var c = CALL = { id: row.id, kind: row.kind, other: u, incoming: true, state: "ringing" };
      callScreen(c); setState(row.kind === "video" ? L("Incoming video call", "Videollamada entrante") : L("Incoming call", "Llamada entrante")); paintBar();
      ringStart(false);
      if (!RAC || RAC.state !== "running") { var sc = $("#callScr"); if (sc) { sc.addEventListener("touchend", function once() { unlockAudio(); if (CALL === c && c.state === "ringing") ringStart(false); sc.removeEventListener("touchend", once); }); } }
      c.noAnswerT = setTimeout(function () { if (CALL === c && c.state === "ringing") endCall(L("Missed call", "Llamada perdida"), true); }, 50000);
    };
    var known = (app.friends || []).filter(function (f) { return f.id === row.caller; })[0];
    if (known) finish(known);
    else A.getProfile(row.caller).then(function (p) { finish(p || { id: row.caller, display_name: "…", color: 0 }); }).catch(function () { finish({ id: row.caller, display_name: "…", color: 0 }); });
  }

  function acceptCall() {
    var c = CALL; if (!c || c.state !== "ringing") return;
    c.state = "accepting"; ringStop(); clearTimeout(c.noAnswerT); $("#callScr").classList.remove("inc");
    setState(L("Connecting…", "Conectando…")); paintBar();
    getMedia(c.kind).then(function (stream) {
      if (CALL !== c) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }
      c.stream = stream; if (c.kind === "video") $("#cLocal").srcObject = stream;
      return A.callStatus(c.id, "answered").then(function () {
        buildPeer();
        // keep saying "ready" until the caller sends the offer
        var n = 0, say = function () { if (CALL === c && !c.answered && n++ < 10) c.sig.send({ t: "ready", from: app.me.id }); else clearInterval(c.readyT); };
        c.sig = A.callChannel(c.id, onSignal, function () { say(); c.readyT = setInterval(say, 1500); });
        c.failT = setTimeout(function () { if (CALL === c && !c.startedAt) endCall(L("Couldn't connect. Try again on Wi-Fi.", "No se pudo conectar. Intenta otra vez con Wi-Fi.")); }, 30000);
      });
    }).catch(function (e) {
      if (e && e.name) mediaError(e); else fail(e);
      A.callStatus(c.id, "declined").catch(function () {}); endCall("", true);
    });
  }

  function flipCamera() {
    var c = CALL; if (!c || !c.stream || c.kind !== "video") return;
    c.facing = c.facing === "environment" ? "user" : "environment";
    navigator.mediaDevices.getUserMedia({ video: { facingMode: c.facing, width: { ideal: 640 }, height: { ideal: 480 } } }).then(function (ns) {
      var nt = ns.getVideoTracks()[0], old = c.stream.getVideoTracks()[0];
      var sender = c.pc && c.pc.getSenders().filter(function (x) { return x.track && x.track.kind === "video"; })[0];
      if (sender) sender.replaceTrack(nt);
      if (old) { c.stream.removeTrack(old); old.stop(); }
      c.stream.addTrack(nt); nt.enabled = !c.camOff;
      var lv = $("#cLocal"); lv.srcObject = c.stream; lv.classList.toggle("back", c.facing === "environment");
    }).catch(mediaError);
  }

  function hangUp() {
    var c = CALL; if (!c) return;
    if (c.sig) c.sig.send({ t: "bye", from: app.me.id });
    if (c.id) A.callStatus(c.id, "ended").catch(function () {});
    endCall(L("Call ended", "Llamada terminada"), true);
  }

  function endCall(msg, quiet) {
    var c = CALL; if (!c) return; CALL = null;
    ringStop(); clearTimeout(c.noAnswerT); clearTimeout(c.failT); clearInterval(c.readyT); clearInterval(c.tickT);
    if (c.stream) c.stream.getTracks().forEach(function (t) { t.stop(); });
    if (c.pc) try { c.pc.close(); } catch (e) {}
    if (c.sig) setTimeout(function () { c.sig.close(); }, 600);
    var scr = $("#callScr");
    if (scr) {
      if (msg) { setState(msg); scr.classList.remove("live"); $("#cBar", scr).innerHTML = ""; setTimeout(function () { scr.remove(); }, 1600); }
      else scr.remove();
    }
    if (msg && !quiet) B.sfx("tap");
    if (app.chatWith && app.chatWith.id === c.other.id) setTimeout(function () { refreshCallLog(c.other.id); }, 900);
  }

  function onCallRow(row, ev) {
    if (!row) return;
    if (ev === "INSERT") return incomingCall(row);
    var c = CALL; if (!c || c.id !== row.id) return;
    if (!c.incoming && row.status === "declined") endCall(L("Not available", "No disponible"));
    else if (c.incoming && c.state === "ringing" && (row.status === "cancelled" || row.status === "missed" || row.status === "ended")) endCall(L("Missed call", "Llamada perdida"), true);
    else if (row.status === "ended" && c.startedAt) endCall(L("Call ended", "Llamada terminada"));
  }
  function openCallById(id) {
    if (!id || CALL) return;
    A.getCall(id).then(function (row) { if (row && row.status === "ringing") incomingCall(row); else if (row) B.toast(L("Missed call", "Llamada perdida"), "", "info"); }).catch(function () {});
  }
  function callsBoot() {
    if (app.callUnsub) app.callUnsub();
    app.callUnsub = A.onCalls(onCallRow);
    var q = new URLSearchParams(location.search).get("call");
    if (q) { history.replaceState(null, "", location.pathname); openCallById(q); }
    else A.ringing().then(function (rows) { if (rows && rows[0]) incomingCall(rows[0]); }).catch(function () {});
    if (navigator.serviceWorker && !app.swMsg) {
      app.swMsg = true;
      navigator.serviceWorker.addEventListener("message", function (e) { if (e.data && e.data.type === "call") openCallById(e.data.id); });
    }
    pushRefresh();
  }

  /* call log inside the chat */
  function callLine(cl) {
    var mine = cl.caller === app.me.id, vid = cl.kind === "video", txt;
    var dur = cl.answered_at && cl.ended_at ? Math.max(0, Math.round((new Date(cl.ended_at) - new Date(cl.answered_at)) / 1000)) : 0;
    if (cl.status === "ended" || cl.status === "answered") txt = (vid ? L("Video call", "Videollamada") : L("Call", "Llamada")) + (dur ? " · " + Math.floor(dur / 60) + ":" + ("0" + dur % 60).slice(-2) : "");
    else if (cl.status === "declined") txt = mine ? L("Not answered", "No contestada") : L("You declined", "Rechazaste");
    else if (cl.status === "ringing") txt = vid ? L("Video call", "Videollamada") : L("Call", "Llamada");
    else txt = mine ? L("No answer", "Sin respuesta") : L("Missed call", "Llamada perdida");
    var missed = !mine && (cl.status === "missed" || cl.status === "cancelled");
    return '<div class="callog ' + (missed ? "missed" : "") + '" data-cid="' + cl.id + '"><span>' + ic(vid ? "video" : "call") + "</span>" + esc(txt) + "<time>" + new Date(cl.created_at).toLocaleTimeString(S().lang === "es" ? "es" : "en", { hour: "numeric", minute: "2-digit" }) + "</time></div>";
  }
  function refreshCallLog(uid) {
    A.callHistory(uid).then(function (cls) {
      var box = $("#msgs"); if (!box || !app.chatWith || app.chatWith.id !== uid) return;
      (cls || []).forEach(function (cl) {
        var ex = $('[data-cid="' + cl.id + '"]', box), html = callLine(cl);
        if (ex) { ex.outerHTML = html; return; }
        var t = new Date(cl.created_at).getTime(), kids = $$("[data-at]", box), after = null;
        kids.forEach(function (k) { if (+k.dataset.at > t && !after) after = k; });
        var d = document.createElement("div"); d.innerHTML = html; var n = d.firstChild; n.dataset.at = t;
        var e = $("#chEmpty", box); if (e) e.remove();
        if (after) box.insertBefore(n, after); else box.appendChild(n);
      });
      box.scrollTop = box.scrollHeight;
    }).catch(function () {});
  }

  /* phone notifications for calls (Web Push) */
  function pushSupported() { return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && location.protocol === "https:"; }
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
  function standalone() { return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; }
  function b64u(s) { var p = "=".repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function pushRefresh() {
    if (!pushSupported() || Notification.permission !== "granted") return;
    navigator.serviceWorker.ready.then(function (r) { return r.pushManager.getSubscription(); }).then(function (sub) { if (sub) A.savePush(sub, S().lang || "es").catch(function () {}); }).catch(function () {});
  }
  function enablePush() {
    if (!pushSupported()) {
      B.sheet("<h2>" + L("Call notifications", "Avisos de llamadas") + '</h2><p class="muted">' + (isIOS() && !standalone()
        ? L("On iPhone: tap Share ⬆️ in Safari → “Add to Home Screen”, open Bible Challenge from that icon, then turn this on again.", "En iPhone: toca Compartir ⬆️ en Safari → “Agregar a pantalla de inicio”, abre Bible Challenge desde ese ícono y vuelve a activar esto.")
        : L("This browser can't receive notifications. You'll still get calls while the app is open.", "Este navegador no puede recibir avisos. Igual recibirás llamadas mientras la app esté abierta.")) + '</p><button class="btn gold block" data-act="closesheet">OK</button>');
      return Promise.resolve(false);
    }
    return Notification.requestPermission().then(function (p) {
      if (p !== "granted") { B.toast(L("Notifications are off", "Los avisos están apagados"), L("Turn them on in your phone's settings.", "Actívalos en los ajustes de tu teléfono."), "info"); return false; }
      return navigator.serviceWorker.register("sw.js").then(function () { return navigator.serviceWorker.ready; }).then(function (r) {
        return r.pushManager.getSubscription().then(function (s) { return s || r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(A.vapid) }); });
      }).then(function (sub) { return A.savePush(sub, S().lang || "es"); }).then(function () {
        S().pushOn = true; B.save(); B.sfx("good"); B.toast(L("Call notifications on", "Avisos de llamadas activados"), L("Your phone will ring even when the app is closed.", "Tu teléfono sonará aunque la app esté cerrada."), "bell"); return true;
      });
    }).catch(function (e) { fail(e); return false; });
  }
  function disablePush() {
    S().pushOn = false; B.save();
    if (!pushSupported()) return Promise.resolve();
    return navigator.serviceWorker.ready.then(function (r) { return r.pushManager.getSubscription(); }).then(function (sub) {
      if (!sub) return; var ep = sub.endpoint; return sub.unsubscribe().then(function () { return A.deletePush(ep); });
    }).catch(function () {});
  }
  function pushIsOn() { return pushSupported() && Notification.permission === "granted" && S().pushOn !== false && !!S().pushOn; }
  function pushBanner() {
    if (pushIsOn() || S().pushDismissed) return "";
    return '<div class="card pushban"><div class="ic">' + ic("bell") + "</div><div><b>" + L("Get calls when the app is closed", "Recibe llamadas con la app cerrada") + "</b><span>" + L("Turn on call notifications.", "Activa los avisos de llamadas.") + '</span></div><button class="btn gold sm" data-act="pushon">' + L("Turn on", "Activar") + '</button><button class="iconbtn sm" data-act="pushx" aria-label="close">' + ic("close") + "</button></div>";
  }

  /* ---------------- game room ---------------- */
  function gamesTab(el) {
    var r = B.dayRec(), n = (r.read ? 1 : 0) + (r.trivia ? 1 : 0) + (r.verse ? 1 : 0), lv = B.level(S().xp), a = B.xpFor(lv), b = B.xpFor(lv + 1);
    el.innerHTML = '<div class="gstat card"><div class="ringmini" style="--p:' + Math.round((S().xp - a) / (b - a) * 100) + '"><b>' + lv + "</b></div><div style=\"flex:1;min-width:0\"><div class=\"eyebrow\">" + L("Level ", "Nivel ") + lv + '</div><b style="font-size:18px">' + B.title(lv) + '</b><div class="muted small">' + (b - S().xp) + " XP " + L("to next level", "para subir") + '</div></div><div class="flame">' + ic("flame") + B.streakNow() + "</div></div>" +
      '<div class="section"><h2>' + L("Daily challenge", "Reto diario") + '</h2><span class="more">' + n + "/3 · +50 XP</span></div>" +
      '<div class="dchips">' + [["read", "book", L("Read verse", "Leer versículo"), "bible"], ["trivia", "bulb", L("Trivia", "Trivia"), "g-trivia"], ["verse", "feather", L("Verse", "Versículo"), "g-verse"]].map(function (x) { return '<button class="dchip ' + (r[x[0]] ? "ok" : "") + '" data-act="' + x[3] + '">' + ic(r[x[0]] ? "check" : x[1]) + "<span>" + x[2] + "</span></button>"; }).join("") + "</div>" +
      '<div class="section"><h2>' + L("Games", "Juegos") + "</h2></div>" +
      '<div class="games">' +
      '<button class="gtile g-family wide" data-act="g-family"><span class="tag">' + L("Family", "Familia") + "</span>" + B.ART.family + "<b>" + L("Family Mode", "Modo Familia") + "</b><span>" + L("2–8 players on one phone", "De 2 a 8 jugadores en un teléfono") + "</span></button>" +
      '<button class="gtile g-trivia" data-act="g-trivia">' + B.ART.trivia + "<b>" + L("Coffee & Trivia", "Café y Trivia") + "</b><span>" + L("Beat the clock", "Gánale al reloj") + "</span></button>" +
      '<button class="gtile g-verse" data-act="g-verse">' + B.ART.verse + "<b>" + L("Complete the Verse", "Completa el Versículo") + "</b><span>" + L("Fill in the words", "Llena las palabras") + "</span></button>" +
      '<button class="gtile g-books" data-act="g-books">' + B.ART.books + "<b>" + L("Books in Order", "Libros en Orden") + "</b><span>" + L("Know your Bible", "Conoce tu Biblia") + "</span></button>" +
      '<button class="gtile g-sermon" data-act="g-sermon">' + B.ART.sermon + "<b>" + L("Sermon vs Sermon", "Sermón vs Sermón") + "</b><span>" + L("Preach and compete", "Predica y compite") + "</span></button></div>" +
      '<div class="section"><h2>' + L("Leaderboard", "Clasificación") + '</h2></div><div class="card"><div class="row" style="gap:8px;margin-bottom:10px"><div class="seg sm" id="lbGame" style="flex:1">' +
      [["trivia", "Trivia"], ["verse", L("Verse", "Versículo")], ["books", L("Books", "Libros")]].map(function (g) { return '<button data-g="' + g[0] + '" class="' + (app.lb.game === g[0] ? "on" : "") + '">' + g[1] + "</button>"; }).join("") +
      '</div></div><div class="seg sm" id="lbScope" style="margin-bottom:6px"><button data-s="friends" class="' + (app.lb.scope === "friends" ? "on" : "") + '">' + L("Friends", "Amigos") + '</button><button data-s="all" class="' + (app.lb.scope === "all" ? "on" : "") + '">' + L("Everyone", "Todos") + '</button></div><div id="lb">' + spinner() + "</div></div>";
    $$("#lbGame button", el).forEach(function (x) { x.onclick = function () { app.lb.game = x.dataset.g; render(true); }; });
    $$("#lbScope button", el).forEach(function (x) { x.onclick = function () { app.lb.scope = x.dataset.s; render(true); }; });
    A.leaderboard(app.lb.game, app.lb.scope).then(function (rows) {
      var e = $("#lb"); if (!e) return;
      e.innerHTML = rows && rows.length ? rows.slice(0, 20).map(function (u, i) { return '<div class="lrow lb ' + (u.user_id === app.me.id ? "meRow" : "") + '"><b class="rank r' + (i + 1) + '">' + (i + 1) + "</b>" + av(u.display_name, u.color, 36, u.user_id) + '<button data-act="profile" data-id="' + u.user_id + '" style="flex:1;text-align:left"><b>' + esc(u.display_name) + '</b></button><span class="end" style="color:var(--ink);font-weight:800">' + u.best.toLocaleString() + "</span></div>"; }).join("")
        : '<div class="empty">' + L("No scores yet. Play a round and be the first!", "Todavía no hay puntajes. ¡Juega una ronda y sé el primero!") + "</div>";
    }).catch(function (e) { $("#lb").innerHTML = '<div class="empty">' + esc(errText(e)) + "</div>"; });
  }

  /* ---------------- reels ---------------- */
  var R = { items: [], end: false, loading: false, muted: true, obs: null };
  function reelsTab(el) {
    var v = $("#view");
    el.innerHTML = '<div class="reelsbar"><h1>Reels</h1><span class="spacer"></span><button class="iconbtn glass" data-act="mute" aria-label="sound">' + ic(R.muted ? "mute" : "volume") + '</button><button class="iconbtn glass" data-act="upreel" aria-label="upload">' + ic("plus") + '</button></div><div class="reels" id="reels"></div>';
    R.items = []; R.end = false; R.loading = false;
    if (R.obs) R.obs.disconnect();
    R.obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var vid = $("video", e.target); if (!vid) return;
        if (e.isIntersecting && e.intersectionRatio > .6) { vid.muted = R.muted; var p = vid.play(); if (p && p.catch) p.catch(function () { vid.muted = true; R.muted = true; paintMute(); vid.play().catch(function () {}); }); e.target.classList.remove("paused");
          var i = +e.target.dataset.i; if (i >= R.items.length - 2) moreReels(); }
        else { vid.pause(); }
      });
    }, { root: v, threshold: [0, .6, 1] });
    $("#reels").innerHTML = '<div class="reel loading">' + spinner() + "</div>";
    moreReels(true);
  }
  function paintMute() { $$('[data-act="mute"]').forEach(function (b) { b.innerHTML = ic(R.muted ? "mute" : "volume"); }); }
  function moreReels(first) {
    if (R.loading || (R.end && !first)) return; R.loading = true;
    var before = R.items.length ? R.items[R.items.length - 1].created_at : null;
    A.reels(before).then(function (rows) {
      var box = $("#reels"); if (!box) return;
      if (first) box.innerHTML = "";
      rows = rows || []; R.end = rows.length < 8;
      rows.forEach(function (r) { var i = R.items.length; R.items.push(r); var d = document.createElement("div"); d.innerHTML = reelHTML(r, i); var n = d.firstChild; box.appendChild(n); R.obs.observe(n); });
      if (!R.items.length) box.innerHTML = '<div class="reel empty-reel"><div><div class="bigicon">' + ic("film") + "</div><h3>" + L("No reels yet", "Todavía no hay reels") + "</h3><p>" + L("Share a short video: a testimony, worship, a word of encouragement.", "Comparte un video corto: un testimonio, alabanza, una palabra de ánimo.") + '</p><button class="btn gold" data-act="upreel">' + ic("plus") + L("Upload a reel", "Subir un reel") + "</button></div></div>";
    }).catch(function (e) { var box = $("#reels"); if (box && first) box.innerHTML = '<div class="reel empty-reel"><div class="empty">' + esc(errText(e)) + "</div></div>"; })
      .then(function () { R.loading = false; });
  }
  function reelHTML(r, i) {
    var mine = r.author === app.me.id;
    return '<section class="reel" data-i="' + i + '" data-id="' + r.id + '"><video src="' + esc(r.video_url) + '" ' + (r.thumb_url ? 'poster="' + esc(r.thumb_url) + '" ' : "") + 'playsinline webkit-playsinline loop muted preload="metadata"></video>' +
      '<div class="rshade"></div><div class="rplay">' + ic("playbtn") + "</div>" +
      '<div class="rrail"><button class="rav" data-act="profile" data-id="' + r.author + '">' + av(r.display_name, r.color, 46, r.author) + "</button>" +
      '<button class="rbtn ' + (r.liked ? "on" : "") + '" data-act="rlike" data-id="' + r.id + '"><span class="rh">' + ic("heart").replace('fill="none"', r.liked ? 'fill="currentColor"' : 'fill="none"') + "</span><b>" + (r.likes || "") + "</b></button>" +
      '<button class="rbtn" data-act="rcomments" data-id="' + r.id + '">' + ic("comment") + "<b>" + (r.comments || "") + "</b></button>" +
      '<button class="rbtn" data-act="rmenu" data-id="' + r.id + '" data-author="' + r.author + '" data-mine="' + (mine ? 1 : 0) + '">' + ic("more") + "</button></div>" +
      '<div class="rinfo"><button data-act="profile" data-id="' + r.author + '"><b>' + esc(r.display_name) + "</b>" + roleBadge(r.role, r.author) + "</button>" +
      (r.caption ? '<p>' + linkify(r.caption) + "</p>" : "") + '<span>' + (r.visibility === "public" ? ic("globe") : ic("users")) + ago(r.created_at) + "</span></div></section>";
  }
  function reelById(id) { return R.items.filter(function (r) { return r.id === id; })[0]; }
  function likeReel(id) {
    var r = reelById(id); if (!r) return;
    r.liked = !r.liked; r.likes += r.liked ? 1 : -1; paintReelRail(r); B.sfx(r.liked ? "good" : "tap");
    if (r.liked) heartBurst(id);
    A.likeReel(id, r.liked).catch(function (e) { r.liked = !r.liked; r.likes += r.liked ? 1 : -1; paintReelRail(r); fail(e); });
  }
  function paintReelRail(r) {
    var el = $('.reel[data-id="' + r.id + '"]'); if (!el) return;
    var b = $('[data-act="rlike"]', el); b.classList.toggle("on", r.liked);
    b.innerHTML = '<span class="rh">' + ic("heart").replace('fill="none"', r.liked ? 'fill="currentColor"' : 'fill="none"') + "</span><b>" + (r.likes || "") + "</b>";
    $('[data-act="rcomments"] b', el).textContent = r.comments || "";
  }
  function heartBurst(id) { var el = $('.reel[data-id="' + id + '"]'); if (!el) return; var h = document.createElement("div"); h.className = "burst"; h.textContent = "❤️"; el.appendChild(h); setTimeout(function () { h.remove(); }, 900); }
  function reelComments(id) {
    var r = reelById(id);
    var sh = B.sheet("<h2>" + L("Comments", "Comentarios") + '</h2><div id="rcList">' + spinner() + '</div><form class="cform" id="rcForm">' + av(app.me.display_name, app.me.color, 32, app.me.id) + '<input class="input" maxlength="500" placeholder="' + L("Add a comment…", "Agrega un comentario…") + '"><button class="iconbtn send">' + ic("send") + "</button></form>");
    function load() {
      A.reelComments(id).then(function (cs) {
        var l = $("#rcList", sh); if (!l) return;
        l.innerHTML = (cs || []).length ? cs.map(function (c) {
          return '<div class="cmt"><button data-act="profile" data-id="' + c.author + '">' + av(c.display_name, c.color, 32, c.author) + '</button><div class="cbub"><b>' + esc(c.display_name) + "</b><p>" + linkify(c.body) + "</p><span>" + ago(c.created_at) +
            (c.author === app.me.id || (r && r.author === app.me.id) || isMod() ? ' · <button class="link sm" data-delrc="' + c.id + '">' + L("Delete", "Borrar") + "</button>" : ' · <button class="link sm" data-act="report" data-type="reel_comment" data-id="' + c.id + '">' + L("Report", "Reportar") + "</button>") + "</span></div></div>";
        }).join("") : '<div class="empty small">' + L("Be the first to comment.", "Sé el primero en comentar.") + "</div>";
        $$("[data-delrc]", l).forEach(function (b) { b.onclick = function () { A.deleteReelComment(b.dataset.delrc).then(function () { if (r) { r.comments = Math.max(0, r.comments - 1); paintReelRail(r); } load(); }).catch(fail); }; });
      }).catch(function (e) { $("#rcList", sh).innerHTML = '<div class="empty">' + esc(errText(e)) + "</div>"; });
    }
    load();
    $("#rcForm", sh).onsubmit = function (e) {
      e.preventDefault(); var inp = $("input", this), t = inp.value.trim(); if (!t) return; inp.value = "";
      A.addReelComment(id, t).then(function () { if (r) { r.comments++; paintReelRail(r); } B.sfx("good"); load(); }).catch(fail);
    };
  }
  function reelMenu(id, author, mine) {
    B.sheet('<div class="menu">' + (mine || isMod() ? '<button class="mi danger" data-act="delreel" data-id="' + id + '">' + ic("trash") + L("Delete reel", "Borrar reel") + "</button>" : "") +
      (!mine ? '<button class="mi" data-act="report" data-type="reel" data-id="' + id + '">' + ic("flag") + L("Report reel", "Reportar reel") + '</button><button class="mi danger" data-act="block" data-id="' + author + '">' + ic("ban") + L("Block this person", "Bloquear a esta persona") + "</button>" : "") +
      '<button class="mi" data-act="closesheet">' + L("Cancel", "Cancelar") + "</button></div>");
  }

  // read a picked video: duration, size and a cover picture
  function probeVideo(file) {
    return new Promise(function (res, rej) {
      var v = document.createElement("video"), url = URL.createObjectURL(file); v.preload = "metadata"; v.muted = true; v.playsInline = true; v.src = url;
      var done = false; setTimeout(function () { if (!done) rej(new Error("probe")); }, 15000);
      v.onloadedmetadata = function () {
        var t = Math.min(0.5, (v.duration || 1) / 2); v.currentTime = t;
      };
      v.onseeked = function () {
        done = true;
        var w = v.videoWidth, h = v.videoHeight, s = Math.min(1, 540 / Math.max(w, h)), c = document.createElement("canvas"); c.width = Math.round(w * s); c.height = Math.round(h * s);
        try { c.getContext("2d").drawImage(v, 0, 0, c.width, c.height); } catch (e) {}
        c.toBlob(function (b) { res({ duration: v.duration, width: w, height: h, thumb: b, url: url }); }, "image/jpeg", .78);
      };
      v.onerror = function () { done = true; rej(new Error("probe")); };
    });
  }
  // shrink a big video by replaying it into a smaller canvas and recording it (takes as long as the video)
  function shrinkVideo(file, info, onProgress) {
    return new Promise(function (res, rej) {
      var MR = window.MediaRecorder, c0 = document.createElement("canvas");
      if (!MR || !c0.captureStream) { rej(new Error("no_shrink")); return; }
      var types = ["video/mp4;codecs=avc1,mp4a", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"], type = types.filter(function (t) { return MR.isTypeSupported && MR.isTypeSupported(t); })[0];
      if (!type) { rej(new Error("no_shrink")); return; }
      var s = Math.min(1, 720 / Math.min(info.width, info.height)), W = Math.round(info.width * s / 2) * 2, H = Math.round(info.height * s / 2) * 2;
      var v = document.createElement("video"); v.src = info.url; v.playsInline = true; v.muted = false; v.volume = 0.0001;
      c0.width = W; c0.height = H; var x = c0.getContext("2d"), stream = c0.captureStream(30);
      try { var ac = new (window.AudioContext || window.webkitAudioContext)(), src = ac.createMediaElementSource(v), dst = ac.createMediaStreamDestination(); src.connect(dst); dst.stream.getAudioTracks().forEach(function (t) { stream.addTrack(t); }); } catch (e) {}
      var chunks = [], rec = new MR(stream, { mimeType: type, videoBitsPerSecond: 2200000, audioBitsPerSecond: 96000 });
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = function () { var b = new Blob(chunks, { type: type.split(";")[0] }); try { ac && ac.close(); } catch (e) {} res(b); };
      var raf; function draw() { x.drawImage(v, 0, 0, W, H); onProgress(v.currentTime / info.duration); if (!v.ended) raf = requestAnimationFrame(draw); }
      v.onended = function () { cancelAnimationFrame(raf); setTimeout(function () { rec.stop(); }, 150); };
      v.onplay = function () { if (rec.state === "inactive") rec.start(500); draw(); };
      v.play().catch(function () { rej(new Error("no_shrink")); });
    });
  }
  function uploadReelSheet() {
    var minor = app.me.is_minor, st = { file: null, info: null, vis: "friends" };
    var sh = B.sheet("<h2>" + L("New reel", "Nuevo reel") + '</h2><p class="muted small">' + L("Up to 60 seconds. Keep it uplifting! 🙌", "Hasta 60 segundos. ¡Que edifique! 🙌") + '</p>' +
      '<label class="pickvid" id="rvPick"><input type="file" accept="video/*" id="rvFile" hidden><div class="pv-empty">' + ic("film") + "<b>" + L("Choose or record a video", "Elige o graba un video") + '</b></div><video id="rvPrev" playsinline muted loop class="hidden"></video></label>' +
      '<p class="ferr" id="rvErr"></p><label class="field"><span>' + L("Caption", "Descripción") + '</span><textarea class="input" id="rvCap" maxlength="300" placeholder="' + L("Say something about your video…", "Escribe algo sobre tu video…") + '"></textarea></label>' +
      '<div class="seg" id="rvVis" style="margin-bottom:14px"><button data-v="friends">' + ic("users") + L("Friends", "Amigos") + '</button><button data-v="public" ' + (minor ? "disabled" : "") + ">" + ic("globe") + L("Everyone", "Todos") + "</button></div>" +
      '<div class="upprog hidden" id="rvProg"><div class="prog"><i style="width:0%"></i></div><span></span></div><button class="btn gold block" id="rvGo" disabled>' + L("Post reel", "Publicar reel") + "</button>");
    function paintVis() { $$("#rvVis button", sh).forEach(function (b) { b.classList.toggle("on", b.dataset.v === st.vis); }); }
    paintVis(); $$("#rvVis button", sh).forEach(function (b) { b.onclick = function (e) { e.preventDefault(); if (!b.disabled) { st.vis = b.dataset.v; paintVis(); } }; });
    var err = $("#rvErr", sh), goBtn = $("#rvGo", sh), prog = $("#rvProg", sh);
    function progress(f, label) { prog.classList.remove("hidden"); $("i", prog).style.width = Math.round(f * 100) + "%"; $("span", prog).textContent = label; }
    $("#rvFile", sh).onchange = function () {
      var f = this.files && this.files[0]; err.textContent = ""; goBtn.disabled = true; if (!f) return;
      if (!/^video\//.test(f.type) && !/\.(mp4|mov|webm|m4v)$/i.test(f.name)) { err.textContent = L("That file isn't a video.", "Ese archivo no es un video."); return; }
      probeVideo(f).then(function (info) {
        if (info.duration > 61) { err.textContent = L("The video is longer than 60 seconds. Trim it and try again.", "El video dura más de 60 segundos. Recórtalo e intenta otra vez."); return; }
        st.file = f; st.info = info;
        var pv = $("#rvPrev", sh); pv.src = info.url; pv.classList.remove("hidden"); $(".pv-empty", sh).classList.add("hidden"); pv.play().catch(function () {});
        goBtn.disabled = false;
      }).catch(function () { err.textContent = L("We couldn't read that video. Try another one.", "No pudimos leer ese video. Prueba con otro."); });
    };
    goBtn.onclick = function () {
      if (!st.file) return; goBtn.disabled = true; err.textContent = "";
      var big = st.file.size > 20 * 1048576 || Math.min(st.info.width, st.info.height) > 1080;
      var p = big ? shrinkVideo(st.file, st.info, function (f) { progress(f * .7, L("Preparing video… ", "Preparando video… ") + Math.round(f * 100) + "%"); }).catch(function (e) {
        if (st.file.size <= 50 * 1048576) return st.file; throw e; }) : Promise.resolve(st.file);
      p.then(function (blob) {
        if (blob.size > 50 * 1048576) throw new Error("too_big");
        progress(.8, L("Uploading…", "Subiendo…"));
        return A.uploadReel(blob, st.info.thumb, { caption: $("#rvCap", sh).value.trim(), visibility: st.vis, duration: Math.round(st.info.duration * 10) / 10 });
      }).then(function () {
        progress(1, ""); B.closeSheet(); B.sfx("level"); B.addXP(10); B.toast(L("Reel posted!", "¡Reel publicado!"), "", "film"); go("reels");
      }).catch(function (e) {
        goBtn.disabled = false; prog.classList.add("hidden");
        err.textContent = /too_big|no_shrink|exceeded|maximum allowed size|Payload too large/i.test(e.message || "") ? L("The video is too big. Record it in lower quality (720p) or make it shorter.", "El video es muy pesado. Grábalo en menor calidad (720p) o hazlo más corto.") : errText(e);
      });
    };
  }

  /* ---------------- daily bible ---------------- */
  function bibleScreen() {
    var v = B.verse(B.votdIndex()), r = B.dayRec(), s = S();
    var plan = D.PLANS.filter(function (p) { return p.id === s.plan.id; })[0] || D.PLANS[0], done = s.plan.done.length, next = Math.min(done + 1, plan.days);
    var st = stage(L("Daily Bible", "Biblia Diaria"));
    function paint() {
      r = B.dayRec(); done = s.plan.done.length; next = Math.min(done + 1, plan.days);
      var fav = s.favs.indexOf(v.i) >= 0;
      var h = '<section class="card hero"><div class="eyebrow">' + new Date().toLocaleDateString(s.lang === "es" ? "es" : "en", { weekday: "long", month: "long", day: "numeric" }) + '</div><p class="verse lg">' + esc(v.text) + '</p><div class="ref">' + esc(v.refT) + "<small>" + v.ver + "</small></div>" +
        '<div class="hair"></div><div class="eyebrow" style="margin-bottom:6px">' + L("Reflection", "Reflexión") + '</div><p class="reflect" style="margin-top:0">' + esc(v.note) + "</p>" +
        '<label class="field" style="margin-top:16px;margin-bottom:12px"><span>' + L("My prayer or note for today", "Mi oración o nota de hoy") + '</span><textarea class="input" id="bNote" placeholder="' + L("Write what God is showing you…", "Escribe lo que Dios te está mostrando…") + '">' + esc(s.notes[B.today()] || "") + "</textarea></label>" +
        '<div class="row">' + (r.read ? '<button class="btn sm done">' + ic("check") + L("Amen · Read", "Amén · Leído") + "</button>" : '<button class="btn gold sm" id="bRead">' + ic("check") + L("Amen, I read it", "Amén, lo leí") + "</button>") +
        '<span class="spacer"></span><button class="iconbtn" id="bFav" style="' + (fav ? "color:var(--bad)" : "") + '">' + ic("heart").replace('fill="none"', fav ? 'fill="currentColor"' : 'fill="none"') + '</button><button class="iconbtn" id="bShare">' + ic("share") + '</button><button class="iconbtn" id="bPost" title="post">' + ic("send") + "</button></div></section>" +
        '<div class="section"><h2>' + L("Reading plan", "Plan de lectura") + '</h2></div><div class="card"><div class="chips" style="margin-bottom:12px">' + D.PLANS.map(function (p) { return '<button class="chipbtn ' + (p.id === plan.id ? "on" : "") + '" data-plan="' + p.id + '">' + L(p.en, p.es) + "</button>"; }).join("") + "</div>" +
        '<div class="dailybar"><div class="prog"><i style="width:' + (done / plan.days * 100) + '%"></i></div><b class="small">' + done + "/" + plan.days + '</b></div><div class="days">';
      for (var d = 1; d <= plan.days; d++) h += '<button class="day ' + (s.plan.done.indexOf(d) >= 0 ? "done" : d === next ? "next" : "") + '" data-d="' + d + '">' + d + "</button>";
      h += '</div><div class="hair"></div><div class="row"><div><div class="eyebrow">' + L("Next", "Siguiente") + '</div><b style="font-family:var(--serif);font-size:19px">' + B.bookName(plan.book) + " " + next + '</b></div><span class="spacer"></span><a class="btn ghost sm" target="_blank" rel="noopener" href="https://www.biblegateway.com/passage/?search=' + encodeURIComponent(B.bookName(plan.book) + " " + next) + "&version=" + (s.lang === "es" ? "RVR1960" : "KJV") + '">' + L("Read", "Leer") + ic("external") + "</a></div></div>";
      st.body.innerHTML = h;
      $("#bNote", st.body).oninput = function () { s.notes[B.today()] = this.value; B.save(); };
      var rd = $("#bRead", st.body); if (rd) rd.onclick = function () { if (B.task("read")) { B.sfx("good"); B.toast(L("Amen!", "¡Amén!"), "+20 XP", "book"); } paint(); };
      $("#bFav", st.body).onclick = function () { var i = s.favs.indexOf(v.i); if (i >= 0) s.favs.splice(i, 1); else { s.favs.push(v.i); if (s.favs.length >= 5) B.unlock("favs"); } B.save(); paint(); };
      $("#bShare", st.body).onclick = function () { B.shareVerse(v.i); };
      $("#bPost", st.body).onclick = function () { compose("friends", "verse"); };
      $$("[data-plan]", st.body).forEach(function (x) { x.onclick = function () { if (s.plan.id !== x.dataset.plan) { s.plan = { id: x.dataset.plan, done: [] }; plan = D.PLANS.filter(function (p) { return p.id === s.plan.id; })[0]; B.save(); } paint(); }; });
      $$("[data-d]", st.body).forEach(function (x) { x.onclick = function () { var d = +x.dataset.d, q = s.plan.done.indexOf(d); if (q >= 0) s.plan.done.splice(q, 1); else { s.plan.done.push(d); B.sfx("good"); B.addXP(10); } B.save(); paint(); }; });
    }
    paint();
    st.el.onclose = function () { if (app.tab === "home" || app.tab === "games") render(true); };
  }

  /* ---------------- calendar ---------------- */
  var KIND_EV = { plan: ["pin", "Plan", "Plan"], alarm: ["alarm", "Alarm", "Alarma"], note: ["note", "Note", "Nota"] };
  function calendarTab(el) {
    var now = new Date(); if (!app.calMonth) app.calMonth = new Date(now.getFullYear(), now.getMonth(), 1); if (!app.calSel) app.calSel = B.today();
    el.innerHTML = '<div class="card cal"><div class="row calhead"><button class="iconbtn" data-act="calprev">' + ic("back") + '</button><b id="calTitle"></b><button class="iconbtn" data-act="calnext" style="transform:scaleX(-1)">' + ic("back") + '</button></div><div class="calgrid" id="calGrid"></div></div>' +
      '<div class="row" style="margin:18px 2px 10px"><h2 class="daytitle" id="dayTitle"></h2><span class="spacer"></span><button class="btn gold sm" data-act="addev">' + ic("plus") + L("Add", "Agregar") + "</button></div><div id=\"dayList\">" + spinner() + "</div>" +
      '<div class="section"><h2>' + L("My notes", "Mis notas") + '</h2></div><div id="noteList"></div>';
    (app.events ? Promise.resolve(app.events) : A.events().then(function (e) { app.events = e || []; return app.events; })).then(paintCal).catch(function (e) { $("#dayList").innerHTML = '<div class="empty">' + esc(errText(e)) + "</div>"; });
  }
  function openCalendar() {
    var st = stage(L("My Calendar", "Mi Calendario")); st.el.classList.add("calstage");
    calendarTab(st.body);
  }
  function evDay(e) { return e.starts_at ? B.dstr(new Date(e.starts_at)) : null; }
  function paintCal() {
    var m = app.calMonth, y = m.getFullYear(), mo = m.getMonth(), lang = S().lang === "es" ? "es" : "en";
    var t = $("#calTitle"); if (!t) return;
    var mt = m.toLocaleDateString(lang, { month: "long", year: "numeric" }).replace(" de ", " "); t.textContent = mt.charAt(0).toUpperCase() + mt.slice(1);
    var first = (new Date(y, mo, 1).getDay() + 6) % 7, days = new Date(y, mo + 1, 0).getDate(), names = lang === "es" ? ["L", "M", "M", "J", "V", "S", "D"] : ["M", "T", "W", "T", "F", "S", "S"];
    var byDay = {}; app.events.forEach(function (e) { var d = evDay(e); if (d) (byDay[d] = byDay[d] || []).push(e); });
    var h = names.map(function (n) { return '<span class="cdn">' + n + "</span>"; }).join("");
    for (var i = 0; i < first; i++) h += "<span></span>";
    for (var d = 1; d <= days; d++) {
      var k = B.dstr(new Date(y, mo, d)), evs = byDay[k] || [];
      h += '<button class="cday ' + (k === B.today() ? "today " : "") + (k === app.calSel ? "sel" : "") + '" data-act="calday" data-d="' + k + '">' + d + '<span class="cdots">' + evs.slice(0, 3).map(function (e) { return '<i class="k-' + e.kind + '"></i>'; }).join("") + "</span></button>";
    }
    $("#calGrid").innerHTML = h;
    var sel = app.calSel.split("-"), sd = new Date(+sel[0], +sel[1] - 1, +sel[2]);
    $("#dayTitle").textContent = app.calSel === B.today() ? L("Today", "Hoy") : sd.toLocaleDateString(lang, { weekday: "long", day: "numeric", month: "long" });
    var list = (byDay[app.calSel] || []).sort(function (a, b) { return new Date(a.starts_at) - new Date(b.starts_at); });
    $("#dayList").innerHTML = list.length ? '<div class="card">' + list.map(evRow).join("") + "</div>" : '<div class="empty small">' + L("Nothing planned. Tap “Add”.", "No hay nada planeado. Toca “Agregar”.") + "</div>";
    var notes = app.events.filter(function (e) { return e.kind === "note" && !e.starts_at; });
    $("#noteList").innerHTML = notes.length ? '<div class="card">' + notes.map(evRow).join("") + "</div>" : '<div class="empty small">' + L("Notes without a date show up here.", "Las notas sin fecha aparecen aquí.") + "</div>";
  }
  function evRow(e) {
    var k = KIND_EV[e.kind] || KIND_EV.plan, tm = e.starts_at && e.kind !== "note" ? new Date(e.starts_at).toLocaleTimeString(S().lang === "es" ? "es" : "en", { hour: "numeric", minute: "2-digit" }) : "";
    return '<button class="lrow evrow ' + (e.done ? "done" : "") + '" data-act="editev" data-id="' + e.id + '"><div class="ic k-' + e.kind + '">' + ic(k[0]) + '</div><div style="min-width:0;flex:1"><b>' + esc(e.title) + "</b><span>" + L(k[1], k[2]) + (tm ? " · " + tm : "") + (e.notes ? " · " + esc(e.notes.slice(0, 40)) : "") + "</span></div>" + (e.done ? '<span class="tagok">' + ic("check2") + "</span>" : "") + "</button>";
  }
  function editEvent(e) {
    e = e || { kind: "plan", title: "", notes: "", starts_at: null };
    var isNew = !e.id, k = e.kind, d = e.starts_at ? new Date(e.starts_at) : null;
    var dv = d ? B.dstr(d) : app.calSel, tv = d ? ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) : "09:00";
    var sh = B.sheet("<h2>" + (isNew ? L("New", "Nuevo") : L("Edit", "Editar")) + '</h2><div class="seg" id="evK" style="margin-bottom:14px">' + ["plan", "alarm", "note"].map(function (x) { return '<button data-k="' + x + '">' + ic(KIND_EV[x][0]) + L(KIND_EV[x][1], KIND_EV[x][2]) + "</button>"; }).join("") + "</div>" +
      '<label class="field"><span>' + L("Title", "Título") + '</span><input class="input" id="evT" maxlength="80" value="' + esc(e.title) + '"></label>' +
      '<div class="row" id="evWhen" style="gap:10px"><label class="field" style="flex:1"><span>' + L("Date", "Fecha") + '</span><input class="input" id="evD" type="date" value="' + dv + '"></label><label class="field" style="flex:1" id="evTimeF"><span>' + L("Time", "Hora") + '</span><input class="input" id="evH" type="time" value="' + tv + '"></label></div>' +
      '<label class="row" id="evNoDate" style="gap:8px;margin:-4px 0 12px"><input type="checkbox" id="evND" ' + (k === "note" && !e.starts_at && !isNew ? "checked" : "") + '> <span class="small">' + L("No date", "Sin fecha") + "</span></label>" +
      '<label class="field"><span>' + L("Notes", "Notas") + '</span><textarea class="input" id="evN" maxlength="2000">' + esc(e.notes) + "</textarea></label>" +
      '<p class="muted small" id="evAlarmTip"></p>' +
      '<button class="btn gold block" id="evSave">' + L("Save", "Guardar") + "</button>" +
      (!isNew ? '<div class="row" style="margin-top:10px;gap:10px"><button class="btn ghost block" id="evDone">' + (e.done ? L("Mark not done", "Marcar pendiente") : ic("check") + L("Done", "Hecho")) + '</button><button class="btn ghost block" id="evIcs">' + ic("cal") + L("Phone", "Teléfono") + '</button><button class="iconbtn" id="evDel" style="color:var(--bad)">' + ic("trash") + "</button></div>" : ""));
    function paint() {
      $$("#evK button", sh).forEach(function (b) { b.classList.toggle("on", b.dataset.k === k); });
      $("#evTimeF", sh).style.display = k === "note" ? "none" : "";
      $("#evNoDate", sh).style.display = k === "note" ? "" : "none";
      $("#evWhen", sh).style.display = k === "note" && $("#evND", sh).checked ? "none" : "";
      $("#evAlarmTip", sh).textContent = k === "alarm" ? L("The app reminds you while it's open. Tap “Phone” after saving to add it to your phone's calendar with an alert.", "La app te avisa mientras está abierta. Después de guardar, toca “Teléfono” para ponerla en el calendario de tu celular con alerta.") : "";
    }
    paint();
    $$("#evK button", sh).forEach(function (b) { b.onclick = function () { k = b.dataset.k; paint(); }; });
    $("#evND", sh).onchange = paint;
    $("#evSave", sh).onclick = function () {
      var t = $("#evT", sh).value.trim(); if (!t) { $("#evT", sh).focus(); return; }
      var when = null;
      if (!(k === "note" && $("#evND", sh).checked)) { var dd = $("#evD", sh).value; if (dd) { var hh = k === "note" ? "12:00" : ($("#evH", sh).value || "09:00"); when = new Date(dd + "T" + hh).toISOString(); } }
      this.disabled = true;
      A.saveEvent({ id: e.id, title: t, kind: k, starts_at: when, notes: $("#evN", sh).value, done: e.done }).then(reloadEvents).then(function () { B.closeSheet(); B.sfx("good"); if (when) { app.calSel = B.dstr(new Date(when)); app.calMonth = new Date(new Date(when).getFullYear(), new Date(when).getMonth(), 1); } paintCal(); }).catch(function (x) { fail(x); });
    };
    if (!isNew) {
      $("#evDone", sh).onclick = function () { A.saveEvent({ id: e.id, title: e.title, kind: e.kind, starts_at: e.starts_at, notes: e.notes, done: !e.done }).then(reloadEvents).then(function () { B.closeSheet(); paintCal(); }).catch(fail); };
      $("#evDel", sh).onclick = function () { A.deleteEvent(e.id).then(reloadEvents).then(function () { B.closeSheet(); paintCal(); }).catch(fail); };
      $("#evIcs", sh).onclick = function () { downloadIcs(e); };
    }
  }
  function reloadEvents() { return A.events().then(function (x) { app.events = x || []; }); }
  function downloadIcs(e) {
    if (!e.starts_at) { B.toast(L("Add a date first", "Primero ponle fecha"), "", "cal"); return; }
    function f(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
    var st = new Date(e.starts_at), en = new Date(st.getTime() + 30 * 60000);
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Bible Challenge//EN", "BEGIN:VEVENT", "UID:" + e.id + "@biblechallenge", "DTSTAMP:" + f(new Date()), "DTSTART:" + f(st), "DTEND:" + f(en),
      "SUMMARY:" + e.title.replace(/[,;\n]/g, " "), "DESCRIPTION:" + (e.notes || "").replace(/\n/g, "\\n").replace(/[,;]/g, " "),
      "BEGIN:VALARM", "TRIGGER:" + (e.kind === "alarm" ? "PT0M" : "-PT15M"), "ACTION:DISPLAY", "DESCRIPTION:" + e.title.replace(/[,;\n]/g, " "), "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "bible-challenge.ics"; document.body.appendChild(a); a.click(); a.remove();
  }
  function checkAlarms() {
    if (!app.events || !app.me) return;
    var now = Date.now(), fired = S().fired || (S().fired = {});
    app.events.forEach(function (e) {
      if (e.kind === "alarm" && !e.done && e.starts_at && !fired[e.id]) {
        var t = new Date(e.starts_at).getTime();
        if (t <= now && now - t < 3600000) { fired[e.id] = 1; B.save(); B.sfx("level"); if (navigator.vibrate) try { navigator.vibrate([200, 100, 200]); } catch (x) {}
          B.sheet('<div class="center"><div class="bigicon">' + ic("alarm") + "</div><h2>" + esc(e.title) + '</h2><p class="muted">' + esc(e.notes || "") + '</p><button class="btn gold block" data-act="closesheet">OK</button></div>'); }
      }
    });
  }

  /* ---------------- settings ---------------- */
  function settings() {
    var st = stage(L("Settings", "Ajustes")), s = S();
    function paint() {
      var mod = isMod();
      st.body.innerHTML = '<div class="card"><div class="field"><span>' + L("Language", "Idioma") + '</span><div class="seg"><button data-lang="es" class="' + (s.lang === "es" ? "on" : "") + '">Español</button><button data-lang="en" class="' + (s.lang === "en" ? "on" : "") + '">English</button></div></div>' +
        '<div class="field"><span>' + L("Appearance", "Apariencia") + '</span><div class="seg"><button data-th="dark" class="' + (s.theme !== "light" ? "on" : "") + '">' + L("Dark", "Oscuro") + '</button><button data-th="light" class="' + (s.theme === "light" ? "on" : "") + '">' + ic("sun") + L("Light", "Claro") + "</button></div></div>" +
        '<div class="field"><span>' + L("Main color", "Color principal") + '</span><div class="accents">' + ACCENTS.map(function (a) { return '<button class="acc ' + ((s.accent || "violet") === a[0] ? "on" : "") + '" data-accent-pick="' + a[0] + '"><i style="background:' + a[1] + '"></i>' + L(a[2], a[3]) + "</button>"; }).join("") + "</div></div>" +
        '<div class="lrow"><div class="ic">' + ic("volume") + "</div><div><b>" + L("Sounds", "Sonidos") + '</b></div><button class="toggle ' + (s.sound ? "on" : "") + '" data-tog="sound" style="margin-left:auto"></button></div>' +
        '<div class="lrow"><div class="ic">' + ic("bell") + "</div><div><b>" + L("Call notifications", "Avisos de llamadas") + "</b><span>" + L("Ring even when the app is closed", "Suena aunque la app esté cerrada") + '</span></div><button class="toggle ' + (pushIsOn() ? "on" : "") + '" id="sPush" style="margin-left:auto"></button></div>' +
        '<div class="lrow"><div class="ic">' + ic("phone") + "</div><div><b>" + L("Vibration", "Vibración") + "</b><span>" + L("Android only", "Solo Android") + '</span></div><button class="toggle ' + (s.haptic ? "on" : "") + '" data-tog="haptic" style="margin-left:auto"></button></div></div>' +
        (!app.me.is_minor ? '<div class="section"><h2>' + L("Family", "Familia") + '</h2></div><div class="card"><b>' + L("Approve my child", "Aprobar a mi hijo/a") + '</b><p class="muted small" style="margin:4px 0 10px">' + L("Teens under 18 need a parent's approval. Type the code shown on their phone.", "Los menores de 18 necesitan la aprobación de su papá o mamá. Escribe el código que aparece en su teléfono.") + '</p><div class="row"><input class="input" id="tCode" maxlength="6" placeholder="ABC123" style="text-transform:uppercase;letter-spacing:.2em;font-weight:800"><button class="btn gold sm" id="tGo">' + L("Approve", "Aprobar") + '</button></div><div id="tList" style="margin-top:10px"></div></div>' : "") +
        '<div class="section"><h2>' + L("Privacy", "Privacidad") + '</h2></div><div class="card"><button class="lrow" id="sBlocks"><div class="ic">' + ic("ban") + "</div><div><b>" + L("Blocked people", "Personas bloqueadas") + "</b></div></button>" +
        '<button class="lrow" id="sPw"><div class="ic">' + ic("lock") + "</div><div><b>" + L("Change password", "Cambiar contraseña") + "</b></div></button></div>" +
        (mod ? '<div class="section"><h2>' + L("Moderation", "Moderación") + '</h2></div><div class="card"><button class="lrow" id="sMod"><div class="ic">' + ic("shield") + "</div><div><b>" + L("Reports", "Reportes") + "</b><span>" + L("Review what people reported", "Revisa lo que reportaron") + "</span></div></button></div>" : "") +
        '<div class="section"><h2>' + L("Support the ministry", "Apoya el ministerio") + '</h2></div><div class="card"><div class="sponsor"><div class="ic">' + ic("gift") + '</div><div><div class="eyebrow">' + L("Sponsored by", "Patrocinado por") + '</div><b style="font-family:var(--serif);font-size:20px">Ecos Del Reino</b></div></div><div class="hair"></div>' +
        '<a class="lrow" href="https://www.facebook.com/Comealive37" target="_blank" rel="noopener"><div class="ic">' + ic("fb") + "</div><div><b>Facebook</b><span>" + L("Follow us", "Síguenos") + '</span></div></a><a class="lrow" href="https://cash.app/$KahrTooNGaming" target="_blank" rel="noopener"><div class="ic">' + ic("gift") + "</div><div><b>Cash App</b><span>" + L("Give an offering", "Da una ofrenda") + "</span></div></a></div>" +
        '<button class="btn ghost block" id="sOut" style="margin-top:18px;color:var(--bad)">' + ic("logout") + L("Sign out", "Cerrar sesión") + "</button>" +
        '<p class="foot-note">Bible Challenge 2.0 · @' + esc(app.me.username) + "<br>" + L("English Scripture: King James Version (public domain).", "Escritura en inglés: King James Version (dominio público).") + "<br>" + L("Spanish Scripture: Reina-Valera 1960 © Sociedades Bíblicas en América Latina, 1960. Renewed © Sociedades Bíblicas Unidas, 1988.", "Escritura en español: Reina-Valera 1960 © Sociedades Bíblicas en América Latina, 1960. Renovado © Sociedades Bíblicas Unidas, 1988.") + "</p>";
      $$("[data-lang]", st.body).forEach(function (b) { b.onclick = function () { s.lang = b.dataset.lang; B.save(); document.documentElement.lang = s.lang; $(".ttl", st.el).textContent = L("Settings", "Ajustes"); paint(); render(true); }; });
      $$("[data-th]", st.body).forEach(function (b) { b.onclick = function () { s.theme = b.dataset.th; s.themeChosen = true; B.save(); applyTheme(); paint(); }; });
      $$("[data-accent-pick]", st.body).forEach(function (b) { b.onclick = function () { s.accent = b.dataset.accentPick; B.save(); applyTheme(); B.sfx("tap"); paint(); }; });
      $$("[data-tog]", st.body).forEach(function (b) { b.onclick = function () { s[b.dataset.tog] = !s[b.dataset.tog]; B.save(); paint(); B.sfx("tap"); }; });
      $("#sPush", st.body).onclick = function () { (pushIsOn() ? disablePush() : enablePush()).then(paint); };
      var tg = $("#tGo", st.body);
      if (tg) {
        tg.onclick = function () { var c = $("#tCode", st.body).value.trim(); if (!c) return; A.approveTeen(c).then(function (r) { B.sfx("level"); B.toast(L("Approved!", "¡Aprobado!"), r.name + L(" can now use Bible Challenge.", " ya puede usar Bible Challenge."), "shield"); app.friends = null; paint(); }).catch(fail); };
        A.myTeens().then(function (ts) { var l = $("#tList", st.body); if (l && ts && ts.length) l.innerHTML = '<div class="eyebrow" style="margin:6px 0">' + L("My children", "Mis hijos") + "</div>" + ts.map(function (t) { return personRow(t, "@" + t.username, ""); }).join(""); }).catch(function () {});
      }
      $("#sBlocks", st.body).onclick = function () {
        var sh = B.sheet("<h2>" + L("Blocked people", "Personas bloqueadas") + '</h2><div id="blk">' + spinner() + "</div>");
        A.blocks().then(function (bs) {
          $("#blk", sh).innerHTML = bs && bs.length ? bs.map(function (u) { return personRow(u, "@" + u.username, '<button class="btn ghost sm" data-ub="' + u.id + '">' + L("Unblock", "Desbloquear") + "</button>"); }).join("") : '<div class="empty">' + L("You haven't blocked anyone.", "No has bloqueado a nadie.") + "</div>";
          $$("[data-ub]", sh).forEach(function (b) { b.onclick = function () { A.unblock(b.dataset.ub).then(function () { b.closest(".lrow").remove(); }).catch(fail); }; });
        }).catch(fail);
      };
      $("#sPw", st.body).onclick = function () {
        var sh = B.sheet("<h2>" + L("Change password", "Cambiar contraseña") + '</h2><label class="field"><span>' + L("New password", "Nueva contraseña") + '</span><input class="input" id="np" type="password" minlength="6"></label><button class="btn gold block" id="npGo">' + L("Save", "Guardar") + "</button>");
        $("#npGo", sh).onclick = function () { var v = $("#np", sh).value; if (v.length < 6) return; A.updatePassword(v).then(function () { B.closeSheet(); B.toast(L("Password updated", "Contraseña actualizada"), "", "check"); }).catch(fail); };
      };
      var sm = $("#sMod", st.body); if (sm) sm.onclick = modScreen;
      $("#sOut", st.body).onclick = function () { st.close(); A.signOut(); };
    }
    paint();
  }
  function modScreen() {
    var st = stage(L("Reports", "Reportes"), spinner());
    function load() {
      A.modReports().then(function (rs) {
        st.body.innerHTML = rs && rs.length ? rs.map(function (r) {
          return '<div class="card"><div class="row"><span class="kchip">' + esc(r.target_type) + '</span><span class="spacer"></span><span class="muted small">' + ago(r.created_at) + '</span></div><p style="margin:10px 0"><b>' + esc(r.target_name || "") + ":</b> " + esc(r.preview || "") + '</p><p class="muted small">' + L("Reason: ", "Motivo: ") + esc(r.reason) + " · " + L("by ", "por ") + esc(r.reporter) + '</p><div class="row wrap" style="gap:8px">' +
            (r.target_type === "post" || r.target_type === "comment" ? '<button class="btn gold sm" data-rm="' + r.id + '">' + L("Remove content", "Borrar contenido") + "</button>" : "") +
            '<button class="btn ghost sm" data-ok="' + r.id + '">' + L("Dismiss", "Descartar") + "</button>" + (r.target_user ? '<button class="btn ghost sm" style="color:var(--bad)" data-sus="' + r.target_user + '">' + L("Suspend user", "Suspender usuario") + "</button>" : "") + "</div></div>";
        }).join("") : '<div class="empty">' + L("No open reports. 🙌", "No hay reportes abiertos. 🙌") + "</div>";
        $$("[data-rm]", st.body).forEach(function (b) { b.onclick = function () { A.modClose(b.dataset.rm, true).then(load).catch(fail); }; });
        $$("[data-ok]", st.body).forEach(function (b) { b.onclick = function () { A.modClose(b.dataset.ok, false).then(load).catch(fail); }; });
        $$("[data-sus]", st.body).forEach(function (b) { b.onclick = function () { A.modSuspend(b.dataset.sus, true).then(function () { B.toast(L("User suspended", "Usuario suspendido"), "", "lock"); }).catch(fail); }; });
      }).catch(function (e) { st.body.innerHTML = '<div class="empty">' + esc(errText(e)) + "</div>"; });
    }
    load();
  }

  /* ---------------- actions ---------------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-tab],[data-act]"); if (!t || !app.me) return;
    if (t.closest("#auth")) return;
    if (t.dataset.tab) { B.sfx("tap"); $$(".stage.social").forEach(function (s) { s.remove(); }); app.chatWith = null; go(t.dataset.tab); return; }
    var a = t.dataset.act, id = t.dataset.id;
    if (a === "compose") compose(t.dataset.vis);
    else if (a === "react") react(id, t.dataset.k);
    else if (a === "comments") openComments(id);
    else if (a === "pmenu") postMenu(id, t.dataset.author, t.dataset.mine === "1");
    else if (a === "delpost") A.deletePost(id).then(function () { B.closeSheet(); for (var k in feeds) feeds[k].items = feeds[k].items.filter(function (p) { return p.id !== id; }); $$('.post[data-id="' + id + '"]').forEach(function (x) { x.remove(); }); B.toast(L("Post deleted", "Publicación borrada"), "", "trash"); }).catch(fail);
    else if (a === "delcmt") A.deleteComment(id).then(function () { var p = findPost(t.dataset.post); if (p) p.comments = Math.max(0, p.comments - 1); repaintPost(t.dataset.post); }).catch(fail);
    else if (a === "report") { B.closeSheet(); reportSheet(t.dataset.type, id); }
    else if (a === "block") { B.closeSheet(); B.sheet("<h2>" + L("Block this person?", "¿Bloquear a esta persona?") + '</h2><p class="muted">' + L("They won't be able to see your posts or message you, and you won't see theirs.", "No podrá ver tus publicaciones ni escribirte, y tú no verás las suyas.") + '</p><div class="row" style="margin-top:14px"><button class="btn ghost block" data-act="closesheet">' + L("Cancel", "Cancelar") + '</button><button class="btn block" style="background:var(--bad);color:#fff" data-act="block2" data-id="' + id + '">' + L("Block", "Bloquear") + "</button></div>"); }
    else if (a === "block2") A.block(id).then(function () { B.closeSheet(); app.friends = null; $$(".stage.social").forEach(function (s) { s.remove(); }); app.chatWith = null; B.toast(L("Blocked", "Bloqueado"), "", "ban"); render(); }).catch(fail);
    else if (a === "suspend") A.modSuspend(id, true).then(function () { B.closeSheet(); B.toast(L("User suspended", "Usuario suspendido"), "", "lock"); }).catch(fail);
    else if (a === "closesheet") B.closeSheet();
    else if (a === "pushon") enablePush().then(function (ok) { if (ok) { var b = $(".pushban"); if (b) b.remove(); } });
    else if (a === "pushx") { S().pushDismissed = true; B.save(); var pb = $(".pushban"); if (pb) pb.remove(); }
    else if (a === "more") { var k = t.dataset.scope + (t.dataset.user || ""); if (feeds[k]) { t.disabled = true; loadFeed(feeds[k].el, t.dataset.scope, t.dataset.user || null, true); } }
    else if (a === "cfilter") { app.comFilter = t.dataset.k; $$('[data-act="cfilter"]').forEach(function (x) { x.classList.toggle("on", x === t); }); var f = feeds.community; if (f) paintFeed(f, "community"); }
    else if (a === "profile") { B.closeSheet(); openProfile(id); }
    else if (a === "me") openProfile(app.me.id);
    else if (a === "friends") friendsScreen();
    else if (a === "search") searchScreen();
    else if (a === "notif") notifSheet();
    else if (a === "chatwith") { B.closeSheet(); $$(".stage.social").forEach(function (s) { if (!s.classList.contains("chat")) s.remove(); }); openChat({ id: id, display_name: t.dataset.name, color: +t.dataset.color }); }
    else if (a === "bible") bibleScreen();
    else if (a.indexOf("g-") === 0) { B.sfx("tap"); window.Games[a.slice(2)](); }
    else if (a === "calendar") openCalendar();
    else if (a === "invite") invite();
    else if (a === "mute") { R.muted = !R.muted; $$(".reel video").forEach(function (v) { v.muted = R.muted; }); paintMute(); }
    else if (a === "upreel") uploadReelSheet();
    else if (a === "rlike") likeReel(id);
    else if (a === "rcomments") reelComments(id);
    else if (a === "rmenu") reelMenu(id, t.dataset.author, t.dataset.mine === "1");
    else if (a === "delreel") A.deleteReel(id).then(function () { B.closeSheet(); var el = $('.reel[data-id="' + id + '"]'); if (el) el.remove(); R.items = R.items.filter(function (r) { return r.id !== id; }); B.toast(L("Reel deleted", "Reel borrado"), "", "trash"); }).catch(fail);
    else if (a === "calprev" || a === "calnext") { var m = app.calMonth; app.calMonth = new Date(m.getFullYear(), m.getMonth() + (a === "calnext" ? 1 : -1), 1); paintCal(); }
    else if (a === "calday") { app.calSel = t.dataset.d; paintCal(); }
    else if (a === "addev") editEvent();
    else if (a === "editev") editEvent(app.events.filter(function (x) { return x.id === id; })[0]);
  });

  document.addEventListener("click", function (e) {
    var r = e.target.closest(".reel"); if (!r || e.target.closest("button,a")) return;
    var v = $("video", r); if (!v) return;
    if (v.paused) { v.play().catch(function () {}); r.classList.remove("paused"); } else { v.pause(); r.classList.add("paused"); }
  });
  var lastTap = 0;
  document.addEventListener("dblclick", function (e) { var r = e.target.closest(".reel"); if (!r || e.target.closest("button")) return; var it = reelById(r.dataset.id); if (it && !it.liked) likeReel(it.id); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden && app.me) loadNotif(); if (document.hidden) $$(".reel video").forEach(function (v) { v.pause(); }); });
  document.addEventListener("DOMContentLoaded", function () {
    if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(function () {});
    boot();
  });
})();
