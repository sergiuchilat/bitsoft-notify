import AppConfigInterface from '../interfaces/app-config.interface';
import { DbDriver } from '../interfaces/components/db-config.interface';
import jsonPlainConfig from '@/config/json-config.json';
import { generateDatabaseUrl } from '@/config/services/db.service';

export default class JsonPlainConfigStrategy {
  private readonly config: AppConfigInterface = null;

  constructor() {
    this.config = {
      app: {
        port: jsonPlainConfig.app.port.toString(),
        requestTimeout: jsonPlainConfig.app.requestTimeout,
        security: {
          write_access_key: jsonPlainConfig.app.security.write_access_key,
        },
        log: {
          custom: jsonPlainConfig.app.log.custom,
          levels: {
            error: {
              filename: jsonPlainConfig.app.log.levels.error.filename,
              maxFiles: jsonPlainConfig.app.log.levels.error.maxFiles,
            },
            all: {
              filename: jsonPlainConfig.app.log.levels.all.filename,
              maxFiles: jsonPlainConfig.app.log.levels.all.maxFiles,
            },
          },
        },
      },
      db: {
        host: jsonPlainConfig.db.host,
        port: jsonPlainConfig.db.port.toString(),
        user: jsonPlainConfig.db.user,
        password: jsonPlainConfig.db.password,
        name: jsonPlainConfig.db.name,
        driver: DbDriver[jsonPlainConfig.db.driver],
        url: null,
      },
      jwt: {
        secret: jsonPlainConfig.jwt.secret_key,
        expiresIn: jsonPlainConfig.jwt.token_expires_in,
        publicKeyPath: jsonPlainConfig.jwt.public_key_path,
        publicKey: jsonPlainConfig.jwt.public_key,
      },
      docs: {
        generate: jsonPlainConfig.docs.generate,
        path: jsonPlainConfig.docs.path,
        version: jsonPlainConfig.docs.version,
        title: jsonPlainConfig.docs.title,
        description: jsonPlainConfig.docs.description,
        authName: jsonPlainConfig.docs.authName,
      },
      telegram: {
        botName: jsonPlainConfig.telegram.botName,
        botToken: jsonPlainConfig.telegram.botToken,
      },
      mail: {
        mailer: jsonPlainConfig.mail.mailer,
        host: jsonPlainConfig.mail.host,
        port: jsonPlainConfig.mail.port,
        username: jsonPlainConfig.mail.username,
        password: jsonPlainConfig.mail.password,
        encryption: jsonPlainConfig.mail.encryption,
        fromAddress: jsonPlainConfig.mail.fromAddress,
        fromName: jsonPlainConfig.mail.fromName,
        retryAttempts: Number(jsonPlainConfig.mail.retryAttempts),
        cronTimeout: jsonPlainConfig.mail.cronTimeout,
      },
      slack: {
        token: jsonPlainConfig.slack.token,
        apiUrl: jsonPlainConfig.slack.apiUrl,
      },
    };
    this.config.db.url = generateDatabaseUrl(this.config.db);
  }

  public getConfig() {
    return this.config;
  }
}
