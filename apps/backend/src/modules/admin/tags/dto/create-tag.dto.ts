import { IsString, IsNotEmpty, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TagTranslationDto {
  @IsString()
  @IsNotEmpty()
  locale: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ValidateNested()
  @Type(() => TagTranslationDto)
  translation: TagTranslationDto;
}
