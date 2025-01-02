import { Db, MongoClient } from 'mongodb'
import constant from '../../constants/constant';

class MongoDbClient {
  private static instance: MongoDbClient;
  private client: MongoClient;
  private db!: Db;

  private constructor() {
    this.client = new MongoClient(constant.mongo.uri);
    this.db = this.client.db(constant.mongo.db);
  }

  public static getInstance(): MongoDbClient {
    if (!MongoDbClient.instance) {
      MongoDbClient.instance = new MongoDbClient();
    }
    return MongoDbClient.instance;
  }

  public getCollection(collectionName: string) {

    return this.db.collection(collectionName)
  }
}

export default MongoDbClient.getInstance();