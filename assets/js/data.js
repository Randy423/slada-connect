/* ==========================================================================
   SLADA Connect — data layer
   All content is illustrative sample data for a design prototype.
   Not a medical, legal or anti-doping reference.
   ========================================================================== */

/* ---------- medication status vocabulary ---------- */
var STATUS = {
  permitted:    {label:"Generally Permitted",        emoji:"🟢", cls:"permitted",    tint:"tint-green", bg:"bg-green"},
  caution:      {label:"Use Caution",                emoji:"🟠", cls:"caution",      tint:"tint-amber", bg:"bg-amber"},
  prohibited:   {label:"Potential Anti-Doping Concern", emoji:"🔴", cls:"prohibited", tint:"tint-red",   bg:"bg-red"},
  monitored:    {label:"Monitored Programme",        emoji:"🔵", cls:"monitored",    tint:"tint-blue",  bg:"bg-blue"},
  unclassified: {label:"Not Classified Here",        emoji:"⚪", cls:"unclassified", tint:"tint-slate", bg:"bg-slate"}
};

var SEVERITY = {prohibited:4, caution:3, monitored:2, permitted:1};

/* ---------- ingredient ruleset ----------
   The drug databases identify what a medicine IS. They do not publish
   anti-doping status. This maps an active ingredient to an educational
   category, and every rule carries a "why" explanation rather than a
   bare verdict. Anything unmatched stays deliberately unclassified.  */
var RULES = [
  { re:/\b(testosterone|nandrolone|stanozolol|oxandrolone|trenbolone|boldenone|methandienone|methandrostenolone|oxymetholone|drostanolone|clostebol|danazol|dehydroepiandrosterone|dhea|androstenedione|prasterone|ostarine|enobosarm|ligandrol|andarine|clenbuterol)\b/i,
    status:"prohibited", cat:"S1 — Anabolic agents",
    why:"Anabolic agents build muscle and speed recovery beyond what training alone achieves, which is a direct performance advantage. They also carry real health risks, so they are banned at all times — in and out of competition — rather than only around events.",
    reminder:"Products sold for muscle gain or 'testosterone support' may contain anabolic agents that are not declared on the label. If this medicine is genuinely required, a Therapeutic Use Exemption must be approved before you take it." },

  { re:/\b(erythropoietin|epoetin|darbepoetin|somatropin|somatotropin|growth hormone|insulin|insulin glargine|insulin aspart|chorionic gonadotropin|hcg|corticotropin|luteinizing hormone)\b/i,
    status:"prohibited", cat:"S2 — Peptide hormones and growth factors",
    why:"These substances change how the body carries oxygen or builds tissue. EPO, for example, raises red blood cell count and therefore endurance. Because the effect persists long after the last dose, they are prohibited at all times.",
    reminder:"Athletes with a genuine medical need, such as insulin for diabetes, must hold an approved Therapeutic Use Exemption before use." },

  { re:/\b(salbutamol|albuterol|salmeterol|formoterol|vilanterol|terbutaline|olodaterol|indacaterol)\b/i,
    status:"caution", cat:"S3 — Beta-2 agonists",
    why:"Asthma is common in athletes and these inhalers are legitimate treatment, so they are permitted up to a maximum daily dose. Above that dose they can act as stimulants and anabolic agents, which is why the limit exists rather than an outright ban.",
    reminder:"Tablets, syrups and injections are treated differently from inhalers. Never assume the inhaler rules apply to other forms, and have your asthma treatment documented in advance." },

  { re:/\b(tamoxifen|clomifene|clomiphene|anastrozole|letrozole|exemestane|raloxifene|fulvestrant|meldonium|trimetazidine|aromatase)\b/i,
    status:"prohibited", cat:"S4 — Hormone and metabolic modulators",
    why:"These alter the body's own hormone production or energy metabolism. Several are used to restart natural testosterone after a steroid cycle, or to mask its use, which is why they are banned at all times even though they are not steroids themselves.",
    reminder:"These medicines are sometimes prescribed for legitimate conditions. A Therapeutic Use Exemption must be approved before you take one." },

  { re:/\b(furosemide|frusemide|hydrochlorothiazide|chlorthalidone|chlortalidone|spironolactone|acetazolamide|amiloride|indapamide|torasemide|torsemide|bumetanide|triamterene|probenecid|desmopressin|bendroflumethiazide|metolazone)\b/i,
    status:"prohibited", cat:"S5 — Diuretics and masking agents",
    why:"Diuretics flush water out of the body. That dilutes urine and can hide traces of other prohibited substances, and it lets athletes drop weight quickly to make a lower category. They are banned for both reasons, at all times.",
    reminder:"Diuretics are prohibited even when prescribed for a genuine condition such as high blood pressure. Some combination blood pressure tablets contain a diuretic — check the full ingredient list with your doctor." },

  { re:/\b(pseudoephedrine|ephedrine|methylephedrine|cathine|norpseudoephedrine)\b/i,
    status:"caution", cat:"S6 — Stimulants (threshold substance)",
    why:"At normal cold-and-flu doses this clears congestion. At high doses it acts as a stimulant, raising alertness and heart rate. Rather than banning a common medicine outright, the rules set a urinary concentration threshold — so dose and timing are what matter.",
    reminder:"Many cold and flu products contain a decongestant without making it obvious on the front of the pack. Stop-use timing before competition should be planned with your doctor or SLADA." },

  { re:/\b(amphetamine|dexamfetamine|dextroamphetamine|methylphenidate|modafinil|armodafinil|lisdexamfetamine|sibutramine|fenfluramine|phentermine|cocaine|mdma|methamphetamine|oxilofrine|higenamine|dimethylamylamine|dmaa|strychnine|methylhexanamine)\b/i,
    status:"prohibited", cat:"S6 — Stimulants",
    why:"Stimulants mask fatigue and increase aggression and alertness, which distorts competition and has caused deaths in sport. They are prohibited in competition, when that effect would matter, rather than during ordinary training.",
    reminder:"If a stimulant is prescribed for a condition such as ADHD, a Therapeutic Use Exemption is normally required before competition." },

  { re:/\b(morphine|oxycodone|oxymorphone|hydromorphone|fentanyl|methadone|buprenorphine|pethidine|meperidine|diamorphine|heroin|tramadol|nicomorphine|pentazocine)\b/i,
    status:"prohibited", cat:"S7 — Narcotics",
    why:"Strong opioids blunt pain, which lets an athlete push through an injury that should stop them. That turns a manageable injury into a career-ending one, so they are prohibited in competition.",
    reminder:"Strong pain relief after an injury may still be appropriate medically, but it must be managed with your medical team and, where required, a Therapeutic Use Exemption." },

  { re:/\b(codeine|dihydrocodeine|pholcodine)\b/i,
    status:"caution", cat:"Metabolises to a prohibited substance",
    why:"Codeine itself is not banned, but your liver converts part of every dose into morphine, which is prohibited in competition above a threshold. The test looks for morphine, so a permitted medicine can still produce a positive result.",
    reminder:"Cough syrups and combined painkillers frequently contain codeine. Ask your pharmacist directly whether a product contains codeine, dihydrocodeine or tramadol." },

  { re:/\b(tetrahydrocannabinol|thc|cannabis|marijuana|hashish|nabiximols|dronabinol)\b/i,
    status:"prohibited", cat:"S8 — Cannabinoids",
    why:"Cannabinoids are prohibited in competition on grounds of athlete health and the spirit of sport rather than pure performance gain. THC also lingers in the body for weeks, so use well before an event can still show up.",
    reminder:"CBD on its own is permitted, but CBD products are frequently contaminated with THC, and the athlete remains responsible under strict liability." },

  { re:/\b(prednisone|prednisolone|dexamethasone|betamethasone|methylprednisolone|triamcinolone|hydrocortisone|budesonide|deflazacort|cortisone)\b/i,
    status:"caution", cat:"S9 — Glucocorticoids",
    why:"Steroid tablets and injections reduce inflammation and pain and can produce a short-term euphoric lift, so they are prohibited in competition by those routes. Creams, eye drops and inhalers deliver far less into the bloodstream and are treated differently.",
    reminder:"A washout period may be required between the last dose and competition, depending on the drug, dose and route. Plan this with your doctor well in advance." },

  { re:/\b(propranolol|atenolol|metoprolol|bisoprolol|timolol|nebivolol|carvedilol|sotalol|labetalol)\b/i,
    status:"caution", cat:"P1 — Beta-blockers", sportDependent:true,
    why:"Beta-blockers steady the hands and slow the heart. That is a clear advantage in precision sports such as archery and shooting, so they are banned in those sports specifically — and largely irrelevant in most others.",
    reminder:"Whether this affects you depends entirely on your sport. Check your specific sport on Global DRO, and speak to SLADA if you compete in a listed discipline." },

  { re:/\b(caffeine|nicotine)\b/i,
    status:"monitored", cat:"Monitoring Programme",
    why:"Caffeine was once banned above a threshold and is now watched instead. Samples are analysed anonymously to see whether patterns of use in sport are changing, which informs whether it should be restricted again in future.",
    reminder:"Pre-workout and energy products built around this ingredient often contain other compounds that are prohibited. The listed stimulant is rarely the risky part." },

  { re:/\b(paracetamol|acetaminophen|ibuprofen|naproxen|diclofenac|aspirin|acetylsalicylic|celecoxib|mefenamic|ketoprofen|piroxicam|indomethacin|meloxicam)\b/i,
    status:"permitted", cat:"Analgesic / anti-inflammatory",
    why:"Ordinary painkillers and anti-inflammatories do not enhance performance beyond relieving symptoms, so no anti-doping restriction applies to them in or out of competition.",
    reminder:"Permitted does not mean risk-free. Prolonged use during heavy training can affect kidney function, especially in heat or when dehydrated. Always verify combination products." },

  { re:/\b(cetirizine|loratadine|fexofenadine|chlorphenamine|chlorpheniramine|desloratadine|levocetirizine|promethazine|diphenhydramine|hydroxyzine)\b/i,
    status:"permitted", cat:"Antihistamine",
    why:"Antihistamines treat allergy symptoms without affecting strength, endurance or recovery, so they carry no anti-doping restriction.",
    reminder:"Many allergy and cold products combine an antihistamine with a decongestant. Check every active ingredient on the label, not just the first one." },

  { re:/\b(amoxicillin|azithromycin|ciprofloxacin|doxycycline|penicillin|cephalexin|cefuroxime|clarithromycin|metronidazole|flucloxacillin|erythromycin|trimethoprim|nitrofurantoin|clindamycin)\b/i,
    status:"permitted", cat:"Antibiotic",
    why:"Antibiotics treat infection and confer no competitive advantage, so they are not restricted. Being ill is itself the performance problem.",
    reminder:"Tell your coach and medical staff when you are on a course of treatment, and check any other medicines supplied alongside it in the same pack." },

  { re:/\b(omeprazole|esomeprazole|lansoprazole|pantoprazole|ranitidine|famotidine|domperidone|ondansetron|loperamide|metoclopramide|hyoscine|simethicone|antacid)\b/i,
    status:"permitted", cat:"Gastrointestinal medicine",
    why:"These treat reflux, nausea and digestive upset. None affects the systems that anti-doping rules are concerned with, so they are permitted at all times.",
    reminder:"Always verify combination medications and consult official anti-doping resources before competition." },

  { re:/\b(melatonin|dextromethorphan|guaifenesin|xylometazoline|oxymetazoline|oseltamivir|metformin|atorvastatin|simvastatin|levothyroxine|amlodipine|losartan|ramipril|sertraline|fluoxetine|vitamin|ascorbic|cholecalciferol|folic acid|ferrous)\b/i,
    status:"permitted", cat:"Generally permitted medicine",
    why:"This ingredient is not on the Prohibited List and does not enhance performance, so it is permitted in and out of competition when taken as directed.",
    reminder:"Always verify combination medications and consult official anti-doping resources before competition." }
];

function classifyIngredient(name){
  for(var i=0;i<RULES.length;i++){ if(RULES[i].re.test(name)) return RULES[i]; }
  return null;
}

/* flat searchable ingredient index, derived from RULES (works offline) */
var INGREDIENTS = (function(){
  var out = [], seen = {};
  RULES.forEach(function(rule){
    var m = /\(([^)]*)\)/.exec(rule.re.source);
    if(!m) return;
    m[1].split("|").forEach(function(raw){
      var n = raw.trim();
      if(!n || seen[n]) return;
      seen[n] = 1;
      out.push({ name:n.replace(/\b\w/g,function(c){return c.toUpperCase();}), key:n, rule:rule });
    });
  });
  return out.sort(function(a,b){ return a.key.length - b.key.length; });
})();

function ingredientMatches(q){
  var ql = q.toLowerCase(), starts = [], contains = [];
  for(var i=0;i<INGREDIENTS.length;i++){
    var k = INGREDIENTS[i].key;
    if(k.indexOf(ql) === 0) starts.push(i);
    else if(k.indexOf(ql) !== -1) contains.push(i);
    if(starts.length >= 6) break;
  }
  return starts.concat(contains).slice(0,5);
}

/* ---------- curated in-app medication guides ---------- */
var MEDS = [
  { id:"panadol", brand:"Panadol", ingredient:"Paracetamol", also:"Acetaminophen",
    cls:"Pain relief / fever", status:"permitted",
    why:"Paracetamol relieves pain and lowers fever without affecting muscle, endurance or recovery. It gives no competitive advantage, so no anti-doping restriction applies.",
    reminder:"Always verify combination medications and consult official anti-doping resources before competition.",
    detail:[["Route","Oral tablet, syrup, suppository"],["In-competition","Generally permitted"],["Out-of-competition","Generally permitted"],["TUE required","No"]],
    note:"Panadol is sold in several combination formulas (for example Panadol Cold &amp; Flu) that add other active ingredients such as pseudoephedrine. The brand name alone is not enough — check the formula you actually have." },

  { id:"ibuprofen", brand:"Ibuprofen", ingredient:"Ibuprofen", also:"Brufen, Nurofen",
    cls:"Anti-inflammatory (NSAID)", status:"permitted",
    why:"Ibuprofen reduces inflammation and pain. It does not build tissue, carry oxygen or mask another substance, so it sits outside the Prohibited List entirely.",
    reminder:"Permitted does not mean risk-free. Prolonged NSAID use during heavy training can affect kidney function, especially in hot conditions or when dehydrated.",
    detail:[["Route","Oral tablet, gel, suspension"],["In-competition","Generally permitted"],["Out-of-competition","Generally permitted"],["TUE required","No"]],
    note:"Discuss ongoing pain with your team doctor rather than self-medicating for long periods." },

  { id:"cetirizine", brand:"Cetirizine", ingredient:"Cetirizine hydrochloride", also:"Zyrtec, Alerid",
    cls:"Antihistamine / allergy", status:"permitted",
    why:"Antihistamines block the allergic response. They do not affect the physiological systems anti-doping rules are concerned with, so they are permitted at all times.",
    reminder:"Some allergy and cold products combine an antihistamine with a decongestant. Check every active ingredient on the label.",
    detail:[["Route","Oral tablet, syrup"],["In-competition","Generally permitted"],["Out-of-competition","Generally permitted"],["TUE required","No"]],
    note:"Loratadine, fexofenadine and similar antihistamines are treated in much the same way, but each product should still be checked individually." },

  { id:"vitaminc", brand:"Vitamin C", ingredient:"Ascorbic acid", also:"Supplement / tablet",
    cls:"Vitamin supplement", status:"permitted",
    why:"Vitamin C is a nutrient, not a prohibited substance, and is permitted at all times. The risk with vitamins is never the vitamin itself — it is what else ends up in the tub.",
    reminder:"Supplements are regulated as food, not medicine. Contamination with prohibited substances has been documented worldwide, and under strict liability that is still your result.",
    detail:[["Route","Tablet, effervescent, powder"],["In-competition","Generally permitted"],["Out-of-competition","Generally permitted"],["TUE required","No"]],
    note:"Prefer products certified by a recognised batch-testing programme, and keep the tub, batch number and receipt for as long as you compete." },

  { id:"sudafed", brand:"Sudafed", ingredient:"Pseudoephedrine", also:"Sudafed Congestion",
    cls:"Nasal decongestant", status:"caution",
    why:"At cold-and-flu doses pseudoephedrine clears a blocked nose. At high doses it behaves as a stimulant. Rather than ban a common medicine, the rules set a urinary threshold in competition — so how much you take, and when you stop, is what decides the result.",
    reminder:"Stop-use timing matters. Because this is controlled by a concentration threshold rather than an outright ban, dose and timing before competition are critical.",
    detail:[["Route","Oral tablet, syrup"],["In-competition","Threshold substance — caution"],["Out-of-competition","Generally permitted"],["TUE required","Situation dependent"]],
    note:"Many cold and flu brands sold in Sri Lanka contain pseudoephedrine without making it obvious on the front of the pack. Speak to your doctor about a permitted alternative during competition periods." },

  { id:"salbutamol", brand:"Ventolin", ingredient:"Salbutamol", also:"Albuterol",
    cls:"Asthma reliever (beta-2 agonist)", status:"caution",
    why:"Asthma is common in athletes, so inhaled salbutamol is permitted up to a maximum daily dose. Beyond that it starts to act as a stimulant and anabolic agent, which is why a limit exists instead of a ban.",
    reminder:"Tablets, syrups and injections of salbutamol are treated differently from inhalers. Never assume the inhaler rules apply to other forms.",
    detail:[["Route","Inhaler (permitted within limits)"],["In-competition","Dose limited"],["Out-of-competition","Dose limited"],["TUE required","If above permitted dose"]],
    note:"Athletes with asthma should have their treatment documented by their physician and reviewed with SLADA well before a competition." },

  { id:"prednisolone", brand:"Prednisolone", ingredient:"Prednisolone", also:"Glucocorticoid",
    cls:"Corticosteroid", status:"caution",
    why:"Taken by mouth or injection, glucocorticoids reduce inflammation across the whole body and can mask pain and lift mood. That is why those routes are prohibited in competition, while creams and eye drops are not.",
    reminder:"A washout period may be required between the last dose and competition. This depends on the drug, dose and route — plan it with your doctor.",
    detail:[["Route","Oral, injection, topical"],["In-competition","Prohibited by oral / injected routes"],["Out-of-competition","Generally permitted"],["TUE required","Often, for in-competition use"]],
    note:"If a doctor prescribes a steroid course, tell them you are a tested athlete before you fill the prescription." },

  { id:"testosterone", brand:"Testosterone", ingredient:"Testosterone and derivatives", also:"Anabolic androgenic steroid",
    cls:"Anabolic agent", status:"prohibited",
    why:"Testosterone increases muscle mass and shortens recovery, letting an athlete train harder than their body could otherwise sustain. The advantage is large and lasting, so it is prohibited at all times and carries the heaviest sanctions in sport.",
    reminder:"Products marketed for 'muscle gain' or 'testosterone support', or sold loose in gyms, may contain anabolic agents that are not declared on the label.",
    detail:[["Route","Injection, gel, oral"],["In-competition","Prohibited"],["Out-of-competition","Prohibited"],["TUE required","Yes, rarely granted"]],
    note:"If a medicine containing an anabolic agent is genuinely needed, a Therapeutic Use Exemption must be approved before you take it." }
];

/* ---------- learn articles ---------- */
var ARTICLES = [
  { id:"wada", icon:"🌍", tint:"tint-blue", bg:"bg-blue", title:"What is WADA?",
    sub:"The global rule-maker for clean sport", read:"4 min read",
    body:[
      {p:"The World Anti-Doping Agency, usually shortened to WADA, is the international organisation that coordinates the fight against doping in sport. It was founded in 1999 as a partnership between the sports movement and governments around the world, and it is based in Montreal, Canada."},
      {h:"What WADA actually does"},
      {p:"WADA does not test athletes itself in most cases, and it does not run competitions. Its role is to set the standards that everyone else follows, and then to check that they are being followed."},
      {ul:["Publishes the World Anti-Doping Code, the single document that harmonises anti-doping rules across every sport and country.",
           "Publishes the Prohibited List each year, which takes effect on 1 January.",
           "Accredits the laboratories permitted to analyse athlete samples.",
           "Monitors national anti-doping organisations, such as SLADA, for compliance with the Code.",
           "Funds scientific research and athlete education programmes."]},
      {q:"WADA writes the rules. Your national agency applies them to you."},
      {h:"The Prohibited List"},
      {p:"The Prohibited List is the document athletes hear about most. It groups substances into categories and marks whether each is banned at all times or only in competition. It is reviewed every year, which means a substance that was permitted last season may not be permitted this season."},
      {p:"This is why checking a medication once is not enough. The safe habit is to check again at the start of each year, and again whenever you are prescribed something new."},
      {t:["WADA sets global anti-doping standards through the World Anti-Doping Code.","The Prohibited List is updated annually and takes effect on 1 January.","Rules can change between seasons, so re-check medications you use regularly."]}
    ]},

  { id:"slada", icon:"🇱🇰", tint:"tint-green", bg:"bg-green", title:"What is SLADA?",
    sub:"Your national anti-doping organisation", read:"3 min read",
    body:[
      {p:"The Sri Lanka Anti-Doping Agency is the national body responsible for anti-doping in Sri Lanka. Where WADA sets the international framework, SLADA is the organisation that applies it to athletes competing under Sri Lankan jurisdiction."},
      {h:"Where SLADA fits into your season"},
      {ul:["Plans and carries out testing, both at competitions and without notice during training periods.",
           "Receives and reviews Therapeutic Use Exemption applications from Sri Lankan athletes.",
           "Delivers education sessions for athletes, coaches and support personnel.",
           "Manages results and the disciplinary process when a rule is broken.",
           "Answers athlete questions about medications, supplements and procedures."]},
      {h:"When to contact SLADA"},
      {p:"Contact your national agency before you take a medication you are unsure about, not afterwards. A five minute question is always cheaper than a sanction. In practice, get in touch when a doctor prescribes something new, when a competition is approaching and you are unwell, or when you are considering any supplement."},
      {q:"Asking a question is never an admission of guilt. It is exactly what the system is designed for."},
      {t:["SLADA applies the World Anti-Doping Code within Sri Lanka.","It handles testing, TUE applications, education and results management.","Contact SLADA before taking anything you are unsure about, not after."]}
    ]},

  { id:"strict-liability", icon:"⚖️", tint:"tint-violet", bg:"bg-violet", title:"Strict Liability",
    sub:"The principle every athlete must understand", read:"4 min read",
    body:[
      {p:"Strict liability is the single most important principle in anti-doping, and the one most often misunderstood. It means that an athlete is responsible for any prohibited substance found in their sample, regardless of how it got there."},
      {h:"Intent is not the test"},
      {p:"It does not matter whether you meant to cheat. It does not matter whether a doctor prescribed the substance, whether a teammate handed it to you, or whether it entered your body through a contaminated supplement. If it is in your sample, the rule has been broken."},
      {q:"I did not know is an explanation. It is not a defence."},
      {h:"Why the rule works this way"},
      {p:"Without strict liability, every case would turn into an argument about what the athlete was thinking, which is impossible to prove either way. The principle keeps the system workable and keeps competition fair for the athletes who do check carefully."},
      {h:"What you can still do"},
      {p:"Strict liability decides whether a violation occurred. It does not always decide the length of the sanction. Where an athlete can show how a substance entered their body and that there was no significant fault, a reduced sanction is sometimes possible — but the burden of proving that sits entirely with the athlete, and it is difficult."},
      {ul:["Keep records of everything you take, including batch numbers and receipts.","Keep the packaging of any supplement you use.","Ask before you take, not after you test positive."]},
      {t:["You are responsible for what is in your body, whatever the reason.","Lack of intent does not prevent a violation.","Good records may help reduce a sanction, but prevention is the only reliable protection."]}
    ]},

  { id:"rights", icon:"🤝", tint:"tint-blue", bg:"bg-blue", title:"Athlete Rights",
    sub:"What you are entitled to during the process", read:"4 min read",
    body:[
      {p:"Anti-doping is often described entirely in terms of obligations, but athletes also hold defined rights. Knowing them makes the process less intimidating and helps protect you if something goes wrong."},
      {h:"During sample collection"},
      {ul:["To see identification from the doping control officer before anything begins.",
           "To be accompanied by a representative of your choice throughout.",
           "To request an interpreter where one is available.",
           "To ask for a delay for legitimate reasons, such as a medal ceremony, a warm-down or completing training.",
           "To inspect and reject a collection kit that appears damaged or already opened.",
           "To record any concern about the procedure on the doping control form before you sign it."]},
      {h:"After the sample is taken"},
      {ul:["To receive a copy of the completed doping control form.",
           "To have your sample analysed only by a WADA-accredited laboratory.",
           "To request analysis of your B sample if the A sample returns an adverse finding.",
           "To be present, or represented, when the B sample is opened.",
           "To a fair hearing before any sanction is imposed, and to appeal the outcome."]},
      {q:"Read the form before you sign it. It is your record of what happened, not the officer's."},
      {h:"Privacy"},
      {p:"Your personal and medical information is confidential and may only be used for anti-doping purposes. Whereabouts data, TUE files and test results are all subject to protection rules, and misuse of them is itself a breach."},
      {t:["You may be accompanied by a representative at every stage.","You may inspect equipment and note concerns on the form before signing.","You may request B sample analysis and attend its opening.","You are entitled to a fair hearing and to appeal."]}
    ]},

  { id:"responsibilities", icon:"🏅", tint:"tint-amber", bg:"bg-amber", title:"Athlete Responsibilities",
    sub:"What the rules expect from you", read:"5 min read",
    body:[
      {p:"Signing up to compete means accepting a set of responsibilities that go beyond training and performance. These duties apply whether or not anyone has explained them to you, and whether or not you have read the Code."},
      {h:"Your core duties"},
      {ul:["Know what is on the Prohibited List and check anything you plan to take.",
           "Be available for testing, including out-of-competition testing without advance notice.",
           "Provide accurate whereabouts information if you are in a registered testing pool.",
           "Tell every doctor, dentist and pharmacist who treats you that you are a tested athlete.",
           "Declare all medications and supplements on the doping control form at the time of testing.",
           "Cooperate fully with anti-doping organisations investigating possible rule violations.",
           "Take responsibility for what your support personnel give you."]},
      {h:"Telling your doctor matters"},
      {p:"Most medical professionals are not anti-doping specialists, and a routine prescription that is completely appropriate for a member of the public may cause a serious problem for a competing athlete. Saying one sentence at the start of the appointment changes the treatment you are offered."},
      {q:"I am a competing athlete subject to anti-doping testing. Can we check this medication before I take it?"},
      {h:"Your entourage counts too"},
      {p:"Coaches, physiotherapists, nutritionists and family members can also be sanctioned for their part in a violation. If someone in your circle offers you something without a clear explanation of what it is, that is a reason to stop and ask questions."},
      {t:["Responsibilities apply whether or not you have read the rules.","Tell every healthcare professional that you are a tested athlete.","Declare all medications and supplements during doping control.","Support personnel can be sanctioned too."]}
    ]},

  { id:"supplements", icon:"💊", tint:"tint-amber", bg:"bg-amber", title:"Supplements",
    sub:"Why 'natural' does not mean safe", read:"5 min read",
    body:[
      {p:"Supplements are one of the most common routes to an unintentional anti-doping violation. The problem is not usually that athletes knowingly take something banned — it is that the product contained something the label never mentioned."},
      {h:"Supplements are not medicines"},
      {p:"In most countries, including Sri Lanka, supplements are regulated as foods rather than as medicines. They do not go through the approval, purity testing or labelling controls that a pharmaceutical product must pass. No anti-doping organisation approves or certifies supplements."},
      {h:"How contamination happens"},
      {ul:["Manufacturing equipment shared with products containing prohibited substances.",
           "Raw ingredients bought from suppliers who do not test what they sell.",
           "Deliberate spiking with undeclared active ingredients so the product 'works'.",
           "Ingredient names on the label that disguise a prohibited compound."]},
      {q:"Under strict liability, a contaminated supplement is still your positive test."},
      {h:"Reducing the risk"},
      {p:"The safest approach is to meet your nutritional needs through food wherever possible, and to treat every supplement as a decision that carries risk. If you do use one, work through it properly:"},
      {ul:["Ask whether you genuinely need it, ideally with a sports dietitian.",
           "Choose products certified by a recognised batch-testing programme.",
           "Check the batch number is covered by the certification, not just the brand.",
           "Keep the container, batch number and receipt for as long as you compete.",
           "Never use a product bought loose, repackaged, or recommended informally at a gym."]},
      {t:["Supplements are regulated as food, not medicine.","Contamination is common and is still the athlete's responsibility.","Batch-tested products reduce risk but never remove it.","Food first is always the lower-risk option."]}
    ]},

  { id:"tue", icon:"📋", tint:"tint-blue", bg:"bg-blue", title:"Therapeutic Use Exemptions",
    sub:"Treating illness within the rules", read:"5 min read",
    body:[
      {p:"Athletes get ill and injured like everyone else. A Therapeutic Use Exemption, or TUE, is the formal permission that allows an athlete to use a prohibited substance or method when it is genuinely needed to treat a medical condition."},
      {h:"The four conditions"},
      {p:"A TUE is granted only when all of the following are satisfied:"},
      {ul:["The athlete would experience a significant health problem without the substance or method.",
           "The treatment is highly unlikely to produce any additional performance enhancement beyond a return to normal health.",
           "There is no reasonable permitted alternative treatment available.",
           "The need is not the consequence of previously using a substance without a TUE."]},
      {h:"Apply before you take it"},
      {p:"Except in genuine medical emergencies, a TUE must be approved before the substance is used. Applying afterwards, once a sample has already been collected, is a far weaker position to be in."},
      {q:"Plan your TUE around your competition calendar, not around your test results."},
      {h:"What an application needs"},
      {p:"Applications are reviewed by a panel of independent physicians, so the supporting evidence matters. Expect to supply a full medical history for the condition, the results of relevant examinations and tests, and a clear statement from your physician explaining why permitted alternatives are unsuitable. Incomplete files are the most common cause of delay."},
      {t:["A TUE allows medically necessary use of a prohibited substance.","Four strict conditions must all be met.","Apply in advance, except in genuine emergencies.","Thorough medical documentation is essential."]}
    ]},

  { id:"doping-control", icon:"🧪", tint:"tint-green", bg:"bg-green", title:"Doping Control Process",
    sub:"What happens when you are tested", read:"6 min read",
    body:[
      {p:"Being selected for testing is a normal part of competing, not an accusation. Knowing the process in advance removes most of the stress from it, and helps you protect your own rights along the way."},
      {h:"Step by step"},
      {ul:["Notification. A trained doping control officer identifies themselves, informs you that you have been selected, and explains your rights and responsibilities. You sign to confirm notification.",
           "Chaperoning. From that moment you remain in view of the officer or a chaperone until the sample is provided. You may request a short delay for legitimate reasons.",
           "Choosing a kit. At the station you select a sealed collection kit and check that it is intact. You may reject a kit that appears damaged.",
           "Providing the sample. The sample is given under direct observation by an official of the same gender. This is uncomfortable but is required to protect the integrity of the sample.",
           "Splitting and sealing. The sample is divided into A and B bottles, which you seal yourself. You then check the code numbers match the paperwork.",
           "Documentation. You declare all medications and supplements taken recently, note any concerns about the process, and receive a copy of the form."]},
      {h:"Your rights"},
      {p:"You are entitled to be accompanied by a representative of your choice, to ask for an interpreter, to request information about the process, and to record any concerns on the form before you sign it. Read the form before signing — it is your record of what happened."},
      {q:"Refusing or evading a test is treated as seriously as a positive result."},
      {h:"Afterwards"},
      {p:"Your sample is sent to a WADA-accredited laboratory with only a code number attached, so the analysis is anonymous. If the A sample returns an adverse finding you are notified and may request analysis of the B sample. Most athletes never hear anything further, which simply means the result was negative."},
      {t:["Selection for testing is routine, not an accusation.","You stay with a chaperone from notification until the sample is given.","You may be accompanied by a representative throughout.","Declare every medication and supplement on the form.","Refusing a test carries consequences as serious as a positive result."]}
    ]},

  { id:"prohibited-list", icon:"📄", tint:"tint-red", bg:"bg-red", title:"The Prohibited List",
    sub:"How the categories are organised", read:"5 min read",
    body:[
      {p:"The Prohibited List is published by WADA once a year and comes into force on 1 January. It is not a list of every banned product — it is a list of substance classes and methods, which means a new product can be prohibited from the day it is invented if it belongs to a listed class."},
      {h:"Three timing categories"},
      {ul:["Prohibited at all times — in and out of competition. Anabolic agents, hormones, diuretics and masking agents sit here.",
           "Prohibited in competition only. Stimulants, narcotics, cannabinoids and glucocorticoids sit here.",
           "Prohibited in particular sports. Beta-blockers, which matter mainly in precision disciplines such as shooting and archery."]},
      {h:"The classes"},
      {ul:["S0 Unapproved substances — anything not approved for human therapeutic use.",
           "S1 Anabolic agents. S2 Peptide hormones and growth factors. S3 Beta-2 agonists.",
           "S4 Hormone and metabolic modulators. S5 Diuretics and masking agents.",
           "S6 Stimulants. S7 Narcotics. S8 Cannabinoids. S9 Glucocorticoids.",
           "M1–M3 Prohibited methods: manipulation of blood, chemical and physical manipulation, and gene doping.",
           "P1 Beta-blockers, in listed sports only."]},
      {q:"A substance can be prohibited without ever being named, if it belongs to a listed class."},
      {h:"Why it changes"},
      {p:"A substance is added when it meets two of three criteria: it enhances performance, it poses a health risk, or it violates the spirit of sport. Because new compounds appear constantly and evidence develops, the list is revised annually — so a medicine that was fine last season may not be this one."},
      {t:["Published annually, in force from 1 January.","Organised by substance class, not by brand name.","Some substances are banned at all times, others only in competition.","Always check against the current year's list."]}
    ]}
];

/* ---------- quiz ---------- */
var QUIZ = [
  { q:"Who is ultimately responsible for any prohibited substance found in an athlete's sample?",
    o:["The athlete's coach","The doctor who prescribed it","The athlete","The supplement manufacturer"], a:2,
    e:"Under the principle of strict liability, the athlete is responsible for whatever is found in their sample, regardless of how it got there." },
  { q:"What does the principle of 'strict liability' mean?",
    o:["Only deliberate cheating is punished","The athlete is responsible regardless of intent","Coaches share equal legal responsibility","Sanctions are always the maximum length"], a:1,
    e:"Strict liability means intent is not part of the test. If a prohibited substance is present, a violation has occurred." },
  { q:"What does TUE stand for?",
    o:["Testing Under Evaluation","Team Understanding Exemption","Therapeutic Use Exemption","Temporary Usage Entitlement"], a:2,
    e:"A Therapeutic Use Exemption allows an athlete to use a prohibited substance when it is genuinely required to treat a medical condition." },
  { q:"Which resource lets you check a medication's status by country and sport?",
    o:["Global DRO","A pharmacy website","The product packaging","A social media group"], a:0,
    e:"Global Drug Reference Online gives status information specific to the country of purchase and the athlete's sport." },
  { q:"True or false: supplements sold in a pharmacy are guaranteed free of prohibited substances.",
    o:["True, pharmacies are regulated","False, contamination is still possible","True, if the label lists ingredients","True, for well-known brands"], a:1,
    e:"Supplements are regulated as food rather than medicine. Contamination and undeclared ingredients have been found in products sold through every kind of retailer." },
  { q:"How often is the WADA Prohibited List updated?",
    o:["Every four years","Only when a scandal occurs","Annually, effective 1 January","Every six months"], a:2,
    e:"The Prohibited List is reviewed and republished each year, coming into force on 1 January. A substance permitted last season may not be permitted this one." },
  { q:"During doping control, who may accompany the athlete?",
    o:["Nobody, the athlete must be alone","A representative of the athlete's choice","Only a team doctor","Only a national federation official"], a:1,
    e:"Athletes have the right to be accompanied by a representative of their choosing throughout the sample collection process." },
  { q:"Why does pseudoephedrine require caution before competition?",
    o:["It is banned at all times","It is prohibited above a threshold in competition","It is only banned for endurance sports","It is completely unrestricted"], a:1,
    e:"Pseudoephedrine is controlled by a urinary concentration threshold in competition, which makes dose and timing before an event critical." },
  { q:"A doctor prescribes you a medication that appears on the Prohibited List. What should you do first?",
    o:["Take it and explain later if tested","Halve the dose to stay under the limit","Consult SLADA and apply for a TUE before taking it","Ask a teammate what they did"], a:2,
    e:"Except in a genuine emergency, permission must be obtained in advance. Contact your national anti-doping organisation and start the TUE process before taking the medication." },
  { q:"Which athletes must provide whereabouts information?",
    o:["Every registered athlete in the country","Those in a Registered Testing Pool","Only athletes with a previous violation","Only athletes competing overseas"], a:1,
    e:"Whereabouts requirements apply to athletes included in a Registered Testing Pool, so that no-advance-notice testing can be carried out." }
];

/* ---------- official resources ---------- */
var RESOURCES = [
  { id:"gdro", icon:"🔎", tint:"tint-blue", bg:"bg-blue", title:"Global DRO",
    sub:"Check medication status by country and sport", url:"globaldro.com",
    about:"Global Drug Reference Online is the standard tool for checking whether a specific medication is permitted. Results depend on the country where the product was purchased and the sport you compete in, so always select both." },
  { id:"wada", icon:"🌍", tint:"tint-green", bg:"bg-green", title:"WADA",
    sub:"World Anti-Doping Agency — the Prohibited List", url:"wada-ama.org",
    about:"The World Anti-Doping Agency publishes the Code and the annual Prohibited List, and accredits testing laboratories worldwide." },
  { id:"slada", icon:"🇱🇰", tint:"tint-amber", bg:"bg-amber", title:"SLADA",
    sub:"Sri Lanka Anti-Doping Agency", url:"Contact your national agency",
    about:"Your national anti-doping organisation handles testing, TUE applications and athlete education in Sri Lanka. It is the right first call for any question specific to your situation." },
  { id:"adel", icon:"🎓", tint:"tint-violet", bg:"bg-violet", title:"ADEL",
    sub:"Anti-Doping Education and Learning", url:"adel.wada-ama.org",
    about:"WADA's official education platform offers free courses and certification for athletes, coaches and support personnel." }
];

/* ---------- operational sample data ---------- */
var SPORTS = ["Athletics","Cricket","Swimming","Weightlifting","Rugby","Badminton","Boxing","Football","Cycling","Netball","Shooting","Archery","Golf"];
var FEDERATIONS = ["Sri Lanka Athletics","Sri Lanka Cricket","Sri Lanka Aquatic Sports Union","Weightlifting Federation of Sri Lanka",
  "Sri Lanka Rugby","Badminton Association of Sri Lanka","Boxing Association of Sri Lanka","Football Federation of Sri Lanka",
  "Cycling Federation of Sri Lanka","Netball Federation of Sri Lanka","National Rifle Association of Sri Lanka",
  "Archery Association of Sri Lanka","Sri Lanka Golf Union"];

var SPORT_FED = {
  "Athletics":"Sri Lanka Athletics", "Cricket":"Sri Lanka Cricket",
  "Swimming":"Sri Lanka Aquatic Sports Union", "Weightlifting":"Weightlifting Federation of Sri Lanka",
  "Rugby":"Sri Lanka Rugby", "Badminton":"Badminton Association of Sri Lanka",
  "Boxing":"Boxing Association of Sri Lanka", "Football":"Football Federation of Sri Lanka",
  "Cycling":"Cycling Federation of Sri Lanka", "Netball":"Netball Federation of Sri Lanka",
  "Shooting":"National Rifle Association of Sri Lanka", "Archery":"Archery Association of Sri Lanka",
  "Golf":"Sri Lanka Golf Union"
};

/* ---------- sport-specific status ----------
   Only ONE substance class on the Prohibited List genuinely changes status
   by sport: P1 beta-blockers. Everything else applies identically to every
   athlete. Modelling that honestly matters more than inventing per-sport
   rules that do not exist — an athlete who believes the rules differ by
   sport in general will draw exactly the wrong conclusions. */
var P1_SPORTS = ["Archery","Automobile","Billiards","Darts","Golf","Shooting","Skiing/Snowboarding","Underwater sports"];
var P1_ALSO_OUT_OF_COMP = ["Archery","Shooting"];

/* Category is used only for educational emphasis — the risks an athlete in
   this kind of sport most often runs into. It never changes a status. */
var SPORT_CATEGORY = {
  "Archery":"precision", "Shooting":"precision", "Golf":"precision",
  "Weightlifting":"weight", "Boxing":"weight",
  "Athletics":"endurance", "Swimming":"endurance", "Cycling":"endurance",
  "Cricket":"team", "Rugby":"team", "Football":"team", "Netball":"team", "Badminton":"team"
};

var SPORT_EMPHASIS = {
  precision:{ label:"Precision sport",
    note:"Yours is one of the few sports where the Prohibited List itself changes. Beta-blockers steady the hands and slow the heart, so they are banned in precision disciplines even though most athletes may use them freely." },
  weight:{ label:"Weight-category sport",
    note:"Making weight is the specific risk in your sport. Diuretics and rapid weight-loss products are prohibited at all times, and slimming supplements are a well-documented source of contamination." },
  endurance:{ label:"Endurance sport",
    note:"Oxygen-carrying substances such as EPO, and blood manipulation methods, are prohibited at all times and are a particular focus of testing in endurance disciplines." },
  team:{ label:"Team sport",
    note:"Team environments are where shared supplements and 'the physio gave it to me' problems arise most often. Strict liability still makes each substance your own responsibility." }
};

var ATHLETES = [
  {id:"ATH-1042", name:"Randhir Senaratne",   sport:"Athletics",    fed:"Sri Lanka Athletics",                dob:"1999-04-12", gender:"Male",   nat:"Sri Lankan", nic:"199910401234", status:"Active",   tests:4, last:"2026-06-18"},
  {id:"ATH-1087", name:"Nimali Fernando",     sport:"Swimming",     fed:"Sri Lanka Aquatic Sports Union",     dob:"2001-09-02", gender:"Female", nat:"Sri Lankan", nic:"200124502211", status:"Active",   tests:3, last:"2026-07-02"},
  {id:"ATH-1103", name:"Kasun Perera",        sport:"Cricket",      fed:"Sri Lanka Cricket",                  dob:"1997-01-25", gender:"Male",   nat:"Sri Lankan", nic:"199702503391", status:"Active",   tests:6, last:"2026-07-11"},
  {id:"ATH-1156", name:"Tharushi Karunaratne",sport:"Athletics",    fed:"Sri Lanka Athletics",                dob:"2003-06-14", gender:"Female", nat:"Sri Lankan", nic:"200316604412", status:"Active",   tests:2, last:"2026-05-27"},
  {id:"ATH-1198", name:"Dinesh Priyantha",    sport:"Weightlifting",fed:"Weightlifting Federation of Sri Lanka",dob:"1995-11-30",gender:"Male",  nat:"Sri Lankan", nic:"199533505523", status:"Active",   tests:7, last:"2026-07-15"},
  {id:"ATH-1221", name:"Amaya Wickramasinghe",sport:"Badminton",    fed:"Badminton Association of Sri Lanka", dob:"2000-02-18", gender:"Female", nat:"Sri Lankan", nic:"200004906634", status:"Active",   tests:1, last:"2026-04-09"},
  {id:"ATH-1245", name:"Sahan Jayawardena",   sport:"Rugby",        fed:"Sri Lanka Rugby",                    dob:"1998-08-07", gender:"Male",   nat:"Sri Lankan", nic:"199822007745", status:"Inactive", tests:3, last:"2025-12-02"},
  {id:"ATH-1260", name:"Ishara Bandara",      sport:"Boxing",       fed:"Boxing Association of Sri Lanka",    dob:"2002-03-21", gender:"Male",   nat:"Sri Lankan", nic:"200208008856", days:0, status:"Active", tests:2, last:"2026-06-30"},
  {id:"ATH-1284", name:"Chathuri Silva",      sport:"Netball",      fed:"Netball Federation of Sri Lanka",    dob:"1999-12-11", gender:"Female", nat:"Sri Lankan", nic:"199934509967", status:"Active",   tests:2, last:"2026-07-08"},
  {id:"ATH-1301", name:"Malith Gunasekara",   sport:"Cycling",      fed:"Cycling Federation of Sri Lanka",    dob:"1996-07-04", gender:"Male",   nat:"Sri Lankan", nic:"199618601078", status:"Active",   tests:5, last:"2026-07-19"},
  {id:"ATH-1322", name:"Hasini Rajapaksa",    sport:"Swimming",     fed:"Sri Lanka Aquatic Sports Union",     dob:"2004-05-16", gender:"Female", nat:"Sri Lankan", nic:"200413702189", status:"Active",   tests:1, last:"2026-03-14"},
  {id:"ATH-1348", name:"Roshan de Silva",     sport:"Football",     fed:"Football Federation of Sri Lanka",   dob:"1997-10-29", gender:"Male",   nat:"Sri Lankan", nic:"199730303290", status:"Active",   tests:3, last:"2026-06-05"}
];

var TESTS = [
  {id:"DCF-2026-0412", athlete:"Dinesh Priyantha",    athleteId:"ATH-1198", sport:"Weightlifting",comp:"National Weightlifting Championship", venue:"Sugathadasa Stadium, Colombo", date:"2026-07-15", type:"In-Competition",    sample:"Urine", status:"Completed", officer:"D. Rajapaksa"},
  {id:"DCF-2026-0418", athlete:"Malith Gunasekara",   athleteId:"ATH-1301", sport:"Cycling",     comp:"Out-of-Competition Programme",        venue:"Training Base, Nuwara Eliya",  date:"2026-07-19", type:"Out-of-Competition",sample:"Blood", status:"Pending",   officer:"D. Rajapaksa"},
  {id:"DCF-2026-0409", athlete:"Kasun Perera",        athleteId:"ATH-1103", sport:"Cricket",     comp:"Domestic Twenty20 Final",             venue:"R. Premadasa Stadium, Colombo",date:"2026-07-11", type:"In-Competition",    sample:"Urine", status:"Completed", officer:"N. Ekanayake"},
  {id:"DCF-2026-0406", athlete:"Chathuri Silva",      athleteId:"ATH-1284", sport:"Netball",     comp:"National Netball League",             venue:"Torrington Grounds, Colombo",  date:"2026-07-08", type:"In-Competition",    sample:"Urine", status:"Completed", officer:"N. Ekanayake"},
  {id:"DCF-2026-0401", athlete:"Nimali Fernando",     athleteId:"ATH-1087", sport:"Swimming",    comp:"National Aquatic Championship",       venue:"Sugathadasa Pool, Colombo",    date:"2026-07-02", type:"In-Competition",    sample:"Both",  status:"Under Review",officer:"D. Rajapaksa"},
  {id:"DCF-2026-0395", athlete:"Ishara Bandara",      athleteId:"ATH-1260", sport:"Boxing",      comp:"Out-of-Competition Programme",        venue:"Army Camp, Panagoda",          date:"2026-06-30", type:"Out-of-Competition",sample:"Urine", status:"Completed", officer:"S. Wijesinghe"},
  {id:"DCF-2026-0388", athlete:"Randhir Senaratne",   athleteId:"ATH-1042", sport:"Athletics",   comp:"National Athletics Championship",     venue:"Diyagama Stadium, Homagama",   date:"2026-06-18", type:"In-Competition",    sample:"Urine", status:"Completed", officer:"S. Wijesinghe"},
  {id:"DCF-2026-0377", athlete:"Roshan de Silva",     athleteId:"ATH-1348", sport:"Football",    comp:"Champions League Final",              venue:"Race Course Ground, Colombo",  date:"2026-06-05", type:"In-Competition",    sample:"Urine", status:"Completed", officer:"N. Ekanayake"},
  {id:"DCF-2026-0361", athlete:"Tharushi Karunaratne",athleteId:"ATH-1156", sport:"Athletics",   comp:"Junior National Meet",                venue:"Diyagama Stadium, Homagama",   date:"2026-05-27", type:"In-Competition",    sample:"Urine", status:"Completed", officer:"S. Wijesinghe"},
  {id:"DCF-2026-0340", athlete:"Amaya Wickramasinghe",athleteId:"ATH-1221", sport:"Badminton",   comp:"National Badminton Open",             venue:"Sugathadasa Indoor, Colombo",  date:"2026-04-09", type:"In-Competition",    sample:"Urine", status:"Completed", officer:"D. Rajapaksa"}
];

var NOTIFICATIONS = [
  {id:1, icon:"📄", bg:"bg-red",   title:"New WADA Prohibited List Released",  body:"The 2027 Prohibited List has been published and takes effect on 1 January. Two substances have been added to S6 and the glucocorticoid guidance has been revised.", time:"2 hours ago",  unread:true,  audience:"all"},
  {id:2, icon:"🧪", bg:"bg-blue",  title:"Athlete Selected for Testing",       body:"You have been selected for out-of-competition testing. A doping control officer will contact you. Ensure your whereabouts information is current.", time:"Yesterday",    unread:true,  audience:"athlete"},
  {id:3, icon:"✅", bg:"bg-green", title:"Testing Report Submitted",           body:"Doping control form DCF-2026-0412 has been submitted to SLADA and is awaiting review.", time:"2 days ago",   unread:false, audience:"officer"},
  {id:4, icon:"🎓", bg:"bg-violet",title:"Upcoming Education Session",         body:"A clean sport education session for national squad athletes is scheduled for 14 August at the Ministry of Sports auditorium. Attendance is mandatory for the Registered Testing Pool.", time:"3 days ago",  unread:false, audience:"all"},
  {id:5, icon:"📋", bg:"bg-amber", title:"TUE Application Update",             body:"Your Therapeutic Use Exemption application TUE-2026-0087 is under review by the independent panel. No further action is required from you at this stage.", time:"5 days ago",  unread:false, audience:"athlete"},
  {id:6, icon:"🔔", bg:"bg-blue",  title:"Whereabouts Reminder",               body:"Your quarterly whereabouts filing is due in 7 days. Late or inaccurate filings may be recorded as a filing failure.", time:"1 week ago",   unread:false, audience:"athlete"}
];

var ACTIVITY = [
  {icon:"🧪", bg:"bg-blue",   t:"Test registered",        s:"DCF-2026-0418 · Malith Gunasekara · Out-of-Competition", m:"12 min ago"},
  {icon:"✅", bg:"bg-green",  t:"Report submitted",       s:"DCF-2026-0412 · National Weightlifting Championship",    m:"2 hours ago"},
  {icon:"👤", bg:"bg-violet", t:"Athlete registered",     s:"Hasini Rajapaksa · Swimming",                            m:"5 hours ago"},
  {icon:"📄", bg:"bg-amber",  t:"Prohibited List updated",s:"2027 edition published by WADA",                         m:"Yesterday"},
  {icon:"🎓", bg:"bg-green",  t:"Education session logged",s:"34 athletes completed clean sport module",              m:"2 days ago"},
  {icon:"🔍", bg:"bg-blue",   t:"Medication checked",     s:"Pseudoephedrine · flagged as threshold substance",       m:"2 days ago"}
];

var MONTHLY_TESTS = [
  {m:"Jan", ic:18, ooc:9},  {m:"Feb", ic:22, ooc:11}, {m:"Mar", ic:31, ooc:14},
  {m:"Apr", ic:27, ooc:12}, {m:"May", ic:38, ooc:17}, {m:"Jun", ic:44, ooc:19},
  {m:"Jul", ic:36, ooc:21}
];

var TESTS_BY_SPORT = [
  {s:"Athletics",     n:68, c:"var(--blue-600)"},
  {s:"Cricket",       n:52, c:"var(--green-600)"},
  {s:"Weightlifting", n:47, c:"var(--amber-600)"},
  {s:"Swimming",      n:34, c:"var(--violet-600)"},
  {s:"Rugby",         n:28, c:"var(--blue-300)"},
  {s:"Other",         n:40, c:"var(--faint)"}
];

var USERS = [
  {name:"D. Rajapaksa",    email:"d.rajapaksa@example.lk",  role:"Doping Control Officer", status:"Active",   last:"Today, 09:14"},
  {name:"N. Ekanayake",    email:"n.ekanayake@example.lk",  role:"Doping Control Officer", status:"Active",   last:"Today, 08:02"},
  {name:"S. Wijesinghe",   email:"s.wijesinghe@example.lk", role:"Doping Control Officer", status:"Active",   last:"Yesterday"},
  {name:"A. Mendis",       email:"a.mendis@example.lk",     role:"Administrator",          status:"Active",   last:"Today, 10:41"},
  {name:"P. Kumarasinghe", email:"p.kumara@example.lk",     role:"Results Manager",        status:"Active",   last:"3 days ago"},
  {name:"T. Fernando",     email:"t.fernando@example.lk",   role:"Education Officer",      status:"Inactive", last:"2 weeks ago"}
];

var WADA_UPDATES = [
  {t:"2027 Prohibited List published",        s:"Effective 1 January 2027 · two additions to S6", m:"2 days ago"},
  {t:"Glucocorticoid guidance revised",       s:"Washout periods clarified for injectable routes", m:"1 week ago"},
  {t:"Updated TUE application standard",      s:"New documentation requirements for respiratory conditions", m:"3 weeks ago"}
];

/* ---------- i18n ----------
   Navigation and chrome only. Article and medication content remains in
   English in this prototype and requires professional translation before
   any public release. Translations below are unreviewed placeholders. */
var I18N = {
  en:{
    home:"Home", search:"Search", learn:"Learn", profile:"Profile", quiz:"Quiz",
    settings:"Settings", notifications:"Notifications", dashboard:"Dashboard",
    athlete:"Athlete", officer:"Doping Control Officer", admin:"Administrator",
    getStarted:"Get Started", learnMore:"Learn More", back:"Back", next:"Next",
    resources:"Official Resources", language:"Language", theme:"Theme"
  },
  si:{
    home:"මුල් පිටුව", search:"සොයන්න", learn:"ඉගෙන ගන්න", profile:"පැතිකඩ", quiz:"ප්‍රශ්නාවලිය",
    settings:"සැකසුම්", notifications:"දැනුම්දීම්", dashboard:"උපකරණ පුවරුව",
    athlete:"ක්‍රීඩකයා", officer:"උත්තේජක පාලන නිලධාරී", admin:"පරිපාලක",
    getStarted:"ආරම්භ කරන්න", learnMore:"තව දැනගන්න", back:"ආපසු", next:"ඊළඟ",
    resources:"නිල සම්පත්", language:"භාෂාව", theme:"තේමාව"
  },
  ta:{
    home:"முகப்பு", search:"தேடு", learn:"கற்றுக்கொள்", profile:"சுயவிவரம்", quiz:"வினாடி வினா",
    settings:"அமைப்புகள்", notifications:"அறிவிப்புகள்", dashboard:"கட்டுப்பாட்டுப் பலகை",
    athlete:"விளையாட்டு வீரர்", officer:"ஊக்கமருந்து கட்டுப்பாட்டு அதிகாரி", admin:"நிர்வாகி",
    getStarted:"தொடங்குங்கள்", learnMore:"மேலும் அறிக", back:"பின்", next:"அடுத்து",
    resources:"அதிகாரப்பூர்வ ஆதாரங்கள்", language:"மொழி", theme:"தீம்"
  }
};
