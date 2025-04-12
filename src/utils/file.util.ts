import * as path from 'path';

class FileHelper {
  private file: any;

  constructor(file: any) {
    this.file = file;
  }

  public getFileExtension(): string {
    return path.extname(this.file.originalname).toLocaleLowerCase();
  }

  public validateFileExtension(allowedExtensions: string[]): boolean {
    const fileExtension = this.getFileExtension();
    return allowedExtensions.includes(fileExtension);
  }
}

export default FileHelper;
