import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { buildDatabaseConfig } from '../config/database.config';
import { loadProjectEnvironment } from '../config/env-paths';
import { createDataSourceOptions } from './typeorm-options';

loadProjectEnvironment();

const dataSource = new DataSource(
  createDataSourceOptions(buildDatabaseConfig()),
);

export default dataSource;
