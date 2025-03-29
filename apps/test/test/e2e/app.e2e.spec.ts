import { ChildProcessWithoutNullStreams, exec, spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

import mysql from 'mysql';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const DOMAIN_IAM_JWT_ACCESS_SECRET = 'VerySecret';
const DOMAIN_IAM_JWT_REFRESH_SECRET = 'VerySecret@';
const DOMAIN_IAM_USER_PASSWORD_SECRET = 'IAMVerySecret%';
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
  let appsProcess: ChildProcessWithoutNullStreams;
  // -
  // Before all hook - set everything up.
  // -
  beforeAll(async () => {
    // populate the .test.env file
    await fs.writeFile(
      path.resolve(ROOT_PATH, 'envFiles/.test.env'),
      `DOMAIN_IAM_JWT_ACCESS_SECRET="${DOMAIN_IAM_JWT_ACCESS_SECRET}"\n` +
        `DOMAIN_IAM_JWT_REFRESH_SECRET="${DOMAIN_IAM_JWT_REFRESH_SECRET}"\n` +
        'DOMAIN_IAM_MODULE_TYPE="IAM"\n' +
        `DOMAIN_IAM_USER_PASSWORD_SECRET="${DOMAIN_IAM_USER_PASSWORD_SECRET}"\n` +
        '\n' +
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
    console.info('[TestLogs] Setting up the main DB...');
    let connection = mysql.createConnection({
      // database: PERSISTANCE_DB_DATABASE_NAME,
      host: MYSQL_HOST_MASTER,
      password: MYSQL_PASSWORD,
      port: +MYSQL_PORT,
      user: MYSQL_USER
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
      connection.query(`drop database if exists ${PERSISTANCE_DB_DATABASE_NAME};`, err => {
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
      exec('npm run typeorm migration:run -- -d ./datasource-db.ts', (err, stdout, stderr) => {
        if (err) {
          reject(err);
          return;
        }
        if (stdout) {
          console.info(stdout);
        }
        if (stderr) {
          console.error(stderr);
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
    console.info('[TestLogs] Main DB set up. Setting up the configs DB...');
    // set up the configs DB, empty it and seed the test data
    connection = mysql.createConnection({
      host: MYSQL_HOST_SLAVE,
      password: MYSQL_PASSWORD,
      port: +MYSQL_PORT,
      user: MYSQL_USER
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
      connection.query(`drop database if exists ${PERSISTANCE_DB_CONFIGS_DATABASE_NAME};`, err => {
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
      exec('npm run typeorm migration:run -- -d ./datasource-dbConfigs.ts', (err, stdout, stderr) => {
        if (err) {
          reject(err);
          return;
        }
        if (stdout) {
          console.info(stdout);
        }
        if (stderr) {
          console.error(stderr);
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
    console.info('[TestLogs] Configs DB set up. Starting apps...');
    let promiseFulfilled = false;
    await new Promise<void>((resolve, reject) => {
      appsProcess = spawn('npm', ['run', 'start'], { env: { NODE_ENV: 'test', PATH: process.env.PATH } });
      appsProcess.on('exit', () => {
        if (promiseFulfilled) {
          return;
        }
        promiseFulfilled = true;
        reject();
      });
      appsProcess.on('error', data => {
        if (promiseFulfilled) {
          return;
        }
        console.error(data);
        promiseFulfilled = true;
        reject();
      });
      appsProcess.stdout.on('data', data => {
        if (promiseFulfilled) {
          return;
        }
        const dataText = data?.toString() || '';
        console.info(dataText);
        if (dataText?.match(/App\sstarted/)) {
          promiseFulfilled = true;
          resolve();
        }
      });
    });
    console.info('[TestLogs] Apps started.');
    console.info('[TestLogs] beforeAll hook completed.');
  }, 90000);
  // TODO: make this error 404 in the future
  it('should return an error with status 401 when calling non-existent routes', async () => {
    const response = await fetch('http://localhost:3010');
    expect(response.status).toEqual(401);
  });
  // TODO: make this error 404 in the future
  it('should return an error with status 401 when calling non-implemnted routes', async () => {
    const response = await fetch('http://localhost:3010/tokens');
    expect(response.status).toEqual(401);
  });
  // TODO: make sure query params are ignored in originalUrl
  // TODO: issue an access token - bad request on invalid body vs dto
  // TODO: issue an access token - invalid email & password
  // it('should return an error with status 404 when calling non-implemnted routes', async () => {
  //   const response = await fetch('http://localhost:3010/tokens');
  //   expect(response.status).toEqual(401);
  // });
  // -
  // After all hook - kill the apps process.
  // -
  afterAll(async () => {
    const pid = appsProcess?.pid;
    console.log('====> afterAll hook', pid);
    if (!pid) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      exec(`kill ${pid}`, (err, stdout, stderr) => {
        if (err) {
          reject(err);
          return;
        }
        if (stdout) {
          console.info(stdout);
        }
        if (stderr) {
          console.error(stderr);
        }
        resolve();
      });
    });
  });
});
