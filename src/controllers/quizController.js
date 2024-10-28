const pool = require('../config/db');

const getAllQuiz = async (req, res) => {
    try {
        const query = "SELECT * FROM quizzes"
        const result = await pool.query(query);

        if (result.rows.length == 0) {
            return res.status(404).json({ success: false, message: "No hay quizes ingresados" })
        }

        res.status(200).json({ success: true, message: result.rows })

    } catch (err) {
        console.error("Error al hacer la consulta", err.stack);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

const getAllCategories = async (req, res) => {
    try {
        const query = "SELECT * FROM categories"
        const result = await pool.query(query);

        if (result.rows.length == 0) {
            return res.status(404).json({ success: false, message: "No hay categorias ingresadas" })
        }

        res.status(200).json({ success: true, message: result.rows })

    } catch (err) {
        console.error("Error al hacer la consulta", err.stack);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

const getAllQuizesCat = async (req, res) => {
    const { catId } = req.params 

    try {
        const query = `
        SELECT q.*
        FROM quizzes AS q
        JOIN categories_quizzes AS cq ON q.id = cq.quiz_id
        JOIN categories AS c ON c.id = cq.category_id
        WHERE c.id = $1
        `;
        const result = await pool.query(query, [catId]);

        if (result.rows.length == 0) {
            return res.status(404).json({ success: false, message: "No hay quizes de esa categoria" })
        }

        res.status(200).json({ success: true, message: result.rows })

    } catch (err) {
        console.error("Error al hacer la consulta", err.stack);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

module.exports = { getAllQuiz, getAllCategories, getAllQuizesCat };