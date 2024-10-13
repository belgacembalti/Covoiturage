const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./Routes/userRoutes'); // Assure-toi que le chemin est correct
const covoiturageRoutes = require('./Routes/covoiturageRoutes'); 

// Charger les variables d'environnement
dotenv.config(); 

// Créer une instance de l'application Express
const app = express();
app.use(express.json()); // Pour parser le JSON

// Vérifier que l'URI MongoDB est chargé
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Connexion à MongoDB sans les options dépréciées
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Utiliser les routes
app.use('/api/users', userRoutes); // Assure-toi que c'est bien le routeur qui est utilisé
app.use('/api/covoiturage', covoiturageRoutes); // Assure-toi que c'est bien le routeur qui est utilisé

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
