import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const port = process.env.PORT || 4242;

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const domain = process.env.DOMAIN || 'http://localhost:3001';

const mockMode = !stripeSecret;
if (mockMode) {
  console.warn(
    'STRIPE_SECRET_KEY not provided. Running in mock mode — checkout will simulate success.'
  );
}

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2023-08-16' })
  : null;

app.use(cors());
app.use(express.json());

const donationsFile = path.resolve(process.cwd(), 'donations.json');

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, quantity = 1, metadata = {}, items } = req.body;

    let line_items = [];

    if (Array.isArray(items) && items.length > 0) {
      // items expected: [{ name, unit_amount, quantity, description }]
      line_items = items.map((it) => ({
        price_data: {
          currency: (it.currency || 'usd').toLowerCase(),
          product_data: {
            name: it.name || 'Tree',
            description: it.description || undefined,
          },
          unit_amount: Number(it.unit_amount) || 0,
        },
        quantity: Number(it.quantity) || 1,
      }));
    } else {
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Tree Donation',
              description: 'Support reforestation with your donation',
            },
            unit_amount: amount,
          },
          quantity: quantity,
        },
      ];
    }

    if (mockMode) {
      // Simulate a checkout session by returning a direct success URL
      const mockSessionId = `mock_${Date.now()}`;
      const url = `${domain}/pages/contact.html?status=success&session_id=${mockSessionId}`;
      return res.json({ url, mock: true });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${domain}/pages/contact.html?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/pages/contact.html?status=cancel`,
      metadata,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe webhook endpoint — uses raw body parsing for signature verification
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET in environment');
      return res.status(400).send('Webhook secret not configured');
    }

    if (!stripe) {
      console.error(
        'STRIPE_SECRET_KEY not configured; webhook cannot verify signatures.'
      );
      return res.status(501).send('Stripe not configured on this server');
    }

    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      try {
        const full = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items', 'customer_details'],
        });

        const record = {
          id: full.id,
          amount_total: full.amount_total || null,
          currency: full.currency || 'usd',
          email: full.customer_details?.email || null,
          created: full.created || Date.now(),
          line_items: full.line_items?.data || [],
        };

        // Append newline-delimited JSON for each record (simple persistence)
        try {
          await fs.promises.appendFile(
            donationsFile,
            JSON.stringify(record) + '\n',
            'utf8'
          );
          console.log('Donation recorded:', record.id);
        } catch (fsErr) {
          console.error('Failed to write donation record:', fsErr);
        }

        // Send a thank-you email if SMTP config is present
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } =
          process.env;
        if (SMTP_HOST && SMTP_USER && SMTP_PASS && FROM_EMAIL) {
          try {
            const transporter = nodemailer.createTransport({
              host: SMTP_HOST,
              port: parseInt(SMTP_PORT || '587', 10),
              secure: parseInt(SMTP_PORT || '587', 10) === 465,
              auth: { user: SMTP_USER, pass: SMTP_PASS },
            });

            const amount = (record.amount_total || 0) / 100;
            const mailText = `Thank you for your donation of ${amount} ${record.currency.toUpperCase()}. Donation ID: ${record.id}`;

            await transporter.sendMail({
              from: FROM_EMAIL,
              to: record.email || SMTP_USER,
              subject: 'Thank you for your donation',
              text: mailText,
            });
            console.log('Thank-you email sent for', record.id);
          } catch (mailErr) {
            console.error('Failed to send thank-you email:', mailErr);
          }
        }
      } catch (err) {
        console.error('Error handling checkout.session.completed:', err);
      }
    }

    res.status(200).send('ok');
  }
);

const server = app.listen(port, () => {
  console.log(`Stripe server listening on http://localhost:${port}`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  process.exit(1);
});
