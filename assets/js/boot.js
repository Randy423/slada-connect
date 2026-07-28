/* ==========================================================================
   SLADA Connect — landing page, route table, boot
   ========================================================================== */

function Landing(){
  var roles = [
    {ic:"🏃", t:"Athlete", d:"Create an account with your sport, then check medications against it, learn the rules and track your progress.",
     to:"athlete", tint:"tint-blue", bg:"bg-blue", cta:"Sign in or create account"},
    {ic:"👨‍⚕️", t:"Doping Control Officer", d:"Register tests through a guided seven-step workflow with digital signatures and PDF export.",
     to:"officer", tint:"tint-green", bg:"bg-green", cta:"Officer sign in"},
    {ic:"🛡", t:"Administrator", d:"National analytics, the athlete database, report generation and user management.",
     to:"admin", tint:"tint-violet", bg:"bg-violet", cta:"Open dashboard"},
    {ic:"📚", t:"Learn Clean Sport", d:"Nine plain-language guides covering WADA, strict liability, TUEs and the testing process.",
     to:"athlete/learn", tint:"tint-amber", bg:"bg-amber", cta:"Start learning"}
  ].map(function(r){
    return '<button class="role-card '+r.tint+'" onclick="go(\''+r.to+'\')">'+
      '<span class="role-ic '+r.bg+'">'+r.ic+'</span>'+
      '<h3>'+esc(r.t)+'</h3><p>'+esc(r.d)+'</p>'+
      '<span class="role-go">'+esc(r.cta)+' '+ICON.arrow+'</span>'+
    '</button>';
  }).join("");

  var feats = [
    {ic:"🔍", t:"Live medicine lookup", d:"Search any brand or active ingredient. Results resolve through RxNorm and openFDA, with an explanation of why each substance is treated the way it is.", bg:"bg-blue", tint:"tint-blue"},
    {ic:"🏅", t:"Answers for your sport", d:"Every result says whether it applies to your discipline. Beta-blockers are restricted in shooting and archery but not in athletics — the platform tells you which case you are in.", bg:"bg-violet", tint:"tint-violet"},
    {ic:"⚖️", t:"Safe by design", d:"Anything the platform cannot classify is flagged for verification rather than shown as permitted. A product with an unknown ingredient never reads as green.", bg:"bg-green", tint:"tint-green"},
    {ic:"✍️", t:"Paperless doping control", d:"A seven-step workflow captures competition, athlete, notification, sample, declaration and on-screen signatures, then produces a printable form.", bg:"bg-violet", tint:"tint-violet"},
    {ic:"📊", t:"National oversight", d:"Testing volume, distribution by sport, and in- versus out-of-competition split, with export to PDF, CSV and Excel.", bg:"bg-amber", tint:"tint-amber"},
    {ic:"🌐", t:"Trilingual ready", d:"Interface language switches between English, Sinhala and Tamil, with the structure in place for full content translation.", bg:"bg-blue", tint:"tint-blue"},
    {ic:"📱", t:"Works on any device", d:"Mobile-first and fully responsive, from a phone at the trackside to a desktop at agency headquarters.", bg:"bg-green", tint:"tint-green"}
  ].map(function(f){
    return '<div class="feat"><span class="f-ic '+f.bg+' '+f.tint+'">'+f.ic+'</span>'+
      '<h4>'+esc(f.t)+'</h4><p>'+esc(f.d)+'</p></div>';
  }).join("");

  return '<div class="landing">'+
    '<nav class="nav" id="lnav">'+
      '<div class="brand"><span class="sb-mark">'+ICON.logo+'</span>'+
        '<span><span class="brand-n" style="display:block">SLADA Connect</span>'+
        '<span class="brand-s" style="display:block">Clean Sport Platform</span></span></div>'+
      '<div class="nav-links">'+
        '<a class="nl-hide" href="#features" onclick="scrollToId(event,\'features\')">Features</a>'+
        '<a class="nl-hide" href="#roles" onclick="scrollToId(event,\'roles\')">Portals</a>'+
        '<a class="nl-hide" href="#/athlete/learn">Learn</a>'+
        '<button class="iconbtn" onclick="toggleTheme()" aria-label="Toggle theme">'+
          (Store.s.theme === "dark"
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a6.9 6.9 0 0 0 11.1 11.1Z"/></svg>')+
        '</button>'+
        '<button class="btn sm" onclick="go(\'athlete\')">'+esc(t("getStarted"))+'</button>'+
      '</div>'+
    '</nav>'+

    '<header class="hero">'+
      '<div class="hero-in">'+
        '<span class="eyebrow"><span class="dot"></span>Concept prototype · developed for the Sri Lanka Anti-Doping Agency</span>'+
        '<div class="kicker">SLADA Connect</div>'+
        '<h1>One Platform for <span class="grad">Clean Sport</span></h1>'+
        '<p class="sub">A modern digital platform helping athletes, coaches and doping control officers promote clean sport in Sri Lanka.</p>'+
        '<div class="hero-cta">'+
          '<button class="btn lg" onclick="go(\'athlete\')">'+esc(t("getStarted"))+' '+ICON.arrow+'</button>'+
          '<button class="btn lg ghost" onclick="scrollToId(event,\'features\')">'+esc(t("learnMore"))+'</button>'+
        '</div>'+
        '<p class="hero-note">Free to explore · Guest access available on every portal</p>'+
      '</div>'+
    '</header>'+

    '<div class="trust">'+
      [["4","Connected portals"],["9","Clean sport guides"],["209","Ingredients classified"],["3","Languages"]].map(function(x){
        return '<div class="t-i"><div class="t-n">'+esc(x[0])+'</div><div class="t-l">'+esc(x[1])+'</div></div>';
      }).join("")+
    '</div>'+

    '<section class="sec soft" id="roles">'+
      '<div class="sec-in">'+
        '<div class="sec-head"><h2>Built for everyone in clean sport</h2>'+
          '<p>One system connecting athletes, doping control officers and the agency — each with the tools they actually need.</p></div>'+
        '<div class="role-grid stagger">'+roles+'</div>'+
      '</div>'+
    '</section>'+

    '<section class="sec" id="features">'+
      '<div class="sec-in">'+
        '<div class="sec-head"><h2>Designed to be trusted</h2>'+
          '<p>Education, medication guidance and doping control management in a single platform — built to government standards and honest about its limits.</p></div>'+
        '<div class="feat-grid stagger">'+feats+'</div>'+
      '</div>'+
    '</section>'+

    '<section class="sec soft">'+
      '<div class="sec-in">'+
        '<div class="card pad" style="text-align:center;padding:clamp(30px,5vw,56px)">'+
          '<h2 style="font-size:clamp(23px,3.4vw,34px);font-weight:820">Start with the question every athlete asks</h2>'+
          '<p class="muted mt-12" style="font-size:16px;max-width:520px;margin-inline:auto">'+
            '“Can I take this?” — check any medicine in seconds, and understand why the answer is what it is.</p>'+
          '<div class="hero-cta">'+
            '<button class="btn lg" onclick="go(\'athlete/check\')">'+ICON.search+' Check a medicine</button>'+
            '<button class="btn lg ghost" onclick="go(\'athlete/quiz\')">Take the quiz</button>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</section>'+

    '<footer class="foot"><div class="foot-in">'+
      '<div class="foot-grid">'+
        '<div>'+
          '<div class="row" style="gap:11px;margin-bottom:14px">'+
            '<span class="sb-mark">'+ICON.logo+'</span>'+
            '<span style="color:#fff;font-weight:780;font-size:16px">SLADA Connect</span></div>'+
          '<p style="color:#93A7C4;font-size:13.5px;line-height:1.65;max-width:34ch;margin:0">'+
            'A unified digital platform concept for athlete education, medication guidance and doping control management in Sri Lanka.</p>'+
        '</div>'+
        '<div><h5>Portals</h5>'+
          '<a href="#/athlete">Athlete</a><a href="#/officer">Officer</a><a href="#/admin">Administrator</a></div>'+
        '<div><h5>Learn</h5>'+
          '<a href="#/athlete/learn">Clean sport guides</a><a href="#/athlete/quiz">Quiz</a>'+
          '<a href="#/athlete/prohibited">Prohibited List</a><a href="#/athlete/tue">TUE</a></div>'+
        '<div><h5>Resources</h5>'+
          '<a href="#/athlete/resources">Global DRO</a><a href="#/athlete/resources">WADA</a>'+
          '<a href="#/athlete/resources">SLADA</a><a href="#/athlete/resources">ADEL</a></div>'+
      '</div>'+
      '<div class="disc"><b style="color:#B9C8DE">This platform is educational and does not replace official anti-doping guidance.</b> '+
        'Athletes should always verify medications through official resources such as Global DRO, or consult SLADA before competition.<br><br>'+
        'This is a concept prototype created for design review. It is not an official product of, and has not been endorsed by, the Sri Lanka Anti-Doping Agency, WADA or any other organisation. '+
        'All athlete records, test data, contact details and statistics shown are illustrative samples.</div>'+
    '</div></footer>'+
  '</div>';
}

function scrollToId(e, id){
  if(e) e.preventDefault();
  var el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
}

/* ==========================================================================
   Routes
   ========================================================================== */
route("", {view:Landing, after:function(){
  var nav = $("#lnav");
  if(!nav) return;
  var onScroll = function(){ nav.classList.toggle("stuck", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();
}});

/* --- athlete --- */
route("athlete/signin",        {role:"athlete", bare:true, open:true, view:Athlete.signin});
route("athlete/register",      {role:"athlete", bare:true, open:true, view:Athlete.register});
route("athlete",               {role:"athlete", title:"Dashboard",          sub:"Athlete Portal",    view:Athlete.dashboard});
route("athlete/check",         {role:"athlete", title:"Can I Take This?",   sub:"Medication checker",view:Athlete.check, after:Athlete.afterCheck, width:"narrow"});
route("athlete/med",           {role:"athlete", title:"Medication",         sub:"In-app guide",      view:Athlete.med, width:"narrow"});
route("athlete/rmed",          {role:"athlete", title:"Medication",         sub:"Medicine database", view:Athlete.rmed, after:Athlete.afterRmed, width:"narrow"});
route("athlete/ing",           {role:"athlete", title:"Active ingredient",  sub:"Classification",    view:Athlete.ing, after:Athlete.afterIng, width:"narrow"});
route("athlete/learn",         {role:"athlete", title:"Learn",              sub:"Clean sport guides",view:Athlete.learn});
route("athlete/article",       {role:"athlete", title:"Guide",              sub:"Learn",             view:Athlete.article, width:"narrow"});
route("athlete/quiz",          {role:"athlete", title:"Clean Sport Quiz",   sub:"Test your knowledge",view:Athlete.quiz, width:"narrow"});
route("athlete/quizrun",       {role:"athlete", title:"Clean Sport Quiz",   sub:"In progress",       view:Athlete.quizrun, width:"tight"});
route("athlete/quizresult",    {role:"athlete", title:"Quiz Results",       sub:"Certificate",       view:Athlete.quizresult, after:Athlete.afterQuizResult, width:"narrow"});
route("athlete/prohibited",    {role:"athlete", title:"Prohibited List",    sub:"Reference",         view:Athlete.prohibited});
route("athlete/tue",           {role:"athlete", title:"Therapeutic Use Exemptions", sub:"Reference", view:Athlete.tue});
route("athlete/resources",     {role:"athlete", title:"Official Resources", sub:"Contact SLADA",     view:Athlete.resources});
route("athlete/profile",       {role:"athlete", title:"Profile",            sub:"Your progress",     view:Athlete.profile});
route("athlete/notifications", {role:"athlete", title:"Notifications",      sub:"Alerts",            view:function(){ return notificationsView("athlete"); }, width:"narrow"});
route("athlete/settings",      {role:"athlete", title:"Settings",           sub:"Preferences",       view:function(){ return settingsView("athlete"); }});

/* --- officer --- */
route("officer/login",         {role:"officer", bare:true, view:Officer.login});
route("officer",               {role:"officer", title:"Dashboard",          sub:"Doping Control",    view:Officer.dashboard});
route("officer/new-test",      {role:"officer", title:"Register New Test",  sub:"Doping control form",view:Officer.newTest, after:Officer.afterNewTest, width:"narrow"});
route("officer/tests",         {role:"officer", title:"Test Records",       sub:"All forms",         view:Officer.tests});
route("officer/athletes",      {role:"officer", title:"Athletes",           sub:"National register",  view:Officer.athletes});
route("officer/athlete",       {role:"officer", title:"Athlete Record",     sub:"History",           view:Officer.athleteDetail});
route("officer/reports",       {role:"officer", title:"Reports",            sub:"Export activity",   view:Officer.reports});
route("officer/notifications", {role:"officer", title:"Notifications",      sub:"Alerts",            view:function(){ return notificationsView("officer"); }, width:"narrow"});
route("officer/settings",      {role:"officer", title:"Settings",           sub:"Preferences",       view:function(){ return settingsView("officer"); }});

/* --- admin --- */
route("admin",                 {role:"admin", title:"Overview",             sub:"Administration",    view:Admin.dashboard});
route("admin/athletes",        {role:"admin", title:"Athlete Database",     sub:"National register", view:Admin.athletes});
route("admin/athlete",         {role:"admin", title:"Athlete Record",       sub:"History",           view:Admin.athleteDetail});
route("admin/tests",           {role:"admin", title:"Test Records",         sub:"All forms",         view:Admin.tests});
route("admin/reports",         {role:"admin", title:"Reports & Export",     sub:"Analytics",         view:Admin.reports});
route("admin/users",           {role:"admin", title:"Manage Users",         sub:"Access control",    view:Admin.users});
route("admin/notifications",   {role:"admin", title:"Notifications",        sub:"Alerts",            view:function(){ return notificationsView("admin"); }, width:"narrow"});
route("admin/settings",        {role:"admin", title:"Settings",             sub:"Preferences",       view:function(){ return settingsView("admin"); }});

/* ==========================================================================
   Boot
   ========================================================================== */
if(!location.hash) location.hash = "#/";
Router.render();
