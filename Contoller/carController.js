const carModel = require("../Model/Cars");

const addCar = async (req, res) => {
  try {
    const carData = req.body;
    const new_car = new carModel(carData);
    const saved_car = await new_car.save();
    return res.status(201).json({
      message: "new car is created",
      car: saved_car,
    });
  } catch (error) {
    return res.staus(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

const getCar = async (req, res) => {
  try {
    let cars;
    if (req.query.sort === "low") {
      cars = await carModel.find({}).sort({ price: 1 });
    }

    if (req.query.sort === "high") {
      cars = await carModel.find({}).sort({ price: -1 });
    }

    if (!cars || cars.length === 0) {
      return res.staus(400).json({
        message: "No cars found!",
      });
    }
    // if(req.query.sort === 'desc')
    // {
    //     cars.reverse();
    // }
    res.status(200).json({
      message: "here is all car",
      cars: cars,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      message: "An error occured while fetching the car",
      error: error.message,
    });
  }
};

const findCarDetails = async (req, res) => {
  try {
    const carId = req.params.id;
    const car = await carModel.findById(carId);
    if (!car) {
      return res.status(404).json({
        message: "Car not found!",
      });
    }
    console.log(car);
    res.status(200).json({
      message: "car fetched successfully",
      car: car,
    });
  } catch (error) {
    //  console.log(error.message);
    res.status(500).json({
      message: "An error occured while fetching the car",
      error: error.message,
    });
  }
};

module.exports = { addCar, getCar, findCarDetails };
