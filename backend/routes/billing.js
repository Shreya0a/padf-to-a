const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Create a Stripe Checkout Session for the subscription.
// Guarded by the auth middleware mounted in server.js (requires req.user).
router.post('/create-checkout-session', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Please sign in to upgrade' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Billing is not configured on this server yet' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const user = await User.findById(req.user.id);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url: `${process.env.CLIENT_URL}/pricing`,
    customer_email: user.email,
  });

  res.json({ url: session.url });
});

// Stripe webhook — the only source of truth that flips a user to 'pro'.
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ error: 'Billing is not configured on this server yet' });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.customer_email;
      await User.findOneAndUpdate(
        { email },
        { plan: 'pro', stripeCustomerId: session.customer }
      );
    }

    res.json({ received: true });
  }
);

module.exports = router;
