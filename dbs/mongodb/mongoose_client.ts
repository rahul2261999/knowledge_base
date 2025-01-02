import constant from '../../constants/constant';
import mongoose, { Connection } from 'mongoose';
import loggerService from '../../utils/logger/logger.service';
import InternalServer from '../../utils/error/internal_server.error';

class MongooseClient {
  private connection: Connection;

  constructor(uri: string, dbName: string) {
    loggerService.info('Connecting to mongodb')
    this.connection = mongoose.createConnection(uri, { dbName });

    loggerService.info('connected to mongodb successfully')
  }

  // Ensure connection is established before returning the instance
  // Ensure connect is called before proceeding further
  // public static async connect() {
  //   try {
  //     loggerService.info('Connecting to MongoDB...');

  //     // Only connect if there's no existing connection
  //     if (!MongooseClient.instance) {
  //       await mongoose.connect(constant.mongo.uri, {
  //         dbName: constant.mongo.db,
  //       });

  //       MongooseClient.instance = new MongooseClient();
  //       loggerService.info('MongoDB connected successfully');
  //     } else {
  //       loggerService.warn('Application is already connected to MongoDB');
  //     }

  //   } catch (error) {
  //     loggerService.error('Error connecting to MongoDB:', { error: error as Error });
  //     throw new InternalServer('Failed to connect to MongoDB');
  //   }
  // }

  // Method to get collection
  public getCollection(collectionName: string) {
    // Ensure the connection is established before accessing the collection
   this.connection.collection('document')
    return this.connection.collection(collectionName)
  }

  public getConnection() {
    return this.connection;
  }
}

const mongoVectoreStoreDb = new MongooseClient(constant.mongo.uri, constant.mongo.db);

export default mongoVectoreStoreDb;
