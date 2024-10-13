const mongoose = require('mongoose');

const covoiturageSchema = new mongoose.Schema({
  startTime: { type: String, required: true },  // Heure de début (ex: '14:00')
  startAddress: { type: String, required: true }, // Adresse de départ
  endAddress: { type: String, required: true },   // Adresse de destination
  cost: { type: Number, required: true },       // Coût du trajet
  date: { type: Date, required: true },         // Date du trajet
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Référence à l'utilisateur (conducteur)
  passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Liste des passagers
  availableSeats: { type: Number, required: true, min: 1 },  // Nombre de places disponibles
  vehicle: { // Informations sur le véhicule
    model: { type: String, required: true },   // Modèle du véhicule
    brand: { type: String, required: true },   // Marque du véhicule
    plateNumber: { type: String, required: true }, // Numéro d'immatriculation
    color: { type: String }                    // Couleur du véhicule (optionnel)
  },
  vehicleType: { // Type de véhicule
    type: String,
    enum: ['car', 'motorcycle', 'bicycle', 'scooter', 'truck'], // Types de véhicule disponibles
    required: true
  }
});

module.exports = mongoose.model('Covoiturage', covoiturageSchema);
