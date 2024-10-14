const mongoose = require('mongoose');

// Définition du schéma utilisateur
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  image: { type: String },
  phoneNumber: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^\+?[0-9]{7,15}$/.test(v); // Validation basique pour les numéros de téléphone
      },
      message: props => `${props.value} n'est pas un numéro de téléphone valide!`
    }
  },
  address: { type: String, required: true },
  cin: { type: String, required: true, unique: true }, 
  age: { 
    type: Number, 
    required: true,
    min: 18 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: /.+\@.+\..+/ 
  },
  password: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ratings: [
    {
      rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      stars: { type: Number, min: 1, max: 5, required: true },
      comment: { type: String },
      date: { type: Date, default: Date.now }
    }
  ],
  notifications: [
    {
      message: { type: String, required: true },
      covoiturageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Covoiturage' },
      read: { type: Boolean, default: false },
      date: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true }); // Ajout des timestamps

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

// Exporter le modèle
module.exports = mongoose.model('User', userSchema);
