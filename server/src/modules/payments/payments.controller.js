'use strict';

const paymentsService = require('./payments.service');

class PaymentsController {
  async createOrder(req, res, next) {
    try {
      const result = await paymentsService.createPayPalOrder(req.user.id, req.body);
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async captureOrder(req, res, next) {
    try {
      const result = await paymentsService.capturePayPalOrder(req.user.id, req.body);
      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getUserOrders(req, res, next) {
    try {
      const orders = await paymentsService.getUserOrders(req.user.id);
      return res.json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PaymentsController();
