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
    const currency = 'USD';
    const returnUrl = `${env.CLIENT_URL}/payment/success`;
    const cancelUrl = `${env.CLIENT_URL}/payment/cancel`;

    const paypalOrder = await paypal.createOrder(amount, currency, returnUrl, cancelUrl);

    const order = await paymentsRepository.createOrder({
      user_id: userId,
      event_id,
      amount_eur: amount,
      currency,
      provider_order_id: paypalOrder.id,
    });

    const approveLink = paypalOrder.links.find((l) => l.rel === 'approve');

    return {
      order,
      paypalOrderId: paypalOrder.id,
      approveUrl: approveLink ? approveLink.href : null,
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

  async getUserOrders(userId) {
    return paymentsRepository.getUserOrders(userId);
  }
}

module.exports = new PaymentsService();
