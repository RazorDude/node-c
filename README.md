# Node-C
An end-to-end NodeJS framework for building DDD apps built on top of NestJS.

## Roadmap
1. Logger service and its related TODOs.
2. Combined search in different persistance types.
3. Static module methods support in loadDynamicModules.
4. Redis persistance service updates and improvements:
  a. Indexing.
  b. Searching by non-primary keys.
  c. Support for search operators like Or.
  d. Field selection and pseudo-relations support.
  e. Get and scan from transaction data support.
  f. Delete count w/ transaction support.
  g. Transaction end status return support.
  h. Update method - support update of multiple items at the same time.
  i. Ordering.
5. Rdb persistance service service updates and improvements:
  a. Field selection support.
  b. Update method - support update of multiple items at the same time.
  c. Support for the numberItem functionality in the bulkCreate, create, update and delete methods.
6. QueryBuilder - search inside JSON fields.
7. Domain.IAM.TokenManager - content hash computation.
7. Multithreaded domain module method execution.