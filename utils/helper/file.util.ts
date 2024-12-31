import * as path from 'path';

class FileHelper {
  private file: File;

  constructor(file: File) {
    this.file = file;
  }

  public getFileExtension(): string {
    return path.extname(this.file.name).toLocaleLowerCase();
  }

  public validateFileExtension(allowedExtensions: string[]): boolean {
    const fileExtension = this.getFileExtension();
    return allowedExtensions.includes(fileExtension);
  }
}

export default FileHelper;