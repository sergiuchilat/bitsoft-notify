import { ArrayNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
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
    example: ['120363352716331799@g.us'],
    description: 'Notification group IDs',
    name: 'receivers',
  })
  @IsString({ each: true })
  @ArrayNotEmpty()
  receivers: string[];
}
