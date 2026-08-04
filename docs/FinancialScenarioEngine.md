---

# Financial Scenario Engine Specification (v1)

---

# Financial Scenario Engine Specification

**Version:** 1.0 (Draft)

**Project:** Finance Manager

**Status:** Design Phase

---

# 1. Purpose

The Financial Scenario Engine enables users to evaluate hypothetical financial decisions without modifying their real financial records.

Instead of creating alternative copies of their finances, users create **Scenarios** consisting of hypothetical financial changes. The engine temporarily applies these changes to the user's existing financial data and generates an analytical view of the resulting financial state.

The objective is to support informed decision-making through financial simulation.

---

# 2. Problem Statement

Traditional finance applications answer:

> "What has already happened?"

The Financial Scenario Engine answers:

> "What would happen if..."

Examples include:

* What if I buy a house?
* What if I receive a salary increase?
* What if I start freelancing?
* What if I move to another city?
* What if I cancel my subscriptions?

The simulation must never alter the user's real financial records.

---

# 3. Core Principles

## Reality is immutable

Real financial data is the single source of truth.

Simulations never modify reality.

---

## Scenarios store changes

A Scenario stores only hypothetical changes.

It does not duplicate existing financial data.

---

## Analytics remain reusable

The analytics engine should not distinguish between real and simulated data.

It receives a transaction dataset and performs calculations normally.

---

## Separation of Concerns

Reality stores facts.

Scenarios store hypothetical changes.

The Simulation Engine combines them.

Analytics interpret the result.

---

# 4. Domain Definitions

## Reality

The user's actual financial records.

Includes:

* Transactions
* Categories
* Budgets

---

## Scenario

An isolated collection of hypothetical financial changes.

Examples:

* Buy a House
* Start Freelancing
* Move to Bangalore
* Career Change

---

## Scenario Change

A modification applied only during simulation.

Scenario Changes never modify reality.

---

## Simulation

The temporary financial state produced by applying Scenario Changes to Reality.

---

## Analytics

The interpretation of either:

* Reality

or

* Simulated Reality

using the same calculation engine.

---

# 5. System Architecture

```
Reality
    │
    ▼
Simulation Engine
    │
    ▼
Simulated Transaction Set
    │
    ▼
Analytics Engine
    │
    ▼
Budget Analytics
Dashboard Analytics
Reports
Charts
```

---

# 6. Scenario Lifecycle

```
Create Scenario

↓

Add Changes

↓

Run Simulation

↓

Review Results

↓

Modify Scenario

↓

Run Again

↓

Delete or Archive
```

Reality is never changed during this process.

---

# 7. Scenario Operations

Version 1 supports three operations.

---

## ADD

Adds a hypothetical transaction.

Example:

```
Buy Laptop

₹60,000
```

The transaction exists only inside the Scenario.

---

## MODIFY

Applies an adjustment to an existing real transaction.

Example:

Reality:

```
Salary

₹50,000
```

Scenario:

```
Increase Salary

+₹10,000
```

Simulation:

```
Salary

₹60,000
```

Reality remains ₹50,000.

---

## REMOVE

Excludes a real transaction during simulation.

Example:

Reality:

```
Netflix Subscription
```

Scenario:

```
Remove Netflix
```

Simulation ignores that transaction.

---

# 8. Simulation Algorithm

```
Load Reality

↓

Load Scenario

↓

Apply Scenario Changes

↓

Generate Temporary Dataset

↓

Run Analytics

↓

Return Results
```

The generated dataset exists only in memory.

It is never stored as permanent financial data.

---

# 9. Analytics Pipeline

```
Reality
        │
        ▼
Simulation Engine
        │
        ▼
Temporary Transactions
        │
        ▼
Analytics Engine
        │
        ▼
Results
```

The Analytics Engine remains unaware of whether data is simulated.

---

# 10. Database Evolution (Proposed)

## New Table

### scenarios

```
scenarioid

userid

name

description

created_at

updated_at
```

---

## Transactions

Instead of using:

```
is_partial
```

transactions become associated with scenarios.

Possible future structure:

```
transactionid

categoryid

amount

date

scenarioid (nullable)
```

Where:

```
scenarioid = NULL
```

represents Reality.

Non-null values indicate Scenario ownership.

---

## Categories

Categories become universal.

They are shared between:

* Reality
* Every Scenario

The `is_partial` concept is removed.

---

# 11. Why Categories are Universal

Categories describe financial classification.

Examples:

* Food
* Rent
* Salary
* Electronics
* Vehicle

Whether a transaction is hypothetical is determined by the Scenario, not by its Category.

---

# 12. Budget Integration

Budgets remain unchanged.

A Budget is always a real financial plan.

The Simulation Engine produces a temporary transaction dataset that is evaluated against existing Budgets.

No duplicate budgets are created.

---

# 13. Dashboard Integration

The Dashboard may optionally display:

Current Reality

↓

Scenario Simulation

↓

Difference

Example:

```
Net Worth

Current

₹8,40,000

Scenario

₹7,65,000

Difference

-₹75,000
```

---

# 14. Future Extensions

The architecture supports future Scenario Operations such as:

* Delay Transaction
* Duplicate Transaction
* Split Transaction
* Repeat Transaction
* Move Transaction
* Inflation Adjustment
* Interest Simulation
* Tax Simulation

without changing the Analytics Engine.

---

# 15. Design Benefits

The proposed architecture:

* Keeps Reality immutable
* Eliminates duplicate financial records
* Prevents data inconsistency
* Reuses existing Analytics
* Reuses existing Budgets
* Scales naturally as new simulation features are introduced

---

# 16. Implementation Roadmap

### Phase 1

Design Scenario Domain

✔ Completed

---

### Phase 2

Design Simulation Engine

✔ Completed

---

### Phase 3

Design Database Schema

Pending

---

### Phase 4

Implement Backend

* Repository Layer
* Service Layer
* Controller Layer

---

### Phase 5

Implement Frontend

* Scenario List
* Scenario Detail
* Scenario Editor
* Simulation Results

---

### Phase 6

Integrate Analytics

* Budget Analysis
* Dashboard Analysis
* Reports
* Charts

---

# Appendix A — Design Philosophy

The Finance Manager stores **financial reality**.

The Financial Scenario Engine creates **temporary alternative realities** by applying hypothetical changes to that reality.

Instead of asking:

> "What happened?"

the application enables users to ask:

> **"What would happen if..."**

This separation allows the application to evolve from a financial tracking system into a financial decision-support platform without duplicating business logic or compromising data integrity.

---
