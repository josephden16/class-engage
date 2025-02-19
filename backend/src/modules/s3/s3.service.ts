import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as AWS from "aws-sdk";

@Injectable()
export class S3Service {
  constructor(private configService: ConfigService) {}

  private readonly s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  async uploadFileToPrivateBucket(file: Express.Multer.File, key: string) {
    try {
      const params = {
        Bucket: this.configService.get("S3_PRIVATE_BUCKET_NAME"),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const result = await this.s3.upload(params).promise();
      return result;
    } catch (error) {
      Logger.error(error);
    }
  }

  async uploadFileToPublicBucket(file: Express.Multer.File, key: string) {
    try {
      const params = {
        Bucket: this.configService.get("S3_PUBLIC_BUCKET_NAME"),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      };

      const result = await this.s3.upload(params).promise();
      return result;
    } catch (error) {
      Logger.error(error);
    }
  }

  async deleteFileFromS3PrivateBucket(fileKey: string): Promise<void> {
    try {
      const params = {
        Bucket: this.configService.get("S3_PRIVATE_BUCKET_NAME"),
        Key: fileKey,
      };

      await this.s3.deleteObject(params).promise();
    } catch (error) {
      Logger.error(error);
    }
  }

  async deleteFileFromS3PublicBucket(fileKey: string): Promise<void> {
    try {
      const params = {
        Bucket: this.configService.get("S3_PUBLIC_BUCKET_NAME"),
        Key: fileKey,
      };

      await this.s3.deleteObject(params).promise();
    } catch (error) {
      Logger.error(error);
    }
  }

  async getPresignedUrl(fileKey: string, expiryTime = 3600): Promise<string> {
    const params = {
      Bucket: this.configService.get("S3_PRIVATE_BUCKET_NAME"),
      Key: fileKey,
      Expires: expiryTime, // URL expiration time in seconds (e.g., 1 hour)
    };

    const url = this.s3.getSignedUrl("getObject", params);
    return url;
  }
}
