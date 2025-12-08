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
            where: {userId: req.user.userId},
            orderBy: { createdAt: 'desc'},
            select:{
                id: true,
                fileName: true,
                filepath: true,
                mimeType: true,
                fileSize: true,
                createdAt: true,
            }
        })
        return res.status(200).json({message: "Files fetched successfully", files});

    }catch(error){
        return res.status(500).json({message: "Internal server error"});
    }
})

// router.post("/mock-upload", authMiddleware, async (req: AuthRequest, res: Response) =>{
//     try{
//         if(!req.user){
//             return  res.status(401).json({message: "Unauthorized"});
//         }
//         const {fileName, mimeType, fileSize} = req.body;
//         if(!fileName || !mimeType || !fileSize){
//             return res.status(400).json({message: "fileName, mimeType and fileSize are required"});
//         }

//         const fakeKey = `user_${req.user.userId}/${Date.now()}_${fileName}`;

//         const file = await prisma.file.create({
//             data: {
//                 userId: req.user.userId,
//                 fileName,
//                 key: fakeKey,
//                 fileSize,
//                 mimeType,
//                 filepath: `https://mockstorage.example.com/${fakeKey}`,
//             },
//             select: {
//                 id: true,
//                 fileName: true,
//                 filepath: true,
//                 mimeType: true,
//                 fileSize: true,
//                 createdAt: true,
//             }
//         })
//         return res.status(201).json({message: "Mock File uploaded successfully", file});
//     }catch(error){
//         return res.status(500).json({message: "Internal server error"});
//     }
// })

router.post("/upload-url", authMiddleware, async (req: AuthRequest, res: Response) =>{
    try{
        if(!req.user){
            return res.status(401).json({message: "Unauthorized"});
        }
        const {fileName, filetype, fileSize} = req.body;
        if(!fileName || !filetype || !fileSize){
            return res.status(400).json({message: "fileName, filetype and fileSize are required"});
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

    const uploadUrl = await getSignedUploadUrl(key, filetype, 300);

        return res.status(200).json({message: "Upload URL generated successfully", uploadUrl, key});

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

        await prisma.file.delete({
            where: {id: fileId}
        });

        return res.status(200).json({message: "File deleted successfully"});

    }catch(error){
        return res.status(500).json({message: "Internal server error"});
    }
})


export default router;