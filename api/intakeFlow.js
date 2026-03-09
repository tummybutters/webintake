import { uploadLogoToBlob } from './blobStorage.js';
import { appendSubmissionToSheet } from './googleSheetsDrive.js';
import { createCheckoutSession } from './stripeCheckout.js';

function cloneSubmission(body) {
  return JSON.parse(JSON.stringify(body || {}));
}

function ensureObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizeSubmission(body) {
  const submission = cloneSubmission(body);

  submission.customer = ensureObject(submission.customer);
  submission.website = ensureObject(submission.website);
  submission.assets = ensureObject(submission.assets);
  submission.assets.logo = ensureObject(submission.assets.logo);
  submission.assets.logo.storage = ensureObject(submission.assets.logo.storage);
  submission.stripe = ensureObject(submission.stripe);
  submission.rawIntake = ensureObject(submission.rawIntake);

  submission.website.domains = Array.isArray(submission.website.domains)
    ? submission.website.domains.filter(Boolean)
    : [];

  submission.website.template =
    submission.website.template && typeof submission.website.template === 'object'
      ? submission.website.template
      : null;

  submission.assets.logo = {
    provided: Boolean(submission.assets.logo.provided),
    fileName: submission.assets.logo.fileName || '',
    mimeType: submission.assets.logo.mimeType || '',
    sizeBytes: Number(submission.assets.logo.sizeBytes || 0),
    base64: submission.assets.logo.base64 || '',
    storage: {
      provider: submission.assets.logo.storage.provider || 'vercel_blob',
      pathname: submission.assets.logo.storage.pathname || '',
      fileName: submission.assets.logo.storage.fileName || submission.assets.logo.fileName || '',
      url: submission.assets.logo.storage.url || '',
    },
  };

  return submission;
}

export async function processIntakeSubmission(body, env) {
  const submission = normalizeSubmission(body);

  if (!submission.submissionId) {
    return {
      status: 400,
      payload: { error: 'submissionId is required' },
    };
  }

  const logoUpload = await uploadLogoToBlob(submission.assets?.logo, submission.submissionId, env);

  submission.assets.logo = {
    ...submission.assets.logo,
    base64: '',
    storage: {
      provider: 'vercel_blob',
      pathname: logoUpload.pathname,
      fileName: logoUpload.fileName,
      url: logoUpload.url,
    },
  };

  const checkoutSession = await createCheckoutSession(submission, env);

  submission.updatedAt = new Date().toISOString();
  submission.status = 'checkout_created';
  submission.stripe.checkoutSessionId = checkoutSession.id;
  submission.stripe.checkoutUrl = checkoutSession.url;

  await appendSubmissionToSheet(submission, env);

  return {
    status: 200,
    payload: {
      ok: true,
      submissionId: submission.submissionId,
      checkoutUrl: checkoutSession.url,
      logoPathname: logoUpload.pathname,
      logoUrl: logoUpload.url,
    },
  };
}
