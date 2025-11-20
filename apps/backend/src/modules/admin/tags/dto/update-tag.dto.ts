import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTagDto {
  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
