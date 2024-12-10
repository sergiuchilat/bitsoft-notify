import { ArrayNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendPersonalMessageDto {
  @ApiProperty({
    example: 'Subject',
    description: 'Subject',
  })
  @IsString({
    message: 'Subject must be a string',
  })
  @Length(1, 255, {
    message:
      'Subject must contain from $constraint1 to $constraint2 characters',
  })
  subject: string;

  @ApiProperty({
    example: 'Body',
    description: 'Body',
  })
  @IsString({
    message: 'Body must be a string',
  })
  @Length(1, 1_000, {
    message: 'Body must contain from $constraint1 to $constraint2 characters',
  })
  body: string;

  @ApiProperty({
    example: ['+12036335271', '+631799123456'],
    description: 'Notification group phone numbers in international format',
    name: 'receivers',
  })
  @ArrayNotEmpty()
  @Matches(/^\+\d{1,3}\d{4,14}$/, {
    each: true,
    message: 'each value should be a phone number in international format',
  })
  receivers: string[];
}
