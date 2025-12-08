import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import e from "express";

const region = process.env.AWS_REGION!
const bucketName = process.env.AWS_S3_BUCKET_NAME!

export const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
})

// Function to get a signed URL for uploading a file

export async function getSignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
}

// Function to get a signed URL for downloading a file

export async function getsignedDownloadUrl(key:string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
    });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
}

// Function to delete a file from S3
export async function deleteFileFromS3(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
    });

    await s3Client.send(command);
}