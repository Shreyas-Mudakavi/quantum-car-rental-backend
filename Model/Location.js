const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  pickupLocations: [{ type: String }],
  dropOffLocations: [{ type: String }]
});

const locationModel = mongoose.model('locationModel', locationSchema);

module.exports = locationModel;
