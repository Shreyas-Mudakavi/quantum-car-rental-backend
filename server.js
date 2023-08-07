const express = require('express');
const app = express();
// require('dotenv').config();
const connectDB =   require('./config/db')
connectDB();
const Port = process.env.PORT||5000;


app.listen(Port, ()=>{
    console.log(`server is listening on Port ${Port}`);
})