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
    image : {
        type : String
    },
    model : {
        type : String
    },
    noOfSeat : {
        type : Number
    },
    rating : {
        type : Number
    },
    speed : {
        type : String
    },
    gps : {
        type : String
    },
    seatType : {
        type : String
    },
    automatic : {
        type : String
    }

})

const carModel = mongoose.model('carModel',carSchema);
module.exports = carModel;