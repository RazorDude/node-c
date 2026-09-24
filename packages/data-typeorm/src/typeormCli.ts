#!/usr/bin/env node

// This file is a vendored-in replacement for TypeORM's CLI, because it doesn't have an ESM .js build.

import 'reflect-metadata';

import { CacheClearCommand } from 'typeorm/commands/CacheClearCommand.js';
import { EntityCreateCommand } from 'typeorm/commands/EntityCreateCommand.js';
import { InitCommand } from 'typeorm/commands/InitCommand.js';
import { MigrationCreateCommand } from 'typeorm/commands/MigrationCreateCommand.js';
import { MigrationGenerateCommand } from 'typeorm/commands/MigrationGenerateCommand.js';
import { MigrationRevertCommand } from 'typeorm/commands/MigrationRevertCommand.js';
import { MigrationRunCommand } from 'typeorm/commands/MigrationRunCommand.js';
import { MigrationShowCommand } from 'typeorm/commands/MigrationShowCommand.js';
import { QueryCommand } from 'typeorm/commands/QueryCommand.js';
import { SchemaDropCommand } from 'typeorm/commands/SchemaDropCommand.js';
import { SchemaLogCommand } from 'typeorm/commands/SchemaLogCommand.js';
import { SchemaSyncCommand } from 'typeorm/commands/SchemaSyncCommand.js';
import { SubscriberCreateCommand } from 'typeorm/commands/SubscriberCreateCommand.js';
import { VersionCommand } from 'typeorm/commands/VersionCommand.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .command(new CacheClearCommand())
  .command(new EntityCreateCommand())
  .command(new InitCommand())
  .command(new MigrationCreateCommand())
  .command(new MigrationGenerateCommand())
  .command(new MigrationRevertCommand())
  .command(new MigrationRunCommand())
  .command(new MigrationShowCommand())
  .command(new QueryCommand())
  .command(new SchemaDropCommand())
  .command(new SchemaLogCommand())
  .command(new SchemaSyncCommand())
  .command(new SubscriberCreateCommand())
  .command(new VersionCommand())
  .recommendCommands()
  .demandCommand(1)
  .strict()
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help')
  .parse();
