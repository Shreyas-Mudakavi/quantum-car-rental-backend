const APIFeatures = require("../utils/apiFeatures");
const userModel = require('../Model/Users');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');
const { s3Uploadv2 } = require("../utils/s3");
const secretKey = process.env.SECRET_KEY



const getAllUsers = async (req, res, next) => {

  

    console.log(req.query);
    const userCount = await userModel.countDocuments();
    console.log("userCount", userCount);
    
    const apiFeature = new APIFeatures(
      userModel.find().sort({ createdAt: -1 }),
      req.query
    ).search("name");
  
    let users = await apiFeature.query;
    console.log("users", users);
    let filteredUserCount = users.length;
    if (req.query.resultPerPage && req.query.currentPage) {
      apiFeature.pagination();
  
      console.log("filteredUserCount", filteredUserCount);
      users = await apiFeature.query.clone();
    }
    console.log("users", users);
    res.status(200).json({ users, userCount, filteredUserCount });
  };

  const adminLogin =  async (req,res) => {

    console.log(req.body);
          
    const {email,password} = req.body;
     
    try{
      
        const user = await userModel.findOne({email});
        if(!user)
        {
            return res.status(401).json({
                message : 'Invalid credential'
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch)
        {
            return res.status(401).json({
                message : 'password does not match'
            })
        }
        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '10h' });
        return res.status(200).json({
            user : user,
            token : token,
            message : 'user login successfully'
        })
    }
    catch(error)
    {
         
         return res.status(500).json({
            message : 'An error occured while login',
            error : error.message
         })
    }

  }

  const getUser = async(req,res) => {

    const { id } = req.params;
    console.log("get user", id);
    const user = await userModel.findById(id);
  
    if (!user) return next(new ErrorHandler("User not found.", 404));
  
    res.status(200).json({ user });

  }
  deleteUser = async (req, res, next) => {
    const { id } = req.params;
    const user = await userModel.findOneAndDelete({ _id: id });
  
    if (!user) {
      return next(new ErrorHandler("User Not found", 404));
    }
  

    await user.remove();
  
    res.status(200).json({
      message: "User Deleted Successfully.",
    });
  };

   const getProfile = async (req, res, next) => {

     const userId = '64dcb5b70a1e352017f0f562'
  
    const user = await userModel.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found.", 400));
    }
  
    res.status(200).json({
      user,
    });
  };

   const postSingleImage =async (req, res, next) => {
    const file = req.file;
    // if (!file) return next(new ErrorHandler("Invalid Image", 401));
   
    const results = await s3Uploadv2(file);
    const location = results.Location && results.Location;
    return res.status(201).json({ data: { location } });
  };

  module.exports = {getAllUsers,adminLogin, getUser,deleteUser,getProfile, postSingleImage};