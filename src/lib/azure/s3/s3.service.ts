import { Injectable } from '@nestjs/common';
import {
  BlobServiceClient,
  ContainerClient,
  BlockBlobClient,
  BlobSASPermissions,
} from '@azure/storage-blob';
import { ConfigurationService } from 'src/core/configuration/configuration.service';
import { LoggingService } from 'src/lib/logger/logger.service';
import { ILoggerData } from 'src/lib/logger/logger.type';
import InternalServer from 'src/core/error/internal-server.error';
import fs from 'fs';
import { S3DownloadService } from './s3-download.service';

@Injectable()
export class S3Service {
  private blobServiceClient: BlobServiceClient;
  public download: S3DownloadService;

  constructor(
    private readonly loggerService: LoggingService,
    private readonly configurationService: ConfigurationService,
  ) {
    this.initializeStorageClient();
  }

  private initializeStorageClient(): void {
    const logContext: ILoggerData = {
      serviceName: 'S3Service',
      function: 'initializeStorageClient',
      message: 'Executing: Initialize Azure Storage client',
    };

    try {
      this.loggerService.info(logContext);

      const { connectionString } =
        this.configurationService.getAzureStorageCreds();

      if (!connectionString) {
        this.loggerService.error(logContext, {
          error: new InternalServer(
            'Azure storage connection string is not configured',
          ),
        });

        throw new InternalServer(
          'Azure storage connection string is not configured',
        );
      }

      this.blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);

      this.download = new S3DownloadService(
        this.blobServiceClient,
        this.loggerService,
      );

      this.loggerService.info({
        ...logContext,
        message: 'Executed: Azure Storage client initialized successfully',
      });
    } catch (error) {
      this.loggerService.error(logContext, { error });
      throw new InternalServer('Failed to initialize storage service');
    }
  }

  private getContainerClient(containerName: string): ContainerClient | null {
    const logContext: ILoggerData = {
      serviceName: 'S3Service',
      function: 'getContainerClient',
      message: `Executing: Get container client for ${containerName}`,
    };

    try {
      this.loggerService.info(logContext);

      const client = this.blobServiceClient.getContainerClient(containerName);

      this.loggerService.info({
        ...logContext,
        message: `Executed: Container client retrieved for ${containerName}`,
      });

      return client;
    } catch (error) {
      this.loggerService.error(logContext, { error });
      return null;
    }
  }

  private getBlobClient(
    containerName: string,
    blobName: string,
  ): BlockBlobClient | null {
    const logContext: ILoggerData = {
      serviceName: 'S3Service',
      function: 'getBlobClient',
      message: `Executing: Get blob client for ${containerName}/${blobName}`,
    };

    try {
      this.loggerService.info(logContext);

      const containerClient = this.getContainerClient(containerName);
      if (!containerClient) {
        throw new Error(`Container ${containerName} not found`);
      }

      const blobClient = containerClient.getBlockBlobClient(blobName);

      this.loggerService.info({
        ...logContext,
        message: `Executed: Blob client retrieved for ${containerName}/${blobName}`,
      });

      return blobClient;
    } catch (error) {
      this.loggerService.error(logContext, { error });
      return null;
    }
  }

  public async uploadFile(
    containerName: string,
    key: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const logContext: ILoggerData = {
      serviceName: 'S3Service',
      function: 'uploadFile',
      message: `Executing: Upload file to ${containerName}/${key}`,
    };

    try {
      this.loggerService.info(logContext);

      const blobClient = this.getBlobClient(containerName, key);
      if (!blobClient) {
        throw new Error('Failed to get blob client');
      }

      const fileStream = fs.createReadStream(file.path);
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
      };

      const uploadResponse = await blobClient.uploadStream(
        fileStream,
        undefined,
        undefined,
        uploadOptions,
      );

      this.loggerService.info({
        ...logContext,
        message: `Executed: File uploaded successfully to ${containerName}/${key}`,
        additionalArgs: { requestId: uploadResponse?.requestId },
      });
    } catch (error) {
      this.loggerService.error(logContext, { error });
      throw new InternalServer('Failed to upload file to Azure Storage');
    }
  }

  public async uploadTextToS3(
    containerName: string,
    key: string,
    text: string,
  ): Promise<{ key: string }> {
    const logContext: ILoggerData = {
      serviceName: 'S3Service',
      function: 'uploadTextToS3',
      message: `Executing: Upload text to ${containerName}/${key}`,
    };

    try {
      this.loggerService.info(logContext);

      const blobClient = this.getBlobClient(containerName, key);
      if (!blobClient) {
        throw new Error('Failed to get blob client');
      }

      const uploadResponse = await blobClient.upload(text, text.length, {
        blobHTTPHeaders: {
          blobContentType: 'text/plain',
        },
      });

      this.loggerService.info({
        ...logContext,
        message: `Executed: Text uploaded successfully to ${containerName}/${key}`,
        additionalArgs: { requestId: uploadResponse?.requestId },
      });

      return { key };
    } catch (error) {
      this.loggerService.error(logContext, { error });
      throw new InternalServer('Failed to upload text to Azure Storage');
    }
  }

  public async getFileUrl(containerName: string, key: string): Promise<string> {
    const logContext: ILoggerData = {
      serviceName: 'S3Service',
      function: 'getFileUrl',
      message: `Executing: Generate SAS URL for ${containerName}/${key}`,
    };

    try {
      this.loggerService.info(logContext);

      const blobClient = this.getBlobClient(containerName, key);
      if (!blobClient) {
        throw new Error('Failed to get blob client');
      }

      const permissions = new BlobSASPermissions();
      permissions.read = true;

      const signedUrl = await blobClient.generateSasUrl({
        permissions,
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour
      });

      this.loggerService.info({
        ...logContext,
        message: `Executed: SAS URL generated successfully for ${containerName}/${key}`,
      });

      return signedUrl;
    } catch (error) {
      this.loggerService.error(logContext, { error });
      throw new InternalServer('Failed to generate signed url');
    }
  }

  public async deleteFile(containerName: string, key: string): Promise<void> {
    const logContext: ILoggerData = {
      serviceName: 'S3Service',
      function: 'deleteFile',
      message: `Executing: Delete file ${containerName}/${key}`,
    };

    try {
      this.loggerService.info(logContext);

      const blobClient = this.getBlobClient(containerName, key);
      if (!blobClient) {
        throw new Error('Failed to get blob client');
      }

      const deleteResponse = await blobClient.delete();

      this.loggerService.info({
        ...logContext,
        message: `Executed: File deleted successfully from ${containerName}/${key}`,
        additionalArgs: { requestId: deleteResponse?.requestId },
      });
    } catch (error) {
      this.loggerService.error(logContext, { error });
      throw new InternalServer('Failed to delete from Azure Storage');
    }
  }

  public async deleteFolder(
    containerName: string,
    prefix: string,
  ): Promise<void> {
    const logContext: ILoggerData = {
      serviceName: 'S3Service',
      function: 'deleteFolder',
      message: `Executing: Delete folder ${containerName}/${prefix}`,
    };

    try {
      this.loggerService.info(logContext);

      const containerClient = this.getContainerClient(containerName);
      if (!containerClient) {
        throw new Error('Failed to get container client');
      }

      const iterator = containerClient.listBlobsFlat({ prefix });
      let deletedCount = 0;

      for await (const blob of iterator) {
        if (blob.name) {
          await containerClient.deleteBlob(blob.name);
          deletedCount++;
        }
      }

      this.loggerService.info({
        ...logContext,
        message: `Executed: Successfully deleted ${deletedCount} blobs with prefix ${prefix} from ${containerName}`,
      });
    } catch (error) {
      this.loggerService.error(logContext, { error });
      throw new InternalServer('Failed to delete folder from Azure Storage');
    }
  }
}
