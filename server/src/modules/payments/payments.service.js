'use strict';

const paymentsRepository = require('./payments.repository');
const eventsRepository = require('../events/events.repository');
const ticketsService = require('../tickets/tickets.service');
const paypal = require('../../config/paypal');
const env = require('../../config/env');

class PaymentsService {
  async createPayPalOrder(userId, { event_id }) {
    const event = await eventsRepository.findById(event_id);
    if (!event) {
      const err = new Error('Event not found');
      err.status = 404;
      throw err;
    }
    if (event.status !== 'published') {
      const err = new Error('Event is not available for purchase');
      err.status = 400;
      throw err;
    }
    if (event.tickets_sold >= event.capacity) {
      const err = new Error('Event is sold out');
      err.status = 400;
      throw err;
    }

    const amount = parseFloat(event.price_eur);
    const currency = 'EUR';

    // For SDK v6, we don't need return URLs as the SDK handles the flow
    const paypalOrder = await paypal.createOrderV6(amount, currency);

    const order = await paymentsRepository.createOrder({
      user_id: userId,
      event_id,
      amount_eur: amount,
      currency,
      provider_order_id: paypalOrder.id,
    });

    return {
      order,
      paypalOrderId: paypalOrder.id,
    };
  }

  async capturePayPalOrder(userId, { paypal_order_id }) {
    const order = await paymentsRepository.findOrderByProviderId(paypal_order_id);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }
    if (order.user_id !== userId) {
      const err = new Error('Forbidden');
      err.status = 403;
      throw err;
    }
    if (order.payment_status === 'paid') {
      return { order, message: 'Already paid' };
    }

    let captureData;
    try {
      captureData = await paypal.captureOrder(paypal_order_id);
    } catch (err) {
      await paymentsRepository.markOrderFailed(order.id);
      throw err;
    }

    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const paidOrder = await paymentsRepository.markOrderPaid(order.id, captureId);

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

  async createFreeTicket(userId, { event_id }) {
    const event = await eventsRepository.findById(event_id);
    if (!event) {
      const err = new Error('Event not found');
      err.status = 404;
      throw err;
    }
    if (event.status !== 'published') {
      const err = new Error('Event is not available');
      err.status = 400;
      throw err;
    }
    if (parseFloat(event.price_eur) !== 0) {
      const err = new Error('This is not a free event');
      err.status = 400;
      throw err;
    }
    if (event.tickets_sold >= event.capacity) {
      const err = new Error('Event is sold out');
      err.status = 400;
      throw err;
    }

    // Create a free order (no payment required)
    const order = await paymentsRepository.createOrder({
      user_id: userId,
      event_id,
      amount_eur: 0,
      currency: 'EUR',
      payment_status: 'paid', // Mark as paid immediately for free events
      provider_order_id: null,
    });

    // Generate ticket immediately for free events
    const ticket = await ticketsService.generateTicket({
      order_id: order.id,
      user_id: userId,
      event_id,
    });

    // Increment tickets sold
    await eventsRepository.incrementTicketsSold(event_id);

    return { order, ticket };
  }

  async getUserOrders(userId) {
    return paymentsRepository.getUserOrders(userId);
  }
}

module.exports = new PaymentsService();
