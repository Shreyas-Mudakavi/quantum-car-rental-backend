const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        unique : true,
        trim : true,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true,
    },
    age : {
        type : Number
    },
    address : {
        type : String
    },
    role : {
        type : String,
        enum : ["admin","user"],
        default : 'user'
    }

}, {timestamps: true})

const userModel = mongoose.model('userModel', userSchema);
module.exports = userModel;