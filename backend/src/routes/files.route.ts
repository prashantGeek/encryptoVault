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

    const uploadUrl = await getSignedUploadUrl(key, mimeType, 300);

        return res.status(200).json({message: "Upload URL generated successfully", fileId:file.id, uploadUrl, key});

    }catch(error){
        return res.status(500).json({message: "Internal server error"});
    }
})



router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) =>{
    try{
        if(!req.user){
            return res.status(401).json({message: "Unauthorized"});
        }

        const fileId = Number(req.params.id);
        if (isNaN(fileId)){
            return res.status(400).json({ message: "Invalid file ID" });
        }

        const existingFile = await prisma.file.findUnique({
            where: {id: fileId}
        });

        if(!existingFile || existingFile.userId !== req.user.userId){
            return res.status(404).json({message: "File not found"});
        }

        await deleteFileFromS3(existingFile.key);

        await prisma.file.delete({
            where: {id: fileId}
        });

        return res.status(200).json({message: "File deleted successfully"});

    }catch(error){
        return res.status(500).json({message: "Internal server error"});
    }
})

router.post("/confirm-upload", authMiddleware, async (req: AuthRequest, res: Response) =>{
    try{
        if(!req.user){
            return res.status(401).json({message: "Unauthorized"});
        }
        
        const {fileName, key, mimeType, fileSize} = req.body;
        if(!fileName || !key || !mimeType || !fileSize){
            return res.status(400).json({message: "fileName, key, mimeType and fileSize are required"});
        }

        // Validate that the key starts with the user's folder prefix
        const expectedPrefix = `user-${req.user.userId}/`;
        if (!key.startsWith(expectedPrefix)) {
            return res.status(400).json({ message: "Invalid file key" });
        }
        const file = await prisma.file.create({
            data: {
                userId: req.user.userId,
                fileName,
                key,
                mimeType,
                fileSize,
                filepath: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
            },
            select: {
                id: true,
                fileName: true,
                filepath: true,
                mimeType: true,
                fileSize: true,
                createdAt: true,
            }
        })
        return res.status(201).json({message: "File uploaded successfully", file});
    }catch(error){
        return res.status(500).json({message: "Internal server error"});
    }
})

router.get("/download-url/:id", authMiddleware, async (req: AuthRequest, res: Response) =>{
    try{
        if(!req.user){
            return res.status(401).json({message: "Unauthorized"});
        }

        const fileId = Number(req.params.id);
        if (isNaN(fileId)){
            return res.status(400).json({ message: "Invalid file ID" });
        }

        const existingFile = await prisma.file.findUnique({
            where: {id: fileId}
        });

        if(!existingFile || existingFile.userId !== req.user.userId){
            return res.status(404).json({message: "File not found"});
        }

        const downloadUrl = await getsignedDownloadUrl(existingFile.key, 300);

        return res.status(200).json({message: "Download URL generated successfully", downloadUrl});

    }catch(error){
        return res.status(500).json({message: "Internal server error"});
    }

})

export default router;