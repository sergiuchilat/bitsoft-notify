import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';

export default I18nModule.forRoot({
  fallbackLanguage: 'en',
  loaderOptions: {
    path: path.join(__dirname, '../../data/i18n/'),
    watch: true,
  },
  resolvers: [{ use: QueryResolver, options: ['lang', 'locale', 'l'] }, AcceptLanguageResolver],
});
