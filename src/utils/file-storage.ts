import path from 'path';
import fs from 'fs';

export class FileStorage {
  private constructor() {}

  public static getDirPath(dirPath: string): string {
    const resolvedPath = path.join(process.cwd(), '/tmp', dirPath);

    return resolvedPath;
  }

  public static dirExists(dirPath: string): boolean {
    return fs.existsSync(dirPath);
  }

  public static createDir(dirPath: string): void {
    const finalPath = path.join(process.cwd(), dirPath);

    if (!this.dirExists(finalPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
