import { IsString, IsOptional, IsInt, IsBoolean, IsUrl, Min, MaxLength, Max, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTestimonialDto {
  @IsString()
  locale: string;

  @IsString()
  @MaxLength(100)
  clientName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientRole?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientCompany?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublished?: boolean;
}