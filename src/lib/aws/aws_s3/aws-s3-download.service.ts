import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import InternalServer from 'src/core/error/internal-server.error';
import { pipeline } from 'stream/promises';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';

export class AwsS3DownloadService {
  private s3Client: S3Client;

  constructor(
    readonly S3client: S3Client,
    private readonly loggerService: LoggingService,
  ) {
    this.s3Client = S3client;
  }

  public async checkFileExists(
    bucketName: string,
    key: string,
  ): Promise<boolean> {
    const loggerData: ILoggerData = {
      serviceName: 'AwsS3DownloadService',
      function: 'checkFileExists',
      message: 'Checking file existence',
    };

    try {
      this.loggerService.info(loggerData);

      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      this.loggerService.info({
        ...loggerData,
        message: 'file exist',
      });

      return true;
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: `not found ${key}` },
        { error },
      );

      return false;
    }
  }

  async getFileMetadata(bucketName: string, key: string) {
    const loggerData: ILoggerData = {
      serviceName: 'AwsS3DownloadService',
      function: 'getFileMetadata',
      message: 'Getting file metadata',
    };

    try {
      this.loggerService.info(loggerData);

      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const metadata = await this.s3Client.send(command);

      this.loggerService.info({
        ...loggerData,
        message: 'File metadata retrieved successfully',
      });

      return {
        fileSize: metadata.ContentLength || 0,
        contentType: metadata.ContentType,
        lastModified: metadata.LastModified,
      };
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: `not found ${key}` },
        { error },
      );

      throw new InternalServer(`not found`);
    }
  }

  /**
   * Download small files (<10MB) directly into memory
   */
  public async downloadSmallFile(bucket: string, key: string) {
    const loggerData: ILoggerData = {
      serviceName: 'AwsS3DownloadService',
      function: 'downloadSmallFile',
      message: 'Downloading small file',
    };

    try {
      this.loggerService.info(loggerData);

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const chunks: any[] = [];

      for await (const chunk of response.Body as Readable) {
        chunks.push(chunk);
      }

      this.loggerService.info({
        ...loggerData,
        message: 'Downloading small file completed successfully',
      });

      return {
        buffer: Buffer.concat(chunks),
        contentType: response.ContentType,
      };
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: `error downloading small file ${key}` },
        { error },
      );

      throw new InternalServer(
        'something went wrong while downloading the file',
      );
    }
  }

  /**
   * Download large files (>10MB) using multipart download
   */
  public async downloadLargeFile(
    bucket: string,
    key: string,
    downloadDir: string = 's3_download',
  ): Promise<{ filePath: string }> {
    const loggerData: ILoggerData = {
      serviceName: 'AwsS3DownloadService',
      function: 'downloadLargeFile',
      message: 'Downloading large file',
    };

    try {
      this.loggerService.info(loggerData);

      const tempFilePath = path.join(`${process.cwd()}`, downloadDir, key);
      const dirPath = path.dirname(tempFilePath);
      fs.mkdirSync(dirPath, { recursive: true });

      const fileStream = fs.createWriteStream(tempFilePath);

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const { Body } = await this.s3Client.send(command);

      if (!Body || typeof Body.transformToWebStream !== 'function') {
        throw new Error(
          'Received an invalid response from S3. No stream available.',
        );
      }

      await pipeline(Body.transformToWebStream(), fileStream);

      return { filePath: tempFilePath };
    } catch (error) {
      this.loggerService.error(
        { ...loggerData, message: `error downloading large file ${key}` },
        { error },
      );

      throw error;
    }
  }

  /**
   * Clean up temporary files after processing
   * @param filePath Path to the temporary file
   */
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
