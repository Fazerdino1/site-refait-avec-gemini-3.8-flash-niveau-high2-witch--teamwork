# DISPATCH — E2E Testing Track Orchestrator

## Mission
Design and implement the complete E2E testing infrastructure and test suite for the Raycast landing page recreation.
Follow the 4-tier opaque-box methodology from PROJECT.md and user requirements in ORIGINAL_REQUEST.md.
Publish TEST_INFRA.md and TEST_READY.md upon completion.

### Scope & Constraints
- Working Directory: /home/antigravity/Fazerdino1/site-refait-avec-gemini-3.8-flash-niveau-high2-witch--teamwork/.agents/teamwork/sub_orch_e2e_testing
- Test files owned: tests/ directory, TEST_INFRA.md, TEST_READY.md at project root.
- DO NOT modify index.html (owned by implementation track).
- Test Runner: Node.js (e.g. `node tests/run_all.js`), checking DOM parsing (via native Node html parser, jsdom, regex, or headless checks).
- Minimum Coverage: All 22 features from PROJECT.md Feature Inventory across Tiers 1-4.
- Track all agent tokens and costs ($0.75/1M input, $3.75/1M output).
