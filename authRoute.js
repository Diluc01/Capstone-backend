import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './models.js'; // Assuming previous models are in models.js

// Authentication Controller
const authController = {
  // Signup Route Handler
  async signup(req, res) {
    try {
      const { name, password ,  email } = req.body;
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }]
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email already exists'
        });
      }

      // Create new user
      const newUser = new User({
        name,
        email,
        password: bcrypt.hashSync(password, 10),
      });

      await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          username: newUser.username
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Server error during signup' });
    }
  },

  // Login Route Handler
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
    ,
  async verifyUser(req, res) {
    if(req.user){
        res.status(200).json({ message: 'User is verified', user: req.user });
    }else{
        res.status(401).json({ message: 'User is not verified' });
    }
  },

  async isAdmin(req, res) {
    console.log(req.user);
    if(req.user.isAdmin){
        res.status(200).json({ message: 'User is admin', user: req.user });
    }else{
        res.status(401).json({ message: 'User is not admin' });
    }
  }
};

// Authentication Middleware
const authMiddleware = {
  async authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId);
      
      if (!req.user) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      next();
    } catch (error) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  }
};

// Authentication Routes
const authRoutes = express.Router();

authRoutes.post('/signup', authController.signup);
authRoutes.post('/login', authController.login);
authRoutes.get('/verify', authMiddleware.authenticateToken, authController.verifyUser);
authRoutes.get('/admin', authMiddleware.authenticateToken, authController.isAdmin);

export {
  authRoutes,
  authMiddleware
};
