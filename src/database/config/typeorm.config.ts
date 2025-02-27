import { registerAs } from '@nestjs/config';
import AppConfig from '@/config/app-config';
import { DataSource, DataSourceOptions } from 'typeorm';

console.log('AppConfig.db', AppConfig.db);

const config = {
  type: AppConfig.db.driver,
  host: AppConfig.db.host,
  port: AppConfig.db.port,
  username: AppConfig.db.user,
  password: AppConfig.db.password,
  database: AppConfig.db.name,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/**/database/migrations/*.js'],
  autoLoadEntities: true,
  logging: false,
  maxQueryExecutionTime: 1000,
  // logger: 'file',
  extra: {
    poolSize: 20,
    connectionTimeoutMillis: 2000,
    query_timeout: 1000,
    statement_timeout: 1000,
  },
};

export default registerAs('typeorm', () => config);

export const connectionSource = new DataSource(config as DataSourceOptions);
