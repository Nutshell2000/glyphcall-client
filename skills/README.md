# Glyphcall skills pack

Three task skills in the agentcash-skills layout. Each routes the agent to our own origin through
the `agentcash` client, so a skill install becomes a call to our API.

| Skill | Job | Price |
|---|---|---|
| `url-safety-triage` | vet a link before opening or paying it | $0.01 |
| `eu-company-check` | KYB, VAT, sanctions, e-invoice | $0.01–0.02 |
| `transcribe-meeting` | speech to text, speaker labels, TTS | $0.01–0.08 |

Prices verified live on 20 Nov against `https://api.glyphcall.com` payment challenges.

Install by copying the `skills/` folder into an agentcash skills directory, or publish this folder
as a `glyphcall-skills` repo in the agentcash-skills layout (owner decision: GitHub publish).

## Why this exists

The exhaustive audits concluded that big tool jobs are won by **distribution**, not by more
listings: sellers above ~$10/day ship the thing the agent runs (installer, wallet, skill, console).
These three skills are that thing for the highest-frequency jobs our catalog already ranks for.
