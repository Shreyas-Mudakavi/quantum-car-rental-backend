
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const secretKey = process.env.SECRET_KEY;
const userModel = require('../Model/Users')

const auth = async (req, res, next) => {
   
   
    try {
      if (!req.headers.authorization) {
        return res.status(401).send({
          error: {
            message: `Unauthorized.Please Send token in request header`,
          },
        });
      }
  
      const { userId } = jwt.verify(
        req.headers.authorization,
        secretKey
      );
     
     
      req.userId = userId;
  
      const userValid = await userModel.find({ _id: userId });
  
      if (!userValid) {
        return res.status(401).send({ error: { message: `Unauthorized` } });
      }
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).send({ error: { message: `Unauthorized` } });
    }
  };

  module.exports = auth;