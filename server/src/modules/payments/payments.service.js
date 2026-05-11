"use strict";

const paymentsRepository = require("./payments.repository");
const eventsRepository = require("../events/events.repository");
const ticketsRepository = require("../tickets/tickets.repository");
const ticketsService = require("../tickets/tickets.service");
const paypal = require("../../config/paypal");
const env = require("../../config/env");
const crypto = require("crypto");

class PaymentsService {
  async _ensureNotAlreadyPurchased(userId, event_id) {
    const alreadyPurchased = await ticketsRepository.existsByUserIdAndEventId(
      userId,
      event_id,
    );
    if (alreadyPurchased) {
      const err = new Error("You already purchased a ticket for this event");
      err.status = 400;
      throw err;
    }
  }

  async createDemoPurchase(userId, { event_id, quantity = 1 }) {
    const event = await eventsRepository.findById(event_id);
    if (!event) {
      const err = new Error("Event not found");
      err.status = 404;
      throw err;
    }
    if (event.status !== "published") {
      const err = new Error("Event is not available for purchase");
      err.status = 400;
      throw err;
    }

    quantity = parseInt(quantity, 10) || 1;
    if (quantity < 1) {
      const err = new Error("Quantity must be at least 1");
      err.status = 400;
      throw err;
    }

    if (event.tickets_sold + quantity > event.capacity) {
      const err = new Error("Not enough available tickets for that quantity");
      err.status = 400;
      throw err;
    }

    const unitPrice = parseFloat(event.price_eur);
    const amount = unitPrice * quantity;
    const currency = "EUR";
    const demoOrderId = `DEMO-${crypto.randomUUID()}`;

    const order = await paymentsRepository.createOrder({
      user_id: userId,
      event_id,
      amount_eur: amount,
      currency,
      provider: "demo",
      provider_order_id: demoOrderId,
      payment_status: "paid",
    });

    const tickets = [];
    for (let i = 0; i < quantity; i += 1) {
      const ticket = await ticketsService.generateTicket({
        order_id: order.id,
        user_id: userId,
        event_id,
      });
      tickets.push(ticket);
    }

    await eventsRepository.incrementTicketsSold(event_id, quantity);

    return {
      order,
      ticket: tickets[0],
      tickets,
      quantity,
      demoMode: true,
    };
  }

  async createFreeTicket(userId, { event_id }) {
    const event = await eventsRepository.findById(event_id);
    if (!event) {
      const err = new Error("Event not found");
      err.status = 404;
      throw err;
    }
    if (parseFloat(event.price_eur) !== 0) {
      const err = new Error("Event is not free");
      err.status = 400;
      throw err;
    }
    if (event.status !== "published") {
      const err = new Error("Event is not available for purchase");
      err.status = 400;
      throw err;
    }

    const order = await paymentsRepository.createOrder({
      user_id: userId,
      event_id,
      amount_eur: 0,
      currency: "EUR",
      provider: "free",
      provider_order_id: `FREE-${crypto.randomUUID()}`,
      payment_status: "paid",
    });

    const ticket = await ticketsService.generateTicket({
      order_id: order.id,
      user_id,
      event_id,
    });

    await eventsRepository.incrementTicketsSold(event_id);

    return { order, ticket, freeMode: true };
  }

  async createPayPalOrder(userId, { event_id }) {
    const event = await eventsRepository.findById(event_id);
    if (!event) {
      const err = new Error("Event not found");
      err.status = 404;
      throw err;
    }
    if (event.status !== "published") {
      const err = new Error("Event is not available for purchase");
      err.status = 400;
      throw err;
    }
    if (event.tickets_sold >= event.capacity) {
      const err = new Error("Event is sold out");
      err.status = 400;
      throw err;
    }

    const amount = parseFloat(event.price_eur);
    const currency = "EUR";

    const paypalOrder = await paypal.createOrderV6(amount, currency);

    const order = await paymentsRepository.createOrder({
      user_id: userId,
      event_id,
      amount_eur: amount,
      currency,
      provider_order_id: paypalOrder.id,
    });

    const approveLink = paypalOrder.links.find((l) => l.rel === "approve");

    return {
      order,
      paypalOrderId: paypalOrder.id,
      approveUrl: approveLink ? approveLink.href : null,
    };
  }

  async capturePayPalOrder(userId, { paypal_order_id }) {
    if (env.PAYPAL_MOCK_MODE) {
      const order =
        await paymentsRepository.findOrderByProviderId(paypal_order_id);
      if (order && order.payment_status === "paid") {
        const ticket = await ticketsService.generateTicket({
          order_id: order.id,
          user_id: userId,
          event_id: order.event_id,
        });
        return { order, ticket, demoMode: true };
      }
      return { order, demoMode: true };
    }

    const order =
      await paymentsRepository.findOrderByProviderId(paypal_order_id);
    if (!order) {
      const err = new Error("Order not found");
      err.status = 404;
      throw err;
    }
    if (order.user_id !== userId) {
      const err = new Error("Forbidden");
      err.status = 403;
      throw err;
    }
    if (order.payment_status === "paid") {
      return { order, message: "Already paid" };
    }

    let captureData;
    try {
      captureData = await paypal.captureOrder(paypal_order_id);
    } catch (err) {
      await paymentsRepository.markOrderFailed(order.id);
      throw err;
    }

    const captureId =
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const paidOrder = await paymentsRepository.markOrderPaid(
      order.id,
      captureId,
    );

    // Generate ticket after successful payment
    const ticket = await ticketsService.generateTicket({
      order_id: paidOrder.id,
      user_id: userId,
      event_id: paidOrder.event_id,
    });

    // Increment tickets sold
    await eventsRepository.incrementTicketsSold(paidOrder.event_id);

    return { order: paidOrder, ticket };
  }

  async getUserOrders(userId) {
    return paymentsRepository.getUserOrders(userId);
  }
}

module.exports = new PaymentsService();
