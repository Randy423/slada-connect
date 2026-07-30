/* ==========================================================================
   SLADA Connect — Athlete Portal
   ========================================================================== */
var Athlete = {};

/* ---------- helpers ---------- */
function medById(id){ for(var i=0;i<MEDS.length;i++){ if(MEDS[i].id===id) return MEDS[i]; } return null; }
function artById(id){ for(var i=0;i<ARTICLES.length;i++){ if(ARTICLES[i].id===id) return ARTICLES[i]; } return null; }
function resById(id){ for(var i=0;i<RESOURCES.length;i++){ if(RESOURCES[i].id===id) return RESOURCES[i]; } return null; }

function recentViewRows(limit){
  var rows = [];
  (Store.s.viewedOther||[]).forEach(function(v){
    var st = STATUS[v.status] || STATUS.unclassified;
    var path = v.kind === "ing" ? ("athlete/ing/"+v.key) : ("athlete/rmed/"+v.key);
    if(v.kind !== "ing") RNAME[v.key] = v.name;
    rows.push('<button class="listrow" onclick="go(\''+path+'\')">'+
      '<span class="lr-ic '+st.bg+'">'+st.emoji+'</span>'+
      '<span class="grow"><span class="lr-t truncate" style="display:block">'+esc(v.name)+'</span>'+
      '<span class="lr-s" style="display:block">'+(v.kind==="ing"?"Active ingredient":"Medicine database")+'</span>'+
      '<span class="lr-status '+st.tint+'">'+esc(st.label)+'</span></span>'+
      '<span class="badge '+BADGE_TONE[v.status]+'">'+esc(st.label)+'</span>'+
    '</button>');
  });
  Store.s.viewedLocal.forEach(function(id){ var m = medById(id); if(m) rows.push(medRow(m)); });
  if(!rows.length) return '<div class="empty" style="padding:34px 20px"><p>Nothing checked yet. Use the search to look up a medicine.</p></div>';
  return rows.slice(0, limit).join("");
}

/* ==========================================================================
   Sign in / create account
   ========================================================================== */
Athlete.signin = function(){
  return '<div class="login-wrap"><div class="login">'+
    '<div class="lg-mark">'+ICON.logo+'</div>'+
    '<h2>Athlete sign in</h2>'+
    '<p class="lg-s">Access your clean sport dashboard, medication checks and learning progress.</p>'+
    '<div class="demo-note"><b>Prototype access.</b> No real authentication is implemented. '+
      'Use any values, or press Sign in to continue as <b>'+esc(Store.s.athleteName)+'</b>.</div>'+
    '<div class="field"><label class="label">EMAIL OR ATHLETE ID</label>'+
      '<input class="input" id="asEmail" placeholder="you@example.lk" autocomplete="off" /></div>'+
    '<div class="field"><label class="label">PASSWORD</label>'+
      '<input class="input" id="asPass" type="password" placeholder="••••••••" autocomplete="off" /></div>'+
    '<button class="btn lg block mt-16" onclick="athleteSignIn()">Sign in</button>'+
    '<div class="row mt-20" style="gap:12px;align-items:center">'+
      '<div style="flex:1;height:1px;background:var(--line)"></div>'+
      '<span class="muted" style="font-size:12px">or</span>'+
      '<div style="flex:1;height:1px;background:var(--line)"></div>'+
    '</div>'+
    '<button class="btn ghost block mt-20" onclick="go(\'athlete/register\')">'+ICON.plus+' Create an account</button>'+
    '<button class="btn ghost block mt-12" onclick="athleteGuest()">Explore as a guest</button>'+
    '<button class="btn ghost block mt-12" onclick="go(\'\')">Back to home</button>'+
    '<p class="muted center mt-20" style="font-size:11.5px;line-height:1.6">This is a concept prototype. Do not enter real credentials.</p>'+
  '</div></div>';
};

function athleteSignIn(){
  var e = ($("#asEmail") && $("#asEmail").value.trim()) || "";
  Store.s.athleteAuth = true;
  Store.s.athleteGuest = false;
  if(e && e.indexOf("@") !== -1) Store.s.athleteEmail = e;
  Store.save();
  Shell.role = null;
  UI.toast("Signed in — prototype session");
  go("athlete");
}
function athleteGuest(){
  Store.s.athleteAuth = true;
  Store.s.athleteGuest = true;
  Store.save();
  Shell.role = null;
  UI.toast("Browsing as a guest — set your sport to see sport-specific guidance");
  go("athlete");
}
function athleteSignOut(){
  Store.s.athleteAuth = false;
  Store.s.athleteGuest = false;
  Store.save();
  Shell.role = null;
  go("athlete/signin");
}

/* ---------- registration ---------- */
var Reg = null;
function newReg(){
  return {step:1, d:{name:"", email:"", sport:"", event:"", fed:"", dob:"", gender:"", nat:"Sri Lankan", nic:"", pool:false}};
}

Athlete.register = function(){
  if(!Reg) Reg = newReg();
  var d = Reg.d, step = Reg.step;
  var pct = Math.round((step-1)/2*100);

  function rf(label, key, opts){
    opts = opts || {};
    var val = d[key] == null ? "" : d[key];
    if(opts.type === "select"){
      return '<div class="field"><label class="label">'+esc(label)+'</label>'+
        '<select class="select" onchange="regSet(\''+key+'\',this.value)">'+
          '<option value=""'+(!val?" selected":"")+'>'+esc(opts.placeholder||"Select")+'</option>'+
          opts.options.map(function(o){ return '<option'+(val===o?" selected":"")+'>'+esc(o)+'</option>'; }).join("")+
        '</select></div>';
    }
    return '<div class="field"><label class="label">'+esc(label)+'</label>'+
      '<input class="input" type="'+(opts.type||"text")+'" placeholder="'+esc(opts.placeholder||"")+'" '+
      'value="'+esc(val)+'" oninput="regSet(\''+key+'\',this.value)" /></div>';
  }

  var body;
  if(step === 1){
    body = '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">Your details</h4>'+
      '<p class="muted mb-24" style="font-size:14px">Used on your completion certificate and doping control records.</p>'+
      rf("FULL NAME","name",{placeholder:"As it appears on your passport or NIC"})+
      rf("EMAIL","email",{type:"email",placeholder:"you@example.lk"})+
      '<div class="grid-2">'+
        rf("DATE OF BIRTH","dob",{type:"date"})+
        rf("GENDER","gender",{type:"select",options:["Male","Female","Other"]})+
      '</div>'+
      '<div class="grid-2">'+
        rf("NATIONALITY","nat",{placeholder:"e.g. Sri Lankan"})+
        rf("PASSPORT OR NATIONAL ID","nic",{placeholder:"Identification number"})+
      '</div>';
  } else if(step === 2){
    var catKey = SPORT_CATEGORY[d.sport];
    var emph = catKey && SPORT_EMPHASIS[catKey];
    var isP1 = d.sport && P1_SPORTS.indexOf(d.sport) !== -1;
    body = '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">Your sport</h4>'+
      '<p class="muted mb-24" style="font-size:14px">Your sport determines which substances are restricted for you. '+
      'One class on the Prohibited List — beta-blockers — applies only to certain sports.</p>'+
      rf("SPORT","sport",{type:"select",placeholder:"Select your sport",options:SPORTS})+
      rf("EVENT OR DISCIPLINE","event",{placeholder:"e.g. 400m, 50m rifle, freestyle"})+
      rf("FEDERATION","fed",{type:"select",placeholder:"Select federation",options:FEDERATIONS})+
      (d.sport
        ? '<div class="'+(isP1?"info-card warn":"info-card good")+' mt-16">'+
            '<h4>'+(isP1?"⚠️ Sport-specific restriction":"✓ No sport-specific restriction")+'</h4>'+
            '<p>'+(isP1
              ? esc(d.sport)+' is on the P1 list, so beta-blockers are prohibited for you in competition'+
                (P1_ALSO_OUT_OF_COMP.indexOf(d.sport)!==-1 ? ' and out of competition' : '')+
                '. Most athletes are not affected by this class — you are.'
              : 'Beta-blockers are restricted only in precision sports such as archery, shooting and golf. '+esc(d.sport)+
                ' is not one of them, so no class of the Prohibited List applies differently to you.')+'</p>'+
          '</div>'+
          (emph ? '<div class="info-card mt-12"><h4>'+esc(emph.label)+'</h4><p>'+esc(emph.note)+'</p></div>' : "")
        : "")+
      '<label class="checkline mt-16'+(d.pool?" on":"")+'" onclick="regTogglePool(this)">'+
        '<input type="checkbox" '+(d.pool?"checked":"")+' />'+
        '<span><span class="cl-t">I am in a Registered Testing Pool</span>'+
        '<span class="cl-s">Requires quarterly whereabouts filing</span></span></label>';
  } else {
    var vd = d.sport ? sportVerdict({sportDependent:true}, d.sport) : null;
    body = '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">Confirm your account</h4>'+
      '<p class="muted mb-24" style="font-size:14px">Check these details before creating your account.</p>'+
      '<dl class="kv">'+
        '<dt>Name</dt><dd>'+(d.name?esc(d.name):'<span class="muted">Not set</span>')+'</dd>'+
        '<dt>Email</dt><dd>'+(d.email?esc(d.email):'<span class="muted">Not set</span>')+'</dd>'+
        '<dt>Sport</dt><dd>'+(d.sport?esc(d.sport):'<span class="muted">Not set</span>')+(d.event?" — "+esc(d.event):"")+'</dd>'+
        '<dt>Federation</dt><dd>'+(d.fed?esc(d.fed):'<span class="muted">Not set</span>')+'</dd>'+
        '<dt>Date of birth</dt><dd>'+(d.dob?esc(fmtDate(d.dob)):'<span class="muted">Not set</span>')+'</dd>'+
        '<dt>Gender</dt><dd>'+(d.gender?esc(d.gender):'<span class="muted">Not set</span>')+'</dd>'+
        '<dt>Nationality</dt><dd>'+(d.nat?esc(d.nat):'<span class="muted">Not set</span>')+'</dd>'+
        '<dt>Testing pool</dt><dd>'+(d.pool?"Registered Testing Pool":"Not in a testing pool")+'</dd>'+
      '</dl>'+
      (vd ? '<div class="info-card mt-16"><h4>How your sport affects you</h4><p><b>'+esc(vd.title)+'.</b> '+esc(vd.body)+'</p></div>' : "")+
      '<div class="src-note"><span>'+ICON.info+'</span><span>Prototype account. Details are stored only in this browser and no data leaves your device.</span></div>';
  }

  var labels = ["Your details","Your sport","Confirm"];
  var stepper = labels.map(function(l,i){
    var n = i+1, cls = n === step ? "step on" : (n < step ? "step done" : "step");
    return '<button class="'+cls+'" onclick="regGo('+n+')"><span class="st-n">'+(n<step?"✓":n)+'</span>'+esc(l)+'</button>';
  }).join("");

  return '<div class="login-wrap" style="align-items:flex-start;padding-top:40px">'+
    '<div class="login" style="width:min(560px,100%)">'+
      '<div class="row-b mb-16"><div><h2 style="font-size:21px">Create your account</h2>'+
        '<p class="muted" style="font-size:13.5px;margin-top:5px">Step '+step+' of 3</p></div>'+
        '<button class="iconbtn" onclick="go(\'athlete/signin\')" aria-label="Close">'+ICON.x+'</button></div>'+
      '<div class="stepper">'+stepper+'</div>'+
      '<div class="wizard-bar"><i style="width:'+pct+'%"></i></div>'+
      body+
      '<div class="wiz-foot">'+
        (step > 1 ? '<button class="btn ghost" onclick="regPrev()">'+ICON.back+' Back</button>' : '<button class="btn ghost" onclick="go(\'athlete/signin\')">Cancel</button>')+
        (step < 3
          ? '<button class="btn" onclick="regNext()">Continue '+ICON.arrow+'</button>'
          : '<button class="btn green" onclick="regCreate()">Create account</button>')+
      '</div>'+
    '</div></div>';
};

function regSet(k,v){
  Reg.d[k] = v;
  if(k === "sport"){
    if(SPORT_FED[v]) Reg.d.fed = SPORT_FED[v];
    Router.render();   // sport drives the compatibility notice on this step
  }
}
function regTogglePool(el){
  Reg.d.pool = !Reg.d.pool;
  el.classList.toggle("on", Reg.d.pool);
  var cb = el.querySelector("input"); if(cb) cb.checked = Reg.d.pool;
}
function regValidate(step){
  var d = Reg.d;
  if(step === 1){
    if(!d.name.trim()){ UI.toast("Enter your full name"); return false; }
    if(!d.email.trim() || d.email.indexOf("@") === -1){ UI.toast("Enter a valid email address"); return false; }
  }
  if(step === 2){
    if(!d.sport){ UI.toast("Select your sport — it determines which substances are restricted for you"); return false; }
  }
  return true;
}
function regNext(){ if(regValidate(Reg.step) && Reg.step < 3){ Reg.step++; Router.render(); } }
function regPrev(){ if(Reg.step > 1){ Reg.step--; Router.render(); } }
function regGo(n){
  if(n > Reg.step){ for(var s=Reg.step; s<n; s++){ if(!regValidate(s)){ Reg.step = s; Router.render(); return; } } }
  Reg.step = n; Router.render();
}
function regCreate(){
  if(!regValidate(1) ){ Reg.step = 1; Router.render(); return; }
  if(!regValidate(2) ){ Reg.step = 2; Router.render(); return; }
  var d = Reg.d;
  var s = Store.s;
  s.athleteName = d.name;
  s.athleteEmail = d.email;
  s.sport = d.sport;
  s.event = d.event;
  s.athleteFed = d.fed || SPORT_FED[d.sport] || "";
  s.athleteDob = d.dob;
  s.athleteGender = d.gender;
  s.athleteNat = d.nat;
  s.athleteId = "ATH-" + (2000 + Math.floor(Math.random()*7999));
  s.athletePool = d.pool;
  s.athleteAuth = true;
  s.athleteGuest = false;
  // a brand new account starts with clean progress
  s.readArticles = []; s.quizBest = null; s.quizTaken = 0;
  s.viewedLocal = []; s.viewedOther = []; s.recent = [];
  Store.save();
  Reg = null;
  Shell.role = null;
  go("athlete");
  UI.toast("Account created — welcome, " + s.athleteName.split(" ")[0]);
}

/* ==========================================================================
   Dashboard
   ========================================================================== */
Athlete.dashboard = function(){
  var s = Store.s;
  var first = s.athleteName.split(" ")[0];
  var hour = new Date().getHours();
  var greet = hour < 12 ? "Good morning" : (hour < 18 ? "Good afternoon" : "Good evening");
  var read = s.readArticles.length, total = ARTICLES.length;
  var learnPct = Math.round(read/total*100);
  var quizPct = s.quizBest === null ? 0 : Math.round(s.quizBest/QUIZ.length*100);
  var overall = Math.round((learnPct + quizPct)/2);

  var quick = [
    {ic:"🔍", t:"Can I Take This?", s:"Check any medicine", to:"athlete/check", bg:"bg-blue",   tint:"tint-blue"},
    {ic:"📚", t:"Learn",            s:"Nine clean sport guides", to:"athlete/learn", bg:"bg-green", tint:"tint-green"},
    {ic:"🧠", t:"Quiz",             s:"10 questions", to:"athlete/quiz", bg:"bg-violet", tint:"tint-violet"},
    {ic:"📄", t:"Prohibited List",  s:"How classes work", to:"athlete/prohibited", bg:"bg-red", tint:"tint-red"},
    {ic:"🏥", t:"TUE",              s:"Therapeutic Use Exemptions", to:"athlete/tue", bg:"bg-amber", tint:"tint-amber"},
    {ic:"📞", t:"Contact SLADA",    s:"Official resources", to:"athlete/resources", bg:"bg-blue", tint:"tint-blue"}
  ].map(function(q){
    return '<button class="quick" onclick="go(\''+q.to+'\')">'+
      '<span class="q-ic '+q.bg+' '+q.tint+'">'+q.ic+'</span>'+
      '<span class="q-t">'+esc(q.t)+'</span>'+
      '<span class="q-s">'+esc(q.s)+'</span>'+
    '</button>';
  }).join("");

  var updates = WADA_UPDATES.map(function(u){
    return '<div class="listrow"><span class="lr-ic bg-blue tint-blue">📄</span>'+
      '<span class="grow"><span class="lr-t" style="display:block">'+esc(u.t)+'</span>'+
      '<span class="lr-s" style="display:block">'+esc(u.s)+'</span></span>'+
      '<span class="lr-m">'+esc(u.m)+'</span></div>';
  }).join("");

  return ''+
  '<div class="row-b mb-24 wrap">'+
    '<div>'+
      '<div style="font-size:13.5px;font-weight:650;color:var(--blue-600)">'+esc(greet)+', '+esc(first)+'</div>'+
      '<h1 style="font-size:clamp(24px,3.6vw,32px);font-weight:820;margin-top:4px">Welcome back</h1>'+
      '<p class="muted mt-8" style="font-size:14.5px">Your clean sport dashboard — everything you need before you compete.</p>'+
    '</div>'+
    '<button class="btn" onclick="go(\'athlete/check\')">'+ICON.search+' Check a medicine</button>'+
  '</div>'+

  '<div class="stat-grid stagger mb-24">'+
    statCard({icon:"📚", bg:"bg-green", tint:"tint-green", n:read+"/"+total, label:"Guides completed"})+
    statCard({icon:"🧠", bg:"bg-violet",tint:"tint-violet",n:(s.quizBest===null?"—":s.quizBest+"/10"), label:"Best quiz score"})+
    statCard({icon:"🔍", bg:"bg-blue",  tint:"tint-blue",  n:(s.viewedLocal.length + (s.viewedOther||[]).length), label:"Medicines checked"})+
    statCard({icon:"🏅", bg:"bg-amber", tint:"tint-amber", n:overall+"%", label:"Overall progress"})+
  '</div>'+

  '<div class="dash-grid">'+
    '<div>'+
      '<div class="card pad mb-16">'+
        '<div class="row-b mb-16"><h4 style="font-size:15.5px;font-weight:730">Your progress</h4>'+
        '<span class="badge blue">'+overall+'% complete</span></div>'+
        '<div class="row" style="gap:24px;align-items:center;flex-wrap:wrap">'+
          Chart.ring(overall/100, 116, 11, "var(--blue-600)",
            '<div><div style="font-size:25px;font-weight:800;letter-spacing:-.03em">'+overall+'%</div>'+
            '<div style="font-size:11px" class="muted">overall</div></div>')+
          '<div class="grow" style="min-width:200px">'+
            '<div class="mb-16">'+
              '<div class="row-b" style="font-size:13px;margin-bottom:7px"><b>Learning</b><span class="muted">'+read+' of '+total+'</span></div>'+
              '<div class="progress"><i style="width:'+learnPct+'%"></i></div>'+
            '</div>'+
            '<div>'+
              '<div class="row-b" style="font-size:13px;margin-bottom:7px"><b>Quiz</b><span class="muted">'+(s.quizBest===null?"Not attempted":s.quizBest+" of 10")+'</span></div>'+
              '<div class="progress green"><i style="width:'+quizPct+'%"></i></div>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'+

      '<div class="section-h">Quick access</div>'+
      '<div class="quick-grid stagger">'+quick+'</div>'+

      '<div class="section-h">Recently checked</div>'+
      '<div class="card" style="padding:6px 18px">'+recentViewRows(4)+'</div>'+
    '</div>'+

    '<div>'+
      '<div class="card pad mb-16" style="background:linear-gradient(150deg,var(--blue-50),var(--bg));border-color:var(--blue-100)">'+
        '<div class="row" style="gap:10px;margin-bottom:12px"><span style="font-size:20px">🔔</span>'+
        '<h4 style="font-size:15px;font-weight:730">Today\'s reminder</h4></div>'+
        '<p style="font-size:14px;line-height:1.62;color:var(--ink-2);margin:0">'+
          'Competition season is approaching. Re-check every medicine you take regularly against the current Prohibited List — it changed on 1 January.</p>'+
        '<button class="btn soft sm mt-16" onclick="go(\'athlete/prohibited\')">View the list '+ICON.arrow+'</button>'+
      '</div>'+

      '<div class="card pad mb-16">'+
        '<div class="row-b mb-12"><h4 style="font-size:15px;font-weight:730">Latest WADA updates</h4></div>'+
        '<div style="margin:0 -4px">'+updates+'</div>'+
      '</div>'+

      '<div class="card pad">'+
        '<div class="row-b mb-12"><h4 style="font-size:15px;font-weight:730">Recent activity</h4>'+
        '<button class="btn ghost sm" onclick="go(\'athlete/notifications\')">All</button></div>'+
        '<div style="margin:0 -4px">'+
          ACTIVITY.slice(0,4).map(function(a){
            return '<div class="listrow"><span class="lr-ic '+a.bg+'">'+a.icon+'</span>'+
              '<span class="grow"><span class="lr-t" style="display:block">'+esc(a.t)+'</span>'+
              '<span class="lr-s truncate" style="display:block">'+esc(a.s)+'</span></span>'+
              '<span class="lr-m">'+esc(a.m)+'</span></div>';
          }).join("")+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>'+
  disclaimerBlock();
};

/* ==========================================================================
   Can I Take This? — search
   ========================================================================== */
var searchQuery = "", searchResults = null, suggList = null, suggTimer = null, suggSeq = 0;

function localMatches(q){
  var ql = q.toLowerCase();
  return MEDS.filter(function(m){
    return (m.brand+" "+m.ingredient+" "+(m.also||"")+" "+m.cls).toLowerCase().indexOf(ql) !== -1;
  });
}

Athlete.check = function(){
  return ''+
  '<div class="page-h">'+
    '<h1>Can I Take This?</h1>'+
    '<p>Check any medicine or active ingredient before you take it. We explain <b>why</b> a substance is treated the way it is — not just whether it is allowed.</p>'+
  '</div>'+

  '<div class="sugg-wrap mb-16">'+
    '<div class="searchbar-lg" id="sbar">'+
      '<span style="color:var(--faint);flex:0 0 auto">'+ICON.search+'</span>'+
      '<input id="sinput" type="search" autocomplete="off" autocorrect="off" spellcheck="false" '+
        'placeholder="Search medicine or active ingredient" value="'+esc(searchQuery)+'" />'+
      '<span id="sspin" class="hide"><span class="spin"></span></span>'+
      '<button class="btn" onclick="doSearch()">Search</button>'+
    '</div>'+
    '<div id="suggBox"></div>'+
  '</div>'+

  '<div id="sbody">'+ Athlete.searchBody() +'</div>'+
  disclaimerBlock();
};

Athlete.searchBody = function(){
  if(searchResults === null){
    var chips = ["Panadol","Ibuprofen","Cetirizine","Vitamin C","Sudafed"].map(function(n){
      return '<button class="chip" onclick="quickSearch(\''+n+'\')">'+n+'</button>';
    }).join("");
    var recents = Store.s.recent.length
      ? Store.s.recent.map(function(n,i){
          return '<button class="listrow" onclick="quickSearch(\''+esc(n)+'\')">'+
            '<span class="lr-ic bg-slate" style="color:var(--muted)">'+
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg></span>'+
            '<span class="grow"><span class="lr-t">'+esc(n)+'</span></span>'+
            '<span class="lr-m" onclick="event.stopPropagation();clearRecent('+i+')" style="cursor:pointer">'+ICON.x+'</span>'+
          '</button>';
        }).join("")
      : '<div class="empty" style="padding:30px"><p>No recent searches yet.</p></div>';

    return ''+
      '<div class="src-note" style="margin-top:0">'+
        '<span>💡</span><span>Start typing any brand or active ingredient. Suggestions come from a live medicine database, so you are not limited to the examples below.</span>'+
      '</div>'+
      '<div class="section-h">Example searches</div>'+
      '<div class="row wrap" style="gap:9px">'+chips+'</div>'+
      '<div class="section-h">Recent searches</div>'+
      '<div class="card" style="padding:6px 18px">'+recents+'</div>'+
      '<div class="section-h">Detailed in-app guides</div>'+
      '<div class="card" style="padding:6px 18px">'+MEDS.slice(0,5).map(medRow).join("")+'</div>'+
      Athlete.srcNote();
  }

  var R = searchResults;
  R.ings = R.ings || [];
  var total = R.local.length + R.ings.length + R.remote.length;
  var out = "";

  if(R.err){
    out += '<div class="info-card warn mb-16"><h4>⚠️ Could not reach the medicine database</h4>'+
      '<p>Showing in-app guides and known ingredients only. Check your connection and try again, or verify directly on Global DRO.</p></div>';
  }

  if(!R.loading && total === 0 && !R.err){
    return '<div class="empty">'+
      '<div class="e-ic">🔎</div><h4>No match found</h4>'+
      '<p>Nothing matched “'+esc(searchQuery)+'”. Check the spelling, or try the active ingredient instead of the brand name.</p>'+
      '<button class="btn ghost mt-20" onclick="openResource(\'gdro\')">Check on Global DRO</button>'+
    '</div>';
  }

  if(R.local.length){
    out += '<div class="section-h">In-app guides</div><div class="card" style="padding:6px 18px">'+R.local.map(medRow).join("")+'</div>';
  }

  if(R.ings.length){
    out += '<div class="section-h">Active ingredients</div><div class="card" style="padding:6px 18px">'+
      R.ings.map(function(g){
        var st = STATUS[g.status];
        return '<button class="listrow" onclick="go(\'athlete/ing/'+g.idx+'\')">'+
          '<span class="lr-ic '+st.bg+'">'+st.emoji+'</span>'+
          '<span class="grow"><span class="lr-t" style="display:block">'+esc(g.name)+'</span>'+
          '<span class="lr-s" style="display:block">'+esc(g.cat)+'</span>'+
          '<span class="lr-status '+st.tint+'">'+esc(st.label)+'</span></span>'+
          '<span class="badge '+BADGE_TONE[g.status]+'">'+esc(st.label)+'</span>'+
        '</button>';
      }).join("")+'</div>';
  }

  if(R.loading){
    out += '<div class="section-h">Medicine database</div>'+
      '<div class="loading-row"><span class="spin"></span> Searching RxNorm…</div>'+
      '<div class="skel" style="height:66px;margin-bottom:10px"></div><div class="skel" style="height:66px"></div>';
  } else if(R.remote.length){
    out += '<div class="section-h">Medicine database</div><div class="card" style="padding:6px 18px">'+
      R.remote.map(function(r,i){
        return '<button class="listrow" onclick="openRemoteIdx('+i+')">'+
          '<span class="lr-ic bg-slate">💊</span>'+
          '<span class="grow"><span class="lr-t truncate" style="display:block">'+esc(r.name)+'</span>'+
          '<span class="lr-s" style="display:block">Tap to resolve active ingredients</span></span>'+
          '<span style="color:var(--faint);flex:0 0 auto">'+ICON.chev+'</span>'+
        '</button>';
      }).join("")+'</div>';
  }

  return out + Athlete.srcNote();
};

Athlete.srcNote = function(){
  return '<div class="src-note">'+
    '<span>🔗</span><span>Medicine names and active ingredients come from <b>RxNorm</b> (U.S. National Library of Medicine) and <b>openFDA</b>. '+
    'Anti-doping status is an educational mapping applied by this platform — neither database publishes one. Always confirm on Global DRO.</span>'+
  '</div>';
};

Athlete.afterCheck = function(){
  var input = $("#sinput"), bar = $("#sbar");
  if(!input) return;
  input.addEventListener("input", function(){
    if(input.value.trim() === ""){ searchResults = null; refreshSearch(); }
    onType(input.value);
  });
  input.addEventListener("keydown", function(e){
    if(e.key === "Enter"){ e.preventDefault(); doSearch(); input.blur(); }
    if(e.key === "Escape"){ suggList = null; renderSuggs(); }
  });
  var body = $("#sbody");
  if(body) body.addEventListener("mousedown", function(){ if(suggList){ suggList = null; renderSuggs(); } });
};

function renderSuggs(){
  var box = $("#suggBox");
  if(!box) return;
  if(!suggList || !suggList.length){ box.innerHTML = ""; return; }
  var ICO = {
    local:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.4A1.4 1.4 0 0 1 5.4 4H17a3 3 0 0 1 3 3v13H6.4A2.4 2.4 0 0 1 4 17.6V5.4Z"/></svg>',
    ing:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 15.5 15.5 8.5"/><rect x="2.6" y="8.6" width="18.8" height="6.8" rx="3.4" transform="rotate(-45 12 12)"/></svg>',
    remote:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/></svg>'
  };
  var TAG = {local:"In app", ing:"Ingredient", remote:"Database"};
  var TAGC = {local:"badge green", ing:"badge blue", remote:"badge slate"};

  box.innerHTML = '<div class="suggs">' + suggList.map(function(s,i){
    var k = s.kind || "remote";
    return '<button class="sugg" onclick="chooseSugg('+i+')">'+
      '<span class="sg-ic">'+ICO[k]+'</span>'+
      '<span class="sg-n">'+esc(s.name)+'</span>'+
      (k === "ing" && s.status ? '<span style="flex:0 0 auto">'+STATUS[s.status].emoji+'</span>' : "")+
      '<span class="'+TAGC[k]+'" style="flex:0 0 auto">'+TAG[k]+'</span>'+
    '</button>';
  }).join("") + '</div>';
}

function onType(v){
  searchQuery = v;
  clearTimeout(suggTimer);
  var q = v.trim();
  if(q.length < 2){ suggList = null; renderSuggs(); return; }

  var loc = localMatches(q).slice(0,3).map(function(m){
    return {name:m.brand + " — " + m.ingredient, brand:m.brand, kind:"local", id:m.id};
  });
  var ings = ingredientMatches(q).map(function(i){
    return {name:INGREDIENTS[i].name, kind:"ing", idx:i, status:INGREDIENTS[i].rule.status};
  });
  var base = loc.concat(ings.filter(function(g){
    return !loc.some(function(l){ return l.name.toLowerCase().indexOf(g.name.toLowerCase()) !== -1; });
  }));
  suggList = base.slice();
  renderSuggs();

  var seq = ++suggSeq;
  suggTimer = setTimeout(function(){
    suggest(q).then(function(rem){
      if(seq !== suggSeq) return;
      var seen = {};
      base.forEach(function(l){ seen[(l.brand||l.name).toLowerCase()] = 1; });
      var room = Math.max(2, 8 - base.length);
      suggList = base.concat(rem.filter(function(r){ return !seen[r.name.toLowerCase()]; }).slice(0, room));
      renderSuggs();
    }).catch(function(){ /* offline: keep local suggestions */ });
  }, 300);
}

function chooseSugg(i){
  var s = suggList && suggList[i];
  if(!s) return;
  suggList = null; renderSuggs();
  var label = s.kind === "local" ? s.brand : s.name;
  var input = $("#sinput");
  if(input){ input.value = label; input.blur(); }
  searchQuery = label;
  rememberSearch(label);
  if(s.kind === "local") go("athlete/med/" + s.id);
  else if(s.kind === "ing") go("athlete/ing/" + s.idx);
  else openRemote(s.rxcui, s.name);
}

function rememberSearch(q){
  if(!q) return;
  Store.s.recent = [q].concat(Store.s.recent.filter(function(r){ return r.toLowerCase() !== q.toLowerCase(); })).slice(0,6);
  Store.save();
}
function clearRecent(i){ Store.s.recent.splice(i,1); Store.save(); refreshSearch(); }
function refreshSearch(){ var b = $("#sbody"); if(b) b.innerHTML = Athlete.searchBody(); }
function setSpin(on){ var s = $("#sspin"); if(s) s.classList.toggle("hide", !on); }

function doSearch(){
  var input = $("#sinput");
  var q = (input ? input.value : searchQuery).trim();
  searchQuery = q;
  if(!q){ UI.toast("Enter a medicine or ingredient to search"); return; }

  clearTimeout(suggTimer);
  suggList = null; renderSuggs();
  if(input) input.blur();
  rememberSearch(q);

  var local = localMatches(q), ql = q.toLowerCase();
  var ings = ingredientMatches(q).map(function(i){
    return {idx:i, name:INGREDIENTS[i].name, status:INGREDIENTS[i].rule.status, cat:INGREDIENTS[i].rule.cat};
  });

  var exact = local.filter(function(m){ return m.brand.toLowerCase()===ql || m.ingredient.toLowerCase()===ql; });
  if(exact.length === 1){
    searchResults = {local:local, ings:ings, remote:[], loading:false, err:null};
    refreshSearch();
    setTimeout(function(){ go("athlete/med/" + exact[0].id); }, 180);
    return;
  }
  var exactIng = -1;
  for(var i=0;i<INGREDIENTS.length;i++){ if(INGREDIENTS[i].key === ql){ exactIng = i; break; } }
  if(exactIng !== -1 && !local.length){
    searchResults = {local:local, ings:ings, remote:[], loading:false, err:null};
    refreshSearch();
    setTimeout(function(){ go("athlete/ing/" + exactIng); }, 180);
    return;
  }

  searchResults = {local:local, ings:ings, remote:[], loading:true, err:null};
  refreshSearch(); setSpin(true);

  var seq = ++suggSeq;
  suggest(q).then(function(rem){
    if(seq !== suggSeq) return;
    var seen = {};
    local.forEach(function(m){ seen[m.brand.toLowerCase()]=1; seen[m.ingredient.toLowerCase()]=1; });
    ings.forEach(function(g){ seen[g.name.toLowerCase()]=1; });
    searchResults = {local:local, ings:ings, remote:rem.filter(function(r){ return !seen[r.name.toLowerCase()]; }), loading:false, err:null};
    setSpin(false); refreshSearch();
  }).catch(function(){
    if(seq !== suggSeq) return;
    searchResults = {local:local, ings:ings, remote:[], loading:false, err:"network"};
    setSpin(false); refreshSearch();
  });
}

function quickSearch(name){
  searchQuery = name;
  var input = $("#sinput");
  if(input) input.value = name;
  doSearch();
}
function openRemoteIdx(i){
  var r = searchResults && searchResults.remote[i];
  if(r) openRemote(r.rxcui, r.name);
}
function openRemote(rxcui, name){ RNAME[rxcui] = name; go("athlete/rmed/" + rxcui); }

/* ---------- sport compatibility ----------
   Shown on every medication result. Answers the question an athlete
   actually has — "does this apply to ME?" — rather than leaving them to
   infer it from a substance class. */
var viewSport = null;
function currentSport(){ return viewSport || Store.s.sport || ""; }

function sportCard(rule, status){
  var sport = currentSport();
  var previewing = !!viewSport && viewSport !== Store.s.sport;

  var picker = '<div class="row wrap mt-16" style="gap:9px;align-items:center">'+
      '<span class="label" style="margin:0">CHECK ANOTHER SPORT</span>'+
      '<select class="select" style="width:auto;min-width:150px" onchange="setViewSport(this.value)">'+
        SPORTS.map(function(s){ return '<option'+(s===sport?" selected":"")+'>'+esc(s)+'</option>'; }).join("")+
      '</select>'+
      (previewing ? '<button class="btn ghost sm" onclick="setViewSport(\'\')">Back to my sport</button>' : "")+
    '</div>';

  if(!sport){
    return '<div class="info-card">'+
      '<h4>🏅 Is this compatible with your sport?</h4>'+
      '<p>No sport is set on your profile. Your sport matters because one class of the Prohibited List — beta-blockers — is restricted only in certain sports, and Global DRO asks for your sport for the same reason.</p>'+
      '<div class="row wrap mt-16" style="gap:9px;align-items:center">'+
        '<select class="select" style="width:auto;min-width:170px" onchange="setViewSport(this.value)">'+
          '<option value="">Select your sport</option>'+
          SPORTS.map(function(s){ return '<option>'+esc(s)+'</option>'; }).join("")+
        '</select>'+
        '<button class="btn ghost sm" onclick="go(\'athlete/profile\')">Add it to my profile</button>'+
      '</div>'+
    '</div>';
  }

  if(status === "unclassified"){
    return '<div class="info-card warn">'+
      '<h4>🏅 Your sport — '+esc(sport)+'</h4>'+
      '<p>No status is held here, so no sport-specific answer can be given either. Check this product on Global DRO and select <b>'+esc(sport)+'</b> as your sport — its results are country and sport specific.</p>'+
      picker+
    '</div>';
  }

  var v = sportVerdict(rule, sport);
  var tone = v.level === "restricted" ? "warn" : (v.level === "clear" ? "good" : "");
  var mark = v.level === "restricted" ? "⚠️" : (v.level === "clear" ? "✓" : "🏅");
  var catKey = SPORT_CATEGORY[sport];
  var emph = catKey && SPORT_EMPHASIS[catKey];

  return '<div class="info-card '+tone+'">'+
    '<h4>'+mark+' Your sport — '+esc(sport)+
      (previewing ? ' <span class="badge slate" style="margin-left:6px">preview</span>' : '')+'</h4>'+
    '<p><b>'+esc(v.title)+'.</b> '+esc(v.body)+'</p>'+
    (emph && v.level !== "clear"
      ? '<p style="font-size:13.5px;padding-top:11px;margin-top:11px;border-top:1px solid var(--line)">'+
        '<b>'+esc(emph.label)+'.</b> '+esc(emph.note)+'</p>'
      : "")+
    picker+
  '</div>';
}

function setViewSport(s){
  if(!s){ viewSport = null; }
  else if(!Store.s.sport){ Store.s.sport = s; Store.save(); viewSport = null; Shell.role = null; }
  else { viewSport = s; }
  Router.render();
}

/* ---------- shared result partials ---------- */
function officialResourcesBlock(unclassified){
  return '<div class="section-h">Official Resources</div>'+
    '<div class="card" style="padding:6px 18px">'+
      '<button class="listrow" onclick="openResource(\'gdro\')">'+
        '<span class="lr-ic bg-blue">🔎</span><span class="grow">'+
        '<span class="lr-t" style="display:block">View on Global DRO</span>'+
        '<span class="lr-s" style="display:block">'+(unclassified?"Required — status not held here":"Confirm for your country and sport")+'</span></span>'+
        '<span style="color:var(--faint)">'+ICON.chev+'</span></button>'+
      '<button class="listrow" onclick="openResource(\'wada\')">'+
        '<span class="lr-ic bg-green">🌍</span><span class="grow">'+
        '<span class="lr-t" style="display:block">Visit WADA</span>'+
        '<span class="lr-s" style="display:block">The current Prohibited List</span></span>'+
        '<span style="color:var(--faint)">'+ICON.chev+'</span></button>'+
      '<button class="listrow" onclick="openResource(\'slada\')">'+
        '<span class="lr-ic bg-amber">📞</span><span class="grow">'+
        '<span class="lr-t" style="display:block">Contact SLADA</span>'+
        '<span class="lr-s" style="display:block">Ask your national agency directly</span></span>'+
        '<span style="color:var(--faint)">'+ICON.chev+'</span></button>'+
    '</div>';
}

function openResource(id){
  var r = resById(id);
  if(!r) return;
  UI.modal(
    '<h3>'+r.icon+' '+esc(r.title)+'</h3>'+
    '<p>'+esc(r.about)+'</p>'+
    '<div class="src-note" style="margin-top:0"><span>'+ICON.info+'</span><span><b>Prototype note.</b> Outbound links are disabled in this concept build. '+
    'In production this would open <b>'+esc(r.url)+'</b> in a new tab.</span></div>'+
    '<button class="btn ghost block mt-16" onclick="UI.closeModal()">Close</button>'
  );
}

/* ---------- curated medication detail ---------- */
Athlete.med = function(id){
  var m = medById(id);
  if(!m) return notFoundBlock("Medicine",
    "No in-app guide exists for “"+id+"”. It may have been renamed since this link was shared. Search for it instead — the medicine database covers far more than the in-app guides.",
    "Search medicines", "athlete/check");
  var st = STATUS[m.status];

  Store.s.viewedLocal = [id].concat(Store.s.viewedLocal.filter(function(v){ return v!==id; })).slice(0,8);
  Store.save();

  var cardCls = m.status === "prohibited" ? "danger" : (m.status === "caution" ? "warn" : "");

  return backLink("Back to search","athlete/check")+
  '<div class="med-hero s-'+st.cls+'">'+
    '<h2>'+esc(m.brand)+'</h2>'+
    '<div class="mh-l">Active Ingredient</div>'+
    '<div class="mh-v">'+esc(m.ingredient)+'</div>'+
    '<div class="status-badge b-'+st.cls+'">'+st.emoji+' '+esc(st.label)+'</div>'+
  '</div>'+

  '<div class="why mb-16">'+
    '<h4>💡 Why this status?</h4><p>'+m.why+'</p>'+
  '</div>'+

  sportCard(null, m.status)+

  '<div class="info-card '+cardCls+'">'+
    '<h4>'+(m.status==="prohibited"?"⚠️ Important":"⚠️ Important Reminder")+'</h4><p>'+m.reminder+'</p>'+
  '</div>'+

  '<div class="info-card">'+
    '<h4>At a glance</h4>'+
    '<dl class="kv mt-12">'+m.detail.map(function(d){
      return '<dt>'+esc(d[0])+'</dt><dd>'+esc(d[1])+'</dd>';
    }).join("")+'</dl>'+
  '</div>'+

  '<div class="info-card"><h4>Good to know</h4><p>'+m.note+'</p></div>'+

  officialResourcesBlock(false)+
  disclaimerBlock();
};

/* ---------- ingredient detail (offline capable) ---------- */
Athlete.ing = function(idx){
  var it = INGREDIENTS[+idx];
  if(!it) return notFoundBlock("Ingredient",
    "That ingredient reference is not valid. Search for the ingredient by name instead.",
    "Search medicines", "athlete/check");
  var rule = it.rule, st = STATUS[rule.status];
  var lab = LABEL_CACHE[it.key];
  var cardCls = rule.status === "prohibited" ? "danger" : (rule.status === "caution" ? "warn" : "");

  var labelCard;
  if(lab === undefined){
    labelCard = '<div class="info-card"><h4>What it is used for</h4>'+
      '<div class="loading-row"><span class="spin"></span> Loading label information…</div></div>';
  } else if(lab === false){
    labelCard = '<div class="info-card"><h4>What it is used for</h4>'+
      '<p class="muted" style="font-size:13.5px">Label information could not be loaded. '+
      'This does not affect the status above, which is determined offline.</p>'+
      '<button class="btn ghost sm mt-12" onclick="retryLabel(\''+esc(it.key)+'\')">Try again</button></div>';
  } else if(lab && (lab.purpose || lab.pharm || lab.brands)){
    labelCard = '<div class="info-card"><h4>What it is used for</h4>'+
      (lab.purpose ? '<p>'+esc(lab.purpose)+'</p>' : '<p>No plain-language summary was returned for this ingredient.</p>')+
      (lab.pharm ? '<p class="muted" style="font-size:13px">Drug class: <b>'+esc(lab.pharm)+'</b></p>' : "")+
      (lab.brands ? '<p class="muted" style="font-size:13px">Also sold as: <b>'+esc(lab.brands)+'</b></p>' : "")+
      '<p class="muted" style="font-size:12px">Label text supplied by openFDA. Formulations differ between countries — the version sold in Sri Lanka may not match.</p>'+
    '</div>';
  } else labelCard = "";

  return backLink("Back to search","athlete/check")+
  '<div class="med-hero s-'+st.cls+'">'+
    '<h2>'+esc(it.name)+'</h2>'+
    '<div class="mh-l">Active Ingredient</div>'+
    '<div class="mh-v">'+esc(rule.cat)+'</div>'+
    '<div class="status-badge b-'+st.cls+'">'+st.emoji+' '+esc(st.label)+'</div>'+
  '</div>'+
  '<div class="why mb-16"><h4>💡 Why this status?</h4><p>'+rule.why+'</p></div>'+
  sportCard(rule, rule.status)+
  '<div class="info-card '+cardCls+'"><h4>⚠️ Important Reminder</h4><p>'+rule.reminder+'</p></div>'+
  labelCard+
  '<div class="info-card"><h4>⚠️ Check the whole product</h4>'+
    '<p>This is the status of a single active ingredient. The medicine you are holding may combine it with others — a cold and flu tablet often contains three or four. Every ingredient on the label needs checking separately.</p></div>'+
  officialResourcesBlock(false)+
  '<div class="src-note"><span>🔗</span><span>Status is an educational mapping applied by this platform from the WADA substance classes, not an official ruling. Label information, where shown, comes from <b>openFDA</b>.</span></div>'+
  disclaimerBlock();
};

Athlete.afterIng = function(idx){
  var it = INGREDIENTS[+idx];
  if(!it) return;
  var key = String(idx);
  if(!(Store.s.viewedOther||[]).some(function(v){ return v.kind==="ing" && v.key===key; })){
    Store.s.viewedOther = [{kind:"ing", key:key, name:it.name, status:it.rule.status}]
      .concat((Store.s.viewedOther||[]).filter(function(v){ return !(v.kind==="ing" && v.key===key); })).slice(0,6);
    Store.save();
  }
  // `false` marks a failed lookup — retry on the next visit rather than
  // caching the miss permanently.
  if(LABEL_CACHE[it.key] !== undefined && LABEL_CACHE[it.key] !== false) return;
  fetchLabel(it.key).then(function(l){
    LABEL_CACHE[it.key] = l || null;
    if(Router.current === "athlete/ing") Router.render();
  }).catch(function(){
    LABEL_CACHE[it.key] = false;
    if(Router.current === "athlete/ing") Router.render();
  });
};

/* ---------- database-resolved medication detail ---------- */
Athlete.rmed = function(rxcui){
  var rec = REMOTE_CACHE[rxcui];
  var nm = (rec && rec.name) || RNAME[rxcui] || "Medication";

  if(REMOTE_ERR[rxcui]){
    return backLink("Back to search","athlete/check")+
      '<div class="empty"><div class="e-ic">📡</div><h4>Could not load this medicine</h4>'+
      '<p>The medicine database could not be reached. Check your connection and try again, or verify this product directly on Global DRO.</p>'+
      '<div class="row" style="justify-content:center;gap:10px;margin-top:22px">'+
        '<button class="btn" onclick="retryRemote(\''+esc(rxcui)+'\')">Try again</button>'+
        '<button class="btn ghost" onclick="openResource(\'gdro\')">Check on Global DRO</button>'+
      '</div></div>'+disclaimerBlock();
  }

  if(!rec){
    return backLink("Back to search","athlete/check")+
      '<div class="med-hero s-unclassified"><h2>'+esc(nm)+'</h2>'+
      '<div class="loading-row"><span class="spin"></span> Resolving active ingredients…</div></div>'+
      '<div class="skel" style="height:110px;margin-bottom:13px"></div>'+
      '<div class="skel" style="height:92px;margin-bottom:13px"></div>'+
      '<div class="skel" style="height:140px"></div>';
  }

  var st = STATUS[rec.status];
  var unclassified = rec.status === "unclassified";
  var ings = rec.ingredients.length ? rec.ingredients.join(", ") : "Not listed in the database";
  var whyCard, reminderCard;

  if(unclassified && rec.downgraded){
    whyCard = '<div class="info-card"><h4>⚪ Not all ingredients are classified</h4>'+
      '<p>This product contains more than one active ingredient. Those recognised here fall under <b>'+esc(rec.rule.cat)+'</b>, but <b>'+esc(rec.unmatched.join(", "))+'</b> '+(rec.unmatched.length>1?"are":"is")+' not classified in this platform.</p>'+
      '<p><b>No overall status is shown, because one unknown ingredient is enough to change the answer.</b> Check every ingredient on Global DRO before taking this product.</p></div>';
    reminderCard = '<div class="info-card warn"><h4>⚠️ Verify before you take it</h4>'+
      '<p>Treat an unclassified result exactly as you would an unknown substance. Under strict liability, the responsibility for what is in your body remains yours.</p></div>';
  } else if(unclassified){
    whyCard = '<div class="info-card"><h4>⚪ No classification held here</h4>'+
      '<p>This platform does not carry an anti-doping classification for '+(rec.ingredients.length?'<b>'+esc(ings)+'</b>':'this product')+'.</p>'+
      '<p><b>This does not mean it is permitted.</b> It means the status has not been established here, and you must check it on Global DRO for your country and sport before taking it.</p></div>';
    reminderCard = '<div class="info-card warn"><h4>⚠️ Verify before you take it</h4>'+
      '<p>Treat an unclassified result exactly as you would an unknown substance. Check Global DRO, and contact SLADA if anything is unclear.</p></div>';
  } else {
    var cardCls = rec.status === "prohibited" ? "danger" : (rec.status === "caution" ? "warn" : "");
    whyCard = '<div class="why"><h4>💡 Why this status?</h4><p>'+rec.rule.why+'</p>'+
      '<p style="font-size:13px;margin-top:10px;opacity:.85">Category: <b>'+esc(rec.rule.cat)+'</b></p></div>';
    reminderCard = '<div class="info-card '+cardCls+'" style="margin-top:13px"><h4>'+
      (rec.status==="prohibited"?"⚠️ Prohibited substance":"⚠️ Important Reminder")+'</h4><p>'+rec.rule.reminder+'</p></div>';
  }

  var partialCard = (rec.partial && !rec.downgraded)
    ? '<div class="info-card warn"><h4>⚠️ Combination product</h4>'+
      '<p>This medicine contains more than one active ingredient, and only some are classified here. The status shown reflects the most restrictive ingredient recognised. Unrecognised: <b>'+esc(rec.unmatched.join(", "))+'</b>.</p></div>'
    : "";

  var labelCard = (rec.label && (rec.label.purpose || rec.label.pharm))
    ? '<div class="info-card"><h4>What it is used for</h4>'+
      (rec.label.purpose ? '<p>'+esc(rec.label.purpose)+'</p>' : "")+
      (rec.label.pharm ? '<p class="muted" style="font-size:13px">Drug class: <b>'+esc(rec.label.pharm)+'</b></p>' : "")+
      '<p class="muted" style="font-size:12px">Label text supplied by openFDA. Formulations differ between countries.</p></div>'
    : "";

  return backLink("Back to search","athlete/check")+
  '<div class="med-hero s-'+st.cls+'">'+
    '<h2>'+esc(nm)+'</h2>'+
    '<div class="mh-l">Active Ingredient'+(rec.ingredients.length>1?"s":"")+'</div>'+
    '<div class="mh-v">'+esc(ings)+'</div>'+
    '<div class="status-badge b-'+st.cls+'">'+st.emoji+' '+esc(st.label)+'</div>'+
  '</div>'+
  whyCard + sportCard(rec.rule, rec.status) + reminderCard + partialCard + labelCard +
  '<div class="info-card"><h4>At a glance</h4><dl class="kv mt-12">'+
    '<dt>Identified as</dt><dd>'+esc(nm)+'</dd>'+
    '<dt>Active ingredient'+(rec.ingredients.length>1?"s":"")+'</dt><dd>'+esc(ings)+'</dd>'+
    (rec.label && rec.label.route ? '<dt>Route</dt><dd>'+esc(rec.label.route)+'</dd>' : "")+
    (rec.label && rec.label.brands ? '<dt>Also sold as</dt><dd>'+esc(rec.label.brands)+'</dd>' : "")+
    '<dt>RxNorm ID</dt><dd>'+esc(rxcui)+'</dd>'+
  '</dl></div>'+
  officialResourcesBlock(unclassified)+
  '<div class="src-note"><span>🔗</span><span>Identified via <b>RxNorm</b>'+(rec.label?' with label text from <b>openFDA</b>':'')+'. '+
    (unclassified ? 'No anti-doping status was applied, because neither database publishes one.'
                  : 'The status shown is an educational mapping applied by this platform from the active ingredient, not an official ruling.')+
  '</span></div>'+
  disclaimerBlock();
};

Athlete.afterRmed = function(rxcui){
  if(REMOTE_CACHE[rxcui] || REMOTE_ERR[rxcui]) return;
  lookupRx(rxcui, RNAME[rxcui]).then(function(rec){
    Store.s.viewedOther = [{kind:"rx", key:rxcui, name:rec.name, status:rec.status}]
      .concat((Store.s.viewedOther||[]).filter(function(v){ return v.key !== rxcui; })).slice(0,6);
    Store.save();
    if(Router.current === "athlete/rmed") Router.render();
  }).catch(function(){
    REMOTE_ERR[rxcui] = 1;
    if(Router.current === "athlete/rmed") Router.render();
  });
};

function retryRemote(rxcui){ delete REMOTE_ERR[rxcui]; Router.render(); }
function retryLabel(key){ delete LABEL_CACHE[key]; Router.render(); }

/* ==========================================================================
   Learn
   ========================================================================== */
Athlete.learn = function(){
  var read = Store.s.readArticles.length, total = ARTICLES.length;
  var pct = Math.round(read/total*100);

  var cards = ARTICLES.map(function(a){
    var done = Store.s.readArticles.indexOf(a.id) !== -1;
    return '<button class="learn-card" onclick="go(\'athlete/article/'+a.id+'\')">'+
      '<span class="lc-ic '+a.bg+' '+a.tint+'">'+a.icon+'</span>'+
      '<span class="grow"><h4>'+esc(a.title)+'</h4><p>'+esc(a.sub)+'</p>'+
      '<span class="lc-m"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'+
      esc(a.read)+(done?" · Completed":"")+'</span></span>'+
      (done ? '<span class="tick">'+ICON.tick+'</span>' : '<span style="color:var(--faint);flex:0 0 auto">'+ICON.chev+'</span>')+
    '</button>';
  }).join("");

  return pageHead("Learn","Clean sport, explained simply. Nine short guides covering the rules, your rights and the habits that keep you compliant.")+
  '<div class="card pad mb-24" style="background:linear-gradient(135deg,var(--blue-600),#2F7BEB);color:#fff;border:0">'+
    '<div class="row-b wrap" style="gap:20px">'+
      '<div><div style="font-size:14px;font-weight:700;opacity:.92">Your learning progress</div>'+
      '<div style="font-size:28px;font-weight:820;letter-spacing:-.03em;margin:6px 0 14px">'+read+' of '+total+' guides</div>'+
      '<div class="progress" style="background:rgba(255,255,255,.28);width:min(320px,60vw)"><i style="width:'+pct+'%;background:#fff"></i></div></div>'+
      '<button class="btn" style="background:rgba(255,255,255,.18);backdrop-filter:blur(6px)" onclick="go(\'athlete/quiz\')">Take the quiz '+ICON.arrow+'</button>'+
    '</div>'+
  '</div>'+
  '<div class="quick-grid stagger" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">'+cards+'</div>'+
  disclaimerBlock();
};

/* article illustrations */
function illo(id){
  var C = {b:"var(--blue-600)", b2:"var(--blue-300)", bl:"var(--blue-50)", g:"var(--green-600)", gl:"var(--green-50)",
           a:"var(--amber-600)", al:"var(--amber-50)", v:"var(--violet-600)", vl:"var(--violet-50)",
           r:"var(--red-600)", rl:"var(--red-50)", ln:"var(--line)", bg:"var(--bg)"};
  var open = '<svg viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">';

  if(id === "wada") return open+
    '<rect width="680" height="300" rx="26" fill="'+C.bl+'"/>'+
    '<circle cx="340" cy="150" r="92" fill="'+C.bg+'" stroke="'+C.b2+'" stroke-width="3"/>'+
    '<ellipse cx="340" cy="150" rx="92" ry="38" fill="none" stroke="'+C.b2+'" stroke-width="3"/>'+
    '<ellipse cx="340" cy="150" rx="38" ry="92" fill="none" stroke="'+C.b2+'" stroke-width="3"/>'+
    '<path d="M248 150h184" stroke="'+C.b2+'" stroke-width="3"/>'+
    '<circle cx="340" cy="150" r="92" fill="none" stroke="'+C.b+'" stroke-width="4"/>'+
    '<circle cx="302" cy="114" r="11" fill="'+C.g+'"/><circle cx="382" cy="182" r="14" fill="'+C.b+'"/>'+
    '<rect x="70" y="86" width="96" height="128" rx="14" fill="'+C.bg+'" stroke="'+C.ln+'" stroke-width="3"/>'+
    '<path d="M94 118h48M94 140h48M94 162h30" stroke="'+C.b2+'" stroke-width="6" stroke-linecap="round"/>'+
    '<rect x="514" y="106" width="96" height="128" rx="14" fill="'+C.bg+'" stroke="'+C.ln+'" stroke-width="3"/>'+
    '<path d="M538 138h48M538 160h48M538 182h30" stroke="'+C.g+'" stroke-width="6" stroke-linecap="round"/></svg>';

  if(id === "slada") return open+
    '<rect width="680" height="300" rx="26" fill="'+C.gl+'"/>'+
    '<path d="M340 44 232 86v78c0 62 44 116 108 128 64-12 108-66 108-128V86Z" fill="'+C.bg+'" stroke="'+C.g+'" stroke-width="5"/>'+
    '<path d="m296 156 30 30 58-66" stroke="'+C.g+'" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'+
    '<circle cx="104" cy="92" r="28" fill="'+C.b+'" opacity=".16"/>'+
    '<circle cx="572" cy="212" r="38" fill="'+C.g+'" opacity=".14"/>'+
    '<rect x="66" y="176" width="96" height="16" rx="8" fill="'+C.g+'" opacity=".25"/>'+
    '<rect x="66" y="206" width="60" height="16" rx="8" fill="'+C.b+'" opacity=".22"/></svg>';

  if(id === "strict-liability") return open+
    '<rect width="680" height="300" rx="26" fill="'+C.vl+'"/>'+
    '<path d="M340 60v180" stroke="'+C.v+'" stroke-width="9" stroke-linecap="round"/>'+
    '<path d="M212 100h256" stroke="'+C.v+'" stroke-width="9" stroke-linecap="round"/>'+
    '<circle cx="340" cy="60" r="14" fill="'+C.v+'"/>'+
    '<rect x="286" y="236" width="108" height="18" rx="9" fill="'+C.v+'"/>'+
    '<path d="M212 100l-36 76h72Z" fill="'+C.bg+'" stroke="'+C.v+'" stroke-width="4" stroke-linejoin="round"/>'+
    '<path d="M468 100l-36 76h72Z" fill="'+C.bg+'" stroke="'+C.v+'" stroke-width="4" stroke-linejoin="round"/>'+
    '<circle cx="212" cy="196" r="12" fill="'+C.g+'"/><circle cx="468" cy="196" r="12" fill="'+C.a+'"/></svg>';

  if(id === "rights") return open+
    '<rect width="680" height="300" rx="26" fill="'+C.bl+'"/>'+
    '<circle cx="250" cy="112" r="34" fill="'+C.bg+'" stroke="'+C.b+'" stroke-width="4"/>'+
    '<path d="M250 152c-34 0-60 24-64 56h128c-4-32-30-56-64-56Z" fill="'+C.bg+'" stroke="'+C.b+'" stroke-width="4"/>'+
    '<circle cx="430" cy="112" r="34" fill="'+C.bg+'" stroke="'+C.g+'" stroke-width="4"/>'+
    '<path d="M430 152c-34 0-60 24-64 56h128c-4-32-30-56-64-56Z" fill="'+C.bg+'" stroke="'+C.g+'" stroke-width="4"/>'+
    '<path d="M300 130h80" stroke="'+C.b2+'" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 14"/>'+
    '<rect x="66" y="106" width="88" height="110" rx="14" fill="'+C.bg+'" stroke="'+C.ln+'" stroke-width="3"/>'+
    '<path d="M88 136h44M88 156h44M88 176h28" stroke="'+C.b2+'" stroke-width="6" stroke-linecap="round"/>'+
    '<rect x="526" y="106" width="88" height="110" rx="14" fill="'+C.bg+'" stroke="'+C.ln+'" stroke-width="3"/>'+
    '<path d="m548 168 16 16 30-34" stroke="'+C.g+'" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';

  if(id === "responsibilities") return open+
    '<rect width="680" height="300" rx="26" fill="'+C.al+'"/>'+
    '<circle cx="340" cy="98" r="40" fill="'+C.bg+'" stroke="'+C.a+'" stroke-width="5"/>'+
    '<path d="M340 146c-42 0-74 30-79 70h158c-5-40-37-70-79-70Z" fill="'+C.bg+'" stroke="'+C.a+'" stroke-width="5"/>'+
    '<circle cx="340" cy="232" r="34" fill="'+C.a+'"/>'+
    '<path d="m326 232 10 10 18-20" stroke="'+C.bg+'" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'+
    '<rect x="62" y="82" width="104" height="136" rx="16" fill="'+C.bg+'" stroke="'+C.ln+'" stroke-width="3"/>'+
    '<path d="M86 112h56M86 134h56M86 156h40M86 178h48" stroke="'+C.a+'" stroke-width="6" stroke-linecap="round" opacity=".55"/>'+
    '<rect x="514" y="82" width="104" height="136" rx="16" fill="'+C.bg+'" stroke="'+C.ln+'" stroke-width="3"/>'+
    '<path d="M538 112h56M538 134h56M538 156h40M538 178h48" stroke="'+C.b+'" stroke-width="6" stroke-linecap="round" opacity=".45"/></svg>';

  if(id === "supplements") return open+
    '<rect width="680" height="300" rx="26" fill="'+C.al+'"/>'+
    '<rect x="256" y="76" width="150" height="170" rx="24" fill="'+C.bg+'" stroke="'+C.a+'" stroke-width="5"/>'+
    '<rect x="290" y="44" width="82" height="40" rx="12" fill="'+C.a+'"/>'+
    '<path d="M286 134h90M286 162h90M286 190h56" stroke="'+C.ln+'" stroke-width="8" stroke-linecap="round"/>'+
    '<circle cx="486" cy="176" r="48" fill="'+C.bg+'" stroke="'+C.a+'" stroke-width="5"/>'+
    '<path d="M486 148v34M486 200h.01" stroke="'+C.a+'" stroke-width="9" stroke-linecap="round"/>'+
    '<ellipse cx="140" cy="180" rx="52" ry="34" fill="'+C.bg+'" stroke="'+C.ln+'" stroke-width="4"/>'+
    '<circle cx="122" cy="176" r="9" fill="'+C.g+'"/><circle cx="146" cy="188" r="9" fill="'+C.b+'"/><circle cx="160" cy="168" r="9" fill="'+C.a+'"/></svg>';

  if(id === "tue") return open+
    '<rect width="680" height="300" rx="26" fill="'+C.bl+'"/>'+
    '<rect x="212" y="46" width="256" height="216" rx="20" fill="'+C.bg+'" stroke="'+C.b+'" stroke-width="5"/>'+
    '<rect x="270" y="26" width="140" height="40" rx="12" fill="'+C.b+'"/>'+
    '<path d="M248 116h184M248 146h184M248 176h120" stroke="'+C.ln+'" stroke-width="8" stroke-linecap="round"/>'+
    '<circle cx="418" cy="212" r="42" fill="'+C.gl+'" stroke="'+C.g+'" stroke-width="5"/>'+
    '<path d="m398 212 14 14 26-30" stroke="'+C.g+'" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'+
    '<rect x="66" y="118" width="70" height="70" rx="20" fill="'+C.g+'" opacity=".14"/>'+
    '<rect x="552" y="72" width="62" height="62" rx="18" fill="'+C.b+'" opacity=".13"/></svg>';

  if(id === "doping-control") return open+
    '<rect width="680" height="300" rx="26" fill="'+C.gl+'"/>'+
    '<rect x="150" y="74" width="76" height="168" rx="26" fill="'+C.bg+'" stroke="'+C.g+'" stroke-width="5"/>'+
    '<rect x="164" y="156" width="48" height="74" rx="16" fill="'+C.g+'" opacity=".35"/>'+
    '<rect x="168" y="54" width="40" height="30" rx="10" fill="'+C.g+'"/>'+
    '<rect x="266" y="74" width="76" height="168" rx="26" fill="'+C.bg+'" stroke="'+C.b+'" stroke-width="5"/>'+
    '<rect x="280" y="172" width="48" height="58" rx="16" fill="'+C.b+'" opacity=".3"/>'+
    '<rect x="284" y="54" width="40" height="30" rx="10" fill="'+C.b+'"/>'+
    '<text x="188" y="132" font-family="system-ui" font-size="28" font-weight="700" fill="'+C.g+'" text-anchor="middle">A</text>'+
    '<text x="304" y="132" font-family="system-ui" font-size="28" font-weight="700" fill="'+C.b+'" text-anchor="middle">B</text>'+
    '<rect x="396" y="84" width="146" height="150" rx="18" fill="'+C.bg+'" stroke="'+C.ln+'" stroke-width="4"/>'+
    '<path d="M424 122h90M424 150h90M424 178h56" stroke="'+C.b2+'" stroke-width="7" stroke-linecap="round"/>'+
    '<path d="m424 206 14 14 28-28" stroke="'+C.g+'" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';

  // prohibited-list
  return open+
    '<rect width="680" height="300" rx="26" fill="'+C.rl+'"/>'+
    '<rect x="232" y="40" width="216" height="222" rx="20" fill="'+C.bg+'" stroke="'+C.r+'" stroke-width="5"/>'+
    '<path d="M264 92h152M264 124h152M264 156h100M264 188h130" stroke="'+C.ln+'" stroke-width="8" stroke-linecap="round"/>'+
    '<circle cx="524" cy="106" r="46" fill="'+C.bg+'" stroke="'+C.r+'" stroke-width="6"/>'+
    '<path d="m504 86 40 40M544 86l-40 40" stroke="'+C.r+'" stroke-width="9" stroke-linecap="round"/>'+
    '<circle cx="146" cy="196" r="46" fill="'+C.bg+'" stroke="'+C.g+'" stroke-width="6"/>'+
    '<path d="m126 196 15 15 26-30" stroke="'+C.g+'" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'+
    '<rect x="96" y="66" width="76" height="18" rx="9" fill="'+C.r+'" opacity=".3"/>'+
    '<rect x="508" y="212" width="88" height="18" rx="9" fill="'+C.g+'" opacity=".3"/></svg>';
}

Athlete.article = function(id){
  var a = artById(id);
  if(!a) return notFoundBlock("Guide",
    "No guide exists at “"+id+"”. Browse the Learn section for the full set of nine.",
    "Open Learn", "athlete/learn");
  var done = Store.s.readArticles.indexOf(a.id) !== -1;

  var body = a.body.map(function(b){
    if(b.h)  return '<h3>'+esc(b.h)+'</h3>';
    if(b.p)  return '<p>'+b.p+'</p>';
    if(b.q)  return '<div class="pullquote">“'+esc(b.q)+'”</div>';
    if(b.ul) return '<ul>'+b.ul.map(function(li){ return '<li>'+esc(li)+'</li>'; }).join("")+'</ul>';
    if(b.t)  return '<div class="takeaways"><h4>✓ Key takeaways</h4><ul>'+b.t.map(function(li){ return '<li>'+esc(li)+'</li>'; }).join("")+'</ul></div>';
    return "";
  }).join("");

  return backLink("Back to Learn","athlete/learn")+
  '<div class="art-hero mb-16">'+illo(a.id)+'</div>'+
  '<article class="article">'+
    '<h1>'+esc(a.title)+'</h1>'+
    '<div class="art-meta"><span class="badge blue">'+a.icon+' Clean Sport</span><span>'+esc(a.read)+'</span></div>'+
    body+
  '</article>'+
  '<div class="row wrap mt-24" style="gap:11px">'+
    (done
      ? '<button class="btn ghost" disabled><span style="color:var(--green-600)">✓</span> Completed</button>'
      : '<button class="btn green" onclick="markRead(\''+a.id+'\')">Mark as read</button>')+
    '<button class="btn ghost" onclick="go(\'athlete/quiz\')">Test your knowledge</button>'+
  '</div>'+
  disclaimerBlock();
};

function markRead(id){
  if(Store.s.readArticles.indexOf(id) === -1){
    Store.s.readArticles.push(id);
    Store.save();
    UI.toast(Store.s.readArticles.length === ARTICLES.length
      ? "All guides completed — nice work!"
      : "Marked as read · " + Store.s.readArticles.length + " of " + ARTICLES.length + " done");
  }
  Router.render();
}

/* ==========================================================================
   Quiz
   ========================================================================== */
var Q = {i:0, score:0, answered:false, picked:-1};

Athlete.quiz = function(){
  var best = Store.s.quizBest === null ? "—" : Store.s.quizBest + "/10";
  return pageHead("Clean Sport Quiz","Ten questions on the rules, responsibilities and habits that keep athletes on the right side of anti-doping regulations.")+
  '<div class="quiz-hero mb-24">'+
    '<div style="font-size:46px;margin-bottom:10px">🧠</div>'+
    '<h2>Clean Sport Quiz</h2>'+
    '<p>Answer ten questions and receive an explanation after each one. Seven correct is a pass; nine or more earns the Clean Sport Champion badge.</p>'+
    '<div class="qh-stats">'+
      '<div><div class="n">10</div><div class="l">QUESTIONS</div></div>'+
      '<div><div class="n">~5</div><div class="l">MINUTES</div></div>'+
      '<div><div class="n">'+esc(best)+'</div><div class="l">YOUR BEST</div></div>'+
    '</div>'+
  '</div>'+
  '<div class="card pad mb-16"><h4 style="font-size:15px;font-weight:730;margin-bottom:10px">How it works</h4>'+
    '<p class="muted" style="font-size:14.5px;line-height:1.65;margin:0">One question at a time, with an explanation after each answer so you learn as you go. '+
    'You can retake it as often as you like — your best score is kept.</p></div>'+
  '<button class="btn lg block" onclick="startQuiz()">Start quiz</button>'+
  (Store.s.quizTaken ? '<p class="center muted mt-16" style="font-size:13px">Attempts so far: '+Store.s.quizTaken+'</p>' : "")+
  disclaimerBlock();
};

function startQuiz(){ Q = {i:0, score:0, answered:false, picked:-1, attempted:false}; go("athlete/quizrun"); }

Athlete.quizrun = function(){
  var q = QUIZ[Q.i];
  var pct = Math.round(Q.i / QUIZ.length * 100);
  var letters = ["A","B","C","D"];

  var opts = q.o.map(function(o,idx){
    var cls = "opt";
    if(Q.answered){
      if(idx === q.a) cls += " correct";
      else if(idx === Q.picked) cls += " wrong";
      else cls += " dim";
    }
    return '<button class="'+cls+'" '+(Q.answered?"disabled":"")+' onclick="pickAnswer('+idx+')">'+
      '<span class="ltr">'+letters[idx]+'</span><span>'+esc(o)+'</span></button>';
  }).join("");

  var fb = "";
  if(Q.answered){
    var good = Q.picked === q.a;
    fb = '<div class="feedback '+(good?"good":"bad")+'"><h5>'+(good?"✓ Correct":"✕ Not quite")+'</h5><p>'+esc(q.e)+'</p></div>';
  }
  var last = Q.i === QUIZ.length - 1;

  return '<div class="row-b mb-12">'+
      '<button class="btn ghost sm" onclick="quitQuiz()">'+ICON.x+' Exit</button>'+
      '<span class="badge green">Score '+Q.score+'</span>'+
    '</div>'+
    '<div class="row-b" style="font-size:13px;font-weight:650;color:var(--muted);margin-bottom:8px">'+
      '<span>Question '+(Q.i+1)+' of '+QUIZ.length+'</span><span>'+pct+'%</span></div>'+
    '<div class="progress mb-24"><i style="width:'+pct+'%"></i></div>'+
    '<h2 style="font-size:clamp(20px,3vw,26px);font-weight:760;line-height:1.32;margin-bottom:22px">'+esc(q.q)+'</h2>'+
    opts + fb +
    '<div class="mt-24">'+
      (Q.answered
        ? '<button class="btn lg block" onclick="'+(last?"finishQuiz()":"nextQ()")+'">'+(last?"See results":"Next question")+'</button>'
        : '<p class="center muted" style="font-size:13px">Select an answer to continue</p>')+
    '</div>';
};

function pickAnswer(idx){
  if(Q.answered) return;
  Q.answered = true; Q.picked = idx;
  if(idx === QUIZ[Q.i].a) Q.score++;
  Router.render();
}
function nextQ(){ Q.i++; Q.answered = false; Q.picked = -1; Router.render(); }
function quitQuiz(){ go("athlete/learn"); }
function finishQuiz(){
  Q.attempted = true;
  Store.s.quizTaken++;
  if(Store.s.quizBest === null || Q.score > Store.s.quizBest) Store.s.quizBest = Q.score;
  Store.save();
  go("athlete/quizresult");
}

Athlete.quizresult = function(){
  // Deep-linked or refreshed without an attempt in this session: a
  // certificate reading 0/10 would be worse than no certificate.
  if(!Q.attempted){
    return '<div class="empty" style="padding-top:60px">'+
      '<div class="e-ic">🧠</div><h4>No quiz result to show</h4>'+
      '<p>Results are generated when you finish the quiz. Your best score is kept on your profile'+
      (Store.s.quizBest !== null ? ' — currently <b>'+Store.s.quizBest+'/'+QUIZ.length+'</b>' : '')+'.</p>'+
      '<div class="row" style="justify-content:center;gap:10px;margin-top:22px">'+
        '<button class="btn" onclick="startQuiz()">Take the quiz</button>'+
        '<button class="btn ghost" onclick="go(\'athlete/profile\')">View profile</button>'+
      '</div></div>';
  }
  var score = Q.score, total = QUIZ.length, pct = score/total;
  var pass = score >= 7, champ = score >= 9;
  var allRead = Store.s.readArticles.length === ARTICLES.length;
  var championUnlocked = champ && allRead;
  var color = champ ? "var(--green-600)" : (pass ? "var(--blue-600)" : "var(--amber-600)");
  var title = champ ? "Congratulations!" : (pass ? "Well done!" : "Keep going!");
  var msg = champ
    ? "An excellent result. You have a strong grasp of the principles that protect clean sport."
    : (pass ? "A solid pass. Review the guides on anything you missed and try again for a perfect score."
            : "Not a pass this time. Work through the Learn section and retake the quiz — there is no limit on attempts.");

  var badges = [
    {t:"Completed Introduction", s:"Read your first clean sport guide", ic:"🌱", bg:"bg-green", got:Store.s.readArticles.length >= 1},
    {t:"Passed Quiz", s:"Scored 7 or more", ic:"✅", bg:"bg-blue", got:pass},
    {t:"Clean Sport Champion", s:"Scored 9 or more and read every guide", ic:"🏆", bg:"bg-amber", got:championUnlocked}
  ].map(function(b){
    return '<div class="award '+(b.got?"":"locked")+'">'+
      '<span class="aw-ic '+b.bg+'">'+b.ic+'</span>'+
      '<span class="grow"><span style="display:block;font-size:14.5px;font-weight:700">'+esc(b.t)+'</span>'+
      '<span style="display:block;font-size:12.5px" class="muted">'+esc(b.s)+'</span></span>'+
      (b.got ? '<span class="tick">'+ICON.tick+'</span>' : '<span class="muted" style="font-size:11.5px">Locked</span>')+
    '</div>';
  }).join("");

  return '<div class="cert mb-24">'+
    '<div class="cert-seal">'+(champ?"🏆":(pass?"✓":"📚"))+'</div>'+
    '<div class="cert-k">Certificate of Completion</div>'+
    '<h2>'+title+'</h2>'+
    '<p class="muted" style="font-size:14.5px;margin-top:6px">You scored</p>'+
    '<div class="mt-16" style="display:flex;justify-content:center">'+
      Chart.ring(pct, 148, 13, color,
        '<div><div style="font-size:34px;font-weight:820;letter-spacing:-.03em;color:'+color+'">'+score+'/'+total+'</div>'+
        '<div style="font-size:11.5px" class="muted">'+Math.round(pct*100)+'% correct</div></div>')+
    '</div>'+
    '<div class="who">'+esc(Store.s.athleteName)+'</div>'+
    '<div class="muted" style="font-size:13px">has completed the SLADA Connect Clean Sport Quiz</div>'+
    '<div class="cert-meta">'+
      '<div>Date<b>'+fmtDate(todayISO())+'</b></div>'+
      '<div>Result<b>'+(pass?"Passed":"Not passed")+'</b></div>'+
      '<div>Reference<b>SLC-'+(1000+Math.floor(Math.random()*8999))+'</b></div>'+
    '</div>'+
  '</div>'+
  '<div class="info-card '+(pass?"good":"")+'"><h4>'+(pass?"🎉 Result":"💪 Result")+'</h4><p>'+esc(msg)+'</p></div>'+
  (champ && !allRead
    ? '<div class="info-card mt-12"><h4>🏅 One step from Champion</h4><p>You have the quiz score you need. Finish the remaining '+
      (ARTICLES.length - Store.s.readArticles.length)+' guide'+((ARTICLES.length-Store.s.readArticles.length)===1?"":"s")+
      ' in the Learn section to unlock the Clean Sport Champion badge.</p></div>' : "")+
  '<div class="section-h">Your badges</div>'+
  '<div class="quick-grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">'+badges+'</div>'+
  '<div class="row wrap mt-24" style="gap:11px">'+
    '<button class="btn" onclick="startQuiz()">Retake quiz</button>'+
    '<button class="btn ghost" onclick="window.print()">'+ICON.dl+' Download certificate</button>'+
    '<button class="btn ghost" onclick="go(\'athlete/learn\')">Back to Learn</button>'+
  '</div>'+
  disclaimerBlock();
};

Athlete.afterQuizResult = function(){ if(Q.score >= 7) UI.confetti(); };

/* ==========================================================================
   Prohibited List / TUE / Resources
   ========================================================================== */
Athlete.prohibited = function(){
  var classes = [
    {k:"S0", t:"Unapproved substances", d:"Any pharmacological substance not currently approved for human therapeutic use.", when:"At all times", c:"red"},
    {k:"S1", t:"Anabolic agents", d:"Anabolic androgenic steroids and other anabolic agents such as SARMs and clenbuterol.", when:"At all times", c:"red"},
    {k:"S2", t:"Peptide hormones & growth factors", d:"EPO, growth hormone, insulin, chorionic gonadotropin and related substances.", when:"At all times", c:"red"},
    {k:"S3", t:"Beta-2 agonists", d:"Asthma treatments, permitted by inhaler only up to defined maximum doses.", when:"At all times", c:"amber"},
    {k:"S4", t:"Hormone & metabolic modulators", d:"Aromatase inhibitors, SERMs, meldonium and trimetazidine.", when:"At all times", c:"red"},
    {k:"S5", t:"Diuretics & masking agents", d:"Substances that dilute urine or hide the presence of other substances.", when:"At all times", c:"red"},
    {k:"S6", t:"Stimulants", d:"Amphetamines, modafinil and others. Pseudoephedrine is controlled by a threshold.", when:"In competition", c:"amber"},
    {k:"S7", t:"Narcotics", d:"Strong opioid pain relief including morphine, fentanyl and tramadol.", when:"In competition", c:"amber"},
    {k:"S8", t:"Cannabinoids", d:"Natural and synthetic cannabinoids. CBD alone is the exception.", when:"In competition", c:"amber"},
    {k:"S9", t:"Glucocorticoids", d:"Steroid tablets and injections. Creams, drops and inhalers are treated differently.", when:"In competition", c:"amber"},
    {k:"M1–M3", t:"Prohibited methods", d:"Manipulation of blood, chemical and physical manipulation, and gene doping.", when:"At all times", c:"red"},
    {k:"P1", t:"Beta-blockers", d:"Prohibited in precision sports such as archery and shooting.", when:"Listed sports", c:"blue"}
  ].map(function(c){
    return '<div class="card pad hover">'+
      '<div class="row-b mb-8"><span class="badge '+c.c+'">'+esc(c.k)+'</span><span class="badge slate">'+esc(c.when)+'</span></div>'+
      '<h4 style="font-size:15.5px;font-weight:730">'+esc(c.t)+'</h4>'+
      '<p class="muted mt-8" style="font-size:13.5px;line-height:1.55;margin:8px 0 0">'+esc(c.d)+'</p>'+
    '</div>';
  }).join("");

  return pageHead("The Prohibited List","How WADA organises prohibited substances and methods. Updated annually and in force from 1 January each year.")+
  '<div class="info-card warn mb-24"><h4>⚠️ This is a summary, not the list itself</h4>'+
    '<p>The categories below explain how the Prohibited List is structured. The authoritative document is published by WADA and changes every year. '+
    'Always check a specific medicine on Global DRO rather than reasoning from these categories alone.</p></div>'+
  '<div class="quick-grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">'+classes+'</div>'+
  '<div class="row wrap mt-24" style="gap:11px">'+
    '<button class="btn" onclick="go(\'athlete/check\')">'+ICON.search+' Check a medicine</button>'+
    '<button class="btn ghost" onclick="go(\'athlete/article/prohibited-list\')">Read the full guide</button>'+
  '</div>'+
  disclaimerBlock();
};

Athlete.tue = function(){
  var steps = [
    {n:"1", t:"Confirm the substance is prohibited", d:"Check the medicine on Global DRO first. If it is permitted, no TUE is needed."},
    {n:"2", t:"Talk to your physician", d:"You need a doctor who can document the diagnosis, the treatment history and why permitted alternatives are unsuitable."},
    {n:"3", t:"Gather medical evidence", d:"Full medical history, examination results, diagnostic tests and specialist reports. Incomplete files are the most common cause of delay."},
    {n:"4", t:"Submit before you take it", d:"Except in genuine emergencies, the application must be approved before the substance is used."},
    {n:"5", t:"Independent panel review", d:"A panel of physicians assesses the application against the four conditions. They may request further information."},
    {n:"6", t:"Decision and record", d:"If granted, the TUE specifies the substance, dose, route and duration. Keep a copy with you at competitions."}
  ].map(function(s){
    return '<div class="listrow" style="align-items:flex-start">'+
      '<span class="lr-ic bg-blue tint-blue" style="font-weight:750">'+s.n+'</span>'+
      '<span class="grow"><span class="lr-t" style="display:block">'+esc(s.t)+'</span>'+
      '<span class="lr-s" style="display:block">'+esc(s.d)+'</span></span></div>';
  }).join("");

  return pageHead("Therapeutic Use Exemptions","Athletes get ill like everyone else. A TUE is the formal permission to use a prohibited substance when it is genuinely needed to treat a medical condition.")+
  '<div class="dash-grid">'+
    '<div>'+
      '<div class="card pad mb-16"><h4 style="font-size:15.5px;font-weight:730;margin-bottom:14px">The four conditions</h4>'+
        '<p class="muted" style="font-size:14px;margin-bottom:14px">A TUE is granted only when <b>all four</b> are satisfied:</p>'+
        '<ul style="margin:0;padding:0;list-style:none">'+
        ["The athlete would experience a significant health problem without the substance or method.",
         "The treatment is highly unlikely to produce additional performance enhancement beyond a return to normal health.",
         "There is no reasonable permitted alternative treatment available.",
         "The need is not the consequence of previously using a substance without a TUE."].map(function(x,i){
          return '<li style="display:flex;gap:12px;margin-bottom:12px;font-size:14.5px;line-height:1.6;color:var(--ink-2)">'+
            '<span class="badge blue" style="flex:0 0 auto">'+(i+1)+'</span><span>'+esc(x)+'</span></li>';
        }).join("")+'</ul></div>'+
      '<div class="section-h">Application process</div>'+
      '<div class="card" style="padding:6px 18px">'+steps+'</div>'+
    '</div>'+
    '<div>'+
      '<div class="card pad mb-16" style="background:var(--amber-50);border-color:color-mix(in srgb,var(--amber-600) 25%, transparent)">'+
        '<h4 style="font-size:15px;font-weight:730;color:var(--amber-700);margin-bottom:10px">⏱ Apply in advance</h4>'+
        '<p style="font-size:14px;line-height:1.6;color:var(--ink-2);margin:0">Applying after a sample has already been collected is a far weaker position. Plan your TUE around your competition calendar, not around your test results.</p></div>'+
      '<div class="card pad">'+
        '<h4 style="font-size:15px;font-weight:730;margin-bottom:12px">Need help?</h4>'+
        '<p class="muted" style="font-size:14px;line-height:1.6;margin-bottom:16px">SLADA reviews TUE applications for Sri Lankan athletes and can advise on whether one is needed.</p>'+
        '<button class="btn block" onclick="openResource(\'slada\')">'+ICON.phone+' Contact SLADA</button>'+
        '<button class="btn ghost block mt-12" onclick="go(\'athlete/article/tue\')">Read the full guide</button>'+
      '</div>'+
    '</div>'+
  '</div>'+
  disclaimerBlock();
};

Athlete.resources = function(){
  var cards = RESOURCES.map(function(r){
    return '<button class="role-card '+r.tint+'" onclick="openResource(\''+r.id+'\')" style="min-height:0">'+
      '<span class="role-ic '+r.bg+'">'+r.icon+'</span>'+
      '<h3>'+esc(r.title)+'</h3><p>'+esc(r.sub)+'</p>'+
      '<span class="role-go">Open '+ICON.arrow+'</span>'+
    '</button>';
  }).join("");

  return pageHead("Official Resources","This platform is a companion. These are the authorities — check with them before you compete.")+
  '<div class="role-grid mb-24 stagger">'+cards+'</div>'+
  '<div class="dash-grid">'+
    '<div class="card pad">'+
      '<h4 style="font-size:15.5px;font-weight:730;margin-bottom:14px">📞 Emergency contact</h4>'+
      '<p class="muted" style="font-size:14px;line-height:1.6">If you are approaching competition and unsure about a medication, contact your national anti-doping agency before you take anything.</p>'+
      '<dl class="kv mt-16">'+
        '<dt>Athlete helpline</dt><dd>Add SLADA number</dd>'+
        '<dt>Email</dt><dd>Add SLADA email</dd>'+
        '<dt>Medical emergency</dt><dd>1990 Suwa Seriya</dd>'+
      '</dl>'+
      '<p class="muted mt-16" style="font-size:12px">Contact details are placeholders in this prototype and must be confirmed with SLADA before any public release.</p>'+
    '</div>'+
    '<div class="card pad">'+
      '<h4 style="font-size:15.5px;font-weight:730;margin-bottom:14px">✓ Three-step check</h4>'+
      '<p style="font-size:14.5px;line-height:1.7;color:var(--ink-2);margin:0 0 10px">1. Read every active ingredient on the packaging, not just the brand name.</p>'+
      '<p style="font-size:14.5px;line-height:1.7;color:var(--ink-2);margin:0 0 10px">2. Check each ingredient on Global DRO for your country and sport.</p>'+
      '<p style="font-size:14.5px;line-height:1.7;color:var(--ink-2);margin:0">3. If anything is unclear, contact SLADA before you take it.</p>'+
      '<button class="btn soft block mt-20" onclick="go(\'athlete/check\')">'+ICON.search+' Check a medicine now</button>'+
    '</div>'+
  '</div>'+
  disclaimerBlock();
};

/* ==========================================================================
   Profile / Notifications / Settings
   ========================================================================== */
Athlete.profile = function(){
  var s = Store.s;
  var read = s.readArticles.length, total = ARTICLES.length;
  var learnPct = Math.round(read/total*100);
  var quizPct = s.quizBest === null ? 0 : Math.round(s.quizBest/QUIZ.length*100);
  var champion = s.quizBest !== null && s.quizBest >= 9 && read === total;

  var badges = [
    {t:"Completed Introduction", s:"Read your first clean sport guide", ic:"🌱", bg:"bg-green", got:read >= 1},
    {t:"Passed Quiz", s:"Scored 7 or more on the Clean Sport Quiz", ic:"✅", bg:"bg-blue", got:s.quizBest !== null && s.quizBest >= 7},
    {t:"Clean Sport Champion", s:"Scored 9 or more and read every guide", ic:"🏆", bg:"bg-amber", got:champion}
  ].map(function(b){
    return '<div class="award '+(b.got?"":"locked")+'">'+
      '<span class="aw-ic '+b.bg+'">'+b.ic+'</span>'+
      '<span class="grow"><span style="display:block;font-size:14.5px;font-weight:700">'+esc(b.t)+'</span>'+
      '<span style="display:block;font-size:12.5px" class="muted">'+esc(b.s)+'</span></span>'+
      (b.got ? '<span class="tick">'+ICON.tick+'</span>'
             : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.6"/><path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7"/></svg>')+
    '</div>';
  }).join("");

  var myTests = TESTS.filter(function(x){ return x.athleteId === s.athleteId; });

  return '<div class="row mb-24 wrap" style="gap:16px">'+
    '<span class="avatar lg">'+esc(initials(s.athleteName))+'</span>'+
    '<div class="grow"><h1 style="font-size:clamp(21px,3vw,27px);font-weight:820">'+esc(s.athleteName)+'</h1>'+
    '<p class="muted" style="font-size:14px;margin-top:4px">'+esc(sportLabel())+' · '+esc(s.athleteId)+
      (s.athleteGuest ? ' · <span class="badge amber">Guest session</span>' : '')+'</p></div>'+
    '<button class="btn ghost" onclick="editProfile()">Edit profile</button>'+
  '</div>'+

  (s.athleteGuest
    ? '<div class="info-card warn mb-24"><h4>⚠️ You are browsing as a guest</h4>'+
      '<p>Progress is saved on this device but no account exists. Create an account to record your sport, federation and certificate details.</p>'+
      '<button class="btn sm mt-12" onclick="go(\'athlete/register\')">Create an account</button></div>'
    : "")+

  '<div class="stat-grid mb-24">'+
    statCard({icon:"📚", bg:"bg-green", tint:"tint-green", n:read+"/"+total, label:"Guides completed"})+
    statCard({icon:"🧠", bg:"bg-violet",tint:"tint-violet",n:(s.quizBest===null?"—":s.quizBest+"/10"), label:"Best quiz score"})+
    statCard({icon:"🏅", bg:"bg-amber", tint:"tint-amber", n:[read>=1, s.quizBest!==null&&s.quizBest>=7, champion].filter(Boolean).length+"/3", label:"Badges earned"})+
    statCard({icon:"🧪", bg:"bg-blue",  tint:"tint-blue",  n:myTests.length, label:"Tests on record"})+
  '</div>'+

  '<div class="dash-grid">'+
    '<div>'+
      '<div class="section-h">Progress</div>'+
      '<div class="card pad mb-16">'+
        '<div class="row-b mb-8" style="font-size:14px"><b>Learning</b><span class="muted">'+read+' of '+total+' · '+learnPct+'%</span></div>'+
        '<div class="progress mb-20"><i style="width:'+learnPct+'%"></i></div>'+
        '<div class="row-b mb-8" style="font-size:14px"><b>Quiz</b><span class="muted">'+(s.quizBest===null?"Not attempted":s.quizBest+" of 10")+'</span></div>'+
        '<div class="progress green"><i style="width:'+quizPct+'%"></i></div>'+
        '<div class="row wrap mt-20" style="gap:10px">'+
          '<button class="btn soft sm" onclick="go(\'athlete/learn\')">Continue learning</button>'+
          '<button class="btn ghost sm" onclick="go(\'athlete/quiz\')">'+(s.quizBest===null?"Take the quiz":"Retake quiz")+'</button>'+
        '</div>'+
      '</div>'+

      '<div class="section-h">Recently viewed medicines</div>'+
      '<div class="card" style="padding:6px 18px">'+recentViewRows(5)+'</div>'+

      '<div class="section-h">Testing history</div>'+
      '<div class="card" style="padding:6px 18px">'+
        (myTests.length ? myTests.map(function(x){
          return '<div class="listrow"><span class="lr-ic bg-blue tint-blue">🧪</span>'+
            '<span class="grow"><span class="lr-t" style="display:block">'+esc(x.comp)+'</span>'+
            '<span class="lr-s" style="display:block">'+esc(x.id)+' · '+esc(x.type)+' · '+esc(x.sample)+'</span></span>'+
            '<span class="badge '+statusBadgeCls(x.status)+'">'+esc(x.status)+'</span></div>';
        }).join("") : '<div class="empty" style="padding:30px"><p>No tests on record.</p></div>')+
      '</div>'+
    '</div>'+

    '<div>'+
      '<div class="section-h">Achievements</div>'+
      '<div style="display:grid;gap:12px">'+badges+'</div>'+
      '<div class="section-h">Account details</div>'+
      '<div class="card pad mb-16">'+
        [["Athlete ID", s.athleteId], ["Email", s.athleteEmail || "—"],
         ["Sport", s.sport || "—"], ["Event", s.event || "—"],
         ["Federation", s.athleteFed || "—"],
         ["Date of birth", s.athleteDob ? fmtDate(s.athleteDob) : "—"],
         ["Gender", s.athleteGender || "—"], ["Nationality", s.athleteNat || "—"],
         ["Testing pool", s.athletePool ? "Registered Testing Pool" : "Not in a testing pool"]
        ].map(function(kv){
          return '<div class="row-b" style="padding:10px 0;border-bottom:1px solid var(--line-2);font-size:13.5px">'+
            '<span class="muted">'+esc(kv[0])+'</span><b style="text-align:right">'+esc(kv[1])+'</b></div>';
        }).join("")+
        '<button class="btn ghost block mt-16" onclick="editProfile()">Edit details</button>'+
      '</div>'+

      '<div class="section-h">Account</div>'+
      '<div class="card" style="padding:6px 18px">'+
        '<button class="listrow" onclick="athleteSignOut()"><span class="lr-ic bg-slate">'+ICON.logout+'</span>'+
          '<span class="grow"><span class="lr-t">Sign out</span></span><span style="color:var(--faint)">'+ICON.chev+'</span></button>'+
        '<button class="listrow" onclick="go(\'athlete/settings\')"><span class="lr-ic bg-slate">'+ICON.gear+'</span>'+
          '<span class="grow"><span class="lr-t">Settings</span></span><span style="color:var(--faint)">'+ICON.chev+'</span></button>'+
        '<button class="listrow" onclick="go(\'athlete/notifications\')"><span class="lr-ic bg-slate">'+ICON.bell+'</span>'+
          '<span class="grow"><span class="lr-t">Notifications</span></span><span style="color:var(--faint)">'+ICON.chev+'</span></button>'+
        '<button class="listrow" onclick="go(\'athlete/resources\')"><span class="lr-ic bg-slate">'+ICON.phone+'</span>'+
          '<span class="grow"><span class="lr-t">Official resources</span></span><span style="color:var(--faint)">'+ICON.chev+'</span></button>'+
      '</div>'+
    '</div>'+
  '</div>'+
  disclaimerBlock();
};

function editProfile(){
  var s = Store.s;
  UI.modal(
    '<h3>Athlete details</h3>'+
    '<p class="muted" style="font-size:13.5px">Your sport determines which substances are restricted for you, and appears on your completion certificate.</p>'+
    '<div class="field"><label class="label">FULL NAME</label><input class="input" id="pfName" value="'+esc(s.athleteName)+'" /></div>'+
    '<div class="field"><label class="label">EMAIL</label><input class="input" id="pfEmail" type="email" value="'+esc(s.athleteEmail||"")+'" /></div>'+
    '<div class="grid-2">'+
      '<div class="field"><label class="label">SPORT</label><select class="select" id="pfSport">'+
        SPORTS.map(function(x){ return '<option'+(s.sport===x?" selected":"")+'>'+esc(x)+'</option>'; }).join("")+
      '</select></div>'+
      '<div class="field"><label class="label">EVENT OR DISCIPLINE</label><input class="input" id="pfEvent" value="'+esc(s.event||"")+'" /></div>'+
    '</div>'+
    '<div class="field"><label class="label">FEDERATION</label><select class="select" id="pfFed">'+
      FEDERATIONS.map(function(x){ return '<option'+(s.athleteFed===x?" selected":"")+'>'+esc(x)+'</option>'; }).join("")+
    '</select></div>'+
    '<div class="row" style="gap:10px;justify-content:flex-end">'+
      '<button class="btn ghost" onclick="UI.closeModal()">Cancel</button>'+
      '<button class="btn" onclick="saveProfile()">Save</button>'+
    '</div>'
  );
}
function saveProfile(){
  var n = $("#pfName").value.trim();
  if(n) Store.s.athleteName = n;
  Store.s.athleteEmail = $("#pfEmail").value.trim();
  Store.s.sport = $("#pfSport").value;
  Store.s.event = $("#pfEvent").value.trim();
  Store.s.athleteFed = $("#pfFed").value;
  viewSport = null;
  Store.save();
  UI.closeModal();
  Shell.role = null;          // sidebar shows the sport label
  Router.render();
  UI.toast("Profile updated");
}
