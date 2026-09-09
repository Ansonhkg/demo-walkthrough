# Verification: 0.3.0 migration

This release moves the controller, transport, recording loop, target resolver, page bridge, capture/replay pipeline and schema validation into the standalone framework. ClubSaaS provides product definitions, fixture/domain callbacks, storage/auth and allowed-origin/redaction policies.

Standalone checks cover DAG validation, grouping/repeated captures, frozen recording metadata, click cues, failed/aborted runs, schema/origin checks, DOM sanitization, scaled coordinates, transport source/origin/nonce rejection, and copy integrity/local edit protection. The independent four-surface document demo exercised recording and replay through the actual shared bridge and UI in a browser. Its data and steps are synthetic.

ClubSaaS typecheck and production build passed; 11 existing player tests passed with 132 assertions. A fresh synthetic ClubSaaS tour completed through the migrated engine in the browser: 21/21 steps and 23 captures, including post creation, reaction, reply, bookmark and admin navigation. Existing replay seeking and spotlight rendering were also inspected. This is scripted browser evidence, not an autonomous participant experiment. Signup, recovery, billing and reward journeys were not all rerun in the browser during this migration. Existing recordings remain legacy evidence, not new runs.

The generic controller is reusable. App authorization, fixtures, domain checks and redaction policy intentionally remain adapters. DOM capture is not full video/canvas/shadow-DOM recording or a universal PII detector. Browser password changes can still require a manual step. ReleaseFast catalog publication remains a separate integration task.
