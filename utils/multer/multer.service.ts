import multer = require("multer");

class MulterService {
  private static instance: MulterService;
  private upload: multer.Multer;

  private constructor() { 
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads/");
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
      }
    });

    this.upload = multer({ 
      dest: "uploads/",
      storage,
    });
  };

  public static getInstance(): MulterService {
    if (!MulterService.instance) {
      MulterService.instance = new MulterService();
    }

    return MulterService.instance;
  }

  public getUpload(): multer.Multer {
    return this.upload;
  }
}

export default MulterService.getInstance();