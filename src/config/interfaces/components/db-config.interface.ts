export enum DbDriver {
  mysql = 'mysql',
  postgres = 'postgres',
  sqlite = 'sqlite',
  mssql = 'mssql',
  mongodb = 'mongodb',
}

export default interface DbConfigInterface {
  driver: string;
  host: string;
  port: string;
  user: string;
  password: string;
  name: string;
  url: string;
}
