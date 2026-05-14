"use strict";

const statsService = require("./stats.service");

class StatsController {
  async getOverview(req, res, next) {
    try {
      const data = await statsService.getOverview();
      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getRevenue(req, res, next) {
    try {
      const data = await statsService.getRevenue(req.user.id, req.user.role);

      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getRevenueOverTime(req, res, next) {
    try {
      const data = await statsService.getRevenueOverTime(
        req.user.id,
        req.user.role,
      );

      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getActiveTickets(req, res, next) {
    try {
      const data = await statsService.getActiveTickets(
        req.user.id,
        req.user.role,
      );

      return res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StatsController();
