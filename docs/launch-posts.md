# Saravapos 0.1.0 — launch post drafts

> Drafts for the 0.1.0 announcement, one per channel. Generated for review — **edit to taste before posting.**

## ⚠️ Before you post (do these first)

1. **Publish to npm.** Every draft implies `npm install -g @saravapos/cli` works. `npm publish` the four packages first, or change install lines to "clone + build from source." A Show HN / Reddit post with a 404 install gets flagged fast.
2. **Confirm the repo is public** at `github.com/kunthive-Labs/Saravapos` (the links go live to readers).
3. **Run one real translation** (`saravapos translate --from profiles/chess-expert.yaml --to profiles/f1-fan.yaml --text "I sacrificed a pawn for a positional advantage"`) and confirm the chess→F1 output actually reads the way the posts describe. The example is the _intended_ behavior — it has not been eval-verified (no key this session). A screenshot of real output is a much stronger proof point.
4. **Check r/LocalLLaMA self-promotion rules / flair** before posting there.
5. Do **not** add eval numbers in comments — there are no measured quality results yet. (The repo's sample numbers like `mean=3.94` are illustrative fixtures, not results.)

**Strongest hook (lead with it everywhere):** the chess→F1 before/after — _"sacrifice a pawn for a positional advantage"_ → _"give up early track position to set up a stronger run."_ It makes the thesis (facts survive, mental model doesn't) felt in one sentence.

**Recommended posting order:** 1) Hacker News (Show HN, babysit comments 2–3h) → 2) r/LocalLLaMA (same/next day, lead the offline angle) → 3) dev.to (evergreen long-form anchor) → 4) X thread (amplifier, link back to the HN thread).

---

## 1. Hacker News — Show HN

**Title:** `Show HN: Saravapos – Translate ideas between mental models with an LLM`

Every explanation rides on shared metaphors. A chess coach says "sacrifice a pawn for a positional advantage" and another chess player nods — but a Formula 1 fan hears noise. The facts are sound; the mental model behind them is missing. Saravapos tries to close that gap: you describe a person's worldview — expertise, preferred analogies, cognitive style, cultural references — as a small YAML profile, and given a 'from' profile and a 'to' profile, an LLM rewrites content so the metaphors land while the facts stay intact. That chess line comes out as an F1-native one about giving up early track position to set up a stronger run.

It's protocol-first: a JSON Schema defines what a profile is, so anyone can implement against it. Profiles are plain YAML files you own — no accounts, no servers, no telemetry. You bring your own key (Anthropic, OpenAI, or Ollama for fully local). It ships as a CLI ('saravapos translate/validate/init') and an SDK ('@saravapos/sdk'), split into @saravapos/spec, /sdk, /adapters, and /cli. Node 20+.

The part I'd most want eyes on is the prompt quality. Rather than hand-tuning, I built an eval harness with golden cases and an LLM judge, plus an 'eval compare' A/B scorecard with per-criterion deltas, so prompt strategies get chosen by score instead of vibes. The 0.1.0 headline is dynamic analogy injection: it extracts the input's concepts, matches them against the target profile's analogy bank, and injects only the relevant metaphors instead of dumping the whole bank into the prompt. To be upfront — this is the eval methodology, not measured results. I don't have benchmark numbers to show yet, and it's a brand-new solo project at its first stable tag.

Repo: https://github.com/kunthive-Labs/Saravapos (MIT). Feedback I want most: the profile schema shape, and whether the worldview-translation framing breaks on cases I haven't hit. Happy to answer anything.

---

## 2. r/LocalLLaMA

**Title:** `Saravapos: rewrite explanations between mental models, runs fully offline on Ollama (open protocol, MIT)`

Show r/LocalLLaMA. This is a brand-new solo project at its first stable tag (0.1.0), and the local/offline path was the first thing I made sure actually worked, so this felt like the right place to post it.

**The local angle first, since that's what I'd want to know**

Saravapos has three adapters: Anthropic, OpenAI, and Ollama. The Ollama one defaults to `http://localhost:11434` and `llama3.1`, and you can point it anywhere with `OLLAMA_HOST`. With Ollama selected, nothing leaves your machine — no accounts, no servers, no telemetry, no API key. It runs fully offline. The profiles it reads are plain YAML files sitting on your disk that you own and edit. BYOK is the model for the cloud providers; Ollama needs no key at all.

```bash
# no key, no network
saravapos translate \
  --provider ollama \
  --from profiles/chess-expert.yaml \
  --to   profiles/f1-fan.yaml \
  --text "I sacrificed a pawn for a positional advantage"
```

Swap to `--provider anthropic` or `openai` if you'd rather, and `--model` to pick a specific local model. Provider also reads from `SARAVAPOS_PROVIDER` if you don't want to pass the flag every time.

**What it actually does**

Every explanation rides on shared metaphors. A chess coach says "sacrifice a pawn for positional advantage" and another chess player nods — but an F1 fan hears noise. The facts are fine; the mental model behind them is missing.

You describe a worldview — expertise, preferred analogies, cognitive style, cultural references — as a small YAML profile. Give it a `from` profile and a `to` profile, and the LLM rewrites the content so the metaphors land while the facts stay intact. The chess line above should come back as something an F1 fan gets natively: giving up early track position to set up a stronger run later.

The 0.1.0 headline feature is dynamic analogy injection: it pulls the concepts out of your input, matches them against the target profile's analogy bank, and injects only the metaphors that are relevant — instead of dumping the whole persona into the prompt every time. That's the `dynamicAnalogy` strategy; there are a few others (`baseline`, `structured`, `fewShot`, `plainLanguage`, `planned`, `analogyFirst`) you can switch between.

**On prompt quality (methodology, not a benchmark)**

There's an eval harness — golden cases plus an LLM judge with a rubric, lexical must-include/must-avoid checks, and an `eval compare` A/B scorecard with per-criterion deltas so you can pick a prompt strategy by score instead of vibes. I want to be straight about this: it's the _method_ for tuning prompts, not a results claim. I have no measured quality numbers to show you yet, and I'm not going to make any up. The harness can run against Ollama too, so you can score prompts entirely on local models.

**Shape of it**

- Protocol-first: a JSON Schema defines what a profile is, so anyone can implement against it independently.
- Packages: `@saravapos/spec` (schema + types), `@saravapos/sdk` (`loadProfile`, `translate`), `@saravapos/adapters`, `@saravapos/cli`.
- CLI (`saravapos translate/validate/init`) and an SDK if you want to call it from Node.
- MIT, Node 20+.

Repo: https://github.com/kunthive-Labs/Saravapos

It's early and it's small. The local-model path is the part I most want eyes on — if you run it through Ollama and the rewrites come out flat, or the analogy injection misfires on your hardware/model, I'd genuinely like to hear it. Profile schema feedback welcome too.

---

## 3. dev.to

**Title:** `Same facts, wrong metaphors: a protocol for translating ideas between worldviews`

> **Early release.** Saravapos just hit its first stable tag, `0.1.0`. It's a brand-new solo project — no users to brag about, no benchmark numbers. I'm posting to get the design torn apart. Feedback very welcome.

## The problem

Every explanation rides on shared metaphors. A chess coach says _"I sacrificed a pawn for a positional advantage"_ and another chess player nods instantly. Say the exact same sentence to a Formula 1 fan and they hear noise.

The _facts_ are fine. What's missing is the **mental model** the facts are hanging on. We hit this constantly: explaining a memory leak to a non-engineer, compressing a conference talk for a beginner, getting two specialists from different fields to actually understand each other. The information survives the trip; the intuition doesn't.

So the question I got stuck on: what if the _worldview_ were a portable, machine-readable thing — and translating between two worldviews were a normal operation, like translating between two human languages?

## The idea

**Saravapos** is an open protocol for worldview-aware communication. You describe a person's worldview as a small YAML profile: their expertise, the analogies that land for them, their cognitive style, cultural references they recognize (and ones to avoid). Given a `from` profile and a `to` profile, an LLM rewrites the content so the metaphors land while the facts stay intact.

A profile is just a file you own (illustrative, trimmed):

```yaml
# profiles/f1-fan.yaml
schema_version: '0.1'
identity:
  display_name: F1 Fan
expertise:
  - { domain: formula-one, level: expert, years: 10 }
  - { domain: chess, level: novice }
analogy_bank:
  - concept: strategic sacrifice
    metaphor: pitting early to jump rivals on fresh rubber
    domain: formula-one
cognitive_style:
  mode: visual
  abstraction_tolerance: low
cultural_context:
  references_that_land: [Hamilton, Verstappen, DRS, undercut]
  references_to_avoid: [algebraic notation, endgame tablebase]
```

Design principles, in order of how much I care about them:

- **Protocol-first.** A JSON Schema defines what a profile _is_. The reference implementation is one way to consume it; anyone can write another.
- **Local-first.** Profiles are plain YAML files on your disk. No accounts, no servers, no telemetry.
- **Bring-your-own-key.** Anthropic, OpenAI, or Ollama (fully local — your text never leaves the machine).

## Try it

```bash
npm install -g @saravapos/cli   # Node 20+

# author a profile interactively
saravapos init --output me.yaml

# validate it against the schema
saravapos validate me.yaml

# translate something
export ANTHROPIC_API_KEY=sk-...
saravapos translate \
  --from profiles/chess-expert.yaml \
  --to   profiles/f1-fan.yaml \
  --text "I sacrificed a pawn for a positional advantage"
```

The intended shape of the output: the chess line comes back as an F1-native one — _giving up early track position to set up a stronger run later in the race_. Same idea (trade something small now for a structural edge), metaphors the target actually recognizes. (This is the intended behavior — not yet an eval-verified result.)

There's an SDK too, if you'd rather embed it:

```ts
import { loadProfile, translate } from '@saravapos/sdk';
import { resolveAdapter } from '@saravapos/adapters';

const out = await translate({
  text: 'I sacrificed a pawn for a positional advantage',
  from: await loadProfile('profiles/chess-expert.yaml'),
  to: await loadProfile('profiles/f1-fan.yaml'),
  adapter: resolveAdapter('anthropic'),
});
```

## How it works

The headline `0.1.0` feature is **dynamic analogy injection**. Naively, you'd stuff the entire target analogy bank into the prompt and hope. Instead the `dynamicAnalogy` strategy:

1. extracts the concepts from the _input text_,
2. matches them against both profiles' `analogy_bank` entries,
3. injects **only** the relevant metaphors into the system prompt.

The matching step is deterministic — no extra LLM call — so it narrows the model's attention to the metaphors that actually apply to _this_ sentence instead of drowning it in the whole bank.

The prompt itself isn't a hardcoded blob, either. There are swappable strategies (`baseline`, `structured`, `fewShot`, `plainLanguage`, `planned`, `analogyFirst`, `dynamicAnalogy`), and **which one wins is a data question, not a vibe.** There's an eval harness — golden cases plus an LLM judge with a per-case rubric — and an A/B scorecard:

```bash
saravapos eval compare --variants baseline,dynamicAnalogy
```

…which prints a winner _with per-criterion deltas_ so you can see which rubric dimension (fidelity, lands-for-target, no-source-jargon) each variant actually moved.

## What's done and what isn't

**Done:**

- Frozen `0.1` profile schema (JSON Schema + TypeScript types), `@saravapos/spec`.
- SDK, three adapters (Anthropic / OpenAI / Ollama), and the `saravapos` CLI.
- Dynamic analogy injection and the `eval compare` scorecard.

**Explicitly _not_ done — be skeptical:**

- **No measured quality results yet.** The eval harness is _methodology_, not a leaderboard. I have not published accuracy numbers because I don't have honest ones to publish. Treat the translation quality as unproven.
- The default strategy is still `baseline` — it stays the default until a keyed `eval compare` names a winner on a real corpus.
- It's a first stable _tag_, not a battle-tested tool. No production adoption, no scale claims.

## Help me break it

The two highest-leverage places to push back are the **schema shape** (is a worldview really these five fields?) and the **prompt design**. If the chess→F1 example feels off to you, that's exactly the signal I want.

Repo: **github.com/kunthive-Labs/Saravapos** (MIT). Tell me where it's wrong.

---

## 4. X / Mastodon thread

**1/**
A chess coach says "I sacrificed a pawn for a positional advantage." Another chess player nods. An F1 fan hears noise.

The facts are fine. The mental model behind them is missing.

Saravapos is an open protocol to close that gap. (first stable tag, MIT)

**2/**
You write a person's worldview as a small YAML profile: their expertise, preferred analogies, cognitive style, references.

Give it a `from` profile and a `to` profile, and an LLM rewrites the content so the metaphors land — while the facts stay intact.

**3/**
That chess line, translated for an F1 fan:

"I gave up early track position to set up a much stronger run later."

Same idea. New mental model. The metaphor does the work. (illustrative)

**4/**
Design choices:

- Protocol-first: a JSON Schema says what a profile is. Anyone can implement it.
- Local-first: profiles are plain YAML you own. No accounts, no servers, no telemetry.
- Bring your own key: Anthropic, OpenAI, or Ollama (fully local).

**5/**
The 0.1.0 headline: dynamic analogy injection.

It extracts the concepts in your input, matches them against the target's analogy bank, and injects only the metaphors that actually fit — instead of bolting on generic ones.

**6/**
Prompts are chosen by data, not vibes: an eval harness with golden cases + an LLM judge, and an `eval compare` A/B scorecard with per-criterion deltas.

Brand-new, MIT, Node 20+. CLI + SDK. Early — feedback very welcome.

github.com/kunthive-Labs/Saravapos
