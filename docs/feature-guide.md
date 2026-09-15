# Inference Economics v2 — Feature and model guide

## Workflow

1. Name your scenario under Workload. Set monthly combined token demand, output share, and input/output selling prices.
2. Under Hardware, enter fleet size, measured aggregate input-plus-output throughput per unit, capacity utilization ceiling, availability, and active/idle IT power. A unit must include a consistent host/hardware configuration.
3. Under Costs, include acquisition cost per unit, useful life, PUE, electricity, maintenance, and deployment-wide monthly overhead. Facility expense excludes electricity.
4. Under Alternatives, enter an equivalent cloud unit's hourly rental, API token rates, and the total facility power budget.
5. Review economics, deployment comparison, power capacity, and sensitivity. Save snapshots to compare assumptions, or export JSON/CSV.

Inputs update results when committed by leaving the field. Invalid values block calculation and exports. Text labels are limited to 80 characters. Import accepts validated v2 JSON files up to 1 MB; imported results are ignored.

## Equations

Let N be units, T throughput in tokens/second/unit, U utilization fraction, A availability fraction, S = 730 × 3600 seconds, D monthly demanded tokens, and V served tokens.

- Capacity = N × T × U × A. Multiply by S for monthly tokens.
- Served tokens V = min(D, N × T × U × A × S).
- Actual load = V / (N × T × S).
- Average facility kW = N × [idle W + (active W − idle W) × actual load] × PUE / 1000.
- Monthly energy = average facility kW × 730. Idle consumption is retained through unavailable periods.
- Capital = N × acquisition cost/unit.
- Monthly amortization = capital / (12 × useful life in years).
- Monthly maintenance = capital × annual maintenance fraction / 12.
- Monthly expense = amortization + energy cost + maintenance + operations + network + software + facility.
- Fully loaded cost per million = monthly expense / (V / 1,000,000).
- Blended selling price = input price × (1 − output share) + output price × output share.
- Revenue = (V / 1,000,000) × blended selling price.
- Gross profit = revenue − monthly expense. Margin = gross profit / revenue.
- Cash operating cost = monthly expense − amortization.
- Payback months = capital / (revenue − cash operating cost), only when the denominator is positive.
- Lifetime cash TCO = capital + cash operating cost × lifetime months.
- Whole units within power budget = floor(budget MW × 1,000,000 / (active W × PUE)).
- Required units = ceil(D / (T × U × A × S)).

Zero demand yields no unit cost, efficiency ratio, margin, or payback; fixed and idle costs remain. A nonpositive cash contribution shows no payback. Payback beyond useful life is flagged.

## Comparing deployments

Owned monthly expense includes amortization. Its cumulative cash chart starts with upfront capital and adds monthly cash operating costs. Cloud rental assumes the same installed fleet for 730 hours, plus operations, network, and software. API expense includes served token charges only. Both alternatives start the cash chart at zero.

The comparison assumes equivalent model quality and measured serving performance. It does not establish those properties. API integration costs and service quotas, cloud egress beyond the network allowance, taxes, financing, residual value, growth, discounting, redundancy, memory fit, and latency modeling are outside scope.

## Sensitivity and capacity

The matrix evaluates demand at 50%, 75%, 100%, 125%, and 150% of baseline against six utilization ceilings. It recalculates all dependent values. Demand rows are capped at the supported input maximum. Highlighted cells indicate unserved demand. When demand is below capacity, raising the utilization ceiling alone does not change costs.

Capacity planning sizes power conservatively against all units at active power. The dashboard separately estimates average energy from actual served load. A negative power headroom signals a deployment that exceeds the entered facility budget; the economics view continues to show the requested installed fleet rather than silently downsizing it.

## Data handling

The current valid scenario and up to 20 snapshots are stored in this browser. Saving adds a separate timestamped snapshot. Loading recomputes results. Deleting requires confirmation. Reset affects the current inputs, not snapshots. JSON exports preserve inputs and calculated outputs; CSV contains all numeric model results and inputs. CSV fields are quoted and formula-leading text is neutralized.

Printing exports the currently visible analysis view through the browser's print dialog. Use JSON or CSV to include the complete input assumptions. Browser local storage is not a centralized audit log or durable backup.
