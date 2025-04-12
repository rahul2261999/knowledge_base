import {
  Controller,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Delete,
  Get,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgebaseIdParamDto } from './dto/id-param.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import SuccessResponse from 'src/core/response/response.util';
import { TriggerService } from 'src/features/events/trigger/triggers.service';
import { DeleteDocumentDto } from './dto/delete-document.dto';
import { AlsService } from 'src/core/common/als/als.service';
import { CreateDocumentResDto } from './dto/create-document-res.dto';
import { GetDocumentDto } from './dto/get-document.dto';
import { FileTypeValidator } from 'src/core/common/file-validator';
import { EFileProcessorEvents } from 'src/lib/file_processors/index.type';
import { ulid } from 'ulid';

@Controller({
  path: 'knowledgebases/:knowledgebaseId/document',
  version: '1',
})
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly ingestionTriggerService: TriggerService,
    private readonly alsService: AlsService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  public async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator(),
          new MaxFileSizeValidator({
            maxSize: 50 * 1024 * 1024,
            message: 'File size must not be exceed 50 mb.',
          }),
        ],
      }),
    )
    file: Express.Multer.File,

    @Param() params: KnowledgebaseIdParamDto,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    const data = await this.documentService.create(
      file,
      params.knowledgebaseId,
      createDocumentDto,
    );
    
    this.ingestionTriggerService.emitEvent(
      EFileProcessorEvents.PROCESS_INCOMING_FILE,
      {
        knowledgebaseId: data.knowledgebaseId,
        documentId: data._id.toString(),
        tracingId: this.alsService.getTraceId() || ulid(),
      },
    );

    const resDto = plainToClass(CreateDocumentDto, data, {
      excludeExtraneousValues: true,
    });

    return new SuccessResponse('Document uploaded successfully', {
      data: resDto,
    });
  }

  @Get()
  public async findAll(@Param('knowledgebaseId') knowledgebaseId: string) {
    const data = await this.documentService.findAll(knowledgebaseId);

    const resDto = plainToInstance(CreateDocumentResDto, data, {
      excludeExtraneousValues: true,
    });

    return new SuccessResponse('Documents fetched successfully', {
      data: resDto,
    });
  }

  @Get(':documentId')
  public async findOne(@Param() param: GetDocumentDto) {
    const data = await this.documentService.findOne(param.documentId);

    const resDto = plainToClass(CreateDocumentResDto, data, {
      excludeExtraneousValues: true,
    });

    return new SuccessResponse('Document fetched successfully', {
      data: resDto,
    });
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
  //   return this.documentService.update(+id, updateDocumentDto);
  // }

  @Delete(':documentId')
  public async remove(@Param() params: DeleteDocumentDto) {
    const data = await this.documentService.remove(params);

    return new SuccessResponse('Document deleted successfully');
  }
}
