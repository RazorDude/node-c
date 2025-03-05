# Node-C
An end-to-end NodeJS framework for building DDD apps on top of NestJS.

The goal of this module is to speed up development as much as possible. It provides a clean, reliable and customizable back-end setup out of the box, at the cost of some opinionation.

By using Node-C, you get to focus on what your project does, instead of worrying about how it does it.


## Overview
Node-C divides your application code in 3 distinct layers:
- Persistance - where the code related to any kind of persistance lives. That includes modules for both permanent storage and cache.
- Domain - the modules here contain your business logic, split by domain. They work with the Persistance modules and with each other.
- Api - these modules expose different sets of endpoints for external communication. They work with the Domain modules, rather than the Persistance modules directly.


## Getting Started
**Note**: this example assumes you have redis installed and running on localhost:6379

Install the minimal Node-C example repo:
```bash
npx @node-c/apps-minimal install
```

You should now have a server running at http://localhost:3000. Try calling the /test endpoint:
```bash
# This should return { "message": "Hello world" } with status 200.
curl  http://localhost:3000
```