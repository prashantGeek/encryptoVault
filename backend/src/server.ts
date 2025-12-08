import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/users.route.js';
import fileRoutes from './routes/files.route.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

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