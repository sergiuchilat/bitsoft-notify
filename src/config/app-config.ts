import AppConfigInterface from './interfaces/app-config.interface';
import EnvConfigStrategy from './strategies/env-config-strategy';
import AppConfigValidator from './validators/app-config.validator';
import DbConfigValidator from './validators/db-config.validator';
import DocsConfigValidator from './validators/docs-config.validator';
import JsonPlainConfigStrategy from './strategies/json-plain-config-strategy';

export enum AppConfigStrategies {
  env = 'env',
  json = 'json',
}

class AppConfigSingleton {
  private static instance = null;

  private readonly configStrategies = {
    env: new EnvConfigStrategy(),
    json: new JsonPlainConfigStrategy(),
  };

  private config: AppConfigInterface = {
    app: {
      port: null,
      requestTimeout: 0,
      security: {
        write_access_key: null,
      },
      log: {
        custom: false,
        levels: {
          error: {
            filename: null,
            maxFiles: null,
          },
          all: {
            filename: null,
            maxFiles: null,
          },
        },
      },
    },
    db: {
      host: null,
      port: null,
      user: null,
      password: null,
      name: null,
      driver: null,
      url: null,
    },
    jwt: {
      secret: null,
      expiresIn: null,
      publicKeyPath: null,
      publicKey: null,
    },
    docs: {
      generate: true,
      path: null,
      version: null,
      title: null,
      description: null,
      authName: null,
    },
    telegram: {
      botName: null,
      botToken: null,
    },
    mail: {
      mailer: null,
      host: null,
      port: null,
      username: null,
      password: null,
      encryption: null,
      fromAddress: null,
      fromName: null,
      retryAttempts: null,
      cronTimeout: null,
    },
    slack: {
      token: null,
      apiUrl: null,
    },
    api: {
      key: null,
      url: null,
    },
  };

  public static getInstance(): AppConfigSingleton {
    return this.instance || (this.instance = new this());
  }

  private validateConfig() {
    DbConfigValidator.validate(this.config.db);
    AppConfigValidator.validate(this.config.app);
    DocsConfigValidator.validate(this.config.docs);
  }

  public init(strategy: AppConfigStrategies) {
    this.config = this.configStrategies[strategy].getConfig();
    this.validateConfig();
  }

  public getConfig() {
    return this.config;
  }
}

AppConfigSingleton.getInstance().init(AppConfigStrategies.env);
// eslint-disable-next-line @typescript-eslint/naming-convention
const AppConfig = AppConfigSingleton.getInstance().getConfig();
export default AppConfig;
