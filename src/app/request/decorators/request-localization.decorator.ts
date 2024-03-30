import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Language } from '@/app/enum/language.enum';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const RequestLocalization = createParamDecorator((data: string, context: ExecutionContext) => {
  return context.switchToHttp().getRequest()['x-localization']?.toString()?.toLowerCase() || Language.en;
});
