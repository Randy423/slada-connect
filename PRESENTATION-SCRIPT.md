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

**Don't walk all eight steps of the form.** It's eight screens and you have three minutes. Go: notification (register lookup fills the fields) → jump to samples (specific gravity warning) → jump to review. Use the numbered step buttons along the top to skip. Walking every field is the fastest way to lose the room.

**Pre-fill the form before you go in** if you can — get it to the samples step, then reset only if you want to show the register lookup live.

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

## 5. Demo: The officer workflow — 3.5 minutes

> **This is now your strongest credibility moment. Open with it.**

**[Open the officer portal, sign in, → New Doping Control Form]**

> "This is your Doping Control Form. Not a generic version of one — I worked from the actual SLADA form, and this follows it field for field.
>
> It's laid out in your four sections. Athlete notification. Athlete information. Information for analysis. Confirmation of procedure. The labels carry the Sinhala from your form, so an officer who uses the paper version recognises every screen."

**[Step 2 — search the register, tap an athlete]**

> "Notification. The officer searches the register, and family name, given name, date of birth, nationality and document number fill themselves — instead of being copied by hand from an ID card. Then the athlete signs the acknowledgement, and the DCO signs. Both signatures, exactly as on the form."

**[Skip ahead to Step 5 — Samples. This is the moment.]**

> "This is the section I'd point you to. Partial sample number, volume, time sealed, athlete and DCO initials. Then each sealed sample — code number, volume, time sealed, and specific gravity."

**[Type a volume of 60 and a specific gravity of 1.002 — let the warnings appear]**

> "And here's the thing paper can't do. That's under 90 millilitres, so it tells the officer the sample isn't suitable for analysis. And the specific gravity is below 1.005, so it flags that too — before the athlete has left the station, rather than when the laboratory rejects it three weeks later."

**[Correct the values — the warnings disappear]**

**[Step 6 briefly]**

> "The medication declaration, with the seven-day wording from your form. And consent for research — accept or refuse."

**[Step 8 — review]**

> "Then the whole form for review, laid out in your four sections, with all five signature points and the copy distribution — original to the agency, pink to the athlete, yellow and blue to the laboratory, green for the notification."

**[Submit, then go to the admin dashboard and show the test appearing]**

> "And the moment it's submitted it's in the system — the testing numbers, the athlete's record, the reports. That's the real argument for doing this digitally. Today that's a carbon-copy form that has to be transported, filed and typed up by somebody."

**Then be honest about what's still missing — say it before anyone asks:**

> "Two things I haven't done. Your form references the athlete rights and responsibilities text on the overleaf of Copy 4, and I've only seen the front, so that text isn't in here. And each sample row on your form has a space for the witness or BCO to sign — I capture the witness's name but not their signature. Both are straightforward to add once I've seen the back of the form."

---

## 6. Demo: Administration — 90 seconds (cut second if short on time)

**[Open the admin dashboard]**

> "Testing volume by month, in-competition versus out-of-competition, distribution by sport, the athlete database, and exports. This is the view where you'd see whether the testing programme is actually distributed the way you intend it to be — or whether one federation is being tested far more than another."

---

## 7. What's real and what isn't — 60 seconds (say this unprompted)

> "So that you can judge it properly, let me separate what genuinely works from what's staged.
>
> **Real:** the medicine search and its live database lookups, the classification and safety logic, the doping control form and its validation, the sample suitability checks, signature capture, the CSV export, and every screen you've seen. It works on any phone.
>
> **Not real:** there's no login security — any password works. There's no server, so everything lives in the browser on that one device, which also means a form is lost if the app is closed mid-session. Report generation is a button that does nothing. And all the athlete data is invented.
>
> The gap between those two lists is roughly what the real work would be."

---

## 8. The ask — 30 seconds

Pick **one**. Don't ask for everything.

**If you want it to continue (recommended):**

> "What I'd like to ask is this. Is this worth developing properly? And if you think it might be, half an hour with one of your doping control officers would tell me quickly whether the form actually works the way they work — I've matched the fields, but I've never watched a session. The overleaf text of Copy 4 would let me finish the notification section."

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
> "No. A real system would have to, and I haven't built that. Your own form has the athlete consenting to their data being processed through ADAMS, so that integration isn't optional — it's one of the main open questions."

**"Where did you get our doping control form?"**
> Answer honestly — say who gave it to you. If it was shared with you for this purpose, say so plainly. Do not be vague about this; it's exactly the sort of thing that damages trust if it sounds evasive.

**"Have you ever seen a doping control session?"**
> "No. I've matched your form field by field, but I've never watched one being filled in, and I'd expect that to reveal things the form alone doesn't show — what order officers actually work in, what they do while waiting, what goes wrong. That's why I'm asking for time with a DCO rather than telling you it's finished."

**"What happens if the officer's phone dies mid-session?"**
> "Right now, the form is lost — it lives in the browser's memory. That's a genuine gap and it would have to be fixed before any real use: the form would need to save as it goes, so an officer can pick it up on another device." *(Be straight about this. It's the most obvious operational objection a DCO will raise.)*

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
