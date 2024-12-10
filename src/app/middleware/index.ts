import { ParseTokenMiddleware } from './middlewares/parse-token.middleware';
import { InternalNotificationReceiverController } from '@/app/modules/notification/modules/internal/internal-notification-receiver.controller';
import { ParseLocalizationMiddleware } from '@/app/middleware/middlewares/parse-localization.middleware';
import { CheckWriteAccessKeyMiddleware } from '@/app/middleware/middlewares/check-write-access-key-middleware.service';
import { InternalNotificationCrudController } from '@/app/modules/notification/modules/internal/internal-notification-crud.controller';
import { DiscordNotificationController } from '@/app/modules/notification/modules/discord/discord-notification.controller';
import { TelegramNotificationController } from '@/app/modules/notification/modules/telegram/telegram-notification.controller';
import { MailNotificationController } from '@/app/modules/notification/modules/mail/mail-notification.controller';
import { WhatsappNotificationController } from '@/app/modules/notification/modules/whatsapp/controllers/whatsapp-notification.controller';

export default [
  {
    guard: ParseTokenMiddleware,
    routes: InternalNotificationReceiverController,
  },
  {
    guard: ParseLocalizationMiddleware,
    routes: '*',
  },
  {
    guard: CheckWriteAccessKeyMiddleware,
    routes: InternalNotificationCrudController,
  },
  {
    guard: CheckWriteAccessKeyMiddleware,
    routes: DiscordNotificationController,
  },
  {
    guard: CheckWriteAccessKeyMiddleware,
    routes: TelegramNotificationController,
  },
  {
    guard: CheckWriteAccessKeyMiddleware,
    routes: MailNotificationController,
  },
  {
    guard: CheckWriteAccessKeyMiddleware,
    routes: WhatsappNotificationController,
  },
];
