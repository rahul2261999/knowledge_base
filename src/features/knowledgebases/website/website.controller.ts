import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { KnowledgebaseIdParamDto } from '../document/dto/id-param.dto';
import SuccessResponse from 'src/core/response/response.util';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { GetWebsiteDto } from './dto/get-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';

@Controller({
  path: 'knowledgebases/:knowledgebaseId/website',
  version: '1',
})
export class WebsiteController {
  constructor(
    private readonly websiteService: WebsiteService,
  ) { }

  @Post()
  public async create(
    @Param() params: KnowledgebaseIdParamDto,
    @Body() createWebsiteDto: CreateWebsiteDto,
  ) {
    const data = await this.websiteService.create(
      params.knowledgebaseId,
      createWebsiteDto,
    );


    return new SuccessResponse('Document uploaded successfully', {
      data,
    });
  }

  @Get()
  public async findAll(@Param() params: KnowledgebaseIdParamDto) {
    const data = await this.websiteService.findAll(params.knowledgebaseId);

    return new SuccessResponse('Websites fetched successfully', {
      data,
    });
  }

  @Get(':websiteId')
  public async findOne(@Param() param: GetWebsiteDto) {
    const data = await this.websiteService.findOne(param.websiteId);

    return new SuccessResponse('Website fetched successfully', {
      data,
    });
  }

  @Patch(':websiteId')
  public async update(
    @Param() param: GetWebsiteDto,
    @Body() updateWebsiteDto: UpdateWebsiteDto
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


