import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

import { NestModule } from '@nestjs/common';

import { NodeCApp } from '@node-c/core';

import mysql from 'mysql';
import { beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module';
import { Constants } from '../../src/common/definitions';

const PERSISTANCE_DB_CONFIGS_DATABASE_NAME = 'node_c_apps_test_configs_e2e_test_db';
const PERSISTANCE_DB_DATABASE_NAME = 'node_c_apps_test_main_e2e_test_db';
const REDIS_MASTER_HOST = 'redis';
const REDIS_MASTER_PASSWORD = 'redis';
const REDIS_MASTER_PORT = '6379';
const REDIS_SLAVE_HOST = 'redis-slave-1';
const REDIS_SLAVE_PASSWORD = 'qwerty';
const REDIS_SLAVE_PORT = '6380';
const MYSQL_HOST_MASTER = 'mysql-5-7';
const MYSQL_HOST_SLAVE = 'mysql-5-7-slave-1';
const MYSQL_PASSWORD = 'qwerty';
const MYSQL_PORT = '3306';
const MYSQL_USER = 'root';
const ROOT_PATH = path.resolve(__dirname, '../../');

describe('NodeC.Apps.Test', () => {
  process.env.NODE_ENV = 'test';
  let apps: NodeCApp[] = [];
  beforeAll(async () => {
    // populate the .test.env file
    await fs.writeFile(
      path.resolve(ROOT_PATH, 'envFiles/.test.env'),
      `PERSISTANCE_CACHE_AUTH_HOST="${REDIS_SLAVE_HOST}"\n` +
        'PERSISTANCE_CACHE_AUTH_MODULE_TYPE="NOSQL"\n' +
        `PERSISTANCE_CACHE_AUTH_PASSWORD="${REDIS_SLAVE_PASSWORD}"\n` +
        `PERSISTANCE_CACHE_AUTH_PORT=${REDIS_SLAVE_PORT}\n` +
        '\n' +
        `PERSISTANCE_CACHE_HOST="${REDIS_MASTER_HOST}"\n` +
        'PERSISTANCE_CACHE_MODULE_TYPE="NOSQL"\n' +
        `PERSISTANCE_CACHE_PASSWORD="${REDIS_MASTER_PASSWORD}"\n` +
        `PERSISTANCE_CACHE_PORT=${REDIS_MASTER_PORT}\n` +
        '\n' +
        `PERSISTANCE_DB_CONFIGS_DATABASE_NAME="${PERSISTANCE_DB_CONFIGS_DATABASE_NAME}"\n` +
        `PERSISTANCE_DB_CONFIGS_HOST="${MYSQL_HOST_SLAVE}"\n` +
        'PERSISTANCE_DB_CONFIGS_MODULE_TYPE="RDB"\n' +
        `PERSISTANCE_DB_CONFIGS_PASSWORD="${MYSQL_PASSWORD}"\n` +
        `PERSISTANCE_DB_CONFIGS_PORT="${MYSQL_PORT}"\n` +
        `PERSISTANCE_DB_CONFIGS_USER="${MYSQL_USER}"\n` +
        '\n' +
        `PERSISTANCE_DB_DATABASE_NAME="${PERSISTANCE_DB_DATABASE_NAME}"\n` +
        `PERSISTANCE_DB_HOST="${MYSQL_HOST_MASTER}"\n` +
        'PERSISTANCE_DB_MODULE_TYPE="RDB"\n' +
        `PERSISTANCE_DB_PASSWORD="${MYSQL_PASSWORD}"\n` +
        `PERSISTANCE_DB_PORT="${MYSQL_PORT}"\n` +
        `PERSISTANCE_DB_USER="${MYSQL_USER}"\n`
    );
    // generate ormconfig and datasource files
    // set up the main DB, empty it and seed the test data
    let connection = mysql.createConnection({
      // database: PERSISTANCE_DB_DATABASE_NAME,
      host: MYSQL_HOST_MASTER,
      password: MYSQL_PASSWORD,
      port: +MYSQL_PORT
    });
    await new Promise<void>((resolve, reject) => {
      connection.connect(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      connection.query(`drop database ${PERSISTANCE_DB_DATABASE_NAME};`, err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      connection.query(`create database ${PERSISTANCE_DB_DATABASE_NAME};`, err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      exec('npm run typeorm migration:run -- -d ./datasource-db.ts', err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      connection.end(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
    // set up the configs DB, empty it and seed the test data
    connection = mysql.createConnection({
      host: MYSQL_HOST_SLAVE,
      password: MYSQL_PASSWORD,
      port: +MYSQL_PORT
    });
    await new Promise<void>((resolve, reject) => {
      connection.connect(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      connection.query(`drop database ${PERSISTANCE_DB_CONFIGS_DATABASE_NAME};`, err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      connection.query(`create database ${PERSISTANCE_DB_CONFIGS_DATABASE_NAME};`, err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      exec('npm run typeorm migration:run -- -d ./datasource-dbConfigs.ts', err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      connection.end(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
    // start the app
    apps = await NodeCApp.start([AppModule] as unknown as NestModule[], {
      apiModulesOptions: [{ appModuleIndex: 0, apiModuleName: Constants.API_SSO_MODULE_NAME }],
      generateOrmConfig: true,
      loadConfigOptions: AppModule.configProviderModuleRegisterOptions
    });
  });
  it('should start all apps fully', async () => {
    expect(apps).toHaveLength(2);
    const response = await fetch('http://localhost:3000');
    expect(response.status).toEqual(404);
  });
});
