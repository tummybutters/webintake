import Stripe from 'stripe';

function normalizeBaseUrl(env) {
  const raw =
    env.BASE_URL ||
    env.APP_URL ||
    (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : '');

  if (!raw) {
    throw new Error('BASE_URL is not configured');
  }

  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

function getStripeClient(env) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(env.STRIPE_SECRET_KEY);
}

export function getStripeWebhookSecret(env) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  return env.STRIPE_WEBHOOK_SECRET;
}

export function getStripe(env) {
  return getStripeClient(env);
}

export async function createCheckoutSession(submission, env) {
  if (!env.STRIPE_PRICE_ID) {
    throw new Error('STRIPE_PRICE_ID is not configured');
  }

  const stripe = getStripeClient(env);
  const baseUrl = normalizeBaseUrl(env);
  const mode = env.STRIPE_CHECKOUT_MODE || 'payment';
  const trialDays = Number(env.STRIPE_TRIAL_PERIOD_DAYS || 0);

  const params = {
    mode,
    client_reference_id: submission.submissionId,
    customer_email: submission.customer.contactEmail || undefined,
    metadata: {
      submission_id: submission.submissionId,
      business_name: submission.customer.businessName || '',
      contact_email: submission.customer.contactEmail || '',
      phone_number: submission.customer.phoneNumber || '',
      template_id: submission.website.template?.id || '',
    },
    line_items: [
      {
        price: env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/?success=true&session_id={CHECKOUT_SESSION_ID}&submission_id=${submission.submissionId}`,
    cancel_url: `${baseUrl}/`,
  };

  if (mode === 'subscription') {
    params.subscription_data = {
      metadata: {
        submission_id: submission.submissionId,
      },
    };

    if (trialDays > 0) {
      params.subscription_data.trial_period_days = trialDays;
    }
  }

  const session = await stripe.checkout.sessions.create(params);

  return {
    id: session.id,
    url: session.url,
    mode: session.mode,
  };
}
