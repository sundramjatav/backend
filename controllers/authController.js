const User = require("../model/userModel");
const jwt = require('jsonwebtoken')



// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
  };
  
  

const registerUser= async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      const userExists = await User.findOne({ email });
  
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const user = await User.create({
        name,
        email,
        password,
      });
      await user.save();

  
      if (user) {
        res.status(201).json({
          success:true,
          message:"Registration successful",
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  const loginUser =async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (user && (await user.matchPassword(password))) {
        res.json({
          success:true,
          message:"login successfully",
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  const userDetails=async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      if (user) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  module.exports = {registerUser,loginUser,userDetails}