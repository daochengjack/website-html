import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum InquiryStatusType {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SPAM = 'spam',
}

export class UpdateInquiryStatusDto {
  @IsEnum(InquiryStatusType)
  @IsNotEmpty()
  status: InquiryStatusType;

  @IsString()
  @IsOptional()
  note?: string;
}
