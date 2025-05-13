import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { username, password, bio } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Upload profile picture if exists
    let profilePicture = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'profile_pictures');
      profilePicture = result.secure_url;
    }
    
    // Create user
    const user = await User.create({
      username,
      password,
      bio,
      profilePicture
    });
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    
    res.status(201).json({
      _id: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
      bio: user.bio,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    
    if (user && (await user.comparePassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      
      res.json({
        _id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};