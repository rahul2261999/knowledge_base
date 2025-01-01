import * as express from "express";
import constant from "./constants/constant";
import * as cors from 'cors'
import { config } from "dotenv";
import { v4 } from "uuid";
import { asyncLocalStorage } from "./utils/helper/store.util";
import loggerService from "./utils/logger/logger.service";
import router from "./apis/main.route";

config()

class Application {
  private static instance: Application;
  private app: express.Express;
  private port = constant.app.port || 5010

  private constructor() {
    this.app = express();
  }

  private middleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(this.configAsyncStore);
  }

  private routers() {
    this.app.use('/api', router);
  }

  private configAsyncStore(request: express.Request, response: express.Response, next: express.NextFunction) {
    const correlationId = v4();
    const store = new Map<string, string>();
    store.set('correlationId', correlationId);

    asyncLocalStorage.run(store, () => {
      next()
    })
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
    this.routers();

    this.app.listen(this.port, () => {
      loggerService.info('server running on port ' + this.port);
    })
  }
}

Application.getInstance().init();