# Architecture Decision Log

This document records significant architectural decisions made during the development of Finance Manager.

---

## ADR-001

### Title

Budgets represent real-world financial plans.

### Status

Accepted

### Context

Initially, budgets were considered for both real financial planning and hypothetical planning.

### Decision

Budgets represent only real-world financial plans.

Financial simulations are performed using Scenarios rather than creating duplicate or "partial" budgets.

### Consequences

- Budgets remain simple.
- Budget analytics remain reusable.
- Financial modeling becomes an independent subsystem.

---

## ADR-002

### Title

Reality is immutable.

### Status

Accepted

### Context

Financial simulations should never modify real financial records.

### Decision

All simulations are performed on temporary datasets generated at runtime.

Real transactions remain the single source of truth.

### Consequences

- No accidental corruption of financial history.
- Unlimited scenario experimentation.
- Simulations remain reversible.

---

## ADR-003

### Title

Scenarios store changes rather than copies.

### Status

Accepted

### Context

Two possible implementations were considered:

1. Copy all real transactions into every scenario.
2. Store only hypothetical changes.

### Decision

Scenarios store only hypothetical changes.

The Simulation Engine combines Reality with those changes at runtime.

### Consequences

- Minimal storage requirements.
- Easier maintenance.
- Real transaction corrections automatically propagate into simulations.

---

## ADR-004

### Title

Categories are universal.

### Status

Accepted

### Context

Originally categories contained an `is_partial` attribute.

### Decision

Categories represent financial classifications only.

Whether a transaction is hypothetical is determined by the Scenario rather than the Category.

### Consequences

- Simpler database.
- Less duplicated data.
- Categories reusable across Reality and Scenarios.

---

## ADR-005

### Title

Simulation precedes analytics.

### Status

Accepted

### Context

Analytics should not require separate implementations for Reality and Scenarios.

### Decision

The Simulation Engine generates a temporary transaction dataset.

The Analytics Engine operates on that dataset exactly as it does on Reality.

### Consequences

- Analytics remain reusable.
- Future simulations require no analytics changes.