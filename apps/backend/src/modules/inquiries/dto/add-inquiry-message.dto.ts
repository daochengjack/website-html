import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AddInquiryMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  message: string;

  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;
}
