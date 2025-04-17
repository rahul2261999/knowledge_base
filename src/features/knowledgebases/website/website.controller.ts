import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WebsiteService } from './website.service';
import { DocumentBaseParamsDto } from '../document/dto/base-param.dto';
import SuccessResponse from 'src/core/response/response.util';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { GetWebsiteDto } from './dto/get-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { plainToClass } from 'class-transformer';
import { CreateWebsiteResDto } from './dto/create-webiste-res.dto';

@Controller({
  path: 'knowledgebases/:knowledgebaseId/website',
  version: '1',
})
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  @Post()
  public async create(
    @Param() params: DocumentBaseParamsDto,
    @Body() createWebsiteDto: CreateWebsiteDto,
  ) {
    const data = await this.websiteService.create(
      params.tenantId,
      params.knowledgebaseId,
      createWebsiteDto,
    );

    const resDto = plainToClass(CreateWebsiteResDto, data, {
      excludeExtraneousValues: true,
    });

    return new SuccessResponse('Website uploaded successfully', {
      data: resDto,
    });
  }

  @Get()
  public async findAll(@Param() params: DocumentBaseParamsDto) {
    const data = await this.websiteService.findAll(params.knowledgebaseId);

    const resDto = plainToClass(CreateWebsiteResDto, data, {
      excludeExtraneousValues: true,
    });

    return new SuccessResponse('Websites fetched successfully', {
      data: resDto,
    });
  }

  @Get(':websiteId')
  public async findOne(@Param() param: GetWebsiteDto) {
    const data = await this.websiteService.findOne(param.websiteId);

    const resDto = plainToClass(CreateWebsiteResDto, data, {
      excludeExtraneousValues: true,
    });

    return new SuccessResponse('Website fetched successfully', {
      data: resDto,
    });
  }

  @Patch(':websiteId')
  public async update(
    @Param() param: GetWebsiteDto,
    @Body() updateWebsiteDto: UpdateWebsiteDto,
  ) {
    await this.websiteService.update(param.websiteId, updateWebsiteDto);

    return new SuccessResponse('Website updated successfully');
  }

  @Delete(':websiteId')
  public async remove(@Param() params: GetWebsiteDto) {
    await this.websiteService.remove(params.websiteId);

    return new SuccessResponse('Document deleted successfully');
  }
}
