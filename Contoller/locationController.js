const locationModel = require('../Model/Location');



const addLocation = async (req, res) => {
  const { location } = req.body;
  
  try {
    const queryType = req.query.type;

    let locationDoc = await locationModel.findOne();

    if (!locationDoc) {
      locationDoc = new locationModel();
    }

    if (queryType === 'pickup') {
      locationDoc.pickupLocations.push(location);
    } else if (queryType === 'dropoff') {
      locationDoc.dropOffLocations.push(location);
    } else {
      return res.status(400).json({ message: 'Invalid query type' });
    }

    await locationDoc.save();
     
    return res.status(200).json({ message: 'Location added successfully', locations : locationDoc });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
};

const getLocation = async(req,res) => {

    try{
    
        const locations = await locationModel.findOne({});
        if(!locations)
        {
            return res.status(404).json({
                message : 'no such model found'
            })
        }
        return res.status(200).json({ message: 'all your location', pickupLocations : locations.pickupLocations , dropOffLocations : locations.dropOffLocations });
    }
    catch(error)
    {
        return res.status(500).json({
            message : 'An error occured while fetching the location',
            error : error.message
        })
    }
}

module.exports = {addLocation , getLocation};
