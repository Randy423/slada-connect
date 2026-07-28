/* ==========================================================================
   SLADA Connect — Administrator Portal + shared screens
   ========================================================================== */
var Admin = {};

/* ==========================================================================
   Analytics dashboard
   ========================================================================== */
Admin.dashboard = function(){
  var all = (Store.s.submittedTests||[]).concat(TESTS);
  var totalTests = 209 + (Store.s.submittedTests||[]).length;
  var pending = all.filter(function(x){ return x.status === "Pending" || x.status === "Under Review"; }).length;
  var completed = all.filter(function(x){ return x.status === "Completed"; }).length + 178;
  var icTotal = MONTHLY_TESTS.reduce(function(a,m){ return a + m.ic; }, 0);
  var oocTotal = MONTHLY_TESTS.reduce(function(a,m){ return a + m.ooc; }, 0);
  var split = icTotal + oocTotal;

  var feed = ACTIVITY.map(function(a){
    return '<div class="listrow"><span class="lr-ic '+a.bg+'">'+a.icon+'</span>'+
      '<span class="grow"><span class="lr-t" style="display:block">'+esc(a.t)+'</span>'+
      '<span class="lr-s truncate" style="display:block">'+esc(a.s)+'</span></span>'+
      '<span class="lr-m">'+esc(a.m)+'</span></div>';
  }).join("");

  return '<div class="row-b mb-24 wrap">'+
    '<div><h1 style="font-size:clamp(22px,3.4vw,30px);font-weight:820">Administration overview</h1>'+
    '<p class="muted mt-8" style="font-size:14.5px">National anti-doping activity · '+fmtDate(todayISO())+'</p></div>'+
    '<div class="row" style="gap:10px">'+
      '<button class="btn ghost" onclick="exportCSV()">'+ICON.dl+' Export</button>'+
      '<button class="btn" onclick="go(\'admin/reports\')">'+ICON.chart+' Reports</button>'+
    '</div>'+
  '</div>'+

  '<div class="stat-grid stagger mb-24">'+
    statCard({icon:"🧪", bg:"bg-blue",  tint:"tint-blue",  n:totalTests, label:"Total tests", delta:"12% vs last year", up:true})+
    statCard({icon:"👤", bg:"bg-green", tint:"tint-green", n:ATHLETES.length*13, label:"Athletes tested", delta:"18 this month", up:true})+
    statCard({icon:"⏳", bg:"bg-amber", tint:"tint-amber", n:pending, label:"Pending reports", delta:"2 overdue", up:false})+
    statCard({icon:"✅", bg:"bg-violet",tint:"tint-violet",n:completed, label:"Completed reports", delta:"96% on time", up:true})+
  '</div>'+

  '<div class="dash-grid mb-16">'+
    '<div class="chart-card">'+
      '<div class="chart-head"><div><h4>Monthly tests</h4>'+
        '<p>In-competition and out-of-competition, current year</p></div>'+
        '<span class="badge blue">'+split+' total</span></div>'+
      Chart.bars(MONTHLY_TESTS, [
        {key:"ic",  label:"In-competition",     color:"var(--blue-600)"},
        {key:"ooc", label:"Out-of-competition", color:"var(--green-600)"}
      ], {labelKey:"m"})+
    '</div>'+
    '<div class="chart-card">'+
      '<div class="chart-head"><div><h4>Testing split</h4><p>Competition vs out-of-competition</p></div></div>'+
      '<div class="row" style="gap:22px;flex-wrap:wrap;justify-content:center">'+
        Chart.donut([
          {s:"In-competition", n:icTotal, c:"var(--blue-600)"},
          {s:"Out-of-competition", n:oocTotal, c:"var(--green-600)"}
        ], 152)+
        '<div style="min-width:150px">'+
          '<div class="mb-16"><div class="row" style="gap:8px;font-size:13px"><i style="width:10px;height:10px;border-radius:3px;background:var(--blue-600);display:block"></i><b>In-competition</b></div>'+
            '<div style="font-size:22px;font-weight:800;letter-spacing:-.03em;margin-top:4px">'+icTotal+'</div>'+
            '<div class="muted" style="font-size:12px">'+Math.round(icTotal/split*100)+'% of all tests</div></div>'+
          '<div><div class="row" style="gap:8px;font-size:13px"><i style="width:10px;height:10px;border-radius:3px;background:var(--green-600);display:block"></i><b>Out-of-competition</b></div>'+
            '<div style="font-size:22px;font-weight:800;letter-spacing:-.03em;margin-top:4px">'+oocTotal+'</div>'+
            '<div class="muted" style="font-size:12px">'+Math.round(oocTotal/split*100)+'% of all tests</div></div>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>'+

  '<div class="dash-grid">'+
    '<div class="chart-card">'+
      '<div class="chart-head"><div><h4>Tests by sport</h4><p>Distribution across national federations</p></div></div>'+
      Chart.hbars(TESTS_BY_SPORT)+
    '</div>'+
    '<div class="card pad">'+
      '<div class="row-b mb-12"><h4 style="font-size:15.5px;font-weight:730">Recent activity</h4>'+
        '<button class="btn ghost sm" onclick="go(\'admin/notifications\')">All</button></div>'+
      '<div style="margin:0 -4px">'+feed+'</div>'+
    '</div>'+
  '</div>'+

  '<div class="section-h">Quick actions</div>'+
  '<div class="quick-grid">'+
    ['<button class="quick" onclick="go(\'admin/athletes\')"><span class="q-ic bg-blue tint-blue">'+ICON.users+'</span>'+
      '<span class="q-t">Athlete database</span><span class="q-s">Search and manage records</span></button>',
     '<button class="quick" onclick="go(\'admin/tests\')"><span class="q-ic bg-green tint-green">'+ICON.flask+'</span>'+
      '<span class="q-t">Search records</span><span class="q-s">All doping control forms</span></button>',
     '<button class="quick" onclick="go(\'admin/reports\')"><span class="q-ic bg-violet tint-violet">'+ICON.doc+'</span>'+
      '<span class="q-t">Export reports</span><span class="q-s">PDF, CSV and Excel</span></button>',
     '<button class="quick" onclick="go(\'admin/users\')"><span class="q-ic bg-amber tint-amber">'+ICON.shield+'</span>'+
      '<span class="q-t">Manage users</span><span class="q-s">Officers and administrators</span></button>'].join("")+
  '</div>'+
  '<div class="src-note"><span>'+ICON.info+'</span><span>All figures shown are illustrative sample data generated for this prototype.</span></div>';
};

Admin.athletes = function(){ return athleteTable("admin"); };
Admin.athleteDetail = function(id){ return athleteDetail(id, "admin"); };
Admin.tests = function(){ return Officer.tests(); };

Admin.reports = function(){
  return pageHead("Reports & export","Generate national testing reports, or export the underlying records.")+
  '<div class="dash-grid">'+
    '<div>'+
      '<div class="card pad mb-16">'+
        '<h4 style="font-size:15.5px;font-weight:730;margin-bottom:16px">Build a report</h4>'+
        '<div class="grid-2">'+
          '<div class="field"><label class="label">REPORT TYPE</label><select class="select">'+
            '<option>National testing summary</option><option>Tests by sport</option>'+
            '<option>Federation compliance</option><option>Officer activity</option>'+
            '<option>Education programme reach</option></select></div>'+
          '<div class="field"><label class="label">PERIOD</label><select class="select">'+
            '<option>This month</option><option>Last quarter</option><option>Year to date</option><option>Custom range</option></select></div>'+
          '<div class="field"><label class="label">FEDERATION</label><select class="select">'+
            '<option>All federations</option>'+FEDERATIONS.map(function(f){ return '<option>'+esc(f)+'</option>'; }).join("")+'</select></div>'+
          '<div class="field"><label class="label">FORMAT</label><select class="select">'+
            '<option>PDF</option><option>CSV</option><option>Excel</option></select></div>'+
        '</div>'+
        '<div class="row wrap" style="gap:10px">'+
          '<button class="btn" onclick="UI.toast(\'Prototype: report generation is simulated\')">'+ICON.chart+' Generate report</button>'+
          '<button class="btn ghost" onclick="exportCSV()">'+ICON.dl+' Export records (CSV)</button>'+
          '<button class="btn ghost" onclick="window.print()">'+ICON.dl+' Print view</button>'+
        '</div>'+
      '</div>'+
      '<div class="chart-card">'+
        '<div class="chart-head"><div><h4>Testing volume</h4><p>Monthly totals for the current year</p></div></div>'+
        Chart.bars(MONTHLY_TESTS, [
          {key:"ic",  label:"In-competition",     color:"var(--blue-600)"},
          {key:"ooc", label:"Out-of-competition", color:"var(--green-600)"}
        ], {labelKey:"m"})+
      '</div>'+
    '</div>'+
    '<div>'+
      '<div class="section-h">Scheduled reports</div>'+
      '<div class="card" style="padding:6px 18px">'+
        [["Monthly testing summary","1st of each month · PDF"],
         ["Federation compliance","Quarterly · Excel"],
         ["WADA annual return","Annually · PDF"]].map(function(r){
          return '<div class="listrow"><span class="lr-ic bg-blue tint-blue">'+ICON.doc+'</span>'+
            '<span class="grow"><span class="lr-t" style="display:block">'+esc(r[0])+'</span>'+
            '<span class="lr-s" style="display:block">'+esc(r[1])+'</span></span>'+
            '<span class="badge green">On</span></div>';
        }).join("")+
      '</div>'+
      '<div class="section-h">Recent exports</div>'+
      '<div class="card" style="padding:6px 18px">'+
        [["National summary — July 2026","PDF · 340 KB","2 days ago"],
         ["Tests by sport — Q2 2026","CSV · 22 KB","1 week ago"],
         ["Officer activity — June 2026","PDF · 198 KB","3 weeks ago"]].map(function(r){
          return '<div class="listrow"><span class="lr-ic bg-slate">📄</span>'+
            '<span class="grow"><span class="lr-t" style="display:block">'+esc(r[0])+'</span>'+
            '<span class="lr-s" style="display:block">'+esc(r[1])+'</span></span>'+
            '<span class="lr-m">'+esc(r[2])+'</span></div>';
        }).join("")+
      '</div>'+
    '</div>'+
  '</div>';
};

Admin.users = function(){
  var rows = USERS.map(function(u){
    return '<tr onclick="UI.toast(\'Prototype: user management is not implemented\')">'+
      '<td><div class="row" style="gap:10px"><span class="avatar sm">'+esc(initials(u.name))+'</span>'+
        '<span><div class="cell-strong">'+esc(u.name)+'</div><div class="cell-sub">'+esc(u.email)+'</div></span></div></td>'+
      '<td><span class="badge '+(u.role.indexOf("Admin")!==-1?"violet":(u.role.indexOf("Officer")!==-1?"blue":"slate"))+'">'+esc(u.role)+'</span></td>'+
      '<td>'+esc(u.last)+'</td>'+
      '<td><span class="badge '+statusBadgeCls(u.status)+'">'+esc(u.status)+'</span></td>'+
    '</tr>';
  }).join("");

  return pageHead("Manage users","Officers, administrators and support staff with access to the platform.")+
  '<div class="toolbar">'+
    '<div class="search-inline"><span style="color:var(--faint)">'+ICON.search+'</span>'+
      '<input placeholder="Search by name, email or role" oninput="UI.toast(\'Prototype: user search is not wired up\')" /></div>'+
    '<button class="btn" onclick="UI.toast(\'Prototype: user creation is not implemented\')">'+ICON.plus+' Add user</button>'+
  '</div>'+
  '<div class="table-wrap"><table class="tbl"><thead><tr>'+
    '<th>User</th><th>Role</th><th>Last active</th><th>Status</th>'+
  '</tr></thead><tbody>'+rows+'</tbody></table></div>'+
  '<div class="src-note"><span>'+ICON.info+'</span><span>Role-based access control is represented visually only. '+
    'A production build would enforce permissions server-side.</span></div>';
};

/* ==========================================================================
   Shared — notifications
   ========================================================================== */
function notificationsView(role){
  var list = NOTIFICATIONS.filter(function(n){
    if(role === "athlete") return n.audience === "all" || n.audience === "athlete";
    if(role === "officer") return n.audience === "all" || n.audience === "officer";
    return true;
  });
  var unread = list.filter(function(n){ return n.unread && Store.s.readNotifs.indexOf(n.id) === -1; }).length;

  var items = list.map(function(n){
    var isUnread = n.unread && Store.s.readNotifs.indexOf(n.id) === -1;
    return '<div class="notif'+(isUnread?" unread":"")+'" onclick="readNotif('+n.id+')">'+
      '<span class="n-ic '+n.bg+'">'+n.icon+'</span>'+
      '<span class="grow"><span class="n-t" style="display:block">'+esc(n.title)+'</span>'+
      '<span class="n-b" style="display:block">'+esc(n.body)+'</span>'+
      '<span class="n-m" style="display:block">'+esc(n.time)+'</span></span>'+
      (isUnread ? '<span class="n-dot"></span>' : "")+
    '</div>';
  }).join("");

  return '<div class="row-b mb-24 wrap">'+
    '<div><h1 style="font-size:clamp(22px,3.2vw,29px);font-weight:820">Notifications</h1>'+
    '<p class="muted mt-8" style="font-size:14.5px">'+(unread ? unread+" unread" : "You are all caught up")+'</p></div>'+
    (unread ? '<button class="btn ghost" onclick="markAllRead()">Mark all as read</button>' : "")+
  '</div>'+
  (items || '<div class="empty"><div class="e-ic">🔔</div><h4>No notifications</h4><p>New alerts will appear here.</p></div>');
}
function readNotif(id){
  if(Store.s.readNotifs.indexOf(id) === -1){ Store.s.readNotifs.push(id); Store.save(); }
  var n = null;
  for(var i=0;i<NOTIFICATIONS.length;i++){ if(NOTIFICATIONS[i].id === id){ n = NOTIFICATIONS[i]; break; } }
  if(n) UI.modal('<div class="row mb-16" style="gap:12px"><span class="n-ic '+n.bg+'" style="width:44px;height:44px;border-radius:13px;display:grid;place-items:center;font-size:19px">'+n.icon+'</span>'+
    '<h3 style="margin:0">'+esc(n.title)+'</h3></div>'+
    '<p>'+esc(n.body)+'</p><p class="muted" style="font-size:12.5px">'+esc(n.time)+'</p>'+
    '<button class="btn ghost block" onclick="UI.closeModal()">Close</button>');
  Shell.role = null; Router.render();
}
function markAllRead(){
  NOTIFICATIONS.forEach(function(n){
    if(Store.s.readNotifs.indexOf(n.id) === -1) Store.s.readNotifs.push(n.id);
  });
  Store.save();
  Shell.role = null;
  Router.render();
  UI.toast("All notifications marked as read");
}

/* ==========================================================================
   Shared — settings
   ========================================================================== */
function settingsView(role){
  var s = Store.s;
  var langs = [{k:"en",n:"English"},{k:"si",n:"සිංහල · Sinhala"},{k:"ta",n:"தமிழ் · Tamil"}];

  function toggleRow(key, title, sub){
    var on = s.prefs[key];
    return '<div class="listrow" onclick="togglePref(\''+key+'\')">'+
      '<span class="grow"><span class="lr-t" style="display:block">'+esc(title)+'</span>'+
      '<span class="lr-s" style="display:block">'+esc(sub)+'</span></span>'+
      '<span class="switch'+(on?" on":"")+'"></span></div>';
  }

  return pageHead("Settings","Appearance, language, account and privacy preferences.")+
  '<div class="dash-grid">'+
    '<div>'+
      '<div class="section-h">Appearance</div>'+
      '<div class="card pad mb-16">'+
        '<div class="row-b mb-16"><div><b style="font-size:14.5px">Theme</b>'+
          '<div class="muted" style="font-size:13px;margin-top:3px">Light, or dark for low-light environments</div></div></div>'+
        '<div class="row wrap" style="gap:10px">'+
          '<button class="chip'+(s.theme!=="dark"?" on":"")+'" onclick="setTheme(\'light\')">☀️ Light</button>'+
          '<button class="chip'+(s.theme==="dark"?" on":"")+'" onclick="setTheme(\'dark\')">🌙 Dark</button>'+
        '</div>'+
      '</div>'+

      '<div class="section-h">Language</div>'+
      '<div class="card pad mb-16">'+
        '<div class="row wrap" style="gap:10px">'+
          langs.map(function(l){
            return '<button class="chip'+(s.lang===l.k?" on":"")+'" onclick="setLang(\''+l.k+'\')">'+esc(l.n)+'</button>';
          }).join("")+
        '</div>'+
        '<div class="src-note"><span>'+ICON.info+'</span><span><b>Prototype translation.</b> Navigation labels switch language. '+
          'Article and medication content remains in English and requires professional translation and review before any public release.</span></div>'+
      '</div>'+

      '<div class="section-h">Notifications</div>'+
      '<div class="card" style="padding:6px 18px">'+
        toggleRow("testAlerts","Testing alerts","Selection for testing and whereabouts reminders")+
        toggleRow("eduAlerts","Education sessions","Upcoming workshops and course deadlines")+
        toggleRow("emailNotif","Email notifications","Send a copy to your registered email address")+
        toggleRow("pushNotif","Push notifications","Alerts on this device")+
      '</div>'+
    '</div>'+

    '<div>'+
      '<div class="section-h">Profile</div>'+
      '<div class="card pad mb-16">'+
        '<div class="row mb-16" style="gap:13px">'+
          '<span class="avatar">'+esc(initials(role==="athlete"?s.athleteName:(role==="officer"?s.officerName:"A. Mendis")))+'</span>'+
          '<div class="grow"><b style="font-size:14.5px">'+esc(role==="athlete"?s.athleteName:(role==="officer"?s.officerName:"A. Mendis"))+'</b>'+
          '<div class="muted" style="font-size:12.5px">'+esc(role==="athlete"?sportLabel():(role==="officer"?"Doping Control Officer":"System Administrator"))+'</div></div>'+
        '</div>'+
        (role === "athlete" ? '<button class="btn ghost block" onclick="editProfile()">Edit profile</button>' : "")+
      '</div>'+

      '<div class="section-h">Security</div>'+
      '<div class="card" style="padding:6px 18px">'+
        '<div class="listrow" onclick="UI.toast(\'Prototype: password change is not implemented\')">'+
          '<span class="lr-ic bg-slate">'+ICON.shield+'</span>'+
          '<span class="grow"><span class="lr-t" style="display:block">Change password</span>'+
          '<span class="lr-s" style="display:block">Last changed 3 months ago</span></span>'+
          '<span style="color:var(--faint)">'+ICON.chev+'</span></div>'+
        '<div class="listrow" onclick="UI.toast(\'Prototype: two-factor setup is not implemented\')">'+
          '<span class="lr-ic bg-slate">🔐</span>'+
          '<span class="grow"><span class="lr-t" style="display:block">Two-factor authentication</span>'+
          '<span class="lr-s" style="display:block">Recommended for officer accounts</span></span>'+
          '<span class="badge amber">Off</span></div>'+
        '<div class="listrow" onclick="UI.toast(\'Prototype: session management is not implemented\')">'+
          '<span class="lr-ic bg-slate">💻</span>'+
          '<span class="grow"><span class="lr-t" style="display:block">Active sessions</span>'+
          '<span class="lr-s" style="display:block">1 device signed in</span></span>'+
          '<span style="color:var(--faint)">'+ICON.chev+'</span></div>'+
      '</div>'+

      '<div class="section-h">Privacy</div>'+
      '<div class="card" style="padding:6px 18px">'+
        toggleRow("analytics","Usage analytics","Help improve the platform with anonymous usage data")+
        '<div class="listrow" onclick="privacyInfo()">'+
          '<span class="lr-ic bg-slate">📄</span>'+
          '<span class="grow"><span class="lr-t" style="display:block">Data and privacy</span>'+
          '<span class="lr-s" style="display:block">How your information is handled</span></span>'+
          '<span style="color:var(--faint)">'+ICON.chev+'</span></div>'+
      '</div>'+

      '<div class="section-h">Data</div>'+
      '<div class="card pad">'+
        '<button class="btn ghost block" onclick="resetPrototype()">↺ Reset prototype data</button>'+
        (role === "officer" ? '<button class="btn ghost block mt-12" onclick="officerSignOut()">'+ICON.logout+' Sign out</button>' : "")+
        '<p class="muted mt-16" style="font-size:11.5px;line-height:1.6;margin-bottom:0">Clears progress, submitted forms and preferences stored on this device.</p>'+
      '</div>'+
    '</div>'+
  '</div>'+
  '<div class="src-note"><span>'+ICON.info+'</span><span>This is a concept prototype. Settings are stored only in this browser and no data leaves your device, '+
    'other than medicine lookups sent to the public RxNorm and openFDA services.</span></div>';
}

function setTheme(v){ Store.s.theme = v; Store.save(); applyTheme(); Router.render(); }
function setLang(v){
  Store.s.lang = v; Store.save();
  Shell.role = null;   // rebuild chrome with new labels
  Router.render();
  UI.toast(v === "en" ? "Language set to English" : (v === "si" ? "භාෂාව සිංහල ලෙස සකසා ඇත" : "மொழி தமிழாக அமைக்கப்பட்டது"));
}
function togglePref(key){
  Store.s.prefs[key] = !Store.s.prefs[key];
  Store.save();
  Router.render();
}
function privacyInfo(){
  UI.modal('<h3>Data and privacy</h3>'+
    '<p>In this prototype all athlete data, quiz progress and submitted forms are stored only in your browser\'s local storage. Nothing is transmitted to a server.</p>'+
    '<p>The one exception is the medicine checker, which sends the text you search to two public services — <b>RxNorm</b> (U.S. National Library of Medicine) and <b>openFDA</b> — to identify the medicine and its active ingredients.</p>'+
    '<p>A production deployment handling real athlete and medical data would require a formal privacy assessment, secure hosting, encryption in transit and at rest, defined retention periods, and compliance with the International Standard for the Protection of Privacy and Personal Information.</p>'+
    '<button class="btn ghost block" onclick="UI.closeModal()">Close</button>');
}
function resetPrototype(){
  UI.modal('<h3>Reset prototype data?</h3>'+
    '<p>This clears quiz scores, reading progress, recent searches, submitted forms and preferences, returning the prototype to its starting state.</p>'+
    '<div class="row" style="gap:10px;justify-content:flex-end">'+
      '<button class="btn ghost" onclick="UI.closeModal()">Cancel</button>'+
      '<button class="btn danger" onclick="doReset()">Reset everything</button></div>');
}
function doReset(){
  Store.reset();
  applyTheme();
  UI.closeModal();
  Shell.role = null;
  Wiz = null;
  go("");
  UI.toast("Prototype data reset");
}
