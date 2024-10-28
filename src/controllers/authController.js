const pool = require('../config/db');
const bcrypt = require("bcrypt")

// INICIO DE SESION
const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan datos de usuario o contraseña" })
  }

  try {
    const query = "SELECT * FROM users where email = $1"
    const value = [email];

    const result = await pool.query(query, value);

    if (result.rows.length == 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" })
    }

    const user = result.rows[0]
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    res.json({ success: true, message: "Inicio de sesión exitoso", user: { id: user.id, username: user.name, email: user.email } });
  } catch (err) {
    console.error("Error al hacer la consulta", err.stack);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// REGISTRO DE USUARIOS
const signin = async (req, res) => {
  const { users, email, password } = req.body

  if (!email || !password || !users) {
    return res.status(400).json({ error: "Faltan datos de usuario o contraseña" })
  }

  try {
    const mailQuery = "SELECT * FROM users where email = $1"
    const userResult = await pool.query(mailQuery, [email]);

    if (userResult.rows.length >= 1) {
      return res.status(409).json({ error: "El correo ya esta registrado" })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = "INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING *"
    const values = [users, email, hashedPassword]

    const result = await pool.query(query, values)
    if (result.rows.length > 0) {
      res.status(201).json({
        success: true,
        message: "Registro de usuario exitoso",
        user: result.rows[0]
      });
    } else {
      res.status(500).json({ success: false, message: "Error en el registro" });
    }
  }
  catch (err) {
    console.error("Error al hacer la consulta", err.stack);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { login, signin }; 