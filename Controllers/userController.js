const User = require('../Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fonction d'inscription (Sign Up)
exports.signUp = async (req, res) => {
  const { firstName, lastName, image, phoneNumber, address, cin, age, email, password } = req.body;
  
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Utilisateur déjà existant avec cet email.' });
    }

    // Créer un nouvel utilisateur
    const newUser = new User({
      firstName,
      lastName,
      image,
      phoneNumber,
      address,
      cin,
      age,
      email,
      password, // Le mot de passe sera automatiquement haché grâce au pre-save dans le modèle
    });

    // Sauvegarder l'utilisateur
    await newUser.save();

    // Générer un token JWT
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error: err.message });
  }
};

// Fonction de connexion (Sign In)
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    // Comparer le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect.' });
    }

    // Générer un token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: err.message });
  }
};

// Fonction pour voir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select('-password'); // On exclut le mot de passe
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: err.message });
    }
  };

  
  // Fonction pour envoyer une demande d'ami
exports.addFriend = async (req, res) => {
    try {
      const { friendId } = req.body;
      const user = await User.findById(req.userId);
  
      // Vérifier si l'ami est déjà dans la liste d'amis
      if (user.friends.includes(friendId)) {
        return res.status(400).json({ message: 'Cet utilisateur est déjà dans votre liste d\'amis.' });
      }
  
      // Ajouter l'ami à la liste des amis (en attente d'acceptation)
      user.friends.push(friendId);
      await user.save();
  
      res.status(200).json({ message: 'Demande d\'ami envoyée.' });
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de l\'envoi de la demande d\'ami', error: err.message });
    }
  };

  // Fonction pour accepter une demande d'ami
exports.acceptFriend = async (req, res) => {
    try {
      const { friendId } = req.body;
      const user = await User.findById(req.userId);
      const friend = await User.findById(friendId);
  
      // Vérifier si l'ami existe et est dans la liste
      if (!user.friends.includes(friendId)) {
        return res.status(400).json({ message: 'Aucune demande d\'ami trouvée.' });
      }
  
      // Ajouter l'utilisateur à la liste des amis de l'autre utilisateur
      friend.friends.push(user._id);
      await friend.save();
  
      res.status(200).json({ message: 'Demande d\'ami acceptée.' });
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de l\'acceptation de la demande d\'ami', error: err.message });
    }
  };

  // Fonction pour voir le profil d'un utilisateur
exports.getUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password'); // Exclure le mot de passe
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de la récupération du profil', error: err.message });
    }
  };

  // Fonction pour mettre à jour le profil
exports.updateProfile = async (req, res) => {
    try {
      const { firstName, lastName, image, phoneNumber, address, age, email } = req.body;
      const user = await User.findById(req.userId);
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
  
      // Mise à jour des champs
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.image = image || user.image;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.address = address || user.address;
      user.age = age || user.age;
      user.email = email || user.email;
  
      // Sauvegarder les modifications
      await user.save();
  
      res.status(200).json({ message: 'Profil mis à jour avec succès', user });
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error: err.message });
    }
  };
  
