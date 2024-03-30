import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestUser = createParamDecorator((data: string, context: ExecutionContext) => {
  return context.switchToHttp().getRequest().user;
});
