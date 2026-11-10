/* Bible Challenge — connection to the online database (Supabase) */
(function () {
  "use strict";
  var URL = "https://ubpjqlbnkvxztrjrfwvo.supabase.co";
  var KEY = "sb_publishable_sOBeyVsWa0FGu3onfrkUXA_CH74Fezo";
  if (window.API) return; // a test build may provide its own
  var sb = null, me = null;

  function client() {
    if (!sb) {
      if (!window.supabase || !window.supabase.createClient) throw new Error("offline");
      sb = window.supabase.createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    }
    return sb;
  }
  function ok(r) { if (r.error) { var e = new Error(r.error.message || "error"); e.code = r.error.code; throw e; } return r.data; }
  function rpc(name, args) { return client().rpc(name, args || {}).then(ok); }

  window.API = {
    ready: function () { return client().auth.getSession().then(function (r) { me = r.data.session ? r.data.session.user : null; return me; }); },
    onAuth: function (cb) { client().auth.onAuthStateChange(function (ev, session) { me = session ? session.user : null; cb(ev, me); }); },
    user: function () { return me; },
    signUp: function (email, pw) { return client().auth.signUp({ email: email, password: pw, options: { emailRedirectTo: location.origin + location.pathname } }).then(ok).then(function (d) { me = d.user; return d; }); },
    signIn: function (email, pw) { return client().auth.signInWithPassword({ email: email, password: pw }).then(ok).then(function (d) { me = d.user; return d; }); },
    signOut: function () { return client().auth.signOut().then(function () { me = null; }); },
    resetPassword: function (email) { return client().auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }).then(ok); },
    updatePassword: function (pw) { return client().auth.updateUser({ password: pw }).then(ok); },

    profile: function () {
      if (!me) return Promise.resolve(null);
      return Promise.all([
        client().from("profiles").select("*").eq("id", me.id).maybeSingle().then(ok),
        client().from("profile_private").select("parent_code,parent_id").eq("id", me.id).maybeSingle().then(ok)
      ]).then(function (r) { if (!r[0]) return null; var p = r[0]; p.parent_code = r[1] && r[1].parent_code; p.has_parent = !!(r[1] && r[1].parent_id); return p; });
    },
    createProfile: function (o) { return rpc("create_profile", { p_username: o.username, p_display_name: o.display_name, p_birth_year: o.birth_year, p_color: o.color }); },
    updateProfile: function (name, bio, color) { return rpc("update_profile", { p_display_name: name, p_bio: bio, p_color: color }); },
    getProfile: function (id) { return client().from("profiles").select("id,username,display_name,color,bio,role,is_minor,created_at,avatar_path,banner_path").eq("id", id).maybeSingle().then(ok); },

    feed: function (scope, before, user) { return rpc("feed", { p_scope: scope, p_before: before || null, p_user: user || null, p_limit: 20 }); },
    createPost: function (o) { return client().from("posts").insert({ author: me.id, body: o.body, visibility: o.visibility, kind: o.kind || "text", verse_ref: o.verse_ref || null }).then(ok); },
    deletePost: function (id) { return rpc("delete_post", { p_id: id }); },
    react: function (postId, kind) {
      var t = client().from("reactions");
      if (!kind) return t.delete().eq("post_id", postId).eq("user_id", me.id).then(ok);
      return t.upsert({ post_id: postId, user_id: me.id, kind: kind }, { onConflict: "post_id,user_id" }).then(ok);
    },
    comments: function (postId) { return rpc("post_comments", { p_post: postId }); },
    addComment: function (postId, body) { return client().from("comments").insert({ post_id: postId, author: me.id, body: body }).then(ok); },
    deleteComment: function (id) { return rpc("delete_comment", { p_id: id }); },

    searchUsers: function (q) { return rpc("search_users", { p_q: q }); },
    friends: function () { return rpc("my_friends"); },
    requests: function () { return rpc("friend_requests"); },
    sendRequest: function (id) { return rpc("send_friend_request", { p_user: id }); },
    respond: function (id, accept) { return rpc("respond_friend_request", { p_id: id, p_accept: accept }); },
    removeFriend: function (id) { return rpc("remove_friend", { p_user: id }); },
    block: function (id) { return rpc("block_user", { p_user: id }); },
    unblock: function (id) { return rpc("unblock_user", { p_user: id }); },
    blocks: function () { return rpc("my_blocks"); },

    conversations: function () { return rpc("conversations"); },
    thread: function (id) { return rpc("thread", { p_user: id, p_limit: 80 }); },
    sendMessage: function (id, body) { return client().from("messages").insert({ sender: me.id, recipient: id, body: body }).select().single().then(ok); },
    markRead: function (id) { return rpc("mark_read", { p_user: id }); },
    subscribe: function (cb) {
      try {
        var ch = client().channel("inbox-" + me.id)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: "recipient=eq." + me.id }, function (p) { cb(p.new); })
          .subscribe();
        return function () { try { client().removeChannel(ch); } catch (e) {} };
      } catch (e) { return function () {}; }
    },
    notifications: function () { return rpc("notifications"); },

    events: function () { return client().from("events").select("*").eq("owner", me.id).order("starts_at", { ascending: true, nullsFirst: false }).then(ok); },
    saveEvent: function (e) {
      var row = { owner: me.id, title: e.title, kind: e.kind, starts_at: e.starts_at || null, notes: e.notes || "", done: !!e.done };
      if (e.id) return client().from("events").update(row).eq("id", e.id).then(ok);
      return client().from("events").insert(row).then(ok);
    },
    deleteEvent: function (id) { return client().from("events").delete().eq("id", id).then(ok); },

    submitScore: function (game, score) { return client().from("game_scores").insert({ user_id: me.id, game: game, score: Math.max(0, Math.min(100000, Math.round(score))) }).then(ok); },
    leaderboard: function (game, scope) { return rpc("leaderboard", { p_game: game, p_scope: scope }); },

    reels: function (before, user) {
      return rpc("reels_feed", { p_before: before || null, p_user: user || null, p_limit: 8 }).then(function (rows) {
        rows = rows || []; if (!rows.length) return rows;
        var paths = []; rows.forEach(function (r) { paths.push(r.video_path); if (r.thumb_path) paths.push(r.thumb_path); });
        return client().storage.from("reels").createSignedUrls(paths, 3600).then(ok).then(function (signed) {
          var map = {}; (signed || []).forEach(function (s) { if (s.signedUrl) map[s.path] = s.signedUrl; });
          rows.forEach(function (r) { r.video_url = map[r.video_path]; r.thumb_url = r.thumb_path ? map[r.thumb_path] : null; });
          return rows.filter(function (r) { return r.video_url; });
        });
      });
    },
    uploadReel: function (video, thumb, o) {
      var id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
      var ext = /webm/.test(video.type) ? "webm" : /quicktime/.test(video.type) ? "mov" : "mp4";
      var vp = me.id + "/" + id + "." + ext, tp = thumb ? me.id + "/" + id + ".jpg" : null, st = client().storage.from("reels");
      return st.upload(vp, video, { contentType: video.type || "video/mp4", upsert: false }).then(ok)
        .then(function () { return thumb ? st.upload(tp, thumb, { contentType: "image/jpeg", upsert: false }).then(ok) : null; })
        .then(function () { return client().from("reels").insert({ author: me.id, video_path: vp, thumb_path: tp, caption: o.caption || "", visibility: o.visibility, duration: o.duration || null }).then(ok); })
        .catch(function (e) { st.remove([vp].concat(tp ? [tp] : [])).catch(function () {}); throw e; });
    },
    likeReel: function (id, on) {
      var t = client().from("reel_likes");
      return on ? t.insert({ reel_id: id, user_id: me.id }).then(ok) : t.delete().eq("reel_id", id).eq("user_id", me.id).then(ok);
    },
    reelComments: function (id) { return rpc("reel_comments_list", { p_reel: id }); },
    addReelComment: function (id, body) { return client().from("reel_comments").insert({ reel_id: id, author: me.id, body: body }).then(ok); },
    deleteReel: function (id) { return rpc("delete_reel", { p_id: id }); },
    deleteReelComment: function (id) { return rpc("delete_reel_comment", { p_id: id }); },

    photos: function (ids) { return client().from("profiles").select("id,avatar_path,banner_path").in("id", ids).then(ok); },
    photoUrl: function (path) { return path ? URL + "/storage/v1/object/public/avatars/" + path : null; },
    uploadPhoto: function (kind, blob, oldPath) {
      var path = me.id + "/" + kind + "-" + Date.now() + ".jpg", st = client().storage.from("avatars");
      return st.upload(path, blob, { contentType: "image/jpeg", upsert: false }).then(ok)
        .then(function () { return rpc("set_profile_photo", { p_kind: kind, p_path: path }); })
        .then(function () { if (oldPath) st.remove([oldPath]).catch(function () {}); return path; });
    },
    removePhoto: function (kind, oldPath) { return rpc("set_profile_photo", { p_kind: kind, p_path: null }).then(function () { if (oldPath) client().storage.from("avatars").remove([oldPath]).catch(function () {}); }); },

    approveTeen: function (code) { return rpc("approve_teen", { p_code: code }); },
    myTeens: function () { return rpc("my_teens"); },
    report: function (type, id, reason) { return client().from("reports").insert({ reporter: me.id, target_type: type, target_id: id, reason: reason }).then(ok); },
    modReports: function () { return rpc("mod_reports"); },
    modClose: function (id, remove) { return rpc("mod_close_report", { p_id: id, p_remove: remove }); },
    modSuspend: function (id, on) { return rpc("mod_set_suspended", { p_user: id, p_suspend: on }); }
  };
})();
