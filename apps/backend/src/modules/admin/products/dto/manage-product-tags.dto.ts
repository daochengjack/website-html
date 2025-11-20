import { IsArray, IsString } from 'class-validator';

export class ManageProductTagsDto {
  @IsArray()
  @IsString({ each: true })
  tagIds: string[];
}
