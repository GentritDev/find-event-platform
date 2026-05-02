'use strict';

const router = require('express').Router();
const ticketsController = require('./tickets.controller');
const authenticate = require('../../middlewares/auth');
const requireRoles = require('../../middlewares/roles');

router.use(authenticate);

// Current user's tickets
router.get('/my', (req, res, next) => ticketsController.getMyTickets(req, res, next));

// Organizer/Admin: verify QR token
router.post('/verify', requireRoles('organizer', 'admin'), (req, res, next) =>
  ticketsController.verifyTicket(req, res, next)
);

// Organizer/Admin: get all tickets for an event
router.get('/event/:event_id', requireRoles('organizer', 'admin'), (req, res, next) =>
  ticketsController.getEventTickets(req, res, next)
);

module.exports = router;
