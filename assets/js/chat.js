/* ==========================================================================
   SLADA Connect — Ask SLADA (in-app assistant)
   --------------------------------------------------------------------------
   An athlete who has to leave the platform to ask a follow-up question often
   doesn't come back. This keeps the question here.

   Three things carry the safety of this feature, in order of how much they
   matter:

   1. It never rules on a named medicine. A question like "can I take Panadol"
      is intercepted here, in the client, and answered by handing the athlete
      to the medicine checker — which resolves the actual active ingredients
      and knows their sport. No model call is made, so there is no model
      answer to go wrong. The server prompt forbids it as well; this is the
      belt to that pair of braces.

   2. Answers are grounded in this platform's own guides and substance data,
      retrieved here and sent with the question. The assistant quotes the
      material the athlete can go and read, rather than its own memory.

   3. It degrades to a retrieval-only answer when the API is unreachable —
      from file://, offline, or with no key configured. It surfaces the
      relevant guide rather than pretending to be an assistant that works.
   ========================================================================== */

/* --------------------------------------------------------------------------
   What the assistant knows about the platform itself. The guides cover the
   anti-doping side; nothing in them describes this app, so that has to be
   written down somewhere.
   -------------------------------------------------------------------------- */
var PLATFORM_KB = [
  { t: "Can I Take This? — the medicine checker", route: "athlete/check",
    body: "Search any brand name or active ingredient. The checker resolves the medicine through RxNorm and openFDA, identifies its active ingredients, and classifies them against the WADA substance classes. Every result explains why the substance is treated the way it is, and says whether it applies to the athlete's own sport. Anything it cannot classify is shown as unclassified with an explicit warning that this does not mean permitted — it never guesses." },
  { t: "Sport-specific answers", route: "athlete/check",
    body: "Results are checked against the sport on the athlete's profile. Beta-blockers are the one class whose status genuinely changes by sport — prohibited in competition in precision sports such as archery, shooting and golf, and not restricted in most others. A 'check another sport' selector shows how a substance differs elsewhere without changing the profile." },
  { t: "Learn — clean sport guides", route: "athlete/learn",
    body: "Nine plain-language guides: what WADA is, what SLADA is, strict liability, athlete rights, athlete responsibilities, supplements, therapeutic use exemptions, the doping control process, and the Prohibited List. Written to be read on a phone in a few minutes each." },
  { t: "Clean Sport Quiz", route: "athlete/quiz",
    body: "Ten questions with an explanation after every answer, so it teaches rather than tests. Scoring 7 or more earns a badge; 9 or more with every guide read unlocks Clean Sport Champion, and results can be shown as a certificate." },
  { t: "Profile and testing history", route: "athlete/profile",
    body: "Shows the athlete's account details, sport and federation, guides completed, best quiz score, badges earned, and the doping control tests recorded against them by SLADA with the status of each. Tests are conducted by officers in DCO Connect, the agency's own platform — nothing in this app creates them." },
  { t: "Accounts and guest access", route: "athlete/signin",
    body: "An athlete can sign in, create an account, or explore as a guest. Creating an account records sport, event, federation and testing-pool membership. Sport is the field that does real work — it drives the sport-specific answer in the medicine checker, so registration treats it as required." },
  { t: "Languages, theme and settings", route: "athlete/settings",
    body: "The interface switches between English, Sinhala and Tamil from Settings, along with a light and dark theme and notification preferences. Navigation labels are translated; guide and medication content is still English and needs professional translation before public release." },
  { t: "Contact SLADA and official resources", route: "athlete/resources",
    body: "Links and contact routes for SLADA, WADA, Global DRO and ADEL. Anything this platform cannot answer — a TUE application, a specific test, a deadline, an individual case — goes to SLADA directly through this page." },
  { t: "What this platform is", route: "",
    body: "SLADA Connect is a concept prototype built for design review. It is not an official product of, and has not been endorsed by, SLADA or WADA. Athlete records and statistics shown in it are illustrative sample data. Its educational classification is a mapping of the WADA substance classes and is not an authority — Global DRO and SLADA are." }
];

/* Words carrying no retrieval signal. */
var CHAT_STOP = (
  "a an and are as at be but by can do does for from had has have how i if in into is it its me my of on or " +
  "our so than that the their them then there these they this to was we were what when where which who why " +
  "will with you your about would should could tell explain please me"
).split(" ");

var ChatKB = null;

/* Flattens the guides, the substance ruleset and the platform notes into one
   scoreable list of passages. Built once, on first use. */
function chatBuildKB(){
  if(ChatKB) return ChatKB;
  var out = [];

  ARTICLES.forEach(function(a){
    /* Each heading starts a new passage, so a retrieved chunk is a coherent
       section rather than an arbitrary window of characters. */
    var cur = { src:"guide", t:a.title, sub:a.sub, route:"athlete/article/"+a.id, lines:[] };
    (a.body || []).forEach(function(b){
      if(b.h){
        if(cur.lines.length) out.push(cur);
        cur = { src:"guide", t:a.title+" — "+b.h, sub:a.sub, route:"athlete/article/"+a.id, lines:[] };
      }
      if(b.p) cur.lines.push(b.p);
      if(b.q) cur.lines.push(b.q);
      if(b.ul) cur.lines.push(b.ul.join(" "));
      if(b.t) cur.lines.push("Key points: " + b.t.join(" "));
    });
    if(cur.lines.length) out.push(cur);
  });

  /* Substance classes — the "why" text, not the ingredient lists. The
     assistant explains categories; it never rules on a named product. */
  RULES.forEach(function(r){
    if(!r.cat) return;
    out.push({
      src:"class", t:r.cat, sub:"Substance class", route:"athlete/prohibited",
      lines:[r.why || "", r.reminder || ""].filter(Boolean),
      /* the class name without its code — what an athlete would actually type */
      extra:r.cat.replace(/^[SP]\d+\s*—\s*/,"").toLowerCase()
    });
  });

  PLATFORM_KB.forEach(function(p){
    out.push({ src:"platform", t:p.t, sub:"This platform", route:p.route, lines:[p.body] });
  });

  out.forEach(function(c){
    c.text = c.lines.join(" ");
    c.hay = (c.t + " " + (c.sub||"") + " " + (c.extra||"") + " " + c.text).toLowerCase();
  });

  ChatKB = out;
  return ChatKB;
}

function chatTerms(q){
  return String(q||"").toLowerCase().replace(/[^a-z0-9\s-]/g," ").split(/\s+/)
    .filter(function(w){ return w.length > 2 && CHAT_STOP.indexOf(w) === -1; });
}

/* Keyword overlap, weighted so a hit in the title counts for more than a hit
   buried in the body. Good enough for a corpus this size, and it runs offline. */
function chatRetrieve(query, maxChunks, maxChars){
  var kb = chatBuildKB();
  var terms = chatTerms(query);
  if(!terms.length) return [];

  var scored = kb.map(function(c){
    var score = 0;
    var title = (c.t + " " + (c.sub||"") + " " + (c.extra||"")).toLowerCase();
    terms.forEach(function(t){
      if(title.indexOf(t) !== -1) score += 6;
      var n = c.hay.split(t).length - 1;
      if(n) score += Math.min(n, 4);
    });
    if(c.src === "platform") score *= 1.15;   // "how do I..." questions
    return { c:c, score:score };
  }).filter(function(x){ return x.score > 0; });

  scored.sort(function(a,b){ return b.score - a.score; });

  var picked = [], chars = 0;
  for(var i=0; i<scored.length && picked.length < (maxChunks||5); i++){
    var c = scored[i].c;
    if(chars + c.text.length > (maxChars||18000)) continue;
    chars += c.text.length;
    picked.push(c);
  }
  return picked;
}

function chatReference(chunks){
  return chunks.map(function(c){
    return "## " + c.t + " (" + (c.src === "guide" ? "guide" : c.src === "class" ? "substance class" : "platform") + ")\n" + c.text;
  }).join("\n\n");
}

/* --------------------------------------------------------------------------
   The interception.

   A question that asks for a verdict on a named thing never reaches the model.
   It is answered here, deterministically, by handing the athlete to the
   checker. This is not a fallback — for this class of question it is the
   better answer, because the checker knows their sport and reads the real
   ingredient list, and it costs nothing and cannot be wrong.
   -------------------------------------------------------------------------- */
var VERDICT_RE = /\b(can|may|am i allowed to|allowed to)\s+(i|we|you)?\s*(take|use|have|drink|consume)\b|\bis\s+.+\s+(banned|prohibited|allowed|permitted|legal|safe|ok|okay|fine)\b|\bwould\s+.+\s+(fail|trigger)\b|\b(safe|ok|okay|allowed|permitted|banned|prohibited)\s+(to\s+)?(take|use)\b/i;

/* Class-level questions are education, not verdicts, and must still reach the
   model — "are stimulants banned?" is a teaching question, not a product one. */
var CLASS_WORDS = /\b(stimulant|stimulants|diuretic|diuretics|beta.?blocker|beta.?blockers|anabolic|steroid|steroids|glucocorticoid|glucocorticoids|narcotic|narcotics|cannabinoid|cannabinoids|peptide|hormone|hormones|masking agent|substance class|prohibited list|category|categories)\b/i;

function chatVerdictIntent(q){
  if(!VERDICT_RE.test(q)) return null;
  if(CLASS_WORDS.test(q)) return null;

  /* Pull out what looks like the product name, to prefill the checker. This is
     a convenience, not a safety control — a wrong guess costs the athlete one
     retype, and the checker is authoritative either way. */
  var m = String(q)
    .replace(/^.*?\b(take|use|have|drink|consume)\b/i, "")
    .replace(/\b(can|could|would|will|should|may|might|does|do|did|is|are|was|were|am|i|you|we|my|me)\b/gi, " ")
    .replace(/\b(banned|prohibited|allowed|permitted|legal|safe|ok|okay|fine|fail|failing|trigger|test|tested|positive|result)\b/gi, " ")
    .replace(/\b(for|a|an|the|this|that|it|in|on|to|of|during|before|after|competition|sport|please|thanks|thank)\b/gi, " ")
    .replace(/[^\w\s-]/g, " ")
    .trim();
  var term = m.split(/\s+/).filter(Boolean).slice(0, 3).join(" ");
  return { term: term };
}

/* --------------------------------------------------------------------------
   Conversation state
   -------------------------------------------------------------------------- */
var Chat = {
  open: false,
  busy: false,
  msgs: [],          // {role:"user"|"assistant", text, routes?, note?}
  online: null,      // null = untried, true/false once known
  greeted: false
};

function chatGreeting(){
  return "Hi — I can explain anti-doping rules and help you find your way around this platform. " +
    "For a specific medicine, I'll send you to the checker: it reads the real ingredients and knows your sport, and I don't.";
}

var CHAT_SUGGESTIONS = [
  "What is strict liability?",
  "How does the medicine checker work?",
  "What happens during a doping test?",
  "Are supplements risky?",
  "What is a TUE and do I need one?"
];

/* --------------------------------------------------------------------------
   Rendering
   -------------------------------------------------------------------------- */

/* Escape first, then re-introduce only the two marks the assistant is told to
   use. Nothing from the model is ever inserted as live markup. */
function chatFormat(text){
  var safe = esc(text);
  safe = safe.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  return safe.split(/\n{2,}/).map(function(p){
    return "<p>" + p.replace(/\n/g, "<br>") + "</p>";
  }).join("");
}

var CHAT_ROUTE_LABELS = {
  "athlete/check": "Can I Take This?",
  "athlete/learn": "Learn",
  "athlete/quiz": "Clean Sport Quiz",
  "athlete/prohibited": "Prohibited List",
  "athlete/tue": "TUE",
  "athlete/resources": "Contact SLADA",
  "athlete/profile": "Profile",
  "athlete/settings": "Settings"
};

/* Phrases that mean the assistant is pointing at a destination. Single common
   words ("Learn", "Profile") are deliberately absent — they appear in ordinary
   sentences and would put a button under half the answers. */
var CHAT_ROUTE_PHRASES = {
  "athlete/check": ["Can I Take This", "medicine checker"],
  "athlete/learn": ["Learn section", "clean sport guides"],
  "athlete/quiz": ["Clean Sport Quiz"],
  "athlete/prohibited": ["Prohibited List"],
  "athlete/tue": ["Therapeutic Use Exemption", "TUE"],
  "athlete/resources": ["Contact SLADA", "Official Resources"],
  "athlete/profile": ["your profile", "testing history"],
  "athlete/settings": ["Settings page", "in Settings"]
};

function chatEsc(re){ return re.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

/* Turn a destination the assistant names into a button, so an answer that says
   "open Can I Take This?" is one tap from doing it.

   Boundaries are matched on non-alphanumerics rather than \b: several labels
   end in punctuation ("Can I Take This?"), and \b after a "?" can never match
   a following space, which silently killed every chip. */
function chatRoutesIn(text){
  var found = [];
  Object.keys(CHAT_ROUTE_PHRASES).forEach(function(r){
    if(text.indexOf("#/" + r) !== -1){ found.push(r); return; }
    var hit = CHAT_ROUTE_PHRASES[r].some(function(p){
      return new RegExp("(^|[^A-Za-z0-9])" + chatEsc(p) + "([^A-Za-z0-9]|$)", "i").test(text);
    });
    if(hit) found.push(r);
  });
  return found.slice(0, 3);
}

function chatMsgHTML(m, i){
  if(m.role === "user"){
    return '<div class="cm cm-user"><div class="cm-b">' + esc(m.text) + "</div></div>";
  }
  var acts = "";
  if(m.checkTerm !== undefined){
    /* An intercepted medicine question gets one action: open the checker,
       carrying the term the athlete already typed. */
    acts = '<div class="cm-acts"><button class="cm-act primary" ' + act("chatCheck", m.checkTerm) +
      ">Check it in Can I Take This? " + ICON.arrow + "</button></div>";
  } else {
    var routes = m.routes || (m.text ? chatRoutesIn(m.text) : []);
    if(routes.length){
      acts = '<div class="cm-acts">' + routes.map(function(r){
        return '<button class="cm-act" ' + act("chatGo", r) + ">" + esc(CHAT_ROUTE_LABELS[r]) + " " + ICON.arrow + "</button>";
      }).join("") + "</div>";
    }
  }
  var chips = acts;
  /* Where the answer came from. Shown as plain hostnames rather than raw URLs
     so an athlete can judge the source at a glance — "wada-ama.org" carries
     weight that a query string does not.

     esc() is an HTML escaper and does nothing to a URL scheme: "javascript:…"
     and "data:text/html,…" contain no HTML-special characters, so escaping
     them yields a live, clickable script. An href is its own context and needs
     its own check — parse the URL and require http or https. */
  var srcs = (m.sources && m.sources.length)
    ? '<div class="cm-src"><span class="cm-src-h">Sources</span>' +
      m.sources.map(function(s){
        var u = null;
        try{ u = new URL(s.url); }catch(e){ return ""; }
        if(u.protocol !== "http:" && u.protocol !== "https:") return "";
        var host = u.hostname.replace(/^www\./, "");
        return '<a class="cm-src-i" href="' + esc(u.href) + '" target="_blank" rel="noopener noreferrer">' +
          esc(s.title || host) + ' <span>' + esc(host) + "</span></a>";
      }).join("") + "</div>"
    : "";

  var busyState = !m.text
    ? (m.status
        ? '<span class="cm-status">' + esc(m.status) + '<span class="cm-typing"><i></i><i></i><i></i></span></span>'
        : '<span class="cm-typing"><i></i><i></i><i></i></span>')
    : "";

  return '<div class="cm cm-bot">' +
    '<span class="cm-av">' + ICON.logo + "</span>" +
    '<div class="cm-b">' + (m.text ? chatFormat(m.text) : busyState) +
      (m.note ? '<div class="cm-note">' + esc(m.note) + "</div>" : "") +
      srcs + chips +
    "</div></div>";
}

function chatBodyHTML(){
  var intro = !Chat.msgs.length
    ? '<div class="cm cm-bot"><span class="cm-av">' + ICON.logo + '</span>' +
      '<div class="cm-b"><p>' + esc(chatGreeting()) + "</p></div></div>" +
      '<div class="cm-sugg">' + CHAT_SUGGESTIONS.map(function(s, i){
        return '<button class="cm-s" ' + act("chatAsk", String(i)) + ">" + esc(s) + "</button>";
      }).join("") + "</div>"
    : "";
  return intro + Chat.msgs.map(chatMsgHTML).join("");
}

function chatPanelHTML(){
  return '<div class="chat-scrim" ' + act("chatToggle") + "></div>" +
    '<section class="chat-panel" role="dialog" aria-modal="true" aria-label="Ask SLADA">' +
      '<header class="chat-head">' +
        '<span class="chat-mark">' + ICON.logo + "</span>" +
        '<div class="grow"><b>Ask SLADA</b>' +
          '<span class="chat-sub">AI assistant · educational, not official guidance</span></div>' +
        '<button class="iconbtn" ' + act("chatToggle") + ' aria-label="Close">' + ICON.x + "</button>" +
      "</header>" +
      '<div class="chat-body" id="chatBody">' + chatBodyHTML() + "</div>" +
      '<form class="chat-foot" id="chatForm" autocomplete="off">' +
        '<input id="chatInput" class="chat-input" placeholder="Ask about the rules or this app…" ' +
          'aria-label="Your question" maxlength="500" />' +
        '<button class="chat-send" type="submit" aria-label="Send"' + (Chat.busy ? " disabled" : "") + ">" + ICON.arrow + "</button>" +
      "</form>" +
      '<p class="chat-disc">Answers are educational. For a medicine, use <b>Can I Take This?</b> — never rely on this chat for a verdict.</p>' +
    "</section>";
}

function chatMount(){
  var host = $("#chatHost");
  if(!host){
    host = document.createElement("div");
    host.id = "chatHost";
    document.body.appendChild(host);
  }
  host.innerHTML = (Chat.open ? chatPanelHTML() : "") +
    '<button class="chat-fab' + (Chat.open ? " hide" : "") + '" ' + act("chatToggle") +
      ' aria-label="Ask SLADA — AI assistant">' + ICON.chat + "</button>";

  if(Chat.open){
    var form = $("#chatForm");
    if(form) form.addEventListener("submit", function(e){
      e.preventDefault();
      var input = $("#chatInput");
      if(!input) return;
      var v = input.value.trim();
      if(!v || Chat.busy) return;
      input.value = "";
      chatSend(v);
    });
    chatScroll();
    var inp = $("#chatInput");
    if(inp && window.matchMedia("(min-width:1000px)").matches) inp.focus();
  }
}

function chatRepaint(){
  var body = $("#chatBody");
  if(!body){ chatMount(); return; }
  body.innerHTML = chatBodyHTML();
  var send = document.querySelector(".chat-send");
  if(send) send.disabled = Chat.busy;
  chatScroll();
}

function chatScroll(){
  var b = $("#chatBody");
  if(b) b.scrollTop = b.scrollHeight;
}

registerAction("chatToggle", function(){
  Chat.open = !Chat.open;
  document.body.classList.toggle("chat-open", Chat.open);
  chatMount();
});
registerAction("chatGo", function(route){
  Chat.open = false;
  document.body.classList.remove("chat-open");
  chatMount();
  go(route);
});
registerAction("chatAsk", function(i){
  var q = CHAT_SUGGESTIONS[+i];
  if(q) chatSend(q);
});
/* Hand-off from an intercepted medicine question: open the checker and run
   the search the athlete already typed. */
registerAction("chatCheck", function(term){
  Chat.open = false;
  document.body.classList.remove("chat-open");
  chatMount();
  go("athlete/check");
  setTimeout(function(){
    if(term && typeof quickSearch === "function") quickSearch(term);
  }, 60);
});

/* --------------------------------------------------------------------------
   Asking
   -------------------------------------------------------------------------- */
function chatSend(text){
  if(Chat.busy) return;
  Chat.msgs.push({ role:"user", text:text });

  /* Safety interception — answered here, no model call. */
  var v = chatVerdictIntent(text);
  if(v){
    Chat.msgs.push({
      role: "assistant",
      text: "I can't tell you whether a specific medicine is allowed — and I shouldn't, because I'd be guessing. " +
            "The checker resolves the actual active ingredients through the drug databases and answers for your sport, which I can't do.\n\n" +
            "Under strict liability you're responsible for what's in your body however you were advised, so this one is worth doing properly.",
      routes: [],
      checkTerm: v.term || ""
    });
    chatRepaint();
    return;
  }

  Chat.busy = true;
  Chat.msgs.push({ role:"assistant", text:"" });   // typing placeholder
  chatRepaint();

  var chunks = chatRetrieve(text, 5, 18000);
  var idx = Chat.msgs.length - 1;

  chatAskServer(text, chunks, {
    delta: function(t){ Chat.msgs[idx].text += t; chatRepaint(); },
    status: function(tool){
      Chat.msgs[idx].status = tool === "web_fetch"
        ? "Reading the source"
        : "Searching WADA, Global DRO and anti-doping agencies";
      chatRepaint();
    },
    sources: function(list){ Chat.msgs[idx].sources = list; chatRepaint(); }
  }).then(function(ok){
    if(!ok){
      Chat.msgs[idx].text = chatLocalAnswer(text, chunks);
      Chat.msgs[idx].note = Chat.online === false
        ? "Offline answer — drawn straight from this platform's guides."
        : null;
    }
    Chat.busy = false;
    chatRepaint();
  });
}

/* Streams from the endpoint. Resolves true if the assistant answered, false if
   the caller should fall back to the local answer. */
function chatAskServer(question, chunks, on){
  if(Chat.online === false) return Promise.resolve(false);
  if(location.protocol === "file:"){ Chat.online = false; return Promise.resolve(false); }

  var history = Chat.msgs
    .filter(function(m){ return m.text; })
    .slice(-9, -1)
    .map(function(m){ return { role:m.role, content:m.text }; });

  return fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: question,
      reference: chatReference(chunks),
      sport: Store.s.sport || "",
      history: history
    })
  }).then(function(resp){
    if(!resp.ok || !resp.body){
      /* No endpoint here at all (static host, file://, dev server) or the key
         isn't configured — stop asking and stay on the offline answers. A 5xx
         other than 503 could be transient, so those keep retrying. */
      if([404, 405, 501, 503].indexOf(resp.status) !== -1 || !resp.body) Chat.online = false;
      return false;
    }
    Chat.online = true;

    var reader = resp.body.getReader();
    var dec = new TextDecoder();
    var buf = "", got = false, failed = false;

    function pump(){
      return reader.read().then(function(r){
        if(r.done) return !failed && got;
        buf += dec.decode(r.value, { stream:true });
        var parts = buf.split("\n\n");
        buf = parts.pop();
        parts.forEach(function(p){
          var line = p.trim();
          if(line.indexOf("data:") !== 0) return;
          var ev;
          try{ ev = JSON.parse(line.slice(5).trim()); }catch(e){ return; }
          if(ev.type === "delta"){ got = true; on.delta(ev.text); }
          else if(ev.type === "status"){ on.status(ev.tool); }
          else if(ev.type === "sources"){ on.sources(ev.sources); }
          else if(ev.type === "error"){ failed = !got; if(got) on.delta("\n\n" + ev.message); }
        });
        return pump();
      });
    }
    return pump();
  }).catch(function(){
    Chat.online = false;
    return false;
  });
}

/* --------------------------------------------------------------------------
   Offline answer

   No model, so it does not attempt prose. It says what it found and points at
   the guide — which is honest, and still useful.
   -------------------------------------------------------------------------- */
function chatLocalAnswer(query, chunks){
  if(!chunks.length){
    return "I can't reach the assistant right now, and nothing in the guides matches that closely enough for me to answer it offline.\n\n" +
      "The Learn section has nine guides covering the rules, and Contact SLADA will reach someone who can answer directly.";
  }
  var top = chunks[0];
  /* First few sentences, without a lookbehind — older Safari chokes on those. */
  var sentences = top.text.match(/[^.!?]+[.!?]+/g) || [top.text];
  var snippet = sentences.slice(0, 3).join(" ").trim();
  return "I can't reach the assistant right now, so here is the relevant passage from **" + top.t + "**:\n\n" +
    snippet + "\n\nOpen the guide for the full version.";
}

/* --------------------------------------------------------------------------
   Boot — the launcher lives outside #root so a route change never destroys it.
   -------------------------------------------------------------------------- */

/* The sign-in and registration screens are deliberately bare: a floating
   button over them is noise at the one moment the athlete has a single job. */
var CHAT_HIDDEN_ROUTES = ["athlete/signin", "athlete/register"];

function chatVisible(){
  var route = (location.hash || "").replace(/^#\/?/, "").split("?")[0];
  return CHAT_HIDDEN_ROUTES.indexOf(route) === -1;
}

function chatSyncVisibility(){
  var host = $("#chatHost");
  if(!host) return;
  var show = chatVisible();
  host.style.display = show ? "" : "none";
  if(!show && Chat.open){
    Chat.open = false;
    document.body.classList.remove("chat-open");
    chatMount();
    host.style.display = "none";
  }
}

function chatInit(){
  if(!ICON.chat){
    ICON.chat = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.6 9.6 0 0 1-2.8-.4L3 21l1.6-4.6A8.3 8.3 0 0 1 3.6 11.5 8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z"/></svg>';
  }
  chatMount();
  chatSyncVisibility();
  window.addEventListener("hashchange", chatSyncVisibility);
  /* Escape closes the panel, matching the modal and drawer. */
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && Chat.open){
      Chat.open = false;
      document.body.classList.remove("chat-open");
      chatMount();
    }
  });
}
