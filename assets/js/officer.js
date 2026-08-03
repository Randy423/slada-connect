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
    '<div class="field"><label class="label" for="lgUser">OFFICER ID OR EMAIL</label>'+
      '<input class="input" id="lgUser" placeholder="d.rajapaksa@example.lk" autocomplete="off" /></div>'+
    '<div class="field"><label class="label" for="lgPass">PASSWORD</label>'+
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
    return '<tr '+act("viewTest", x.id)+'>'+
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
      '<span class="q-t">New Doping Control Form</span><span class="q-s">Digital doping control form</span></button>',
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
    return '<tr '+act("viewTest", x.id)+'>'+
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
  // Quoting alone does not stop Excel evaluating a leading =, +, - or @ as
  // a formula. Prefix those with an apostrophe so they import as text.
  function cell(v){
    var s = String(v == null ? "" : v);
    if(/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g,'""') + '"';
  }
  var lines = [head.map(cell).join(",")].concat(all.map(function(x){
    return [x.id,x.athlete,x.sport,x.comp,x.venue,x.date,x.type,x.sample,x.status,x.officer||""]
      .map(cell).join(",");
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
              return '<tr '+act("viewTest", x.id)+'><td class="cell-strong">'+esc(x.id)+'</td>'+
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
   Register New Test — digital Doping Control Form
   --------------------------------------------------------------------------
   Mirrors the SLADA paper DCF field for field. The paper form is organised
   into four numbered sections; the steps below follow that numbering so an
   officer who knows the paper form recognises every screen.

   Bilingual labels are taken from the form itself.
   ========================================================================== */
var WIZ_STEPS = [
  {n:1, t:"Authorities"},
  {n:2, t:"1 · Notification"},
  {n:3, t:"2 · Athlete"},
  {n:4, t:"3 · Analysis"},
  {n:5, t:"3 · Samples"},
  {n:6, t:"3 · Declaration"},
  {n:7, t:"4 · Confirmation"},
  {n:8, t:"Review"}
];

var Wiz = null;
function newWiz(){
  var SLADA = "Sri Lanka Anti-Doping Agency";
  return {
    step:1,
    data:{
      auth:{ testing:SLADA, collection:SLADA, results:SLADA, mission:"", formNo:"", event:"" },
      notify:{ family:"", given:"", dob:"", nationality:"Sri Lankan", docType:"", docNo:"",
               reqUrine:true, reqBlood:false, date:todayISO(), time:nowTime(),
               dcoName:Store.s.officerName, dcoSig:null, athleteSig:null },
      info:{ arrival:nowTime(), street:"", city:"", province:"", country:"Sri Lanka",
             tel:"", email:"", doctor:"", coach:"" },
      analysis:{ testType:"In-Competition", collectionDate:todayISO(), gender:"", sport:"", discipline:"" },
      partial:[{no:"",vol:"",sealed:"",initials:""},{no:"",vol:"",sealed:"",initials:""}],
      samples:[{type:"U", vol:"", sealed:"", code:"", sg:"", witness:""}],
      decl:{ meds:"", suppNo:"", research:"" },
      confirm:{ comments:"", suppNo:"", repName:"", repPosition:"", repSig:null,
                dcoName:Store.s.officerName, dcoSig:null, date:todayISO(),
                completed:"", athleteSig:null },
      athleteId:""
    }
  };
}

/* ---------- field helpers ---------- */
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

/* label with the Sinhala wording used on the paper form */
function lbl(en, si){
  return esc(en) + (si ? ' <span style="font-weight:600;color:var(--faint)">· '+esc(si)+'</span>' : '');
}

function fld(label, path, opts){
  opts = opts || {};
  var val = wizGet(path);
  var id = "f_" + path.replace(/[^\w]/g, "_");
  var lab = '<label class="label" for="'+id+'">'+label+'</label>';
  if(opts.type === "select"){
    return '<div class="field">'+lab+
      '<select id="'+id+'" class="select" onchange="wizSet(\''+path+'\',this.value)">'+
        (opts.placeholder ? '<option value=""'+(!val?" selected":"")+'>'+esc(opts.placeholder)+'</option>' : "")+
        opts.options.map(function(o){ return '<option'+(val===o?" selected":"")+'>'+esc(o)+'</option>'; }).join("")+
      '</select></div>';
  }
  if(opts.type === "textarea"){
    return '<div class="field">'+lab+
      '<textarea id="'+id+'" class="textarea" style="min-height:'+(opts.h||96)+'px" placeholder="'+esc(opts.placeholder||"")+'" '+
      'oninput="wizSet(\''+path+'\',this.value)">'+esc(val)+'</textarea></div>';
  }
  return '<div class="field">'+lab+
    '<input id="'+id+'" class="input" type="'+(opts.type||"text")+'" placeholder="'+esc(opts.placeholder||"")+'" '+
    'value="'+esc(val)+'" oninput="wizSet(\''+path+'\',this.value)" /></div>';
}

function sigField(label, path){
  var signed = !!wizGet(path);
  return '<div class="field">'+
    '<div class="row-b mb-8"><label class="label" style="margin:0">'+label+'</label>'+
      '<div class="row" style="gap:8px">'+
        (signed ? '<span class="badge green">Signed</span>' : '<span class="badge slate">Not signed</span>')+
        '<button class="btn ghost sm" '+act("clearSig", path)+'>Clear</button></div></div>'+
    '<div class="sigpad'+(signed?" signed":"")+'" data-sig="'+esc(path)+'">'+
      '<canvas></canvas><div class="sig-hint">Draw signature here</div></div>'+
  '</div>';
}

/* ---------- step 1 · authorities and mission ---------- */
function wizStep1(){
  return '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">Authorities</h4>'+
    '<p class="muted mb-24" style="font-size:14px">The three authorities printed at the head of the form, and the test mission this sample belongs to.</p>'+
    fld(lbl("TESTING AUTHORITY","පරීක්ෂණ බලධාරිය"),"auth.testing")+
    fld(lbl("SAMPLE COLLECTION AUTHORITY","සාම්පල ලබාගැනීමේ බලධාරිය"),"auth.collection")+
    fld(lbl("RESULTS MANAGEMENT AUTHORITY","ප්‍රතිඵල කළමනාකරණ බලධාරිය"),"auth.results")+
    '<div class="grid-2">'+
      fld(lbl("TEST MISSION CODE","පරීක්ෂණ මෙහෙවර කේත අංකය"),"auth.mission",{placeholder:"e.g. SLADA-2026-0412"})+
      fld(lbl("FORM NUMBER","ආකෘති පත්‍ර අංකය"),"auth.formNo",{placeholder:"Pre-printed number, e.g. 201"})+
    '</div>'+
    fld("EVENT OR COMPETITION","auth.event",{placeholder:"For SLADA scheduling records"})+
    '<div class="src-note"><span>'+ICON.info+'</span><span>Event or competition is <b>not a field on the DCF</b> — it is captured here only so the test appears correctly in SLADA\'s own scheduling and reporting views.</span></div>';
}

/* ---------- step 2 · section 1, athlete notification ---------- */
function wizStep2(){
  var d = Wiz.data.notify;
  return '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">1 · Athlete Notification'+
      ' <span style="font-weight:600;color:var(--faint);font-size:13px">· ක්‍රීඩකයා/ක්‍රීඩිකාව හට දැනුම් දීම</span></h4>'+
    '<p class="muted mb-16" style="font-size:14px">Search the register to fill these automatically, or enter them by hand.</p>'+
    '<div class="search-inline mb-16" style="height:46px"><span style="color:var(--faint)">'+ICON.search+'</span>'+
      '<input placeholder="Search athlete by name, sport or ID" value="'+esc(wizAthQuery)+'" oninput="wizAthSearch(this.value)" /></div>'+
    '<div id="wizAthResults">'+wizAthResults(wizAthMatches())+'</div>'+
    '<div class="divider"></div>'+
    '<div class="grid-2">'+
      fld(lbl("FAMILY NAME","වාසගම"),"notify.family")+
      fld(lbl("GIVEN NAME","නම"),"notify.given")+
    '</div>'+
    '<div class="grid-2">'+
      fld(lbl("DATE OF BIRTH","උපන් දිනය"),"notify.dob",{type:"date"})+
      fld(lbl("NATIONALITY","ජාතිය"),"notify.nationality")+
    '</div>'+
    '<div class="grid-2">'+
      fld(lbl("DOCUMENT TYPE","ලේඛන වර්ගය"),"notify.docType",{type:"select",placeholder:"Select",options:["National ID","Passport","Driving Licence","Federation ID","Other"]})+
      fld(lbl("DOCUMENT NUMBER","ලේඛන අංකය"),"notify.docNo")+
    '</div>'+

    '<div class="label mt-8">'+lbl("TYPE OF SAMPLE REQUIRED","අවශ්‍ය සාම්පල වර්ගය")+'</div>'+
    '<div class="row wrap mb-16" style="gap:10px">'+
      '<button class="chip'+(d.reqUrine?" on":"")+'" '+act("wizToggle","notify.reqUrine")+'>Urine · මුත්‍රා</button>'+
      '<button class="chip'+(d.reqBlood?" on":"")+'" '+act("wizToggle","notify.reqBlood")+'>Blood · රුධිර</button>'+
    '</div>'+

    '<div class="grid-2">'+
      fld(lbl("DATE","දිනය"),"notify.date",{type:"date"})+
      fld(lbl("TIME","වේලාව"),"notify.time",{type:"time"})+
    '</div>'+
    fld(lbl("DCO / CHAPERONE NAME","උත්තේජක පාලන නිලධාරි නම"),"notify.dcoName")+
    sigField(lbl("DCO / CHAPERONE SIGNATURE","නිලධාරි අත්සන"),"notify.dcoSig")+

    '<div class="info-card mt-8"><h4>Athlete acknowledgement</h4>'+
      '<p style="font-size:13.5px">I hereby acknowledge that I have received and read this notice, including the athlete rights and responsibilities text on the overleaf of Copy 4, and I consent to provide sample(s) as requested. I understand that failure or refusal to provide a sample may constitute an anti-doping rule violation.</p>'+
    '</div>'+
    sigField(lbl("ATHLETE'S SIGNATURE","ක්‍රීඩකයා/ක්‍රීඩිකාවගේ අත්සන"),"notify.athleteSig");
}

var wizAthQuery = "";
function wizAthMatches(){
  var q = wizAthQuery.toLowerCase();
  if(!q) return [];
  return ATHLETES.filter(function(a){
    return (a.name+" "+a.sport+" "+a.id).toLowerCase().indexOf(q) !== -1;
  }).slice(0,5);
}
function wizAthResults(matches){
  if(!wizAthQuery) return '<p class="muted" style="font-size:13px;padding:2px">Start typing to search the athlete register.</p>';
  if(!matches.length) return '<div class="info-card"><p class="muted" style="font-size:13.5px;margin:0">No athlete found. Enter the details below — the record will be created when the form is submitted.</p></div>';
  return '<div class="card" style="padding:4px 16px">'+matches.map(function(a){
    return '<button class="listrow" '+act("wizPickAthlete", a.id)+'>'+
      '<span class="avatar sm">'+esc(initials(a.name))+'</span>'+
      '<span class="grow"><span class="lr-t" style="display:block">'+esc(a.name)+'</span>'+
      '<span class="lr-s" style="display:block">'+esc(a.sport)+' · '+esc(a.id)+'</span></span>'+
      '<span class="badge blue">Select</span></button>';
  }).join("")+'</div>';
}
function wizAthSearch(v){
  wizAthQuery = v;
  var el = $("#wizAthResults");
  if(el) el.innerHTML = wizAthResults(wizAthMatches());
}
registerAction("wizPickAthlete", function(id){
  var a = null;
  for(var i=0;i<ATHLETES.length;i++){ if(ATHLETES[i].id === id){ a = ATHLETES[i]; break; } }
  if(!a) return;
  var parts = a.name.split(" ");
  var d = Wiz.data;
  d.athleteId = a.id;
  d.notify.given = parts.slice(0,-1).join(" ") || a.name;
  d.notify.family = parts.length > 1 ? parts[parts.length-1] : "";
  d.notify.dob = a.dob;
  d.notify.nationality = a.nat;
  d.notify.docType = "National ID";
  d.notify.docNo = a.nic;
  d.analysis.sport = a.sport;
  d.analysis.gender = a.gender;
  wizAthQuery = "";
  Router.render();
  UI.toast("Athlete loaded from register");
});
registerAction("wizToggle", function(path){
  wizSet(path, !wizGet(path));
  Router.render();
});
registerAction("clearSig", function(path){ wizSet(path, null); Router.render(); });

/* ---------- step 3 · section 2, athlete information ---------- */
function wizStep3(){
  return '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">2 · Athlete Information'+
      ' <span style="font-weight:600;color:var(--faint);font-size:13px">· ක්‍රීඩකයාගේ තොරතුරු</span></h4>'+
    '<p class="muted mb-24" style="font-size:14px">Contact details for results management, and the athlete\'s doctor and coach.</p>'+
    fld(lbl("ARRIVAL TIME AT DOPING CONTROL STATION","උත්තේජක පාලන ස්ථානයට පැමිණි වේලාව"),"info.arrival",{type:"time"})+
    fld(lbl("NUMBER / STREET","අංකය / විදිය"),"info.street")+
    '<div class="grid-2">'+
      fld(lbl("CITY / TOWN","නගරය"),"info.city")+
      fld(lbl("STATE / PROVINCE","පළාත"),"info.province")+
    '</div>'+
    '<div class="grid-2">'+
      fld(lbl("COUNTRY","රට"),"info.country")+
      fld(lbl("CONTACT TEL","දුරකථන අංකය"),"info.tel",{type:"tel"})+
    '</div>'+
    fld(lbl("E-MAIL","විද්‍යුත් තැපැල්"),"info.email",{type:"email"})+
    '<div class="grid-2">'+
      fld(lbl("DOCTOR'S NAME","වෛද්‍යවරයාගේ නම"),"info.doctor")+
      fld(lbl("COACH'S NAME","පුහුණුකරුගේ නම"),"info.coach")+
    '</div>';
}

/* ---------- step 4 · section 3, information for analysis ---------- */
function wizStep4(){
  var d = Wiz.data.analysis;
  return '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">3 · Information for Analysis'+
      ' <span style="font-weight:600;color:var(--faint);font-size:13px">· විශ්ලේෂණය සඳහා තොරතුරු</span></h4>'+
    '<p class="muted mb-16" style="font-size:14px">Sent to the laboratory with the sample.</p>'+
    '<div class="label">'+lbl("TEST TYPE","පරීක්ෂණ වර්ගය")+'</div>'+
    '<div class="row wrap mb-16" style="gap:10px">'+
      ['In-Competition','Out-of-Competition'].map(function(o){
        return '<button class="chip'+(d.testType===o?" on":"")+'" '+act("wizTestType", o)+'>'+esc(o)+'</button>';
      }).join("")+
    '</div>'+
    fld(lbl("SAMPLE COLLECTION DATE","සාම්පල ලබාගත් දිනය"),"analysis.collectionDate",{type:"date"})+
    '<div class="label">'+lbl("GENDER","ස්ත්‍රී/පුරුෂ භාවය")+'</div>'+
    '<div class="row wrap mb-16" style="gap:10px">'+
      ['Male','Female'].map(function(o){
        return '<button class="chip'+(d.gender===o?" on":"")+'" '+act("wizGender", o)+'>'+esc(o)+'</button>';
      }).join("")+
    '</div>'+
    '<div class="grid-2">'+
      fld(lbl("SPORT","ක්‍රීඩාව"),"analysis.sport",{type:"select",placeholder:"Select sport",options:SPORTS})+
      fld(lbl("DISCIPLINE","ක්‍රීඩා අංශය"),"analysis.discipline",{placeholder:"e.g. 400m, 50m rifle"})+
    '</div>';
}
registerAction("wizTestType", function(v){ wizSet("analysis.testType", v); Router.render(); });
registerAction("wizGender", function(v){ wizSet("analysis.gender", v); Router.render(); });

/* ---------- step 5 · section 3, partial samples and sample table ---------- */
function wizStep5(){
  var d = Wiz.data;

  var partials = d.partial.map(function(p, i){
    return '<div class="card pad mb-12" style="background:var(--bg-soft)">'+
      '<div class="row-b mb-12"><b style="font-size:13.5px">Partial sample '+(i+1)+'</b></div>'+
      '<div class="grid-2">'+
        fld("PARTIAL SAMPLE NUMBER","partial."+i+".no")+
        fld("VOL (ml)","partial."+i+".vol",{type:"number"})+
      '</div>'+
      '<div class="grid-2">'+
        fld("TIME SEALED","partial."+i+".sealed",{type:"time"})+
        fld("ATHLETE / DCO INITIALS","partial."+i+".initials")+
      '</div>'+
    '</div>';
  }).join("");

  var rows = d.samples.map(function(s, i){
    return '<div class="card pad mb-12">'+
      '<div class="row-b mb-12">'+
        '<b style="font-size:13.5px">Sample '+(i+1)+'</b>'+
        '<div class="row" style="gap:8px">'+
          '<button class="chip'+(s.type==="U"?" on":"")+'" '+act("wizSampleType", i+":U")+'>U · මුත්‍රා</button>'+
          '<button class="chip'+(s.type==="B"?" on":"")+'" '+act("wizSampleType", i+":B")+'>B · රුධිර</button>'+
          (d.samples.length>1 ? '<button class="iconbtn" '+act("wizRemoveSample", i)+' aria-label="Remove sample">'+ICON.x+'</button>' : '')+
        '</div></div>'+
      '<div class="grid-2">'+
        fld(lbl("SAMPLE CODE NUMBER","සාම්පල කේත අංකය"),"samples."+i+".code")+
        fld(lbl("VOL (ml)","පරිමාව"),"samples."+i+".vol",{type:"number",placeholder:"90 minimum for urine"})+
      '</div>'+
      '<div class="grid-2">'+
        fld(lbl("TIME SEALED","මුද්‍රා තැබූ වේලාව"),"samples."+i+".sealed",{type:"time"})+
        fld(lbl("SPECIFIC GRAVITY","විශිෂ්ට ගුරුත්වය"),"samples."+i+".sg",{placeholder:"e.g. 1.021"})+
      '</div>'+
      fld(lbl("URINE SAMPLE WITNESS / BCO NAME","සාක්ෂිකරුගේ නම"),"samples."+i+".witness")+
      (s.type==="U" && s.vol && +s.vol < 90
        ? '<div class="info-card warn"><h4>⚠️ Below 90 ml</h4><p>A urine sample under 90 ml is not suitable for analysis. Record the partial sample above and continue collection.</p></div>'
        : "")+
      (s.type==="U" && s.sg && parseFloat(s.sg) > 0 && parseFloat(s.sg) < 1.005
        ? '<div class="info-card warn"><h4>⚠️ Specific gravity below 1.005</h4><p>This sample may be too dilute for analysis. Follow the suitability procedure before releasing the athlete.</p></div>'
        : "")+
    '</div>';
  }).join("");

  return '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">3 · Samples'+
      ' <span style="font-weight:600;color:var(--faint);font-size:13px">· සාම්පල</span></h4>'+
    '<p class="muted mb-16" style="font-size:14px">Record any partial samples first, then each sealed sample.</p>'+
    '<div class="section-h" style="margin-top:0">'+lbl("PARTIAL SAMPLE","අර්ධ සාම්පල")+'</div>'+
    partials+
    '<div class="section-h">Sealed samples</div>'+
    rows+
    (d.samples.length < 4
      ? '<button class="btn ghost block" '+act("wizAddSample")+'>'+ICON.plus+' Add another sample</button>'
      : '<p class="muted center" style="font-size:12.5px">The paper form holds four sample rows.</p>');
}
registerAction("wizAddSample", function(){
  if(Wiz.data.samples.length < 4){
    Wiz.data.samples.push({type:"U", vol:"", sealed:"", code:"", sg:"", witness:""});
    Router.render();
  }
});
registerAction("wizRemoveSample", function(i){
  Wiz.data.samples.splice(+i,1); Router.render();
});
registerAction("wizSampleType", function(arg){
  var p = String(arg).split(":");
  Wiz.data.samples[+p[0]].type = p[1];
  Router.render();
});

/* ---------- step 6 · section 3, declaration and consent ---------- */
function wizStep6(){
  var research = Wiz.data.decl.research;
  return '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">3 · Declaration of Medication Use and Blood Transfusions</h4>'+
    '<p class="muted mb-16" style="font-size:14px">List any prescription or non-prescription medications or supplements — for example beta-2 agonists and glucocorticoids — taken over the past 7 days, including dosage and the date last taken where possible. If a blood sample was collected, list any blood transfusions received over the last three months.</p>'+
    fld(lbl("DECLARATION","ප්‍රකාශය"),"decl.meds",{type:"textarea",h:150,placeholder:"Medicine or supplement, dose, route, date last taken. Enter “None” if nothing was taken."})+
    '<button class="btn soft block mb-16" '+act("go","athlete/check")+'>'+ICON.search+' Check a medicine before declaring</button>'+
    fld("SUPPLEMENTARY REPORT FORM NUMBER","decl.suppNo",{placeholder:"If used"})+

    '<div class="section-h">'+lbl("CONSENT FOR RESEARCH","පර්යේෂණ සඳහා කැමැත්ත")+'</div>'+
    '<div class="info-card mb-12"><p style="font-size:13.5px">I consent for my sample to be used in anonymous research (see overleaf).</p></div>'+
    '<div class="row wrap" style="gap:10px">'+
      '<button class="chip'+(research==="accept"?" on":"")+'" '+act("wizResearch","accept")+'>I accept · මා පිළිගනිමි</button>'+
      '<button class="chip'+(research==="refuse"?" on":"")+'" '+act("wizResearch","refuse")+'>I refuse · මා ප්‍රතික්ෂේප කරමි</button>'+
    '</div>';
}
registerAction("wizResearch", function(v){ wizSet("decl.research", v); Router.render(); });

/* ---------- step 7 · section 4, confirmation ---------- */
function wizStep7(){
  return '<h4 style="font-size:16px;font-weight:750;margin-bottom:6px">4 · Confirmation of Procedure'+
      ' <span style="font-weight:600;color:var(--faint);font-size:13px">· ක්‍රියාපටිපාටිය සනාථ කිරීම</span></h4>'+
    '<p class="muted mb-24" style="font-size:14px">Comments, the athlete\'s representative, and the closing signatures.</p>'+
    fld(lbl("COMMENTS","අදහස්"),"confirm.comments",{type:"textarea",placeholder:"Any comments should be noted here. If necessary continue on a supplementary report form."})+
    fld("SUPPLEMENTARY REPORT FORM NUMBER","confirm.suppNo",{placeholder:"If used"})+

    '<div class="section-h">'+lbl("ATHLETE REPRESENTATIVE","ක්‍රීඩකයාගේ නියෝජිතයා")+'</div>'+
    '<div class="grid-2">'+
      fld(lbl("NAME","නම"),"confirm.repName")+
      fld(lbl("POSITION","තනතුර"),"confirm.repPosition")+
    '</div>'+
    sigField(lbl("REPRESENTATIVE SIGNATURE","නියෝජිත අත්සන"),"confirm.repSig")+

    '<div class="section-h">'+lbl("DOPING CONTROL OFFICER","උත්තේජක පාලන නිලධාරියා")+'</div>'+
    fld(lbl("NAME","නම"),"confirm.dcoName")+
    '<div class="grid-2">'+
      fld(lbl("DATE","දිනය"),"confirm.date",{type:"date"})+
      fld(lbl("TIME OF COMPLETION","සම්පූර්ණ කළ වේලාව"),"confirm.completed",{type:"time"})+
    '</div>'+
    sigField(lbl("DCO SIGNATURE","නිලධාරි අත්සන"),"confirm.dcoSig")+

    '<div class="info-card mt-8"><h4>Athlete declaration</h4>'+
      '<p style="font-size:13.5px">I declare that the information I have given on this document is correct. I declare that, subject to comments made in Section 4, sample collection was conducted in accordance with the relevant procedures for sample collection. I accept that all information related to doping control, including but not limited to laboratory results and possible sanctions, shall be shared with relevant bodies in accordance with the World Anti-Doping Code. I have read and understood the text overleaf and I consent to the processing of my personal data through ADAMS.</p>'+
    '</div>'+
    sigField(lbl("ATHLETE'S SIGNATURE","ක්‍රීඩකයාගේ අත්සන"),"confirm.athleteSig");
}

/* ---------- step 8 · review ---------- */
function wizStep8(){
  var d = Wiz.data;
  function sec(title, rows){
    return '<div class="review-sec"><h5>'+esc(title)+'</h5><dl class="kv">'+
      rows.filter(Boolean).map(function(r){
        return '<dt>'+esc(r[0])+'</dt><dd>'+(r[1] ? esc(r[1]) : '<span class="muted">Not recorded</span>')+'</dd>';
      }).join("")+'</dl></div>';
  }
  function sig(label, path){
    var v = wizGet(path);
    return '<div style="flex:1 1 150px;min-width:140px">'+
      '<div class="label">'+esc(label)+'</div>'+
      (v ? '<img src="'+v+'" alt="'+esc(label)+'" style="width:100%;height:64px;object-fit:contain;border:1px solid var(--line);border-radius:10px;background:var(--bg)" />'
         : '<div style="padding:18px;border:1px dashed var(--line);border-radius:10px;text-align:center;font-size:12px" class="muted">Not signed</div>')+
    '</div>';
  }

  var sampleRows = d.samples.map(function(s,i){
    return '<div class="review-sec"><h5>Sample '+(i+1)+' — '+(s.type==="U"?"Urine":"Blood")+'</h5><dl class="kv">'+
      '<dt>Sample code number</dt><dd>'+(s.code?esc(s.code):'<span class="muted">Not recorded</span>')+'</dd>'+
      '<dt>Volume (ml)</dt><dd>'+(s.vol?esc(s.vol):'<span class="muted">Not recorded</span>')+'</dd>'+
      '<dt>Time sealed</dt><dd>'+(s.sealed?esc(s.sealed):'<span class="muted">Not recorded</span>')+'</dd>'+
      '<dt>Specific gravity</dt><dd>'+(s.sg?esc(s.sg):'<span class="muted">Not recorded</span>')+'</dd>'+
      '<dt>Witness / BCO</dt><dd>'+(s.witness?esc(s.witness):'<span class="muted">Not recorded</span>')+'</dd>'+
    '</dl></div>';
  }).join("");

  var usedPartials = d.partial.filter(function(p){ return p.no || p.vol || p.sealed; });

  return '<div class="row-b wrap mb-16"><div>'+
      '<h4 style="font-size:16px;font-weight:750">Review the completed form</h4>'+
      '<p class="muted" style="font-size:14px;margin-top:4px">Check every field before submitting. Once submitted the form is locked.</p></div>'+
      '<span class="badge blue">'+esc(d.auth.formNo ? "Form " + d.auth.formNo : "Doping Control Form")+'</span></div>'+

    sec("Authorities", [
      ["Testing authority", d.auth.testing],
      ["Sample collection authority", d.auth.collection],
      ["Results management authority", d.auth.results],
      ["Test mission code", d.auth.mission],
      ["Event / competition", d.auth.event]
    ])+
    sec("1 · Athlete notification", [
      ["Family name", d.notify.family],
      ["Given name", d.notify.given],
      ["Date of birth", d.notify.dob ? fmtDate(d.notify.dob) : ""],
      ["Nationality", d.notify.nationality],
      ["Document", [d.notify.docType, d.notify.docNo].filter(Boolean).join(" · ")],
      ["Sample required", [d.notify.reqUrine?"Urine":"", d.notify.reqBlood?"Blood":""].filter(Boolean).join(" + ")],
      ["Notified", [d.notify.date ? fmtDate(d.notify.date) : "", d.notify.time].filter(Boolean).join(" at ")],
      ["DCO / chaperone", d.notify.dcoName]
    ])+
    sec("2 · Athlete information", [
      ["Arrival at station", d.info.arrival],
      ["Address", [d.info.street, d.info.city, d.info.province, d.info.country].filter(Boolean).join(", ")],
      ["Telephone", d.info.tel],
      ["E-mail", d.info.email],
      ["Doctor", d.info.doctor],
      ["Coach", d.info.coach]
    ])+
    sec("3 · Information for analysis", [
      ["Test type", d.analysis.testType],
      ["Sample collection date", d.analysis.collectionDate ? fmtDate(d.analysis.collectionDate) : ""],
      ["Gender", d.analysis.gender],
      ["Sport", d.analysis.sport],
      ["Discipline", d.analysis.discipline]
    ])+
    (usedPartials.length
      ? usedPartials.map(function(p,i){
          return sec("Partial sample "+(i+1), [
            ["Partial sample number", p.no], ["Volume (ml)", p.vol],
            ["Time sealed", p.sealed], ["Athlete / DCO initials", p.initials]
          ]);
        }).join("")
      : "")+
    sampleRows+
    sec("3 · Declaration", [
      ["Medications / supplements / transfusions", d.decl.meds],
      ["Supplementary report form", d.decl.suppNo],
      ["Consent for research", d.decl.research === "accept" ? "Accepted" : (d.decl.research === "refuse" ? "Refused" : "")]
    ])+
    sec("4 · Confirmation", [
      ["Comments", d.confirm.comments],
      ["Supplementary report form", d.confirm.suppNo],
      ["Athlete representative", [d.confirm.repName, d.confirm.repPosition].filter(Boolean).join(" · ")],
      ["Doping control officer", d.confirm.dcoName],
      ["Date", d.confirm.date ? fmtDate(d.confirm.date) : ""],
      ["Time of completion", d.confirm.completed]
    ])+
    '<div class="review-sec"><h5>Signatures</h5>'+
      '<div class="row wrap" style="gap:14px;align-items:stretch">'+
        sig("Athlete (notification)","notify.athleteSig")+
        sig("DCO / chaperone","notify.dcoSig")+
        sig("Representative","confirm.repSig")+
        sig("DCO (confirmation)","confirm.dcoSig")+
        sig("Athlete (declaration)","confirm.athleteSig")+
      '</div></div>'+

    '<div class="info-card mt-16"><h4>'+ICON.info+' Copy distribution</h4>'+
      '<p style="font-size:13.5px">Original — ADO (white) · Copy 1 — Athlete (pink) · Copy 2 — Laboratory (yellow) · '+
      'Copy 3 — Laboratory (blue) · Copy 4 — Athlete notification (green)</p>'+
      '<p style="font-size:12.5px;margin-top:8px" class="muted">In a digital submission these become the athlete\'s PDF copy, the laboratory record and the agency record.</p>'+
    '</div>';
}

/* ---------- validation ---------- */
var REQUIRED = [
  {step:1, path:"auth.testing",             label:"testing authority"},
  {step:1, path:"auth.collection",          label:"sample collection authority"},
  {step:1, path:"auth.mission",             label:"test mission code"},
  {step:2, path:"notify.family",            label:"athlete family name"},
  {step:2, path:"notify.given",             label:"athlete given name"},
  {step:2, path:"notify.dob",               label:"athlete date of birth"},
  {step:2, path:"notify.nationality",       label:"nationality"},
  {step:2, path:"notify.docType",           label:"document type"},
  {step:2, path:"notify.docNo",             label:"document number"},
  {step:2, path:"notify.date",              label:"notification date"},
  {step:2, path:"notify.time",              label:"notification time"},
  {step:2, path:"notify.dcoName",           label:"DCO / chaperone name"},
  {step:3, path:"info.arrival",             label:"arrival time at the doping control station"},
  {step:4, path:"analysis.collectionDate",  label:"sample collection date"},
  {step:4, path:"analysis.gender",          label:"gender"},
  {step:4, path:"analysis.sport",           label:"sport"},
  {step:6, path:"decl.meds",                label:"medication declaration (enter “None” if nothing was taken)"},
  {step:7, path:"confirm.dcoName",          label:"doping control officer name"},
  {step:7, path:"confirm.date",             label:"date of completion"},
  {step:7, path:"confirm.completed",        label:"time of completion"}
];

function wizValidate(step){
  var d = Wiz.data;
  for(var i=0;i<REQUIRED.length;i++){
    if(REQUIRED[i].step !== step) continue;
    if(!String(wizGet(REQUIRED[i].path) || "").trim()){
      UI.toast("Missing: " + REQUIRED[i].label); return false;
    }
  }
  if(step === 2){
    if(!d.notify.reqUrine && !d.notify.reqBlood){ UI.toast("Select the type of sample required"); return false; }
    if(!d.notify.athleteSig){ UI.toast("The athlete must sign the notification"); return false; }
    if(!d.notify.dcoSig){ UI.toast("The DCO or chaperone must sign the notification"); return false; }
  }
  if(step === 5){
    for(var s=0;s<d.samples.length;s++){
      var sm = d.samples[s];
      if(!String(sm.code||"").trim()){ UI.toast("Sample "+(s+1)+": enter the sample code number"); return false; }
      if(!String(sm.vol||"").trim()){ UI.toast("Sample "+(s+1)+": enter the volume"); return false; }
      if(!String(sm.sealed||"").trim()){ UI.toast("Sample "+(s+1)+": enter the time sealed"); return false; }
      if(sm.type === "U" && !String(sm.sg||"").trim()){ UI.toast("Sample "+(s+1)+": enter the specific gravity"); return false; }
    }
  }
  if(step === 6 && !d.decl.research){ UI.toast("Record the athlete's research consent"); return false; }
  if(step === 7){
    if(!d.confirm.dcoSig){ UI.toast("The doping control officer must sign"); return false; }
    if(!d.confirm.athleteSig){ UI.toast("The athlete must sign the declaration"); return false; }
  }
  return true;
}

/* ---------- shell ---------- */
Officer.newTest = function(){
  if(!Wiz) Wiz = newWiz();
  var step = Wiz.step;
  var pct = Math.round((step-1)/(WIZ_STEPS.length-1)*100);

  var stepper = WIZ_STEPS.map(function(s){
    var cls = s.n === step ? "step on" : (s.n < step ? "step done" : "step");
    return '<button class="'+cls+'" '+act("wizGo", s.n)+'>'+
      '<span class="st-n">'+(s.n < step ? "✓" : s.n)+'</span>'+esc(s.t)+'</button>';
  }).join("");

  var body = [wizStep1,wizStep2,wizStep3,wizStep4,wizStep5,wizStep6,wizStep7,wizStep8][step-1]();

  return '<div class="row-b wrap mb-8">'+
      '<div><h1 style="font-size:clamp(20px,3vw,27px);font-weight:820">Doping Control Form</h1>'+
      '<p class="muted mt-8" style="font-size:14px">Step '+step+' of '+WIZ_STEPS.length+' · '+esc(WIZ_STEPS[step-1].t)+'</p></div>'+
      '<button class="btn ghost sm" '+act("wizCancel")+'>'+ICON.x+' Cancel</button>'+
    '</div>'+
    '<div class="stepper">'+stepper+'</div>'+
    '<div class="wizard-bar"><i style="width:'+pct+'%"></i></div>'+
    '<div class="card pad" id="wizBody">'+body+'</div>'+
    '<div class="wiz-foot">'+
      (step > 1 ? '<button class="btn ghost" '+act("wizPrev")+'>'+ICON.back+' Back</button>' : '<span></span>')+
      (step < WIZ_STEPS.length
        ? '<button class="btn" '+act("wizNext")+'>Continue '+ICON.arrow+'</button>'
        : '<div class="row" style="gap:10px"><button class="btn ghost" onclick="window.print()">'+ICON.dl+' Download PDF</button>'+
          '<button class="btn green" '+act("wizSubmit")+'>'+ICON.shield+' Submit to SLADA</button></div>')+
    '</div>';
};

registerAction("wizNext", function(){
  if(!wizValidate(Wiz.step)) return;
  if(Wiz.step < WIZ_STEPS.length){ Wiz.step++; Router.render(); }
});
registerAction("wizPrev", function(){ if(Wiz.step > 1){ Wiz.step--; Router.render(); } });
registerAction("wizGo", function(n){
  n = +n;
  if(n > Wiz.step){
    for(var s=Wiz.step; s<n; s++){ if(!wizValidate(s)){ Wiz.step = s; Router.render(); return; } }
  }
  Wiz.step = n; Router.render();
});
registerAction("wizCancel", function(){
  UI.modal('<h3>Discard this form?</h3>'+
    '<p>Everything entered in this doping control form will be lost. This cannot be undone.</p>'+
    '<div class="row" style="gap:10px;justify-content:flex-end">'+
      '<button class="btn ghost" onclick="UI.closeModal()">Keep editing</button>'+
      '<button class="btn danger" '+act("wizDiscard")+'>Discard</button></div>');
});
registerAction("wizDiscard", function(){ Wiz = null; UI.closeModal(); go("officer"); });

registerAction("wizSubmit", function(){
  for(var s=1;s<=7;s++){
    if(!wizValidate(s)){ Wiz.step = s; Router.render(); return; }
  }
  var d = Wiz.data;
  var name = (d.notify.given + " " + d.notify.family).trim();
  var ref = "DCF-" + new Date().getFullYear() + "-" + String(500 + (Store.s.submittedTests||[]).length).padStart(4,"0");

  // an athlete entered by hand is added to the register, as step 2 promises
  if(!d.athleteId){
    d.athleteId = "ATH-" + (4000 + ATHLETES.length);
    ATHLETES.push({
      id:d.athleteId, name:name, sport:d.analysis.sport,
      fed:SPORT_FED[d.analysis.sport] || "—",
      dob:d.notify.dob, gender:d.analysis.gender || "—",
      nat:d.notify.nationality || "—", nic:d.notify.docNo || "—",
      status:"Active", tests:0, last:d.analysis.collectionDate
    });
  }
  var athRec = null;
  for(var i=0;i<ATHLETES.length;i++){ if(ATHLETES[i].id === d.athleteId){ athRec = ATHLETES[i]; break; } }
  if(athRec){ athRec.tests = (athRec.tests||0) + 1; athRec.last = d.analysis.collectionDate; }

  var types = {};
  d.samples.forEach(function(s){ types[s.type === "B" ? "Blood" : "Urine"] = 1; });
  var sampleLabel = Object.keys(types).join(" + ") || "Urine";

  Store.s.submittedTests = [{
    id:ref, athlete:name, athleteId:d.athleteId, sport:d.analysis.sport,
    comp:d.auth.event || d.auth.mission || "Test mission",
    venue:[d.info.city, d.info.country].filter(Boolean).join(", ") || "—",
    date:d.analysis.collectionDate, type:d.analysis.testType,
    sample:sampleLabel, status:"Submitted", officer:d.confirm.dcoName,
    mission:d.auth.mission, formNo:d.auth.formNo,
    codes:d.samples.map(function(s){ return s.code; }).filter(Boolean).join(", ")
  }].concat(Store.s.submittedTests || []);
  Store.save();
  Wiz = null;

  UI.modal(
    '<div class="center"><div class="cert-seal" style="width:70px;height:70px;font-size:30px">✓</div>'+
    '<h3>Submitted to SLADA</h3>'+
    '<p>Doping control form <b>'+esc(ref)+'</b> has been submitted and is awaiting review. '+
    'The athlete should now be given their copy.</p>'+
    '<div class="row" style="gap:10px;justify-content:center">'+
      '<button class="btn ghost" onclick="UI.closeModal();window.print()">'+ICON.dl+' Download PDF</button>'+
      '<button class="btn" onclick="UI.closeModal();go(\'officer\')">Done</button>'+
    '</div></div>'
  );
});

/* ---------- signature pads (path-addressed) ---------- */
function initSigPads(){
  $$(".sigpad").forEach(function(pad){
    if(pad.dataset.bound) return;
    pad.dataset.bound = "1";
    var path = pad.getAttribute("data-sig");
    var canvas = pad.querySelector("canvas");
    var dpr = window.devicePixelRatio || 1;
    var rect = pad.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.floor(150 * dpr);
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#0B1B34";

    var existing = wizGet(path);
    if(existing){
      var img = new Image();
      img.onload = function(){ ctx.drawImage(img, 0, 0, rect.width, 150); };
      img.src = existing;
    }

    var drawing = false, last = null;
    function pos(e){
      var r = canvas.getBoundingClientRect();
      return {x:e.clientX - r.left, y:e.clientY - r.top};
    }
    canvas.addEventListener("pointerdown", function(e){
      drawing = true; last = pos(e);
      try{ canvas.setPointerCapture(e.pointerId); }catch(err){}
      pad.classList.add("signed");
      e.preventDefault();
    });
    canvas.addEventListener("pointermove", function(e){
      if(!drawing) return;
      var p = pos(e);
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p; e.preventDefault();
    });
    function end(){
      if(!drawing) return;
      drawing = false;
      wizSet(path, canvas.toDataURL("image/png"));
      var badge = pad.parentNode.querySelector(".badge");
      if(badge){ badge.className = "badge green"; badge.textContent = "Signed"; }
    }
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointerleave", end);
    canvas.addEventListener("pointercancel", end);
  });
}

Officer.afterNewTest = function(){
  if(!Wiz) return;
  initSigPads();
};
