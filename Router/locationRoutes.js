const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const { getLocation } = require("../Contoller/locationController");

router.get("/get-locations", getLocation);

module.exports = router;
