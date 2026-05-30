"use strict";

const statsRepository = require("./stats.repository");

class StatsService {
  async getOverview() {
    return statsRepository.getOverview();
  }

  async getRevenue(organizerId, role) {
    return statsRepository.getRevenueByRole(organizerId, role);
  }

  async getRevenueOverTime(organizerId, role) {
    return statsRepository.getRevenueOverTime(organizerId, role);
  }

  async getActiveTickets(organizerId, role) {
    return statsRepository.getActiveTickets(organizerId, role);
  }
}

module.exports = new StatsService();
