const express = require("express")
const { getAllQuiz, getAllCategories, getAllQuizesCat, getQuizData, addCategories, addQuiz } = require("../controllers/quizController")

const router = express.Router();

router.get("", getAllQuiz);
router.get("/categories", getAllCategories)
router.get("/categories/:catId", getAllQuizesCat)
router.get("/game/:quizId", getQuizData)
router.post("/add/categories", addCategories)
router.post("/add/quiz", addQuiz)

module.exports = router;
