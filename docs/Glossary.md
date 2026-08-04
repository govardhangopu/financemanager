# Glossary

This document defines the terminology used throughout the Finance Manager project.

---

## Reality

The user's actual financial data.

Reality represents the single source of truth and consists of real transactions, categories, budgets, and other persisted financial records.

Reality is immutable during financial simulations.

---

## Budget

A real-world financial plan used to organize and monitor financial activity toward a defined objective.

Budgets represent actual financial intentions and are never hypothetical.

---

## Category

A financial classification assigned to transactions.

Examples include:

- Food
- Salary
- Transportation
- Utilities

Categories are universal and can be referenced by both real and simulated transactions.

---

## Transaction

A financial event representing income or expenditure.

Transactions may belong to Reality or to a Scenario.

---

## Scenario

An isolated collection of hypothetical financial changes used to evaluate potential future financial outcomes.

A Scenario never modifies Reality.

---

## Scenario Operation

An instruction describing how Reality should be transformed during a simulation.

Current operations include:

- ADD
- MODIFY
- REMOVE

---

## Simulation

The process of applying Scenario Operations to Reality to generate a temporary financial state.

---

## Simulation Engine

The subsystem responsible for applying Scenario Operations to Reality and generating a temporary simulated dataset.

---

## Temporary Dataset

An in-memory transaction dataset generated during simulation.

It exists only for analytical purposes and is never permanently stored.

---

## Analytics Engine

The subsystem responsible for calculating financial metrics from a transaction dataset.

The Analytics Engine is independent of whether the dataset originates from Reality or a Simulation.

---

## Dashboard Analytics

Financial insights presented on the dashboard, including summaries, charts, and key metrics.

---

## Budget Analytics

Calculations specific to a budget, such as:

- Total Spent
- Remaining Balance
- Progress
- Status

---

## Architecture Decision Record (ADR)

A document that records an important architectural decision, the reasoning behind it, and its consequences.

---

## Financial Scenario Engine

The subsystem that enables users to simulate hypothetical financial situations by applying Scenario Operations to Reality before passing the resulting dataset to the Analytics Engine.