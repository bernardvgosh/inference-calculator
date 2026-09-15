# Inference Economics — Enterprise Planning

A dependency-free local planning workspace for inference infrastructure. Created by Godwin B.

Open `index.html` in a modern browser. No installation, build step, server, or internet connection is required. For consistent browser storage behavior across sessions, serve the folder from a static web server.

## Features

- Economics dashboard with fully loaded cost per million tokens, monthly expense, gross profit, cash payback, cost composition, and cumulative spend.
- Owned infrastructure, dedicated cloud, and managed API comparisons at the same served demand.
- Capacity planning with utilization, availability, idle/active power, PUE, and whole-unit facility power limits.
- Demand/utilization sensitivity matrix with capacity-limit indicators.
- Twenty local scenario snapshots with load and delete actions.
- Validated version 2 JSON import/export, escaped CSV export, and printing of the current analysis view.
- Responsive interface, labeled controls, validation messages, and accessible chart descriptions.

## Model and inputs

All example rates and throughput values are illustrative, not current prices or hardware benchmarks. Replace them with measured performance and your contracted costs. Currency is USD; a model month is 730 hours. Demand is billions of combined input and output tokens. All token prices use USD per million tokens.

Revenue is limited to served demand. Ownership costs include hardware amortization, electricity, maintenance, operations, network, software, and facility expenses. Capital is counted once in cash TCO. See the app's **Model methodology** page and [feature guide](docs/feature-guide.md) for formulas and boundaries.

## Files

| File | Responsibility |
|---|---|
| `index.html` | Offline entry point |
| `js/economics.js` | Pure calculation engine and validation |
| `js/app.js` | Interface, local persistence, imports, and exports |
| `css/styles.css` | Dashboard, responsive and print styles |
| `tests/economics.test.cjs` | Calculation regression tests |
| `tests/interface.test.cjs` | Event-handler smoke tests with a document adapter |

## Tests

With Node.js installed, run `npm test`. No package installation is required. The interface tests exercise event handlers without a browser and do not verify visual layout. Browser checks should cover desktop/mobile layout, keyboard input, file downloads, imports, and print preview.

## Data and deployment scope

This is a local enterprise planning tool, not a multiuser hosted service. It does not include SSO, user roles, a database, server backups, or centralized audit logging. Snapshots reside in browser local storage under `inference-enterprise-v2`. Export JSON for portable backups. Storage can be blocked or cleared by the browser.

Version 1 storage under `inferenceCalculations` is left untouched. Version 1 JSON imports are rejected because their price units and result semantics differ; recreate those assumptions in version 2. The app does not trust imported calculated results and always recalculates from validated inputs.

For deployment, serve these files over HTTPS using your preferred static host. Organization authentication and access policies must be provided by the hosting layer if required.
