const Covoiturage = require('../Models/Covoiturage'); // Assurez-vous que le chemin est correct
const User = require('../Models/User'); // Pour la gestion des utilisateurs

// Fonction pour qu'un utilisateur poste un covoiturage
exports.postCovoiturage = async (req, res) => {
  const { startTime, startAddress, endAddress, cost, date, availableSeats, vehicle, vehicleType } = req.body;
  const userId = req.user.id; // Supposons que le middleware d'authentification renvoie l'ID de l'utilisateur connecté

  try {
    // Vérifier si l'utilisateur existe
    const driver = await User.findById(userId);
    if (!driver) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Créer un nouveau trajet de covoiturage
    const newCovoiturage = new Covoiturage({
      startTime,
      startAddress,
      endAddress,
      cost,
      date,
      availableSeats,
      vehicle,
      vehicleType,
      driver: userId, // L'utilisateur connecté devient le conducteur
    });

    // Sauvegarder le trajet
    await newCovoiturage.save();

    res.status(201).json({
      message: 'Covoiturage créé avec succès',
      covoiturage: newCovoiturage
    });
  } catch (err) {
    console.error('Erreur lors de la création du covoiturage:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
