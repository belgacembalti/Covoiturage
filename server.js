const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const userRoutes = require('./Routes/userRoutes');
const covoiturageRoutes = require('./Routes/covoiturageRoutes');
const morgan = require('morgan'); // Importer morgan
const winston = require('winston'); // Importer winston

// Charger les variables d'environnement
dotenv.config();

// Créer une instance de l'application Express
const app = express();
app.use(express.json()); // Pour parser le JSON

// Configurer morgan pour le logging des requêtes HTTP
app.use(morgan('combined')); // 'combined' pour des logs plus détaillés

// Créer le serveur HTTP
const server = http.createServer(app);

// Initialiser Socket.IO
const io = socketIo(server);

// Middleware pour rendre io accessible dans les routes
app.use((req, res, next) => {
  req.io = io; // Ajouter l'objet io à la requête
  next();
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Utiliser les routes
app.use('/api/users', userRoutes);
app.use('/api/covoiturage', covoiturageRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
  console.log('Nouvelle connexion Socket.IO:', socket.id);

  socket.on('disconnect', () => {
    console.log('Socket.IO déconnecté:', socket.id);
  });
});
