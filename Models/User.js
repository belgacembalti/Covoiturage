const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true }, // Prénom
  lastName: { type: String, required: true },  // Nom
  image: { type: String },                     // Image de profil (URL ou base64)
  phoneNumber: { type: String, required: true }, // Numéro de téléphone
  address: { type: String, required: true },     // Adresse
  cin: { type: String, required: true, unique: true }, // Carte d'identité nationale (CIN)
  age: { type: Number, required: true },        // Âge
  email: { type: String, required: true, unique: true }, // Email (unique pour connexion)
  password: { type: String, required: true },   // Mot de passe haché
  
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Liste d'amis
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Liste des utilisateurs favoris
  ratings: [
    {
      rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // L'utilisateur qui note
      stars: { type: Number, min: 1, max: 5, required: true }, // Note en étoiles (1-5)
      comment: { type: String }, // Commentaire optionnel
      date: { type: Date, default: Date.now } // Date de la notation
    }
  ]
});

// Hachage du mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const bcrypt = require('bcrypt');
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Méthode pour comparer le mot de passe
userSchema.methods.comparePassword = async function(password) {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
