const carModel = require('../Model/Cars');

const addCar = async(req,res) => {

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
            error : error.message
         })
    }

}

const getCar = async(req,res) => {
     
    try{
       
         const cars = await carModel.find({}).sort({ price: 1 });
         
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
        // console.log(error);
        return res.status(500).json({
            message : 'An error occured while fetching the car',
            error : error.message
        })
    }
}

const findCarDetails = async(req,res) =>{

         
         
         try{
           
            const carId = req.query.id;
            const car = await carModel.findById(carId);
             if(!car)
             {
                return res.status(404).json({
                    message : 'car with this id does not exist'
                })
             }
             return res.status(200).json({
                message : 'car fetched successfully',
                car : car
             })
         }
         catch(error)
         {
            //  console.log(error.message);
             return res.status(500).json({
                message : 'An error occured while fetching the car',
                error : error.message
             })
         }
}

const updateCar = async(req,res) => {
    
    console.log(req.body);
    const carId = req.query.carId;
    try{
      
        const updatedCar = await carModel.findByIdAndUpdate(carId, req.body,{
            new : true,
            runValidators: true,  
        })
      if(!updateCar)
      {
         return res.status(404).json({
            message : 'did not find the car'
         })
      }

      return res.status(200).json({
        message : 'car updated successfullt',
        car : updatedCar
      })

    }
    catch(err)
    {
          return res.status(500).json({
            message : 'An error occured while updating the car',
            error : err 
          })
    }
}

module.exports = {addCar,getCar,findCarDetails};