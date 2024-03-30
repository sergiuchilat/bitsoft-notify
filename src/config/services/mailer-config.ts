import { MailerModule } from '@nestjs-modules/mailer';
import AppConfig from '@/config/app-config';

export default MailerModule.forRoot({
  transport: `${AppConfig.mail.mailer}://${AppConfig.mail.username}:${process.env.MAIL_PASSWORD}@${AppConfig.mail.host}:${AppConfig.mail.port}`,
  defaults: {
    from: `"${AppConfig.mail.fromName}" <${AppConfig.mail.fromAddress}>`,
  },
});
