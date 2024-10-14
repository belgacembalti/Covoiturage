const express = require('express');
const { 
  postCovoiturage, 
  updateCovoiturage, 
  deleteCovoiturage, 
  getCovoiturage, 
  getAllCovoiturages 
} = require('../Controllers/covoiturageController');
const authMiddleware = require('../Middleware/authMiddleware'); // Middleware pour vérifier l'authentification

const router = express.Router();
// Route pour poster un nouveau covoiturage (POST)
router.post('/', authMiddleware, postCovoiturage); 

// Route pour mettre à jour un covoiturage existant (PUT)
router.put('/:id', authMiddleware, updateCovoiturage); 

// Route pour supprimer un covoiturage (DELETE)
router.delete('/:id', authMiddleware, deleteCovoiturage); 

// Route pour voir les détails d'un covoiturage (GET)
router.get('/:id', getCovoiturage); 

// Route pour voir tous les covoiturages disponibles (GET)
router.get('/', getAllCovoiturages); 
module.exports = router;
