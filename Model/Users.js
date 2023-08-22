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
    city : {
        type : String
    },
    state : {
        type : String
    },
    zip : {
        type : String
    },
    role : {
        type : String,
        default : 'user'
    }

}, {timestamps: true})

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

const userModel = mongoose.model('userModel', userSchema);
module.exports = userModel;