const express = require("express");
const router = express.Router();
const { getLocation } = require("../Contoller/locationController");

router.get("/get-locations", getLocation);

module.exports = router;
