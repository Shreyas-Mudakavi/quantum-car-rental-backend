const express = require('express');
const app = express();
// require('dotenv').config();
const connectDB =   require('./config/db')
const cors = require('cors')
connectDB();
const Port = process.env.PORT||5000;

app.use(express.json());
const userRouter = require('./Router/userRouter');
const carRoute = require('./Router/carRoute');
const bookingModel = require('./Model/Booking');
// console.log(bookingModel);
app.use(cors());

app.use('/api/user',userRouter);
app.use('/api/car',carRoute);


app.listen(Port, ()=>{
    console.log(`server is listening on Port ${Port}`);
})