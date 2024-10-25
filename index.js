const { Pool } = require('pg');
const express = require("express")
const bcrypt = require("bcrypt")
require("dotenv").config()

const app = express();
const PORT = process.env.PORT

const connectionString = process.env.CONNECTION_STRING
const pool = new Pool({
  connectionString: connectionString,
})

app.use(express.json())

app.get("/", (req, res) => {
  res.send('¡Hola, bienvenido a la ruta principal!');
  pool.query("SELECT * FROM username")
    .then(res => {
      console.log(res.rows)
    })
    .catch(err => console.error("Error al hacer la consulta", err.stack))
})

// INICIO DE SESION
app.post("/login", async (req, res) => {
  const { mail, password } = req.body

  if (!mail || !password) {
    return res.status(400).json({ error: "Faltan datos de usuario o contraseña" })
  }

  try {
    const query = "SELECT * FROM username where mail = $1"
    const value = [mail];

    const result = await pool.query(query, value);

    if (result.rows.length == 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" })
    }

    const user = result.rows[0]
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    res.json({ success: true, message: "Inicio de sesión exitoso", user: { id: user.id, name: user.name, email: user.mail } });
  } catch (err) {
    console.error("Error al hacer la consulta", err.stack);
    res.status(500).json({ error: "Error interno del servidor" });
  }
})

// REGISTRO DE USUARIOS
app.post("/signin", async (req, res) => {
  const { username, mail, password } = req.body

  if (!mail || !password || !username) {
    return res.status(400).json({ error: "Faltan datos de usuario o contraseña" })
  }

  try {
    const mailQuery = "SELECT * FROM username where mail = $1"
    const userResult = await pool.query(mailQuery, [mail]);

    if (userResult.rows.length >= 1) {
      return res.status(409).json({ error: "El correo ya esta registrado" })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = "INSERT INTO username(name, mail, password) VALUES($1, $2, $3) RETURNING *"
    const values = [username, mail, hashedPassword]

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
})

app.use((req, res) => {
  res.status(404).send("Ruta no encontrada")
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


