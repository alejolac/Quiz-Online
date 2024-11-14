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

// AGREGAR CATEGORIA
const addCategories = async (req, res) => {
    const categorieData = req.body

    if (!categorieData.name) {
        return res.status(400).json({ success: false, message: "Se necesita un nombre para la categoria" });
    }

    try {
        const validationQuery = "SELECT * FROM categories where name = $1"
        const userResult = await pool.query(validationQuery, [categorieData.name]);

        if (userResult.rows.length >= 1) {
            return res.status(409).json({ error: "La categoria ya esta registrada" })
        }

        const query = "INSERT into categories (name, description) VALUES ($1, $2) RETURNING *"
        const values = [categorieData.name, categorieData.description || ""];

        const result = await pool.query(query, values)
        if (result.rows.length > 0) {
            res.status(201).json({
                success: true,
                message: "Registro de categoria exitoso",
                content: result.rows[0]
            });
        } else {
            res.status(500).json({ success: false, message: "Error en el registro" });
        }
    } catch (err) {
        console.error("Error al hacer la consulta", err.stack);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}

// REGISTRO DE QUIZ
const addQuiz = async (req, res) => {
    const bodyData = req.body;

    if (!bodyData.quiz.name) {
        return res.status(400).json({ success: false, message: "El titulo del quiz es requerido" });
    }
    const client = await pool.connect();  // Adquirimos un cliente para la transacción

    try {
        await client.query('BEGIN'); // Iniciamos la transacción

        // Validamos si ya existe un quiz con el mismo nombre
        const validationQuery = "SELECT * FROM quizzes WHERE name = $1";
        const userResult = await client.query(validationQuery, [bodyData.quiz.name]);

        if (userResult.rows.length >= 1) {
            return res.status(409).json({ error: "Ya hay un quiz con ese nombre" });
        }

        // Insertamos el quiz
        const query = "INSERT INTO quizzes (name, description, user_id) VALUES ($1, $2, $3) RETURNING *";
        const values = [bodyData.quiz.name, bodyData.quiz.description || "", 1];
        const result = await client.query(query, values);

        const quizId = result.rows[0].id; // ID del quiz recién creado

        // Verificamos si se proporciona un ID de categoría
        if (!bodyData.categories.id) {
            return res.status(400).json({ success: false, message: "El ID de la categoría es requerido" });
        }

        // Insertamos la relación entre quiz y categoría
        const queryCatQuiz = "INSERT INTO categories_quizzes (quiz_id, category_id) VALUES ($1, $2) RETURNING *";
        const resultCatQuiz = await client.query(queryCatQuiz, [quizId, bodyData.categories.id]);

        // Si ambas inserciones fueron exitosas, hacemos commit

        if (!bodyData.questions || bodyData.questions.length === 0) {
            return res.status(400).json({ success: false, message: "Se necesita al menos una pregunta" });
        }

        const queryQuestion = "INSERT INTO questions (quiz_id, content) VALUES ";
        const questionValues = bodyData.questions.map(q => [quizId, q.content]);

        // Crear la parte de la consulta con el formato adecuado
        const queryString = questionValues
            .map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
            .join(", ");

        // Aplanar el arreglo de valores para que coincidan con los parámetros de la consulta
        const queryParams = questionValues.flat();
        const resultQuestions = await client.query(queryQuestion + queryString + " RETURNING *", queryParams);

        if (!bodyData.questions[0].answers || bodyData.questions[0].answers.length === 0) {
            return res.status(400).json({ success: false, message: "Se necesita al menos una respuesta" });
        }

        const queryAnswers = "INSERT INTO answers (question_id, content, id_correct) VALUES "

        console.log(resultQuestions.rows);
        for (const val of resultQuestions.rows) {
            
        }



        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: "Quiz y categoría registrados con éxito",
            content: {
                quiz: result.rows[0],
                category_quiz: resultCatQuiz.rows[0],
                questions: resultQuestions.rows
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');  // Si ocurre algún error, hacemos rollback
        console.error("Error al hacer la consulta", err.stack);
        res.status(500).json({ error: "Error interno del servidor" });
    } finally {
        client.release();  // Liberamos el cliente después de terminar
    }
};


module.exports = { getAllQuiz, getAllCategories, getAllQuizesCat, getQuizData, addCategories, addQuiz };