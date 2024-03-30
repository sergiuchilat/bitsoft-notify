export interface LogConfigInterface {
  filename: string;
  maxFiles: string;
}

export default interface AppConfigInterface {
  port: string;
  requestTimeout: number;
  security: {
    write_access_key: string;
  };
  log: {
    custom: boolean;
    levels: {
      error: LogConfigInterface;
      all: LogConfigInterface;
    };
  };
}
