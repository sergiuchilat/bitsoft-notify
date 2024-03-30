import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, Length } from 'class-validator';

export class DiscordNotificationCreatePayloadDto {
  @ApiProperty({ example: 'Sender', description: 'Sender' })
  @IsString({ message: 'Sender must be a string' })
  @Length(1, 255, {
    message: 'Sender must contain from $constraint1 to $constraint2 characters',
  })
    sender: string;

  @ApiProperty({ example: 'Subject', description: 'Subject' })
  @IsString({ message: 'Subject must be a string' })
  @Length(1, 255, {
    message: 'Subject must contain from $constraint1 to $constraint2 characters',
  })
    subject: string;

  @ApiProperty({ example: 'Body', description: 'Body' })
  @IsString({ message: 'Body must be a string' })
  @Length(1, 1000, {
    message: 'Body must contain from $constraint1 to $constraint2 characters',
  })
    body: string;

  @ApiProperty({
    example: ['1181207564683527721/Pu3vI456C_rOciaPProrMjpj-m65_Xy85464561Wp0pSSB9TsyeIATlfsu24-Tqp-Mx73vmC'],
    description: 'Notification receivers',
    name: 'receivers',
  })
  @IsString({ each: true })
  @IsArray()
    receivers: string[];
}
