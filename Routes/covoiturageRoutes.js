const express = require('express');
const { postCovoiturage } = require('../Controllers/covoiturageController');
const authMiddleware = require('../Middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, postCovoiturage); // Associer le middleware d'authentification ici

module.exports = router;
