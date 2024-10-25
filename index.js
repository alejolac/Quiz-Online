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
pool.connect()
  .then(() => {
    console.log('Conectado a la base de datos');
  })
  .catch(err => console.error('Error conectando a la base de datos', err.stack));


app.get("/", (req, res) => {
  res.send('¡Hola, bienvenido a la ruta principal!');
})

app.post("/login", (req, res) => {
  const {username, password} = req.body  

  const query = "SELECT * FROM username where name = $1 AND password = $2"
  const values = [username, password]

  pool.query(query, values)
    .then(result => {
      if (result.rows.length > 0) {
        res.json({ success: true, message: "inicio de sesion exitoso"})
      } else {
        res.status(401).json({ success: false, message: "Usuario o contraseña incorrecto"})
      }
    
    })
    .catch(err => {
      console.error("Error al hacer la consulta", err.stack);
      res.status(500).json({ error: "Error interno del servidor" });
    });
})

app.post("/signin", async (req, res) => {
  const {username, email, password} = req.body

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = "INSERT INTO username(name, mail, password) VALUES($1, $2, $3) RETURNING *"
    const values = [username, email, hashedPassword]

    const result = await pool.query(query, values)
    if (result.rows.length > 0) {
      res.json({ success: true, message: "Registro de usuario exitoso" });
    } else {
      res.status(401).json({ success: false, message: "Error en el registro" });
    }
  }
  catch(err) {
    console.error("Error al hacer la consulta", err.stack);
    res.status(500).json({ error: "Error interno del servidor" });
  }
})

app.use((req, res) => {
  res.status(404).send("Ruta no encontrada")
})

pool.query("SELECT * FROM username")
    .then(res => {
      console.log(res.rows)
    })
    .catch(err => console.error("Error al hacer la consulta", err.stack))

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


