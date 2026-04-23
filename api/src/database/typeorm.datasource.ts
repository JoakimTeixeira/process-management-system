import 'dotenv/config';
import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { buildDatabaseConfig } from '../config/database.config';
import { createDataSourceOptions } from './typeorm-options';

const dataSource = new DataSource(
  createDataSourceOptions(buildDatabaseConfig()),
);

export default dataSource;
