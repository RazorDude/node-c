import { ExecException, exec, spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

import clickHouse from '@clickhouse/client';
import dotenv from 'dotenv';
import mysql from 'mysql2';

process.env.NODE_ENV = 'test';

export async function teardown(): Promise<void> {
  let commandData = await new Promise<string>((resolve, reject) => {
    exec('netstat -tulpn | grep 2071', (err, data, stderr) => {
      let error: ExecException | string | null = err;
      if (!err && stderr && !stderr.includes('Not all processes could be identified')) {
        error = stderr;
      }
      if (error) {
        console.error('[TestLog]: Teardown error at netstat:', error);
        reject();
        return;
      }
      resolve(data || '');
    });
  });
  const apiServerMatches = commandData.match(/:2081.+\s(\d+)\/_node/);
  commandData = await new Promise<string>((resolve, reject) => {
    exec('netstat -tulpn | grep 2081', (err, data, stderr) => {
      let error: ExecException | string | null = err;
      if (!err && stderr && !stderr.includes('Not all processes could be identified')) {
        error = stderr;
      }
      if (error) {
        console.error('[TestLog]: Teardown error at netstat:', error);
        reject();
        return;
      }
      resolve(data || '');
    });
  });
  const ssoServerMatches = commandData.match(/:2081.+\s(\d+)\/_node/);
  if (apiServerMatches) {
    console.info('[TestLog]: Killing the server process at port 2071...');
    await new Promise<void>((resolve, reject) => {
      exec(`kill ${apiServerMatches[1]}`, (err, _data, stderr) => {
        const error = err || stderr;
        if (error) {
          console.error('[TestLog]: Teardown error at kill:', error);
          reject();
          return;
        }
        resolve();
      });
    });
    console.info('[TestLog]: Server process at port 2071 killed successfully.');
  }
  if (ssoServerMatches) {
    console.info('[TestLog]: Killing the server process at port 2081...');
    await new Promise<void>((resolve, reject) => {
      exec(`kill ${ssoServerMatches[1]}`, (err, _data, stderr) => {
        const error = err || stderr;
        if (error) {
          console.error('[TestLog]: Teardown error at kill:', error);
          reject();
          return;
        }
        resolve();
      });
    });
    console.info('[TestLog]: Server process at port 2081 killed successfully.');
  }
  console.info('[TestLog]: Teardown completed.');
}

export async function setup(): Promise<void> {
  // set the test server up and run the tests
  // parse the env vars
  const envVars = dotenv.parse(
    (await fs.readFile(path.resolve(__dirname, '../apps/test/envFiles/.test.env'))).toString()
  );
  // TODO: generate ormconfig and datasource files
  // set up the main DB, empty it and seed the test data
  console.info('[TestLogs]: Setting up the main DB...');
  let connection = mysql.createConnection({
    host: envVars.DATA_DB_HOST,
    password: envVars.DATA_DB_PASSWORD,
    port: +envVars.DATA_DB_PORT,
    user: envVars.DATA_DB_USER
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
    connection.query(`drop database if exists ${envVars.DATA_DB_DATABASE_NAME};`, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
  await new Promise<void>((resolve, reject) => {
    connection.query(`create database ${envVars.DATA_DB_DATABASE_NAME};`, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
  await new Promise<void>((resolve, reject) => {
    exec('cd apps/test && npm run typeorm migration:run -- -d ./datasource-db.ts', (err, stdout, stderr) => {
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
  console.info('[TestLogs]: Main DB set up. Setting up the configs DB...');
  // set up the configs DB, empty it and seed the test data
  connection = mysql.createConnection({
    host: envVars.DATA_DB_CONFIGS_HOST,
    password: envVars.DATA_DB_PASSWORD,
    port: +envVars.DATA_DB_PORT,
    user: envVars.DATA_DB_USER
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
    connection.query(`drop database if exists ${envVars.DATA_DB_CONFIGS_DATABASE_NAME};`, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
  await new Promise<void>((resolve, reject) => {
    connection.query(`create database ${envVars.DATA_DB_CONFIGS_DATABASE_NAME};`, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
  await new Promise<void>((resolve, reject) => {
    exec('cd apps/test && npm run typeorm migration:run -- -d ./datasource-dbConfigs.ts', (err, stdout, stderr) => {
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
  console.info('[TestLogs]: Configs DB set up. Setting up the audit DB...');
  const clickHouseDBName = envVars.DATA_AUDIT_DATABASE_NAME;
  const clickHouseClient = clickHouse.createClient({
    // database: clickHouseDBName,
    password: envVars.DATA_AUDIT_PASSWORD,
    url: `http://${envVars.DATA_AUDIT_HOST}:${envVars.DATA_AUDIT_PORT}`,
    username: envVars.DATA_AUDIT_USER
  });
  await clickHouseClient.query({ query: `drop database if exists ${clickHouseDBName}` });
  await clickHouseClient.query({ query: `create database ${clickHouseDBName}` });
  await clickHouseClient.query({
    query:
      `create table ${clickHouseDBName}.userLoginLogs (` +
      'datetime datetime not null, ' +
      'userId bigint unsigned not null' +
      ') engine Log'
  });
  console.info('[TestLogs]: Audit DB set up. Starting apps...');
  let appPromiseFulfilled = false;
  await new Promise<void>((resolve, reject) => {
    const appsProcess = spawn('npm', ['run', 'start:apps-test:test'], {
      env: { NODE_ENV: 'test', PATH: process.env.PATH }
    });
    appsProcess.on('exit', () => {
      if (appPromiseFulfilled) {
        return;
      }
      appPromiseFulfilled = true;
      reject();
    });
    appsProcess.on('error', data => {
      if (appPromiseFulfilled) {
        return;
      }
      console.error(data);
      appPromiseFulfilled = true;
      reject();
    });
    appsProcess.stdout.on('data', data => {
      // if (appPromiseFulfilled) {
      //   return;
      // }
      const dataText = data?.toString() || '';
      console.info(dataText);
      if (dataText?.match(/App\sstarted/)) {
        appPromiseFulfilled = true;
        resolve();
      }
    });
    appsProcess.stderr.on('data', data => {
      // if (appPromiseFulfilled) {
      //   return;
      // }
      const dataText = data?.toString() || '';
      console.error(dataText);
      // appPromiseFulfilled = true;
      // reject();
    });
  });
  console.info('[TestLogs]: Global setup completed.');
}
