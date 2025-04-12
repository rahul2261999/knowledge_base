import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { KnowledgebasesService } from './knowledgebases.service';
import { CreateKnowledgebaseDto } from './dto/create-knowledgebase.dto';
import { KnowledgebaseResDto } from './dto/knowledgebase-res.dto';
import { plainToInstance } from 'class-transformer';
import SuccessResponse from 'src/core/response/response.util';
import { QueryDto } from './dto/query.dto';
import { QueryResponseDto } from './dto/query-response.dto';
import BadRequest from 'src/core/error/bad-request';

@Controller({
  path: 'knowledgebases',
  version: '1',
})
export class KnowledgebasesController {
  constructor(private readonly knowledgebasesService: KnowledgebasesService) {}

  @Post()
  async create(@Body() createKnowledgebaseDto: CreateKnowledgebaseDto) {    
    const data = await this.knowledgebasesService.create(
      createKnowledgebaseDto,
    );

    const responseDto = plainToInstance(KnowledgebaseResDto, data, {
      excludeExtraneousValues: true,
    });

    return new SuccessResponse('Knowledgebase created successfully', {
      data: responseDto,
    });
  }

  @Get()
  public async findAll() {
    const data = await this.knowledgebasesService.findAll();

    const responseDto = plainToInstance(KnowledgebaseResDto, data, {
      excludeExtraneousValues: true,
    });

    return new SuccessResponse('Knowledgebase fetched successfully', {
      data: responseDto,
    });
  }

  @Get(':knowledgebaseId')
  public async findOne(@Param('knowledgebaseId') knowledgebaseId: string) {
    const data = await this.knowledgebasesService.findOne(knowledgebaseId);
    
    const responseDto = plainToInstance(KnowledgebaseResDto, data, {
      excludeExtraneousValues: true,
    });

    return new SuccessResponse('Knowledgebase find successfully', {
      data: responseDto,
    });
  }

  @Delete(':knowledgebaseId')
  public async remove(@Param('knowledgebaseId') knowledgebaseId: string) {
    await this.knowledgebasesService.remove(knowledgebaseId);

    return new SuccessResponse('Knowledgebase deleted successfully');
  }

  @Post(':knowledgebaseId/query')
  public async query(@Param('knowledgebaseId') knowledgebaseId: string, @Body() queryDto: QueryDto) {
    const data = await this.knowledgebasesService.query(knowledgebaseId, queryDto);

    const responseDto = plainToInstance(QueryResponseDto, data, {
      excludeExtraneousValues: true,
    });

    return new SuccessResponse('Knowledgebase query executed successfully', {
      data: responseDto,
    });
  }
}
