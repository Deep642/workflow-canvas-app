const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const buildToken = (userId) => jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const validateInput = (email, password) => {
  if (typeof email !== 'string' || !email.trim()) {
    return 'Email is required';
  }

  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return null;
};

const register = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const password = req.body?.password;

    const validationError = validateInput(email, password);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });
    const token = buildToken(String(user._id));

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const password = req.body?.password;

    const validationError = validateInput(email, password);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = buildToken(String(user._id));
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login
};
