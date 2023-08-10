const userModel = require('../Model/Users');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');
const secretKey = process.env.SECRET_KEY
const registerUser = async(req,res) => {

    const {name,email,password,phone} = req.body;
    //  console.log(req.body);
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
           phone  
        })
        const token = jwt.sign({ userId: new_user._id }, secretKey, { expiresIn: '1h' });
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
     console.log(req.body);
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
        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
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


module.exports = {registerUser,loginUser};