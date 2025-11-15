const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Generare JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

// ============================
// REGISTER - Înregistrare utilizator nou
// ============================
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Numele trebuie să aibă minim 2 caractere'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalid'),
  body('password').isLength({ min: 6 }).withMessage('Parola trebuie să aibă minim 6 caractere')
], async (req, res) => {
  try {
    // Verifică validarea
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: errors.array()[0].msg 
      });
    }

    const { name, email, password } = req.body;

    // Verifică dacă email-ul există deja
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email-ul este deja înregistrat' 
      });
    }

    // Creează utilizatorul
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generează token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Cont creat cu succes!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      message: 'Eroare la crearea contului' 
    });
  }
});

// ============================
// LOGIN - Autentificare utilizator
// ============================
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email invalid'),
  body('password').notEmpty().withMessage('Parola este obligatorie')
], async (req, res) => {
  try {
    // Verifică validarea
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: errors.array()[0].msg 
      });
    }

    const { email, password } = req.body;

    // Găsește utilizatorul (include parola pentru comparație)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Email sau parolă incorectă' 
      });
    }

    // Verifică dacă contul este activ
    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Contul tău este dezactivat' 
      });
    }

    // Verifică parola
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Email sau parolă incorectă' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generează token
    const token = generateToken(user._id);

    res.json({
      message: 'Autentificare reușită!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Eroare la autentificare' 
    });
  }
});

// ============================
// GET PROFILE - Obține profilul utilizatorului autentificat
// ============================
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Neautentificat' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ 
        message: 'Utilizator negăsit' 
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(401).json({ 
      message: 'Token invalid' 
    });
  }
});

// ============================
// UPDATE PROFILE - Actualizare profil
// ============================
router.put('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Neautentificat' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }

    const { name, email } = req.body;

    if (name) user.name = name;
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ 
          message: 'Email-ul este deja folosit' 
        });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      message: 'Profil actualizat cu succes!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Eroare la actualizare profil' });
  }
});

// ============================
// CHANGE PASSWORD - Schimbare parolă
// ============================
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Parola curentă este obligatorie'),
  body('newPassword').isLength({ min: 6 }).withMessage('Noua parolă trebuie să aibă minim 6 caractere')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Neautentificat' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }

    const { currentPassword, newPassword } = req.body;

    // Verifică parola curentă
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Parola curentă este incorectă' });
    }

    // Setează noua parolă
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Parolă schimbată cu succes!' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Eroare la schimbarea parolei' });
  }
});

module.exports = router;
