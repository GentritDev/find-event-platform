'use strict';

const router = require('express').Router();
const authController = require('./auth.controller');
const authenticate = require('../../middlewares/auth');

router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

module.exports = router;
