const express = require("express");
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");

const app = express();
app.use(express.json());

// RUTAS DE AUTENTICACION DE USUARIOS
app.use("/api/auth", authRoutes);

// RUTAS DE LOGICA DE QUIZ
app.use("/api/quiz", quizRoutes);

// RUTAS PRINCIPAL
app.get("/", (req, res) => {
    res.send("¡Hola, bienvenido a la ruta principal!");
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).send("Ruta no encontrada");
});

module.exports = app;
