const User = require('../Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendSms } = require('../twilio'); // Assure-toi d'importer la fonction d'envoi SMS

// Fonction d'inscription (Sign Up)
exports.signUp = async (req, res) => {
  const { firstName, lastName, email } = req.body;

  logger.info(`Tentative d'inscription de l'utilisateur: ${email}`);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Utilisateur déjà existant avec cet email: ${email}`);
      return res.status(400).json({ message: 'Utilisateur déjà existant avec cet email.' });
    }

    const newUser = new User({ firstName, lastName, email, password: req.body.password });
    await newUser.save();
    logger.info(`Utilisateur créé avec succès: ${email}`);

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: { id: newUser._id, firstName, lastName, email },
    });
  } catch (err) {
    logger.error('Erreur lors de la création de l\'utilisateur:', err.message);
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error: err.message });
  }
};

// Fonction de connexion (Sign In)
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect.' });
    }

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

// Fonction de connexion par email
exports.signInWithEmail = async (req, res) => {
  const { email, password } = req.body;

  logger.info(`Tentative de connexion avec l'email: ${email}`);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Utilisateur non trouvé pour l'email: ${email}`);
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    const isMatch = await bcrypt.compare(password, user.password); // Comparer le mot de passe avec bcrypt
    if (!isMatch) {
      logger.warn(`Mot de passe incorrect pour l'email: ${email}`);
      return res.status(400).json({ message: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    logger.info(`Connexion réussie pour l'email: ${email}`);
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
    logger.error('Erreur lors de la connexion avec l\'email:', err.message);
    res.status(500).json({ message: 'Erreur lors de la connexion', error: err.message });
  }
};

// Fonction pour demander la mise à jour du mot de passe
exports.requestPasswordUpdate = async (req, res) => {
  const { email, phoneNumber } = req.body; // On suppose que l'email et le numéro de téléphone sont fournis

  logger.info(`Demande de mise à jour du mot de passe pour l'utilisateur: ${email}`);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Utilisateur non trouvé pour l'email: ${email}`);
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    // Générer un code de vérification aléatoire
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Code à 6 chiffres
    user.verificationCode = verificationCode; // Ajoute le code au document de l'utilisateur
    await user.save();

    // Envoyer le code par SMS
    await sendSms(phoneNumber, `Votre code de vérification pour la mise à jour du mot de passe est: ${verificationCode}`);
    
    logger.info(`Code de vérification envoyé à ${phoneNumber}`);
    res.status(200).json({ message: 'Code de vérification envoyé.' });
  } catch (err) {
    logger.error('Erreur lors de la demande de mise à jour du mot de passe:', err.message);
    res.status(500).json({ message: 'Erreur lors de la demande de mise à jour du mot de passe', error: err.message });
  }
};

// Fonction pour mettre à jour le mot de passe
exports.updatePassword = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  logger.info(`Tentative de mise à jour du mot de passe pour l'utilisateur: ${email}`);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Utilisateur non trouvé pour l'email: ${email}`);
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    // Vérifier le code de vérification
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Code de vérification incorrect.' });
    }

    // Mettre à jour le mot de passe
    user.password = await bcrypt.hash(newPassword, 10); // Hachage du nouveau mot de passe
    user.verificationCode = null; // Réinitialiser le code de vérification
    await user.save();

    logger.info(`Mot de passe mis à jour avec succès pour l'utilisateur: ${email}`);
    res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
  } catch (err) {
    logger.error('Erreur lors de la mise à jour du mot de passe:', err.message);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe', error: err.message });
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
    
    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà dans votre liste d\'amis.' });
    }

    user.friends.push(friendId);
    await user.save();

    const friend = await User.findById(friendId);
    if (friend) {
      friend.notifications.push({ message: `${user.firstName} a envoyé une demande d'ami.`, read: false });
      await friend.save();
    }

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
  
    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'Aucune demande d\'ami trouvée.' });
    }
  
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
    const user = await User.findById(req.params.id).select('-password');
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
  
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.image = image || user.image;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;
    user.age = age || user.age;
    user.email = email || user.email;
  
    await user.save();
  
    res.status(200).json({ message: 'Profil mis à jour avec succès', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error: err.message });
  }
};

// Fonction pour obtenir les notifications d'un utilisateur
exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('notifications');
    res.status(200).json(user.notifications);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications', error: err.message });
  }
};
