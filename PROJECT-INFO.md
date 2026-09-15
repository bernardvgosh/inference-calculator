# Project information

- Name: Inference Economics — Enterprise Planning
- Version: 2.0.0
- Creator: Godwin B.
- Runtime: modern web browser, plain JavaScript and CSS
- External runtime dependencies: none
- Data: local browser storage plus explicit file exports
- Entry point: `index.html`
- Setup, architecture, and limitations: [README.md](README.md)
- Model reference: [docs/feature-guide.md](docs/feature-guide.md)

The version 2 rewrite replaces the former CDN React/Babel application with a dependency-free interface and independently testable calculation engine. Pricing is consistently expressed per million tokens, revenue is constrained to served demand, and all modeled ownership costs are included.
