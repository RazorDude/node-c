import { ExecException, exec, spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

import dotenv from 'dotenv';
import mysql from 'mysql2';

process.env.NODE_ENV = 'test';

export async function teardown(): Promise<void> {
  // const envVars = dotenv.parse((await fs.readFile(path.resolve(__dirname, '../envFiles/.test.env'))).toString());
  // mysql_process=$(top -b -n 1 | grep mysql)
  // mysql_process=$(echo "${mysql_process%%mysql*}")
  // netstat -tulpn | grep 2071
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
  const matches = commandData.match(/:2071.+\s(\d+)\/_node/);
  console.log(matches);
  if (matches) {
    console.info('[TestLog]: Killing the server process...');
    await new Promise<void>((resolve, reject) => {
      exec(`kill ${matches[1]}`, (err, _data, stderr) => {
        const error = err || stderr;
        if (error) {
          console.error('[TestLog]: Teardown error at kill:', error);
          reject();
          return;
        }
        resolve();
      });
    });
    console.info('[TestLog]: Server process killed successfully.');
  }
  console.info('[TestLog]: Teardown completed.');
}

export async function setup(): Promise<void> {
  // set the test server up and run the tests
  // parse the env vars
  const envVars = dotenv.parse((await fs.readFile(path.resolve(__dirname, '../envFiles/.test.env'))).toString());
  // TODO: generate ormconfig and datasource files
  // set up the main DB, empty it and seed the test data
  console.info('[TestLogs]: Setting up the main DB...');
  let connection = mysql.createConnection({
    host: envVars.PERSISTANCE_DB_HOST,
    password: envVars.PERSISTANCE_DB_PASSWORD,
    port: +envVars.PERSISTANCE_DB_PORT,
    user: envVars.PERSISTANCE_DB_USER
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
    connection.query(`drop database if exists ${envVars.PERSISTANCE_DB_DATABASE_NAME};`, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
  await new Promise<void>((resolve, reject) => {
    connection.query(`create database ${envVars.PERSISTANCE_DB_DATABASE_NAME};`, err => {
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
  console.info('[TestLogs]: Main DB set up. Setting up the configs DB...');
  // set up the configs DB, empty it and seed the test data
  connection = mysql.createConnection({
    host: envVars.PERSISTANCE_DB_CONFIGS_HOST,
    password: envVars.PERSISTANCE_DB_PASSWORD,
    port: +envVars.PERSISTANCE_DB_PORT,
    user: envVars.PERSISTANCE_DB_USER
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
    connection.query(`drop database if exists ${envVars.PERSISTANCE_DB_CONFIGS_DATABASE_NAME};`, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
  await new Promise<void>((resolve, reject) => {
    connection.query(`create database ${envVars.PERSISTANCE_DB_CONFIGS_DATABASE_NAME};`, err => {
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
  console.info('[TestLogs]: Configs DB set up. Starting apps...');
  let appPromiseFulfilled = false;
  await new Promise<void>((resolve, reject) => {
    const appsProcess = spawn('npm', ['run', 'start'], { env: { NODE_ENV: 'test', PATH: process.env.PATH } });
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
      if (appPromiseFulfilled) {
        return;
      }
      const dataText = data?.toString() || '';
      console.info(dataText);
      if (dataText?.match(/App\sstarted/)) {
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
  });
  console.info('[TestLogs]: Global setup completed.');
}
