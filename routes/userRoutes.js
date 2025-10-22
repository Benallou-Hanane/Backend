const express = require("express");
const router = express.Router();
const { submitUser } = require("../controllers/userController");

router.post("/submit", submitUser); 

module.exports = router;
