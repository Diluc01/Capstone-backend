import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { authRoutes } from './authRoute.js';
import cors from 'cors';
import productRoutes from './productRoute.js';
import { orderRoutes } from './oderRoute.js';
import cartRoutes from './cartRoute.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

//setup cors 
app.use(cors({
  origin: '*'
}));


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/cart', cartRoutes);





// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
