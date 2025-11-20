import { PartialType } from '@nestjs/mapped-types';
import { CreateDownloadDocumentDto } from './create-download-document.dto';

export class UpdateDownloadDocumentDto extends PartialType(CreateDownloadDocumentDto) {}