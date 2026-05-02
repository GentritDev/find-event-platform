'use strict';

const router = require('express').Router();
const eventsController = require('./events.controller');
const authenticate = require('../../middlewares/auth');
const requireRoles = require('../../middlewares/roles');

// Public routes
router.get('/', (req, res, next) => eventsController.listEvents(req, res, next));
router.get('/:id', (req, res, next) => eventsController.getEvent(req, res, next));

// Organizer/Admin only
router.use(authenticate);

router.get('/organizer/mine', requireRoles('organizer', 'admin'), (req, res, next) =>
  eventsController.getOrganizerEvents(req, res, next)
);

router.post('/', requireRoles('organizer', 'admin'), (req, res, next) =>
  eventsController.createEvent(req, res, next)
);

router.put('/:id', requireRoles('organizer', 'admin'), (req, res, next) =>
  eventsController.updateEvent(req, res, next)
);

router.patch('/:id/publish', requireRoles('organizer', 'admin'), (req, res, next) =>
  eventsController.publishEvent(req, res, next)
);

router.patch('/:id/cancel', requireRoles('organizer', 'admin'), (req, res, next) =>
  eventsController.cancelEvent(req, res, next)
);

router.delete('/:id', requireRoles('organizer', 'admin'), (req, res, next) =>
  eventsController.deleteEvent(req, res, next)
);

module.exports = router;
