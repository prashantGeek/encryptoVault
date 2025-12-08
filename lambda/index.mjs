export const handler = async (event) => {
    console.log("S3 Event received:", JSON.stringify(event, null, 2));

    try{
        const record = event.Records[0];
        const bucketName = record.s3.bucket.name;
        const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
        const objectSize = record.s3.object.size;

        console.log(`File Uploaded: ${objectKey} (${objectSize} bytes) to bucket: ${bucketName}`);

        //call backend webhook
        const webhookUrl = process.env.S3_WEBHOOK_URL;
        const webhookSecret = process.env.S3_WEBHOOK_SECRET;

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-webhook-secret': webhookSecret
            },
            body: JSON.stringify({
                bucket: bucketName,
                key: objectKey,
                size: objectSize
            })
        });

        const data = await response.json();
        console.log("Webhook response:", data);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Success", key: objectKey })
        };
    } catch (error) {
        console.error("Error processing S3 event:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" })
        };
    }
}