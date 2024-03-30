import DbConfigInterface from './components/db-config.interface';
import JwtConfigInterface from './components/jwt-config.interface';
import DocsConfigInterface from './components/docs-config.interface';
import AppConfigInterface from './components/app-config.interface';
import TelegramConfigInterface from './components/telegram-config.interface';
import MailConfigInterface from '@/config/interfaces/components/mail-config.interface';

export default interface ConfigInterface {
  app: AppConfigInterface;
  db: DbConfigInterface;
  jwt: JwtConfigInterface;
  docs: DocsConfigInterface;
  telegram: TelegramConfigInterface;
  mail: MailConfigInterface;
}
