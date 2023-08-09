const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    name : {
        type : String,
        require: true 
    },
    details : {
        type : String,
        required : true
    },
    price : {
        type : Number
    },
    booked : {
        type : Boolean,
        default : false
    },
    image : {
        type : String
    },
    model : {
        type : String
    },
    noOfSeat : {
        type : Number
    }

})

const carModel = mongoose.model('carModel',carSchema);
module.exports = carModel;