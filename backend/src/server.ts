import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/users.route.js';
import fileRoutes from './routes/files.route.js';
import prisma from './lib/prisma.js';
import { deleteFileFromS3 } from './services/s3.service.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Scheduled cleanup job to remove orphaned pending files older than 1 hour
cron.schedule('0 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running scheduled cleanup...`);
    
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        const expiredFiles = await prisma.file.findMany({
            where: {
                status: "pending",
                createdAt: { lt: oneHourAgo }
            }
        });

        if (expiredFiles.length === 0) {
            console.log(`[${new Date().toISOString()}] No expired pending files to clean up`);
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const file of expiredFiles) {
            try {
                // Try to delete from S3 (may not exist)
                await deleteFileFromS3(file.key);
            } catch (err) {
                // File might not exist in S3, that's okay
                console.log(`Note: Could not delete ${file.key} from S3 (may not exist)`);
            }
            
            try {
                // Delete from database
                await prisma.file.delete({ where: { id: file.id } });
                successCount++;
                console.log(`Deleted orphaned file: ${file.key}`);
            } catch (err) {
                failCount++;
                console.error(`Failed to delete DB record for ${file.key}`);
            }
        }
        
        console.log(`[${new Date().toISOString()}] Cleanup completed: ${successCount} deleted, ${failCount} failed`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Cleanup job failed:`, error);
    }
});

console.log('Scheduled cleanup job registered (runs every hour at minute 0)');

app.get('/', (req, res) =>{
    res.send('EcryptoVault Backend is running');
})

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/files', fileRoutes);

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})

export default app;