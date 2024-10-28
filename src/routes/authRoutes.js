const express = require("express")
const { login, signin } = require("../controllers/authController")

const router = express.Router();

router.post("/login", login);
router.post("/signin", signin);

module.exports = router;
