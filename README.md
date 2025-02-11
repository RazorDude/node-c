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

<!-- TODO: all of this should be a one-line npx -->
Clone the minimal Node-C example repo:
```bash
git clone -n --depth=1 --filter=tree:0 https://github.com/RazorDude/node-c && \
  cd node-c && \
  git sparse-checkout set --no-cone /apps/example-minimal && \
  rm -rf .git && \
  cd ../ && \
  cp -r ./node-c/* . && \
  rm -rf ./node-c
```

Install the dependencies and Node-C packages needed to enable a Redis cache and a REST API:
```bash
# dependencies and devDependencies
npm i
# node-c packages - peerDependencies
npm i --no-save @node-c/core @node-c/persistance-redis @node-c/api-http @node-c/api-rest
```

Make the file called `envFiles/.local.env` and put the following contents inside:
```bash
PERSISTANCE_CACHE_HOST="localhost"
PERSISTANCE_CACHE_HOST="6379"
PERSISTANCE_CACHE_MODULE_TYPE="NOSQL"
PERSISTANCE_CACHE_PASSWORD="redis"
```

Run the app:
```bash
npm run start:local
```

You should now have a server running at http://localhost:3000. Try calling the /test endpoint:
```bash
# This should return { "message": "Hello world" } with status 200.
curl  http://localhost:3000
```