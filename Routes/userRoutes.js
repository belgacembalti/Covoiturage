const express = require('express');
const {
  signUp,
  signIn,
  signInWithEmail,
  getAllUsers,
  addFriend,
  acceptFriend,
  getUserProfile,
  updateProfile,
  getNotifications,
  requestPasswordUpdate, // Nouvelle fonction
  updatePassword // Nouvelle fonction
} = require('../Controllers/userController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn); // Si tu veux garder l'ancienne fonction
router.post('/signin/email', signInWithEmail); // Nouvelle route pour la connexion par email
router.get('/', getAllUsers);
router.post('/friends/add', addFriend);
router.post('/friends/accept', acceptFriend);
router.get('/profile/:id', getUserProfile);
router.put('/profile', updateProfile);
router.get('/notifications', getNotifications);

// Routes pour la mise à jour du mot de passe
router.post('/password/request-update', requestPasswordUpdate); // Route pour demander un code de vérification
router.put('/password/update', updatePassword); // Route pour mettre à jour le mot de passe

module.exports = router;
