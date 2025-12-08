import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

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
                filename: true,
                filepath: true,
                mimeType: true,
                filesize: true,
                createdAt: true,
            }
        })
        return res.status(200).json({message: "Files fetched successfully", files});

    }catch(error){
        return res.status(500).json({message: "Internal server error"});
    }
})

router.post("/mock-upload", authMiddleware, async (req: AuthRequest, res: Response) =>{
    try{
        if(!req.user){
            return  res.status(401).json({message: "Unauthorized"});
        }
        const {filename, mimeType, filesize} = req.body;
        if(!filename || !mimeType || !filesize){
            return res.status(400).json({message: "filename, mimeType and filesize are required"});
        }

        const fakeKey = `user_${req.user.userId}/${Date.now()}_${filename}`;

        const file = await prisma.file.create({
            data: {
                userId: req.user.userId,
                filename,
                key: fakeKey,
                filesize,
                mimeType,
                filepath: `https://mockstorage.example.com/${fakeKey}`,
            },
            select: {
                id: true,
                filename: true,
                filepath: true,
                mimeType: true,
                filesize: true,
                createdAt: true,
            }
        })
        return res.status(201).json({message: "Mock File uploaded successfully", file});
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