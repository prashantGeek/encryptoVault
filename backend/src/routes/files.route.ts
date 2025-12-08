import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { getSignedUploadUrl, getsignedDownloadUrl, deleteFileFromS3 } from '../services/s3.service.js';

const router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res:Response) =>{
    try{
        if(!req.user){
            return res.status(401).json({message: "Unauthorized"});
        }
        
        const files = await prisma.file.findMany({
            where: {
                userId: req.user.userId,
                status: "completed"  // Only show completed uploads
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fileName: true,
                filepath: true,
                mimeType: true,
                fileSize: true,
                createdAt: true,
            }
        });
        return res.status(200).json({message: "Files fetched successfully", files});

    }catch(error){
        return res.status(500).json({message: "Internal server error"});
    }
})


router.post("/upload", authMiddleware, async (req: AuthRequest, res: Response) =>{
    try{
        if(!req.user){
            return res.status(401).json({message: "Unauthorized"});
        }
        const {fileName, mimeType, fileSize} = req.body;
        if(!fileName || !mimeType || !fileSize){
            return res.status(400).json({message: "fileName, mimeType and fileSize are required"});
        }

        const MAX_SIZE = 50 * 1024 * 1024;
    if (fileSize > MAX_SIZE) {
      return res.status(400).json({
        message: "File is too large. Max size is 50 MB",
      });
    }

    const timestamp = Date.now();
    const safeName = fileName.replace(/\s+/g, "_");
    const key = `user-${req.user.userId}/${timestamp}-${safeName}`;
    const filepath = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    //create a pending file record in the database
    const file = await prisma.file.create({
        data: {
            userId: req.user.userId,
            key,
            fileName,
            mimeType,
            fileSize,
            filepath,
            status: "pending"
        }
    });
    //get signed upload url from s3
    const uploadUrl = await getSignedUploadUrl(key, mimeType, 300);

        return res.status(200).json({message: "Upload URL generated successfully", fileId:file.id, uploadUrl, key});

    }catch(error){
        return res.status(500).json({message: "Internal server error"});
    }
})

// Post /files/webhook - called by Lambda when s3 upload is complete

router.post("/webhook", async (req: Request, res: Response) =>{
    try{
        console.log("=== WEBHOOK RECEIVED ===");
        console.log("Body:", req.body);
        
        const secret = req.headers['x-webhook-secret'];
        if(secret !== process.env.S3_WEBHOOK_SECRET){
            console.error("Invalid secret");
            return res.status(403).json({message: "Forbidden"});
        }

        const {key, size} = req.body;  // Extract size from body
        if(!key){
            return res.status(400).json({message: "key is required"});
        }
        
        console.log("Looking for file with key:", key);
        
        //find pending file by key and update status to completed
        const file = await prisma.file.findUnique({
            where: {key}
        });

        console.log("File found:", file);

        if(!file){
            console.error("File not found for key:", key);
            return res.status(404).json({message: "File not found"});
        }

        if(file.status === "completed"){
            return res.status(200).json({message: "File already marked as completed"});
        }

        await prisma.file.update({
            where: {id: file.id},
            data: {
                status: "completed",
                fileSize: size || file.fileSize  // Fixed: moved inside data object
            }
        });
        
        console.log("File marked complete:", key);
        return res.status(200).json({message: "File upload confirmed successfully"});
        
    }catch(error){
        console.error("=== WEBHOOK ERROR ===", error);
        return res.status(500).json({message: "Internal server error"});
    }

})

router.get("/:id/download-url", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const fileId = Number(req.params.id);
        if (isNaN(fileId)) {
            return res.status(400).json({ message: "Invalid file ID" });
        }

        const file = await prisma.file.findUnique({
            where: { id: fileId }
        });

        if (!file || file.userId !== req.user.userId) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.status !== "completed") {
            return res.status(400).json({ message: "File upload not completed yet" });
        }

        const downloadUrl = await getsignedDownloadUrl(file.key, 300);
        return res.status(200).json({ message: "Download URL generated", downloadUrl });

    } catch (error) {
        console.error("Error in GET download-url:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const fileId = Number(req.params.id);
        if (isNaN(fileId)) {
            return res.status(400).json({ message: "Invalid file ID" });
        }

        const existingFile = await prisma.file.findUnique({
            where: { id: fileId }
        });

        if (!existingFile || existingFile.userId !== req.user.userId) {
            return res.status(404).json({ message: "File not found" });
        }

        // 1. Delete from S3
        await deleteFileFromS3(existingFile.key);

        // 2. Delete from database
        await prisma.file.delete({
            where: { id: fileId }
        });

        return res.status(200).json({ message: "File deleted successfully" });

    } catch (error) {
        console.error("Error in DELETE /files:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE Remove expired pending uploads (orphaned records)
router.delete("/cleanup/pending", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const expiredFiles = await prisma.file.findMany({
            where: {
                userId: req.user.userId,
                status: "pending",
                createdAt: { lt: oneHourAgo }
            }
        });

        for (const file of expiredFiles) {
            try {
                await deleteFileFromS3(file.key);
            } catch (err) {
                console.error(`Failed to delete ${file.key} from S3`);
            }
            await prisma.file.delete({ where: { id: file.id } });
        }

        return res.status(200).json({
            message: `Cleaned up ${expiredFiles.length} expired pending uploads`
        });

    } catch (error) {
        console.error("Error in cleanup:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


export default router;