import { Injectable } from '@nestjs/common';
import { WebsiteRepo } from './website.repo';
import { ILoggerData } from 'src/lib/logger/logger.type';
import { LoggingService } from 'src/lib/logger/logger.service';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { KnowledgebasesService } from '../knowledgebases.service';
import { Website } from './schema/website.schema';
import { ProcessingStatus, Status } from 'src/core/constants/global.enum';
import mongoose from 'mongoose';
import NotFound from 'src/core/error/not-found';
import { UpdateWebsiteDto } from './dto/update-website.dto';

@Injectable()
export class WebsiteService {
  constructor(
    private readonly loggerService: LoggingService,
    private readonly websiteRepository: WebsiteRepo,
    private readonly knowledgeService: KnowledgebasesService,
  ) {}

  public async create(
    tenantId: string,
    knowledgebaseId: string,
    createWebsiteDto: CreateWebsiteDto,
  ) {
    const loggerData: ILoggerData = {
      serviceName: 'WebsiteService',
      function: 'create',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      await this.knowledgeService.findOne(knowledgebaseId);

      const createWebsite: Website = {
        tenantId,
        knowledgebaseId,
        url: createWebsiteDto.url,
        depth: createWebsiteDto.depth,
        processingStatus: ProcessingStatus.PROCESSING,
        status: Status.ACTIVE,
        createdBy: null,
        updatedBy: null,
      };

      const createdWebsite = await this.websiteRepository.create(createWebsite);

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      return createdWebsite.toJSON();
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async findAll(knowledgebaseId: string) {
    const loggerData: ILoggerData = {
      serviceName: 'WebsiteService',
      function: 'findAll',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const websites = await this.websiteRepository.find({
        knowledgebaseId,
      });

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      return websites.map((doc) => doc.toJSON());
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async findOne(id: string) {
    const loggerData: ILoggerData = {
      serviceName: 'WebsiteService',
      function: 'findOne',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const website = await this.websiteRepository.findOne({
        _id: new mongoose.Types.ObjectId(id),
      });

      if (!website) {
        throw new NotFound(`website not found with id: ${id}`);
      }

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      return website?.toJSON();
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async update(id: string, updateDocumentDto: UpdateWebsiteDto) {
    const loggerData: ILoggerData = {
      serviceName: 'WebsiteService',
      function: 'update',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const website = await this.findOne(id);

      const updatedDocument = await this.websiteRepository.update(
        website._id,
        updateDocumentDto,
      );

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      return updatedDocument;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }

  public async remove(id: string) {
    const loggerData: ILoggerData = {
      serviceName: 'WebsiteService',
      function: 'remove',
      message: 'executing',
    };

    try {
      this.loggerService.info(loggerData);

      const website = await this.findOne(id);

      const updatedDocument = await this.websiteRepository.delete({
        _id: website._id,
      });

      this.loggerService.info({
        ...loggerData,
        message: 'execution completed',
      });

      return updatedDocument;
    } catch (error) {
      this.loggerService.error({ ...loggerData, message: 'failed' });

      throw error;
    }
  }
}
