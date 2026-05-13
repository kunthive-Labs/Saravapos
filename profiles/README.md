# Sample Profiles

Hand-authored worldview profiles used for development, testing, and dogfooding the translator.

| File                     | Persona           | Strong domain                 | Weak domain           |
| ------------------------ | ----------------- | ----------------------------- | --------------------- |
| `chess-expert.yaml`      | Chess Expert      | chess (expert, 15 yr)         | formula-one (novice)  |
| `f1-fan.yaml`            | F1 Fan            | formula-one (expert, 10 yr)   | chess (novice)        |
| `software-engineer.yaml` | Software Engineer | software-engineering (expert) | —                     |
| `curious-novice.yaml`    | Curious Novice    | everyday-life (expert)        | all technical domains |

Each profile validates against the `@wv/spec` JSON Schema. Run `pnpm validate:profiles` to verify.

---

## chess-expert

**Use case:** source profile in chess → F1 translation demos.

Strong in chess (expert, 15 years). Novice in F1. Prefers precise terminology and
move sequences. High abstraction tolerance — comfortable with symbolic reasoning.
Analogy bank maps chess concepts to F1 equivalents (pawn sacrifice → burning
tyres, positional advantage → undercut window).

---

## f1-fan

**Use case:** target profile in chess → F1 translation demos; source in F1 → software demos.

Strong in F1 (expert, 10 years). Novice in chess. Visual thinker who wants
race-scenario examples and lap-time comparisons. Low abstraction tolerance —
avoid algebraic notation and abstract game theory. Analogy bank maps chess
concepts into race-weekend equivalents.

---

## software-engineer

**Use case:** target profile for technical-audience translations; chess → SE demos.

Expert in software engineering (8 years) and advanced in systems design (5 years).
Intermediate chess player (3 years). High abstraction tolerance. Prefers code
examples, mental models, and trade-off analysis. Avoid unrelated sports metaphors.
Analogy bank maps chess structure to software dependency concepts.

---

## curious-novice

**Use case:** target profile for widest-audience translations; stress-test for jargon elimination.

Expert only in everyday life. No technical domain expertise. Low abstraction
tolerance — requires simple language, step-by-step walkthroughs, and everyday
analogies (cooking, traffic, weather). Analogy bank maps technical concepts to
household equivalents. All chess notation, racing jargon, programming terms, and
advanced mathematics should be avoided.
