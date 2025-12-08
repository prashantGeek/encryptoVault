import {Router, Response} from "express";
import prisma from "../lib/prisma.js";
import {authMiddleware, AuthRequest} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
    try{
        if(!req.user){
            return res.status(401).json({message: "Unauthorized"});
        }

        const {userId} = req.user;

        const user = await prisma.user.findUnique({
            where: {id: userId},
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true
                }
            });

            if(!user){
                return res.status(404).json({message: "User not found"});
            }

            return res.status(200).json({message: "user fetched successfully", user});
        }
    catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
});

router.get("/check", authMiddleware, (req: AuthRequest, res: Response) => {
  return res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

export default router;
