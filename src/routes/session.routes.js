import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../config/passport.config.js';
import User from '../models/user.model.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    
    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'El usuario ya existe' });
    
    const newUser = new User({ first_name, last_name, email, age: parseInt(age), password });
    await newUser.save();
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role
      }
    });
    
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'El email ya está registrado' });
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', 
  passport.authenticate('login', { session: false }), 
  async (req, res) => {
    try {
      const token = generateToken(req.user);
      
      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: req.user._id,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
          role: req.user.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get('/current', 
  passport.authenticate('current', { session: false }),
  (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Token inválido o expirado' });
      
      res.json({
        user: {
          id: req.user._id,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
          age: req.user.age,
          role: req.user.role,
          cart: req.user.cart
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;