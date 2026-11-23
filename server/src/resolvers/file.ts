import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Bucket } from "../config.ts";

export async function getUploadToken(
  filePath: string,
  fileType: string,
  expireIn: number,
) {
  const command = new PutObjectCommand({
    Bucket: "Inquesta",
    Key: filePath,
    ContentType: fileType,
  });

  const signedUrl = await getSignedUrl(s3Bucket, command, {
    expiresIn: expireIn,
  });
  return signedUrl;
}

// Uploads a file directly from the server to S3 (avoids browser CORS issues)
export async function uploadFileToS3(
  filePath: string,
  fileContent: Buffer,
  fileType: string,
) {
  const command = new PutObjectCommand({
    Bucket: "Inquesta",
    Key: filePath,
    ContentType: fileType,
    Body: fileContent,
  });
  await s3Bucket.send(command);
  return filePath;
}
