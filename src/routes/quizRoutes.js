const express = require("express")
const { getAllQuiz, getAllCategories, getAllQuizesCat } = require("../controllers/quizController")

const router = express.Router();

router.get("", getAllQuiz);
router.get("/categories", getAllCategories)
router.get("/categories/:catId", getAllQuizesCat)

module.exports = router;
