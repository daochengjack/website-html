import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTagTranslationDto {
  @IsString()
  @IsNotEmpty()
  locale: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
