# Finance Manager documentation

This directory documents the application as implemented in the repository. Design history and planned work are labeled separately so they are not mistaken for current behavior. For where to place README files, use the repository guide only at the root and in independently configured services; ordinary feature folders do not need their own README.

## Start here

| Document | What it covers |
|---|---|
| [Architecture](Architecture.md) | Runtime components, request flow, authentication, demo mode, and current deployment topology |
| [Database design](DatabaseDesign.md) | Tables, relationships, constraints, date handling, and known persistence details |
| [API reference](APIReference.md) | HTTP routes, authentication requirements, request fields, and response shapes |
| [Forecast and goals](ForecastAndGoals.md) | Historical baseline, scheduled transactions, projections, goal allocation, and chart behavior |
| [Scenarios](FinancialScenarioEngine.md) | Implemented scenario changes and monthly projection calculations |
| [Transactions, categories, and budgets](TransactionsCategoriesBudgets.md) | CRUD behavior, category hierarchy, budget status, and spending calculations |
| [Authentication and demo](AuthenticationAndDemo.md) | Password and Google sign-in, password resets, and the isolated browser demo |
| [Deployment and operations](Deployment.md) | Local setup and environment variables |
| [Glossary](Glossary.md) | Terms used by the code and feature documentation |
| [Decision log](DecisionLog.md) | Important product and implementation decisions, including known differences |

## Diagrams

| Diagram | Status | Description |
|---|---|---|
| [FinanceManager.mmd](diagrams/FinanceManager.mmd) | Current | Application components and request/data flow |
| [CurrentERDiagram.mmd](diagrams/CurrentERDiagram.mmd) | Current | Database tables and foreign-key relationships in `backend/config/schema.sql` |
| [FutureERDiagram.mmd](diagrams/FutureERDiagram.mmd) | Historical proposal | An earlier scenario-owned transaction design; it is not the implemented schema |

## Documentation rules

- **Implemented** means the behavior is present in the checked-in application code and schema.
- **Historical proposal** means the document records an earlier design and is not a description of the running feature.
- **Planned** means work has been discussed but is not deployed or implemented yet.
- When a feature guide and a design note differ, use the feature guide and current source/schema as the description of implemented behavior.
- Keep examples free of credentials and real financial data. Use `.env.example` variable names, never live values.

## Repository guides

- [Root README](../README.md): project summary and quick local start.
- [Backend README](../backend/README.md): API service setup and configuration.
- [Frontend README](../frontend/README.md): React application setup and demo behavior.

## Maintenance

Update the relevant feature/API/schema documentation when behavior changes. Update the diagrams with their source files.

**Reviewed:** 2026-11-18
