const express = require("express")
const { getAllQuiz, getAllCategories, getAllQuizesCat, getQuizData } = require("../controllers/quizController")

const router = express.Router();

router.get("", getAllQuiz);
router.get("/categories", getAllCategories)
router.get("/categories/:catId", getAllQuizesCat)
router.get("/game/:quizId", getQuizData)

module.exports = router;
