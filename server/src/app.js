"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const errorHandler = require("./middlewares/errorHandler");

// Routes
const authRoutes = require("./modules/auth/auth.routes");
const eventsRoutes = require("./modules/events/events.routes");
const paymentsRoutes = require("./modules/payments/payments.routes");
const ticketsRoutes = require("./modules/tickets/tickets.routes");
const uploadsRoutes = require("./modules/uploads/uploads.routes");
const notificationsRoutes = require("./modules/notifications/notifications.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const statsRoutes = require("./modules/stats/stats.routes");
const savedEventsRoutes = require("./modules/savedEvents/savedEvents.routes");

const app = express();

// Security middlewares
app.use(helmet());

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
  env.CLIENT_URL,
  'https://find-event-platform-client.vercel.app',
  'https://find-event-platform-client-git-main-gentritdevs-projects.vercel.app',
  'https://find-event-platform-client-q4cwe0otr-gentritdevs-projects.vercel.app',
  'https://find-event-platform-client-f0lj17qan-gentritdevs-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.some(o => origin.includes(o) || o.includes(origin))) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(null, true); // For development, allow anyway. Change to false for strict mode.
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/saved-events", savedEventsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stats", statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
