# Overview
NodeC leverages NestJS's module system to expose 3 types of modules and a range of services for each type. These types are:
- Data - where the code related to any kind of data processing lives. That includes modules for both permanent storage (such as databases) and cache (such as key-value stores).
- Domain - the modules here contain your business logic, split by domain. They work with the Data modules and with each other.
- Api - these modules expose different sets of endpoints for external communication. They trigger your business logic by working with the Domain modules, and do not have access to the Data modules.

See the [First steps](../first-steps.md) page for practical examples, or continue with the pages down below for a deep-dive on Node-C's 3-layer Domain-Driven architecture:
- [Layers and modules](./layers.md) - the data, domain and API layers, and the modules that make them up
- [Controllers](./controllers.md) - REST routes for an entity, with filtering, validation and errors
- [Domain services](./domain-services.md) - where business logic lives
- [Request lifecycle](./request-lifecycle.md) - what happens to a request, from the middleware to the database and back
