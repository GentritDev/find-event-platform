"use strict";

const router = require("express").Router();

const statsController = require("./stats.controller");
const authenticate = require("../../middlewares/auth");
const requireRoles = require("../../middlewares/roles");

router.use(authenticate);

router.get("/overview", requireRoles("admin"), statsController.getOverview);

router.get(
  "/revenue",
  requireRoles("admin", "organizer"),
  statsController.getRevenue,
);

router.get(
  "/revenue-over-time",
  requireRoles("admin", "organizer"),
  statsController.getRevenueOverTime,
);

router.get(
  "/active-tickets",
  requireRoles("admin", "organizer"),
  statsController.getActiveTickets,
);

module.exports = router;
