# Node-C
An end-to-end NodeJS framework for building DDD apps on top of NestJS.

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
6. QueryBuilder - search inside JSON fields on MySQL DBs.
7. Domain.IAM.TokenManager - content hash computation.
8. Multithreaded domain module method execution.
9. CLI
10. Clickhouse persitance module
11. Okta SSO
12. Google SSO
13. Cron/Queue module
14. Message broker or similar module
15. Reactivity
16. Feature flag module
17. Support webserver protocols other than HTTP.
18. Misc todos in the codes, not listed here.
