# SLADA Connect — presentation script

For a meeting with the Director General, SLADA.
Target: **10 minutes demo, 5 minutes discussion.** Adjust by cutting Sections 4 and 6 first.

---

## Before you walk in

**Test your internet.** The medicine search calls two live databases. Without a connection, brand-name lookup fails. The education, quiz and the ~209 built-in ingredient classifications still work offline, so you have a fallback — but know which is which before you're standing there.

**Reset the demo data.** Settings → *Reset prototype data*. Otherwise the DG sees your test scribbles in the signature boxes.

**Have the site already open in a tab**, signed in, sitting on the athlete dashboard. Do not open a laptop and start typing a URL.

**Take screenshots of the five key screens** and keep them in your phone gallery. If the wifi dies you can still tell the story.

**Have your phone AND a laptop if possible.** The phone makes the "an athlete uses this at the track" point far better than a laptop does.

**Decide your ask before you go in.** See Section 8. A demo without an ask wastes the meeting.

---

## 1. Opening — 45 seconds

> "Thank you for seeing me. I've built a working prototype of a digital platform for anti-doping in Sri Lanka, and I wanted to show it to you directly rather than describe it.
>
> I want to be clear from the start about what this is. It's a concept prototype I built myself. It is not an official SLADA product, it hasn't been endorsed by anyone, and every athlete name and test record in it is invented sample data. Every screen says so. I'm showing it to you to ask whether the idea is worth pursuing — not to present a finished system."

**Why this matters:** you get one chance to set the frame. If you overclaim and someone catches a gap later, you lose the room. If you underclaim honestly, every good thing that follows lands harder.

---

## 2. The problem — 90 seconds

> "The question every athlete asks their coach or physio is four words: *can I take this?*
>
> Right now the honest answer is 'go and check Global DRO, and if you're not sure, call SLADA.' That's correct advice. But an athlete standing in a pharmacy in Kandy with a cold, two days before a meet, often doesn't check. And when they do check, what they get is a yes or a no — with no explanation of *why*. So they don't learn anything, and next time they still don't check.
>
> Two things go wrong. Athletes take something they shouldn't. And SLADA's officers spend time answering the same question over and over.
>
> That's the problem I tried to solve — and then the platform grew around it."

---

## 3. Demo: "Can I Take This?" — 4 minutes (your strongest material)

**[Open the athlete portal → Can I Take This?]**

> "This is the athlete's side. Let me search something ordinary first."

**[Type: Panadol]**

> "Green — generally permitted. But look at what's underneath: *why*. Paracetamol relieves pain without affecting muscle, endurance or recovery, so it gives no competitive advantage. The athlete learns the principle, not just the verdict."

**[Search: Sudafed]**

> "Now something harder. Amber — use caution. And the explanation says why it's amber rather than banned: at cold-and-flu doses it clears a blocked nose, at high doses it acts as a stimulant, so the rules set a threshold rather than an outright ban. Which means dose and timing are what actually matter to this athlete."

**[Scroll to the "Your sport" card]**

> "This part I think is the most useful. It answers the question the athlete actually has — does this apply to *me*?"

**[Search: propranolol. Point at the card.]**

> "I'm registered here as an athletics athlete, so it tells me beta-blockers aren't restricted for me. Watch what happens if I check the same drug as a shooting athlete."

**[Use the "check another sport" selector → Shooting]**

> "Now it's restricted — in competition and out of competition. That's real: beta-blockers are the one class on the Prohibited List whose status genuinely changes by sport. Most athletes never need to think about it. Your shooters and archers do."

**[Search: warfarin — or anything not in the ruleset]**

> "And this is the part I care about most. The platform doesn't know this one. So it says so — grey, 'not classified here', and explicitly, *this does not mean it is permitted*. Then it sends the athlete to Global DRO.
>
> I built it this way deliberately. It would have been easy to make it look clever by always producing a confident answer. But a tool that guesses is worse than no tool, because an athlete will believe it. If it doesn't know, it says it doesn't know."

**If asked where the data comes from — answer immediately and plainly:**

> "The medicine identification is live, from RxNorm, which is the U.S. National Library of Medicine's drug database, and openFDA for the label text. The anti-doping classification is *not* from them — no free database publishes that. That part is a mapping I wrote from the WADA substance classes, covering about 209 ingredients. It's good enough to teach the shape of the rules. It is not an authority, and before any athlete relies on it, it would have to be replaced by, or checked against, Global DRO."

---

## 4. Demo: Learn and Quiz — 90 seconds (cut this first if short on time)

**[Open Learn]**

> "Nine plain-language guides — WADA, SLADA, strict liability, athlete rights, responsibilities, supplements, TUEs, the doping control process, and the Prohibited List. Written to be read on a phone in a few minutes, not to be a legal document."

**[Open the Quiz, answer two questions]**

> "Ten questions, with an explanation after each answer so it teaches rather than tests. At the end there's a certificate — which is the part that could actually be useful to you administratively, if you wanted evidence that an athlete has completed education before a competition."

---

## 5. Demo: The officer workflow — 3 minutes

**[Open the officer portal, sign in, → Register New Test]**

**Say this before you demo it — do not wait to be asked:**

> "Before I show this, one important caveat. I built this form from the WADA International Standard, because I've never seen SLADA's actual doping control form. So the *flow* is what I want you to look at, not the field list. I already know things are missing — specific gravity and sample volume, the partial sample procedure, chain of custody, the athlete representative as a separate role from the witness. If this went further, the first thing I'd need is a copy of your real form so I can match it field for field."

**[Walk through the steps quickly]**

> "Seven steps. Competition details. Athlete — and this searches your register, so the officer isn't retyping details that already exist. Notification. Sample collection — the bottle codes here would come from a barcode scan; I've simulated that."

**[Step 6 — sign on the screen with your finger]**

> "Signatures on the screen. Athlete, officer, witness."

**[Step 7 — review]**

> "Then the full form for review, a PDF for the athlete's copy, and submit."

**[Go to the admin dashboard and show the test appearing]**

> "And the moment it's submitted it's in the system — testing numbers, the athlete's record, the reports. Which is the real argument for doing this digitally: today that's a paper form that has to be transported, filed and typed up by somebody."

---

## 6. Demo: Administration — 90 seconds (cut second if short on time)

**[Open the admin dashboard]**

> "Testing volume by month, in-competition versus out-of-competition, distribution by sport, the athlete database, and exports. This is the view where you'd see whether the testing programme is actually distributed the way you intend it to be — or whether one federation is being tested far more than another."

---

## 7. What's real and what isn't — 60 seconds (say this unprompted)

> "So that you can judge it properly, let me separate what genuinely works from what's staged.
>
> **Real:** the medicine search and its live database lookups, the classification and safety logic, signature capture, form validation, the CSV export, and every screen you've seen. It works on any phone.
>
> **Not real:** there's no login security — any password works. There's no server; everything lives in the browser on the device. Barcode scanning is simulated. Report generation is a button that does nothing. And all the data is invented.
>
> The gap between those two lists is roughly what the real work would be."

---

## 8. The ask — 30 seconds

Pick **one**. Don't ask for everything.

**If you want it to continue (recommended):**

> "What I'd like to ask is this. Is this worth developing properly? And if you think it might be, two specific things would help: a copy of your doping control form so I can make that workflow real, and half an hour with one of your doping control officers and whoever runs athlete education. That would tell me quickly whether this fits how you actually work."

**If you want a decision:**

> "I'd like to know whether SLADA would consider piloting something like this — even with a small group, say the athletics squad — so we can find out whether athletes actually use it."

**If you want endorsement to keep building:**

> "I'm not asking for a commitment. I'd just like your permission to keep developing it with input from your team, and to be clear that I won't present it publicly as a SLADA product unless and until you decide it is one."

---

## 9. Hard questions — prepare these

**"Who authorised you to use SLADA's name?"**
> "Nobody, and that's deliberate — it's labelled on every screen as a concept prototype, not an official product, and it isn't published under your branding. I used the name so you could see what it would look like in context. If you'd prefer, I'll rename it immediately."

**"Is it safe for athletes to use right now?"**
> "No, and I wouldn't want them to. The classification is educational, not authoritative. It's built to refuse to guess — an unknown ingredient never shows as permitted — but it still needs to be validated against Global DRO before anyone relies on it."

**"How much would this cost, and how long?"**
> "I genuinely don't know yet, and I'd rather not invent a number. It depends on things I can't decide alone: whether it needs a backend, whether it integrates with ADAMS, whether you'd license Global DRO data, and hosting and security requirements. If you're interested, that's a scoping conversation."

**"Does it work with ADAMS?"**
> "No. A real system would have to, and I haven't built that. It's one of the main open questions."

**"Does it work without internet?"**
> "Partly. The education, the quiz and about 209 ingredient classifications work offline. Searching a brand name needs a connection, because that's a live database lookup."

**"What about Sinhala and Tamil?"**
> "The interface switches between all three now, but only the navigation — the article and medicine content is still English, and the translations I have are placeholders that need a professional and a native speaker to review. I didn't want to ship bad Sinhala in a government tool."

**"Where would athlete data be stored?"**
> "Right now, nowhere — it never leaves the device, because there's no server. A real deployment would need secure hosting, proper authentication, encryption, a retention policy, and compliance with the international standard on privacy. That's a serious piece of work and it's not done."

**"Who are you and why did you build this?"**
> Answer this in your own words. Be brief and honest. It's the question most likely to decide whether the meeting goes anywhere.

---

## 10. If the demo breaks

Don't fix it live. Say:

> "That's the live database call — it needs a connection. Let me show you the screenshot instead."

Then move on. Fumbling with a laptop for ninety seconds costs more than the feature was worth.

---

## Closing — 20 seconds

> "That's it. It's a prototype, not a product, and I know the difference. But I think the underlying idea — that an athlete should be able to get a clear, honest answer about a medicine in under a minute, and understand why — is worth building properly. I'd value your view on whether SLADA agrees."
