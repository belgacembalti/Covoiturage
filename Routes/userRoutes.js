const express = require('express');
const { signUp, signIn, getAllUsers, addFriend, acceptFriend, getUserProfile, updateProfile } = require('../Controllers/userController');
const authMiddleware = require('../Middleware/authMiddleware'); // Assure-toi que le middleware est bien défini

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.get('/', authMiddleware, getAllUsers); // Voir tous les utilisateurs
router.post('/add-friend', authMiddleware, addFriend); // Ajouter un ami
router.post('/accept-friend', authMiddleware, acceptFriend); // Accepter une demande d'ami
router.get('/profile/:id', authMiddleware, getUserProfile); // Voir le profil
router.put('/update-profile', authMiddleware, updateProfile); // Mettre à jour le profil

module.exports = router;
