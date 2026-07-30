/* ==========================================================================
   SLADA Connect — Doping Control Officer Portal
   ========================================================================== */
var Officer = {};

/* ==========================================================================
   Secure login
   ========================================================================== */
Officer.login = function(){
  return '<div class="login-wrap"><div class="login">'+
    '<div class="lg-mark">'+ICON.logo+'</div>'+
    '<h2>Officer sign in</h2>'+
    '<p class="lg-s">Secure access for accredited doping control officers.</p>'+
    '<div class="demo-note"><b>Prototype access.</b> No real authentication is implemented. '+
      'Use any value, or press Sign in to continue as <b>D. Rajapaksa</b>.</div>'+
    '<div class="field"><label class="label">OFFICER ID OR EMAIL</label>'+
      '<input class="input" id="lgUser" placeholder="d.rajapaksa@example.lk" autocomplete="off" /></div>'+
    '<div class="field"><label class="label">PASSWORD</label>'+
      '<input class="input" id="lgPass" type="password" placeholder="••••••••" autocomplete="off" /></div>'+
    '<label class="checkline mt-8" onclick="this.classList.toggle(\'on\')">'+
      '<input type="checkbox" checked />'+
      '<span><span class="cl-t">Remember this device</span>'+
      '<span class="cl-s">Only on trusted agency equipment</span></span></label>'+
    '<button class="btn lg block mt-16" onclick="officerSignIn()">'+ICON.shield+' Sign in</button>'+
    '<button class="btn ghost block mt-12" onclick="go(\'\')">Back to home</button>'+
    '<p class="muted center mt-20" style="font-size:11.5px;line-height:1.6">This is a concept prototype. Do not enter real credentials or athlete data.</p>'+
  '</div></div>';
};

function officerSignIn(){
  var u = ($("#lgUser") && $("#lgUser").value.trim()) || "";
  Store.s.officerAuth = true;
  if(u && u.indexOf("@") === -1) Store.s.officerName = u;
  Store.save();
  UI.toast("Signed in — prototype session");
  go("officer");
}
function officerSignOut(){
  Store.s.officerAuth = false; Store.save();
  Shell.role = null;
  go("officer/login");
}

/* ==========================================================================
   Dashboard
   ========================================================================== */
Officer.dashboard = function(){
  var submitted = Store.s.submittedTests || [];
  var all = submitted.concat(TESTS);
  var today = all.filter(function(x){ return x.date === todayISO(); });
  var pending = all.filter(function(x){ return x.status === "Pending" || x.status === "Under Review"; });
  var done = all.filter(function(x){ return x.status === "Completed" || x.status === "Submitted"; });

  var rows = all.slice(0,6).map(function(x){
    return '<tr onclick="viewTest(\''+esc(x.id)+'\')">'+
      '<td><div class="cell-strong">'+esc(x.id)+'</div><div class="cell-sub">'+esc(x.comp)+'</div></td>'+
      '<td><div class="row" style="gap:9px"><span class="avatar sm">'+esc(initials(x.athlete))+'</span>'+
        '<span><div class="cell-strong">'+esc(x.athlete)+'</div><div class="cell-sub">'+esc(x.sport)+'</div></span></div></td>'+
      '<td>'+esc(fmtDate(x.date))+'</td>'+
      '<td><span class="badge slate">'+esc(x.type)+'</span></td>'+
      '<td><span class="badge '+statusBadgeCls(x.status)+'">'+esc(x.status)+'</span></td>'+
    '</tr>';
  }).join("");

  return '<div class="row-b mb-24 wrap">'+
    '<div><h1 style="font-size:clamp(22px,3.4vw,30px);font-weight:820">Doping control dashboard</h1>'+
    '<p class="muted mt-8" style="font-size:14.5px">Signed in as '+esc(Store.s.officerName)+' · '+fmtDate(todayISO())+'</p></div>'+
    '<button class="btn" onclick="go(\'officer/new-test\')">'+ICON.plus+' Register new test</button>'+
  '</div>'+

  '<div class="stat-grid stagger mb-24">'+
    statCard({icon:"📅", bg:"bg-blue",  tint:"tint-blue",  n:today.length,   label:"Today's tests"})+
    statCard({icon:"⏳", bg:"bg-amber", tint:"tint-amber", n:pending.length, label:"Pending tests", delta:"2 awaiting review", up:false})+
    statCard({icon:"✅", bg:"bg-green", tint:"tint-green", n:done.length,    label:"Completed tests", delta:"8 this month", up:true})+
    statCard({icon:"🧾", bg:"bg-violet",tint:"tint-violet",n:all.length,     label:"Total records"})+
  '</div>'+

  '<div class="section-h">Quick actions</div>'+
  '<div class="quick-grid mb-24 stagger">'+
    ['<button class="quick" onclick="go(\'officer/new-test\')"><span class="q-ic bg-blue tint-blue">'+ICON.plus+'</span>'+
      '<span class="q-t">Register New Test</span><span class="q-s">Start the 7-step workflow</span></button>',
     '<button class="quick" onclick="go(\'officer/athletes\')"><span class="q-ic bg-green tint-green">'+ICON.users+'</span>'+
      '<span class="q-t">View Athletes</span><span class="q-s">Search the athlete register</span></button>',
     '<button class="quick" onclick="go(\'officer/reports\')"><span class="q-ic bg-violet tint-violet">'+ICON.chart+'</span>'+
      '<span class="q-t">Generate Report</span><span class="q-s">Export testing activity</span></button>',
     '<button class="quick" onclick="go(\'officer/tests\')"><span class="q-ic bg-amber tint-amber">'+ICON.flask+'</span>'+
      '<span class="q-t">Test Records</span><span class="q-s">All doping control forms</span></button>'].join("")+
  '</div>'+

  '<div class="row-b mb-12"><div class="section-h" style="margin:0">Recent test records</div>'+
    '<button class="btn ghost sm" onclick="go(\'officer/tests\')">View all</button></div>'+
  '<div class="table-wrap"><table class="tbl"><thead><tr>'+
    '<th>Form</th><th>Athlete</th><th>Date</th><th>Type</th><th>Status</th>'+
  '</tr></thead><tbody>'+rows+'</tbody></table></div>'+

  '<div class="src-note"><span>'+ICON.info+'</span><span>All records shown are illustrative sample data generated for this prototype. '+
    'No real athlete information is stored.</span></div>';
};

/* ==========================================================================
   Test records + athletes + reports
   ========================================================================== */
var testFilter = "";

Officer.tests = function(){
  var all = (Store.s.submittedTests||[]).concat(TESTS);
  var q = testFilter.toLowerCase();
  var list = all.filter(function(x){
    return !q || (x.id+" "+x.athlete+" "+x.comp+" "+x.sport+" "+x.status).toLowerCase().indexOf(q) !== -1;
  });

  var rows = list.map(function(x){
    return '<tr onclick="viewTest(\''+esc(x.id)+'\')">'+
      '<td><div class="cell-strong">'+esc(x.id)+'</div><div class="cell-sub">'+esc(x.officer||"—")+'</div></td>'+
      '<td><div class="row" style="gap:9px"><span class="avatar sm">'+esc(initials(x.athlete))+'</span>'+
        '<span><div class="cell-strong">'+esc(x.athlete)+'</div><div class="cell-sub">'+esc(x.sport)+'</div></span></div></td>'+
      '<td><div class="cell-strong">'+esc(x.comp)+'</div><div class="cell-sub">'+esc(x.venue)+'</div></td>'+
      '<td>'+esc(fmtDate(x.date))+'</td>'+
      '<td><span class="badge slate">'+esc(x.sample)+'</span></td>'+
      '<td><span class="badge '+statusBadgeCls(x.status)+'">'+esc(x.status)+'</span></td>'+
    '</tr>';
  }).join("");

  return pageHead("Test records","Every doping control form recorded on this device, newest first.")+
  '<div class="toolbar">'+
    '<div class="search-inline"><span style="color:var(--faint)">'+ICON.search+'</span>'+
      '<input id="tFilter" placeholder="Search form, athlete, competition or status" value="'+esc(testFilter)+'" oninput="testFilter=this.value;refreshTests()" /></div>'+
    '<button class="btn ghost" onclick="exportCSV()">'+ICON.dl+' Export CSV</button>'+
    '<button class="btn" onclick="go(\'officer/new-test\')">'+ICON.plus+' New test</button>'+
  '</div>'+
  '<div id="tTable">'+
    (list.length
      ? '<div class="table-wrap"><table class="tbl"><thead><tr><th>Form</th><th>Athlete</th><th>Competition</th><th>Date</th><th>Sample</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      : '<div class="empty"><div class="e-ic">🔎</div><h4>No matching records</h4><p>Try a different search term.</p></div>')+
  '</div>';
};

function refreshTests(){
  var el = $("#tTable");
  if(!el) return;
  var tmp = document.createElement("div");
  tmp.innerHTML = Officer.tests();
  el.innerHTML = tmp.querySelector("#tTable").innerHTML;
}

function viewTest(id){
  var all = (Store.s.submittedTests||[]).concat(TESTS);
  var x = null;
  for(var i=0;i<all.length;i++){ if(all[i].id === id){ x = all[i]; break; } }
  if(!x) return;
  UI.modal(
    '<div class="row-b mb-16"><h3 style="margin:0">'+esc(x.id)+'</h3>'+
      '<span class="badge '+statusBadgeCls(x.status)+'">'+esc(x.status)+'</span></div>'+
    '<dl class="kv">'+
      '<dt>Athlete</dt><dd>'+esc(x.athlete)+'</dd>'+
      '<dt>Sport</dt><dd>'+esc(x.sport)+'</dd>'+
      '<dt>Competition</dt><dd>'+esc(x.comp)+'</dd>'+
      '<dt>Venue</dt><dd>'+esc(x.venue)+'</dd>'+
      '<dt>Date</dt><dd>'+esc(fmtDate(x.date))+'</dd>'+
      '<dt>Test type</dt><dd>'+esc(x.type)+'</dd>'+
      '<dt>Sample</dt><dd>'+esc(x.sample)+'</dd>'+
      '<dt>Officer</dt><dd>'+esc(x.officer||"—")+'</dd>'+
    '</dl>'+
    '<div class="row mt-24" style="gap:10px;justify-content:flex-end">'+
      '<button class="btn ghost" onclick="UI.closeModal()">Close</button>'+
      '<button class="btn" onclick="UI.closeModal();window.print()">'+ICON.dl+' Print / PDF</button>'+
    '</div>'
  );
}

function exportCSV(){
  var all = (Store.s.submittedTests||[]).concat(TESTS);
  var head = ["Form ID","Athlete","Sport","Competition","Venue","Date","Type","Sample","Status","Officer"];
  var lines = [head.join(",")].concat(all.map(function(x){
    return [x.id,x.athlete,x.sport,x.comp,x.venue,x.date,x.type,x.sample,x.status,x.officer||""]
      .map(function(v){ return '"'+String(v==null?"":v).replace(/"/g,'""')+'"'; }).join(",");
  }));
  var blob = new Blob([lines.join("\n")], {type:"text/csv;charset=utf-8"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = "slada-test-records.csv";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
  UI.toast("Exported " + all.length + " records as CSV");
}

var athFilter = "";
Officer.athletes = function(){ return athleteTable("officer"); };

function athleteTable(role){
  var q = athFilter.toLowerCase();
  var list = ATHLETES.filter(function(a){
    return !q || (a.name+" "+a.sport+" "+a.fed+" "+a.id+" "+a.status).toLowerCase().indexOf(q) !== -1;
  });
  var rows = list.map(function(a){
    return '<tr onclick="go(\''+role+'/athlete/'+a.id+'\')">'+
      '<td><div class="row" style="gap:10px"><span class="avatar sm">'+esc(initials(a.name))+'</span>'+
        '<span><div class="cell-strong">'+esc(a.name)+'</div><div class="cell-sub">'+esc(a.id)+'</div></span></div></td>'+
      '<td>'+esc(a.sport)+'</td>'+
      '<td class="truncate" style="max-width:220px">'+esc(a.fed)+'</td>'+
      '<td>'+esc(a.gender)+'</td>'+
      '<td>'+a.tests+'</td>'+
      '<td>'+esc(fmtDate(a.last))+'</td>'+
      '<td><span class="badge '+statusBadgeCls(a.status)+'">'+esc(a.status)+'</span></td>'+
    '</tr>';
  }).join("");

  return pageHead("Athlete database","Search the national athlete register by name, sport, federation or status.")+
  '<div class="toolbar">'+
    '<div class="search-inline"><span style="color:var(--faint)">'+ICON.search+'</span>'+
      '<input placeholder="Search name, sport, federation or ID" value="'+esc(athFilter)+'" oninput="athFilter=this.value;refreshAthletes(\''+role+'\')" /></div>'+
    '<select class="select" style="width:auto;min-width:150px" onchange="athFilter=this.value===\'all\'?\'\':this.value;refreshAthletes(\''+role+'\')">'+
      '<option value="all">All sports</option>'+
      SPORTS.map(function(s){ return '<option'+(athFilter===s?" selected":"")+'>'+esc(s)+'</option>'; }).join("")+
    '</select>'+
    '<button class="btn ghost" onclick="UI.toast(\'Prototype: athlete registration is not implemented\')">'+ICON.plus+' Add athlete</button>'+
  '</div>'+
  '<div id="aTable">'+
    (list.length
      ? '<div class="table-wrap"><table class="tbl"><thead><tr><th>Athlete</th><th>Sport</th><th>Federation</th><th>Gender</th><th>Tests</th><th>Last test</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      : '<div class="empty"><div class="e-ic">🔎</div><h4>No athletes found</h4><p>Try a different search term or clear the sport filter.</p></div>')+
  '</div>';
}

function refreshAthletes(role){
  var el = $("#aTable");
  if(!el) return;
  var tmp = document.createElement("div");
  tmp.innerHTML = athleteTable(role);
  el.innerHTML = tmp.querySelector("#aTable").innerHTML;
}

function athleteDetail(id, role){
  var a = null;
  for(var i=0;i<ATHLETES.length;i++){ if(ATHLETES[i].id === id){ a = ATHLETES[i]; break; } }
  if(!a) return notFoundBlock("Athlete",
    "No athlete record matches “"+id+"”. Search the register instead.",
    "Open athlete database", role + "/athletes");
  var his = (Store.s.submittedTests||[]).concat(TESTS).filter(function(x){ return x.athleteId === a.id; });

  return backLink("Back to athletes", role+"/athletes")+
  '<div class="row mb-24 wrap" style="gap:16px">'+
    '<span class="avatar lg">'+esc(initials(a.name))+'</span>'+
    '<div class="grow"><h1 style="font-size:clamp(21px,3vw,28px);font-weight:820">'+esc(a.name)+'</h1>'+
    '<p class="muted mt-8" style="font-size:14px">'+esc(a.sport)+' · '+esc(a.fed)+'</p></div>'+
    '<span class="badge '+statusBadgeCls(a.status)+'">'+esc(a.status)+'</span>'+
  '</div>'+

  '<div class="stat-grid mb-24">'+
    statCard({icon:"🧪", bg:"bg-blue",  tint:"tint-blue",  n:a.tests, label:"Tests on record"})+
    statCard({icon:"📅", bg:"bg-green", tint:"tint-green", n:fmtDate(a.last), label:"Most recent test"})+
    statCard({icon:"🆔", bg:"bg-violet",tint:"tint-violet",n:a.id, label:"Athlete ID"})+
    statCard({icon:"🎂", bg:"bg-amber", tint:"tint-amber", n:fmtDate(a.dob), label:"Date of birth"})+
  '</div>'+

  '<div class="dash-grid">'+
    '<div>'+
      '<div class="section-h">Testing history</div>'+
      '<div class="table-wrap">'+
        (his.length
          ? '<table class="tbl" style="min-width:520px"><thead><tr><th>Form</th><th>Competition</th><th>Date</th><th>Type</th><th>Status</th></tr></thead><tbody>'+
            his.map(function(x){
              return '<tr onclick="viewTest(\''+esc(x.id)+'\')"><td class="cell-strong">'+esc(x.id)+'</td>'+
                '<td>'+esc(x.comp)+'</td><td>'+esc(fmtDate(x.date))+'</td>'+
                '<td><span class="badge slate">'+esc(x.type)+'</span></td>'+
                '<td><span class="badge '+statusBadgeCls(x.status)+'">'+esc(x.status)+'</span></td></tr>';
            }).join("")+'</tbody></table>'
          : '<div class="empty" style="padding:38px"><p>No tests recorded for this athlete.</p></div>')+
      '</div>'+

      '<div class="section-h">Medication declarations</div>'+
      '<div class="card" style="padding:6px 18px">'+
        '<div class="listrow"><span class="lr-ic bg-green">🟢</span><span class="grow">'+
          '<span class="lr-t" style="display:block">Paracetamol 500mg</span>'+
          '<span class="lr-s" style="display:block">Declared at DCF-2026-0388 · permitted</span></span>'+
          '<span class="lr-m">18 Jun 2026</span></div>'+
        '<div class="listrow"><span class="lr-ic bg-blue">🔵</span><span class="grow">'+
          '<span class="lr-t" style="display:block">Multivitamin supplement</span>'+
          '<span class="lr-s" style="display:block">Declared at DCF-2026-0388 · batch recorded</span></span>'+
          '<span class="lr-m">18 Jun 2026</span></div>'+
      '</div>'+
    '</div>'+
    '<div>'+
      '<div class="section-h">Athlete details</div>'+
      '<div class="card pad"><dl class="kv" style="grid-template-columns:1fr;gap:0">'+
        [["Full name",a.name],["Athlete ID",a.id],["Sport",a.sport],["Federation",a.fed],
         ["Date of birth",fmtDate(a.dob)],["Gender",a.gender],["Nationality",a.nat],
         ["National ID",a.nic]].map(function(kv){
          return '<div class="row-b" style="padding:11px 0;border-bottom:1px solid var(--line-2);font-size:13.5px">'+
            '<span class="muted">'+esc(kv[0])+'</span><b style="text-align:right">'+esc(kv[1])+'</b></div>';
        }).join("")+
      '</dl></div>'+
      '<button class="btn ghost block mt-16" onclick="window.print()">'+ICON.dl+' Print athlete record</button>'+
    '</div>'+
  '</div>'+
  '<div class="src-note"><span>'+ICON.info+'</span><span>Sample data. No real athlete records are stored in this prototype.</span></div>';
}

Officer.athleteDetail = function(id){ return athleteDetail(id, "officer"); };

Officer.reports = function(){
  return pageHead("Reports","Generate and export testing activity for a period, sport or competition.")+
  '<div class="dash-grid">'+
    '<div>'+
      '<div class="card pad mb-16">'+
        '<h4 style="font-size:15.5px;font-weight:730;margin-bottom:16px">Generate report</h4>'+
        '<div class="grid-2">'+
          '<div class="field"><label class="label">REPORT TYPE</label><select class="select">'+
            '<option>Testing activity summary</option><option>Tests by sport</option>'+
            '<option>In-competition vs out-of-competition</option><option>Officer activity</option></select></div>'+
          '<div class="field"><label class="label">PERIOD</label><select class="select">'+
            '<option>This month</option><option>Last 3 months</option><option>Year to date</option><option>Custom range</option></select></div>'+
          '<div class="field"><label class="label">SPORT</label><select class="select">'+
            '<option>All sports</option>'+SPORTS.map(function(s){ return '<option>'+esc(s)+'</option>'; }).join("")+'</select></div>'+
          '<div class="field"><label class="label">FORMAT</label><select class="select">'+
            '<option>PDF</option><option>CSV</option><option>Excel</option></select></div>'+
        '</div>'+
        '<div class="row wrap mt-8" style="gap:10px">'+
          '<button class="btn" onclick="UI.toast(\'Prototype: report generation is simulated\')">'+ICON.chart+' Generate</button>'+
          '<button class="btn ghost" onclick="exportCSV()">'+ICON.dl+' Export records as CSV</button>'+
        '</div>'+
      '</div>'+
      '<div class="chart-card">'+
        '<div class="chart-head"><div><h4>Monthly testing activity</h4><p>In-competition and out-of-competition, current year</p></div></div>'+
        Chart.bars(MONTHLY_TESTS, [
          {key:"ic", label:"In-competition", color:"var(--blue-600)"},
          {key:"ooc",label:"Out-of-competition", color:"var(--green-600)"}
        ], {labelKey:"m"})+
      '</div>'+
    '</div>'+
    '<div>'+
      '<div class="section-h">Recent exports</div>'+
      '<div class="card" style="padding:6px 18px">'+
        [["Testing activity — July 2026","PDF · 214 KB","2 days ago"],
         ["Tests by sport — Q2 2026","CSV · 18 KB","1 week ago"],
         ["Officer activity — June 2026","PDF · 190 KB","3 weeks ago"]].map(function(r){
          return '<div class="listrow"><span class="lr-ic bg-slate">📄</span>'+
            '<span class="grow"><span class="lr-t" style="display:block">'+esc(r[0])+'</span>'+
            '<span class="lr-s" style="display:block">'+esc(r[1])+'</span></span>'+
            '<span class="lr-m">'+esc(r[2])+'</span></div>';
        }).join("")+
      '</div>'+
    '</div>'+
  '</div>';
};

/* ==========================================================================
   Register New Test — 7 step wizard
   ========================================================================== */
var WIZ_STEPS = [
  {n:1, t:"Competition"},
  {n:2, t:"Athlete"},
  {n:3, t:"Notification"},
  {n:4, t:"Sample"},
  {n:5, t:"Declaration"},
  {n:6, t:"Signatures"},
  {n:7, t:"Review"}
];

var Wiz = null;
function newWiz(){
  return {
    step:1,
    data:{
      comp:{name:"", venue:"", date:todayISO(), officer:Store.s.officerName, type:"In-Competition"},
      ath:{id:"", name:"", sport:"", fed:"", dob:"", gender:"", nat:"Sri Lankan", nic:""},
      notify:{time:nowTime(), location:"", officer:Store.s.officerName, witness:""},
      sample:{codeA:"", codeB:"", time:nowTime(), type:"Urine"},
      decl:{meds:"", supps:"", comments:"", conditions:""},
      sig:{athlete:null, officer:null, witness:null}
    }
  };
}

Officer.newTest = function(){
  if(!Wiz) Wiz = newWiz();
  var step = Wiz.step;
  var pct = Math.round((step-1)/(WIZ_STEPS.length-1)*100);

  var stepper = WIZ_STEPS.map(function(s){
    var cls = s.n === step ? "step on" : (s.n < step ? "step done" : "step");
    return '<button class="'+cls+'" onclick="wizGo('+s.n+')">'+
      '<span class="st-n">'+(s.n < step ? "✓" : s.n)+'</span>'+esc(s.t)+'</button>';
  }).join("");

  var body = [wizStep1,wizStep2,wizStep3,wizStep4,wizStep5,wizStep6,wizStep7][step-1]();

  return '<div class="row-b wrap mb-8">'+
      '<div><h1 style="font-size:clamp(21px,3.2vw,28px);font-weight:820">Register new test</h1>'+
      '<p class="muted mt-8" style="font-size:14px">Step '+step+' of 7 · '+esc(WIZ_STEPS[step-1].t)+'</p></div>'+
      '<button class="btn ghost sm" onclick="wizCancel()">'+ICON.x+' Cancel</button>'+
    '</div>'+
    '<div class="stepper">'+stepper+'</div>'+
    '<div class="wizard-bar"><i style="width:'+pct+'%"></i></div>'+
    '<div class="card pad" id="wizBody">'+body+'</div>'+
    '<div class="wiz-foot">'+
      (step > 1 ? '<button class="btn ghost" onclick="wizPrev()">'+ICON.back+' Back</button>' : '<span></span>')+
      (step < 7
        ? '<button class="btn" onclick="wizNext()">Continue '+ICON.arrow+'</button>'
        : '<div class="row" style="gap:10px"><button class="btn ghost" onclick="window.print()">'+ICON.dl+' Download PDF</button>'+
          '<button class="btn green" onclick="wizSubmit()">'+ICON.shield+' Submit to SLADA</button></div>')+
    '</div>';
};

function fld(label, path, opts){
  opts = opts || {};
  var val = wizGet(path);
  if(opts.type === "select"){
    return '<div class="field"><label class="label">'+esc(label)+'</label>'+
      '<select class="select" onchange="wizSet(\''+path+'\',this.value)">'+
        (opts.placeholder ? '<option value=""'+(!val?" selected":"")+'>'+esc(opts.placeholder)+'</option>' : "")+
        opts.options.map(function(o){
          return '<option'+(val===o?" selected":"")+'>'+esc(o)+'</option>';
        }).join("")+
      '</select></div>';
  }
  if(opts.type === "textarea"){
    return '<div class="field"><label class="label">'+esc(label)+'</label>'+
      '<textarea class="textarea" placeholder="'+esc(opts.placeholder||"")+'" '+
      'oninput="wizSet(\''+path+'\',this.value)">'+esc(val)+'</textarea></div>';
  }
  return '<div class="field"><label class="label">'+esc(label)+'</label>'+
    '<input class="input" type="'+(opts.type||"text")+'" placeholder="'+esc(opts.placeholder||"")+'" '+
    'value="'+esc(val)+'" oninput="wizSet(\''+path+'\',this.value)" /></div>';
}
function wizGet(path){
  var p = path.split("."), o = Wiz.data;
  for(var i=0;i<p.length;i++){ o = o[p[i]]; if(o === undefined) return ""; }
  return o == null ? "" : o;
}
function wizSet(path, v){
  var p = path.split("."), o = Wiz.data;
  for(var i=0;i<p.length-1;i++) o = o[p[i]];
  o[p[p.length-1]] = v;
}

/* --- step 1: competition --- */
function wizStep1(){
  return '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">Competition information</h4>'+
    '<p class="muted mb-24" style="font-size:14px">Where and when the test is being conducted.</p>'+
    fld("COMPETITION","comp.name",{placeholder:"e.g. National Athletics Championship"})+
    fld("VENUE","comp.venue",{placeholder:"e.g. Diyagama Stadium, Homagama"})+
    '<div class="grid-2">'+
      fld("DATE","comp.date",{type:"date"})+
      fld("TEST TYPE","comp.type",{type:"select",options:["In-Competition","Out-of-Competition"]})+
    '</div>'+
    fld("DOPING CONTROL OFFICER","comp.officer",{placeholder:"Officer name"});
}

/* --- step 2: athlete --- */
var wizAthQuery = "";
function wizStep2(){
  var q = wizAthQuery.toLowerCase();
  var matches = q ? ATHLETES.filter(function(a){
    return (a.name+" "+a.sport+" "+a.id).toLowerCase().indexOf(q) !== -1;
  }).slice(0,5) : [];

  return '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">Athlete information</h4>'+
    '<p class="muted mb-16" style="font-size:14px">Search the register, or enter the details manually if the athlete is not yet registered.</p>'+
    '<div class="search-inline mb-12" style="height:48px">'+
      '<span style="color:var(--faint)">'+ICON.search+'</span>'+
      '<input placeholder="Search athlete by name, sport or ID" value="'+esc(wizAthQuery)+'" oninput="wizAthSearch(this.value)" />'+
    '</div>'+
    '<div id="wizAthResults">'+wizAthResults(matches)+'</div>'+
    '<div class="divider"></div>'+
    '<div class="row-b mb-16"><h5 style="font-size:13px;font-weight:750;letter-spacing:.05em;text-transform:uppercase;color:var(--faint)">Athlete details</h5>'+
      (Wiz.data.ath.id ? '<span class="badge green">From register · '+esc(Wiz.data.ath.id)+'</span>' : '<span class="badge slate">Manual entry</span>')+
    '</div>'+
    fld("FULL NAME","ath.name",{placeholder:"Athlete full name"})+
    '<div class="grid-2">'+
      fld("SPORT","ath.sport",{type:"select",placeholder:"Select sport",options:SPORTS})+
      fld("FEDERATION","ath.fed",{type:"select",placeholder:"Select federation",options:FEDERATIONS})+
    '</div>'+
    '<div class="grid-2">'+
      fld("DATE OF BIRTH","ath.dob",{type:"date"})+
      fld("GENDER","ath.gender",{type:"select",placeholder:"Select",options:["Male","Female","Other"]})+
    '</div>'+
    '<div class="grid-2">'+
      fld("NATIONALITY","ath.nat",{placeholder:"e.g. Sri Lankan"})+
      fld("PASSPORT OR NATIONAL ID","ath.nic",{placeholder:"Identification number"})+
    '</div>';
}
function wizAthResults(matches){
  if(!wizAthQuery) return '<p class="muted" style="font-size:13px;padding:4px 2px">Start typing to search the athlete register.</p>';
  if(!matches.length) return '<div class="info-card"><p class="muted" style="font-size:13.5px;margin:0">No athlete found. Enter the details manually below — the record will be created on submission.</p></div>';
  return '<div class="card" style="padding:4px 16px">'+matches.map(function(a){
    return '<button class="listrow" onclick="wizPickAthlete(\''+a.id+'\')">'+
      '<span class="avatar sm">'+esc(initials(a.name))+'</span>'+
      '<span class="grow"><span class="lr-t" style="display:block">'+esc(a.name)+'</span>'+
      '<span class="lr-s" style="display:block">'+esc(a.sport)+' · '+esc(a.id)+'</span></span>'+
      '<span class="badge blue">Select</span></button>';
  }).join("")+'</div>';
}
function wizAthSearch(v){
  wizAthQuery = v;
  var q = v.toLowerCase();
  var matches = q ? ATHLETES.filter(function(a){
    return (a.name+" "+a.sport+" "+a.id).toLowerCase().indexOf(q) !== -1;
  }).slice(0,5) : [];
  var el = $("#wizAthResults");
  if(el) el.innerHTML = wizAthResults(matches);
}
function wizPickAthlete(id){
  var a = null;
  for(var i=0;i<ATHLETES.length;i++){ if(ATHLETES[i].id === id){ a = ATHLETES[i]; break; } }
  if(!a) return;
  Wiz.data.ath = {id:a.id, name:a.name, sport:a.sport, fed:a.fed, dob:a.dob, gender:a.gender, nat:a.nat, nic:a.nic};
  wizAthQuery = "";
  Router.render();
  UI.toast("Athlete loaded from register");
}

/* --- step 3: notification --- */
function wizStep3(){
  return '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">Notification record</h4>'+
    '<p class="muted mb-24" style="font-size:14px">Record when and where the athlete was notified of selection, and who was present.</p>'+
    '<div class="grid-2">'+
      fld("TIME NOTIFIED","notify.time",{type:"time"})+
      fld("LOCATION","notify.location",{placeholder:"e.g. Warm-up track, Gate 3"})+
    '</div>'+
    '<div class="grid-2">'+
      fld("NOTIFYING OFFICER","notify.officer",{placeholder:"Officer name"})+
      fld("WITNESS / CHAPERONE","notify.witness",{placeholder:"Witness name"})+
    '</div>'+
    '<div class="info-card mt-8"><h4>'+ICON.info+' Athlete rights</h4>'+
      '<p>Confirm the athlete has been informed of their right to a representative, to request an interpreter, and to request a delay for a valid reason. '+
      'Any concern raised must be recorded in the declaration step.</p></div>';
}

/* --- step 4: sample collection --- */
function wizStep4(){
  var d = Wiz.data.sample;
  return '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">Sample collection</h4>'+
    '<p class="muted mb-24" style="font-size:14px">Scan or enter the bottle codes. The athlete seals the bottles and confirms the codes match the form.</p>'+
    '<div class="grid-2">'+
      '<div class="field"><label class="label">BOTTLE A CODE</label>'+
        '<div class="row" style="gap:8px">'+
          '<input class="input" id="codeA" placeholder="e.g. A 1234567" value="'+esc(d.codeA)+'" oninput="wizSet(\'sample.codeA\',this.value);drawBarcode()" />'+
          '<button class="btn ghost" style="flex:0 0 auto" onclick="scanBottle(\'A\')">Scan</button>'+
        '</div></div>'+
      '<div class="field"><label class="label">BOTTLE B CODE</label>'+
        '<div class="row" style="gap:8px">'+
          '<input class="input" id="codeB" placeholder="e.g. B 1234567" value="'+esc(d.codeB)+'" oninput="wizSet(\'sample.codeB\',this.value);drawBarcode()" />'+
          '<button class="btn ghost" style="flex:0 0 auto" onclick="scanBottle(\'B\')">Scan</button>'+
        '</div></div>'+
    '</div>'+
    '<div class="card pad mb-16" style="background:var(--bg-soft)">'+
      '<div class="row-b mb-12"><span class="label" style="margin:0">KIT BARCODE</span>'+
        '<span class="badge '+(d.codeA&&d.codeB?"green":"slate")+'">'+(d.codeA&&d.codeB?"Both bottles recorded":"Awaiting scan")+'</span></div>'+
      '<div class="barcode" id="barcode"></div>'+
      '<p class="muted mt-8" style="font-size:11.5px;margin:8px 0 0">Prototype: the Scan button simulates a barcode reader. '+
        'A production build would use the device camera or a paired scanner.</p>'+
    '</div>'+
    '<div class="grid-2">'+
      fld("COLLECTION TIME","sample.time",{type:"time"})+
      fld("SAMPLE TYPE","sample.type",{type:"select",options:["Urine","Blood","Both"]})+
    '</div>';
}
function scanBottle(which){
  var code = which + " " + (1000000 + Math.floor(Math.random()*8999999));
  wizSet("sample.code"+which, code);
  var el = $("#code"+which);
  if(el) el.value = code;
  drawBarcode();
  var badge = $("#wizBody .badge");
  UI.toast("Bottle " + which + " scanned · " + code);
  var d = Wiz.data.sample;
  if(d.codeA && d.codeB){
    var b = $("#wizBody .card .badge");
    if(b){ b.className = "badge green"; b.textContent = "Both bottles recorded"; }
  }
}
function drawBarcode(){
  var el = $("#barcode");
  if(!el) return;
  var seed = (Wiz.data.sample.codeA + Wiz.data.sample.codeB) || "";
  if(!seed){ el.innerHTML = '<span class="muted" style="font-size:12.5px">No code scanned yet</span>'; return; }
  var h = 0, bars = "";
  for(var i=0;i<seed.length;i++) h = (h*31 + seed.charCodeAt(i)) >>> 0;
  for(var j=0;j<58;j++){
    h = (h * 1103515245 + 12345) >>> 0;
    var w = 1 + (h % 4);
    var pale = (h >> 8) % 3 === 0;
    bars += '<i style="width:'+w+'px;opacity:'+(pale?".25":"1")+'"></i>';
  }
  el.innerHTML = bars;
}

/* --- step 5: declaration --- */
function wizStep5(){
  return '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">Athlete declaration</h4>'+
    '<p class="muted mb-24" style="font-size:14px">The athlete declares everything taken recently. This is their protection as much as the agency\'s record.</p>'+
    fld("CURRENT MEDICATIONS","decl.meds",{type:"textarea",placeholder:"Medicine, dose, route and approximate date taken. Include anything taken in the last 7 days."})+
    fld("SUPPLEMENTS","decl.supps",{type:"textarea",placeholder:"Product name, brand, batch number where known."})+
    fld("MEDICAL CONDITIONS / TUE","decl.conditions",{type:"textarea",placeholder:"Relevant conditions and any approved Therapeutic Use Exemption reference."})+
    fld("COMMENTS OR CONCERNS","decl.comments",{type:"textarea",placeholder:"Any irregularity in the procedure the athlete wishes to record."})+
    '<div class="info-card warn"><h4>⚠️ Declare everything</h4>'+
      '<p>Under strict liability the athlete is responsible for any prohibited substance found in the sample. '+
      'A complete declaration is the strongest evidence available if a finding later needs to be explained.</p></div>'+
    '<button class="btn soft block mt-16" onclick="go(\'athlete/check\')">'+ICON.search+' Check a medicine before declaring</button>';
}

/* --- step 6: signatures --- */
function wizStep6(){
  var who = [
    {k:"athlete", label:"Athlete", name:Wiz.data.ath.name || "Athlete"},
    {k:"officer", label:"Doping Control Officer", name:Wiz.data.comp.officer || Store.s.officerName},
    {k:"witness", label:"Witness", name:Wiz.data.notify.witness || "Witness"}
  ].map(function(w){
    var signed = !!Wiz.data.sig[w.k];
    return '<div class="field">'+
      '<div class="row-b mb-8"><label class="label" style="margin:0">'+esc(w.label.toUpperCase())+' — '+esc(w.name)+'</label>'+
        '<div class="row" style="gap:8px">'+
          (signed ? '<span class="badge green">Signed</span>' : '<span class="badge slate">Not signed</span>')+
          '<button class="btn ghost sm" onclick="clearSig(\''+w.k+'\')">Clear</button>'+
        '</div></div>'+
      '<div class="sigpad'+(signed?" signed":"")+'" data-sig="'+w.k+'">'+
        '<canvas></canvas><div class="sig-hint">Draw signature here</div>'+
      '</div></div>';
  }).join("");

  return '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">Digital signatures</h4>'+
    '<p class="muted mb-24" style="font-size:14px">Each party signs directly on screen using a finger, stylus or mouse.</p>'+
    who+
    '<div class="src-note"><span>'+ICON.info+'</span><span>Signatures are captured as images and held only on this device in the prototype. '+
      'A production system would bind them cryptographically to the submitted form.</span></div>';
}

function initSigPads(){
  $$(".sigpad").forEach(function(pad){
    var key = pad.dataset.sig;
    var canvas = pad.querySelector("canvas");
    var dpr = window.devicePixelRatio || 1;
    var rect = pad.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.floor(150 * dpr);
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#0B1B34";

    // restore an existing signature
    if(Wiz.data.sig[key]){
      var img = new Image();
      img.onload = function(){ ctx.drawImage(img, 0, 0, rect.width, 150); };
      img.src = Wiz.data.sig[key];
    }

    var drawing = false, last = null;
    function pos(e){
      var r = canvas.getBoundingClientRect();
      return {x:e.clientX - r.left, y:e.clientY - r.top};
    }
    canvas.addEventListener("pointerdown", function(e){
      drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId);
      pad.classList.add("signed");
      e.preventDefault();
    });
    canvas.addEventListener("pointermove", function(e){
      if(!drawing) return;
      var p = pos(e);
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p;
      e.preventDefault();
    });
    function end(){
      if(!drawing) return;
      drawing = false;
      Wiz.data.sig[key] = canvas.toDataURL("image/png");
      var badge = pad.parentNode.querySelector(".badge");
      if(badge){ badge.className = "badge green"; badge.textContent = "Signed"; }
    }
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointerleave", end);
    canvas.addEventListener("pointercancel", end);
  });
}
function clearSig(key){
  Wiz.data.sig[key] = null;
  Router.render();
}

/* --- step 7: review --- */
function wizStep7(){
  var d = Wiz.data;
  function sec(title, rows){
    return '<div class="review-sec"><h5>'+esc(title)+'</h5><dl class="kv">'+
      rows.map(function(r){ return '<dt>'+esc(r[0])+'</dt><dd>'+(r[1] ? esc(r[1]) : '<span class="muted">Not recorded</span>')+'</dd>'; }).join("")+
    '</dl></div>';
  }
  var sigs = ["athlete","officer","witness"].map(function(k){
    var label = k === "athlete" ? "Athlete" : (k === "officer" ? "Officer" : "Witness");
    return '<div style="flex:1;min-width:150px">'+
      '<div class="label">'+label.toUpperCase()+'</div>'+
      (d.sig[k]
        ? '<img src="'+d.sig[k]+'" alt="'+label+' signature" style="width:100%;height:70px;object-fit:contain;border:1px solid var(--line);border-radius:10px;background:var(--bg)" />'
        : '<div class="empty" style="padding:20px;border:1px dashed var(--line);border-radius:10px"><p style="font-size:12px">Not signed</p></div>')+
    '</div>';
  }).join("");

  var ref = "DCF-" + new Date().getFullYear() + "-" + String(500 + (Store.s.submittedTests||[]).length).padStart(4,"0");

  return '<div class="row-b wrap mb-16"><div>'+
      '<h4 style="font-size:16px;font-weight:750">Review and submit</h4>'+
      '<p class="muted" style="font-size:14px;margin-top:4px">Check every field before submitting. Once submitted the form is locked.</p></div>'+
      '<span class="badge blue">'+esc(ref)+'</span></div>'+
    sec("Competition information", [
      ["Competition", d.comp.name], ["Venue", d.comp.venue],
      ["Date", d.comp.date ? fmtDate(d.comp.date) : ""], ["Test type", d.comp.type], ["Officer", d.comp.officer]
    ])+
    sec("Athlete information", [
      ["Name", d.ath.name], ["Athlete ID", d.ath.id], ["Sport", d.ath.sport], ["Federation", d.ath.fed],
      ["Date of birth", d.ath.dob ? fmtDate(d.ath.dob) : ""], ["Gender", d.ath.gender],
      ["Nationality", d.ath.nat], ["Passport / National ID", d.ath.nic]
    ])+
    sec("Notification", [
      ["Time notified", d.notify.time], ["Location", d.notify.location],
      ["Officer", d.notify.officer], ["Witness", d.notify.witness]
    ])+
    sec("Sample collection", [
      ["Bottle A", d.sample.codeA], ["Bottle B", d.sample.codeB],
      ["Collection time", d.sample.time], ["Sample type", d.sample.type]
    ])+
    sec("Athlete declaration", [
      ["Medications", d.decl.meds], ["Supplements", d.decl.supps],
      ["Medical conditions / TUE", d.decl.conditions], ["Comments", d.decl.comments]
    ])+
    '<div class="review-sec"><h5>Digital signatures</h5>'+
      '<div class="row wrap" style="gap:14px;align-items:stretch">'+sigs+'</div></div>'+
    '<div class="info-card mt-16"><h4>'+ICON.info+' Before you submit</h4>'+
      '<p>Confirm the bottle codes on the form match the codes on the sealed kit, and that the athlete has read and signed the declaration. '+
      'A copy of the completed form must be given to the athlete.</p></div>';
}

/* --- wizard navigation --- */
function wizValidate(step){
  var d = Wiz.data;
  if(step === 1){
    if(!d.comp.name.trim()){ UI.toast("Enter the competition name"); return false; }
    if(!d.comp.venue.trim()){ UI.toast("Enter the venue"); return false; }
  }
  if(step === 2){
    if(!d.ath.name.trim()){ UI.toast("Enter the athlete's name"); return false; }
    if(!d.ath.sport){ UI.toast("Select the athlete's sport"); return false; }
  }
  if(step === 4){
    if(!d.sample.codeA.trim() || !d.sample.codeB.trim()){
      UI.toast("Record both bottle codes — use Scan to simulate"); return false;
    }
  }
  return true;
}
function wizNext(){
  if(!wizValidate(Wiz.step)) return;
  if(Wiz.step < 7){ Wiz.step++; Router.render(); }
}
function wizPrev(){ if(Wiz.step > 1){ Wiz.step--; Router.render(); } }
function wizGo(n){
  if(n > Wiz.step){ for(var s=Wiz.step; s<n; s++){ if(!wizValidate(s)){ Wiz.step = s; Router.render(); return; } } }
  Wiz.step = n; Router.render();
}
function wizCancel(){
  UI.modal('<h3>Discard this test?</h3>'+
    '<p>All information entered in this workflow will be lost. This cannot be undone.</p>'+
    '<div class="row" style="gap:10px;justify-content:flex-end">'+
      '<button class="btn ghost" onclick="UI.closeModal()">Keep editing</button>'+
      '<button class="btn danger" onclick="wizDiscard()">Discard</button></div>');
}
function wizDiscard(){ Wiz = null; UI.closeModal(); go("officer"); }

function wizSubmit(){
  var d = Wiz.data;
  if(!d.sig.athlete || !d.sig.officer){
    UI.toast("Athlete and officer signatures are required");
    Wiz.step = 6; Router.render(); return;
  }
  var ref = "DCF-" + new Date().getFullYear() + "-" + String(500 + (Store.s.submittedTests||[]).length).padStart(4,"0");
  var rec = {
    id:ref, athlete:d.ath.name, athleteId:d.ath.id || "—", sport:d.ath.sport,
    comp:d.comp.name, venue:d.comp.venue, date:d.comp.date, type:d.comp.type,
    sample:d.sample.type, status:"Submitted", officer:d.comp.officer
  };
  Store.s.submittedTests = [rec].concat(Store.s.submittedTests || []);
  Store.save();
  Wiz = null;
  UI.modal(
    '<div class="center"><div class="cert-seal" style="width:72px;height:72px;font-size:32px">✓</div>'+
    '<h3>Submitted to SLADA</h3>'+
    '<p>Doping control form <b>'+esc(ref)+'</b> has been submitted and is awaiting review. '+
    'A copy should now be provided to the athlete.</p>'+
    '<div class="row" style="gap:10px;justify-content:center">'+
      '<button class="btn ghost" onclick="UI.closeModal();window.print()">'+ICON.dl+' Download PDF</button>'+
      '<button class="btn" onclick="UI.closeModal();go(\'officer\')">Done</button>'+
    '</div></div>'
  );
}

Officer.afterNewTest = function(){
  if(!Wiz) return;
  if(Wiz.step === 4) drawBarcode();
  if(Wiz.step === 6) initSigPads();
};
