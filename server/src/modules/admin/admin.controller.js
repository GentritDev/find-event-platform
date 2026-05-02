'use strict';

const adminService = require('./admin.service');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      return res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const result = await adminService.getAllUsers(req.query);
      return res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const user = await adminService.updateUserRole(req.params.id, req.body.role);
      return res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async getAllEvents(req, res, next) {
    try {
      const result = await adminService.getAllEvents(req.query);
      return res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getRevenue(req, res, next) {
    try {
      const stats = await adminService.getRevenueStats();
      return res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
