import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';
import InternalServer from 'src/core/error/internal-server.error';
import { pipeline } from 'stream/promises';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';

export class S3DownloadService {
  constructor(
    private readonly blobServiceClient: BlobServiceClient,
    private readonly loggerService: LoggingService,
  ) {}

  private getContainerClient(containerName: string): ContainerClient {
    return this.blobServiceClient.getContainerClient(containerName);
  }

  public async checkFileExists(
    containerName: string,
    blobName: string,
  ): Promise<boolean> {
    const loggerData: ILoggerData = {
      serviceName: 'S3DownloadService',
      function: 'checkFileExists',
      message: 'Checking file existence',
    };

    try {
      this.loggerService.info(loggerData);

      const containerClient = this.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(blobName);
      const exists = await blobClient.exists();

      this.loggerService.info({
        ...loggerData,
        message: exists ? 'file exists' : 'file does not exist',
      });

      return exists;
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: `error checking ${blobName}` },
        { error },
      );

      return false;
    }
  }

  async getFileMetadata(containerName: string, blobName: string) {
    const loggerData: ILoggerData = {
      serviceName: 'S3DownloadService',
      function: 'getFileMetadata',
      message: 'Getting file metadata',
    };

    try {
      this.loggerService.info(loggerData);

      const containerClient = this.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(blobName);
      const properties = await blobClient.getProperties();

      this.loggerService.info({
        ...loggerData,
        message: 'File metadata retrieved successfully',
      });

      return {
        fileSize: properties.contentLength || 0,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
      };
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: `not found ${blobName}` },
        { error },
      );

      throw new InternalServer(`not found`);
    }
  }

  public async downloadSmallFile(containerName: string, blobName: string) {
    const loggerData: ILoggerData = {
      serviceName: 'S3DownloadService',
      function: 'downloadSmallFile',
      message: 'Downloading small file',
    };

    try {
      this.loggerService.info(loggerData);

      const containerClient = this.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(blobName);
      const downloadResponse = await blobClient.download();

      if (!downloadResponse.readableStreamBody) {
        throw new Error('No readable stream available');
      }

      const chunks: any[] = [];
      const stream = downloadResponse.readableStreamBody;

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      this.loggerService.info({
        ...loggerData,
        message: 'Downloading small file completed successfully',
      });

      return {
        buffer: Buffer.concat(chunks),
        contentType: downloadResponse.contentType,
      };
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: `error downloading small file ${blobName}` },
        { error },
      );

      throw new InternalServer(
        'something went wrong while downloading the file',
      );
    }
  }

  public async downloadLargeFile(
    containerName: string,
    blobName: string,
    downloadDir: string = 's3_download',
  ): Promise<{ filePath: string }> {
    const loggerData: ILoggerData = {
      serviceName: 'S3DownloadService',
      function: 'downloadLargeFile',
      message: 'Downloading large file',
    };

    try {
      this.loggerService.info(loggerData);

      const tempFilePath = path.join(`${process.cwd()}`, downloadDir, blobName);
      const dirPath = path.dirname(tempFilePath);
      fs.mkdirSync(dirPath, { recursive: true });

      const fileStream = fs.createWriteStream(tempFilePath);
      const containerClient = this.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(blobName);
      const downloadResponse = await blobClient.download();

      if (!downloadResponse.readableStreamBody) {
        throw new Error('No readable stream available');
      }

      await pipeline(downloadResponse.readableStreamBody, fileStream);

      return { filePath: tempFilePath };
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: `error downloading large file ${blobName}` },
        { error },
      );

      throw error;
    }
  }

  public cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.loggerService.info(`Deleted temporary file: ${filePath}`);
      }
    } catch (error) {
      this.loggerService.error(
        `Error cleaning up temp file ${filePath}`,
        error,
      );
    }
  }
}
