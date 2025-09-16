import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import transcriptionRoutes from './routes/transcriptionRoutes';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/', transcriptionRoutes);

mongoose.connect(process.env.MONGODB_URI || '', {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

export default app;