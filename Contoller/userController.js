const userModel = require('../Model/Users');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');
const secretKey = process.env.SECRET_KEY
const registerUser = async(req,res) => {

    const {name,email,password,phone,role} = req.body;
     console.log(req.body);
     try {
        
        const user = await userModel.findOne({email});
        if(user)
        {
            res.staus(400).json({
                message : 'user with this email already exist'
            })
        }
        // encrypt the password
        const hashPassword =await  bcrypt.hash(password,10);
       
        const new_user = await userModel.create({
            name,
            email,
           password : hashPassword,
           phone ,
           role
        })
        const token = jwt.sign({ userId: new_user._id }, secretKey, { expiresIn: '10h' });
        return res.status(201).json({
            user : new_user,
            token : token,
            message : 'new user created successfully'
        })
     }
     catch(error){
         
        return res.status(500).json({
            error : error.message,
            message : 'internal server error'
        })
     }
}

// api to login user

const loginUser = async (req,res) => {
  
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

const findUser = async(req,res) => {
    
    const userId = req.userId;
 
    try{
   
        const user = await userModel.findById(userId);
         
        if(!user)
        {
            return res.status(400).json({
                message : 'user does not exist with this id',
            })
        }
        return res.status(200).json({
            message : 'user fetched successfully',
            user : user
        })
    }
    catch(error)
    {
        return res.status(500).json({
            message : 'An error occured while fetching a particular user',
            error : error.message
        })
    }
}

const updateUser = async (req,res) => {

    // console.log('update user api is called');

     const userId = req.userId;
    //  console.log(req.body);
    //  const userId = '64d4ab73fb26cd35fd481e79';
    try{

        const updatedUser = await userModel.findByIdAndUpdate(userId, req.body, {
            new: true,  
            runValidators: true,  
        });
        
        if(!updatedUser)
        {
            return res.status(404).json({
                message : 'user does not found'
            })
        }
        return res.status(200).json({
            message : 'user updated successfully',
            user : updatedUser
        })
    }
    catch(error)
    {
        // console.log(error);
        return res.status(500).json({
            message : "An occured while updating the user",
            error : error.message
        })
    }

}


module.exports = {registerUser,loginUser,findUser,updateUser};