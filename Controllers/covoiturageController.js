const Covoiturage = require('../Models/Covoiturage');
const User = require('../Models/User');

// Fonction pour qu'un utilisateur poste un covoiturage
exports.postCovoiturage = async (req, res, io) => {
  const { startTime, startAddress, endAddress, cost, date, availableSeats, vehicle, vehicleType } = req.body;
  const userId = req.user.id;

  try {
    const driver = await User.findById(userId);
    if (!driver) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const newCovoiturage = new Covoiturage({
      startTime,
      startAddress,
      endAddress,
      cost,
      date,
      availableSeats,
      vehicle,
      vehicleType,
      driver: userId,
    });

    await newCovoiturage.save();

    // Notifier tous les utilisateurs qu'un nouveau covoiturage a été créé
    io.emit('newCovoiturage', { message: 'Un nouveau covoiturage a été posté', covoiturage: newCovoiturage });

    res.status(201).json({
      message: 'Covoiturage créé avec succès',
      covoiturage: newCovoiturage
    });
  } catch (err) {
    console.error('Erreur lors de la création du covoiturage:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Fonction pour mettre à jour un covoiturage
exports.updateCovoiturage = async (req, res, io) => {
  const covoiturageId = req.params.id;
  const userId = req.user.id;
  const updatedData = req.body;

  try {
    const covoiturage = await Covoiturage.findById(covoiturageId);
    if (!covoiturage) {
      return res.status(404).json({ message: 'Covoiturage non trouvé' });
    }

    if (covoiturage.driver.toString() !== userId) {
      return res.status(403).json({ message: 'Accès refusé. Vous ne pouvez pas modifier ce covoiturage.' });
    }

    Object.assign(covoiturage, updatedData);
    await covoiturage.save();

    // Notifier tous les utilisateurs de la mise à jour du covoiturage
    io.emit('updateCovoiturage', { message: 'Un covoiturage a été mis à jour', covoiturage });

    res.status(200).json({ message: 'Covoiturage mis à jour avec succès', covoiturage });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du covoiturage:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Fonction pour supprimer un covoiturage
exports.deleteCovoiturage = async (req, res, io) => {
  const covoiturageId = req.params.id;
  const userId = req.user.id;

  try {
    const covoiturage = await Covoiturage.findById(covoiturageId);
    if (!covoiturage) {
      return res.status(404).json({ message: 'Covoiturage non trouvé' });
    }

    if (covoiturage.driver.toString() !== userId) {
      return res.status(403).json({ message: 'Accès refusé. Vous ne pouvez pas supprimer ce covoiturage.' });
    }

    await covoiturage.remove();

    // Notifier tous les utilisateurs de la suppression du covoiturage
    io.emit('deleteCovoiturage', { message: 'Un covoiturage a été supprimé', covoiturageId });

    res.status(200).json({ message: 'Covoiturage supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du covoiturage:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Fonction pour voir un covoiturage
exports.getCovoiturage = async (req, res) => {
  const covoiturageId = req.params.id;

  try {
    const covoiturage = await Covoiturage.findById(covoiturageId).populate('driver', 'name email');
    if (!covoiturage) {
      return res.status(404).json({ message: 'Covoiturage non trouvé' });
    }

    res.status(200).json({ covoiturage });
  } catch (err) {
    console.error('Erreur lors de la récupération du covoiturage:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Fonction pour voir tous les covoiturages
exports.getAllCovoiturages = async (req, res) => {
  try {
    const covoiturages = await Covoiturage.find().populate('driver', 'name email');
    res.status(200).json({ covoiturages });
  } catch (err) {
    console.error('Erreur lors de la récupération des covoiturages:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
