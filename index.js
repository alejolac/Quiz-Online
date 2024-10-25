const { Pool } = require('pg');
const express = require("express")
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

app.get("/login", (req, res) => {
  pool.query("SELECT * FROM answers")
    .then(res => {
      console.log(res.rows)
    })
    .catch(err => console.error("Error al hacer la consulta", err.stack))
})

app.use((req, res) => {
  res.status(404).send("Ruta no encontrada")
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});