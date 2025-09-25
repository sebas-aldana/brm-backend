import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { User } from "../models/index.js";
import logger from "../utils/logger.js";

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Error de validación en registro', {
        errors: errors.array(),
        email: req.body.email
      });
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role, name } = req.body;
    
    logger.info('Iniciando registro de usuario', { email, role: role || 'cliente' });
    
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      logger.warn('Intento de registro con email existente', { email });
      return res.status(400).json({ 
        message: "El correo electrónico ya está en uso" 
      });
    }

    const user = await User.create({
      ...req.body,
      role: role || "cliente",
    });

    logger.info('Usuario registrado exitosamente', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return res.status(201).json({ 
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    logger.error('Error en el registro de usuario', {
      error: error.message,
      email: req.body.email,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Error de validación en inicio de sesión', {
        errors: errors.array(),
        email: req.body.email
      });
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn('Intento de inicio de sesión sin credenciales completas', {
        hasEmail: !!email,
        hasPassword: !!password
      });
      return res.status(400).json({ 
        message: "Se requieren correo electrónico y contraseña" 
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn('Intento de inicio de sesión con correo no registrado', { email });
      return res.status(400).json({ 
        message: "Credenciales inválidas" 
      });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      logger.warn('Intento de inicio de sesión con contraseña incorrecta', { 
        userId: user.id,
        email: user.email 
      });
      return res.status(400).json({ 
        message: "Credenciales inválidas" 
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    logger.info('Inicio de sesión exitoso', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Error en el inicio de sesión', {
      error: error.message,
      email: req.body.email,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
    next(error);
  }
}

export { register, login };
