const { Client } = require('pg');

require ("dotenv").config()

const connectionString = process.env.CONNECTION_STRING

const client = new Client({
    connectionString: connectionString,
})

client.connect()
  .then(() => {
    console.log('Conectado a la base de datos');
  })
  .catch(err => console.error('Error conectando a la base de datos', err.stack));