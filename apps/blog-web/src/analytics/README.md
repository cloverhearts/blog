# Blog analytics integration

The sole adapter is `clarity.js`, copied as an external ES module only for
configured production builds. `CLARITY_PROJECT_ID` is validated by project-config.
The renderer wires localized footer consent controls to the module.

See [ANALYTICS.md](../../../../ANALYTICS.md) for activation, privacy exclusions,
consent migration, provider limitations and live verification gates.

Run `npm run test:analytics`. Unit tests execute the actual adapter with a fake
browser; integration fixtures verify generated eligible, disabled and preview
documents at root and subpath without contacting Microsoft.
