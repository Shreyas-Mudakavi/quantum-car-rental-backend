const carModel = require('../Model/Cars');

const addCar = async(req,res) => {

    console.log(req.body);
    try{
        
        const carData = req.body;
        const new_car = new carModel(carData);
       const saved_car = await new_car.save();
       return res.status(201).json({
        message : 'new car is created',
        car : saved_car
       })
    }
    catch(error)
    {
         return res.staus(500).json({
            message : 'internal server error',
            error : error
         })
    }

}

const getCar = async(req,res) => {
    console.log('pankaj');

    try{
       
         const cars = await carModel.find({});
         console.log(cars);
         if(!cars || cars.length === 0)
         {
            return res.staus(400).json({
                message : '',
                cars : cars
            })
         }
         return res.status(200).json({
            message : 'here is all car',
            cars : cars
         })
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            message : 'An error occured while fetching the car',
            error : error
        })
    }
}

module.exports = {addCar,getCar};