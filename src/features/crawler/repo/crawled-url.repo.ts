import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { DeleteResult, Model, RootFilterQuery, UpdateWriteOpResult } from "mongoose";
import { CrawledUrl, CrawledUrlDocument } from "../schemas/crawled-url.model";

@Injectable()
class CrawledUrlRepo {
  constructor(@InjectModel(CrawledUrl.name) private crawledUrlModel: Model<CrawledUrl>) { }

  public async create(crawlUrl: CrawledUrl): Promise<CrawledUrlDocument> {
    try {
      Logger.log("executing: CrawledUrlRepo -> create")
      
      const data = await this.crawledUrlModel.create(crawlUrl);

      Logger.log("executed: CrawledUrlRepo -> create")

      return data;
    } catch (error) {
      Logger.error("error: CrawledUrlRepo -> create");
      Logger.error(error, error.stack);

      throw new InternalServerErrorException("something went wrong", {
        cause: error,
        description: error.message,
      })
    }
  }

  public async bulkCreate(crawlUrls: CrawledUrl[]): Promise<CrawledUrlDocument[]> {
    try {
      Logger.log("executing: CrawledUrlRepo -> bulkCreate")
      
      const data = await this.crawledUrlModel.create(crawlUrls);

      Logger.log("executed: CrawledUrlRepo -> bulkCreate")

      return data;
    } catch (error) {
      Logger.error("error: CrawledUrlRepo -> bulkCreate");
      Logger.error(error, error.stack);

      throw new InternalServerErrorException("something went wrong", {
        cause: error,
        description: error.message,
      })
    }
  }

  public async updateOne(filterOption: RootFilterQuery<CrawledUrl>, crawlUrl: Partial<CrawledUrl>): Promise<UpdateWriteOpResult> {
    try {
      Logger.log("executing: CrawledUrlRepo -> update");

      const data = await this.crawledUrlModel.updateOne(filterOption, crawlUrl)
      
      Logger.log("executed: CrawledUrlRepo -> update")

      return data;
    } catch (error) {
      Logger.error("error: CrawledUrlRepo -> update");
      Logger.error(error, error.stack);

      throw new InternalServerErrorException("something went wrong", {
        cause: error,
        description: error.message,
      })
    }
  }

  public async findOne(params: RootFilterQuery<CrawledUrl>): Promise<CrawledUrlDocument | null> {
    try {
      Logger.log("executing: CrawledUrlRepo -> findOne")

      const data = await this.crawledUrlModel.findOne(params)

      Logger.log("executed: CrawledUrlRepo -> findOne")

      return data;
    } catch (error) {
      Logger.error("error: CrawledUrlRepo -> findOne");
      Logger.error(error, error.stack);

      throw new InternalServerErrorException("something went wrong", {
        cause: error,
        description: error.message,
      })
    }
  }

  public async find(params: RootFilterQuery<CrawledUrl>): Promise<CrawledUrlDocument[]> {
    try {
      Logger.log("executing: CrawledUrlRepo -> find")

      const data = await this.crawledUrlModel.find(params)

      Logger.log("executed: CrawledUrlRepo -> find")

      return data;
    } catch (error) {
      Logger.error("error: CrawledUrlRepo -> find");
      Logger.error(error, error.stack);

      throw new InternalServerErrorException("something went wrong", {
        cause: error,
        description: error.message,
      })
    }
  }

  public async delete(params:RootFilterQuery<CrawledUrl>): Promise<DeleteResult> {
    try {
      Logger.log("executing: CrawledUrlRepo -> create")

      const data = await this.crawledUrlModel.deleteMany(params)

      Logger.log("executed: CrawledUrlRepo -> create")

      return data;
    } catch (error) {
      Logger.error("error: CrawledUrlRepo -> create");
      Logger.error(error, error.stack);

      throw new InternalServerErrorException("something went wrong", {
        cause: error,
        description: error.message,
      })
    }
  }
}

export { CrawledUrlRepo }