/* Account storage for Cut Tracker.
   With Supabase keys in config.js: email sign-in link + one private set of rows per person.
   Without keys: AppStore.enabled is false and the app saves on this device only. */
(function(){
  "use strict";
  var cfg = window.APP_CONFIG || {};
  var sb = null;
  if (cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase && window.supabase.createClient) {
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  }
  var user = null;

  window.AppStore = {
    enabled: !!sb,
    user: function(){ return user; },
    // Resolves the signed-in user, or null. Also finishes a sign-in when the page opens from the emailed link.
    session: async function(){
      if (!sb) return null;
      var r = await sb.auth.getSession();
      user = r.data && r.data.session ? r.data.session.user : null;
      return user;
    },
    onAuthChange: function(fn){
      if (!sb) return;
      sb.auth.onAuthStateChange(function(ev, s){ user = s ? s.user : null; fn(user, ev); });
    },
    signIn: async function(email){
      var r = await sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.origin + location.pathname } });
      if (r.error) throw r.error;
    },
    signOut: async function(){ if (sb) await sb.auth.signOut(); user = null; },
    // Every saved document for the signed-in person, as {id: data}. Row-level security limits it to their own rows.
    list: async function(){
      var out = {}, from = 0, page = 1000;
      for (;;) {
        var r = await sb.from("docs").select("id,data").range(from, from + page - 1);
        if (r.error) throw r.error;
        r.data.forEach(function(row){ out[row.id] = row.data; });
        if (r.data.length < page) return out;
        from += page;
      }
    },
    set: async function(id, data){
      var r = await sb.from("docs").upsert({ user_id: user.id, id: id, data: data, updated_at: new Date().toISOString() }, { onConflict: "user_id,id" });
      if (r.error) throw r.error;
    },
    // Erases every row this person owns. Their login stays; deleting that needs the project dashboard.
    deleteAll: async function(){
      var r = await sb.from("docs").delete().eq("user_id", user.id);
      if (r.error) throw r.error;
    },
    // A problem report or idea, kept in a table only the project owner reads in full.
    feedback: async function(kind, message, page, diag){
      var r = await sb.from("feedback").insert({ user_id: user.id, email: user.email || null, kind: kind, message: message, page: page, diag: diag });
      if (r.error) throw r.error;
    }
  };
})();
