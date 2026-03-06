import { updateSubmissionFromStripe } from './googleSheetsDrive.js';
import { getStripe, getStripeWebhookSecret } from './stripeCheckout.js';

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    const stripe = getStripe(process.env);
    const secret = getStripeWebhookSecret(process.env);
    const rawBody = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

    if (event.type === 'checkout.session.completed') {
      await updateSubmissionFromStripe(event.data.object, process.env);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Webhook processing failed',
    });
  }
}
