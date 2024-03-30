export default interface MailConfigInterface {
  mailer: string;
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: string;
  fromAddress: string;
  fromName: string;
  retryAttempts: number;
  cronTimeout: string;
}
