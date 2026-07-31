/* ==========================================================================
   SLADA Connect — core
   Router, shell, state, UI primitives, charts, drug-database layer.
   ========================================================================== */

function $(sel, root){ return (root||document).querySelector(sel); }
function $$(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

function esc(s){
  return String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
/* ==========================================================================
   Delegated actions
   --------------------------------------------------------------------------
   esc() is an HTML escaper, NOT a JavaScript-string escaper. Interpolating
   it into an inline handler — onclick="fn('<data>')" — is unsafe, because
   the HTML parser decodes &#39; back to an apostrophe before the JavaScript
   is compiled, letting the value break out of its string literal.

   Anything derived from user input, a URL or a third-party API is therefore
   passed as a data-* attribute (a genuine HTML attribute context, where
   esc() is correct) and dispatched from a single delegated listener.
   ========================================================================== */
var ACTIONS = {};
function registerAction(name, fn){ ACTIONS[name] = fn; }

/* build the attribute pair for a delegated handler */
function act(name, arg){
  return 'data-action="' + esc(name) + '"' +
         (arg == null ? "" : ' data-arg="' + esc(String(arg)) + '"');
}

document.addEventListener("click", function(e){
  var t = e.target;
  if(!t || !t.closest) return;
  var el = t.closest("[data-action]");
  if(!el) return;
  var fn = ACTIONS[el.getAttribute("data-action")];
  if(typeof fn !== "function") return;
  e.preventDefault();
  fn(el.getAttribute("data-arg"), el, e);
});

function initials(name){
  return String(name||"").split(/\s+/).map(function(w){ return w[0]||""; }).join("").slice(0,2).toUpperCase();
}
function fmtDate(iso){
  if(!iso) return "—";
  var d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if(isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", {day:"numeric", month:"short", year:"numeric"});
}
function todayISO(){ return new Date().toISOString().slice(0,10); }

/* display label for the signed-in athlete's discipline */
function sportLabel(){
  var s = Store.s.sport || "";
  var e = Store.s.event || "";
  return s + (e ? " — " + e : "");
}

/* ---------- sport-specific compatibility ----------
   Returns how a substance's status applies to one particular sport.
   P1 beta-blockers are the only class whose status genuinely differs by
   sport; everything else is identical for every athlete, and saying so
   plainly is more useful than implying the rules vary. */
function sportVerdict(rule, sport){
  if(!sport){
    return {level:"unknown", title:"No sport on your profile",
      body:"Add your sport to your profile to see how this substance applies to your discipline."};
  }
  if(rule && rule.sportDependent){
    var listed = P1_SPORTS.indexOf(sport) !== -1;
    if(listed){
      var alsoOut = P1_ALSO_OUT_OF_COMP.indexOf(sport) !== -1;
      return {level:"restricted", title:"Restricted in " + sport,
        body:"Beta-blockers are prohibited in competition in " + sport +
          (alsoOut ? ", and in " + sport + " they are prohibited out of competition as well" : "") +
          ". Your sport is on the P1 list, so this class applies to you where it would not apply to most athletes. " +
          "If this is prescribed for a heart or blood pressure condition, you will need a Therapeutic Use Exemption approved before competing."};
    }
    return {level:"clear", title:"Not restricted in " + sport,
      body:"Beta-blockers are prohibited only in listed precision sports such as archery, shooting and golf. " + sport +
        " is not one of them, so this class carries no sport-specific restriction for you. Confirm on Global DRO, which asks for your sport for exactly this reason."};
  }
  return {level:"same", title:"Applies to " + sport + ", and to every sport",
    body:"This status is the same for all athletes regardless of discipline. Beta-blockers are the only class on the Prohibited List whose status changes by sport, so nothing here is specific to " + sport + "."};
}
function nowTime(){
  var d = new Date();
  return String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
}

/* ==========================================================================
   Store
   ========================================================================== */
var DEFAULT_STATE = {
  athleteAuth:false,
  athleteGuest:false,
  athleteName:"Randhir Senaratne",
  sport:"Athletics",
  event:"400m",
  athleteFed:"Sri Lanka Athletics",
  athleteEmail:"randhir@example.lk",
  athleteDob:"1999-04-12",
  athleteGender:"Male",
  athleteNat:"Sri Lankan",
  athleteId:"ATH-1042",
  recent:["Panadol","Ibuprofen","Cetirizine","Sudafed"],
  viewedLocal:["panadol","sudafed"],
  viewedOther:[],
  readArticles:[],
  quizBest:null,
  quizTaken:0,
  theme:"light",
  lang:"en",
  officerAuth:false,
  officerName:"D. Rajapaksa",
  readNotifs:[],
  submittedTests:[],
  prefs:{emailNotif:true, pushNotif:true, testAlerts:true, eduAlerts:false, analytics:true}
};

var Store = {
  s:null,
  load:function(){
    try{
      var raw = localStorage.getItem("slada.state");
      this.s = raw ? Object.assign({}, DEFAULT_STATE, JSON.parse(raw)) : JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.s.prefs = Object.assign({}, DEFAULT_STATE.prefs, this.s.prefs || {});
    }catch(e){ this.s = JSON.parse(JSON.stringify(DEFAULT_STATE)); }
    return this.s;
  },
  save:function(){
    try{ localStorage.setItem("slada.state", JSON.stringify(this.s)); }catch(e){}
  },
  reset:function(){
    this.s = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  }
};
Store.load();

/* ==========================================================================
   i18n + theme
   ========================================================================== */
function t(key){
  var L = I18N[Store.s.lang] || I18N.en;
  return L[key] || I18N.en[key] || key;
}
function applyTheme(){
  document.documentElement.setAttribute("data-theme", Store.s.theme === "dark" ? "dark" : "light");
  var m = document.querySelector('meta[name="theme-color"]');
  if(m) m.setAttribute("content", Store.s.theme === "dark" ? "#0D1626" : "#ffffff");
}
applyTheme();

/* ==========================================================================
   Icons
   ========================================================================== */
var ICON = {
  home:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.2 12 3.5l9 6.7V20a1.4 1.4 0 0 1-1.4 1.4H4.4A1.4 1.4 0 0 1 3 20v-9.8Z"/><path d="M9.2 21V13h5.6v8"/></svg>',
  search:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/></svg>',
  book:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.4A1.4 1.4 0 0 1 4.4 4H9a3 3 0 0 1 3 3v13a2.4 2.4 0 0 0-2.4-2.4H4.4A1.4 1.4 0 0 1 3 16.2V5.4Z"/><path d="M21 5.4A1.4 1.4 0 0 0 19.6 4H15a3 3 0 0 0-3 3v13a2.4 2.4 0 0 1 2.4-2.4h5.2a1.4 1.4 0 0 0 1.4-1.4V5.4Z"/></svg>',
  brain:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 0 0-6 .5A2.6 2.6 0 0 0 4 8a2.7 2.7 0 0 0 .6 1.7A2.8 2.8 0 0 0 4 12a2.8 2.8 0 0 0 1.5 2.5A2.7 2.7 0 0 0 8 19a3 3 0 0 0 4-.5Z"/><path d="M12 5a3 3 0 0 1 6 .5A2.6 2.6 0 0 1 20 8a2.7 2.7 0 0 1-.6 1.7A2.8 2.8 0 0 1 20 12a2.8 2.8 0 0 1-1.5 2.5A2.7 2.7 0 0 1 16 19a3 3 0 0 1-4-.5Z"/></svg>',
  doc:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v5h5"/><path d="M14 3H6.4A1.4 1.4 0 0 0 5 4.4v15.2A1.4 1.4 0 0 0 6.4 21h11.2a1.4 1.4 0 0 0 1.4-1.4V8Z"/><path d="M9 13h6M9 17h4"/></svg>',
  clip:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="4" rx="1.2"/><path d="M16 5h2.2A1.8 1.8 0 0 1 20 6.8v12.4A1.8 1.8 0 0 1 18.2 21H5.8A1.8 1.8 0 0 1 4 19.2V6.8A1.8 1.8 0 0 1 5.8 5H8"/><path d="M9 12h6M9 16h4"/></svg>',
  phone:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16.5v2.8a1.7 1.7 0 0 1-1.9 1.7 17 17 0 0 1-14.4-14.4A1.7 1.7 0 0 1 6.4 4.7h2.8a1.7 1.7 0 0 1 1.7 1.5c.1 1 .35 2 .7 2.9a1.7 1.7 0 0 1-.4 1.8l-1.2 1.2a14 14 0 0 0 5.4 5.4l1.2-1.2a1.7 1.7 0 0 1 1.8-.4c.9.35 1.9.6 2.9.7a1.7 1.7 0 0 1 1.5 1.7Z"/></svg>',
  user:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/></svg>',
  bell:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 14 18 8Z"/><path d="M13.7 19a2 2 0 0 1-3.4 0"/></svg>',
  gear:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></svg>',
  grid:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/></svg>',
  flask:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 3v6.2L4.6 17a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3l-4.9-7.8V3"/><path d="M8 3h8M7.5 14h9"/></svg>',
  plus:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  users:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.6"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.6 3.6 0 0 1 0 6.8M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/></svg>',
  chart:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16.5A1.5 1.5 0 0 0 4.5 21H21"/><path d="M7.5 15.5v-3M12 15.5v-7M16.5 15.5v-5"/></svg>',
  back:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19 8 12l7-7"/></svg>',
  chev:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
  arrow:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
  tick:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.6 4.6L19 6.5"/></svg>',
  menu:'<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  x:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  info:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9.2"/><path d="M12 11v5M12 7.6h.01"/></svg>',
  shield:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M12 3 5 6v6c0 5.2 3 9.7 7 11 4-1.3 7-5.8 7-11V6Z"/><path d="m9 12 2 2 4-4"/></svg>',
  logout:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2"/><path d="M19 12H9m10 0-3-3m3 3-3 3"/></svg>',
  dl:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
  logo:'<svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M12 2.5 4.5 5.6v5.6c0 5.1 3.2 9.8 7.5 11 4.3-1.2 7.5-5.9 7.5-11V5.6Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="m8.6 12.1 2.5 2.5 4.4-4.9" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

/* ==========================================================================
   UI primitives
   ========================================================================== */
var UI = {
  toastTimer:null,
  toast:function(msg){
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(function(){ el.classList.remove("show"); }, 2600);
  },
  _lastFocus:null,
  modal:function(html){
    this._lastFocus = document.activeElement;
    var m = $("#modal");
    m.innerHTML = html;
    $("#modalWrap").classList.add("open");
    $("#modalWrap").setAttribute("aria-hidden","false");

    // name the dialog from its own heading for screen readers
    var h = m.querySelector("h3");
    if(h){
      if(!h.id) h.id = "modalTitle";
      m.setAttribute("aria-labelledby", h.id);
    } else {
      m.removeAttribute("aria-labelledby");
    }
    var root = $("#root");
    if(root) root.setAttribute("inert","");
    UI._focusFirst(m);
  },
  closeModal:function(){
    $("#modalWrap").classList.remove("open");
    $("#modalWrap").setAttribute("aria-hidden","true");
    var root = $("#root");
    if(root) root.removeAttribute("inert");
    if(this._lastFocus && this._lastFocus.focus){ try{ this._lastFocus.focus(); }catch(e){} }
    this._lastFocus = null;
  },
  _focusables:function(el){
    return $$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', el)
      .filter(function(n){ return n.offsetParent !== null || n === document.activeElement; });
  },
  _focusFirst:function(el){
    var f = UI._focusables(el);
    if(f.length) { try{ f[0].focus(); }catch(e){} }
    else { el.setAttribute("tabindex","-1"); try{ el.focus(); }catch(e){} }
  },
  sheet:function(html){
    $("#sheet").innerHTML = '<div class="grab"></div>' + html;
    $("#sheetWrap").classList.add("open");
    $("#sheetWrap").setAttribute("aria-hidden","false");
  },
  closeSheet:function(){
    $("#sheetWrap").classList.remove("open");
    $("#sheetWrap").setAttribute("aria-hidden","true");
  },
  confetti:function(){
    var wrap = document.createElement("div");
    wrap.className = "confetti";
    var colors = ["#0B57D0","#0E9F6E","#C77700","#6741D9","#8AB4F8"];
    for(var i=0;i<52;i++){
      var p = document.createElement("i");
      p.style.left = (Math.random()*100) + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random()*.8) + "s";
      p.style.animationDuration = (2.2 + Math.random()*1.5) + "s";
      wrap.appendChild(p);
    }
    document.body.appendChild(wrap);
    setTimeout(function(){ if(wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 4200);
  }
};

document.addEventListener("keydown", function(e){
  if(e.key === "Escape"){ UI.closeModal(); UI.closeSheet(); Shell.closeDrawer(); return; }

  // keep Tab inside an open dialog rather than letting it walk the page behind
  if(e.key !== "Tab") return;
  var wrap = $("#modalWrap").classList.contains("open") ? $("#modal")
           : ($("#sheetWrap").classList.contains("open") ? $("#sheet") : null);
  if(!wrap) return;
  var f = UI._focusables(wrap);
  if(!f.length) return;
  var first = f[0], last = f[f.length-1];
  if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
});

/* ==========================================================================
   Charts (hand-rolled, no dependencies)
   ========================================================================== */
var Chart = {
  bars:function(data, series, opts){
    opts = opts || {};
    var max = 0;
    data.forEach(function(d){
      var sum = series.reduce(function(a,s){ return a + (d[s.key]||0); }, 0);
      if(sum > max) max = sum;
    });
    max = max || 1;
    var cols = data.map(function(d){
      var segs = series.map(function(s){
        var v = d[s.key] || 0;
        var h = (v / max) * 100;
        return '<div class="bar-seg" style="height:'+h.toFixed(1)+'%;background:'+s.color+'" title="'+esc(s.label)+': '+v+'"></div>';
      }).join("");
      return '<div class="bar-col"><div class="bar-stack">'+segs+'</div><span class="bar-lbl">'+esc(d[opts.labelKey||"m"])+'</span></div>';
    }).join("");
    var legend = series.map(function(s){
      return '<span><i style="background:'+s.color+'"></i>'+esc(s.label)+'</span>';
    }).join("");
    return '<div class="bars">'+cols+'</div><div class="legend">'+legend+'</div>';
  },
  hbars:function(rows, opts){
    opts = opts || {};
    var max = rows.reduce(function(a,r){ return Math.max(a, r.n); }, 0) || 1;
    return rows.map(function(r){
      var pct = (r.n / max) * 100;
      return '<div class="hbar">'+
        '<div class="hbar-top"><b>'+esc(r.s)+'</b><span class="muted">'+r.n+'</span></div>'+
        '<div class="hbar-track"><div class="hbar-fill" style="width:'+pct.toFixed(1)+'%;background:'+r.c+'"></div></div>'+
      '</div>';
    }).join("");
  },
  ring:function(pct, size, stroke, color, mid){
    size = size || 120; stroke = stroke || 11;
    var r = (size - stroke) / 2;
    var circ = 2 * Math.PI * r;
    var dash = circ * Math.max(0, Math.min(1, pct));
    return '<div class="ring" style="width:'+size+'px;height:'+size+'px">'+
      '<svg width="'+size+'" height="'+size+'">'+
        '<circle cx="'+(size/2)+'" cy="'+(size/2)+'" r="'+r+'" fill="none" stroke="var(--bg-sunk)" stroke-width="'+stroke+'"/>'+
        '<circle cx="'+(size/2)+'" cy="'+(size/2)+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="'+stroke+'" '+
          'stroke-linecap="round" stroke-dasharray="'+dash.toFixed(2)+' '+circ.toFixed(2)+'"/>'+
      '</svg>'+
      '<div class="ring-mid">'+(mid||"")+'</div>'+
    '</div>';
  },
  donut:function(rows, size){
    size = size || 150;
    var total = rows.reduce(function(a,r){ return a + r.n; }, 0) || 1;
    var r = size/2 - 14, circ = 2*Math.PI*r, off = 0;
    var segs = rows.map(function(row){
      var frac = row.n/total, dash = circ*frac;
      var el = '<circle cx="'+(size/2)+'" cy="'+(size/2)+'" r="'+r+'" fill="none" stroke="'+row.c+'" stroke-width="22" '+
        'stroke-dasharray="'+dash.toFixed(2)+' '+(circ-dash).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'"/>';
      off += dash;
      return el;
    }).join("");
    return '<div class="ring" style="width:'+size+'px;height:'+size+'px"><svg width="'+size+'" height="'+size+'">'+segs+'</svg></div>';
  }
};

/* ==========================================================================
   Drug database layer  (RxNorm / RxNav + openFDA)
   These identify what a medicine IS. Neither publishes anti-doping status;
   that mapping is applied locally by RULES, and unmatched ingredients stay
   deliberately unclassified rather than being guessed at.
   ========================================================================== */
var API = { rxnav:"https://rxnav.nlm.nih.gov/REST", fda:"https://api.fda.gov/drug/label.json" };
var REMOTE_CACHE = {}, SUGG_CACHE = {}, LABEL_CACHE = {}, RNAME = {}, REMOTE_ERR = {};

function jget(url, ms){
  var ctl = new AbortController();
  var timer = setTimeout(function(){ ctl.abort(); }, ms || 9000);
  return fetch(url, {signal:ctl.signal}).then(function(r){
    clearTimeout(timer);
    if(!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  });
}

var DOSE_FORM = /\b(Oral Tablet|Oral Capsule|Oral Solution|Oral Suspension|Injectable Solution|Injection|Prefilled Syringe|Chewable Tablet|Extended Release|Delayed Release|Disintegrating|Topical Cream|Ointment|Inhalant|Inhalation|Metered Dose|Nasal Spray|Ophthalmic|Suppository|Transdermal|Patch|Powder|Granules|Syrup|Lotion|Gel|Kit|Pack|Pill)\b/i;

function suggScore(n){
  var s = 0;
  if(/\d/.test(n)) s += 4;
  if(/\b(MG|ML|MCG|UNT|%)\b/i.test(n)) s += 3;
  if(DOSE_FORM.test(n)) s += 3;
  if(/[\[\]]/.test(n)) s += 1;
  s += Math.min(n.length / 20, 3);
  return s;
}
function suggBase(n){
  return n.replace(/\s*\[[^\]]*\]\s*/g," ").replace(/\s*\bPill$/i,"").replace(/\s+/g," ").trim().toLowerCase();
}

function suggest(term){
  var key = term.toLowerCase();
  if(SUGG_CACHE[key]) return Promise.resolve(SUGG_CACHE[key]);
  return jget(API.rxnav + "/approximateTerm.json?term=" + encodeURIComponent(term) + "&maxEntries=30&option=1", 7000)
    .then(function(j){
      var cands = (j.approximateGroup && j.approximateGroup.candidate) || [];
      var named = [], seenName = {};
      cands.forEach(function(c){
        if(!c.name) return;
        var n = c.name.trim().replace(/\s*\bPill$/i,"");
        if(!/[a-z]/.test(n) && /\d/.test(n)) return;      // supplier abbreviation codes
        if(!n || seenName[n.toLowerCase()]) return;
        seenName[n.toLowerCase()] = 1;
        named.push({name:n, rxcui:c.rxcui, _s:suggScore(n)});
      });
      named.sort(function(a,b){ return a._s - b._s; });
      var seenBase = {}, out = [];
      named.forEach(function(c){
        var b = suggBase(c.name);
        if(seenBase[b]) return;
        seenBase[b] = 1;
        out.push({name:c.name, rxcui:c.rxcui});
      });
      out = out.slice(0,8);
      SUGG_CACHE[key] = out;
      return out;
    });
}

function cleanLabel(s){
  if(!s) return null;
  s = String(s).replace(/\s+/g," ").trim();
  s = s.replace(/^(\d+\s+)?(Purposes?|Uses?|Indications and Usage)\s*:?\s*/i,"");
  if(s.length > 280) s = s.slice(0,280).replace(/\s+\S*$/,"") + "…";
  return s || null;
}

function fetchLabel(ing){
  if(!ing) return Promise.resolve(null);
  var url = API.fda + "?search=openfda.generic_name:%22" + encodeURIComponent(ing) + "%22&limit=1";
  // openFDA answers "no match" with HTTP 404 — that is a result, not a
  // failure. Genuine network/timeout errors REJECT so the caller can retry
  // later rather than caching a miss forever.
  var ctl = new AbortController();
  var timer = setTimeout(function(){ ctl.abort(); }, 8000);
  return fetch(url, {signal:ctl.signal}).then(function(r){
    clearTimeout(timer);
    if(r.status === 404) return null;
    if(!r.ok) throw new Error("HTTP " + r.status);
    return r.json().then(function(j){
      var x = j.results && j.results[0];
      if(!x) return null;
      function one(v){ return Array.isArray(v) ? v[0] : v; }
      var o = x.openfda || {};
      return {
        purpose: cleanLabel(one(x.purpose)) || cleanLabel(one(x.indications_and_usage)),
        brands:  o.brand_name ? o.brand_name.slice(0,4).join(", ") : null,
        route:   o.route ? o.route.slice(0,3).join(", ").toLowerCase() : null,
        pharm:   o.pharm_class_epc ? o.pharm_class_epc.slice(0,2).join(", ") : null
      };
    });
  });
}

function lookupRx(rxcui, displayName){
  if(REMOTE_CACHE[rxcui]) return Promise.resolve(REMOTE_CACHE[rxcui]);
  var rec = {rxcui:rxcui, name:displayName || "Medication", ingredients:[], rule:null, status:"unclassified", label:null};

  // IN + PIN only. Including MIN pulls in every multi-ingredient combination
  // containing this ingredient (cetirizine also returns "cetirizine /
  // pseudoephedrine"), which corrupts the classification.
  return jget(API.rxnav + "/rxcui/" + rxcui + "/related.json?tty=IN+PIN", 9000)
    .then(function(j){
      var groups = (j.relatedGroup && j.relatedGroup.conceptGroup) || [];
      var names = [];
      groups.forEach(function(g){
        (g.conceptProperties || []).forEach(function(p){
          if(p.name && names.indexOf(p.name) === -1) names.push(p.name);
        });
      });
      rec.ingredients = names;

      var best = null;
      names.forEach(function(n){
        var r = classifyIngredient(n);
        if(r && (!best || SEVERITY[r.status] > SEVERITY[best.status])) best = r;
      });
      if(!best && displayName) best = classifyIngredient(displayName);

      rec.rule = best;
      rec.status = best ? best.status : "unclassified";
      rec.unmatched = names.filter(function(n){ return !classifyIngredient(n); });
      rec.partial = !!best && rec.unmatched.length > 0;

      // A product containing an ingredient we cannot classify must never
      // present as permitted — the badge is the signal athletes act on.
      if(rec.partial && (best.status === "permitted" || best.status === "monitored")){
        rec.status = "unclassified";
        rec.downgraded = true;
      }
      // label text is a nice-to-have; never let it fail the classification
      return fetchLabel(names[0] || displayName).catch(function(){ return null; });
    })
    .then(function(lab){
      rec.label = lab;
      REMOTE_CACHE[rxcui] = rec;
      return rec;
    });
}

/* ==========================================================================
   Shell (sidebar / topbar / drawer / tabbar)
   ========================================================================== */
var NAVS = {
  athlete:[
    {sec:"Portal"},
    {key:"athlete",               label:"Dashboard",        ic:"home"},
    {key:"athlete/check",         label:"Can I Take This?", ic:"search"},
    {key:"athlete/learn",         label:"Learn",            ic:"book"},
    {key:"athlete/quiz",          label:"Quiz",             ic:"brain"},
    {sec:"Reference"},
    {key:"athlete/prohibited",    label:"Prohibited List",  ic:"doc"},
    {key:"athlete/tue",           label:"TUE",              ic:"clip"},
    {key:"athlete/resources",     label:"Contact SLADA",    ic:"phone"},
    {sec:"Account"},
    {key:"athlete/notifications", label:"Notifications",    ic:"bell", badge:"notif"},
    {key:"athlete/profile",       label:"Profile",          ic:"user"},
    {key:"athlete/settings",      label:"Settings",         ic:"gear"}
  ],
  officer:[
    {sec:"Doping Control"},
    {key:"officer",               label:"Dashboard",        ic:"grid"},
    {key:"officer/new-test",      label:"Register New Test",ic:"plus"},
    {key:"officer/tests",         label:"Test Records",     ic:"flask"},
    {key:"officer/athletes",      label:"Athletes",         ic:"users"},
    {key:"officer/reports",       label:"Reports",          ic:"chart"},
    {sec:"Account"},
    {key:"officer/notifications", label:"Notifications",    ic:"bell", badge:"notif"},
    {key:"officer/settings",      label:"Settings",         ic:"gear"}
  ],
  admin:[
    {sec:"Overview"},
    {key:"admin",                 label:"Dashboard",        ic:"chart"},
    {key:"admin/athletes",        label:"Athlete Database", ic:"users"},
    {key:"admin/tests",           label:"Test Records",     ic:"flask"},
    {key:"admin/reports",         label:"Reports & Export", ic:"doc"},
    {sec:"Administration"},
    {key:"admin/users",           label:"Manage Users",     ic:"shield"},
    {key:"admin/notifications",   label:"Notifications",    ic:"bell", badge:"notif"},
    {key:"admin/settings",        label:"Settings",         ic:"gear"}
  ]
};

var ROLE_META = {
  athlete:{name:"SLADA Connect", role:"Athlete Portal"},
  officer:{name:"SLADA Connect", role:"Officer Portal"},
  admin:{name:"SLADA Connect", role:"Administration"}
};

var TABBAR = [
  {key:"athlete",         label:"home",    ic:"home"},
  {key:"athlete/check",   label:"search",  ic:"search"},
  {key:"athlete/learn",   label:"learn",   ic:"book"},
  {key:"athlete/profile", label:"profile", ic:"user"}
];

function unreadCount(){
  return NOTIFICATIONS.filter(function(n){
    return n.unread && Store.s.readNotifs.indexOf(n.id) === -1;
  }).length;
}

var Shell = {
  role:null,
  build:function(role){
    var meta = ROLE_META[role];
    var nav = NAVS[role].map(function(item){
      if(item.sec) return '<div class="sb-sec">'+esc(item.sec)+'</div>';
      var badge = "";
      if(item.badge === "notif"){
        var n = unreadCount();
        if(n) badge = '<span class="sl-badge">'+n+'</span>';
      }
      return '<button class="sb-link" data-key="'+item.key+'" onclick="go(\''+item.key+'\')">'+
        '<span class="sl-ic">'+ICON[item.ic]+'</span><span>'+esc(item.label)+'</span>'+badge+
      '</button>';
    }).join("");

    var who = role === "athlete" ? Store.s.athleteName : (role === "officer" ? Store.s.officerName : "A. Mendis");
    var sub = role === "athlete" ? sportLabel() : (role === "officer" ? "Doping Control Officer" : "System Administrator");

    var tabs = TABBAR.map(function(tb){
      return '<button class="tab" data-key="'+tb.key+'" onclick="go(\''+tb.key+'\')">'+
        ICON[tb.ic]+'<span>'+esc(t(tb.label))+'</span></button>';
    }).join("");

    return ''+
    '<div class="shell">'+
      '<aside class="sidebar" id="sidebar">'+
        '<div class="sb-brand">'+
          '<span class="sb-mark">'+ICON.logo+'</span>'+
          '<span><span class="sb-name">'+esc(meta.name)+'</span><span class="sb-role" style="display:block">'+esc(meta.role)+'</span></span>'+
        '</div>'+
        '<nav class="sb-nav">'+nav+'</nav>'+
        '<div class="sb-foot">'+
          '<button class="sb-user" onclick="go(\''+role+(role==="athlete"?"/profile":"/settings")+'\')">'+
            '<span class="avatar">'+esc(initials(who))+'</span>'+
            '<span class="grow"><span style="display:block;font-size:13.5px;font-weight:650" class="truncate">'+esc(who)+'</span>'+
            '<span style="display:block;font-size:11.5px" class="muted truncate">'+esc(sub)+'</span></span>'+
          '</button>'+
          '<button class="sb-link mt-8" onclick="go(\'\')"><span class="sl-ic">'+ICON.logout+'</span><span>Exit portal</span></button>'+
        '</div>'+
      '</aside>'+
      '<div class="main">'+
        '<header class="topbar">'+
          '<button class="iconbtn hamburger" onclick="Shell.toggleDrawer()" aria-label="Menu">'+ICON.menu+'</button>'+
          '<div class="grow" id="tbText"></div>'+
          '<div class="tb-actions" id="tbActions"></div>'+
        '</header>'+
        '<main class="content" id="content"></main>'+
      '</div>'+
    '</div>'+
    (role === "athlete" ? '<nav class="tabbar">'+tabs+'</nav>' : '');
  },
  toggleDrawer:function(){
    var sb = $("#sidebar");
    if(!sb) return;
    var open = sb.classList.toggle("open");
    if(open){
      var s = document.createElement("div");
      s.className = "scrim"; s.id = "scrim";
      s.onclick = Shell.closeDrawer;
      document.body.appendChild(s);
    } else { Shell.closeDrawer(); }
  },
  closeDrawer:function(){
    var sb = $("#sidebar"); if(sb) sb.classList.remove("open");
    var s = $("#scrim"); if(s) s.remove();
  },
  setActive:function(key){
    $$(".sb-link[data-key]").forEach(function(el){
      el.classList.toggle("on", el.dataset.key === key);
    });
    $$(".tabbar .tab").forEach(function(el){
      el.classList.toggle("on", el.dataset.key === key);
    });
  },
  setTop:function(meta){
    var txt = $("#tbText");
    if(txt){
      txt.innerHTML = '<div class="tb-title">'+esc(meta.title||"")+'</div>'+
        (meta.sub ? '<div class="tb-sub">'+esc(meta.sub)+'</div>' : "");
    }
    var act = $("#tbActions");
    if(act){
      var n = unreadCount();
      act.innerHTML = (meta.actions || "") +
        '<button class="iconbtn" onclick="toggleTheme()" aria-label="Toggle theme" title="Toggle theme">'+
          (Store.s.theme === "dark"
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a6.9 6.9 0 0 0 11.1 11.1Z"/></svg>')+
        '</button>'+
        '<button class="iconbtn" style="position:relative" onclick="go(\''+(Shell.role||"athlete")+'/notifications\')" aria-label="Notifications">'+ICON.bell+
          (n ? '<span style="position:absolute;top:6px;right:6px;width:8px;height:8px;border-radius:50%;background:var(--red-600);border:2px solid var(--bg)"></span>' : "")+
        '</button>';
    }
  }
};

function toggleTheme(){
  Store.s.theme = Store.s.theme === "dark" ? "light" : "dark";
  Store.save(); applyTheme(); Router.render();
}

/* ==========================================================================
   Router
   ========================================================================== */
var ROUTES = {};
function route(key, def){ ROUTES[key] = def; }

var Router = {
  current:"",
  parse:function(){
    var h = location.hash.replace(/^#\/?/, "");
    var segs = h.split("/").filter(Boolean);
    return segs;
  },
  keyOf:function(segs){
    if(!segs.length) return "";
    if(segs.length === 1) return segs[0];
    var two = segs[0] + "/" + segs[1];
    if(ROUTES[two]) return two;
    return ROUTES[segs[0]] ? segs[0] : two;
  },
  render:function(){
    // In-page anchors ("#features") are not routes. Without this they fall
    // through to the unknown-route redirect and throw the visitor back to
    // the landing page mid-scroll.
    var raw = location.hash;
    if(raw && raw.charAt(1) !== "/" && raw.length > 1){
      var el = document.getElementById(raw.slice(1));
      if(el){ el.scrollIntoView({behavior:"smooth", block:"start"}); return; }
    }
    var segs = this.parse();
    var key = this.keyOf(segs);
    var arg = segs.length > 2 ? segs.slice(2).join("/") : (ROUTES[key] ? null : segs[1]);
    var def = ROUTES[key];

    if(!def){ location.hash = "#/"; return; }

    // officer portal requires sign-in
    if(def.role === "officer" && key !== "officer/login" && !Store.s.officerAuth){
      location.hash = "#/officer/login"; return;
    }
    // athlete portal requires an account (or an explicit guest session)
    if(def.role === "athlete" && !def.open && !Store.s.athleteAuth){
      location.hash = "#/athlete/signin"; return;
    }

    this.current = key;
    // swap only the role class — assigning className wholesale would wipe
    // state classes such as no-proto (set when the banner is dismissed)
    document.body.classList.remove("athlete","officer","admin");
    if(def.role) document.body.classList.add(def.role);

    if(!def.role){
      Shell.role = null;
      $("#root").innerHTML = def.view(arg);
      window.scrollTo(0,0);
      if(def.after) def.after(arg);
      return;
    }

    if(def.bare){
      Shell.role = null;
      $("#root").innerHTML = def.view(arg);
      if(def.after) def.after(arg);
      return;
    }

    if(Shell.role !== def.role){
      $("#root").innerHTML = Shell.build(def.role);
      Shell.role = def.role;
    }
    Shell.closeDrawer();
    Shell.setActive(key);
    Shell.setTop({title:def.title || "", sub:def.sub || "", actions:def.actions ? def.actions(arg) : ""});

    var c = $("#content");
    c.className = "content " + (def.width || "");
    c.innerHTML = def.view(arg);
    c.scrollTop = 0;
    window.scrollTo(0,0);
    c.classList.remove("anim"); void c.offsetWidth; c.classList.add("anim");

    if(def.after) def.after(arg);
  }
};

function go(path){
  location.hash = "#/" + String(path||"").replace(/^\//,"");
}
function goBack(){
  if(history.length > 1) history.back(); else go("");
}

window.addEventListener("hashchange", function(){ Router.render(); });

/* ==========================================================================
   Shared partials
   ========================================================================== */
function disclaimerBlock(){
  return '<div class="disclaimer">'+
    '<span style="color:var(--muted);flex:0 0 auto;margin-top:1px">'+ICON.info+'</span>'+
    '<p><b>This platform is educational and does not replace official anti-doping guidance.</b> '+
    'Always verify medications through official resources such as Global DRO, or consult SLADA before competition.</p>'+
  '</div>';
}

function pageHead(title, sub){
  return '<div class="page-h"><h1>'+esc(title)+'</h1>'+(sub ? '<p>'+esc(sub)+'</p>' : "")+'</div>';
}

/* Shown when a deep link points at something that no longer exists —
   a shared or bookmarked URL with a stale id. Silently rendering a
   different page leaves the address bar disagreeing with the screen. */
function notFoundBlock(what, msg, backLabel, backPath){
  return '<div class="empty" style="padding-top:60px">'+
    '<div class="e-ic">🔗</div>'+
    '<h4>'+esc(what)+' not found</h4>'+
    '<p>'+esc(msg)+'</p>'+
    '<div class="row" style="justify-content:center;gap:10px;margin-top:22px">'+
      '<button class="btn" '+act("go", backPath)+'>'+esc(backLabel)+'</button>'+
      '<button class="btn ghost" '+act("go","")+'>Home</button>'+
    '</div>'+
  '</div>';
}

function backLink(label, path){
  return '<button class="btn ghost sm mb-16" '+(path ? act("go", path) : act("back"))+'>'+
    ICON.back+' '+esc(label)+'</button>';
}

registerAction("go", function(arg){ go(arg || ""); });
registerAction("back", function(){ goBack(); });

function statCard(o){
  return '<div class="stat">'+
    '<div class="s-top"><span class="s-ic '+o.bg+' '+o.tint+'">'+o.icon+'</span>'+
      (o.delta ? '<span class="s-d '+(o.up?"s-up":"s-dn")+'">'+(o.up?"▲":"▼")+' '+esc(o.delta)+'</span>' : "")+
    '</div>'+
    '<div class="s-n">'+esc(o.n)+'</div>'+
    '<div class="s-l">'+esc(o.label)+'</div>'+
  '</div>';
}

function statusBadgeCls(status){
  var m = {Completed:"green", Pending:"amber", "Under Review":"blue", Active:"green", Inactive:"slate", Draft:"slate", Submitted:"green"};
  return m[status] || "slate";
}

var BADGE_TONE = {permitted:"green", caution:"amber", prohibited:"red", monitored:"blue", unclassified:"slate"};

function medRow(m){
  var st = STATUS[m.status];
  return '<button class="listrow" onclick="go(\'athlete/med/'+m.id+'\')">'+
    '<span class="lr-ic '+st.bg+'">'+st.emoji+'</span>'+
    '<span class="grow"><span class="lr-t" style="display:block">'+esc(m.brand)+'</span>'+
    '<span class="lr-s" style="display:block">'+esc(m.ingredient)+'</span>'+
    '<span class="lr-status '+st.tint+'">'+esc(st.label)+'</span></span>'+
    '<span class="badge '+BADGE_TONE[m.status]+'">'+esc(st.label)+'</span>'+
  '</button>';
}
