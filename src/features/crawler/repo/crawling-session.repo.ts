import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AnyBulkWriteOperation,
  DeleteResult,
  Model,
  RootFilterQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import {
  CrawlingSession,
  CrawlingSessionDocument,
} from '../schemas/crawling-session.model';
import InternalServer from 'src/core/error/internal-server.error';

@Injectable()
class CrawlingSessionRepo {
  constructor(
    @InjectModel(CrawlingSession.name)
    private crawlingSessionModel: Model<CrawlingSession>,
  ) {}

  public async create(
    crawlingSession: CrawlingSession,
  ): Promise<CrawlingSessionDocument> {
    try {
      Logger.log('executing: CrawlingSessionRepo -> create');

      const data = await this.crawlingSessionModel.create(crawlingSession);

      Logger.log('executed: CrawlingSessionRepo -> create');

      return data;
    } catch (error) {
      Logger.error('error: CrawlingSessionRepo -> create');
      Logger.error(error, error.stack);

      throw new InternalServerErrorException('something went wrong', {
        cause: error,
        description: error.message,
      });
    }
  }

  public async update(
    filterOption: RootFilterQuery<CrawlingSession>,
    webiste: Partial<CrawlingSession>,
  ): Promise<UpdateWriteOpResult> {
    try {
      Logger.log('executing: CrawlingSessionRepo -> update');

      const data = await this.crawlingSessionModel.updateMany(
        filterOption,
        webiste,
      );

      Logger.log('executed: CrawlingSessionRepo -> update');

      return data;
    } catch (error) {
      Logger.error('error: CrawlingSessionRepo -> update');
      Logger.error(error, error.stack);

      throw new InternalServerErrorException('something went wrong', {
        cause: error,
        description: error.message,
      });
    }
  }

  public async findOne(
    params: RootFilterQuery<CrawlingSession>,
  ): Promise<CrawlingSessionDocument | null> {
    try {
      Logger.log('executing: CrawlingSessionRepo -> findOne');

      const data = await this.crawlingSessionModel.findOne(params);

      Logger.log('executed: CrawlingSessionRepo -> findOne');

      return data;
    } catch (error) {
      Logger.error('error: CrawlingSessionRepo -> findOne');
      Logger.error(error, error.stack);

      throw new InternalServerErrorException('something went wrong', {
        cause: error,
        description: error.message,
      });
    }
  }

  public async find(
    params: RootFilterQuery<CrawlingSession>,
  ): Promise<CrawlingSessionDocument[]> {
    try {
      Logger.log('executing: CrawlingSessionRepo -> find');

      const data = await this.crawlingSessionModel.find(params);

      Logger.log('executed: CrawlingSessionRepo -> find');

      return data;
    } catch (error) {
      Logger.error('error: CrawlingSessionRepo -> find');
      Logger.error(error, error.stack);

      throw new InternalServerErrorException('something went wrong', {
        cause: error,
        description: error.message,
      });
    }
  }

  public async delete(
    params: RootFilterQuery<CrawlingSession>,
  ): Promise<DeleteResult> {
    try {
      Logger.log('executing: CrawlingSessionRepo -> create');

      const data = await this.crawlingSessionModel.deleteMany(params);

      Logger.log('executed: CrawlingSessionRepo -> create');

      return data;
    } catch (error) {
      Logger.error('error: CrawlingSessionRepo -> create');
      Logger.error(error, error.stack);

      throw new InternalServerErrorException('something went wrong', {
        cause: error,
        description: error.message,
      });
    }
  }

  public async bulkWrite(params: AnyBulkWriteOperation<CrawlingSession>[]) {
      try {
        Logger.log('executing: CrawlingSessionRepo -> bulkWrite');
  
        const data = await this.crawlingSessionModel.bulkWrite(params);
  
        Logger.log('executed: CrawlingSessionRepo -> bulkWrite');
  
        return data;
      } catch (error) {
        Logger.error('error: CrawlingSessionRepo -> bulkWrite');
        Logger.error(error, error.stack);
  
        throw new InternalServer('something went wrong');
      }
    }
}

export { CrawlingSessionRepo };
