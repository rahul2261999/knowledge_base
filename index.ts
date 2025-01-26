import * as express from "express";
import constant from "./constants/constant";
import * as cors from 'cors'
import { config } from "dotenv";
import { v4 } from "uuid";
import loggerService from "./utils/logger/logger.service";
import router from "./apis/main.route";
import * as swaggerJsDoc from 'swagger-jsdoc'
import * as swaggerUi from 'swagger-ui-express';
import { asyncContextStore } from "./utils/helper/async_context_store.util";
import { fileProcessorEvents } from "./events/file_processor.service";


config()

class Application {
  private static instance: Application;
  private app: express.Express;
  private port = constant.app.port || 5010

  private constructor() {
    this.app = express();
  }

  private configAsyncStore(request: express.Request, response: express.Response, next: express.NextFunction) {
    const tracingId = v4();

    asyncContextStore.runContext({}, () => {
      asyncContextStore.setTraceId(tracingId);

      next()
    })
  }

  private middleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(this.configAsyncStore);
  }

  private async initlizeDatabase() {
  }

  private routers() {
    this.app.use('/api', router);
  }

  private swaggerConfig() {
    loggerService.info('Configuring Swagger ...');

    const options: swaggerJsDoc.Options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'My API',
          version: '1.0.0',
          description: 'API Documentation',
        },
      },
      apis: ['./apis/ingestion/main.route.js'],
    }

    const swaggerDocs = swaggerJsDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  }

  public getExpressApp() {
    return this.app;
  }

  public static getInstance(): Application {
    if (!Application.instance) {
      Application.instance = new Application();
    }
    return Application.instance;
  }

  public init() {
    this.middleware();
    this.initlizeDatabase()
    this.routers();

    this.app.listen(this.port, () => {
      loggerService.info('server running on port ' + this.port);

      fileProcessorEvents.intilizeEventListeners();
    })
  }
}

Application.getInstance().init();