// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
//const { login } = require('../controllers/authController');
const { login, verifyPassword } = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


// Ruta para login
router.post('/login', login);

// Exportar router
module.exports = router;