import { ExecException, exec, spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

import clickHouse from '@clickhouse/client';

import { AppEnvironment } from '@node-c/core';
import dotenv from 'dotenv';
import mysql from 'mysql2';

process.env.NODE_ENV = 'endToEndTests';

export async function teardown(): Promise<void> {
  let coursePlatformDelegatedMatches: RegExpMatchArray | null = null;
  try {
    const commandData = await new Promise<string>((resolve, reject) => {
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
    coursePlatformDelegatedMatches = commandData.match(/:2071.+\s(\d+)\/_node/);
  } catch (e) {
    console.info(e);
  }
  if (coursePlatformDelegatedMatches) {
    console.info('[TestLog]: Killing the server process at port 2071...');
    await new Promise<void>((resolve, reject) => {
      exec(`kill -INT ${coursePlatformDelegatedMatches[1]}`, (err, _data, stderr) => {
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
  await teardownProcess(2061);
  await teardownProcess(2051);
  let ssoServerMatches: RegExpMatchArray | null = null;
  try {
    const commandData = await new Promise<string>((resolve, reject) => {
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
    ssoServerMatches = commandData.match(/:2081.+\s(\d+)\/_node/);
  } catch (e) {
    console.info(e);
  }
  if (ssoServerMatches) {
    console.info('[TestLog]: Killing the server process at port 2081...');
    await new Promise<void>((resolve, reject) => {
      exec(`kill -INT ${ssoServerMatches[1]}`, (err, _data, stderr) => {
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

async function teardownProcess(port: number): Promise<void> {
  let serverProcessMatches: RegExpMatchArray | null = null;
  try {
    const commandData = await new Promise<string>((resolve, reject) => {
      exec(`netstat -tulpn | grep ${port}`, (err, data, stderr) => {
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
    serverProcessMatches = commandData.match(new RegExp(`/:${port}.+\s(\d+)\/_node/`));
  } catch (e) {
    console.info(e);
  }
  if (serverProcessMatches) {
    console.info(`[TestLog]: Killing the server process at port ${port}...`);
    await new Promise<void>((resolve, reject) => {
      exec(`kill -INT ${serverProcessMatches[1]}`, (err, _data, stderr) => {
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
}

export async function setup(): Promise<void> {
  // set the test server up and run the tests
  // parse the env vars
  const envVars = dotenv.parse(
    (await fs.readFile(path.resolve(__dirname, '../apps/test/envFiles/.endToEndTests.env'))).toString()
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
    exec(
      'cd apps/test && DATASOURCE_ENV=endToEndTests MODULE_NAMES=db npm run generate:datasource-files:local',
      (err, stdout, stderr) => {
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
      }
    );
  });
  await new Promise<void>((resolve, reject) => {
    exec('cd apps/test && DATASOURCE_ENV=endToEndTests npm run typeorm:migration:run:db', (err, stdout, stderr) => {
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
    exec(
      'cd apps/test && DATASOURCE_ENV=endToEndTests MODULE_NAMES=dbConfigs npm run generate:datasource-files:local',
      (err, stdout, stderr) => {
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
      }
    );
  });
  await new Promise<void>((resolve, reject) => {
    exec(
      'cd apps/test && DATASOURCE_ENV=endToEndTests npm run typeorm:migration:run:dbConfigs',
      (err, stdout, stderr) => {
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
      }
    );
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
  const logsFilePath = path.resolve(__dirname, `../logs/app_logs_${process.env.NODE_ENV}.txt`);
  let appPromiseFulfilled = false;
  try {
    await fs.rm(logsFilePath);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    // console.info(e);
  }
  await new Promise<void>((resolve, reject) => {
    const appsProcess = spawn('npm', ['run', 'start:apps-test:nyc:direct'], {
      env: { NODE_ENV: AppEnvironment.Test, PATH: process.env.PATH }
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
    appsProcess.on('message', data => {
      const dataText = data?.toString() || '';
      if (dataText.match(/Nest\sapplication\ssuccessfully\sstarted/)) {
        appPromiseFulfilled = true;
        resolve();
      }
    });
    appsProcess.stdout.on('data', data => {
      const dataText = data?.toString() || '';
      if (dataText.match(/Nest\sapplication\ssuccessfully\sstarted/)) {
        appPromiseFulfilled = true;
        resolve();
      }
    });
    appsProcess.stderr.on('data', data => {
      if (appPromiseFulfilled) {
        return;
      }
      const dataText = data?.toString() || '';
      console.error(dataText);
      appPromiseFulfilled = true;
      reject();
    });
    const appLogsInterval = setInterval(() => {
      (async () => {
        try {
          const fileData = (await fs.readFile(logsFilePath)).toString();
          if (fileData.match(/Nest\sapplication\ssuccessfully\sstarted/)) {
            console.info('App started.');
            resolve();
            clearInterval(appLogsInterval);
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
          // console.info(e);
        }
      })().then(
        () => true,
        err => {
          console.error(err);
          clearInterval(appLogsInterval);
          reject();
        }
      );
    }, 500);
  });
  console.info('[TestLogs]: Global setup completed.');
}
