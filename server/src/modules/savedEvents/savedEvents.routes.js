"use strict";

const router = require("express").Router();
const savedEventsController = require("./savedEvents.controller");
const authenticate = require("../../middlewares/auth");

router.use(authenticate);

router.get("/", (req, res, next) =>
  savedEventsController.getSavedEvents(req, res, next),
);
router.post("/:event_id", (req, res, next) =>
  savedEventsController.saveEvent(req, res, next),
);
router.delete("/:event_id", (req, res, next) =>
  savedEventsController.unsaveEvent(req, res, next),
);

module.exports = router;
