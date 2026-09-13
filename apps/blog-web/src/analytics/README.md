# Blog analytics integration

The sole adapter is `clarity.js`, copied as an external ES module only for
configured production builds. `CLARITY_PROJECT_ID` is validated by project-config.
The renderer wires a collapsed localized footer information/stop control to the
module. It starts automatically with both cookie-storage purposes denied;
previously saved refusal still prevents loading. No allow button is rendered.

See [ANALYTICS.md](../../../../ANALYTICS.md) for activation, privacy exclusions,
consent migration, provider limitations and live verification gates.

Run `npm run test:analytics`. Unit tests execute the actual adapter with a fake
browser; integration fixtures verify generated eligible, disabled and preview
documents at root and subpath without contacting Microsoft.
