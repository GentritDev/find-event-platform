'use strict';

const authService = require('./auth.service');
const { registerSchema, loginSchema } = require('./auth.schema');

class AuthController {
  async register(req, res, next) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
