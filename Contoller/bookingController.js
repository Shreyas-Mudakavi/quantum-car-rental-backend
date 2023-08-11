const bookingModel = require('../Model/Booking');
const carModel = require('../Model/Cars');

const bookCar = async (req,res) => {

    const {carId,userId,startDate,endDate,startTime,endTime} = req.body
    try{
         
        const startDateTime = new Date(startDate + 'T' + startTime + 'Z');
        const endDateTime = new Date(endDate + 'T' + endTime + 'Z');
        
        const booked_car = await bookingModel.find({
            car: carId,
            $or: [
                { 
                    $and: [
                        { startDate: { $lt: startDateTime } },   
                        { endDate: { $gte: startDateTime } }
                    ]
                },
                { 
                    $and: [
                        { startDate: { $lt: endDateTime } },    
                        { endDate: { $gte: endDateTime } }
                    ]
                },
                {
                    $and: [
                        { startDate: { $gt: startDateTime } },    
                        { endDate: { $lt: endDateTime } }
                    ]
                }
            ]
        });

        console.log(booked_car);
             if(booked_car.length!==0)
             {
                 return res.status(400).json({
                    message : 'car is already booked'
                 })
             }
             const booking = new bookingModel({
                car : carId,
                user : userId,
                startDate : startDateTime,
                endDate : endDateTime
             })
             const new_car = await booking.save();
             return res.status(200).json({
                message : 'car booked successfully',
                newCar : new_car
             })
    }
        
    catch(error){
       
        console.log(error);
        return res.status(500).json({
            message : "An error occured while booking an car",
            error : error   
        })
    }

}

const getAvailableCar = async (req,res) => {

    const {startDate,endDate, fromAddress, toAddress,startTime,endTime} = req.body;
    console.log(req.body)
    try{

        const startDateTime = new Date(startDate + 'T' + startTime + 'Z');
        const endDateTime = new Date(endDate + 'T' + endTime + 'Z');
        
        const overlappingBookings = await bookingModel.find({
            $or: [
                { 
                    $and: [
                        { startDate: { $lt: startDateTime } },   
                        { endDate: { $gte: startDateTime } }
                    ]
                },
                { 
                    $and: [
                        { startDate: { $lt: endDateTime } },    
                        { endDate: { $gte: endDateTime } }
                    ]
                },
                {
                    $and: [
                        { startDate: { $gt: startDateTime } },    
                        { endDate: { $lt: endDateTime } }
                    ]
                }
            ]
        });
        // console.log(overlappingBookings);
        const bookedCarIds = overlappingBookings.map(booking => booking.car);
        //  console.log(bookedCarIds);
        const availableCars = await carModel.find({
            _id: { $nin: bookedCarIds }
        });

        res.status(200).json({
            message: 'Available cars fetched successfully',
            availableCars: availableCars
        });
    }
    catch(error)
    {
        return res.status(500).json({
            message : 'An error occured while fetching non booked car',
            error : error 
        })
    }

}

module.exports = {bookCar,getAvailableCar}