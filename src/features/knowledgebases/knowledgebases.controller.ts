import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { KnowledgebasesService } from './knowledgebases.service';
import { CreateKnowledgebaseDto } from './dto/create-knowledgebase.dto';
import { KnowledgebaseResDto } from './dto/knowledgebase-res.dto';
import { plainToInstance } from 'class-transformer';
import SuccessResponse from 'src/core/response/response.util';
import { QueryDto } from './dto/query.dto';
import { QueryResponseDto } from './dto/query-response.dto';
import { BaseParamsDto } from './dto/base-params.dto';
import { FindKnowledgebaseDto } from './dto/find-knowledgebase.dto';

@Controller({
  path: ':tenantId/knowledgebases',
  version: '1',
})
export class KnowledgebasesController {
  constructor(private readonly knowledgebasesService: KnowledgebasesService) {}

  @Post()
  async create(
    @Param() parmas: BaseParamsDto,
    @Body() createKnowledgebaseDto: CreateKnowledgebaseDto,
  ) {
    const data = await this.knowledgebasesService.create(
      parmas.tenantId,
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
  public async findAll(@Param() params: BaseParamsDto) {
    const data = await this.knowledgebasesService.findAll({
      tenantId: params.tenantId,
    });

    const responseDto = plainToInstance(KnowledgebaseResDto, data, {
      excludeExtraneousValues: true,
    });

    return new SuccessResponse('Knowledgebase fetched successfully', {
      data: responseDto,
    });
  }

  @Get(':knowledgebaseId')
  public async findOne(@Param() params: FindKnowledgebaseDto) {
    const data = await this.knowledgebasesService.findOne(
      params.knowledgebaseId,
    );

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

  @Post(':knowledgebaseId/embeddings')
  public async query(
    @Param('knowledgebaseId') knowledgebaseId: string,
    @Body() queryDto: QueryDto,
  ) {
    const data = await this.knowledgebasesService.embeddings(
      knowledgebaseId,
      queryDto,
    );

    const responseDto = plainToInstance(QueryResponseDto, data, {
      excludeExtraneousValues: true,
    });

    return new SuccessResponse('Knowledgebase query executed successfully', {
      data: responseDto,
    });
  }
}
