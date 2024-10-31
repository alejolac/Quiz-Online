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

    if (catId === undefined) {
        return res.status(400).json({ success: false, message: "El ID de la categoría es requerido" });
    }

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

const getQuizData = async (req, res) => {
    const { quizId } = req.params 

    if (quizId === undefined) {
        return res.status(400).json({ success: false, message: "El ID del quiz es requerido" });
    }

    try {
        const query = `
            SELECT 
                q.id AS question_id, 
                q.content AS question_content, 
                a.id AS answer_id, 
                a.content AS answer_content, 
                a.is_correct
            FROM 
                questions AS q
            JOIN 
                answers AS a ON q.id = a.question_id
            WHERE 
                q.quiz_id = $1;
        `;
        const result = await pool.query(query, [quizId]);

        if (result.rows.length == 0) {
            return res.status(404).json({ success: false, message: "No existe un quiz con ese ID" })
        }
        const questions = result.rows.reduce((acc, row) => {
            const { question_id, question_content, answer_id, answer_content, is_correct } = row;
            
            // Busca si la pregunta ya está en el array de resultado
            let question = acc.find(q => q.question_id === question_id);

            // Si la pregunta no existe en el array, la crea y agrega la primera respuesta
            if (!question) {
                question = {
                    question_id,
                    question_content,
                    answers: []
                };
                acc.push(question);
            }

            // Agrega la respuesta actual a la lista de respuestas de la pregunta
            question.answers.push({
                answer_id,
                answer_content,
                is_correct
            });

            return acc;
        }, []);

        res.status(200).json({ success: true, message: questions })

    } catch (err) {
        console.error("Error al hacer la consulta", err.stack);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

module.exports = { getAllQuiz, getAllCategories, getAllQuizesCat, getQuizData };