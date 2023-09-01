const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const { addQuery } = require("../Contoller/queryController");

router.post("/post-query", addQuery);

module.exports = router;
