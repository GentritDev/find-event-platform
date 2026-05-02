'use strict';

const authRepository = require('./auth.repository');
const { hashPassword, comparePassword } = require('../../utils/hash');
const { signAccessToken, signRefreshToken } = require('../../utils/jwt');

class AuthService {
  async register({ full_name, email, password, role }) {
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      const err = new Error('Email already in use');
      err.status = 409;
      throw err;
    }

    const password_hash = await hashPassword(password);
    const user = await authRepository.create({ full_name, email, password_hash, role });

    const tokens = this._generateTokens(user);
    return { user, ...tokens };
  }

  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };

    const tokens = this._generateTokens(safeUser);
    return { user: safeUser, ...tokens };
  }

  async getMe(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return user;
  }

  _generateTokens(user) {
    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }
}

module.exports = new AuthService();
