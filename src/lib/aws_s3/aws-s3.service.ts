import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { LoggingService } from '../logger/logger.service';
import { ILoggerData } from '../logger/logger.type';
import InternalServer from 'src/core/error/internal-server.error';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';
import { AwsS3DownloadService } from './aws-s3-download.service';

@Injectable()
export class AwsS3Service {
  private s3Client: S3Client;
  public download: AwsS3DownloadService;

  constructor(
    private readonly loggerService: LoggingService,
    private readonly configurationService: ConfigurationService,
  ) {
    const s3Creds = this.configurationService.getS3Creds();

    this.s3Client = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: s3Creds.accessKey,
        secretAccessKey: s3Creds.secretAccessKey,
      },
    });

    this.download = new AwsS3DownloadService(this.s3Client, this.loggerService);
  }

  public async uploadFile(
    bucketname: string,
    key: string,
    file: Express.Multer.File,
  ) {
    const logData: ILoggerData = {
      serviceName: 'AwsS3Service',
      function: 'uploadFile',
      message: 'Upload file to S3',
    };

    try {
      this.loggerService.info(logData);

      const fileStream = fs.createReadStream(file.path);

      const uploadFile = new Upload({
        client: this.s3Client,
        params: {
          Bucket: bucketname,
          Key: key,
          Body: fileStream,
          ContentType: file.mimetype,
        },
      });

      await uploadFile.done();

      this.loggerService.info({
        ...logData,
        message: 'file uploaded successfully',
      });

      return;
    } catch (error) {
      this.loggerService.error(logData, { error: error as Error });

      throw new InternalServer('Failed to upload file to S3');
    }
  }

  public async uploadTextToS3(bukcetName: string, key: string, text: string) {
    const logggerData: ILoggerData = {
      serviceName: 'AwsS3Service',
      function: 'uploadTextToS3',
      message: 'Upload text to S3',
    };

    try {
      this.loggerService.info(logggerData);

      const command = new PutObjectCommand({
        Bucket: bukcetName,
        Key: key,
        Body: text,
        ContentType: 'text/plain',
      });

      await this.s3Client.send(command);

      this.loggerService.info({ ...logggerData, message: 'executed' });

      return { key };
    } catch (error) {
      this.loggerService.error(
        { ...logggerData, message: 'failed' },
        { error },
      );

      throw new InternalServer('Failed to upload text to S3');
    }
  }

  public async getFileUrl(bucketname: string, key: string) {
    const logData: ILoggerData = {
      serviceName: 'AwsS3Service',
      function: 'getFileUrl',
      message: 'get signed url',
    };

    try {
      this.loggerService.info(logData);

      const command = new GetObjectCommand({
        Bucket: bucketname,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });

      this.loggerService.info({
        ...logData,
        message: 'signed url generated successfully',
      });

      return signedUrl;
    } catch (error) {
      this.loggerService.error(logData, { error: error as Error });

      throw new InternalServer('Failed to genreate signed url');
    }
  }

  public async deleteFile(bucketname: string, key: string) {
    const logData: ILoggerData = {
      serviceName: 'AwsS3Service',
      function: 'deleteFile',
      message: 'delet file from S3',
    };

    try {
      this.loggerService.info(logData);

      const command = new DeleteObjectCommand({
        Bucket: bucketname,
        Key: key,
      });

      await this.s3Client.send(command);

      this.loggerService.info({
        ...logData,
        message: 'file deleted successfully',
      });

      return;
    } catch (error) {
      this.loggerService.error(logData, { error: error as Error });

      throw new InternalServer('Failed to delete from S3');
    }
  }

  public async deleteFolder(bucketname: string, prefix: string) {
    const logData: ILoggerData = {
      serviceName: 'AwsS3Service',
      function: 'deleteFolder',
      message: `Deleting all objects under prefix: ${prefix}`,
    };

    try {
      this.loggerService.info(logData);

      let continuationToken: string | undefined;

      do {
        // List all objects under the prefix
        const listCommand = new ListObjectsV2Command({
          Bucket: bucketname,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        });

        const listResponse = await this.s3Client.send(listCommand);

        if (!listResponse.Contents || listResponse.Contents.length === 0) {
          break;
        }

        // Delete each object
        for (const object of listResponse.Contents) {
          if (object.Key) {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: bucketname,
              Key: object.Key,
            });
            await this.s3Client.send(deleteCommand);
          }
        }

        continuationToken = listResponse.NextContinuationToken;
      } while (continuationToken);

      this.loggerService.info({
        ...logData,
        message: `Successfully deleted all objects under prefix: ${prefix}`,
      });

      return;
    } catch (error) {
      this.loggerService.error(logData, { error: error as Error });
      throw new InternalServer('Failed to delete folder from S3');
    }
  }
}
