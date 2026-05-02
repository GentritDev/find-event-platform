'use strict';

const router = require('express').Router();
const adminController = require('./admin.controller');
const authenticate = require('../../middlewares/auth');
const requireRoles = require('../../middlewares/roles');

router.use(authenticate);
router.use(requireRoles('admin'));

router.get('/dashboard', (req, res, next) => adminController.getDashboard(req, res, next));
router.get('/users', (req, res, next) => adminController.getAllUsers(req, res, next));
router.patch('/users/:id/role', (req, res, next) => adminController.updateUserRole(req, res, next));
router.get('/events', (req, res, next) => adminController.getAllEvents(req, res, next));
router.get('/revenue', (req, res, next) => adminController.getRevenue(req, res, next));

module.exports = router;
