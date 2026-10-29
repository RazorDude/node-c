# Node-C
A batteries-included NodeJS framework for developing Domain-Driven Design applications, built on top of NestJS.

This family of packages has 2 main goals:
- To speed up development as much as possible while maintaining high quality, and
- To provide a robust and standardized way of bulding back-end applications with Node and NestJS.

Node-C provides a clean, reliable and customizable back-end setup out of the box, at the cost of some opinionation.

You get to focus on building your project, instead of building the tools you need to build a project.


## Overview
Node-C levereges NestJS's module system to expose 3 types of modules and a range of services for each type. These types are:
- Data - where the code related to any kind of data processing lives. That includes modules for both permanent storage (such as databases) and cache (such as key-value stores).
- Domain - the modules here contain your business logic, split by domain. They work with the Data modules and with each other.
- Api - these modules expose different sets of endpoints for external communication. They trigger your business logic by working with the Domain modules, and do not have access to the Data modules.


## Getting Started
The best way to get started is to take a look at the example Test App in our repository.

**Note**: this example assumes you have:
- redis or valkey installed and running on localhost:6379 and localhost:6380
- mysql installed and running on localhost:3306
- clickhouse installed and running on localhost:8123

Clone the repo and run the Node-C example test app:
```bash
git clone https://github.com/RazorDude/node-c
cd node-c/apps/test
npm i
npm run start
```

You should now have a server running at http://localhost:3000. Try calling the /test endpoint:
```bash
# This should return { "message": "Hello world" } with status 200.
curl  http://localhost:3000/test
```
