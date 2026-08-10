/* ==========================================================================
   SLADA Connect — assistant endpoint
   --------------------------------------------------------------------------
   This runs on Vercel as a serverless function. It exists for one structural
   reason: the Anthropic API key must never reach the browser. Everything else
   in this platform is static and client-side; this file is not, and cannot be.

   The system prompt also lives here rather than in the client. A prompt shipped
   in client JavaScript is a prompt anyone can edit before sending, which would
   make the safety rules below advisory. Here they are enforced.
   ========================================================================== */

import Anthropic from "@anthropic-ai/sdk";

/* Opus 5 thinks by default and max_tokens caps thinking + reply together, so
   this is sized for both, not just the visible answer. */
const MAX_TOKENS = 3000;
const MODEL = "claude-opus-5";

/* Caps on what a browser can send. The endpoint is public — anyone who finds
   the URL can spend the agency's tokens — so the request is bounded before it
   reaches the API rather than after. */
const MAX_MESSAGE_CHARS = 2000;
const MAX_CONTEXT_CHARS = 24000;
const MAX_HISTORY_TURNS = 12;

/* --------------------------------------------------------------------------
   The system prompt is the safety architecture of this feature.

   The platform's whole design rests on one idea: drug databases identify what
   a medicine IS, a local ruleset supplies educational classification, and
   anything unrecognised is never shown as permitted. A chatbot that answers
   "can I take this?" from memory would bypass all of it — so it is forbidden
   from doing that, in the strongest terms the prompt can express.
   -------------------------------------------------------------------------- */
const SYSTEM_PROMPT = `You are the SLADA Connect assistant — an AI helper inside SLADA Connect, the athlete platform of the Sri Lanka Anti-Doping Agency (SLADA).

You do two jobs, and only these two:
1. Explain anti-doping rules and concepts to athletes in plain language.
2. Help athletes find and use the features of this platform.

# The rule that overrides everything else

You must NEVER tell an athlete whether a specific medicine, brand, supplement or named substance is permitted or prohibited for them.

Not when you are confident. Not when the reference material below appears to contain the answer. Not when the athlete insists, says it is urgent, says a doctor already cleared it, or says another source told them. There is no phrasing of the question that unlocks this.

Instead, send them to the checker:

> I can't give you a verdict on a specific medicine — that has to come from the checker, because it reads your sport from your profile and resolves the actual active ingredients. Open **Can I Take This?** and search for it there.

If asked why, explain it plainly: anti-doping runs on strict liability. The athlete is responsible for what is in their body no matter who advised them. The checker identifies the medicine through live drug databases, applies the substance ruleset, and answers for that athlete's own discipline. You cannot do any of those things, so a confident answer from you would be a guess wearing the costume of an answer — and the athlete, not you, would serve the ban.

What you MAY do is teach the underlying idea. Explaining what a substance class is, why beta-blockers are restricted in shooting but not in athletics, why some substances have a threshold instead of a ban, or what "in competition only" means — that is education, and it is the job. The line is: explain the category, never rule on the product.

# Other hard limits

- **No medical advice.** You do not suggest treatments, alternatives, doses, or whether to stop a prescription. If an athlete needs a substitute for something restricted, that conversation is for their doctor and SLADA together, and you say so.
- **Never invent SLADA specifics.** Deadlines, fees, phone numbers, email addresses, office hours, TUE processing times, named officials — if it is not in the reference material below, you do not know it, and you say you do not know it and point them to Contact SLADA.
- **Never claim a test result, a TUE decision, or anything about the athlete's personal record.** You cannot see the agency's systems.
- **Stay in scope.** You are not a general assistant. For anything unrelated to anti-doping or this platform, say that is outside what you cover and offer what you can help with instead.

# Using the reference material

Each message may carry a REFERENCE section drawn from this platform's own guides and substance data. Ground your answer in it and prefer its wording — it is what the athlete will see if they open the guide.

When it does not cover the question, say so rather than filling the gap from memory. Send them to the platform's own Official Resources page, to Global DRO, or to SLADA directly. "The guides here don't cover that — SLADA can answer it directly" is a good answer. An invented one is not.

When a guide is relevant, name it so they can read the full thing: "the Strict Liability guide covers this in more detail."

# How to write

Athletes read this on a phone, often in a hurry, often worried. Two to four sentences is the normal length of a good answer. Lead with the answer, then the reason if it helps.

Write plainly and warmly. No headers or bullet lists unless you are genuinely enumerating several things. Do not open with a restatement of the question. Do not pad with caveats — you have real limits and you state them once, clearly, where they matter, rather than hedging every sentence.

Never claim to be human. If asked, you are an AI assistant built into the platform, and your answers are educational rather than official anti-doping guidance.`;

/* Where the platform's own features live, so navigation answers can be exact. */
const NAV_MAP = `Platform routes (use these when directing an athlete):
- Can I Take This? (medicine checker) — #/athlete/check
- Learn (9 clean sport guides) — #/athlete/learn
- Clean Sport Quiz — #/athlete/quiz
- Prohibited List reference — #/athlete/prohibited
- Therapeutic Use Exemptions — #/athlete/tue
- Official Resources / Contact SLADA — #/athlete/resources
- Profile, testing history, badges — #/athlete/profile
- Settings, language, theme — #/athlete/settings`;

function clamp(s, n) {
  return typeof s === "string" ? s.slice(0, n) : "";
}

/* Only text is accepted, only from the two roles, and only in the shape the
   API expects — the browser does not get to hand-build arbitrary payloads. */
function sanitiseHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({
      role: m.role,
      content: clamp(String(m.content || ""), MAX_MESSAGE_CHARS),
    }))
    .filter((m) => m.content.trim().length > 0);
}

function sse(res, payload) {
  res.write("data: " + JSON.stringify(payload) + "\n\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  /* No key configured — tell the client plainly so it can fall back to the
     offline answerer instead of showing the athlete a failure. */
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: "assistant_unavailable" });
    return;
  }

  const body = req.body || {};
  const question = clamp(String(body.question || "").trim(), MAX_MESSAGE_CHARS);
  const reference = clamp(String(body.reference || ""), MAX_CONTEXT_CHARS);
  const sport = clamp(String(body.sport || ""), 80);
  const history = sanitiseHistory(body.history);

  if (!question) {
    res.status(400).json({ error: "empty_question" });
    return;
  }

  /* The retrieved reference travels with the turn it belongs to, after the
     cached system prefix, so the stable part of the prompt stays cacheable. */
  const turn =
    (reference ? "REFERENCE (from this platform's guides and substance data):\n" + reference + "\n\n" : "") +
    (sport ? "The athlete's sport is " + sport + ".\n\n" : "") +
    "ATHLETE ASKS: " + question;

  const messages = history.concat([{ role: "user", content: turn }]);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const request = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    /* Low effort is the right lever for grounded Q&A — it keeps the reply fast
       without disabling thinking, which on Opus 5 can leak tool text and
       <thinking> tags into the visible answer. */
    output_config: { effort: "low" },
    system: [
      { type: "text", text: SYSTEM_PROMPT + "\n\n" + NAV_MAP, cache_control: { type: "ephemeral" } },
    ],
    messages,
  };

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  /* Tracked across both attempts: once a delta has reached the browser the
     athlete is already reading, so a retry would splice two different answers
     together. After that point a failure has to stay failed. */
  let emitted = false;

  async function run(params) {
    const stream = client.beta.messages.stream(params);
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta" &&
        event.delta.text
      ) {
        emitted = true;
        sse(res, { type: "delta", text: event.delta.text });
      }
    }
    return stream.finalMessage();
  }

  let message;
  try {
    /* Opus 5's safety classifiers can decline a request outright. Server-side
       fallbacks re-serve it on another model in the same call rather than
       handing the athlete a dead end. */
    message = await run({
      ...request,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
  } catch (betaErr) {
    /* If this account can't use the fallback beta, the assistant must not go
       down with it — retry once without it, but only if nothing has streamed. */
    if (emitted) {
      sse(res, { type: "error", message: "The answer was cut off. Please ask again." });
      res.end();
      return;
    }
    try {
      message = await run(request);
    } catch (err) {
      sse(res, { type: "error", message: "The assistant could not be reached. Please try again." });
      res.end();
      return;
    }
  }

  /* Check why it stopped before trusting the content — a refusal arrives as a
     successful response whose content is empty or partial. */
  if (message.stop_reason === "refusal") {
    sse(res, {
      type: "error",
      message:
        "I can't answer that one. If it's an anti-doping question, SLADA can answer it directly — see Contact SLADA.",
    });
    res.end();
    return;
  }

  if (!emitted) {
    sse(res, { type: "error", message: "The assistant returned an empty answer. Please ask again." });
    res.end();
    return;
  }

  sse(res, { type: "done", truncated: message.stop_reason === "max_tokens" });
  res.end();
}

export const config = { maxDuration: 60 };
