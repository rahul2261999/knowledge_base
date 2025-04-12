import constant from '../../constants/constant';
import mongoose from 'mongoose';
import InternalServer from '../../utils/error/internal_server.error';
import loggerService from '../../utils/logger/logger.service';

class MongoDbClient {
  private static instance: MongoDbClient;

  private constructor() { }

  public static async getInstance(): Promise<MongoDbClient> {
    if (!MongoDbClient.instance) {
      MongoDbClient.instance = new MongoDbClient();
      await MongoDbClient.instance.connect()
        .then(() => loggerService.info("mongodb connection established"))
        .catch(err => loggerService.error(err.message, { error: err }));
    }
    return MongoDbClient.instance;
  }

  private async connect() {
    await mongoose.connect(constant.mongo.uri);
  }

  public getCollection(collectionName: string) {
    if (!mongoose.connection.db) {
      throw new InternalServer('Database not initialized. Ensure getInstance() is awaited.')
    }

    return mongoose.connection.db.collection(collectionName);
  }
}


export default MongoDbClient;
