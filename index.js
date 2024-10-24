const { Pool } = require('pg');

require ("dotenv").config()

const connectionString = process.env.CONNECTION_STRING

const pool = new Pool({
    connectionString: connectionString,
})

pool.connect()
  .then(() => {
    console.log('Conectado a la base de datos');
  })
  .catch(err => console.error('Error conectando a la base de datos', err.stack));

pool.query("SELECT * FROM answers")
  .then(res => {
    console.log(res.rows)
  })
  .catch(err => console.error("Error al hacer la consulta", err.stack))