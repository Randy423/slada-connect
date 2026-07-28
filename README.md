# SLADA Connect — One Platform for Clean Sport

A high-fidelity, fully responsive prototype of a unified digital platform for the Sri Lanka Anti-Doping Agency: athlete education, medication guidance, doping control management, officer workflow and administration in one system.

**Status: concept prototype.** Not an official product of, and not endorsed by, SLADA, WADA or any other organisation. All athlete records, test data, statistics and contact details are illustrative samples.

## Running it

Open `index.html` in any modern browser — no build step, no dependencies, no package install.

```bash
python -m http.server 8794
```

Serving over HTTP is recommended (the medicine checker calls two public APIs). Opening the file directly from disk also works; only live medicine lookup is affected if the browser blocks cross-origin requests from `file://`.

## Structure

```
index.html              app shell, prototype banner, modal/sheet/toast hosts
assets/css/app.css      design system — tokens, layout, components, light + dark
assets/js/data.js       medication ruleset, articles, quiz, sample operational data, i18n
assets/js/core.js       router, shell, store, charts, drug-database layer, UI primitives
assets/js/athlete.js    athlete portal incl. "Can I Take This?"
assets/js/officer.js    officer portal incl. the 7-step testing workflow
assets/js/admin.js      admin dashboard, athlete database, shared settings + notifications
assets/js/boot.js       landing page, route table, boot
```

Plain `<script>` tags rather than ES modules, so the prototype runs from `file://` as well as over HTTP. Routing is hash-based (`#/athlete/check`), so the browser back button and deep links both work — you can send someone a link to any single screen.

## The three portals

Pick a portal from the landing page, or jump straight in:

| Portal | Route | Contents |
| --- | --- | --- |
| **Athlete** | `#/athlete` | Dashboard, Can I Take This?, Learn (9 guides), Quiz, Prohibited List, TUE, Resources, Profile, Notifications, Settings |
| **Officer** | `#/officer` | Sign-in, dashboard, 7-step test registration, test records, athlete register, reports |
| **Administrator** | `#/admin` | Analytics dashboard, athlete database, test records, reports & export, user management |

Both the athlete and officer portals have auth guards: any route in those portals redirects to its sign-in screen until you authenticate, including deep links. **No real authentication is implemented** — press Sign in with any values.

### Athlete accounts

Entering the athlete portal offers three paths:

- **Sign in** — any email and password continues as the existing sample athlete.
- **Create an account** — a three-step flow: your details (name, email, date of birth, gender, nationality, ID) → your sport (sport, event, federation, testing-pool membership) → confirm. Selecting a sport auto-fills its federation, and the step immediately tells you whether your sport carries a sport-specific restriction. Creating an account resets progress so the new athlete starts clean.
- **Explore as a guest** — full access without an account, with a banner on the profile prompting registration. Useful for demos.

Sport is the field that does real work: it drives the compatibility answer described below, so the registration flow treats it as required rather than optional.

## "Can I Take This?" — live medicine search

Carried over from the standalone app and wired to two public, keyless, CORS-enabled APIs:

| Source | Used for |
| --- | --- |
| **RxNorm / RxNav** (U.S. National Library of Medicine) | Typeahead suggestions; resolving a brand name to its active ingredients |
| **openFDA** drug label API | Plain-language "what it is used for", drug class, other brand names |

**Neither API publishes anti-doping status — no free API does.** The databases establish *what a medicine is*; a local ruleset (`RULES` in `data.js`) maps the active ingredient to a WADA substance class. That ruleset covers 209 ingredients across S1–S9 and P1 plus the common permitted medicines, and every rule carries a **why** explanation rather than a bare verdict — the brief asked for education, not a yes/no oracle.

Three safety rules fall out of that split. They are the most important part of the design:

1. **Unmatched ingredients are never shown as permitted.** They return a grey ⚪ *Not Classified Here* result stating explicitly "this does not mean it is permitted", with Global DRO marked *Required*.
2. **A combination product with any unknown ingredient is downgraded.** If a recognised ingredient would read "permitted" but another is unclassified, the badge drops to ⚪ rather than green — one unknown ingredient is enough to change the answer. Restrictive statuses (🟠/🔴) survive intact, since those already warn.
3. **The most restrictive matching ingredient wins.** Codeine plus ibuprofen resolves to 🟠, not 🟢.

### Is it compatible with my sport?

Every medication result carries a **Your sport** card answering the question an athlete actually has — does this apply to *me*?

This is modelled honestly, which matters more than making it look clever. **Only one class on the Prohibited List genuinely changes status by sport: P1 beta-blockers**, restricted in precision disciplines (archery, shooting, golf, darts, billiards and others) and, in archery and shooting, out of competition too. Everything else applies identically to every athlete.

So the card gives one of four answers:

| Case | What it says |
| --- | --- |
| Beta-blocker, athlete in a P1 sport | ⚠️ *Restricted in Shooting* — prohibited in competition, and out of competition in archery/shooting; TUE needed if prescribed |
| Beta-blocker, athlete in any other sport | ✓ *Not restricted in Athletics* — this class does not apply to you |
| Any other substance | 🏅 *Applies to your sport, and to every sport* — nothing here is discipline-specific |
| Unclassified substance | ⚠️ No sport-specific answer is invented; it directs you to Global DRO with your sport selected |

Deliberately **not** done: inventing per-sport rules for substances that have none. An athlete who comes to believe the rules vary by sport in general will draw exactly the wrong conclusions about the substances that matter most.

The card also carries a **check another sport** selector, so an athlete can see how a substance differs elsewhere without changing their profile (marked *preview*), and a category note — weight-category, endurance, precision or team — flagging the risks that sport most often runs into. Those notes are educational emphasis, clearly separated from status, and never alter a verdict.

Search results are labelled by origin — *In app* (hand-written guides), *Ingredient* (local ruleset, **works offline**), *Database* (resolved live from RxNorm) — so it is always clear where an answer came from. Network failures degrade to the offline ingredient index rather than breaking.

## Doping control workflow

`#/officer/new-test` runs the seven steps from the brief: competition → athlete → notification → sample collection → athlete declaration → digital signatures → review. Notable behaviour:

- **Athlete lookup** pulls from the register and fills every field, or you can enter an unregistered athlete manually.
- **Barcode scanning is simulated.** The Scan button generates a plausible bottle code and renders a deterministic barcode derived from it. A production build would use the device camera or a paired scanner.
- **Signatures are real.** Three canvas pads capture pointer, touch or stylus input, are stored as PNG data URLs, and are rendered into the review step.
- **Validation** blocks progress on missing competition, venue, athlete name, sport and both bottle codes. Submission additionally requires the athlete and officer signatures.
- **Download PDF** uses the browser's print dialogue against a print stylesheet that strips navigation. Submission writes the record to local storage, so it then appears in Test Records, the admin dashboard and the athlete's profile.

## Design system

White-first with blue and green accents, rounded cards, soft shadows and restrained motion. Everything is driven by CSS custom properties, so the **dark theme** is a token swap rather than a second stylesheet. Charts (grouped bars, donut, horizontal bars, progress rings) are hand-rolled SVG and CSS — no charting library, nothing to load, and they inherit theme colours automatically.

**Responsive behaviour**, verified at each breakpoint:

- **Mobile (< 1000px)** — athlete portal switches to a bottom tab bar; officer and admin sidebars become a drawer with a scrim; wide tables scroll inside their own container so the page never scrolls sideways.
- **Tablet (768px)** — single-column dashboards, drawer navigation, full-width cards.
- **Desktop (≥ 1000px)** — persistent 260px sidebar, two-column dashboards, four-across stat grids.

`prefers-reduced-motion` is respected throughout.

## Languages

The interface switches between **English, Sinhala and Tamil** from Settings. Navigation and chrome labels are translated; **article and medication content remains in English**. The translations are unreviewed placeholders and must be checked by a native speaker before any public use — a government platform with poor translations is worse than one that is honestly English-only for now.

## What is real and what is simulated

**Real:** medicine search against live APIs; ingredient classification, sport-compatibility logic and all safety rules; athlete account creation with validation; signature capture; form validation; CSV export; print/PDF output; progress, accounts, submitted forms and preferences persisted to local storage; theme and language switching; every screen and route.

**Simulated:** authentication (no credentials are checked, no password is stored, and any values are accepted); barcode scanning; report generation; officer/admin user management; outbound links, which open an explanatory dialogue instead of navigating away so a live demo cannot get lost.

**Reset:** Settings → *Reset prototype data* restores the starting state before a presentation.

## Before this becomes a real platform

The interface is presentation-ready. These are the things that must be resolved before any athlete or officer relies on it:

- **Anti-doping classification** comes from the local ruleset, not an official source. It must be replaced by, or validated against, Global DRO and the current Prohibited List. The list changes every 1 January, so this needs a named owner and an annual review cycle — not a one-off sign-off.
- **RxNorm is US-centric.** It covers Panadol, Ventolin and most international brands, but Sri Lankan generics and local brand names may be missing, and openFDA label text describes the US formulation. The curated in-app list is the mitigation and is where locally common products belong.
- **The sport-compatibility mapping is limited to P1 beta-blockers**, which is correct for the current Prohibited List but is hard-coded. If WADA ever makes another class sport-dependent, this needs updating alongside the annual list review. Global DRO remains the authority, since its results are country *and* sport specific.
- **Athlete accounts are not real accounts.** No password is stored or checked and nothing is verified. Real athlete registration needs identity verification against the national register, not self-declaration — an athlete could currently select any sport, which would change the guidance they receive.
- **No backend exists.** Everything is in browser local storage. Real athlete and medical data requires secure hosting, authentication, role-based access enforced server-side, encryption in transit and at rest, audit logging, defined retention periods, and compliance with the International Standard for the Protection of Privacy and Personal Information.
- **Digital signatures** are images. Legally meaningful signatures need cryptographic binding to the submitted form and a tamper-evident audit trail.
- **Contact details and statistics** are placeholders and must be supplied by SLADA.
- **Use of the SLADA name**, or any claim of collaboration or endorsement, requires their explicit agreement.

The educational disclaimer required by the brief appears on every athlete-facing screen and in the footer.
