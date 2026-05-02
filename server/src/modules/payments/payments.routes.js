'use strict';

const router = require('express').Router();
const paymentsController = require('./payments.controller');
const authenticate = require('../../middlewares/auth');

router.use(authenticate);

router.post('/paypal/create-order', (req, res, next) =>
  paymentsController.createOrder(req, res, next)
);

router.post('/paypal/capture-order', (req, res, next) =>
  paymentsController.captureOrder(req, res, next)
);

router.get('/orders', (req, res, next) =>
  paymentsController.getUserOrders(req, res, next)
);

module.exports = router;
